import React, { ChangeEvent } from 'react';
import classNames from 'classnames';
import TickIcon from '../../../../../public/icons/tick.svg';
import styles from './Checkbox.module.scss';

export enum CheckboxSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

interface Props {
  id: string;
  onChange: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  checked?: boolean;
  disabled?: boolean;
  label?: string;
  name?: string;
  size?: CheckboxSize;
}

const Checkbox: React.FC<Props> = ({
  checked = false,
  disabled = false,
  size = CheckboxSize.Medium,
  id,
  label,
  name,
  onChange,
}) => {
  /**
   * Handle when the value of the checkbox input changes.
   *
   * @param {ChangeEvent<HTMLInputElement>} event
   * @returns {void}
   */
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void =>
    onChange(event, event.target.checked);

  return (
    <div className={styles.container}>
      <label htmlFor={id} className={classNames(styles.label, { [styles.disabled]: disabled })}>
        <div className={styles.bodyContainer}>
          <input
            type="checkbox"
            className={styles.input}
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            id={id}
            name={name}
          />
          <div
            className={classNames(styles.iconContainer, {
              [styles.smallIconContainer]: size === CheckboxSize.Small,
              [styles.mediumIconContainer]: size === CheckboxSize.Medium,
              [styles.largeIconContainer]: size === CheckboxSize.Large,
              [styles.inActiveIconContainer]: disabled || !checked,
              [styles.activeIconContainer]: checked && !disabled,
              [styles.unCheckedIconContainer]: !checked,
            })}
          >
            <TickIcon />
          </div>
        </div>
        {label && (
          <p
            className={classNames(styles.labelText, {
              [styles.smallLabelText]: size === CheckboxSize.Small,
              [styles.mediumLabelText]: size === CheckboxSize.Medium,
              [styles.largeLabelText]: size === CheckboxSize.Large,
              [styles.disabledLabelText]: disabled,
            })}
          >
            {label}
          </p>
        )}
      </label>
    </div>
  );
};

export default Checkbox;
