import { VIEWBOX_CENTER_X, VIEWBOX_CENTER_Y } from '@/utils/circularProgress';

interface PathProps {
  className?: string;
  isCounterClockwise: boolean;
  dashRatio: number;
  pathRadius: number;
  strokeWidth: number;
  style?: object;
}

const Path: React.FC<PathProps> = ({
  className,
  isCounterClockwise,
  dashRatio,
  pathRadius,
  strokeWidth,
  style,
}) => {
  return (
    <path
      className={className}
      style={{
        ...style,
        ...getDashStyle({ pathRadius, dashRatio, isCounterClockwise }),
      }}
      d={getPathDescription({
        pathRadius,
        isCounterClockwise,
      })}
      strokeWidth={strokeWidth}
      fillOpacity={0}
    />
  );
};

// SVG path description specifies how the path should be drawn
function getPathDescription({
  pathRadius,
  isCounterClockwise,
}: {
  pathRadius: number;
  isCounterClockwise: boolean;
}) {
  const radius = pathRadius;
  const rotation = isCounterClockwise ? 1 : 0;

  // Move to center of canvas
  // Relative move to top canvas
  // Relative arc to bottom of canvas
  // Relative arc to top of canvas
  return `
      M ${VIEWBOX_CENTER_X},${VIEWBOX_CENTER_Y}
      m 0,-${radius}
      a ${radius},${radius} ${rotation} 1 1 0,${2 * radius}
      a ${radius},${radius} ${rotation} 1 1 0,-${2 * radius}
    `;
}

function getDashStyle({
  isCounterClockwise,
  dashRatio,
  pathRadius,
}: {
  isCounterClockwise: boolean;
  dashRatio: number;
  pathRadius: number;
}) {
  const diameter = Math.PI * 2 * pathRadius;
  const gapLength = (1 - dashRatio) * diameter;

  return {
    // Have dash be full diameter, and gap be full diameter
    strokeDasharray: `${diameter}px ${diameter}px`,
    // Shift dash backward by gapLength, so gap starts appearing at correct distance
    strokeDashoffset: `${isCounterClockwise ? -gapLength : gapLength}px`,
  };
}

export default Path;
