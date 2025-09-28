/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable no-console */

// Load environment variables from .env file
require('dotenv').config();

const MAX_RETRIES = process.env.CI ? 2 : 0; // 2 retries on CI, 0 retry locally

// Validate Discord bot configuration
function validateBotConfig() {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_CHANNEL_ID;

  if (!botToken) {
    console.error('DiscordReporter: DISCORD_BOT_TOKEN environment variable is required');
    return null;
  }

  if (!channelId) {
    console.error('DiscordReporter: DISCORD_CHANNEL_ID environment variable is required');
    return null;
  }

  return { botToken, channelId };
}

// Send message using bot
async function sendBotMessage(channelId, payload) {
  const config = validateBotConfig();
  if (!config) return null;

  try {
    const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${config.botToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(
        `Bot message error: ${res.status} ${res.statusText}${text ? ` - ${text}` : ''}`,
      );
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error(`Bot message error: ${err}`);
    return null;
  }
}

// Edit message using bot
async function editBotMessage(channelId, messageId, payload) {
  const config = validateBotConfig();
  if (!config) return false;

  try {
    const res = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bot ${config.botToken}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(`Bot edit error: ${res.status} ${res.statusText}${text ? ` - ${text}` : ''}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`Bot edit error: ${err}`);
    return false;
  }
}

// Create thread using bot
async function createBotThread(channelId, messageId, threadName) {
  const config = validateBotConfig();
  if (!config) return null;

  try {
    const res = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}/threads`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bot ${config.botToken}`,
        },
        body: JSON.stringify({
          name: threadName,
          auto_archive_duration: 1440, // Archive after 24 hours
        }),
      },
    );

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(
        `Thread creation error: ${res.status} ${res.statusText}${text ? ` - ${text}` : ''}`,
      );
      return null;
    }

    const thread = await res.json();
    return thread.id;
  } catch (err) {
    console.error(`Thread creation error: ${err}`);
    return null;
  }
}

// Send message to thread using bot
async function sendToThread(threadId, payload) {
  const config = validateBotConfig();
  if (!config) return null;

  try {
    const res = await fetch(`https://discord.com/api/v10/channels/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${config.botToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(
        `Thread message error: ${res.status} ${res.statusText}${text ? ` - ${text}` : ''}`,
      );
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error(`Thread message error: ${err}`);
    return null;
  }
}

// Utility functions
function truncate(str, max) {
  if (!str) return '';
  return str.length <= max ? str : `${str.slice(0, max - 1)}…`;
}

function stripAnsiCodes(str) {
  if (!str) return '';
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

// Create a simple text-based progress bar
function createProgressBar(completed, total, width = 20) {
  const percentage = Math.round((completed / total) * 100);
  const filledBars = Math.round((completed / total) * width);
  const emptyBars = width - filledBars;
  const progressBar = '█'.repeat(filledBars) + '░'.repeat(emptyBars);
  return `${progressBar} ${percentage}% (${completed}/${total})`;
}

// Format time in seconds to human-readable format
function formatTime(seconds) {
  if (seconds < 60) return `${seconds}s`;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

// Get full test title with suite names
function fullTitle(test) {
  return test.titlePath().join(' › ');
}

// Main reporter class
class DiscordReporter {
  constructor() {
    // Validate bot configuration
    this.config = validateBotConfig();
    if (!this.config) {
      console.warn('Discord reporter disabled: missing bot configuration');
    }

    // Progress tracking
    this.progressMessageId = null;
    this.failuresThreadId = null;
    this.totalTests = 0;
    this.completedTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.skippedTests = 0;
    this.startTime = null;
  }

  // Determine if a test failure should trigger a notification
  static shouldNotify(test, result) {
    if (result.status === 'passed' || result.status === 'skipped') return false;
    const isLastRetry = result.retry === (process.env.CI ? MAX_RETRIES - 1 : 0);
    return isLastRetry;
  }

  async onBegin(config, suite) {
    if (!this.config) return;

    this.startTime = Date.now();
    this.totalTests = suite.allTests().length;

    // Initial progress message
    const embed = {
      title: '🚀 Starting Playwright Tests',
      description: `Running ${this.totalTests} tests...`,
      color: 0x3498db,
      fields: [
        {
          name: 'Progress',
          value: createProgressBar(0, this.totalTests),
          inline: false,
        },
        { name: '✅ Passed', value: '0', inline: true },
        { name: '❌ Failed', value: '0', inline: true },
        { name: '⏭️ Skipped', value: '0', inline: true },
      ],
      timestamp: new Date().toISOString(),
    };

    const response = await sendBotMessage(this.config.channelId, { embeds: [embed] });
    if (response && response.id) {
      this.progressMessageId = response.id;
    }
  }

  // Update progress message
  async updateProgress() {
    if (!this.config || !this.progressMessageId) return;

    const elapsedTime = Math.round((Date.now() - this.startTime) / 1000);
    const estimatedTotal =
      this.completedTests > 0
        ? Math.round((elapsedTime / this.completedTests) * this.totalTests)
        : 0;

    const embed = {
      title: '🏃 Playwright Tests Running',
      description: `Progress: ${this.completedTests}/${this.totalTests} tests completed`,
      color: 0xf39c12,
      fields: [
        {
          name: 'Progress',
          value: createProgressBar(this.completedTests, this.totalTests),
          inline: false,
        },
        { name: '✅ Passed', value: String(this.passedTests), inline: true },
        { name: '❌ Failed', value: String(this.failedTests), inline: true },
        { name: '⏭️ Skipped', value: String(this.skippedTests), inline: true },
        {
          name: '⏱️ Time',
          value: `${formatTime(elapsedTime)}${
            estimatedTotal > 0 ? ` / ~${formatTime(estimatedTotal)}` : ''
          }`,
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
    };

    await editBotMessage(this.config.channelId, this.progressMessageId, { embeds: [embed] });
  }

  async onTestEnd(test, result) {
    if (!this.config) return;

    // Update progress counters
    this.completedTests += 1;

    switch (result.status) {
      case 'passed':
        this.passedTests += 1;
        break;
      case 'failed':
        this.failedTests += 1;
        break;
      case 'skipped':
        this.skippedTests += 1;
        break;
      default:
        break;
    }

    // Update progress every few tests
    await this.updateProgress();

    // Handle test failures
    if (!DiscordReporter.shouldNotify(test, result)) return;

    // Create failures thread on first failure
    if (!this.failuresThreadId && this.progressMessageId) {
      const now = new Date();
      const threadName = `❌ Test Failures - ${now.toLocaleDateString()} ${now
        .getHours()
        .toString()
        .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      this.failuresThreadId = await createBotThread(
        this.config.channelId,
        this.progressMessageId,
        threadName,
      );

      if (this.failuresThreadId) {
        await sendToThread(this.failuresThreadId, {
          content:
            '🚨 **Test Failures Thread**\nAll failed tests will be posted here to keep the main channel clean.',
        });
      }
    }

    const title = fullTitle(test);
    const rawErrorMessage = result.error?.message || result.error?.value || 'Unknown error';
    const cleanErrorMessage = stripAnsiCodes(rawErrorMessage);
    const description = `\`\`\`${truncate(cleanErrorMessage, 1500)}\`\`\``;

    const embed = {
      title: `❌ ${title}`,
      description,
      color: 0xe74c3c,
      fields: [
        {
          name: '📁 Location',
          value: `\`${test.location.file}:${test.location.line}:${test.location.column}\``,
          inline: false,
        },
        { name: '🔄 Retry', value: String(result.retry ?? 0), inline: true },
        { name: '⏱️ Duration', value: `${result.duration}ms`, inline: true },
        { name: '📊 Attempts', value: String(test.results.length), inline: true },
      ],
      timestamp: new Date().toISOString(),
    };

    // Send to thread if available, otherwise to main channel
    if (this.failuresThreadId) {
      await sendToThread(this.failuresThreadId, { embeds: [embed] });
    } else {
      await sendBotMessage(this.config.channelId, { embeds: [embed] });
    }
  }

  async onEnd() {
    if (!this.config || !this.progressMessageId) return;

    const totalTime = Math.round((Date.now() - this.startTime) / 1000);
    const allPassed = this.failedTests === 0;

    const embed = {
      title: allPassed ? '✅ All Tests Passed!' : '❌ Tests Completed with Failures',
      description: `Finished running ${this.totalTests} tests in ${formatTime(totalTime)}`,
      color: allPassed ? 0x2ecc71 : 0xe74c3c,
      fields: [
        {
          name: 'Final Results',
          value: createProgressBar(this.totalTests, this.totalTests),
          inline: false,
        },
        { name: '✅ Passed', value: String(this.passedTests), inline: true },
        { name: '❌ Failed', value: String(this.failedTests), inline: true },
        { name: '⏭️ Skipped', value: String(this.skippedTests), inline: true },
        { name: '⏱️ Total Time', value: formatTime(totalTime), inline: true },
      ],
      timestamp: new Date().toISOString(),
    };

    await editBotMessage(this.config.channelId, this.progressMessageId, { embeds: [embed] });
  }
}

module.exports = DiscordReporter;
