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
import {
  getCorpusQuranUrl,
  getLegacyQuranUrl,
  getNuqayahUrl,
  getQuranAndroidUrl,
  getQuranIosUrl,
  getQuranReflectUrl,
  getQuranUrl,
  getSunnahUrl,
} from '@/utils/navigation';

interface OurProjectsCollapsibleProps {
  headerClassName?: string;
  headerLeftClassName?: string;
  contentClassName?: string;
  itemTitleClassName?: string;
  descriptionClassName?: string;
}

const PROJECTS = [
  {
    title: 'Quran.com',
    href: getQuranUrl(),
    eventName: 'navigation_drawer_project_quran_com',
  },
  {
    title: 'Quran For Android',
    href: getQuranAndroidUrl(),
    eventName: 'navigation_drawer_project_quran_android',
  },
  {
    title: 'Quran iOS',
    href: getQuranIosUrl(),
    eventName: 'navigation_drawer_project_quran_ios',
  },
  {
    title: 'QuranReflect.com',
    href: getQuranReflectUrl(),
    eventName: 'navigation_drawer_project_quran_reflect',
  },
  {
    title: 'Sunnah.com',
    href: getSunnahUrl(),
    eventName: 'navigation_drawer_project_sunnah',
  },
  {
    title: 'Nuqayah.com',
    href: getNuqayahUrl(),
    eventName: 'navigation_drawer_project_nuqayah',
  },
  {
    title: 'Legacy.quran.com',
    href: getLegacyQuranUrl(),
    eventName: 'navigation_drawer_project_legacy',
  },
  {
    title: 'Corpus.quran.com',
    href: getCorpusQuranUrl(),
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
    if (isOpen) {
      logEvent('navigation_drawer_our_projects_expanded');
      return;
    }
    logEvent('navigation_drawer_our_projects_collapsed');
  };

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
                    <Link href="https://quran.foundation" variant={LinkVariant.Blend} isNewTab />
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
