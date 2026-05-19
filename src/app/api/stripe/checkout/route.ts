export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      session_id,
      first_name,
      last_name,
      email,
      phone,
      quantity,
      participants,
      price_key,
      total_amount,
    } = body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'bancontact'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: price_key === 'pack' ? 'Pack 10 séances Re:Fit' : 'Séance Re:Fit',
            },
            unit_amount: total_amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/paiement-succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
      metadata: {
        session_id,
        first_name,
        last_name,
        email,
        phone: phone || '',
        quantity: String(quantity),
        participants: JSON.stringify(participants || []),
        price_key,
        total_amount: String(total_amount),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erreur Stripe.' }, { status: 500 });
  }
}