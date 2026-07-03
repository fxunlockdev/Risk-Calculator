"use client";

import { useState } from "react";
import { Settings as SettingsIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  // The (app) layout only renders children once the profile is loaded, so
  // the initial value here is already the persisted name.
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!user) return;

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() || null })
      .eq("id", user.id);
    setSaving(false);

    if (error) {
      toast.error(`Failed to update profile: ${error.message}`);
      return;
    }

    await refreshProfile();
    toast.success("Profile updated.");
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <SettingsIcon className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your profile and account
          </p>
        </div>
      </div>

      <Card className="max-w-xl border-border bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold text-foreground">
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-xs font-medium text-muted-foreground"
            >
              Email
            </Label>
            <Input id="email" value={profile?.email ?? ""} disabled />
            <p className="text-[11px] text-muted-foreground/70">
              Your sign-in email cannot be changed here.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="full-name"
              className="text-xs font-medium text-muted-foreground"
            >
              Full Name
            </Label>
            <Input
              id="full-name"
              placeholder="Your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={saving}
            />
          </div>

          <Button
            type="button"
            variant="lime"
            onClick={() => void handleSave()}
            disabled={saving}
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
