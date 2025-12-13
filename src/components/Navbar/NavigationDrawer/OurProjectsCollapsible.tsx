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
import { EXTERNAL_ROUTES, QURAN_URL } from '@/utils/navigation';

interface ProjectItem {
  title: string;
  href: string;
  eventName: string;
}

interface OurProjectsCollapsibleProps {
  headerClassName?: string;
  headerLeftClassName?: string;
  contentClassName?: string;
  itemTitleClassName?: string;
  descriptionClassName?: string;
}

const PROJECTS: ProjectItem[] = [
  {
    title: 'Quran.com',
    href: QURAN_URL,
    eventName: 'navigation_drawer_project_quran_com',
  },
  {
    title: 'Quran For Android',
    href: EXTERNAL_ROUTES.QURAN_ANDROID,
    eventName: 'navigation_drawer_project_quran_android',
  },
  {
    title: 'Quran iOS',
    href: EXTERNAL_ROUTES.QURAN_IOS,
    eventName: 'navigation_drawer_project_quran_ios',
  },
  {
    title: 'QuranReflect.com',
    href: EXTERNAL_ROUTES.QURAN_REFLECT,
    eventName: 'navigation_drawer_project_quran_reflect',
  },
  {
    title: 'Sunnah.com',
    href: EXTERNAL_ROUTES.SUNNAH,
    eventName: 'navigation_drawer_project_sunnah',
  },
  {
    title: 'Nuqayah.com',
    href: EXTERNAL_ROUTES.NUQAYAH,
    eventName: 'navigation_drawer_project_nuqayah',
  },
  {
    title: 'Legacy.quran.com',
    href: EXTERNAL_ROUTES.LEGACY_QURAN_COM,
    eventName: 'navigation_drawer_project_legacy',
  },
  {
    title: 'Corpus.quran.com',
    href: EXTERNAL_ROUTES.CORPUS_QURAN_COM,
    eventName: 'navigation_drawer_project_corpus',
  },
];

const OurProjectsCollapsible: React.FC<OurProjectsCollapsibleProps> = ({
  headerClassName,
  headerLeftClassName,
  contentClassName,
  itemTitleClassName,
  descriptionClassName,
}) => {
  const { t } = useTranslation('common');

  const onOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      logEvent('navigation_drawer_our_projects_collapsed');
      return;
    }
    logEvent('navigation_drawer_our_projects_expanded');
  };

  const handleProjectClick = (eventName: string) => () => {
    logButtonClick(eventName);
  };

  return (
    <Collapsible
      id="navigation-links-our-projects"
      headerClassName={headerClassName}
      headerLeftClassName={headerLeftClassName}
      title={
        <NavigationDrawerItem
          shouldKeepStyleWithoutHrefOnHover
          title={t('our-projects')}
          icon={<IconSquareMore />}
        />
      }
      suffix={<IconCaretDown />}
      shouldRotateSuffixOnToggle
      shouldSuffixTrigger
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
                    <Link
                      href={EXTERNAL_ROUTES.QURAN_FOUNDATION}
                      variant={LinkVariant.Blend}
                      isNewTab
                    />
                  ),
                }}
              />
            </p>
            {PROJECTS.map((project) => (
              <NavigationDrawerItem
                key={project.eventName}
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
