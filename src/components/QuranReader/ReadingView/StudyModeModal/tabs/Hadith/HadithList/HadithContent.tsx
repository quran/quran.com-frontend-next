import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './HadithContent.module.scss';

import replaceBreaksWithSpans from '@/components/QuranReader/ReadingView/StudyModeModal/tabs/Hadith/utility';
import Language from '@/types/Language';

type HadithContentProps = {
  enBody?: string;
  arBody?: string;
};

const HadithContent: React.FC<HadithContentProps> = ({ enBody, arBody }) => {
  const { lang, t } = useTranslation('common');
  const [showArabic, setShowArabic] = useState(false);

  const isArabicLanguage = lang === Language.AR;
  const shouldShowToggle = !isArabicLanguage && arBody;

  const handleToggle = () => setShowArabic((prev) => !prev);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {Language.AR !== lang && enBody && (
          <div
            className={styles.hadithBody}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: replaceBreaksWithSpans(enBody.toString()),
            }}
          />
        )}

        {arBody && (isArabicLanguage || showArabic) && (
          <div
            data-lang="ar"
            dir="rtl"
            className={styles.hadithBody}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: replaceBreaksWithSpans(arBody.toString()),
            }}
          />
        )}
      </div>

      {shouldShowToggle && (
        <button
          type="button"
          onClick={handleToggle}
          className={styles.toggleButton}
          aria-expanded={showArabic}
        >
          {showArabic ? t('hide-arabic') : t('show-arabic')}
        </button>
      )}
    </div>
  );
};

export default HadithContent;
