import { useCallback, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import { logErrorToSentry } from '@/lib/sentry';

const MIN_NOTE_LENGTH = 6;
const MAX_NOTE_LENGTH = 10000;

export enum LoadingState {
  Public = 'public',
  Private = 'private',
}

export const useNotesStates = (
  initialNote: string,
  onSaveNote?: ({ note, isPublic }: { note: string; isPublic: boolean }) => Promise<void>,
  onMyNotes?: () => void,
) => {
  const { t } = useTranslation();

  const [noteInput, setNoteInput] = useState(initialNote);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<LoadingState | null>(null);

  const validateNoteInput = useCallback((): true | void => {
    if (!noteInput) {
      return setErrors({
        note: t('common:validation.required-field', {
          field: t('notes:note'),
        }),
      });
    }

    if (noteInput.length < MIN_NOTE_LENGTH) {
      return setErrors({
        note: t('common:validation.minimum-length', {
          field: t('notes:note'),
          value: MIN_NOTE_LENGTH,
        }),
      });
    }

    if (noteInput.length > MAX_NOTE_LENGTH) {
      return setErrors({
        note: t('common:validation.maximum-length', {
          field: t('notes:note'),
          value: MAX_NOTE_LENGTH,
        }),
      });
    }

    return true;
  }, [noteInput, t]);

  const onSubmit = useCallback(
    async (isPublic: boolean) => {
      if (!validateNoteInput()) return;

      if (onSaveNote) {
        try {
          setLoading(isPublic ? LoadingState.Public : LoadingState.Private);
          await onSaveNote({ note: noteInput, isPublic });
          setNoteInput('');
          onMyNotes?.();
        } catch (error) {
          logErrorToSentry(error, {
            transactionName: isPublic ? 'notes.post-to-qr' : 'notes.save-privately',
            metadata: { noteLength: noteInput.length },
          });
        } finally {
          setLoading(null);
        }
      }
    },
    [noteInput, validateNoteInput, onSaveNote, onMyNotes],
  );

  const onPrivateSave = useCallback(async () => {
    await onSubmit(false);
  }, [onSubmit]);

  const onPublicSaveRequest = useCallback(async () => {
    await onSubmit(true);
  }, [onSubmit]);

  const onNoteInputChange = (value: string) => {
    setNoteInput(value);
    setErrors({});
  };

  return {
    noteInput,
    errors,
    loading,
    validateNoteInput,
    onNoteInputChange,
    onPrivateSave,
    onPublicSaveRequest,
  };
};
