import type { AdminCharts, DailyPoint, OutcomeBreakdown } from "@/lib/adminCharts";

function BarChart({
  title,
  subtitle,
  data,
  barClass,
}: {
  title: string;
  subtitle?: string;
  data: DailyPoint[];
  barClass: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="rounded-editorial border border-hairline bg-paper-card p-5 shadow-editorial-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-xs text-ink-3">{subtitle}</p>
          ) : null}
        </div>
        <p className="shrink-0 font-serif text-2xl text-ink">{total}</p>
      </div>

      <div className="mt-4 flex h-28 items-end gap-px sm:gap-0.5">
        {data.map((d) => (
          <div
            key={d.label}
            className="group relative flex h-full flex-1 flex-col justify-end"
          >
            <div
              className={`w-full rounded-t-sm ${barClass} transition-all`}
              style={{
                height: `${Math.max((d.value / max) * 100, d.value > 0 ? 6 : 0)}%`,
              }}
              title={`${d.label}: ${d.value}`}
            />
          </div>
        ))}
      </div>

      <div className="mt-2 flex justify-between text-[10px] text-ink-3">
        <span>{data[0]?.label}</span>
        <span>Last 30 days</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

function OutcomeChart({ outcomes }: { outcomes: OutcomeBreakdown }) {
  const { successful, unsuccessful, other, total } = outcomes;
  const successPct = total > 0 ? Math.round((successful / total) * 100) : 0;

  if (total === 0) {
    return (
      <div className="rounded-editorial border border-hairline bg-paper-card p-5 shadow-editorial-sm">
        <h3 className="text-sm font-semibold text-ink">Appeal success rate</h3>
        <p className="mt-6 text-center text-sm text-ink-3">
          No outcomes recorded yet
        </p>
      </div>
    );
  }

  const segments = [
    { label: "Successful", value: successful, className: "bg-forest" },
    { label: "Unsuccessful", value: unsuccessful, className: "bg-accent" },
    { label: "Other", value: other, className: "bg-ink/20" },
  ].filter((s) => s.value > 0);

  return (
    <div className="rounded-editorial border border-hairline bg-paper-card p-5 shadow-editorial-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-ink">Appeal success rate</h3>
          <p className="mt-1 text-xs text-ink-3">
            Based on {total} recorded outcome{total === 1 ? "" : "s"}
          </p>
        </div>
        <p className="shrink-0 font-serif text-2xl text-forest">{successPct}%</p>
      </div>

      <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-ink/5">
        {segments.map((s) => (
          <div
            key={s.label}
            className={`${s.className} transition-all`}
            style={{ width: `${(s.value / total) * 100}%` }}
            title={`${s.label}: ${s.value}`}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-xs text-ink-2">
            <span className={`h-2 w-2 rounded-full ${s.className}`} />
            {s.label}
            <span className="font-semibold text-ink">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminChartsPanel({ charts }: { charts: AdminCharts }) {
  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-3">
      <BarChart
        title="Leads captured"
        subtitle="Email signups per day"
        data={charts.leadsDaily}
        barClass="bg-accent"
      />
      <BarChart
        title="Postcode checks"
        subtitle="Band checks per day"
        data={charts.checksDaily}
        barClass="bg-ink/70"
      />
      <OutcomeChart outcomes={charts.outcomes} />
    </div>
  );
}
