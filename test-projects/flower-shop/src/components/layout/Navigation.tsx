'use client';

import Link from 'next/link';
import { ShoppingCart, User, Menu, Flower2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

export function Navigation() {
  // TODO: Replace with actual cart count from context/store
  const cartCount = 0;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-rose-100 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Flower2 className="w-8 h-8 text-rose-600 group-hover:text-rose-700 transition-colors" />
            <span className="text-2xl font-heading font-bold text-rose-900">
              Petal & Bloom
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-rose-600 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/catalog"
              className="text-sm font-medium text-gray-700 hover:text-rose-600 transition-colors"
            >
              Shop Flowers
            </Link>
            <Link
              href="/profile"
              className="text-sm font-medium text-gray-700 hover:text-rose-600 transition-colors"
            >
              My Orders
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-rose-600"
                  >
                    {cartCount}
                  </Badge>
                )}
                <span className="sr-only">Shopping Cart</span>
              </Button>
            </Link>

            {/* Profile/Login */}
            <Link href="/login" className="hidden md:block">
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
                <span className="sr-only">User Profile</span>
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-4 mt-8">
                  <Link
                    href="/"
                    className="text-lg font-medium text-gray-700 hover:text-rose-600 transition-colors"
                  >
                    Home
                  </Link>
                  <Link
                    href="/catalog"
                    className="text-lg font-medium text-gray-700 hover:text-rose-600 transition-colors"
                  >
                    Shop Flowers
                  </Link>
                  <Link
                    href="/profile"
                    className="text-lg font-medium text-gray-700 hover:text-rose-600 transition-colors"
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/login"
                    className="text-lg font-medium text-gray-700 hover:text-rose-600 transition-colors"
                  >
                    Login
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
