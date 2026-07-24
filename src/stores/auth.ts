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

let initPromise: Promise<void> | null = null;

/** 初始化时检查本地 token，返回 Promise 供路由守卫等待 */
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

/** 确保 initAuth 只执行一次，返回可等待的 Promise */
export function waitForAuthInit(): Promise<void> {
  if (!initPromise) {
    initPromise = initAuth();
  }
  return initPromise;
}

/** 登录 */
async function login(username: string, password: string): Promise<void> {
  const res = await authApi.login({ username, password });
  setToken(res.access_token);
  state.isAuthenticated = true;

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
