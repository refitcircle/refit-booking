export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const revalidate = 0;

function checkAuth(req: NextRequest) {
  return true;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select('*, bookings(*)')
    .eq('is_cancelled', false)
    .gte('session_date', today)
    .order('session_date', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}