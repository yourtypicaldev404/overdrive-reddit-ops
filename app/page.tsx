
"use client";
import { useEffect, useState } from "react";

type Lead = { url:string; title:string; subreddit:string; reason:string; draft:string };

const seed:Lead[] = [
  {
    url:"https://www.reddit.com/r/roadtrip/comments/1vdrx1z/anybody_have_any_road_tripping_apps_they_recommend/",
    title:"Anybody have any Road Tripping Apps they recommend?",
    subreddit:"r/roadtrip",
    reason:"Direct request for road-trip app recommendations.",
    draft:"Full disclosure, I built Overdrive – Drive & Explore. It’s a bit different from normal trip planners — it turns driving into a game, colors the roads you’ve explored, and is built around actually enjoying the drive itself. Might be worth checking out if that’s your vibe. I’d genuinely love feedback."
  }
];

function readLeadFromQuery():Lead|null {
  if (typeof window==="undefined") return null;
  const p = new URLSearchParams(window.location.search);
  const url=p.get("url"), draft=p.get("draft");
  if(!url||!draft) return null;
  return {
    url,
    draft,
    title:p.get("title")||"Reddit opportunity",
    subreddit:p.get("subreddit")||"Reddit",
    reason:p.get("reason")||"High-intent match for Overdrive."
  };
}

export default function Home(){
  const [lead,setLead]=useState<Lead>(seed[0]);
  const [account,setAccount]=useState<any>(null);
  const [status,setStatus]=useState("");
  const [posting,setPosting]=useState(false);

  useEffect(()=>{
    const q=readLeadFromQuery(); if(q) setLead(q);
    fetch("/api/reddit/me").then(r=>r.json()).then(setAccount).catch(()=>setAccount({configured:false,connected:false}));
  },[]);

  const fallback = !account?.connected;

  async function post(){
    if(fallback){
      await navigator.clipboard.writeText(lead.draft).catch(()=>{});
      window.open(lead.url,"_blank","noopener,noreferrer");
      setStatus("Draft copied. Reddit opened — paste and submit.");
      return;
    }
    if(!confirm("Post this exact reply to Reddit now?")) return;
    setPosting(true); setStatus("");
    const r=await fetch("/api/reddit/post-comment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:lead.url,text:lead.draft,confirmed:true})});
    const j=await r.json().catch(()=>({}));
    setPosting(false);
    if(r.ok&&j.ok) setStatus("Posted ✓");
    else setStatus(j.error||"Posting failed.");
  }

  return <main>
    <header>
      <div className="logo"><span>◉</span> OVERDRIVE <b>REDDIT OPS</b></div>
      <a href="https://overdriveapps.com" target="_blank">overdriveapps.com ↗</a>
    </header>

    <section className="hero">
      <p className="eyebrow">APPROVAL INBOX</p>
      <h1>One good Reddit reply.<br/><em>One click.</em></h1>
      <p className="lede">High-intent Reddit opportunities for Overdrive — Drive & Explore. Review the draft, then approve it.</p>
    </section>

    <section className="account">
      {!account ? <span>Checking Reddit connection…</span> :
       account.connected ? <>
        <span className="ok">● Connected as u/{account.name}</span>
        <button className="ghost" onClick={async()=>{await fetch("/api/auth/reddit/logout",{method:"POST"});location.reload()}}>Disconnect</button>
       </> :
       account.configured ? <>
        <span>Reddit not connected</span><a className="smallbtn" href="/api/auth/reddit/start">Connect Reddit</a>
       </> :
       <>
        <span>Direct Reddit API posting is not configured.</span>
        <span className="muted">Fallback mode: POST copies the reply + opens Reddit.</span>
       </>}
    </section>

    <section className="card">
      <div className="row">
        <span className="sub">{lead.subreddit}</span>
        <span className="match">HIGH INTENT</span>
      </div>
      <h2>{lead.title}</h2>
      <p className="reason">{lead.reason}</p>
      <a className="thread" href={lead.url} target="_blank">View thread ↗</a>

      <label>Suggested reply</label>
      <textarea value={lead.draft} onChange={e=>setLead({...lead,draft:e.target.value})} rows={9}/>
      <div className="actions">
        <button className="post" disabled={posting} onClick={post}>{posting?"POSTING…":fallback?"COPY + OPEN REDDIT":"POST TO REDDIT"}</button>
        <button className="skip" onClick={()=>setStatus("Skipped.")}>SKIP</button>
      </div>
      {status && <div className="status">{status}</div>}
    </section>

    <section className="footnote">
      <strong>Built-in guardrail:</strong> direct posting only happens after you press the button and confirm. No auto-comments, fake votes, or account farming.
    </section>
  </main>
}
