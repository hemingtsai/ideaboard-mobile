import { reactive } from "vue";
import type { User } from "../api/types";
import * as authApi from "../api/modules/users";
import { setToken, clearToken, hasToken } from "../api/client";

/** 认证状态（全局单例，不依赖 Vue 组件树） */
const state = reactive({
  user: null as User | null,
  isAuthenticated: false,
  isLoading: false,
});

/** 初始化时检查本地 token */
async function initAuth(): Promise<void> {
  if (!hasToken()) return;

  state.isLoading = true;
  try {
    const user = await authApi.getMe();
    state.user = user;
    state.isAuthenticated = true;
  } catch {
    clearToken();
    state.user = null;
    state.isAuthenticated = false;
  } finally {
    state.isLoading = false;
  }
}

/** 登录 */
async function login(username: string, password: string): Promise<void> {
  const res = await authApi.login({ username, password });
  setToken(res.access_token);
  state.isAuthenticated = true;

  // 获取用户信息
  try {
    const user = await authApi.getMe();
    state.user = user;
  } catch {
    // token 有效但获取用户信息失败，不清除状态
  }
}

/** 注册 */
async function register(
  username: string,
  email: string,
  password: string,
): Promise<void> {
  await authApi.register({ username, email, password });
  // 注册成功后自动登录
  await login(username, password);
}

/** 登出 */
function logout(): void {
  clearToken();
  state.user = null;
  state.isAuthenticated = false;
}

/** 刷新用户信息 */
async function refreshUser(): Promise<void> {
  if (!state.isAuthenticated) return;
  try {
    const user = await authApi.getMe();
    state.user = user;
  } catch {
    // 如果获取失败，尝试登出
    logout();
  }
}

export function useAuth() {
  return {
    state,
    initAuth,
    login,
    register,
    logout,
    refreshUser,
  };
}
