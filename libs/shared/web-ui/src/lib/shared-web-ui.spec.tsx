import { render } from '@testing-library/react';

import SharedWebUi from './shared-web-ui';

describe('SharedWebUi', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SharedWebUi />);
    expect(baseElement).toBeTruthy();
  });
});
