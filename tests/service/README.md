# Quran.com Playwright Tests - Systemd Service

This directory contains the systemd service and timer configuration for continuous Playwright
testing of quran.com.

## Files

- `quran-tests.service` - Main service that runs Playwright tests
- `quran-tests.timer` - Timer that triggers the service every 5 minutes

## How It Works

The service uses `mise` to:

- Load Node.js 18.20.8 from `.mise.local.toml`
- Load environment variables from `.mise.local.toml` including Discord credentials
- Run Playwright tests against the live quran.com site
- Send Discord notifications for test failures

## Setup (One-time)

### Create Symbolic Links

```bash
# Create symlinks to this directory
ln -sf /srv/apps/playwright-tests/tests/service/quran-tests.service ~/.config/systemd/user/quran-tests.service
ln -sf /srv/apps/playwright-tests/tests/service/quran-tests.timer ~/.config/systemd/user/quran-tests.timer

# Reload systemd daemon
systemctl --user daemon-reload
```

### Enable and Start

```bash
# Enable timer (starts automatically on boot)
systemctl --user enable quran-tests.timer

# Start timer (begins 5-minute schedule)
systemctl --user start quran-tests.timer

# Start service manually (optional, timer will trigger it)
systemctl --user start quran-tests.service
```

## Service Management

### Start/Stop Service

```bash
# Start service manually
systemctl --user start quran-tests.service

# Stop service
systemctl --user stop quran-tests.service

# Restart service
systemctl --user restart quran-tests.service
```

### Start/Stop Timer

```bash
# Start timer (5-minute intervals)
systemctl --user start quran-tests.timer

# Stop timer
systemctl --user stop quran-tests.timer

# Disable timer (prevents auto-start on boot)
systemctl --user disable quran-tests.timer

# Re-enable timer
systemctl --user enable quran-tests.timer
```

## Status and Logs

### Check Status

```bash
# Check service status
systemctl --user status quran-tests.service

# Check timer status
systemctl --user status quran-tests.timer

# Check both at once
systemctl --user status quran-tests.timer quran-tests.service
```

### View Logs

```bash
# View recent service logs
journalctl --user -u quran-tests.service

# Follow live logs
journalctl --user -u quran-tests.service -f

# View last 50 lines
journalctl --user -u quran-tests.service -n 50

# View timer logs
journalctl --user -u quran-tests.timer

# View logs with timestamps
journalctl --user -u quran-tests.service --since "1 hour ago"
```

### Check Timer Schedule

```bash
# List all user timers
systemctl --user list-timers

# Show next scheduled run
systemctl --user list-timers --all
```

## Configuration

### Environment Variables

The service loads configuration from `/srv/apps/playwright-tests/.mise.local.toml`:

```toml
[env]
PLAYWRIGHT_TEST_BASE_URL = "https://quran.com"
PLAYWRIGHT_SKIP_WEB_SERVER = "true"
DISCORD_BOT_TOKEN = "your_bot_token_here"
DISCORD_CHANNEL_ID = "your_channel_id_here"
TEST_USER_EMAIL = "test@example.com"
TEST_USER_PASSWORD = "password"
TEST_USER_USERNAME = "testuser"
```
