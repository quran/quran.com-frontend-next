/* eslint-disable no-underscore-dangle */
import { FC } from 'react';

import { ChannelTypeEnum, IUserPreferenceSettings } from '@novu/headless';
import { Translate } from 'next-translate';

import styles from './EmailNotificationSettingsForm.module.scss';

import Checkbox from '@/dls/Forms/Checkbox/Checkbox';

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
  const title = t(`notifications.${template.name}.title`);
  const description = t(`notifications.${template.name}.description`);

  return (
    <Checkbox
      containerClassName={styles.checkboxContainer}
      indicatorClassName={styles.indicator}
      checkboxClassName={styles.checkbox}
      id={template._id}
      label={
        <>
          <span className={styles.title}>{title}</span>: {description}
        </>
      }
      checked={isEmailEnabled}
      onChange={(isChecked) => onToggle(preference, isChecked)}
      disabled={disabled}
    />
  );
};

export default NotificationCheckbox;
