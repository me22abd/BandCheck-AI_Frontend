import * as FileSystem from "expo-file-system/legacy";

const FILE_PATH = `${FileSystem.documentDirectory}bandcheck_appeal_v1.json`;

export type AppealStatus =
  | "submitted"
  | "acknowledged"
  | "under_review"
  | "decision_received"
  | "won"
  | "lost";

export type AppealRecord = {
  postcode: string;
  userBand: string;
  likelyBand?: string;
  annualSaving?: number;
  email: string;
  status: AppealStatus;
  submittedAt: string; // ISO date string
  updatedAt: string;
};

export const STATUS_STEPS: AppealStatus[] = [
  "submitted",
  "acknowledged",
  "under_review",
  "decision_received",
  "won",
];

export const STATUS_LABELS: Record<AppealStatus, string> = {
  submitted: "Challenge submitted",
  acknowledged: "VOA acknowledged",
  under_review: "Under review",
  decision_received: "Decision received",
  won: "Band reduced — you won!",
  lost: "Upheld — band unchanged",
};

export const STATUS_SUB: Record<AppealStatus, string> = {
  submitted: "Your challenge has been sent to the Valuation Office Agency.",
  acknowledged: "The VOA has confirmed they received your challenge (usually within 2 weeks).",
  under_review: "The VOA is reviewing your case. This can take up to 2 months.",
  decision_received: "You've received a response from the VOA.",
  won: "Your council tax band has been officially reduced. Expect a refund from your council.",
  lost: "The VOA has upheld the current band. You can appeal further to a Valuation Tribunal.",
};

export async function saveAppealRecord(record: AppealRecord): Promise<void> {
  await FileSystem.writeAsStringAsync(FILE_PATH, JSON.stringify(record), {
    encoding: FileSystem.EncodingType.UTF8,
  });
}

export async function loadAppealRecord(): Promise<AppealRecord | null> {
  try {
    const info = await FileSystem.getInfoAsync(FILE_PATH);
    if (!info.exists) return null;
    const raw = await FileSystem.readAsStringAsync(FILE_PATH, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    return JSON.parse(raw) as AppealRecord;
  } catch {
    return null;
  }
}

export async function updateAppealStatus(status: AppealStatus): Promise<void> {
  const record = await loadAppealRecord();
  if (!record) return;
  record.status = status;
  record.updatedAt = new Date().toISOString();
  await saveAppealRecord(record);
}

export async function clearAppealRecord(): Promise<void> {
  try {
    await FileSystem.deleteAsync(FILE_PATH, { idempotent: true });
  } catch {
    // ignore if file doesn't exist
  }
}

export function nextStatus(current: AppealStatus): AppealStatus | null {
  if (current === "won" || current === "lost") return null;
  const idx = STATUS_STEPS.indexOf(current);
  if (idx === -1 || idx >= STATUS_STEPS.length - 1) return null;
  return STATUS_STEPS[idx + 1];
}

export function statusIndex(status: AppealStatus): number {
  const idx = STATUS_STEPS.indexOf(status);
  return idx === -1 ? 0 : idx;
}
