export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { slot_id, name, email, level, message } = await req.json();

    if (!name || !email || !level) {
      return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 });
    }

    let slotLabel = 'Créneau libre';
    if (slot_id) {
      const { data: slot } = await supabaseAdmin
        .from('sgt_slots')
        .select('id, time_label')
        .eq('id', slot_id)
        .single();
      if (!slot) return NextResponse.json({ error: 'Créneau introuvable.' }, { status: 404 });
      slotLabel = slot.time_label;
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

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (token && chatId) {
      const levelLabels: Record<string, string> = { deb: 'Débutant·e', int: 'Intermédiaire', con: 'Confirmé·e' };
      const text = [
        `💪 *Intérêt SGT*`,
        ``,
        `📅 ${slotLabel}`,
        `👤 ${name}`,
        `✉️ ${email}`,
        `🎯 ${levelLabels[level] || level}`,
        message ? `💬 ${message}` : '',
      ].filter(Boolean).join('\n');

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text }),
      });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erreur interne.' }, { status: 500 });
  }
}
