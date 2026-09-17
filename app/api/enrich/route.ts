import { NextResponse } from 'next/server';
import { enrichLeadData } from '@/lib/enrichment';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { leadId, nome, cidade, pais } = await req.json();

    if (!leadId || !nome || !cidade) {
      return NextResponse.json({ error: 'Faltam parametros (leadId, nome, cidade)' }, { status: 400 });
    }

    // Auth check
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: any[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore
            }
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    // Busca os dados enriquecidos
    const enriquecido = await enrichLeadData(nome, cidade, pais);

    // Busca o lead atual para proteger dados existentes
    const { data: lead } = await supabase
      .from('leads')
      .select('facebook, instagram, email')
      .eq('id', leadId)
      .eq('user_id', session.user.id)
      .single();

    // Protege os dados já existentes (como emails precisos do Outscraper) para não serem sobrescritos por OSINT inferior
    const updatePayload: any = {
      fontes: enriquecido.fontes,
      enriquecido_em: new Date().toISOString(),
    };
    if (!lead?.facebook && enriquecido.facebook) updatePayload.facebook = enriquecido.facebook;
    if (!lead?.instagram && enriquecido.instagram) updatePayload.instagram = enriquecido.instagram;
    if (!lead?.email && enriquecido.email) updatePayload.email = enriquecido.email;

    // Atualiza o lead no Supabase
    const { data: updatedLead, error } = await supabase
      .from('leads')
      .update(updatePayload)
      .eq('id', leadId)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Erro atualizando supabase:', error);
      return NextResponse.json({ error: 'Erro ao salvar no banco de dados' }, { status: 500 });
    }

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error: any) {
    console.error('Erro na API de enriquecimento:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

