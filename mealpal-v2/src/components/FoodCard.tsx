import { useState, useMemo } from "react";
import Image from "next/image";
import { Star, Flame, Plus, Minus, X, Sparkles, UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePlate } from "@/contexts/PlateContext";
import { cn } from "@/lib/utils";
import {
  getServingsFor,
  getComplementaryItem,
  formatPortionLabel,
  type FoodItem,
  type Portion,
} from "@/lib/mock-data";

interface FoodCardProps {
  food: FoodItem;
}

function AddToPlateSheet({ food, open, onClose }: { food: FoodItem; open: boolean; onClose: () => void }) {
  const [portion, setPortion] = useState<Portion>("full");
  const [qty, setQty] = useState(1);
  const [addPairing, setAddPairing] = useState(false);
  const { toast } = useToast();
  const { addItem, cafeteria } = usePlate();

  const pairing = useMemo(() => (open ? getComplementaryItem(food) : null), [open, food]);

  if (!open) return null;

  const servings = getServingsFor(food, food.hasPortions ? portion : null);
  const pairingServings = pairing ? getServingsFor(pairing.item, pairing.portion) : null;
  const grandTotal = servings.price * qty + (addPairing && pairingServings ? pairingServings.price : 0);

  const handleAdd = () => {
    if (cafeteria && cafeteria !== food.cafeteria) {
      toast({
        title: "Your plate has items from another cafeteria",
        description: "Clear your plate first, or finish that order, before adding from here.",
      });
      return;
    }
    addItem(food, food.hasPortions ? portion : null, qty);
    if (addPairing && pairing) {
      addItem(pairing.item, pairing.portion, 1);
    }
    toast({
      title: "Added to plate 🍽️",
      description: addPairing && pairing
        ? `${formatPortionLabel(food, food.hasPortions ? portion : null)} + ${formatPortionLabel(pairing.item, pairing.portion)}`
        : formatPortionLabel(food, food.hasPortions ? portion : null),
    });
    onClose();
    setQty(1);
    setAddPairing(false);
    setPortion("full");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-card rounded-t-3xl flex flex-col animate-in slide-in-from-bottom-5 max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 p-3.5 pb-2 shrink-0">
          <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0">
            <Image src={food.image} alt={food.name} fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-serif font-bold text-foreground truncate">{food.name}</h3>
            <p className="text-xs text-muted-foreground truncate">{food.cafeteria}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted shrink-0">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3.5 space-y-3 pb-2.5">
          {/* Portion selector — only for scoop-served items */}
          {food.hasPortions && food.portions && (
            <div>
              <p className="text-xs font-semibold text-foreground mb-1.5">Portion size</p>
              <div className="grid grid-cols-2 gap-2">
                {(["half", "full"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPortion(p)}
                    className={cn(
                      "py-2 rounded-xl text-sm font-semibold border transition-colors",
                      portion === p ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/40"
                    )}
                  >
                    {p === "half" ? "½ Half" : "Full"}
                    <span className="block text-[10px] font-normal opacity-70">
                      KES {food.portions[p].price} · {food.portions[p].calories} cal
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-foreground">KES {grandTotal.toLocaleString()}</span>
            <div className="flex items-center gap-2.5 bg-muted rounded-xl px-2.5 py-1">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-1 rounded-lg hover:bg-card">
                <Minus className="w-3.5 h-3.5 text-foreground" />
              </button>
              <span className="text-sm font-semibold w-4 text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="p-1 rounded-lg hover:bg-card">
                <Plus className="w-3.5 h-3.5 text-foreground" />
              </button>
            </div>
          </div>

          {/* Realistic pairing suggestion, e.g. "Full Rice pairs well with Half Kamande" */}
          {pairing && pairingServings && (
            <div className="border-t border-border pt-2.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">Goes well together</span>
              </div>
              <button
                onClick={() => setAddPairing((v) => !v)}
                className={cn(
                  "w-full flex items-center gap-2 rounded-xl p-2 border transition-colors text-left",
                  addPairing ? "bg-primary/5 border-primary/30" : "bg-muted/50 border-transparent hover:border-border"
                )}
              >
                <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={pairing.item.image} alt={pairing.item.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {formatPortionLabel(pairing.item, pairing.portion)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    KES {pairingServings.price} · {pairingServings.calories} cal
                  </p>
                </div>
                <span
                  className={cn(
                    "text-[11px] font-semibold rounded-full px-2.5 py-1 transition-colors shrink-0",
                    addPairing ? "bg-primary text-primary-foreground" : "text-primary bg-primary/10 hover:bg-primary/20"
                  )}
                >
                  {addPairing ? "Added" : "+ Add"}
                </span>
              </button>
            </div>
          )}
        </div>

        <div className="p-3.5 pt-2 border-t border-border shrink-0">
          <Button onClick={handleAdd} className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold">
            <UtensilsCrossed className="w-4 h-4 mr-2" />
            Add to Plate · KES {grandTotal.toLocaleString()}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function FoodCard({ food }: FoodCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const hasAllergen = food.allergens.length > 0;
  const priceFrom = food.hasPortions && food.portions ? food.portions.half.price : food.fixedPrice!.price;
  const calsFull = food.hasPortions && food.portions ? food.portions.full.calories : food.fixedPrice!.calories;

  return (
    <>
      <button
        onClick={() => setSheetOpen(true)}
        className="flex gap-3 p-3 bg-card rounded-xl border border-border hover:shadow-md transition-shadow w-full text-left"
      >
        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
          <Image src={food.image} alt={food.name} fill className="object-cover" />
          {hasAllergen && (
            <div className="absolute top-1 left-1 bg-destructive text-destructive-foreground text-[9px] px-1.5 py-0.5 rounded-full font-medium">
              Allergen
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm text-foreground truncate">{food.name}</h3>
            <span className={`text-[10px] font-bold shrink-0 px-1.5 py-0.5 rounded-full ${
              food.healthScore >= 90 ? "bg-accent/15 text-accent" :
              food.healthScore >= 70 ? "bg-primary/15 text-primary" :
              food.healthScore >= 50 ? "bg-chart-3/15 text-chart-3" : "bg-destructive/15 text-destructive"
            }`}>
              {food.healthScore}% healthy
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{food.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm font-bold text-foreground">
              {food.hasPortions ? `From KES ${priceFrom}` : `KES ${priceFrom}`}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
              <Flame className="w-3 h-3" /> {calsFull}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-primary text-primary" /> {food.rating}
            </span>
          </div>
          <div className="flex gap-1 mt-2 flex-wrap">
            {food.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[9px] h-5 px-1.5">
                {tag}
              </Badge>
            ))}
            {food.hasPortions && (
              <Badge variant="outline" className="text-[9px] h-5 px-1.5 border-primary/30 text-primary">
                Half / Full
              </Badge>
            )}
          </div>
        </div>
      </button>
      <AddToPlateSheet food={food} open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
