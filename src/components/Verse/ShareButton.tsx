import React, { useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from '../QuranReader/TranslationView/TranslationViewCell.module.scss';

import ShareVerseActionsMenu from './OverflowVerseActionsMenuBody/ShareVerseActionsMenu';

import PopoverMenu from '@/components/dls/PopoverMenu/PopoverMenu';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import useIsMobile from '@/hooks/useIsMobile';
import ShareIcon from '@/icons/share.svg';
import { WordVerse } from '@/types/Word';
import { logButtonClick } from '@/utils/eventLogger';
import Verse from 'types/Verse';

type ShareButtonProps = {
  verse: WordVerse | Verse;
  isTranslationView?: boolean;
  isMenu?: boolean;
  onClick?: () => void;
};

/**
 * ShareButton component that displays a share button for a verse
 * Opens a ShareVerseActionsMenu when clicked
 * @returns {JSX.Element} JSX element containing the share button
 */
const ShareButton: React.FC<ShareButtonProps> = ({
  verse,
  isTranslationView = false,
  isMenu,
  onClick,
}) => {
  const { t } = useTranslation('common');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const onActionTriggered = () => {
    setIsMenuOpen(false);
  };

  const handleClick = () => {
    logButtonClick('verse_share_button');
    onClick?.();
    setIsMenuOpen(true);
  };

  const trigger = (
    <Button
      size={ButtonSize.Small}
      tooltip={isMobile ? undefined : t('share')}
      variant={ButtonVariant.Ghost}
      shape={ButtonShape.Circle}
      className={classNames(styles.iconContainer, styles.verseAction)}
      onClick={handleClick}
      shouldFlipOnRTL={false}
      ariaLabel={t('share')}
    >
      <span className={styles.icon}>
        <IconContainer
          icon={<ShareIcon />}
          color={IconColor.tertiary}
          size={IconSize.Custom}
          shouldFlipOnRTL={false}
        />
      </span>
    </Button>
  );

  if (!isMenu) {
    return trigger;
  }

  return (
    <PopoverMenu trigger={trigger} isOpen={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <ShareVerseActionsMenu
        onActionTriggered={onActionTriggered}
        verse={verse}
        isTranslationView={isTranslationView}
        setSelectedMenu={() => {}}
        hasBackButton={false}
      />
    </PopoverMenu>
  );
};

export default ShareButton;
