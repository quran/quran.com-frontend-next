import { useRef, ReactNode } from 'react';

import { useWindowVirtualizer } from '@tanstack/react-virtual';

import { View } from '@/types/Chapter';

type VirtualGridProps = {
  view: View.Surah | View.RevelationOrder | View.Juz;
  renderRow: (rowIndex: number, gridNumCols?: number) => ReactNode;
};

const VirtualGrid: React.FC<VirtualGridProps> = ({ view, renderRow }: VirtualGridProps) => {
  const gridNumCols: number = 1;
  // useEffect(() => {
  //   const updateGridNumCols = () => {
  //     if (window.innerWidth > 1024) {
  //       setGridNumCols(3);
  //     } else if (window.innerWidth > 768) {
  //       setGridNumCols(2);
  //     } else {
  //       setGridNumCols(1);
  //     }
  //   };
  //   window.addEventListener('resize', updateGridNumCols);
  //   return () => {
  //     window.removeEventListener('resize', updateGridNumCols);
  //   };
  // }, []);

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
              width = `${row.lane * 33.33}%`;
            } else if (gridNumCols === 2) {
              left = `${row.lane * 50}%`;
              width = `${row.lane * 50}%`;
            } else {
              left = `${row.lane * 100}%`;
              width = `${row.lane * 100}%`;
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
