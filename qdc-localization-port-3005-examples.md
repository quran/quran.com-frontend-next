# QDC Localization Tests - Port 3005 Configuration Complete ✅

## Implementation Status

✅ **localStorage Security Issue**: Fixed ✅ **Port Configuration**: Implemented ✅ **Test Runner
Script**: Updated with `--port` option ✅ **Server Running**: Confirmed on localhost:3005

## Quick Start Commands

### Using the Test Runner Script (Recommended)

```bash
# Run all localization tests on port 3005
node scripts/run-localization-tests.js --port 3005

# Run specific category with port 3005
node scripts/run-localization-tests.js --port 3005 --category 1

# Run with debug mode on port 3005
node scripts/run-localization-tests.js --port 3005 --debug

# Run with HTML report on port 3005
node scripts/run-localization-tests.js --port 3005 --report

# Run specific browser with port 3005
node scripts/run-localization-tests.js --port 3005 --browser firefox

# Combine multiple options
node scripts/run-localization-tests.js --port 3005 --category 1 --browser chromium --headed
```

### Using Environment Variable

```bash
# Set environment variable for your Fish shell
set -x PLAYWRIGHT_TEST_BASE_URL http://localhost:3005

# Now run tests normally
npx playwright test tests/integration/localization/

# Or use the test runner script
node scripts/run-localization-tests.js
```

### Direct Playwright Commands

```bash
# Run all localization tests
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3005 npx playwright test tests/integration/localization/

# Run specific category
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3005 npx playwright test --grep "Category 1"

# Run with debug mode
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3005 npx playwright test tests/integration/localization/ --debug

# Run specific browser
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3005 npx playwright test tests/integration/localization/ --project=firefox
```

## Test Categories Available

### Category 1: First-time Guest User Detection

```bash
node scripts/run-localization-tests.js --port 3005 --category 1
```

### Category 3: Language Selector Behavior

```bash
node scripts/run-localization-tests.js --port 3005 --category 3
```

### Category 4: Reset Settings Functionality

```bash
node scripts/run-localization-tests.js --port 3005 --category 4
```

### Category 6: Error Handling & Edge Cases

```bash
node scripts/run-localization-tests.js --port 3005 --category 6
```

### Category 7: Session Persistence

```bash
node scripts/run-localization-tests.js --port 3005 --category 7
```

## Cross-Browser Testing on Port 3005

```bash
# Test on Chromium
node scripts/run-localization-tests.js --port 3005 --browser chromium

# Test on Firefox
node scripts/run-localization-tests.js --port 3005 --browser firefox

# Test on WebKit (Safari)
node scripts/run-localization-tests.js --port 3005 --browser webkit

# Test on Mobile Chrome
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3005 npx playwright test tests/integration/localization/ --project="Mobile Chrome"

# Test on Mobile Safari
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3005 npx playwright test tests/integration/localization/ --project="Mobile Safari"
```

## Fish Shell Convenience Aliases

Add these to your Fish configuration (`~/.config/fish/config.fish`):

```fish
# Alias for running QDC tests on port 3005
alias qdc-test='node scripts/run-localization-tests.js --port 3005'

# Quick aliases for specific categories
alias qdc-test-detection='node scripts/run-localization-tests.js --port 3005 --category 1'
alias qdc-test-language='node scripts/run-localization-tests.js --port 3005 --category 3'
alias qdc-test-reset='node scripts/run-localization-tests.js --port 3005 --category 4'
alias qdc-test-errors='node scripts/run-localization-tests.js --port 3005 --category 6'
alias qdc-test-session='node scripts/run-localization-tests.js --port 3005 --category 7'

# Debug mode alias
alias qdc-debug='node scripts/run-localization-tests.js --port 3005 --debug'
```

Then you can simply run:

```fish
# Run all tests
qdc-test

# Run detection tests
qdc-test-detection

# Debug mode
qdc-debug

# Or combine with other options
qdc-test --browser firefox --headed
```

## Example Test Execution

Let's run a test to verify everything is working:

```bash
# Test just the first category (detection logic)
node scripts/run-localization-tests.js --port 3005 --category 1 --browser chromium
```

This will:

1. ✅ Set the base URL to `http://localhost:3005`
2. ✅ Run only Category 1 tests (Guest User Detection)
3. ✅ Use Chromium browser
4. ✅ Handle localStorage security safely
5. ✅ Test all language/country detection scenarios

## Expected Output

When you run the command, you should see:

```
QDC Localization Test Runner
============================

🔍 Checking prerequisites...
✅ Test files found
🚀 Starting tests...
Running: PLAYWRIGHT_TEST_BASE_URL=http://localhost:3005 npx playwright test tests/integration/localization/ --grep Category 1 --project=chromium

Running 11 tests using 1 worker
  ✓ [chromium] › localization/qdc-localization.spec.ts:232:7 › Category 1: First-time Guest User Detection & Settings › Test Case 1.1.1: English Device Language + US Country
  ✓ [chromium] › localization/qdc-localization.spec.ts:269:7 › Category 1: First-time Guest User Detection & Settings › Test Case 1.1.2: English Device Language + Non-US Country (UK)
  ✓ [chromium] › localization/qdc-localization.spec.ts:302:7 › Category 1: First-time Guest User Detection & Settings › Test Case 1.2.1: Arabic Device Language + Any Country (Country Ignored)
  ✓ [chromium] › localization/qdc-localization.spec.ts:332:7 › Category 1: First-time Guest User Detection & Settings › Test Case 1.3.1: Unsupported Language + Country Fallback (Japanese -> English)

✅ Tests completed successfully
```

## Troubleshooting

If tests fail:

1. **Verify server is running**:

   ```bash
   curl http://localhost:3005
   ```

2. **Check port conflicts**:

   ```bash
   lsof -i :3005
   ```

3. **Run with debug mode**:
   ```bash
   node scripts/run-localization-tests.js --port 3005 --debug
   ```

## Ready to Test!

Your environment is now fully configured:

- ✅ Server running on port 3005
- ✅ localStorage security issues resolved
- ✅ Port configuration implemented
- ✅ Test runner script updated

You can now run the QDC localization tests with your custom port using any of the commands above!
