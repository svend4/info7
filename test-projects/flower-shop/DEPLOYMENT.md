# Deployment Guide - Flower Shop

This guide covers deploying the Flower Shop e-commerce platform to various platforms.

## Prerequisites

Before deploying, ensure you have:

1. **Supabase Project** - Create at [supabase.com](https://supabase.com)
   - Run the migrations in `supabase/migrations/` folder
   - Note your project URL and anon key

2. **Environment Variables**
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

## Deployment Options

### Option 1: Render.com (Recommended)

**Using Blueprint (Automated):**

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New" → "Blueprint"
4. Connect your repository
5. Render will automatically detect `render.yaml` and configure the service
6. Add environment variables in the Render dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. Click "Apply" to deploy

**Manual Setup:**

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** flower-shop
   - **Region:** Oregon (US West)
   - **Branch:** main (or your branch)
   - **Root Directory:** test-projects/flower-shop
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
5. Add environment variables:
   - `NODE_VERSION` = `22.22.0`
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
6. Click "Create Web Service"

**Deployment time:** ~3-5 minutes

### Option 2: Vercel (Next.js Platform)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   cd test-projects/flower-shop
   vercel
   ```

3. Follow the prompts and add environment variables when asked

4. For production:
   ```bash
   vercel --prod
   ```

**Deployment time:** ~2 minutes

### Option 3: Netlify

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Deploy:
   ```bash
   netlify deploy --prod
   ```

4. Add environment variables in Netlify dashboard

**Deployment time:** ~3 minutes

### Option 4: Docker

1. Create `Dockerfile` in project root:
   ```dockerfile
   FROM node:22.22.0-alpine AS base

   # Dependencies
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci

   # Builder
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build

   # Runner
   FROM base AS runner
   WORKDIR /app
   ENV NODE_ENV=production
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs

   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

   USER nextjs
   EXPOSE 3000
   ENV PORT=3000

   CMD ["node", "server.js"]
   ```

2. Update `next.config.js`:
   ```js
   module.exports = {
     output: 'standalone',
   }
   ```

3. Build and run:
   ```bash
   docker build -t flower-shop .
   docker run -p 3000:3000 \
     -e NEXT_PUBLIC_SUPABASE_URL=your-url \
     -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
     flower-shop
   ```

## Database Setup

### Run Migrations

After creating your Supabase project, run migrations:

**Option 1: Supabase CLI**
```bash
# Install Supabase CLI
npm i -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

**Option 2: Supabase Dashboard**
1. Go to SQL Editor in Supabase dashboard
2. Copy content from each migration file in `supabase/migrations/`
3. Run them in order (sorted by filename)

### Migration Files Order

1. `20260202000000_create_enums.sql` - Enum types
2. `20260202000001_create_profiles_table.sql` - User profiles
3. `20260202000002_create_categories_table.sql` - Product categories
4. `20260202000003_create_products_table.sql` - Products catalog
5. `20260202000004_create_orders_tables.sql` - Orders system
6. `20260202000005_create_indexes.sql` - Performance indexes

## Post-Deployment Verification

1. **Check Build Logs**
   - Ensure build completes without errors
   - No TypeScript errors
   - All dependencies installed

2. **Test Authentication**
   - Sign up new user
   - Sign in existing user
   - Sign out

3. **Test E-commerce Features**
   - Browse products
   - Add to cart
   - Update cart quantities
   - Place order
   - View order history (user)
   - Manage products (admin)

4. **Check Performance**
   - Page load time < 3s
   - Time to Interactive < 5s
   - No console errors
   - Images loading properly

## Troubleshooting

### Build Fails with "Cannot find module"
- Run `npm install` locally first
- Ensure all dependencies in package.json
- Check Node version matches (22.22.0)

### Database Connection Error
- Verify Supabase URL and anon key
- Check RLS policies are applied
- Ensure migrations ran successfully

### Authentication Not Working
- Verify Supabase auth is enabled
- Check site URL in Supabase settings
- Verify redirect URLs configured

### Orders Not Creating
- Check order number generation function exists
- Verify RLS policies allow insert
- Test with authenticated user

### Admin Panel Not Working
- Check user role in profiles table
- Verify RLS policies for admin role
- Ensure admin routes protected

### Images Not Loading
- Verify product image URLs valid
- Check CORS settings in Supabase Storage
- Ensure public bucket configured

### 404 on Page Refresh
- Ensure platform supports Next.js routing
- Check `next.config.js` configuration
- Verify static export settings

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes | `eyJhbGc...` |
| `NODE_VERSION` | Node.js version | No | `22.22.0` |

## Initial Admin Setup

After deployment, create an admin user:

1. Sign up a new user through the app
2. Get the user's ID from Supabase Auth dashboard
3. Update the user's role in the profiles table:
   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE id = 'user-uuid-here';
   ```

## Sample Data (Optional)

To populate the database with sample products:

1. Go to SQL Editor in Supabase
2. Run this query:
   ```sql
   -- Insert sample categories
   INSERT INTO categories (name, description, slug) VALUES
   ('Roses', 'Classic and elegant roses', 'roses'),
   ('Bouquets', 'Beautiful flower arrangements', 'bouquets'),
   ('Plants', 'Indoor and outdoor plants', 'plants');

   -- Insert sample products (update user_id with your admin ID)
   INSERT INTO products (user_id, category_id, name, description, price, stock, image_url)
   SELECT
     'your-admin-user-id'::uuid,
     c.id,
     'Red Rose Bouquet',
     'Stunning arrangement of 12 red roses',
     49.99,
     50,
     'https://images.unsplash.com/photo-1518895949257-7621c3c786d7'
   FROM categories c WHERE c.slug = 'roses';
   ```

## Performance Optimization

For production deployments:

1. **Enable caching**
   ```js
   // next.config.js
   module.exports = {
     images: {
       unoptimized: false,
       domains: ['images.unsplash.com', 'your-supabase-project.supabase.co'],
     },
   }
   ```

2. **Configure CDN**
   - Static assets via CDN
   - Image optimization enabled
   - Gzip/Brotli compression

3. **Monitor performance**
   - Use Vercel Analytics or similar
   - Monitor Core Web Vitals
   - Set up error tracking (Sentry)

4. **Database optimization**
   - Ensure indexes are created
   - Monitor slow queries
   - Enable connection pooling if needed

## Security Checklist

- [ ] Environment variables not committed to git
- [ ] RLS policies tested and working
- [ ] HTTPS enabled (automatic on most platforms)
- [ ] Auth redirects configured correctly
- [ ] Rate limiting configured (if needed)
- [ ] CORS configured properly
- [ ] Admin routes protected
- [ ] Payment gateway secured (if implemented)
- [ ] Input validation on all forms
- [ ] XSS protection enabled

## E-commerce Specific

### Payment Integration (Future)

To add payment processing:
1. Choose provider (Stripe, PayPal, Square)
2. Add provider SDK to dependencies
3. Create checkout flow
4. Implement webhooks for payment confirmation
5. Update order status automatically

### Email Notifications (Future)

To add order confirmation emails:
1. Set up email service (SendGrid, Resend)
2. Create email templates
3. Trigger on order creation
4. Include order details and tracking

## Support

For deployment issues:
- Check platform documentation (Render, Vercel, Netlify)
- Review Supabase docs for auth/RLS issues
- Check Next.js deployment guides

For e-commerce specific issues:
- Verify database schema matches requirements
- Check RLS policies for cart/orders
- Test admin functionality thoroughly

---

**Generated by:** Claude Code Orchestrator Kit
**Date:** 2026-02-07
