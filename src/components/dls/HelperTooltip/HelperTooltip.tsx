import QuestionMarkIcon from '../../../../public/icons/question-mark.svg';

import styles from './HelperTooltip.module.scss';

import Tooltip from 'src/components/dls/Tooltip';

interface HelperTooltipProps {
  children: React.ReactNode;
}

const HelperTooltip = ({ children }: HelperTooltipProps) => {
  return (
    <Tooltip text={children}>
      <span className={styles.questionMarkIconContainer}>
        <QuestionMarkIcon />
      </span>
    </Tooltip>
  );
};

export default HelperTooltip;
