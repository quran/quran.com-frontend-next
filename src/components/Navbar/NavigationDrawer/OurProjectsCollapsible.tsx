import React from 'react';

import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import NavigationDrawerItem from './NavigationDrawerItem';

import Collapsible from '@/dls/Collapsible/Collapsible';
import Link, { LinkVariant } from '@/dls/Link/Link';
import IconArrowRight from '@/icons/arrow-right.svg';
import IconCaretDown from '@/icons/caret-down.svg';
import IconSquareMore from '@/icons/square-more.svg';
import { logButtonClick, logEvent } from '@/utils/eventLogger';

interface OurProjectsCollapsibleProps {
  headerClassName?: string;
  headerLeftClassName?: string;
  contentClassName?: string;
  itemTitleClassName?: string;
  descriptionClassName?: string;
}

const OurProjectsCollapsible: React.FC<OurProjectsCollapsibleProps> = ({
  headerClassName,
  headerLeftClassName,
  contentClassName,
  itemTitleClassName,
  descriptionClassName,
}) => {
  const { t } = useTranslation('common');

  const onOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      logEvent('navigation_drawer_our_projects_expanded');
      return;
    }
    logEvent('navigation_drawer_our_projects_collapsed');
  };

  const projects = [
    {
      title: 'Quran.com',
      href: 'https://quran.com',
      eventName: 'navigation_drawer_project_quran_com',
    },
    {
      title: 'Quran For Android',
      href: 'https://play.google.com/store/apps/details?id=com.quran.labs.androidquran&hl=en&pli=1',
      eventName: 'navigation_drawer_project_quran_android',
    },
    {
      title: 'Quran iOS',
      href: 'https://apps.apple.com/us/app/quran-by-quran-com-%D9%82%D8%B1%D8%A2%D9%86/id1118663303',
      eventName: 'navigation_drawer_project_quran_ios',
    },
    {
      title: 'QuranReflect.com',
      href: 'https://quranreflect.com/',
      eventName: 'navigation_drawer_project_quran_reflect',
    },
    {
      title: 'Sunnah.com',
      href: 'https://sunnah.com/',
      eventName: 'navigation_drawer_project_sunnah',
    },
    {
      title: 'Nuqayah.com',
      href: 'https://nuqayah.com/',
      eventName: 'navigation_drawer_project_nuqayah',
    },
    {
      title: 'Legacy.quran.com',
      href: 'https://legacy.quran.com',
      eventName: 'navigation_drawer_project_legacy',
    },
    {
      title: 'Corpus.quran.com',
      href: 'https://corpus.quran.com',
      eventName: 'navigation_drawer_project_corpus',
    },
  ];

  const handleProjectClick = (eventName: string) => () => {
    logButtonClick(eventName);
  };

  return (
    <Collapsible
      headerClassName={headerClassName}
      headerLeftClassName={headerLeftClassName}
      title={<NavigationDrawerItem title={t('our-projects')} icon={<IconSquareMore />} />}
      suffix={<IconCaretDown />}
      shouldRotateSuffixOnToggle
      onOpenChange={onOpenChange}
    >
      {({ isOpen }) => {
        if (!isOpen) return null;

        return (
          <div className={contentClassName}>
            <p className={descriptionClassName}>
              <Trans
                i18nKey="common:projects-desc"
                components={{
                  link: (
                    <Link href="https://quran.foundation" variant={LinkVariant.Blend} isNewTab />
                  ),
                }}
              />
            </p>
            {projects.map((project) => (
              <NavigationDrawerItem
                key={project.href}
                title={project.title}
                titleClassName={itemTitleClassName}
                icon={<IconArrowRight />}
                href={project.href}
                isExternalLink
                onClick={handleProjectClick(project.eventName)}
              />
            ))}
          </div>
        );
      }}
    </Collapsible>
  );
};

export default OurProjectsCollapsible;
