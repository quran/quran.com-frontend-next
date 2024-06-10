import { useRef, ReactNode, useState, useEffect } from 'react';

import { useWindowVirtualizer } from '@tanstack/react-virtual';

type VirtualGridProps = {
  renderRow: (rowIndex: number, gridNumCols: number) => ReactNode;
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

  const numRows = 114 / gridNumCols;

  const virtualizer = useWindowVirtualizer({
    count: numRows,
    estimateSize: () => surahPreviewHeight,
    overscan: 5,
    scrollMargin: listRef.current?.offsetTop ?? 0,
    gap: 13,
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
          return (
            <div
              key={row.key}
              style={{
                display: 'flex',
                gap: '13px',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${row.size}px`,
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
