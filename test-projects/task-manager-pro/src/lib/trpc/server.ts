/**
 * tRPC server initialization and context creation
 * Provides type-safe procedures with Supabase authentication
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Context for tRPC procedures
 * Includes Supabase client and user session
 */
export interface Context {
  supabase: SupabaseClient<Database>;
  userId: string | null;
}

/**
 * Creates context for each tRPC request
 * Initializes Supabase client and fetches current user
 */
export async function createTRPCContext(): Promise<Context> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    supabase,
    userId: user?.id ?? null,
  };
}

// Initialize tRPC with context
const t = initTRPC.context<Context>().create();

// Export reusable router and procedure helpers
export const router = t.router;

/**
 * Public procedure - no authentication required
 */
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authentication
 * Throws UNAUTHORIZED if user is not logged in
 */
export const protectedProcedure = t.procedure.use(async function isAuthed(opts) {
  if (!opts.ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to perform this action',
    });
  }

  return opts.next({
    ctx: {
      ...opts.ctx,
      // userId is now guaranteed to be non-null
      userId: opts.ctx.userId,
    },
  });
});
