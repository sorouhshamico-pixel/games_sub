import { Worker } from "bullmq";
import type IORedis from "ioredis";
import type { FulfillmentProvider } from "../providers/fulfillment-provider.interface";
import { CircuitBreaker } from "../common/circuit-breaker";
import { FULFILLMENT_QUEUE_NAME, type FulfillmentJobData } from "../queue/fulfillment-queue";
import { processFulfillmentJob } from "./process-fulfillment-job";

export function createFulfillmentWorker(connection: IORedis, provider: FulfillmentProvider): Worker<FulfillmentJobData> {
  const breaker = new CircuitBreaker({ failureThreshold: 5, openDurationMs: 30_000 });

  return new Worker<FulfillmentJobData>(
    FULFILLMENT_QUEUE_NAME,
    async (job) => {
      await processFulfillmentJob(job.data.orderId, job.data.correlationId, { provider, breaker });
    },
    {
      connection,
      concurrency: 5,
      // A failed job here already exhausted processFulfillmentJob's own
      // retryWithBackoff and landed items in MANUAL_REVIEW/FAILED — BullMQ
      // attempts stay at 1 (set when enqueued) so this never masks that by
      // silently retrying the whole job days later.
    },
  );
}
