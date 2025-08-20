
import Stripe from "stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY!;
    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID!;
    const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const { email } = await req.json(); // optional; Stripe will still collect email

    const stripe = new Stripe(stripeSecret, { apiVersion: "2023-10-16" });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      customer_email: email || undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${site}/pricing?success=1`,
      cancel_url: `${site}/pricing?canceled=1`,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
