import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import SaveToCollectionModal, {
  CollectionOption,
} from '@/components/Collection/SaveToCollectionModal/SaveToCollectionModal';
import AddNoteModal from '@/components/Notes/modal/AddNoteModal';
import EditNoteModal from '@/components/Notes/modal/EditNoteModal';
import modalStyles from '@/components/Notes/modal/Modal.module.scss';
import MyNotesModal from '@/components/Notes/modal/MyNotes';
import TranslationFeedbackModal from '@/components/Verse/TranslationFeedback/TranslationFeedbackModal';
import feedbackStyles from '@/components/Verse/TranslationFeedback/TranslationFeedbackAction.module.scss';
import feedbackModalStyles from '@/components/Verse/TranslationFeedback/TranslationFeedbackModal.module.scss';
import VerseAdvancedCopy from '@/components/Verse/AdvancedCopy/VerseAdvancedCopy';
import advancedCopyStyles from '@/components/Verse/VerseActionAdvancedCopy/VerseActionAdvancedCopy.module.scss';
import ContentModal from '@/dls/ContentModal/ContentModal';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import Action from '@/dls/Modal/Action';
import Footer from '@/dls/Modal/Footer';
import Spinner from '@/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useBookmarkCollections from '@/hooks/useBookmarkCollections';
import useCollections from '@/hooks/useCollections';
import useCountRangeNotes from '@/hooks/auth/useCountRangeNotes';
import ArrowIcon from '@/icons/arrow.svg';
import {
  closeVerseActionModal,
  selectVerseActionModalBookmarksRangeUrl,
  selectVerseActionModalEditingNote,
  selectVerseActionModalIsOpen,
  selectVerseActionModalIsTranslationView,
  selectVerseActionModalStudyModeRestoreState,
  selectVerseActionModalType,
  selectVerseActionModalVerse,
  selectVerseActionModalVerseKey,
  selectVerseActionModalWasOpenedFromStudyMode,
  setEditingNote,
  setModalType,
  VerseActionModalType,
} from '@/redux/slices/QuranReader/verseActionModal';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import {
  closeStudyMode,
  openStudyMode,
  selectStudyModeIsOpen,
} from '@/redux/slices/QuranReader/studyMode';
import { Note } from '@/types/auth/Note';
import { getMushafId } from '@/utils/api';
import { logEvent } from '@/utils/eventLogger';
import BookmarkType from 'types/BookmarkType';

/**
 * Global container for verse action modals (Notes, Translation Feedback, Save to Collection).
 * This component subscribes to Redux verseActionModal state and renders
 * the appropriate modal when it's open. It handles the relationship
 * between Study Mode and these modals.
 *
 * Mount this component at the same level as StudyModeContainer
 * so the modals persist when Study Mode closes.
 */
const VerseActionModalContainer: React.FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const toast = useToast();

  // Modal state selectors
  const isOpen = useSelector(selectVerseActionModalIsOpen);
  const modalType = useSelector(selectVerseActionModalType);
  const verseKey = useSelector(selectVerseActionModalVerseKey);
  const verse = useSelector(selectVerseActionModalVerse);
  const editingNote = useSelector(selectVerseActionModalEditingNote);
  const isTranslationView = useSelector(selectVerseActionModalIsTranslationView);
  const bookmarksRangeUrl = useSelector(selectVerseActionModalBookmarksRangeUrl);
  const wasOpenedFromStudyMode = useSelector(selectVerseActionModalWasOpenedFromStudyMode);
  const studyModeRestoreState = useSelector(selectVerseActionModalStudyModeRestoreState);
  const isStudyModeOpen = useSelector(selectStudyModeIsOpen);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);

  const hasClosedStudyModeRef = useRef(false);

  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;

  // ============ Notes Modal Logic ============
  const { data: notesCount } = useCountRangeNotes(
    isOpen && verseKey ? { from: verseKey, to: verseKey } : null,
  );

  // ============ Collection Modal Logic ============
  const { collections, addCollection } = useCollections({
    type: BookmarkType.Ayah,
  });

  const chapterId = verse ? Number(verse.chapterId) : 0;
  const verseNumber = verse?.verseNumber ?? 0;

  const {
    collectionIds: bookmarkCollectionIds,
    addToCollection,
    removeFromCollection,
  } = useBookmarkCollections({
    mushafId,
    key: chapterId,
    type: BookmarkType.Ayah,
    verseNumber,
    bookmarksRangeUrl,
  });

  // Close Study Mode in background after modal is open
  useEffect(() => {
    if (isOpen && wasOpenedFromStudyMode && isStudyModeOpen && !hasClosedStudyModeRef.current) {
      hasClosedStudyModeRef.current = true;
      dispatch(closeStudyMode());
    }
  }, [isOpen, wasOpenedFromStudyMode, isStudyModeOpen, dispatch]);

  // Reset the ref when modal closes
  useEffect(() => {
    if (!isOpen) {
      hasClosedStudyModeRef.current = false;
    }
  }, [isOpen]);

  // ============ Common Handlers ============
  const handleClose = useCallback(() => {
    dispatch(closeVerseActionModal());
  }, [dispatch]);

  const handleBackToStudyMode = useCallback(() => {
    dispatch(closeVerseActionModal());
    // Use studyModeRestoreState to restore Study Mode with correct verseKey and tab
    if (studyModeRestoreState) {
      dispatch(
        openStudyMode({
          verseKey: studyModeRestoreState.verseKey,
          activeTab: studyModeRestoreState.activeTab,
          highlightedWordLocation: studyModeRestoreState.highlightedWordLocation,
        }),
      );
    } else if (verseKey) {
      // Fallback to verseKey from modal state
      dispatch(openStudyMode({ verseKey }));
    }
  }, [dispatch, studyModeRestoreState, verseKey]);

  // ============ Notes Handlers ============
  const handleOpenMyNotes = useCallback(() => {
    dispatch(setModalType(VerseActionModalType.MY_NOTES));
  }, [dispatch]);

  const handleOpenAddNote = useCallback(() => {
    dispatch(setModalType(VerseActionModalType.ADD_NOTE));
  }, [dispatch]);

  const handleOpenEditNote = useCallback(
    (note: Note) => {
      dispatch(setEditingNote(note));
      dispatch(setModalType(VerseActionModalType.EDIT_NOTE));
    },
    [dispatch],
  );

  // ============ Feedback Handlers ============
  const getEventName = useCallback(
    (action: string) =>
      `${isTranslationView ? 'translation_view' : 'reading_view'}_translation_feedback_modal_${action}`,
    [isTranslationView],
  );

  const handleFeedbackClose = useCallback(() => {
    logEvent(getEventName('close'));
    handleClose();
  }, [getEventName, handleClose]);

  // ============ Advanced Copy Handlers ============
  const handleAdvancedCopyClose = useCallback(() => {
    logEvent(
      `${isTranslationView ? 'translation_view' : 'reading_view'}_advanced_copy_modal_close`,
    );
    handleClose();
  }, [isTranslationView, handleClose]);

  // ============ Collection Handlers ============
  const onCollectionToggled = useCallback(
    async (changedCollection: CollectionOption, newValue: boolean) => {
      if (newValue) {
        const success = await addToCollection(changedCollection.id);
        if (success) {
          toast(t('quran-reader:saved-to', { collectionName: changedCollection.name }), {
            status: ToastStatus.Success,
          });
        }
      } else {
        const success = await removeFromCollection(changedCollection.id);
        if (success) {
          toast(t('quran-reader:removed-from', { collectionName: changedCollection.name }), {
            status: ToastStatus.Success,
          });
        }
      }
    },
    [addToCollection, removeFromCollection, toast, t],
  );

  const onNewCollectionCreated = useCallback(
    async (newCollectionName: string) => {
      const newCollection = await addCollection(newCollectionName);
      if (newCollection) {
        await addToCollection(newCollection.id);
      }
    },
    [addCollection, addToCollection],
  );

  const modalCollections: CollectionOption[] = useMemo(
    () =>
      collections.map((collection) => ({
        id: collection.id,
        name: collection.name,
        checked: bookmarkCollectionIds?.includes(collection.id) ?? false,
      })),
    [collections, bookmarkCollectionIds],
  );

  const isCollectionDataReady = bookmarkCollectionIds !== undefined;

  // Don't render if modal is closed or missing required data
  if (!isOpen || !verseKey) {
    return null;
  }

  const count = notesCount?.[verseKey] ?? 0;

  // ============ Render Notes Modals ============
  if (
    modalType === VerseActionModalType.ADD_NOTE ||
    modalType === VerseActionModalType.MY_NOTES ||
    modalType === VerseActionModalType.EDIT_NOTE
  ) {
    return (
      <>
        <AddNoteModal
          isModalOpen={modalType === VerseActionModalType.ADD_NOTE}
          onModalClose={handleClose}
          onMyNotes={handleOpenMyNotes}
          notesCount={count}
          verseKey={verseKey}
          onBack={wasOpenedFromStudyMode ? handleBackToStudyMode : undefined}
        />

        <MyNotesModal
          isOpen={modalType === VerseActionModalType.MY_NOTES}
          onClose={handleClose}
          notesCount={count}
          onAddNote={handleOpenAddNote}
          onEditNote={handleOpenEditNote}
          verseKey={verseKey}
        />

        <EditNoteModal
          note={editingNote}
          isModalOpen={modalType === VerseActionModalType.EDIT_NOTE}
          onModalClose={handleClose}
          onMyNotes={handleOpenMyNotes}
        />
      </>
    );
  }

  // ============ Render Translation Feedback Modal ============
  if (modalType === VerseActionModalType.TRANSLATION_FEEDBACK) {
    return (
      <ContentModal
        isOpen
        header={
          wasOpenedFromStudyMode ? (
            <button
              type="button"
              className={classNames(modalStyles.headerButton, modalStyles.title)}
              onClick={handleBackToStudyMode}
            >
              <IconContainer
                icon={<ArrowIcon />}
                shouldForceSetColors={false}
                size={IconSize.Custom}
                className={modalStyles.arrowIcon}
              />
              {t('quran-reader:translation-feedback.title')}
            </button>
          ) : (
            <p className={feedbackStyles.title}>{t('quran-reader:translation-feedback.title')}</p>
          )
        }
        hasCloseButton
        onClose={handleFeedbackClose}
        onEscapeKeyDown={handleFeedbackClose}
        overlayClassName={feedbackStyles.overlay}
        headerClassName={feedbackStyles.headerClassName}
        closeIconClassName={feedbackStyles.closeIconContainer}
        contentClassName={classNames(feedbackStyles.content, feedbackStyles.formModalContent)}
        innerContentClassName={classNames(
          feedbackModalStyles.container,
          feedbackStyles.formModalContent,
        )}
      >
        <TranslationFeedbackModal verse={{ verseKey }} onClose={handleFeedbackClose} />
      </ContentModal>
    );
  }

  // ============ Render Save to Collection Modal ============
  if (modalType === VerseActionModalType.SAVE_TO_COLLECTION && isCollectionDataReady) {
    return (
      <SaveToCollectionModal
        isOpen
        onCollectionToggled={onCollectionToggled}
        onNewCollectionCreated={onNewCollectionCreated}
        onClose={handleClose}
        collections={modalCollections}
        verseKey={verseKey}
        onBack={wasOpenedFromStudyMode ? handleBackToStudyMode : undefined}
      />
    );
  }

  // ============ Render Advanced Copy Modal ============
  if (modalType === VerseActionModalType.ADVANCED_COPY && verse) {
    return (
      <ContentModal
        isOpen
        header={
          wasOpenedFromStudyMode ? (
            <button
              type="button"
              className={classNames(modalStyles.headerButton, modalStyles.title)}
              onClick={handleBackToStudyMode}
            >
              <IconContainer
                icon={<ArrowIcon />}
                shouldForceSetColors={false}
                size={IconSize.Custom}
                className={modalStyles.arrowIcon}
              />
              {t('quran-reader:advanced-copy')}
            </button>
          ) : (
            <p className={advancedCopyStyles.header}>{t('quran-reader:advanced-copy')}</p>
          )
        }
        hasCloseButton
        onClose={handleAdvancedCopyClose}
        onEscapeKeyDown={handleAdvancedCopyClose}
        contentClassName={advancedCopyStyles.contentWrapper}
      >
        <VerseAdvancedCopy verse={verse}>
          {({ ayahSelectionComponent, actionText, onCopy, loading }) => (
            <>
              {ayahSelectionComponent}
              <div className={advancedCopyStyles.footerContainer}>
                <Footer>
                  <Action isDisabled={loading} onClick={onCopy}>
                    {loading ? <Spinner /> : actionText}
                  </Action>
                </Footer>
              </div>
            </>
          )}
        </VerseAdvancedCopy>
      </ContentModal>
    );
  }

  return null;
};

export default VerseActionModalContainer;
