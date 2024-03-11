import styles from './video.module.scss';
import { getBackgroundWithOpacityById } from './VideoUtils';

const BackgroundColors = ({
  opacity,
  colors,
  type,
  setVerseBackground,
  setSceneBackground,
  seekToBeginning,
}) => {
  const onColorSelected = (selectionType: any, color: { id: any }) => {
    const backgroundColor = getBackgroundWithOpacityById(color.id, opacity);
    switch (selectionType) {
      case 'verse':
        seekToBeginning();
        setVerseBackground(backgroundColor);
        break;
      case 'scene':
        seekToBeginning();
        setSceneBackground(backgroundColor);
        break;
      default:
    }
  };

  return (
    <div className={styles.backgroundColorsWrapper}>
      {colors.map((color, index) => (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          className={styles.colorBox}
          onClick={() => {
            onColorSelected(type, color);
          }}
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          style={color}
        />
      ))}
    </div>
  );
};

export default BackgroundColors;
