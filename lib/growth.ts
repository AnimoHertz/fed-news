import { fetchTierDistribution, type TierDistribution } from './github';

export interface GrowthSnapshot {
  date: string;
  total: number;
  chairman: number;
  governor: number;
  director: number;
  member: number;
  citizen: number;
}

export interface DailyNewHolders {
  date: string;
  newHolders: number;
  label: string;
}

export interface WeeklyNewHolders {
  week: string;
  newHolders: number;
  avgDaily: number;
}

// Generate sample historical data for demonstration
// In production, this would come from a database with daily snapshots
function generateSampleHistory(currentDistribution: TierDistribution): GrowthSnapshot[] {
  const snapshots: GrowthSnapshot[] = [];
  const today = new Date();

  // Generate 30 days of history working backwards
  // Assume ~2-5% daily growth with some variance
  let total = currentDistribution.total;
  let chairman = currentDistribution.chairman;
  let governor = currentDistribution.governor;
  let director = currentDistribution.director;
  let member = currentDistribution.member;
  let citizen = currentDistribution.citizen;

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    snapshots.unshift({
      date: date.toISOString().split('T')[0],
      total,
      chairman,
      governor,
      director,
      member,
      citizen,
    });

    // Work backwards - reduce by random amount
    if (i < 29) {
      const growthRate = 0.02 + Math.random() * 0.03; // 2-5% daily
      const dailyChange = Math.floor(total * growthRate);

      total = Math.max(100, total - dailyChange);

      // Distribute losses across tiers (mostly citizens)
      const chairmanLoss = Math.random() < 0.1 ? 1 : 0;
      const governorLoss = Math.random() < 0.15 ? 1 : 0;
      const directorLoss = Math.random() < 0.2 ? Math.floor(Math.random() * 2) : 0;
      const memberLoss = Math.floor(dailyChange * 0.15);
      const citizenLoss = dailyChange - chairmanLoss - governorLoss - directorLoss - memberLoss;

      chairman = Math.max(1, chairman - chairmanLoss);
      governor = Math.max(2, governor - governorLoss);
      director = Math.max(5, director - directorLoss);
      member = Math.max(10, member - memberLoss);
      citizen = Math.max(50, citizen - citizenLoss);
    }
  }

  return snapshots;
}

function calculateDailyNewHolders(snapshots: GrowthSnapshot[]): DailyNewHolders[] {
  const daily: DailyNewHolders[] = [];

  for (let i = 1; i < snapshots.length; i++) {
    const prev = snapshots[i - 1];
    const curr = snapshots[i];
    const newHolders = curr.total - prev.total;

    const date = new Date(curr.date);
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    daily.push({
      date: curr.date,
      newHolders: Math.max(0, newHolders),
      label,
    });
  }

  return daily;
}

function calculateWeeklyNewHolders(snapshots: GrowthSnapshot[]): WeeklyNewHolders[] {
  const weekly: WeeklyNewHolders[] = [];

  // Group into weeks (7 days each)
  for (let i = 0; i < snapshots.length - 7; i += 7) {
    const weekStart = snapshots[i];
    const weekEnd = snapshots[Math.min(i + 6, snapshots.length - 1)];
    const newHolders = weekEnd.total - weekStart.total;

    const startDate = new Date(weekStart.date);
    const endDate = new Date(weekEnd.date);
    const weekLabel = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

    weekly.push({
      week: weekLabel,
      newHolders: Math.max(0, newHolders),
      avgDaily: Math.round(Math.max(0, newHolders) / 7),
    });
  }

  return weekly;
}

export interface TierPayouts {
  tier: string;
  name: string;
  totalPaid: number;
  holderCount: number;
  avgPerHolder: number;
  color: string;
}

export interface GrowthData {
  snapshots: GrowthSnapshot[];
  dailyNewHolders: DailyNewHolders[];
  weeklyNewHolders: WeeklyNewHolders[];
  currentDistribution: TierDistribution;
  totalGrowth: number;
  growthPercent: number;
  tierPayouts: TierPayouts[];
  totalDistributed: number;
}

// Tier multipliers from the roles page
const TIER_MULTIPLIERS = {
  chairman: 1.5,
  governor: 1.25,
  director: 1.1,
  member: 1.05,
  citizen: 1.0,
};

// Average holdings per tier (used to weight distributions)
const AVG_HOLDINGS_WEIGHT = {
  chairman: 75_000_000,  // ~75M avg for 50M+ tier
  governor: 25_000_000,  // ~25M avg for 10-50M tier
  director: 3_000_000,   // ~3M avg for 1-10M tier
  member: 300_000,       // ~300k avg for 100k-1M tier
  citizen: 25_000,       // ~25k avg for <100k tier
};

function calculateTierPayouts(
  distribution: TierDistribution,
  totalDistributed: number
): TierPayouts[] {
  // Calculate weighted shares for each tier
  const tiers = [
    { key: 'chairman', name: 'Fed Chairman', color: 'yellow' },
    { key: 'governor', name: 'Fed Governor', color: 'purple' },
    { key: 'director', name: 'Regional Director', color: 'blue' },
    { key: 'member', name: 'Board Member', color: 'emerald' },
    { key: 'citizen', name: 'Fed Citizen', color: 'gray' },
  ];

  // Calculate total weighted supply
  let totalWeightedSupply = 0;
  for (const tier of tiers) {
    const count = distribution[tier.key as keyof TierDistribution] as number;
    const avgHoldings = AVG_HOLDINGS_WEIGHT[tier.key as keyof typeof AVG_HOLDINGS_WEIGHT];
    const multiplier = TIER_MULTIPLIERS[tier.key as keyof typeof TIER_MULTIPLIERS];
    totalWeightedSupply += count * avgHoldings * multiplier;
  }

  // Calculate payouts per tier
  return tiers.map((tier) => {
    const count = distribution[tier.key as keyof TierDistribution] as number;
    const avgHoldings = AVG_HOLDINGS_WEIGHT[tier.key as keyof typeof AVG_HOLDINGS_WEIGHT];
    const multiplier = TIER_MULTIPLIERS[tier.key as keyof typeof TIER_MULTIPLIERS];

    const tierWeightedSupply = count * avgHoldings * multiplier;
    const tierShare = totalWeightedSupply > 0 ? tierWeightedSupply / totalWeightedSupply : 0;
    const totalPaid = totalDistributed * tierShare;
    const avgPerHolder = count > 0 ? totalPaid / count : 0;

    return {
      tier: tier.key,
      name: tier.name,
      totalPaid: Math.round(totalPaid),
      holderCount: count,
      avgPerHolder: Math.round(avgPerHolder),
      color: tier.color,
    };
  });
}

export async function fetchGrowthData(): Promise<GrowthData | null> {
  const distribution = await fetchTierDistribution();

  if (!distribution) {
    return null;
  }

  const snapshots = generateSampleHistory(distribution);
  const dailyNewHolders = calculateDailyNewHolders(snapshots);
  const weeklyNewHolders = calculateWeeklyNewHolders(snapshots);

  const firstSnapshot = snapshots[0];
  const lastSnapshot = snapshots[snapshots.length - 1];
  const totalGrowth = lastSnapshot.total - firstSnapshot.total;
  const growthPercent = firstSnapshot.total > 0
    ? ((totalGrowth / firstSnapshot.total) * 100)
    : 0;

  // Sample total distributed (would come from real data in production)
  // This represents total USD1 distributed to date
  const totalDistributed = 60000; // ~$60k example
  const tierPayouts = calculateTierPayouts(distribution, totalDistributed);

  return {
    snapshots,
    dailyNewHolders,
    weeklyNewHolders,
    currentDistribution: distribution,
    totalGrowth,
    growthPercent,
    tierPayouts,
    totalDistributed,
  };
}
