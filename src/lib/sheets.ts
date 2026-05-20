import { connectToDatabase } from "./db";
import { ObjectId } from "mongodb";

function toIdQuery(id: string) {
  try {
    return { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
  } catch {
    return { _id: id };
  }
}

export interface PublishedPost {
  _id?: string;
  Title: string;
  URL: string;
  PrimaryKeyword: string;
  PublishedDate: string;
}

export interface StrategyNote {
  _id?: string;
  Month: string;
  Notes: string;
  createdAt?: Date;
}

export interface TopicIdeaRow {
  _id?: string;
  TopicTitle: string;
  TargetKeyword: string;
  SuggestedAngle: string;
  TopicStatus: "Pending Selection" | "Approved";
  CreatedDate: string;
}

export interface ContentPipelineRow {
  _id?: string;
  post_title: string;
  primary_keyword: string;
  angle: string;
  full_brief_json: string; // Stringified SEOBrief
  brief_status: "Pending Review" | "Approved" | "Rejected" | "Drafting" | "Completed";
  week_of: string;
  post_status: "In Review" | "Scheduled" | "Published";
  wordpress_post_id?: string;
  wordpress_edit_url?: string;
  navnish_notes?: string;
}

export interface GSCPerformanceRow {
  _id?: string;
  CSVText: string;
  uploadedAt: Date;
}

// 1. Published Posts
export async function getPublishedPosts(): Promise<PublishedPost[]> {
  const { db } = await connectToDatabase();
  return await db.collection("published_posts").find({}).sort({ PublishedDate: -1 }).toArray();
}

export async function addPublishedPost(post: Omit<PublishedPost, "_id">): Promise<void> {
  const { db } = await connectToDatabase();
  await db.collection("published_posts").insertOne(post);
}

// 2. Monthly Strategy
export async function getMonthlyStrategy(): Promise<StrategyNote> {
  const { db } = await connectToDatabase();
  const note = await db.collection("monthly_strategy").findOne({});
  if (!note) {
    const initialNote: StrategyNote = {
      Month: "May 2026",
      Notes: "This month we need to focus heavily on long-tail keywords for Fitness Studio owners and Health Coaches who are struggling with admin overload. Highlight how AI operators handle scheduling, client cancellations, and lead follow-ups. Promote our free 60-minute AI Operations Audit.",
      createdAt: new Date()
    };
    await db.collection("monthly_strategy").insertOne(initialNote);
    return initialNote;
  }
  return note;
}

export async function updateMonthlyStrategy(notes: string): Promise<void> {
  const { db } = await connectToDatabase();
  await db.collection("monthly_strategy").updateOne(
    {},
    { $set: { Notes: notes, updatedAt: new Date() } },
    { upsert: true }
  );
}

// 3. Topic Ideas
export async function getTopicIdeas(): Promise<TopicIdeaRow[]> {
  const { db } = await connectToDatabase();
  return await db.collection("topic_ideas").find({}).sort({ CreatedDate: -1 }).toArray();
}

export async function appendTopicIdeas(topics: Omit<TopicIdeaRow, "_id">[]): Promise<void> {
  const { db } = await connectToDatabase();
  await db.collection("topic_ideas").insertMany(topics);
}

export async function updateTopicStatus(id: string, status: "Approved" | "Pending Selection"): Promise<void> {
  const { db } = await connectToDatabase();
  await db.collection("topic_ideas").updateOne(
    toIdQuery(id),
    { $set: { TopicStatus: status } }
  );
}

// 4. Content Pipeline
export async function getContentPipeline(): Promise<ContentPipelineRow[]> {
  const { db } = await connectToDatabase();
  return await db.collection("content_pipeline").find({}).sort({ week_of: -1 }).toArray();
}

export async function appendPipelineRow(row: Omit<ContentPipelineRow, "_id">): Promise<string> {
  const { db } = await connectToDatabase();
  const res = await db.collection("content_pipeline").insertOne(row);
  return res.insertedId.toString();
}

export async function updatePipelineRow(id: string, updates: Partial<ContentPipelineRow>): Promise<void> {
  const { db } = await connectToDatabase();
  await db.collection("content_pipeline").updateOne(
    toIdQuery(id),
    { $set: { ...updates, updatedAt: new Date() } }
  );
}

export async function deletePipelineRow(id: string): Promise<void> {
  const { db } = await connectToDatabase();
  await db.collection("content_pipeline").deleteOne(toIdQuery(id));
}

// 5. GSC Performance
export async function getGSCPerformance(): Promise<string> {
  const { db } = await connectToDatabase();
  const row = await db.collection("gsc_performance").findOne({});
  return row ? row.CSVText : "";
}

export async function saveGSCPerformance(csvText: string): Promise<void> {
  const { db } = await connectToDatabase();
  await db.collection("gsc_performance").updateOne(
    {},
    { $set: { CSVText: csvText, uploadedAt: new Date() } },
    { upsert: true }
  );
}
