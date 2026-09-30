
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
export async function POST(req:Request) {
  const c = await cookies();
  ["od_reddit_access","od_reddit_refresh","od_reddit_exp","od_reddit_state"].forEach(k=>c.delete(k));
  return NextResponse.json({ok:true});
}
