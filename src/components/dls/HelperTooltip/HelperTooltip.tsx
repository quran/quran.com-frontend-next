import classNames from 'classnames';

import styles from './HelperTooltip.module.scss';

import { ContentSide } from '@/dls/Popover';
import HoverablePopover from '@/dls/Popover/HoverablePopover';
import QuestionMarkIcon from '@/icons/help-circle.svg';

interface HelperTooltipProps {
  children: React.ReactNode;
  contentSide?: ContentSide;
  iconClassName?: string;
}

const HelperTooltip = ({ children, contentSide, iconClassName }: HelperTooltipProps) => {
  return (
    <HoverablePopover
      triggerStyles={styles.trigger}
      content={<span className={styles.content}>{children}</span>}
      contentSide={contentSide}
    >
      <span className={classNames(iconClassName, styles.questionMarkIconContainer)}>
        <QuestionMarkIcon />
      </span>
    </HoverablePopover>
  );
};

export default HelperTooltip;
