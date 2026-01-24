import classNames from 'classnames';

import styles from './DayCircle.module.scss';

import CheckIcon from '@/icons/check.svg';

export enum DayState {
  None = 'none',
  Checked = 'checked',
  Future = 'future',
}

interface DayCircleProps {
  state: DayState;
}

const DayCircle: React.FC<DayCircleProps> = ({ state }) => {
  return (
    <div
      className={classNames(styles.dayCircle, {
        [styles.checked]: state === DayState.Checked,
        [styles.future]: state === DayState.Future,
      })}
    >
      {state === DayState.Checked ? <CheckIcon /> : null}
    </div>
  );
};

export default DayCircle;
