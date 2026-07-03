"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type AuthMode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  // Already signed in → straight to the calculator.
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/risk-calculator");
    }
  }, [user, authLoading, router]);

  async function handleEmailLogin() {
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    router.push("/risk-calculator");
  }

  async function handleSignUp() {
    if (!email || !password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // When email confirmation is disabled, signUp returns an active session
    // and we can go straight in. Otherwise ask the user to check their inbox.
    if (data.session) {
      router.push("/risk-calculator");
      return;
    }

    toast.success("Check your email for a confirmation link.");
    setLoading(false);
    setMode("login");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "login") {
      handleEmailLogin();
    } else {
      handleSignUp();
    }
  }

  function toggleMode() {
    setMode((prev) => (prev === "login" ? "signup" : "login"));
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="bg-hero-forest relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Ambient lime glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="glow-lime absolute -top-40 right-[-60px] h-[360px] w-[420px] opacity-20" />
        <div className="glow-lime absolute -bottom-48 left-[10%] h-[320px] w-[380px] opacity-[0.14]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[#f1f5ef]">
            FX Unlock
          </h1>
          <p className="mt-2 text-sm font-medium uppercase tracking-widest text-[#9fe0ad]">
            Risk Calculator
          </p>
        </div>

        <Card className="border-border bg-card shadow-xl shadow-border/50 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-foreground">
              {mode === "login" ? "Welcome back" : "Create account"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {mode === "login"
                ? "Sign in to access your risk calculator"
                : "Get started with disciplined position sizing"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Email form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="trader@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-ring/30"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-ring/30"
                  disabled={loading}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                />
              </div>

              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-foreground">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-ring/30"
                    disabled={loading}
                    autoComplete="new-password"
                  />
                </div>
              )}

              <Button
                type="submit"
                variant="lime"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : mode === "login" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Toggle mode */}
            <p className="text-center text-sm text-muted-foreground">
              {mode === "login"
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="font-medium text-primary underline-offset-4 transition-colors hover:text-primary/90 hover:underline"
              >
                {mode === "login" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-[#b3c4b8]">
          Secure, encrypted, and private by design.
        </p>
      </div>
    </div>
  );
}
