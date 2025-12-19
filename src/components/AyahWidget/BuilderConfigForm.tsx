/* eslint-disable max-lines */
import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import type { Preferences } from './builder/types';

import styles from '@/styles/ayah-widget.module.scss';
import type { MushafType } from '@/types/ayah-widget';
import Chapter from '@/types/Chapter';
import type AvailableTranslation from 'types/AvailableTranslation';
import type Reciter from 'types/Reciter';

type Props = {
  preferences: Preferences;
  setPreferences: React.Dispatch<React.SetStateAction<Preferences>>;
  surahs: Chapter[];
  verseOptions: number[];
  groupedTranslations: [string, AvailableTranslation[]][];
  translationSearch: string;
  setTranslationSearch: (value: string) => void;
  selectedTranslationIds: Set<number | undefined>;
  toggleTranslation: (translation: AvailableTranslation) => void;
  reciters: Reciter[];
};

const BuilderConfigForm = ({
  preferences,
  setPreferences,
  surahs,
  verseOptions,
  groupedTranslations,
  translationSearch,
  setTranslationSearch,
  selectedTranslationIds,
  toggleTranslation,
  reciters,
}: Props) => {
  const { t } = useTranslation('ayah-widget');
  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>{t('sections.configuration')}</h2>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="container-id">
          {t('fields.containerId')}
        </label>
        <input
          id="container-id"
          className={styles.input}
          value={preferences.containerId}
          onChange={(event) =>
            setPreferences((prev) => ({
              ...prev,
              containerId: event.target.value || prev.containerId,
            }))
          }
        />
      </div>

      <div className={styles.twoColumnGrid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="surah-select">
            {t('fields.surah')}
          </label>
          <select
            id="surah-select"
            className={styles.select}
            value={preferences.selectedSurah}
            onChange={(event) =>
              setPreferences((prev) => ({
                ...prev,
                selectedSurah: Number(event.target.value),
                selectedAyah: 1,
              }))
            }
          >
            {surahs.length === 0 && <option>{t('states.loadingChapters')}</option>}
            {surahs.map((surah) => (
              <option key={surah.id ?? ''} value={Number(surah.id)}>
                {Number(surah.id)}. {surah.transliteratedName}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="ayah-select">
            {t('fields.ayah')}
          </label>
          <select
            id="ayah-select"
            className={styles.select}
            value={preferences.selectedAyah}
            onChange={(event) =>
              setPreferences((prev) => ({
                ...prev,
                selectedAyah: Number(event.target.value),
              }))
            }
          >
            {verseOptions.length === 0 && <option>{t('states.loadingVerses')}</option>}
            {verseOptions.map((ayah) => (
              <option key={ayah} value={ayah}>
                {ayah}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="theme-select">
          {t('fields.theme')}
        </label>
        <select
          id="theme-select"
          className={styles.select}
          value={preferences.theme}
          onChange={(event) =>
            setPreferences((prev) => ({
              ...prev,
              theme: event.target.value as Preferences['theme'],
            }))
          }
        >
          <option value="light">{t('theme.light')}</option>
          <option value="dark">{t('theme.dark')}</option>
          <option value="sepia">{t('theme.sepia')}</option>
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="mushaf-select">
          {t('fields.mushaf')}
        </label>
        <select
          id="mushaf-select"
          className={styles.select}
          value={preferences.mushaf}
          onChange={(event) =>
            setPreferences((prev) => ({
              ...prev,
              mushaf: event.target.value as MushafType,
            }))
          }
        >
          <option value="qpc">{t('mushaf.qpc')}</option>
          <option value="kfgqpc_v1">{t('mushaf.kfgqpc_v1')}</option>
          <option value="kfgqpc_v2">{t('mushaf.kfgqpc_v2')}</option>
          <option value="indopak">{t('mushaf.indopak')}</option>
          <option value="tajweed">{t('mushaf.tajweed')}</option>
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="translation-search">
          {t('fields.translations')}
        </label>
        <input
          id="translation-search"
          className={styles.searchInput}
          placeholder={t('placeholders.searchTranslations')}
          value={translationSearch}
          onChange={(event) => setTranslationSearch(event.target.value)}
        />
        <div className={styles.chips}>
          {preferences.translations.map((translation) => (
            <span className={styles.chip} key={translation.id}>
              {translation.name}
              <button
                type="button"
                onClick={() => toggleTranslation(translation)}
                aria-label={t('translations.chipRemoveLabel', { name: translation.name })}
              >
                {t('translations.chipRemoveSymbol')}
              </button>
            </span>
          ))}
        </div>
        <div className={styles.translationList}>
          {groupedTranslations.map(([language, translationsList]) => (
            <div className={styles.translationGroup} key={language}>
              <div className={styles.translationGroupTitle}>{language}</div>
              {translationsList.map((translation) => (
                <label
                  className={styles.translationOption}
                  key={translation.id}
                  htmlFor={`translation-${translation.id}`}
                >
                  <input
                    id={`translation-${translation.id}`}
                    type="checkbox"
                    checked={selectedTranslationIds.has(translation.id)}
                    onChange={() => toggleTranslation(translation)}
                  />
                  <div>
                    <div className={styles.translationName}>{translation.name}</div>
                    <div className={styles.translationMeta}>{translation.authorName}</div>
                  </div>
                </label>
              ))}
            </div>
          ))}
          {!groupedTranslations.length && (
            <div className={styles.translationGroupTitle}>{t('states.noTranslations')}</div>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="reciter-select">
          {t('fields.reciter')}
        </label>
        <select
          id="reciter-select"
          className={styles.select}
          value={preferences.reciter ?? ''}
          disabled={!reciters.length}
          onChange={(event) =>
            setPreferences((prev) => ({
              ...prev,
              reciter: event.target.value ? Number(event.target.value) : null,
            }))
          }
        >
          {!reciters.length && <option>{t('states.loadingReciters')}</option>}
          {reciters.length > 0 && <option value="">{t('reciters.select')}</option>}
          {reciters.map((reciter) => (
            <option key={reciter.id} value={reciter.id}>
              {reciter.name}
              {reciter.style?.name ? ` (${reciter.style.name})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.checkboxRow}>
        <input
          id="audio-toggle"
          type="checkbox"
          checked={preferences.enableAudio}
          onChange={(event) =>
            setPreferences((prev) => ({
              ...prev,
              enableAudio: event.target.checked,
            }))
          }
        />
        <label className={styles.checkboxLabel} htmlFor="audio-toggle">
          {t('checkboxes.audio')}
        </label>
      </div>

      <div className={styles.checkboxRow}>
        <input
          id="wbw-toggle"
          type="checkbox"
          checked={preferences.enableWbwTranslation}
          onChange={(event) =>
            setPreferences((prev) => ({
              ...prev,
              enableWbwTranslation: event.target.checked,
            }))
          }
        />
        <label className={styles.checkboxLabel} htmlFor="wbw-toggle">
          {t('checkboxes.wordByWord')}
        </label>
      </div>

      <div className={styles.checkboxRow}>
        <input
          id="translator-toggle"
          type="checkbox"
          checked={preferences.showTranslatorName}
          onChange={(event) =>
            setPreferences((prev) => ({
              ...prev,
              showTranslatorName: event.target.checked,
            }))
          }
        />
        <label className={styles.checkboxLabel} htmlFor="translator-toggle">
          {t('checkboxes.translator')}
        </label>
      </div>

      <div className={styles.checkboxRow}>
        <input
          id="link-toggle"
          type="checkbox"
          checked={preferences.showQuranLink}
          onChange={(event) =>
            setPreferences((prev) => ({
              ...prev,
              showQuranLink: event.target.checked,
            }))
          }
        />
        <label className={styles.checkboxLabel} htmlFor="link-toggle">
          {t('checkboxes.quranLink')}
        </label>
      </div>

      <div className={styles.twoColumnGrid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="custom-width">
            {t('fields.width')}
          </label>
          <input
            id="custom-width"
            className={styles.sizeInput}
            value={preferences.customSize.width}
            onChange={(event) =>
              setPreferences((prev) => ({
                ...prev,
                customSize: { ...prev.customSize, width: event.target.value },
              }))
            }
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="custom-height">
            {t('fields.height')}
          </label>
          <input
            id="custom-height"
            className={styles.sizeInput}
            value={preferences.customSize.height}
            onChange={(event) =>
              setPreferences((prev) => ({
                ...prev,
                customSize: { ...prev.customSize, height: event.target.value },
              }))
            }
          />
        </div>
      </div>
    </section>
  );
};

export default BuilderConfigForm;
