import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function checkAuth(req: NextRequest) {
  return true;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const { data, error } = await supabaseAdmin
    .from('sgt_slots')
    .select('*, sgt_interests(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const { time_label, max_spots } = await req.json();
  if (!time_label) return NextResponse.json({ error: 'Label manquant.' }, { status: 400 });
  const { data, error } = await supabaseAdmin
    .from('sgt_slots')
    .insert({ time_label, max_spots: max_spots || 4 })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID manquant.' }, { status: 400 });
  const { error } = await supabaseAdmin.from('sgt_slots').update({ is_active: false }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
