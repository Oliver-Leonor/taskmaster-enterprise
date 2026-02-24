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
import { authStore } from "../lib/authStore";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormData) => {
    try {
      setLoading(true);
      const res = await api.register(values.email, values.password);
      authStore.setTokens({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
      });
      toast.success("Account created");
      navigate("/app/tasks", { replace: true });
    } catch (e: any) {
      toast.error(e?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="text-xl font-semibold">Create account</div>
            <div className="text-sm text-slate-500">
              Get started in under a minute.
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
                  placeholder="At least 8 characters"
                  {...register("password")}
                />
                {formState.errors.password && (
                  <div className="text-xs text-rose-600">
                    {formState.errors.password.message}
                  </div>
                )}
              </div>

              <Button className="w-full" disabled={loading} type="submit">
                {loading ? "Creating..." : "Create account"}
              </Button>

              <div className="text-center text-sm text-slate-600">
                Already have an account?{" "}
                <Link
                  className="font-medium text-slate-900 hover:underline"
                  to="/login"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
