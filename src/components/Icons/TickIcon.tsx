import { BaseIconProps } from './BaseIcon';

const TickIcon = (props: BaseIconProps) => (
  <svg viewBox="0 0 20 20" height="16" width="16" fill="none" {...props}>
    <path
      d="M14 7L8.5 12.5L6 10"
      stroke="var(--color-background-default)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default TickIcon;
