import RedirectToLoginPage from './RedirectToLoginPage';

import { isLoggedIn } from '@/utils/auth/login';

// This HOC is used to check if the user is logged in or not.
const withAuth = (WrappedComponent) => {
  const WithAuth = (props) => {
    return isLoggedIn() ? <WrappedComponent {...props} /> : <RedirectToLoginPage />;
  };

  return WithAuth;
};

export default withAuth;
