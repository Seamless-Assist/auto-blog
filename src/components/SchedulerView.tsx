"use strict";
import React, { useEffect, useState } from "react";
import { Calendar, Play, RefreshCw, CheckCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";

interface WPPost {
  id: number;
  title: string;
  link: string;
  isMock: boolean;
}

export default function SchedulerView() {
  const [pending, setPending] = useState<WPPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/scheduler");
      const data = await res.json();
      if (res.ok && data.success) {
        setPending(data.pending || []);
      }
    } catch (e) {
      toast.error("Failed to load pending WordPress posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleRunSync = async () => {
    setSyncing(true);
    toast.loading("Scheduling pending posts to Thursday 9am PT...", { id: "sched_sync" });
    try {
      const res = await fetch("/api/scheduler", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Successfully scheduled ${data.scheduledCount} posts and notified Slack!`, { id: "sched_sync" });
        fetchPending();
      } else {
        toast.error(data.error || "Scheduling failed", { id: "sched_sync" });
      }
    } catch (e) {
      toast.error("Connection timed out", { id: "sched_sync" });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="animate-slide-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "32px", color: "var(--primary-maroon)", marginBottom: "6px" }}>WordPress Scheduler</h1>
          <p style={{ color: "var(--text-muted)" }}>Synchronize approved pending drafts to automatically publish Thursday at 9am PT</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchPending} disabled={loading}>
          <RefreshCw className={loading ? "spinner" : ""} size={16} />
          <span>Refresh Pending</span>
        </button>
      </div>

      {/* Scheduler Info Box */}
      <div className="glass-panel" style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: "4px solid var(--accent-gold)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Calendar size={32} style={{ color: "var(--accent-gold)" }} />
          <div>
            <h3 style={{ fontSize: "18px", color: "var(--primary-maroon)", marginBottom: "4px" }}>Next Calculated Publishing Window</h3>
            <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
              The automation runner computes the upcoming Thursday at 9:00am PT (16:00 UTC) and sets the WordPress future status.
            </p>
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={handleRunSync}
          disabled={syncing || pending.length === 0}
        >
          <Play size={16} />
          <span>Sync & Schedule Posts</span>
        </button>
      </div>

      {/* Pending Table */}
      <div className="glass-panel">
        <h3 style={{ fontSize: "18px", color: "var(--primary-maroon)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Clock size={20} style={{ color: "var(--warning-gold)" }} />
          <span>Pending Schedule & In Review Posts ({pending.length})</span>
        </h3>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <span className="spinner" style={{ width: "32px", height: "32px", marginBottom: "12px" }}></span>
            <p style={{ color: "var(--text-muted)" }}>Connecting to WordPress...</p>
          </div>
        ) : pending.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", background: "rgba(18, 13, 15, 0.4)", borderRadius: "12px", border: "1px dashed var(--border-color)" }}>
            <CheckCircle size={32} style={{ color: "var(--success-green)", marginBottom: "12px" }} />
            <p style={{ color: "var(--primary-maroon)", fontWeight: "600" }}>All drafts are fully scheduled</p>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
              No pending posts detected in WordPress. New drafts will appear here once approved.
            </p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "100px" }}>WP Post ID</th>
                  <th>Post Title</th>
                  <th style={{ width: "180px" }}>Target Window</th>
                  <th style={{ width: "220px", textAlign: "right" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((post) => (
                  <tr key={post.id}>
                    <td style={{ fontWeight: "700", color: "var(--accent-gold)" }}>#{post.id}</td>
                    <td style={{ fontWeight: "600", color: "var(--primary-maroon)" }}>{post.title}</td>
                    <td style={{ fontSize: "13px", color: "var(--text-muted)" }}>Thursday 9:00am PT</td>
                    <td style={{ textAlign: "right" }}>
                      <span className="badge badge-pending" style={{ marginRight: "6px" }}>In Review</span>
                      <span className="badge badge-approved" style={{ background: "rgba(212,175,55,0.1)", color: "var(--accent-gold)" }}>Queued Schedule</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
