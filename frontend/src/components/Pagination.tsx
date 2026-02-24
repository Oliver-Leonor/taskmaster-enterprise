import { Button } from "./ui/Button";

export function Pagination(props: {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(props.total / props.limit));
  const canPrev = props.page > 1;
  const canNext = props.page < totalPages;

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm text-slate-600">
        Page <span className="font-medium text-slate-900">{props.page}</span> of{" "}
        <span className="font-medium text-slate-900">{totalPages}</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={!canPrev}
          onClick={() => props.onPageChange(props.page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={!canNext}
          onClick={() => props.onPageChange(props.page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
