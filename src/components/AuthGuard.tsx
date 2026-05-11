"use client";

import { useAuth } from "./AuthProvider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { AiChat } from "./AiChat";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublicPage = pathname === "/login" || pathname === "/pricing";

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublicPage) {
      router.replace("/login");
    }
    if (user && pathname === "/login") {
      router.replace("/");
    }
  }, [user, loading, isPublicPage, pathname, router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-light text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  // Public pages without auth — render without sidebar
  if (isPublicPage && !user) {
    return <>{children}</>;
  }

  // Not authenticated — show nothing while redirecting
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Authenticated — full dashboard layout
  return (
    <>
      <Sidebar />
      <main className="flex-1 lg:ml-64 min-h-screen">{children}</main>
      <AiChat />
    </>
  );
}
