
import { cookies } from "next/headers";

const REDDIT = "https://www.reddit.com";
const OAUTH = "https://oauth.reddit.com";

export function redditConfigured() {
  return Boolean(
    process.env.REDDIT_CLIENT_ID &&
    process.env.REDDIT_CLIENT_SECRET &&
    process.env.REDDIT_REDIRECT_URI
  );
}

export function redditAuthUrl(state: string) {
  const p = new URLSearchParams({
    client_id: process.env.REDDIT_CLIENT_ID || "",
    response_type: "code",
    state,
    redirect_uri: process.env.REDDIT_REDIRECT_URI || "",
    duration: "permanent",
    scope: "identity submit",
  });
  return `${REDDIT}/api/v1/authorize?${p.toString()}`;
}

export async function exchangeCode(code: string) {
  const id = process.env.REDDIT_CLIENT_ID!;
  const secret = process.env.REDDIT_CLIENT_SECRET!;
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.REDDIT_REDIRECT_URI!,
  });
  const res = await fetch(`${REDDIT}/api/v1/access_token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "OverdriveRedditOps/0.1 by Overdrive",
    },
    body,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Reddit token exchange failed (${res.status})`);
  return res.json() as Promise<{access_token:string; refresh_token?:string; expires_in:number}>;
}

export async function refreshAccessToken(refreshToken: string) {
  const id = process.env.REDDIT_CLIENT_ID!;
  const secret = process.env.REDDIT_CLIENT_SECRET!;
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const res = await fetch(`${REDDIT}/api/v1/access_token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "OverdriveRedditOps/0.1 by Overdrive",
    },
    body,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Reddit token refresh failed (${res.status})`);
  return res.json() as Promise<{access_token:string; expires_in:number}>;
}

export async function getTokenFromCookies() {
  const c = await cookies();
  let access = c.get("od_reddit_access")?.value;
  const refresh = c.get("od_reddit_refresh")?.value;
  const expires = Number(c.get("od_reddit_exp")?.value || "0");
  if (access && Date.now() < expires - 60_000) return access;
  if (!refresh) return null;
  const fresh = await refreshAccessToken(refresh);
  access = fresh.access_token;
  c.set("od_reddit_access", access, {httpOnly:true, secure:true, sameSite:"lax", path:"/", maxAge:fresh.expires_in});
  c.set("od_reddit_exp", String(Date.now() + fresh.expires_in*1000), {httpOnly:true, secure:true, sameSite:"lax", path:"/", maxAge:fresh.expires_in});
  return access;
}

export async function redditMe(access:string) {
  const res = await fetch(`${OAUTH}/api/v1/me`, {
    headers:{
      Authorization:`Bearer ${access}`,
      "User-Agent":"OverdriveRedditOps/0.1 by Overdrive",
    },
    cache:"no-store",
  });
  if (!res.ok) throw new Error(`Reddit identity failed (${res.status})`);
  return res.json();
}

export function postIdFromUrl(url:string) {
  try {
    const u = new URL(url);
    const m = u.pathname.match(/\/comments\/([a-z0-9]+)\//i);
    return m ? `t3_${m[1]}` : null;
  } catch {
    return null;
  }
}

export async function submitComment(access:string, thingId:string, text:string) {
  const body = new URLSearchParams({
    api_type:"json",
    thing_id:thingId,
    text,
    raw_json:"1",
  });
  const res = await fetch(`${OAUTH}/api/comment`, {
    method:"POST",
    headers:{
      Authorization:`Bearer ${access}`,
      "Content-Type":"application/x-www-form-urlencoded",
      "User-Agent":"OverdriveRedditOps/0.1 by Overdrive",
    },
    body,
    cache:"no-store",
  });
  const data = await res.json().catch(()=>({}));
  if (!res.ok) throw new Error(`Reddit comment failed (${res.status})`);
  const errors = data?.json?.errors;
  if (Array.isArray(errors) && errors.length) throw new Error(errors.map((e:any)=>e?.[1]||String(e)).join("; "));
  return data;
}
