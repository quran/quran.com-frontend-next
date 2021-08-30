import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { getAvailableReciters } from 'src/api';
import Combobox from 'src/components/dls/Forms/Combobox';
import { selectReciter, setReciter } from 'src/redux/slices/AudioPlayer/state';
import useSWR from 'swr';
import { Section, SectionLabel, SectionRow, SectionTitle } from './Section';

const recitersToComboboxItems = (translations) =>
  translations.map((item) => ({
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
