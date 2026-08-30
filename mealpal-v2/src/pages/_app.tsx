import { useEffect } from "react";
import { useRouter } from "next/router";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { PlateProvider } from "@/contexts/PlateContext";
import { AppShell } from "@/components/AppShell";
import { Toaster } from "@/components/ui/toaster";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const publicPaths = ["/login", "/404"];

  useEffect(() => {
    if (isLoading) return;
    if (!user && !publicPaths.includes(router.pathname)) {
      router.push("/login");
    }
    if (user && router.pathname === "/login") {
      router.push(user.role === "staff" ? "/kitchen" : "/");
    }
  }, [user, isLoading, router.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <RouteGuard>
          <PlateProvider>
            <AppShell>
              <Component {...pageProps} />
              <Toaster />
            </AppShell>
          </PlateProvider>
        </RouteGuard>
      </AuthProvider>
    </ThemeProvider>
  );
}
