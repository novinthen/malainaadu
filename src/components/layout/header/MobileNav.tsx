import { Link } from 'react-router-dom';
import { Menu, Search, TrendingUp, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Category } from '@/types/database';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface MobileNavProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  user: SupabaseUser | null;
  onSignIn: () => void;
  onSignOut: () => void;
  isSigningIn: boolean;
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name) return name.charAt(0).toUpperCase();
  if (email) return email.charAt(0).toUpperCase();
  return 'U';
}

export function MobileNav({
  isOpen,
  onOpenChange,
  categories,
  user,
  onSignIn,
  onSignOut,
  isSigningIn,
}: MobileNavProps) {
  const handleClose = () => onOpenChange(false);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild className="lg:hidden">
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
        <div className="flex flex-col gap-6 pt-6">
          {/* Categories */}
          <div className="flex flex-col gap-2">
            <span className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Kategori
            </span>
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/kategori/${category.slug}`}
                onClick={handleClose}
                className="rounded-md px-2 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-muted"
              >
                {category.name}
              </Link>
            ))}
          </div>

          {/* Other links */}
          <div className="flex flex-col gap-2">
            <span className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Lain-lain
            </span>
            <Link
              to="/cari"
              onClick={handleClose}
              className="flex items-center gap-2 rounded-md px-2 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Search className="h-4 w-4" />
              Cari Berita
            </Link>
            <Link
              to="/trending"
              onClick={handleClose}
              className="flex items-center gap-2 rounded-md px-2 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-muted"
            >
              <TrendingUp className="h-4 w-4" />
              Trending
            </Link>
          </div>

          {/* Auth section */}
          <div className="flex flex-col gap-2 border-t pt-4">
            <span className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Akaun
            </span>
            {user ? (
              <>
                <div className="flex items-center gap-3 px-2 py-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback>
                      {getInitials(user.user_metadata?.full_name, user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">
                      {user.user_metadata?.full_name || 'Pengguna'}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onSignOut();
                    handleClose();
                  }}
                  className="flex items-center gap-2 rounded-md px-2 py-2.5 text-base font-medium text-destructive transition-colors hover:bg-muted"
                >
                  <LogOut className="h-4 w-4" />
                  Log Keluar
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onSignIn();
                  handleClose();
                }}
                disabled={isSigningIn}
                className="flex items-center gap-2 rounded-md bg-primary px-2 py-2.5 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <User className="h-4 w-4" />
                {isSigningIn ? 'Memuatkan...' : 'Log Masuk dengan Google'}
              </button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
