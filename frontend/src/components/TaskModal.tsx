import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import type { Task, TaskStatus } from "../lib/types";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

type FormData = {
  title: string;
  status: TaskStatus;
};

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

export function TaskModal(props: {
  open: boolean;
  mode: "create" | "edit";
  initial?: Task;
  onClose: () => void;
  onSubmit: (data: { title: string; status: TaskStatus }) => void;
  busy?: boolean;
}) {
  const defaults = useMemo<FormData>(() => {
    if (props.mode === "edit" && props.initial) {
      return { title: props.initial.title, status: props.initial.status };
    }
    return { title: "", status: "todo" };
  }, [props.mode, props.initial]);

  const { register, handleSubmit, reset, formState } = useForm<FormData>({
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="border-b border-slate-100 p-5">
          <div className="text-base font-semibold">
            {props.mode === "create" ? "Create task" : "Edit task"}
          </div>
          <div className="mt-1 text-sm text-slate-600">
            Keep it simple. Update status as you move.
          </div>
        </div>

        <form
          onSubmit={handleSubmit((v) => props.onSubmit(v))}
          className="space-y-4 p-5"
        >
          <div className="space-y-1">
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="e.g., Ship MVP"
              {...register("title", { required: true })}
            />
            {formState.errors.title && (
              <div className="text-xs text-rose-600">Title is required</div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Status</label>
            <select
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
              {...register("status")}
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              type="button"
              onClick={props.onClose}
              disabled={props.busy}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={props.busy}>
              {props.busy
                ? "Saving..."
                : props.mode === "create"
                  ? "Create"
                  : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
