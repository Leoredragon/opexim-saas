import Link from 'next/link';
import { ArrowRight, BarChart3, ShieldCheck, Users, CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f7f4ef] text-[#1a1814] font-sans relative overflow-hidden">
      {/* Arka Plan Dekorasyonları */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#e4f3ee] blur-3xl"></div>
        <div className="absolute top-60 -left-20 w-80 h-80 rounded-full bg-[#fde8e4] blur-3xl"></div>
      </div>

      {/* Navbar Alanı */}
      <nav className="relative z-10 flex justify-between items-center p-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-[#1a1814]">
          Opexim<span className="text-[#c4391a]">.</span>
        </div>
        <Link
          href="/login"
          className="bg-[#1a1814] text-[#f7f4ef] px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-[#3d3933] hover:shadow-lg transition-all"
        >
          Müşteri Girişi
        </Link>
      </nav>

      {/* Hero Alanı */}
      <main className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-32 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-8">
          <span className="flex h-2 w-2 rounded-full bg-[#2e7d6e] animate-pulse"></span>
          <span className="text-[#6b6760] text-xs font-bold tracking-widest uppercase">
            Yeni Nesil KOBİ Dış Operasyon Ekibi
          </span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-[1.1] tracking-tight text-[#1a1814]">
          İşinize odaklanın, <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2e7d6e] to-[#1e4d8c]">
            operasyonu bize bırakın.
          </span>
        </h1>
        
        <p className="text-[#6b6760] text-lg md:text-xl mb-12 max-w-3xl leading-relaxed">
          Yazılım satmıyoruz, mevcut sistemlerinizi sizin yerinize uzman ekibimizle yönetiyoruz. Stok, cari ve e-fatura süreçlerinizde <strong>sıfır hata</strong> ile öngörülebilir büyüme sağlayın.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link
            href="/login"
            className="flex items-center gap-2 bg-[#1a1814] text-white px-8 py-4 rounded-lg font-bold hover:bg-[#3d3933] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            Sisteme Giriş Yap <ArrowRight size={20} />
          </Link>
          <a
            href="#ozellikler"
            className="flex items-center gap-2 text-[#1a1814] px-8 py-4 rounded-lg font-bold hover:bg-black/5 transition-all"
          >
            Nasıl Çalışır?
          </a>
        </div>
      </main>

      {/* Özellikler Alanı */}
      <section id="ozellikler" className="relative z-10 bg-white py-24 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1814] mb-4">Mevcut düzeninizi bozmadan, işinize güç katıyoruz.</h2>
            <p className="text-[#6b6760] max-w-2xl mx-auto">Sistem kurmakla vakit kaybetmeyin. Opexim uzmanları, halihazırda kullandığınız altyapılara entegre olarak süreci devralır.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Kart 1 */}
            <div className="bg-[#f7f4ef] p-8 rounded-2xl hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-white text-[#1a5c40] rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <BarChart3 size={28} />
              </div>
              <h3 className="font-bold text-xl mb-3 text-[#1a1814]">Temiz Veri, Net Rapor</h3>
              <p className="text-[#6b6760] leading-relaxed mb-4">Karmaşık ERP ekranları yerine patronların saniyeler içinde anlayacağı netlikte özet dashboardlar sunuyoruz.</p>
              <ul className="space-y-2 text-sm font-medium text-[#3d3933]">
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#2e7d6e]" /> Günlük Özetler</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#2e7d6e]" /> Aylık Büyüme Analizi</li>
              </ul>
            </div>

            {/* Kart 2 */}
            <div className="bg-[#f7f4ef] p-8 rounded-2xl hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-white text-[#8b5d00] rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <ShieldCheck size={28} />
              </div>
              <h3 className="font-bold text-xl mb-3 text-[#1a1814]">Sıfır Kaçak & Hata</h3>
              <p className="text-[#6b6760] leading-relaxed mb-4">Gözden kaçan stok ve cari tutarsızlıklarını anında tespit edip kaynağında çözer, finansal kayıpları önleriz.</p>
              <ul className="space-y-2 text-sm font-medium text-[#3d3933]">
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#2e7d6e]" /> Anlık Stok Takibi</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#2e7d6e]" /> Cari Mutabakat</li>
              </ul>
            </div>

            {/* Kart 3 */}
            <div className="bg-[#f7f4ef] p-8 rounded-2xl hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-white text-[#9b2010] rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <Users size={28} />
              </div>
              <h3 className="font-bold text-xl mb-3 text-[#1a1814]">Uzman Ekip Desteği</h3>
              <p className="text-[#6b6760] leading-relaxed mb-4">Personel hatalarını engeller, muhasebecinize hatasız veri teslim ederek yasal süreçlerinizi güvenceye alırız.</p>
              <ul className="space-y-2 text-sm font-medium text-[#3d3933]">
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#2e7d6e]" /> E-Fatura Yönetimi</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#2e7d6e]" /> Hızlı Destek Hattı</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1814] text-[#f7f4ef] py-12 text-center">
        <div className="text-2xl font-bold mb-4">
          Opexim<span className="text-[#c4391a]">.</span>
        </div>
        <p className="text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Opexim Dış Operasyon Ekibi. Tüm Hakları Saklıdır.
        </p>
      </footer>
    </div>
  );
}