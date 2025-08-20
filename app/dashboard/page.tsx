
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null);
      setLoading(false);
    });
  }, []);

  if (loading) return <p style={{maxWidth:720, margin:"40px auto"}}>Loading…</p>;
  if (!session) {
    return (
      <div style={{maxWidth:720, margin:"40px auto"}}>
        <h1>Dashboard</h1>
        <p>You’re not logged in.</p>
        <Link href="/login">Go to Login</Link>
      </div>
    );
  }

  return (
    <div style={{maxWidth:720, margin:"40px auto"}}>
      <h1>Dashboard</h1>
      <p>Welcome back, {session.user.email} 🎉</p>
      <ul>
        <li><Link href="/pricing">Manage / Upgrade</Link></li>
        <li><Link href="/blog">Your posts</Link></li>
      </ul>
    </div>
  );
}
