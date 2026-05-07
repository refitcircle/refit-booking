import { supabaseAdmin } from '@/lib/supabase';
import { formatDate } from '@/lib/types';
import CancelClient from './CancelClient';

interface Props {
  params: { token: string };
}

async function getBooking(token: string) {
  const { data } = await supabaseAdmin
    .from('bookings')
    .select('*, sessions(*, courses(name, location))')
    .eq('cancel_token', token)
    .single();
  return data;
}

export default async function CancelPage({ params }: Props) {
  const booking = await getBooking(params.token);

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <p className="font-title font-bold text-navy tracking-widest text-2xl" style={{ letterSpacing: '0.2em' }}>RE:FIT</p>
          <p className="text-xs text-gray-400 tracking-widest mt-1" style={{ letterSpacing: '0.15em' }}>RETROUVE TON PLEIN POTENTIEL</p>
        </div>

        {!booking ? (
          <div className="text-center">
            <p className="text-gray-500 text-sm">Ce lien d'annulation est invalide ou a déjà été utilisé.</p>
          </div>
        ) : booking.status === 'cancelled' ? (
          <div className="text-center">
            <div className="text-3xl mb-4">✅</div>
            <h2 className="font-title font-semibold text-navy text-xl mb-2">Réservation annulée</h2>
            <p className="text-sm text-gray-500 font-light">Cette réservation a déjà été annulée.</p>
          </div>
        ) : (
          <CancelClient booking={booking} />
        )}
      </div>
    </main>
  );
}
