import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";

export type UserRole = "student" | "staff" | null;

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone?: string;
  dietaryPreferences?: string[];
  allergies?: string[];
  calorieGoal?: number;
  bmi?: number;
  weight?: number;
  height?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  login: (id: string, password: string) => boolean;
  register: (data: RegisterData) => boolean;
  logout: () => void;
  updateProfile: (data: Partial<AuthUser>) => void;
  isLoading: boolean;
}

export interface RegisterData {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  dietaryPreferences: string[];
  allergies: string[];
  calorieGoal: number;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Role is inferred from ID prefix — no user selection needed
function inferRole(id: string): UserRole {
  const upper = id.toUpperCase();
  if (upper.startsWith("STAFF-") || upper.startsWith("KIT-") || upper.startsWith("ST-")) return "staff";
  return "student";
}

// Seeded accounts — stored in localStorage as "meal_buddy_accounts"
const SEED_ACCOUNTS: Record<string, { password: string; user: AuthUser }> = {
  "S2024-38721": {
    password: "student123",
    user: {
      id: "S2024-38721",
      name: "Achieng Otieno",
      role: "student",
      email: "s2024-38721@strathmore.edu",
      phone: "+254712345678",
      dietaryPreferences: ["Halal", "High Protein"],
      allergies: ["Shellfish"],
      calorieGoal: 2000,
      bmi: 22.4,
      weight: 58,
      height: 165,
    },
  },
  "STAFF-001": {
    password: "staff123",
    user: {
      id: "STAFF-001",
      name: "Wanjiku Mwangi",
      role: "staff",
      email: "staff-001@strathmore.edu",
      phone: "+254722000001",
      dietaryPreferences: [],
      allergies: [],
      calorieGoal: 2000,
    },
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("meal_buddy_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AuthUser;
        setUser(parsed);
        redirectByRole(parsed.role);
      } catch {
        localStorage.removeItem("meal_buddy_user");
      }
    }
    setIsLoading(false);
  }, []);

  const redirectByRole = (role: UserRole) => {
    if (role === "staff") router.push("/kitchen");
    else router.push("/");
  };

  const getAccounts = (): Record<string, { password: string; user: AuthUser }> => {
    try {
      const stored = localStorage.getItem("meal_buddy_accounts");
      if (stored) return { ...SEED_ACCOUNTS, ...JSON.parse(stored) };
    } catch {}
    return SEED_ACCOUNTS;
  };

  const login = (id: string, password: string): boolean => {
    const accounts = getAccounts();
    const account = accounts[id.toUpperCase()] ?? accounts[id];
    if (!account || account.password !== password) return false;
    const userData = { ...account.user, role: inferRole(id) as UserRole };
    setUser(userData);
    localStorage.setItem("meal_buddy_user", JSON.stringify(userData));
    redirectByRole(userData.role);
    return true;
  };

  const register = (data: RegisterData): boolean => {
    const accounts = getAccounts();
    if (accounts[data.id]) return false; // ID already exists
    const newUser: AuthUser = {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: inferRole(data.id),
      dietaryPreferences: data.dietaryPreferences,
      allergies: data.allergies,
      calorieGoal: data.calorieGoal,
      bmi: undefined,
      weight: undefined,
      height: undefined,
    };
    const newAccount = { password: data.password, user: newUser };
    // Save to localStorage accounts (excluding seed accounts)
    const stored: Record<string, { password: string; user: AuthUser }> = {};
    try {
      const existing = localStorage.getItem("meal_buddy_accounts");
      if (existing) Object.assign(stored, JSON.parse(existing));
    } catch {}
    stored[data.id] = newAccount;
    localStorage.setItem("meal_buddy_accounts", JSON.stringify(stored));
    setUser(newUser);
    localStorage.setItem("meal_buddy_user", JSON.stringify(newUser));
    redirectByRole(newUser.role);
    return true;
  };

  const updateProfile = (data: Partial<AuthUser>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem("meal_buddy_user", JSON.stringify(updated));
    // Update in accounts too
    const stored: Record<string, { password: string; user: AuthUser }> = {};
    try {
      const existing = localStorage.getItem("meal_buddy_accounts");
      if (existing) Object.assign(stored, JSON.parse(existing));
    } catch {}
    if (stored[user.id]) {
      stored[user.id].user = updated;
      localStorage.setItem("meal_buddy_accounts", JSON.stringify(stored));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("meal_buddy_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role ?? null, login, register, logout, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
