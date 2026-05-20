import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { runPostLiveSyncCheck } from "@/lib/cronRunner";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runPostLiveSyncCheck();
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Published blog check complete!", 
      loggedCount: result.loggedCount,
      newPosts: result.newPosts
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
