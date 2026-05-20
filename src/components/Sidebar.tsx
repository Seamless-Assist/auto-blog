"use strict";
import React, { useState } from "react";
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  PenTool, 
  Calendar, 
  BarChart2, 
  Settings, 
  LogOut,
  ChevronDown,
  ChevronRight,
  Globe,
  Share2,
  Mail,
  TrendingUp,
  Layers
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onLogout }: SidebarProps) {
  const [seoOpen, setSeoOpen] = useState(true);

  const seoItems = [
    { id: "dashboard", label: "Scout Dashboard", icon: LayoutDashboard },
    { id: "topics", label: "Topic Planner", icon: FileText },
    { id: "briefs", label: "Brief Reviewer", icon: CheckSquare },
    { id: "drafts", label: "Draft Creator", icon: PenTool },
    { id: "scheduler", label: "WP Scheduler", icon: Calendar },
    { id: "performance", label: "GSC Performance", icon: BarChart2 },
  ];

  return (
    <aside className="sidebar" style={{ display: "flex", flexDirection: "column", height: "100vh", overflowY: "auto" }}>
      <div style={{ padding: "16px 18px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid var(--border-color)" }}>
        <div style={{ 
          width: "36px", 
          height: "36px", 
          borderRadius: "10px", 
          background: "linear-gradient(135deg, var(--primary-maroon), var(--accent-gold))", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          fontWeight: "800",
          fontSize: "18px",
          color: "#fff",
          boxShadow: "0 2px 8px rgba(93, 28, 52, 0.4)"
        }}>
          SA
        </div>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#fff", lineHeight: "1.1" }}>Seamless Assist</h2>
          <span style={{ fontSize: "11px", color: "var(--accent-gold)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Marketing Hub
          </span>
        </div>
      </div>

      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px", padding: "0 8px" }}>
        {/* Top-Level Bird's Eye View Dashboard */}
        <div>
          <div
            className={`nav-item ${activeTab === "main_dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("main_dashboard")}
            style={{ borderRadius: "8px", padding: "10px 14px" }}
          >
            <Layers size={20} style={{ color: activeTab === "main_dashboard" ? "var(--accent-gold)" : "inherit" }} />
            <span style={{ fontWeight: "700" }}>Hub Dashboard</span>
          </div>
        </div>

        {/* SEO & Blogs Collapsible Dropdown */}
        <div>
          <div 
            style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              padding: "8px 14px", 
              cursor: "pointer",
              color: "var(--text-muted)",
              fontSize: "12px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}
            onClick={() => setSeoOpen(!seoOpen)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Globe size={16} style={{ color: "var(--accent-gold)" }} />
              <span>SEO & Blogs Scout</span>
            </div>
            {seoOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>

          {seoOpen && (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "4px", paddingLeft: "12px", borderLeft: "1px solid rgba(237, 228, 217, 0.1)", marginLeft: "20px" }}>
              {seoItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <div
                    key={item.id}
                    className={`nav-item ${isActive ? "active" : ""}`}
                    onClick={() => setActiveTab(item.id)}
                    style={{ padding: "8px 12px", fontSize: "14px", borderRadius: "8px" }}
                  >
                    <IconComponent size={18} style={{ color: isActive ? "var(--accent-gold)" : "var(--text-muted)" }} />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Future Marketing Modules Scouts */}
        <div>
          <div 
            style={{ 
              padding: "8px 14px", 
              color: "var(--text-muted)",
              fontSize: "12px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "4px"
            }}
          >
            Upcoming Scouts
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div className="nav-item" style={{ opacity: 0.5, cursor: "not-allowed", padding: "8px 14px", fontSize: "14px" }}>
              <Share2 size={18} />
              <span>Social Media Scout</span>
              <span style={{ marginLeft: "auto", fontSize: "9px", background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "10px" }}>Q3</span>
            </div>
            <div className="nav-item" style={{ opacity: 0.5, cursor: "not-allowed", padding: "8px 14px", fontSize: "14px" }}>
              <Mail size={18} />
              <span>Email Engine Scout</span>
              <span style={{ marginLeft: "auto", fontSize: "9px", background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "10px" }}>Q4</span>
            </div>
            <div className="nav-item" style={{ opacity: 0.5, cursor: "not-allowed", padding: "8px 14px", fontSize: "14px" }}>
              <TrendingUp size={18} />
              <span>Paid Ads Scout</span>
              <span style={{ marginLeft: "auto", fontSize: "9px", background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "10px" }}>2027</span>
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div style={{ marginTop: "20px" }}>
          <div
            className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
            style={{ borderRadius: "8px", padding: "10px 14px" }}
          >
            <Settings size={20} style={{ color: activeTab === "settings" ? "var(--accent-gold)" : "inherit" }} />
            <span style={{ fontWeight: "700" }}>Integrations</span>
          </div>
        </div>
      </nav>

      <div style={{ marginTop: "auto", borderTop: "1px solid var(--border-color)", padding: "20px 16px" }}>
        <div 
          className="nav-item" 
          style={{ color: "var(--error-red)", cursor: "pointer", padding: "10px 14px", borderRadius: "8px" }} 
          onClick={onLogout}
        >
          <LogOut size={20} />
          <span style={{ fontWeight: "700" }}>Log Out</span>
        </div>
      </div>
    </aside>
  );
}
