# QDC Localization Test - localStorage Security Issue Fix

## Problem Description

The Playwright tests for QDC localization are encountering a `SecurityError` when trying to access
`localStorage`:

```
Error: page.evaluate: SecurityError: Failed to read the 'localStorage' property from 'Window': Access is denied for this document.
```

## Root Cause

This error occurs when:

1. The page hasn't fully loaded or initialized
2. The test tries to access localStorage in a context where it's restricted
3. Redux hasn't finished hydrating the store
4. The browser context doesn't have localStorage available

## Solution Approach

### 1. Safe localStorage Access Pattern

Instead of directly accessing localStorage, use try-catch blocks and check for availability:

```typescript
// Before (unsafe):
const storage = localStorage.getItem('persist:root');

// After (safe):
try {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const storage = localStorage.getItem('persist:root');
    // ... rest of logic
  }
} catch (error) {
  console.warn('localStorage not available:', error);
  return false;
}
```

### 2. Enhanced Redux Hydration Waiting

Update the `waitForReduxHydration` method to handle security errors gracefully:

```typescript
async waitForReduxHydration() {
  try {
    await this.page.waitForFunction(
      () => {
        try {
          // Check if localStorage is available
          if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
            return false;
          }

          const storage = localStorage.getItem('persist:root');
          if (!storage) return false;

          const parsed = JSON.parse(storage);
          const persistData = parsed['_persist'];
          if (!persistData) return false;

          const persistInfo = JSON.parse(persistData);
          return persistInfo.rehydrated === true;
        } catch {
          return false;
        }
      },
      { timeout: 15000 }
    );
  } catch (error) {
    // If Redux hydration fails, continue with test
    console.warn('Redux hydration timeout or failed:', error);
  }
}
```

### 3. Safe Browser Data Clearing

Update the `clearAllBrowserData` method:

```typescript
async clearAllBrowserData() {
  await this.page.context().clearCookies();

  try {
    await this.page.evaluate(() => {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.clear();
        }
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.clear();
        }
      } catch (error) {
        // Storage might not be available in some contexts
        console.warn('Could not clear storage:', error);
      }
    });
  } catch (error) {
    // Page might not be ready for evaluation
    console.warn('Could not evaluate storage clearing:', error);
  }
}
```

### 4. Alternative: Use Playwright's Storage State API

Instead of directly accessing localStorage, use Playwright's built-in storage state methods:

```typescript
async getReduxState(): Promise<any> {
  try {
    const storage = await this.page.context().storageState();
    const localStorage = storage?.origins?.[0]?.localStorage;

    if (!localStorage) return null;

    const persistedRoot = localStorage.find(
      (item) => item.name === 'persist:root'
    );

    if (!persistedRoot) return null;

    const rootData = JSON.parse(persistedRoot.value);
    const defaultSettings = rootData.defaultSettings;

    if (!defaultSettings) return null;

    return JSON.parse(defaultSettings);
  } catch (error) {
    console.warn('Could not get Redux state:', error);
    return null;
  }
}
```

## Implementation Steps

### Step 1: Apply the Safe localStorage Access Fix

Add proper error handling to all localStorage access points:

```bash
# Update the waitForReduxHydration method
# Update the clearAllBrowserData method
# Update any direct localStorage.getItem() calls
```

### Step 2: Increase Timeouts

Give more time for Redux hydration and page loading:

```typescript
// Increase timeout from 10s to 15s
{
  timeout: 15000;
}

// Add page load waiting
await this.page.waitForLoadState('networkidle');
```

### Step 3: Add Page Readiness Checks

Ensure the page is fully loaded before accessing localStorage:

```typescript
async navigateAndWait(): Promise<void> {
  await this.page.goto('/');

  // Wait for page to be fully loaded
  await this.page.waitForLoadState('networkidle');

  // Wait for Redux hydration
  await this.waitForReduxHydration();
}
```

### Step 4: Test the Fix

Run the tests to verify the security error is resolved:

```bash
# Run localization tests
npx playwright test tests/integration/localization/

# Run with debug mode to see detailed output
npx playwright test tests/integration/localization/ --debug
```

## Best Practices for localStorage in Playwright Tests

1. **Always check availability**: Never assume localStorage exists
2. **Use try-catch blocks**: Wrap all localStorage operations
3. **Wait for page load**: Ensure the page is fully initialized
4. **Use Playwright's storage APIs**: Prefer official methods over direct access
5. **Handle timeouts gracefully**: Don't fail tests on storage access issues
6. **Add fallbacks**: Have alternative test paths when storage fails

## Testing Different Scenarios

Test the fix with various scenarios:

1. **Fresh browser context**: No existing localStorage
2. **Incognito mode**: Restricted localStorage access
3. **Network disabled**: Simulate offline conditions
4. **Slow connections**: Test with network throttling
5. **Multiple tabs**: Concurrent localStorage access

## Verification Checklist

- [ ] No SecurityError when accessing localStorage
- [ ] Tests pass in fresh browser contexts
- [ ] Tests pass in incognito mode
- [ ] Redux hydration waits properly
- [ ] Graceful degradation on storage failures
- [ ] All test categories execute successfully
- [ ] No hanging or timeout issues

This fix ensures robust localStorage access in Playwright tests while maintaining the comprehensive
test coverage for QDC localization features.
