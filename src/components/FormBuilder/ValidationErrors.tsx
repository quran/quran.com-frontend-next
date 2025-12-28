import { FC, memo, useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { MultipleFieldErrors } from 'react-hook-form';

import styles from './ValidationErrors.module.scss';

import { FormBuilderFieldRule } from '@/components/FormBuilder/FormBuilderTypes';
import IconContainer from '@/dls/IconContainer/IconContainer';
import CheckIcon from '@/icons/checkmark-icon.svg';
import CloseIcon from '@/icons/close-icon.svg';

interface Props {
  error: MultipleFieldErrors;
  rules: FormBuilderFieldRule[];
}

const ValidationErrors: FC<Props> = ({ error, rules }) => {
  const { t } = useTranslation('common');

  const validationRules = useMemo(
    () =>
      rules.map((rule, index) => {
        const notValid = (rule.name || rule.type) in error;
        return {
          rule,
          index,
          isValid: !notValid,
          key: `${rule.type}-${index.toString()}`,
        };
      }),
    [rules, error],
  );

  return (
    <div className={styles.validationErrors} data-testid="validation-errors">
      {validationRules.map(({ rule, isValid, key }) => (
        <div
          key={key}
          className={classNames(styles.validationRule, {
            [styles.valid]: isValid,
            [styles.invalid]: !isValid,
          })}
        >
          <IconContainer
            className={styles.ruleIcon}
            icon={isValid ? <CheckIcon /> : <CloseIcon />}
          />
          <span className={styles.ruleText}>{t(rule.errorMessage)}</span>
        </div>
      ))}
    </div>
  );
};

// Custom comparison function to prevent re-renders when error object reference changes
// but the actual error keys remain the same
const arePropsEqual = (prevProps: Props, nextProps: Props): boolean => {
  // Compare rules array length and references
  if (prevProps.rules.length !== nextProps.rules.length) {
    return false;
  }

  // Check if rules array reference changed (shallow comparison)
  if (prevProps.rules !== nextProps.rules) {
    // If rules changed, check if it's a meaningful change
    const rulesChanged = prevProps.rules.some((rule, index) => rule !== nextProps.rules[index]);
    if (rulesChanged) {
      return false;
    }
  }

  // Compare error objects by their keys (shallow comparison)
  const prevErrorKeys = Object.keys(prevProps.error);
  const nextErrorKeys = Object.keys(nextProps.error);

  if (prevErrorKeys.length !== nextErrorKeys.length) {
    return false;
  }

  // Check if the same error keys exist
  const errorKeysMatch = prevErrorKeys.every((key) => nextErrorKeys.includes(key));
  if (!errorKeysMatch) {
    return false;
  }

  // If all checks pass, props are effectively equal
  return true;
};

export default memo(ValidationErrors, arePropsEqual);
