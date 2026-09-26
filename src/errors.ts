/**
 * Error utilities — generic version of Ecomsia's error-capture helper.
 * Server frameworks (h3, Express…) often swallow Error objects into generic
 * 500 responses; these helpers keep the message, stack and full cause chain.
 */

const CAUSE_DEPTH_LIMIT = 5;
const DESCRIPTION_LENGTH_LIMIT = 8_000;

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

function describeStatus(error: Error): string {
  const { status, statusCode } = error as { status?: unknown; statusCode?: unknown };
  const value = status ?? statusCode;
  return typeof value === "number" ? ` (status ${value})` : "";
}

/**
 * Human-readable, log-ready description of any thrown value: message, stack
 * and the full `cause` chain (up to 5 levels), plus HTTP status when present.
 */
export function describeError(error: unknown): string {
  const parts: string[] = [];
  let current: unknown = error;
  for (let depth = 0; depth < CAUSE_DEPTH_LIMIT && current != null; depth++) {
    if (!(current instanceof Error)) {
      parts.push(typeof current === "string" ? current : safeStringify(current));
      break;
    }
    const label = depth === 0 ? "" : "caused by: ";
    parts.push(`${label}${current.stack ?? `${current.name}: ${current.message}`}${describeStatus(current)}`);
    current = current.cause;
  }
  return parts.join("\n").slice(0, DESCRIPTION_LENGTH_LIMIT);
}

let lastCapturedError: { error: unknown; at: number } | undefined;
const TTL_MS = 5_000;

function record(error: unknown) {
  lastCapturedError = { error, at: Date.now() };
}

/**
 * Remember the most recent thrown error (5 s TTL). Useful when a framework
 * serializes errors before your handler can read them: call
 * `captureThrown(error)` in `console.error` and retrieve the real stack with
 * `consumeLastCapturedError()` in the 500 handler.
 */
export function captureThrown(error: unknown): void {
  record(error);
}

/** Retrieve (and clear) the last captured error if it is still fresh. */
export function consumeLastCapturedError(): unknown | undefined {
  const captured = lastCapturedError;
  if (captured && Date.now() - captured.at <= TTL_MS) {
    lastCapturedError = undefined;
    return captured.error;
  }
  return undefined;
}

/** Install global listeners (console.error hook, unhandled rejections). */
export function installErrorCapture(): void {
  const originalConsoleError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    const expanded = args.map((arg) =>
      arg instanceof Error ? (record(arg), describeError(arg)) : arg,
    );
    originalConsoleError(...expanded);
  };
  if (typeof globalThis.addEventListener === "function") {
    globalThis.addEventListener("error", (event) => record((event as ErrorEvent).error ?? event));
    globalThis.addEventListener("unhandledrejection", (event) =>
      record((event as PromiseRejectionEvent).reason),
    );
  }
}
