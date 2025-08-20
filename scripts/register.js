import fs from 'node:fs/promises';

const { DISCORD_TOKEN, APPLICATION_ID } = process.env;
if (!DISCORD_TOKEN || !APPLICATION_ID) {
  throw new Error('Set DISCORD_TOKEN and APPLICATION_ID env vars');
}

const payloads = JSON.parse(await fs.readFile('payloads.json', 'utf8'));
const url = `https://discord.com/api/v10/applications/${APPLICATION_ID}/commands`;

const res = await fetch(url, {
  method: 'PUT',
  headers: {
    'Authorization': `Bot ${DISCORD_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payloads)
});

console.log('Status', res.status);
console.log(await res.text());
