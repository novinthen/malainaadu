import { MainLayout } from '@/components/layout/MainLayout';
import { SEOHead } from '@/components/seo/SEOHead';

export default function PrivacyPage() {
  return (
    <MainLayout>
      <SEOHead
        title="Polisi Privasi"
        description="Polisi privasi Berita Malaysia menerangkan bagaimana kami mengumpul, menggunakan, dan melindungi maklumat peribadi anda."
        canonicalUrl="/privasi"
      />

      <section className="py-6 md:py-12">
        <div className="container max-w-4xl">
          <h1 className="mb-6 font-display text-3xl font-bold md:text-4xl">
            Polisi Privasi
          </h1>

          <div className="prose prose-lg max-w-none dark:prose-invert">
            <p className="lead text-xl text-muted-foreground">
              Polisi privasi ini menerangkan bagaimana Berita Malaysia mengumpul,
              menggunakan, dan melindungi maklumat anda.
            </p>

            <p>
              <strong>Tarikh Kemas Kini Terakhir:</strong> 1 Januari 2026
            </p>

            <h2>1. Maklumat Yang Kami Kumpul</h2>
            <p>
              Kami mungkin mengumpulkan maklumat berikut apabila anda melawat laman web kami:
            </p>
            <ul>
              <li>Alamat IP dan maklumat pelayar web</li>
              <li>Laman yang dilawati dan masa lawatan</li>
              <li>Peranti dan sistem operasi yang digunakan</li>
              <li>Lokasi geografi (berdasarkan alamat IP)</li>
            </ul>

            <h2>2. Penggunaan Maklumat</h2>
            <p>
              Maklumat yang dikumpulkan digunakan untuk:
            </p>
            <ul>
              <li>Meningkatkan pengalaman pengguna</li>
              <li>Menganalisis corak trafik laman web</li>
              <li>Menambah baik kandungan dan perkhidmatan</li>
              <li>Memastikan keselamatan laman web</li>
            </ul>

            <h2>3. Cookies</h2>
            <p>
              Laman web kami menggunakan cookies untuk meningkatkan pengalaman pelayaran anda.
              Cookies adalah fail kecil yang disimpan pada peranti anda. Anda boleh mengawal
              atau memadam cookies melalui tetapan pelayar anda.
            </p>

            <h2>4. Perkongsian Maklumat</h2>
            <p>
              Kami tidak akan menjual, memperdagangkan, atau memindahkan maklumat peribadi
              anda kepada pihak ketiga tanpa kebenaran anda, kecuali jika dikehendaki oleh
              undang-undang.
            </p>

            <h2>5. Pautan Luar</h2>
            <p>
              Laman web kami mungkin mengandungi pautan ke laman web luar. Kami tidak
              bertanggungjawab ke atas kandungan atau amalan privasi laman web tersebut.
            </p>

            <h2>6. Keselamatan Data</h2>
            <p>
              Kami mengambil langkah-langkah keselamatan yang munasabah untuk melindungi
              maklumat anda daripada akses yang tidak dibenarkan, pengubahsuaian, atau
              pendedahan.
            </p>

            <h2>7. Perubahan Polisi</h2>
            <p>
              Kami berhak untuk mengemas kini polisi privasi ini pada bila-bila masa.
              Sebarang perubahan akan dipaparkan di laman ini dengan tarikh kemas kini baharu.
            </p>

            <h2>8. Hubungi Kami</h2>
            <p>
              Jika anda mempunyai sebarang pertanyaan mengenai polisi privasi ini,
              sila hubungi kami di <strong>privacy@beritamalaysia.com</strong>.
            </p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
