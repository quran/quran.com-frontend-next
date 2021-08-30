import { useDispatch, useSelector } from 'react-redux';
import Combobox from 'src/components/dls/Forms/Combobox';
import { selectTheme, setTheme } from 'src/redux/slices/theme';
import { Section, SectionLabel, SectionTitle, SectionDescription, SectionRow } from './Section';

// TODO: internationalize label
const themes = [
  { id: 'system', value: 'system', label: 'System', name: 'system' },
  { id: 'light', value: 'light', label: 'Light', name: 'light' },
  { id: 'dark', value: 'dark', label: 'Dark', name: 'dark' },
  { id: 'sepia', value: 'sepia', label: 'Sepia', name: 'sepia' },
];

const getLabelById = (id: string) => themes.find((theme) => theme.id === id)?.label;

const ThemeSection = () => {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);
  return (
    <Section>
      <SectionTitle>Theme</SectionTitle>
      <SectionRow>
        <SectionLabel>Mode</SectionLabel>
        <Combobox
          id="theme-section"
          value={theme.type}
          initialInputValue={getLabelById(theme.type)}
          items={themes}
          onChange={(value) => dispatch({ type: setTheme.type, payload: value })}
        />
      </SectionRow>
      <SectionDescription visible={theme.type === 'system'}>
        The system theme automatically adopts to your light/dark mode settings
      </SectionDescription>
    </Section>
  );
};

export default ThemeSection;
