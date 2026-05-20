"use strict";
import React from "react";
import { 
  Globe, 
  Share2, 
  Mail, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  ArrowUpRight, 
  Clock, 
  Layers 
} from "lucide-react";

interface MarketingHubDashboardProps {
  onNavigateToScout: (tab: string) => void;
}

export default function MarketingHubDashboard({ onNavigateToScout }: MarketingHubDashboardProps) {
  return (
    <div className="animate-slide-in">
      {/* Dashboard Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ padding: "4px 10px", background: "var(--bg-surface-hover)", border: "1px solid var(--accent-gold)", borderRadius: "20px", fontSize: "11px", fontWeight: "700", color: "var(--accent-gold)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Enterprise Marketing Hub
            </span>
          </div>
          <h1 style={{ fontSize: "32px", color: "var(--primary-maroon)", fontWeight: "800", marginBottom: "6px" }}>
            Marketing Hub Overview
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
            Bird's-eye executive command center monitoring all autonomous marketing engines and AI scouts.
          </p>
        </div>
        <div style={{ background: "var(--bg-surface-hover)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "10px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
          <Sparkles size={20} style={{ color: "var(--success-green)" }} />
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", display: "block", fontWeight: "700" }}>System Status</span>
            <span style={{ fontSize: "13px", color: "var(--primary-maroon)", fontWeight: "700" }}>Autonomous Hub Active</span>
          </div>
        </div>
      </div>

      {/* High-Level Executive Metrics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "36px" }}>
        <div className="glass-panel" style={{ padding: "24px", borderLeft: "4px solid var(--success-green)" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700", display: "block", marginBottom: "8px" }}>Active AI Scouts</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <h2 style={{ fontSize: "32px", color: "var(--primary-maroon)", fontWeight: "800", margin: 0 }}>1 / 4</h2>
            <span style={{ fontSize: "12px", color: "var(--success-green)", fontWeight: "700" }}>● SEO & Blogs Online</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "24px", borderLeft: "4px solid var(--accent-gold)" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700", display: "block", marginBottom: "8px" }}>Monthly Traffic Value</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <h2 style={{ fontSize: "32px", color: "var(--primary-maroon)", fontWeight: "800", margin: 0 }}>$4,850</h2>
            <span style={{ fontSize: "12px", color: "var(--success-green)", fontWeight: "700" }}>+24% vs last mo</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "24px", borderLeft: "4px solid var(--warning-gold)" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700", display: "block", marginBottom: "8px" }}>Total Autonomous Content</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <h2 style={{ fontSize: "32px", color: "var(--primary-maroon)", fontWeight: "800", margin: 0 }}>28 Assets</h2>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Across all pipelines</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "24px", borderLeft: "4px solid var(--primary-maroon)" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700", display: "block", marginBottom: "8px" }}>Next Calculated Window</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <h2 style={{ fontSize: "24px", color: "var(--primary-maroon)", fontWeight: "800", margin: 0 }}>Thu 9:00am PT</h2>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: "20px", color: "var(--primary-maroon)", fontWeight: "800", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
        <Layers size={22} style={{ color: "var(--accent-gold)" }} />
        <span>Marketing Engines & Scouts Architecture</span>
      </h2>

      {/* Marketing Hub Modules Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "24px" }}>
        
        {/* 1. SEO & Blogs Scout (ACTIVE) */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", border: "1px solid var(--accent-gold)", background: "var(--bg-surface-hover)" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ padding: "12px", background: "rgba(212, 175, 55, 0.15)", borderRadius: "10px", color: "var(--accent-gold)" }}>
                  <Globe size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: "20px", color: "var(--primary-maroon)", fontWeight: "800", marginBottom: "2px" }}>SEO & Blogs Scout</h3>
                  <span style={{ fontSize: "12px", color: "var(--success-green)", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                    <CheckCircle2 size={12} />
                    <span>Active & Syncing Live</span>
                  </span>
                </div>
              </div>
              <span className="badge badge-approved" style={{ fontSize: "11px" }}>Production Ready</span>
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6", marginBottom: "20px" }}>
              Full autonomous SEO engine that discovers low-competition topics, drafts Yoast-verified masterclasses, and synchronizes directly to WordPress staging.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px", fontSize: "13px", background: "#FFFFFF", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px", textTransform: "uppercase", fontWeight: "700" }}>Topic Ideas</span>
                <span style={{ color: "var(--primary-maroon)", fontWeight: "700", fontSize: "15px" }}>24 Discovered</span>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px", textTransform: "uppercase", fontWeight: "700" }}>Validation Rate</span>
                <span style={{ color: "var(--success-green)", fontWeight: "700", fontSize: "15px" }}>100% Passed</span>
              </div>
            </div>
          </div>
          <button 
            className="btn btn-primary" 
            style={{ width: "100%", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            onClick={() => onNavigateToScout("dashboard")}
          >
            <span>Launch SEO & Blogs Scout</span>
            <ArrowUpRight size={16} />
          </button>
        </div>

        {/* 2. Social Media AI Scout (UPCOMING) */}
        <div className="glass-panel" style={{ opacity: 0.85, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ padding: "12px", background: "rgba(100, 100, 100, 0.1)", borderRadius: "10px", color: "var(--text-muted)" }}>
                  <Share2 size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: "20px", color: "var(--primary-maroon)", fontWeight: "800", marginBottom: "2px" }}>Social Media Scout</h3>
                  <span style={{ fontSize: "12px", color: "var(--warning-gold)", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={12} />
                    <span>In Development</span>
                  </span>
                </div>
              </div>
              <span className="badge badge-pending" style={{ fontSize: "11px" }}>Coming Q3</span>
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6", marginBottom: "20px" }}>
              Autonomous LinkedIn, Instagram, and Twitter scout that repurposes blog masterclasses into carousel graphics, video scripts, and viral threads.
            </p>
            <div style={{ background: "var(--bg-surface-hover)", border: "1px dashed var(--border-color)", padding: "16px", borderRadius: "10px", fontSize: "12px", color: "var(--text-muted)", marginBottom: "24px" }}>
              💡 <strong>Integration Roadmap:</strong> Will connect directly with Buffer & Meta Business Suite to schedule weekly operational transformation posts.
            </div>
          </div>
          <button className="btn btn-secondary" style={{ width: "100%", padding: "12px" }} disabled>
            <span>Feature Scheduled for Q3 Release</span>
          </button>
        </div>

        {/* 3. Email Automation Scout (UPCOMING) */}
        <div className="glass-panel" style={{ opacity: 0.85, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ padding: "12px", background: "rgba(100, 100, 100, 0.1)", borderRadius: "10px", color: "var(--text-muted)" }}>
                  <Mail size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: "20px", color: "var(--primary-maroon)", fontWeight: "800", marginBottom: "2px" }}>Email Marketing Scout</h3>
                  <span style={{ fontSize: "12px", color: "var(--warning-gold)", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={12} />
                    <span>In Development</span>
                  </span>
                </div>
              </div>
              <span className="badge badge-pending" style={{ fontSize: "11px" }}>Coming Q4</span>
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6", marginBottom: "20px" }}>
              Intelligent email newsletter engine that curates weekly operational insights, automation workflows, and re-engagement sequences for client databases.
            </p>
            <div style={{ background: "var(--bg-surface-hover)", border: "1px dashed var(--border-color)", padding: "16px", borderRadius: "10px", fontSize: "12px", color: "var(--text-muted)", marginBottom: "24px" }}>
              💡 <strong>Integration Roadmap:</strong> Native sync with ActiveCampaign, Mailchimp, and Klaviyo for seamless client lifecycle tagging.
            </div>
          </div>
          <button className="btn btn-secondary" style={{ width: "100%", padding: "12px" }} disabled>
            <span>Feature Scheduled for Q4 Release</span>
          </button>
        </div>

        {/* 4. Paid Ads Scout (UPCOMING) */}
        <div className="glass-panel" style={{ opacity: 0.85, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ padding: "12px", background: "rgba(100, 100, 100, 0.1)", borderRadius: "10px", color: "var(--text-muted)" }}>
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: "20px", color: "var(--primary-maroon)", fontWeight: "800", marginBottom: "2px" }}>Paid Ads AI Scout</h3>
                  <span style={{ fontSize: "12px", color: "var(--warning-gold)", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={12} />
                    <span>In Architecture Phase</span>
                  </span>
                </div>
              </div>
              <span className="badge badge-pending" style={{ fontSize: "11px" }}>Coming 2027</span>
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6", marginBottom: "20px" }}>
              Autonomous ad scout analyzing Google Ads search intent and Meta Ads copy performance to optimize lead acquisition cost for real estate and local businesses.
            </p>
            <div style={{ background: "var(--bg-surface-hover)", border: "1px dashed var(--border-color)", padding: "16px", borderRadius: "10px", fontSize: "12px", color: "var(--text-muted)", marginBottom: "24px" }}>
              💡 <strong>Integration Roadmap:</strong> Google Ads API and Facebook Ads Manager bid optimization loops.
            </div>
          </div>
          <button className="btn btn-secondary" style={{ width: "100%", padding: "12px" }} disabled>
            <span>Feature Scheduled for 2027 Release</span>
          </button>
        </div>

      </div>
    </div>
  );
}
