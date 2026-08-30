import { useState, useEffect, useRef, useCallback } from "react";
import { QrCode, Clock, CheckCircle2, ChefHat, Package, Copy, Check, Users, Navigation, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { getStoredOrders, saveOrders, updateOrder, ORDER_UPDATE_EVENT, NOTIFY_AT_PEOPLE_AHEAD } from "@/lib/orders";
import type { Order } from "@/lib/mock-data";

const statusConfig = {
  queued: { icon: ChefHat, color: "text-amber-500", bg: "bg-amber-50", label: "In Queue" },
  on_the_way: { icon: Navigation, color: "text-accent", bg: "bg-accent/10", label: "On the Way" },
  ready: { icon: Package, color: "text-accent", bg: "bg-accent/10", label: "Ready for Pickup" },
  completed: { icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10", label: "Completed" },
  cancelled: { icon: Clock, color: "text-destructive", bg: "bg-destructive/10", label: "Cancelled" },
};

function OrderCard({ order, onConfirmOnTheWay }: { order: Order; onConfirmOnTheWay: (id: string) => void }) {
  const [copied, setCopied] = useState(false);
  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  const copyRef = () => {
    navigator.clipboard.writeText(order.referenceCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const progressPercent = Math.round(
    ((order.startingPeopleAhead - order.peopleAhead) / Math.max(1, order.startingPeopleAhead)) * 100
  );
  const showHeadOverBanner = order.status === "queued" && order.peopleAhead <= NOTIFY_AT_PEOPLE_AHEAD;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className={`p-3 flex items-center justify-between ${status.bg}`}>
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-4 h-4 ${status.color}`} />
          <span className={`text-sm font-semibold ${status.color}`}>{status.label}</span>
        </div>
        <Badge variant="outline" className="text-[10px] h-5 font-mono">
          {order.referenceCode.split("-").pop()}
        </Badge>
      </div>

      <div className="p-4 space-y-3">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground">x{item.quantity}</p>
            </div>
            <span className="text-sm font-semibold text-foreground">KES {item.price.toLocaleString()}</span>
          </div>
        ))}

        {/* Queue progress bar */}
        {order.status === "queued" && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> {order.peopleAhead} people ahead of you
              </span>
              <span className="text-muted-foreground">{order.pickupEta}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {showHeadOverBanner && (
          <div className="flex items-start gap-2 bg-destructive/5 border border-destructive/20 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-bold text-destructive">Only {order.peopleAhead} people ahead — head to {order.cafeteria} now!</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Please be on your way within the next 10 minutes.</p>
              <Button
                size="sm"
                onClick={() => onConfirmOnTheWay(order.id)}
                className="mt-2 h-8 text-xs rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                <Navigation className="w-3.5 h-3.5 mr-1.5" />
                I&apos;m on my way
              </Button>
            </div>
          </div>
        )}

        {order.status === "on_the_way" && (
          <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-xl p-3">
            <Navigation className="w-4 h-4 text-accent shrink-0" />
            <p className="text-xs text-foreground">The kitchen has been notified you&apos;re on your way — show your code at the counter.</p>
          </div>
        )}

        <div className="border-t border-border pt-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Cafeteria</span>
            <span className="font-medium text-foreground">{order.cafeteria}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Payment</span>
            <span className="font-medium text-foreground">{order.paymentMethod}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold text-foreground">KES {order.total.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-muted rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-8 h-8 text-foreground" />
            <div>
              <p className="text-[10px] text-muted-foreground">Reference Code</p>
              <p className="text-sm font-mono font-semibold text-foreground">{order.referenceCode}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={copyRef}>
            {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [orders, setOrders] = useState<Order[]>([]);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const notifiedRef = useRef<Set<string>>(new Set());

  const loadOrders = useCallback(() => {
    setOrders(getStoredOrders());
  }, []);

  useEffect(() => {
    setMounted(true);
    loadOrders();
    window.addEventListener(ORDER_UPDATE_EVENT, loadOrders);
    return () => window.removeEventListener(ORDER_UPDATE_EVENT, loadOrders);
  }, [loadOrders]);

  // Simulate the queue moving forward for orders still waiting in line.
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      const current = getStoredOrders();
      let changed = false;
      const next = current.map((o) => {
        if (o.status !== "queued" || o.peopleAhead <= 0) return o;
        changed = true;
        const newAhead = Math.max(0, o.peopleAhead - 1);
        if (newAhead <= NOTIFY_AT_PEOPLE_AHEAD && !o.notified3Ahead && !notifiedRef.current.has(o.id)) {
          notifiedRef.current.add(o.id);
          toast({
            title: `${newAhead} people ahead of you!`,
            description: `Head to ${o.cafeteria} now — please be on your way within the next 10 minutes.`,
          });
          return { ...o, peopleAhead: newAhead, notified3Ahead: true };
        }
        return { ...o, peopleAhead: newAhead };
      });
      if (changed) saveOrders(next);
    }, 7000);
    return () => clearInterval(interval);
  }, [mounted, toast]);

  const handleConfirmOnTheWay = (orderId: string) => {
    updateOrder(orderId, { status: "on_the_way", onTheWaySince: new Date().toISOString() });
    toast({ title: "Got it — see you soon!", description: "The kitchen will start plating your order." });
  };

  const activeOrders = orders.filter((o) => o.status === "queued" || o.status === "on_the_way" || o.status === "ready");
  const historyOrders = orders.filter((o) => o.status === "completed" || o.status === "cancelled");

  if (!mounted) {
    return (
      <div className="p-4 md:p-6 space-y-4 animate-fade-in">
        <h1 className="text-xl font-serif font-bold text-foreground">My Orders</h1>
        <div className="flex gap-2">
          <div className="flex-1 py-2.5 rounded-xl bg-card border border-border h-10" />
          <div className="flex-1 py-2.5 rounded-xl bg-card border border-border h-10" />
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-card rounded-xl border border-border animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:px-10 lg:py-8 space-y-4 max-w-7xl mx-auto w-full animate-fade-in">
      <h1 className="text-xl font-serif font-bold text-foreground">My Orders</h1>

      <div className="flex gap-2 max-w-sm">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeTab === "active" ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border"
          }`}
        >
          Active ({activeOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeTab === "history" ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border"
          }`}
        >
          History ({historyOrders.length})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {(activeTab === "active" ? activeOrders : historyOrders).map((order) => (
          <OrderCard key={order.id} order={order} onConfirmOnTheWay={handleConfirmOnTheWay} />
        ))}
      </div>

      {activeTab === "active" && activeOrders.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No active orders</p>
          <p className="text-xs text-muted-foreground mt-1">Pick a cafeteria on Home to build your plate</p>
        </div>
      )}
    </div>
  );
}
