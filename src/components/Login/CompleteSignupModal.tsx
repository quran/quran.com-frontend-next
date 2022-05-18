import useTranslation from 'next-translate/useTranslation';

import Button from '../dls/Button/Button';
import Input from '../dls/Forms/Input';
import Modal from '../dls/Modal/Modal';

import styles from './CompleteSignupModal.module.scss';

type CompleteSignupModalProps = {
  isOpen: boolean;
};

const CompleteSignupModal = ({ isOpen }: CompleteSignupModalProps) => {
  const { t } = useTranslation('login');
  return (
    <Modal isOpen={isOpen}>
      <form className={styles.container}>
        <h2 className={styles.title}>{t('complete-sign-up')}</h2>
        <Input
          id="user-name"
          containerClassName={styles.input}
          fixedWidth={false}
          placeholder={t('your-name')}
        />
        <Button htmlType="submit">{t('submit')}</Button>
      </form>
    </Modal>
  );
};

export default CompleteSignupModal;
