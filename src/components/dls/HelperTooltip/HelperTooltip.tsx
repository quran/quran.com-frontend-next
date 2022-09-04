import HoverablePopover from '../Popover/HoverablePopover';

import styles from './HelperTooltip.module.scss';

import QuestionMarkIcon from '@/icons/help-circle.svg';

interface HelperTooltipProps {
  children: React.ReactNode;
}

const HelperTooltip = ({ children }: HelperTooltipProps) => {
  return (
    <HoverablePopover
      triggerStyles={styles.trigger}
      content={<span className={styles.content}>{children}</span>}
    >
      <span className={styles.questionMarkIconContainer}>
        <QuestionMarkIcon />
      </span>
    </HoverablePopover>
  );
};

export default HelperTooltip;
