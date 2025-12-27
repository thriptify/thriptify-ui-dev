import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppAuth } from '@/contexts/auth-context';

// API base URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// ============================================================================
// LOYALTY TYPES
// ============================================================================

interface LoyaltyTier {
  id: string;
  name: string;
  slug: string;
  minPoints: number;
  maxPoints: number | null;
  multiplier: number;
  color: string | null;
  icon: string | null;
  benefits: string[];
  isActive: boolean;
}

interface LoyaltyBadge {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  category: string;
  requirement: string | null;
  rewardType: string | null;
  rewardValue: number | null;
  isActive: boolean;
}

interface CustomerBadge {
  id: string;
  badgeId: string;
  earnedAt: string;
  rewardClaimed: boolean;
  rewardClaimedAt: string | null;
  badge: LoyaltyBadge;
}

interface Challenge {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  challengeType: string;
  targetValue: number;
  rewardType: string;
  rewardValue: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

interface CustomerChallenge {
  id: string;
  challengeId: string;
  currentProgress: number;
  isCompleted: boolean;
  completedAt: string | null;
  rewardClaimed: boolean;
  rewardClaimedAt: string | null;
  challenge: Challenge;
}

interface LoyaltyTransaction {
  id: string;
  userId: string;
  points: number;
  type: string;
  description: string | null;
  sourceType: string | null;
  sourceId: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface LoyaltyDashboard {
  points: {
    current: number;
    lifetime: number;
    redemptionRate: number;
    creditValue: number;
  };
  tier: {
    current: LoyaltyTier | null;
    allTiers: LoyaltyTier[];
    nextTierPoints: number | null;
  };
  storeCredit: number;
  stats: {
    totalOrders: number;
    totalSpent: number;
    recipesCompleted: number;
    referralsCompleted: number;
  };
  referralCode: string | null;
  signupBonusClaimed: boolean;
  badges: {
    earned: CustomerBadge[];
    unclaimed: number;
  };
  challenges: {
    active: Challenge[];
    progress: CustomerChallenge[];
    unclaimedRewards: number;
  };
  recentTransactions: LoyaltyTransaction[];
  dailyReward: {
    canSpin: boolean;
  };
}

interface DailyRewardResult {
  type: string;
  value: number;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

// ============================================================================
// GENERIC FETCH HELPER
// ============================================================================

async function apiFetchWithAuth<T>(
  endpoint: string,
  token: string | null,
  options?: RequestInit
): Promise<T> {
  if (!token) {
    throw new Error('Authentication required');
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    let message = `API Error: ${response.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      message = errorJson.error?.message || errorJson.message || message;
    } catch {
      // Keep the default message if parsing fails
    }
    throw new Error(message);
  }

  const data = await response.json();
  return data;
}

// ============================================================================
// LOYALTY DASHBOARD HOOK
// ============================================================================

/**
 * Fetch loyalty dashboard for current user
 */
export function useLoyaltyDashboard(): ApiResponse<LoyaltyDashboard> & { refetch: () => void } {
  const { getToken, isAuthenticated } = useAppAuth();
  const [data, setData] = useState<LoyaltyDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) {
      setData(null);
      setIsLoading(false);
      setError('Authentication required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await getTokenRef.current();
      const response = await apiFetchWithAuth<{ success: boolean; data: LoyaltyDashboard }>(
        '/api/v1/loyalty',
        token
      );
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch loyalty dashboard');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch: fetchData };
}

// ============================================================================
// DAILY REWARD HOOKS
// ============================================================================

/**
 * Check if user can spin today
 */
export function useDailyRewardStatus(): ApiResponse<{ canSpin: boolean; message: string }> & { refetch: () => void } {
  const { getToken, isAuthenticated } = useAppAuth();
  const [data, setData] = useState<{ canSpin: boolean; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await getTokenRef.current();
      const response = await apiFetchWithAuth<{ success: boolean; data: { canSpin: boolean; message: string } }>(
        '/api/v1/loyalty/daily-reward',
        token
      );
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check daily reward status');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch: fetchData };
}

/**
 * Spin the daily reward wheel
 */
export async function spinWheel(token: string): Promise<{ success: boolean; result: DailyRewardResult | null; message: string }> {
  const response = await apiFetchWithAuth<{ success: boolean; data: { result: DailyRewardResult; message: string } }>(
    '/api/v1/loyalty/daily-reward/spin',
    token,
    { method: 'POST' }
  );
  return {
    success: response.success,
    result: response.data.result,
    message: response.data.message,
  };
}

// ============================================================================
// POINTS HOOKS
// ============================================================================

/**
 * Redeem points for store credit
 */
export async function redeemPoints(
  token: string,
  points: number
): Promise<{ success: boolean; creditAmount: number; message: string }> {
  const response = await apiFetchWithAuth<{
    success: boolean;
    data: { creditAmount: number; message: string };
  }>(
    '/api/v1/loyalty/points/redeem',
    token,
    {
      method: 'POST',
      body: JSON.stringify({ points }),
    }
  );
  return {
    success: response.success,
    creditAmount: response.data.creditAmount,
    message: response.data.message,
  };
}

// ============================================================================
// REFERRAL HOOKS
// ============================================================================

/**
 * Apply a referral code
 */
export async function applyReferralCode(
  token: string,
  code: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiFetchWithAuth<{ success: boolean; data: { message: string } }>(
      '/api/v1/loyalty/referral/apply',
      token,
      {
        method: 'POST',
        body: JSON.stringify({ code: code.toUpperCase() }),
      }
    );
    return {
      success: response.success,
      message: response.data.message,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Failed to apply referral code',
    };
  }
}

// ============================================================================
// SIGNUP BONUS HOOKS
// ============================================================================

/**
 * Claim signup bonus (generates referral code if not exists)
 */
export async function claimSignupBonus(
  token: string
): Promise<{ success: boolean; amount: number; message: string }> {
  try {
    const response = await apiFetchWithAuth<{
      success: boolean;
      data: { amount: number; message: string };
    }>(
      '/api/v1/loyalty/signup-bonus',
      token,
      { method: 'POST' }
    );
    return {
      success: response.success,
      amount: response.data.amount,
      message: response.data.message,
    };
  } catch (err) {
    return {
      success: false,
      amount: 0,
      message: err instanceof Error ? err.message : 'Failed to claim signup bonus',
    };
  }
}

// ============================================================================
// BADGES HOOKS
// ============================================================================

/**
 * Claim a badge reward
 */
export async function claimBadgeReward(
  token: string,
  badgeId: string
): Promise<{ success: boolean; reward: { type: string; value: number } | null; message: string }> {
  try {
    const response = await apiFetchWithAuth<{
      success: boolean;
      data: { reward: { type: string; value: number } | null; message: string };
    }>(
      '/api/v1/loyalty/badges/claim',
      token,
      {
        method: 'POST',
        body: JSON.stringify({ badgeId }),
      }
    );
    return {
      success: response.success,
      reward: response.data.reward,
      message: response.data.message,
    };
  } catch (err) {
    return {
      success: false,
      reward: null,
      message: err instanceof Error ? err.message : 'Failed to claim badge reward',
    };
  }
}

// ============================================================================
// CHALLENGES HOOKS
// ============================================================================

/**
 * Join a challenge
 */
export async function joinChallenge(
  token: string,
  challengeId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiFetchWithAuth<{ success: boolean; data: { message: string } }>(
      '/api/v1/loyalty/challenges/join',
      token,
      {
        method: 'POST',
        body: JSON.stringify({ challengeId }),
      }
    );
    return {
      success: response.success,
      message: response.data.message,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Failed to join challenge',
    };
  }
}

/**
 * Claim a challenge reward
 */
export async function claimChallengeReward(
  token: string,
  challengeId: string
): Promise<{ success: boolean; reward: { type: string; value: number } | null; message: string }> {
  try {
    const response = await apiFetchWithAuth<{
      success: boolean;
      data: { reward: { type: string; value: number } | null; message: string };
    }>(
      '/api/v1/loyalty/challenges/claim',
      token,
      {
        method: 'POST',
        body: JSON.stringify({ challengeId }),
      }
    );
    return {
      success: response.success,
      reward: response.data.reward,
      message: response.data.message,
    };
  } catch (err) {
    return {
      success: false,
      reward: null,
      message: err instanceof Error ? err.message : 'Failed to claim challenge reward',
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  LoyaltyTier,
  LoyaltyBadge,
  CustomerBadge,
  Challenge,
  CustomerChallenge,
  LoyaltyTransaction,
  DailyRewardResult,
};
