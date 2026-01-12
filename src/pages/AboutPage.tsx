import { MainLayout } from '@/components/layout/MainLayout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Target, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <MainLayout>
      <SEOHead
        title="Tentang Kami"
        description="Berita Malaysia adalah portal berita terkini yang mengumpulkan berita dari pelbagai sumber terpercaya di Malaysia. Ketahui lebih lanjut tentang misi dan visi kami."
        canonicalUrl="/tentang"
      />

      <section className="py-6 md:py-12">
        <div className="container max-w-4xl">
          <h1 className="mb-6 font-display text-3xl font-bold md:text-4xl">
            Tentang Berita Malaysia
          </h1>

          <div className="prose prose-lg max-w-none dark:prose-invert">
            <p className="lead text-xl text-muted-foreground">
              Berita Malaysia adalah portal berita terkini yang menyediakan akses mudah
              kepada berita dari pelbagai sumber terpercaya di Malaysia.
            </p>

            <div className="my-8 grid gap-6 md:grid-cols-3">
              <Card>
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <Target className="h-12 w-12 text-primary" />
                  <h3 className="mt-4 font-display text-lg font-semibold">Misi Kami</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Menyediakan akses mudah kepada berita terkini dari pelbagai sumber dalam satu platform.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <Globe className="h-12 w-12 text-primary" />
                  <h3 className="mt-4 font-display text-lg font-semibold">Visi Kami</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Menjadi portal berita pilihan utama rakyat Malaysia dengan liputan menyeluruh.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <Users className="h-12 w-12 text-primary" />
                  <h3 className="mt-4 font-display text-lg font-semibold">Untuk Rakyat</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Berita disusun dan dipaparkan dengan cara yang mudah difahami oleh semua lapisan masyarakat.
                  </p>
                </CardContent>
              </Card>
            </div>

            <h2>Apa Yang Kami Lakukan</h2>
            <p>
              Kami mengumpulkan berita dari pelbagai sumber berita terpercaya di Malaysia
              dan memaparkannya dalam satu platform yang mudah dilayari. Berita dikategorikan
              mengikut topik seperti politik, sukan, hiburan, ekonomi, dan banyak lagi.
            </p>

            <h2>Sumber Berita</h2>
            <p>
              Semua berita yang dipaparkan di laman web ini bersumber dari media berita
              yang bereputasi di Malaysia. Setiap artikel mempunyai pautan kepada
              sumber asal untuk pembacaan lanjut.
            </p>

            <h2>Hubungi Kami</h2>
            <p>
              Untuk sebarang pertanyaan, cadangan, atau maklum balas, sila hubungi kami
              melalui laman hubungi kami atau emel kepada <strong>hello@beritamalaysia.com</strong>.
            </p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
