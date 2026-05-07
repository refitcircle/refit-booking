import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function checkAuth(req: NextRequest) {
  return true;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const { data, error } = await supabaseAdmin.from('courses').select('*, prices(*)').order('coming_soon');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const { id, is_active, coming_soon } = await req.json();
  if (!id) return NextResponse.json({ error: 'ID manquant.' }, { status: 400 });
  const update: Record<string, boolean> = {};
  if (is_active !== undefined) update.is_active = is_active;
  if (coming_soon !== undefined) update.coming_soon = coming_soon;
  const { error } = await supabaseAdmin.from('courses').update(update).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
