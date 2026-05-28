"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      // Admin yanlışlıkla /dashboard URL'sine girmeye çalışırsa onu kendi paneline yolla
      if (profile?.role === "admin") {
        router.push("/admin");
      } else {
        // Müşteriyse kilidi aç
        setIsAuthorized(true);
      }
    };
    
    checkAuth();
  }, [router]);

  // Kontrol bitene kadar arka plan rengiyle aynı boş bir div döndür (Ekran parlamasını engeller)
  if (!isAuthorized) return <div className="min-h-screen bg-[#f7f4ef]"></div>;

  return <>{children}</>;
}
