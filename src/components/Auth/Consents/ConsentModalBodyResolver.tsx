import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import dynamic from 'next/dynamic';
import { useSWRConfig } from 'swr';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import ConsentType from '@/types/auth/ConsentType';
import { userConsent } from '@/utils/auth/api';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { logFormSubmission } from '@/utils/eventLogger';
import UserProfile from 'types/auth/UserProfile';

const CommunicationConsent = dynamic(
  () => import('@/components/Auth/Consents/CommunicationConsent'),
);

type Props = {
  missingConsents: ConsentType[];
};

const ConsentModalBodyResolver = ({ missingConsents }: Props) => {
  const { mutate } = useSWRConfig();
  const { t } = useTranslation('common');
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const onCompleted = async (consentType: ConsentType, consented: boolean) => {
    logFormSubmission(`${consentType}_consent`, { consented });
    setIsLoading(true);
    userConsent({
      consentType,
      consented,
    })
      .then(() => {
        mutate(
          makeUserProfileUrl(),
          (currentProfileData: UserProfile) => {
            return {
              ...currentProfileData,
              consents: { ...currentProfileData.consents, [consentType]: consented },
            };
          },
          {
            revalidate: false,
          },
        );
      })
      .catch(() => {
        toast(t('common:error.general'), {
          status: ToastStatus.Error,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (missingConsents[0] === ConsentType.COMMUNICATION) {
    return (
      <CommunicationConsent
        isLoading={isLoading}
        consentType={missingConsents[0]}
        onCompleted={onCompleted}
      />
    );
  }
  return <></>;
};

export default ConsentModalBodyResolver;
