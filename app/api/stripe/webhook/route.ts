// app/api/stripe/webhook/route.ts
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// App Router runtime flags (replace old `export const config`)
export const runtime = "nodejs";           // needed to read raw body (not Edge)
export const dynamic = "force-dynamic";    // webhooks are dynamic
export const preferredRegion = "auto";     // optional

export async function POST(req: Request) {
  // 1) Get the raw body & signature
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") || "";

  // 2) Init Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2023-10-16",
  });
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 3) Init Supabase (service actions)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const email = s.customer_details?.email || (s.customer_email as string) || "";
        const stripeCustomerId = (s.customer as string) || "";
        const subId = (s.subscription as string) || "";
        const priceId = (s as any)?.line_items?.data?.[0]?.price?.id as string | undefined;

        if (email && stripeCustomerId) {
          await supabase
            .from("customers")
            .upsert({ email, stripe_customer_id: stripeCustomerId }, { onConflict: "email" });
        }

        // subscription details finalized on subscription.* events
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const stripeCustomerId = sub.customer as string;
        const priceId = sub.items.data[0]?.price?.id;
        const status = sub.status;
        const periodEnd = new Date(sub.current_period_end * 1000).toISOString();

        // get email (sometimes not on the object)
        let email = (sub as any).customer_email as string | undefined;
        if (!email) {
          const cust = await stripe.customers.retrieve(stripeCustomerId);
          email = (cust as any)?.email || "";
        }

        if (email) {
          await supabase
            .from("customers")
            .upsert({ email, stripe_customer_id: stripeCustomerId }, { onConflict: "email" });
        }

        await supabase.from("subscriptions").upsert(
          {
            stripe_subscription_id: sub.id,
            stripe_customer_id: stripeCustomerId,
            email: email || "unknown",
            status,
            price_id: priceId,
            current_period_end: periodEnd,
          },
          { onConflict: "stripe_subscription_id" }
        );

        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await supabase
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", sub.id);
        break;
      }

      default:
        // ignore others for now
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
