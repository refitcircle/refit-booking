'use client';

import { useState } from 'react';
import { Course, Session, Price, formatAmount, formatDate } from '@/lib/types';
import BookingModal from './BookingModal';
import WaitlistModal from './WaitlistModal';

interface Props {
  course: Course & { prices: Price[] };
  sessions: any[];
}

export default function CourseCard({ course, sessions }: Props) {
  const [bookingModal, setBookingModal] = useState(false);
  const [waitlistModal, setWaitlistModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(sessions[0]?.id || '');

  const selectedSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0] || null;
  const bookedCount = selectedSession
    ? (selectedSession.bookings as any[])
        .filter((b: any) => b.status === 'confirmed')
        .reduce((sum: number, b: any) => sum + (b.quantity || 1), 0)
    : 0;
  const remaining = selectedSession ? course.max_spots - bookedCount : 0;
  const isFull = remaining <= 0;
  const fillPct = selectedSession ? Math.round((bookedCount / course.max_spots) * 100) : 0;

  const unitPrice = course.prices.find((p) => p.price_key === 'unit');
  const pack5Price = course.prices.find((p) => p.price_key === 'pack5');
  const packPrice = course.prices.find((p) => p.price_key === 'pack');

  return (
    <>
      <div className="bg-white p-8 flex flex-col gap-6">
        <div>
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-xs text-gold tracking-widest uppercase" style={{ letterSpacing: '0.12em' }}>
                {course.tag}
              </span>
              <h3 className="font-title font-semibold text-navy text-xl mt-1">{course.name}</h3>
            </div>
            <span className="text-2xl">{course.icon}</span>
          </div>
          <p className="text-gray-500 text-sm font-light leading-relaxed">{course.description}</p>
        </div>

        <p className="text-xs text-gray-400">📍 {course.location}</p>
        {course.schedule && <p className="text-xs text-gray-400">🕐 {course.schedule}</p>}

        {sessions.length > 0 ? (
          <div>
            <label className="text-xs text-gray-400 tracking-widest uppercase mb-2 block" style={{ letterSpacing: '0.1em' }}>
              Choisir une date
            </label>
            <select
              className="w-full border-b border-gray-200 py-2 text-sm text-navy focus:outline-none focus:border-navy bg-transparent"
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
            >
              {sessions.map((s) => {
                const cnt = (s.bookings as any[]).filter((b: any) => b.status === 'confirmed').reduce((sum: number, b: any) => sum + (b.quantity || 1), 0);
                const rem = course.max_spots - cnt;
                const date = new Date(s.session_date).toLocaleDateString('fr-BE', { weekday: 'long', day: 'numeric', month: 'long' });
                const heure = s.label?.split('—')[1]?.trim() || '';
                return (
                  <option key={s.id} value={s.id}>
                    {date}{heure ? ` — ${heure}` : ''} ({rem > 0 ? `${rem} place${rem > 1 ? 's' : ''}` : 'Complet'})
                  </option>
                );
              })}
            </select>

            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{bookedCount} inscrit{bookedCount > 1 ? 's' : ''}</span>
                <span>{remaining > 0 ? `${remaining} place${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}` : 'Complet'}</span>
              </div>
              <div className="w-full h-0.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${fillPct}%`,
                    background: fillPct >= 80 ? '#c8973a' : '#225675',
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">Aucune séance programmée pour le moment</p>
        )}

        <div className="gold-rule">
          <div className="flex gap-6 flex-wrap">
            {unitPrice && (
              <div>
                <p className="font-title font-semibold text-navy text-xl">{formatAmount(unitPrice.amount)}</p>
                <p className="text-xs text-gray-400">{unitPrice.label}</p>
              </div>
            )}
            {pack5Price && (
              <div>
                <p className="font-title font-semibold text-navy text-xl">{formatAmount(pack5Price.amount)}</p>
                <p className="text-xs text-gray-400">
                  {pack5Price.label}
                  {pack5Price.note && <span className="text-gold ml-1">· {pack5Price.note}</span>}
                </p>
              </div>
            )}
            {packPrice && (
              <div>
                <p className="font-title font-semibold text-navy text-xl">{formatAmount(packPrice.amount)}</p>
                <p className="text-xs text-gray-400">
                  {packPrice.label}
                  {packPrice.note && <span className="text-gold ml-1">· {packPrice.note}</span>}
                </p>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-400 font-light leading-relaxed">
          Annulation acceptée jusqu'à 24h avant la séance.
        </p>

        {sessions.length > 0 ? (
          <button
            onClick={() => isFull ? setWaitlistModal(true) : setBookingModal(true)}
            className={isFull ? 'btn-ghost self-start' : 'btn-primary self-start'}
          >
            {isFull ? "Liste d'attente" : 'Réserver'}
          </button>
        ) : (
          <button disabled className="btn-primary self-start opacity-40 cursor-not-allowed">
            Réserver
          </button>
        )}
      </div>

      {bookingModal && selectedSession && (
        <BookingModal
          course={course}
          sessions={sessions}
          initialSessionId={selectedSessionId}
          onClose={() => setBookingModal(false)}
        />
      )}
      {waitlistModal && selectedSession && (
        <WaitlistModal
          session={selectedSession}
          course={course}
          onClose={() => setWaitlistModal(false)}
        />
      )}
    </>
  );
}
