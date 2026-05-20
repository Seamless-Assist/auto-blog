import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { runApproveBriefAndWriteDraft } from "@/lib/cronRunner";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { pipelineId, instructions, wordCount, keywords } = await req.json();

    if (!pipelineId) {
      return NextResponse.json({ error: "Missing pipelineId" }, { status: 400 });
    }

    const combinedNotes = `TARGET WORD COUNT: ${wordCount || "1,500 words"}. ADDITIONAL KEYWORDS TO INJECT: ${keywords || "None"}. CUSTOM EDITORIAL INSTRUCTIONS: ${instructions || "None"}.`;

    const result = await runApproveBriefAndWriteDraft(pipelineId, combinedNotes);
    
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error, logs: result.logs }, { status: 422 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "AI Blog Draft successfully regenerated with custom controls!", 
      draftId: result.draftId, 
      editUrl: result.editUrl,
      logs: result.logs
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
