import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getGSCPerformance, saveGSCPerformance } from "@/lib/sheets";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const csv = await getGSCPerformance();
    return NextResponse.json({ success: true, csv });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { csv } = await req.json();
    await saveGSCPerformance(csv || "");
    return NextResponse.json({ success: true, message: "GSC CSV Performance data updated successfully!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
