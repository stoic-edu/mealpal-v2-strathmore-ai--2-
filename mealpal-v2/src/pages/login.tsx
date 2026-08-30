import { useState } from "react";
import { Eye, EyeOff, ArrowRight, ArrowLeft, Check } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, type RegisterData } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const DIETARY_OPTIONS = ["Halal", "Vegetarian", "Vegan", "High Protein", "Low Carb", "Gluten-Free", "Dairy-Free"];
const ALLERGY_OPTIONS = ["Peanuts", "Shellfish", "Dairy", "Gluten", "Soy", "Eggs", "Tree Nuts", "None"];

type Screen = "login" | "register-1" | "register-2";

export default function LoginPage() {
  const { login, register } = useAuth();
  const [screen, setScreen] = useState<Screen>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Login fields
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register step 1 fields
  const [regId, setRegId] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  // Register step 2 fields
  const [dietary, setDietary] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [calorieGoal, setCalorieGoal] = useState("2000");

  const handleLogin = () => {
    setError("");
    if (!loginId.trim() || !loginPassword.trim()) {
      setError("Please enter both ID and password");
      return;
    }
    setIsLoading(true);
    const success = login(loginId.trim(), loginPassword);
    if (!success) setError("Invalid ID or password. Check the demo accounts below.");
    setIsLoading(false);
  };

  const handleRegisterStep1 = () => {
    setError("");
    if (!regId.trim() || !regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword.trim()) {
      setError("Please fill in all fields");
      return;
    }
    if (regPassword !== regConfirm) {
      setError("Passwords do not match");
      return;
    }
    if (regPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError("");
    setScreen("register-2");
  };

  const handleRegisterStep2 = () => {
    setError("");
    setIsLoading(true);
    const data: RegisterData = {
      id: regId.trim(),
      name: regName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      password: regPassword,
      dietaryPreferences: dietary,
      allergies: allergies.filter((a) => a !== "None"),
      calorieGoal: parseInt(calorieGoal) || 2000,
    };
    const success = register(data);
    if (!success) setError("That ID is already registered. Please sign in.");
    setIsLoading(false);
  };

  const toggleDietary = (tag: string) =>
    setDietary((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  const toggleAllergy = (tag: string) => {
    if (tag === "None") { setAllergies(["None"]); return; }
    setAllergies((prev) => {
      const without = prev.filter((a) => a !== "None");
      return without.includes(tag) ? without.filter((a) => a !== tag) : [...without, tag];
    });
  };

  return (
    <div className="min-h-screen bg-background pattern-kanga flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-5">

        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-border bg-card mx-auto flex items-center justify-center shadow-lg shadow-primary/20">
            <Image
              src="/Strathmore Cafeteria Crest.png"
              alt="Strathmore Cafeteria Crest"
              width={56}
              height={56}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Meal Buddy</h1>
          <p className="text-sm text-muted-foreground">Strathmore University Cafeteria</p>
        </div>

        {/* ── LOGIN SCREEN ── */}
        {screen === "login" && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Student / Staff ID</label>
                <Input
                  placeholder="e.g. S2024-38721 or STAFF-001"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="h-12 rounded-xl bg-card border-border"
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="h-12 rounded-xl bg-card border-border pr-12"
                    autoComplete="current-password"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-2.5">{error}</p>}

            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold"
            >
              {isLoading ? "Signing in…" : "Sign In"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <button
              onClick={() => { setScreen("register-1"); setError(""); }}
              className="w-full text-center text-sm text-primary font-medium hover:underline"
            >
              Don't have an account? Create one
            </button>

            {/* Demo accounts */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-foreground mb-2">Demo Accounts</p>
              <button
                onClick={() => { setLoginId("S2024-38721"); setLoginPassword("student123"); setError(""); }}
                className="w-full text-left text-xs bg-card rounded-lg px-3 py-2 border border-border hover:border-primary/30"
              >
                <span className="font-medium">Student:</span> S2024-38721 / student123
              </button>
              <button
                onClick={() => { setLoginId("STAFF-001"); setLoginPassword("staff123"); setError(""); }}
                className="w-full text-left text-xs bg-card rounded-lg px-3 py-2 border border-border hover:border-primary/30"
              >
                <span className="font-medium">Staff:</span> STAFF-001 / staff123
              </button>
            </div>
          </div>
        )}

        {/* ── REGISTER STEP 1: Account Details ── */}
        {screen === "register-1" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => { setScreen("login"); setError(""); }} className="p-1.5 rounded-full hover:bg-muted">
                <ArrowLeft className="w-4 h-4 text-foreground" />
              </button>
              <div>
                <h2 className="font-serif font-bold text-foreground">Create Account</h2>
                <p className="text-xs text-muted-foreground">Step 1 of 2 — Your details</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Student / Staff ID</label>
                <Input
                  placeholder="e.g. S2024-12345"
                  value={regId}
                  onChange={(e) => setRegId(e.target.value)}
                  className="h-11 rounded-xl bg-card border-border"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Staff IDs start with STAFF- and are routed to the kitchen display automatically.</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name</label>
                <Input placeholder="e.g. Achieng Otieno" value={regName} onChange={(e) => setRegName(e.target.value)} className="h-11 rounded-xl bg-card border-border" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                <Input placeholder="yourname@strathmore.edu" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="h-11 rounded-xl bg-card border-border" autoComplete="email" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone Number</label>
                <Input placeholder="+254 7XX XXX XXX" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} className="h-11 rounded-xl bg-card border-border" autoComplete="tel" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="h-11 rounded-xl bg-card border-border pr-12"
                  />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="Repeat password"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRegisterStep1()}
                  className="h-11 rounded-xl bg-card border-border"
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-2.5">{error}</p>}

            <Button onClick={handleRegisterStep1} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold">
              Next — Health Profile
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* ── REGISTER STEP 2: Health & Dietary Profile ── */}
        {screen === "register-2" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => { setScreen("register-1"); setError(""); }} className="p-1.5 rounded-full hover:bg-muted">
                <ArrowLeft className="w-4 h-4 text-foreground" />
              </button>
              <div>
                <h2 className="font-serif font-bold text-foreground">Health Profile</h2>
                <p className="text-xs text-muted-foreground">Step 2 of 2 — Dietary preferences</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-2 block">Dietary Preferences</label>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleDietary(tag)}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-full border font-medium transition-colors",
                        dietary.includes(tag) ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/40"
                      )}
                    >
                      {dietary.includes(tag) && <Check className="w-3 h-3 inline mr-1" />}
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-2 block">Allergies</label>
                <div className="flex flex-wrap gap-2">
                  {ALLERGY_OPTIONS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleAllergy(tag)}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-full border font-medium transition-colors",
                        allergies.includes(tag) ? "bg-destructive/20 text-destructive border-destructive/40" : "bg-card text-muted-foreground border-border hover:border-destructive/30"
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Daily Calorie Goal</label>
                <Input
                  type="number"
                  placeholder="2000"
                  value={calorieGoal}
                  onChange={(e) => setCalorieGoal(e.target.value)}
                  className="h-11 rounded-xl bg-card border-border"
                />
                <p className="text-[10px] text-muted-foreground mt-1">You can update this anytime in your profile.</p>
              </div>
            </div>

            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-2.5">{error}</p>}

            <Button
              onClick={handleRegisterStep2}
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold"
            >
              {isLoading ? "Creating account…" : "Create Account & Sign In"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <button
              onClick={handleRegisterStep2}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
