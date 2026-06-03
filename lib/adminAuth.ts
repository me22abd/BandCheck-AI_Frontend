import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export function getAdminSecret(): string | undefined {
  return process.env.ADMIN_SECRET?.trim();
}

export function isValidAdminToken(token: string | undefined | null): boolean {
  const secret = getAdminSecret();
  return Boolean(secret && token && token === secret);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidAdminToken(cookieStore.get("admin_token")?.value);
}

export function isAdminRequest(request: NextRequest): boolean {
  return isValidAdminToken(request.cookies.get("admin_token")?.value);
}
