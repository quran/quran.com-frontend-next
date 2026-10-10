import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import RepeatSetting from './RepeatSetting';

vi.mock('@/hooks/useDirection', () => ({ default: () => 'ltr' }));
vi.mock('@/dls/Counter/Counter', () => ({
  default: ({ count }: { count: string }) => <span>{count}</span>,
}));

const LABEL = 'Pause after each verse';
const SUFFIX = '× verse length';
const DESCRIPTION = 'Set to 0 for no pause.';

describe('RepeatSetting', () => {
  it('shows guidance that explains a setting value', () => {
    render(
      <RepeatSetting
        label={LABEL}
        value={1}
        onChange={vi.fn()}
        suffix={SUFFIX}
        description={DESCRIPTION}
      />,
    );

    expect(screen.getByText(LABEL).textContent).toBe(LABEL);
    expect(screen.getByText(SUFFIX).textContent).toContain(SUFFIX);
    expect(screen.getByText(DESCRIPTION).textContent).toBe(DESCRIPTION);
  });
});
