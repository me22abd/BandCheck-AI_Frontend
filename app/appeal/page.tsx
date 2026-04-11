import {
  buildAppealStartHref,
  normalizeAppealSearchFields,
} from "@/lib/appealStartHref";
import { AppealEmailCaptureClient } from "./AppealEmailCaptureClient";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AppealPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const fields = normalizeAppealSearchFields(raw);
  const appealStartHref = buildAppealStartHref(fields);
  const routeKey = [fields.postcode, fields.band, fields.comparables].join(
    "\u0000",
  );

  return (
    <AppealEmailCaptureClient key={routeKey} appealStartHref={appealStartHref} />
  );
}
