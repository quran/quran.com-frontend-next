import type { FC } from 'react';
import { memo, useCallback, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../Login/SignUpFormFields/consts';

import getChangePasswordFormFields from './changePasswordFormFields';
import Section from './Section';
import styles from './SharedProfileStyles.module.scss';

import FormBuilder from '@/components/FormBuilder/FormBuilder';
import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import useUpdatePassword from '@/hooks/auth/useUpdatePassword';
import useTransformFormErrors from '@/hooks/useTransformFormErrors';
import { TestId } from '@/tests/test-ids';
import { logButtonClick } from '@/utils/eventLogger';

type FormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

interface RenderActionProps {
  disabled?: boolean;
  onClick?: () => void;
}

const ChangePasswordForm: FC = () => {
  const { t } = useTranslation('profile');
  const { updatePassword, isUpdating } = useUpdatePassword();
  const { transformErrors } = useTransformFormErrors<FormData>({
    currentPassword: {
      fieldNameKey: 'common:form.current-password',
    },
    newPassword: {
      fieldNameKey: 'common:form.new-password',
      extraParams: {
        max: PASSWORD_MAX_LENGTH,
        min: PASSWORD_MIN_LENGTH,
      },
    },
    confirmPassword: {
      fieldNameKey: 'common:form.confirm-new-password',
    },
  });

  const formFields = useMemo(() => getChangePasswordFormFields(t), [t]);

  const onFormSubmit = useCallback(
    async (data: FormData) => {
      logButtonClick('profile_update_password');
      const result = await updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      return transformErrors(result);
    },
    [updatePassword, transformErrors],
  );

  const renderAction = useCallback(
    (props: RenderActionProps) => (
      <div>
        <Button
          {...props}
          className={styles.button}
          size={ButtonSize.Small}
          variant={ButtonVariant.Accent}
        >
          {t('update-password')}
        </Button>
      </div>
    ),
    [t],
  );

  return (
    <Section
      title={t('change-password')}
      dataTestId={TestId.AUTH_UPDATE_PROFILE_CHANGE_PASSWORD_SECTION}
    >
      <FormBuilder
        className={styles.passwordFormContainer}
        formFields={formFields}
        onSubmit={onFormSubmit}
        actionText={t('update-password')}
        isSubmitting={isUpdating}
        renderAction={renderAction}
        shouldDisplayAllValidation
      />
    </Section>
  );
};

export default memo(ChangePasswordForm);
