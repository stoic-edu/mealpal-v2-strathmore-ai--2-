import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { User, Ruler, Weight, Heart, AlertTriangle, CreditCard, Settings, LogOut, ChevronRight, Sparkles, Check, Wallet, Smartphone, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { HealthRing } from "@/components/HealthRing";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { currentStudent, healthRecs } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const DIETARY_TAGS = ["Halal", "Vegetarian", "Vegan", "High Protein", "Low Carb", "Gluten-Free", "Dairy-Free", "Spicy"];
const ALLERGY_OPTIONS = ["Peanuts", "Shellfish", "Dairy", "Gluten", "Soy", "Eggs", "Tree Nuts"];

const PAYMENT_METHODS = [
  { id: "mpesa", label: "M-Pesa", detail: "+254 7•• •••289", icon: Smartphone },
  { id: "wallet", label: "Campus Wallet", detail: "Balance: KES 4,500", icon: Wallet },
  { id: "card", label: "Visa Card", detail: "•••• 4242", icon: CreditCard },
];

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [dietaryOpen, setDietaryOpen] = useState(false);

  const [defaultPayment, setDefaultPayment] = useState("mpesa");
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>(currentStudent.dietaryPreferences);
  const [allergies, setAllergies] = useState<string[]>(currentStudent.allergies);

  useEffect(() => {
    const savedPayment = localStorage.getItem("mealpal_default_payment");
    const savedDietary = localStorage.getItem("mealpal_dietary_prefs");
    const savedAllergies = localStorage.getItem("mealpal_allergies");
    if (savedPayment) setDefaultPayment(savedPayment);
    if (savedDietary) setDietaryPrefs(JSON.parse(savedDietary));
    if (savedAllergies) setAllergies(JSON.parse(savedAllergies));
  }, []);

  const handleSignOut = () => {
    setLoading(true);
    setTimeout(() => {
      logout();
      toast({ title: "Signed out", description: "See you next time!" });
    }, 500);
  };

  const handleSavePayment = () => {
    localStorage.setItem("mealpal_default_payment", defaultPayment);
    setPaymentOpen(false);
    const method = PAYMENT_METHODS.find((p) => p.id === defaultPayment);
    toast({ title: "Payment method updated", description: `${method?.label} is now your default.` });
  };

  const toggleDietary = (tag: string) => {
    setDietaryPrefs((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const toggleAllergy = (tag: string) => {
    setAllergies((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSaveDietary = () => {
    localStorage.setItem("mealpal_dietary_prefs", JSON.stringify(dietaryPrefs));
    localStorage.setItem("mealpal_allergies", JSON.stringify(allergies));
    setDietaryOpen(false);
    toast({ title: "Preferences saved", description: "Meal recommendations will reflect your changes." });
  };

  const handleSettingsClick = () => {
    toast({ title: "Settings", description: "More settings coming soon." });
  };

  const bmiStatus = currentStudent.bmi < 18.5 ? "Underweight" : currentStudent.bmi < 25 ? "Healthy" : "Overweight";
  const bmiColor = currentStudent.bmi < 25 ? "text-primary" : "text-chart-3";
  const caloriePercent = Math.min((currentStudent.caloriesToday / currentStudent.calorieGoal) * 100, 100);

  const menuItems = [
    { icon: CreditCard, label: "Payment Methods", action: () => setPaymentOpen(true) },
    { icon: Heart, label: "Dietary Preferences", action: () => setDietaryOpen(true) },
    { icon: Settings, label: "Settings", action: handleSettingsClick },
  ];

  return (
    <div className="p-4 md:p-6 lg:px-10 lg:py-8 space-y-6 animate-fade-in max-w-2xl mx-auto w-full">
      {/* Profile Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-xl font-serif font-bold text-primary">
            {currentStudent.name.split(" ").map((n) => n[0]).join("")}
          </span>
        </div>
        <div>
          <h1 className="text-lg font-serif font-bold text-foreground">{currentStudent.name}</h1>
          <p className="text-sm text-muted-foreground">{currentStudent.studentId}</p>
          <Badge variant="outline" className="mt-1 text-[10px] h-5 border-primary/30 text-primary">
            Student
          </Badge>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-4 border border-primary/10">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Today's Health Summary</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-3 text-center">
            <HealthRing score={Math.round(caloriePercent)} size={48} strokeWidth={4} label="Calories" />
            <p className="text-[10px] font-medium text-foreground mt-1">{currentStudent.caloriesToday} kcal</p>
            <p className="text-[10px] text-muted-foreground">of {currentStudent.calorieGoal} goal</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center">
            <HealthRing
              score={Math.min(100, Math.round((currentStudent.dailyBudget / 500) * 100))}
              size={48}
              strokeWidth={4}
              label="Budget"
            />
            <p className="text-[10px] font-medium text-foreground mt-1">KES {currentStudent.dailyBudget}</p>
            <p className="text-[10px] text-muted-foreground">daily budget</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center">
            <HealthRing
              score={Math.min(100, Math.round(((currentStudent.calorieGoal - currentStudent.caloriesToday) / currentStudent.calorieGoal) * 100))}
              size={48}
              strokeWidth={4}
              label="Remaining"
            />
            <p className="text-[10px] font-medium text-foreground mt-1">{currentStudent.calorieGoal - currentStudent.caloriesToday} kcal</p>
            <p className="text-[10px] text-muted-foreground">remaining</p>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Suggested spend for remaining meals</span>
            <span className="font-semibold text-primary">KES {healthRecs.spendingRecommendation}</span>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
            <span className="text-xs text-muted-foreground">Consider avoiding: {healthRecs.foodsToAvoid.join(", ")} — high sugar/fat relative to your goal</span>
          </div>
          <div className="flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <span className="text-xs text-muted-foreground">Top picks today: {healthRecs.topRecommendations.join(", ")}</span>
          </div>
        </div>
      </div>

      {/* Health Stats */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Health Profile</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Ruler className="w-3.5 h-3.5" />
              <span className="text-[10px]">Height</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{currentStudent.height} cm</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Weight className="w-3.5 h-3.5" />
              <span className="text-[10px]">Weight</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{currentStudent.weight} kg</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Heart className="w-3.5 h-3.5" />
              <span className="text-[10px]">BMI</span>
            </div>
            <span className={`text-sm font-semibold ${bmiColor}`}>
              {currentStudent.bmi} <span className="text-[10px] font-normal">({bmiStatus})</span>
            </span>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Daily Calorie Goal</span>
            <span className="font-medium text-foreground">{currentStudent.caloriesToday} / {currentStudent.calorieGoal}</span>
          </div>
          <Progress value={caloriePercent} className="h-2" />
        </div>
        <button
          onClick={() => router.push("/calculator")}
          className="w-full flex items-center justify-between text-xs text-primary font-medium mt-1 py-1.5"
        >
          <span className="flex items-center gap-1.5"><Calculator className="w-3.5 h-3.5" /> Recalculate my calorie goal</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dietary Preferences & Allergies (live) */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Dietary Preferences</h2>
        <div className="flex gap-2 flex-wrap">
          {dietaryPrefs.length === 0 ? (
            <span className="text-xs text-muted-foreground">None set</span>
          ) : (
            dietaryPrefs.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs border-primary/30 text-primary">
                {tag}
              </Badge>
            ))
          )}
        </div>
      </div>

      <div className="bg-destructive/5 rounded-xl border border-destructive/10 p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <h2 className="text-sm font-semibold text-foreground">Allergies</h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          {allergies.length === 0 ? (
            <span className="text-xs text-muted-foreground">None set</span>
          ) : (
            allergies.map((allergy) => (
              <Badge key={allergy} variant="outline" className="text-xs border-destructive/30 text-destructive">
                {allergy}
              </Badge>
            ))
          )}
        </div>
      </div>

      {/* Menu */}
      <div className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:bg-muted transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          );
        })}
      </div>

      <Button
        variant="outline"
        className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 h-12 rounded-xl"
        onClick={handleSignOut}
        disabled={loading}
      >
        <LogOut className="w-4 h-4 mr-2" />
        {loading ? "Signing out..." : "Sign Out"}
      </Button>

      {/* Payment Methods Dialog */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif">Payment Methods</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              const isSelected = defaultPayment === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => setDefaultPayment(method.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl border-2 transition-colors text-left",
                    isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", isSelected ? "bg-primary/15" : "bg-muted")}>
                      <Icon className={cn("w-4.5 h-4.5", isSelected ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{method.label}</p>
                      <p className="text-xs text-muted-foreground">{method.detail}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
          <Button onClick={handleSavePayment} className="w-full h-11 rounded-xl mt-2">
            Save as Default
          </Button>
        </DialogContent>
      </Dialog>

      {/* Dietary Preferences Dialog */}
      <Dialog open={dietaryOpen} onOpenChange={setDietaryOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif">Dietary Preferences</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Preferences</h4>
              <div className="flex flex-wrap gap-2">
                {DIETARY_TAGS.map((tag) => (
                  <Badge
                    key={tag}
                    variant={dietaryPrefs.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer text-xs h-7 px-3"
                    onClick={() => toggleDietary(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Allergies</h4>
              <div className="flex flex-wrap gap-2">
                {ALLERGY_OPTIONS.map((tag) => (
                  <Badge
                    key={tag}
                    variant={allergies.includes(tag) ? "destructive" : "outline"}
                    className="cursor-pointer text-xs h-7 px-3"
                    onClick={() => toggleAllergy(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <Button onClick={handleSaveDietary} className="w-full h-11 rounded-xl mt-2">
            Save Preferences
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
