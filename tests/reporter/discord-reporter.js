/* eslint-disable no-console */

// Load environment variables from .env file
require('dotenv').config();

const DEFAULT_USERNAME = 'Deployer';
const DEFAULT_AVATAR_URL = 'https://files.nuqayah.com/qurancom.png';
const MAX_RETRIES = process.env.CI ? 2 : 0; // 2 retries on CI, 0 retry locally

function buildWebhookUrl(options = {}) {
  const fromOpts = options.webhookUrl;
  const fromEnvUrl = process.env.DISCORD_WEBHOOK_URL;
  if (fromOpts || fromEnvUrl) return fromOpts || fromEnvUrl;

  console.log(
    'DiscordReporter: No webhook URL provided. Set DISCORD_WEBHOOK_URL or provide webhookUrl option.',
  );

  return '';
}

async function sendDiscord(webhookUrl, payload) {
  if (!webhookUrl) return;
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(
        `Discord webhook error: ${res.status} ${res.statusText}${text ? ` - ${text}` : ''}`,
      );
    }
  } catch (err) {
    console.error(`Discord webhook error: ${err}`);
  }
}

function truncate(str, max) {
  if (!str) return '';
  return str.length <= max ? str : `${str.slice(0, max - 1)}…`;
}

function stripAnsiCodes(str) {
  if (!str) return '';
  // Remove ANSI escape codes (colors, formatting, etc.)
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

function fullTitle(test) {
  // Playwright provides a path like: [root, project?, ...suites, test]
  return test.titlePath().join(' › ');
}

class DiscordReporter {
  constructor(options = {}) {
    this.webhookUrl = buildWebhookUrl(options);
    this.username = options.username || DEFAULT_USERNAME;
    this.avatarUrl = options.avatarUrl || DEFAULT_AVATAR_URL;
  }

  static shouldNotify(test, result) {
    // Only notify on non-passing outcomes.
    if (result.status === 'passed' || result.status === 'skipped') return false;

    // Only send notification if this is the final retry (test has failed all retries)
    // test.results contains all attempts, the current result is the last one
    const isLastRetry = result.retry === (process.env.CI ? MAX_RETRIES - 1 : 0);

    return isLastRetry;
  }

  async onTestEnd(test, result) {
    if (!DiscordReporter.shouldNotify(test, result)) return;

    const title = fullTitle(test);
    const msg = `❌ Test failed after ${test.results.length} attempt(s): ${title}`;

    // Put the *error message* into the embed description as a code block.
    const rawErrorMessage = result.error?.message || result.error?.value || 'Unknown error';
    const cleanErrorMessage = stripAnsiCodes(rawErrorMessage);
    const description = `\`\`\`${truncate(cleanErrorMessage, 400 - 10)}\`\`\``;

    const embed = {
      title: 'Test Failure - Final Attempt',
      description,
      color: 0xe74c3c, // red
      fields: [
        { name: 'Test', value: truncate(title, 1024) },
        {
          name: 'Location',
          value: `${test.location.file}:${test.location.line}:${test.location.column}`,
        },
        { name: 'Status', value: String(result.status), inline: true },
        { name: 'Retry', value: String(result.retry ?? 0), inline: true },
        { name: 'Duration', value: `${result.duration}ms`, inline: true },
      ],
      timestamp: new Date().toISOString(),
    };

    await sendDiscord(this.webhookUrl, {
      username: this.username,
      avatar_url: this.avatarUrl,
      content: msg,
      embeds: [embed],
    });
  }
}

export default DiscordReporter;
