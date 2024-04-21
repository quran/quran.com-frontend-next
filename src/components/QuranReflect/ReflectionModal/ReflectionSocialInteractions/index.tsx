import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './ReflectionSocialInteractions.module.scss';

import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import ChatIcon from '@/icons/chat.svg';
import LoveIcon from '@/icons/love.svg';
import AyahReflection from '@/types/QuranReflect/AyahReflection';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { getQuranReflectPostUrl } from '@/utils/quranReflect/navigation';

type Props = {
  reflection: AyahReflection;
};

const ReflectionSocialInteractions: React.FC<Props> = ({ reflection }) => {
  const { lang, t } = useTranslation('notes');

  const onLikesCountClicked = (e) => {
    e.stopPropagation();
    logButtonClick('reflection_likes', {
      postId: reflection.id,
    });
  };

  const onCommentsCountClicked = (e) => {
    e.stopPropagation();
    logButtonClick('reflection_comments', {
      postId: reflection.id,
    });
  };

  const onViewOnQrClicked = (e) => {
    e.stopPropagation();
    logButtonClick('posted_ref_view_on_qr', {
      postId: reflection.id,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.socialInteractionContainer}>
        <Button
          className={styles.actionItemContainer}
          variant={ButtonVariant.Compact}
          href={getQuranReflectPostUrl(reflection.id)}
          isNewTab
          prefix={<LoveIcon />}
          size={ButtonSize.Small}
          onClick={onLikesCountClicked}
          shouldFlipOnRTL={false}
        >
          {toLocalizedNumber(reflection.likes, lang)}
        </Button>
        <Button
          className={styles.actionItemContainer}
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
      <Button
        size={ButtonSize.Small}
        href={getQuranReflectPostUrl(reflection.id)}
        isNewTab
        onClick={onViewOnQrClicked}
      >
        {t('notes:view-on-qr')}
      </Button>
    </div>
  );
};

export default ReflectionSocialInteractions;
