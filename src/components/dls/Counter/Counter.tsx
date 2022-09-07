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
};

/**
 *
 * @param {CounterProps} props - the props of the this component
 * @param {number} props.count - the current count
 * @param {() => void} props.onIncrement - the function to call when the increment button is clicked.
 * Button is disabled when  the value is `undefined` or `null`
 * @param {() => void} props.onDecrement - the function to call when the decrement button is clicked.
 * Button is disabled when  the value is `undefined` or `null`
 * @returns {JSX.Element}
 */
const Counter = ({ count, onIncrement, onDecrement }: CounterProps): JSX.Element => {
  const { t, lang } = useTranslation('common');
  const localizedCount = useMemo(() => toLocalizedNumber(Number(count), lang), [count, lang]);
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
      <span className={styles.count}>{localizedCount}</span>
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
