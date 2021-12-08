import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import MinusIcon from '../../../../public/icons/minus.svg';
import PlusIcon from '../../../../public/icons/plus.svg';

import styles from './Counter.module.scss';

import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import { toLocalizedNumber } from 'src/utils/locale';

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
        disabled={!onDecrement}
        onClick={onDecrement}
      >
        <MinusIcon />
      </Button>
      <span className={styles.count}>{localizedCount}</span>
      <Button
        tooltip={t('counter.increase')}
        variant={ButtonVariant.Ghost}
        shape={ButtonShape.Circle}
        disabled={!onIncrement}
        onClick={() => {
          onIncrement();
        }}
      >
        <PlusIcon />
      </Button>
    </div>
  );
};

export default Counter;
