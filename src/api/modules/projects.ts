import { get, post, del, patch } from "../client";
import type {
  CreateProjectRequest,
  PaginatedData,
  Project,
  ProjectListParams,
} from "../types";

/** 创建项目 */
export function createProject(data: CreateProjectRequest): Promise<Project> {
  return post<Project>("/projects", data);
}

/** 获取项目列表 */
export function getProjects(
  params?: ProjectListParams,
): Promise<PaginatedData<Project>> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.keyword) searchParams.set("keyword", params.keyword);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.page_size) searchParams.set("page_size", String(params.page_size));
  const query = searchParams.toString();
  return get<PaginatedData<Project>>(`/projects${query ? `?${query}` : ""}`);
}

/** 获取项目详情 */
export function getProject(projectId: number): Promise<Project> {
  return get<Project>(`/projects/${projectId}`);
}

/** 删除项目 */
export function deleteProject(projectId: number): Promise<null> {
  return del<null>(`/projects/${projectId}`);
}

/** 更新项目 */
export function updateProject(
  projectId: number,
  data: Partial<CreateProjectRequest>,
): Promise<Project> {
  return patch<Project>(`/projects/${projectId}`, data);
}
