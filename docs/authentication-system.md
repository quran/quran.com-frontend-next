# Authentication System

A React Context-based authentication system with automatic redirects and profile completion
handling.

## Overview

This document outlines the comprehensive authentication flows implemented in the Quran.com frontend
application. The system uses React Context with useReducer for state management, integrated with SWR
for data fetching.

## Key Characteristics

### Unauthenticated User Experience

- ✅ No login required to use the app
- ✅ Full browsing capabilities
- ✅ No redirects or interruptions
- ✅ Can access all public features

### Authenticated User Experience

- ✅ Seamless profile completion flow
- ✅ Automatic redirects based on profile status
- ✅ Persistent authentication state
- ✅ Enhanced features available

### Error Recovery

- ✅ Automatic retry logic via SWR
- ✅ Graceful error states
- ✅ Sentry logging for debugging
- ✅ User-friendly error messages

### Performance Optimizations

- ✅ SWR caching prevents redundant requests
- ✅ useCallback prevents unnecessary re-renders
- ✅ useMemo optimizes context value
- ✅ Lazy loading of auth data

This authentication system provides a robust, user-friendly experience that balances security
requirements with seamless user experience, allowing unauthenticated users to explore the app while
guiding authenticated users through necessary profile completion steps.

## Quick Start

```tsx
import useAuthData from '@/hooks/auth/useAuthData';

function MyComponent() {
  const { userData, isLoading, isAuthenticated, isProfileComplete } = useAuthData();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div>
          Welcome, {userData?.firstName}!
          {!isProfileComplete && <div>Please complete your profile</div>}
        </div>
      ) : (
        <div>
          <p>You can use the app without logging in!</p>
          <a href="/login">Login for more features</a>
        </div>
      )}
    </div>
  );
}
```

## Architecture

### Core Components

1. **AuthContext** - Central state management with useReducer
2. **useAuthData Hook** - SWR integration for automatic data fetching
3. **AuthProvider** - App wrapper that provides authentication context

### State Structure

```typescript
interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  isProfileComplete: boolean;
}
```

## Authentication Flows

### Application Initialization Flow

```
App Start → AuthProvider → useAuthData Hook → SWR Data Fetching
     ↓
Initial State: { isLoading: true, isAuthenticated: false }
     ↓
Check Login Status → Fetch User Profile (if logged in)
     ↓
Update Auth State → Handle Redirects → Render App
```

### User Authentication State Flows

#### Flow A: Unauthenticated User Journey

```
User visits any page → AuthProvider loads → useAuthData checks login status
     ↓
isLoggedIn() = false → No data fetching → State remains unauthenticated
     ↓
User can browse app normally → No redirects → Full app access
```

#### Flow B: Authenticated User with Complete Profile

```
User visits any page → AuthProvider loads → useAuthData fetches profile
     ↓
isLoggedIn() = true → SWR fetches user data → Profile is complete
     ↓
Auth state: { isAuthenticated: true, isProfileComplete: true }
     ↓
If on auth page → Redirect to home (/) → Normal app usage
```

#### Flow C: Authenticated User with Incomplete Profile

```
User visits any page → AuthProvider loads → useAuthData fetches profile
     ↓
isLoggedIn() = true → SWR fetches user data → Profile incomplete
     ↓
Auth state: { isAuthenticated: true, isProfileComplete: false }
     ↓
If not on /complete-signup → Redirect to /complete-signup
     ↓
User completes profile → Redirect to home (/)
```

### Profile Completion Flow

#### Complete Signup Page Flow

```
User lands on /complete-signup → Check login status
     ↓
Not logged in → Redirect to /login
     ↓
Logged in → Fetch user data with SWR
     ↓
Loading → Show spinner
     ↓
Error → Log to Sentry → Redirect to /login
     ↓
Success → Show CompleteSignupForm → User fills required fields
     ↓
Form submission success → Redirect to home (/)
```

### Authentication Actions Flow

#### Login Flow

```
User clicks login → login(user) called → Dispatch SET_USER action
     ↓
Reducer updates state: { isAuthenticated: true, isProfileComplete: checkProfile(user) }
     ↓
handleAuthRedirect triggered → Check profile completion
     ↓
If incomplete → Redirect to /complete-signup
If complete → Stay on current page or redirect from auth pages
```

#### Logout Flow

```
User clicks logout → logout() called → Dispatch LOGOUT action
     ↓
State reset to initialState with isLoading: false
     ↓
Router.push('/login') → User redirected to login page
```

#### Profile Update Flow

```
User updates profile → updateProfile(user) called → Dispatch SET_USER action
     ↓
State updated with new user data → Profile completion re-evaluated
     ↓
If profile now complete → Redirect logic may trigger
```

### Error Handling Flows

#### Data Fetching Error Flow

```
useAuthData → SWR fetch fails → userDataError set
     ↓
Dispatch SET_ERROR action → State: { error: message, isLoading: false }
     ↓
Error logged to Sentry with context → UI shows error state
```

#### Network Error Recovery Flow

```
Network error occurs → SWR retry logic → Automatic retry
     ↓
If retry succeeds → Normal data flow resumes
     ↓
If retry fails → Error state maintained → User can retry manually
```

### Page Navigation Flows

#### Auth Page Protection Flow

```
User navigates to auth page (/login, /forgot-password, etc.)
     ↓
isAuthPage(router) = true
     ↓
If user authenticated + profile complete → Redirect to home (/)
     ↓
If user authenticated + profile incomplete → Allow access to /complete-signup only
```

#### Non-Auth Page Access Flow

```
User navigates to regular app page
     ↓
isAuthPage(router) = false
     ↓
If user authenticated + profile incomplete → Redirect to /complete-signup
     ↓
Otherwise → Allow normal access
```

### State Management Flow

#### Reducer State Transitions

```
Initial State: { user: null, isLoading: true, isAuthenticated: false, error: null, isProfileComplete: false }
     ↓
SET_LOADING: { ...state, isLoading: payload }
     ↓
SET_USER: { user: payload, isAuthenticated: !!payload, isProfileComplete: checkProfile(payload), isLoading: false, error: null }
     ↓
SET_ERROR: { ...state, error: payload, isLoading: false }
     ↓
SET_PROFILE_COMPLETE: { ...state, isProfileComplete: payload }
     ↓
LOGOUT: { ...initialState, isLoading: false }
```

### Data Synchronization Flow

#### useAuthData Synchronization

```
Component mounts → useAuthData hook initializes
     ↓
Check isLoggedIn() → Conditional SWR fetch
     ↓
SWR states: isValidating, data, error
     ↓
useEffect syncs to auth context:
  - isValidating → SET_LOADING
  - data → SET_USER
  - error → SET_ERROR + Sentry log
  - !isLoggedIn → SET_LOADING(false) + SET_USER(null)
```

### Component Integration Flow

#### App-level Integration

```
_app.tsx → AuthProvider wraps entire app
     ↓
AppContent component inside AuthProvider
     ↓
useAuthData hook called → Provides user data to UserAccountModal
     ↓
Auth state available throughout app via useAuth() hook
```

### Profile Completion Logic Flow

#### Profile Validation Flow

```
User profile data → isCompleteProfile(user)
     ↓
Required fields check: email, firstName, lastName, username
     ↓
All fields present → true (profile complete)
     ↓
Any field missing → false (profile incomplete)
     ↓
getMissingFields() → Returns array of missing field names
     ↓
convertMissingFieldsToFormFields() → Creates form fields for completion
```

### User Journey States

**Unauthenticated User:**

- Can browse and use the app without restrictions
- No redirects or interruptions
- Full access to public features

**Authenticated User with Complete Profile:**

- Seamless app usage
- Automatic redirects from auth pages to home
- Enhanced features available

**Authenticated User with Incomplete Profile:**

- Automatic redirect to `/complete-signup`
- Profile completion flow
- Redirect to home after completion

### Key Flow Characteristics

- ✅ **No forced logins** - Users can browse without authentication
- ✅ **Automatic redirects** based on authentication and profile status
- ✅ **Seamless onboarding** for new users
- ✅ **Persistent authentication** state
- ✅ **Error recovery** with automatic retries
- ✅ **State synchronization** between hooks and context

## Common Usage Patterns

### Basic Authentication Check

```tsx
import useAuthData from '@/hooks/auth/useAuthData';

function MyComponent() {
  const { isAuthenticated, userData, isLoading } = useAuthData();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {userData?.firstName}!</p>
      ) : (
        <p>Please log in to access this feature</p>
      )}
    </div>
  );
}
```

### Profile Completion Check

```tsx
import useAuthData from '@/hooks/auth/useAuthData';

function ProfileComponent() {
  const { isAuthenticated, isProfileComplete, userData } = useAuthData();

  if (!isAuthenticated) return <LoginPrompt />;
  if (!isProfileComplete) return <CompleteProfilePrompt />;

  return <UserProfile user={userData} />;
}
```

### Conditional Content Rendering

```tsx
import useAuthData from '@/hooks/auth/useAuthData';

function AppContent() {
  const { isAuthenticated, userData } = useAuthData();

  return (
    <div>
      {/* Always visible content */}
      <PublicContent />

      {/* Authenticated-only content */}
      {isAuthenticated && (
        <div>
          <UserMenu user={userData} />
          <PrivateFeatures />
        </div>
      )}
    </div>
  );
}
```

## Hooks

### useAuthData (Primary Hook)

The main hook for accessing authentication state and user data.

```tsx
import useAuthData from '@/hooks/auth/useAuthData';

function Component() {
  const {
    // State
    userData,
    isLoading,
    isAuthenticated,
    isProfileComplete,
    error,

    // Actions
    refreshUserData,
  } = useAuthData();

  // Use the data...
}
```

**Returns:**

- `userData`: User profile data (when available)
- `isLoading`: Loading state
- `isAuthenticated`: Whether user is logged in
- `isProfileComplete`: Whether user's profile is complete
- `error`: Error message (if any)
- `refreshUserData`: Function to refresh user data

### useCurrentUser (Legacy Hook)

Alternative hook for user data (deprecated, use `useAuthData` instead).

```tsx
import useCurrentUser from '@/hooks/auth/useCurrentUser';

function ProfilePage() {
  const { user, isLoading, error, isUserLoggedIn } = useCurrentUser();

  // Use the data...
}
```

## Error Handling

The system provides robust error handling with:

- **Automatic retries** via SWR
- **User-friendly messages** for common errors
- **Sentry logging** for debugging
- **Graceful fallbacks** for network issues

### Error Types

- **Network errors**: Automatic retry with user feedback
- **Authentication errors**: Redirect to login
- **Profile errors**: Redirect to profile completion
- **Server errors**: User-friendly error messages

## Best Practices

### 1. Use the Right Hook

```tsx
// ✅ Use useAuthData for most components
const { userData, isAuthenticated } = useAuthData();

// ❌ Don't use useCurrentUser (deprecated)
const { user } = useCurrentUser();
```

### 2. Handle Loading States

```tsx
// ✅ Always handle loading states
if (isLoading) return <LoadingSpinner />;

// ✅ Check authentication before accessing user data
if (isAuthenticated && userData) {
  // Safe to use userData
}
```

### 3. Check Profile Completion

```tsx
// ✅ Check both authentication and profile completion
if (isAuthenticated && isProfileComplete) {
  // User can access all features
} else if (isAuthenticated && !isProfileComplete) {
  // Redirect to profile completion
}
```

### 4. Error Handling

```tsx
// ✅ Handle errors gracefully
if (error) {
  return <ErrorMessage message={error} />;
}
```

## Performance

- **Efficient caching** with SWR
- **Minimal re-renders** with proper memoization
- **Lazy loading** of user data
- **Bundle size**: ~3KB (gzipped)

## Troubleshooting

### Common Issues

**Profile data not loading:**

- Ensure component is wrapped with `AuthProvider`
- Check network connectivity
- Verify authentication token validity

**Infinite redirects:**

- Check redirect logic in auth pages
- Verify profile completion status
- Ensure proper route definitions

**State not updating:**

- Use the provided hooks instead of direct context access
- Check for proper dependency arrays in useEffect

### Debug Mode

```tsx
// Debug authentication state
const authState = useAuthData();
console.log('Auth state:', authState);
```

## Migration Guide

### From Direct SWR Usage

```tsx
// Before
const { data: userData, error } = useSWR(makeUserProfileUrl(), getUserProfile);

// After
const { userData, error } = useAuthData();
```

### From Redux/MobX

```tsx
// Before
const user = useSelector((state) => state.auth.user);

// After
const { userData } = useAuthData();
```

### From Manual Auth Checks

```tsx
// Before
const isLoggedIn = isLoggedIn();
const { data } = useSWR(isLoggedIn ? apiUrl : null, fetcher);

// After
const { isAuthenticated } = useAuthData();
```

## Authentication Routes

The following routes are considered authentication pages:

- `/login`
- `/forgot-password`
- `/reset-password`
- `/complete-signup`

## State Management Details

### AuthState Interface

```typescript
interface AuthState {
  user: UserProfile | null; // Current user data
  isLoading: boolean; // Loading state for auth operations
  isAuthenticated: boolean; // Whether user is logged in
  error: string | null; // Error message if auth fails
  isProfileComplete: boolean; // Whether user's profile is complete
}
```

### Auth Actions

```typescript
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER_DATA'; payload: UserProfile | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PROFILE_COMPLETE'; payload: boolean }
  | { type: 'LOGOUT' };
```

## Profile Completion Requirements

A user profile is considered complete when all of the following fields are present:

- `email`
- `firstName`
- `lastName`
- `username`

## Error Handling Strategy

- Network errors are automatically retried via SWR
- All errors are logged to Sentry with context
- User-friendly error messages are displayed in the UI
- Failed authentication attempts redirect users appropriately

## Performance Considerations

- **SWR caching** prevents redundant requests
- **useCallback/useMemo** prevents unnecessary re-renders
- **Lazy loading** of auth data prevents unnecessary API calls
- **Minimal dependencies** in useEffect hooks

## Files to Reference

- **Core Implementation**: `src/contexts/AuthContext.tsx`, `src/hooks/auth/useAuthData.ts`
- **Usage Examples**: `src/pages/_app.tsx`, `src/pages/profile.tsx`
- **Components**: `src/components/Login/CompleteSignupForm.tsx`
- **API Integration**: `src/utils/auth/api.ts`
- **Error Handling**: `src/utils/auth/errorHandling.ts`, `src/utils/auth/errors.ts`

## Key Benefits

- ✅ **Flexible user experience** - Works for both authenticated and unauthenticated users
- ✅ **Automatic state management** - No manual state synchronization needed
- ✅ **Performance optimized** - Efficient caching and minimal re-renders
- ✅ **Error resilient** - Automatic retries and graceful error handling
- ✅ **Type safe** - Full TypeScript support
- ✅ **Easy to use** - Simple, consistent API
- ✅ **Well documented** - Comprehensive flow documentation for all scenarios
- ✅ **Maintainable** - Clean separation of concerns and functional architecture

## Conclusion

This authentication system provides a robust, user-friendly experience that balances security
requirements with seamless user experience. The comprehensive flow documentation ensures that
developers can easily understand and work with the authentication system, while the simplified
architecture makes it maintainable and extensible for future needs.

The system successfully handles all authentication scenarios:

- **Unauthenticated browsing** without interruptions
- **Seamless profile completion** for new users
- **Automatic state synchronization** between components
- **Graceful error recovery** with user-friendly feedback
- **Performance optimization** through efficient caching

All flows are thoroughly documented with clear diagrams and explanations, making the system
transparent and easy to understand for both current and future developers.
