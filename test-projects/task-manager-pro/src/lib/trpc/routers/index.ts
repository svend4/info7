/**
 * Root tRPC router
 * Combines all feature routers into a single AppRouter
 */

import { router } from '../server';
import { tasksRouter } from './tasks';
import { categoriesRouter } from './categories';
import { tagsRouter } from './tags';

/**
 * Main application router
 * Exports the type for use in tRPC client
 */
export const appRouter = router({
  tasks: tasksRouter,
  categories: categoriesRouter,
  tags: tagsRouter,
});

// Export type definition for tRPC client
export type AppRouter = typeof appRouter;
