import { useCallback, useEffect, useMemo, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import sendFeedbackErrorToSentry from './logging';
import { TranslationFeedbackFormErrors, UseTranslationFeedbackFormProps } from './types';
import { getTranslationFeedbackErrors, isTranslationFeedbackValid } from './validation';

import { getAvailableTranslations } from '@/api';
import { SelectOption } from '@/dls/Forms/Select';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { makeTranslationsUrl } from '@/utils/apiPaths';
import { submitTranslationFeedback } from '@/utils/auth/api';
import { getChapterNumberFromKey, getVerseNumberFromKey } from '@/utils/verse';

/**
 * Manage translation feedback form state, validation, and submission side effects.
 *
 * @param {UseTranslationFeedbackFormProps} params - Hook params.
 * @param {UseTranslationFeedbackFormProps['verse']} params.verse - Verse information containing the verse key used for submission payloads.
 * @param {UseTranslationFeedbackFormProps['onClose']} params.onClose - Callback invoked after a successful submission to close the form/modal.
 * @returns {object} Hook state, derived options, and handlers for the translation feedback form.
 */
const useTranslationFeedbackForm = ({ verse, onClose }: UseTranslationFeedbackFormProps) => {
  const { t, lang } = useTranslation('common');
  const toast = useToast();
  const selectedTranslationsFromPrefs = useSelector(selectSelectedTranslations);
  const [selectedTranslationId, setSelectedTranslationId] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  const [errors, setErrors] = useState<TranslationFeedbackFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: translationsResponse } = useSWRImmutable(makeTranslationsUrl(lang), () =>
    getAvailableTranslations(lang),
  );

  const selectedTranslationsOptions = useMemo<SelectOption[]>(() => {
    const availableTranslations = translationsResponse?.translations ?? [];
    return availableTranslations
      .filter((tr) => selectedTranslationsFromPrefs.includes(tr.id))
      .map((tr) => ({ label: tr.translatedName?.name ?? '', value: tr.id }));
  }, [translationsResponse, selectedTranslationsFromPrefs]);

  useEffect(() => {
    if (selectedTranslationsOptions.length === 1 && !selectedTranslationId) {
      setSelectedTranslationId(selectedTranslationsOptions[0].value.toString());
    }
  }, [selectedTranslationsOptions, selectedTranslationId]);

  const validate = useCallback(() => {
    const newErrors = getTranslationFeedbackErrors(selectedTranslationId, feedback, t);
    setErrors(newErrors);
    return isTranslationFeedbackValid(newErrors);
  }, [selectedTranslationId, feedback, t]);

  const onSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!validate()) return;
      setIsSubmitting(true);

      try {
        const chapterNumber = getChapterNumberFromKey(verse.verseKey);
        const verseNumber = getVerseNumberFromKey(verse.verseKey);
        const response = await submitTranslationFeedback({
          translationId: Number(selectedTranslationId),
          surahNumber: chapterNumber,
          ayahNumber: verseNumber,
          feedback,
        });

        if (response && response.success) {
          toast(t('translation-feedback.submission-success'), { status: ToastStatus.Success });
          onClose();
        } else {
          // It's not likely to happen, but if it does, we'll log the error to Sentry.
          toast(t('error.general'), { status: ToastStatus.Error });
          sendFeedbackErrorToSentry(response, verse.verseKey, selectedTranslationId);
        }
      } catch (error) {
        toast(t('error.general'), { status: ToastStatus.Error });
        sendFeedbackErrorToSentry(error, verse.verseKey, selectedTranslationId);
      } finally {
        setIsSubmitting(false);
      }
    },
    [validate, verse.verseKey, selectedTranslationId, feedback, t, toast, onClose],
  );

  const handleTranslationChange = useCallback((value: string | number) => {
    setSelectedTranslationId(String(value));
    setErrors((prev) => ({ ...prev, translation: undefined }));
  }, []);

  const handleFeedbackChange = useCallback((value: string) => {
    setFeedback(value);
    setErrors((prev) => ({ ...prev, feedback: undefined }));
  }, []);

  const noPreferences = t('translation-feedback.no-translations-in-preferences');
  const selectOptions =
    selectedTranslationsOptions.length > 0
      ? selectedTranslationsOptions
      : [{ label: noPreferences, value: '', disabled: true }];

  return {
    selectedTranslationId,
    feedback,
    errors,
    isSubmitting,
    selectOptions,
    onSubmit,
    handleTranslationChange,
    handleFeedbackChange,
  };
};

export default useTranslationFeedbackForm;
