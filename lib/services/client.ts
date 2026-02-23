// lib/services/client.ts
// ═══ Typed HTTP Client for Admin Services ═══
//
// Thin wrapper around `fetch` that handles JSON serialization,
// error parsing, and returns a discriminated union result.
// Every admin service function uses these helpers instead of
// calling `fetch` directly — single source of truth for the
// request/response contract.

// ─── Types ─────────────────────────────────────────────────────

/** Discriminated union — every service call returns one of these */
export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/** Shape returned by our API routes on error */
interface ApiErrorBody {
  success: false;
  error?: string;
  errors?: Record<string, string[]>;
}

// ─── Helpers ───────────────────────────────────────────────────

/**
 * Parse a failed response into a human-readable error string.
 * Handles both `{ error: "msg" }` and `{ errors: { field: [...] } }` shapes.
 */
async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as ApiErrorBody;

    if (body.error) return body.error;

    // Zod validation errors come as { errors: { field: ["msg"] } }
    if (body.errors) {
      const messages = Object.entries(body.errors)
        .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
        .join("; ");
      return messages || "Validation failed";
    }

    return `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

/**
 * Core request function — every verb helper delegates to this.
 *
 * @param url    - Relative URL (e.g. `/api/admin/bookings`)
 * @param init   - Standard RequestInit (method, body, etc.)
 * @returns      - `ApiResult<T>` — always resolves, never throws
 */
async function request<T>(
  url: string,
  init: RequestInit
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
    });

    if (!res.ok) {
      const error = await parseError(res);
      return { success: false, error };
    }

    const json = (await res.json()) as Record<string, unknown>;

    // Check for server-side failure flag
    if ("success" in json && json.success === false) {
      return {
        success: false,
        error: (json.error as string) ?? "Operation failed",
      };
    }

    // Strip `success` flag, pass everything else as T.
    // Routes return either { success, data } or { success, data, pagination, ... }
    // By removing `success` and extracting the rest, the service type decides the shape.
    const { success: _success, ...rest } = json;

    // If the route wraps its payload in `data` AND has no siblings, unwrap it.
    // Otherwise pass the full rest object so siblings like `pagination` are preserved.
    const hasOnlyData = Object.keys(rest).length === 1 && "data" in rest;
    const payload = hasOnlyData ? rest.data : rest;

    return { success: true, data: payload as T };
  } catch {
    return { success: false, error: "Network error — please try again" };
  }
}

// ─── Public API ────────────────────────────────────────────────

/** GET request — query params should be pre-encoded in the URL */
export function apiGet<T>(url: string): Promise<ApiResult<T>> {
  return request<T>(url, { method: "GET" });
}

/** POST request with JSON body */
export function apiPost<T>(url: string, body: unknown): Promise<ApiResult<T>> {
  return request<T>(url, { method: "POST", body: JSON.stringify(body) });
}

/** PATCH request with JSON body */
export function apiPatch<T>(url: string, body: unknown): Promise<ApiResult<T>> {
  return request<T>(url, { method: "PATCH", body: JSON.stringify(body) });
}

/** DELETE request with JSON body */
export function apiDelete<T>(
  url: string,
  body: unknown
): Promise<ApiResult<T>> {
  return request<T>(url, { method: "DELETE", body: JSON.stringify(body) });
}
