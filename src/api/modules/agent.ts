import { get, post } from "../client";
import type { PendingAction } from "../types";

/** 获取待审批操作列表 */
export function getPendingActions(
  projectId: number,
): Promise<PendingAction[]> {
  return get<PendingAction[]>(`/projects/${projectId}/agent/actions`);
}

/** 审批/拒绝操作 */
export function approveAction(
  projectId: number,
  actionId: number,
  approved: boolean,
): Promise<unknown> {
  return post<unknown>(
    `/projects/${projectId}/agent/actions/${actionId}/approve`,
    { approved },
  );
}

/**
 * Agent 流式对话（SSE）
 * 返回 ReadableStream，调用方自行处理流式数据
 */
export function agentChatStream(
  projectId: number,
  message: string,
  token: string,
): Promise<Response> {
  return fetch(
    `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"}/api/v1/projects/${projectId}/agent/chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    },
  );
}
