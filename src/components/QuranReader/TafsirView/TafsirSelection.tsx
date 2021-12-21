import styles from './TafsirView.module.scss';

const TafsirSelection = () => {
  return (
    <div className={styles.tafsirSelectionContainer}>
      {['a', 'b'].map((x) => {
        const selected = x === 'persian';
        return (
          <div
            key={x}
            style={{
              textTransform: 'capitalize',
              marginInlineEnd: '1rem',
              paddingInline: '1rem',
              paddingBlock: '0.5rem',
              borderRadius: '0.5rem',
              backgroundColor: selected ? 'var(--color-success-medium)' : '#F2F2F2',
              color: selected ? '#fff' : null,
            }}
          >
            {x}
          </div>
        );
      })}
    </div>
  );
};

export default TafsirSelection;
