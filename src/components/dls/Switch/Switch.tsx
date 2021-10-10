import classNames from 'classnames';

import styles from './Switch.module.scss';

// reference: https://vercel.com/design/switch

type Item = {
  name: string;
  value: string;
  disabled?: boolean;
};
export enum SwitchSize {
  Small = 'small',
  Normal = 'normal',
  Large = 'large',
}
type SwitchProps = {
  items: Item[];
  selected: string;
  onSelect: (value: string) => void;
  size?: SwitchSize;
};

const Switch = ({ items, onSelect, selected, size = SwitchSize.Normal }: SwitchProps) => {
  return (
    <div className={styles.container}>
      {items.map((item) => (
        <button
          disabled={item.disabled}
          type="button"
          className={classNames(styles.item, selected === item.value && styles.itemSelected, {
            [styles.itemLarge]: size === SwitchSize.Large,
            [styles.itemNormal]: size === SwitchSize.Normal,
            [styles.itemSmall]: size === SwitchSize.Small,
          })}
          key={item.value}
          onClick={() => onSelect(item.value)}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
};

export default Switch;
