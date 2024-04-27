/* eslint-disable no-underscore-dangle */
import React, { useMemo, useState } from 'react';

import { ChannelTypeEnum, IUserPreferenceSettings } from '@novu/headless';
import useTranslation from 'next-translate/useTranslation';

import styles from './CollapsibleWorkflowSettings.module.scss';

import useUpdateUserPreferences from '@/components/Notifications/hooks/useUpdateUserPreferences';
import PreferenceSettingsToggles from '@/components/Notifications/NotificationSettings/Tabs/PreferenceSettingsToggles';
import Collapsible, { CollapsibleDirection } from '@/dls/Collapsible/Collapsible';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import { logEvent, logValueChange } from '@/utils/eventLogger';

type Props = {
  preference: IUserPreferenceSettings;
};

const CollapsibleWorkflowSettings: React.FC<Props> = ({ preference }) => {
  const { t } = useTranslation('notification-settings');
  const { mutate: UpdateUserPreferences, isMutating } = useUpdateUserPreferences(
    // eslint-disable-next-line no-underscore-dangle
    preference.template._id,
  );
  // we need a local state to handle UI updates when the user changes one of the settings since the toggles are controlled
  const [preferenceState, setPreferenceState] = useState<IUserPreferenceSettings>(preference);
  const [mutatingChannel, setMutatingChannel] = useState<ChannelTypeEnum>();

  const onOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      logEvent('notif_workflow_settings_drawer_opened');
    } else {
      logEvent('notif_workflow_settings_drawer_closed');
    }
  };

  const onToggle = (isChecked: boolean, channel?: ChannelTypeEnum) => {
    setMutatingChannel(channel);
    logValueChange('notif_workflow_settings', !isChecked, isChecked, {
      channel,
    });
    UpdateUserPreferences(isChecked, channel, () => {
      setPreferenceState((prev) => {
        const newState = { ...prev };
        newState.preference.channels[channel] = isChecked;
        return newState;
      });
    });
  };

  const workflowChannels = useMemo(
    () =>
      // eslint-disable-next-line unicorn/no-array-reduce
      Object.keys(preferenceState.preference.channels).reduce((acc, currentValue) => {
        if (!acc) return t(`channels.${currentValue}`);
        return `${acc}, ${t(`channels.${currentValue}`)}`;
      }, ''),
    [preferenceState.preference.channels, t],
  );

  return (
    <div className={styles.container}>
      <Collapsible
        title={
          <div>
            <p className={styles.workflowName}>{preferenceState.template.name}</p>
            <p className={styles.workflowChannels}>{workflowChannels}</p>
          </div>
        }
        prefix={<ChevronDownIcon />}
        shouldRotatePrefixOnToggle
        onOpenChange={onOpenChange}
        direction={CollapsibleDirection.Right}
      >
        {({ isOpen: isOpenRenderProp }) => {
          if (!isOpenRenderProp) return null;
          return (
            <PreferenceSettingsToggles
              onToggle={onToggle}
              isMutating={isMutating}
              preference={preferenceState}
              mutatingChannel={mutatingChannel}
              hasGlobalPreference={false}
            />
          );
        }}
      </Collapsible>
    </div>
  );
};

export default CollapsibleWorkflowSettings;
