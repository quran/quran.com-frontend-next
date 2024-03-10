import styles from './video.module.scss';
import { getBackgroundWithOpacityById } from './VideoUtils';

const BackgroundColors = ({ opacity, colors, type, setVerseBackground, setSceneBackground, seekToBeginning  }) => {
    const onColorSelected = (type, color) => {
        const backgroundColor = getBackgroundWithOpacityById(color.id, opacity);
        switch(type) {
            case 'verse':
                seekToBeginning();
                setVerseBackground(backgroundColor);
                break;
            case 'scene':
                seekToBeginning();
                setSceneBackground(backgroundColor);
                break;
            default:
                return;
        }
    }

    return (
        <div className={styles.backgroundColorsWrapper}>
            {colors.map((color, index) => (
                <div tabIndex={0} className={styles.colorBox} onClick={(e) => {onColorSelected(type, color)}} key={index} style={color}></div>)
            )}
        </div>
    )
}

export default BackgroundColors;