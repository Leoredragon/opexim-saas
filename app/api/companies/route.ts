import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service role key ile Supabase client oluşturuyoruz ki admin yetkileriyle kullanıcı açabilelim
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, sector, package_type, email, password, tax_id } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Firma adı, e-posta ve şifre zorunludur." }, { status: 400 });
    }

    // 1. Supabase Auth User Oluştur (Service Role kullanarak)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json({ error: "Kullanıcı oluşturulamadı: " + authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Firmayı 'companies' tablosuna ekle
    const { data: companyData, error: companyError } = await supabaseAdmin
      .from("companies")
      .insert([
        {
          name: name,
          sector: sector,
          package_type: package_type,
          tax_id: tax_id || null,
          prevented_loss: 0
        }
      ])
      .select()
      .single();

    if (companyError) {
      // Firma oluşturulamazsa açılan auth user'ı silmek iyi bir pratiktir (cleanup)
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: "Firma kaydedilemedi: " + companyError.message }, { status: 400 });
    }

    const companyId = companyData.id;

    // 3. Profiles tablosunda eşleştirme yap ve rolünü 'musteri' olarak belirle
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        role: "musteri",
        full_name: name,
        company_id: companyId
      })
      .eq("id", userId);

    if (profileError) {
      const { error: profileInsertError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: userId,
          role: "musteri",
          full_name: name,
          company_id: companyId
        });
        
      if (profileInsertError) {
          console.error("Profile update/insert failed:", profileError, profileInsertError);
      }
    }

    return NextResponse.json({ success: true, company: companyData }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: "Sunucu hatası: " + error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, sector, package_type, tax_id } = body;

    if (!id || !name) {
      return NextResponse.json({ error: "Firma ID ve adı zorunludur." }, { status: 400 });
    }

    const { data: companyData, error: companyError } = await supabaseAdmin
      .from("companies")
      .update({
        name: name,
        sector: sector,
        package_type: package_type,
        tax_id: tax_id || null
      })
      .eq("id", id)
      .select()
      .single();

    if (companyError) {
      return NextResponse.json({ error: "Firma güncellenemedi: " + companyError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, company: companyData }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Sunucu hatası: " + error.message }, { status: 500 });
  }
}
