import Card from './Card';
import { render } from '../../../../tests/utils';

// This is a workaround to enable next/image usage until it has jest support: https://github.com/vercel/next.js/discussions/18516
jest.mock('next/image', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

test('should render', () => {
  const { container } = render(<Card title="title" subtitle="subtitle" image="#" />);
  expect(container).toMatchSnapshot();
});
