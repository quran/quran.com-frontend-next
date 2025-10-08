import React from 'react';

import clipboardCopy from 'clipboard-copy';
import useTranslation from 'next-translate/useTranslation';

import styles from '../SocialInteraction.module.scss';

import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import CopyLinkIcon from '@/icons/copy-link.svg';
import CopyIcon from '@/icons/copy.svg';
import ShareIcon from '@/icons/share.svg';
import { logErrorToSentry } from '@/lib/sentry';
import Reference from '@/types/QuranReflect/Reference';
import { logButtonClick } from '@/utils/eventLogger';
import { getQuranReflectPostUrl } from '@/utils/quranReflect/navigation';
import { getCopyReflectionContent } from '@/utils/quranReflect/string';
import { stripHTMLTags } from '@/utils/string';

type Props = {
  postId: number;
  reflectionText: string;
  references: Reference[];
  isFetching: boolean;
  versesData: Record<number, any[]> | undefined;
  chaptersData: any;
  onShareMenuOpen: () => void;
};

const ReflectionSharePopoverMenu: React.FC<Props> = ({
  postId,
  reflectionText,
  references,
  isFetching,
  versesData,
  chaptersData,
  onShareMenuOpen,
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const reflectionPostUrl = getQuranReflectPostUrl(postId);

  const onCopyTextClicked = () => {
    logButtonClick('reflection_item_copy_text');
    clipboardCopy(
      stripHTMLTags(
        `${reflectionText}\r\n\r\n${getCopyReflectionContent(
          versesData || {},
          chaptersData,
          references,
        )}\r\n\r\n${reflectionPostUrl}`,
      ),
    )
      .then(() => toast(t('quran-reader:text-copied'), { status: ToastStatus.Success }))
      .catch((error) => {
        logErrorToSentry(error, {
          transactionName: 'copy_text',
          metadata: { postId, reflectionText },
        });
      });
  };

  const onCopyLinkClicked = () => {
    logButtonClick('reflection_item_copy_link');
    clipboardCopy(reflectionPostUrl).then(() =>
      toast(t('common:shared'), { status: ToastStatus.Success }),
    );
  };

  return (
    <PopoverMenu
      isPortalled={false}
      onOpenChange={(isOpen) => {
        if (isOpen) {
          onShareMenuOpen();
        }
      }}
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
        icon={isFetching ? <Spinner size={SpinnerSize.Small} /> : <CopyIcon />}
        onClick={onCopyTextClicked}
        className={styles.item}
        isDisabled={isFetching}
      >
        {t('quran-reader:copy-text')}
      </PopoverMenu.Item>
    </PopoverMenu>
  );
};

export default ReflectionSharePopoverMenu;
