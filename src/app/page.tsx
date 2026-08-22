import { supabaseAdmin } from '@/lib/supabase';
import { Course, Price, SgtSlot } from '@/lib/types';
import Header from '@/components/Header';
import CourseCard from '@/components/CourseCard';
import ComingSoonCard from '@/components/ComingSoonCard';
import SgtSection from '@/components/SgtSection';

async function getData() {
  const { data: courses } = await supabaseAdmin
    .from('courses')
    .select('*, prices(*)')
    .eq('is_active', true)
    .order('coming_soon', { ascending: true });

  const { data: sessions } = await supabaseAdmin
    .from('sessions')
    .select('*, bookings(id, quantity, status)')
    .eq('is_cancelled', false)
    .gte('session_date', new Date().toISOString().split('T')[0])
    .order('session_date', { ascending: true });

  const { data: sgtSlots } = await supabaseAdmin
    .from('sgt_slots')
    .select('*, sgt_interests(count)')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  return {
    courses: (courses || []) as any[],
    sessions: (sessions || []) as any[],
    sgtSlots: (sgtSlots || []) as any[],
  };
}

export const revalidate = 0;

export default async function HomePage() {
  const { courses, sessions, sgtSlots } = await getData();

  const sessionsByCourse: Record<string, any[]> = {};
  sessions.forEach((s: any) => {
    if (!sessionsByCourse[s.course_id]) sessionsByCourse[s.course_id] = [];
    sessionsByCourse[s.course_id].push(s);
  });

  const activeCourses = courses.filter((c: any) => !c.coming_soon && c.name !== 'Small Group Training');
  const comingSoonCourses = courses.filter((c: any) => c.coming_soon);

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="pt-24 pb-16 px-6 text-center bg-white border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="font-title font-bold text-navy text-lg mb-2">Nicolas Pascucci</div>
        <p className="text-xs tracking-widest uppercase text-gold mb-4" style={{ letterSpacing: '0.2em' }}>
          Coaching sport · santé · bien-être
        </p>
        <h1 className="font-title font-bold text-navy text-4xl md:text-5xl mb-4 leading-tight">
          Recharge. Reconnecte. Transforme.
        </h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto font-light leading-relaxed">
          Des expériences conçues pour augmenter ton énergie, améliorer ta santé et te déconnecter de ton quotidien.
        </p>
      </section>

      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="section-title text-2xl mb-10">Mes sessions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white">
          {activeCourses.map((course: any) => (
            <CourseCard
              key={course.id}
              course={course}
              sessions={sessionsByCourse[course.id] || []}
            />
          ))}
        </div>
      </section>

      {comingSoonCourses.length > 0 && (
        <section className="py-8 px-6 max-w-5xl mx-auto">
          {comingSoonCourses.map((course: any) => (
            <ComingSoonCard key={course.id} course={course} />
          ))}
        </section>
      )}

      <SgtSection slots={sgtSlots} />

      <footer className="border-t py-12 px-6 text-center" style={{ borderColor: 'var(--border)' }}>
        <p className="font-title font-semibold text-navy text-lg tracking-widest mb-1">RE:FIT</p>
        <p className="text-xs text-gray-400 tracking-widest uppercase" style={{ letterSpacing: '0.15em' }}>
          Recharge. Reconnecte. Transforme.
        </p>
        <p className="text-xs text-gray-300 mt-6">
          © {new Date().getFullYear()} Re:Fit — Belgique
        </p>
        <a href="/contact" className="text-xs text-gold mt-4 block hover:underline">
          Me contacter
        </a>
      </footer>
    </main>
  );
}