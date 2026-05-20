"use client";

import React, { useEffect, useState, ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import LoginView from "@/components/LoginView";
import { Toaster } from "react-hot-toast";
import { usePathname, useRouter } from "next/navigation";

export default function ClientAppLayout({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const checkSession = async () => {
    try {
      const res = await fetch("/api/auth/user");
      const data = await res.json();
      if (res.ok && data.authenticated) {
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
      }
    } catch (e) {
      setAuthenticated(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setAuthenticated(false);
      router.push("/");
    } catch (e) {
      console.error(e);
    }
  };

  if (authenticated === null) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#120d0f" }}>
        <span className="spinner" style={{ width: "36px", height: "36px", marginBottom: "12px" }}></span>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", fontFamily: "Outfit, sans-serif" }}>Unlocking Secure Console Session...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <>
        <Toaster position="top-right" toastOptions={{ style: { background: "#1e1417", color: "#fff", border: "1px solid rgba(237,228,217,0.15)" } }} />
        <LoginView onLoginSuccess={() => setAuthenticated(true)} />
      </>
    );
  }

  let activeTab = "main_dashboard";
  if (pathname === "/scout") activeTab = "dashboard";
  if (pathname === "/topics") activeTab = "topics";
  if (pathname === "/briefs") activeTab = "briefs";
  if (pathname === "/drafts") activeTab = "drafts";
  if (pathname === "/scheduler") activeTab = "scheduler";
  if (pathname === "/performance") activeTab = "performance";
  if (pathname === "/settings") activeTab = "settings";

  const handleNavigate = (tab: string) => {
    if (tab === "main_dashboard") router.push("/");
    else if (tab === "dashboard") router.push("/scout");
    else router.push(`/${tab}`);
  };

  return (
    <div className="app-layout">
      <Toaster position="top-right" toastOptions={{ style: { background: "#1e1417", color: "#fff", border: "1px solid rgba(237,228,217,0.15)" } }} />
      <Sidebar activeTab={activeTab} setActiveTab={handleNavigate} onLogout={handleLogout} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
