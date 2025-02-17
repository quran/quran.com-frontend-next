import styles from './SidebarNavigation.module.scss';
import VerseList from './VerseList';

type Props = {
  onAfterNavigationItemRouted?: () => void;
};

const VerseSelection: React.FC<Props> = ({ onAfterNavigationItemRouted }) => {
  return (
    <div className={styles.surahBodyContainer}>
      <VerseList onAfterNavigationItemRouted={onAfterNavigationItemRouted} />
    </div>
  );
};

export default VerseSelection;
