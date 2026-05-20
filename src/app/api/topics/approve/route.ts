import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { runApproveTopicAndGenerateBrief } from "@/lib/cronRunner";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { topicId } = await req.json();
    if (!topicId) {
      return NextResponse.json({ error: "Missing topicId" }, { status: 400 });
    }

    const result = await runApproveTopicAndGenerateBrief(topicId);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Topic approved and SEO brief generated!", brief: result.brief });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
