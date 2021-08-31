import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { getAvailableReciters } from 'src/api';
import Combobox from 'src/components/dls/Forms/Combobox';
import { selectReciter, setReciter } from 'src/redux/slices/AudioPlayer/state';
import useSWR from 'swr';
import Reciter from 'types/Reciter';
import { Section, SectionLabel, SectionRow, SectionTitle } from './Section';

// convert the reciter's data from API to combobox items
// so we can use with Combobox component
const recitersToComboboxItems = (reciters) =>
  reciters.map((item: Reciter) => ({
    id: item.id.toString(),
    value: item.id,
    label: item.name.toString(),
    name: item.id.toString(),
  }));

const AudioSection = () => {
  const dispatch = useDispatch();
  const { data, error } = useSWR(`/reciters`, () =>
    getAvailableReciters().then((res) =>
      res.status === 500 ? Promise.reject(error) : Promise.resolve(res.reciters),
    ),
  );
  const selectedReciter = useSelector(selectReciter, shallowEqual);
  const reciters = data || [];

  // given the reciterId, get the full reciter object.
  // and setReciter in redux
  const onSelectedReciterChange = (reciterId: string) => {
    const reciter = reciters.find((r) => r.id === Number(reciterId));
    dispatch(setReciter(reciter));
  };

  if (error) return null;

  const items = recitersToComboboxItems(reciters);
  return (
    <Section>
      <SectionTitle>Audio</SectionTitle>
      <SectionRow>
        <SectionLabel>Reciter</SectionLabel>
        <Combobox
          id="audio-reciter"
          items={items}
          initialInputValue={selectedReciter.name}
          value={selectedReciter.id.toString()}
          onChange={onSelectedReciterChange}
        />
      </SectionRow>
    </Section>
  );
};

export default AudioSection;
