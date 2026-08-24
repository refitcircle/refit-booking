'use client';

import { useState } from 'react';
import Header from '@/components/Header';

const REASONS = [
  'Être suivi à distance',
  'Être intégré dans un groupe de coaching Small Group',
  'Suivre du coaching 1 to 1',
  'Informations sur un cours',
  'Autre',
];

export default function ContactPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email || !reason) { setError('Email et raison obligatoires.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email, phone, reason, message }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Erreur.'); }
      else setSuccess(true);
    } catch { setError('Erreur réseau.'); }
    finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="pt-32 pb-16 px-6 max-w-lg mx-auto">
        <p className="text-xs text-gold tracking-widest uppercase mb-2" style={{ letterSpacing: '0.2em' }}>
          Contact
        </p>
        <h1 className="font-title font-bold text-navy text-3xl mb-2">Parlons-en</h1>
        <p className="text-sm text-gray-500 font-light mb-10 leading-relaxed">
          Une question ? Une envie de démarrer ? Laisse-moi tes coordonnées et je reviens vers toi rapidement.
        </p>

        {success ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="font-title font-semibold text-navy text-xl mb-2">Message envoyé !</h2>
            <p className="text-sm text-gray-500 font-light mb-6">Nicolas reviendra vers toi très prochainement.</p>
            <a href="/" className="btn-primary">Retour à l'accueil</a>
          </div>
        ) : (
          <div className="flex flex-col gap-7">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Prénom</label>
                <input
                  type="text"
                  className="input-field"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label className="input-label">Nom</label>
                <input
                  type="text"
                  className="input-field"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="input-label">Email *</label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="input-label">Téléphone</label>
              <input
                type="tel"
                className="input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="input-label">Je souhaite… *</label>
              <select
                className="input-field"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="">Choisir une raison</option>
                {REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Message (optionnel)</label>
              <textarea
                className="input-field resize-none"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button onClick={handleSubmit} disabled={loading} className="btn-primary self-start">
              {loading ? 'Envoi en cours…' : 'Envoyer'}
            </button>
          </div>
        )}
      </section>

      <footer className="border-t py-12 px-6 text-center" style={{ borderColor: 'var(--border)' }}>
        <p className="font-title font-semibold text-navy text-lg tracking-widest mb-1">RE:FIT</p>
        <p className="text-xs text-gray-400 tracking-widest uppercase" style={{ letterSpacing: '0.15em' }}>
          Recharge. Reconnecte. Transforme.
        </p>
      </footer>
    </main>
  );
}