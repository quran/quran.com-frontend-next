import useTranslation from 'next-translate/useTranslation';

import { readingGoalExamples, ReadingGoalTabProps } from './hooks/useReadingGoalReducer';
import OptionButton from './OptionButton';
import styles from './ReadingGoalPage.module.scss';

const ReadingGoalExamplesTab: React.FC<ReadingGoalTabProps> = ({
  state,
  dispatch,
  nav,
  logClick,
}) => {
  const { t } = useTranslation('reading-goal');

  return (
    <>
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>{t('examples-title')}</h1>
        <p className={styles.subtitle}>{t('examples-subtitle')}</p>
      </div>
      <div className={styles.optionsContainer}>
        {Object.keys(readingGoalExamples).map((exampleKey: keyof typeof readingGoalExamples) => {
          const example = readingGoalExamples[exampleKey];

          return (
            <OptionButton
              key={example.i18nKey}
              icon={example.icon}
              onSelect={() => {
                dispatch({ type: 'SET_EXAMPLE', payload: { exampleKey } });
                logClick(exampleKey);
              }}
              selected={state.exampleKey === exampleKey}
              option={t(`examples.${example.i18nKey}.title`)}
              recommended={'recommended' in example && example.recommended}
              description={t(`examples.${example.i18nKey}.description`)}
            />
          );
        })}
        {nav}
      </div>
    </>
  );
};

export default ReadingGoalExamplesTab;
