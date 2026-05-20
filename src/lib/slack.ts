const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || "";

async function sendSlackMessage(text: string): Promise<boolean> {
  if (!SLACK_WEBHOOK_URL) {
    console.warn("⚠️ Slack Webhook URL is not configured. Skipping notification.");
    return false;
  }

  try {
    const res = await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      console.error(`Slack Notification Failed: ${res.status} - ${await res.text()}`);
      return false;
    }

    console.log("🔔 Slack notification sent successfully!");
    return true;
  } catch (error) {
    console.error("Slack webhook call failed:", error);
    return false;
  }
}

// 1. Notify Topic Ideas Generated
export async function notifyTopicIdeas(): Promise<boolean> {
  const text = `💡 *5 New SEO Blog Topics Generated!*
Navnish, please review and select ONE topic by changing its status to \`Approved\` in the SEO Portal dashboard or Google Sheets: https://docs.google.com/spreadsheets/d/1ffZ51206gJuUhJ82nfS_OWzNR9gNZJS8Hiar_yzRvec`;
  return await sendSlackMessage(text);
}

// 2. Notify Brief Ready
export async function notifyBriefReady(title: string, keyword: string): Promise<boolean> {
  const text = `📝 *SEO Blog Brief Ready for Review!*
Title: *${title}*
Primary Keyword: \`${keyword}\`
👉 Review immediately in the SEO Portal Dashboard or Google Sheets: https://docs.google.com/spreadsheets/d/1ffZ51206gJuUhJ82nfS_OWzNR9gNZJS8Hiar_yzRvec`;
  return await sendSlackMessage(text);
}

// 3. Notify Draft Ready
export async function notifyDraftReady(title: string, postId: string, editUrl: string): Promise<boolean> {
  const text = `✍️ *SEO Blog Draft Ready!*
Title: *${title}*
👉 Edit directly in WordPress: ${editUrl || `https://staging-b108-seamlessassist.wpcomstaging.com/wp-admin/post.php?post=${postId}&action=edit`}
Review details in the SEO Portal Dashboard or Google Sheets: https://docs.google.com/spreadsheets/d/1ffZ51206gJuUhJ82nfS_OWzNR9gNZJS8Hiar_yzRvec`;
  return await sendSlackMessage(text);
}

// 4. Notify Draft Failure (Swaraj Alert)
export async function notifyDraftFailure(errorMsg: string): Promise<boolean> {
  const text = `🚨 *SEO Content Machine Failure:*
Draft generation failed validation 2 times. Swaraj, please investigate.
Details: ${errorMsg}
Run URL: https://n8n.staging-b108-seamlessassist.wpcomstaging.com or check SEO Portal logs.`;
  return await sendSlackMessage(text);
}

// 5. Notify Scheduled
export async function notifyScheduled(title: string, scheduledDate: string, link: string): Promise<boolean> {
  const formattedDate = new Date(scheduledDate).toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    dateStyle: "medium",
    timeStyle: "short"
  }) + " (PT)";

  const text = `📅 *New Post Scheduled!*
Post Title: *${title}*
Scheduled for: *Thursday 9:00am PT* (${formattedDate})
Review link: ${link}`;
  return await sendSlackMessage(text);
}

// 6. Notify Live
export async function notifyLive(title: string, url: string, primaryKeyword: string): Promise<boolean> {
  const text = `🎉 *WE ARE LIVE!* 🟢
New blog post is officially published:
*${title}*
👉 ${url}
Target Keyword: \`${primaryKeyword}\``;
  return await sendSlackMessage(text);
}

// 7. Remind GSC CSV Paste
export async function remindGSC(): Promise<boolean> {
  const text = `⚠️ *Action Required:* Navnish, the Monthly SEO Report failed to run because the GSC Performance CSV data is missing in Google Sheets/SEO Portal. Please paste it in the GSC tab: https://docs.google.com/spreadsheets/d/1ffZ51206gJuUhJ82nfS_OWzNR9gNZJS8Hiar_yzRvec`;
  return await sendSlackMessage(text);
}

// 8. Send Monthly SEO Report
export async function sendMonthlyReport(reportText: string): Promise<boolean> {
  const text = `📈 *Monthly SEO & Blog Performance Report* \n\n${reportText}`;
  return await sendSlackMessage(text);
}
