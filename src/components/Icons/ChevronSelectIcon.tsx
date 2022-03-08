import { BaseIconProps } from './BaseIcon';

const ChevronSelectIcon = (props: BaseIconProps) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    fill="none"
    shapeRendering="geometricPrecision"
    style={{ color: 'currentColor' }}
    {...props}
  >
    <path d="M17 8.517L12 3 7 8.517M7 15.48l5 5.517 5-5.517" />
  </svg>
);

export default ChevronSelectIcon;
