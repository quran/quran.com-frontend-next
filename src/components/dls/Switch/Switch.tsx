import classNames from 'classnames';
import { useRouter } from 'next/router';

import styles from './Switch.module.scss';

import { isRTLLocale } from 'src/utils/locale';

// reference: https://vercel.com/design/switch

type Item = {
  name: React.ReactNode;
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
  const selectedIndex = items.findIndex((item) => item.value === selected);
  const { locale } = useRouter();
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
      <div
        className={styles.selectedItemBackgroundContainer}
        style={{
          width: `${(1 / items.length) * 100}%`,
          transform: `translateX(${isRTLLocale(locale) ? '-' : ''}${selectedIndex * 100}%)`,
        }}
      >
        <div className={styles.selectedItemBackground} />
      </div>
    </div>
  );
};

export default Switch;
