/* eslint-disable jsx-a11y/control-has-associated-label */
import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import DayCircle, { DayState } from '../DayCircle';

import styles from './StreakDefinitionModal.module.scss';

import Modal from '@/dls/Modal/Modal';
import QuestionMarkIcon from '@/icons/help-circle.svg';

const states = [
  {
    state: DayState.None,
    label: 'none',
  },
  {
    state: DayState.Stroked,
    label: 'stroked',
  },
  {
    state: DayState.Filled,
    label: 'filled',
  },
  {
    state: DayState.Checked,
    label: 'checked',
  },
];

const StreakDefinitionModal = () => {
  const { t } = useTranslation('reading-goal');
  const [open, setOpen] = useState(false);

  const onOpen = () => setOpen(true);
  const onClose = () => setOpen(false);

  return (
    <>
      <button type="button" className={styles.button} onClick={onOpen}>
        <QuestionMarkIcon />
      </button>

      <Modal isOpen={open} onClickOutside={onClose} onEscapeKeyDown={onClose}>
        <Modal.Body>
          <Modal.Header>
            <Modal.Title>{t('streak')}</Modal.Title>
            <Modal.Subtitle>{t('streak-definition')}</Modal.Subtitle>
          </Modal.Header>

          <div className={styles.timelineSection}>
            <h2>{t('timeline-meaning')}</h2>
            <ul>
              {states.map(({ state, label }) => (
                <li key={label}>
                  <div className={styles.dayCircleWrapper}>
                    <DayCircle state={state} />
                  </div>
                  <span>{t(`timeline-states.${label}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default StreakDefinitionModal;
