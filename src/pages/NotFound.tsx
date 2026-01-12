import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

const NotFound = () => {
  return (
    <MainLayout>
      <SEOHead
        title="Halaman Tidak Ditemui"
        description="Maaf, halaman yang anda cari tidak dapat ditemui."
        noIndex
      />

      <div className="container flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
        <span className="text-7xl">🔍</span>
        <h1 className="mt-6 font-display text-4xl font-bold">404</h1>
        <p className="mt-2 text-xl text-muted-foreground">
          Halaman Tidak Ditemui
        </p>
        <p className="mt-4 max-w-md text-muted-foreground">
          Maaf, halaman yang anda cari tidak wujud atau telah dialihkan.
          Sila kembali ke halaman utama atau gunakan carian.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Halaman Utama
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/cari">
              <Search className="mr-2 h-4 w-4" />
              Cari Berita
            </Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;
