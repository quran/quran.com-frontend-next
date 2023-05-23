import classNames from 'classnames';
import defaults from 'lodash/defaults';
import defaultsDeep from 'lodash/defaultsDeep';

import styles from './CircularProgress.module.scss';
import Path from './Path';

import {
  VIEWBOX_WIDTH,
  VIEWBOX_HEIGHT,
  VIEWBOX_HEIGHT_HALF,
  VIEWBOX_CENTER_X,
  VIEWBOX_CENTER_Y,
} from '@/utils/circularProgress';

export type CircularProgressbarStyles = {
  root?: React.CSSProperties;
  trail?: React.CSSProperties;
  path?: React.CSSProperties;
  text?: React.CSSProperties;
  background?: React.CSSProperties;
};

export type CircularProgressbarDefaultProps = {
  background: boolean;
  backgroundPadding: number;
  circleRatio: number;
  classes: {
    root: string;
    trail: string;
    path: string;
    text: string;
    background: string;
  };
  className: string;
  counterClockwise: boolean;
  maxValue: number;
  minValue: number;
  strokeWidth: number;
  text: string;
};

export type CircularProgressbarProps = CircularProgressbarDefaultProps & {
  value: number;
};

const defaultProps: Partial<CircularProgressbarDefaultProps> = {
  background: false,
  backgroundPadding: 0,
  circleRatio: 1,
  classes: {
    root: styles.progressbar,
    trail: styles.trail,
    path: styles.path,
    text: styles.text,
    background: styles.background,
  },
  counterClockwise: false,
  maxValue: 100,
  minValue: 0,
  strokeWidth: 8,
};

const CircularProgressbar: React.FC<Partial<CircularProgressbarProps>> = ({ ...initialProps }) => {
  const {
    background,
    backgroundPadding,
    circleRatio,
    className,
    classes,
    counterClockwise,
    strokeWidth,
    text,
    ...props
  } = defaultsDeep(initialProps, defaults(initialProps, defaultProps));

  const getBackgroundPadding = () => {
    if (!background) {
      // Don't add padding if not displaying background
      return 0;
    }

    return backgroundPadding;
  };

  const getPathRadius = () => {
    // The radius of the path is defined to be in the middle, so in order for the path to
    // fit perfectly inside the 100x100 viewBox, need to subtract half the strokeWidth
    return VIEWBOX_HEIGHT_HALF - strokeWidth / 2 - getBackgroundPadding();
  };

  // Ratio of path length to trail length, as a value between 0 and 1
  const getPathRatio = () => {
    const { value, minValue, maxValue } = props;
    const boundedValue = Math.min(Math.max(value, minValue), maxValue);
    return (boundedValue - minValue) / (maxValue - minValue);
  };

  const pathRadius = getPathRadius();
  const pathRatio = getPathRatio();

  return (
    <svg
      className={classNames(classes?.root, className)}
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      data-test-id="CircularProgressbar"
    >
      {background ? (
        <circle
          className={classNames(classes?.background)}
          cx={VIEWBOX_CENTER_X}
          cy={VIEWBOX_CENTER_Y}
          r={VIEWBOX_HEIGHT_HALF}
        />
      ) : null}

      <Path
        className={classNames(classes?.trail)}
        counterClockwise={counterClockwise}
        dashRatio={circleRatio}
        pathRadius={pathRadius}
        strokeWidth={strokeWidth}
      />

      <Path
        className={classNames(classes?.path)}
        counterClockwise={counterClockwise}
        dashRatio={pathRatio * circleRatio}
        pathRadius={pathRadius}
        strokeWidth={strokeWidth}
      />

      {text ? (
        <text className={classNames(classes?.text)} x={VIEWBOX_CENTER_X} y={VIEWBOX_CENTER_Y}>
          {text}
        </text>
      ) : null}
    </svg>
  );
};

export default CircularProgressbar;
