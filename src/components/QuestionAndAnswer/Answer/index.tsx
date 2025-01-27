import styles from './Answer.module.scss';
import AnswerBody from './AnswerBody';
import RangesIndicator from './RangesIndicator';

import GroupedVerseAndTranslation from '@/components/Verse/GroupedVerseAndTranslation';
import Collapsible from '@/dls/Collapsible/Collapsible';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import { Question } from '@/types/QuestionsAndAnswers/Question';
import { logEvent } from '@/utils/eventLogger';
import { parseVerseRange } from '@/utils/verseKeys';

interface AnswerProps {
  question: Question;
}

const Answer = ({ question }: AnswerProps) => {
  const parsedRanges = parseVerseRange(question.ranges[0], true);
  const [rangeStartData, rangeEndData] = parsedRanges;

  const onRangesCollapseOpenChange = (isOpen: boolean) => {
    logEvent('question_ranges_collapse_open', {
      isOpen,
    });
  };

  return (
    <div className={styles.container}>
      <Collapsible
        title={<RangesIndicator parsedRanges={parsedRanges} />}
        prefix={<ChevronDownIcon />}
        shouldRotatePrefixOnToggle
        onOpenChange={onRangesCollapseOpenChange}
        headerClassName={styles.rangesHeader}
        headerLeftClassName={styles.headerLeftClassName}
      >
        {({ isOpen: isOpenRenderProp }) => {
          if (!isOpenRenderProp) return null;

          return (
            <GroupedVerseAndTranslation
              chapter={rangeStartData.chapter}
              from={rangeStartData.verse}
              to={rangeEndData.verse}
            />
          );
        }}
      </Collapsible>
      <AnswerBody question={question} />
    </div>
  );
};

export default Answer;
