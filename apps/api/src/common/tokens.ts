import { randomBytes, randomUUID } from "node:crypto";

const ORDER_NUMBER_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I — avoids support-call ambiguity

/** Public-facing order identifier — random, not sequential, so order volume can't be inferred. */
export function generateOrderNumber(): string {
  const bytes = randomBytes(10);
  let code = "";
  for (const byte of bytes) {
    code += ORDER_NUMBER_ALPHABET[byte % ORDER_NUMBER_ALPHABET.length];
  }
  return `ORD-${code}`;
}

/** Opaque bearer token for guest order tracking — knowledge of it is the access control. */
export function generateTrackingToken(): string {
  return randomUUID().replace(/-/g, "");
}
