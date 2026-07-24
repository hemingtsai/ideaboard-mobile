import { get, post } from "../client";
import type {
  ConversationListData,
  ConversationMessage,
  ProjectOverview,
  SendMessageRequest,
} from "../types";

/** 发送消息并获取 AI 回复 */
export function sendMessage(
  projectId: number,
  data: SendMessageRequest,
): Promise<ConversationMessage> {
  return post<ConversationMessage>(
    `/projects/${projectId}/conversations`,
    data,
  );
}

/** 获取对话消息列表 */
export function getConversations(
  projectId: number,
  params?: { page?: number; page_size?: number },
): Promise<ConversationListData> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.page_size)
    searchParams.set("page_size", String(params.page_size));
  const query = searchParams.toString();
  return get<ConversationListData>(
    `/projects/${projectId}/conversations${query ? `?${query}` : ""}`,
  );
}

/** 获取项目概览（进度、统计、最近活动） */
export function getOverview(projectId: number): Promise<ProjectOverview> {
  return get<ProjectOverview>(`/projects/${projectId}/overview`);
}
