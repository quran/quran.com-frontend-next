import { useRouter } from 'next/router';

import { getDir } from 'src/utils/locale';

const useDirection = (): string => {
  const { locale } = useRouter();
  return getDir(locale);
};

export default useDirection;
