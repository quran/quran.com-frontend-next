import React from 'react';

import clipboardCopy from 'clipboard-copy';
import useTranslation from 'next-translate/useTranslation';

import styles from './SocialInteraction.module.scss';

import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import ChatIcon from '@/icons/chat.svg';
import CopyLinkIcon from '@/icons/copy-link.svg';
import CopyIcon from '@/icons/copy.svg';
import LoveIcon from '@/icons/love.svg';
import ShareIcon from '@/icons/share.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { getQuranReflectPostUrl } from '@/utils/quranReflect/navigation';
import { getCopyReflectionContent } from '@/utils/quranReflect/string';
import { stripHTMLTags } from '@/utils/string';
import ReflectionFilter from 'types/QuranReflect/ReflectionFilter';
import TrimmedCitationTexts from 'types/QuranReflect/TrimmedCitationTexts';

type Props = {
  likesCount: number;
  commentsCount: number;
  postId: number;
  reflectionText: string;
  trimmedCitationTexts: TrimmedCitationTexts;
  filters: ReflectionFilter[];
};

const SocialInteraction: React.FC<Props> = ({
  likesCount,
  commentsCount,
  postId,
  reflectionText,
  trimmedCitationTexts,
  filters,
}) => {
  const { t, lang } = useTranslation();
  const toast = useToast();

  const onLikesCountClicked = () => {
    logButtonClick('reflection_item_likes');
  };

  const onCommentsCountClicked = () => {
    logButtonClick('reflection_item_comments');
  };

  const onCopyTextClicked = () => {
    logButtonClick('reflection_item_copy_text');
    clipboardCopy(
      stripHTMLTags(
        // eslint-disable-next-line i18next/no-literal-string
        `${reflectionText}\r\n\r\n${getCopyReflectionContent(
          trimmedCitationTexts,
          filters,
        )}\r\n\r\n${getQuranReflectPostUrl(postId)}`,
      ),
    ).then(() => toast(t('quran-reader:text-copied'), { status: ToastStatus.Success }));
  };

  const onCopyLinkClicked = () => {
    logButtonClick('reflection_item_copy_link');
    clipboardCopy(getQuranReflectPostUrl(postId)).then(() =>
      toast(t('common:shared'), { status: ToastStatus.Success }),
    );
  };
  return (
    <div className={styles.socialInteractionContainer}>
      <Button
        className={styles.actionItemContainer}
        variant={ButtonVariant.Compact}
        href={getQuranReflectPostUrl(postId)}
        isNewTab
        prefix={<LoveIcon />}
        size={ButtonSize.Small}
        onClick={onLikesCountClicked}
        shouldFlipOnRTL={false}
      >
        {toLocalizedNumber(likesCount, lang)}
      </Button>
      <Button
        className={styles.actionItemContainer}
        variant={ButtonVariant.Compact}
        prefix={<ChatIcon />}
        href={getQuranReflectPostUrl(postId, true)}
        isNewTab
        size={ButtonSize.Small}
        onClick={onCommentsCountClicked}
        shouldFlipOnRTL={false}
      >
        {toLocalizedNumber(commentsCount, lang)}
      </Button>

      <PopoverMenu
        isPortalled={false}
        trigger={
          <Button
            className={styles.actionItemContainer}
            variant={ButtonVariant.Compact}
            size={ButtonSize.Small}
            tooltip={t('common:share')}
            shouldFlipOnRTL={false}
          >
            <ShareIcon />
          </Button>
        }
      >
        <PopoverMenu.Item
          shouldCloseMenuAfterClick
          icon={<CopyLinkIcon />}
          onClick={onCopyLinkClicked}
          className={styles.item}
        >
          {t('quran-reader:cpy-link')}
        </PopoverMenu.Item>
        <PopoverMenu.Item
          shouldCloseMenuAfterClick
          icon={<CopyIcon />}
          onClick={onCopyTextClicked}
          className={styles.item}
        >
          {t('quran-reader:copy-text')}
        </PopoverMenu.Item>
      </PopoverMenu>
    </div>
  );
};

export default SocialInteraction;
