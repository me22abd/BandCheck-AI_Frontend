export type DailyPoint = {
  label: string;
  value: number;
};

export type OutcomeBreakdown = {
  successful: number;
  unsuccessful: number;
  other: number;
  total: number;
};

export type AdminCharts = {
  leadsDaily: DailyPoint[];
  checksDaily: DailyPoint[];
  outcomes: OutcomeBreakdown;
};

type DayRow = { day: string; count: string };

export function buildDailySeries(rows: DayRow[], days = 30): DailyPoint[] {
  const map = new Map(
    rows.map((r) => [String(r.day).slice(0, 10), parseInt(r.count, 10) || 0]),
  );

  const series: DailyPoint[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    series.push({
      label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      value: map.get(key) ?? 0,
    });
  }

  return series;
}

export const EMPTY_CHARTS: AdminCharts = {
  leadsDaily: buildDailySeries([]),
  checksDaily: buildDailySeries([]),
  outcomes: { successful: 0, unsuccessful: 0, other: 0, total: 0 },
};
