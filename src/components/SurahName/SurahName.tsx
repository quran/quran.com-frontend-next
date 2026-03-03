import React, { useEffect, useState } from 'react';

import { chapterIdToSurahCharacter, getSurahFontFamily } from '@/utils/surah';
import { loadSurahFont } from '@/utils/surah-font';

export interface SurahNameProps extends React.ComponentProps<'span'> {
  chapterId: number;
}

const SurahName: React.FC<SurahNameProps> = ({ chapterId, style, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadSurahFont(chapterId).then(() => setIsLoaded(true));
  }, [chapterId]);

  const character = chapterIdToSurahCharacter(chapterId);
  const fontFamily = getSurahFontFamily(chapterId);

  return (
    <span
      {...props}
      translate="no"
      style={{
        fontFamily: `'${fontFamily}', sans-serif`,
        color: isLoaded ? undefined : 'transparent',
        lineHeight: 0.6,
        display: 'block',
        ...style,
      }}
    >
      {character}
    </span>
  );
};

export default SurahName;
