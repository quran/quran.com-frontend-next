# Authentication System Documentation

## Overview

The authentication system is built using React Context with useReducer for state management. It
provides a clean, predictable way to handle user authentication, profile completion, and automatic
redirects throughout the application.

## Architecture

### Core Components

1. **AuthContext** (`src/contexts/AuthContext.tsx`)

   - Central state management for authentication
   - Provides auth state and helper functions to the entire app

2. **useAuthData Hook** (`src/hooks/auth/useAuthData.ts`)

   - Integrates SWR for data fetching with AuthContext
   - Automatically syncs user data with auth state

3. **App Integration** (`src/pages/_app.tsx`)
   - Wraps the entire app with AuthProvider
   - Handles automatic redirects based on auth state

## State Management

### Auth State Structure

```typescript
interface AuthState {
  user: UserProfile | null; // Current user data
  isLoading: boolean; // Loading state for auth operations
  isAuthenticated: boolean; // Whether user is logged in
  error: string | null; // Error message if auth fails
  isProfileComplete: boolean; // Whether user's profile is complete
}
```

### Available Actions

```typescript
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: UserProfile | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PROFILE_COMPLETE'; payload: boolean }
  | { type: 'LOGOUT' };
```

## Usage Examples

### Basic Usage

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { state, login, logout } = useAuth();

  if (state.isLoading) return <div>Loading...</div>;

  return (
    <div>
      {state.isAuthenticated ? (
        <div>
          Welcome, {state.user?.firstName}!<button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <p>You can use the app without logging in!</p>
          <button onClick={() => login(userCredentials)}>Login for more features</button>
        </div>
      )}
    </div>
  );
}
```

### Conditional Rendering

```tsx
function ProtectedComponent() {
  const { state } = useAuth();

  // Show loading spinner while checking auth
  if (state.isLoading) return <LoadingSpinner />;

  // Show different content based on auth status
  if (!state.isAuthenticated) {
    return <PublicContent />; // Unauthenticated users can still use the app
  }

  // Show profile completion prompt for authenticated users
  if (!state.isProfileComplete) {
    return <CompleteProfilePrompt />;
  }

  // Render protected content for fully authenticated users
  return <ProtectedContent />;
}
```

### Manual Auth Management

```tsx
function LoginForm() {
  const { login, state } = useAuth();

  const handleLogin = async (credentials) => {
    try {
      const user = await loginUser(credentials);
      login(user); // Update auth state
    } catch (error) {
      // Error is handled automatically by the context
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* Form fields */}
      {state.error && <div className="error">{state.error}</div>}
    </form>
  );
}
```

## Automatic Redirects

The system automatically handles redirects based on authentication state:

### Redirect Rules

1. **Unauthenticated users** → Can use the app normally (no redirects)
2. **Incomplete profiles** → Redirected to `/complete-signup`
3. **Complete profiles on auth pages** → Redirected to `/` (home)
4. **Complete profiles on complete-signup** → Redirected to `/` (home)

### User Experience

- **Unauthenticated users** can browse and use the app without any restrictions
- **Authentication is only required** when users want to access protected features
- **Profile completion** is handled seamlessly for authenticated users
- **No forced logins** or redirects for general app usage

## Data Fetching Integration

The `useAuthData` hook automatically:

- Fetches user profile when logged in
- Updates auth state when data loads
- Handles loading and error states
- Logs errors to Sentry

```tsx
// Automatic data fetching and state updates
const { userData, isUserDataLoading, userDataError } = useAuthData();
```

## Authentication Hooks

### `useAuthData` Hook

**Purpose**: Integrates SWR data fetching with the AuthContext for seamless user data management.

**Features**:

- Automatically fetches user profile when authenticated
- Syncs data with AuthContext state
- Handles loading and error states
- Logs errors to Sentry

**Usage**:

```typescript
import useAuthData from '@/hooks/auth/useAuthData';

function MyComponent() {
  const {
    userData,
    isUserDataLoading,
    userDataError,
    // All auth state properties...
    isAuthenticated,
    isLoading,
    user,
    error,
    isProfileComplete,
  } = useAuthData();

  if (isUserDataLoading) return <div>Loading...</div>;
  if (userDataError) return <div>Error: {userDataError}</div>;

  return <div>Welcome, {userData?.firstName}!</div>;
}
```

**Returns**:

```typescript
interface UseAuthDataReturn {
  userData: UserProfile | undefined;
  isUserDataLoading: boolean;
  userDataError: any;
  // Plus all AuthState properties
}
```

**Dependencies**:

- `@/contexts/AuthContext` - For auth state management
- `@/utils/auth/api` - For API calls
- `@/lib/sentry` - For error logging

### Hook Patterns

#### Data Fetching Pattern

```typescript
// 1. Check authentication
const isLoggedInUser = isLoggedIn();

// 2. Fetch data conditionally
const { data, isValidating, error } = useSWRImmutable(isLoggedInUser ? apiEndpoint : null, fetcher);

// 3. Update context state
useEffect(() => {
  if (isValidating) dispatch({ type: 'SET_LOADING', payload: true });
  else if (error) dispatch({ type: 'SET_ERROR', payload: error.message });
  else if (data) dispatch({ type: 'SET_USER', payload: data });
}, [data, isValidating, error, dispatch]);
```

#### Error Handling Pattern

```typescript
useEffect(() => {
  if (error) {
    logErrorToSentry(error, {
      transactionName: 'hookName',
      metadata: { error, contextData },
    });
  }
}, [error]);
```

### Hook Testing

#### Mock Setup

```typescript
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    state: mockAuthState,
    dispatch: vi.fn(),
  }),
}));

vi.mock('@/utils/auth/api', () => ({
  getUserProfile: vi.fn(),
}));
```

#### Test Cases

- ✅ Successful data fetching
- ✅ Error handling
- ✅ Loading states
- ✅ Authentication state changes
- ✅ Sentry error logging

### Hook Best Practices

#### 1. Error Handling

Always log errors to Sentry with context:

```typescript
logErrorToSentry(error, {
  transactionName: 'useAuthData',
  metadata: { userId, error, context },
});
```

#### 2. Loading States

Handle all loading states appropriately:

```typescript
if (isValidating) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
```

#### 3. Type Safety

Use proper TypeScript types:

```typescript
interface HookReturn {
  data: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}
```

#### 4. Performance

Use SWR's caching and revalidation features:

```typescript
const { data, mutate } = useSWRImmutable(key, fetcher);
// mutate() to update cache manually
```

## Error Handling

### Client-side Errors

- Network errors are caught and displayed
- User-friendly error messages
- Automatic retry logic via SWR

### Server-side Logging

- Errors are logged to Sentry with context
- Includes transaction names for better tracking
- Metadata includes error details

## Best Practices

### 1. Use the Hook, Not Context Directly

```tsx
// ✅ Good
const { state } = useAuth();

// ❌ Avoid
const context = useContext(AuthContext);
```

### 2. Handle Loading States

```tsx
// ✅ Good
if (state.isLoading) return <LoadingSpinner />;

// ❌ Avoid
if (!state.user) return <div>No user</div>;
```

### 3. Check Authentication Before Profile

```tsx
// ✅ Good
if (!state.isAuthenticated) return <LoginPrompt />;
if (!state.isProfileComplete) return <CompleteProfilePrompt />;

// ❌ Avoid
if (!state.isProfileComplete) return <CompleteProfilePrompt />;
```

### 4. Use TypeScript Types

```tsx
// ✅ Good
const { state }: { state: AuthState } = useAuth();

// ✅ Also good (inferred)
const { state } = useAuth();
```

## Migration Guide

### From useEffect Approach

**Before:**

```tsx
// Complex useEffect with many dependencies
useEffect(() => {
  if (!isLoggedIn() || isLoading) return;
  // Complex redirect logic...
}, [isLoggedIn, userData, isLoading, router]);
```

**After:**

```tsx
// Simple context usage
const { state } = useAuth();
// Redirects handled automatically by context
```

### From Redux/MobX

**Before:**

```tsx
const user = useSelector((state) => state.auth.user);
const dispatch = useDispatch();
```

**After:**

```tsx
const { state, login, logout } = useAuth();
// Same API, but with automatic redirects
```

## Performance Considerations

### Optimizations Included

1. **useCallback** - Prevents unnecessary re-renders of child components
2. **useMemo** - Memoizes context value
3. **SWR Integration** - Efficient data fetching with caching
4. **Minimal Dependencies** - Only re-renders when necessary

### Bundle Size

- **AuthContext**: ~2KB (gzipped)
- **useAuthData**: ~1KB (gzipped)
- **Dependencies**: React Context, SWR (already used in app)

## Troubleshooting

### Common Issues

1. **"useAuth must be used within an AuthProvider"**

   - Solution: Ensure component is wrapped with `<AuthProvider>`

2. **Infinite redirect loops**

   - Solution: Check route definitions and redirect logic

3. **State not updating**

   - Solution: Ensure dispatch is called with correct action types

4. **Loading states not working**
   - Solution: Check SWR configuration and network requests

### Debug Mode

Add this to see auth state changes:

```typescript
useEffect(() => {
  console.log('Auth state changed:', state);
}, [state]);
```

## Conclusion

This authentication system provides:

- ✅ **Simple API** - Easy to use and understand
- ✅ **Predictable State** - useReducer ensures consistent updates
- ✅ **Automatic Redirects** - No manual redirect logic needed
- ✅ **Type Safety** - Full TypeScript support
- ✅ **Performance** - Optimized with proper memoization
- ✅ **Testable** - Pure functions and isolated logic
- ✅ **Maintainable** - Clean separation of concerns

The system is production-ready and provides a solid foundation for authentication in React
applications.
