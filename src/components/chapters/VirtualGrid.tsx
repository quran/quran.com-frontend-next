import { useRef, ReactNode, useState, useEffect } from 'react';

import { useWindowVirtualizer } from '@tanstack/react-virtual';

import { View } from '@/types/Chapter';

type VirtualGridProps = {
  view: View.Surah | View.RevelationOrder | View.Juz;
  renderRow: (rowIndex: number, gridNumCols?: number) => ReactNode;
};

const VirtualGrid: React.FC<VirtualGridProps> = ({ view, renderRow }: VirtualGridProps) => {
  const [gridNumCols, setGridNumCols] = useState(3);

  useEffect(() => {
    const mediaQuery1024 = window.matchMedia('(min-width: 1024px)');
    const mediaQuery768 = window.matchMedia('(min-width: 768px) and (max-width: 1023px)');
    const mediaQueryBelow768 = window.matchMedia('(max-width: 767px)');

    function handleMediaQuery1024(event: MediaQueryListEvent | MediaQueryList) {
      if (event.matches) {
        setGridNumCols(3);
      }
    }
    function handleMediaQuery768(event: MediaQueryListEvent | MediaQueryList) {
      if (event.matches) {
        setGridNumCols(2);
      }
    }
    function handleMediaQueryBelow768(event: MediaQueryListEvent | MediaQueryList) {
      if (event.matches) {
        setGridNumCols(1);
      }
    }
    // Run handlers once to check the initial state
    handleMediaQuery1024(mediaQuery1024);
    handleMediaQuery768(mediaQuery768);
    handleMediaQueryBelow768(mediaQueryBelow768);
    mediaQuery1024.addEventListener('change', handleMediaQuery1024);
    mediaQuery768.addEventListener('change', handleMediaQuery768);
    mediaQueryBelow768.addEventListener('change', handleMediaQueryBelow768);
    return () => {
      mediaQuery1024.removeEventListener('change', handleMediaQuery1024);
      mediaQuery768.removeEventListener('change', handleMediaQuery768);
      mediaQueryBelow768.removeEventListener('change', handleMediaQueryBelow768);
    };
  }, []);

  const listRef = useRef<HTMLDivElement | null>(null);

  let numOfRows = 38;
  if (gridNumCols === 3) {
    numOfRows = 38;
  } else if (gridNumCols === 2) {
    numOfRows = 57;
  } else {
    numOfRows = 114;
  }

  const numOfJuzs = 30;

  const largestJuzHeight = 3300;

  const surahPreviewHeight = 74;

  const virtualizer = useWindowVirtualizer({
    count: view === View.Juz ? numOfJuzs : numOfRows,
    estimateSize: () => (view === View.Juz ? largestJuzHeight : surahPreviewHeight),
    overscan: 5,
    scrollMargin: listRef.current?.offsetTop ?? 0,
    ...(view === View.Juz && { lanes: gridNumCols }),
    ...(view !== View.Juz && { gap: 13 }),
  });

  return (
    <div ref={listRef}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: `${virtualizer.getTotalSize()}px`,
        }}
      >
        {virtualizer.getVirtualItems().map((row) => {
          let left = '0%';
          let width = '100%';

          if (view === View.Juz) {
            if (gridNumCols === 3) {
              left = `${row.lane * 33.33}%`;
              width = `33.33%`;
            } else if (gridNumCols === 2) {
              left = `${row.lane * 50}%`;
              width = `50%`;
            } else {
              left = `${row.lane * 100}%`;
              width = `100%`;
            }
          }

          return (
            <div
              key={row.key}
              data-index={row.index}
              ref={virtualizer.measureElement}
              style={{
                display: 'flex',
                gap: '13px',
                position: 'absolute',
                top: 0,
                left,
                width,
                ...(view !== View.Juz && { height: `${row.size}px` }),
                transform: `translateY(${row.start - virtualizer.options.scrollMargin}px)`,
              }}
            >
              {renderRow(row.index, gridNumCols)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VirtualGrid;

/* remove the styling and put in a file called virtualgridmodulescss and use the view to determine which class
to apply to the element */
