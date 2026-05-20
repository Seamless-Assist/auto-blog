import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    await db.collection("topic_ideas").deleteMany({});
    await db.collection("content_pipeline").deleteMany({});
    await db.collection("cron_logs").deleteMany({});
    await db.collection("published_posts").deleteMany({});
    return NextResponse.json({ success: true, message: "DB reset complete" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
