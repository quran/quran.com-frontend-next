import { BaseIconProps } from './BaseIcon';

const CircleIcon = (props: BaseIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="feather feather-circle"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
  </svg>
);

export default CircleIcon;
