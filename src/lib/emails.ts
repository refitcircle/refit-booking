import { Resend } from 'resend';
import { Booking, Course, Session, formatAmount, formatDate } from './types';

const resend = new Resend(process.env.RESEND_API_KEY);
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://refit.be';

const PAYMENT_INFO = {
  beneficiary: process.env.PAYMENT_BENEFICIARY || 'Nicolas Re:Fit',
  iban: process.env.PAYMENT_IBAN || 'BE12 3456 7890 1234',
  payconiq: process.env.PAYMENT_PAYCONIQ || 'payconiq.be/refit-nicolas',
};

function paymentBlock(method: string, amount: number | null): string {
  const amountStr = amount ? formatAmount(amount) : '';
  if (method === 'paid') return `<p>✅ Séance décomptée de votre pack.</p>`;
  if (method === 'virement') {
    return `
      <p><strong>Virement bancaire</strong></p>
      <p>Bénéficiaire : ${PAYMENT_INFO.beneficiary}<br/>
      IBAN : <strong>${PAYMENT_INFO.iban}</strong><br/>
      Montant : <strong>${amountStr}</strong></p>
    `;
  }
  if (method === 'payconiq') {
    return `
      <p><strong>Payconiq</strong></p>
      <p>Scannez le QR ou utilisez le lien :<br/>
      <a href="https://${PAYMENT_INFO.payconiq}">${PAYMENT_INFO.payconiq}</a><br/>
      Montant : <strong>${amountStr}</strong></p>
    `;
  }
  return `<p><strong>Cash</strong> — à régler sur place. Montant : <strong>${amountStr}</strong></p>`;
}

export async function sendBookingConfirmation(
  booking: Booking,
  course: Course,
  session: Session
) {
  const cancelUrl = `${BASE_URL}/cancel/${booking.cancel_token}`;

  await resend.emails.send({
    from: 'Re:Fit <no-reply@refit.be>',
    to: booking.email,
    subject: `Votre réservation Re:Fit — ${course.name}`,
    html: `
      <div style="font-family: 'Montserrat', sans-serif; color: #111; max-width: 600px; margin: 0 auto;">
        <div style="background: #225675; padding: 32px; text-align: center;">
          <h1 style="color: #ffd492; font-size: 28px; margin: 0; font-family: 'Quicksand', sans-serif; letter-spacing: 0.1em;">RE:FIT</h1>
          <p style="color: #ffffff; margin: 8px 0 0; font-size: 13px; letter-spacing: 0.15em;">RETROUVE TON PLEIN POTENTIEL</p>
        </div>
        <div style="padding: 40px 32px;">
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

          <p>À bientôt,<br/><strong>Nicolas — Re:Fit</strong></p>
        </div>
        <div style="background: #f5f0eb; padding: 16px; text-align: center;">
          <p style="margin: 0; font-size: 11px; color: #999;">Re:Fit · coaching sport, santé & bien-être · Belgique</p>
        </div>
      </div>
    `,
  });
}

export async function sendWaitlistNotification(
  email: string,
  name: string,
  course: Course,
  session: Session
) {
  await resend.emails.send({
    from: 'Re:Fit <no-reply@refit.be>',
    to: email,
    subject: `Une place vient de se libérer — ${course.name}`,
    html: `
      <div style="font-family: 'Montserrat', sans-serif; color: #111; max-width: 600px; margin: 0 auto;">
        <div style="background: #225675; padding: 32px; text-align: center;">
          <h1 style="color: #ffd492; font-size: 28px; margin: 0; font-family: 'Quicksand', sans-serif; letter-spacing: 0.1em;">RE:FIT</h1>
        </div>
        <div style="padding: 40px 32px;">
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
          <p>À bientôt,<br/><strong>Nicolas — Re:Fit</strong></p>
        </div>
      </div>
    `,
  });
}

export async function sendCoachPadelInterest(
  coachEmail: string,
  name: string,
  email: string,
  message: string | null
) {
  await resend.emails.send({
    from: 'Re:Fit <no-reply@refit.be>',
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
