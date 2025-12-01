import type { FC } from 'react';
import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import getEditDetailsFormFields from './editDetailsFormFields';
import Section from './Section';
import styles from './SharedProfileStyles.module.scss';

import FormBuilder from '@/components/FormBuilder/FormBuilder';
import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import useAuthData from '@/hooks/auth/useAuthData';
import useUpdateUserProfile from '@/hooks/auth/useUpdateUserProfile';
import useTransformFormErrors from '@/hooks/useTransformFormErrors';
import { logButtonClick } from '@/utils/eventLogger';

type FormData = {
  firstName: string;
  lastName: string;
};

interface RenderActionProps {
  disabled?: boolean;
  onClick?: () => void;
}

const EditDetailsForm: FC = () => {
  const { t } = useTranslation('profile');
  const { userData } = useAuthData();
  const { updateProfile, isUpdating } = useUpdateUserProfile();
  const { transformErrors } = useTransformFormErrors<FormData>({
    firstName: {
      fieldNameKey: 'common:form.firstName',
    },
    lastName: {
      fieldNameKey: 'common:form.lastName',
    },
  });

  const formFields = useMemo(() => getEditDetailsFormFields(t, userData), [t, userData]);

  const onFormSubmit = async (data: FormData) => {
    logButtonClick('profile_save_changes');
    const result = await updateProfile({
      firstName: data.firstName,
      lastName: data.lastName,
    });

    return transformErrors(result);
  };

  const renderAction = (props: RenderActionProps) => (
    <div>
      <Button
        {...props}
        className={styles.button}
        size={ButtonSize.Small}
        variant={ButtonVariant.Accent}
      >
        {t('save-changes')}
      </Button>
    </div>
  );

  return (
    <Section title={t('edit-details')}>
      <FormBuilder
        key={userData ? `${userData.email}-${userData.firstName}-${userData.lastName}` : 'loading'}
        className={styles.formContainer}
        formFields={formFields}
        onSubmit={onFormSubmit}
        actionText={t('save-changes')}
        isSubmitting={isUpdating}
        renderAction={renderAction}
      />
    </Section>
  );
};

export default EditDetailsForm;
