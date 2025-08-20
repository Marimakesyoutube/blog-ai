"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function NavClient() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function init() {
      const { data } = await supabase.auth.getSession();
      if (mounted) setIsLoggedIn(!!data.session);

      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsLoggedIn(!!session);
      });

      setLoading(false);
      return () => sub.subscription.unsubscribe();
    }
    init();
    return () => { mounted = false; };
  }, []);

  return (
    <nav className="navbar">
      <div className="logo">
        <Link href="/">MyDraftly</Link>
      </div>

      <div className="links">
        <Link href="/">Home</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/pricing">Pricing</Link>

        {loading ? null : isLoggedIn ? (
          <Link href="/dashboard" className="dashboard-btn">Dashboard</Link>
        ) : (
          <Link href="/login" className="login-btn">Login</Link>
        )}
      </div>
    </nav>
  );
}
