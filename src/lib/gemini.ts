const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAV5MV_8rIKI_q7AYulglHKrtJH10N_RsM";

// List of official model endpoint aliases to ensure compatibility
const MODEL_ENDPOINTS = [
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
];

async function callGemini(prompt: string, jsonResponse: boolean = true, mockType: string = "topics"): Promise<string> {
  const payload: any = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: jsonResponse ? 0.4 : 0.7,
    }
  };

  let lastError = null;

  // Attempt requests across supported model aliases
  for (const baseEndpoint of MODEL_ENDPOINTS) {
    const url = `${baseEndpoint}?key=${GEMINI_API_KEY}`;
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 60000); // 60s timeout per endpoint

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(id);

      if (!res.ok) {
        const errText = await res.text();
        lastError = new Error(`Gemini API Error (${baseEndpoint}): ${res.status} - ${errText}`);
        continue;
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        lastError = new Error("No text response from Gemini API");
        continue;
      }
      return text;
    } catch (error: any) {
      lastError = error;
    }
  }

  console.error("⚠️ External Gemini API key unreachable or unauthorized.", lastError);
  throw lastError || new Error("External Gemini API key unreachable or unauthorized.");
}

// 1. Topic generation
export interface TopicIdea {
  topic_title: string;
  target_keyword: string;
  suggested_angle: string;
}

export async function generateTopics(publishedTitles: string, monthlyBrief: string): Promise<TopicIdea[]> {
  const prompt = `Act as a senior SEO strategist and content director for Seamless Assist.

ABOUT SEAMLESS ASSIST:
We are an AI-powered operations company that does two things no one else does together: we build automation systems for business operations, and we place AI-certified staff who can run those systems. We are not a VA agency. We are not an automation consultancy. We are both — and that is our moat.

OUR PRIMARY ICP RIGHT NOW:
Real estate businesses — brokers, property managers, transaction coordinators. Picture a broker managing 6 active listings with an inbox that never empties, a TC juggling 15 transactions in different stages, a property manager fielding maintenance calls at 9pm. These are our readers.

Secondary: Small business owners in any industry who are actively trying to automate repetitive work and reduce dependence on manual processes.
Tertiary: Wellness clinics and boutique gym operators dealing with front desk chaos, appointment management, and billing admin.

YOUR TASK:
Generate exactly 20 blog topic ideas: 8 TOFU, 7 MOFU, 5 BOFU.

For each topic provide:
1. Blog title
2. Primary SEO keyword
3. Secondary keywords (2-3)
4. Search intent
5. Competition level (Low / Medium / High)
6. Traffic potential (Low / Medium / High)
7. Trend direction
8. Why this matters for our specific ICP (name which ICP segment)
9. Funnel stage
10. CTA angle — must sound like an operator talking to an operator, not a sales pitch
11. Repurposing opportunities for LinkedIn (Navnish runs all content solo — prioritize formats one person can execute quickly)

VOICE STANDARD FOR CTAS AND ANGLES:
Direct, specific, a little impatient with wasted time. An expert who has seen the operational chaos and knows exactly what fixes it. Never hype-y. Never generic.

PRIORITIZE:
- Low-to-medium competition keywords with strong business or automation intent
- Topics that position us as the intersection of AI talent + automation infrastructure (not just VA placement)
- Real estate operational pain points
- Founder/operator burnout from manual work

AVOID:
- Topics any generic VA company could publish
- Pure staffing content with no automation angle
- Overly technical engineering content without operational relevance
- Generic AI topics with no specific business application

OUTPUT FORMAT (CRITICAL FOR SYSTEM PARSING):
You MUST respond with a single, raw, valid JSON array containing exactly 20 objects. Do not wrap in markdown blocks or add any commentary outside the JSON array.
JSON keys must be exactly: 
- "topic_title": The blog title. (For your top 5 picks, prefix the title with '★').
- "target_keyword": The primary SEO keyword.
- "suggested_angle": A detailed string combining ALL other requested fields (Secondary keywords, Search intent, Competition, Traffic, Trend, Why this matters, Funnel stage, CTA angle, Repurposing). Format this clearly. For your top 5 picks, include the 1-sentence explanation of why it made the cut at the very beginning of this field.

Sort the array: TOFU first, then MOFU, then BOFU.

ALREADY PUBLISHED: ${publishedTitles || "None"}
MONTHLY BRIEF CONTEXT: ${monthlyBrief || "None"}`;

  const responseText = await callGemini(prompt, true, "topics");
  try {
    const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Failed to parse topics JSON:", responseText);
    throw new Error("Gemini returned invalid JSON format for topics.");
  }
}

// 2. SEO Brief generation
export interface SEOBrief {
  post_title: string;
  primary_keyword: string;
  angle: string;
  target_persona: string;
  search_intent: string;
}

export async function generateBrief(topicTitle: string, targetKeyword: string, suggestedAngle: string): Promise<SEOBrief> {
  const prompt = `You are the Lead SEO Strategist for Seamless Assist.

YOUR TASK: Create a comprehensive SEO Brief for this approved blog topic.

SEAMLESS ASSIST CONTEXT:
- Core offer: AI Automation Services and AI-certified Virtual Assistants.
- Target audience: Real Estate Businesses and Small Businesses Seeking Automation.
- CTA: Always the free 60-minute AI Operations Audit

OUTPUT FORMAT — respond with a single, raw, valid JSON object containing: post_title, primary_keyword, angle, target_persona, search_intent. Output only the JSON object:

APPROVED TOPIC: ${topicTitle}
PRIMARY KEYWORD: ${targetKeyword}
SUGGESTED ANGLE: ${suggestedAngle}`;

  const responseText = await callGemini(prompt, true, "brief");
  try {
    const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Failed to parse brief JSON:", responseText);
    throw new Error("Gemini returned invalid JSON format for Brief.");
  }
}

// 3. SEO Brief Re-generation
export async function regenerateBrief(originalBriefJson: string, feedback: string): Promise<SEOBrief> {
  const prompt = `The previous SEO brief was rejected by Navnish. Your task is to rewrite the brief fully incorporating Navnish's feedback.

Respond ONLY with a JSON object in this exact format containing the updated keys: post_title, primary_keyword, angle, target_persona, search_intent.

Original Brief: ${originalBriefJson}
Feedback: ${feedback}`;

  const responseText = await callGemini(prompt, true, "brief");
  try {
    const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Failed to parse regenerated brief JSON:", responseText);
    throw new Error("Gemini returned invalid JSON format for regenerated Brief.");
  }
}

// 4. Draft Generation with Self Check
export interface DraftSelfCheck {
  primary_keyword_in_h1: boolean;
  primary_keyword_in_first_100_words: boolean;
  cta_appears_3_times: boolean;
  industry_specific_examples: number;
  banned_phrases_used: string[];
  word_count: number;
  word_count_in_range: boolean;
}

export interface DraftResponse {
  title: string;
  meta_description: string;
  primary_keyword: string;
  body_html: string;
  self_check: DraftSelfCheck;
}

export async function generateDraft(briefJson: string, navnishNotes: string, feedback: string = ""): Promise<DraftResponse> {
  const prompt = `You are the blog writer for Seamless Assist — an operations company sitting at the intersection of AI-fluent human talent and automation infrastructure.

BRAND VOICE:
- Direct, warm, and operator-to-operator.
- Short paragraphs. Active voice. No fluff, no hype.
- Reliable, Premium, Client-centric.

BANNED PHRASES:
"In conclusion", "Delve into", "Leverage", "Synergy", "Game-changer", "Holistic approach"

SEO RULES:
1. Primary keyword: in H1, in first 100 words, naturally 3-5x in body.
2. Word count: 1,200-1,800 words.

OUTPUT FORMAT — respond with a single, raw, valid JSON object matching keys: title (string), meta_description (string), primary_keyword (string), body_html (string), self_check (object containing: primary_keyword_in_h1 (boolean), primary_keyword_in_first_100_words (boolean), cta_appears_3_times (boolean), industry_specific_examples (integer count, e.g., 2), banned_phrases_used (array of strings, empty array [] if none), word_count (integer count), word_count_in_range (boolean)). Output only the JSON object:

BRIEF: ${briefJson}
NOTES: ${navnishNotes || "None"}
FEEDBACK: ${feedback || "None"}`;

  const responseText = await callGemini(prompt, true, "draft");
  try {
    const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Failed to parse draft JSON:", responseText);
    throw new Error("Gemini returned invalid JSON format for blog Draft.");
  }
}

// 5. Performance Report Generation
export async function generateMonthlyReport(gscCsvData: string, monthlyPosts: string): Promise<string> {
  const prompt = `You are the SEO analyst for Seamless Assist. Analyse the Google Search Console data and produce a concise monthly report in plain English. Keep under 300 words. Sheetal is audience.
  
  GSC DATA: ${gscCsvData}
  POSTS: ${monthlyPosts}`;

  return await callGemini(prompt, false, "report");
}
