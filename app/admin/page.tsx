"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LogOut, Building2, TicketCheck, RefreshCw, Plus, X, Save, FileText } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("");
  const [tickets, setTickets] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);
  const [updatingCompanyId, setUpdatingCompanyId] = useState<string | null>(null);

  // Yeni Firma Ekleme Modal State'leri
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanySector, setNewCompanySector] = useState("");
  const [newCompanyPackage, setNewCompanyPackage] = useState("Temel");
  const [newCompanyEmail, setNewCompanyEmail] = useState("");
  const [newCompanyPassword, setNewCompanyPassword] = useState("");
  const [isSubmittingCompany, setIsSubmittingCompany] = useState(false);

  // Talep Detay Modalı State'leri
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  useEffect(() => {
    async function fetchAdminData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role !== "admin") {
        router.push("/dashboard"); 
        return;
      }

      setAdminName(profile.full_name);

      const { data: allCompanies } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (allCompanies) setCompanies(allCompanies);

      const { data: allTickets } = await supabase
        .from("tickets")
        .select(`*, companies(name)`)
        .order("created_at", { ascending: false });

      if (allTickets) setTickets(allTickets);

      setLoading(false);
    }

    fetchAdminData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    setUpdatingTicketId(ticketId); 
    
    const { error } = await supabase
      .from("tickets")
      .update({ status: newStatus })
      .eq("id", ticketId);

    if (!error) {
      setTickets(tickets.map(ticket => 
        ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
      ));
      
      // Modal açıksa, modalin içindeki durumu da güncelle
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    } else {
      alert("Durum güncellenirken bir hata oluştu.");
    }
    
    setUpdatingTicketId(null);
  };

  // Yeni Firma Kaydetme Fonksiyonu
  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCompany(true);

    try {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCompanyName,
          sector: newCompanySector,
          package_type: newCompanyPackage,
          email: newCompanyEmail,
          password: newCompanyPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setCompanies([data.company, ...companies]);
        setNewCompanyName("");
        setNewCompanySector("");
        setNewCompanyPackage("Temel");
        setNewCompanyEmail("");
        setNewCompanyPassword("");
        setIsCompanyModalOpen(false);
        alert("Firma ve kullanıcı başarıyla oluşturuldu.");
      } else {
        alert("Hata: " + data.error);
      }
    } catch (error) {
      alert("Firma eklenirken bir ağ hatası oluştu.");
    }
    
    setIsSubmittingCompany(false);
  };

  const handleUpdatePreventedLoss = async (companyId: string, newValue: number) => {
    setUpdatingCompanyId(companyId);
    
    const { error } = await supabase
      .from("companies")
      .update({ prevented_loss: newValue })
      .eq("id", companyId);

    if (!error) {
      setCompanies(companies.map(company => 
        company.id === companyId ? { ...company, prevented_loss: newValue } : company
      ));
    } else {
      alert("Önlenen kayıp güncellenirken bir hata oluştu.");
    }
    
    setUpdatingCompanyId(null);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#1a1814] flex items-center justify-center font-medium text-[#f7f4ef]">Yönetim paneli yükleniyor...</div>;
  }

  return (
    <div className="min-h-screen bg-[#ede9e2] font-sans relative">
      {/* Yönetici Üst Menü */}
      <header className="bg-[#1a1814] px-4 md:px-8 py-4 flex justify-between items-center shadow-md sticky top-0 z-10">
        <div className="text-xl font-bold text-white flex items-center">
          Opexim<span className="text-[#c4391a]">.</span> 
          <span className="text-[10px] md:text-xs font-mono bg-[#3d3933] px-2 py-1 rounded ml-2 text-gray-300">YÖNETİM</span>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <div className="text-sm text-gray-400 hidden md:block">
            Ekip: <span className="font-semibold text-white">{adminName}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-[#fde8e4] bg-[#9b2010] px-3 md:px-4 py-2 rounded-md font-medium hover:bg-opacity-80 transition-colors"
          >
            <LogOut size={16} /> <span className="hidden md:inline">Çıkış</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Sol Kolon: Tüm Firmalar (KOBİ'ler) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-[#f7f4ef]">
              <div className="flex items-center gap-2">
                <Building2 className="text-[#1e4d8c]" size={20} />
                <h2 className="text-base md:text-lg font-bold text-[#1a1814]">Aktif Müşteriler</h2>
                <span className="bg-[#1e4d8c] text-white text-xs font-bold px-2 py-1 rounded-full">{companies.length}</span>
              </div>
              <button 
                onClick={() => setIsCompanyModalOpen(true)}
                className="flex items-center gap-1 text-xs bg-[#1e4d8c] text-white px-2 py-1.5 rounded hover:bg-opacity-80 transition-colors font-medium"
              >
                <Plus size={14} /> Yeni
              </button>
            </div>
            <div className="divide-y divide-gray-100 max-h-[400px] lg:max-h-[600px] overflow-y-auto">
              {companies.map((company) => (
                <div key={company.id} className="p-4 md:p-5 hover:bg-gray-50 transition-colors">
                  <div className="font-bold text-[#1a1814] mb-1 text-sm md:text-base">{company.name}</div>
                  <div className="flex justify-between items-center text-xs mb-3">
                    <span className="text-[#6b6760]">{company.sector}</span>
                    <span className={`font-semibold px-2 py-0.5 rounded
                      ${company.package_type === 'Premium' ? 'bg-[#fde8e4] text-[#9b2010]' : 
                        company.package_type === 'Standart' ? 'bg-[#fdf3d0] text-[#8b5d00]' : 
                        'bg-[#e4f3ee] text-[#1a5c40]'}`}>
                      {company.package_type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-[#f7f4ef] p-2 rounded border border-gray-100">
                    <span className="text-xs text-[#6b6760] font-medium">Önlenen Kayıp:</span>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        defaultValue={company.prevented_loss || 0}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val !== company.prevented_loss) {
                            handleUpdatePreventedLoss(company.id, val);
                          }
                        }}
                        className="w-20 px-2 py-1 text-xs border border-gray-300 rounded text-right focus:outline-none focus:border-[#1e4d8c]"
                      />
                      <span className="text-xs font-semibold text-[#1a1814]">₺</span>
                      {updatingCompanyId === company.id && <RefreshCw size={12} className="animate-spin text-[#1e4d8c]" />}
                    </div>
                  </div>
                </div>
              ))}
              {companies.length === 0 && (
                <div className="p-6 text-center text-[#6b6760] text-sm">
                  Henüz kayıtlı müşteri bulunmuyor.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sağ Kolon: Gelen Tüm Talepler / İşler */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2 bg-[#f7f4ef]">
              <TicketCheck className="text-[#c4391a]" size={20} />
              <h2 className="text-base md:text-lg font-bold text-[#1a1814]">Bekleyen İşler & Talepler</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[650px]">
                <thead className="bg-[#f7f4ef] text-[#6b6760] border-b border-gray-200">
                  <tr>
                    <th className="px-4 md:px-6 py-4 font-semibold">Firma</th>
                    <th className="px-4 md:px-6 py-4 font-semibold">Konu</th>
                    <th className="px-4 md:px-6 py-4 font-semibold">Tarih</th>
                    <th className="px-4 md:px-6 py-4 font-semibold text-right">Durum Güncelle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-[#f7f4ef] transition-colors">
                      <td className="px-4 md:px-6 py-4 font-semibold text-[#1a1814]">{ticket.companies?.name}</td>
                      <td 
                        className="px-4 md:px-6 py-4 cursor-pointer group"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <div className="font-medium text-[#1e4d8c] group-hover:underline flex items-center gap-2">
                          <FileText size={14} className="text-gray-400" />
                          {ticket.title}
                        </div>
                        <div className="text-xs text-[#6b6760] truncate max-w-[150px] md:max-w-xs mt-1" title={ticket.description}>
                          {ticket.description}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-xs text-[#6b6760]">
                        {new Date(ticket.created_at).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-right flex justify-end items-center gap-2">
                        {updatingTicketId === ticket.id && <RefreshCw size={14} className="animate-spin text-[#c4391a]" />}
                        <select 
                          value={ticket.status}
                          onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                          disabled={updatingTicketId === ticket.id}
                          className={`text-xs font-semibold rounded-md px-2 py-1.5 border outline-none cursor-pointer transition-colors
                            ${ticket.status === 'Beklemede' ? 'bg-[#fdf3d0] text-[#8b5d00] border-[#f0dfa0]' : 
                              ticket.status === 'Devam Ediyor' ? 'bg-[#e4eef8] text-[#1a3d7c] border-[#b6d4f0]' : 
                              'bg-[#e4f3ee] text-[#1a5c40] border-[#b8e0d0]'}`}
                        >
                          <option value="Beklemede">Beklemede</option>
                          <option value="Devam Ediyor">Devam Ediyor</option>
                          <option value="Tamamlandı">Tamamlandı</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {tickets.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-[#6b6760]">
                        Şu an bekleyen hiçbir iş yok.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Yeni Firma Ekleme Modal */}
      {isCompanyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#f7f4ef] flex-shrink-0">
              <h3 className="font-bold text-[#1a1814]">Yeni Müşteri KOBİ Ekle</h3>
              <button 
                onClick={() => setIsCompanyModalOpen(false)}
                className="text-gray-400 hover:text-[#9b2010] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateCompany} className="p-6 overflow-y-auto">
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#3d3933] mb-1">Firma Adı</label>
                <input
                  type="text"
                  required
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e4d8c]"
                  placeholder="Örn: Güven Nalburiye"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#3d3933] mb-1">Sektör</label>
                <input
                  type="text"
                  required
                  value={newCompanySector}
                  onChange={(e) => setNewCompanySector(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e4d8c]"
                  placeholder="Örn: Hırdavat / Yapı Market"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[#3d3933] mb-1">Abonelik Paketi</label>
                <select
                  value={newCompanyPackage}
                  onChange={(e) => setNewCompanyPackage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e4d8c] bg-white"
                >
                  <option value="Temel">Temel Paket (Aylık Uzaktan)</option>
                  <option value="Standart">Standart Paket (Aylık 1 Saha Ziyareti)</option>
                  <option value="Premium">Premium Paket (Aylık 2 Saha Ziyareti)</option>
                </select>
              </div>

              <div className="mb-4 border-t border-gray-100 pt-4 mt-4">
                <h4 className="text-sm font-bold text-[#1a1814] mb-3">Hesap Bilgileri</h4>
                <label className="block text-sm font-medium text-[#3d3933] mb-1">Yetkili E-posta</label>
                <input
                  type="email"
                  required
                  value={newCompanyEmail}
                  onChange={(e) => setNewCompanyEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e4d8c]"
                  placeholder="ornek@firma.com"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-[#3d3933] mb-1">Giriş Şifresi</label>
                <input
                  type="text"
                  required
                  value={newCompanyPassword}
                  onChange={(e) => setNewCompanyPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e4d8c]"
                  placeholder="Örn: GuvenNalburiye123!"
                />
                <p className="text-xs text-gray-500 mt-1">Lütfen karmaşık olmayan ve akılda kalıcı bir şifre belirleyin.</p>
              </div>
              
              <div className="flex gap-3 justify-end flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCompanyModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-[#6b6760] hover:text-[#1a1814] transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCompany}
                  className="bg-[#1e4d8c] text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-70"
                >
                  {isSubmittingCompany ? "Kaydediliyor..." : "Firmayı Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Talep Detay Modalı (Admin) */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#f7f4ef]">
              <div>
                <h3 className="font-bold text-[#1a1814] text-lg">{selectedTicket.title}</h3>
                <p className="text-xs text-[#1e4d8c] mt-1 font-semibold">{selectedTicket.companies?.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{new Date(selectedTicket.created_at).toLocaleString('tr-TR')}</p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-[#9b2010] transition-colors self-start"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Durum</span>
                
                <div className="flex items-center gap-2">
                  {updatingTicketId === selectedTicket.id && <RefreshCw size={14} className="animate-spin text-[#c4391a]" />}
                  <select 
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                    disabled={updatingTicketId === selectedTicket.id}
                    className={`text-xs font-semibold rounded-md px-3 py-1.5 border outline-none cursor-pointer transition-colors
                      ${selectedTicket.status === 'Beklemede' ? 'bg-[#fdf3d0] text-[#8b5d00] border-[#f0dfa0]' : 
                        selectedTicket.status === 'Devam Ediyor' ? 'bg-[#e4eef8] text-[#1a3d7c] border-[#b6d4f0]' : 
                        'bg-[#e4f3ee] text-[#1a5c40] border-[#b8e0d0]'}`}
                  >
                    <option value="Beklemede">Beklemede</option>
                    <option value="Devam Ediyor">Devam Ediyor</option>
                    <option value="Tamamlandı">Tamamlandı</option>
                  </select>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Açıklama Detayı</span>
                <div className="mt-2 text-sm text-[#3d3933] bg-gray-50 p-4 rounded-lg whitespace-pre-wrap border border-gray-100 leading-relaxed min-h-[100px]">
                  {selectedTicket.description}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedTicket(null)}
                className="bg-[#1a1814] text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-opacity-90 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}