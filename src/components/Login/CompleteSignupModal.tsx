import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './CompleteSignupModal.module.scss';

import Button from 'src/components/dls/Button/Button';
import Input from 'src/components/dls/Forms/Input';
import Modal from 'src/components/dls/Modal/Modal';

type CompleteSignupModalProps = {
  isOpen: boolean;
};

const CompleteSignupModal = ({ isOpen }: CompleteSignupModalProps) => {
  const { t } = useTranslation('login');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [name, setName] = useState('');

  const onSubmitClicked = (e) => {
    e.preventDefault();
    // TODO: Call BE here
  };

  return (
    <Modal isOpen={isOpen}>
      <form className={styles.container}>
        <h2 className={styles.title}>{t('complete-sign-up')}</h2>
        <Input
          id="user-name"
          containerClassName={styles.input}
          fixedWidth={false}
          placeholder={t('your-name')}
          onChange={setName}
        />
        <Button htmlType="submit" onClick={onSubmitClicked}>
          {t('submit')}
        </Button>
      </form>
    </Modal>
  );
};

export default CompleteSignupModal;
