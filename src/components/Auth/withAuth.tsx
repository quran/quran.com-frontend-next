import RedirectToLoginPage from './RedirectToLoginPage';

import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import useAuthData from '@/hooks/auth/useAuthData';
import useHasMounted from '@/hooks/useHasMounted';
/**
 * withAuth is a Higher-Order Component (HOC) that wraps a component and checks if the user is authenticated.
 * If the user is authenticated, it renders the wrapped component.
 * If the user is not authenticated, it redirects the user to the login page.
 *
 * @param {React.ComponentType<P>} WrappedComponent - The component to wrap and protect with authentication check.
 *
 * @returns {React.FC<P>} If the user is authenticated, returns the WrappedComponent.
 * If not, returns RedirectToLoginPage component.
 *
 * @example
 * const ProtectedComponent = withAuth(MyComponent);
 */
const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>): React.FC<P> => {
  const WithAuth = (props: P) => {
    const { isAuthenticated, isLoading } = useAuthData();
    const hasMounted = useHasMounted();

    // Avoid redirect while auth state is initializing/loading
    if (!hasMounted || isLoading) {
      return <Spinner size={SpinnerSize.Small} />;
    }

    if (isAuthenticated) {
      return <WrappedComponent {...props} />;
    }
    return <RedirectToLoginPage />;
  };

  WithAuth.displayName = `WithAuth(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithAuth;
};

export default withAuth;
