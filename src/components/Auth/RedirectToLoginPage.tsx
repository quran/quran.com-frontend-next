import React, { useEffect } from 'react';

import { useRouter } from 'next/router';

import { getLoginNavigationUrl } from '@/utils/navigation';

const RedirectToLoginPage = () => {
  const router = useRouter();
  useEffect(() => {
    router.replace(getLoginNavigationUrl());
  }, [router]);

  return <></>;
};

export default RedirectToLoginPage;
