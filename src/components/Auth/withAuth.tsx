import { JSX, useEffect, useState } from 'react';

import RedirectToLoginPage from './RedirectToLoginPage';

import { isLoggedIn } from '@/utils/auth/login';
/**
 * withAuth is a Higher-Order Component (HOC) that wraps a component and checks if the user is authenticated.
 * If the user is authenticated, it renders the wrapped component.
 * If the user is not authenticated, it redirects the user to the login page.
 *
 * @param {React.ComponentType} WrappedComponent - The component to wrap and protect with authentication check.
 *
 * @returns {React.ComponentType} If the user is authenticated, returns the WrappedComponent.
 * If not, returns RedirectToLoginPage component.
 *
 * @example
 * const ProtectedComponent = withAuth(MyComponent);
 */
const withAuth = (WrappedComponent: React.ComponentType): React.ComponentType => {
  const WithAuth = (props: JSX.IntrinsicAttributes) => {
    const [isReady, setIsReady] = useState(false);

    /**
     * we need to wait for the initial render to check if the user is authenticated
     * because when it's server-side rendered, the user is not authenticated yet
     */
    useEffect(() => {
      setIsReady(true);
    }, []);

    if (!isReady) {
      return null; // or return a loading spinner
    }

    return isLoggedIn() ? <WrappedComponent {...props} /> : <RedirectToLoginPage />;
  };

  return WithAuth;
};

export default withAuth;
