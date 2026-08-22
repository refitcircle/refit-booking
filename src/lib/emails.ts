import { Resend } from 'resend';
import { Booking, Course, Session, formatAmount, formatDate } from './types';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://app.refitcircle.be';
const COACH_EMAIL = process.env.COACH_EMAIL || 'nicolas@refitcircle.be';

const PAYMENT_INFO = {
  beneficiary: process.env.PAYMENT_BENEFICIARY || 'Nicolas Re:Fit',
  iban: process.env.PAYMENT_IBAN || 'BE12 3456 7890 1234',
  payconiq: process.env.PAYMENT_PAYCONIQ || 'payconiq.be/refit-nicolas',
};

function paymentBlock(method: string, amount: number | null): string {
  const amountStr = amount ? formatAmount(amount) : '';
  if (method === 'paid') return `<p>✅ Séance décomptée de votre pack.</p>`;
  if (method === 'stripe') return `<p>✅ Paiement en ligne confirmé. Montant : <strong>${amountStr}</strong></p>`;
  return `<p><strong>Cash</strong> — à régler sur place. Montant : <strong>${amountStr}</strong></p>`;
}

function emailWrapper(content: string): string {
  return `
    <div style="font-family: 'Montserrat', sans-serif; color: #111; max-width: 600px; margin: 0 auto;">
      <div style="background: #225675; padding: 32px; text-align: center;">
        <h1 style="color: #ffd492; font-size: 28px; margin: 0; font-family: 'Quicksand', sans-serif; letter-spacing: 0.1em;">RE:FIT</h1>
        <p style="color: #ffffff; margin: 8px 0 0; font-size: 13px; letter-spacing: 0.15em;">RETROUVE TON PLEIN POTENTIEL</p>
      </div>
      <div style="padding: 40px 32px;">
        ${content}
        <p style="margin-top: 40px;">À bientôt,<br/><strong>Nicolas — Re:Fit</strong></p>
      </div>
      <div style="background: #f5f0eb; padding: 16px; text-align: center;">
        <p style="margin: 0; font-size: 11px; color: #999;">Re:Fit · coaching sport, santé & bien-être · Belgique</p>
      </div>
    </div>
  `;
}

export async function sendBookingConfirmation(
  booking: Booking,
  course: Course,
  session: Session
) {
  if (!resend) return;
  const cancelUrl = `${BASE_URL}/cancel/${booking.cancel_token}`;

  await resend.emails.send({
    from: 'Re:Fit <no-reply@refitcircle.be>',
    to: booking.email,
    subject: `Réservation confirmée — ${course.name}`,
    html: emailWrapper(`
      <p style="font-size: 16px;">Bonjour <strong>${booking.first_name}</strong>,</p>
      <p>Votre réservation est confirmée ✅</p>
      <div style="border-left: 3px solid #c8973a; padding-left: 20px; margin: 28px 0;">
        <p style="margin: 0; font-size: 18px; font-weight: 600;">${course.name}</p>
        <p style="margin: 8px 0 0; color: #555;">${formatDate(session.session_date)} — ${session.label.split('—')[1]?.trim()}</p>
        <p style="margin: 4px 0 0; color: #555;">📍 ${course.location}</p>
        ${booking.quantity > 1 ? `<p style="margin: 4px 0 0; color: #555;">👥 ${booking.quantity} personnes</p>` : ''}
      </div>
      <h3 style="color: #225675;">Paiement</h3>
      ${paymentBlock(booking.payment_method, booking.total_amount)}
      <div style="background: #fdf9f4; border: 1px solid #e8ddd0; padding: 20px; margin: 28px 0; border-radius: 2px;">
        <p style="margin: 0; font-size: 13px; color: #666;">
          <strong>Politique d'annulation</strong><br/>
          Annulation acceptée jusqu'à 24h avant la séance. Au-delà, la séance reste due sauf si un remplaçant est trouvé.
        </p>
      </div>
      <p style="text-align: center; margin: 32px 0;">
        <a href="${cancelUrl}" style="color: #c8973a; font-size: 13px;">Annuler ma réservation</a>
      </p>
    `),
  });
}

export async function sendCoachNotification(
  booking: Booking,
  course: Course,
  session: Session
) {
  if (!resend) return;

  await resend.emails.send({
    from: 'Re:Fit <no-reply@refitcircle.be>',
    to: COACH_EMAIL,
    subject: `Nouvelle réservation — ${course.name}`,
    html: `
      <div style="font-family: 'Montserrat', sans-serif; color: #111; max-width: 600px; margin: 0 auto;">
        <div style="background: #225675; padding: 24px 32px;">
          <h2 style="color: #ffd492; margin: 0; font-size: 20px;">Nouvelle réservation</h2>
        </div>
        <div style="padding: 32px;">
          <p><strong>Cours :</strong> ${course.name}</p>
          <p><strong>Date :</strong> ${formatDate(session.session_date)} — ${session.label.split('—')[1]?.trim()}</p>
          <p><strong>Client :</strong> ${booking.first_name} ${booking.last_name || ''}</p>
          <p><strong>Email :</strong> ${booking.email}</p>
          ${booking.phone ? `<p><strong>Tél :</strong> ${booking.phone}</p>` : ''}
          <p><strong>Participants :</strong> ${booking.quantity}</p>
          <p><strong>Paiement :</strong> ${booking.payment_method} ${booking.total_amount ? `— ${formatAmount(booking.total_amount)}` : ''}</p>
        </div>
      </div>
    `,
  });
}

export async function sendCancellationConfirmation(
  booking: Booking,
  course: Course,
  session: Session
) {
  if (!resend) return;

  await resend.emails.send({
    from: 'Re:Fit <no-reply@refitcircle.be>',
    to: booking.email,
    subject: `Annulation confirmée — ${course.name}`,
    html: emailWrapper(`
      <p style="font-size: 16px;">Bonjour <strong>${booking.first_name}</strong>,</p>
      <p>Votre annulation a bien été prise en compte.</p>
      <div style="border-left: 3px solid #c8973a; padding-left: 20px; margin: 28px 0;">
        <p style="margin: 0; font-size: 18px; font-weight: 600;">${course.name}</p>
        <p style="margin: 8px 0 0; color: #555;">${formatDate(session.session_date)} — ${session.label.split('—')[1]?.trim()}</p>
        <p style="margin: 4px 0 0; color: #555;">📍 ${course.location}</p>
      </div>
      <p>Si vous souhaitez vous réinscrire à une prochaine séance, rendez-vous sur :</p>
      <p style="text-align: center; margin: 32px 0;">
        <a href="${BASE_URL}" style="background: #225675; color: #fff; padding: 14px 28px; text-decoration: none; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase;">Voir les séances</a>
      </p>
    `),
  });
}

export async function sendWaitlistNotification(
  email: string,
  name: string,
  course: Course,
  session: Session
) {
  if (!resend) return;
  await resend.emails.send({
    from: 'Re:Fit <no-reply@refitcircle.be>',
    to: email,
    subject: `Une place vient de se libérer — ${course.name}`,
    html: emailWrapper(`
      <p>Bonjour <strong>${name}</strong>,</p>
      <p>🎉 Bonne nouvelle — une place vient de se libérer pour :</p>
      <div style="border-left: 3px solid #c8973a; padding-left: 20px; margin: 24px 0;">
        <p style="margin: 0; font-size: 18px; font-weight: 600;">${course.name}</p>
        <p style="margin: 8px 0 0; color: #555;">${formatDate(session.session_date)}</p>
      </div>
      <p>Vous êtes prioritaire — réservez vite avant que la place soit prise.</p>
      <p style="text-align: center; margin: 32px 0;">
        <a href="${BASE_URL}" style="background: #225675; color: #fff; padding: 14px 28px; text-decoration: none; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase;">Réserver maintenant</a>
      </p>
    `),
  });
}

export async function sendCoachPadelInterest(
  coachEmail: string,
  name: string,
  email: string,
  message: string | null
) {
  if (!resend) return;
  await resend.emails.send({
    from: 'Re:Fit <no-reply@refitcircle.be>',
    to: coachEmail,
    subject: 'Nouvelle inscription avant-première — Build & Play Padel',
    html: `
      <div style="font-family: 'Montserrat', sans-serif; color: #111; max-width: 600px;">
        <h2 style="color: #225675;">Nouvelle inscription avant-première</h2>
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> ${email}</p>
        ${message ? `<p><strong>Message :</strong> ${message}</p>` : ''}
      </div>
    `,
  });
}
export async function sendTelegramNotification(
  booking: Booking,
  course: Course,
  session: Session
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const method = booking.payment_method === 'stripe' ? '💳 Stripe' : '💵 Cash';
  const amount = booking.total_amount ? ` — ${formatAmount(booking.total_amount)}` : '';
  const text = [
    `🔔 Nouvelle réservation`,
    ``,
    `📋 ${course.name}`,
    `📅 ${formatDate(session.session_date)}`,
    `👤 ${booking.first_name} ${booking.last_name || ''}`,
    `✉️ ${booking.email}`,
    `👥 ${booking.quantity} personne${booking.quantity > 1 ? 's' : ''}`,
    `${method}${amount}`,
  ].join('\n');

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}
