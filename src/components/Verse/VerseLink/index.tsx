import React, { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonSize, ButtonType } from 'src/components/dls/Button/Button';
import { toLocalizedNumber } from 'src/utils/locale';
import { getVerseNavigationUrl } from 'src/utils/navigation';

interface Props {
  verseKey: string;
}

const VerseLink: React.FC<Props> = ({ verseKey }) => {
  const { lang } = useTranslation('');
  const url = getVerseNavigationUrl(verseKey);
  const localizedVerseKey = useMemo(() => {
    return verseKey
      .split(':')
      .map((value) => toLocalizedNumber(Number(value), lang))
      .join(':');
  }, [lang, verseKey]);
  return (
    <Button size={ButtonSize.Small} href={url} type={ButtonType.Secondary}>
      {localizedVerseKey}
    </Button>
  );
};

export default VerseLink;
