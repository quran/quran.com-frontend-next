import { useDispatch, useSelector } from 'react-redux';
import { selectChapter, setChapter } from 'src/redux/slices/AudioPlayer/state';
import * as chaptersData from '../../../data/chapters.json';

const ChapterAdjustment = () => {
  const selectedChapter = useSelector(selectChapter);
  const dispatch = useDispatch();
  return (
    <div>
      <span>Select Chapter</span>
      <select
        onChange={(e) => {
          const chapter = Number(e.target.value);
          dispatch(setChapter(chapter));
        }}
      >
        {Object.keys(chaptersData).map((c) => {
          return (
            <option value={c} selected={Number(c) === Number(selectedChapter)} key={c}>
              {c}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default ChapterAdjustment;
