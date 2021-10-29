import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import DataFetcher from 'src/components/DataFetcher';
import Button from 'src/components/dls/Button/Button';
import { selectReciter, setReciterAndPauseAudio } from 'src/redux/slices/AudioPlayer/state';
import { makeRecitersUrl } from 'src/utils/apiPaths';
import { RecitersResponse } from 'types/ApiResponses';
import Reciter from 'types/Reciter';

const SettingsReciter = ({ onBack }) => {
  const dispatch = useDispatch();
  const selectedReciter = useSelector(selectReciter, shallowEqual);

  // given the reciterId, get the full reciter object.
  // and setReciter in redux
  const onSelectedReciterChange = (reciterId: string, reciters: Reciter[]) => {
    if (!reciterId) return;
    const reciter = reciters.find((r) => r.id === Number(reciterId));
    dispatch(setReciterAndPauseAudio(reciter));
  };

  return (
    <div>
      <Button onClick={onBack}>Back</Button>
      <DataFetcher
        queryKey={makeRecitersUrl()}
        render={(data: RecitersResponse) => (
          <div>
            {data.reciters.map((reciter) => (
              <div>
                <input
                  id={reciter.id.toString()}
                  type="radio"
                  name="reciter"
                  value={reciter.id}
                  checked={reciter.id === selectedReciter.id}
                  onChange={(e) => {
                    onSelectedReciterChange(e.target.value, data.reciters);
                  }}
                />
                <label htmlFor={reciter.id.toString()}>{reciter.name}</label>
              </div>
            ))}
            {/* <Combobox
              id="audio-reciter"
              minimumRequiredItems={1}
              items={data ? recitersToComboboxItems(data.reciters) : []}
              initialInputValue={selectedReciter.name}
              value={selectedReciter.id.toString()}
              onChange={(reciterId: string) => {
                onSelectedReciterChange(reciterId, data.reciters);
              }}
            /> */}
          </div>
        )}
      />
    </div>
  );
};

export default SettingsReciter;
