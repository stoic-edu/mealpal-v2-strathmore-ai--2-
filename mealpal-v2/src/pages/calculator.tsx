import { useState } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, Calculator, Info, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const activityMultipliers: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const goalAdjustments: Record<string, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

export default function CalorieCalculatorPage() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState(21);
  const [weight, setWeight] = useState(user?.weight ?? 65);
  const [height, setHeight] = useState(user?.height ?? 170);
  const [activity, setActivity] = useState("moderate");
  const [goal, setGoal] = useState("maintain");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    // Mifflin-St Jeor equation
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    bmr += gender === "male" ? 5 : -161;
    const tdee = Math.round(bmr * (activityMultipliers[activity] || 1.55));
    setResult(tdee + (goalAdjustments[goal] || 0));
  };

  const applyToProfile = () => {
    if (!result) return;
    updateProfile({ calorieGoal: result, weight, height });
    toast({ title: "Calorie goal updated", description: `Set to ${result} kcal/day on your profile.` });
    router.push("/profile");
  };

  return (
    <div className="p-4 md:p-6 lg:px-10 lg:py-8 max-w-md mx-auto w-full pb-10 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/profile")} className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-serif text-xl font-bold text-foreground">Calorie Calculator</h1>
      </div>

      <div className="bg-card rounded-2xl border border-border p-5 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <Info size={18} className="text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            We use the Mifflin-St Jeor equation to estimate your daily calorie needs from your body composition and activity level.
          </p>
        </div>

        <div className="mb-4">
          <Label className="text-xs text-muted-foreground mb-2 block">Gender</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["male", "female"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`py-2.5 rounded-lg text-sm font-medium capitalize transition-all ${
                  gender === g ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Age</Label>
            <Input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} className="text-sm" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Weight (kg)</Label>
            <Input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="text-sm" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Height (cm)</Label>
            <Input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="text-sm" />
          </div>
        </div>

        <div className="mb-4">
          <Label className="text-xs text-muted-foreground mb-2 block">Activity Level</Label>
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="sedentary">Sedentary (little/no exercise)</option>
            <option value="light">Light (1-3 days/week)</option>
            <option value="moderate">Moderate (3-5 days/week)</option>
            <option value="active">Active (6-7 days/week)</option>
            <option value="very_active">Very Active (physical job)</option>
          </select>
        </div>

        <div className="mb-4">
          <Label className="text-xs text-muted-foreground mb-2 block">Goal</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "lose", label: "Lose Weight" },
              { id: "maintain", label: "Maintain" },
              { id: "gain", label: "Gain Weight" },
            ].map((g) => (
              <button
                key={g.id}
                onClick={() => setGoal(g.id)}
                className={`py-2.5 rounded-lg text-xs font-medium transition-all ${
                  goal === g.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={calculate} className="w-full bg-accent hover:bg-accent/90 py-5 font-semibold">
          <Calculator size={16} className="mr-2" /> Calculate
        </Button>
      </div>

      {result && (
        <div className="bg-card rounded-2xl border border-border p-6 text-center mb-6">
          <p className="text-xs text-muted-foreground mb-1">Your Daily Calorie Goal</p>
          <p className="text-4xl font-bold text-primary mb-2">{result}</p>
          <p className="text-xs text-muted-foreground">calories per day</p>

          {user && (
            <Button onClick={applyToProfile} className="mt-4 w-full bg-primary hover:bg-primary/90">
              Apply to My Profile <ChevronRight size={16} className="ml-1" />
            </Button>
          )}
        </div>
      )}

      <div className="bg-muted/50 rounded-xl p-4">
        <h3 className="font-semibold text-sm text-foreground mb-2">How is this calculated?</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          We first estimate your Basal Metabolic Rate (BMR) — the calories your body needs at rest — then multiply by
          your activity level to get your Total Daily Energy Expenditure (TDEE). Finally, we adjust for your goal:
          subtract 500 for weight loss, add 300 for weight gain.
        </p>
      </div>
    </div>
  );
}
