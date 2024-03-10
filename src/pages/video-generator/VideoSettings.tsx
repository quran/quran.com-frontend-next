import useTranslation from "next-translate/useTranslation";

import Section from "@/components/Navbar/SettingsDrawer/Section";
import Select from "@/dls/Forms/Select";
import layoutStyle from "../index.module.scss";
import classNames from "classnames";
import styles from "./video.module.scss";
import QuranFontSection from "./QuranFontSectionSetting";
import TranslationSetting from "./TranslationSectionSetting";
import IconSearch from '@/icons/search.svg';
import Switch from "@/dls/Switch/Switch";
import { getAllBackgrounds, validateVerseRange } from "./VideoUtils";
import BackgroundColors from "./BackgroundColors";
import { useContext, useState } from "react";
import Input from "@/dls/Forms/Input";
import BackgroundVideos from "./BackgroundVideos";
import DataContext from "@/contexts/DataContext";
import { getChapterData } from "@/utils/chapter";
import Button, { ButtonVariant } from "@/dls/Button/Button";

const backgroundColors = getAllBackgrounds();

const VideoSettings = ({ 
    chaptersList,
    chapter,
    onChapterChange,
    recitersOptions,
    reciter,
    setReciter,
    setSceneBackgroundColor,
    verseBackgroundColor,
    setVerseBackgroundColor,
    fontColor,
    setFontColor,
    selectedTranslations,
    setSelectedTranslations,
    verseAlignment,
    setVerseAlignment,
    translationAlignment,
    setTranslationAlignment,
    opacity,
    setOpacity,
    border,
    setBorder,
    dimensions,
    setDimensions,
    setVideo,
    seekToBeginning,
    searchFetch,
    setSearchFetch,
    isFetching,
    verseFrom,
    setVerseFrom,
    verseTo,
    setVerseTo
  }) => {
  const { t } = useTranslation("common");
  const [backgroundType, setBackgroundType] = useState('verse');

  const chaptersData = useContext(DataContext);

  const onSubmitSearchQuery = () => {
    const versesCount = getChapterData(chaptersData, chapter).versesCount;
    const isValid = validateVerseRange(verseFrom, verseTo, versesCount);
    if (!isValid) {
      throw new Error('Invalid verse range');
    }
    setSearchFetch(!searchFetch)
  }

  return (
    <div
      className={classNames(
        layoutStyle.flowItem,
        layoutStyle.fullWidth,
        styles.settingsContainer
      )}
    >
      <div>
        <Section>
          <Section.Title>{t("surah")}</Section.Title>
          <Section.Row>
            <Section.Label>{t("sidebar.search-surah")}</Section.Label>
            <Select
              id="quranFontStyles"
              name="quranFontStyles"
              options={chaptersList || []}
              value={chapter}
              onChange={onChapterChange}
            />
          </Section.Row>
          <Section.Label>
            <span className={styles.versesLabel}>{t('verses')}</span>
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
      </div>
      <div>
        <Section>
          <Section.Title>{t("reciter")}</Section.Title>
          <Section.Row>
            <Section.Label>{t("audio.select-reciter")}</Section.Label>
            <Select
              id="quranFontStyles"
              name="quranFontStyles"
              options={recitersOptions || []}
              value={reciter}
              onChange={setReciter}
            />
          </Section.Row>
        </Section>
      </div>
      <div>
        <Section>
          <Section.Title>Colors</Section.Title>
          <Section.Row>
            <Section.Label>Font color</Section.Label>
            <input
              className={styles.colorPicker}
              type="color"
              value={fontColor}
              onChange={(e) => {seekToBeginning(); setFontColor(e.target.value)}}
            />
          </Section.Row>
        </Section>
      </div>
      <div>
        <QuranFontSection />
      </div>
      <div>
          <TranslationSetting
            selectedTranslation={selectedTranslations}
            setSelectedTranslation={setSelectedTranslations}
          />
      </div>


      <div>
        <Section>
          <Section.Title>Text alignment</Section.Title>
          {/* TODO: Add localization to labels */}
          <Section.Title>Verse</Section.Title>
          <Section.Row>
            <Switch  items={[{name: 'Centre', value: 'centre'}, { name: 'Justified', value: 'justified'}]} selected={verseAlignment} onSelect={(val) => {seekToBeginning(); setVerseAlignment(val)}} />
          </Section.Row>
          <br />
          <Section.Title>Translation</Section.Title>
          <Section.Row>
            <Switch items={[{name: 'Centre', value: 'centre'}, { name: 'Justified', value: 'justified'}]} selected={translationAlignment} onSelect={(val) => {seekToBeginning();  setTranslationAlignment(val)}} />
          </Section.Row>
        </Section>
      </div>
      <div>
        <Section>
          <Section.Title>Backrgound</Section.Title>
          <Section.Row>
            <Switch  items={[{name: 'Verse', value: 'verse'}, { name: 'Background', value: 'scene'}]} selected={backgroundType} onSelect={(val) => setBackgroundType(val)} />
          </Section.Row>
          <Section.Row>
            <BackgroundColors opacity={opacity} type={backgroundType} setSceneBackground={setSceneBackgroundColor} seekToBeginning={seekToBeginning} setVerseBackground={setVerseBackgroundColor} colors={backgroundColors} />
          </Section.Row>
          <br />
          {backgroundType === 'verse' ? (
            <>
              <Section.Label>Opacity</Section.Label>
              <Section.Row>
                <Switch  items={[{name: '0%', value: '0'}, { name: '20%', value: '0.2'}, { name: '40%', value: '0.4'}, { name: '60%', value: '0.6'}, { name: '80%', value: '0.8'}, { name: '100%', value: '1'}]} selected={opacity} onSelect={(val) => {
                  if (val === opacity) {
                    return;
                  }
                  seekToBeginning(); 
                  setOpacity(val)
                  const verse = verseBackgroundColor;
                  const backgroundColors = getAllBackgrounds(val);
                  const correctBg1 = backgroundColors.find(color => color.id === verse.id);
                  setVerseBackgroundColor(correctBg1);
                }} />
              </Section.Row>
              <br />
              <Section.Label>Border</Section.Label>
              <Section.Row>
                <Switch  items={[{name: 'Yes', value: 'true'}, { name: 'No', value: 'false'}]} selected={border} onSelect={(val) => {seekToBeginning(); setBorder(val)}} />
              </Section.Row>
            </>
          ) : null}
        </Section>
      </div>
      <div>
        <Section>
          <Section.Title>Orientation</Section.Title>
          <Section.Row>
            <Switch  items={[{name: 'Landscape', value: 'landscape'}, { name: 'Portrait', value: 'portrait'}]} selected={dimensions} onSelect={(val) => { seekToBeginning(); setDimensions(val)}} />
          </Section.Row>
          <Section.Row>
            <div className={styles.orientationWrapper}>
              <div className={dimensions === 'landscape' ? styles.landscape : styles.portrait} />
            </div>
          </Section.Row>
        </Section>
      </div>
      <div>
        <Section>
          <Section.Title>Video Picker</Section.Title>
          <Section.Row>
            <BackgroundVideos setVideo={setVideo} seekToBeginning={seekToBeginning} />
          </Section.Row>
        </Section>
      </div>
    </div>
  )
}

export default VideoSettings;