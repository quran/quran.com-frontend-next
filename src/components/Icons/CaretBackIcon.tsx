import { BaseIconProps } from './BaseIcon';

const CaretBackIcon = (props: BaseIconProps) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M17.25 3L6.75 12L17.25 21V3Z" fill="currentColor" />
  </svg>
);

export default CaretBackIcon;
