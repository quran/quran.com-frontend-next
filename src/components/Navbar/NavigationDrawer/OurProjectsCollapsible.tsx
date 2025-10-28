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

  const onQuranComClick = () => logButtonClick('navigation_drawer_project_quran_com');
  const onQuranAndroidClick = () => logButtonClick('navigation_drawer_project_quran_android');
  const onQuranIosClick = () => logButtonClick('navigation_drawer_project_quran_ios');
  const onQuranReflectClick = () => logButtonClick('navigation_drawer_project_quran_reflect');
  const onSunnahClick = () => logButtonClick('navigation_drawer_project_sunnah');
  const onNuqayahClick = () => logButtonClick('navigation_drawer_project_nuqayah');
  const onLegacyClick = () => logButtonClick('navigation_drawer_project_legacy');
  const onCorpusClick = () => logButtonClick('navigation_drawer_project_corpus');

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
            <NavigationDrawerItem
              title="Quran.com"
              titleClassName={itemTitleClassName}
              icon={<IconArrowRight />}
              href="https://quran.com"
              isExternalLink
              onClick={onQuranComClick}
            />
            <NavigationDrawerItem
              title="Quran For Android"
              titleClassName={itemTitleClassName}
              icon={<IconArrowRight />}
              href="https://play.google.com/store/apps/details?id=com.quran.labs.androidquran&hl=en&pli=1"
              isExternalLink
              onClick={onQuranAndroidClick}
            />
            <NavigationDrawerItem
              title="Quran iOS"
              titleClassName={itemTitleClassName}
              icon={<IconArrowRight />}
              href="https://apps.apple.com/us/app/quran-by-quran-com-%D9%82%D8%B1%D8%A2%D9%86/id1118663303"
              isExternalLink
              onClick={onQuranIosClick}
            />
            <NavigationDrawerItem
              title="QuranReflect.com"
              titleClassName={itemTitleClassName}
              icon={<IconArrowRight />}
              href="https://quranreflect.com/"
              isExternalLink
              onClick={onQuranReflectClick}
            />
            <NavigationDrawerItem
              title="Sunnah.com"
              titleClassName={itemTitleClassName}
              icon={<IconArrowRight />}
              href="https://sunnah.com/"
              isExternalLink
              onClick={onSunnahClick}
            />
            <NavigationDrawerItem
              title="Nuqayah.com"
              titleClassName={itemTitleClassName}
              icon={<IconArrowRight />}
              href="https://nuqayah.com/"
              isExternalLink
              onClick={onNuqayahClick}
            />
            <NavigationDrawerItem
              title="Legacy.quran.com"
              titleClassName={itemTitleClassName}
              icon={<IconArrowRight />}
              href="https://legacy.quran.com"
              isExternalLink
              onClick={onLegacyClick}
            />
            <NavigationDrawerItem
              title="Corpus.quran.com"
              titleClassName={itemTitleClassName}
              icon={<IconArrowRight />}
              href="https://corpus.quran.com"
              isExternalLink
              onClick={onCorpusClick}
            />
          </div>
        );
      }}
    </Collapsible>
  );
};

export default OurProjectsCollapsible;
