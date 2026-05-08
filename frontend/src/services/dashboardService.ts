import axios from '@/lib/axios';

export type DashboardStatTone =
  | 'emerald'
  | 'amber'
  | 'blue'
  | 'purple'
  | 'rose'
  | 'sky'
  | 'slate';

export type DashboardAnalyticsStat = {
  label: string;
  value: number;
  tone: DashboardStatTone;
};

export type DashboardAnalyticsHighlight = {
  label: string;
  value: number;
  caption: string;
};

export type DashboardAnalyticsChartPoint = {
  label: string;
  value: number;
};

export type DashboardAnalytics = {
  headline: {
    eyebrow: string;
    title: string;
    description: string;
  };
  stats: DashboardAnalyticsStat[];
  highlights: DashboardAnalyticsHighlight[];
  chart: {
    title: string;
    series_label: string;
    series: DashboardAnalyticsChartPoint[];
  };
};

export const getDashboardAnalytics = async () => {
  const response = await axios.get('/dashboard/analytics');
  return response.data as DashboardAnalytics;
};
