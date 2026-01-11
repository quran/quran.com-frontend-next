import { useCallback, useEffect, useMemo, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import sendFeedbackErrorToSentry from './logging';
import { TranslationFeedbackFormErrors, UseTranslationFeedbackFormProps } from './types';
import {
  getTranslationFeedbackErrors,
  getTranslationFeedbackServerErrors,
  isTranslationFeedbackValid,
} from './validation';

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
  const { t, lang } = useTranslation('quran-reader');
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
    const newErrors = getTranslationFeedbackErrors(selectedTranslationId, feedback, t, lang);
    setErrors(newErrors);
    return isTranslationFeedbackValid(newErrors);
  }, [selectedTranslationId, feedback, t, lang]);

  const submitFeedback = useCallback(
    async (
      translationId: string,
      verseKey: string,
      feedbackText: string,
    ): Promise<{ success: boolean; response?: unknown }> => {
      const chapterNumber = getChapterNumberFromKey(verseKey);
      const verseNumber = getVerseNumberFromKey(verseKey);
      try {
        const response = await submitTranslationFeedback({
          translationId: Number(translationId),
          surahNumber: chapterNumber,
          ayahNumber: verseNumber,
          feedback: feedbackText,
        });

        if (response && response.success) return { success: true };

        const serverErrors = getTranslationFeedbackServerErrors(response, t, lang);
        if (serverErrors) {
          setErrors(serverErrors);
          return { success: false, response };
        }

        sendFeedbackErrorToSentry(response, verseKey, translationId);
        toast(t('common:error.general'), { status: ToastStatus.Error, testId: 'error-toast' });
        return { success: false, response };
      } catch (error) {
        sendFeedbackErrorToSentry(error, verseKey, translationId);
        toast(t('common:error.general'), { status: ToastStatus.Error, testId: 'error-toast' });
        return { success: false, response: error };
      }
    },
    [t, toast, lang],
  );

  const onSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!validate()) return;
      setIsSubmitting(true);
      const result = await submitFeedback(selectedTranslationId, verse.verseKey, feedback);

      if (result.success) {
        toast(t('translation-feedback.submission-success'), {
          status: ToastStatus.Success,
          testId: 'success-toast',
        });

        onClose();
      }

      setIsSubmitting(false);
    },
    [validate, verse.verseKey, selectedTranslationId, feedback, t, toast, onClose, submitFeedback],
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
