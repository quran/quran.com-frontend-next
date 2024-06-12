import classNames from 'classnames';
import { useSelector } from 'react-redux';

import BottomSection from './BottomSection';
import styles from './Footer.module.scss';
import Links from './Links';
import TitleAndDescription from './TitleAndDescription';

import { selectIsSidebarNavigationVisible } from '@/redux/slices/QuranReader/sidebarNavigation';

const Footer = () => {
  const isSidebarNavigationVisible = useSelector(selectIsSidebarNavigationVisible);

  return (
    <footer
      className={classNames(styles.container, {
        [styles.withSidebarNavigationOpenOrAuto]: isSidebarNavigationVisible,
      })}
    >
      <div className={styles.flowItem}>
        <div className={styles.innerContainer}>
          <TitleAndDescription />
          <Links />
        </div>
        <BottomSection />
      </div>
      <div className={styles.emptySpacePlaceholder} />
    </footer>
  );
};

export default Footer;
