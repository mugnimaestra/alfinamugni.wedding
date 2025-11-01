import { component$ } from "@builder.io/qwik"
import type { DocumentHead } from "@builder.io/qwik-city"

/**
 * Privacy Policy Page
 * GDPR-compliant privacy policy for wedding website
 */
export default component$(() => {
  return (
    <div class="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-12">
      <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div class="rounded-2xl bg-white p-8 shadow-xl">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            Kebijakan Privasi
          </h1>
          <p class="text-sm text-gray-600 mb-8">
            Terakhir diperbarui: 1 November 2025
          </p>

          <div class="prose prose-pink max-w-none">
            <h2>1. Pendahuluan</h2>
            <p>
              Selamat datang di website undangan pernikahan Alfina & Mugni. Kami berkomitmen 
              melindungi privasi Anda dan menghormati data pribadi Anda. Kebijakan privasi ini 
              menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda.
            </p>

            <h2>2. Informasi yang Kami Kumpulkan</h2>
            <h3>2.1 Informasi yang Anda Berikan</h3>
            <ul>
              <li><strong>Data RSVP:</strong> Nama, email, nomor telepon, jumlah tamu, preferensi makanan, 
              kebutuhan akomodasi, dan permintaan khusus</li>
              <li><strong>Pesan & Ucapan:</strong> Nama, email (opsional), dan pesan ucapan</li>
              <li><strong>Unggahan Foto:</strong> Foto atau video yang Anda unggah, nama pengunggah, 
              dan email (opsional)</li>
            </ul>

            <h3>2.2 Informasi yang Dikumpulkan Secara Otomatis</h3>
            <ul>
              <li><strong>Data Teknis:</strong> Alamat IP, tipe browser, sistem operasi, dan informasi perangkat</li>
              <li><strong>Data Penggunaan:</strong> Halaman yang dikunjungi, waktu akses, dan interaksi dengan website</li>
              <li><strong>Cookie:</strong> Cookie untuk fungsi website dan analitik (lihat bagian Cookie)</li>
            </ul>

            <h2>3. Bagaimana Kami Menggunakan Informasi Anda</h2>
            <p>Kami menggunakan informasi Anda untuk:</p>
            <ul>
              <li>Memproses konfirmasi kehadiran (RSVP) Anda</li>
              <li>Mengirim email konfirmasi dan pengingat acara</li>
              <li>Menampilkan ucapan selamat Anda (setelah dimoderasi)</li>
              <li>Mengelola galeri foto pernikahan</li>
              <li>Meningkatkan pengalaman pengguna di website</li>
              <li>Menganalisis performa dan keamanan website</li>
              <li>Mematuhi kewajiban hukum</li>
            </ul>

            <h2>4. Dasar Hukum Pemrosesan (GDPR)</h2>
            <p>Kami memproses data Anda berdasarkan:</p>
            <ul>
              <li><strong>Persetujuan:</strong> Anda memberikan persetujuan eksplisit saat mengisi formulir RSVP</li>
              <li><strong>Kepentingan Sah:</strong> Mengelola acara pernikahan dan komunikasi dengan tamu</li>
              <li><strong>Kewajiban Hukum:</strong> Mematuhi regulasi perlindungan data</li>
            </ul>

            <h2>5. Berbagi Data dengan Pihak Ketiga</h2>
            <p>Kami TIDAK menjual data Anda. Kami hanya berbagi data dengan:</p>
            <ul>
              <li><strong>Cloudflare:</strong> Hosting website dan database (penyedia cloud terpercaya)</li>
              <li><strong>Resend:</strong> Layanan email untuk konfirmasi RSVP</li>
              <li><strong>Vendor Pernikahan:</strong> Informasi kehadiran dan preferensi makanan untuk katering dan venue</li>
            </ul>
            <p>Semua pihak ketiga diwajibkan melindungi data Anda sesuai standar GDPR.</p>

            <h2>6. Cookie dan Teknologi Pelacakan</h2>
            <h3>6.1 Jenis Cookie yang Kami Gunakan</h3>
            <ul>
              <li><strong>Cookie Esensial:</strong> Diperlukan untuk fungsi dasar website (login admin, preferensi)</li>
              <li><strong>Cookie Analitik:</strong> Membantu kami memahami penggunaan website (anonim)</li>
              <li><strong>Cookie Preferensi:</strong> Mengingat pilihan bahasa dan pengaturan Anda</li>
            </ul>
            
            <h3>6.2 Mengelola Cookie</h3>
            <p>
              Anda dapat mengelola preferensi cookie melalui banner cookie di website atau pengaturan browser Anda. 
              Menonaktifkan cookie tertentu mungkin mempengaruhi fungsionalitas website.
            </p>

            <h2>7. Penyimpanan dan Keamanan Data</h2>
            <h3>7.1 Periode Penyimpanan</h3>
            <ul>
              <li><strong>Data RSVP:</strong> 1 tahun setelah tanggal pernikahan (29 November 2026)</li>
              <li><strong>Foto:</strong> 2 tahun (untuk kenang-kenangan)</li>
              <li><strong>Ucapan:</strong> 1 tahun setelah pernikahan</li>
              <li><strong>Data Analitik:</strong> Dianonimkan setelah 90 hari</li>
            </ul>

            <h3>7.2 Keamanan</h3>
            <p>Kami melindungi data Anda dengan:</p>
            <ul>
              <li>Enkripsi SSL/TLS untuk semua transmisi data</li>
              <li>Enkripsi password dengan bcrypt</li>
              <li>Akses terbatas ke data pribadi (hanya admin)</li>
              <li>Backup reguler dan pemantauan keamanan</li>
              <li>Content Security Policy (CSP) untuk mencegah XSS</li>
            </ul>

            <h2>8. Hak Anda (GDPR)</h2>
            <p>Anda memiliki hak untuk:</p>
            <ul>
              <li><strong>Akses:</strong> Meminta salinan data pribadi Anda</li>
              <li><strong>Koreksi:</strong> Memperbarui atau memperbaiki data yang tidak akurat</li>
              <li><strong>Penghapusan:</strong> Meminta penghapusan data Anda ("hak untuk dilupakan")</li>
              <li><strong>Portabilitas:</strong> Menerima data Anda dalam format yang dapat dibaca mesin</li>
              <li><strong>Keberatan:</strong> Menolak pemrosesan data tertentu</li>
              <li><strong>Pembatasan:</strong> Membatasi cara kami memproses data Anda</li>
            </ul>

            <h3>8.1 Cara Menggunakan Hak Anda</h3>
            <p>Untuk menggunakan hak Anda, silakan hubungi kami di privacy@alfinamugni.wedding. 
            Kami akan merespons permintaan Anda dalam 30 hari.</p>

            <h2>9. Kontak Kami</h2>
            <div class="rounded-lg bg-gray-50 p-4 my-4">
              <p class="mb-2"><strong>Alfina & Mugni</strong></p>
              <p class="mb-1">Email: privacy@alfinamugni.wedding</p>
              <p class="mb-1">Website: https://alfinamugni.wedding</p>
              <p>Lokasi: Jakarta, Indonesia</p>
            </div>
          </div>

          <div class="mt-8 rounded-lg border border-pink-200 bg-pink-50 p-4">
            <h3 class="font-semibold text-pink-900 mb-2">💝 Komitmen Kami</h3>
            <p class="text-sm text-pink-800">
              Privasi Anda adalah prioritas kami. Kami berkomitmen mengelola data Anda dengan 
              tanggung jawab penuh dan transparansi. Terima kasih telah mempercayai kami untuk 
              menjadi bagian dari hari istimewa kami!
            </p>
          </div>

          <div class="mt-6">
            <a
              href="/"
              class="rounded-lg bg-pink-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-pink-700 transition-colors"
            >
              Kembali ke Beranda
            </a>
          </div>
        </div>
      </div>
    </div>
  )
})

export const head: DocumentHead = {
  title: "Kebijakan Privasi - Alfina & Mugni Wedding",
  meta: [
    {
      name: "description",
      content:
        "Kebijakan privasi dan perlindungan data untuk website undangan pernikahan Alfina & Mugni.",
    },
    {
      name: "robots",
      content: "noindex, nofollow",
    },
  ],
}
