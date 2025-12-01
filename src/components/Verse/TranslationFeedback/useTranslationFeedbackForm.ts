import { useCallback, useEffect, useMemo, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import { getAvailableTranslations } from '@/api';
import { SelectOption } from '@/dls/Forms/Select';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { logErrorToSentry } from '@/lib/sentry';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { WordVerse } from '@/types/Word';
import { makeTranslationsUrl } from '@/utils/apiPaths';
import { submitTranslationFeedback } from '@/utils/auth/api';
import { getChapterNumberFromKey, getVerseNumberFromKey } from '@/utils/verse';

const MAX_FEEDBACK_CHARS = 10000;
const MIN_FEEDBACK_CHARS = 1;

interface TranslationFeedbackFormErrors {
  translation?: string;
  feedback?: string;
}

interface UseTranslationFeedbackFormProps {
  verse: WordVerse;
  onClose: () => void;
}

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
    const newErrors: TranslationFeedbackFormErrors = {};
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
  }, [selectedTranslationId, feedback, t]);

  const sendToSentry = useCallback((error: unknown, verseKey: string, translationId: string) => {
    logErrorToSentry(error, {
      transactionName: 'submitTranslationFeedback',
      metadata: { verseKey, translationId },
    });
  }, []);

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
          sendToSentry(response, verse.verseKey, selectedTranslationId);
        }
      } catch (error) {
        toast(t('error.general'), { status: ToastStatus.Error });
        sendToSentry(error, verse.verseKey, selectedTranslationId);
      } finally {
        setIsSubmitting(false);
      }
    },
    [validate, verse.verseKey, selectedTranslationId, feedback, t, toast, onClose, sendToSentry],
  );

  const handleTranslationChange = useCallback((value: string) => {
    setSelectedTranslationId(value);
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
