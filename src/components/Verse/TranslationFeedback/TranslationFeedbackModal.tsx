import React, { useEffect, useMemo, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import styles from './TranslationFeedbackModal.module.scss';

import { getAvailableTranslations } from '@/api';
import TranslationPreview from '@/components/Verse/TranslationFeedback/TranslationPreview';
import Button from '@/dls/Button/Button';
import Select, { SelectOption } from '@/dls/Forms/Select';
import TextArea from '@/dls/Forms/TextArea';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { WordVerse } from '@/types/Word';
import { makeTranslationsUrl } from '@/utils/apiPaths';
import { submitTranslationFeedback } from '@/utils/auth/api';
import { getChapterNumberFromKey, getVerseNumberFromKey } from '@/utils/verse';

type Props = {
  verse: WordVerse;
  onClose: () => void;
};

const MAX_FEEDBACK_CHARS = 10000;
const MIN_FEEDBACK_CHARS = 1;

const TranslationFeedbackModal: React.FC<Props> = ({ verse, onClose }) => {
  const { t, lang } = useTranslation('common');
  const toast = useToast();

  const selectedTranslationsFromPrefs = useSelector(selectSelectedTranslations) as number[];

  const [selectedTranslationId, setSelectedTranslationId] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  const [errors, setErrors] = useState<{ translation?: string; feedback?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: translationsResponse } = useSWRImmutable(makeTranslationsUrl(lang), () =>
    getAvailableTranslations(lang).then((res) => res),
  );

  const availableTranslations = useMemo(
    () =>
      (translationsResponse?.translations ?? []) as {
        id: number;
        translatedName?: { name: string };
        resourceName?: string;
      }[],
    [translationsResponse],
  );

  const selectedTranslationsOptions = useMemo<SelectOption[]>(() => {
    return availableTranslations
      .filter((tr) => selectedTranslationsFromPrefs.includes(tr.id))
      .map((tr) => ({
        label: tr.translatedName?.name ?? tr.resourceName ?? '',
        value: tr.id,
      }));
  }, [availableTranslations, selectedTranslationsFromPrefs]);

  useEffect(() => {
    if (selectedTranslationsOptions.length === 1 && !selectedTranslationId) {
      setSelectedTranslationId(selectedTranslationsOptions[0].value.toString());
    }
  }, [selectedTranslationsOptions, selectedTranslationId]);

  const validate = (): boolean => {
    const newErrors: { translation?: string; feedback?: string } = {};
    const len = feedback.trim().length;

    if (!selectedTranslationId) {
      newErrors.translation = t('validation.required-field', {
        field: t('translation-feedback.translation'),
      });
    }

    if (len === 0) {
      newErrors.feedback = t('validation.required-field', {
        field: t('translation-feedback.feedback'),
      });
    } else if (len < MIN_FEEDBACK_CHARS) {
      newErrors.feedback = t('validation.minimum-length', {
        field: t('translation-feedback.feedback'),
        value: MIN_FEEDBACK_CHARS,
      });
    } else if (len > MAX_FEEDBACK_CHARS) {
      newErrors.feedback = t('validation.maximum-length', {
        field: t('translation-feedback.feedback'),
        value: MAX_FEEDBACK_CHARS,
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const chapterNumber = getChapterNumberFromKey(verse.verseKey);
      const verseNumber = getVerseNumberFromKey(verse.verseKey);

      await submitTranslationFeedback({
        translationId: Number(selectedTranslationId),
        surahNumber: chapterNumber,
        ayahNumber: verseNumber,
        feedback,
      });

      toast(t('translation-feedback.submission-success'), { status: ToastStatus.Success });
      onClose();
    } catch {
      toast(t('error.general'), { status: ToastStatus.Error });
    } finally {
      setIsSubmitting(false);
    }
  };

  const noPreferences = t('translation-feedback.no-translations-in-preferences');
  const selectOptions =
    selectedTranslationsOptions.length > 0
      ? selectedTranslationsOptions
      : [{ label: noPreferences, value: '', disabled: true }];

  return (
    <form onSubmit={onSubmit} noValidate className={styles.form}>
      <div className={styles.inputGroup}>
        <label htmlFor="translation-select">{t('translation-feedback.select-translation')}</label>

        <Select
          id="translation-select"
          name="translation-select"
          options={selectOptions}
          value={selectedTranslationId}
          className={styles.selectContainer}
          placeholder={t('translation-feedback.select')}
          onChange={(value) => {
            setSelectedTranslationId(value as string);
            setErrors((prev) => ({ ...prev, translation: undefined }));
          }}
        />

        {errors.translation && <div className={styles.error}>{errors.translation}</div>}
      </div>

      <TranslationPreview verse={verse} lang={lang} selectedTranslationId={selectedTranslationId} />

      <div className={styles.inputGroup}>
        <TextArea
          id="feedback"
          name="feedback"
          placeholder={t('translation-feedback.placeholder')}
          containerClassName={styles.textArea}
          value={feedback}
          onChange={(value) => {
            setFeedback(value);
            setErrors((prev) => ({ ...prev, feedback: undefined }));
          }}
        />

        {errors.feedback && <div className={styles.error}>{errors.feedback}</div>}
      </div>

      <div className={styles.actions}>
        <Button htmlType="submit" isLoading={isSubmitting}>
          {t('translation-feedback.report')}
        </Button>
      </div>
    </form>
  );
};

export default TranslationFeedbackModal;
