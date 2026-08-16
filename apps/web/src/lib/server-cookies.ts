import { headers } from "next/headers";

/** Forwards the browser's incoming Cookie header so a Server Component's fetch to the API carries the session. */
export async function getServerCookieHeader(): Promise<string | undefined> {
  const headerList = await headers();
  return headerList.get("cookie") ?? undefined;
}
