import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Workplace AI" },
      {
        name: "description",
        content:
          "Sign in with Google to use the Workplace AI email, meeting notes and research tools.",
      },
      { property: "og:title", content: "Sign in — Workplace AI" },
      {
        property: "og:description",
        content: "Secure Google sign-in for your Workplace AI workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [loading, user, navigate]);

  const signIn = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Sign-in failed. Please try again.");
        return;
      }
      if (result.redirected) return;
      navigate({ to: "/" });
    } catch {
      toast.error("Sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 font-sans">
      <div className="w-full max-w-[420px] rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-panel)]">
        <span className="grid size-11 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
          AI
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Sign in to Workplace AI</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use your Google account to access the email, meeting notes and research tools.
        </p>
        <Button className="mt-6 w-full" onClick={signIn} disabled={busy || loading}>
          {busy ? "Opening Google…" : "Continue with Google"}
        </Button>
        <p className="mt-4 text-xs text-muted-foreground">
          AI drafts are suggestions — review them before sending or sharing.
        </p>
      </div>
    </main>
  );
}
