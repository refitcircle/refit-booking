'use client';

import { useState } from 'react';
import { SgtSlot } from '@/lib/types';

interface Props {
  slots: (SgtSlot & { sgt_interests: { count: number }[] })[];
}

const LEVELS = [
  { key: 'deb', label: 'Débutant·e', desc: "Je ne pratique pas ou plus d'activité physique" },
  { key: 'int', label: 'Intermédiaire', desc: 'Je pratique 1 à 2 séances de sport par semaine' },
  { key: 'con', label: 'Confirmé·e', desc: 'Je pratique 3 activités physiques ou plus par semaine' },
];

export default function SgtSection({ slots }: Props) {
  const [activeSlot, setActiveSlot] = useState<SgtSlot | null>(null);
  const [customModal, setCustomModal] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [level, setLevel] = useState<'deb' | 'int' | 'con'>('int');
  const [message, setMessage] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setName(''); setEmail(''); setLevel('int'); setMessage(''); setError(''); setSuccess(false);
  };

  const handleInterest = async (slotId: string) => {
    if (!name || !email) { setError('Nom et email obligatoires.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/sgt/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot_id: slotId, name, email, level, message: message || null }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Erreur.'); }
      else setSuccess(true);
    } catch { setError('Erreur réseau.'); }
    finally { setLoading(false); }
  };

  const handleCustom = async () => {
    if (!name || !email || !customTime) { setError('Tous les champs marqués * sont obligatoires.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/sgt/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot_id: null, name, email, level, message: `Créneau proposé : ${customTime}${message ? ` — ${message}` : ''}` }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Erreur.'); }
      else setSuccess(true);
    } catch { setError('Erreur réseau.'); }
    finally { setLoading(false); }
  };

  const Modal = ({ title, onSubmit, extraField }: { title: string; onSubmit: () => void; extraField?: React.ReactNode }) => (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => { setActiveSlot(null); setCustomModal(false); resetForm(); }} />
      <div className="relative bg-white w-full max-w-md shadow-2xl md:rounded-sm">
        <div className="border-b px-8 py-5 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <div>
            <p className="text-xs text-gold tracking-widest uppercase" style={{ letterSpacing: '0.12em' }}>Small Group Training</p>
            <h2 className="font-title font-semibold text-navy text-xl">{title}</h2>
          </div>
          <button onClick={() => { setActiveSlot(null); setCustomModal(false); resetForm(); }} className="text-gray-300 hover:text-navy text-xl font-light">✕</button>
        </div>

        {success ? (
          <div className="px-8 py-12 text-center">
            <div className="text-4xl mb-4">💪</div>
            <h3 className="font-title font-semibold text-navy text-xl mb-2">Intérêt enregistré !</h3>
            <p className="text-sm text-gray-500 font-light">Nicolas reviendra vers vous pour confirmer le groupe.</p>
            <button onClick={() => { setActiveSlot(null); setCustomModal(false); resetForm(); }} className="btn-primary mt-6">Fermer</button>
          </div>
        ) : (
          <div className="px-8 py-8 flex flex-col gap-6">
            {extraField}
            <div>
              <label className="input-label">Nom complet *</label>
              <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="input-label">Email *</label>
              <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="input-label">Niveau</label>
              <div className="flex flex-col gap-2 mt-2">
                {LEVELS.map((l) => (
                  <label key={l.key} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="level"
                      value={l.key}
                      checked={level === l.key}
                      onChange={() => setLevel(l.key as 'deb' | 'int' | 'con')}
                      className="accent-navy mt-0.5"
                    />
                    <span>
                      <span className="text-sm font-medium">{l.label}</span>
                      <span className="text-xs text-gray-400 block font-light">{l.desc}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="input-label">Message (optionnel)</label>
              <textarea className="input-field resize-none" rows={2} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button onClick={onSubmit} disabled={loading} className="btn-primary self-start">
              {loading ? 'En cours…' : 'Envoyer mon intérêt'}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <section className="py-16 px-6 max-w-5xl mx-auto border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs text-gold tracking-widest uppercase mb-2" style={{ letterSpacing: '0.15em' }}>Sur mesure</p>
            <h2 className="section-title text-2xl">Small Group Training</h2>
          </div>
          <span className="text-xs text-gray-400 font-light hidden md:block mt-2">3–4 personnes · programme personnalisé</span>
        </div>
        <p className="text-sm text-gray-500 font-light mb-10 max-w-xl leading-relaxed">
          Séances en petit groupe ultra-personnalisées. Signalez votre intérêt pour un créneau — Nicolas constitue les groupes selon les disponibilités et niveaux.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-100 mb-6">
          {slots.map((slot) => {
            const count = slot.sgt_interests[0]?.count || 0;
            return (
              <div key={slot.id} className="bg-white p-6 flex flex-col gap-4">
                <div>
                <img src="/sgt.webp" alt="Small Group Training" className="w-full h-32 object-cover object-[center_30%] mb-3" style={{ borderRadius: 2 }} />
                  <p className="font-title font-semibold text-navy text-lg">{slot.time_label}</p>
                  <p className="text-xs text-gray-400 mt-1">{count} personne{count > 1 ? 's' : ''} intéressée{count > 1 ? 's' : ''}</p>
                </div>
                <div className="w-full h-px bg-gray-100" />
                <button
                  onClick={() => { resetForm(); setActiveSlot(slot); }}
                  className="btn-ghost self-start text-xs"
                >
                  Je suis intéressé·e
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => { resetForm(); setCustomModal(true); }}
          className="text-xs text-gray-400 hover:text-navy underline underline-offset-4 transition-colors duration-200"
        >
          Proposer un autre créneau
        </button>
      </section>

      {activeSlot && (
        <Modal
          title={activeSlot.time_label}
          onSubmit={() => handleInterest(activeSlot.id)}
        />
      )}
      {customModal && (
        <Modal
          title="Proposer un créneau"
          onSubmit={handleCustom}
          extraField={
            <div>
              <label className="input-label">Vos disponibilités *</label>
              <input
                className="input-field"
                placeholder="ex : Mardi 18h00, Jeudi matin…"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
              />
            </div>
          }
        />
      )}
    </>
  );
}
