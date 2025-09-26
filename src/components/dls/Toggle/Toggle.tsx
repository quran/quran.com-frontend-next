import React from 'react';

import * as RadixToggle from '@radix-ui/react-switch';

import styles from './Toggle.module.scss';

interface Props {
  id: string;
  onChange?: (checked: boolean) => void;
  isChecked?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  label?: React.ReactNode;
  name?: string;
  isDefaultChecked?: boolean;
}

const Toggle: React.FC<Props> = ({
  isDisabled = false,
  isRequired = false,
  isDefaultChecked,
  isChecked,
  id,
  label,
  name,
  onChange,
}) => {
  return (
    <div className={styles.container}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}

      <RadixToggle.Root
        id={id}
        disabled={isDisabled}
        name={name}
        required={isRequired}
        className={styles.root}
        {...(isChecked !== undefined && { checked: isChecked })}
        {...(isDefaultChecked !== undefined && { defaultChecked: isDefaultChecked })}
        {...(onChange !== undefined && { onCheckedChange: onChange })}
      >
        <RadixToggle.Thumb className={styles.thumb} />
      </RadixToggle.Root>
    </div>
  );
};

export default Toggle;
