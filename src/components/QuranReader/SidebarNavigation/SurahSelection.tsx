import styles from './SidebarNavigation.module.scss';
import SurahList from './SurahList';

type Props = {
  onAfterNavigationItemRouted?: (itemValue?: string, itemType?: string) => void;
};

const SurahSelection: React.FC<Props> = ({ onAfterNavigationItemRouted }) => {
  return (
    <div className={styles.surahBodyContainer}>
      <SurahList onAfterNavigationItemRouted={onAfterNavigationItemRouted} />
    </div>
  );
};

export default SurahSelection;
