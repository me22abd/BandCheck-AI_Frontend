"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Stats = {
  total_checks: string;
  total_leads: string;
  total_outcomes: string;
  total_testimonials: string;
};

type Lead = {
  id: number;
  email: string;
  postcode: string;
  user_band: string;
  referred_by: string | null;
  reminder_sent: boolean;
  created_at: string;
};

type Check = {
  postcode: string;
  district: string;
  user_band: string;
  band_source: string;
  case_strength: string;
  checked_at: string;
};

type Outcome = {
  id: number;
  postcode: string;
  original_band: string;
  outcome: string;
  refund_amount: string | null;
  annual_reduction: string | null;
  recorded_at: string;
};

type Testimonial = {
  id: number;
  postcode: string;
  first_name: string;
  area: string;
  feedback: string;
  refund_amount: string | null;
  approved: boolean;
  created_at: string;
};

type AdminData = {
  stats: Stats;
  recentLeads: Lead[];
  recentChecks: Check[];
  outcomes: Outcome[];
  testimonials: Testimonial[];
};

const TAB_LABELS = ["Overview", "Leads", "Checks", "Outcomes", "Testimonials"] as const;
type Tab = typeof TAB_LABELS[number];

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-editorial border border-hairline bg-paper-card p-5 shadow-editorial-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">{label}</p>
      <p className="mt-2 font-serif text-3xl text-ink">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-3">{sub}</p>}
    </div>
  );
}

function Badge({ children, tone = "ink" }: { children: string; tone?: "ink" | "forest" | "accent" | "gray" }) {
  const cls =
    tone === "forest" ? "bg-forest/10 text-forest" :
    tone === "accent" ? "bg-accent/10 text-accent" :
    tone === "gray" ? "bg-ink/5 text-ink-3" :
    "bg-ink/10 text-ink";
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${cls}`}>
      {children}
    </span>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("Overview");

  useEffect(() => {
    fetch("/api/admin/data")
      .then((r) => {
        if (r.status === 401) { router.push("/admin/login"); return null; }
        return r.json();
      })
      .then((d) => { if (d) setData(d as AdminData); })
      .finally(() => setLoading(false));
  }, [router]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper-gradient">
        <p className="text-sm text-ink-3">Loading…</p>
      </div>
    );
  }

  if (!data) return null;

  const { stats, recentLeads, recentChecks, outcomes, testimonials } = data;

  return (
    <div className="min-h-screen bg-paper-gradient">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-hairline bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <span className="text-base font-bold text-ink">
            BandCheck <span className="text-accent">· AI</span>
            <span className="ml-2 text-xs font-normal text-ink-3">Admin</span>
          </span>
          <button
            onClick={logout}
            className="text-xs font-medium text-ink-3 hover:text-ink transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Tabs */}
        <div className="mb-8 flex gap-1 overflow-x-auto">
          {TAB_LABELS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                tab === t
                  ? "bg-ink text-paper"
                  : "text-ink-2 hover:bg-paper-2/60 hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "Overview" && (
          <div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Total checks" value={Number(stats.total_checks).toLocaleString()} />
              <StatCard label="Leads captured" value={Number(stats.total_leads).toLocaleString()} sub="emails collected" />
              <StatCard label="Outcomes recorded" value={Number(stats.total_outcomes).toLocaleString()} />
              <StatCard label="Testimonials" value={Number(stats.total_testimonials).toLocaleString()} />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {/* Recent leads */}
              <div>
                <h2 className="mb-3 text-sm font-semibold text-ink">Recent leads</h2>
                <div className="overflow-hidden rounded-editorial border border-hairline bg-paper-card shadow-editorial-sm">
                  {recentLeads.slice(0, 8).map((l, i) => (
                    <div key={l.id} className={`flex items-center gap-3 px-4 py-3 text-sm ${i > 0 ? "border-t border-hairline" : ""}`}>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-ink">{l.email}</p>
                        <p className="text-xs text-ink-3">{l.postcode}{l.user_band ? ` · Band ${l.user_band}` : ""}</p>
                      </div>
                      <p className="shrink-0 text-xs text-ink-3">{fmt(l.created_at)}</p>
                    </div>
                  ))}
                  {recentLeads.length === 0 && <p className="px-4 py-6 text-center text-sm text-ink-3">No leads yet</p>}
                </div>
              </div>

              {/* Recent outcomes */}
              <div>
                <h2 className="mb-3 text-sm font-semibold text-ink">Recent outcomes</h2>
                <div className="overflow-hidden rounded-editorial border border-hairline bg-paper-card shadow-editorial-sm">
                  {outcomes.slice(0, 8).map((o, i) => (
                    <div key={o.id} className={`flex items-center gap-3 px-4 py-3 text-sm ${i > 0 ? "border-t border-hairline" : ""}`}>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-ink">{o.postcode} · Band {o.original_band}</p>
                        <p className="text-xs text-ink-3">
                          {o.refund_amount ? `£${Number(o.refund_amount).toLocaleString()} refund` : "No refund recorded"}
                        </p>
                      </div>
                      <Badge tone={o.outcome === "successful" ? "forest" : o.outcome === "unsuccessful" ? "accent" : "gray"}>
                        {o.outcome}
                      </Badge>
                    </div>
                  ))}
                  {outcomes.length === 0 && <p className="px-4 py-6 text-center text-sm text-ink-3">No outcomes yet</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leads */}
        {tab === "Leads" && (
          <div>
            <p className="mb-4 text-sm text-ink-3">{recentLeads.length} most recent leads</p>
            <div className="overflow-x-auto rounded-editorial border border-hairline bg-paper-card shadow-editorial-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hairline text-xs font-semibold uppercase tracking-wide text-ink-3">
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Postcode</th>
                    <th className="px-4 py-3 text-left">Band</th>
                    <th className="px-4 py-3 text-left">Referred by</th>
                    <th className="px-4 py-3 text-left">Reminder</th>
                    <th className="px-4 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((l, i) => (
                    <tr key={l.id} className={`border-b border-hairline last:border-b-0 ${i % 2 === 1 ? "bg-paper-2/20" : ""}`}>
                      <td className="px-4 py-3 font-medium text-ink">{l.email}</td>
                      <td className="px-4 py-3 text-ink-2">{l.postcode}</td>
                      <td className="px-4 py-3">{l.user_band ? <Badge tone="ink">{`Band ${l.user_band}`}</Badge> : "—"}</td>
                      <td className="px-4 py-3 text-ink-3">{l.referred_by ?? "—"}</td>
                      <td className="px-4 py-3">{l.reminder_sent ? <Badge tone="forest">Sent</Badge> : <Badge tone="gray">Pending</Badge>}</td>
                      <td className="px-4 py-3 text-xs text-ink-3">{fmt(l.created_at)}</td>
                    </tr>
                  ))}
                  {recentLeads.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-ink-3">No leads yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Checks */}
        {tab === "Checks" && (
          <div>
            <p className="mb-4 text-sm text-ink-3">{recentChecks.length} most recent postcode checks</p>
            <div className="overflow-x-auto rounded-editorial border border-hairline bg-paper-card shadow-editorial-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hairline text-xs font-semibold uppercase tracking-wide text-ink-3">
                    <th className="px-4 py-3 text-left">Postcode</th>
                    <th className="px-4 py-3 text-left">District</th>
                    <th className="px-4 py-3 text-left">Band</th>
                    <th className="px-4 py-3 text-left">Source</th>
                    <th className="px-4 py-3 text-left">Score</th>
                    <th className="px-4 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentChecks.map((c, i) => (
                    <tr key={`${c.postcode}-${i}`} className={`border-b border-hairline last:border-b-0 ${i % 2 === 1 ? "bg-paper-2/20" : ""}`}>
                      <td className="px-4 py-3 font-medium text-ink">{c.postcode}</td>
                      <td className="px-4 py-3 text-ink-2">{c.district}</td>
                      <td className="px-4 py-3"><Badge tone="ink">{`Band ${c.user_band}`}</Badge></td>
                      <td className="px-4 py-3">
                        <Badge tone={c.band_source === "gov" ? "forest" : c.band_source === "provider" ? "accent" : "gray"}>
                          {c.band_source}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-ink-2">{c.case_strength ? `${Number(c.case_strength).toFixed(0)}/100` : "—"}</td>
                      <td className="px-4 py-3 text-xs text-ink-3">{fmt(c.checked_at)}</td>
                    </tr>
                  ))}
                  {recentChecks.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-ink-3">No checks yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Outcomes */}
        {tab === "Outcomes" && (
          <div>
            <p className="mb-4 text-sm text-ink-3">{outcomes.length} outcomes recorded</p>
            <div className="overflow-x-auto rounded-editorial border border-hairline bg-paper-card shadow-editorial-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hairline text-xs font-semibold uppercase tracking-wide text-ink-3">
                    <th className="px-4 py-3 text-left">Postcode</th>
                    <th className="px-4 py-3 text-left">Band</th>
                    <th className="px-4 py-3 text-left">Outcome</th>
                    <th className="px-4 py-3 text-left">Refund</th>
                    <th className="px-4 py-3 text-left">Annual saving</th>
                    <th className="px-4 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {outcomes.map((o, i) => (
                    <tr key={o.id} className={`border-b border-hairline last:border-b-0 ${i % 2 === 1 ? "bg-paper-2/20" : ""}`}>
                      <td className="px-4 py-3 font-medium text-ink">{o.postcode}</td>
                      <td className="px-4 py-3"><Badge tone="ink">{`Band ${o.original_band}`}</Badge></td>
                      <td className="px-4 py-3">
                        <Badge tone={o.outcome === "successful" ? "forest" : o.outcome === "unsuccessful" ? "accent" : "gray"}>
                          {o.outcome}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold text-forest">
                        {o.refund_amount ? `£${Number(o.refund_amount).toLocaleString()}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-ink-2">
                        {o.annual_reduction ? `£${Number(o.annual_reduction).toLocaleString()}/yr` : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-3">{fmt(o.recorded_at)}</td>
                    </tr>
                  ))}
                  {outcomes.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-ink-3">No outcomes yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Testimonials */}
        {tab === "Testimonials" && (
          <div>
            <p className="mb-4 text-sm text-ink-3">{testimonials.length} testimonials submitted</p>
            <div className="space-y-3">
              {testimonials.map((t) => (
                <div key={t.id} className="rounded-editorial border border-hairline bg-paper-card p-5 shadow-editorial-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-serif italic leading-relaxed text-ink">
                        &ldquo;{t.feedback}&rdquo;
                      </p>
                      <p className="mt-2 text-xs text-ink-3">
                        — {t.first_name}{t.area ? `, ${t.area}` : ""} · {t.postcode}
                        {t.refund_amount ? ` · £${Number(t.refund_amount).toLocaleString()} refund` : ""}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <Badge tone={t.approved ? "forest" : "gray"}>{t.approved ? "Approved" : "Pending"}</Badge>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-ink-3">{fmt(t.created_at)}</p>
                </div>
              ))}
              {testimonials.length === 0 && (
                <p className="rounded-editorial border border-hairline bg-paper-card px-4 py-8 text-center text-sm text-ink-3">
                  No testimonials yet
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
