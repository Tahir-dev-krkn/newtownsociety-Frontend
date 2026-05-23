import { API_BASE } from "./constants";

const REQUEST_TIMEOUT_MS = 15000;

export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    token,
    body,
    responseType = "json",
    headers: customHeaders = {},
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
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
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
      typeof payload === "string" ? payload : payload?.error || "Request failed";
    throw new Error(message);
  }

  if (responseType === "text") {
    return typeof payload === "string" ? payload : JSON.stringify(payload);
  }

  return payload;
}

export function downloadFile(blob, fileName) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  window.URL.revokeObjectURL(url);
}
