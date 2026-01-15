import React, { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import MoreMenuCollapsible from './MoreMenuCollapsible';
import NavigationDrawerItem from './NavigationDrawerItem';
import OurProjectsCollapsible from './OurProjectsCollapsible';

import useGetContinueReadingUrl from '@/hooks/useGetContinueReadingUrl';
import IconBookmarkFilled from '@/icons/bookmark_filled.svg';
import IconCode from '@/icons/code.svg';
import IconHeadphonesFilled from '@/icons/headphones-filled.svg';
import IconHome from '@/icons/home.svg';
import IconSchool from '@/icons/school.svg';
import { setIsNavigationDrawerOpen } from '@/redux/slices/navbar';
import { logButtonClick } from '@/utils/eventLogger';
import {
  DEVELOPERS_URL,
  getProfileNavigationUrl,
  LEARNING_PLANS_URL,
  RADIO_URL,
  RECITERS_URL,
} from '@/utils/navigation';

interface NavigationDrawerListProps {
  accordionHeaderClassName?: string;
  accordionHeaderLeftClassName?: string;
  accordionContentClassName?: string;
  accordionItemTitleClassName?: string;
  projectsDescClassName?: string;
}

const NavigationDrawerList: React.FC<NavigationDrawerListProps> = ({
  accordionHeaderClassName,
  accordionHeaderLeftClassName,
  accordionContentClassName,
  accordionItemTitleClassName,
  projectsDescClassName,
}) => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const continueReadingUrl = useGetContinueReadingUrl();

  const ITEMS = [
    {
      title: t('read'),
      icon: <IconHome />,
      href: continueReadingUrl,
      eventName: 'navigation_drawer_read',
    },
    {
      title: t('learn'),
      icon: <IconSchool />,
      href: LEARNING_PLANS_URL,
      eventName: 'navigation_drawer_learn',
    },
    {
      title: t('my-quran'),
      icon: <IconBookmarkFilled />,
      href: getProfileNavigationUrl(),
      eventName: 'navigation_drawer_my_quran',
    },
    {
      title: t('quran-radio'),
      icon: <IconHeadphonesFilled />,
      href: RADIO_URL,
      eventName: 'navigation_drawer_quran_radio',
    },
    {
      title: t('reciters'),
      icon: <IconHeadphonesFilled />,
      href: RECITERS_URL,
      eventName: 'navigation_drawer_reciters',
    },
    {
      title: t('developers'),
      icon: <IconCode />,
      href: DEVELOPERS_URL,
      eventName: 'navigation_drawer_developers',
    },
  ];

  const handleItemClick = useCallback(
    (eventName: string) => {
      dispatch(setIsNavigationDrawerOpen(false));
      logButtonClick(eventName);
    },
    [dispatch],
  );

  return (
    <>
      {ITEMS.map((item) => (
        <NavigationDrawerItem
          key={item.eventName}
          title={item.title}
          icon={item.icon}
          href={item.href}
          onClick={() => handleItemClick(item.eventName)}
        />
      ))}
      <MoreMenuCollapsible
        onItemClick={handleItemClick}
        headerClassName={accordionHeaderClassName}
        headerLeftClassName={accordionHeaderLeftClassName}
        contentClassName={accordionContentClassName}
        itemTitleClassName={accordionItemTitleClassName}
      />
      <OurProjectsCollapsible
        onItemClick={handleItemClick}
        headerClassName={accordionHeaderClassName}
        headerLeftClassName={accordionHeaderLeftClassName}
        descriptionClassName={projectsDescClassName}
        contentClassName={accordionContentClassName}
        itemTitleClassName={accordionItemTitleClassName}
      />
    </>
  );
};

export default NavigationDrawerList;
