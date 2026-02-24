/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent, CardHeader } from "../components/ui/Card";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormData) => {
    try {
      setLoading(true);
      const res = await api.login(values.email, values.password);
      localStorage.setItem("tm_access", res.accessToken);
      localStorage.setItem("tm_refresh", res.refreshToken);
      toast.success("Welcome back");
      navigate("/app/tasks", { replace: true });
    } catch (e: any) {
      toast.error(e?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="text-xl font-semibold">Sign in</div>
            <div className="text-sm text-slate-500">
              Use your account to continue.
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <Input placeholder="you@example.com" {...register("email")} />
                {formState.errors.email && (
                  <div className="text-xs text-rose-600">
                    {formState.errors.email.message}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                />
                {formState.errors.password && (
                  <div className="text-xs text-rose-600">
                    {formState.errors.password.message}
                  </div>
                )}
              </div>

              <Button className="w-full" disabled={loading} type="submit">
                {loading ? "Signing in..." : "Sign in"}
              </Button>

              <div className="text-center text-sm text-slate-600">
                No account?{" "}
                <Link
                  className="font-medium text-slate-900 hover:underline"
                  to="/register"
                >
                  Create one
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
