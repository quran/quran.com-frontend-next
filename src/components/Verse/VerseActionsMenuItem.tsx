import styles from './VerseActionsMenuItem.module.scss';

interface Props {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const VerseActionsMenuItem: React.FC<Props> = ({ title, icon, onClick }) => (
  <div
    onKeyPress={onClick}
    role="button"
    tabIndex={0}
    className={styles.container}
    onClick={onClick}
  >
    {icon}
    <div className={styles.title}>{title}</div>
  </div>
);

export default VerseActionsMenuItem;
