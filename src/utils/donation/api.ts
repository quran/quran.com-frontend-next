import { fetcher } from '@/api';
import { Response } from '@/types/auth/Response';
import DonationOverview from '@/types/DonationOverview';
import { makeDonationOverviewUrl } from '@/utils/auth/apiPaths';

export const RAMADAN_2026_DONATION_CAMPAIGN = 'ramadan2026';
export const RAMADAN_2026_MONTHLY_GOAL = 20_000;

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
