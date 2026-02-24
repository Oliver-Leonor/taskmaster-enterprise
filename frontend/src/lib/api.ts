/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/api.ts
import type { AuthResponse } from "./types";
import { authStore } from "./authStore";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

type ApiFetchOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
  auth?: boolean;
  retry?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = authStore.getRefreshToken();
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        authStore.clear();
        return null;
      }

      const data = (await res.json()) as {
        accessToken: string;
        refreshToken: string;
      };
      authStore.setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      return data.accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function apiFetch<T>(
  path: string,
  opts: ApiFetchOptions = {},
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  // ✅ remove custom options so they never reach fetch()
  const {
    auth = true,
    retry = true,
    headers: headersInit,
    ...fetchOpts
  } = opts;

  const headers = new Headers(headersInit);

  if (!headers.has("Content-Type") && fetchOpts.body) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = authStore.getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...fetchOpts, headers });

  // token refresh retry
  if (res.status === 401 && retry) {
    const newToken = await refreshAccessToken();
    if (!newToken) throw new Error("Unauthorized");

    const retryHeaders = new Headers(headers);
    retryHeaders.set("Authorization", `Bearer ${newToken}`);

    const retryRes = await fetch(url, { ...fetchOpts, headers: retryHeaders });
    if (!retryRes.ok) throw await toApiError(retryRes);
    return (await retryRes.json()) as T;
  }

  if (!res.ok) throw await toApiError(res);
  return (await res.json()) as T;
}

async function toApiError(res: Response) {
  try {
    const data = await res.json();
    const msg = data?.error?.message || `Request failed (${res.status})`;
    const err = new Error(msg) as any;
    err.status = res.status;
    err.body = data;
    return err;
  } catch {
    return new Error(`Request failed (${res.status})`);
  }
}

export const api = {
  register: (email: string, password: string) =>
    apiFetch<AuthResponse>("/api/v1/auth/register", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email, password }),
    }),
  me: () =>
    apiFetch<{ user: { id: string; role: "admin" | "manager" | "user" } }>(
      "/api/v1/auth/me",
    ),
};
