'use client';

import { useState } from 'react';
import { Course, Price, formatAmount, formatDate } from '@/lib/types';

interface Props {
  course: Course & { prices: Price[] };
  sessions: any[];
  initialSessionId?: string;
  onClose: () => void;
}

type Step = 'form' | 'success';

export default function BookingModal({ course, sessions, initialSessionId, onClose }: Props) {
  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedSessionId, setSelectedSessionId] = useState(initialSessionId || sessions[0]?.id || '');
  const [priceKey, setPriceKey] = useState<'unit' | 'pack' | 'pack5' | 'paid'>('unit');
  const [quantity, setQuantity] = useState(1);
  const [participants, setParticipants] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash'>('stripe');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);
  const bookedCount = selectedSession
    ? (selectedSession.bookings as any[])
        .filter((b: any) => b.status === 'confirmed')
        .reduce((sum: number, b: any) => sum + (b.quantity || 1), 0)
    : 0;
  const remaining = selectedSession ? course.max_spots - bookedCount : 0;

  const unitPrice = course.prices.find((p) => p.price_key === 'unit');
  const pack5Price = course.prices.find((p) => p.price_key === 'pack5');
  const packPrice = course.prices.find((p) => p.price_key === 'pack');

  const computeTotal = (): number | null => {
    if (priceKey === 'paid') return null;
    if (priceKey === 'unit' && unitPrice) return unitPrice.amount * quantity;
    if (priceKey === 'pack5' && pack5Price) return pack5Price.amount;
    if (priceKey === 'pack' && packPrice) return packPrice.amount;
    return null;
  };

  const total = computeTotal();

  const handleQuantityChange = (newQty: number) => {
    const clamped = Math.min(Math.max(1, newQty), remaining);
    setQuantity(clamped);
    setParticipants((prev) => {
      const extras = clamped - 1;
      if (extras <= 0) return [];
      const next = [...prev];
      while (next.length < extras) next.push('');
      return next.slice(0, extras);
    });
  };

  const handleParticipantChange = (index: number, value: string) => {
    setParticipants((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handlePriceKeyChange = (key: 'unit' | 'pack' | 'pack5' | 'paid') => {
    setPriceKey(key);
    setQuantity(1);
    setParticipants([]);
  };

  const handleSubmit = async () => {
    if (!firstName || !lastName || !email) {
      setError('Prénom, nom et email sont obligatoires.');
      return;
    }
    if (participants.some((p) => !p.trim())) {
      setError('Merci de renseigner le nom complet de chaque participant.');
      return;
    }
    if (quantity > remaining) {
      setError(`Il ne reste que ${remaining} place(s) disponible(s).`);
      return;
    }
    setError('');
    setLoading(true);

    try {
      if (paymentMethod === 'stripe' && priceKey !== 'paid') {
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: selectedSessionId,
            first_name: firstName,
            last_name: lastName,
            email,
            phone: phone || null,
            quantity,
            participants,
            price_key: priceKey,
            total_amount: total,
          }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        setError(data.error || 'Erreur Stripe.');
        return;
      }

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: selectedSessionId,
          first_name: firstName,
          last_name: lastName,
          email,
          phone: phone || null,
          quantity,
          participants,
          price_key: priceKey,
          payment_method: paymentMethod,
          total_amount: total,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Une erreur est survenue.');
      } else {
        setStep('success');
      }
    } catch {
      setError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />

      <div className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto md:rounded-sm shadow-2xl">
        <div className="sticky top-0 bg-white border-b px-8 py-5 flex items-center justify-between z-10" style={{ borderColor: 'var(--border)' }}>
          <div>
            <p className="text-xs text-gold tracking-widest uppercase" style={{ letterSpacing: '0.12em' }}>{course.tag}</p>
            <h2 className="font-title font-semibold text-navy text-xl">{course.name}</h2>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-navy text-xl font-light">✕</button>
        </div>

        {step === 'success' ? (
          <div className="px-8 py-12 text-center">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="font-title font-semibold text-navy text-xl mb-2">Réservation confirmée</h3>
            <p className="text-sm text-gray-500 font-light mb-6">
              Votre réservation est bien enregistrée.
            </p>
            <p className="text-sm text-gray-500 font-light mb-6">
              Pour annuler ou modifier, envoyez un message WhatsApp à Nicolas : <a href="https://wa.me/32477732371" target="_blank" className="text-gold underline">+32 477 73 23 71</a><br/>
              <span className="text-xs text-gray-400">Annulation gratuite jusqu'à 24h avant la séance. Pas d'appel, message uniquement.</span>
            </p>
            <button onClick={onClose} className="btn-primary">Fermer</button>
          </div>
        ) : (
          <div className="px-8 py-8 flex flex-col gap-8">
            <div className="gold-rule">
              <p className="text-sm font-medium text-navy capitalize">
                {selectedSession ? formatDate(selectedSession.session_date) : ''}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {selectedSession?.label?.split('—')[1]?.trim() || selectedSession?.label || ''}
              </p>
            </div>

            <div>
              <label className="input-label">Formule</label>
              <div className="flex flex-col gap-2 mt-2">
                {unitPrice && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="priceKey" value="unit" checked={priceKey === 'unit'} onChange={() => handlePriceKeyChange('unit')} className="accent-navy" />
                    <span className="text-sm">{unitPrice.label} — <strong>{formatAmount(unitPrice.amount)}</strong></span>
                  </label>
                )}
                {pack5Price && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="priceKey" value="pack5" checked={priceKey === 'pack5'} onChange={() => handlePriceKeyChange('pack5')} className="accent-navy" />
                    <span className="text-sm">
                      {pack5Price.label} — <strong>{formatAmount(pack5Price.amount)}</strong>
                      {pack5Price.note && <span className="text-gold ml-1 text-xs">· {pack5Price.note}</span>}
                    </span>
                  </label>
                )}
                {packPrice && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="priceKey" value="pack" checked={priceKey === 'pack'} onChange={() => handlePriceKeyChange('pack')} className="accent-navy" />
                    <span className="text-sm">
                      {packPrice.label} — <strong>{formatAmount(packPrice.amount)}</strong>
                      {packPrice.note && <span className="text-gold ml-1 text-xs">· {packPrice.note}</span>}
                    </span>
                  </label>
                )}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="priceKey" value="paid" checked={priceKey === 'paid'} onChange={() => handlePriceKeyChange('paid')} className="accent-navy" />
                  <span className="text-sm">Déjà payé (pack en cours)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="input-label">Nombre de personnes</label>
              {remaining === 0 ? (
                <p className="text-xs text-red-400 mt-2">Plus de places disponibles.</p>
              ) : (
                <div className="flex items-center gap-4 mt-2">
                  <button type="button" onClick={() => handleQuantityChange(quantity - 1)} className="w-8 h-8 border border-gray-200 text-navy font-semibold hover:border-navy transition-colors" style={{ borderRadius: 2 }}>−</button>
                  <span className="font-title font-semibold text-navy text-lg w-6 text-center">{quantity}</span>
                  <button type="button" onClick={() => handleQuantityChange(quantity + 1)} className="w-8 h-8 border border-gray-200 text-navy font-semibold hover:border-navy transition-colors" style={{ borderRadius: 2 }}>+</button>
                  <span className="text-xs text-gray-400">{remaining} place{remaining > 1 ? 's' : ''} disponible{remaining > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            {participants.length > 0 && (
              <div className="flex flex-col gap-3">
                <label className="input-label">Participants supplémentaires</label>
                {participants.map((name, i) => (
                  <div key={i}>
                    <label className="text-xs text-gray-400 mb-1 block">Participant {i + 2} — Nom complet</label>
                    <input className="input-field" placeholder="Prénom Nom" value={name} onChange={(e) => handleParticipantChange(i, e.target.value)} />
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="input-label">Votre prénom *</label>
                <input className="input-field" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div>
                <label className="input-label">Votre nom *</label>
                <input className="input-field" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="input-label">Email *</label>
                <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="input-label">Téléphone (optionnel)</label>
                <input type="tel" className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            {priceKey !== 'paid' && (
              <div>
                <label className="input-label">Mode de paiement</label>
                <div className="flex gap-3 mt-2 flex-wrap">
                  {(['stripe', 'cash'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`px-4 py-2 text-xs border transition-all duration-150 ${
                        paymentMethod === m ? 'border-navy bg-navy text-white' : 'border-gray-200 text-gray-500 hover:border-navy'
                      }`}
                      style={{ borderRadius: 2, letterSpacing: '0.08em' }}
                    >
                      {m === 'stripe' ? 'Carte / Bancontact' : 'Cash'}
                    </button>
                  ))}
                </div>
                <div className="mt-4 text-xs text-gray-500 font-light leading-relaxed bg-gray-50 p-4" style={{ borderRadius: 2 }}>
                  {paymentMethod === 'stripe' && (
                    <p>Tu seras redirigé vers la page de paiement sécurisé Stripe. Carte bancaire et Bancontact acceptés.</p>
                  )}
                  {paymentMethod === 'cash' && (
                    <p>💶 Cash à régler sur place le jour J.{total && ` Montant : ${formatAmount(total)}.`}</p>
                  )}
                </div>
              </div>
            )}

            {priceKey === 'paid' && (
              <div className="text-xs text-gray-500 bg-gray-50 p-4" style={{ borderRadius: 2 }}>
                ✅ Séance décomptée de votre pack.
              </div>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              {total ? (
                <p className="font-title font-semibold text-navy text-2xl">{formatAmount(total)}</p>
              ) : (
                <p className="text-sm text-gray-400">—</p>
              )}
              <button onClick={handleSubmit} disabled={loading} className="btn-primary">
                {loading ? 'En cours…' : 'Confirmer la réservation'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}