import ReadingExperienceSection from './ReadingExperienceSection';
import styles from './SettingsBody.module.scss';
import ThemeSection from './ThemeSection';

const SettingsBody = () => (
  <div className={styles.container}>
    <ThemeSection />
    <ReadingExperienceSection />
    {/* <Section>
      <SectionTitle>Reading Experiece</SectionTitle>
      <div>
        <div>view</div>
        <div>translation</div>
        <div>reading</div>
      </div>
      <div>
        <div>tooltip</div>
      </div>
      <div>
        <div>word by word</div>
      </div>
    </Section>

    <Section>
      <SectionTitle>quran font</SectionTitle>
      <div>
        <div>type</div>
        <div>uthamani</div>
        <div>indopak</div>
      </div>
      <div>
        <div>style</div>
        <div>style</div>
      </div>
      <div>
        <div>font size</div>
        <div> - 3 +</div>
      </div>
      <div>font preview section</div>
      <div>
        KPFG Fonts provide higher quality but take longer to load and cannot be copied through the
        browser
      </div>
    </Section>

    <Section>
      <SectionTitle>Translation</SectionTitle>
      <div>
        <div>translation</div>
        <div>aak</div>
      </div>
      <div>
        <div>font size</div>
        <div>-3=</div>
      </div>
    </Section>

    <Section>
      <SectionTitle>Tafsir</SectionTitle>
      <div>
        <div>translation</div>
        <div>aak</div>
      </div>
      <div>
        <div>font size</div>
        <div>-3=</div>
      </div>
    </Section>

    <Section>
      <SectionTitle>Audio</SectionTitle>
      <div>
        <div>Reciter</div>
        <div>==</div>
      </div>
    </Section>

    <div>
      <Button>Reset sttings</Button>
    </div>
  */}
  </div>
);

export default SettingsBody;
