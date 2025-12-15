import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import MoreMenuCollapsible from './MoreMenuCollapsible';
import NavigationDrawerItem from './NavigationDrawerItem';
import OurProjectsCollapsible from './OurProjectsCollapsible';

import useGetContinueReadingUrl from '@/hooks/useGetContinueReadingUrl';
import IconAbout from '@/icons/about.svg';
import IconBookmarkFilled from '@/icons/bookmark_filled.svg';
import IconHeadphonesFilled from '@/icons/headphones-filled.svg';
import IconHome from '@/icons/home.svg';
import IconSchool from '@/icons/school.svg';
import { logButtonClick } from '@/utils/eventLogger';
import {
  ABOUT_US_URL,
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
      title: t('about'),
      icon: <IconAbout />,
      href: ABOUT_US_URL,
      eventName: 'navigation_drawer_about',
    },
  ];

  return (
    <>
      {ITEMS.map((item) => (
        <NavigationDrawerItem
          key={item.eventName}
          title={item.title}
          icon={item.icon}
          href={item.href}
          onClick={() => logButtonClick(item.eventName)}
        />
      ))}
      <MoreMenuCollapsible
        headerClassName={accordionHeaderClassName}
        headerLeftClassName={accordionHeaderLeftClassName}
        contentClassName={accordionContentClassName}
        itemTitleClassName={accordionItemTitleClassName}
      />
      <OurProjectsCollapsible
        headerClassName={accordionHeaderClassName}
        headerLeftClassName={accordionHeaderLeftClassName}
        contentClassName={accordionContentClassName}
        itemTitleClassName={accordionItemTitleClassName}
        descriptionClassName={projectsDescClassName}
      />
    </>
  );
};

export default NavigationDrawerList;
