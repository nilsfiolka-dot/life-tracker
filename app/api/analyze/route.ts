import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabaseClient';
import { runWellbeingAgent } from '../../lib/ai/agent';

export async function POST() {
  try {
    // 1. Logs der letzten 30 Tage aus Supabase laden
    const now = new Date();
    const start = new Date();
    start.setDate(now.getDate() - 30);
    const startIso = start.toISOString().split('T')[0];
    const endIso = now.toISOString().split('T')[0];

    const { data: logs, error: fetchError } = await supabase
      .from('wellbeing_logs')
      .select('*')
      .gte('log_date', startIso)
      .lte('log_date', endIso)
      .order('log_date', { ascending: true });

    if (fetchError) throw fetchError;
    if (!logs || logs.length === 0) {
      return NextResponse.json({ error: 'Keine Logdaten im Zeitraum vorhanden.' }, { status: 400 });
    }

    // 2. Den Gemini-Agenten mit den echten Logs triggern
    const aiAnalysisResult = await runWellbeingAgent(logs);

    // 3. Das Ergebnis persistent in Supabase cachen (ID 1 überschreiben oder anlegen)
    const { error: upsertError } = await supabase
      .from('ai_dashboard_insights')
      .upsert({ id: 1, insights: aiAnalysisResult, updated_at: new Date().toISOString() }, { onConflict: 'id' });

    if (upsertError) throw upsertError;

    return NextResponse.json(aiAnalysisResult);
  } catch (error: any) {
    console.error('Agent Engine Error:', error);
    return NextResponse.json({ error: error.message || 'Interner Server Error' }, { status: 500 });
  }
}

// GET-Endpunkt, um die gecashten Insights beim Laden der Seite sofort anzuzeigen
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('ai_dashboard_insights')
      .select('insights')
      .eq('id', 1)
      .single();

    if (error || !data) {
      return NextResponse.json({ sport: null, uni: null, sidehustle: null });
    }

    return NextResponse.json(data.insights);
  } catch {
    return NextResponse.json({ sport: null, uni: null, sidehustle: null });
  }
}