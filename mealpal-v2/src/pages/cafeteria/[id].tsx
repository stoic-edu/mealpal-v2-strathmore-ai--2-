import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { ArrowLeft, Search, Users, Clock, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FoodCard } from "@/components/FoodCard";
import { PlateButton } from "@/components/PlateButton";
import { useAuth } from "@/contexts/AuthContext";
import { cafeterias, getFoodsByCafeteria, getPairingSuggestions, type FoodCategory } from "@/lib/mock-data";
import { rankFoodsForStudent, predictQueue } from "@/lib/ai-client";
import { congestionToQueueStats } from "@/lib/ai-encoding";

const categoryOrder: FoodCategory[] = ["Staple", "Stew", "Vegetable", "Side", "Drink", "Snack"];
const categoryLabels: Record<FoodCategory, string> = {
  Staple: "Staples",
  Stew: "Stews & Proteins",
  Vegetable: "Vegetables",
  Side: "Sides",
  Drink: "Drinks",
  Snack: "Snacks",
};

export default function CafeteriaMenuPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"All" | FoodCategory>("All");

  const cafeteria = cafeterias.find((c) => c.id === id);

  const foods = useMemo(() => (cafeteria ? getFoodsByCafeteria(cafeteria.name) : []), [cafeteria]);

  // Recommendation model scores for this cafeteria's items, keyed by food id.
  const [aiScores, setAiScores] = useState<Record<string, number> | undefined>(undefined);
  useEffect(() => {
    if (foods.length === 0) return;
    let cancelled = false;
    rankFoodsForStudent(
      { bmi: user?.bmi, dietaryPreferences: user?.dietaryPreferences, calorieGoal: user?.calorieGoal },
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
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [foods, user?.bmi, user?.dietaryPreferences, user?.calorieGoal]);

  const pairings = useMemo(() => (cafeteria ? getPairingSuggestions(cafeteria.name, 2, aiScores) : []), [cafeteria, aiScores]);

  // Live congestion reading from the queue model, converted back into the same
  // queueLength/waitTime numbers the header already displays — no new UI element,
  // just model-driven numbers in place of the static mock ones.
  const [liveStats, setLiveStats] = useState<{ queueLength: number; waitTime: number } | undefined>(undefined);
  useEffect(() => {
    if (!cafeteria) return;
    let cancelled = false;
    predictQueue({ hour: new Date().getHours(), ordersLast15Min: cafeteria.queueLength * 2, servers: 3 })
      .then((p) => {
        if (!cancelled) setLiveStats(congestionToQueueStats(p.congestion_label));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [cafeteria]);

  const filteredFoods = foods.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || f.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedByCategory = categoryOrder
    .map((cat) => ({ category: cat, items: filteredFoods.filter((f) => f.category === cat) }))
    .filter((group) => group.items.length > 0);

  if (router.isReady && !cafeteria) {
    return (
      <div className="p-6 text-center space-y-3">
        <p className="text-sm text-muted-foreground">We couldn&apos;t find that cafeteria.</p>
        <button onClick={() => router.push("/")} className="text-sm text-primary font-medium hover:underline">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:px-10 lg:py-8 space-y-4 max-w-7xl mx-auto w-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/")} className="p-2 -ml-2 rounded-xl hover:bg-muted shrink-0">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        {cafeteria && (
          <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0">
            <Image src={cafeteria.image} alt={cafeteria.name} fill className="object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-serif font-bold text-foreground truncate">{cafeteria?.name ?? "Menu"}</h1>
          {cafeteria && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {liveStats?.queueLength ?? cafeteria.queueLength} in queue</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ~{liveStats?.waitTime ?? cafeteria.waitTime} min</span>
            </div>
          )}
        </div>
        <Badge variant="outline" className="text-[10px] h-6 border-primary/30 text-primary shrink-0">
          {filteredFoods.length} items
        </Badge>
      </div>

      {/* Realistic pairing recommendation strip */}
      {pairings.length > 0 && activeCategory === "All" && !searchQuery && (
        <div className="bg-primary/5 border border-primary/15 rounded-2xl p-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">Popular plate combos here</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {pairings.map((p, i) => (
              <div key={i} className="shrink-0 bg-card border border-border rounded-xl px-3 py-2 min-w-[220px]">
                <p className="text-xs font-semibold text-foreground">{p.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">KES {p.totalPrice} total</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search this menu…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card border-border h-10 rounded-xl text-sm"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {(["All", ...categoryOrder] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border hover:bg-muted"
            }`}
          >
            {cat === "All" ? "All" : categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Food list, grouped by category */}
      {filteredFoods.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <p className="text-muted-foreground text-sm">No items match your search</p>
        </div>
      ) : (
        <div className="space-y-5">
          {groupedByCategory.map((group) => (
            <div key={group.category}>
              <h2 className="text-sm font-semibold text-foreground mb-2">{categoryLabels[group.category]}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {group.items.map((food, i) => (
                  <div key={food.id} style={{ animationDelay: `${i * 40}ms` }} className="animate-slide-up">
                    <FoodCard food={food} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <PlateButton />
    </div>
  );
}
