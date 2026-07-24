import type { ApiResponse } from "./types";

/** Clarity 后端基础 URL，可通过环境变量覆盖 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
const API_PREFIX = "/api/v1";

/** 获取存储的 token */
function getToken(): string | null {
  return localStorage.getItem("access_token");
}

/** 保存 token */
export function setToken(token: string): void {
  localStorage.setItem("access_token", token);
}

/** 清除 token */
export function clearToken(): void {
  localStorage.removeItem("access_token");
}

/** 是否有已保存的 token */
export function hasToken(): boolean {
  return !!getToken();
}

class ApiError extends Error {
  code: number;

  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.name = "ApiError";
  }
}

/**
 * 通用请求方法
 * 自动附加 Authorization header，统一处理错误响应
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${API_PREFIX}${endpoint}`, {
    ...options,
    headers,
  });

  // 401 时清除 token
  if (response.status === 401) {
    clearToken();
  }

  const json: ApiResponse<T> = await response.json();

  if (json.code !== 0) {
    throw new ApiError(json.code, json.message);
  }

  return json.data;
}

/** GET 请求 */
export function get<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: "GET" });
}

/** POST 请求 */
export function post<T>(endpoint: string, body?: unknown): Promise<T> {
  return request<T>(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/** PATCH 请求 */
export function patch<T>(endpoint: string, body?: unknown): Promise<T> {
  return request<T>(endpoint, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/** DELETE 请求 */
export function del<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: "DELETE" });
}

export { ApiError };
