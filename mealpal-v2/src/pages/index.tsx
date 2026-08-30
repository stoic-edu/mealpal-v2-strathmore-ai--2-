import { useRef, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CafeteriaQueue } from "@/components/CafeteriaQueue";
import { TodaysSpecial } from "@/components/TodaysSpecial";
import { PlateButton } from "@/components/PlateButton";
import { useAuth } from "@/contexts/AuthContext";
import { usePlate } from "@/contexts/PlateContext";
import { useToast } from "@/hooks/use-toast";
import { cafeterias, foods, getPairingSuggestions, type Cafeteria, type PairingSuggestion } from "@/lib/mock-data";
import { rankFoodsForStudent, predictQueue } from "@/lib/ai-client";
import { congestionToQueueStats } from "@/lib/ai-encoding";

// A handful of realistic "goes-well-together" plate combos, pulled from a couple of
// cafeterias so the home screen isn't just one juice recommended on repeat. When
// `scoreMap` (the recommendation model's per-food match probabilities) is available,
// pairings are ranked by real model output instead of the static healthScore fallback.
function getHomeRecommendations(scoreMap?: Record<string, number>): PairingSuggestion[] {
  return cafeterias.flatMap((c) => getPairingSuggestions(c.name, 1, scoreMap)).slice(0, 4);
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = usePlate();
  const { toast } = useToast();
  const cafeteriaScrollRef = useRef<HTMLDivElement>(null);

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const initials = user?.name?.split(" ").map((n) => n[0]).join("") ?? "?";

  // Ask the recommendation model (mealpal_recommendation_model.pkl) how well each
  // menu item matches this student's profile. Used only to re-rank the pairings
  // below — the UI itself doesn't change shape based on this.
  const [aiScores, setAiScores] = useState<Record<string, number> | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    rankFoodsForStudent(
      {
        bmi: user?.bmi,
        dietaryPreferences: user?.dietaryPreferences,
        calorieGoal: user?.calorieGoal,
      },
      foods
    )
      .then((results) => {
        if (cancelled) return;
        const map: Record<string, number> = {};
        results.forEach((r) => {
          map[r.id] = r.match_probability;
        });
        setAiScores(map);
      })
      .catch(() => {
        // AI backend unreachable — pairing ranking silently falls back to healthScore.
      });
    return () => {
      cancelled = true;
    };
  }, [user?.bmi, user?.dietaryPreferences, user?.calorieGoal]);

  const recommendations = useMemo(() => getHomeRecommendations(aiScores), [aiScores]);

  // Ask the queue model (mealpal_queue_model.pkl) how congested each cafeteria is
  // right now, using the current hour and each cafeteria's queue length as a stand-in
  // for "orders in the last 15 minutes" (this demo doesn't track that directly).
  // The predicted congestion level is converted back into the same queueLength/
  // waitTime numbers the UI already displays, so nothing about the layout changes —
  // only the numbers become model-driven instead of the static mock values.
  const [liveCafeterias, setLiveCafeterias] = useState<Cafeteria[]>(cafeterias);

  useEffect(() => {
    let cancelled = false;
    const nowHour = new Date().getHours();
    Promise.all(
      cafeterias.map((c) =>
        predictQueue({ hour: nowHour, ordersLast15Min: c.queueLength * 2, servers: 3 })
          .then((p) => ({ ...c, ...congestionToQueueStats(p.congestion_label) }))
          .catch(() => c)
      )
    ).then((updated) => {
      if (!cancelled) setLiveCafeterias(updated);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const addCombo = (rec: PairingSuggestion) => {
    const ok1 = addItem(rec.staple, rec.staplePortion, 1);
    if (!ok1) {
      toast({
        title: "Your plate has items from another cafeteria",
        description: "Clear your plate first before adding this combo.",
      });
      return;
    }
    addItem(rec.stew, rec.stewPortion, 1);
    toast({ title: "Added to plate 🍽️", description: rec.label });
  };

  return (
    <div className="p-4 md:p-6 lg:px-10 lg:py-8 space-y-6 max-w-7xl mx-auto w-full animate-fade-in">

      {/* Greeting header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{greeting},</p>
          <h1 className="text-xl font-serif font-bold text-foreground">{firstName} 👋</h1>
        </div>
        <button
          onClick={() => router.push("/profile")}
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm"
        >
          <span className="text-sm font-bold text-primary-foreground">{initials}</span>
        </button>
      </div>

      {/* Today's Special slideshow */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Today's Special</h2>
        </div>
        <TodaysSpecial />
      </div>

      {/* Cafeteria selector — the menu only ever appears once a cafeteria is picked */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Choose a Cafeteria</h2>
        </div>
        <div className="relative group">
          <div
            ref={cafeteriaScrollRef}
            className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide scroll-smooth"
          >
            {liveCafeterias.map((c) => (
              <button
                key={c.id}
                onClick={() => router.push(`/cafeteria/${c.id}`)}
                className="shrink-0 focus:outline-none"
                aria-label={`Order from ${c.name}`}
              >
                <CafeteriaQueue cafeteria={c} />
              </button>
            ))}
          </div>
          <button
            onClick={() => cafeteriaScrollRef.current?.scrollBy({ left: -280, behavior: "smooth" })}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-card border border-border shadow-md items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <button
            onClick={() => cafeteriaScrollRef.current?.scrollBy({ left: 280, behavior: "smooth" })}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 rounded-full bg-card border border-border shadow-md items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>

      {/* Recommended plate combos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Recommended for You</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Realistic plate pairings from around campus</p>
          </div>
          <Badge variant="outline" className="text-[10px] h-5 border-primary/30 text-primary shrink-0">
            <Sparkles className="w-3 h-3 mr-1" /> AI
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendations.map((rec, i) => (
            <div
              key={`${rec.staple.id}-${rec.stew.id}`}
              style={{ animationDelay: `${i * 80}ms` }}
              className="animate-slide-up flex gap-3 p-3 bg-card rounded-xl border border-border"
            >
              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image src={rec.staple.image} alt={rec.staple.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{rec.label}</p>
                <p className="text-xs text-muted-foreground">{rec.staple.cafeteria}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold text-foreground">KES {rec.totalPrice}</span>
                  <button
                    onClick={() => addCombo(rec)}
                    className="text-[11px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-full px-3 py-1.5 transition-colors"
                  >
                    + Add to Plate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PlateButton />
    </div>
  );
}
