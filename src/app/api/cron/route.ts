import { NextRequest, NextResponse } from "next/server";
import { runWeeklyTopicGeneration, runHourlyWPSchedulingSync, runPostLiveSyncCheck, runMonthlySEOReport } from "@/lib/cronRunner";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  
  // Optional security token check
  const token = url.searchParams.get("token");
  const expectedToken = process.env.CRON_SECRET || "seamless_cron_secret_2026";
  
  if (token !== expectedToken) {
    return NextResponse.json({ error: "Invalid cron authentication token." }, { status: 401 });
  }

  try {
    if (action === "weekly_topic") {
      const res = await runWeeklyTopicGeneration();
      return NextResponse.json({ action, res });
    } else if (action === "hourly_sync") {
      const res = await runHourlyWPSchedulingSync();
      return NextResponse.json({ action, res });
    } else if (action === "live_check") {
      const res = await runPostLiveSyncCheck();
      return NextResponse.json({ action, res });
    } else if (action === "monthly_report") {
      const res = await runMonthlySEOReport();
      return NextResponse.json({ action, res });
    } else {
      return NextResponse.json({ 
        error: "Missing or invalid action parameter. Use: weekly_topic, hourly_sync, live_check, monthly_report",
        availableActions: ["weekly_topic", "hourly_sync", "live_check", "monthly_report"] 
      }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
