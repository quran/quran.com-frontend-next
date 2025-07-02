# Configuring QDC Localization Tests for Custom Port (3005)

Since your development server is running on `localhost:3005`, here are the ways to configure the Playwright tests to use your custom port:

## Option 1: Environment Variable (Recommended)

### For Single Test Run
```bash
# Set environment variable for one-time test execution
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3005 npx playwright test tests/integration/localization/

# With debug mode
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3005 npx playwright test tests/integration/localization/ --debug

# With HTML report
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3005 npx playwright test tests/integration/localization/ --reporter=html
```

### For Fish Shell (your shell)
```fish
# Set environment variable in Fish shell
set -x PLAYWRIGHT_TEST_BASE_URL http://localhost:3005

# Now run tests normally
npx playwright test tests/integration/localization/

# Using the test runner script
node scripts/run-localization-tests.js
```

### For Bash/Zsh
```bash
# Set environment variable
export PLAYWRIGHT_TEST_BASE_URL=http://localhost:3005

# Run tests
npx playwright test tests/integration/localization/
```

## Option 2: Update Test Runner Script

Update the test runner script to support custom port:

```bash
# Run with custom port
node scripts/run-localization-tests.js --port 3005

# Combined with other options
node scripts/run-localization-tests.js --port 3005 --category 1 --debug
```

## Option 3: Create .env File

Create a `.env` file in your project root:

```bash
# Create .env file
echo "PLAYWRIGHT_TEST_BASE_URL=http://localhost:3005" > .env
```

## Option 4: Modify Playwright Config (Temporary)

If you want to permanently change the default port, you can modify `playwright.config.ts`:

```typescript
// In playwright.config.ts, change line 28:
baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3005',
```

## Verification Commands

Before running tests, verify your server is accessible on port 3005:

```bash
# Check if server responds on port 3005
curl http://localhost:3005

# Or open in browser
open http://localhost:3005

# Check what's running on port 3005
lsof -i :3005
```

## Complete Test Execution Examples

### Run All Localization Tests on Port 3005
```bash
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3005 npx playwright test tests/integration/localization/
```

### Run Specific Category with Custom Port
```bash
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3005 npx playwright test --grep "Category 1"
```

### Debug Mode with Custom Port
```bash
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3005 npx playwright test tests/integration/localization/ --debug
```

### Cross-Browser Testing with Custom Port
```bash
# Chromium
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3005 npx playwright test tests/integration/localization/ --project=chromium

# Firefox
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3005 npx playwright test tests/integration/localization/ --project=firefox

# WebKit
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3005 npx playwright test tests/integration/localization/ --project=webkit
```

## Fish Shell Convenience

Since you're using Fish shell, you can create an alias for convenience:

```fish
# Add to your Fish config (~/.config/fish/config.fish)
alias qdc-test='set -x PLAYWRIGHT_TEST_BASE_URL http://localhost:3005; npx playwright test tests/integration/localization/'

# Then simply run:
qdc-test

# Or with options:
qdc-test --debug
qdc-test --grep "Category 1"
```

## Updating the Test Runner Script

I can also update the test runner script to support a `--port` option if you'd like that convenience.
