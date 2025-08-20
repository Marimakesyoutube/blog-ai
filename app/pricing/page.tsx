"use client";
import { useState } from "react";

export default function Pricing() {
  const [email, setEmail] = useState("");

  async function subscribe(period: "month" | "year") {
    const priceId =
      period === "month"
        ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY
        : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY;

    const r = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, priceId }),
    });
    const data = await r.json();
    if (data?.url) window.location.href = data.url;
    else alert(data?.error || "Checkout failed");
  }

  return (
    <main style={{maxWidth:820, margin:"40px auto", fontFamily:"system-ui, Arial"}}>
      <h1 style={{marginBottom:8}}>MyDraftly Premium</h1>
      <p style={{color:"#555", marginTop:0}}>
        Unlimited AI posts, SEO insights, automated distribution.
      </p>

      <div style={{margin:"20px 0"}}>
        <label style={{display:"block", marginBottom:8}}>Email for receipt & portal access</label>
        <input
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{width:"100%", padding:10, border:"1px solid #ddd", borderRadius:8}}
        />
      </div>

      <div style={{display:"grid", gap:16, gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))"}}>
        <div style={{border:"1px solid #eee", borderRadius:12, padding:16}}>
          <h3 style={{marginTop:0}}>Monthly</h3>
          <p style={{fontSize:28, margin:"4px 0"}}>€19<span style={{fontSize:14}}>/mo</span></p>
          <ul style={{margin:"8px 0 16px", paddingLeft:20}}>
            <li>Unlimited AI posts</li>
            <li>SEO & distribution</li>
            <li>Email support</li>
          </ul>
          <button onClick={()=>subscribe("month")}
            style={{padding:"10px 16px", background:"#111", color:"#fff", borderRadius:8, width:"100%"}}>
            Subscribe Monthly
          </button>
        </div>

        <div style={{border:"1px solid #eee", borderRadius:12, padding:16}}>
          <h3 style={{marginTop:0}}>Yearly</h3>
          <p style={{fontSize:28, margin:"4px 0"}}>€199<span style={{fontSize:14}}>/yr</span></p>
          <ul style={{margin:"8px 0 16px", paddingLeft:20}}>
            <li>2 months free</li>
            <li>Priority features</li>
            <li>Email support</li>
          </ul>
          <button onClick={()=>subscribe("year")}
            style={{padding:"10px 16px", background:"#0b6bff", color:"#fff", borderRadius:8, width:"100%"}}>
            Subscribe Yearly
          </button>
        </div>
      </div>

      {/* Optional: direct Stripe portal link as fallback */}
      <div style={{marginTop:24}}>
        <a href="https://billing.stripe.com/p/login/4gMeVeagF0zT4NrfXe73G00"
           style={{textDecoration:"none"}}>
          Manage subscription (customer portal)
        </a>
      </div>
    </main>
  );
}
