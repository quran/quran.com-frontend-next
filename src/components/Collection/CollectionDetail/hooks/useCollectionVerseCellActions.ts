import { useCallback, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import buildVerseCopyText from '../utils/buildVerseCopyText';
import fetchVerseForCopy from '../utils/fetchVerseForCopy';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { RootState } from '@/redux/RootState';
import { areArraysEqual } from '@/utils/array';
import { textToBlob } from '@/utils/blob';
import copyText from '@/utils/copyText';
import { logButtonClick } from '@/utils/eventLogger';
import { QURAN_URL, getVerseNavigationUrlByVerseKey } from '@/utils/navigation';
import Chapter from 'types/Chapter';

type UseCollectionVerseCellActionsProps = {
  bookmarkId: string;
  verseKey: string;
  collectionId: string;
  chapterData?: Chapter;
  onShare?: (verseKey: string) => void;
  onDelete?: (bookmarkId: string) => void;
};

type UseCollectionVerseCellActionsReturn = {
  isDeleteModalOpen: boolean;
  handleDelete: () => void;
  handleDeleteConfirm: () => void;
  handleDeleteCancel: () => void;
  handleCopy: () => void;
  handleShare: () => void;
};

const useCollectionVerseCellActions = ({
  bookmarkId,
  verseKey,
  collectionId,
  chapterData,
  onShare,
  onDelete,
}: UseCollectionVerseCellActionsProps): UseCollectionVerseCellActionsReturn => {
  const { t, lang } = useTranslation();
  const toast = useToast();
  const selectedTranslations = useSelector(
    (state: RootState) => state.translations?.selectedTranslations ?? [],
    areArraysEqual,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDelete = useCallback(() => {
    logButtonClick('collection_detail_delete_menu');
    setIsDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    logButtonClick('bookmark_delete_confirm', { verseKey, collectionId });
    setIsDeleteModalOpen(false);
    onDelete?.(bookmarkId);
  }, [bookmarkId, collectionId, onDelete, verseKey]);

  const handleDeleteCancel = useCallback(() => {
    logButtonClick('bookmark_delete_confirm_cancel', { verseKey, collectionId });
    setIsDeleteModalOpen(false);
  }, [collectionId, verseKey]);

  const handleCopy = useCallback((): void => {
    // Build the blob promise and invoke clipboard copy immediately to preserve user activation.
    const textBlobPromise = (async () => {
      const verse = await fetchVerseForCopy(verseKey, (selectedTranslations as number[]) || []);
      const qdcUrl = `${QURAN_URL}${getVerseNavigationUrlByVerseKey(verseKey)}`;
      const text = buildVerseCopyText({ verse, chapter: chapterData, lang, qdcUrl });
      return textToBlob(text);
    })();

    const copyPromise = copyText(textBlobPromise);

    copyPromise
      .then(() => {
        toast(`${t('common:copied')}!`, { status: ToastStatus.Success });
      })
      .catch(() => {
        toast(t('common:error.general'), { status: ToastStatus.Error });
      });
  }, [chapterData, lang, selectedTranslations, t, toast, verseKey]);

  const handleShare = useCallback(() => {
    logButtonClick('collection_detail_share_menu', { verseKey, collectionId });
    onShare?.(verseKey);
  }, [collectionId, onShare, verseKey]);

  return {
    isDeleteModalOpen,
    handleDelete,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleCopy,
    handleShare,
  };
};

export default useCollectionVerseCellActions;
