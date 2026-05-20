import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    let settings = await db.collection("settings").findOne({ _id: "global_settings" });
    
    if (!settings) {
      settings = {
        _id: "global_settings",
        googleSheetId: process.env.GOOGLE_SHEET_ID || "1ffZ51206gJuUhJ82nfS_OWzNR9gNZJS8Hiar_yzRvec",
        geminiApiKey: process.env.GEMINI_API_KEY || "AIzaSyAV5MV_8rIKI_q7AYulglHKrtJH10N_RsM",
        slackWebhookUrl: process.env.SLACK_WEBHOOK_URL || "",
        wordpressUrl: "https://staging-b108-seamlessassist.wpcomstaging.com",
        wordpressAuthHeader: process.env.WORDPRESS_AUTH_HEADER || "",
        updatedAt: new Date(),
      };
      await db.collection("settings").insertOne(settings);
    }

    return NextResponse.json({ success: true, settings });
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
    const body = await req.json();
    const { db } = await connectToDatabase();

    const updatedSettings = {
      googleSheetId: body.googleSheetId,
      geminiApiKey: body.geminiApiKey,
      slackWebhookUrl: body.slackWebhookUrl,
      wordpressUrl: body.wordpressUrl,
      wordpressAuthHeader: body.wordpressAuthHeader,
      updatedAt: new Date(),
    };

    await db.collection("settings").updateOne(
      { _id: "global_settings" },
      { $set: updatedSettings },
      { upsert: true }
    );

    // Update server environment variables temporarily
    process.env.GOOGLE_SHEET_ID = body.googleSheetId;
    process.env.GEMINI_API_KEY = body.geminiApiKey;
    process.env.SLACK_WEBHOOK_URL = body.slackWebhookUrl;
    process.env.WORDPRESS_URL = body.wordpressUrl;
    process.env.WORDPRESS_AUTH_HEADER = body.wordpressAuthHeader;

    return NextResponse.json({ success: true, message: "Settings saved successfully", settings: updatedSettings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
