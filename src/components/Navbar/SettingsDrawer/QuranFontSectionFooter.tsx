import React from 'react';

import Link from 'next/link';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import Section from './Section';

import { isQCFFont, quranFontToVersion, QCFFontVersion } from '@/utils/fontFaceHelper';
import { QuranFont } from 'types/QuranReader';

interface Props {
  quranFont: QuranFont;
}

const QuranFontSectionFooter: React.FC<Props> = ({ quranFont }) => {
  const { t } = useTranslation('common');
  return (
    <Section.Footer visible={isQCFFont(quranFont)}>
      {quranFontToVersion(quranFont) === QCFFontVersion.V4
        ? t('fonts.qcf-v4-desc')
        : t('fonts.qcf-desc')}
    </Section.Footer>
  );
};

export default QuranFontSectionFooter;
