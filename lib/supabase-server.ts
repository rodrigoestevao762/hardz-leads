import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function supabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { "Accept-Profile": "public", "Content-Profile": "public" } },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // chamadas de servidor: middleware renova a sessão
          }
        },
      },
    }
  );
}

export async function usuarioObrigatorio() {
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  if (!data?.user) throw new Error("não autenticado");
  return { sb, user: data.user };
}
