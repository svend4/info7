import { router } from '../server';
import { productsRouter } from './products';
import { categoriesRouter } from './categories';
import { cartRouter } from './cart';
import { ordersRouter } from './orders';
import { adminRouter } from './admin';

export const appRouter = router({
  products: productsRouter,
  categories: categoriesRouter,
  cart: cartRouter,
  orders: ordersRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
