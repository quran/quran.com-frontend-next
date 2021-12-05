import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonSize, ButtonType } from 'src/components/dls/Button/Button';
import { toLocalizedVerseKey } from 'src/utils/locale';
import { getVerseNavigationUrl } from 'src/utils/navigation';

interface Props {
  verseKey: string;
}

const VerseLink: React.FC<Props> = ({ verseKey }) => {
  const { lang } = useTranslation('');
  return (
    <Button
      size={ButtonSize.Small}
      href={getVerseNavigationUrl(verseKey)}
      type={ButtonType.Secondary}
    >
      {toLocalizedVerseKey(verseKey, lang)}
    </Button>
  );
};

export default VerseLink;
