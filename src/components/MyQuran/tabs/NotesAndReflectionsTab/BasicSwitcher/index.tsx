import styles from './BasicSwitcher.module.scss';

interface TabSwitcherItem {
  name: React.ReactNode;
  value: string;
  id?: string;
}

interface BasicSwitcherProps {
  tabs: TabSwitcherItem[];
  onSelect: (value: string) => void;
  selected: string;
}

const BasicSwitcher: React.FC<BasicSwitcherProps> = ({ tabs, onSelect, selected }) => {
  return (
    <div className={styles.basicSwitcher}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={styles.tabButton}
          onClick={() => onSelect(tab.value)}
          data-selected={selected === tab.value}
        >
          {tab.name}
        </button>
      ))}
    </div>
  );
};

export default BasicSwitcher;
