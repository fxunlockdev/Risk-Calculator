"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Calculator,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Monitor,
  LogOut,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { createClient } from "@/lib/supabase/client";

const OPEN_EVENT = "trdr:open-command-palette";

export function CommandPalette() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  // Cmd+K / Ctrl+K toggles; topbar search button dispatches OPEN_EVENT.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    function onOpenEvent() {
      setOpen(true);
    }

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_EVENT, onOpenEvent);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_EVENT, onOpenEvent);
    };
  }, []);

  const runAction = useCallback((action: () => void) => {
    setOpen(false);
    action();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out.");
      return;
    }
    router.push("/login");
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => runAction(() => router.push("/risk-calculator"))}
            keywords={["position", "size", "risk", "calc"]}
          >
            <Calculator className="size-4" />
            Go to Risk Calculator
          </CommandItem>
          <CommandItem
            onSelect={() => runAction(() => router.push("/settings"))}
            keywords={["profile", "account"]}
          >
            <SettingsIcon className="size-4" />
            Go to Settings
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Theme">
          <CommandItem onSelect={() => runAction(() => setTheme("light"))}>
            <Sun className="size-4" />
            Light Mode
          </CommandItem>
          <CommandItem onSelect={() => runAction(() => setTheme("dark"))}>
            <Moon className="size-4" />
            Dark Mode
          </CommandItem>
          <CommandItem onSelect={() => runAction(() => setTheme("system"))}>
            <Monitor className="size-4" />
            System Theme
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Account">
          <CommandItem onSelect={() => runAction(() => void handleSignOut())}>
            <LogOut className="size-4" />
            Sign Out
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
