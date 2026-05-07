import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendCoachPadelInterest } from '@/lib/emails';

export async function POST(req: NextRequest) {
  try {
    const { course_id, name, email, message } = await req.json();

    if (!course_id || !name || !email) {
      return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 });
    }

    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('id, name')
      .eq('id', course_id)
      .single();

    if (!course) return NextResponse.json({ error: 'Cours introuvable.' }, { status: 404 });

    const { error } = await supabaseAdmin.from('course_interests').insert({
      course_id,
      name,
      email,
      message: message || null,
    });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: 'Erreur.' }, { status: 500 });
    }

    // Notifier le coach
    const coachEmail = process.env.COACH_EMAIL || 'nicolas@refit.be';
    try {
      await sendCoachPadelInterest(coachEmail, name, email, message || null);
    } catch (emailErr) {
      console.error('Email error:', emailErr);
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erreur interne.' }, { status: 500 });
  }
}
