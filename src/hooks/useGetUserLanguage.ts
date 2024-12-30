import { useEffect, useState } from 'react';

const useGetUserLanguage = () => {
  const [userLanguage, setUserLanguage] = useState('');

  useEffect(() => {
    if (navigator.language || navigator.userLanguage) {
      const language = navigator.language || navigator.userLanguage;
      setUserLanguage(language);
    }
  }, []);

  return { userLanguage };
};
export default useGetUserLanguage;
