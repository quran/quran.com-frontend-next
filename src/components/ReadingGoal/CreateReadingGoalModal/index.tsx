/* eslint-disable max-lines */
import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './CreateReadingGoalModal.module.scss';
import ExamplesTab from './ExamplesTab';
import FormTab from './FormTab';

import Button from '@/dls/Button/Button';
import Modal from '@/dls/Modal/Modal';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { CreateReadingGoalRequest, ReadingGoalType } from '@/types/auth/ReadingGoal';
import { addReadingGoal } from '@/utils/auth/api';

const CreateReadingGoalModal: React.FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [tab, setTab] = useState<'examples' | 'form'>('examples');
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<ReadingGoalType>(ReadingGoalType.PAGES);
  const [pages, setPages] = useState(1);
  const [seconds, setSeconds] = useState(60);
  const [duration, setDuration] = useState<number | null>(null);
  const [rangeStartVerse, setRangeStartVerse] = useState<string | null>(null);
  const [rangeEndVerse, setRangeEndVerse] = useState<string | null>(null);

  const onClose = () => {
    setIsOpen(false);

    setTab('examples');

    // reset data
    setType(ReadingGoalType.PAGES);
    setPages(1);
    setSeconds(60);
    setDuration(null);
    setRangeStartVerse(null);
    setRangeEndVerse(null);
  };

  const onSubmit = async () => {
    let amount: string | number;

    if (type === ReadingGoalType.PAGES) amount = pages;
    else if (type === ReadingGoalType.TIME) amount = seconds;
    else amount = `${rangeStartVerse}-${rangeEndVerse}`;

    const data: CreateReadingGoalRequest = {
      type,
      amount,
    };
    if (duration) data.duration = duration;

    try {
      await addReadingGoal(data);
      toast(t('reading-goal:set-reading-goal-success'), {
        status: ToastStatus.Success,
      });
      onClose();
    } catch (e) {
      toast(t('common:error.general'), {
        status: ToastStatus.Error,
      });
    }
  };

  const getTab = () => {
    if (tab === 'examples') {
      return (
        <ExamplesTab
          onExampleClick={(example) => {
            // not custom
            if ('values' in example) {
              const { values } = example;
              setType(values.type);

              if ('pages' in values) setPages(values.pages);
              if ('seconds' in values) setSeconds(values.seconds);
              if ('rangeStartVerse' in values) setRangeStartVerse(values.rangeStartVerse);
              if ('rangeEndVerse' in values) setRangeEndVerse(values.rangeEndVerse);
              if ('duration' in values) setDuration(values.duration);
            }

            setTab('form');
          }}
        />
      );
    }

    return (
      <FormTab
        type={type}
        setType={setType}
        pages={pages}
        setPages={setPages}
        seconds={seconds}
        setSeconds={setSeconds}
        duration={duration}
        setDuration={setDuration}
        rangeStartVerse={rangeStartVerse}
        setRangeStartVerse={setRangeStartVerse}
        rangeEndVerse={rangeEndVerse}
        setRangeEndVerse={setRangeEndVerse}
      />
    );
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>{t('reading-goal:set-reading-goal')}</Button>

      <Modal isOpen={isOpen} onClickOutside={onClose}>
        <Modal.Body>
          <Modal.Header>
            <Modal.Title>{t('reading-goal:create-goal-modal.title')}</Modal.Title>
          </Modal.Header>
          <div className={styles.container}>{getTab()}</div>
        </Modal.Body>
        {tab === 'form' ? (
          <Modal.Footer>
            <Modal.Action onClick={onClose}>{t('common:cancel')}</Modal.Action>
            <Modal.Action onClick={onSubmit}>{t('common:submit')}</Modal.Action>
          </Modal.Footer>
        ) : null}
      </Modal>
    </>
  );
};

export default CreateReadingGoalModal;
