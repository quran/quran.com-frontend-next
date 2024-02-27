
import { NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import Error from '@/pages/_error';
import layoutStyle from '../index.module.scss';
import styles from './video.module.scss';

import { getJuzNavigationUrl } from '@/utils/navigation';
import classNames from 'classnames';

import { VersesResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';
import QuranFontSection from './QuranFontSectionSetting';
import ReciterSectionSetting from './ReciterSectionSetting';

interface VideoGenerator {
  juzVerses?: VersesResponse;
  hasError?: boolean;
  chaptersData: ChaptersData;
}

const VideoGenerator: NextPage<VideoGenerator> = ({ hasError, juzVerses }) => {
  const { t, lang } = useTranslation('common');
  const {
    query: { juzId },
  } = useRouter();
  if (hasError) {
    return <Error statusCode={500} />;
  }

  const path = getJuzNavigationUrl(Number(juzId));
  return (
    <>
      {/* <NextSeoWrapper
        title={`${t('juz')} ${toLocalizedNumber(Number(juzId), lang)}`}
        description={getPageOrJuzMetaDescription(juzVerses)}
        canonical={getCanonicalUrl(lang, path)}
        languageAlternates={getLanguageAlternates(path)}
      /> */}
      <div className={styles.pageContainer}>
        <div className={layoutStyle.flow}>
          <div className={classNames(layoutStyle.flowItem, layoutStyle.fullWidth, styles.settingsContainer)}>
            <div>
              <QuranFontSection />
            </div>
            <div>
              <ReciterSectionSetting />
            </div>
            <div>
              <QuranFontSection />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoGenerator;