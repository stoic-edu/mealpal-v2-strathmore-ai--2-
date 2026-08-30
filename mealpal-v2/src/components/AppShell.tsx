import { useState, useRef } from "react";
import { Home, ClipboardList, User, Bell, LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { FoodChatBot } from "@/components/FoodChatBot";
import { useClickOutside } from "@/hooks/use-click-outside";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  useClickOutside(notifRef, () => setNotifOpen(false), notifOpen);
  const isLogin = router.pathname === "/login";
  const isKitchen = router.pathname === "/kitchen";

  const isMobileApp = ["/", "/cafeteria/[id]", "/orders", "/profile", "/calculator"].includes(router.pathname);

  if (isLogin || isKitchen || !user) {
    return <>{children}</>;
  }

  const studentNav = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/orders", icon: ClipboardList, label: "Orders" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  const navItems = studentNav;

  const notifications = [
    { id: 1, text: "3 people ahead of you — head to the cafeteria!", time: "2 min ago", read: false },
    { id: 2, text: "Order #MB-STU-2026-39285 confirmed", time: "15 min ago", read: false },
    { id: 3, text: "Queue at Main Cafeteria is now 8 min", time: "1 hour ago", read: true },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className={cn(
      "min-h-screen bg-background pattern-kanga flex flex-col relative"
    )}>
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 rounded-lg overflow-hidden border border-border bg-card flex items-center justify-center">
                <Image
                  src="/Strathmore Cafeteria Crest.png"
                  alt="Strathmore Cafeteria Crest"
                  width={28}
                  height={28}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <span className="font-serif font-bold text-sm text-foreground hidden sm:inline">Meal Buddy</span>
            </Link>

            {/* Desktop nav links, inline in the header */}
            {user.role === "student" && (
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = router.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ThemeSwitch />

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl hover:bg-muted transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-destructive rounded-full text-[9px] text-destructive-foreground flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-12 w-72 bg-card border border-border rounded-2xl shadow-xl z-50 p-3 space-y-2 animate-in fade-in slide-in-from-top-2">
                  <p className="text-sm font-semibold text-foreground px-1">Notifications</p>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        "p-2.5 rounded-xl text-xs",
                        n.read ? "bg-muted/50 text-muted-foreground" : "bg-primary/5 text-foreground border border-primary/10"
                      )}
                    >
                      <p className="font-medium">{n.text}</p>
                      <p className="text-muted-foreground mt-0.5">{n.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className={cn("flex-1 overflow-y-auto", isMobileApp && user.role === "student" && "pb-20 md:pb-6")}>{children}</main>

      {isMobileApp && user.role === "student" && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-50">
          <div className="flex items-center justify-around h-16 max-w-md mx-auto">
            {navItems.map((item) => {
              const isActive = router.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {user.role === "student" && <FoodChatBot />}
    </div>
  );
}
