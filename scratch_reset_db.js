const { MongoClient } = require('mongodb');
const uri = "mongodb://127.0.0.1:27017/auto_blog";
const client = new MongoClient(uri);
async function run() {
  await client.connect();
  const db = client.db();
  await db.collection('topic_ideas').deleteMany({});
  await db.collection('content_pipeline').deleteMany({});
  await db.collection('cron_logs').deleteMany({});
  await db.collection('published_posts').deleteMany({});
  console.log("DB Reset Complete");
  await client.close();
}
run();
