import { get, post, del } from "../client";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  ConversationStats,
} from "../types";

/** 用户注册 */
export function register(data: RegisterRequest): Promise<User> {
  return post<User>("/users/register", data);
}

/** 用户登录 */
export function login(data: LoginRequest): Promise<LoginResponse> {
  return post<LoginResponse>("/users/login", data);
}

/** 获取当前用户信息 */
export function getMe(): Promise<User> {
  return get<User>("/users/me");
}

/** 获取对话统计 */
export function getConversationStats(days?: number): Promise<ConversationStats> {
  const params = days ? `?days=${days}` : "";
  return get<ConversationStats>(`/users/me/conversation-stats${params}`);
}

/** 获取用户列表 (admin/root) */
export function getUserList(params?: {
  role?: string;
  keyword?: string;
  page?: number;
  page_size?: number;
}): Promise<{ items: User[]; total: number; page: number; page_size: number }> {
  const searchParams = new URLSearchParams();
  if (params?.role) searchParams.set("role", params.role);
  if (params?.keyword) searchParams.set("keyword", params.keyword);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.page_size) searchParams.set("page_size", String(params.page_size));
  const query = searchParams.toString();
  return get(`/users${query ? `?${query}` : ""}`);
}

/** 删除用户 (admin/root) */
export function deleteUser(userId: number): Promise<null> {
  return del<null>(`/users/${userId}`);
}
