"use strict";
import React, { useEffect, useState } from "react";
import { 
  Check, 
  X, 
  Terminal, 
  FileCheck, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  Eye,
  ExternalLink,
  BookOpen
} from "lucide-react";
import toast from "react-hot-toast";

interface PipelineRow {
  _id: string;
  post_title: string;
  primary_keyword: string;
  angle: string;
  full_brief_json: string;
  brief_status: "Pending Review" | "Approved" | "Rejected" | "Drafting" | "Completed";
  week_of: string;
  post_status: "In Review" | "Scheduled" | "Published";
  wordpress_post_id?: string;
  wordpress_edit_url?: string;
  navnish_notes?: string;
}

export default function BriefReviewerView() {
  const [pipeline, setPipeline] = useState<PipelineRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Review inputs
  const [brandVoiceNotes, setBrandVoiceNotes] = useState("");
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<"Approved" | "Rejected" | null>(null);

  // Live draft generation runner logs
  const [draftLogs, setDraftLogs] = useState<string[]>([]);
  const [showLogTerminal, setShowLogTerminal] = useState(false);

  const fetchPipeline = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/briefs");
      const data = await res.json();
      if (res.ok && data.success) {
        setPipeline(data.pipeline || []);
      }
    } catch (e) {
      toast.error("Failed to load content pipeline");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipeline();
  }, []);

  const handleReviewBrief = async (pipelineId: string, status: "Approved" | "Rejected") => {
    if (status === "Rejected" && !feedbackNotes.trim()) {
      toast.error("Feedback notes are required to reject a brief!");
      return;
    }

    setProcessingId(pipelineId);
    setActionStatus(status);
    setDraftLogs([]);

    if (status === "Approved") {
      setShowLogTerminal(true);
      setDraftLogs([`[System] Initializing Draft Writer for Brief ID: ${pipelineId}`, `[System] Setting up brand voice directives...`]);
      toast.loading("Starting Draft Engine. Check console below...", { id: "draft_engine" });
    } else {
      toast.loading("Submitting rejection & feedback...", { id: "reject_brief" });
    }

    try {
      const res = await fetch("/api/briefs/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pipelineId,
          status,
          notes: status === "Approved" ? brandVoiceNotes : feedbackNotes
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (status === "Approved") {
          setDraftLogs(data.logs || []);
          toast.success("Blog draft written, verified, and uploaded to WordPress!", { id: "draft_engine" });
          setBrandVoiceNotes("");
          setExpandedId(null);
        } else {
          toast.success("Brief rejected and returned for revision.", { id: "reject_brief" });
          setFeedbackNotes("");
          setExpandedId(null);
        }
        fetchPipeline();
      } else {
        if (data.logs) setDraftLogs(data.logs);
        const errMsg = data.error || "Operation failed";
        toast.error(errMsg, { id: status === "Approved" ? "draft_engine" : "reject_brief" });
      }
    } catch (e: any) {
      toast.error("Connection timed out. Check network.", { id: status === "Approved" ? "draft_engine" : "reject_brief" });
    } finally {
      setProcessingId(null);
      setActionStatus(null);
    }
  };

  return (
    <div className="animate-slide-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "32px", color: "var(--primary-maroon)", marginBottom: "6px" }}>Brief Reviewer</h1>
          <p style={{ color: "var(--text-muted)" }}>Approve generated SEO Briefs to write posts or send them back with adjustments</p>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={fetchPipeline}
          disabled={loading}
        >
          <RefreshCw className={loading ? "spinner" : ""} size={16} />
          <span>Sync Pipeline</span>
        </button>
      </div>

      {/* Reviewer Layout Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "30px" }}>
        
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <span className="spinner" style={{ width: "32px", height: "32px", marginBottom: "12px" }}></span>
            <p style={{ color: "var(--text-muted)" }}>Fetching pipeline items...</p>
          </div>
        ) : pipeline.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", background: "rgba(30, 20, 23, 0.4)", borderRadius: "12px", border: "1px dashed var(--border-color)" }}>
            <AlertCircle size={32} style={{ color: "var(--text-muted)", marginBottom: "12px" }} />
            <p style={{ color: "var(--primary-maroon)", fontWeight: "600" }}>No briefs found in content pipeline</p>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
              Approve a topic in the Topic Planner tab first to generate its SEO Brief.
            </p>
          </div>
        ) : (
          pipeline.map((row) => {
            const isExpanded = expandedId === row._id;
            let parsedBrief: any = {};
            try {
              parsedBrief = JSON.parse(row.full_brief_json);
            } catch (e) {}

            return (
              <div 
                key={row._id} 
                className="glass-panel" 
                style={{ 
                  borderLeft: row.brief_status === "Pending Review" ? "4px solid var(--warning-gold)" : "4px solid var(--success-green)",
                  padding: "20px"
                }}
              >
                {/* Header Collapsible Trigger */}
                <div 
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                  onClick={() => setExpandedId(isExpanded ? null : row._id)}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>{row.week_of}</span>
                      <h3 style={{ fontSize: "18px", color: "var(--primary-maroon)", fontWeight: "700" }}>{row.post_title}</h3>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                        Primary Keyword: <code style={{ color: "var(--accent-gold)" }}>{row.primary_keyword}</code>
                      </span>
                      <span style={{ color: "var(--border-color)" }}>|</span>
                      <span className={`badge ${
                        row.brief_status === "Pending Review" ? "badge-pending" : 
                        row.brief_status === "Completed" ? "badge-approved" : "badge-drafting"
                      }`}>
                        {row.brief_status === "Pending Review" ? "Review Pending" : row.brief_status}
                      </span>
                    </div>
                  </div>
                  <div>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {/* Expanded SEO Brief Details */}
                {isExpanded && (
                  <div style={{ marginTop: "24px", borderTop: "1px solid var(--border-color)", paddingTop: "24px", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "32px" }}>
                    
                    {/* SEO Brief Breakdown */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      <div>
                        <h4 style={{ fontSize: "14px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                          Suggested Angle
                        </h4>
                        <p style={{ color: "var(--primary-maroon)", fontSize: "15px", lineHeight: "1.5" }}>{row.angle}</p>
                      </div>

                      {parsedBrief.target_persona && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                          <div>
                            <h4 style={{ fontSize: "14px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                              Target Persona
                            </h4>
                            <p style={{ color: "var(--primary-maroon)", fontSize: "14px" }}>{parsedBrief.target_persona}</p>
                          </div>
                          <div>
                            <h4 style={{ fontSize: "14px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                              Search Intent
                            </h4>
                            <p style={{ color: "var(--primary-maroon)", fontSize: "14px" }}>{parsedBrief.search_intent}</p>
                          </div>
                        </div>
                      )}

                      {/* Display WordPress info if draft has already been created */}
                      {row.wordpress_post_id && (
                        <div style={{ background: "rgba(78, 203, 113, 0.05)", border: "1px solid rgba(78, 203, 113, 0.2)", borderRadius: "10px", padding: "16px", marginTop: "10px" }}>
                          <h4 style={{ fontSize: "13px", color: "var(--success-green)", display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                            <FileCheck size={16} />
                            <span>WordPress Draft Created</span>
                          </h4>
                          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "10px" }}>
                            Post ID: <b style={{ color: "var(--primary-maroon)" }}>{row.wordpress_post_id}</b> | Status: <b style={{ color: "var(--accent-gold)" }}>{row.post_status}</b>
                          </p>
                          {row.wordpress_edit_url && (
                            <a 
                              href={row.wordpress_edit_url.replace("https://seamlessassist.com", "https://staging-b108-seamlessassist.wpcomstaging.com")} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="btn btn-secondary" 
                              style={{ padding: "8px 12px", fontSize: "12px", display: "inline-flex", gap: "6px" }}
                            >
                              <span>Edit in WordPress</span>
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Operational Review Form (Only for Pending items) */}
                    <div>
                      {row.brief_status === "Pending Review" ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px", background: "var(--bg-surface-hover)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                          
                          <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "8px", letterSpacing: "0.05em" }}>
                              Weekly Brand Voice Notes (Optional)
                            </label>
                            <textarea
                              className="input-field"
                              value={brandVoiceNotes}
                              onChange={(e) => setBrandVoiceNotes(e.target.value)}
                              placeholder="e.g., Target health coaches struggling with scheduling admin. Mention yoga cancel example."
                              style={{ minHeight: "60px", fontSize: "13px" }}
                            />
                          </div>

                          <div style={{ display: "flex", gap: "12px" }}>
                            <button 
                              className="btn btn-success" 
                              style={{ flex: 1, padding: "10px" }}
                              onClick={() => handleReviewBrief(row._id, "Approved")}
                              disabled={processingId !== null}
                            >
                              <Check size={16} />
                              <span>Approve & Write Draft</span>
                            </button>
                          </div>

                          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "8px", letterSpacing: "0.05em" }}>
                              Adjust Brief Feedback (Required for Rejection)
                            </label>
                            <div style={{ display: "flex", gap: "12px" }}>
                              <input
                                type="text"
                                className="input-field"
                                value={feedbackNotes}
                                onChange={(e) => setFeedbackNotes(e.target.value)}
                                placeholder="e.g., Focus on US-based gym facilities specifically..."
                                style={{ flex: 1, fontSize: "13px" }}
                              />
                              <button 
                                className="btn btn-danger" 
                                style={{ padding: "10px 16px" }}
                                onClick={() => handleReviewBrief(row._id, "Rejected")}
                                disabled={processingId !== null}
                              >
                                <X size={16} />
                                <span>Reject</span>
                              </button>
                            </div>
                          </div>

                        </div>
                      ) : (
                        <div style={{ background: "rgba(237, 228, 217, 0.02)", padding: "24px", borderRadius: "12px", border: "1px solid rgba(237, 228, 217, 0.05)", textAlign: "center" }}>
                          <FileCheck size={32} style={{ color: "var(--success-green)", marginBottom: "12px" }} />
                          <p style={{ color: "var(--primary-maroon)", fontWeight: "600", fontSize: "15px" }}>Brief Review Complete</p>
                          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>
                            This brief was successfully approved, and its corresponding draft has been processed.
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Live Terminal Progress Log */}
      {showLogTerminal && (
        <div className="glass-panel animate-slide-in" style={{ borderLeft: "4px solid var(--accent-gold)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Terminal size={20} style={{ color: "var(--accent-gold)" }} />
              <h3 style={{ fontSize: "18px", color: "var(--primary-maroon)" }}>Live Draft Engine Validation Terminal</h3>
            </div>
            <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => setShowLogTerminal(false)}>
              <span>Close Terminal</span>
            </button>
          </div>

          <div className="terminal-window" style={{ maxHeight: "250px" }}>
            {draftLogs.map((log, index) => {
              let isError = log.includes("FAILED") || log.includes("❌") || log.includes("🚨");
              let isSuccess = log.includes("🟢") || log.includes("PASSED");
              let isWarning = log.includes("⚠️");
              return (
                <div 
                  key={index} 
                  className={`terminal-line ${isError ? "error" : isSuccess ? "success" : isWarning ? "warn" : "info"}`}
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  &gt; {log}
                </div>
              );
            })}
            {processingId && actionStatus === "Approved" && (
              <div className="terminal-line info animate-pulse-glow" style={{ marginTop: "10px", color: "var(--accent-gold)" }}>
                &gt; [System Engine] Running self-checks on written draft... Awaiting Gemini Response...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
