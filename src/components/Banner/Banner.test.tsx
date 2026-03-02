import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Banner, { BannerVariant } from './Banner';
import styles from './Banner.module.scss';

vi.mock('@/dls/IconContainer/IconContainer', () => ({
  default: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  IconSize: {
    Xsmall: 'xsmall',
  },
}));

vi.mock('@/dls/Link/Link', () => ({
  default: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
  LinkVariant: {
    Blend: 'blend',
  },
}));

vi.mock('@/icons/diamond.svg', () => ({
  default: () => <svg />,
}));

describe('Banner', () => {
  it('underlines desktop second segment when desktop copy equals combined mobile copy', () => {
    const copy = {
      desktop: "It's the month of the Quran. Help us spread its light.",
      mobileLineOne: "It's the month of the Quran.",
      mobileLineTwo: 'Help us spread its light.',
    };

    const { container } = render(<Banner variant={BannerVariant.Standalone} copy={copy} />);
    const desktopLine = container.querySelector(`.${styles.desktopLine}`);

    expect(desktopLine).not.toBeNull();
    expect(desktopLine?.querySelector(`.${styles.mobileLineUnderlined}`)?.textContent?.trim()).toBe(
      copy.mobileLineTwo,
    );
  });

  it('renders plain desktop line when desktop copy differs from combined mobile copy', () => {
    const copy = {
      desktop: 'Contribute to our mission',
      mobileLineOne: "It's the month of the Quran.",
      mobileLineTwo: 'Help us spread its light.',
    };

    const { container } = render(<Banner variant={BannerVariant.Standalone} copy={copy} />);
    const desktopLine = container.querySelector(`.${styles.desktopLine}`);

    expect(desktopLine).not.toBeNull();
    expect(desktopLine?.textContent?.trim()).toBe(copy.desktop);
    expect(desktopLine?.querySelector(`.${styles.mobileLineUnderlined}`)).toBeNull();
  });
});
