/* eslint-disable react-func/max-lines-per-function */
import { describe, expect, it, vi } from 'vitest';

import {
  getDonationOverview,
  getDonationProgressPercentage,
  getDonationProgressState,
} from './api';

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

  it('keeps the Ramadan goal as a milestone while using the extended annual track', () => {
    const progressState = getDonationProgressState(12_500, 20_000, 30_000);

    expect(progressState.displayGoalAmount).toBe(30_000);
    expect(progressState.filledToMilestonePercentage).toBeCloseTo(41.666666666666664);
    expect(progressState.milestonePercentage).toBeCloseTo(66.66666666666666);
    expect(progressState.overflowProgressPercentage).toBe(0);
    expect(progressState.isExtended).toBe(true);
    expect(progressState.hasReachedMilestone).toBe(false);
  });

  it('switches to the extended goal state after the Ramadan goal is reached', () => {
    const progressState = getDonationProgressState(20_252, 20_000, 30_000);

    expect(progressState.displayGoalAmount).toBe(30_000);
    expect(progressState.filledToMilestonePercentage).toBeCloseTo(66.66666666666666);
    expect(progressState.milestonePercentage).toBeCloseTo(66.66666666666666);
    expect(progressState.overflowProgressPercentage).toBeCloseTo(0.84);
    expect(progressState.isExtended).toBe(true);
    expect(progressState.hasReachedMilestone).toBe(true);
  });
});
