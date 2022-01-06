import QuestionMarkIcon from '../../../../public/icons/help-circle.svg';
import HoverablePopover from '../Popover/HoverablePopover';

import styles from './HelperTooltip.module.scss';

interface HelperTooltipProps {
  children: React.ReactNode;
}

const HelperTooltip = ({ children }: HelperTooltipProps) => {
  return (
    <HoverablePopover
      triggerStyles={styles.trigger}
      content={<span style={{ maxWidth: 200, display: 'flex' }}>{children}</span>}
    >
      <span className={styles.questionMarkIconContainer}>
        <QuestionMarkIcon />
      </span>
    </HoverablePopover>
  );
};

export default HelperTooltip;
