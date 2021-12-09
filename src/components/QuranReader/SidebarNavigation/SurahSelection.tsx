import styles from './SidebarNavigation.module.scss';
import SurahList from './SurahList';
import VerseList from './VerseList';

interface Props {
  id: string;
}

const SurahSelection: React.FC<Props> = ({ id }) => {
  return (
    <div className={styles.surahBodyContainer}>
      <SurahList id={id} />
      <VerseList id={id} />
    </div>
  );
};

export default SurahSelection;
