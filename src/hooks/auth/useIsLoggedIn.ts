import { useEffect, useState } from 'react';

import { isLoggedIn as isLoggedInCookie } from '@/utils/auth/login';

const ONE_SECOND = 1000;
const useIsLoggedIn = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => isLoggedInCookie());

  const checkIsLoggedIn = () => {
    setIsLoggedIn(!!isLoggedInCookie());
  };

  useEffect(() => {
    checkIsLoggedIn();
    const intervalId = setInterval(checkIsLoggedIn, ONE_SECOND);
    window.addEventListener('storage', checkIsLoggedIn);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', checkIsLoggedIn);
    };
  }, []);

  return { isLoggedIn };
};

export default useIsLoggedIn;
