import { useState, useEffect, useCallback, useRef } from "react";
import { Clock, CheckCircle2, History, Volume2, VolumeX, AlertTriangle, UtensilsCrossed, LogOut, Search, XCircle, PackageCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KitchenOrderCard } from "@/components/KitchenOrderCard";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { useAuth } from "@/contexts/AuthContext";
import { getHourBucket, formatPlacedTime, getWaitSeconds, formatWaitTime } from "@/lib/kitchen-data";
import type { KitchenOrder } from "@/lib/kitchen-data";
import { KITCHEN_CONCURRENT_LIMIT } from "@/lib/orders";
import { getSimulatedWalkInWeights, type WalkInWeight } from "@/lib/ai-client";

/** Picks a walk-in dish weighted by the forecast model's predicted demand (falls
 *  back to a uniform pick over a small default list while the models are loading). */
function pickWeightedMeal(weights: WalkInWeight[] | null): { name: string; maxQuantity: 1 | 2 } {
  const fallback = ["Full Rice", "Half Kamande", "Ugali", "Nyama Choma", "Pilau Rice", "Chicken Stew", "Grilled Tilapia", "Githeri"];
  if (!weights || weights.length === 0) {
    return { name: fallback[Math.floor(Math.random() * fallback.length)], maxQuantity: 2 };
  }
  const total = weights.reduce((sum, w) => sum + w.weight, 0);
  let r = Math.random() * total;
  for (const w of weights) {
    r -= w.weight;
    if (r <= 0) return w;
  }
  return weights[weights.length - 1];
}

export default function KitchenDisplayPage() {
  const { logout } = useAuth();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [waitingCount, setWaitingCount] = useState(0);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState("redeem");
  const [historyFilter, setHistoryFilter] = useState<number | null>(null);
  const [redeemCode, setRedeemCode] = useState("");
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Load orders from localStorage. To prevent overwhelming the kitchen, only orders the
  // student has confirmed they're "on the way" for are shown — capped to a handful at a time.
  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    const loadOrders = () => {
      const savedOrders = localStorage.getItem("mealpal_orders");
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);

        const onTheWay = parsed
          .filter((o: any) => o.status === "on_the_way")
          .sort((a: any, b: any) => new Date(a.onTheWaySince || a.createdAt).getTime() - new Date(b.onTheWaySince || b.createdAt).getTime());

        setWaitingCount(Math.max(0, onTheWay.length - KITCHEN_CONCURRENT_LIMIT));

        const activeSlice = onTheWay.slice(0, KITCHEN_CONCURRENT_LIMIT);
        const served = parsed.filter((o: any) => o.status === "completed");

        const kitchenOrders: KitchenOrder[] = [...activeSlice, ...served].map((o: any) => ({
          id: o.id,
          referenceCode: o.referenceCode,
          items: o.items.map((it: any) => ({ name: it.name, quantity: it.quantity, notes: "", allergens: it.allergens })),
          placedAt: o.onTheWaySince || o.createdAt,
          status: o.status === "on_the_way" ? "active" : "served",
          servedAt: o.status === "completed" ? o.createdAt : undefined,
          servedBy: o.status === "completed" ? "Chef Ali" : undefined,
        }));
        setOrders(kitchenOrders);
      } else {
        setOrders([]);
        setWaitingCount(0);
      }
    };

    loadOrders();
    window.addEventListener("mealpal_order_update", loadOrders);
    return () => {
      clearInterval(timer);
      window.removeEventListener("mealpal_order_update", loadOrders);
    };
  }, []);

  // Ask the forecast + waste models which walk-in dish is most likely next, and
  // how large an order for it should be — guides the existing simulation below
  // without changing anything about what's rendered.
  const [walkInWeights, setWalkInWeights] = useState<WalkInWeight[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    getSimulatedWalkInWeights().then((w) => {
      if (!cancelled) setWalkInWeights(w);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Simulate the occasional walk-in order, but never exceed the concurrent limit —
  // that's the whole point of only surfacing confirmed "on the way" orders.
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setOrders((prev) => {
        const activeCount = prev.filter((o) => o.status === "active").length;
        if (activeCount >= KITCHEN_CONCURRENT_LIMIT || Math.random() <= 0.88) return prev;
        const pick = pickWeightedMeal(walkInWeights);
        const newOrder: KitchenOrder = {
          id: `ord-${Date.now()}`,
          referenceCode: `MP-STR-${new Date().getFullYear()}-${Math.floor(30000 + Math.random() * 9999)}`,
          items: [{ name: pick.name, quantity: 1 + Math.floor(Math.random() * pick.maxQuantity) }],
          placedAt: new Date().toISOString(),
          status: "active",
        };
        if (soundEnabled) playBeep();
        return [newOrder, ...prev];
      });
    }, 18000);
    return () => clearInterval(interval);
  }, [soundEnabled, mounted, walkInWeights]);

  const playBeep = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Audio unavailable
    }
  }, []);

  const handleServed = (orderId: string) => {
    setOrders((prev) => {
      const updated = prev.map((o) =>
        o.id === orderId
          ? { ...o, status: "served" as const, servedAt: new Date().toISOString(), servedBy: "Chef Ali" }
          : o
      );
      // Update localStorage
      const saved = JSON.parse(localStorage.getItem("mealpal_orders") || "[]");
      const updatedSaved = saved.map((o: any) => o.id === orderId ? { ...o, status: "completed" } : o);
      localStorage.setItem("mealpal_orders", JSON.stringify(updatedSaved));
      window.dispatchEvent(new Event("mealpal_order_update"));
      return updated;
    });
  };

  const activeOrders = orders.filter((o) => o.status === "active").sort((a, b) => new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime());
  const servedOrders = orders.filter((o) => o.status === "served").sort((a, b) => new Date(b.servedAt || b.placedAt).getTime() - new Date(a.servedAt || a.placedAt).getTime());

  const normalizedCode = redeemCode.trim().toLowerCase();
  const matchedActiveOrder = normalizedCode
    ? activeOrders.find((o) => o.referenceCode.toLowerCase() === normalizedCode)
    : null;
  const matchedServedOrder = normalizedCode && !matchedActiveOrder
    ? servedOrders.find((o) => o.referenceCode.toLowerCase() === normalizedCode)
    : null;

  const handleRedeem = () => {
    if (!matchedActiveOrder) return;
    handleServed(matchedActiveOrder.id);
    setRedeemCode("");
  };
  const filteredHistory = historyFilter !== null ? servedOrders.filter((o) => getHourBucket(o.servedAt || o.placedAt) === historyFilter) : servedOrders;
  const staleCount = activeOrders.filter((o) => {
    const wait = Math.floor((Date.now() - new Date(o.placedAt).getTime()) / 1000);
    return wait > 600;
  }).length;
  const hourOptions = Array.from(new Set(servedOrders.map((o) => getHourBucket(o.servedAt || o.placedAt)))).sort((a, b) => a - b);
  const formatTime = (date: Date) => date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

  return (
    <div className="min-h-screen pattern-kanga flex flex-col" style={{ backgroundColor: "#e8f0e9" }}>
      <header className="bg-card border-b-2 border-border px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-foreground leading-tight">Kitchen Display</h1>
              <p className="text-xs text-muted-foreground">Meal Pal Order Queue</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-xl px-4 py-2">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xl font-bold text-foreground leading-none">{activeOrders.length}/{KITCHEN_CONCURRENT_LIMIT}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Active</p>
              </div>
            </div>

            {waitingCount > 0 && (
              <div className="flex items-center gap-2 bg-chart-3/10 border border-chart-3/30 rounded-xl px-4 py-2">
                <Users className="w-5 h-5 text-chart-3" />
                <span className="text-sm font-bold text-chart-3">{waitingCount} more on the way</span>
              </div>
            )}

            {staleCount > 0 && (
              <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <span className="text-sm font-bold text-destructive">{staleCount} OVER 10 MIN</span>
              </div>
            )}

            <Button variant="outline" onClick={() => setSoundEnabled(!soundEnabled)} className="h-11 px-4 rounded-xl">
              {soundEnabled ? <Volume2 className="w-4 h-4 mr-2" /> : <VolumeX className="w-4 h-4 mr-2" />}
              {soundEnabled ? "Sound On" : "Muted"}
            </Button>

            <div className="flex items-center gap-2 bg-muted rounded-xl px-4 py-2 border border-border">
              <Clock className="w-5 h-5 text-foreground" />
              <span className="text-xl font-mono font-bold text-foreground">
                {mounted && currentTime ? formatTime(currentTime) : "--:--:--"}
              </span>
            </div>

            <ThemeSwitch />

            <Button variant="outline" size="icon" onClick={logout} className="h-11 w-11 rounded-xl" title="Logout">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="w-fit mb-4 h-11 bg-muted rounded-xl p-1">
            <TabsTrigger value="redeem" className="text-sm px-6 h-9 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Search className="w-4 h-4 mr-2" />
              Redeem Order
            </TabsTrigger>
            <TabsTrigger value="active" className="text-sm px-6 h-9 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Clock className="w-4 h-4 mr-2" />
              Active Orders ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="text-sm px-6 h-9 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <History className="w-4 h-4 mr-2" />
              History ({servedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="redeem" className="flex-1 overflow-y-auto mt-0">
            <div className="max-w-md mx-auto pt-4">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-lg font-serif font-bold text-foreground">Hand over an order</h2>
                <p className="text-sm text-muted-foreground mt-1">Type the student's reference code to verify and confirm handover</p>
              </div>

              <Input
                autoFocus
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value)}
                placeholder="e.g. MP-STR-2026-48213"
                className="h-14 text-center text-lg font-mono font-bold rounded-xl border-2 tracking-wide"
              />

              {normalizedCode && (
                <div className="mt-4">
                  {matchedActiveOrder ? (
                    <div className="bg-card border-2 border-primary rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xl font-mono font-bold text-foreground">{matchedActiveOrder.referenceCode}</p>
                        <span className="text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                          Ready to hand over
                        </span>
                      </div>
                      <div className="space-y-2">
                        {matchedActiveOrder.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <span className="text-base font-bold text-primary w-8">{item.quantity}x</span>
                            <span className="text-sm text-foreground">{item.name}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                        <span>Placed {formatPlacedTime(matchedActiveOrder.placedAt)}</span>
                        <span className="font-semibold">{formatWaitTime(getWaitSeconds(matchedActiveOrder.placedAt))} waiting</span>
                      </div>
                      <Button onClick={handleRedeem} className="w-full h-12 text-base font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground">
                        <PackageCheck className="w-5 h-5 mr-2" />
                        Confirm Handover
                      </Button>
                    </div>
                  ) : matchedServedOrder ? (
                    <div className="bg-muted rounded-2xl p-5 text-center space-y-2 animate-in fade-in slide-in-from-top-2">
                      <CheckCircle2 className="w-8 h-8 text-muted-foreground mx-auto" />
                      <p className="text-sm font-semibold text-foreground">This order was already handed over</p>
                      <p className="text-xs text-muted-foreground">
                        Served {matchedServedOrder.servedAt ? formatPlacedTime(matchedServedOrder.servedAt) : ""} by {matchedServedOrder.servedBy}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5 text-center space-y-2 animate-in fade-in slide-in-from-top-2">
                      <XCircle className="w-8 h-8 text-destructive mx-auto" />
                      <p className="text-sm font-semibold text-foreground">No matching order found</p>
                      <p className="text-xs text-muted-foreground">Double-check the reference code with the student</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="active" className="flex-1 overflow-y-auto mt-0">
            {activeOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <CheckCircle2 className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-xl font-semibold">All caught up!</p>
                <p className="text-sm mt-1">No active orders waiting</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pb-6">
                {activeOrders.map((order) => (
                  <KitchenOrderCard key={order.id} order={order} onServed={handleServed} largeMode />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="flex-1 overflow-y-auto mt-0">
            {hourOptions.length > 0 && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Button variant={historyFilter === null ? "default" : "outline"} size="sm" onClick={() => setHistoryFilter(null)} className="h-9 text-sm px-4 rounded-xl">
                  All Hours
                </Button>
                {hourOptions.map((hour) => (
                  <Button key={hour} variant={historyFilter === hour ? "default" : "outline"} size="sm" onClick={() => setHistoryFilter(hour)} className="h-9 text-sm px-4 rounded-xl">
                    {hour}:00–{hour + 1}:00
                  </Button>
                ))}
              </div>
            )}

            {filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <History className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-lg font-semibold">No orders in this period</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
                {filteredHistory.map((order) => (
                  <KitchenOrderCard key={order.id} order={order} onServed={handleServed} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}