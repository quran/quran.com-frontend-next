import React, { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import styles from './NewNoteReflectionModal.module.scss';
import ReflectionIntro from '../../modal/ReflectionIntro';

import ContentModal, { ContentModalSize } from '@/dls/ContentModal/ContentModal';
import ContentModalHandles from '@/dls/ContentModal/types/ContentModalHandles';
import TextArea, { TextAreaSize } from '@/dls/Forms/TextArea';
import Button from '@/dls/Button/Button';
import { ButtonType } from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useMutation from '@/hooks/useMutation';
import { Note } from '@/types/auth/Note';
import ZIndexVariant from '@/types/enums/ZIndexVariant';
import { addNote as baseAddNote } from '@/utils/auth/api';
import { makeGetNotesByVerseUrl } from '@/utils/auth/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';
import { isVerseKeyWithinRanges } from '@/utils/verse';

const BODY_MIN_LENGTH = 6;
const BODY_MAX_LENGTH = 10000;

interface NewNoteReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  verseKey?: string;
  onNoteSaved?: (data: Note) => void;
  isBottomSheetOnMobile?: boolean;
  zIndexVariant?: ZIndexVariant;
}

type NoteFormData = {
  body: string;
  saveToQR: boolean;
};

const NewNoteReflectionModal: React.FC<NewNoteReflectionModalProps> = ({
  isOpen,
  onClose,
  verseKey,
  onNoteSaved,
  isBottomSheetOnMobile = false,
  zIndexVariant,
}) => {
  const { t } = useTranslation('common');
  const toast = useToast();
  const { mutate, cache } = useSWRConfig();
  const [body, setBody] = useState('');
  const [showReflectionIntro, setShowReflectionIntro] = useState(false);
  const contentModalRef = React.useRef<ContentModalHandles>();

  const { mutate: addNote, isMutating: isAddingNote } = useMutation<Note, NoteFormData>(
    async ({ body, saveToQR }) => {
      return baseAddNote({
        body,
        saveToQR,
        ...(verseKey && {
          ranges: [`${verseKey}-${verseKey}`],
        }),
      }) as Promise<Note>;
    },
    {
      onSuccess: (data) => {
        // if publishing the note publicly call failed after saving the note succeeded
        // @ts-ignore
        if (data?.error === true) {
          toast(t('notes:save-publish-failed'), {
            status: ToastStatus.Error,
          });
          // @ts-ignore
          mutateCache([data.note]);
        } else {
          toast(t('notes:save-success'), {
            status: ToastStatus.Success,
          });
          mutateCache([data]);
        }
        clearCountCache();

        if (onNoteSaved) {
          onNoteSaved(data);
        }
        handleClose();
      },
      onError: () => {
        toast(t('common:error.general'), {
          status: ToastStatus.Error,
        });
      },
    },
  );

  const mutateCache = (data: unknown) => {
    if (verseKey) {
      mutate(makeGetNotesByVerseUrl(verseKey), data);
    }
  };

  const clearCountCache = () => {
    // we need to invalidate one of keys that look like: ['countNotes', notesRange]
    // so that the count is updated
    const keys = [...(cache as any).keys()].filter((key) => {
      if (!key.startsWith('countNotes/')) {
        return false;
      }

      if (verseKey) {
        // check if the note is within the range
        const rangeString = key.replace('countNotes/', '');
        return isVerseKeyWithinRanges(verseKey, rangeString);
      }

      // if we're not on the quran reader page, we can just invalidate all the keys
      return true;
    }) as string[];

    if (keys.length) {
      keys.forEach((key) => {
        cache.delete(key);
        mutate(key);
      });
    }
  };

  const handleClose = () => {
    setBody('');
    setShowReflectionIntro(false);
    onClose();
  };

  const handleSavePrivately = () => {
    if (!validateBody()) {
      return;
    }
    logButtonClick('add_note_private');
    addNote({
      body,
      saveToQR: false,
    });
  };

  const handleSaveAndPost = () => {
    if (!validateBody()) {
      return;
    }
    logButtonClick('add_note_post');
    addNote({
      body,
      saveToQR: true,
    });
  };

  const validateBody = (): boolean => {
    if (body.trim().length < BODY_MIN_LENGTH) {
      toast(t('common:error.general'), {
        status: ToastStatus.Error,
      });
      return false;
    }
    if (body.length > BODY_MAX_LENGTH) {
      toast(t('common:error.general'), {
        status: ToastStatus.Error,
      });
      return false;
    }
    return true;
  };

  return (
    <ContentModal
      innerRef={contentModalRef}
      isOpen={isOpen}
      header={
        <div className={styles.headerContainer}>
          <h2 className={styles.title}>{t('notes:take-note-or-reflection')}</h2>
        </div>
      }
      hasCloseButton
      onClose={handleClose}
      onEscapeKeyDown={handleClose}
      size={ContentModalSize.MEDIUM}
      isBottomSheetOnMobile={isBottomSheetOnMobile}
      zIndexVariant={zIndexVariant}
    >
      <div className={styles.content}>
        <div className={styles.hintBar}>
          <span className={styles.hintText}>{t('notes:new-note-reflc-intro.title')}</span>
          <button
            type="button"
            onClick={() => setShowReflectionIntro(!showReflectionIntro)}
            className={styles.learnMoreLink}
          >
            {t('notes:new-note-reflc-intro.learn-more')}
          </button>
        </div>

        {showReflectionIntro && (
          <div className={styles.reflectionIntroContainer}>
            <ReflectionIntro />
          </div>
        )}

        <div className={styles.textAreaContainer}>
          <TextArea
            id="note-reflection-textarea"
            placeholder={t('notes:body-placeholder')}
            value={body}
            onChange={setBody}
            size={TextAreaSize.Large}
          />
        </div>

        <div className={styles.actionsContainer}>
          <Button
            type={ButtonType.Secondary}
            variant="outlined"
            onClick={handleSaveAndPost}
            isLoading={isAddingNote}
            isDisabled={isAddingNote}
            className={styles.saveAndPostButton}
          >
            {t('notes:save-post-to-qr')}
          </Button>
          <Button
            type={ButtonType.Primary}
            onClick={handleSavePrivately}
            isLoading={isAddingNote}
            isDisabled={isAddingNote}
            className={styles.savePrivatelyButton}
          >
            {t('notes:save-privately')}
          </Button>
        </div>
      </div>
    </ContentModal>
  );
};

export default NewNoteReflectionModal;
