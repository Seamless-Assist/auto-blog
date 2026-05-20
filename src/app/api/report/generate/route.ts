import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { runMonthlySEOReport } from "@/lib/cronRunner";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runMonthlySEOReport();
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 422 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Monthly performance report successfully generated and sent to Sheetal on Slack!", 
      report: result.report 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
