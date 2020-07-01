import Card from './Card';
import { render } from '../../../../tests/utils';

test('should render', () => {
  const { container } = render(<Card title="title" subtitle="subtitle" image="#" />);
  expect(container).toMatchSnapshot();
});
