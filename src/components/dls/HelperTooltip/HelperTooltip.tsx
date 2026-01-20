import classNames from 'classnames';

import styles from './HelperTooltip.module.scss';

import { ContentSide } from '@/dls/Popover';
import HoverablePopover from '@/dls/Popover/HoverablePopover';
import { TooltipType } from '@/dls/Tooltip';
import QuestionMarkIcon from '@/icons/help-circle.svg';

interface HelperTooltipProps {
  children: React.ReactNode;
  contentSide?: ContentSide;
  iconClassName?: string;
  contentClassName?: string;
  useTooltipStyles?: boolean;
}

const HelperTooltip = ({
  children,
  contentSide,
  iconClassName,
  contentClassName,
  useTooltipStyles = true,
}: HelperTooltipProps) => {
  return (
    <HoverablePopover
      triggerStyles={styles.trigger}
      content={<span className={styles.content}>{children}</span>}
      contentSide={contentSide}
      contentStyles={contentClassName}
      tooltipType={TooltipType.INFO}
      useTooltipStyles={useTooltipStyles}
    >
      <span className={classNames(iconClassName, styles.questionMarkIconContainer)}>
        <QuestionMarkIcon />
      </span>
    </HoverablePopover>
  );
};

export default HelperTooltip;
