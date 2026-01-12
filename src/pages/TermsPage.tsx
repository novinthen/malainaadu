import { MainLayout } from '@/components/layout/MainLayout';
import { SEOHead } from '@/components/seo/SEOHead';

export default function TermsPage() {
  return (
    <MainLayout>
      <SEOHead
        title="Terma Penggunaan"
        description="Terma dan syarat penggunaan Berita Malaysia. Sila baca terma ini dengan teliti sebelum menggunakan laman web kami."
        canonicalUrl="/terma"
      />

      <section className="py-6 md:py-12">
        <div className="container max-w-4xl">
          <h1 className="mb-6 font-display text-3xl font-bold md:text-4xl">
            Terma Penggunaan
          </h1>

          <div className="prose prose-lg max-w-none dark:prose-invert">
            <p className="lead text-xl text-muted-foreground">
              Dengan mengakses dan menggunakan laman web Berita Malaysia, anda bersetuju
              untuk mematuhi terma dan syarat berikut.
            </p>

            <p>
              <strong>Tarikh Kemas Kini Terakhir:</strong> 1 Januari 2026
            </p>

            <h2>1. Penerimaan Terma</h2>
            <p>
              Dengan menggunakan laman web ini, anda mengakui bahawa anda telah membaca,
              memahami, dan bersetuju untuk terikat dengan terma penggunaan ini. Jika anda
              tidak bersetuju, sila jangan gunakan laman web ini.
            </p>

            <h2>2. Penggunaan Laman Web</h2>
            <p>
              Anda bersetuju untuk menggunakan laman web ini hanya untuk tujuan yang sah
              dan tidak melanggar mana-mana undang-undang yang terpakai. Anda tidak boleh:
            </p>
            <ul>
              <li>Menggunakan laman web ini untuk sebarang tujuan yang menyalahi undang-undang</li>
              <li>Menyalin, mengubah suai, atau mengedar kandungan tanpa kebenaran</li>
              <li>Mengganggu atau merosakkan operasi laman web</li>
              <li>Menggunakan bot atau kaedah automatik untuk mengakses laman web</li>
            </ul>

            <h2>3. Hak Cipta dan Harta Intelek</h2>
            <p>
              Semua kandungan di laman web ini, termasuk teks, grafik, logo, dan imej,
              adalah harta Berita Malaysia atau pemilik kandungan asal. Anda tidak dibenarkan
              menggunakan kandungan ini tanpa kebenaran bertulis.
            </p>

            <h2>4. Kandungan Pihak Ketiga</h2>
            <p>
              Laman web ini memaparkan berita dari pelbagai sumber luar. Kami tidak
              bertanggungjawab ke atas ketepatan, kesahihan, atau kualiti kandungan
              dari sumber-sumber tersebut.
            </p>

            <h2>5. Pautan ke Laman Web Luar</h2>
            <p>
              Laman web ini mungkin mengandungi pautan ke laman web luar. Kami tidak
              bertanggungjawab ke atas kandungan atau amalan laman web tersebut.
            </p>

            <h2>6. Penafian Waranti</h2>
            <p>
              Laman web ini disediakan "sebagaimana adanya" tanpa sebarang waranti,
              sama ada nyata atau tersirat. Kami tidak menjamin bahawa laman web
              akan bebas daripada ralat atau gangguan.
            </p>

            <h2>7. Had Liabiliti</h2>
            <p>
              Berita Malaysia tidak akan bertanggungjawab ke atas sebarang kerosakan
              langsung, tidak langsung, sampingan, khas, atau berbangkit yang timbul
              daripada penggunaan atau ketidakupayaan menggunakan laman web ini.
            </p>

            <h2>8. Perubahan Terma</h2>
            <p>
              Kami berhak untuk mengubah terma ini pada bila-bila masa. Penggunaan
              berterusan laman web ini selepas sebarang perubahan bermaksud anda
              menerima terma yang dikemas kini.
            </p>

            <h2>9. Undang-undang Berkenaan</h2>
            <p>
              Terma ini ditadbir dan ditafsirkan mengikut undang-undang Malaysia.
              Sebarang pertikaian akan tertakluk kepada bidang kuasa eksklusif
              mahkamah Malaysia.
            </p>

            <h2>10. Hubungi Kami</h2>
            <p>
              Untuk sebarang pertanyaan mengenai terma penggunaan ini, sila hubungi
              kami di <strong>legal@beritamalaysia.com</strong>.
            </p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
