import type { CheckResponse } from "../lib/api";
import type { SavedCase } from "../lib/casesStore";
import type { AppealRecord } from "../lib/appealTracker";

export type RootStackParamList = {
  // Home flow
  Home: undefined;
  Compare: { checkData: CheckResponse };
  Summary: { checkData: CheckResponse };
  Email: { checkData: CheckResponse };
  Builder: { checkData: CheckResponse; email: string };
  Submit: { checkData: CheckResponse; email: string; likelyBand?: string };
  Tracker: { appealRecord: AppealRecord };
  // Tabs
  MyCases: undefined;
  CaseDetail: { savedCase: SavedCase };
  Appeal: undefined;
  Settings: undefined;
};
