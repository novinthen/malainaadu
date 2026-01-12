import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks/useCategories';

export function Footer() {
  const { data: categories } = useCategories();

  return (
    <footer className="border-t bg-card pb-20 md:pb-0">
      <div className="container py-8 md:py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="font-display text-xl font-bold text-primary-foreground">B</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl font-bold leading-none text-foreground">
                  Berita
                </span>
                <span className="text-sm font-medium leading-none text-primary">
                  Malaysia
                </span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              Portal berita terkini Malaysia. Sumber berita dari pelbagai sumber terpercaya.
            </p>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
              Kategori
            </h3>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {categories?.slice(0, 8).map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/kategori/${category.slug}`}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
              Pautan
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/trending"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Berita Trending
                </Link>
              </li>
              <li>
                <Link
                  to="/terkini"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Berita Terkini
                </Link>
              </li>
              <li>
                <Link
                  to="/cari"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Cari Berita
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
              Maklumat
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/tentang"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link
                  to="/privasi"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Polisi Privasi
                </Link>
              </li>
              <li>
                <Link
                  to="/terma"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Terma Penggunaan
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Berita Malaysia. Semua hak cipta terpelihara.
          </p>
        </div>
      </div>
    </footer>
  );
}
