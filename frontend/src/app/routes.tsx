import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { TasksPage } from "../pages/TasksPage";
import { AppShell } from "../components/AppShell";
import { authStore } from "../lib/authStore";

function Protected({ children }: { children: React.ReactNode }) {
  const authed = Boolean(
    authStore.getAccessToken() && authStore.getRefreshToken(),
  );
  if (!authed) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app/tasks" replace />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/app/*"
        element={
          <Protected>
            <AppShell />
          </Protected>
        }
      >
        <Route path="tasks" element={<TasksPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
