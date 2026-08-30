import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { UtensilsCrossed, X, Plus, Minus, Trash2, Wallet, Smartphone, CreditCard, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePlate } from "@/contexts/PlateContext";
import { createOrderFromPlate, addOrder } from "@/lib/orders";
import { getServingsFor, formatPortionLabel } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const paymentMethods = [
  { id: "wallet", label: "Campus Wallet", icon: Wallet, hint: "Balance KES 4,250" },
  { id: "mpesa", label: "M-Pesa", icon: Smartphone, hint: "STK push to your phone" },
  { id: "card", label: "Card", icon: CreditCard, hint: "Visa •••• 4821" },
];

export function PlateButton() {
  const { lines, cafeteria, count, total, removeLine, updateQuantity, clearPlate } = usePlate();
  const [open, setOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [placing, setPlacing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  if (count === 0 && !open) return null;

  const handleConfirm = () => {
    if (lines.length === 0 || !cafeteria) return;
    setPlacing(true);
    const order = createOrderFromPlate(lines, cafeteria, paymentMethods.find((p) => p.id === paymentMethod)!.label);
    setTimeout(() => {
      addOrder(order);
      clearPlate();
      setPlacing(false);
      setOpen(false);
      toast({
        title: "Order placed!",
        description: `Reference ${order.referenceCode} · ${order.startingPeopleAhead} people ahead of you`,
      });
      router.push("/orders");
    }, 700);
  };

  return (
    <>
      {/* Floating plate button */}
      {count > 0 && !open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 md:bottom-8 right-4 z-40 flex items-center gap-2 bg-primary text-primary-foreground pl-3 pr-4 py-3 rounded-full shadow-lg hover:bg-primary/90 transition-transform hover:scale-105 animate-in fade-in slide-in-from-bottom-3"
        >
          <div className="relative">
            <UtensilsCrossed className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[9px] font-bold flex items-center justify-center">
              {count}
            </span>
          </div>
          <span className="text-sm font-bold">KES {total.toLocaleString()}</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 animate-in fade-in duration-200" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-sm bg-card rounded-t-3xl flex flex-col animate-in slide-in-from-bottom-5 max-h-[88vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 pb-2 shrink-0">
              <div>
                <h3 className="text-base font-serif font-bold text-foreground">Your Plate</h3>
                {cafeteria && <p className="text-xs text-muted-foreground">{cafeteria}</p>}
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-full hover:bg-muted">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-2">
              {lines.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Your plate is empty</p>
              ) : (
                lines.map((line) => {
                  const servings = getServingsFor(line.food, line.portion);
                  return (
                    <div key={line.lineId} className="flex items-center gap-2.5 bg-muted/40 rounded-xl p-2">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={line.food.image} alt={line.food.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {formatPortionLabel(line.food, line.portion)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">KES {servings.price} each</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-card rounded-lg px-1.5 py-1 border border-border">
                        <button onClick={() => updateQuantity(line.lineId, line.quantity - 1)} className="p-0.5">
                          <Minus className="w-3 h-3 text-foreground" />
                        </button>
                        <span className="text-xs font-semibold w-3 text-center">{line.quantity}</span>
                        <button onClick={() => updateQuantity(line.lineId, line.quantity + 1)} className="p-0.5">
                          <Plus className="w-3 h-3 text-foreground" />
                        </button>
                      </div>
                      <button onClick={() => removeLine(line.lineId)} className="p-1.5 rounded-full hover:bg-destructive/10 shrink-0">
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {lines.length > 0 && (
              <div className="px-4 pb-2">
                <p className="text-xs font-semibold text-foreground mb-1.5 mt-1">Payment method</p>
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods.map((pm) => {
                    const Icon = pm.icon;
                    return (
                      <button
                        key={pm.id}
                        onClick={() => setPaymentMethod(pm.id)}
                        className={cn(
                          "flex flex-col items-center gap-1 py-2.5 rounded-xl border text-center transition-colors",
                          paymentMethod === pm.id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/40"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px] font-semibold leading-tight">{pm.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                  {paymentMethods.find((p) => p.id === paymentMethod)?.hint}
                </p>
              </div>
            )}

            <div className="p-4 pt-2 border-t border-border shrink-0">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-lg font-bold text-foreground">KES {total.toLocaleString()}</span>
              </div>
              <Button
                onClick={handleConfirm}
                disabled={lines.length === 0 || placing}
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold"
              >
                {placing ? (
                  "Placing order…"
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Pay & Confirm Order
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
