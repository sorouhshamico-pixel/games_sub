import IORedis from "ioredis";

// BullMQ requires this exact option on any connection it manages.
export function createRedisConnection(): IORedis {
  const url = process.env["REDIS_URL"] ?? "redis://localhost:6379";
  return new IORedis(url, { maxRetriesPerRequest: null });
}
