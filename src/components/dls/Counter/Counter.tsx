import Button from '../Button/Button';
import styles from './Counter.module.scss';

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
    <Button tooltip="decrement" disabled={!onDecrement} onClick={onDecrement}>
      -
    </Button>
    <span className={styles.count}>{count}</span>
    <Button
      tooltip="increment"
      disabled={!onIncrement}
      onClick={() => {
        onIncrement();
      }}
    >
      +
    </Button>
  </div>
);

export default Counter;
