import { Queue } from "bullmq";
import type IORedis from "ioredis";

export const FULFILLMENT_QUEUE_NAME = "fulfillment";

export interface FulfillmentJobData {
  orderId: string;
  correlationId: string;
}

export function createFulfillmentQueue(connection: IORedis): Queue<FulfillmentJobData> {
  return new Queue<FulfillmentJobData>(FULFILLMENT_QUEUE_NAME, { connection });
}
