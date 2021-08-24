import React, { useCallback, useEffect } from 'react';
import Button, { ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import { selectNavbar, setIsNavigationDrawerOpen } from 'src/redux/slices/navbar';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Link from 'next/link';
import classNames from 'classnames';
import IconClose from '../../../../public/icons/close.svg';
import IconHome from '../../../../public/icons/home.svg';
import IconCollection from '../../../../public/icons/collection.svg';
import IconQ from '../../../../public/icons/Q.svg';
import IconInfo from '../../../../public/icons/info.svg';
import IconUpdates from '../../../../public/icons/updates.svg';
import IconDevelopers from '../../../../public/icons/developers.svg';
import IconDonate from '../../../../public/icons/donate.svg';
import IconLock from '../../../../public/icons/lock.svg';
import IconFeedback from '../../../../public/icons/feedback.svg';
import IconRadio2 from '../../../../public/icons/radio-2.svg';
import styles from './NavigationDrawer.module.scss';
import LanguageSelector from '../LanguageSelector';
import NavigationDrawerItem from './NavigationDrawerItem';
import MobileApps from './MobileApps';

const NavigationDrawer = () => {
  const isOpen = useSelector(selectNavbar).isNavigationDrawerOpen;
  const dispatch = useDispatch();
  const router = useRouter();

  const closeNavigationDrawer = useCallback(() => {
    dispatch({ type: setIsNavigationDrawerOpen.type, payload: false });
  }, [dispatch]);

  // Hide navbar after succesful navigation
  useEffect(() => {
    router.events.on('routeChangeComplete', () => {
      if (isOpen) {
        closeNavigationDrawer();
      }
    });
  }, [closeNavigationDrawer, router.events, isOpen]);

  return (
    <div className={classNames(styles.container, { [styles.containerOpen]: isOpen })}>
      <div className={styles.header}>
        <div className={styles.centerVertically}>
          <div className={styles.leftCTA}>
            <Link href="/">
              <a>
                <Button variant={ButtonVariant.Ghost} size={ButtonSize.Small}>
                  <IconQ />
                </Button>
              </a>
            </Link>
            <LanguageSelector />
          </div>
        </div>
        <div className={styles.centerVertically}>
          <div className={styles.rightCTA}>
            <Button
              variant={ButtonVariant.Ghost}
              size={ButtonSize.Small}
              onClick={closeNavigationDrawer}
            >
              <IconClose />
            </Button>
          </div>
        </div>
      </div>
      <div className={styles.listItemsContainer}>
        <h3 className={styles.subtitle}>Menu</h3>
        <NavigationDrawerItem title="Home" icon={<IconHome />} href="/" />
        <NavigationDrawerItem title="About us" icon={<IconInfo />} href="/about" />
        <NavigationDrawerItem title="Updates" icon={<IconUpdates />} href="/updates" />
        <NavigationDrawerItem title="Developers" icon={<IconDevelopers />} href="/developers" />
        <NavigationDrawerItem title="Contribute" icon={<IconDonate />} href="/contribute" />
        <NavigationDrawerItem title="Privacy" icon={<IconLock />} href="/privacy" />
        <NavigationDrawerItem title="Help & Feedback" icon={<IconFeedback />} href="/help" />
        <NavigationDrawerItem title="Quran Radio" icon={<IconRadio2 />} />
        <h3 className={styles.subtitle}>Selected Collections</h3>
        <NavigationDrawerItem title="Duaas" icon={<IconCollection />} />
        <NavigationDrawerItem title="Jewels of Quran" icon={<IconCollection />} />
        <NavigationDrawerItem title="Names of Allah" icon={<IconCollection />} />
        <NavigationDrawerItem title="Revelation" icon={<IconCollection />} />
        <h3 className={styles.subtitle}>Network</h3>
        <NavigationDrawerItem
          title="Quranicaudio.com"
          icon={<IconQ />}
          href="https://quranicaudio.com"
          isExternalLink
        />
        <NavigationDrawerItem
          title="Salah.com"
          icon={<IconQ />}
          href="https://salah.com"
          isExternalLink
        />
        <NavigationDrawerItem
          title="Sunnah.com"
          icon={<IconQ />}
          href="https://sunnah.com"
          isExternalLink
        />
        <NavigationDrawerItem
          title="Legacy.quran.com"
          icon={<IconQ />}
          href="https://legacy.quran.com"
          isExternalLink
        />
        <NavigationDrawerItem
          title="Corpus.quran.com"
          icon={<IconQ />}
          href="https://corpus.quran.com"
          isExternalLink
        />
        <MobileApps />
      </div>
    </div>
  );
};

export default NavigationDrawer;
