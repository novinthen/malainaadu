import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Search, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useCategories } from '@/hooks/useCategories';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: categories } = useCategories();

  const mainCategories = categories?.slice(0, 6) || [];

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
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
