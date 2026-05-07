import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { slot_id, name, email, level, message } = await req.json();

    if (!name || !email || !level) {
      return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 });
    }

    // Si slot_id null → créneau libre (custom)
    if (slot_id) {
      const { data: slot } = await supabaseAdmin
        .from('sgt_slots')
        .select('id')
        .eq('id', slot_id)
        .single();
      if (!slot) return NextResponse.json({ error: 'Créneau introuvable.' }, { status: 404 });
    }

    const { error } = await supabaseAdmin.from('sgt_interests').insert({
      slot_id: slot_id || null,
      name,
      email,
      level,
      message: message || null,
    });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: 'Erreur lors de l\'enregistrement.' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erreur interne.' }, { status: 500 });
  }
}
