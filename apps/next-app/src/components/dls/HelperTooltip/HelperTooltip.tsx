import { FiHelpCircle } from 'react-icons/fi';
import HoverablePopover from '../Popover/HoverablePopover';

import styles from './HelperTooltip.module.scss';

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
        <FiHelpCircle />
      </span>
    </HoverablePopover>
  );
};

export default HelperTooltip;
