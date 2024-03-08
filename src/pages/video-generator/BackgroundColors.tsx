import styles from './video.module.scss';

const BackgroundColors = ({ setOpacity, colors, type, setVerseBackground, setSceneBackground, seekToBeginning  }) => {
    const onColorSelected = (type, color) => {
        setOpacity('1');
        switch(type) {
            case 'verse':
                seekToBeginning();
                setVerseBackground(color);
                break;
            case 'scene':
                seekToBeginning();
                setSceneBackground(color);
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