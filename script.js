import {
  InteractionType,
  InteractionResponseType,
  verifyKey
} from 'discord-interactions';
import chrono from 'chrono-node';
import { DateTime, IANAZone } from 'luxon';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });

const make = (epoch, style = 'f') => ({
  type: InteractionResponseType.ChannelMessageWithSource,
  data: {
    content: `**Preview:** <t:${epoch}:${style}> • (<t:${epoch}:R>)\n**Copy:** \`<t:${epoch}:${style}>\``,
    flags: 64 // ephemeral
  }
});

function parseHuman(when, tz) {
  if (tz && !IANAZone.isValidZone(tz)) throw new Error(`Unknown IANA zone: ${tz}`);
  const ref = tz ? DateTime.now().setZone(tz).toJSDate() : new Date();
  const [r] = chrono.parse(when, ref, { forwardDate: true });
  if (!r) throw new Error('Could not parse that time.');
  if (r.start.isCertain('timezoneOffset')) return Math.floor(r.date().getTime() / 1000);

  const zone = tz || DateTime.local().zoneName;
  const now = DateTime.now().setZone(zone);
  const s = r.start;
  const dt = DateTime.fromObject({
    year: s.get('year') ?? now.year,
    month: s.get('month') ?? now.month,
    day: s.get('day') ?? now.day,
    hour: s.get('hour') ?? 12,
    minute: s.get('minute') ?? 0,
    second: s.get('second') ?? 0
  }, { zone });
  if (!dt.isValid) throw new Error('Invalid date');
  return Math.floor(dt.toSeconds());
}

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return new Response('OK');

    const sig = request.headers.get('X-Signature-Ed25519');
    const ts  = request.headers.get('X-Signature-Timestamp');
    const body = await request.text();

    const ok = await verifyKey(body, sig, ts, env.DISCORD_PUBLIC_KEY);
    if (!ok) return new Response('Bad signature', { status: 401 });

    const ix = JSON.parse(body);

    if (ix.type === InteractionType.PING) {
      return json({ type: InteractionResponseType.PONG });
    }

    if (ix.type === InteractionType.APPLICATION_COMMAND) {
      const name = ix.data.name;
      const opts = Object.fromEntries((ix.data.options ?? []).map(o => [o.name, o.value]));

      if (name === 'ts') {
        const style = opts.style ?? 'f';
        const epoch = Math.floor(Date.now() / 1000);
        return json(make(epoch, style));
      }

      if (name === 'ts_convert') {
        try {
          const epoch = parseHuman(opts.when, opts.tz);
          const style = opts.style ?? 'f';
          return json(make(epoch, style));
        } catch (e) {
          return json({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: { content: `⚠️ ${e.message}`, flags: 64 }
          });
        }
      }

      return json({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: { content: 'Unknown command', flags: 64 }
      });
    }

    return new Response('Unhandled', { status: 400 });
  }
};
