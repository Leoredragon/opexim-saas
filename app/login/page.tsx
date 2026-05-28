"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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
      setError("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
      setLoading(false);
    } else if (data.user) {
      // 1. Giriş başarılıysa kullanıcının rolünü kontrol et
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      // 2. Rolüne göre doğru ekrana yönlendir!
      if (profile?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f4ef]">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#1a1814] mb-2">Giriş Yap</h1>
          <p className="text-[#6b6760]">Müşteri paneline erişmek için giriş yapın.</p>
        </div>

        {error && (
          <div className="bg-[#fde8e4] text-[#9b2010] p-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#3d3933] mb-1">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e7d6e] focus:border-transparent"
              placeholder="ornek@kobi.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#3d3933] mb-1">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e7d6e] focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a1814] text-[#f7f4ef] py-2.5 rounded-md font-semibold hover:bg-[#3d3933] transition-colors disabled:opacity-70 mt-2"
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-[#2e7d6e] text-sm hover:underline font-medium">
            &larr; Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}