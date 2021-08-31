import { useDispatch, useSelector } from 'react-redux';
import Combobox from 'src/components/dls/Forms/Combobox';
import { selectTheme, setTheme } from 'src/redux/slices/theme';
import Section from './Section';

// TODO: internationalize label
const themes = [
  { id: 'system', value: 'system', label: 'System', name: 'system' },
  { id: 'light', value: 'light', label: 'Light', name: 'light' },
  { id: 'dark', value: 'dark', label: 'Dark', name: 'dark' },
  { id: 'sepia', value: 'sepia', label: 'Sepia', name: 'sepia' },
];

// given the id of a theme, return the label. data from the themes array above
const getLabelById = (id: string) => themes.find((theme) => theme.id === id)?.label;

const ThemeSection = () => {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);
  return (
    <Section>
      <Section.Title>Theme</Section.Title>
      <Section.Row>
        <Section.Label>Mode</Section.Label>
        <Combobox
          id="theme-section"
          value={theme.type}
          initialInputValue={getLabelById(theme.type)}
          items={themes}
          onChange={(value) => dispatch({ type: setTheme.type, payload: value })}
        />
      </Section.Row>
      <Section.Footer visible={theme.type === 'system'}>
        The system theme automatically adopts to your light/dark mode settings
      </Section.Footer>
    </Section>
  );
};

export default ThemeSection;
