import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './Counter.module.scss';

import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import MinusIcon from '@/icons/minus.svg';
import PlusIcon from '@/icons/plus.svg';
import { toLocalizedNumber } from '@/utils/locale';

type CounterProps = {
  count: number | string;
  onIncrement?: () => void;
  onDecrement?: () => void;
  isPercent?: boolean;
};

/**
 *
 * @param {CounterProps} props - the props of the this component
 * @param {number} props.count - the current count
 * @param {boolean} props.isPercent - should show a percent instead of a number if true
 * @param {() => void} props.onIncrement - the function to call when the increment button is clicked.
 * Button is disabled when  the value is `undefined` or `null`
 * @param {() => void} props.onDecrement - the function to call when the decrement button is clicked.
 * Button is disabled when  the value is `undefined` or `null`
 * @returns {JSX.Element}
 */
const Counter = ({ count, onIncrement, onDecrement, isPercent }: CounterProps): JSX.Element => {
  const { t, lang } = useTranslation('common');
  const percent = Number(count) * 100;
  const localizedCount = useMemo(() => toLocalizedNumber(Number(count), lang), [count, lang]);
  const localizedPercent = useMemo(() => toLocalizedNumber(Number(percent), lang), [percent, lang]);
  return (
    <div className={styles.container}>
      <Button
        tooltip={t('counter.decrease')}
        shape={ButtonShape.Circle}
        variant={ButtonVariant.Ghost}
        isDisabled={!onDecrement}
        onClick={onDecrement}
        ariaLabel={t('counter.decrease')}
      >
        <MinusIcon />
      </Button>
      {isPercent ? (
        <span className={styles.count}>{`${localizedPercent} %`}</span>
      ) : (
        <span className={styles.count}>{localizedCount}</span>
      )}
      <Button
        tooltip={t('counter.increase')}
        variant={ButtonVariant.Ghost}
        shape={ButtonShape.Circle}
        isDisabled={!onIncrement}
        onClick={onIncrement}
        ariaLabel={t('counter.increase')}
      >
        <PlusIcon />
      </Button>
    </div>
  );
};

export default Counter;
