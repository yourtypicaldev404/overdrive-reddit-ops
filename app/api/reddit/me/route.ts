
import { NextResponse } from "next/server";
import { getTokenFromCookies, redditMe, redditConfigured } from "@/lib/reddit";
export async function GET() {
  if (!redditConfigured()) return NextResponse.json({configured:false, connected:false});
  const access = await getTokenFromCookies();
  if (!access) return NextResponse.json({configured:true, connected:false});
  try {
    const me = await redditMe(access);
    return NextResponse.json({configured:true, connected:true, name:me.name, karma:(me.link_karma||0)+(me.comment_karma||0)});
  } catch {
    return NextResponse.json({configured:true, connected:false});
  }
}
