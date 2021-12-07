import styles from './SidebarNavigation.module.scss';
import SurahList from './SurahList';
import VerseList from './VerseList';

const SurahSelection = () => {
  return (
    <div className={styles.surahBodyContainer}>
      <SurahList />
      <VerseList />
    </div>
  );
};

export default SurahSelection;
