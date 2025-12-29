import { FC, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './PasswordInput.module.scss';

import Input, { HtmlInputType } from '@/components/dls/Forms/Input';
import HideIcon from '@/icons/hide.svg';
import ShowIcon from '@/icons/show.svg';

interface Props {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  containerClassName?: string;
  isDisabled?: boolean;
}

const PasswordInput: FC<Props> = ({
  id = 'password-input',
  label,
  value = '',
  onChange,
  placeholder,
  containerClassName,
  isDisabled = false,
}) => {
  const { t } = useTranslation('login');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input
      id={id}
      htmlType={showPassword ? HtmlInputType.Text : HtmlInputType.Password}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={isDisabled}
      label={label}
      shouldUseDefaultStyles={false}
      fixedWidth={false}
      containerClassName={classNames(styles.passwordInputContainer, containerClassName, {
        [styles.hasValue]: value,
        [styles.disabled]: isDisabled,
      })}
      suffix={
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={styles.toggleButton}
          aria-label={showPassword ? t('hide-password') : t('show-password')}
          disabled={isDisabled}
        >
          {showPassword ? <HideIcon /> : <ShowIcon />}
        </button>
      }
    />
  );
};

export default PasswordInput;
