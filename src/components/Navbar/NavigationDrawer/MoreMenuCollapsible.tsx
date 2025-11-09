import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import NavigationDrawerItem from './NavigationDrawerItem';

import Collapsible from '@/dls/Collapsible/Collapsible';
import IconArrowRight from '@/icons/arrow-right.svg';
import IconCaretDown from '@/icons/caret-down.svg';
import IconSquareMore from '@/icons/square-more.svg';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import {
  DEVELOPERS_URL,
  EXTERNAL_ROUTES,
  PRODUCT_UPDATES_URL,
  SUPPORT_URL,
} from '@/utils/navigation';

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

  const MENUS = [
    {
      title: t('developers'),
      icon: <IconArrowRight />,
      href: DEVELOPERS_URL,
      eventName: 'navigation_drawer_developers',
    },
    {
      title: t('product-updates'),
      icon: <IconArrowRight />,
      href: PRODUCT_UPDATES_URL,
      eventName: 'navigation_drawer_product_updates',
    },
    {
      title: t('feedback'),
      icon: <IconArrowRight />,
      href: EXTERNAL_ROUTES.FEEDBACK,
      eventName: 'navigation_drawer_feedback',
      isExternalLink: true,
    },
    {
      title: t('help'),
      icon: <IconArrowRight />,
      href: SUPPORT_URL,
      eventName: 'navigation_drawer_help',
    },
  ];

  return (
    <Collapsible
      headerClassName={headerClassName}
      headerLeftClassName={headerLeftClassName}
      title={<NavigationDrawerItem title={t('more')} icon={<IconSquareMore />} />}
      suffix={<IconCaretDown />}
      shouldRotateSuffixOnToggle
      shouldSuffixTrigger
      onOpenChange={onOpenChange}
    >
      {({ isOpen }) => {
        if (!isOpen) return null;

        return (
          <div className={contentClassName}>
            {MENUS.map((menu) => (
              <NavigationDrawerItem
                key={menu.eventName}
                title={menu.title}
                titleClassName={itemTitleClassName}
                icon={menu.icon}
                href={menu.href}
                onClick={() => logButtonClick(menu.eventName)}
                isExternalLink={menu.isExternalLink}
              />
            ))}
          </div>
        );
      }}
    </Collapsible>
  );
};

export default MoreMenuCollapsible;
