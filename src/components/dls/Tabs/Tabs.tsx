/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/interactive-supports-focus */

type Tab = {
  title: string;
  value: string;
};
type TabsProps = {
  tabs: Tab[];
  selected: string;
  onSelect: (value: string) => void;
  isDisabled?: boolean;
};

const Tabs = ({ tabs, onSelect, selected }: TabsProps) => {
  return (
    <div style={{ display: 'flex' }}>
      {tabs.map((tab) => (
        <div
          style={{
            background: selected === tab.value ? 'red' : 'white',
            cursor: 'pointer',
            padding: '1rem',
          }}
          role="tab"
          onClick={() => onSelect(tab.value)}
        >
          {tab.title}
        </div>
      ))}
    </div>
  );
};

export default Tabs;
