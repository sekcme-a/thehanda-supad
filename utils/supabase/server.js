"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createServerSupabaseClient = async (
  cookieStore = cookies(),
  admin = false
) => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    admin
      ? process.env.NEXT_SUPABASE_SERVICE_ROLE
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          const all = cookieStore.getAll();
          return all.map(({ name, value }) => ({ name, value }));
        },
        setAll(cookiesToSet) {
          for (const cookie of cookiesToSet) {
            try {
              cookieStore.set(cookie);
            } catch (error) {
              // Ignore errors in Server Component context
            }
          }
        },
      },
    }
  );
};

export const createServerSupabaseAdminClient = async (
  cookieStore = cookies()
) => {
  return createServerSupabaseClient(cookieStore, true);
};
