import React, { useRef, useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import ContentModal from '@/components/dls/ContentModal/ContentModal';
import PopoverMenu from '@/components/dls/PopoverMenu/PopoverMenu';
import ReflectionBodyContainer from '@/components/QuranReader/ReflectionView/ReflectionBodyContainer';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import ChatIcon from '@/icons/chat.svg';
import GraduationCapIcon from '@/icons/graduation-cap.svg';
import ContentType from '@/types/QuranReflect/ContentType';
import { logButtonClick } from '@/utils/eventLogger';
import {
  fakeNavigate,
  getVerseLessonNavigationUrl,
  getVerseReflectionNavigationUrl,
} from '@/utils/navigation';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';
import Verse from 'types/Verse';

interface Props {
  verse: Verse;
  onActionTriggered?: () => void;
}

const QuranReflectMenuItem: React.FC<Props> = ({ verse, onActionTriggered }) => {
  const { t, lang } = useTranslation('common');
  const router = useRouter();
  const [isReflectionModalOpen, setIsReflectionModalOpen] = useState(false);
  const [isLessonsModalOpen, setIsLessonsModalOpen] = useState(false);
  const { verseKey } = verse;

  const reflectionModalRef = useRef(null);
  const lessonsModalRef = useRef(null);

  const onReflectionClicked = () => {
    logButtonClick('reading_view_reflect');
    setIsReflectionModalOpen(true);
    fakeNavigate(getVerseReflectionNavigationUrl(verseKey), lang);
  };

  const onLessonsClicked = () => {
    logButtonClick('reading_view_lessons');
    setIsLessonsModalOpen(true);
    fakeNavigate(getVerseLessonNavigationUrl(verseKey), lang);
  };

  const onReflectionModalClose = () => {
    setIsReflectionModalOpen(false);
    fakeNavigate(router.asPath, lang);
    onActionTriggered?.();
  };

  const onLessonsModalClose = () => {
    setIsLessonsModalOpen(false);
    fakeNavigate(router.asPath, lang);
    onActionTriggered?.();
  };

  const [initialChapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);

  return (
    <>
      {/* Reflections Menu Item */}
      <PopoverMenu.Item
        icon={
          <IconContainer
            icon={<ChatIcon />}
            color={IconColor.tertiary}
            size={IconSize.Custom}
            shouldFlipOnRTL={false}
          />
        }
        onClick={onReflectionClicked}
      >
        {t('reflections')}
      </PopoverMenu.Item>

      {/* Lessons Menu Item */}
      <PopoverMenu.Item
        icon={
          <IconContainer
            icon={<GraduationCapIcon />}
            color={IconColor.tertiary}
            size={IconSize.Custom}
            shouldFlipOnRTL={false}
          />
        }
        onClick={onLessonsClicked}
      >
        {t('lessons')}
      </PopoverMenu.Item>

      {/* Reflection Modal */}
      <ReflectionBodyContainer
        initialChapterId={initialChapterId}
        initialVerseNumber={verseNumber}
        isModal
        scrollToTop={() => {
          reflectionModalRef.current?.scrollToTop();
        }}
        render={({ surahAndAyahSelection, body }) => (
          <ContentModal
            innerRef={reflectionModalRef}
            isOpen={isReflectionModalOpen}
            hasCloseButton
            onClose={onReflectionModalClose}
            onEscapeKeyDown={onReflectionModalClose}
            header={surahAndAyahSelection}
          >
            {body}
          </ContentModal>
        )}
      />

      {/* Lessons Modal */}
      <ReflectionBodyContainer
        initialChapterId={initialChapterId}
        initialVerseNumber={verseNumber}
        initialContentType={ContentType.LESSONS}
        isModal
        scrollToTop={() => {
          lessonsModalRef.current?.scrollToTop();
        }}
        render={({ surahAndAyahSelection, body }) => (
          <ContentModal
            innerRef={lessonsModalRef}
            isOpen={isLessonsModalOpen}
            hasCloseButton
            onClose={onLessonsModalClose}
            onEscapeKeyDown={onLessonsModalClose}
            header={surahAndAyahSelection}
          >
            {body}
          </ContentModal>
        )}
      />
    </>
  );
};

export default QuranReflectMenuItem;
