import { get, patch, post } from "../client";
import type {
  ResetSettingsRequest,
  SystemSettings,
  UpdateSettingsRequest,
  UserSettings,
} from "../types";

// ========== 用户设置 ==========

/** 获取用户设置 */
export function getUserSettings(): Promise<UserSettings> {
  return get<UserSettings>("/user-settings");
}

/** 修改用户设置 */
export function updateUserSettings(
  data: UpdateSettingsRequest,
): Promise<UserSettings> {
  return patch<UserSettings>("/user-settings", data);
}

/** 重置用户设置 */
export function resetUserSettings(
  data?: ResetSettingsRequest,
): Promise<UserSettings> {
  return post<UserSettings>("/user-settings/reset", data);
}

// ========== 系统设置 (admin/root) ==========

/** 获取系统设置 */
export function getSystemSettings(): Promise<SystemSettings> {
  return get<SystemSettings>("/system-settings");
}

/** 修改系统设置 */
export function updateSystemSettings(
  data: UpdateSettingsRequest,
): Promise<SystemSettings> {
  return patch<SystemSettings>("/system-settings", data);
}

/** 重置系统设置 */
export function resetSystemSettings(): Promise<SystemSettings> {
  return post<SystemSettings>("/system-settings/reset");
}

/** 重启服务 (root only) */
export function restartService(): Promise<null> {
  return post<null>("/system-settings/restart");
}
