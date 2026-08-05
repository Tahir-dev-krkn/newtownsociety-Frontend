import { API_BASE } from "./constants";

// The API sleeps on Render's free tier and a cold start can take the better
// part of a minute, so the budget has to outlast a waking server.
const REQUEST_TIMEOUT_MS = 45000;
export const COLD_START_TIMEOUT_MS = 90000;

export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    token,
    body,
    responseType = "json",
    headers: customHeaders = {},
    timeoutMs = REQUEST_TIMEOUT_MS,
  } = options;

  if (!API_BASE && !path.startsWith("http")) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const headers = { ...customHeaders };

  if (token) {
    headers.Authorization = token;
  }

  const init = { method, headers };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  init.signal = controller.signal;

  let response;

  try {
    response = await fetch(
      path.startsWith("http") ? path : `${API_BASE}${path}`,
      init,
    );
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (responseType === "blob") {
    if (!response.ok) throw new Error("Download failed");
    return response.blob();
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload?.message || payload?.error || "Request failed";
    throw new Error(message);
  }

  if (responseType === "text") {
    return typeof payload === "string" ? payload : JSON.stringify(payload);
  }

  return payload;
}

let wakeUpRequest = null;

// Called as soon as the app loads so a sleeping API is already booting by the
// time somebody finishes typing their password.
export function wakeServer() {
  if (!API_BASE) return Promise.resolve(false);

  if (!wakeUpRequest) {
    wakeUpRequest = apiRequest("/health", { timeoutMs: COLD_START_TIMEOUT_MS })
      .then(() => true)
      .catch(() => {
        wakeUpRequest = null;
        return false;
      });
  }

  return wakeUpRequest;
}

// A request that died because the server was still coming up, rather than
// because it answered with a real error.
export function isColdStartError(error) {
  return /timed out|failed to fetch|networkerror|load failed|waking up/i.test(
    error?.message || "",
  );
}

export function downloadFile(blob, fileName) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  window.URL.revokeObjectURL(url);
}
