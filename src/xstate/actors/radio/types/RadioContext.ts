import StationType from "../../../../Radio/types/StationType";

type RadioContext = {
    type: StationType;
    id?: string;
    reciterId?: string;
    chapterId?: string;
}

export default RadioContext;