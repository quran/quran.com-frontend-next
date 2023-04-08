import { VIEWBOX_CENTER_X, VIEWBOX_CENTER_Y } from '@/utils/circularProgress';

interface PathProps {
  className?: string;
  counterClockwise: boolean;
  dashRatio: number;
  pathRadius: number;
  strokeWidth: number;
  style?: object;
}

const Path: React.FC<PathProps> = ({
  className,
  counterClockwise,
  dashRatio,
  pathRadius,
  strokeWidth,
  style,
}) => {
  return (
    <path
      className={className}
      style={{ ...style, ...getDashStyle({ pathRadius, dashRatio, counterClockwise }) }}
      d={getPathDescription({
        pathRadius,
        counterClockwise,
      })}
      strokeWidth={strokeWidth}
      fillOpacity={0}
    />
  );
};

// SVG path description specifies how the path should be drawn
function getPathDescription({
  pathRadius,
  counterClockwise,
}: {
  pathRadius: number;
  counterClockwise: boolean;
}) {
  const radius = pathRadius;
  const rotation = counterClockwise ? 1 : 0;

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
  counterClockwise,
  dashRatio,
  pathRadius,
}: {
  counterClockwise: boolean;
  dashRatio: number;
  pathRadius: number;
}) {
  const diameter = Math.PI * 2 * pathRadius;
  const gapLength = (1 - dashRatio) * diameter;

  return {
    // Have dash be full diameter, and gap be full diameter
    strokeDasharray: `${diameter}px ${diameter}px`,
    // Shift dash backward by gapLength, so gap starts appearing at correct distance
    strokeDashoffset: `${counterClockwise ? -gapLength : gapLength}px`,
  };
}

export default Path;
