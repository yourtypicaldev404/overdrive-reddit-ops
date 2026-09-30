
import { NextResponse } from "next/server";
import { getTokenFromCookies, postIdFromUrl, submitComment } from "@/lib/reddit";

export async function POST(req:Request) {
  const access = await getTokenFromCookies();
  if (!access) return NextResponse.json({ok:false,error:"Connect Reddit first."},{status:401});
  const body = await req.json().catch(()=>({}));
  const url = String(body.url||"");
  const text = String(body.text||"").trim();
  const confirmed = body.confirmed === true;
  if (!confirmed) return NextResponse.json({ok:false,error:"Explicit confirmation is required."},{status:400});
  if (!text || text.length > 10000) return NextResponse.json({ok:false,error:"Invalid comment text."},{status:400});
  const thingId = postIdFromUrl(url);
  if (!thingId) return NextResponse.json({ok:false,error:"Could not read Reddit post ID from URL."},{status:400});
  try {
    await submitComment(access, thingId, text);
    return NextResponse.json({ok:true});
  } catch (e:any) {
    return NextResponse.json({ok:false,error:e?.message||"Posting failed."},{status:400});
  }
}
