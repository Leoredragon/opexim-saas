"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Quote } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Giriş başarısız. Lütfen e-posta ve şifrenizi kontrol edin.");
      setLoading(false);
    } else if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profile?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Sol Taraf: Görsel ve Marka Değeri (Sadece masaüstünde görünür) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a1814] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Dekoratif Arka Plan Deseni */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#c4391a] blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-[#2e7d6e] blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <Link href="/" className="text-3xl font-bold text-white flex items-center">
            Opexim<span className="text-[#c4391a]">.</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <Quote size={40} className="text-[#c4391a] mb-6 opacity-80" />
          <h2 className="text-3xl font-bold mb-6 leading-tight">
            "Opexim ile çalışmaya başladıktan sonra operasyonel hatalarımız sıfıra indi. Artık sadece büyümemize odaklanıyoruz."
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-lg font-bold">
              MK
            </div>
            <div>
              <div className="font-semibold text-lg">Mehmet K.</div>
              <div className="text-sm text-gray-400">Yönetim Kurulu Başkanı, Güven Nalburiye</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sağ Taraf: Giriş Formu */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#f7f4ef]">
        <div className="max-w-md w-full">
          {/* Sadece mobilde görünen logo */}
          <div className="lg:hidden text-center mb-10">
            <Link href="/" className="text-3xl font-bold text-[#1a1814]">
              Opexim<span className="text-[#c4391a]">.</span>
            </Link>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-[#1a1814] mb-3">Tekrar Hoş Geldiniz</h1>
            <p className="text-[#6b6760]">Süreç yönetim panelinize erişmek için lütfen giriş yapın.</p>
          </div>

          {error && (
            <div className="bg-[#fde8e4] text-[#9b2010] p-4 rounded-lg text-sm mb-6 border border-[#f0c0b8] flex items-center gap-2">
              <span className="font-semibold">Hata:</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#3d3933] mb-2">Kurumsal E-posta</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e7d6e] focus:border-transparent transition-all shadow-sm"
                placeholder="ornek@firma.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-[#3d3933]">Şifre</label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e7d6e] focus:border-transparent transition-all shadow-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a1814] text-[#f7f4ef] py-3.5 rounded-lg font-bold text-lg hover:bg-[#3d3933] hover:shadow-lg transition-all disabled:opacity-70 mt-4 flex justify-center items-center gap-2"
            >
              {loading ? "Giriş yapılıyor..." : "Sisteme Giriş Yap"}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-[#6b6760]">
              Opexim müşterisi değil misiniz?{" "}
              <Link href="/" className="text-[#c4391a] font-bold hover:underline transition-colors">
                Çözümlerimizi İnceleyin
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}