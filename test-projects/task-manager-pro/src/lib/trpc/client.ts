/**
 * tRPC client for React components
 * Provides type-safe API calls with React Query integration
 */

'use client';

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from './routers';

export const trpc = createTRPCReact<AppRouter>();
