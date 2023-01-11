import { useRouter } from 'next/router';

const useSetLanguage = () => {
  const router = useRouter();

  const setLanguage = (language: string) => {
    const { pathname, asPath, query } = router;
    router.push({ pathname, query }, asPath, { locale: language });
  };

  return setLanguage;
};

export default useSetLanguage;
