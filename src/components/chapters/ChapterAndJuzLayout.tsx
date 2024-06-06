import { useEffect, useState, useRef } from 'react';

import { useWindowVirtualizer } from '@tanstack/react-virtual';

import { View } from './ChapterAndJuzList';

type VirtualGridProps = {
  view: View.Surah | View.RevelationOrder | View.Juz;
  children: React.ReactNode;
};

const VirtualGrid: React.FC<VirtualGridProps> = ({ view, children }: VirtualGridProps) => {
  const [gridNumCols, setGridNumCols] = useState(3);
  useEffect(() => {
    const updateGridNumCols = () => {
      if (window.innerWidth > 1024) {
        setGridNumCols(3);
      } else if (window.innerWidth > 768) {
        setGridNumCols(2);
      } else {
        setGridNumCols(1);
      }
    };
    window.addEventListener('resize', updateGridNumCols);
    return () => {
      window.removeEventListener('resize', updateGridNumCols);
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
  const virtualizer = useWindowVirtualizer({
    count: numOfRows,
    estimateSize: () => 78,
    overscan: 5,
    scrollMargin: listRef.current?.offsetTop ?? 0,
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
        {virtualizer.getVirtualItems().map((row) => (
          <div
            key={row.key}
            style={{
              display: 'flex',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${row.size}px`,
              transform: `translateY(${row.start - virtualizer.options.scrollMargin}px)`,
            }}
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  );
};
