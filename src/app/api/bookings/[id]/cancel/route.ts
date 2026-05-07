import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendWaitlistNotification } from '@/lib/emails';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const qty = body.qty || null;
    const force = body.force || false;

    const { data: booking } = await supabaseAdmin
      .from('bookings')
      .select('*, sessions(*, courses(*, prices(*)))')
      .eq('id', id)
      .single();

    if (!booking) return NextResponse.json({ error: 'Réservation introuvable.' }, { status: 404 });
    if (booking.status === 'cancelled') return NextResponse.json({ error: 'Déjà annulée.' }, { status: 400 });

    const sessionDate = new Date(booking.sessions.session_date);
    const now = new Date();
    const diffHours = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24 && !force) {
      return NextResponse.json(
        { error: 'Annulation impossible moins de 24h avant la séance.' },
        { status: 400 }
      );
    }

    // Si qty spécifié et inférieur à la quantité totale → réduire seulement
    if (qty && qty < booking.quantity) {
      await supabaseAdmin
        .from('bookings')
        .update({ quantity: booking.quantity - qty })
        .eq('id', id);
    } else {
      // Annuler complètement
      await supabaseAdmin
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', id);

      // Notifier le premier de la liste d'attente
      const { data: waitlist } = await supabaseAdmin
        .from('bookings')
        .select('*')
        .eq('session_id', booking.session_id)
        .eq('status', 'waitlist')
        .order('waitlist_pos', { ascending: true })
        .limit(1);

      if (waitlist && waitlist.length > 0) {
        const next = waitlist[0];
        try {
          await sendWaitlistNotification(next.email, next.first_name, booking.sessions.courses, booking.sessions);
        } catch (emailErr) {
          console.error('Waitlist email error:', emailErr);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erreur interne.' }, { status: 500 });
  }
}