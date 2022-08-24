import { useEffect, useRef, useState } from 'react';

import Cookies from 'js-cookie';
import { useRouter } from 'next/router';

import { refreshToken } from 'src/utils/auth/api';
import { ACCESS_TOKEN_EXPIRATION_COOKIE_NAME } from 'src/utils/auth/constants';
import { isLoggedIn } from 'src/utils/auth/login';
import { milliSecondsToSeconds } from 'src/utils/datetime';

const PRE_EXPIRY_REFRESH_WINDOW_SECONDS = 20;

/**
 * Calculate how many seconds until we need to refresh
 * the access token. If the expiration date has passed,
 * we should refresh it immediately.
 *
 * @param {number} accessTokenExpiration
 * @returns {number}
 */
const getRefreshTokenAfterSeconds = (accessTokenExpiration: number): number => {
  const currentTimeInSeconds = milliSecondsToSeconds(new Date().getTime());
  const timeToExpire = accessTokenExpiration - currentTimeInSeconds;
  return timeToExpire <= PRE_EXPIRY_REFRESH_WINDOW_SECONDS ? 0 : timeToExpire;
};

/**
 * A hook that refreshes the access token.
 */
const useRefreshToken = () => {
  const refreshTokenTimer = useRef(null);
  const [accessTokenExpiration, setAccessTokenExpiration] = useState<number | undefined>(() => {
    const accessTokenExpirationCookie = Cookies.get(ACCESS_TOKEN_EXPIRATION_COOKIE_NAME);
    return accessTokenExpirationCookie ? Number(accessTokenExpirationCookie) : undefined;
  });
  const router = useRouter();
  useEffect(() => {
    if (isLoggedIn()) {
      // if we have the access token expiration in the cookies
      if (accessTokenExpiration) {
        clearTimeout(refreshTokenTimer.current);
        const refreshTokenAfterSeconds = getRefreshTokenAfterSeconds(accessTokenExpiration);
        refreshTokenTimer.current = setTimeout(() => {
          refreshToken()
            .then(({ exp }) => {
              setAccessTokenExpiration(exp);
            })
            .catch(() => {
              router.replace('/login');
            });
        }, refreshTokenAfterSeconds * 1000);
      } else {
        // legacy users that are already logged in but don't have the access token expiration cookie
        refreshToken()
          .then(({ exp }) => {
            setAccessTokenExpiration(exp);
          })
          .catch(() => {
            setAccessTokenExpiration(undefined);
            router.replace('/login');
          });
      }
    }
    return () => clearTimeout(refreshTokenTimer.current);
  }, [accessTokenExpiration, router]);
};

export default useRefreshToken;
