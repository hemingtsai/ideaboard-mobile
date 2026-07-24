import { get, post, patch, del } from "../client";
import type {
  CreateTodoRequest,
  PaginatedData,
  Todo,
  UpdateTodoRequest,
} from "../types";

/** 创建待办 */
export function createTodo(
  projectId: number,
  data: CreateTodoRequest,
): Promise<Todo> {
  return post<Todo>(`/projects/${projectId}/todos`, data);
}

/** 获取待办列表 */
export function getTodos(
  projectId: number,
  params?: { status?: string; page?: number; page_size?: number },
): Promise<PaginatedData<Todo>> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.page_size) searchParams.set("page_size", String(params.page_size));
  const query = searchParams.toString();
  return get<PaginatedData<Todo>>(
    `/projects/${projectId}/todos${query ? `?${query}` : ""}`,
  );
}

/** 更新待办 */
export function updateTodo(
  projectId: number,
  todoId: number,
  data: UpdateTodoRequest,
): Promise<Todo> {
  return patch<Todo>(`/projects/${projectId}/todos/${todoId}`, data);
}

/** 删除待办 */
export function deleteTodo(
  projectId: number,
  todoId: number,
): Promise<null> {
  return del<null>(`/projects/${projectId}/todos/${todoId}`);
}
