import { apiFetch } from "./api";
import type { Task, TaskListResponse, TaskStatus } from "./types";

export type TaskSortBy = "createdAt" | "updatedAt" | "title";
export type TaskSortDir = "asc" | "desc";
export type DeletedMode = "exclude" | "include" | "only";

export type ListTasksParams = {
  page: number;
  limit: number;
  status?: TaskStatus;
  q?: string;
  sortBy: TaskSortBy;
  sortDir: TaskSortDir;
  deleted: DeletedMode;
};

function toQuery(params: ListTasksParams) {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page));
  qs.set("limit", String(params.limit));
  qs.set("sortBy", params.sortBy);
  qs.set("sortDir", params.sortDir);
  qs.set("deleted", params.deleted);

  if (params.status) qs.set("status", params.status);
  if (params.q) qs.set("q", params.q);

  return qs.toString();
}

export const tasksApi = {
  list: (params: ListTasksParams) =>
    apiFetch<TaskListResponse>(`/api/v1/tasks?${toQuery(params)}`),

  create: (input: { title: string; status?: TaskStatus }) =>
    apiFetch<{ task: Task }>(`/api/v1/tasks`, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (
    id: string,
    input: { title?: string; status?: TaskStatus },
    opts?: { ifUnmodifiedSince?: string },
  ) =>
    apiFetch<{ task: Task }>(`/api/v1/tasks/${id}`, {
      method: "PATCH",
      headers: {
        ...(opts?.ifUnmodifiedSince
          ? { "If-Unmodified-Since": opts.ifUnmodifiedSince }
          : {}),
      },
      body: JSON.stringify(input),
    }),

  remove: (id: string) =>
    apiFetch<{ task: Task }>(`/api/v1/tasks/${id}`, {
      method: "DELETE",
    }),

  restore: (id: string) =>
    apiFetch<{ task: Task }>(`/api/v1/tasks/${id}/restore`, {
      method: "POST",
    }),
};
