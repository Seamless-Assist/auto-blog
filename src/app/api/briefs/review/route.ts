import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { runApproveBriefAndWriteDraft, runRejectAndRegenerateBrief } from "@/lib/cronRunner";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { pipelineId, status, notes } = await req.json();

    if (!pipelineId || !status) {
      return NextResponse.json({ error: "Missing pipelineId or status" }, { status: 400 });
    }

    if (status === "Approved") {
      // Trigger approval and write draft (which starts validation retry loop)
      // Since writing the draft takes a while (up to 3 attempts * 10-15s per attempt = 30s),
      // we can await it or let it run. But awaiting it allows us to return the execution log output directly to the UI in real-time!
      // This is a fabulous interactive feature.
      const result = await runApproveBriefAndWriteDraft(pipelineId, notes || "None");
      
      if (!result.success) {
        return NextResponse.json({ 
          success: false, 
          error: result.error, 
          logs: result.logs 
        }, { status: 422 });
      }

      return NextResponse.json({ 
        success: true, 
        message: "SEO brief approved! Draft generated and published to WordPress successfully.", 
        draftId: result.draftId, 
        editUrl: result.editUrl,
        logs: result.logs
      });

    } else if (status === "Rejected") {
      if (!notes) {
        return NextResponse.json({ error: "Feedback notes are required for rejections." }, { status: 400 });
      }

      const result = await runRejectAndRegenerateBrief(pipelineId, notes);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: "Brief rejected and regenerated. Returned to review status.", 
        brief: result.brief 
      });
    }

    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
