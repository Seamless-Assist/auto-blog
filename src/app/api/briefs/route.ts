import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getContentPipeline } from "@/lib/sheets";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pipeline = await getContentPipeline();
    return NextResponse.json({ success: true, pipeline });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
