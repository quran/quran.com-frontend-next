import { describe, expect, it, vi } from 'vitest';

import { getDonationOverview, getDonationProgressPercentage } from './api';

import { fetcher } from '@/api';

vi.mock('@/api', () => ({
  fetcher: vi.fn(),
}));

describe('donation api', () => {
  it('maps response.data.totalAmount from the donation overview endpoint', async () => {
    vi.mocked(fetcher).mockResolvedValueOnce({
      data: {
        totalAmount: 12500,
        numberOfRecurringPlans: 17,
      },
    } as any);

    await expect(getDonationOverview('ramadan2026')).resolves.toEqual({
      totalAmount: 12500,
      numberOfRecurringPlans: 17,
    });
  });

  it('returns null when the overview response has no data payload', async () => {
    vi.mocked(fetcher).mockResolvedValueOnce({ data: null } as any);

    await expect(getDonationOverview('ramadan2026')).resolves.toBeNull();
  });

  it('clamps progress to 100 percent', () => {
    expect(getDonationProgressPercentage(25_000, 20_000)).toBe(100);
    expect(getDonationProgressPercentage(10_000, 20_000)).toBe(50);
    expect(getDonationProgressPercentage(10_000, 0)).toBe(0);
  });
});
