import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getTopicIdeas, getMonthlyStrategy, getPublishedPosts, updateMonthlyStrategy } from "@/lib/sheets";
import { runWeeklyTopicGeneration } from "@/lib/cronRunner";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const topics = await getTopicIdeas();
    const strategy = await getMonthlyStrategy();
    const published = await getPublishedPosts();

    return NextResponse.json({
      success: true,
      topics,
      strategy: strategy?.Notes || "",
      publishedCount: published.length,
      publishedList: published
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Triggers Topic Generation
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    if (body.strategyNotes) {
      await updateMonthlyStrategy(body.strategyNotes);
    }

    const result = await runWeeklyTopicGeneration();
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Successfully generated 5 blog topic ideas!", topics: result.topics });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
