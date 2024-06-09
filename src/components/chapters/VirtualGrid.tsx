import { useRef, ReactNode, useState, useEffect } from 'react';

import { useWindowVirtualizer } from '@tanstack/react-virtual';

import { View } from '@/types/Chapter';

type VirtualGridProps = {
  view: View.Surah | View.RevelationOrder | View.Juz;
  renderRow: (rowIndex: number, gridNumCols?: number) => ReactNode;
};

const VirtualGrid: React.FC<VirtualGridProps> = ({ renderRow }: VirtualGridProps) => {
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

  const surahPreviewHeight = 74;

  const virtualizer = useWindowVirtualizer({
    count: 114,
    estimateSize: () => surahPreviewHeight,
    overscan: 6,
    scrollMargin: listRef.current?.offsetTop ?? 0,
    gap: 13,
    lanes: gridNumCols,
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
        {virtualizer.getVirtualItems().map((cell) => {
          let left = '0%';
          let width = '100%';

          if (gridNumCols === 3) {
            left = `${cell.lane * 33.33}%`;
            width = `33.33%`;
          } else if (gridNumCols === 2) {
            left = `${cell.lane * 50}%`;
            width = `50%`;
          } else {
            left = `${cell.lane * 100}%`;
            width = `100%`;
          }

          return (
            <div
              key={cell.key}
              style={{
                display: 'flex',
                position: 'absolute',
                top: 0,
                left,
                width,
                height: `${cell.size}px`,
                transform: `translateY(${cell.start - virtualizer.options.scrollMargin}px)`,
              }}
            >
              {renderRow(cell.index, gridNumCols)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VirtualGrid;
