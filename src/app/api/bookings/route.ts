export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendBookingConfirmation, sendCoachNotification } from '@/lib/emails';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      session_id,
      first_name,
      last_name,
      email,
      phone,
      quantity = 1,
      participants = [],
      price_key,
      payment_method,
      total_amount,
      waitlist = false,
    } = body;

    if (!session_id || !first_name || !email || !price_key || !payment_method) {
      return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 });
    }

    // Récupérer la session + cours
    const { data: session } = await supabaseAdmin
      .from('sessions')
      .select('*, courses(*, prices(*))')
      .eq('id', session_id)
      .single();

    if (!session) return NextResponse.json({ error: 'Séance introuvable.' }, { status: 404 });
    if (session.is_cancelled) return NextResponse.json({ error: 'Séance annulée.' }, { status: 400 });

    const course = session.courses;

    // Compter les inscrits confirmés
    const { count: confirmedCount } = await supabaseAdmin
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', session_id)
      .eq('status', 'confirmed');

    const remaining = course.max_spots - (confirmedCount || 0);

    let status: 'confirmed' | 'waitlist' = 'confirmed';
    let waitlistPos: number | null = null;

    if (waitlist || remaining < quantity) {
      // Mettre en liste d'attente
      status = 'waitlist';
      const { count: waitlistCount } = await supabaseAdmin
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', session_id)
        .eq('status', 'waitlist');
      waitlistPos = (waitlistCount || 0) + 1;
    }

    // Insérer la réservation
    const { data: booking, error: insertError } = await supabaseAdmin
      .from('bookings')
      .insert({
        session_id,
        first_name,
        last_name,
        email,
        phone: phone || null,
        quantity,
        price_key,
        payment_method,
        total_amount: total_amount || null,
        participants,
        status,
        waitlist_pos: waitlistPos,
      })
      .select()
      .single();

    if (insertError) {
      console.error(insertError);
      return NextResponse.json({ error: 'Erreur lors de la réservation.' }, { status: 500 });
    }

    // Envoyer l'email de confirmation si confirmé
    if (status === 'confirmed') {
      try {
        await sendBookingConfirmation(booking, course, session);
        await sendCoachNotification(booking, course, session);
      } catch (emailErr) {
        console.error('Email error:', emailErr);
        // Ne pas bloquer la réponse pour un échec email
      }
    }

    return NextResponse.json({ booking, status }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erreur interne.' }, { status: 500 });
  }
}
