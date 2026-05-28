"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LogOut, Package, CheckCircle2, Clock, Plus, X, BarChart3, FileText } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import toast from "react-hot-toast";

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);
    const [tickets, setTickets] = useState<any[]>([]);

    // Yeni Talep Formu State'leri
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Talep Detay Modalı State'leri
    const [selectedTicket, setSelectedTicket] = useState<any>(null);

    useEffect(() => {
        async function fetchDashboardData() {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push("/login");
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select(`
          full_name,
          role,
          company_id,
          companies (
            name,
            sector,
            package_type,
            prevented_loss
          )
        `)
                .eq("id", session.user.id)
                .single();

            if (profile) {
                setUserData(profile);
            }

            const { data: companyTickets } = await supabase
                .from("tickets")
                .select("*")
                .order("created_at", { ascending: false });

            if (companyTickets) {
                setTickets(companyTickets);
            }

            setLoading(false);
        }

        fetchDashboardData();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const { data, error } = await supabase
            .from("tickets")
            .insert([
                {
                    company_id: userData.company_id,
                    title: newTitle,
                    description: newDescription,
                    status: "Beklemede"
                }
            ])
            .select()
            .single();

        if (data) {
            setTickets([data, ...tickets]);
            setNewTitle("");
            setNewDescription("");
            setIsModalOpen(false);
            toast.success("Talebiniz başarıyla iletildi. Ekibimiz en kısa sürede ilgilenecektir.");
        }

        setIsSubmitting(false);
    };

    // Grafik Verisi Hesaplama
    const chartData = [
      { name: "Beklemede", value: tickets.filter(t => t.status === "Beklemede").length, color: "#f59e0b" },
      { name: "Devam Ediyor", value: tickets.filter(t => t.status === "Devam Ediyor").length, color: "#3b82f6" },
      { name: "Tamamlandı", value: tickets.filter(t => t.status === "Tamamlandı").length, color: "#10b981" }
    ].filter(item => item.value > 0); // Sadece değeri olanları göster

    if (loading) {
        return <div className="min-h-screen bg-[#f7f4ef] flex items-center justify-center font-medium text-[#6b6760]">Veriler yükleniyor...</div>;
    }

    return (
        <div className="min-h-screen bg-[#f7f4ef] font-sans relative">
            <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="text-xl font-bold text-[#c4391a]">Opexim<span className="text-[#3d3933]">.</span></div>
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="text-sm text-[#6b6760] hidden md:block">
                        Hoş geldin, <span className="font-semibold text-[#1a1814]">{userData?.full_name}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm text-[#9b2010] bg-[#fde8e4] px-3 md:px-4 py-2 rounded-md font-medium hover:bg-opacity-80 transition-colors"
                    >
                        <LogOut size={16} /> <span className="hidden md:inline">Çıkış</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-4 md:p-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-[#1a1814] mb-2">{userData?.companies?.name}</h1>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e4f3ee] text-[#1a5c40]">
                                <Package size={14} /> {userData?.companies?.package_type} Paket
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                {userData?.companies?.sector}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-[#1a1814] text-[#f7f4ef] px-5 py-2.5 rounded-md font-semibold hover:bg-[#3d3933] transition-colors w-full md:w-auto"
                    >
                        <Plus size={18} /> Yeni Talep Oluştur
                    </button>
                </div>

                {/* Metrik Kartları ve Grafik Alanı */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* Sol Taraf: Metrikler */}
                  <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-[#2e7d6e]">
                          <div className="text-sm font-semibold text-[#6b6760] mb-1">Sistem Durumu</div>
                          <div className="text-xl md:text-2xl font-bold text-[#1a1814] flex items-center gap-2">
                              <CheckCircle2 className="text-[#2e7d6e]" size={24} /> Sorunsuz
                          </div>
                      </div>

                      <div className="bg-white p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-[#c4391a]">
                          <div className="text-sm font-semibold text-[#6b6760] mb-1">Aktif Talepler</div>
                          <div className="text-xl md:text-2xl font-bold text-[#1a1814]">{tickets.filter(t => t.status !== 'Tamamlandı').length}</div>
                      </div>

                      <div className="bg-white p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-[#b8860b] sm:col-span-2">
                          <div className="text-sm font-semibold text-[#6b6760] mb-1">Önlenen Potansiyel Kayıp</div>
                          <div className="text-xl md:text-2xl font-bold text-[#1a1814]">
                              {userData?.companies?.prevented_loss ? userData.companies.prevented_loss.toLocaleString('tr-TR') : 0} ₺
                          </div>
                          <div className="text-xs text-[#8b5d00] mt-1">Bu ay tespit edilen stok ve cari farkları</div>
                      </div>
                  </div>

                  {/* Sağ Taraf: Pasta Grafik */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center h-full min-h-[250px]">
                      <h3 className="text-sm font-bold text-[#1a1814] self-start mb-4 w-full border-b pb-2 flex items-center gap-2">
                        <BarChart3 size={16} className="text-[#1e4d8c]" /> İş Yükü Dağılımı
                      </h3>
                      {chartData.length > 0 ? (
                        <div className="w-full h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-sm text-gray-400 text-center">
                          Henüz grafik oluşturacak<br/>talep verisi yok.
                        </div>
                      )}
                  </div>
                </div>

                {/* Talepler Tablosu */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-4 md:px-6 py-4 md:py-5 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-[#1a1814]">Son İşlemler & Talepler</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left min-w-[600px]">
                            <thead className="bg-[#1a1814] text-white">
                                <tr>
                                    <th className="px-4 md:px-6 py-4 font-medium">Başlık</th>
                                    <th className="px-4 md:px-6 py-4 font-medium">Durum</th>
                                    <th className="px-4 md:px-6 py-4 font-medium">Tarih</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tickets.length > 0 ? (
                                    tickets.map((ticket) => (
                                        <tr 
                                          key={ticket.id} 
                                          onClick={() => setSelectedTicket(ticket)}
                                          className="hover:bg-[#f7f4ef] transition-colors cursor-pointer"
                                        >
                                            <td className="px-4 md:px-6 py-4 font-semibold text-[#1e4d8c] hover:underline">
                                              <div className="flex items-center gap-2">
                                                <FileText size={16} className="text-gray-400" />
                                                {ticket.title}
                                              </div>
                                            </td>
                                            <td className="px-4 md:px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold 
                                                  ${ticket.status === 'Beklemede' ? 'bg-[#fdf3d0] text-[#8b5d00]' :
                                                  ticket.status === 'Devam Ediyor' ? 'bg-[#e4eef8] text-[#1a3d7c]' :
                                                  'bg-[#e4f3ee] text-[#1a5c40]'}`}>
                                                    {ticket.status === 'Beklemede' && <Clock size={12} />}
                                                    {ticket.status}
                                                </span>
                                            </td>
                                            <td className="px-4 md:px-6 py-4 text-[#6b6760]">
                                                {new Date(ticket.created_at).toLocaleDateString('tr-TR')}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-[#6b6760]">
                                            Henüz kayıtlı bir işlem bulunmuyor.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Yeni Talep Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#f7f4ef]">
                            <h3 className="font-bold text-[#1a1814]">Yeni Talep Oluştur</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-[#9b2010] transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTicket} className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-[#3d3933] mb-1">Konu Başlığı</label>
                                <input
                                    type="text"
                                    required
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e7d6e] focus:border-transparent"
                                    placeholder="Örn: E-Fatura iptali hk."
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-[#3d3933] mb-1">Detaylı Açıklama</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e7d6e] focus:border-transparent resize-none"
                                    placeholder="Yaşadığınız sorunu veya talebinizi detaylıca anlatın..."
                                ></textarea>
                            </div>

                            <div className="flex gap-3 justify-end">
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
                                    className="bg-[#2e7d6e] text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-[#1a5c50] transition-colors disabled:opacity-70"
                                >
                                    {isSubmitting ? "Gönderiliyor..." : "Talebi Gönder"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Talep Detay Modalı */}
            {selectedTicket && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#f7f4ef]">
                            <div>
                                <h3 className="font-bold text-[#1a1814] text-lg">{selectedTicket.title}</h3>
                                <p className="text-xs text-gray-500 mt-1">{new Date(selectedTicket.created_at).toLocaleString('tr-TR')}</p>
                            </div>
                            <button
                                onClick={() => setSelectedTicket(null)}
                                className="text-gray-400 hover:text-[#9b2010] transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <div className="mb-4">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Durum</span>
                                <div className="mt-1">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-semibold 
                                      ${selectedTicket.status === 'Beklemede' ? 'bg-[#fdf3d0] text-[#8b5d00]' :
                                      selectedTicket.status === 'Devam Ediyor' ? 'bg-[#e4eef8] text-[#1a3d7c]' :
                                      'bg-[#e4f3ee] text-[#1a5c40]'}`}>
                                        {selectedTicket.status}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Açıklama</span>
                                <div className="mt-2 text-sm text-[#3d3933] bg-gray-50 p-4 rounded-lg whitespace-pre-wrap border border-gray-100 leading-relaxed">
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