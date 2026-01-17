import React, { useCallback, useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './Card.module.scss';

import InlineShowMore from '@/components/InlineShowMore';
import DataContext from '@/contexts/DataContext';
import Button, { ButtonSize, ButtonVariant, ButtonShape } from '@/dls/Button/Button';
import ChatIcon from '@/icons/chat.svg';
import LoveIcon from '@/icons/love.svg';
import QRColoredIcon from '@/icons/qr-colored.svg';
import AyahReflection from '@/types/QuranReflect/AyahReflection';
import { toSafeISOString, dateToMonthDayYearFormat } from '@/utils/datetime';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { getQuranReflectPostUrl } from '@/utils/quranReflect/navigation';
import { readableVerseRangeKeys } from '@/utils/verseKeys';

export interface ReflectionCardProps {
  reflection: AyahReflection;
  showReadMore?: boolean;
}

const ReflectionCard: React.FC<ReflectionCardProps> = ({ reflection, showReadMore = false }) => {
  const { t, lang } = useTranslation('notes');
  const chaptersData = useContext(DataContext);

  const formatReflectionTitle = useCallback(
    (ref: AyahReflection) => {
      if (!ref.references || ref.references.length === 0) return '';
      const rangeKeys = ref.references.map(
        (r) => `${r.chapterId}:${r.from}-${r.chapterId}:${r.to}`,
      );

      const readableRangeKeys = readableVerseRangeKeys(rangeKeys, chaptersData, lang);
      if (readableRangeKeys.length === 0) return '';
      if (readableRangeKeys.length === 1) return readableRangeKeys[0];
      return `${readableRangeKeys[0]} + ${toLocalizedNumber(readableRangeKeys.length - 1, lang)}`;
    },
    [chaptersData, lang],
  );

  const onViewOnQrClicked = (e) => {
    e.stopPropagation();
    logButtonClick('posted_ref_view_on_qr', { postId: reflection.id });
  };

  const onLikesCountClicked = (e) => {
    e.stopPropagation();
    logButtonClick('reflection_likes', { postId: reflection.id });
  };

  const onCommentsCountClicked = (e) => {
    e.stopPropagation();
    logButtonClick('reflection_comments', { postId: reflection.id });
  };

  return (
    <div
      key={reflection.id}
      className={styles.noteCard}
      data-testid={`reflection-card-${reflection.id}`}
    >
      <div className={styles.noteHeader}>
        <div className={styles.noteInfo}>
          <h3 className={styles.noteTitle}>{formatReflectionTitle(reflection)}</h3>
          <time className={styles.noteDate} dateTime={toSafeISOString(reflection.createdAt)}>
            {dateToMonthDayYearFormat(reflection.createdAt, lang)}
          </time>
        </div>
        <div className={styles.noteActions}>
          <Button
            variant={ButtonVariant.Ghost}
            size={ButtonSize.Small}
            shape={ButtonShape.Square}
            isNewTab
            href={getQuranReflectPostUrl(reflection.id)}
            tooltip={t('view-on-qr')}
            ariaLabel={t('view-on-qr')}
            onClick={onViewOnQrClicked}
            data-testid="qr-view-button"
          >
            <QRColoredIcon />
          </Button>
        </div>
      </div>

      <InlineShowMore
        lines={2}
        contentClassName={styles.noteText}
        showReadMore={showReadMore}
        data-testid="reflection-text"
      >
        {reflection.body}
      </InlineShowMore>

      <div className={styles.statsContainer}>
        <Button
          className={styles.stat}
          variant={ButtonVariant.Compact}
          href={getQuranReflectPostUrl(reflection.id)}
          isNewTab
          prefix={<LoveIcon />}
          size={ButtonSize.Small}
          onClick={onLikesCountClicked}
          shouldFlipOnRTL={false}
        >
          {toLocalizedNumber(reflection.likesCount, lang)}
        </Button>
        <Button
          className={styles.stat}
          variant={ButtonVariant.Compact}
          prefix={<ChatIcon />}
          href={getQuranReflectPostUrl(reflection.id, true)}
          isNewTab
          size={ButtonSize.Small}
          onClick={onCommentsCountClicked}
          shouldFlipOnRTL={false}
        >
          {toLocalizedNumber(reflection.commentsCount, lang)}
        </Button>
      </div>
    </div>
  );
};

export default ReflectionCard;
