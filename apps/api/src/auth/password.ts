import { hash, verify } from "@node-rs/argon2";

// Argon2id, OWASP-recommended baseline params (19 MiB memory, 2 iterations,
// 1 degree of parallelism) — see master prompt section 17.
const ARGON2_OPTIONS = { memoryCost: 19_456, timeCost: 2, parallelism: 1 };

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, ARGON2_OPTIONS);
}

export function verifyPassword(passwordHash: string, plain: string): Promise<boolean> {
  return verify(passwordHash, plain);
}
