
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { redditAuthUrl, redditConfigured } from "@/lib/reddit";
import crypto from "crypto";

export async function GET(req: Request) {
  if (!redditConfigured()) {
    return NextResponse.redirect(new URL("/?error=reddit_not_configured", req.url));
  }
  const state = crypto.randomBytes(24).toString("hex");
  const c = await cookies();
  c.set("od_reddit_state", state, {httpOnly:true, secure:true, sameSite:"lax", path:"/", maxAge:600});
  return NextResponse.redirect(redditAuthUrl(state));
}
