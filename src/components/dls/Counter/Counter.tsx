import { useEffect, useMemo, useRef, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './Counter.module.scss';

import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import MinusIcon from '@/icons/minus.svg';
import PlusIcon from '@/icons/plus.svg';
import { toLocalizedNumber } from '@/utils/locale';

type CounterProps = {
  count: number | string;
  onCostumValue: (val: number) => void;
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
const Counter = ({ count, onCostumValue, onIncrement, onDecrement }: CounterProps): JSX.Element => {
  const { t, lang } = useTranslation('common');
  const localizedCount = useMemo(() => toLocalizedNumber(Number(count), lang), [count, lang]);
  const inputRef = useRef<HTMLInputElement>();
  const [inputValue, setInputValue] = useState(localizedCount);

  // eslint-disable-next-line react-func/max-lines-per-function
  useEffect(() => {
    const onKeyPress = (e: KeyboardEvent) => {
      const keyPressValue = +e.key;
      const maxDigits = 4;

      let stringCount = count.toString();
      stringCount += e.key;

      if (Number.isNaN(keyPressValue) || stringCount.length > maxDigits) {
        // stop user from providing none number input
        e.preventDefault();
        e.stopPropagation();

        return false;
      }
      // set the count to the provided value
      onCostumValue(+stringCount);
      return true;
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') {
        let stringCount = count.toString();
        stringCount = stringCount.substring(0, stringCount.length - 1);
        onCostumValue(+stringCount);
        // const { selectionStart } = input;
        // const { selectionEnd } = input;

        // if (selectionStart === selectionEnd) {
        // delete numbers in count
        // } else {
        //   console.log(selectionStart, selectionEnd);
        //   // delete numbers in selection
        //   stringCount =
        //     stringCount.substring(0, selectionStart) +
        //     stringCount.substring(selectionEnd, stringCount.length - 1);
        // }
      }
    };

    const input = inputRef.current;
    if (input) {
      // set the event listeners for the input
      input.addEventListener('keypress', onKeyPress);
      input.addEventListener('keydown', onKeyDown);
    }
    return () => {
      input.removeEventListener('keypress', onKeyPress);
      input.removeEventListener('keydown', onKeyDown);
    };
  }, [onCostumValue, count]);

  useEffect(() => {
    setInputValue(localizedCount);
  }, [localizedCount]);

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
      <input className={styles.count} ref={inputRef} value={inputValue} />
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
