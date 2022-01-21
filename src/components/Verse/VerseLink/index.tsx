import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import { logButtonClick } from 'src/utils/eventLogger';
import { toLocalizedVerseKey } from 'src/utils/locale';
import { getVerseNavigationUrlByVerseKey } from 'src/utils/navigation';

interface Props {
  verseKey: string;
}

const VerseLink: React.FC<Props> = ({ verseKey }) => {
  const { lang } = useTranslation('');
  return (
    <Button
      size={ButtonSize.Small}
      href={getVerseNavigationUrlByVerseKey(verseKey)}
      variant={ButtonVariant.Ghost}
      prefetch={false}
      onClick={() => {
        logButtonClick('translation_view_verse_link');
      }}
    >
      {toLocalizedVerseKey(verseKey, lang)}
    </Button>
  );
};

export default VerseLink;
