import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "seamless_assist_super_secret_jwt_key_2026";
// Ensure secret is 32 bytes for AES-256
const ENCRYPTION_KEY = crypto.createHash("sha256").update(JWT_SECRET).digest();
const IV_LENGTH = 16; // AES IV length

export interface SessionUser {
  id: string;
  username: string;
  role: string;
}

// AES-256-CBC Symmetric Encryption for zero-dependency sessions
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export function decrypt(text: string): string {
  const textParts = text.split(":");
  const ivPart = textParts.shift();
  if (!ivPart) throw new Error("Invalid session token format");
  
  const iv = Buffer.from(ivPart, "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText, undefined, "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// Sets session data inside a secure HttpOnly cookie
export async function createSession(user: SessionUser) {
  const sessionData = JSON.stringify({
    user,
    expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  });
  
  const token = encrypt(sessionData);

  const cookieStore = await cookies();
  cookieStore.set("seamless_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    path: "/",
  });
}

// Clears the session cookie
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.set("seamless_session", "", { expires: new Date(0), path: "/" });
}

// Verifies session cookie and returns decoded user session
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("seamless_session")?.value;
  if (!sessionToken) return null;
  
  try {
    const decryptedData = decrypt(sessionToken);
    const parsed = JSON.parse(decryptedData);
    
    // Check expiration
    if (Date.now() > parsed.expires) {
      return null;
    }
    
    return parsed.user as SessionUser;
  } catch (err) {
    return null;
  }
}

// Helper to check authentication inside Route Handlers
export async function checkAuth(req: NextRequest): Promise<SessionUser | null> {
  return await getSession();
}
