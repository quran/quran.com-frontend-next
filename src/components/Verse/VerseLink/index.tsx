import React from 'react';

import Button, { ButtonType } from 'src/components/dls/Button/Button';
import {
  getFromVerseToEndOfChapterNavigationUrl,
  getVerseNavigationUrl,
} from 'src/utils/navigation';

interface Props {
  verseKey: string;
  isRange?: boolean;
}

const VerseLink: React.FC<Props> = ({ verseKey, isRange = false }) => {
  const url = isRange
    ? getFromVerseToEndOfChapterNavigationUrl(verseKey)
    : getVerseNavigationUrl(verseKey);
  return (
    <Button href={url} type={ButtonType.Secondary}>
      {verseKey}
    </Button>
  );
};

export default VerseLink;
