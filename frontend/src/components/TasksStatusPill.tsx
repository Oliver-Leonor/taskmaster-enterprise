import { Button } from "./ui/Button";

export function ConfirmDialog(props: {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  busy?: boolean;
}) {
  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="border-b border-slate-100 p-5">
          <div className="text-base font-semibold">{props.title}</div>
          {props.description ? (
            <div className="mt-1 text-sm text-slate-600">
              {props.description}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2 p-5">
          <Button
            variant="secondary"
            onClick={props.onClose}
            disabled={props.busy}
          >
            Cancel
          </Button>
          <Button
            variant={props.danger ? "danger" : "primary"}
            onClick={props.onConfirm}
            disabled={props.busy}
          >
            {props.busy ? "Working..." : (props.confirmText ?? "Confirm")}
          </Button>
        </div>
      </div>
    </div>
  );
}
