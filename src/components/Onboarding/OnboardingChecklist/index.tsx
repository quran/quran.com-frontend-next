import classNames from 'classnames';
import { useRouter } from 'next/router';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import OnboardingProgress from '../OnboardingProgress';
import { onboardingChecklist } from '../steps';

import useShowChecklistAfterInterval from './hooks/useShowChecklistAfterInterval';
import styles from './OnboardingChecklist.module.scss';

import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import CheckIcon from '@/icons/check.svg';
import IconClose from '@/icons/close.svg';
import IconQuestionMark from '@/icons/question-mark-icon.svg';
import {
  dismissChecklist,
  selectOnboarding,
  setIsChecklistVisible,
} from '@/redux/slices/onboarding';
import {
  selectReadingPreferences,
  setReadingPreference,
} from '@/redux/slices/QuranReader/readingPreferences';
import PreferenceGroup from '@/types/auth/PreferenceGroup';
import OnboardingGroup from '@/types/OnboardingGroup';
import { ReadingPreference } from '@/types/QuranReader';
import { logButtonClick } from '@/utils/eventLogger';

const OnboardingChecklist = () => {
  const { t } = useTranslation('common');
  const checklistItems = onboardingChecklist(t);
  const router = useRouter();

  useShowChecklistAfterInterval();

  const dispatch = useDispatch();
  const { startTour, isActive } = useOnboarding();
  const { isChecklistVisible, checklistDismissals, completedGroups } =
    useSelector(selectOnboarding);

  const readingPreferences = useSelector(selectReadingPreferences);
  const { readingPreference } = readingPreferences;
  const {
    actions: { onSettingsChange },
  } = usePersistPreferenceGroup();

  const handleDismiss = () => {
    logButtonClick('onboarding_checklist_dismiss', {
      totalDismissals: checklistDismissals + 1,
    });
    dispatch(dismissChecklist());
  };

  const openChecklist = () => {
    logButtonClick('onboarding_checklist_open');
    dispatch(setIsChecklistVisible(true));
  };

  // If the onboarding is active, don't show the checklist
  if (isActive) {
    return null;
  }

  if (!isChecklistVisible) {
    if (router.pathname === '/') {
      return (
        <Button
          shape={ButtonShape.Circle}
          className={classNames(styles.checklistPosition)}
          tooltip={t('onboarding:onboarding-checklist')}
          onClick={openChecklist}
          size={ButtonSize.Large}
        >
          <IconQuestionMark className={styles.helpIcon} />
        </Button>
      );
    }

    return null;
  }

  const handleChecklistItemClick = async (group: OnboardingGroup) => {
    const item = checklistItems.find((i) => i.group === group);
    if (!item) return;

    if (group === OnboardingGroup.READING_EXPERIENCE) {
      // make sure we're on translation mode
      if (readingPreference !== ReadingPreference.Translation) {
        onSettingsChange(
          'readingPreference',
          ReadingPreference.Translation,
          setReadingPreference(ReadingPreference.Translation),
          setReadingPreference(readingPreference),
          PreferenceGroup.READING,
        );
      }
    }

    if (item.href) {
      await router.push(item.href);
    }

    startTour(group, 0);

    logButtonClick('onboarding_checklist_item', {
      group,
    });
  };

  return (
    <div className={classNames(styles.checklist, styles.checklistPosition)}>
      <div className={styles.checklistHeader}>
        <h4>
          <Trans
            i18nKey="onboarding:onboarding-title"
            components={{
              br: <br key={0} />,
            }}
          />
        </h4>

        <Button
          tooltip={t('close')}
          shape={ButtonShape.Circle}
          variant={ButtonVariant.Ghost}
          ariaLabel={t('close')}
          size={ButtonSize.Small}
          onClick={handleDismiss}
        >
          <IconClose />
        </Button>
      </div>

      <OnboardingProgress />

      <ul>
        {checklistItems.map((item) => {
          const checked = completedGroups[item.group]?.isCompleted;

          return (
            <li key={item.group}>
              <button
                onClick={() => handleChecklistItemClick(item.group)}
                type="button"
                className={classNames(checked && styles.completed)}
              >
                <div className={classNames(styles.checkCircle, checked && styles.filled)}>
                  {checked ? <CheckIcon /> : null}
                </div>

                <p>{item.title}</p>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default OnboardingChecklist;
