/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
import { useCallback, useMemo, useState } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';

import styles from '../MediaMaker.module.scss';
import RenderControls from '../RenderControls';

import AudioTab from './AudioTab';
import BackgroundTab from './BackgroundTab';
import ColorsTab from './ColorsTab';
import ResetModal from './ResetModal';
import TextTab from './TextTab';

import Switch, { SwitchSize } from '@/dls/Switch/Switch';
import useRemoveQueryParam from '@/hooks/useRemoveQueryParam';
import ColorIconSuccess from '@/icons/colors-success.svg';
import ColorIcon from '@/icons/colors.svg';
import AudioIconSuccess from '@/icons/headphones-success.svg';
import AudioIcon from '@/icons/headphones.svg';
import ImageIconSuccess from '@/icons/photo-success.svg';
import ImageIcon from '@/icons/photo.svg';
import TextIconSuccess from '@/icons/text-success.svg';
import TextIcon from '@/icons/text.svg';
import layoutStyle from '@/pages/index.module.scss';
import { resetToDefaults, updateSettings } from '@/redux/slices/mediaMaker';
import MediaSettings, { ChangedSettings } from '@/types/Media/MediaSettings';
import QueryParam from '@/types/QueryParam';
import Reciter from '@/types/Reciter';
import { logButtonClick, logEvent, logValueChange } from '@/utils/eventLogger';

type Props = {
  chaptersList: any[];
  reciters: Reciter[];
  seekToBeginning: () => void;
  getCurrentFrame: () => void;
  isFetching: boolean;
  inputProps: any;
  mediaSettings: MediaSettings;
};

const MEDIA_SETTINGS_TO_QUERY_PARAM = {
  verseTo: QueryParam.VERSE_TO,
  verseFrom: QueryParam.VERSE_FROM,
  backgroundColor: QueryParam.BACKGROUND_COLOR,
  opacity: QueryParam.OPACITY,
  borderColor: QueryParam.BORDER_COLOR,
  borderSize: QueryParam.BORDER_SIZE,
  reciter: QueryParam.MEDIA_RECITER,
  quranTextFontScale: QueryParam.QURAN_TEXT_FONT_SCALE,
  quranTextFontStyle: QueryParam.QURAN_TEXT_FONT_STYLE,
  translationFontScale: QueryParam.TRANSLATION_FONT_SCALE,
  translations: QueryParam.MEDIA_TRANSLATIONS,
  fontColor: QueryParam.FONT_COLOR,
  translationAlignment: QueryParam.TRANSLATION_ALIGNMENT,
  orientation: QueryParam.ORIENTATION,
  videoId: QueryParam.VIDEO_ID,
  surah: QueryParam.SURAH,
} as Record<keyof MediaSettings, QueryParam>;

enum Tab {
  AUDIO = 'audio',
  BACKGROUND = 'background',
  TEXT = 'text',
  COLORS = 'colors',
}

const VideoSettings: React.FC<Props> = ({
  chaptersList,
  reciters,
  seekToBeginning,
  isFetching,
  inputProps,
  getCurrentFrame,
  mediaSettings,
}) => {
  const [selectedTab, setSelectedTab] = useState<Tab>(Tab.AUDIO);
  const dispatch = useDispatch();
  const router = useRouter();
  const removeQueryParam = useRemoveQueryParam();

  const onResetSettingsClick = useCallback(() => {
    logButtonClick('media_settings_reset');
    seekToBeginning();
    dispatch(resetToDefaults());
    removeQueryParam(Object.values(QueryParam));
  }, [dispatch, removeQueryParam, seekToBeginning]);

  const onSettingsUpdate = useCallback(
    (settings: ChangedSettings, key?: keyof MediaSettings, value?: any) => {
      if (key) {
        logValueChange(`media_settings_${key}`, mediaSettings[key], value);
      }
      seekToBeginning();
      dispatch(updateSettings(settings));
      Object.keys(settings).forEach((settingKey) => {
        const toBeUpdatedQueryParamName =
          MEDIA_SETTINGS_TO_QUERY_PARAM[settingKey as keyof MediaSettings];
        const toBeUpdatedQueryParamValue = settings[settingKey];
        router.query[toBeUpdatedQueryParamName] =
          toBeUpdatedQueryParamName === QueryParam.MEDIA_TRANSLATIONS
            ? toBeUpdatedQueryParamValue.join(',')
            : toBeUpdatedQueryParamValue;
      });
      router.push(router, undefined, { shallow: true });
    },
    [dispatch, mediaSettings, router, seekToBeginning],
  );

  const onTabChange = (value: Tab) => {
    logEvent('video_generation_tab_change', { tab: value });
    setSelectedTab(value);
  };

  const tabs = useMemo(
    () => [
      {
        name: selectedTab === Tab.AUDIO ? <AudioIconSuccess /> : <AudioIcon />,
        value: Tab.AUDIO,
      },
      {
        name: selectedTab === Tab.BACKGROUND ? <ImageIconSuccess /> : <ImageIcon />,
        value: Tab.BACKGROUND,
      },
      {
        name: selectedTab === Tab.TEXT ? <TextIconSuccess /> : <TextIcon />,
        value: Tab.TEXT,
      },
      {
        name: selectedTab === Tab.COLORS ? <ColorIconSuccess /> : <ColorIcon />,
        value: Tab.COLORS,
      },
    ],
    [selectedTab],
  );

  const tabComponents = useMemo(
    () => ({
      [Tab.AUDIO]: (
        <AudioTab
          mediaSettings={mediaSettings}
          onSettingsUpdate={onSettingsUpdate}
          chaptersList={chaptersList}
          isFetching={isFetching}
          reciters={reciters}
        />
      ),
      [Tab.BACKGROUND]: (
        <BackgroundTab mediaSettings={mediaSettings} onSettingsUpdate={onSettingsUpdate} />
      ),
      [Tab.TEXT]: <TextTab mediaSettings={mediaSettings} onSettingsUpdate={onSettingsUpdate} />,
      [Tab.COLORS]: <ColorsTab mediaSettings={mediaSettings} onSettingsUpdate={onSettingsUpdate} />,
    }),
    [chaptersList, isFetching, mediaSettings, onSettingsUpdate, reciters],
  );

  return (
    <>
      <div
        className={classNames(layoutStyle.flowItem, layoutStyle.fullWidth, styles.mainContainer)}
      >
        <div className={styles.settingsContainer}>
          <div className={styles.switchContainer}>
            <div className={styles.switch}>
              <Switch
                size={SwitchSize.Small}
                selected={selectedTab}
                items={tabs}
                onSelect={onTabChange}
              />
            </div>
            <ResetModal onConfirm={onResetSettingsClick} />
          </div>
          <div className={styles.settings}>{tabComponents[selectedTab]}</div>
        </div>
      </div>

      <RenderControls
        isFetching={isFetching}
        getCurrentFrame={getCurrentFrame}
        inputProps={inputProps}
      />
    </>
  );
};

export default VideoSettings;
