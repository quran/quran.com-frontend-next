import React from 'react';

import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import useAddQueryParamsToUrl from './useAddQueryParamsToUrl';

interface TestComponentProps {
  relativeUrl: string;
  params: Record<string, unknown>;
}

const TestComponent: React.FC<TestComponentProps> = ({ relativeUrl, params }) => {
  useAddQueryParamsToUrl(relativeUrl, params);
  return null;
};

describe('useAddQueryParamsToUrl', () => {
  beforeEach(() => {
    window.history.replaceState({ initial: 'state' }, '', '/');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('pushes history with the language prefix and merges existing state', async () => {
    window.history.replaceState({ existing: 'state' }, '', '/en/search?page=1');
    const pushStateSpy = vi.spyOn(window.history, 'pushState');

    render(<TestComponent relativeUrl="/search" params={{ query: 'prayer', page: 2 }} />);

    const expectedUrl = '/en/search?query=prayer&page=2';

    await waitFor(() => expect(pushStateSpy).toHaveBeenCalledTimes(1));

    expect(pushStateSpy).toHaveBeenCalledWith(
      { existing: 'state', as: expectedUrl, url: expectedUrl },
      '',
      expectedUrl,
    );
  });

  it('does not push history when the generated url matches the current url', async () => {
    window.history.replaceState({ existing: 'state' }, '', '/search?query=dua');
    const pushStateSpy = vi.spyOn(window.history, 'pushState');

    render(<TestComponent relativeUrl="/search" params={{ query: 'dua' }} />);

    await waitFor(() => expect(pushStateSpy).not.toHaveBeenCalled());
  });

  it('omits undefined parameters and works without a language prefix', async () => {
    window.history.replaceState({}, '', '/search');
    const pushStateSpy = vi.spyOn(window.history, 'pushState');

    render(
      <TestComponent
        relativeUrl="/search"
        params={{ term: 'reflection', optional: undefined, count: 0, empty: null }}
      />,
    );

    const expectedUrl = '/search?term=reflection&count=0';

    await waitFor(() => expect(pushStateSpy).toHaveBeenCalledTimes(1));

    expect(pushStateSpy).toHaveBeenCalledWith(
      { as: expectedUrl, url: expectedUrl },
      '',
      expectedUrl,
    );
    expect(pushStateSpy.mock.calls[0][2]).not.toContain('optional');
    expect(pushStateSpy.mock.calls[0][2]).not.toContain('empty');
  });
});
