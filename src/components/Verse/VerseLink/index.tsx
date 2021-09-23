import React from 'react';

import Button, { ButtonType } from 'src/components/dls/Button/Button';
import { getVerseNavigationUrl } from 'src/utils/navigation';

interface Props {
  verseKey: string;
}

const VerseLink: React.FC<Props> = ({ verseKey }) => {
  const url = getVerseNavigationUrl(verseKey);
  return (
    <Button href={url} type={ButtonType.Secondary}>
      {verseKey}
    </Button>
  );
};

export default VerseLink;
