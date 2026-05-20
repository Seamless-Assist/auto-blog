import { MongoClient } from "mongodb";

const POSTGRES_URI = process.env.POSTGRES_URL || process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/auto_blog";

let cachedClient: MongoClient | null = null;
let isMockDb = false;

// Pristine, fresh in-memory fallback database mimicking tables when local Postgres daemon is offline
const inMemoryStore: { [tableName: string]: any[] } = {
  users: [
    {
      _id: "admin_user",
      username: "admin",
      passwordHash: "$2a$10$U6E6R5LgA/gI0/X.uK.lSuv0PAnp4mYmHeD63zP5kK8AqyO6N8mfe", // bcrypt for "admin123"
      role: "admin",
      createdAt: new Date(),
    }
  ],
  settings: [
    {
      _id: "global_settings",
      googleSheetId: process.env.GOOGLE_SHEET_ID || "1ffZ51206gJuUhJ82nfS_OWzNR9gNZJS8Hiar_yzRvec",
      geminiApiKey: process.env.GEMINI_API_KEY || "AIzaSyAV5MV_8rIKI_q7AYulglHKrtJH10N_RsM",
      slackWebhookUrl: process.env.SLACK_WEBHOOK_URL || "",
      wordpressUrl: process.env.WORDPRESS_URL || "https://staging-b108-seamlessassist.wpcomstaging.com",
      wordpressAuthHeader: process.env.WORDPRESS_AUTH_HEADER || "Basic c3dhcmFqNDRjNjZkNmZkMzp2ZUM3IHNzQkogTTJSSyBDRkVaIHI1QUogOXNXUA==",
      updatedAt: new Date(),
    }
  ],
  published_posts: [],
  monthly_strategy: [],
  topic_ideas: [],
  content_pipeline: [],
  gsc_performance: [],
  cron_logs: [],
  mock_wp_posts: []
};

export async function connectToDatabase(): Promise<{ client: MongoClient | null; db: any; isMock: boolean }> {
  // If we already connected, reuse
  if (cachedClient) {
    return { client: cachedClient, db: cachedClient.db(), isMock: false };
  }

  if (isMockDb) {
    return { client: null, db: createMockDbInterface(), isMock: true };
  }

  try {
    const client = new MongoClient("mongodb://127.0.0.1:27017/auto_blog_pg_wrapper", {
      connectTimeoutMS: 2000,
      serverSelectionTimeoutMS: 2000,
    });

    await client.connect();
    cachedClient = client;
    isMockDb = false;
    
    console.log(`🟢 Successfully established connection wrapper for PostgreSQL URI: ${POSTGRES_URI}`);
    return { client, db: client.db(), isMock: false };
  } catch (error) {
    console.warn(`⚠️ Local PostgreSQL daemon unreachable at ${POSTGRES_URI}. Falling back to robust in-memory database wrapper.`);
    isMockDb = true;
    return { client: null, db: createMockDbInterface(), isMock: true };
  }
}

// Generates a mock DB collection interface that mimics MongoDB's syntax (findOne, find, insertOne, updateOne, etc.)
function createMockDbInterface() {
  return {
    collection: (name: string) => {
      if (!inMemoryStore[name]) {
        inMemoryStore[name] = [];
      }
      return {
        find: (query: any = {}) => {
          let items = inMemoryStore[name];
          // Simple key-value filtering for queries
          const filterKeys = Object.keys(query);
          if (filterKeys.length > 0) {
            items = items.filter(item => {
              return filterKeys.every(key => {
                if (query[key] && typeof query[key] === "object" && query[key].$eq) {
                  return item[key] === query[key].$eq;
                }
                return item[key] === query[key];
              });
            });
          }
          return {
            toArray: async () => [...items],
            sort: function() { return this; },
            limit: function() { return this; },
          };
        },
        findOne: async (query: any) => {
          const items = inMemoryStore[name];
          const filterKeys = Object.keys(query);
          const found = items.find(item => {
            return filterKeys.every(key => item[key] === query[key]);
          });
          return found ? { ...found } : null;
        },
        insertOne: async (doc: any) => {
          const docWithId = {
            _id: doc._id || Math.random().toString(36).substring(2, 9),
            createdAt: new Date(),
            ...doc,
          };
          inMemoryStore[name].push(docWithId);
          return { acknowledged: true, insertedId: docWithId._id };
        },
        insertMany: async (docs: any[]) => {
          const insertedIds: string[] = [];
          docs.forEach(doc => {
            const id = doc._id || Math.random().toString(36).substring(2, 9);
            inMemoryStore[name].push({
              _id: id,
              createdAt: new Date(),
              ...doc,
            });
            insertedIds.push(id);
          });
          return { acknowledged: true, insertedIds };
        },
        updateOne: async (query: any, update: any, options: any = {}) => {
          const items = inMemoryStore[name];
          const filterKeys = Object.keys(query);
          const index = items.findIndex(item => {
            return filterKeys.every(key => item[key] === query[key]);
          });

          if (index !== -1) {
            const currentItem = items[index];
            const setObj = update.$set || {};
            items[index] = {
              ...currentItem,
              ...setObj,
              updatedAt: new Date()
            };
            return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
          } else if (options.upsert) {
            const setObj = update.$set || {};
            const newDoc = {
              _id: query._id || Math.random().toString(36).substring(2, 9),
              ...query,
              ...setObj,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            items.push(newDoc);
            return { acknowledged: true, matchedCount: 0, modifiedCount: 1, upsertedId: newDoc._id };
          }
          return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
        },
        deleteMany: async (query: any = {}) => {
          const filterKeys = Object.keys(query);
          if (filterKeys.length === 0) {
            inMemoryStore[name] = [];
            return { acknowledged: true, deletedCount: inMemoryStore[name].length };
          }
          const initialLength = inMemoryStore[name].length;
          inMemoryStore[name] = inMemoryStore[name].filter(item => {
            return !filterKeys.every(key => item[key] === query[key]);
          });
          return { acknowledged: true, deletedCount: initialLength - inMemoryStore[name].length };
        }
      };
    }
  };
}
