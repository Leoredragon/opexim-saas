"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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

      // Müşteri /admin URL'sine girmeye çalışırsa onu kendi paneline geri postala
      if (profile?.role !== "admin") {
        router.push("/dashboard");
      } else {
        // Admin ise kilidi aç
        setIsAuthorized(true);
      }
    };
    
    checkAuth();
  }, [router]);

  if (!isAuthorized) return <div className="min-h-screen bg-[#ede9e2]"></div>;

  return <>{children}</>;
}
