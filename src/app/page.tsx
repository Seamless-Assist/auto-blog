"use client";

import React from "react";
import MarketingHubDashboard from "@/components/MarketingHubDashboard";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleNavigate = (tab: string) => {
    if (tab === "main_dashboard") router.push("/");
    else if (tab === "dashboard") router.push("/scout");
    else router.push(`/${tab}`);
  };

  return <MarketingHubDashboard onNavigateToScout={handleNavigate} />;
}
