import React, { useMemo, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import styles from './TranslationFeedbackModal.module.scss';

import { getAvailableTranslations, submitTranslationFeedback } from '@/api';
import Button from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { WordVerse } from '@/types/Word';
import { makeTranslationsUrl } from '@/utils/apiPaths';

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

  const selectedTranslationsOptions = useMemo(
    () => availableTranslations.filter((tr) => selectedTranslationsFromPrefs.includes(tr.id)),
    [availableTranslations, selectedTranslationsFromPrefs],
  );

  const defaultSelectedTranslationId =
    selectedTranslationsFromPrefs.length === 1 ? String(selectedTranslationsFromPrefs[0]) : '';

  const [selectedTranslationId, setSelectedTranslationId] = useState<string>(
    defaultSelectedTranslationId,
  );
  const [feedback, setFeedback] = useState('');
  const [errors, setErrors] = useState<{ translation?: string; feedback?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTranslationName = useMemo(() => {
    const id = Number(selectedTranslationId);
    const found = availableTranslations.find((tr) => tr.id === id);
    return found?.translatedName?.name ?? found?.resourceName ?? '';
  }, [selectedTranslationId, availableTranslations]);

  const validate = (): boolean => {
    const newErrors: { translation?: string; feedback?: string } = {};

    if (!selectedTranslationId) {
      newErrors.translation = t('translation-feedback.translation-missing');
    }

    const len = feedback.trim().length;

    if (len === 0) {
      newErrors.feedback = t('translation-feedback.feedback-missing');
    } else if (len < MIN_FEEDBACK_CHARS) {
      newErrors.feedback = t('translation-feedback.feedback-min', { min: MIN_FEEDBACK_CHARS });
    } else if (len > MAX_FEEDBACK_CHARS) {
      newErrors.feedback = t('translation-feedback.feedback-max', { max: MAX_FEEDBACK_CHARS });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await submitTranslationFeedback({
        translationId: Number(selectedTranslationId),
        verseKey: verse.verseKey,
        feedback,
      });

      toast(t('translation-feedback.submission-success'), { status: ToastStatus.Success });
      onClose();
    } catch (err: any) {
      toast(t('error.general'), { status: ToastStatus.Error });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className={styles.form}>
      <div className={styles.inputGroup}>
        <label htmlFor="translation-select">{t('translation-feedback.select-translation')}</label>
        <select
          id="translation-select"
          value={selectedTranslationId}
          onChange={(ev) => {
            setSelectedTranslationId(ev.target.value);
            setErrors((prev) => ({ ...prev, translation: undefined }));
          }}
          style={{ width: '100%', padding: '8px 10px' }}
        >
          <option value="" disabled>
            {t('translation-feedback.select')}
          </option>

          {selectedTranslationsOptions.map((tr) => (
            <option key={tr.id} value={String(tr.id)}>
              {tr.translatedName?.name ?? tr.resourceName}
            </option>
          ))}
        </select>

        {errors.translation && <div>{errors.translation}</div>}
      </div>

      {selectedTranslationName && (
        <div className={styles.translation}>
          &quot;{selectedTranslationName} — {verse.verseKey}&quot;
        </div>
      )}

      <div className={styles.inputGroup}>
        <textarea
          placeholder={t('translation-feedback.placeholder')}
          value={feedback}
          onChange={(ev) => {
            setFeedback(ev.target.value);
            setErrors((prev) => ({ ...prev, feedback: undefined }));
          }}
          rows={10}
          maxLength={MAX_FEEDBACK_CHARS}
          style={{ width: 'auto', padding: 10, borderRadius: 6 }}
        />

        {errors.feedback && <div>{errors.feedback}</div>}
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
