import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './UserPublicReflectionsListItem.module.scss';

import useReflectionBodyParser from '@/components/QuranReflect/hooks/useReflectionBodyParser';
import ReflectionSocialInteractions from '@/components/QuranReflect/ReflectionModal/ReflectionSocialInteractions';
import ReflectionReferenceIndicator from '@/components/QuranReflect/ReflectionReferenceIndicator';
import AyahReflection from '@/types/QuranReflect/AyahReflection';
import { dateToReadableFormat } from '@/utils/datetime';
import { logButtonClick } from '@/utils/eventLogger';
import truncate from '@/utils/html-truncate';

interface UserPublicReflectionsListItemProps {
  reflection: AyahReflection;
  setSelectedReflection: (reflection: AyahReflection) => void;
}

const MAX_BODY_SIZE = 250;

const UserPublicReflectionsListItem: React.FC<UserPublicReflectionsListItemProps> = ({
  reflection,
  setSelectedReflection,
}) => {
  const { lang, t } = useTranslation('notes');
  const formattedText = useReflectionBodyParser(reflection.body, styles.hashtag);

  const onReflectionClicked = (selectedReflection: AyahReflection) => {
    logButtonClick('public_reflection_list_item', {
      postId: selectedReflection.id,
    });
    setSelectedReflection(selectedReflection);
  };

  return (
    <div
      className={styles.note}
      key={reflection.id}
      role="button"
      tabIndex={0}
      onClick={() => onReflectionClicked(reflection)}
      onKeyDown={() => onReflectionClicked(reflection)}
    >
      {reflection.references && (
        <div className={styles.indicatorsContainer}>
          {reflection.references.map((reference) => {
            return <ReflectionReferenceIndicator key={reference.surahId} reference={reference} />;
          })}
        </div>
      )}
      <p>
        <span
          className={styles.noteBody}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: truncate(formattedText, MAX_BODY_SIZE),
          }}
        />
        {reflection.body.length > MAX_BODY_SIZE && (
          <span className={styles.seeMore}>{`  ${t('click-to-see-more')}`}</span>
        )}
      </p>
      <time className={styles.noteDate} dateTime={reflection.createdAt.toString()}>
        {dateToReadableFormat(reflection.createdAt, lang, {
          year: 'numeric',
        })}
      </time>
      <ReflectionSocialInteractions reflection={reflection} />
    </div>
  );
};

export default UserPublicReflectionsListItem;
