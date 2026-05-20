import { 
  getPublishedPosts, 
  getMonthlyStrategy, 
  getTopicIdeas, 
  appendTopicIdeas, 
  updateTopicStatus,
  getContentPipeline,
  appendPipelineRow,
  updatePipelineRow,
  saveGSCPerformance,
  getGSCPerformance,
  addPublishedPost,
  TopicIdeaRow,
  ContentPipelineRow
} from "./sheets";
import { 
  generateTopics, 
  generateBrief, 
  regenerateBrief, 
  generateDraft, 
  generateMonthlyReport 
} from "./gemini";
import { 
  notifyTopicIdeas, 
  notifyBriefReady, 
  notifyDraftReady, 
  notifyDraftFailure, 
  notifyScheduled, 
  notifyLive, 
  remindGSC, 
  sendMonthlyReport 
} from "./slack";
import { 
  createWPDraft, 
  fetchWPPendingPosts, 
  scheduleWPPost, 
  fetchWPLivePosts 
} from "./wordpress";
import { connectToDatabase } from "./db";
import { ObjectId } from "mongodb";

const WORDPRESS_URL = "https://staging-b108-seamlessassist.wpcomstaging.com";

function toIdQuery(id: string) {
  try {
    return { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
  } catch {
    return { _id: id };
  }
}

// Helper to log system events in MongoDB so they show up live on the UI Dashboard
export async function logEvent(module: string, status: "SUCCESS" | "FAILED" | "INFO", message: string, details: any = null): Promise<void> {
  try {
    const { db } = await connectToDatabase();
    await db.collection("cron_logs").insertOne({
      module,
      status,
      message,
      details: details ? JSON.stringify(details) : null,
      timestamp: new Date()
    });
    console.log(`[${module}] [${status}] ${message}`);
  } catch (error) {
    console.error("Failed to write system log:", error);
  }
}

// 1. WEEKLY TOPIC GENERATION RUNNER (N8N Node: Monday 8am Trigger)
export async function runWeeklyTopicGeneration(): Promise<{ success: boolean; topics?: any[]; error?: string }> {
  await logEvent("Topic Generation", "INFO", "Starting weekly SEO blog topic generation...");
  
  try {
    // A. Read published posts
    const published = await getPublishedPosts();
    const publishedTitles = published.map(p => p.Title || "").filter(Boolean).join(", ");
    
    // B. Read monthly strategy
    const strategy = await getMonthlyStrategy();
    const monthlyBrief = strategy?.Notes || "None";
    
    // C. Call Gemini Generate Topics
    await logEvent("Topic Generation", "INFO", "Calling Gemini 1.5 Flash to generate 5 optimized low-competition keywords & topics...");
    const parsedTopics = await generateTopics(publishedTitles, monthlyBrief);
    
    // D. Map and append to database Topic Ideas
    const topicIdeasToAppend: Omit<TopicIdeaRow, "_id">[] = parsedTopics.map(item => ({
      TopicTitle: item.topic_title,
      TargetKeyword: item.target_keyword,
      SuggestedAngle: item.suggested_angle,
      TopicStatus: "Pending Selection",
      CreatedDate: new Date().toISOString().split("T")[0]
    }));
    
    await appendTopicIdeas(topicIdeasToAppend);
    await logEvent("Topic Generation", "SUCCESS", `Successfully generated 5 topic ideas and saved to Topic Ideas sheet.`);
    
    // E. Slack notify
    await notifyTopicIdeas();
    await logEvent("Topic Generation", "INFO", "Dispatched Slack notification to Navnish for selection.");
    
    return { success: true, topics: topicIdeasToAppend };
  } catch (error: any) {
    await logEvent("Topic Generation", "FAILED", `Failed weekly topic generation: ${error.message}`, error);
    return { success: false, error: error.message };
  }
}

// 2. APPROVE TOPIC & GENERATE BRIEF RUNNER (N8N Node: Sheets Watch Topic Ideas)
export async function runApproveTopicAndGenerateBrief(topicId: string): Promise<{ success: boolean; brief?: any; error?: string }> {
  await logEvent("Brief Generation", "INFO", `Approving topic ID ${topicId} and generating SEO Brief...`);
  
  try {
    const { db } = await connectToDatabase();
    
    // A. Find topic row
    const topic = await db.collection("topic_ideas").findOne(toIdQuery(topicId));
    if (!topic) {
      throw new Error(`Topic Idea with ID ${topicId} not found.`);
    }
    
    // B. Update status to Approved
    await updateTopicStatus(topicId, "Approved");
    
    // C. Call Gemini Generate Brief
    await logEvent("Brief Generation", "INFO", `Triggering Gemini to write comprehensive brief for '${topic.TopicTitle}'...`);
    const brief = await generateBrief(topic.TopicTitle, topic.TargetKeyword, topic.SuggestedAngle);
    
    // D. Create Brief Row in Content Pipeline
    const pipelineId = await appendPipelineRow({
      post_title: brief.post_title,
      primary_keyword: brief.primary_keyword,
      angle: brief.angle,
      full_brief_json: JSON.stringify(brief),
      brief_status: "Pending Review",
      week_of: new Date().toISOString().split("T")[0],
      post_status: "In Review"
    });
    
    await logEvent("Brief Generation", "SUCCESS", `SEO Brief generated for '${brief.post_title}' and submitted to pipeline.`, brief);
    
    // E. Slack notify
    await notifyBriefReady(brief.post_title, brief.primary_keyword);
    
    return { success: true, brief };
  } catch (error: any) {
    await logEvent("Brief Generation", "FAILED", `Brief generation failed: ${error.message}`, error);
    return { success: false, error: error.message };
  }
}

// 3. REJECT & REGENERATE BRIEF RUNNER (N8N Node: Check Is Brief Rejected?)
export async function runRejectAndRegenerateBrief(pipelineId: string, feedbackNotes: string): Promise<{ success: boolean; brief?: any; error?: string }> {
  await logEvent("Brief Regeneration", "INFO", `Brief rejected. Regenerating brief ID ${pipelineId} incorporating feedback: "${feedbackNotes}"...`);
  
  try {
    const { db } = await connectToDatabase();
    
    // Find pipeline row
    const row = await db.collection("content_pipeline").findOne(toIdQuery(pipelineId));
    if (!row) {
      throw new Error(`Pipeline row with ID ${pipelineId} not found.`);
    }
    
    // Call Gemini Regenerate Brief
    const newBrief = await regenerateBrief(row.full_brief_json, feedbackNotes);
    
    // Update Content Pipeline
    await updatePipelineRow(pipelineId, {
      post_title: newBrief.post_title,
      primary_keyword: newBrief.primary_keyword,
      angle: newBrief.angle,
      full_brief_json: JSON.stringify(newBrief),
      brief_status: "Pending Review", // Back to review
      navnish_notes: feedbackNotes
    });
    
    await logEvent("Brief Regeneration", "SUCCESS", `Regenerated brief for '${newBrief.post_title}' based on feedback.`, newBrief);
    
    // Re-notify Navnish
    await notifyBriefReady(newBrief.post_title, newBrief.primary_keyword);
    
    return { success: true, brief: newBrief };
  } catch (error: any) {
    await logEvent("Brief Regeneration", "FAILED", `Brief regeneration failed: ${error.message}`, error);
    return { success: false, error: error.message };
  }
}

// 4. APPROVE BRIEF & WRITE BLOG DRAFT WITH VALIDATION LOOP (N8N Node: Sheets Watch Pipeline Approved Brief)
export async function runApproveBriefAndWriteDraft(pipelineId: string, navnishNotes: string = "None"): Promise<{ success: boolean; draftId?: number; editUrl?: string; error?: string; logs?: string[] }> {
  await logEvent("Draft Generation", "INFO", `Starting draft generation for Pipeline ID: ${pipelineId}...`);
  const executionLogs: string[] = [];
  
  const addLog = (msg: string) => {
    executionLogs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
    console.log(`[Draft Engine] ${msg}`);
  };

  try {
    const { db } = await connectToDatabase();
    
    // Find pipeline row
    const row = await db.collection("content_pipeline").findOne(toIdQuery(pipelineId));
    if (!row) {
      throw new Error(`Pipeline row with ID ${pipelineId} not found.`);
    }
    
    addLog(`SEO Brief found: "${row.post_title}"`);
    
    // Update status to drafting
    await updatePipelineRow(pipelineId, { brief_status: "Drafting", navnish_notes: navnishNotes });
    
    let retryCount = 0;
    let feedback = "";
    let isPassed = false;
    let draftResult: any = null;
    
    // Advanced Content validation and generation retry loop (Max 2 retries, total 3 attempts)
    while (retryCount < 3 && !isPassed) {
      const attempt = retryCount + 1;
      addLog(`Draft generation attempt #${attempt} of 3...`);
      
      try {
        draftResult = await generateDraft(row.full_brief_json, navnishNotes, feedback);
        const sc = draftResult.self_check;
        
        // Defensive fallback against incorrect LLM JSON typing
        const bannedPhrases = Array.isArray(sc.banned_phrases_used) ? sc.banned_phrases_used : [];
        const industrySpecificExamplesCount = Number(sc.industry_specific_examples) || 0;
        const wordCount = Number(sc.word_count) || 0;

        // Validation Criteria from N8N code block:
        const keywordH1 = sc.primary_keyword_in_h1;
        const keywordFirst100 = sc.primary_keyword_in_first_100_words;
        const ctaCount = sc.cta_appears_3_times;
        const industryExamples = industrySpecificExamplesCount >= 2;
        const bannedPhrasesClean = bannedPhrases.length === 0;
        const wordCountRange = sc.word_count_in_range;
        
        isPassed = keywordH1 && keywordFirst100 && ctaCount && industryExamples && bannedPhrasesClean && wordCountRange;
        
        addLog(`Attempt #${attempt} results:
        - Primary keyword in H1: [${keywordH1 ? "PASSED" : "FAILED"}]
        - Primary keyword in intro 100 words: [${keywordFirst100 ? "PASSED" : "FAILED"}]
        - CTA appears exactly 3 times: [${ctaCount ? "PASSED" : "FAILED"}]
        - Industry-specific examples >= 2: [${industryExamples ? "PASSED" : "FAILED"} (${industrySpecificExamplesCount} found)]
        - Banned phrases avoided: [${bannedPhrasesClean ? "PASSED" : "FAILED"} (${bannedPhrases.join(", ") || "None"})]
        - Word count (1200-1800): [${wordCountRange ? "PASSED" : "FAILED"} (${wordCount} words)]`);
        
        if (isPassed) {
          addLog("🟢 Validation Passed! Writing draft to WordPress...");
        } else {
          retryCount++;
          feedback = `Your previous attempt failed validation. Issues:\n`;
          if (!keywordH1) feedback += `- Primary keyword missing from H1.\n`;
          if (!keywordFirst100) feedback += `- Primary keyword missing from first 100 words.\n`;
          if (!ctaCount) feedback += `- CTA does not appear exactly 3 times.\n`;
          if (!industryExamples) feedback += `- Needs more industry-specific examples (must be at least 2, currently gave ${industrySpecificExamplesCount}).\n`;
          if (!bannedPhrasesClean) feedback += `- Used banned words: ${bannedPhrases.join(", ")}.\n`;
          if (!wordCountRange) feedback += `- Word count of ${wordCount} is out of 1200-1800 range.\n`;
          
          addLog(`⚠️ Attempt #${attempt} failed. Formatting feedback and retrying...`);
        }
      } catch (geminiErr: any) {
        retryCount++;
        feedback = `Your JSON was malformed and couldn't be parsed. Please output clean JSON matching the requested keys. Error: ${geminiErr.message}`;
        addLog(`❌ Attempt #${attempt} parse failed: ${geminiErr.message}. Retrying...`);
      }
    }
    
    // If we exhausted retries and still failed:
    if (!isPassed) {
      addLog("🚨 Content Machine failed validation 3 times. Halting execution and alerting engineering.");
      await updatePipelineRow(pipelineId, { brief_status: "Approved" }); // Set back so they can trigger again
      
      const errMsg = `Draft validation failed after 3 attempts. Issues:\n${feedback}`;
      await logEvent("Draft Generation", "FAILED", `Draft generation failed for '${row.post_title}': ${errMsg}`, executionLogs);
      
      await notifyDraftFailure(feedback);
      return { success: false, error: "Validation failed after max retries.", logs: executionLogs };
    }
    
    // Validation passed! Push draft to WordPress
    await logEvent("Draft Generation", "INFO", "Pushing approved draft to WordPress REST API...");
    const wpResult = await createWPDraft(
      draftResult.title,
      draftResult.body_html,
      draftResult.meta_description,
      draftResult.primary_keyword,
      draftResult.self_check
    );
    
    const editUrl = wpResult.isMock 
      ? `${WORDPRESS_URL}/wp-admin/post.php?post=${wpResult.id}&action=edit (Local Sandbox Mode)` 
      : `${WORDPRESS_URL}/wp-admin/post.php?post=${wpResult.id}&action=edit`;
      
    // Update sheet database
    await updatePipelineRow(pipelineId, {
      brief_status: "Completed",
      post_status: "In Review",
      wordpress_post_id: wpResult.id.toString(),
      wordpress_edit_url: editUrl
    });
    
    await logEvent("Draft Generation", "SUCCESS", `Successfully created WordPress blog draft for '${draftResult.title}' (WP-ID: ${wpResult.id})`, wpResult);
    
    // Send Slack Notification
    await notifyDraftReady(draftResult.title, wpResult.id.toString(), editUrl);
    
    addLog(`🟢 Draft complete! Published Draft to WordPress. ID: ${wpResult.id}`);
    return { success: true, draftId: wpResult.id, editUrl, logs: executionLogs };
    
  } catch (error: any) {
    await logEvent("Draft Generation", "FAILED", `Draft generation crashed: ${error.message}`, error);
    return { success: false, error: error.message, logs: executionLogs };
  }
}

// 5. HOURLY WP SYNC TRIGGER RUNNER (N8N Node: Hourly WP Sync Trigger)
export async function runHourlyWPSchedulingSync(): Promise<{ success: boolean; scheduledCount: number; scheduledPosts?: any[]; error?: string }> {
  await logEvent("WP Sync", "INFO", "Starting hourly WordPress scheduling synchronization...");
  
  try {
    const { db } = await connectToDatabase();
    
    // A. Fetch pending posts from WordPress (approved by editor, waiting to be scheduled)
    const pendingPosts = await fetchWPPendingPosts();
    if (pendingPosts.length === 0) {
      await logEvent("WP Sync", "INFO", "No pending blog posts found in WordPress to schedule.");
      return { success: true, scheduledCount: 0 };
    }
    
    // B. Calculate next Thursday at 9am PT
    // Next Thursday 9am PT = 16:00 UTC
    const now = new Date();
    const dayOfWeek = now.getUTCDay(); // 0-6
    const daysUntilThursday = (4 - dayOfWeek + 7) % 7 || 7;
    
    const nextThursday = new Date(now.getTime());
    nextThursday.setUTCDate(now.getUTCDate() + daysUntilThursday);
    nextThursday.setUTCHours(16, 0, 0, 0); // 16:00 UTC = 9:00am PT
    const scheduledDateIso = nextThursday.toISOString();
    
    const scheduledPosts = [];
    
    // C. Schedule each post
    for (const post of pendingPosts) {
      await logEvent("WP Sync", "INFO", `Scheduling Post WP-ID ${post.id} ('${post.title}') for Thursday 9:00am PT (${scheduledDateIso})...`);
      
      const wpResult = await scheduleWPPost(post.id, scheduledDateIso);
      
      // Update pipeline status
      const pipelineRow = await db.collection("content_pipeline").findOne({ wordpress_post_id: post.id.toString() });
      if (pipelineRow) {
        await updatePipelineRow(pipelineRow._id, {
          post_status: "Scheduled",
          brief_status: "Approved"
        });
        
        scheduledPosts.push({
          title: post.title,
          id: post.id,
          scheduledDate: scheduledDateIso
        });
        
        await logEvent("WP Sync", "SUCCESS", `Scheduled and updated pipeline for post: '${post.title}'`);
        
        // Slack Notification
        await notifyScheduled(post.title, scheduledDateIso, post.link);
      } else {
        await logEvent("WP Sync", "FAILED", `Post WP-ID ${post.id} was scheduled, but could not be matched to a row in the Content Pipeline database.`);
      }
    }
    
    return { success: true, scheduledCount: scheduledPosts.length, scheduledPosts };
  } catch (error: any) {
    await logEvent("WP Sync", "FAILED", `Failed WordPress scheduling sync: ${error.message}`, error);
    return { success: false, scheduledCount: 0, error: error.message };
  }
}

// 6. POST LIVE SYNC TRIGGER RUNNER (N8N Node: Post Live Sync Trigger)
export async function runPostLiveSyncCheck(): Promise<{ success: boolean; loggedCount: number; newPosts?: any[]; error?: string }> {
  await logEvent("Live Check", "INFO", "Checking for newly published (live) WordPress blog posts to log in sheets...");
  
  try {
    // A. Fetch recent live posts from WP
    const livePosts = await fetchWPLivePosts();
    if (livePosts.length === 0) {
      await logEvent("Live Check", "INFO", "No live posts found in WordPress.");
      return { success: true, loggedCount: 0 };
    }
    
    // B. Fetch logged published posts from DB
    const logged = await getPublishedPosts();
    const loggedUrls = logged.map(l => l.URL || "");
    
    const newLivePostsLog = [];
    
    // C. Filter posts that are live but not yet logged
    for (const post of livePosts) {
      if (!loggedUrls.includes(post.link)) {
        await logEvent("Live Check", "INFO", `New live blog detected: '${post.title}' (${post.link}). Logging to database...`);
        
        const newPostData = {
          Title: post.title,
          URL: post.link,
          PrimaryKeyword: post.focuskw,
          PublishedDate: post.date.split("T")[0]
        };
        
        // Log to db
        await addPublishedPost(newPostData);
        newLivePostsLog.push(newPostData);
        
        // Slack notify
        await notifyLive(post.title, post.link, post.focuskw);
        
        await logEvent("Live Check", "SUCCESS", `Logged published post: '${post.title}'`);
      }
    }
    
    if (newLivePostsLog.length === 0) {
      await logEvent("Live Check", "INFO", "WordPress posts and database log are fully synchronized. No new live posts detected.");
    }
    
    return { success: true, loggedCount: newLivePostsLog.length, newPosts: newLivePostsLog };
  } catch (error: any) {
    await logEvent("Live Check", "FAILED", `Post live sync check crashed: ${error.message}`, error);
    return { success: false, loggedCount: 0, error: error.message };
  }
}

// 7. MONTHLY REPORT GENERATOR RUNNER (N8N Node: 1st of Month Trigger)
export async function runMonthlySEOReport(): Promise<{ success: boolean; report?: string; error?: string }> {
  await logEvent("SEO Report", "INFO", "Starting monthly Search Console performance analysis and report generation...");
  
  try {
    // A. Fetch GSC CSV text
    const csvData = await getGSCPerformance();
    if (!csvData || csvData.trim() === "") {
      await logEvent("SEO Report", "FAILED", "GSC Performance data is missing. Sent a Slack reminder to Navnish.");
      await remindGSC();
      return { success: false, error: "GSC CSV Performance data is missing." };
    }
    
    // B. Fetch published posts this month
    const publishedPosts = await getPublishedPosts();
    const postsText = publishedPosts.map(p => `- Title: "${p.Title}", Keyword: "${p.PrimaryKeyword}", Published: ${p.PublishedDate}`).join("\n");
    
    // C. Call Gemini to analyze and generate report
    await logEvent("SEO Report", "INFO", "Submitting Search Console data to Gemini for analysis...");
    const report = await generateMonthlyReport(csvData, postsText);
    
    await logEvent("SEO Report", "SUCCESS", "Concise monthly SEO Report successfully generated.", report);
    
    // D. Dispatch Report via Slack
    await sendMonthlyReport(report);
    await logEvent("SEO Report", "INFO", "Dispatched report to Sheetal on Slack.");
    
    return { success: true, report };
  } catch (error: any) {
    await logEvent("SEO Report", "FAILED", `Failed to generate monthly SEO report: ${error.message}`, error);
    return { success: false, error: error.message };
  }
}
