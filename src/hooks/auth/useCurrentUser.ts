import { useAuthData } from './useAuthData';

/**
 * @deprecated Use useAuthData instead. This hook is maintained for backward compatibility.
 * @returns {object} - Object containing user data, loading state, error, and authentication status
 */
const useCurrentUser = () => {
  const { userData, isLoading, userDataError, isAuthenticated } = useAuthData();

  return {
    user: userData || ({} as typeof userData),
    isLoading,
    error: userDataError,
    isUserLoggedIn: isAuthenticated,
  };
};

export default useCurrentUser;
