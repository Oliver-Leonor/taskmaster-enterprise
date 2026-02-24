import { Outlet, useNavigate } from "react-router-dom";
import { CheckSquare, LogOut } from "lucide-react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { authStore } from "../lib/authStore";

export function AppShell() {
  const navigate = useNavigate();

  const logout = () => {
    authStore.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-slate-50/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <CheckSquare className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-semibold leading-tight">
                  TaskMaster
                </div>
                <div className="text-xs text-slate-500">
                  Keyboard: N new, / search
                </div>
              </div>
            </div>

            <Button variant="secondary" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
          <Card className="hidden p-3 md:block">
            <nav className="space-y-1">{/* existing NavLink */}</nav>
          </Card>

          <div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
