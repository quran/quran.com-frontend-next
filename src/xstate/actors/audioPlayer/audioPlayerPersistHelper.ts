import AudioPlayerEventType from "./types/AudioPlayerEventType";

const AUDIO_PLAYER_LOCALSTORAGE_KEY = 'audio-player-state';
export const persistToLocalStorage = (newState: Record<string, any>) => {
    try {
        const previousState = JSON.parse(localStorage.getItem(AUDIO_PLAYER_LOCALSTORAGE_KEY)) || {}
        const nextState = { ...previousState, ...newState }
        localStorage.setItem(AUDIO_PLAYER_LOCALSTORAGE_KEY, JSON.stringify(nextState))
    } catch (error) {
        // TODO: log error
    }
}

export const getStateFromLocalStorage = () => {
    try {
        const stateString = localStorage.getItem(AUDIO_PLAYER_LOCALSTORAGE_KEY)
        if (stateString) {
            return JSON.parse(stateString) || {}
        }
        return {}
    } catch (e) {
        // TODO: log error
        return {}
    }
}


type AudioPlayerEventTypeKey = AudioPlayerEventType['type']
const eventTypeToDataPersistSelector: { [key in AudioPlayerEventTypeKey]?: any } = {
    'CHANGE_RECITER': ({ reciterId }) => ({ reciterId }),
    'SET_PLAYBACK_SPEED': ({ playbackRate }) => ({ playbackRate }),
}
export const persistXstateContext = (event: AudioPlayerEventType) => {
    const getDataToPersistFromEvent = eventTypeToDataPersistSelector[event.type]
    const dataToPersist = getDataToPersistFromEvent?.(event)
    if (dataToPersist) {
        persistToLocalStorage(dataToPersist)
    }
}