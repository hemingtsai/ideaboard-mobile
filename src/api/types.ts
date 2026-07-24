/** 通用 API 响应结构 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/** 分页请求参数 */
export interface PaginationParams {
  page?: number;
  page_size?: number;
}

/** 分页响应结构 */
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

// ========== 用户模块 ==========

export type UserRole = "user" | "admin" | "root";

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface ConversationStats {
  total_conversations: number;
  days: number;
  daily_breakdown: { date: string; count: number }[];
}

// ========== 项目模块 ==========

export type ProjectStatus = "active" | "archived";

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface ProjectListParams extends PaginationParams {
  status?: ProjectStatus;
  keyword?: string;
}

// ========== 对话模块 ==========

export type MessageRole = "user" | "assistant";

export interface ConversationMessage {
  id: number;
  project_id?: number;
  role: MessageRole;
  content: string;
  created_at: string;
}

export interface SendMessageRequest {
  message: string;
}

export interface ConversationListData extends PaginatedData<ConversationMessage> {
  has_more: boolean;
}

// ========== 项目概览模块 ==========

export interface ActivityItem {
  type: string;
  description: string;
  user_id: number;
  timestamp: string;
}

export interface ProjectOverview {
  project: {
    id: number;
    name: string;
    description?: string;
    status: string;
    created_at: string;
  };
  conversations: {
    total: number;
    this_month: number;
  };
  recent_activity: ActivityItem[];
}

// ========== 设置模块 ==========

export type SettingsGroup = Record<string, unknown>;

export interface UserSettings {
  [group: string]: SettingsGroup;
}

export interface SystemSettings {
  system: {
    maintenance_mode: boolean;
    max_projects_per_user: number;
    max_messages_per_project: number;
  };
  ai: {
    model: string;
    temperature: number;
    max_tokens: number;
    rate_limit_per_user: number;
  };
  security: {
    max_login_attempts: number;
    session_timeout_minutes: number;
  };
}

export interface UpdateSettingsRequest {
  [key: string]: unknown;
}

export interface ResetSettingsRequest {
  group?: string;
}

// ========== Todo 模块 ==========

export type TodoStatus = "pending" | "in_progress" | "completed";

export interface Todo {
  id: number;
  user_id: number;
  project_id: number;
  title: string;
  description?: string | null;
  status: TodoStatus;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  priority?: number;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  status?: TodoStatus;
  priority?: number;
}

// ========== Agent 模块 ==========

export interface PendingAction {
  id: number;
  project_id: number;
  action_type: string;
  action_data: Record<string, unknown>;
  status: string;
  ai_message?: string | null;
  created_at: string;
}

export interface ActionApprovalRequest {
  approved: boolean;
}

/** SSE action_proposal 事件中的 action */
export interface AgentActionProposal {
  id?: number;
  action_type: string;
  action_data: Record<string, unknown>;
  message: string;
  status: string;
}
