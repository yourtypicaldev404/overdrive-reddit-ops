
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCode } from "@/lib/reddit";

export async function GET(req: Request) {
  const u = new URL(req.url);
  const code = u.searchParams.get("code");
  const state = u.searchParams.get("state");
  const c = await cookies();
  const expected = c.get("od_reddit_state")?.value;
  if (!code || !state || !expected || state !== expected) {
    return NextResponse.redirect(new URL("/?error=reddit_oauth_state", req.url));
  }
  try {
    const token = await exchangeCode(code);
    c.set("od_reddit_access", token.access_token, {httpOnly:true, secure:true, sameSite:"lax", path:"/", maxAge:token.expires_in});
    c.set("od_reddit_exp", String(Date.now()+token.expires_in*1000), {httpOnly:true, secure:true, sameSite:"lax", path:"/", maxAge:token.expires_in});
    if (token.refresh_token) {
      c.set("od_reddit_refresh", token.refresh_token, {httpOnly:true, secure:true, sameSite:"lax", path:"/", maxAge:60*60*24*365});
    }
    c.delete("od_reddit_state");
    return NextResponse.redirect(new URL("/?connected=1", req.url));
  } catch {
    return NextResponse.redirect(new URL("/?error=reddit_oauth_failed", req.url));
  }
}
