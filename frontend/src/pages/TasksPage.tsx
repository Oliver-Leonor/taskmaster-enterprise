/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, Plus, Trash2, Pencil, RotateCcw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import type { Task, TaskListResponse, TaskStatus } from "../lib/types";
import {
  tasksApi,
  type ListTasksParams,
  type DeletedMode,
  type TaskSortBy,
  type TaskSortDir,
} from "../lib/tasksApi";
import { useDebouncedValue } from "../lib/useDebouncedValue";
import { useMeQuery } from "../lib/useMeQuery";
import { authStore } from "../lib/authStore";

import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { TaskStatusPill } from "../components/TaskStatusPill";
import { TaskSkeleton } from "../components/TaskSkeleton";
import { Pagination } from "../components/Pagination";
import { TaskModal } from "../components/TaskModal";
import { ConfirmDialog } from "../components/ConfirmDialog";

function isPrivileged(role?: string) {
  return role === "admin" || role === "manager";
}

const statusOptions: { value: TaskStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

const sortOptions: { value: `${TaskSortBy}:${TaskSortDir}`; label: string }[] =
  [
    { value: "createdAt:desc", label: "Newest" },
    { value: "createdAt:asc", label: "Oldest" },
    { value: "updatedAt:desc", label: "Recently updated" },
    { value: "title:asc", label: "Title A–Z" },
    { value: "title:desc", label: "Title Z–A" },
  ];

export function TasksPage() {
  const qc = useQueryClient();
  const authed = Boolean(
    authStore.getAccessToken() && authStore.getRefreshToken(),
  );
  const me = useMeQuery(authed);
  const role = me.data?.user?.role;

  // UI state
  const [q, setQ] = React.useState("");
  const qDebounced = useDebouncedValue(q, 350);

  const [status, setStatus] = React.useState<TaskStatus | "all">("all");
  const [sort, setSort] =
    React.useState<`${TaskSortBy}:${TaskSortDir}`>("createdAt:desc");
  const [deleted, setDeleted] = React.useState<DeletedMode>("exclude");

  const [page, setPage] = React.useState(1);
  const limit = 10;

  // modal state
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"create" | "edit">("create");
  const [editing, setEditing] = React.useState<Task | undefined>(undefined);

  // confirm delete
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deletingTask, setDeletingTask] = React.useState<Task | undefined>(
    undefined,
  );

  // derive query params
  const [sortBy, sortDir] = sort.split(":") as [TaskSortBy, TaskSortDir];

  const params: ListTasksParams = {
    page,
    limit,
    sortBy,
    sortDir,
    deleted: isPrivileged(role) ? deleted : "exclude",
    ...(status !== "all" ? { status } : {}),
    ...(qDebounced ? { q: qDebounced } : {}),
  };

  // reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [qDebounced, status, sort, deleted]);

  const tasksQuery = useQuery<TaskListResponse, Error>({
    queryKey: ["tasks", params],
    queryFn: () => tasksApi.list(params),
    enabled: authed,
    placeholderData: keepPreviousData,
  });

  // Mutations: create
  const createMutation = useMutation({
    mutationFn: (input: { title: string; status?: TaskStatus }) =>
      tasksApi.create(input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: ["tasks"] });

      const tempId = `temp_${Math.random().toString(16).slice(2)}`;
      const nowIso = new Date().toISOString();

      const optimistic: Task = {
        id: tempId,
        ownerId: me.data?.user?.id ?? "me",
        title: input.title,
        status: input.status ?? "todo",
        deletedAt: null,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      const prev = qc.getQueryData<any>(["tasks", params]);
      qc.setQueryData(["tasks", params], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          total: old.total + 1,
          items: [optimistic, ...old.items],
        };
      });

      return { prev, tempId };
    },
    onError: (err: any, _input, ctx) => {
      if (ctx?.prev) qc.setQueryData(["tasks", params], ctx.prev);
      toast.error(err?.message ?? "Failed to create task");
    },
    onSuccess: (res, _input, ctx) => {
      // Replace temp item with real item
      qc.setQueryData(["tasks", params], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((t: Task) =>
            t.id === ctx?.tempId ? res.task : t,
          ),
        };
      });
      toast.success("Task created");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Mutations: update (includes optimistic concurrency via If-Unmodified-Since)
  const updateMutation = useMutation({
    mutationFn: (input: {
      id: string;
      patch: { title?: string; status?: TaskStatus };
      ifUnmodifiedSince?: string;
    }) =>
      tasksApi.update(input.id, input.patch, {
        ifUnmodifiedSince: input.ifUnmodifiedSince,
      }),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: ["tasks"] });

      const prev = qc.getQueryData<any>(["tasks", params]);
      qc.setQueryData(["tasks", params], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((t: Task) =>
            t.id === input.id
              ? { ...t, ...input.patch, updatedAt: new Date().toISOString() }
              : t,
          ),
        };
      });

      return { prev };
    },
    onError: (err: any, _input, ctx) => {
      if (ctx?.prev) qc.setQueryData(["tasks", params], ctx.prev);
      toast.error(err?.message ?? "Failed to update task");
    },
    onSuccess: () => toast.success("Task updated"),
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  // Mutations: delete
  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["tasks"] });
      const prev = qc.getQueryData<any>(["tasks", params]);

      qc.setQueryData(["tasks", params], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          total: Math.max(0, old.total - 1),
          items: old.items.filter((t: Task) => t.id !== id),
        };
      });

      return { prev };
    },
    onError: (err: any, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(["tasks", params], ctx.prev);
      toast.error(err?.message ?? "Failed to delete task");
    },
    onSuccess: () => toast.success("Task deleted"),
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  // Mutations: restore (admin/manager)
  const restoreMutation = useMutation({
    mutationFn: (id: string) => tasksApi.restore(id),
    onError: (err: any) => toast.error(err?.message ?? "Failed to restore"),
    onSuccess: () => toast.success("Task restored"),
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const openCreate = () => {
    setModalMode("create");
    setEditing(undefined);
    setModalOpen(true);
  };

  const openEdit = (t: Task) => {
    setModalMode("edit");
    setEditing(t);
    setModalOpen(true);
  };

  const askDelete = (t: Task) => {
    setDeletingTask(t);
    setConfirmOpen(true);
  };

  const onModalSubmit = (data: { title: string; status: TaskStatus }) => {
    if (modalMode === "create") {
      createMutation.mutate({ title: data.title, status: data.status });
      setModalOpen(false);
      return;
    }

    if (editing) {
      updateMutation.mutate({
        id: editing.id,
        patch: { title: data.title, status: data.status },
        ifUnmodifiedSince: editing.updatedAt, // concurrency protection
      });
      setModalOpen(false);
    }
  };

  const items = tasksQuery.data?.items ?? [];
  const total = tasksQuery.data?.total ?? 0;

  const privileged = isPrivileged(role);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-semibold">Tasks</div>
              {me.isLoading ? (
                <Badge>Loading…</Badge>
              ) : role ? (
                <Badge>{role}</Badge>
              ) : null}
            </div>
            <div className="text-sm text-slate-500">
              Search, filter, edit, delete — all wired to your backend with
              optimistic UX.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New task
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Toolbar */}
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_180px_180px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search tasks..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <select
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <select
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <select
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
              value={privileged ? deleted : "exclude"}
              onChange={(e) => setDeleted(e.target.value as any)}
              disabled={!privileged}
              title={
                !privileged ? "Only admin/manager can view deleted tasks" : ""
              }
            >
              <option value="exclude">Exclude deleted</option>
              <option value="include">Include deleted</option>
              <option value="only">Only deleted</option>
            </select>
          </div>

          {/* List */}
          {tasksQuery.isLoading ? (
            <TaskSkeleton />
          ) : tasksQuery.isError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              {(tasksQuery.error as any)?.message ?? "Failed to load tasks"}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <div className="text-base font-semibold">No tasks yet</div>
              <div className="mt-1 text-sm text-slate-500">
                Create one and start shipping.
              </div>
              <div className="mt-4">
                <Button onClick={openCreate}>Create your first task</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((t) => (
                <div
                  key={t.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="truncate text-sm font-semibold text-slate-900">
                          {t.title}
                        </div>
                        {t.deletedAt ? (
                          <Badge className="border-rose-200 bg-rose-50 text-rose-700">
                            Deleted
                          </Badge>
                        ) : null}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Updated{" "}
                        {formatDistanceToNow(new Date(t.updatedAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <TaskStatusPill status={t.status} />

                      {!t.deletedAt ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(t)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => askDelete(t)}
                          >
                            <Trash2 className="h-4 w-4 text-rose-600" />
                          </Button>
                        </>
                      ) : privileged ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => restoreMutation.mutate(t.id)}
                          disabled={restoreMutation.isPending}
                          title="Restore task"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              {tasksQuery.isFetching ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner className="h-4 w-4" /> Refreshing…
                </span>
              ) : (
                <span>
                  Showing{" "}
                  <span className="font-medium text-slate-900">
                    {items.length}
                  </span>{" "}
                  of <span className="font-medium text-slate-900">{total}</span>
                </span>
              )}
            </div>

            <Pagination
              page={page}
              limit={limit}
              total={total}
              onPageChange={setPage}
            />
          </div>
        </CardContent>
      </Card>

      <TaskModal
        open={modalOpen}
        mode={modalMode}
        initial={editing}
        busy={createMutation.isPending || updateMutation.isPending}
        onClose={() => setModalOpen(false)}
        onSubmit={onModalSubmit}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete task?"
        description="This will soft-delete the task. Admin/manager can restore it."
        confirmText="Delete"
        danger
        busy={deleteMutation.isPending}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (!deletingTask) return;
          deleteMutation.mutate(deletingTask.id);
          setConfirmOpen(false);
        }}
      />
    </div>
  );
}
