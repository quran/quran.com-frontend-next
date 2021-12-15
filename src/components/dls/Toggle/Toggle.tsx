/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import classNames from 'classnames';

import styles from './Toggle.module.scss';

type ToggleProps = {
  isChecked: boolean;
  onClick: () => void;
};

const Toggle = ({ isChecked, onClick }: ToggleProps) => {
  return (
    <div>
      <div className={classNames(styles.toggle, { [styles.checked]: isChecked })} onClick={onClick}>
        <div
          className={classNames(styles.handle, {
            [styles.handleOn]: isChecked,
          })}
        />
      </div>
    </div>
  );
};

export default Toggle;
