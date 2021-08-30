import Button from '../Button/Button';
import styles from './Counter.module.scss';

type CounterProps = {
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
};

const Counter = ({ count, onIncrement, onDecrement }: CounterProps) => (
  <div className={styles.container}>
    <Button disabled={!onDecrement} onClick={onDecrement}>
      -
    </Button>
    <span className={styles.count}>{count}</span>
    <Button
      disabled={!onIncrement}
      onClick={() => {
        console.log('jalan nih');
        console.log(onIncrement);
        console.log(typeof onIncrement);
        onIncrement();
      }}
    >
      +
    </Button>
  </div>
);

export default Counter;
