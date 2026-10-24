import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Smartphone,
  Wallet,
  Banknote,
  ShieldCheck,
  MapPin,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Headphones,
  Check,
  Zap,
} from 'lucide-react';
import { BRAND_INFO, OUTLETS } from '../data/njrCellData';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  actionType?: 'service_menu' | 'tx_form' | 'contact_direct' | 'outlet_info' | 'general_info';
  metadata?: {
    serviceName?: string;
    suggestedText?: string;
  };
}

interface ServiceOption {
  id: string;
  title: string;
  shortDesc: string;
  icon: React.ReactNode;
  category: string;
  defaultTopic: string;
  suggestedText: string;
}

const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: 'transfer_brilink',
    title: 'Transfer Bank & BRILink',
    shortDesc: 'Transfer antar bank, tarik tunai, kode agen BRILink 12400836',
    icon: <Banknote className="w-4 h-4 text-[#39FF14]" />,
    category: 'Perbankan',
    defaultTopic: 'transfer',
    suggestedText:
      'Halo Admin NJR CELL, saya ingin melakukan transaksi Transfer Bank / Tarik Tunai (Agen BRILink). Mohon nomor rekening resmi / QRIS dan total biayanya.',
  },
  {
    id: 'topup_ewallet',
    title: 'Top-Up E-Wallet',
    shortDesc: 'DANA, OVO, Gopay, ShopeePay, LinkAja',
    icon: <Wallet className="w-4 h-4 text-[#39FF14]" />,
    category: 'E-Wallet',
    defaultTopic: 'ewallet',
    suggestedText:
      'Halo Admin NJR CELL, saya ingin Top-Up saldo E-Wallet (DANA/OVO/ShopeePay/Gopay). Mohon info nomor rekening / QRIS konter.',
  },
  {
    id: 'pulsa_data',
    title: 'Pulsa & Kuota Data',
    shortDesc: 'Semua operator (Telkomsel, Indosat, XL, Tri, Axis, Smartfren)',
    icon: <Smartphone className="w-4 h-4 text-[#39FF14]" />,
    category: 'Pulsa & Data',
    defaultTopic: 'pulsa',
    suggestedText:
      'Halo Admin NJR CELL, saya ingin membeli Pulsa / Paket Kuota Data. Mohon daftar harga dan nomor tujuan pengisian.',
  },
  {
    id: 'hydrogel_garskin',
    title: 'Pasang Hydrogel & Garskin',
    shortDesc: 'Pelindung Rock Space custom cutting semua tipe HP',
    icon: <ShieldCheck className="w-4 h-4 text-[#39FF14]" />,
    category: 'Aksesori',
    defaultTopic: 'hydrogel',
    suggestedText:
      'Halo Admin NJR CELL, saya ingin tanya ketersediaan dan pasang Hydrogel Rock Space / Garskin untuk tipe HP saya.',
  },
  {
    id: 'pln_tagihan',
    title: 'Token PLN & Bayar Tagihan',
    shortDesc: 'Listrik prabayar/pascabayar, PDAM, BPJS, multifinance',
    icon: <Zap className="w-4 h-4 text-[#39FF14]" />,
    category: 'Tagihan PPOB',
    defaultTopic: 'tagihan',
    suggestedText:
      'Halo Admin NJR CELL, saya ingin bayar Tagihan / Token PLN. Mohon info nomor ID Pelanggan dan nominal bayar.',
  },
  {
    id: 'lokasi_jam',
    title: 'Alamat Outlet & Jam Buka',
    shortDesc: 'Outlet Sukajadi (Pamarican) & Ciherang (Banjarsari)',
    icon: <MapPin className="w-4 h-4 text-[#39FF14]" />,
    category: 'Lokasi',
    defaultTopic: 'lokasi',
    suggestedText:
      'Halo Admin NJR CELL, saya ingin menanyakan jam buka dan ketersediaan petugas di konter hari ini.',
  },
];

export const AutoChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showGreetingBubble, setShowGreetingBubble] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Active transaction builder inside chat
  const [selectedOutlet, setSelectedOutlet] = useState<'sukajadi' | 'ciherang'>('sukajadi');
  const [customNote, setCustomNote] = useState('');
  const [inputMessage, setInputMessage] = useState('');

  // Conversation history
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize initial greeting
  const initChat = () => {
    const timeStr = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
    setMessages([
      {
        id: 'msg-welcome-1',
        sender: 'bot',
        text: 'Halo! Selamat datang di Layanan Pelanggan Digital NJR CELL 👋\nAda yang bisa kami bantu seputar transaksi, pulsa, atau perbankan hari ini?',
        timestamp: timeStr,
        actionType: 'service_menu',
      },
    ]);
  };

  useEffect(() => {
    initChat();
    // Show mini prompt bubble after 3.5 seconds if not yet opened
    const timer = window.setTimeout(() => {
      setShowGreetingBubble(true);
    }, 3500);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShowGreetingBubble(false);
      setHasInteracted(true);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  // Handle service selection
  const handleSelectService = (service: ServiceOption) => {
    const timeStr = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: `Saya ingin layanan: ${service.title}`,
      timestamp: timeStr,
    };

    let botResponseText = '';
    let actionType: ChatMessage['actionType'] = 'tx_form';

    if (service.id === 'transfer_brilink') {
      botResponseText =
        'Siap! Untuk Transfer Bank, Tarik Tunai, atau Mandiri Agen & Agen BRILink (Kode: 12400836), transaksi diproses cepat dan aman atas nama resmi AMIR NURJAMAN.\n\nSilakan pilih outlet terdekat di bawah ini untuk langsung terhubung ke WhatsApp Admin yang bertugas:';
    } else if (service.id === 'topup_ewallet') {
      botResponseText =
        'Top-up saldo DANA, OVO, ShopeePay, Gopay, atau LinkAja siap dibantu! Saldo langsung masuk dalam hitungan menit.\n\nSilakan pilih outlet konter tujuan dan kirim detail ke WhatsApp:';
    } else if (service.id === 'pulsa_data') {
      botResponseText =
        'Beli pulsa dan paket kuota data internet tersedia untuk semua operator. Anda juga bisa transaksi mandiri online 24 jam via Buylink.\n\nUntuk diproses langsung oleh Admin konter via WA, pilih outlet di bawah:';
    } else if (service.id === 'hydrogel_garskin') {
      botResponseText =
        'Pemasangan Hydrogel Rock Space original dipotong presisi di tempat sesuai tipe HP Anda (layar datar maupun lengkung), plus garskin custom aesthetic.\n\nSilakan hubungi WhatsApp outlet untuk cek stok tipe HP Anda:';
    } else if (service.id === 'pln_tagihan') {
      botResponseText =
        'Token listrik PLN prabayar dan pembayaran tagihan bulanan (listrik, PDAM, BPJS, angsuran) langsung keluar struk resmi.\n\nPilih outlet untuk kirim nomor pelanggan ke WA Admin:';
    } else if (service.id === 'lokasi_jam') {
      botResponseText =
        'NJR CELL memiliki 2 outlet resmi:\n• Sukajadi: Sekitar MAN 4 Ciamis, Pamarican (WA: 0853-2000-0303)\n• Ciherang: Jl. Pangandaran No. 84, dekat SD 1 Ciherang, Banjarsari (WA: 0831-2000-0303)\n\nHubungi admin sekarang jika ingin mengecek ketersediaan petugas:';
      actionType = 'outlet_info';
    }

    const botMsg: ChatMessage = {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: botResponseText,
      timestamp: timeStr,
      actionType,
      metadata: {
        serviceName: service.title,
        suggestedText: service.suggestedText,
      },
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  // Generate WhatsApp Direct Link
  const buildWhatsAppUrl = (
    outletKey: 'sukajadi' | 'ciherang',
    baseText: string,
    notes?: string
  ) => {
    const outlet = OUTLETS.find((o) => o.id === outletKey) || OUTLETS[0];
    const phoneRaw = outletKey === 'sukajadi' ? '6285320000303' : '6283120000303';
    const outletLabel =
      outletKey === 'sukajadi' ? 'Sukajadi (Pamarican)' : 'Ciherang (Banjarsari)';

    let finalMessage = `${baseText}\n\n📍 Tujuan: Konter NJR CELL ${outletLabel}`;
    if (notes && notes.trim().length > 0) {
      finalMessage += `\n📝 Detail/Catatan: ${notes.trim()}`;
    }
    finalMessage += `\n(Dihubungkan via Chat Otomatis Website NJR CELL)`;

    return `https://api.whatsapp.com/send?phone=${phoneRaw}&text=${encodeURIComponent(
      finalMessage
    )}`;
  };

  // Handle Send from Free Text Input
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    const timeStr = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: timeStr,
    };

    const botMsg: ChatMessage = {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: `Pesan Anda: "${userText}" sudah siap diteruskan langsung ke WhatsApp Admin NJR CELL agar transaksi dapat segera diproses. Silakan pilih outlet konter tujuan di bawah ini:`,
      timestamp: timeStr,
      actionType: 'tx_form',
      metadata: {
        serviceName: 'Pertanyaan / Transaksi Khusus',
        suggestedText: `Halo Admin NJR CELL, saya ingin melakukan transaksi / menanyakan: ${userText}`,
      },
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInputMessage('');
  };

  return (
    <>
      {/* Mini Greeting Notification Bubble (Pojok Kanan Bawah) */}
      {!isOpen && showGreetingBubble && (
        <div className="fixed bottom-24 right-5 z-40 max-w-[280px] bg-[#101A13]/95 backdrop-blur-md border border-[#39FF14]/40 text-[#E6EFE9] p-3 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39FF14] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#39FF14]"></span>
              </span>
              <p className="text-xs font-bold text-[#39FF14]">CS Otomatis NJR CELL</p>
            </div>
            <button
              type="button"
              onClick={() => setShowGreetingBubble(false)}
              className="text-[#A3B3A8] hover:text-white p-0.5 rounded transition-colors"
              title="Tutup pesan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-white/90 mt-1.5 leading-relaxed">
            Mau transfer BRILink, top-up e-wallet, atau beli pulsa? Klik tombol balon chat untuk bantuan instan ke WA!
          </p>
        </div>
      )}

      {/* Floating Action Button (Balon Chat) */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`relative group flex items-center justify-center p-3.5 sm:p-4 rounded-full shadow-[0_0_25px_rgba(57,255,20,0.4)] transition-all duration-300 transform active:scale-95 cursor-pointer ${
            isOpen
              ? 'bg-[#182B1E] text-white border-2 border-[#39FF14] rotate-90'
              : 'bg-gradient-to-tr from-[#0F1E13] via-[#162D1D] to-[#0A3315] text-[#39FF14] border-2 border-[#39FF14] hover:scale-105'
          }`}
          aria-label={isOpen ? 'Tutup obrolan otomatis' : 'Buka obrolan otomatis'}
          title="Chat CS Otomatis & Terhubung ke WA Admin"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-[#39FF14]" />
          ) : (
            <>
              <MessageCircle className="w-6 h-6 text-[#39FF14] group-hover:animate-pulse" />
              {/* Online Pulse Indicator */}
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39FF14] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#39FF14] border-2 border-[#0A0F0D]"></span>
              </span>
            </>
          )}
        </button>
      </div>

      {/* Interactive Auto-Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 sm:bottom-24 right-3 sm:right-5 z-40 w-[calc(100vw-1.5rem)] sm:w-[410px] max-h-[82vh] h-[580px] bg-[#0E1712] border-2 border-[#24382B] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#112416] via-[#17301E] to-[#112416] border-b border-[#24382B] p-3.5 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#1A3320] border border-[#39FF14]/50 flex items-center justify-center overflow-hidden">
                  <img
                    src={BRAND_INFO.logoPath}
                    alt="NJR CELL Logo"
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <Headphones className="w-5 h-5 text-[#39FF14]" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#39FF14] border-2 border-[#112416] rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-[#E6EFE9]">CS Otomatis NJR CELL</h3>
                  <span className="text-[10px] bg-[#39FF14]/20 text-[#39FF14] px-1.5 py-0.5 rounded font-mono font-bold">
                    ONLINE
                  </span>
                </div>
                <p className="text-[11px] text-[#A3B3A8]">
                  Pilih layanan & langsung ke WA Admin
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={initChat}
                className="p-1.5 text-[#A3B3A8] hover:text-[#39FF14] hover:bg-[#1C3622] rounded-lg transition-colors cursor-pointer"
                title="Mulai Ulang Percakapan"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-[#A3B3A8] hover:text-white hover:bg-[#1C3622] rounded-lg transition-colors cursor-pointer"
                title="Tutup Jendela"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Info Bar */}
          <div className="bg-[#142318] px-3.5 py-1.5 border-b border-[#203324] text-[11px] text-[#A3B3A8] flex items-center justify-between">
            <span className="flex items-center gap-1 text-[#39FF14]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Rekening Resmi: a.n. AMIR NURJAMAN
            </span>
            <span className="text-gray-400 font-mono">Agen BRILink: 12400836</span>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-sm scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#1F4027] text-white border border-[#39FF14]/40 rounded-br-none'
                      : 'bg-[#142318] text-[#E6EFE9] border border-[#233827] rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span className="block text-[9px] text-[#A3B3A8] mt-1 text-right">
                    {msg.timestamp}
                  </span>
                </div>

                {/* Sub-actions for bot messages */}
                {msg.sender === 'bot' && msg.actionType === 'service_menu' && (
                  <div className="mt-2.5 w-full space-y-1.5">
                    <p className="text-[11px] font-semibold text-[#39FF14] px-1">
                      Pilih menu transaksi atau bantuan:
                    </p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {SERVICE_OPTIONS.map((srv) => (
                        <button
                          key={srv.id}
                          type="button"
                          onClick={() => handleSelectService(srv)}
                          className="w-full text-left bg-[#101C13] hover:bg-[#182C1E] border border-[#24382B] hover:border-[#39FF14]/60 p-2.5 rounded-xl transition-all flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-[#193020] border border-[#2D4533] group-hover:border-[#39FF14]/50">
                              {srv.icon}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white group-hover:text-[#39FF14]">
                                {srv.title}
                              </p>
                              <p className="text-[10px] text-[#A3B3A8] line-clamp-1">
                                {srv.shortDesc}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#A3B3A8] group-hover:text-[#39FF14] group-hover:translate-x-0.5 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transaction Direct WhatsApp Routing Form */}
                {msg.sender === 'bot' && (msg.actionType === 'tx_form' || msg.actionType === 'outlet_info') && (
                  <div className="mt-2.5 w-full bg-[#101C13] border border-[#24382B] rounded-xl p-3 text-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#39FF14] text-[11px] uppercase tracking-wide">
                        Langkah Transaksi ke WhatsApp
                      </span>
                      <span className="text-[10px] text-gray-400">Pilih Outlet Terdekat</span>
                    </div>

                    {/* Outlet Radio Selector */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedOutlet('sukajadi')}
                        className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                          selectedOutlet === 'sukajadi'
                            ? 'bg-[#18331E] border-[#39FF14] text-white shadow-[0_0_10px_rgba(57,255,20,0.2)]'
                            : 'bg-[#142318] border-[#24382B] text-[#A3B3A8] hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-[11px] text-white">Sukajadi</p>
                          {selectedOutlet === 'sukajadi' && (
                            <Check className="w-3.5 h-3.5 text-[#39FF14]" />
                          )}
                        </div>
                        <p className="text-[9px] text-[#A3B3A8]">Pamarican</p>
                        <p className="text-[9px] text-[#39FF14] font-mono mt-0.5">
                          0853-2000-0303
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedOutlet('ciherang')}
                        className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                          selectedOutlet === 'ciherang'
                            ? 'bg-[#18331E] border-[#39FF14] text-white shadow-[0_0_10px_rgba(57,255,20,0.2)]'
                            : 'bg-[#142318] border-[#24382B] text-[#A3B3A8] hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-[11px] text-white">Ciherang</p>
                          {selectedOutlet === 'ciherang' && (
                            <Check className="w-3.5 h-3.5 text-[#39FF14]" />
                          )}
                        </div>
                        <p className="text-[9px] text-[#A3B3A8]">Banjarsari</p>
                        <p className="text-[9px] text-[#39FF14] font-mono mt-0.5">
                          0831-2000-0303
                        </p>
                      </button>
                    </div>

                    {/* Note input for transaction detail (nominal, number, or notes) */}
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">
                        Nominal / Nomor Tujuan / Catatan (Opsional):
                      </label>
                      <input
                        type="text"
                        value={customNote}
                        onChange={(e) => setCustomNote(e.target.value)}
                        placeholder="Contoh: Top-up DANA 100rb / Pulsa Telkomsel"
                        className="w-full bg-[#0A100C] border border-[#24382B] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#39FF14]"
                      />
                    </div>

                    {/* Primary Button: Open WhatsApp directly */}
                    <a
                      href={buildWhatsAppUrl(
                        selectedOutlet,
                        msg.metadata?.suggestedText || 'Halo Admin NJR CELL, saya ingin melakukan transaksi.',
                        customNote
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 rounded-lg bg-[#39FF14] hover:bg-[#32e012] text-[#0A0F0D] font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(57,255,20,0.3)] transition-all cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>
                        Lanjutkan Transaksi ke WA (
                        {selectedOutlet === 'sukajadi' ? 'Sukajadi' : 'Ciherang'})
                      </span>
                    </a>

                    <div className="flex items-center justify-between text-[10px] text-[#A3B3A8] pt-1 border-t border-[#1C2C20]">
                      <span>⚡ Respon Cepat saat Jam Operasional</span>
                      <a
                        href={BRAND_INFO.buylinkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#39FF14] hover:underline flex items-center gap-1"
                      >
                        <span>Portal 24 Jam</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input for Custom Messages */}
          <form
            onSubmit={handleSendMessage}
            className="p-2.5 bg-[#111C14] border-t border-[#24382B] flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ketik pertanyaan / kebutuhan transaksi..."
              className="flex-1 bg-[#0A100C] border border-[#24382B] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#39FF14]"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2 bg-[#39FF14] hover:bg-[#32e012] text-[#0A0F0D] rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Kirim pesan"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
