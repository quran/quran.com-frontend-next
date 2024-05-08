/* eslint-disable max-lines */
import { useCallback, useContext, useMemo, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import styles from '../MediaMaker.module.scss';
import RenderControls from '../RenderControls';

import AlignmentsSettings from './AlignmentsSettings';
import BackgroundVideos from './BackgroundVideos';
import OrientationSettings from './OrientationSettings';
import QuranFontSettings from './QuranFontSettings';
import ReciterSettings from './ReciterSettings';
import BackgroundSettings from './TextBackgroundSettings';
import TranslationSettingsSection from './TranslationSectionSetting';

import Section from '@/components/Navbar/SettingsDrawer/Section';
import { RangeSelectorType } from '@/components/Verse/AdvancedCopy/SelectorContainer';
import validateRangeSelection from '@/components/Verse/AdvancedCopy/utils/validateRangeSelection';
import VersesRangeSelector from '@/components/Verse/AdvancedCopy/VersesRangeSelector';
import DataContext from '@/contexts/DataContext';
import Select from '@/dls/Forms/Select';
import layoutStyle from '@/pages/index.module.scss';
import { updateSettings } from '@/redux/slices/mediaMaker';
import MediaSettings from '@/types/Media/MediaSettings';
import Reciter from '@/types/Reciter';
import { toLocalizedVerseKey } from '@/utils/locale';
import { generateChapterVersesKeys } from '@/utils/verse';

type Props = {
  chaptersList: any[];
  onChapterChange: (val: any) => void;
  reciters: Reciter[];
  seekToBeginning: () => void;
  getCurrentFrame: () => void;
  isFetching: boolean;
  inputProps: any;
  mediaSettings: MediaSettings;
};

const VideoSettings: React.FC<Props> = ({
  chaptersList,
  onChapterChange,
  reciters,
  seekToBeginning,
  isFetching,
  inputProps,
  getCurrentFrame,
  mediaSettings,
}) => {
  const { lang, t } = useTranslation('quran-media-maker');
  const chaptersData = useContext(DataContext);
  const [rangesError, setRangesError] = useState(null);
  const dispatch = useDispatch();
  const { verseFrom, verseTo, surah } = mediaSettings;

  const onSettingsUpdate = useCallback(
    (settings: Record<string, any>) => {
      seekToBeginning();
      dispatch(updateSettings(settings));
    },
    [dispatch, seekToBeginning],
  );

  const verseKeys = useMemo(() => {
    return generateChapterVersesKeys(chaptersData, String(surah)).map((verseKey) => ({
      id: verseKey,
      name: verseKey,
      value: verseKey,
      label: toLocalizedVerseKey(verseKey, lang),
    }));
  }, [chaptersData, lang, surah]);

  const onVerseRangeChange = useCallback(
    (newSelectedVerseKey: string, verseSelectorId: RangeSelectorType) => {
      setRangesError(null);
      const isVerseKeyStartOfRange = verseSelectorId === RangeSelectorType.START;
      const startVerseKey = isVerseKeyStartOfRange ? newSelectedVerseKey : verseFrom;
      const endVerseKey = !isVerseKeyStartOfRange ? newSelectedVerseKey : verseTo;
      const validationError = validateRangeSelection(startVerseKey, endVerseKey, t);
      if (validationError) {
        setRangesError(validationError);
        return;
      }
      if (isVerseKeyStartOfRange) {
        dispatch(updateSettings({ verseFrom: newSelectedVerseKey }));
      } else {
        dispatch(updateSettings({ verseTo: newSelectedVerseKey }));
      }
    },
    [dispatch, t, verseFrom, verseTo],
  );

  return (
    <>
      <RenderControls
        isFetching={isFetching}
        getCurrentFrame={getCurrentFrame}
        inputProps={inputProps}
      />
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
                value={String(surah)}
                onChange={onChapterChange}
                disabled={isFetching}
              />
            </Section.Row>
            <Section.Label>
              <span className={styles.versesLabel}>{t('common:verses')}</span>
            </Section.Label>
            <Section.Row>
              <Section.Row>
                <VersesRangeSelector
                  dropdownItems={verseKeys}
                  rangeStartVerse={verseFrom}
                  rangeEndVerse={verseTo}
                  onChange={onVerseRangeChange}
                  isVisible
                  isDisabled={isFetching}
                />
              </Section.Row>
            </Section.Row>
            {rangesError && <div className={styles.error}>{rangesError}</div>}
          </Section>
          <ReciterSettings
            reciter={mediaSettings.reciter}
            onSettingsUpdate={onSettingsUpdate}
            reciters={reciters}
          />
          <QuranFontSettings
            quranTextFontScale={mediaSettings.quranTextFontScale}
            fontColor={mediaSettings.fontColor}
            onSettingsUpdate={onSettingsUpdate}
          />
          <TranslationSettingsSection
            translations={mediaSettings.translations}
            translationFontScale={mediaSettings.translationFontScale}
            onSettingsUpdate={onSettingsUpdate}
          />
        </div>
        <div>
          <Section>
            <Section.Title>{t('video-picker')}</Section.Title>
            <Section.Row>
              <BackgroundVideos
                videoId={mediaSettings.videoId}
                onSettingsUpdate={onSettingsUpdate}
              />
            </Section.Row>
          </Section>
        </div>
        <div>
          <OrientationSettings
            orientation={mediaSettings.orientation}
            onSettingsUpdate={onSettingsUpdate}
          />
        </div>
        <div>
          <AlignmentsSettings
            verseAlignment={mediaSettings.verseAlignment}
            translationAlignment={mediaSettings.translationAlignment}
            onSettingsUpdate={onSettingsUpdate}
          />
        </div>
        <div>
          <BackgroundSettings
            shouldHaveBorder={mediaSettings.shouldHaveBorder}
            opacity={mediaSettings.opacity}
            onSettingsUpdate={onSettingsUpdate}
          />
        </div>
      </div>
    </>
  );
};

export default VideoSettings;
