import { BaseIconProps } from './BaseIcon';

const DividerHorizontalIcon = (props: BaseIconProps) => (
  <svg viewBox="0 0 24 24" height="24" width="24" fill="none" {...props}>
    <line
      x1="5"
      y1="10"
      x2="15"
      y2="10"
      stroke="var(--color-secondary-medium)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default DividerHorizontalIcon;
