import React from 'react';

import {
  ChannelTypeEnum,
  IUserGlobalPreferenceSettings,
  IUserPreferenceSettings,
} from '@novu/headless';
import useTranslation from 'next-translate/useTranslation';

import styles from './PreferenceSettingsToggles.module.scss';

import FieldsetContainer from '@/components/Notifications/NotificationSettings/Tabs/FieldsetContainer';
import Spinner from '@/dls/Spinner/Spinner';
import Toggle from '@/dls/Toggle/Toggle';

type Props = {
  isMutating: boolean;
  preference: IUserPreferenceSettings | IUserGlobalPreferenceSettings;
  onToggle: (isChecked: boolean, channel?: ChannelTypeEnum) => void;
  hasGlobalPreference?: boolean;
  mutatingChannel?: string;
};

const PreferenceSettingsToggles: React.FC<Props> = ({
  isMutating,
  preference,
  onToggle,
  hasGlobalPreference = true,
  mutatingChannel,
}) => {
  const { t } = useTranslation('notification-settings');
  return (
    <>
      {hasGlobalPreference && (
        <div className={styles.row}>
          <Toggle
            id="all-notifications"
            label={t('all-notifications')}
            onChange={onToggle}
            checked={preference.preference.enabled}
            disabled={isMutating}
          />
          {isMutating && <Spinner />}
        </div>
      )}

      <FieldsetContainer title={t('channels-notifications')}>
        {Object.keys(preference.preference.channels).map((channelName) => {
          return (
            <div className={styles.row} key={channelName}>
              <Toggle
                id={channelName}
                disabled={isMutating}
                label={t(`channels.${channelName}`)}
                onChange={(checked) => onToggle(checked, channelName as ChannelTypeEnum)}
                checked={preference.preference.channels[channelName]}
              />
              {isMutating && channelName === mutatingChannel && <Spinner />}
            </div>
          );
        })}
      </FieldsetContainer>
    </>
  );
};

export default PreferenceSettingsToggles;
