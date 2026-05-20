"use strict";
import React, { useEffect, useState } from "react";
import { BarChart2, Save, FileText, Send, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function PerformanceView() {
  const [csvText, setCsvText] = useState("");
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchCsv = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/report");
      const data = await res.json();
      if (res.ok && data.success) {
        setCsvText(data.csv || "");
      }
    } catch (e) {
      toast.error("Failed to load performance settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCsv();
  }, []);

  const handleSaveCsv = async () => {
    setSaving(true);
    toast.loading("Saving Search Console metrics...", { id: "save_csv" });
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: csvText }),
      });
      if (res.ok) {
        toast.success("GSC metrics saved successfully!", { id: "save_csv" });
      } else {
        toast.error("Failed to save data", { id: "save_csv" });
      }
    } catch (e) {
      toast.error("Network error", { id: "save_csv" });
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!csvText.trim()) {
      toast.error("Google Search Console CSV text is required before generating the SEO report!");
      return;
    }

    setGenerating(true);
    toast.loading("AI Analyst is inspecting GSC metrics and preparing report...", { id: "gen_report" });
    try {
      const res = await fetch("/api/report/generate", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("SEO Performance Report generated and dispatched to Slack!", { id: "gen_report" });
        setReport(data.report);
      } else {
        toast.error(data.error || "Failed to generate report", { id: "gen_report" });
      }
    } catch (e) {
      toast.error("Service request timed out", { id: "gen_report" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="animate-slide-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "32px", color: "var(--primary-maroon)", marginBottom: "6px" }}>Monthly SEO Performance</h1>
          <p style={{ color: "var(--text-muted)" }}>Paste Google Search Console metrics to generate performance insights for Sheetal</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleGenerateReport}
          disabled={generating}
        >
          <Sparkles size={16} />
          <span>Generate & Send Report</span>
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px" }}>
        
        {/* CSV Data Paste Section */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <BarChart2 size={20} style={{ color: "var(--accent-gold)" }} />
              <h3 style={{ fontSize: "18px", color: "var(--primary-maroon)" }}>GSC CSV Metrics Editor</h3>
            </div>
            <button 
              className="btn btn-secondary" 
              style={{ padding: "8px 16px", fontSize: "13px" }}
              onClick={handleSaveCsv}
              disabled={saving}
            >
              <Save size={14} />
              <span>Save Metrics</span>
            </button>
          </div>

          <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.4" }}>
            Download the <b>Queries</b> table from your Google Search Console profile as a CSV and paste the text contents below:
          </p>

          <textarea
            className="input-field"
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            style={{ flex: 1, minHeight: "350px", fontFamily: "monospace", fontSize: "12px", color: "var(--success-green)" }}
            placeholder="Query,Clicks,Impressions,CTR,Position&#10;wellness operators,120,4000,3%,12.4&#10;med spa scheduler assistant,85,1500,5.6%,8.2"
          />
        </div>

        {/* AI SEO Analyst Report Display */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <FileText size={20} style={{ color: "var(--accent-gold)" }} />
            <h3 style={{ fontSize: "18px", color: "var(--primary-maroon)" }}>SEO Executive Summary (For Sheetal)</h3>
          </div>

          {generating ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px" }}>
              <span className="spinner" style={{ width: "36px", height: "36px", marginBottom: "12px" }}></span>
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Analyzing impressions, clicks, CTR, and opportunity keywords...</p>
            </div>
          ) : report ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ 
                background: "rgba(18, 13, 15, 0.6)", 
                border: "1px solid var(--border-color)", 
                borderRadius: "12px", 
                padding: "24px", 
                fontSize: "14px", 
                lineHeight: "1.6", 
                color: "#f3eef0", 
                maxHeight: "400px", 
                overflowY: "auto",
                whiteSpace: "pre-wrap"
              }}>
                {report}
              </div>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "10px", 
                marginTop: "20px", 
                padding: "12px 16px", 
                background: "rgba(78, 203, 113, 0.05)", 
                border: "1px solid rgba(78, 203, 113, 0.2)", 
                borderRadius: "10px",
                color: "var(--success-green)",
                fontSize: "13px"
              }}>
                <Send size={16} />
                <span><b>Success!</b> This SEO Performance Briefing has been formatted and pushed to Slack for Sheetal.</span>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", border: "1px dashed var(--border-color)", borderRadius: "12px" }}>
              <AlertCircle size={32} style={{ color: "var(--text-muted)", marginBottom: "12px" }} />
              <p style={{ color: "var(--primary-maroon)", fontWeight: "600", fontSize: "15px" }}>No SEO report generated yet</p>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", textAlign: "center", marginTop: "4px", maxWidth: "320px", lineHeight: "1.4" }}>
                Make sure GSC CSV data is saved on the left, then click "Generate & Send" to activate Gemini's monthly SEO auditing agent.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
