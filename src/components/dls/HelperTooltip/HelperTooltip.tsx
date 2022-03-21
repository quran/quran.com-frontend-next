import HoverablePopover from '../Popover/HoverablePopover';

import styles from './HelperTooltip.module.scss';

import { HelpCircleIcon } from 'src/components/Icons';

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
        <HelpCircleIcon />
      </span>
    </HoverablePopover>
  );
};

export default HelperTooltip;
