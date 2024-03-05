import useTranslation from "next-translate/useTranslation";

import Section from "@/components/Navbar/SettingsDrawer/Section";
import Select from "@/dls/Forms/Select";
import layoutStyle from "../index.module.scss";
import classNames from "classnames";
import styles from "./video.module.scss";
import QuranFontSection from "./QuranFontSectionSetting";
import TranslationSetting from "./TranslationSectionSetting";
import Switch from "@/dls/Switch/Switch";

const VideoSettings = ({ 
    chaptersList,
    chapter,
    onChapterChange,
    recitersOptions,
    reciter,
    setReciter,
    sceneBackgroundColor,
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
    setOpacity
  }) => {
  const { t } = useTranslation("common");

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
          <Section.Title>Verse Background Opacity</Section.Title>
          <Section.Row>
            <Switch  items={[{name: '0%', value: '0'}, { name: '20%', value: '0.2'}, { name: '40%', value: '0.4'}, { name: '60%', value: '0.6'}, { name: '80%', value: '0.8'}, { name: '100%', value: '1'}]} selected={opacity} onSelect={(val) => {setOpacity(val)}} />
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
          <Section.Title>Colors</Section.Title>
          <Section.Row>
            <Section.Label>Scene Background</Section.Label>
            <input
              className={styles.colorPicker}
              type="color"
              value={sceneBackgroundColor}
              onChange={(e) => setSceneBackgroundColor(e.target.value)}
            />
          </Section.Row>
          <Section.Row>
            <Section.Label>Verse Background</Section.Label>
            <input
              className={styles.colorPicker}
              type="color"
              value={verseBackgroundColor}
              onChange={(e) => setVerseBackgroundColor(e.target.value)}
            />
          </Section.Row>
          <Section.Row>
            <Section.Label>Font color</Section.Label>
            <input
              className={styles.colorPicker}
              type="color"
              value={fontColor}
              onChange={(e) => setFontColor(e.target.value)}
            />
          </Section.Row>
        </Section>
      </div>

      <div>
        <Section>
          <Section.Title>Text alignment</Section.Title>
          {/* TODO: Add localization to labels */}
          <Section.Title>Verse</Section.Title>
          <Section.Row>
            <Switch  items={[{name: 'Centre', value: 'centre'}, { name: 'Justified', value: 'justified'}]} selected={verseAlignment} onSelect={(val) => {setVerseAlignment(val)}} />
          </Section.Row>
          <br />
          <Section.Title>Translation</Section.Title>
          <Section.Row>
            <Switch items={[{name: 'Centre', value: 'centre'}, { name: 'Justified', value: 'justified'}]} selected={translationAlignment} onSelect={(val) => {setTranslationAlignment(val)}} />
          </Section.Row>
        </Section>
      </div>
    </div>
  )
}

export default VideoSettings;