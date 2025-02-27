import { FC } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../SignUpFormFields/consts';

import styles from './PasswordValidation.module.scss';

interface PasswordRule {
  test: (value: string) => boolean;
  messageKey: string;
}

interface Props {
  value: string;
}

const PasswordValidation: FC<Props> = ({ value = '' }) => {
  const { t } = useTranslation('login');

  const rules: PasswordRule[] = [
    {
      test: (password) => password.length >= PASSWORD_MIN_LENGTH,
      messageKey: 'password-rules.min-length',
    },
    {
      test: (password) => password.length <= PASSWORD_MAX_LENGTH,
      messageKey: 'password-rules.max-length',
    },
    {
      test: (password) => /[A-Z]/.test(password),
      messageKey: 'password-rules.uppercase',
    },
    {
      test: (password) => /[a-z]/.test(password),
      messageKey: 'password-rules.lowercase',
    },
    {
      test: (password) => /\d/.test(password),
      messageKey: 'password-rules.number',
    },
    {
      test: (password) => {
        // Check if at least one allowed special character exists
        const hasAllowedSpecial = /[!@#$%^&*_-]/.test(password);

        // Check if there are any characters that aren't letters, numbers, or allowed special chars
        const hasDisallowedChars = /[^a-zA-Z0-9!@#$%^&*_-]/.test(password);

        // Return true only if there's at least one allowed special char AND no disallowed chars
        return hasAllowedSpecial && !hasDisallowedChars;
      },
      messageKey: 'password-rules.special',
    },
  ];

  // Only show validation rules when there's a value
  if (!value) {
    return null;
  }

  return (
    <div className={styles.passwordValidation}>
      {rules.map((rule) => {
        const isValid = rule.test(value);
        return (
          <div
            key={rule.messageKey}
            className={classNames(styles.validationRule, {
              [styles.valid]: isValid,
              [styles.invalid]: !isValid,
            })}
          >
            <span className={styles.ruleIcon}>{isValid ? '✓' : '×'}</span>
            <span>{t(rule.messageKey)}</span>
          </div>
        );
      })}
    </div>
  );
};

export default PasswordValidation;
