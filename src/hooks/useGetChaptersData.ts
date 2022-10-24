import { useState, useEffect } from 'react';

import { getAllChaptersData } from '@/utils/chapter';
import ChaptersData from 'types/ChaptersData';

const useGetChaptersData = (lang: string): ChaptersData => {
  const [chaptersData, setChaptersData] = useState<ChaptersData>(null);
  useEffect(() => {
    (async () => {
      setChaptersData(await getAllChaptersData(lang));
    })();
  }, [lang]);

  return chaptersData;
};

export default useGetChaptersData;
