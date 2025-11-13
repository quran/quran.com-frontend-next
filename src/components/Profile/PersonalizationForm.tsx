import Image from 'next/image';

import styles from './PersonalizationForm.module.scss';
import Section from './Section';

import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import useAuthData from '@/hooks/auth/useAuthData';
import useProfilePictureForm from '@/hooks/auth/useProfilePictureForm';
import UserIcon from '@/icons/user.svg';

const PersonalizationForm: React.FC = () => {
  const { userData } = useAuthData();
  const hasProfilePicture = !!userData?.avatars?.large;

  const {
    fileInputRef,
    handleUploadPicture,
    handleFileSelect,
    removeFunction,
    isProcessing,
    translationParams,
    t,
  } = useProfilePictureForm();

  return (
    <Section title={t('personalization')}>
      <div className={styles.profilePictureContainer}>
        <p className={styles.profilePictureTitle}>{t('profile-picture')}</p>
        <div className={styles.profilePictureDetailAction}>
          <div className={styles.profilePictureDetail}>
            <div className={styles.profilePictureImage}>
              {hasProfilePicture && userData?.avatars?.large ? (
                <Image
                  src={userData.avatars?.large}
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
              aria-hidden="true"
            />
            <Button
              variant={ButtonVariant.Ghost}
              size={ButtonSize.Small}
              className={styles.profilePictureActionButton}
              onClick={handleUploadPicture}
              isLoading={isProcessing}
              isDisabled={isProcessing}
            >
              {t('upload-picture')}
            </Button>
            {hasProfilePicture && (
              <Button
                variant={ButtonVariant.Ghost}
                size={ButtonSize.Small}
                className={styles.profilePictureActionButton}
                onClick={removeFunction}
                isLoading={isProcessing}
                isDisabled={isProcessing}
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
