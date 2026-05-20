import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { fetchWPPendingPosts } from "@/lib/wordpress";
import { runHourlyWPSchedulingSync } from "@/lib/cronRunner";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pending = await fetchWPPendingPosts();
    return NextResponse.json({ success: true, pending });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Triggers hourly sync scheduling runner
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runHourlyWPSchedulingSync();
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully scheduled pending blog posts!`, 
      scheduledCount: result.scheduledCount,
      posts: result.scheduledPosts
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
