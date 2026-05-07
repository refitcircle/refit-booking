'use client';

import { useState } from 'react';
import { formatDate } from '@/lib/types';

interface Props {
  booking: any;
}

export default function CancelClient({ booking }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cancelled, setCancelled] = useState(false);

  const session = booking.sessions;
  const course = session?.courses;

  const sessionDate = new Date(session?.session_date);
  const now = new Date();
  const diffHours = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const canCancel = diffHours >= 24;

  const handleCancel = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`/api/bookings/${booking.id}/cancel`, { method: 'PATCH' });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || 'Erreur lors de l\'annulation.');
      } else {
        setCancelled(true);
      }
    } catch {
      setError('Erreur réseau.');
    } finally {
      setLoading(false);
    }
  };

  if (cancelled) {
    return (
      <div className="text-center">
        <div className="text-4xl mb-4">✅</div>
        <h2 className="font-title font-semibold text-navy text-xl mb-2">Réservation annulée</h2>
        <p className="text-sm text-gray-500 font-light">
          Votre place a été libérée. Si quelqu'un était sur liste d'attente, il a été notifié.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-title font-semibold text-navy text-2xl mb-6">Annuler ma réservation</h2>

      <div className="border p-6 mb-6" style={{ borderColor: 'var(--border)', borderRadius: 2 }}>
        <p className="font-title font-semibold text-navy text-lg">{course?.name}</p>
        <p className="text-sm text-gray-500 mt-1 capitalize">{formatDate(session?.session_date)}</p>
        <p className="text-sm text-gray-500">📍 {course?.location}</p>
        <p className="text-sm text-gray-500 mt-2">
          {booking.first_name} {booking.last_name} · {booking.quantity} personne{booking.quantity > 1 ? 's' : ''}
        </p>
      </div>

      {canCancel ? (
        <>
          <div className="bg-amber-50 border border-amber-200 p-4 mb-6 text-sm text-amber-800 font-light" style={{ borderRadius: 2 }}>
            Cette annulation est irréversible. Si quelqu'un est en liste d'attente, il sera automatiquement notifié.
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button onClick={handleCancel} disabled={loading} className="btn-primary w-full text-center">
            {loading ? 'Annulation en cours…' : 'Confirmer l\'annulation'}
          </button>
        </>
      ) : (
        <div className="bg-red-50 border border-red-200 p-4 text-sm text-red-700 font-light" style={{ borderRadius: 2 }}>
          ⚠️ Annulation impossible — la séance a lieu dans moins de 24h. La séance reste due sauf si un remplaçant est trouvé. Contactez Nicolas directement.
        </div>
      )}
    </div>
  );
}
