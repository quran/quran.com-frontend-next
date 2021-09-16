import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import Section from './Section';

import Select from 'src/components/dls/Forms/Select';
import { selectTheme, setTheme, ThemeType } from 'src/redux/slices/theme';
import { generateSelectOptions } from 'src/utils/input';

const ThemeSection = () => {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme, shallowEqual);
  return (
    <Section>
      <Section.Title>Theme</Section.Title>
      <Section.Row>
        <Section.Label>Mode</Section.Label>
        <Select
          id="theme-section"
          name="theme"
          options={themes}
          value={theme.type}
          onChange={(value) => dispatch({ type: setTheme.type, payload: value })}
        />
      </Section.Row>
      <Section.Footer visible={theme.type === ThemeType.System}>
        The system theme automatically adopts to your light/dark mode settings
      </Section.Footer>
    </Section>
  );
};

// TODO: internationalize label
const themes = generateSelectOptions([
  ThemeType.System,
  ThemeType.Light,
  ThemeType.Dark,
  ThemeType.Sepia,
]);

export default ThemeSection;
