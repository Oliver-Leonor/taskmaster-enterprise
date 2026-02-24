import { Card, CardContent, CardHeader } from "../components/ui/Card";

export function TasksPage() {
  return (
    <Card>
      <CardHeader>
        <div className="text-lg font-semibold">Tasks</div>
        <div className="text-sm text-slate-500">
          Next: real CRUD + filters + pagination.
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-slate-600">
          Frontend shell is ready. In Part F3 we’ll connect to your backend:
          list/create/edit/delete with a polished UI.
        </div>
      </CardContent>
    </Card>
  );
}
