import classNames from 'classnames';

import styles from './Switch.module.scss';

// reference: https://vercel.com/design/switch

type Item = {
  name: string;
  value: string;
  width: number;
  disabled?: boolean;
};
type SwitchProps = {
  items: Item[];
  selected: string;
  onSelect: (value: string) => void;
};

const Switch = ({ items, onSelect, selected }: SwitchProps) => {
  return (
    <div className={styles.container}>
      {items.map((item) => (
        <button
          disabled={item.disabled}
          type="button"
          className={classNames(styles.item, selected === item.value && styles.itemSelected)}
          key={item.value}
          onClick={() => onSelect(item.value)}
          style={{ width: item.width }}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
};

export default Switch;
