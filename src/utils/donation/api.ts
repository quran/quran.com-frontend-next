/* eslint-disable react-func/max-lines-per-function */
import { fetcher } from '@/api';
import { Response } from '@/types/auth/Response';
import DonationOverview from '@/types/DonationOverview';
import { makeDonationOverviewUrl } from '@/utils/auth/apiPaths';

export const RAMADAN_2026_DONATION_CAMPAIGN = 'ramadan2026';
export const RAMADAN_2026_MONTHLY_GOAL = 20_000;
export const RAMADAN_2026_EXTENDED_GOAL = 30_000;

type DonationProgressState = {
  displayGoalAmount: number;
  filledToMilestonePercentage: number;
  milestonePercentage: number | null;
  overflowProgressPercentage: number;
  isExtended: boolean;
  hasReachedMilestone: boolean;
};

export const getDonationOverview = async (
  campaign: string = RAMADAN_2026_DONATION_CAMPAIGN,
): Promise<DonationOverview | null> => {
  const response = await fetcher<Response<DonationOverview>>(makeDonationOverviewUrl(campaign));

  return response.data ?? null;
};

export const getDonationProgressPercentage = (totalAmount: number, goalAmount: number): number => {
  if (goalAmount <= 0) return 0;

  return Math.min((totalAmount / goalAmount) * 100, 100);
};

export const getDonationProgressState = (
  totalAmount: number,
  monthlyGoalAmount: number = RAMADAN_2026_MONTHLY_GOAL,
  extendedGoalAmount: number = RAMADAN_2026_EXTENDED_GOAL,
): DonationProgressState => {
  if (monthlyGoalAmount <= 0) {
    return {
      displayGoalAmount: monthlyGoalAmount,
      filledToMilestonePercentage: 0,
      milestonePercentage: null,
      overflowProgressPercentage: 0,
      isExtended: false,
      hasReachedMilestone: false,
    };
  }

  if (extendedGoalAmount <= monthlyGoalAmount) {
    return {
      displayGoalAmount: monthlyGoalAmount,
      filledToMilestonePercentage: getDonationProgressPercentage(totalAmount, monthlyGoalAmount),
      milestonePercentage: null,
      overflowProgressPercentage: 0,
      isExtended: false,
      hasReachedMilestone: totalAmount >= monthlyGoalAmount,
    };
  }

  const milestonePercentage = (monthlyGoalAmount / extendedGoalAmount) * 100;
  const clampedTotalAmount = Math.min(totalAmount, extendedGoalAmount);
  const filledToMilestoneAmount = Math.min(clampedTotalAmount, monthlyGoalAmount);
  const overflowAmount = Math.max(clampedTotalAmount - monthlyGoalAmount, 0);

  return {
    displayGoalAmount: extendedGoalAmount,
    filledToMilestonePercentage: (filledToMilestoneAmount / extendedGoalAmount) * 100,
    milestonePercentage,
    overflowProgressPercentage: (overflowAmount / extendedGoalAmount) * 100,
    isExtended: true,
    hasReachedMilestone: totalAmount >= monthlyGoalAmount,
  };
};
