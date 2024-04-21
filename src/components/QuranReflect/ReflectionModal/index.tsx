import { useRef } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './ReflectionModal.module.scss';

import useReflectionBodyParser from '@/components/QuranReflect/hooks/useReflectionBodyParser';
import ReflectionReferences from '@/components/QuranReflect/ReflectionReferences';
import ContentModal, { ContentModalSize } from '@/dls/ContentModal/ContentModal';
import ContentModalHandles from '@/dls/ContentModal/types/ContentModalHandles';
import AyahReflection from '@/types/QuranReflect/AyahReflection';
import { dateToReadableFormat } from '@/utils/datetime';

interface ReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reflection: AyahReflection;
}

const ReflectionModal: React.FC<ReflectionModalProps> = ({ onClose, isOpen, reflection }) => {
  const contentModalRef = useRef<ContentModalHandles>();
  const formattedText = useReflectionBodyParser(reflection.body, styles.hashtag);
  const { lang } = useTranslation();

  return (
    <ContentModal
      innerRef={contentModalRef}
      isOpen={isOpen}
      header={<div className={styles.headerContainer} />}
      hasCloseButton
      onClose={onClose}
      onEscapeKeyDown={onClose}
      size={ContentModalSize.MEDIUM}
    >
      {reflection.references && <ReflectionReferences references={reflection.references} />}
      <div className={styles.noteHeaderContainer}>
        <time className={styles.noteDate} dateTime={reflection.createdAt.toString()}>
          {dateToReadableFormat(reflection.createdAt, lang, {
            year: 'numeric',
            weekday: undefined,
            month: 'short',
          })}
        </time>
      </div>
      <span
        className={styles.noteBody}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: formattedText,
        }}
      />
    </ContentModal>
  );
};

export default ReflectionModal;
