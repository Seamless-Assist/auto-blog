"use strict";
import React, { useEffect, useState } from "react";
import { Settings, Save, ShieldCheck, Key, Link, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsView() {
  const [googleSheetId, setGoogleSheetId] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [slackWebhookUrl, setSlackWebhookUrl] = useState("");
  const [wordpressUrl, setWordpressUrl] = useState("");
  const [wordpressAuthHeader, setWordpressAuthHeader] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Password visibility triggers
  const [showGemini, setShowGemini] = useState(false);
  const [showWpAuth, setShowWpAuth] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (res.ok && data.success) {
        const s = data.settings;
        setGoogleSheetId(s.googleSheetId || "");
        setGeminiApiKey(s.geminiApiKey || "");
        setSlackWebhookUrl(s.slackWebhookUrl || "");
        setWordpressUrl(s.wordpressUrl || "");
        setWordpressAuthHeader(s.wordpressAuthHeader || "");
      }
    } catch (e) {
      toast.error("Failed to load integrations settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    toast.loading("Saving custom configurations...", { id: "save_settings" });

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleSheetId,
          geminiApiKey,
          slackWebhookUrl,
          wordpressUrl,
          wordpressAuthHeader,
        }),
      });

      if (res.ok) {
        toast.success("All integration credentials updated successfully!", { id: "save_settings" });
        fetchSettings();
      } else {
        toast.error("Failed to update credentials", { id: "save_settings" });
      }
    } catch (err) {
      toast.error("Network write timeout", { id: "save_settings" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <span className="spinner" style={{ width: "32px", height: "32px", marginBottom: "12px" }}></span>
        <p style={{ color: "var(--text-muted)" }}>Reading credentials configuration...</p>
      </div>
    );
  }

  return (
    <div className="animate-slide-in">
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "32px", color: "var(--primary-maroon)", marginBottom: "6px" }}>Integration Settings</h1>
        <p style={{ color: "var(--text-muted)" }}>Manage secure database and API endpoints for your content automation pipeline</p>
      </div>

      <form onSubmit={handleSave} style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        
        {/* Core Credentials Panel */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
            <Key size={20} style={{ color: "var(--accent-gold)" }} />
            <h3 style={{ fontSize: "18px", color: "var(--primary-maroon)" }}>Secure API & Credentials Store</h3>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "8px", letterSpacing: "0.05em" }}>
              Google Spreadsheet ID
            </label>
            <input
              type="text"
              className="input-field"
              value={googleSheetId}
              onChange={(e) => setGoogleSheetId(e.target.value)}
              placeholder="e.g. 1ffZ51206gJuUhJ82nfS_OWzNR9gNZJS8Hiar_yzRvec"
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "8px", letterSpacing: "0.05em" }}>
              Gemini 1.5 Flash API Key
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showGemini ? "text" : "password"}
                className="input-field"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy..."
                required
                style={{ paddingRight: "48px" }}
              />
              <button 
                type="button" 
                style={{ position: "absolute", right: "12px", top: "12px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                onClick={() => setShowGemini(!showGemini)}
              >
                {showGemini ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "8px", letterSpacing: "0.05em" }}>
              Slack Webhook URL
            </label>
            <input
              type="text"
              className="input-field"
              value={slackWebhookUrl}
              onChange={(e) => setSlackWebhookUrl(e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "8px", letterSpacing: "0.05em" }}>
              WordPress Base URL
            </label>
            <input
              type="url"
              className="input-field"
              value={wordpressUrl}
              onChange={(e) => setWordpressUrl(e.target.value)}
              placeholder="https://staging-b108-seamlessassist.wpcomstaging.com"
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "8px", letterSpacing: "0.05em" }}>
              WordPress Basic Auth Header (Base64)
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showWpAuth ? "text" : "password"}
                className="input-field"
                value={wordpressAuthHeader}
                onChange={(e) => setWordpressAuthHeader(e.target.value)}
                placeholder="Basic ..."
                required
                style={{ paddingRight: "48px" }}
              />
              <button 
                type="button" 
                style={{ position: "absolute", right: "12px", top: "12px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                onClick={() => setShowWpAuth(!showWpAuth)}
              >
                {showWpAuth ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ width: "100%", marginTop: "12px", height: "48px" }}
          >
            {saving ? (
              <>
                <span className="spinner"></span>
                <span>Saving Credentials...</span>
              </>
            ) : (
              <span>Persist Integration Configuration</span>
            )}
          </button>
        </div>

        {/* Security Summary Panel */}
        <div className="glass-panel" style={{ height: "fit-content", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={20} style={{ color: "var(--success-green)" }} />
            <h3 style={{ fontSize: "18px", color: "var(--primary-maroon)" }}>Secure Operations</h3>
          </div>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.5" }}>
            Credential configs are maintained securely inside your local <b>MongoDB</b> instance and parsed only on server execution threads.
          </p>
          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-gold)", fontSize: "13px", fontWeight: "700" }}>
              <Link size={14} />
              <span>Network Status</span>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "6px", lineHeight: "1.4" }}>
              If your external WordPress domain is unreachable or offline, the system automatically transitions into <b>Local Sandbox Mode</b> to ensure seamless demo execution without service crashes!
            </p>
          </div>
        </div>

      </form>
    </div>
  );
}
