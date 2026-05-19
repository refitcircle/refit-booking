export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, phone, reason, message } = await req.json();

    if (!email || !reason) {
      return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 });
    }

    await resend.emails.send({
      from: 'Re:Fit <no-reply@refit.be>',
      to: process.env.COACH_EMAIL || 'nicolas@refitcircle.be',
      subject: `Nouveau contact Re:Fit — ${reason}`,
      html: `
        <div style="font-family: 'Montserrat', sans-serif; color: #111; max-width: 600px;">
          <div style="background: #225675; padding: 32px; text-align: center;">
            <h1 style="color: #ffd492; font-size: 24px; margin: 0; letter-spacing: 0.1em;">RE:FIT</h1>
          </div>
          <div style="padding: 40px 32px;">
            <h2 style="color: #225675;">Nouveau message de contact</h2>
            <p><strong>Raison :</strong> ${reason}</p>
            <p><strong>Email :</strong> ${email}</p>
            ${phone ? `<p><strong>Téléphone :</strong> ${phone}</p>` : ''}
            ${message ? `<p><strong>Message :</strong> ${message}</p>` : ''}
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erreur interne.' }, { status: 500 });
  }
}