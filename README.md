# DM Time-Tag Bot

[![Deploy to Cloudflare Workers](https://github.com/Reithan/TimeStamper/actions/workflows/deploy-bot.yml/badge.svg)](https://github.com/Reithan/TimeStamper/actions/workflows/deploy-bot.yml)

A tiny Discord **DM-only** bot that gives you copy-paste **dynamic timestamp** tags:

* `/ts [style]` → current time as `<t:EPOCH:style>`
* `/ts_convert when:"Aug 21 2025 3pm PT" [style] [tz]` → parse human time → `<t:EPOCH:style>`

Replies are **ephemeral** (visible only to you) and include both the tag and a rendered preview.

## Quick Start (for users)

1. **Install to your account**
   Install the bot to your account via [this OAuth link](https://discord.com/oauth2/authorize?client_id=1407511264380457001&integration_type=1&scope=applications.commands).
2. **Open a DM** with the app (App Launcher → your app).
3. **Use the commands**

   * `/ts` → `**Preview:** <t:...:f> • (<t:...:R>)` + **Copy:** `<t:...:f>`
   * `/ts_convert when:"tomorrow 14:30" tz:"America/Los_Angeles" style:F`

**Style codes**

| Code | Renders as                   |
| ---: | ---------------------------- |
|  `t` | 9:41 PM                      |
|  `T` | 9:41:30 PM                   |
|  `d` | 11/23/2024                   |
|  `D` | November 23, 2024            |
|  `f` | Nov 23, 2024 9:41 PM         |
|  `F` | Saturday, November 23, 2024… |
|  `R` | in 2 hours / 3 days ago      |

## How it works (maintainers)

* **Hosting:** Cloudflare Workers (HTTP Interactions).
* **DM-only:** commands are registered with `integration_types:[1]` (User-Install) and `contexts:[1,2]` (DM & group DM).
* **Files:**

  * `script.js` – Worker handler (verifies signatures, routes commands)
  * `payloads.json` – slash-command payloads
  * `scripts/register.js` – registers commands
  * `wrangler.toml` – Worker config

## Privacy & Permissions

* The bot only processes your slash-command payload and returns an ephemeral message.
* No privileged intents or message content access; no data is stored.

## Troubleshooting

* **“Bad signature/401” on the endpoint**
  `DISCORD_PUBLIC_KEY` is missing or wrong—reset the Worker secret.
* **Commands don’t appear in DM**
  Ensure you installed via the **User-Install** URL, the payloads here should include `integration_types:[1]` and `contexts:[1,2]`.
* **Global commands not visible yet**
  Propagation can take minutes. For instant testing, temporarily register **guild** commands with a DEV guild.
