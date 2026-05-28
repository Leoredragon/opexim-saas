import Link from 'next/link';
import { ArrowRight, BarChart3, ShieldCheck, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f7f4ef] text-[#1a1814] font-sans">
      {/* Navbar Alanı */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-[#c4391a]">Opexim<span className="text-[#3d3933]">.</span></div>
        <Link
          href="/login"
          className="bg-[#1a1814] text-[#f7f4ef] px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-[#3d3933] transition-colors"
        >
          Müşteri Girişi
        </Link>
      </nav>

      {/* Hero Alanı */}
      <main className="flex flex-col items-center text-center px-6 pt-20 pb-32 max-w-4xl mx-auto">
        <div className="text-[#c4391a] text-xs font-mono uppercase tracking-widest mb-6">
          KOBİ Dış Operasyon Ekibi
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          İşinize odaklanın, <br />
          <span className="text-[#2e7d6e]">operasyonu bize bırakın.</span>
        </h1>
        <p className="text-[#6b6760] text-lg mb-10 max-w-2xl leading-relaxed">
          Yazılım satmıyoruz, mevcut sistemlerinizi sizin yerinize yönetiyoruz. Stok, cari ve e-fatura süreçlerinizde sıfır hata ile öngörülebilir büyüme sağlayın.
        </p>
        <Link
          href="/login"
          className="flex items-center gap-2 bg-[#2e7d6e] text-white px-8 py-4 rounded-lg font-medium hover:bg-[#1a5c50] transition-colors shadow-lg"
        >
          Sisteme Giriş Yap <ArrowRight size={20} />
        </Link>
      </main>

      {/* Özellikler Alanı */}
      <section className="bg-white py-20 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-10">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-[#e4f3ee] text-[#1a5c40] rounded-xl flex items-center justify-center mb-4">
              <BarChart3 size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Temiz Veri, Net Rapor</h3>
            <p className="text-[#6b6760] text-sm">Karmaşık ekranlar yerine patronların anlayacağı netlikte özet dashboardlar.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-[#fdf3d0] text-[#8b5d00] rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Sıfır Kaçak & Hata</h3>
            <p className="text-[#6b6760] text-sm">Stok ve cari tutarsızlıklarını anında tespit edip kaynağında çözeriz.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-[#fde8e4] text-[#9b2010] rounded-xl flex items-center justify-center mb-4">
              <Users size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Uzman Ekip Desteği</h3>
            <p className="text-[#6b6760] text-sm">Personel hatalarını engeller, muhasebecinize hatasız veri teslim ederiz.</p>
          </div>
        </div>
      </section>
    </div>
  );
}