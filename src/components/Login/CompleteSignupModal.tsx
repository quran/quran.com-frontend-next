import { FormEvent, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import styles from './CompleteSignupModal.module.scss';

import Button from 'src/components/dls/Button/Button';
import Input from 'src/components/dls/Forms/Input';
import Modal from 'src/components/dls/Modal/Modal';
import { completeSignup } from 'src/utils/auth/api';
import { makeUserProfileUrl } from 'src/utils/auth/apiPaths';
import CompleteSignupRequest from 'types/CompleteSignupRequest';

type CompleteSignupModalProps = {
  isOpen: boolean;
};

const CompleteSignupModal = ({ isOpen }: CompleteSignupModalProps) => {
  const { mutate } = useSWRConfig();
  const { t } = useTranslation('common');
  const [name, setData] = useState<CompleteSignupRequest>({ firstName: '', lastName: '' });

  const onSubmitClicked = (e) => {
    e.preventDefault();
    completeSignup(name).then(() => {
      // mutate the cache version of users/profile
      mutate(makeUserProfileUrl());
    });
  };

  return (
    <Modal isOpen={isOpen}>
      <form
        className={styles.container}
        onChange={(event: FormEvent<HTMLFormElement>) => {
          const formData = new FormData(event.currentTarget) as unknown as Iterable<
            [CompleteSignupRequest, FormDataEntryValue]
          >;
          setData(Object.fromEntries(formData) as CompleteSignupRequest);
        }}
      >
        <h2 className={styles.title}>{t('complete-sign-up')}</h2>
        <Input
          id="first-name"
          containerClassName={styles.input}
          fixedWidth={false}
          placeholder={t('first-name')}
          name="firstName"
        />
        <Input
          id="last-name"
          containerClassName={styles.input}
          fixedWidth={false}
          placeholder={t('last-name')}
          name="lastName"
        />
        <Button htmlType="submit" onClick={onSubmitClicked}>
          {t('submit')}
        </Button>
      </form>
    </Modal>
  );
};

export default CompleteSignupModal;
