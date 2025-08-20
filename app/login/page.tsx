"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));
  }, []);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setInfo(null); setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000") + "/dashboard",
      },
    });
    if (error) setError(error.message);
    else setInfo("Check your email for the magic link ✉️");
  }

  async function signOut() {
    await supabase.auth.signOut();
    setLoggedIn(false);
  }

  return (
    <div style={{maxWidth:480, margin:"40px auto", fontFamily:"system-ui, Arial"}}>
      <h1>Login</h1>
      {loggedIn ? (
        <>
          <p>You’re logged in. Go to your <Link href="/dashboard">dashboard</Link>.</p>
          <button onClick={signOut} style={{padding:"10px 16px"}}>Sign out</button>
        </>
      ) : (
        <form onSubmit={sendMagicLink}>
          <label style={{display:"block", marginBottom:8}}>Email</label>
          <input
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            style={{width:"100%", padding:10, border:"1px solid #ddd", borderRadius:8}}
          />
          <button type="submit" style={{marginTop:12, padding:"10px 16px"}}>Send Magic Link</button>
        </form>
      )}
      {info && <p style={{marginTop:12, color:"green"}}>{info}</p>}
      {error && <p style={{marginTop:12, color:"crimson"}}>{error}</p>}
    </div>
  );
}
