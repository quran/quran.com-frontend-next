import Button, { ButtonShape, ButtonVariant } from '../Button/Button';
import styles from './Counter.module.scss';
import PlusIcon from '../../../../public/icons/plus.svg';
import MinusIcon from '../../../../public/icons/minus.svg';

type CounterProps = {
  count: number;
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
 */
const Counter = ({ count, onIncrement, onDecrement }: CounterProps) => (
  <div className={styles.container}>
    <Button
      tooltip="Decrease"
      shape={ButtonShape.Circle}
      variant={ButtonVariant.Ghost}
      disabled={!onDecrement}
      onClick={onDecrement}
    >
      <MinusIcon />
    </Button>
    <span className={styles.count}>{count}</span>
    <Button
      tooltip="Increase"
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

export default Counter;
