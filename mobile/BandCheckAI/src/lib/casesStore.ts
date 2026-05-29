import { storageGet, storageSet } from "./storage";
import type { CheckResponse } from "./api";

export type CaseStatus =
  | "in_progress"
  | "pack_requested"
  | "appeal_submitted"
  | "under_review"
  | "successful"
  | "unsuccessful"
  | "won"
  | "lost";

export type SavedCase = {
  id: string;
  postcode: string;
  district: string;
  userBand: string;
  nearbyProperties: CheckResponse["nearbyProperties"];
  isEstimated?: boolean;
  email?: string;
  likelyBand?: string;
  annualSaving?: number;
  // Outcome fields
  outcomeRefund?: number;
  outcomeAnnualReduction?: number;
  outcomeRecordedAt?: string;
  status: CaseStatus;
  createdAt: string;
  updatedAt: string;
};

const CASES_KEY = "cases_v1";

export const STATUS_LABELS: Record<CaseStatus, string> = {
  in_progress: "In progress",
  pack_requested: "Pack requested",
  appeal_submitted: "Submitted",
  under_review: "Under review",
  successful: "Successful",
  unsuccessful: "Unsuccessful",
  won: "Won",
  lost: "Lost",
};

export const STATUS_COLORS: Record<CaseStatus, string> = {
  in_progress: "#C8431C",
  pack_requested: "#C8431C",
  appeal_submitted: "#0F5C3E",
  under_review: "#2563EB",
  successful: "#0F5C3E",
  unsuccessful: "#8A8472",
  won: "#0F5C3E",
  lost: "#8A8472",
};

export function isActiveAppeal(status: CaseStatus): boolean {
  return ["appeal_submitted", "under_review"].includes(status);
}

export function isFinalOutcome(status: CaseStatus): boolean {
  return ["successful", "unsuccessful", "won", "lost"].includes(status);
}

async function loadAll(): Promise<SavedCase[]> {
  return (await storageGet<SavedCase[]>(CASES_KEY)) ?? [];
}

async function saveAll(cases: SavedCase[]): Promise<void> {
  await storageSet(CASES_KEY, cases);
}

export async function listCases(): Promise<SavedCase[]> {
  const cases = await loadAll();
  return cases.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function upsertCase(caseData: SavedCase): Promise<void> {
  const cases = await loadAll();
  const idx = cases.findIndex((c) => c.id === caseData.id);
  if (idx >= 0) {
    cases[idx] = caseData;
  } else {
    cases.unshift(caseData);
  }
  await saveAll(cases);
}

export async function updateCaseStatus(
  id: string,
  status: CaseStatus,
  extra?: Partial<SavedCase>,
): Promise<void> {
  const cases = await loadAll();
  const idx = cases.findIndex((c) => c.id === id);
  if (idx < 0) return;
  cases[idx] = {
    ...cases[idx],
    ...extra,
    status,
    updatedAt: new Date().toISOString(),
  };
  await saveAll(cases);
}

export async function deleteCase(id: string): Promise<void> {
  const cases = await loadAll();
  await saveAll(cases.filter((c) => c.id !== id));
}

export function caseIdFromPostcode(postcode: string): string {
  return `case_${postcode.replace(/\s+/g, "").toUpperCase()}_${Date.now()}`;
}

export async function getLatestInProgressCase(): Promise<SavedCase | null> {
  const cases = await loadAll();
  return (
    cases.find((c) => c.status === "in_progress") ?? null
  );
}
