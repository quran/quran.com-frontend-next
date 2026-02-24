import React from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Banner from './Banner';

vi.mock('@/dls/IconContainer/IconContainer', () => ({
  default: () => <div data-testid="icon-container" />,
  IconColor: { tertiary: 'tertiary' },
  IconSize: { Xsmall: 'Xsmall' },
}));

vi.mock('@/dls/Link/Link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
  LinkVariant: { Blend: 'blend' },
}));

vi.mock('@/icons/diamond.svg', () => ({
  default: () => <div data-testid="diamond-icon" />,
}));

describe('Banner', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders CTA only when URL is present', () => {
    render(<Banner text="Announcement" ctaButtonText="Learn more" ctaUrl="https://example.com" />);

    expect(screen.getByText('Announcement')).toBeDefined();
    expect(screen.getByRole('link').getAttribute('href')).toBe('https://example.com');
  });

  it('does not render CTA when URL is missing', () => {
    render(<Banner text="Announcement" ctaButtonText="Learn more" />);

    expect(screen.getByText('Announcement')).toBeDefined();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('renders HTML text when text format is html', () => {
    render(<Banner text="<strong>Announcement</strong>" textFormat="html" />);

    expect(screen.getByText('Announcement').tagName.toLowerCase()).toBe('strong');
  });
});
