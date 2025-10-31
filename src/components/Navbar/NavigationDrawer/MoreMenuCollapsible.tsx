import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import NavigationDrawerItem from './NavigationDrawerItem';

import Collapsible from '@/dls/Collapsible/Collapsible';
import IconArrowRight from '@/icons/arrow-right.svg';
import IconCaretDown from '@/icons/caret-down.svg';
import IconSquareMore from '@/icons/square-more.svg';
import { logButtonClick, logEvent } from '@/utils/eventLogger';

interface MoreMenuCollapsibleProps {
  headerClassName?: string;
  headerLeftClassName?: string;
  contentClassName?: string;
  itemTitleClassName?: string;
}

const MoreMenuCollapsible: React.FC<MoreMenuCollapsibleProps> = ({
  headerClassName,
  headerLeftClassName,
  contentClassName,
  itemTitleClassName,
}) => {
  const { t } = useTranslation('common');

  const onOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      logEvent('navigation_drawer_more_menu_expanded');
      return;
    }
    logEvent('navigation_drawer_more_menu_collapsed');
  };

  const onDevelopersClick = () => logButtonClick('navigation_drawer_developers');
  const onProductUpdatesClick = () => logButtonClick('navigation_drawer_product_updates');
  const onFeedbackClick = () => logButtonClick('navigation_drawer_feedback');
  const onHelpClick = () => logButtonClick('navigation_drawer_help');

  return (
    <Collapsible
      headerClassName={headerClassName}
      headerLeftClassName={headerLeftClassName}
      title={<NavigationDrawerItem title={t('more')} icon={<IconSquareMore />} />}
      suffix={<IconCaretDown />}
      shouldRotateSuffixOnToggle
      onOpenChange={onOpenChange}
    >
      {({ isOpen }) => {
        if (!isOpen) return null;

        return (
          <div className={contentClassName}>
            <NavigationDrawerItem
              title={t('developers')}
              titleClassName={itemTitleClassName}
              icon={<IconArrowRight />}
              href="/developers"
              onClick={onDevelopersClick}
            />
            <NavigationDrawerItem
              title={t('product-updates')}
              titleClassName={itemTitleClassName}
              icon={<IconArrowRight />}
              href="/product-updates"
              onClick={onProductUpdatesClick}
            />
            <NavigationDrawerItem
              title={t('feedback')}
              titleClassName={itemTitleClassName}
              icon={<IconArrowRight />}
              href="https://feedback.quran.com"
              isExternalLink
              onClick={onFeedbackClick}
            />
            <NavigationDrawerItem
              title={t('help')}
              titleClassName={itemTitleClassName}
              icon={<IconArrowRight />}
              href="/support"
              onClick={onHelpClick}
            />
          </div>
        );
      }}
    </Collapsible>
  );
};

export default MoreMenuCollapsible;
