import React from 'react';

import * as RadixToggle from '@radix-ui/react-switch';

import styles from './Toggle.module.scss';

interface Props {
  id: string;
  onChange?: (checked: boolean) => void;
  checked?: boolean;
  disabled?: boolean;
  required?: boolean;
  label?: string | JSX.Element;
  name?: string;
  defaultChecked?: boolean;
}

const Toggle: React.FC<Props> = ({
  disabled = false,
  required = false,
  defaultChecked,
  checked,
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
        disabled={disabled}
        name={name}
        required={required}
        className={styles.root}
        {...(checked !== undefined && { checked })}
        {...(defaultChecked !== undefined && { defaultChecked })}
        {...(onChange !== undefined && { onCheckedChange: onChange })}
      >
        <RadixToggle.Thumb className={styles.thumb} />
      </RadixToggle.Root>
    </div>
  );
};

export default Toggle;
