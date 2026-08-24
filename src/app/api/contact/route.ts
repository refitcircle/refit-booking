export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { first_name, last_name, email, phone, reason, message } = await req.json();

    if (!email || !reason) {
      return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (token && chatId) {
      const text = [
        `📬 *Nouveau message de contact*`,
        ``,
        `👤 ${first_name || ''} ${last_name || ''}`.trim(),
        `✉️ ${email}`,
        phone ? `📞 ${phone}` : '',
        `📋 ${reason}`,
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
