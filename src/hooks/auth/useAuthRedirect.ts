import { useRouter } from 'next/router';

import QueryParam from '@/types/QueryParam';
import { SSO_ENABLED } from '@/utils/auth/constants';
import { ROUTES } from '@/utils/navigation';

interface UseAuthRedirectReturn {
  redirectWithToken: (redirect: string, token: string) => void;
}

const useAuthRedirect = (): UseAuthRedirectReturn => {
  const router = useRouter();

  const redirectWithToken = (redirect: string, token: string) => {
    if (token && SSO_ENABLED) {
      router.replace(
        `${ROUTES.AUTH}?${[QueryParam.TOKEN]}=${token}&${[QueryParam.REDIRECT_TO]}=${redirect}`,
      );
    } else {
      router.push(redirect);
    }
  };

  return { redirectWithToken };
};

export default useAuthRedirect;
