import { useEffect, useState } from 'react';

const useGetUserLanguage = () => {
  const [userLanguage, setUserLanguage] = useState('');

  useEffect(() => {
    const language = navigator.language || navigator.userLanguage;
    setUserLanguage(language);
  }, []);

  return { userLanguage };
};
export default useGetUserLanguage;
