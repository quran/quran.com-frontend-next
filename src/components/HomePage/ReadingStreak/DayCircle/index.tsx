import classNames from 'classnames';

import styles from './DayCircle.module.scss';

import CheckIcon from '@/icons/check.svg';

export enum DayState {
  None = 'none',
  Stroked = 'stroked',
  Filled = 'filled',
  Checked = 'checked',
}

interface DayCircleProps {
  state: DayState;
}

const DayCircle: React.FC<DayCircleProps> = ({ state }) => {
  return (
    <div
      className={classNames(styles.dayCircle, {
        [styles.filled]: state === DayState.Filled || state === DayState.Checked,
        [styles.stroked]: state === DayState.Stroked,
      })}
    >
      {state === DayState.Checked ? <CheckIcon /> : null}
    </div>
  );
};

export default DayCircle;
