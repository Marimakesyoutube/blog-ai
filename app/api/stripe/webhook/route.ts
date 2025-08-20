
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // ensure Node runtime for raw body

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") || "";
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        // “customer_details” often has email right away; otherwise expand on subscription.created
        const email = s.customer_details?.email || (s.customer_email as string) || "";
        const stripeCustomerId = (s.customer as string) || "";
        const subId = (s.subscription as string) || "";
        const priceId = (s?.line_items?.data?.[0]?.price?.id as string) || undefined;

        // upsert customer record
        if (email && stripeCustomerId) {
          await supabase
            .from("customers")
            .upsert({ email, stripe_customer_id: stripeCustomerId }, { onConflict: "email" });
        }

        // we’ll update subscriptions fully when we receive the subscription.created event
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const email = (sub.customer_email as string) || ""; // sometimes present
        const stripeCustomerId = sub.customer as string;
        const priceId = sub.items.data[0]?.price?.id;
        const status = sub.status;
        const periodEnd = new Date(sub.current_period_end * 1000).toISOString();

        // if email missing, you can fetch customer from Stripe to get email
        let finalEmail = email;
        if (!finalEmail) {
          const cust = await stripe.customers.retrieve(stripeCustomerId as string);
          finalEmail = (cust as any)?.email || "";
        }

        // upsert customer
        if (finalEmail) {
          await supabase
            .from("customers")
            .upsert({ email: finalEmail, stripe_customer_id: stripeCustomerId }, { onConflict: "email" });
        }

        // upsert subscription
        await supabase.from("subscriptions").upsert(
          {
            stripe_subscription_id: sub.id,
            stripe_customer_id: stripeCustomerId,
            email: finalEmail || "unknown",
            status,
            price_id: priceId,
            current_period_end: periodEnd
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
        // ignore other events for MVP
        break;
    }

    return NextResponse.json({ received: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Next.js needs the raw body for Stripe webhooks:
export const config = {
  api: {
    bodyParser: false,
  },
};
