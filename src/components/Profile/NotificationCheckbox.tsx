/* eslint-disable no-underscore-dangle */
import { FC } from 'react';

import { ChannelTypeEnum, IUserPreferenceSettings } from '@novu/headless';
import { Translate } from 'next-translate';

import styles from './EmailNotificationSettingsForm.module.scss';

import Checkbox from '@/dls/Forms/Checkbox/Checkbox';
import TEST_IDS from '@/utils/test-ids';

interface NotificationCheckboxProps {
  preference: IUserPreferenceSettings;
  onToggle: (preference: IUserPreferenceSettings, isChecked: boolean) => void;
  disabled: boolean;
  t: Translate;
}

const NotificationCheckbox: FC<NotificationCheckboxProps> = ({
  preference,
  onToggle,
  disabled,
  t,
}) => {
  const { template } = preference;
  const isEmailEnabled = preference.preference.channels[ChannelTypeEnum.EMAIL] ?? false;
  const titleKey = `notifications.${template.name}.title`;
  const descriptionKey = `notifications.${template.name}.description`;
  const translatedTitle = t(titleKey);
  const translatedDescription = t(descriptionKey);
  const title = translatedTitle === titleKey ? template.name : translatedTitle;
  const description = translatedDescription === descriptionKey ? '' : translatedDescription;

  return (
    <Checkbox
      keepIndicatorOnUnchecked
      dataTestId={TEST_IDS.AUTH.UPDATE_PROFILE.EMAIL_NOTIFICATION_SETTINGS_CHECKBOX}
      containerClassName={styles.checkboxContainer}
      indicatorClassName={styles.indicator}
      checkboxClassName={styles.checkbox}
      id={template._id}
      label={
        <>
          <strong className={styles.title}>{title}:</strong> <span>{description}</span>
        </>
      }
      checked={isEmailEnabled}
      onChange={(isChecked) => onToggle(preference, isChecked)}
      disabled={disabled}
    />
  );
};

export default NotificationCheckbox;
