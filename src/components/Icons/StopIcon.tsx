import { BaseIconProps } from './BaseIcon';

const StopIcon = (props: BaseIconProps) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M4 4H20V20H4V4Z" fill="#323232" />
  </svg>
);

export default StopIcon;
