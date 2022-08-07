import Segment from "./Segment";

type VerseTiming = {
    verseKey: string;
    timestamp_from: number;
    timestamp_to: number;
    duration: number;
    segments: Segment[];
}

export default VerseTiming;