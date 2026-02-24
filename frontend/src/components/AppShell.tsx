import { Outlet, NavLink, useNavigate } from "react-router-dom";
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
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold leading-tight">
                TaskMaster
              </div>
              <div className="text-sm text-slate-500">Enterprise demo UI</div>
            </div>
          </div>

          <Button variant="secondary" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
          <Card className="p-3">
            <nav className="space-y-1">
              <NavLink
                to="/app/tasks"
                className={({ isActive }) =>
                  [
                    "block rounded-xl px-3 py-2 text-sm font-medium",
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100",
                  ].join(" ")
                }
              >
                Tasks
              </NavLink>
            </nav>
          </Card>

          <div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
