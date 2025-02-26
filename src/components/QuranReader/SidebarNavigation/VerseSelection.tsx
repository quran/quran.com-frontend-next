import styles from './SidebarNavigation.module.scss';
import SurahList from './SurahList';
import VerseList from './VerseList';

type Props = {
  onAfterNavigationItemRouted?: () => void;
};

const VerseSelection: React.FC<Props> = ({ onAfterNavigationItemRouted }) => {
  return (
    <div className={styles.surahBodyContainer}>
      <SurahList onAfterNavigationItemRouted={onAfterNavigationItemRouted} />
      <VerseList onAfterNavigationItemRouted={onAfterNavigationItemRouted} />
    </div>
  );
};

export default VerseSelection;
