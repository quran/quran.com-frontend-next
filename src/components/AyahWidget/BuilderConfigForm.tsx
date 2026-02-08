/* eslint-disable max-lines */
import React, { useCallback, useEffect, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import type { Preferences } from './builder/types';
import {
  WIDGET_FORM_BLOCKS,
  getRangeMeta,
  getWidgetLocaleOptions,
  normalizeRangePreferences,
  type WidgetFieldConfig,
  type WidgetFormBlock,
  type WidgetFormContext,
  type WidgetSelectOptions,
} from './widget-config';

import styles from '@/styles/embed.module.scss';
import type Chapter from '@/types/Chapter';
import { logValueChange } from '@/utils/eventLogger';
import type AvailableTranslation from 'types/AvailableTranslation';
import type Reciter from 'types/Reciter';

type Props = {
  preferences: Preferences;
  setUserPreferences: React.Dispatch<React.SetStateAction<Preferences>>;
  surahs: Chapter[];
  verseOptions: number[];
  groupedTranslations: [string, AvailableTranslation[]][];
  translationSearch: string;
  setTranslationSearch: (value: string) => void;
  selectedTranslationIds: Set<number | undefined>;
  toggleTranslation: (translation: AvailableTranslation) => void;
  reciters: Reciter[];
};

/**
 * BuilderConfigForm
 *
 * Renders the configuration panel for the Ayah Widget Builder.
 * The layout is driven by `WIDGET_FORM_BLOCKS`, which makes it easy to add/remove fields.
 *
 * Responsibilities:
 * - Create a stable `WidgetFormContext` used by field configs.
 * - Normalize range preferences when the available range changes.
 * - Render fields (text/select/checkbox), translations, and the Surah/Ayah range row.
 *
 * @param {Props} props - Component props.
 * @returns {JSX.Element} The configuration panel.
 */
const BuilderConfigForm = ({
  preferences,
  setUserPreferences,
  surahs,
  verseOptions,
  groupedTranslations,
  translationSearch,
  setTranslationSearch,
  selectedTranslationIds,
  toggleTranslation,
  reciters,
}: Props): JSX.Element => {
  const { t, lang } = useTranslation('embed');

  /**
   * Locale options are static for the session (read from i18n config).
   */
  const localeOptions = useMemo(
    (): { code: string; name: string }[] => getWidgetLocaleOptions(),
    [],
  );

  /**
   * Range metadata depends on selected ayah + available verse options.
   */
  const rangeMeta = useMemo(
    () => getRangeMeta(preferences.selectedAyah, verseOptions),
    [preferences.selectedAyah, verseOptions],
  );

  /**
   * Keep range state normalized when range options change.
   * Example: if user had range enabled but the new surah cannot support it, we disable it.
   */
  useEffect(() => {
    if (!verseOptions.length) return;
    setUserPreferences((prev: Preferences) => normalizeRangePreferences(prev, rangeMeta));
  }, [rangeMeta, setUserPreferences, verseOptions.length]);

  /**
   * Context passed to field config resolvers (options/getValue/setValue, visibility, etc.).
   */
  const formContext: WidgetFormContext = useMemo(
    () => ({
      t,
      uiLocale: lang,
      preferences,
      setUserPreferences,
      surahs,
      verseOptions,
      rangeMeta,
      groupedTranslations,
      translationSearch,
      setTranslationSearch,
      selectedTranslationIds,
      toggleTranslation,
      reciters,
      localeOptions,
    }),
    [
      t,
      lang,
      preferences,
      setUserPreferences,
      surahs,
      verseOptions,
      rangeMeta,
      groupedTranslations,
      translationSearch,
      setTranslationSearch,
      selectedTranslationIds,
      toggleTranslation,
      reciters,
      localeOptions,
    ],
  );

  /**
   * Resolve the current field value:
   * - prefer `field.getValue` if provided
   * - else read from `preferences[field.preferenceKey]`
   *
   * @param {WidgetFieldConfig} field - Field config.
   * @returns {string | number | boolean | null} Current field value.
   */
  const resolveFieldValue = useCallback(
    (field: WidgetFieldConfig): string | number | boolean | null => {
      if (field.getValue) return field.getValue(preferences, formContext);
      if (!field.preferenceKey) return '';
      return preferences[field.preferenceKey];
    },
    [preferences, formContext],
  );

  /**
   * Update a field:
   * - if `field.setValue` exists, use it (allows custom logic)
   * - else set `preferences[field.preferenceKey] = value`
   *
   * @param {WidgetFieldConfig} field - Field config.
   * @param {string | number | boolean | null} value - Next value.
   * @returns {void}
   */
  const updateFieldValue = useCallback(
    (field: WidgetFieldConfig, value: string | number | boolean | null): void => {
      const previousValue = resolveFieldValue(field);
      if (!Object.is(previousValue, value)) {
        const normalizedPreviousValue = previousValue === null ? '' : previousValue;
        const normalizedNextValue = value === null ? '' : value;
        logValueChange(`embed_builder_${field.id}`, normalizedPreviousValue, normalizedNextValue, {
          surah: preferences.selectedSurah,
          ayah: preferences.selectedAyah,
        });
      }

      formContext.setUserPreferences((prev: Preferences) => {
        if (field.setValue) return field.setValue(value, prev, formContext);
        if (!field.preferenceKey) return prev;
        return { ...prev, [field.preferenceKey]: value } as Preferences;
      });
    },
    [formContext, preferences.selectedAyah, preferences.selectedSurah, resolveFieldValue],
  );

  /**
   * Get select options for a field.
   *
   * @param {WidgetFieldConfig} field - Field config.
   * @returns {WidgetSelectOptions} Select options.
   */
  const getSelectOptions = useCallback(
    (field: WidgetFieldConfig): WidgetSelectOptions =>
      field.options ? field.options(formContext) : { items: [] },
    [formContext],
  );

  /**
   * Whether a field should be rendered.
   *
   * @param {WidgetFieldConfig} field - Field config.
   * @returns {boolean} True if visible.
   */
  const isFieldVisible = useCallback(
    (field: WidgetFieldConfig): boolean => {
      if (!field.isVisible) return true;
      return field.isVisible(preferences, formContext);
    },
    [preferences, formContext],
  );

  /**
   * Whether a field should be disabled.
   *
   * @param {WidgetFieldConfig} field - Field config.
   * @returns {boolean} True if disabled.
   */
  const isFieldDisabled = useCallback(
    (field: WidgetFieldConfig): boolean => field.isDisabled?.(preferences, formContext) ?? false,
    [preferences, formContext],
  );

  /**
   * Render a text input field.
   *
   * @param {WidgetFieldConfig} field - Field config.
   * @returns {JSX.Element | null} Field UI.
   */
  const renderTextField = useCallback(
    (field: WidgetFieldConfig): JSX.Element | null => {
      if (!isFieldVisible(field)) return null;

      const disabled: boolean = isFieldDisabled(field);
      const baseClass: string = styles.field;
      const className: string =
        field.dimWhenDisabled && disabled ? `${baseClass} ${styles.disabled}` : baseClass;

      const inputClassName: string =
        field.inputVariant === 'size' ? styles.sizeInput : styles.input;

      return (
        <div className={className}>
          <label className={styles.label} htmlFor={field.controlId}>
            {t(field.labelKey)}
          </label>
          <input
            id={field.controlId}
            className={inputClassName}
            value={String(resolveFieldValue(field) ?? '')}
            disabled={disabled}
            onChange={(event) => updateFieldValue(field, event.target.value)}
          />
        </div>
      );
    },
    [isFieldVisible, isFieldDisabled, t, resolveFieldValue, updateFieldValue],
  );

  /**
   * Render a select control (without its wrapper/label).
   *
   * @param {WidgetFieldConfig} field - Field config.
   * @returns {JSX.Element} Select element.
   */
  const renderSelectControl = useCallback(
    (field: WidgetFieldConfig): JSX.Element => {
      const { items, valueOverride } = getSelectOptions(field);
      const disabled: boolean = isFieldDisabled(field);

      const rawValue: string | number | boolean | null = (valueOverride ??
        resolveFieldValue(field)) as any;

      const resolvedValue: string | number =
        typeof rawValue === 'boolean' ? String(rawValue) : rawValue ?? '';

      return (
        <select
          id={field.controlId}
          className={styles.select}
          value={resolvedValue}
          disabled={disabled}
          onChange={(event) => {
            const parsed: string | number | boolean | null = field.parseValue
              ? field.parseValue(event.target.value, formContext)
              : event.target.value;
            updateFieldValue(field, parsed);
          }}
        >
          {items.map((option) => (
            <option
              key={`${field.id}-${String(option.value)}`}
              value={option.value}
              disabled={option.disabled}
            >
              {option.labelKey ? t(option.labelKey) : option.label}
            </option>
          ))}
        </select>
      );
    },
    [getSelectOptions, isFieldDisabled, resolveFieldValue, updateFieldValue, formContext, t],
  );

  /**
   * Render a select field (with wrapper/label).
   *
   * @param {WidgetFieldConfig} field - Field config.
   * @returns {JSX.Element | null} Field UI.
   */
  const renderSelectField = useCallback(
    (field: WidgetFieldConfig): JSX.Element | null => {
      if (!isFieldVisible(field)) return null;

      const disabled: boolean = isFieldDisabled(field);
      const baseClass: string = styles.field;
      const className: string =
        field.dimWhenDisabled && disabled ? `${baseClass} ${styles.disabled}` : baseClass;

      return (
        <div className={className}>
          <label className={styles.label} htmlFor={field.controlId}>
            {t(field.labelKey)}
          </label>
          {renderSelectControl(field)}
        </div>
      );
    },
    [isFieldVisible, isFieldDisabled, t, renderSelectControl],
  );

  /**
   * Render a checkbox field.
   *
   * @param {WidgetFieldConfig} field - Field config.
   * @returns {JSX.Element | null} Field UI.
   */
  const renderCheckboxField = useCallback(
    (field: WidgetFieldConfig): JSX.Element | null => {
      if (!isFieldVisible(field)) return null;

      const disabled: boolean = isFieldDisabled(field);
      const className: string =
        field.dimWhenDisabled && disabled
          ? `${styles.checkboxRow} ${styles.disabled}`
          : styles.checkboxRow;

      return (
        <div className={className}>
          <input
            id={field.controlId}
            type="checkbox"
            checked={Boolean(resolveFieldValue(field))}
            disabled={disabled}
            onChange={(event) => updateFieldValue(field, event.target.checked)}
          />
          <label className={styles.checkboxLabel} htmlFor={field.controlId}>
            {t(field.labelKey)}
          </label>
        </div>
      );
    },
    [isFieldVisible, isFieldDisabled, resolveFieldValue, updateFieldValue, t],
  );

  /**
   * Render a field based on its type.
   *
   * @param {WidgetFieldConfig} field - Field config.
   * @returns {JSX.Element | null} Field UI.
   */
  const renderField = useCallback(
    (field: WidgetFieldConfig): JSX.Element | null => {
      switch (field.type) {
        case 'checkbox':
          return renderCheckboxField(field);
        case 'select':
          return renderSelectField(field);
        default:
          return renderTextField(field);
      }
    },
    [renderCheckboxField, renderSelectField, renderTextField],
  );

  /**
   * Render the translations block (search, chips, grouped checkboxes).
   *
   * @returns {JSX.Element} Translations UI.
   */
  const renderTranslationsBlock = useCallback((): JSX.Element => {
    return (
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
                aria-label={t('translations.chipRemoveLabel')}
                // eslint-disable-next-line i18next/no-literal-string
              >
                x
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
    );
  }, [
    t,
    translationSearch,
    setTranslationSearch,
    preferences.translations,
    toggleTranslation,
    groupedTranslations,
    selectedTranslationIds,
  ]);

  /**
   * Render the Surah/Ayah/Range block (special layout).
   *
   * @param {Extract<WidgetFormBlock, { kind: 'surahAyahRange' }>} block - Block config.
   * @returns {JSX.Element} Block UI.
   */
  const renderSurahAyahRangeBlock = useCallback(
    (block: Extract<WidgetFormBlock, { kind: 'surahAyahRange' }>): JSX.Element => {
      const shouldShowRangeEnd: boolean =
        !block.rangeField.isVisible || block.rangeField.isVisible(preferences, formContext);

      return (
        <div className={styles.twoColumnGrid}>
          {renderField(block.surahField)}

          <div className={styles.field}>
            <label className={styles.label} htmlFor={block.ayahField.controlId}>
              {t(block.ayahField.labelKey)}
            </label>

            <div className={styles.rangeRow}>
              {renderSelectControl(block.ayahField)}
              {shouldShowRangeEnd && (
                <>
                  <span className={styles.rangeSeparator}>-</span>
                  {renderSelectControl(block.rangeField)}
                </>
              )}
            </div>
          </div>

          {renderField(block.rangeToggleField)}
        </div>
      );
    },
    [preferences, formContext, renderField, renderSelectControl, t],
  );

  /**
   * Render a layout block based on its kind.
   *
   * @param {WidgetFormBlock} block - Block config.
   * @param {number} index - Index used for React keys.
   * @returns {JSX.Element | null} Rendered block.
   */
  const renderBlock = useCallback(
    (block: WidgetFormBlock, index: number): JSX.Element | null => {
      switch (block.kind) {
        case 'twoColumn':
          return (
            <div className={styles.twoColumnGrid} key={`block-${index}`}>
              {block.fields.map((field) => (
                <React.Fragment key={field.id}>{renderField(field)}</React.Fragment>
              ))}
            </div>
          );

        case 'translations':
          return (
            <React.Fragment key={`block-${index}`}>{renderTranslationsBlock()}</React.Fragment>
          );

        case 'surahAyahRange':
          return (
            <React.Fragment key={`block-${index}`}>
              {renderSurahAyahRangeBlock(block)}
            </React.Fragment>
          );

        case 'field':
          return <React.Fragment key={`block-${index}`}>{renderField(block.field)}</React.Fragment>;

        default:
          return null;
      }
    },
    [renderField, renderTranslationsBlock, renderSurahAyahRangeBlock],
  );

  return (
    <section className={`${styles.panel} ${styles.configPanel}`}>
      <h2 className={styles.panelTitle}>{t('sections.configuration')}</h2>
      {WIDGET_FORM_BLOCKS.map((block: WidgetFormBlock, index: number) => renderBlock(block, index))}
    </section>
  );
};

export default BuilderConfigForm;
