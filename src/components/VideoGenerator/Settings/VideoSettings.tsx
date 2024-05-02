import { useContext } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import { validateVerseRange } from '../../../utils/videoGenerator/utils';
import RenderControls from '../RenderControls';
import styles from '../video.module.scss';

import AlignmentsSettings from './AlignmentsSettings';
import BackgroundVideos from './BackgroundVideos';
import OrientationSettings from './OrientationSettings';
import QuranFontSettings from './QuranFontSettings';
import ReciterSettings from './ReciterSettings';
import BackgroundSettings from './TextBackgroundSettings';
import TranslationSettingsSection from './TranslationSectionSetting';

import Section from '@/components/Navbar/SettingsDrawer/Section';
import DataContext from '@/contexts/DataContext';
import Button, { ButtonVariant } from '@/dls/Button/Button';
import Input from '@/dls/Forms/Input';
import Select from '@/dls/Forms/Select';
import IconSearch from '@/icons/search.svg';
import layoutStyle from '@/pages/index.module.scss';
import Reciter from '@/types/Reciter';
import { getChapterData } from '@/utils/chapter';

type Props = {
  chaptersList: any[];
  chapter: number;
  onChapterChange: (val: any) => void;
  reciters: Reciter[];
  seekToBeginning: () => void;
  getCurrentFrame: () => void;
  shouldSearchFetch: boolean;
  setShouldSearchFetch: (val: boolean) => void;
  isFetching: boolean;
  verseFrom: string;
  setVerseFrom: (val: string) => void;
  verseTo: string;
  setVerseTo: (val: string) => void;
  inputProps: any;
};

const VideoSettings: React.FC<Props> = ({
  chaptersList,
  chapter,
  onChapterChange,
  reciters,
  seekToBeginning,
  shouldSearchFetch,
  setShouldSearchFetch,
  isFetching,
  verseFrom,
  setVerseFrom,
  verseTo,
  setVerseTo,
  inputProps,
  getCurrentFrame,
}) => {
  const { t } = useTranslation('quran-media-maker');
  const chaptersData = useContext(DataContext);

  const onSubmitSearchQuery = () => {
    const { versesCount } = getChapterData(chaptersData, String(chapter));
    const isValid = validateVerseRange(Number(verseFrom), Number(verseTo), versesCount);
    if (!isValid) {
      throw new Error('Invalid verse range');
    }
    setShouldSearchFetch(!shouldSearchFetch);
  };

  return (
    <>
      <RenderControls getCurrentFrame={getCurrentFrame} inputProps={inputProps} />
      <div
        className={classNames(
          layoutStyle.flowItem,
          layoutStyle.fullWidth,
          styles.settingsContainer,
        )}
      >
        <div>
          <Section>
            <Section.Title>{t('common:surah')}</Section.Title>
            <Section.Row>
              <Section.Label>{t('common:sidebar.search-surah')}</Section.Label>
              <Select
                id="quranFontStyles"
                name="quranFontStyles"
                options={chaptersList || []}
                value={String(chapter)}
                onChange={onChapterChange}
              />
            </Section.Row>
            <Section.Label>
              <span className={styles.versesLabel}>{t('common:verses')}</span>
            </Section.Label>
            <Section.Row>
              <div className={styles.verseRangeContainer}>
                <Input
                  id="video-gen-verseKey"
                  value={verseFrom}
                  onChange={(val) => setVerseFrom(val)}
                  placeholder={t('from')}
                  fixedWidth={false}
                />
                <Input
                  id="video-gen-verseKey"
                  value={verseTo}
                  onChange={(val) => setVerseTo(val)}
                  placeholder={t('to')}
                  fixedWidth={false}
                />
                <Button
                  tooltip={t('search')}
                  variant={ButtonVariant.Ghost}
                  onClick={onSubmitSearchQuery}
                  isDisabled={isFetching}
                >
                  <IconSearch />
                </Button>
              </div>
            </Section.Row>
          </Section>
          <ReciterSettings reciters={reciters} />
          <QuranFontSettings />
          <TranslationSettingsSection />
        </div>
        <div>
          <Section>
            <Section.Title>{t('video-picker')}</Section.Title>
            <Section.Row>
              <BackgroundVideos seekToBeginning={seekToBeginning} />
            </Section.Row>
          </Section>
        </div>
        <div>
          <OrientationSettings />
        </div>
        <div>
          <AlignmentsSettings />
        </div>
        <div>
          <BackgroundSettings />
        </div>
      </div>
    </>
  );
};

export default VideoSettings;
