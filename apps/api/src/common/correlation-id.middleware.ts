import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

// Every request gets a correlation ID, echoed in the response and threaded
// through logs, so a single order/payment/webhook flow can be traced
// end-to-end — required by master prompt section 23 test criteria.
export class CorrelationIdMiddleware {
  use = (req: Request, res: Response, next: NextFunction): void => {
    const incoming = req.header("x-correlation-id");
    const correlationId = incoming && incoming.length > 0 ? incoming : randomUUID();
    req.headers["x-correlation-id"] = correlationId;
    res.setHeader("x-correlation-id", correlationId);
    next();
  };
}
