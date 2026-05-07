'use client';

import { useState } from 'react';
import { Course, Price, formatAmount } from '@/lib/types';

interface Props {
  course: Course & { prices: Price[] };
}

export default function ComingSoonCard({ course }: Props) {
  const [modal, setModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const unitPrice = course.prices.find((p) => p.price_key === 'unit');
  const packPrice = course.prices.find((p) => p.price_key === 'pack');

  const handleSubmit = async () => {
    if (!name || !email) { setError('Nom et email obligatoires.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/courses/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: course.id, name, email, message: message || null }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Erreur.'); }
      else setSuccess(true);
    } catch { setError('Erreur réseau.'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div className="p-8 flex flex-col md:flex-row gap-8 md:items-center" style={{ background: '#225675' }}>
        {/* Texte */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span
              className="text-xs px-2 py-1 font-medium tracking-widest uppercase"
              style={{ background: '#c8973a', color: '#fff', borderRadius: 2, letterSpacing: '0.12em', fontSize: '10px' }}
            >
              Coming soon
            </span>
            <span className="text-xl">{course.icon}</span>
          </div>
          <img src="/padel1.jpg" alt="Build & Play Padel" className="w-full h-40 object-cover object-[center_25%] mb-4" style={{ borderRadius: 2 }} />
          <h3 className="font-title font-semibold text-xl mb-2" style={{ color: '#ffd492' }}>{course.name}</h3>
          <p className="text-sm font-light leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {course.description}
          </p>
          <p className="text-xs mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>📍 {course.location}</p>

          {/* Prix */}
          <div className="flex gap-6 flex-wrap mb-6">
            {unitPrice && (
              <div>
                <p className="font-title font-semibold text-xl" style={{ color: '#ffd492' }}>{formatAmount(unitPrice.amount)}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{unitPrice.label}</p>
              </div>
            )}
            {packPrice && (
              <div>
                <p className="font-title font-semibold text-xl" style={{ color: '#ffd492' }}>{formatAmount(packPrice.amount)}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {packPrice.label}
                  {packPrice.note && <span className="ml-1" style={{ color: '#c8973a' }}>· {packPrice.note}</span>}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setModal(true)}
            className="text-xs px-6 py-3 border tracking-widest uppercase transition-all duration-200 hover:bg-gold-light hover:text-navy"
            style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff', borderRadius: 2, letterSpacing: '0.15em' }}
          >
            Recevoir les infos en avant-première
          </button>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setModal(false)} />
          <div className="relative bg-white w-full max-w-md shadow-2xl md:rounded-sm">
            <div className="border-b px-8 py-5 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <div>
                <p className="text-xs text-gold tracking-widest uppercase" style={{ letterSpacing: '0.12em' }}>Avant-première</p>
                <h2 className="font-title font-semibold text-navy text-xl">{course.name}</h2>
              </div>
              <button onClick={() => setModal(false)} className="text-gray-300 hover:text-navy text-xl font-light">✕</button>
            </div>

            {success ? (
              <div className="px-8 py-12 text-center">
                <div className="text-4xl mb-4">🎾</div>
                <h3 className="font-title font-semibold text-navy text-xl mb-2">C'est noté !</h3>
                <p className="text-sm text-gray-500 font-light">
                  Vous serez parmi les premiers à être informés au lancement.
                </p>
                <button onClick={() => setModal(false)} className="btn-primary mt-6">Fermer</button>
              </div>
            ) : (
              <div className="px-8 py-8 flex flex-col gap-6">
                <p className="text-sm text-gray-500 font-light">
                  Laissez vos coordonnées pour être prévenu·e en avant-première au lancement de {course.name}.
                </p>
                <div>
                  <label className="input-label">Nom complet *</label>
                  <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label className="input-label">Email *</label>
                  <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label className="input-label">Message (optionnel)</label>
                  <textarea
                    className="input-field resize-none"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button onClick={handleSubmit} disabled={loading} className="btn-primary self-start">
                  {loading ? 'En cours…' : "M'inscrire"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
