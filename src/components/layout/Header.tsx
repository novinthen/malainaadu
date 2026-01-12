import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, TrendingUp, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useCategories } from '@/hooks/useCategories';
import { useAuth, useSignInWithGoogle, useSignOut } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: categories } = useCategories();
  const { user, loading: authLoading } = useAuth();
  const signInWithGoogle = useSignInWithGoogle();
  const signOut = useSignOut();

  const mainCategories = categories?.slice(0, 6) || [];

  const handleGoogleSignIn = () => {
    signInWithGoogle.mutate(undefined, {
      onError: (error) => {
        toast.error('Gagal log masuk dengan Google');
        console.error('Google sign-in error:', error);
      },
    });
  };

  const handleSignOut = () => {
    signOut.mutate(undefined, {
      onSuccess: () => {
        toast.success('Berjaya log keluar');
      },
      onError: (error) => {
        toast.error('Gagal log keluar');
        console.error('Sign out error:', error);
      },
    });
  };

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-14 items-center justify-between md:h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary md:h-10 md:w-10">
            <span className="font-display text-lg font-bold text-primary-foreground md:text-xl">B</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold leading-none text-foreground md:text-xl">
              Berita
            </span>
            <span className="text-xs font-medium leading-none text-primary md:text-sm">
              Malaysia
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {mainCategories.map((category) => (
            <Link
              key={category.id}
              to={`/kategori/${category.slug}`}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/cari">
              <Search className="h-5 w-5" />
              <span className="sr-only">Cari</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to="/trending">
              <TrendingUp className="h-5 w-5" />
              <span className="sr-only">Trending</span>
            </Link>
          </Button>

          {/* Auth Button */}
          {authLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || user.email || 'User'} />
                    <AvatarFallback>{getInitials(user.user_metadata?.full_name, user.email)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback>{getInitials(user.user_metadata?.full_name, user.email)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || 'Pengguna'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={handleGoogleSignIn} disabled={signInWithGoogle.isPending} size="sm">
              <User className="mr-2 h-4 w-4" />
              {signInWithGoogle.isPending ? 'Memuatkan...' : 'Log Masuk'}
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
            <div className="flex flex-col gap-6 pt-6">
              <div className="flex flex-col gap-2">
                <span className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Kategori
                </span>
                {categories?.map((category) => (
                  <Link
                    key={category.id}
                    to={`/kategori/${category.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="rounded-md px-2 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <span className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Lain-lain
                </span>
                <Link
                  to="/cari"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 rounded-md px-2 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Search className="h-4 w-4" />
                  Cari Berita
                </Link>
                <Link
                  to="/trending"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 rounded-md px-2 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <TrendingUp className="h-4 w-4" />
                  Trending
                </Link>
              </div>

              {/* Mobile Auth */}
              <div className="flex flex-col gap-2 border-t pt-4">
                <span className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Akaun
                </span>
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-2 py-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback>{getInitials(user.user_metadata?.full_name, user.email)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">{user.user_metadata?.full_name || 'Pengguna'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
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
                      handleGoogleSignIn();
                      setIsOpen(false);
                    }}
                    disabled={signInWithGoogle.isPending}
                    className="flex items-center gap-2 rounded-md bg-primary px-2 py-2.5 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <User className="h-4 w-4" />
                    {signInWithGoogle.isPending ? 'Memuatkan...' : 'Log Masuk dengan Google'}
                  </button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
