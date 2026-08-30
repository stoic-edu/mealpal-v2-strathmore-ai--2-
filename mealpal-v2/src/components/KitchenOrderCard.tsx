import { useState, useEffect } from "react";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KitchenOrder, getWaitSeconds, formatWaitTime, formatPlacedTime } from "@/lib/kitchen-data";

interface KitchenOrderCardProps {
  order: KitchenOrder;
  onServed: (orderId: string) => void;
  largeMode?: boolean;
}

// Three-tier urgency so staff can triage at a glance instead of reading timestamps
function getUrgency(waitSeconds: number): "fresh" | "warning" | "urgent" {
  if (waitSeconds > 600) return "urgent";
  if (waitSeconds > 300) return "warning";
  return "fresh";
}

const urgencyStyles = {
  fresh: { border: "border-border", badge: "bg-primary/10 text-primary", ring: "" },
  warning: { border: "border-chart-3", badge: "bg-chart-3/15 text-chart-3", ring: "" },
  urgent: { border: "border-destructive", badge: "bg-destructive/15 text-destructive", ring: "ring-2 ring-destructive/30" },
} as const;

export function KitchenOrderCard({ order, onServed, largeMode = false }: KitchenOrderCardProps) {
  const [mounted, setMounted] = useState(false);
  const [waitSeconds, setWaitSeconds] = useState(0);
  const urgency = mounted ? getUrgency(waitSeconds) : "fresh";
  const style = urgencyStyles[urgency];

  useEffect(() => {
    setMounted(true);
    setWaitSeconds(getWaitSeconds(order.placedAt));
    const interval = setInterval(() => setWaitSeconds(getWaitSeconds(order.placedAt)), 1000);
    return () => clearInterval(interval);
  }, [order.placedAt]);

  if (largeMode) {
    return (
      <div
        className={`bg-card rounded-2xl p-5 shadow-sm border-2 transition-colors ${style.border} ${style.ring}`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${style.badge}`}>
            {urgency === "urgent" ? "Urgent" : urgency === "warning" ? "Waiting" : "New"}
          </span>
          <div className={`font-mono text-lg font-bold ${urgency === "urgent" ? "text-destructive" : "text-foreground"}`}>
            {mounted ? formatWaitTime(waitSeconds) : "--:--"}
          </div>
        </div>

        <p className="text-2xl font-mono font-bold text-foreground tracking-tight leading-none mb-4">
          {order.referenceCode}
        </p>

        {urgency === "urgent" && (
          <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-xl px-3 py-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
            <span className="text-sm font-bold text-destructive">WAITING OVER 10 MINUTES</span>
          </div>
        )}

        <div className="space-y-2.5 mb-5">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <span className="text-lg font-bold text-primary flex-shrink-0 w-10">{item.quantity}x</span>
              <div className="flex-1">
                <p className="text-base font-semibold text-foreground leading-tight">{item.name}</p>
                {item.notes && <p className="text-sm text-muted-foreground mt-0.5">{item.notes}</p>}
                {item.allergens && item.allergens.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                    <span className="text-sm font-bold text-destructive">ALLERGEN: {item.allergens.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <Clock className="w-3.5 h-3.5" />
          <span>Placed {formatPlacedTime(order.placedAt)}</span>
        </div>

        <Button
          onClick={() => onServed(order.id)}
          className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
        >
          <CheckCircle2 className="w-5 h-5 mr-2" />
          Mark as Served
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xl font-mono font-semibold text-foreground">{order.referenceCode}</p>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">Served</span>
      </div>
      <div className="space-y-1.5 mb-3">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className="text-base font-bold text-primary">{item.quantity}x</span>
            <span className="text-sm text-muted-foreground">{item.name}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
        <span>Placed {formatPlacedTime(order.placedAt)}</span>
        {order.servedAt && (
          <span>Served {formatPlacedTime(order.servedAt)} — {order.servedBy}</span>
        )}
      </div>
    </div>
  );
}
