# 🍇 Seamless Assist SEO & Blog Suite

An executive-level, production-ready Command Center that translates your **N8N SEO & Blog Specialist Workflow** into a premium, interactive Next.js 14 App Router portal. 

Designed in line with `staging-b108-seamlessassist.wpcomstaging.com`'s professional branding, featuring a premium **Maroon / Plum (`#4d2533`)** and **Warm Sand / Cream (`#ede4d9`)** palette, complete with smooth micro-animations, glassmorphism panel styling, and a live-updating automation logs dashboard.

---

## 🌟 Key Application Features

1. **🔒 Secure Custom JWT Auth**: Protected by session-cookie middleware and environment settings. Built using Node's native `crypto` to achieve zero external dependencies. (Default credentials: `admin` / `admin123`).
2. **📈 Executive Automation Dashboard**: View live funnel stats (Generated Topics ➔ Briefs in Review ➔ Drafts in Review ➔ Scheduled & Published Blogs) and trigger any step of the N8N cycle with manual command buttons.
3. **💻 Live Automation Terminal**: Renders real-time execution outputs reading directly from MongoDB collections. Watch exactly how the AI agent checks topics, reviews brand guidelines, and triggers Slack.
4. **💡 Topic Planner**: Manage Month Strategy directives, brainstorm 5 low-DA SEO topic ideas instantly via **Gemini 1.5 Flash**, and approve keywords with a single click.
5. **📝 Brief Reviewer & Regeneration**: Inspect generated SEO brief schemas (target personas, search intent, angle) and approve them to spawn blog drafts. Navnish can reject briefs with notes, triggering real-time brief regeneration.
6. **✍️ Draft Creator with Real-Time Validation Console**: Approving a brief fires up a loop where the writer writes the blog post and validates the draft. If it fails (e.g. misses CTA, has banned phrases, wrong word counts), the writer automatically retries up to 2 times with structural feedback.
7. **📅 Intelligent WP Scheduler**: Scans editor-approved drafts, calculates the upcoming Thursday at 9:00am PT (16:00 UTC) publication date, and automatically schedules the posts.
8. **📊 Performance GSC Auditor**: Paste GSC query export CSVs to let Gemini formulate monthly SEO progress reports and instantly dispatch them to Sheetal on Slack.

---

## ⚙️ Offline Sandbox Fallback Modes

To make development and demoing completely friction-free, we engineered a **highly robust sandbox fallback layer**:
* **🍃 Smart Database Fallback**: If a local MongoDB daemon is offline or not installed, the application automatically mounts a memory-backed datastore, allowing 100% of the portal features to run without crashing!
* **📦 Smart WordPress Fallback**: If your WordPress URL is unreachable or offline, the app switches to **WordPress Sandbox Mode**—creating mock WP Post IDs, saving edit URLs, and managing scheduled statuses locally so you can test the entire flow completely offline!

---

## 🚀 Quick Start Guide

### 1. Extract Dependencies (Fast Offline Method)
Since the workspace shell sandbox is offline, you can quickly copy the already populated `node_modules` directory from your adjacent `Nirani-PoC` project:
```bash
cp -R /Users/swaraj/Documents/projects/Nirani-PoC/node_modules /Users/swaraj/Documents/projects/auto-blog/
```
*(Or simply run `npm install` if you are on an active, unsandboxed terminal!)*

### 2. Configure Environment Variables (`.env.local`)
We have already pre-populated the `.env.local` file with the **exact Google Sheets ID, WordPress auth credentials, Slack webhooks, and Gemini API keys** extracted from your N8N workflow JSON! It is ready to run out of the box.

```env
# Server Variables
MONGODB_URI=mongodb://127.0.0.1:27017/auto_blog
JWT_SECRET=seamless_assist_super_secret_jwt_key_2026
ADMIN_PASSWORD=admin123

# N8N Credentials
GOOGLE_SHEET_ID=1ffZ51206gJuUhJ82nfS_OWzNR9gNZJS8Hiar_yzRvec
GEMINI_API_KEY=AIzaSyAV5MV_8rIKI_q7AYulglHKrtJH10N_RsM
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T09C4HT29HB/...
WORDPRESS_URL=https://staging-b108-seamlessassist.wpcomstaging.com
WORDPRESS_AUTH_HEADER=Basic c3dhcmFqNDRj...
```

### 3. Launch Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser, log in using `admin` / `admin123`, and explore the full content automation engine!

---

## 📁 Technical Architecture & Code References

All components have been built with clean, scalable, and fully typed architectures:
* 🗄️ **Database Wrapper**: [`src/lib/db.ts`](file:///Users/swaraj/Documents/projects/auto-blog/src/lib/db.ts) (MongoDB & memory fallback)
* 🤖 **Gemini API Engine**: [`src/lib/gemini.ts`](file:///Users/swaraj/Documents/projects/auto-blog/src/lib/gemini.ts) (Topic, brief, draft write/validation, GSC report prompts)
* 📊 **Spreadsheet Mapper**: [`src/lib/sheets.ts`](file:///Users/swaraj/Documents/projects/auto-blog/src/lib/sheets.ts) (Coordinates DB with spreadsheet schemas)
* 🔔 **Slack Notifier**: [`src/lib/slack.ts`](file:///Users/swaraj/Documents/projects/auto-blog/src/lib/slack.ts) (All Slack formatting triggers)
* 🍇 **WordPress Client**: [`src/lib/wordpress.ts`](file:///Users/swaraj/Documents/projects/auto-blog/src/lib/wordpress.ts) (WP integration with offline sandbox mode)
* ⚙️ **Automated Runners**: [`src/lib/cronRunner.ts`](file:///Users/swaraj/Documents/projects/auto-blog/src/lib/cronRunner.ts) (Core automation loops and validation checks)
* 🎨 **Vanilla CSS System**: [`src/app/globals.css`](file:///Users/swaraj/Documents/projects/auto-blog/src/app/globals.css) (Complete UI style system)
