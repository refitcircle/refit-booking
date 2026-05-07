import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { sendBookingConfirmation } from '@/lib/emails';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature error:', err);
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata!;

    const { data: sessionData } = await supabaseAdmin
      .from('sessions')
      .select('*, courses(*, prices(*))')
      .eq('id', meta.session_id)
      .single();

    if (!sessionData) return NextResponse.json({ error: 'Session introuvable.' }, { status: 404 });

    const { data: booking } = await supabaseAdmin
      .from('bookings')
      .insert({
        session_id: meta.session_id,
        first_name: meta.first_name,
        last_name: meta.last_name,
        email: meta.email,
        phone: meta.phone || null,
        quantity: parseInt(meta.quantity),
        participants: JSON.parse(meta.participants || '[]'),
        price_key: meta.price_key,
        payment_method: 'stripe',
        total_amount: parseInt(meta.total_amount),
        status: 'confirmed',
        stripe_session_id: session.id,
      })
      .select()
      .single();

    if (booking) {
      try {
        await sendBookingConfirmation(booking, sessionData.courses, sessionData);
      } catch (err) {
        console.error('Email error:', err);
      }
    }
  }

  return NextResponse.json({ received: true });
}