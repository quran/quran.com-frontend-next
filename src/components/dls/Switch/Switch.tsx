import classNames from 'classnames';
import range from 'lodash/range';
import { useRouter } from 'next/router';

import styles from './Switch.module.scss';

import { isRTLLocale } from '@/utils/locale';

// reference: https://vercel.com/design/switch

type Item = {
  name: React.ReactNode;
  value: string;
  disabled?: boolean;
};
export enum SwitchSize {
  XSmall = 'xsmall',
  Small = 'small',
  Normal = 'normal',
  Large = 'large',
}

export enum SwitchVariant {
  Default = 'default',
  Alternative = 'alternative',
}
type SwitchProps = {
  items: Item[];
  selected: string;
  onSelect: (value: string) => void;
  size?: SwitchSize;
  variant?: SwitchVariant;
};

const Switch = ({
  items,
  onSelect,
  selected,
  size = SwitchSize.Normal,
  variant = SwitchVariant.Default,
}: SwitchProps) => {
  const selectedIndex = items.findIndex((item) => item.value === selected);
  const { locale } = useRouter();
  return (
    <div
      className={classNames(styles.container, {
        [styles.xSmallContainer]: size === SwitchSize.XSmall,
        [styles.alternativeVariant]: variant === SwitchVariant.Alternative,
      })}
    >
      {items.map((item) => (
        <button
          disabled={item.disabled}
          type="button"
          className={classNames(styles.item, selected === item.value && styles.itemSelected, {
            [styles.itemLarge]: size === SwitchSize.Large,
            [styles.itemNormal]: size === SwitchSize.Normal,
            [styles.itemSmall]: size === SwitchSize.Small,
            [styles.itemXSmall]: size === SwitchSize.XSmall,
          })}
          key={item.value}
          onClick={() => onSelect(item.value)}
        >
          {item.name}
        </button>
      ))}

      {/* seprator  */}
      {items.length > 2 &&
        range(1, items.length).map((i) => {
          return (
            <div
              key={i}
              className={classNames(styles.separatorLine, {
                [styles.separatorLineVisible]: selectedIndex !== i && selectedIndex !== i - 1,
              })}
              style={{
                width: `${100 / items.length}%`,
                transform: `translateX(${100 * i}%)`,
              }}
            />
          );
        })}
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
