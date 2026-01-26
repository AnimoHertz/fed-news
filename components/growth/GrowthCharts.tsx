'use client';

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { GrowthData } from '@/lib/growth';

interface GrowthChartsProps {
  data: GrowthData;
}

const TIER_COLORS = {
  chairman: '#facc15',  // yellow-400
  governor: '#a855f7',  // purple-500
  director: '#3b82f6',  // blue-500
  member: '#10b981',    // emerald-500
  citizen: '#6b7280',   // gray-500
};

function formatShortDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function HolderCountChart({ data }: GrowthChartsProps) {
  const chartData = data.snapshots.map((s) => ({
    ...s,
    label: formatShortDate(s.date),
  }));

  return (
    <div className="h-[250px] sm:h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="label"
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#9ca3af' }}
            formatter={(value) => [Number(value).toLocaleString(), 'Total Holders']}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#10b981' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TierBreakdownChart({ data }: GrowthChartsProps) {
  const chartData = data.snapshots.map((s) => ({
    ...s,
    label: formatShortDate(s.date),
  }));

  return (
    <div className="h-[250px] sm:h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="label"
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#9ca3af' }}
            formatter={(value, name) => {
              const labels: Record<string, string> = {
                chairman: 'Fed Chairman',
                governor: 'Fed Governor',
                director: 'Regional Director',
                member: 'Board Member',
                citizen: 'Fed Citizen',
              };
              return [Number(value).toLocaleString(), labels[String(name)] || String(name)];
            }}
          />
          <Legend
            formatter={(value) => {
              const labels: Record<string, string> = {
                chairman: 'Chairman',
                governor: 'Governor',
                director: 'Director',
                member: 'Member',
                citizen: 'Citizen',
              };
              return labels[value] || value;
            }}
          />
          <Area
            type="monotone"
            dataKey="citizen"
            stackId="1"
            stroke={TIER_COLORS.citizen}
            fill={TIER_COLORS.citizen}
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="member"
            stackId="1"
            stroke={TIER_COLORS.member}
            fill={TIER_COLORS.member}
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="director"
            stackId="1"
            stroke={TIER_COLORS.director}
            fill={TIER_COLORS.director}
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="governor"
            stackId="1"
            stroke={TIER_COLORS.governor}
            fill={TIER_COLORS.governor}
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="chairman"
            stackId="1"
            stroke={TIER_COLORS.chairman}
            fill={TIER_COLORS.chairman}
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function NewHoldersChart({ data }: GrowthChartsProps) {
  return (
    <div className="h-[250px] sm:h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data.dailyNewHolders} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="label"
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#9ca3af' }}
            formatter={(value) => [Number(value).toLocaleString(), 'New Holders']}
          />
          <Bar dataKey="newHolders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WeeklyNewHoldersChart({ data }: GrowthChartsProps) {
  return (
    <div className="h-[220px] sm:h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data.weeklyNewHolders} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="week"
            stroke="#9ca3af"
            fontSize={11}
            tickLine={false}
            angle={-15}
            textAnchor="end"
            height={50}
          />
          <YAxis
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#9ca3af' }}
            formatter={(value, name) => {
              const n = String(name);
              if (n === 'newHolders') return [Number(value).toLocaleString(), 'New Holders'];
              if (n === 'avgDaily') return [Number(value).toLocaleString(), 'Avg Daily'];
              return [String(value), n];
            }}
          />
          <Bar dataKey="newHolders" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="newHolders" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
