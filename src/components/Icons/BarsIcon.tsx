import { BaseIconProps } from './BaseIcon';

const BarsIcon = (props: BaseIconProps) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g opacity="0.87316">
      <path d="M13.5 8.04871H10.5V15.9513H13.5V8.04871Z" fill="currentColor" />
      <path d="M3 5.45129H0V18.5487H3V5.45129Z" fill="currentColor" />
      <path d="M24 5.45129H21V18.5487H24V5.45129Z" fill="currentColor" />
    </g>
  </svg>
);

export default BarsIcon;
