import type { TaskStatus } from "../lib/types";
import { cn } from "../lib/cn";

const map: Record<TaskStatus, { label: string; cls: string }> = {
  todo: { label: "To do", cls: "bg-slate-50 text-slate-700 border-slate-200" },
  in_progress: {
    label: "In progress",
    cls: "bg-amber-50 text-amber-800 border-amber-200",
  },
  done: {
    label: "Done",
    cls: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
};

export function TaskStatusPill({ status }: { status: TaskStatus }) {
  const s = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        s.cls,
      )}
    >
      {s.label}
    </span>
  );
}
