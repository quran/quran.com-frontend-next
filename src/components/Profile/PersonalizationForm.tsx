import type { FC } from 'react';

import classNames from 'classnames';
import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

import styles from './PersonalizationForm.module.scss';
import Section from './Section';

import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import useAuthData from '@/hooks/auth/useAuthData';
import useProfilePictureForm from '@/hooks/auth/useProfilePictureForm';
import UserIcon from '@/icons/user.svg';
import { logButtonClick } from '@/utils/eventLogger';

const PersonalizationForm: FC = () => {
  const { t } = useTranslation('profile');
  const { userData } = useAuthData();
  const hasProfilePicture = !!userData?.avatars?.large;

  const {
    fileInputRef,
    handleUploadPicture,
    handleFileSelect,
    isProcessing,
    translationParams,
    handleRemovePicture,
    isRemoving,
  } = useProfilePictureForm();

  const onUploadPicture = () => {
    logButtonClick('profile_upload_picture');
    handleUploadPicture();
  };

  const onRemovePicture = () => {
    logButtonClick('profile_remove_picture');
    handleRemovePicture();
  };

  return (
    <Section title={t('personalization')} dataTestId="personalization-section">
      <div className={styles.profilePictureContainer}>
        <p className={styles.profilePictureTitle}>{t('profile-picture')}</p>
        <div className={styles.profilePictureDetailAction}>
          <div className={styles.profilePictureDetail}>
            <div className={styles.profilePictureImage}>
              {hasProfilePicture ? (
                <Image
                  src={userData.avatars.large} // set to empty string to test error state
                  alt={t('profile-picture')}
                  width={60}
                  height={60}
                  className={styles.profilePictureImageElement}
                />
              ) : (
                <UserIcon />
              )}
            </div>
            <div className={styles.profilePictureDescription}>
              <p>{t('max-file-size', { size: translationParams.maxSize })}</p>
              <p>{t('allowed-formats', { formats: translationParams.allowedFormats })}</p>
            </div>
          </div>
          <div className={styles.profilePictureAction}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              data-testid="profile-picture-input"
            />
            <Button
              variant={ButtonVariant.Ghost}
              size={ButtonSize.Small}
              className={classNames(styles.profilePictureActionButton, styles.uploadPictureButton)}
              onClick={onUploadPicture}
              isLoading={isProcessing}
              isDisabled={isProcessing || isRemoving}
            >
              {t('upload-picture')}
            </Button>
            {hasProfilePicture && (
              <Button
                variant={ButtonVariant.Compact}
                size={ButtonSize.Small}
                className={styles.profilePictureActionButton}
                onClick={onRemovePicture}
                isLoading={isRemoving}
                isDisabled={isProcessing || isRemoving}
              >
                {t('remove-picture')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default PersonalizationForm;
