'use client';

import { useState } from 'react';
import { Course, Session } from '@/lib/types';

interface Props {
  course: Course;
  session: Session & { bookings: { count: number }[] };
  onClose: () => void;
}

export default function WaitlistModal({ course, session, onClose }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email) { setError('Nom et email obligatoires.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          first_name: name.split(' ')[0] || name,
          last_name: name.split(' ').slice(1).join(' ') || '',
          email,
          quantity: 1,
          price_key: 'unit',
          payment_method: 'virement',
          total_amount: null,
          waitlist: true,
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Erreur.'); }
      else setSuccess(true);
    } catch { setError('Erreur réseau.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md shadow-2xl md:rounded-sm">
        <div className="border-b px-8 py-5 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-title font-semibold text-navy text-xl">Liste d'attente</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-navy text-xl font-light">✕</button>
        </div>

        {success ? (
          <div className="px-8 py-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="font-title font-semibold text-navy text-xl mb-2">Vous êtes inscrit·e</h3>
            <p className="text-sm text-gray-500 font-light">
              Vous serez notifié·e par email dès qu'une place se libère.
            </p>
            <button onClick={onClose} className="btn-primary mt-6">Fermer</button>
          </div>
        ) : (
          <div className="px-8 py-8 flex flex-col gap-6">
            <p className="text-sm text-gray-500 font-light">
              Cette séance est complète. Inscrivez-vous sur liste d'attente — vous serez prévenu·e en priorité si une place se libère.
            </p>
            <div>
              <label className="input-label">Nom complet *</label>
              <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="input-label">Email *</label>
              <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button onClick={handleSubmit} disabled={loading} className="btn-primary self-start">
              {loading ? 'En cours…' : "S'inscrire sur la liste"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
