# Playwright Discord Reporter

`discord-reporter.js` is a custom Playwright reporter that sends test run updates to a Discord
channel using a bot. For each test run, a new thread is created in the specified channel, and any
failed tests are reported within that thread.

## Setup

1. Create a Discord bot and invite it to your server with permissions to send messages and create
   threads.
2. Obtain the bot token and the channel ID where you want to receive the messages.

Set the following environment variables for the Discord reporter to work:

```
DISCORD_BOT_TOKEN=<your bot token>
DISCORD_CHANNEL_ID=<the Discord channel ID where the bot should send messages>
DISCORD_NOTIFICATION_ROLE_ID=<optional: role ID to mention if there are test failures>
```

## Usage

Simply run `yarn playwright test` as you normally would. Playwright will automatically use the
`discord-reporter.js` to send updates to your Discord channel.
