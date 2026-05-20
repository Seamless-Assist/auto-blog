"use strict";
import React, { useEffect, useState } from "react";
import { 
  Play, 
  Terminal, 
  RefreshCw, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Layers,
  Trash2
} from "lucide-react";
import toast from "react-hot-toast";

interface LogItem {
  _id: string;
  module: string;
  status: "SUCCESS" | "FAILED" | "INFO";
  message: string;
  timestamp: string;
}

interface PipelineStats {
  topicsCount: number;
  briefsCount: number;
  draftsCount: number;
  scheduledCount: number;
  publishedCount: number;
}

export default function DashboardView() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [stats, setStats] = useState<PipelineStats>({
    topicsCount: 0,
    briefsCount: 0,
    draftsCount: 0,
    scheduledCount: 0,
    publishedCount: 0,
  });
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [runningAction, setRunningAction] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch("/api/logs?limit=40");
      const data = await res.json();
      if (res.ok && data.success) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchStats = async () => {
    try {
      const resTopics = await fetch("/api/topics");
      const dataTopics = await resTopics.json();
      
      const resBriefs = await fetch("/api/briefs");
      const dataBriefs = await resBriefs.json();

      if (resTopics.ok && resBriefs.ok) {
        const topics = dataTopics.topics || [];
        const pipeline = dataBriefs.pipeline || [];

        setStats({
          topicsCount: topics.length,
          briefsCount: pipeline.filter((p: any) => p.brief_status === "Pending Review").length,
          draftsCount: pipeline.filter((p: any) => p.brief_status === "Completed" && p.post_status === "In Review").length,
          scheduledCount: pipeline.filter((p: any) => p.post_status === "Scheduled").length,
          publishedCount: dataTopics.publishedCount || 0
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
    
    // Auto-refresh stats and logs every 10s to look alive!
    const interval = setInterval(() => {
      fetchLogs();
      fetchStats();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleClearLogs = async () => {
    if (!confirm("Are you sure you want to clear system logs?")) return;
    try {
      const res = await fetch("/api/logs", { method: "DELETE" });
      if (res.ok) {
        toast.success("Activity logs cleared");
        fetchLogs();
      }
    } catch (e) {
      toast.error("Failed to clear logs");
    }
  };

  const triggerWeeklyTopicGen = async () => {
    setRunningAction("weekly_topic");
    toast.loading("Triggering Weekly SEO Topic Generator...", { id: "weekly_topic" });
    try {
      const res = await fetch("/api/topics", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Weekly topics generated and sent to Slack!", { id: "weekly_topic" });
        fetchStats();
        fetchLogs();
      } else {
        toast.error(data.error || "Failed to generate topics", { id: "weekly_topic" });
      }
    } catch (e) {
      toast.error("Service request timed out", { id: "weekly_topic" });
    } finally {
      setRunningAction(null);
    }
  };

  const triggerHourlySync = async () => {
    setRunningAction("hourly_sync");
    toast.loading("Running WordPress Scheduling Sync...", { id: "hourly_sync" });
    try {
      const res = await fetch("/api/scheduler", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(
          data.scheduledCount > 0 
            ? `Successfully scheduled ${data.scheduledCount} posts to WP and notified Slack!` 
            : "WordPress scheduled posts are fully in sync.", 
          { id: "hourly_sync" }
        );
        fetchStats();
        fetchLogs();
      } else {
        toast.error(data.error || "Sync failed", { id: "hourly_sync" });
      }
    } catch (e) {
      toast.error("Service request timed out", { id: "hourly_sync" });
    } finally {
      setRunningAction(null);
    }
  };

  const triggerLiveCheck = async () => {
    setRunningAction("live_check");
    toast.loading("Checking for newly published blogs...", { id: "live_check" });
    try {
      const res = await fetch("/api/live-check", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(
          data.loggedCount > 0 
            ? `Logged ${data.loggedCount} newly published posts and notified Slack!` 
            : "No new live posts detected in WP.", 
          { id: "live_check" }
        );
        fetchStats();
        fetchLogs();
      } else {
        toast.error(data.error || "Live sync check failed", { id: "live_check" });
      }
    } catch (e) {
      toast.error("Service request timed out", { id: "live_check" });
    } finally {
      setRunningAction(null);
    }
  };

  return (
    <div className="animate-slide-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "32px", color: "var(--primary-maroon)", marginBottom: "6px" }}>SEO & Blogs Scout</h1>
          <p style={{ color: "var(--text-muted)" }}>Central command center for Seamless Assist SEO Automation Engine</p>
        </div>
        <button className="btn btn-secondary" onClick={() => { fetchStats(); fetchLogs(); toast.success("Refreshed stats!"); }}>
          <RefreshCw size={16} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <Layers size={24} style={{ color: "var(--accent-gold)" }} />
          <div className="stat-value">{stats.topicsCount}</div>
          <div className="stat-label">Total Topics Generated</div>
        </div>
        <div className="stat-card">
          <Clock size={24} style={{ color: "var(--warning-gold)" }} />
          <div className="stat-value">{stats.briefsCount}</div>
          <div className="stat-label">Briefs In Review</div>
        </div>
        <div className="stat-card">
          <BookOpen size={24} style={{ color: "#ab4b68" }} />
          <div className="stat-value">{stats.draftsCount}</div>
          <div className="stat-label">WP Drafts In Review</div>
        </div>
        <div className="stat-card">
          <CheckCircle size={24} style={{ color: "var(--success-green)" }} />
          <div className="stat-value">{stats.scheduledCount + stats.publishedCount}</div>
          <div className="stat-label">Scheduled & Live Posts</div>
        </div>
      </div>

      {/* Manual Runners Grid */}
      <h2 style={{ fontSize: "20px", color: "var(--primary-maroon)", marginBottom: "16px" }}>Manual Operational Overrides</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "40px" }}>
        
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "16px" }}>
          <div>
            <h3 style={{ fontSize: "18px", color: "var(--primary-maroon)", marginBottom: "8px" }}>Weekly Topic Generation</h3>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.4" }}>
              Reads the monthly strategy, parses previously published topics, and utilizes Gemini 1.5 Flash to generate 5 brand new low-competition keywords & topic ideas in the spreadsheet.
            </p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={triggerWeeklyTopicGen}
            disabled={runningAction !== null}
          >
            <Play size={16} />
            <span>Generate Weekly Topics</span>
          </button>
        </div>

        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "16px" }}>
          <div>
            <h3 style={{ fontSize: "18px", color: "var(--primary-maroon)", marginBottom: "8px" }}>WordPress Scheduling Sync</h3>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.4" }}>
              Scans WordPress for posts set to "Pending Review" by Navnish, schedules them to publish next Thursday at 9am PT, updates the spreadsheet, and notifies Slack.
            </p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={triggerHourlySync}
            disabled={runningAction !== null}
          >
            <Play size={16} />
            <span>Schedule Approved Drafts</span>
          </button>
        </div>

        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "16px" }}>
          <div>
            <h3 style={{ fontSize: "18px", color: "var(--primary-maroon)", marginBottom: "8px" }}>Live Post Synchronization</h3>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.4" }}>
              Fetches live published posts from WordPress, cross-checks against Google Sheets log, appends any new published links, and posts a celebratory "WE ARE LIVE" alert to Slack!
            </p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={triggerLiveCheck}
            disabled={runningAction !== null}
          >
            <Play size={16} />
            <span>Trigger Live Check</span>
          </button>
        </div>

      </div>

      {/* Live Terminal Log */}
      <div className="glass-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Terminal size={22} style={{ color: "var(--accent-gold)" }} />
            <h3 style={{ fontSize: "18px", color: "var(--primary-maroon)" }}>Live Automation Engine Activity Logs</h3>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: "13px" }} onClick={fetchLogs} disabled={loadingLogs}>
              <RefreshCw size={14} className={loadingLogs ? "spinner" : ""} />
              <span>Refresh Terminal</span>
            </button>
            <button className="btn btn-danger" style={{ padding: "8px 16px", fontSize: "13px" }} onClick={handleClearLogs}>
              <Trash2 size={14} />
              <span>Clear logs</span>
            </button>
          </div>
        </div>

        <div className="terminal-window">
          {logs.length === 0 ? (
            <div className="terminal-line info">
              &gt;_ System Idle. No execution traces loaded in MongoDB logs collection. Click overrides above to run the AI engine.
            </div>
          ) : (
            logs.map((log) => {
              let lineClass = "info";
              let prefix = "INFO";
              if (log.status === "SUCCESS") {
                lineClass = "success";
                prefix = "SUCCESS";
              } else if (log.status === "FAILED") {
                lineClass = "error";
                prefix = "CRITICAL";
              }
              return (
                <div key={log._id} className={`terminal-line ${lineClass}`}>
                  [{new Date(log.timestamp).toLocaleString()}] [{prefix}] {log.message}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
