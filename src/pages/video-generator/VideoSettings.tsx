import useTranslation from "next-translate/useTranslation";

import Section from "@/components/Navbar/SettingsDrawer/Section";
import Select from "@/dls/Forms/Select";
import layoutStyle from "../index.module.scss";
import classNames from "classnames";
import styles from "./video.module.scss";
import QuranFontSection from "./QuranFontSectionSetting";

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
    fontSize,
    setFontSize,
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
        <QuranFontSection />
      </div>
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
        <p>Font size</p>
        <input
          className={styles.colorPicker}
          type="text"
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
        />
      </div>
    </div>
  )
}

export default VideoSettings;