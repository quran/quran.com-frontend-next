const TABLET_BREAKPOINT_PX = 768;
// Small tolerance to avoid flip/flop caused by sub-pixel rounding differences.
const OVERFLOW_TOLERANCE_PX = 1;

type ShouldEnableMushafOverflowWrapParams = {
  isReadingMode: boolean;
  viewportWidth: number;
  availableWidth: number;
  resolvedLineWidth: number;
};

const shouldEnableMushafOverflowWrap = ({
  isReadingMode,
  viewportWidth,
  availableWidth,
  resolvedLineWidth,
}: ShouldEnableMushafOverflowWrapParams): boolean => {
  // This fallback only targets mushaf reading on tablet+.
  if (!isReadingMode || viewportWidth < TABLET_BREAKPOINT_PX) {
    return false;
  }

  if (availableWidth <= 0 || resolvedLineWidth <= 0) {
    return false;
  }

  return resolvedLineWidth > availableWidth + OVERFLOW_TOLERANCE_PX;
};

export default shouldEnableMushafOverflowWrap;
