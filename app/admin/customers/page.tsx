"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Building2, Plus, X, Search, Crown, ChevronLeft, ArrowLeft, Calendar, FileText } from "lucide-react";
import toast from "react-hot-toast";

export default function CustomersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [editingId, setEditingId] = useState("");
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [packageType, setPackageType] = useState("Temel");
  const [taxId, setTaxId] = useState("");
  const [isVip, setIsVip] = useState(false);
  const [paymentPeriod, setPaymentPeriod] = useState("Aylık");
  const [paymentDate, setPaymentDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    async function fetchCompanies() {
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

      if (profile?.role !== "admin") {
        router.push("/dashboard"); 
        return;
      }

      const { data: allCompanies } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (allCompanies) setCompanies(allCompanies);
      setLoading(false);
    }

    fetchCompanies();
  }, [router]);

  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingId("");
    setName("");
    setSector("");
    setPackageType("Temel");
    setTaxId("");
    setIsVip(false);
    setPaymentPeriod("Aylık");
    setPaymentDate("");
    setEmail("");
    setPassword("");
    setIsModalOpen(true);
  };

  const openEditModal = (company: any) => {
    setIsEditMode(true);
    setEditingId(company.id);
    setName(company.name);
    setSector(company.sector || "");
    setPackageType(company.package_type || "Temel");
    setTaxId(company.tax_id || "");
    setIsVip(company.is_vip || false);
    setPaymentPeriod(company.payment_period || "Aylık");
    setPaymentDate(company.payment_date || "");
    setEmail(""); // Edit mode doesn't need email/password change for now
    setPassword("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload: any = {
      name,
      sector,
      package_type: packageType,
      tax_id: taxId,
      is_vip: isVip,
      payment_period: paymentPeriod,
      payment_date: paymentDate
    };

    if (!isEditMode) {
      payload.email = email;
      payload.password = password;
    } else {
      payload.id = editingId;
    }

    try {
      const response = await fetch("/api/companies", {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        if (isEditMode) {
          setCompanies(companies.map(c => c.id === editingId ? data.company : c));
          toast.success("Müşteri başarıyla güncellendi.");
        } else {
          setCompanies([data.company, ...companies]);
          toast.success("Yeni müşteri başarıyla eklendi.");
        }
        setIsModalOpen(false);
      } else {
        toast.error("Hata: " + data.error);
      }
    } catch (error) {
      toast.error("İşlem sırasında bir ağ hatası oluştu.");
    }
    
    setIsSubmitting(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#1a1814] flex items-center justify-center font-medium text-[#f7f4ef]">Müşteriler yükleniyor...</div>;
  }

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.tax_id && c.tax_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#ede9e2] font-sans pb-10">
      <header className="bg-[#1a1814] px-4 md:px-8 py-4 shadow-md sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft size={16} /> <span className="hidden sm:inline">Geri</span>
          </Link>
          <div className="text-xl font-bold text-white flex items-center border-l border-gray-700 pl-4">
            Müşteri Yönetimi
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 mt-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f7f4ef]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#e4eef8] text-[#1e4d8c] rounded-lg">
                <Building2 size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1a1814]">Tüm Müşteriler (Cari)</h2>
                <p className="text-xs text-gray-500">Toplam {companies.length} aktif kayıtlı müşteri</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Vergi No veya Firma ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e4d8c] bg-white text-gray-900"
                />
              </div>
              <button 
                onClick={openCreateModal}
                className="flex items-center gap-2 bg-[#1e4d8c] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors font-semibold text-sm whitespace-nowrap"
              >
                <Plus size={16} /> Yeni Müşteri
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[900px]">
              <thead className="bg-[#f7f4ef] text-[#6b6760] border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Firma Adı & Sektör</th>
                  <th className="px-6 py-4 font-semibold">Paket Durumu</th>
                  <th className="px-6 py-4 font-semibold">Vergi Bilgileri</th>
                  <th className="px-6 py-4 font-semibold">Ödeme & Periyot</th>
                  <th className="px-6 py-4 font-semibold text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-[#f7f4ef] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1a1814]">{company.name}</span>
                        {company.is_vip && (
                          <span className="flex items-center gap-1 text-[10px] bg-[#fefce8] text-[#eab308] px-1.5 py-0.5 rounded border border-[#fef08a] font-bold">
                            <Crown size={10} fill="#eab308" /> VIP
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{company.sector || "Sektör Belirtilmemiş"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold px-2.5 py-1 rounded-md text-xs
                        ${company.package_type === 'Premium' ? 'bg-[#fde8e4] text-[#9b2010]' : 
                          company.package_type === 'Standart' ? 'bg-[#fdf3d0] text-[#8b5d00]' : 
                          'bg-[#e4f3ee] text-[#1a5c40]'}`}>
                        {company.package_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {company.tax_id ? (
                        <div className="flex items-center gap-1.5 text-[#3d3933]">
                          <FileText size={14} className="text-gray-400" />
                          <span className="font-medium">{company.tax_id}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[#1a1814] bg-gray-100 px-2 py-0.5 rounded w-fit">
                          {company.payment_period || "Belirtilmemiş"} Ödeme
                        </span>
                        {company.payment_date && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Calendar size={12} />
                            {new Date(company.payment_date).toLocaleDateString('tr-TR')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openEditModal(company)}
                        className="text-sm text-[#1e4d8c] font-semibold hover:underline bg-[#e4eef8] px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Düzenle
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredCompanies.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-[#6b6760]">
                      Aramanıza uygun müşteri bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Müşteri Ekle / Düzenle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#f7f4ef] flex-shrink-0">
              <h3 className="font-bold text-[#1a1814] text-lg">
                {isEditMode ? "Müşteri Bilgilerini Düzenle" : "Yeni Müşteri KOBİ Ekle"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-[#9b2010] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#3d3933] mb-1">Firma Adı</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e4d8c]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3d3933] mb-1">Vergi No / TCKN</label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e4d8c]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#3d3933] mb-1">Sektör</label>
                  <input
                    type="text"
                    required
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e4d8c]"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4">
                <h4 className="text-sm font-bold text-[#1a1814] mb-3 border-b border-gray-200 pb-2">Abonelik & Ödeme</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3d3933] mb-1">Abonelik Paketi</label>
                    <select
                      value={packageType}
                      onChange={(e) => setPackageType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e4d8c] bg-white text-gray-900"
                    >
                      <option value="Temel">Temel Paket (Aylık Uzaktan)</option>
                      <option value="Standart">Standart Paket (Aylık 1 Saha Ziyareti)</option>
                      <option value="Premium">Premium Paket (Aylık 2 Saha Ziyareti)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#3d3933] mb-1">Ödeme Periyodu</label>
                    <select
                      value={paymentPeriod}
                      onChange={(e) => setPaymentPeriod(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e4d8c] bg-white text-gray-900"
                    >
                      <option value="Aylık">Aylık</option>
                      <option value="3 Aylık">3 Aylık</option>
                      <option value="6 Aylık">6 Aylık</option>
                      <option value="Yıllık">Yıllık</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#3d3933] mb-1">Sonraki Ödeme Tarihi</label>
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e4d8c]"
                    />
                  </div>

                  <div className="md:col-span-2 mt-2">
                    <label className="flex items-center gap-3 cursor-pointer bg-white p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={isVip}
                          onChange={(e) => setIsVip(e.target.checked)}
                          className="w-5 h-5 border-2 border-gray-300 rounded text-[#eab308] focus:ring-[#eab308] focus:ring-offset-0"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#1a1814] flex items-center gap-1">
                          VIP Müşteri <Crown size={14} className="text-[#eab308]" fill="#eab308" />
                        </span>
                        <span className="text-xs text-gray-500">Müşteriyi listede öne çıkarır ve VIP rozeti ekler.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {!isEditMode && (
                <div className="mb-4 pt-2">
                  <h4 className="text-sm font-bold text-[#1a1814] mb-3">Hesap Bilgileri</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#3d3933] mb-1">Yetkili E-posta</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e4d8c]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#3d3933] mb-1">Giriş Şifresi</label>
                      <input
                        type="text"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e4d8c]"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 justify-end flex-shrink-0 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-[#6b6760] hover:text-[#1a1814] transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#1e4d8c] text-white px-6 py-2 rounded-md text-sm font-bold hover:bg-opacity-90 transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {isSubmitting ? "Kaydediliyor..." : (isEditMode ? "Güncelle" : "Kaydet")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
