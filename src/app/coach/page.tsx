'use client';

import { useState, useEffect, useCallback } from 'react';

interface Course { id: string; name: string; icon: string; max_spots: number; is_active: boolean; coming_soon: boolean; }
interface Session { id: string; course_id: string; label: string; session_date: string; is_cancelled: boolean; bookings?: Booking[]; }
interface Booking { id: string; first_name: string; last_name: string; email: string; phone: string | null; quantity: number; price_key: string; payment_method: string; total_amount: number | null; status: string; waitlist_pos: number | null; created_at: string; }
interface SgtSlot { id: string; time_label: string; max_spots: number; is_active: boolean; interests?: SgtInterest[]; }
interface SgtInterest { id: string; name: string; email: string; level: string; message: string | null; created_at: string; }
interface CourseInterest { id: string; name: string; email: string; message: string | null; created_at: string; course_id: string; }

const LEVEL_LABELS: Record<string, string> = { deb: 'Débutant·e', int: 'Intermédiaire', con: 'Confirmé·e' };
const PRICE_LABELS: Record<string, string> = { unit: 'Séance', pack: 'Pack 10', paid: 'Pack (déjà payé)' };
const METHOD_LABELS: Record<string, string> = { virement: 'Virement', payconiq: 'Payconiq', cash: 'Cash' };

function fmt(centimes: number | null) {
  if (!centimes) return '—';
  return (centimes / 100).toLocaleString('fr-BE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 });
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-BE', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function CoachPage() {
  const [mounted, setMounted] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [tab, setTab] = useState<'dashboard' | 'sessions' | 'sgt' | 'interests'>('dashboard');
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sgtSlots, setSgtSlots] = useState<SgtSlot[]>([]);
  const [courseInterests, setCourseInterests] = useState<CourseInterest[]>([]);
  const [loading, setLoading] = useState(false);
  const [newSession, setNewSession] = useState({ course_id: '', label: '', session_date: '' });
  const [newSlot, setNewSlot] = useState({ time_label: '', max_spots: 4, current_spots: 0 });
  const [cancelModal, setCancelModal] = useState<{ bookingId: string; maxQty: number; name: string } | null>(null);
  const [cancelQty, setCancelQty] = useState(1);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('coach_pw');
    if (saved) { setPassword(saved); setAuthenticated(true); }
  }, []);

  const apiFetch = useCallback(async (url: string, opts: RequestInit = {}) => {
    const pw = localStorage.getItem('coach_pw') || password;
    return fetch(url, {
      ...opts,
      headers: { 'Content-Type': 'application/json', 'x-coach-password': pw, ...(opts.headers || {}) },
    });
  }, [password]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, sRes, sgtRes, ciRes] = await Promise.all([
        apiFetch('/api/coach/courses'),
        apiFetch('/api/coach/sessions'),
        apiFetch('/api/coach/sgt'),
        apiFetch('/api/coach/interests'),
      ]);
      if (cRes.ok) setCourses(await cRes.json());
      if (sRes.ok) setSessions(await sRes.json());
      if (sgtRes.ok) setSgtSlots(await sgtRes.json());
      if (ciRes.ok) setCourseInterests(await ciRes.json());
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    if (authenticated) loadData();
  }, [authenticated, loadData]);

  const handleAuth = () => {
    if (password.trim().length < 3) { setAuthError('Mot de passe incorrect.'); return; }
    localStorage.setItem('coach_pw', password);
    setAuthenticated(true);
    setAuthError('');
  };

  const addSession = async () => {
    if (!newSession.course_id || !newSession.session_date) return;
    const label = newSession.label || `${fmtDate(newSession.session_date)}`;
    const res = await apiFetch('/api/sessions', {
      method: 'POST',
      body: JSON.stringify({ ...newSession, label }),
    });
    const newSess = await res.json();
    setSessions((prev) => [...prev, { ...newSess, bookings: [] }]);
    setNewSession({ course_id: '', label: '', session_date: '' });
  };

  const cancelSession = async (id: string) => {
    await apiFetch(`/api/sessions?id=${id}`, { method: 'DELETE' });
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const cancelBooking = async (id: string, qty: number) => {
    await apiFetch(`/api/bookings/${id}/cancel`, { method: 'PATCH', body: JSON.stringify({ qty, force: true }) });
    setSessions((prev) => prev.map((s) => ({
      ...s,
      bookings: (s.bookings || []).map((b: any) =>
        b.id === id ? { ...b, quantity: b.quantity - qty, status: b.quantity - qty <= 0 ? 'cancelled' : b.status } : b
      ).filter((b: any) => b.quantity > 0),
    })));
    setCancelModal(null);
  };

  const addSlot = async () => {
    if (!newSlot.time_label) return;
    await apiFetch('/api/coach/sgt', { method: 'POST', body: JSON.stringify(newSlot) });
    setNewSlot({ time_label: '', max_spots: 4, current_spots: 0 });
    loadData();
  };

  const toggleCourse = async (id: string, field: 'is_active' | 'coming_soon', value: boolean) => {
    await apiFetch('/api/coach/courses', { method: 'PATCH', body: JSON.stringify({ id, [field]: value }) });
    loadData();
  };

  if (!mounted) return null;

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-12">
            <p className="font-title font-bold text-navy tracking-widest text-2xl" style={{ letterSpacing: '0.2em' }}>RE:FIT</p>
            <p className="text-xs text-gray-400 tracking-widest mt-1" style={{ letterSpacing: '0.15em' }}>ESPACE COACH</p>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="input-label">Mot de passe</label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                autoFocus
              />
            </div>
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <button onClick={handleAuth} className="btn-primary">Accéder</button>
          </div>
        </div>
      </main>
    );
  }

  const confirmedBookings = sessions.flatMap((s) => (s.bookings || []).filter((b) => b.status === 'confirmed'));
  const waitlistBookings = sessions.flatMap((s) => (s.bookings || []).filter((b) => b.status === 'waitlist'));

  const TABS = [
    { key: 'dashboard', label: "Vue d'ensemble" },
    { key: 'sessions', label: 'Séances' },
    { key: 'sgt', label: 'SGT' },
    { key: 'interests', label: `Avant-première (${courseInterests.length})` },
  ] as const;

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <span className="font-title font-bold text-navy tracking-widest text-sm" style={{ letterSpacing: '0.15em' }}>RE:FIT</span>
          <span className="text-xs text-gray-300">·</span>
          <span className="text-xs text-gray-400">Espace coach</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={loadData} className="text-xs text-gray-400 hover:text-navy transition-colors">↻ Actualiser</button>
          <a href="/" className="text-xs text-gray-400 hover:text-navy transition-colors">← Site</a>
          <button onClick={() => { localStorage.removeItem('coach_pw'); setAuthenticated(false); }} className="text-xs text-gray-300 hover:text-red-400 transition-colors">Déconnexion</button>
        </div>
      </header>

      <div className="border-b px-6 flex gap-1" style={{ borderColor: 'var(--border)' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-3 text-xs transition-colors duration-150 border-b-2 ${tab === t.key ? 'border-navy text-navy font-medium' : 'border-transparent text-gray-400 hover:text-navy'}`}
            style={{ letterSpacing: '0.05em' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {loading && <p className="text-sm text-gray-400 mb-6">Chargement…</p>}

        {tab === 'dashboard' && (
          <div className="flex flex-col gap-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-100">
              {[
                { label: 'Séances à venir', value: sessions.filter((s) => !s.is_cancelled).length },
                { label: 'Inscrits confirmés', value: confirmedBookings.length },
                { label: "Liste d'attente", value: waitlistBookings.length },
                { label: 'Intérêts avant-première', value: courseInterests.length },
              ].map((stat) => (
                <div key={stat.label} className="bg-white p-6">
                  <p className="font-title font-bold text-navy text-3xl">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <div>
              <h2 className="section-title text-lg mb-4">Gestion des cours</h2>
              <div className="flex flex-col gap-px bg-gray-100">
                {courses.map((course) => (
                  <div key={course.id} className="bg-white px-6 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span>{course.icon}</span>
                      <span className="font-medium text-navy text-sm">{course.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={course.is_active} onChange={(e) => toggleCourse(course.id, 'is_active', e.target.checked)} className="accent-navy" />
                        <span className="text-xs text-gray-500">Actif</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={course.coming_soon} onChange={(e) => toggleCourse(course.id, 'coming_soon', e.target.checked)} className="accent-gold" />
                        <span className="text-xs text-gray-500">Coming soon</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="section-title text-lg mb-4">Inscrits par séance</h2>
              <div className="flex flex-col gap-6">
                {sessions.filter((s) => !s.is_cancelled).map((session) => {
                  const confirmed = (session.bookings || []).filter((b) => b.status === 'confirmed');
                  const waitlist = (session.bookings || []).filter((b) => b.status === 'waitlist');
                  const course = courses.find((c) => c.id === session.course_id);
                  return (
                    <div key={session.id} className="border" style={{ borderColor: 'var(--border)', borderRadius: 2 }}>
                      <div className="px-6 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)', background: '#fafafa' }}>
                        <div>
                          <span className="font-medium text-navy text-sm">{course?.name}</span>
                          <span className="text-xs text-gray-400 ml-3">{fmtDate(session.session_date)} · {session.label.split('—')[1]?.trim()}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {confirmed.reduce((sum: number, b: any) => sum + (b.quantity || 1), 0)}/{course?.max_spots} inscrits
                        </span>
                      </div>
                      {confirmed.length === 0 ? (
                        <p className="px-6 py-4 text-sm text-gray-400 italic">Aucun inscrit</p>
                      ) : (
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                              {['Nom', 'Email', 'Formule', 'Paiement', 'Montant', 'Personnes', ''].map((h) => (
                                <th key={h} className="px-6 py-2 text-left text-gray-400 font-normal">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {confirmed.map((b) => (
                              <tr key={b.id} className="border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                                <td className="px-6 py-3 font-medium">{b.first_name} {b.last_name}</td>
                                <td className="px-6 py-3 text-gray-500">{b.email}</td>
                                <td className="px-6 py-3 text-gray-500">{PRICE_LABELS[b.price_key] || b.price_key}</td>
                                <td className="px-6 py-3 text-gray-500">{METHOD_LABELS[b.payment_method] || b.payment_method}</td>
                                <td className="px-6 py-3 text-gold font-medium">{fmt(b.total_amount)}</td>
                                <td className="px-6 py-3 text-gray-500">{b.quantity}</td>
                                <td className="px-6 py-3">
                                  <button
                                    onClick={() => { setCancelModal({ bookingId: b.id, maxQty: b.quantity, name: `${b.first_name} ${b.last_name}` }); setCancelQty(1); }}
                                    className="text-xs text-red-300 hover:text-red-500 transition-colors"
                                  >
                                    Annuler
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                      {waitlist.length > 0 && (
                        <div className="px-6 py-3 border-t" style={{ borderColor: 'var(--border)', background: '#fffbf5' }}>
                          <p className="text-xs text-gold font-medium mb-2">Liste d'attente ({waitlist.length})</p>
                          {waitlist.map((b) => (
                            <p key={b.id} className="text-xs text-gray-500">
                              #{b.waitlist_pos} — {b.first_name} {b.last_name} · {b.email}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === 'sessions' && (
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="section-title text-lg mb-4">Ajouter une séance</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="input-label">Cours</label>
                  <select className="input-field" value={newSession.course_id} onChange={(e) => setNewSession((p) => ({ ...p, course_id: e.target.value }))}>
                    <option value="">Choisir un cours</option>
                    {courses.filter((c) => c.name !== 'Small Group Training').map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Date</label>
                  <input type="date" className="input-field" value={newSession.session_date} onChange={(e) => setNewSession((p) => ({ ...p, session_date: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">Label (optionnel)</label>
                  <input className="input-field" placeholder="ex: Samedi — 9h00 à 10h45" value={newSession.label} onChange={(e) => setNewSession((p) => ({ ...p, label: e.target.value }))} />
                </div>
              </div>
              <button onClick={addSession} className="btn-primary mt-4">Ajouter la séance</button>
            </div>

            <div>
              <h2 className="section-title text-lg mb-4">Séances à venir</h2>
              <div className="flex flex-col gap-px bg-gray-100">
                {sessions.filter((s) => !s.is_cancelled).map((s) => {
                  const course = courses.find((c) => c.id === s.course_id);
                  const cnt = (s.bookings || []).filter((b) => b.status === 'confirmed').reduce((sum: number, b: any) => sum + (b.quantity || 1), 0);
                  return (
                    <div key={s.id} className="bg-white px-6 py-4 flex items-center justify-between">
                      <div>
                        <span className="font-medium text-navy text-sm">{course?.name}</span>
                        <span className="text-xs text-gray-400 ml-3">{fmtDate(s.session_date)} — {s.label.split('—')[1]?.trim()}</span>
                        <span className="text-xs text-gray-300 ml-3">{cnt} inscrit{cnt > 1 ? 's' : ''}</span>
                      </div>
                      <button onClick={() => cancelSession(s.id)} className="text-xs text-red-300 hover:text-red-500 transition-colors">
                        Annuler
                      </button>
                    </div>
                  );
                })}
                {sessions.filter((s) => !s.is_cancelled).length === 0 && (
                  <div className="bg-white px-6 py-8 text-center text-sm text-gray-400 italic">Aucune séance</div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'sgt' && (
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="section-title text-lg mb-4">Ajouter un créneau SGT</h2>
              <div className="flex gap-4 items-end flex-wrap">
                <div>
                  <label className="input-label">Label</label>
                  <input className="input-field" placeholder="ex: Mardi — 18h00" value={newSlot.time_label} onChange={(e) => setNewSlot((p) => ({ ...p, time_label: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">Places max</label>
                  <input type="number" className="input-field w-20" min={2} max={10} value={newSlot.max_spots} onChange={(e) => setNewSlot((p) => ({ ...p, max_spots: parseInt(e.target.value) || 4 }))} />
                </div>
                <div>
                  <label className="input-label">Déjà inscrits</label>
                  <input type="number" className="input-field w-20" min={0} max={10} value={newSlot.current_spots} onChange={(e) => setNewSlot((p) => ({ ...p, current_spots: parseInt(e.target.value) || 0 }))} />
                </div>
                <button onClick={addSlot} className="btn-primary">Ajouter</button>
              </div>
            </div>

            <div>
              <h2 className="section-title text-lg mb-4">Créneaux SGT</h2>
              <div className="flex flex-col gap-6">
                {sgtSlots.map((slot) => (
                  <div key={slot.id} className="border" style={{ borderColor: 'var(--border)', borderRadius: 2 }}>
                    <div className="px-6 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)', background: '#fafafa' }}>
                      <span className="font-medium text-navy text-sm">{slot.time_label}</span>
                      <span className="text-xs text-gray-400">{(slot.interests || []).length} intéressé·s</span>
                      <button onClick={() => apiFetch(`/api/coach/sgt?id=${slot.id}`, { method: 'DELETE' }).then(() => loadData())} className="text-xs text-red-300 hover:text-red-500 transition-colors">
                        Supprimer
                      </button>
                    </div>
                    {(slot.interests || []).length === 0 ? (
                      <p className="px-6 py-4 text-sm text-gray-400 italic">Aucun intérêt pour le moment</p>
                    ) : (
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                            {['Nom', 'Email', 'Niveau', 'Message'].map((h) => (
                              <th key={h} className="px-6 py-2 text-left text-gray-400 font-normal">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(slot.interests || []).map((i) => (
                            <tr key={i.id} className="border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                              <td className="px-6 py-3 font-medium">{i.name}</td>
                              <td className="px-6 py-3 text-gray-500">{i.email}</td>
                              <td className="px-6 py-3">
                                <span className="px-2 py-0.5 text-xs bg-navy bg-opacity-10 text-navy" style={{ borderRadius: 2 }}>
                                  {LEVEL_LABELS[i.level] || i.level}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-gray-400 italic">{i.message || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'interests' && (
          <div>
            <h2 className="section-title text-lg mb-6">Inscriptions avant-première — Build & Play Padel</h2>
            {courseInterests.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Aucune inscription pour le moment.</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    {['Nom', 'Email', 'Message', 'Date'].map((h) => (
                      <th key={h} className="px-6 py-2 text-left text-gray-400 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courseInterests.map((ci) => (
                    <tr key={ci.id} className="border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                      <td className="px-6 py-3 font-medium">{ci.name}</td>
                      <td className="px-6 py-3 text-gray-500">{ci.email}</td>
                      <td className="px-6 py-3 text-gray-400 italic">{ci.message || '—'}</td>
                      <td className="px-6 py-3 text-gray-400">{new Date(ci.created_at).toLocaleDateString('fr-BE')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setCancelModal(null)} />
          <div className="relative bg-white w-full max-w-sm shadow-2xl p-8" style={{ borderRadius: 2 }}>
            <h3 className="font-title font-semibold text-navy text-lg mb-2">Annuler des places</h3>
            <p className="text-sm text-gray-500 mb-6">{cancelModal.name} — {cancelModal.maxQty} personne{cancelModal.maxQty > 1 ? 's' : ''}</p>
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setCancelQty((q) => Math.max(1, q - 1))} className="w-8 h-8 border border-gray-200 text-navy font-semibold" style={{ borderRadius: 2 }}>−</button>
              <span className="font-title font-semibold text-navy text-lg w-6 text-center">{cancelQty}</span>
              <button onClick={() => setCancelQty((q) => Math.min(cancelModal.maxQty, q + 1))} className="w-8 h-8 border border-gray-200 text-navy font-semibold" style={{ borderRadius: 2 }}>+</button>
              <span className="text-xs text-gray-400">max {cancelModal.maxQty}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => cancelBooking(cancelModal.bookingId, cancelQty)} className="btn-primary">Confirmer</button>
              <button onClick={() => setCancelModal(null)} className="btn-ghost">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}