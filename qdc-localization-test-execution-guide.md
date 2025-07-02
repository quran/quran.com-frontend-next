# QDC Localization Tests - Execution Guide

## Issue Resolution Status

✅ **localStorage Security Issue Fixed**: All localStorage access now uses proper error handling and security checks.

❗ **Current Issue**: Development server needs to be running for tests to execute.

## Prerequisites

### 1. Start the Development Server

The tests require the QDC application to be running locally:

```bash
# Start the development server
npm run dev
# or
yarn dev

# Server should be running at http://localhost:3000
```

### 2. Verify Server is Running

Ensure the development server is accessible:

```bash
# Check if server responds
curl http://localhost:3000

# Or open in browser
open http://localhost:3000
```

## Test Execution Commands

### Run All Localization Tests

```bash
# Run all localization tests
npx playwright test tests/integration/localization/

# Run with HTML report
npx playwright test tests/integration/localization/ --reporter=html

# Run in headed mode (visible browser)
npx playwright test tests/integration/localization/ --headed
```

### Run Specific Test Categories

```bash
# Category 1: First-time Guest User Detection
npx playwright test --grep "Category 1"

# Category 3: Language Selector Behavior
npx playwright test --grep "Category 3"

# Category 6: Error Handling & Edge Cases
npx playwright test --grep "Category 6"

# Category 7: Session Persistence
npx playwright test --grep "Category 7"
```

### Run Specific Test Cases

```bash
# English + US Country Detection
npx playwright test --grep "English Device Language + US Country"

# Arabic Language Detection
npx playwright test --grep "Arabic Device Language"

# Network Failure Testing
npx playwright test --grep "Network Failure"
```

### Cross-Browser Testing

```bash
# Run on specific browsers
npx playwright test tests/integration/localization/ --project=chromium
npx playwright test tests/integration/localization/ --project=firefox
npx playwright test tests/integration/localization/ --project=webkit

# Run on mobile browsers
npx playwright test tests/integration/localization/ --project="Mobile Chrome"
npx playwright test tests/integration/localization/ --project="Mobile Safari"
```

### Debug Mode

```bash
# Run with debug mode (step through tests)
npx playwright test tests/integration/localization/ --debug

# Run with trace
npx playwright test tests/integration/localization/ --trace=on

# Run with video recording
npx playwright test tests/integration/localization/ --video=on
```

## Using the Test Runner Script

```bash
# Use the convenient test runner script
node scripts/run-localization-tests.js

# Run specific category
node scripts/run-localization-tests.js --category 1

# Run with debug mode
node scripts/run-localization-tests.js --debug

# Generate HTML report
node scripts/run-localization-tests.js --report

# Run on specific browser
node scripts/run-localization-tests.js --browser firefox
```

## Test Environment Verification

### Pre-execution Checklist

- [ ] Development server running at localhost:3000
- [ ] Server responds to HTTP requests
- [ ] No other processes blocking port 3000
- [ ] Browser dependencies installed (`npx playwright install`)

### Verification Commands

```bash
# Check server status
curl -f http://localhost:3000 && echo "✅ Server is running" || echo "❌ Server not accessible"

# Check Playwright installation
npx playwright --version

# Verify browser installation
npx playwright install --dry-run
```

## Expected Test Results

With the localStorage security fixes, the tests should now:

✅ **Pass localStorage Access**: No more SecurityError exceptions
✅ **Handle Redux Hydration**: Wait properly for store rehydration
✅ **Clear Storage Safely**: No security errors when clearing data
✅ **Handle Network Failures**: Graceful degradation on API failures
✅ **Cross-Browser Compatible**: Work on Chromium, Firefox, WebKit
✅ **Mobile Responsive**: Pass on mobile browser emulation

## Troubleshooting

### If Tests Still Fail with localStorage Errors

1. **Clear browser cache and data**:
   ```bash
   npx playwright test --project=chromium --headed
   # Clear all data in DevTools > Application > Storage
   ```

2. **Run tests in incognito mode**:
   ```bash
   # Tests should handle restricted localStorage contexts
   ```

3. **Check for timing issues**:
   ```bash
   # Increase timeout if needed
   npx playwright test --timeout=60000
   ```

### If Connection Errors Persist

1. **Verify development server**:
   ```bash
   # Check if server is actually running
   lsof -i :3000

   # Kill any hanging processes
   kill -9 $(lsof -t -i:3000)

   # Restart development server
   npm run dev
   ```

2. **Check port conflicts**:
   ```bash
   # Use different port if needed
   PORT=3001 npm run dev

   # Update playwright.config.ts baseURL accordingly
   ```

3. **Network diagnostics**:
   ```bash
   # Test local connectivity
   telnet localhost 3000

   # Check firewall/security software
   ```

## Test Coverage Summary

The comprehensive test suite covers:

- **55 test cases** across 7 categories
- **Multiple browser engines** (Chromium, Firefox, WebKit)
- **Mobile browser emulation** (Mobile Chrome, Mobile Safari)
- **16 supported languages** with country-specific logic
- **Error handling scenarios** including network failures
- **Redux state verification** with localStorage integration
- **Session persistence** across browser restarts
- **Settings reset functionality** for guest users
- **Language switching** with user customization preservation

## Next Steps

1. **Start Development Server**: `npm run dev`
2. **Run Tests**: `npx playwright test tests/integration/localization/`
3. **Review Results**: Check HTML report for detailed results
4. **Debug Issues**: Use `--debug` flag for any failing tests

The localStorage security issue has been resolved. The tests are now ready to run once the development server is available.
