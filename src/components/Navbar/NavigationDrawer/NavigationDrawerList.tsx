import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import MoreMenuCollapsible from './MoreMenuCollapsible';
import NavigationDrawerItem from './NavigationDrawerItem';
import OurProjectsCollapsible from './OurProjectsCollapsible';

import useGetContinueReadingUrl from '@/hooks/useGetContinueReadingUrl';
import IconAbout from '@/icons/about.svg';
import IconBookmark from '@/icons/bookmark.svg';
import IconHeadphones from '@/icons/headphones.svg';
import IconHome from '@/icons/home.svg';
import IconSchool from '@/icons/school.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { getProfileNavigationUrl } from '@/utils/navigation';

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

  const onReadClick = () => logButtonClick('navigation_drawer_read');
  const onLearnClick = () => logButtonClick('navigation_drawer_learn');
  const onMyQuranClick = () => logButtonClick('navigation_drawer_my_quran');
  const onRadioClick = () => logButtonClick('navigation_drawer_quran_radio');
  const onRecitersClick = () => logButtonClick('navigation_drawer_reciters');
  const onAboutClick = () => logButtonClick('navigation_drawer_about');

  return (
    <>
      <NavigationDrawerItem
        title={t('read')}
        icon={<IconHome />}
        href={continueReadingUrl}
        onClick={onReadClick}
      />
      <NavigationDrawerItem
        title={t('learn')}
        icon={<IconSchool />}
        href="/learning-plans"
        onClick={onLearnClick}
      />
      <NavigationDrawerItem
        title={t('my-quran')}
        icon={<IconBookmark />}
        href={getProfileNavigationUrl()}
        onClick={onMyQuranClick}
      />
      <NavigationDrawerItem
        title={t('quran-radio')}
        icon={<IconHeadphones />}
        href="/radio"
        onClick={onRadioClick}
      />
      <NavigationDrawerItem
        title={t('reciters')}
        icon={<IconHeadphones />}
        href="/reciters"
        onClick={onRecitersClick}
      />
      <NavigationDrawerItem
        title={t('about')}
        icon={<IconAbout />}
        href="/about-us"
        onClick={onAboutClick}
      />
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
