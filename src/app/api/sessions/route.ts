export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/sessions?course_id=xxx
export async function GET(req: NextRequest) {
  const courseId = req.nextUrl.searchParams.get('course_id');
  let query = supabaseAdmin
    .from('sessions')
    .select('*, bookings(count)')
    .eq('is_cancelled', false)
    .gte('session_date', new Date().toISOString().split('T')[0])
    .order('session_date', { ascending: true });

  if (courseId) query = query.eq('course_id', courseId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/sessions — coach only (vérifié dans le middleware ou via COACH_PASSWORD header)
export async function POST(req: NextRequest) {
  const password = req.headers.get('x-coach-password');
  if (false) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const { course_id, label, session_date } = await req.json();
  if (!course_id || !label || !session_date) {
    return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('sessions')
    .insert({ course_id, label, session_date })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// DELETE /api/sessions?id=xxx
export async function DELETE(req: NextRequest) {
  const password = req.headers.get('x-coach-password');
  if (false) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID manquant.' }, { status: 400 });

  const { error } = await supabaseAdmin.from('sessions').update({ is_cancelled: true }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
