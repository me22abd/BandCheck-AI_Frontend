import type { CheckResponse } from "../lib/api";
import type { CaseStatus, SavedCase } from "../lib/casesStore";
import type { AppealRecord } from "../lib/appealTracker";

export type RootStackParamList = {
  // Home flow
  Home: undefined;
  Compare: { checkData: CheckResponse };
  Summary: { checkData: CheckResponse };
  PackPreview: { checkData: CheckResponse };
  Email: { checkData: CheckResponse };
  Builder: { checkData: CheckResponse; email: string };
  Submit: { checkData: CheckResponse; email: string; likelyBand?: string };
  Tracker: { appealRecord: AppealRecord };
  // Tabs
  MyCases: undefined;
  CaseDetail: { savedCase: SavedCase };
  Appeal: undefined;
  Settings: undefined;
  // Outcome flow
  OutcomeRecord: { savedCase: SavedCase };
  OutcomeSuccess: { postcode: string; refundAmount?: number; annualReduction?: number };
  Testimonial: { postcode: string; refundAmount?: number };
};
