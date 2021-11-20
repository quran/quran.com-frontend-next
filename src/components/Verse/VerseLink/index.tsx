import React from 'react';

import Button, { ButtonSize, ButtonType } from 'src/components/dls/Button/Button';
import { getVerseNavigationUrl } from 'src/utils/navigation';

interface Props {
  verseKey: string;
}

const VerseLink: React.FC<Props> = ({ verseKey }) => {
  const url = getVerseNavigationUrl(verseKey);
  return (
    <Button size={ButtonSize.Small} href={url} type={ButtonType.Secondary}>
      {verseKey}
    </Button>
  );
};

export default VerseLink;
