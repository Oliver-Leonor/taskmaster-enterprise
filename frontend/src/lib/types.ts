export type Role = "admin" | "manager" | "user";

export type User = {
  id: string;
  role: Role;
};

export type AuthResponse = {
  user: { id: string; email: string; role: Role };
  accessToken: string;
  refreshToken: string;
};

export type TaskStatus = "todo" | "in_progress" | "done";

export type Task = {
  id: string;
  ownerId: string;
  title: string;
  status: TaskStatus;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskListResponse = {
  page: number;
  limit: number;
  total: number;
  items: Task[];
};
