import React, { useEffect } from 'react';

import { useRouter } from 'next/router';

import { getLoginNavigationUrl } from '@/utils/navigation';

const RedirectToLoginPage = () => {
  const router = useRouter();
  useEffect(() => {
    const { asPath } = router;
    router.replace(getLoginNavigationUrl(asPath));
  }, [router]);

  return <></>;
};

export default RedirectToLoginPage;
