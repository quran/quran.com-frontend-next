import { BaseIconProps } from './BaseIcon';

const CaretDownIcon = (props: BaseIconProps) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    fill="none"
    shapeRendering="geometricPrecision"
    style={{ color: 'currentColor' }}
    {...props}
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export default CaretDownIcon;
