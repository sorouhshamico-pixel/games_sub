import path from "node:path";
import http from "node:http";
import { config as loadEnv } from "dotenv";

// Same reasoning as apps/api/src/main.ts: @gcc-store/db instantiates
// PrismaClient as a module-load side effect, so .env must be loaded before
// anything else is imported.
loadEnv({ path: path.resolve(__dirname, "../../../.env") });

import { prisma } from "@gcc-store/db";
import { createRedisConnection } from "./queue/connection";
import { createFulfillmentQueue } from "./queue/fulfillment-queue";
import { createFulfillmentWorker } from "./fulfillment/fulfillment-worker";
import { startOutboxDispatcherLoop } from "./outbox/outbox-dispatcher";
import { startReconciliationLoop } from "./reconciliation/reconciliation-job";
import { MockFulfillmentProvider } from "./providers/mock-fulfillment.provider";
import type { FulfillmentProvider } from "./providers/fulfillment-provider.interface";

async function bootstrap() {
  const connection = createRedisConnection();
  const queue = createFulfillmentQueue(connection);

  // Provider selection mirrors PaymentsModule's gateway factory in apps/api:
  // Mock is active until a real provider is added and feature-flagged on.
  const providers: FulfillmentProvider[] = [new MockFulfillmentProvider()];
  const activeProvider = providers[0];
  if (!activeProvider) throw new Error("No fulfillment provider configured");

  const worker = createFulfillmentWorker(connection, activeProvider);
  const outboxTimer = startOutboxDispatcherLoop(queue);
  const reconciliationTimer = startReconciliationLoop(providers);

  const healthServer = http.createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok" }));
      return;
    }
    res.writeHead(404);
    res.end();
  });
  const port = Number(process.env["WORKER_HEALTH_PORT"] ?? 4100);
  healthServer.listen(port);

  // eslint-disable-next-line no-console
  console.log(`Worker started — queue "${queue.name}", health check on port ${port}`);

  async function shutdown() {
    clearInterval(outboxTimer);
    clearInterval(reconciliationTimer);
    healthServer.close();
    await worker.close();
    await queue.close();
    await connection.quit();
    await prisma.$disconnect();
    process.exit(0);
  }

  process.on("SIGTERM", () => void shutdown());
  process.on("SIGINT", () => void shutdown());
}

bootstrap().catch((error: unknown) => {
   
  console.error("Worker failed to start", error);
  process.exit(1);
});
