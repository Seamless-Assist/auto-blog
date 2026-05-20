import { connectToDatabase } from "./db";

// Helper function to dynamically retrieve active WordPress Staging credentials
async function getWPSettings() {
  const { db } = await connectToDatabase();
  const settings = await db.collection("settings").findOne({ _id: "global_settings" });
  
  // Use Swaraj's staging URL as the primary default endpoint!
  const url = settings?.wordpressUrl?.includes("staging") ? settings.wordpressUrl : "https://staging-b108-seamlessassist.wpcomstaging.com";
  const auth = settings?.wordpressAuthHeader || process.env.WORDPRESS_AUTH_HEADER || "Basic c3dhcmFqNDRjNjZkNmZkMzp2ZUM3IHNzQkogTTJSSyBDRkVaIHI1QUogOXNXUA==";
  
  const headers = {
    "Content-Type": "application/json",
    "Authorization": auth,
  };
  
  return { url, auth, headers };
}

// Elegant Mock Database interface to track WP Posts in local sandbox
interface MockWPPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  status: "draft" | "pending" | "future" | "publish";
  excerpt: string;
  categories: string[];
  date: string;
  link: string;
  meta: any;
}

async function getMockWPPromise(collection: string) {
  const { db } = await connectToDatabase();
  return db.collection(collection);
}

// Check if WP site is reachable
async function isWPReachable(): Promise<boolean> {
  try {
    const { url, headers } = await getWPSettings();
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2000); // 2s timeout

    const res = await fetch(`${url}/wp-json/wp/v2/posts?per_page=1`, {
      method: "GET",
      headers,
      signal: controller.signal
    });
    clearTimeout(id);
    return res.ok;
  } catch {
    return false;
  }
}

// Helper function to execute local mock draft creation
async function executeLocalMockDraft(title: string, bodyHtml: string, metaDescription: string, primaryKeyword: string, selfCheckJson: any) {
  const { url } = await getWPSettings();
  console.warn("⚠️ WordPress Basic Auth rejected or site unreachable. Simulating draft creation in Local Sandbox Mode.");
  const wpId = Math.floor(Math.random() * 900) + 100;
  const mockLink = `${url}/?p=${wpId}`;
  
  // Save to local mock WordPress DB inside MongoDB
  const mockPost: MockWPPost = {
    id: wpId,
    title: { rendered: title },
    content: { rendered: bodyHtml },
    status: "draft",
    excerpt: metaDescription,
    categories: ["Blog", "Wellness Operations"],
    date: new Date().toISOString(),
    link: mockLink,
    meta: {
      _yoast_wpseo_metadesc: metaDescription,
      _yoast_wpseo_focuskw: primaryKeyword,
      _brief_self_check: JSON.stringify(selfCheckJson)
    }
  };
  
  const db = await getMockWPPromise("mock_wp_posts");
  await db.insertOne(mockPost);
  
  return { id: wpId, link: mockLink, isMock: true };
}

// 1. Create a draft in WordPress
export async function createWPDraft(title: string, bodyHtml: string, metaDescription: string, primaryKeyword: string, selfCheckJson: any): Promise<{ id: number; link: string; isMock: boolean }> {
  const { url, headers } = await getWPSettings();
  const reachable = await isWPReachable();
  if (!reachable) {
    return await executeLocalMockDraft(title, bodyHtml, metaDescription, primaryKeyword, selfCheckJson);
  }

  // Real WordPress Call Attempt on Staging Site
  const targetUrl = `${url}/wp-json/wp/v2/posts`;
  const payload = {
    title,
    content: bodyHtml,
    status: "draft",
    excerpt: metaDescription,
    meta: {
      _yoast_wpseo_metadesc: metaDescription,
      _yoast_wpseo_focuskw: primaryKeyword,
      _brief_self_check: JSON.stringify(selfCheckJson)
    }
  };

  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn(`⚠️ Real WordPress API returned ${res.status}: ${text}. Seamlessly transitioning to Local Sandbox Mode.`);
      return await executeLocalMockDraft(title, bodyHtml, metaDescription, primaryKeyword, selfCheckJson);
    }

    const data = await res.json();
    return { id: data.id, link: data.link, isMock: false };
  } catch (error: any) {
    console.warn(`⚠️ Real WordPress API network call failed: ${error.message}. Seamlessly transitioning to Local Sandbox Mode.`);
    return await executeLocalMockDraft(title, bodyHtml, metaDescription, primaryKeyword, selfCheckJson);
  }
}

// Helper function for local pending posts
async function executeLocalMockPending() {
  console.log("ℹ️ Fetching pending posts from Local Sandbox Mock.");
  const db = await getMockWPPromise("mock_wp_posts");
  const posts = await db.find({ status: { $in: ["draft", "pending"] } }).toArray();
  return posts.map((p: any) => ({
    id: p.id,
    title: p.title?.rendered || "Untitled Post",
    link: p.link,
    isMock: true
  }));
}

// 2. Fetch pending posts (Approved and waiting to be scheduled)
export async function fetchWPPendingPosts(): Promise<{ id: number; title: string; link: string; isMock: boolean }[]> {
  const localPosts = await executeLocalMockPending();
  const { url, headers } = await getWPSettings();
  const reachable = await isWPReachable();
  if (!reachable) {
    return localPosts;
  }

  const targetUrl = `${url}/wp-json/wp/v2/posts?status=pending`;
  try {
    const res = await fetch(targetUrl, { method: "GET", headers });
    if (!res.ok) {
      return localPosts;
    }
    const remotePosts = await res.json();
    if (!Array.isArray(remotePosts)) {
      return localPosts;
    }
    const formattedRemote = remotePosts.map((p: any) => ({
      id: p.id,
      title: p.title?.rendered,
      link: p.link,
      isMock: false
    }));
    return [...localPosts, ...formattedRemote];
  } catch (error) {
    return localPosts;
  }
}

// Helper: Transition a local mock draft to pending status so it can be scheduled
export async function setMockPostPending(id: number): Promise<void> {
  const db = await getMockWPPromise("mock_wp_posts");
  await db.updateOne({ id }, { $set: { status: "pending" } });
}

// Helper: Transition a local mock draft to publish status so it can be logged
export async function setMockPostPublished(id: number): Promise<void> {
  const db = await getMockWPPromise("mock_wp_posts");
  await db.updateOne({ id }, { $set: { status: "publish", date: new Date().toISOString() } });
}

// Helper for local mock scheduling
async function executeLocalMockSchedule(postId: number, scheduledDateIso: string) {
  const { url } = await getWPSettings();
  console.warn(`⚠️ Simulating scheduling for WP Post ID ${postId} on ${scheduledDateIso} locally.`);
  const db = await getMockWPPromise("mock_wp_posts");
  await db.updateOne(
    { id: postId },
    { $set: { status: "future", date: scheduledDateIso } }
  );
  return { id: postId, status: "future", date: scheduledDateIso, isMock: true };
}

// 3. Schedule a post (Transition status from pending to future with target date)
export async function scheduleWPPost(postId: number, scheduledDateIso: string): Promise<{ id: number; status: string; date: string; isMock: boolean }> {
  const { url, headers } = await getWPSettings();
  const reachable = await isWPReachable();
  if (!reachable) {
    return await executeLocalMockSchedule(postId, scheduledDateIso);
  }

  const targetUrl = `${url}/wp-json/wp/v2/posts/${postId}`;
  const payload = {
    status: "future",
    date: scheduledDateIso
  };

  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.warn(`⚠️ Real WordPress API returned ${res.status}. Seamlessly transitioning to Local Sandbox Mode.`);
      return await executeLocalMockSchedule(postId, scheduledDateIso);
    }

    const data = await res.json();
    return { id: data.id, status: data.status, date: data.date, isMock: false };
  } catch (error) {
    console.warn("⚠️ Real WordPress API network call failed. Seamlessly transitioning to Local Sandbox Mode.");
    return await executeLocalMockSchedule(postId, scheduledDateIso);
  }
}

// Helper for local mock live posts
async function executeLocalMockLive() {
  console.log("ℹ️ Fetching published posts from Local Sandbox Mock.");
  const db = await getMockWPPromise("mock_wp_posts");
  const posts = await db.find({ status: "publish" }).toArray();
  if (posts.length === 0) return [];
  return posts.map((p: any) => ({
    id: p.id,
    title: p.title?.rendered || "Untitled Live Blog",
    link: p.link,
    date: p.date,
    focuskw: p.meta?._yoast_wpseo_focuskw || "wellness operations efficiency",
    isMock: true
  }));
}

// 4. Fetch published posts (Recent live blogs)
export async function fetchWPLivePosts(): Promise<{ id: number; title: string; link: string; date: string; focuskw: string; isMock: boolean }[]> {
  const { url, headers } = await getWPSettings();
  const reachable = await isWPReachable();
  if (!reachable) {
    return await executeLocalMockLive();
  }

  const targetUrl = `${url}/wp-json/wp/v2/posts?status=publish&per_page=5`;
  try {
    const res = await fetch(targetUrl, { method: "GET", headers });
    if (!res.ok) {
      console.warn(`⚠️ Real WordPress API returned ${res.status}. Seamlessly transitioning to Local Sandbox Mode.`);
      return await executeLocalMockLive();
    }
    const posts = await res.json();
    return posts.map((p: any) => ({
      id: p.id,
      title: p.title?.rendered,
      link: p.link,
      date: p.date,
      focuskw: p.meta?._yoast_wpseo_focuskw || "Seamless Assist",
      isMock: false
    }));
  } catch (error) {
    console.warn("⚠️ Real WordPress API network call failed. Seamlessly transitioning to Local Sandbox Mode.");
    return await executeLocalMockLive();
  }
}
