import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import type { Request, Response } from "express";

interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
    correlationId: string;
    details?: unknown;
  };
}

// Standard error envelope for every API response (master prompt section 14).
// Never leaks stack traces or vendor error messages to the client.
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = (request.headers["x-correlation-id"] as string | undefined) ?? "unknown";

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = "internal_error";
    let message = "An unexpected error occurred.";
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      code = httpStatusToCode(status);
      if (typeof body === "string") {
        message = body;
      } else if (typeof body === "object" && body !== null) {
        const typed = body as { message?: string | string[] };
        message = Array.isArray(typed.message) ? typed.message.join(", ") : (typed.message ?? message);
        details = typed;
      }
    } else if (exception instanceof Error) {
       
      console.error(`[${correlationId}]`, exception);
    }

    const envelope: ErrorEnvelope = {
      error: { code, message, correlationId, ...(details ? { details } : {}) },
    };
    response.status(status).json(envelope);
  }
}

function httpStatusToCode(status: number): string {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return "bad_request";
    case HttpStatus.UNAUTHORIZED:
      return "unauthorized";
    case HttpStatus.FORBIDDEN:
      return "forbidden";
    case HttpStatus.NOT_FOUND:
      return "not_found";
    case HttpStatus.CONFLICT:
      return "conflict";
    case HttpStatus.TOO_MANY_REQUESTS:
      return "rate_limited";
    default:
      return "internal_error";
  }
}
