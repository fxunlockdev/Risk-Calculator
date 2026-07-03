"use client";

import { useEffect, useState } from "react";
import { History, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDateTime } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";
import type { RiskCalculation } from "@/types/database";

const HISTORY_LIMIT = 20;

interface SavedCalculationsProps {
  /** Bump this to trigger a refetch after a new save. */
  readonly refreshToken: number;
}

function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function SavedCalculations({ refreshToken }: SavedCalculationsProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<readonly RiskCalculation[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("risk_calculations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(HISTORY_LIMIT);

      if (cancelled) return;
      if (error) {
        toast.error(`Failed to load saved calculations: ${error.message}`);
        setItems([]);
        return;
      }
      setItems((data as RiskCalculation[]) ?? []);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [user, refreshToken]);

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("risk_calculations")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(`Failed to delete: ${error.message}`);
      return;
    }
    setItems((prev) => (prev ?? []).filter((item) => item.id !== id));
    toast.success("Calculation deleted.");
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <History className="size-4 text-muted-foreground" />
          Saved Calculations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items === null ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No saved calculations yet — save one to build your history.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item) => {
              const isBuy = item.direction === "buy";
              return (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 first:pt-0 last:pb-0"
                >
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg",
                      isBuy ? "bg-pos/15 text-pos" : "bg-neg/15 text-neg",
                    )}
                  >
                    {isBuy ? (
                      <TrendingUp className="size-4" />
                    ) : (
                      <TrendingDown className="size-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {item.instrument ?? "—"}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] capitalize",
                          isBuy
                            ? "border-pos/30 bg-pos/10 text-pos"
                            : "border-neg/30 bg-neg/10 text-neg",
                        )}
                      >
                        {item.direction}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        1:{item.reward_ratio} RR · {item.risk_percent}% risk
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Entry {formatNumber(item.entry_price, 5)} · SL{" "}
                      {formatNumber(item.stop_loss_price, 5)} · TP{" "}
                      {formatNumber(item.target_price, 5)} ·{" "}
                      {formatDateTime(item.created_at)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">
                      {formatNumber(item.position_size, 2)}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        units
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${formatNumber(item.dollar_risk)} risk
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    aria-label="Delete calculation"
                    onClick={() => void handleDelete(item.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
