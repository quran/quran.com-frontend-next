import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import styles from './AudioSection.module.scss';
import Section from './Section';

import DataFetcher from 'src/components/Api/DataFetcher';
import Combobox from 'src/components/dls/Forms/Combobox';
import { selectReciter, setReciter } from 'src/redux/slices/AudioPlayer/state';
import { makeRecitersUrl } from 'src/utils/apiPaths';
import { RecitersResponse } from 'types/ApiResponses';
import Reciter from 'types/Reciter';

// convert the reciter's data from API to combobox items
// so we can use it with Combobox component
const recitersToComboboxItems = (reciters) =>
  reciters.map((item: Reciter) => ({
    id: item.id.toString(),
    value: item.id,
    label: item.name.toString(),
    name: item.id.toString(),
  }));

const AudioSection = () => {
  const dispatch = useDispatch();
  const selectedReciter = useSelector(selectReciter, shallowEqual);

  // given the reciterId, get the full reciter object.
  // and setReciter in redux
  const onSelectedReciterChange = (reciterId: string, reciters: Reciter[]) => {
    if (!reciterId) return;
    const reciter = reciters.find((r) => r.id === Number(reciterId));
    dispatch(setReciter(reciter));
  };

  return (
    <div className={styles.container}>
      <DataFetcher
        queryKey={makeRecitersUrl()}
        render={(data: RecitersResponse) => (
          <Section>
            <Section.Title>Audio</Section.Title>
            <Section.Row>
              <Section.Label>Reciter</Section.Label>
              <div>
                <Combobox
                  id="audio-reciter"
                  minimumRequiredItems={1}
                  items={data ? recitersToComboboxItems(data.reciters) : []}
                  initialInputValue={selectedReciter.name}
                  value={selectedReciter.id.toString()}
                  onChange={(reciterId: string) => {
                    onSelectedReciterChange(reciterId, data.reciters);
                  }}
                />
              </div>
            </Section.Row>
          </Section>
        )}
      />
    </div>
  );
};

export default AudioSection;
