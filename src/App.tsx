import React, { useState } from 'react';
import {
  Smartphone,
  Wifi,
  PhoneCall,
  Zap,
  Gamepad2,
  Wallet,
  Ticket,
  ShoppingBag,
  MessageCircle,
  MapPin,
  Copy,
  Check,
  Download,
  ExternalLink,
  ShieldCheck,
  Building2,
  Banknote,
  Receipt,
  Layers,
  ChevronDown,
  Menu,
  X,
  FileText,
  ClipboardCheck,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  ArrowRight,
  Plug,
  CupSoda,
  IceCreamCone,
  PackageCheck,
  Navigation,
  Lock,
} from 'lucide-react';
import {
  BRAND_INFO,
  DIGITAL_SERVICES,
  EXTRA_STORE_PRODUCTS,
  PAYMENT_ACCOUNTS,
  QRIS_INFO,
  OUTLETS,
  FAQ_ITEMS,
  ExtraProductItem,
} from './data/njrCellData';
import { PromoSlideshow } from './components/PromoSlideshow';
import {
  WhatsAppSelectorModal,
  TermsModal,
  AuditModal,
} from './components/Modals';
import { AutoChatWidget } from './components/AutoChatWidget';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [waModalTopic, setWaModalTopic] = useState('umum');
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [copiedAccountId, setCopiedAccountId] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [priceIframeKey, setPriceIframeKey] = useState(0);
  const [showPriceIframe, setShowPriceIframe] = useState(true);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [heroSelectedOutletId, setHeroSelectedOutletId] = useState<'sukajadi' | 'ciherang'>('sukajadi');

  const activeHeroOutlet =
    OUTLETS.find((o) => o.id === heroSelectedOutletId) || OUTLETS[0];

  const openWaWithTopic = (topicId: string) => {
    setWaModalTopic(topicId);
    setWaModalOpen(true);
  };

  const handleCopyAccount = async (id: string, rawNumber: string) => {
    try {
      await navigator.clipboard.writeText(rawNumber);
      setCopiedAccountId(id);
      window.setTimeout(() => {
        setCopiedAccountId((prev) => (prev === id ? null : prev));
      }, 2200);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = rawNumber;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedAccountId(id);
      window.setTimeout(() => {
        setCopiedAccountId((prev) => (prev === id ? null : prev));
      }, 2200);
    }
  };

  const handleDownloadQris = () => {
    const link = document.createElement('a');
    link.href = QRIS_INFO.imagePath;
    link.download = 'QRIS-NJR-CELL-ID1020035674883.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderServiceIcon = (iconName: string) => {
    const props = { className: 'w-5 h-5 text-[#39FF14]' };
    switch (iconName) {
      case 'Smartphone':
        return <Smartphone {...props} />;
      case 'Wifi':
        return <Wifi {...props} />;
      case 'PhoneCall':
        return <PhoneCall {...props} />;
      case 'Zap':
        return <Zap {...props} />;
      case 'Gamepad2':
        return <Gamepad2 {...props} />;
      case 'Wallet':
        return <Wallet {...props} />;
      case 'Ticket':
        return <Ticket {...props} />;
      default:
        return <ShoppingBag {...props} />;
    }
  };

  const renderExtraProductIcon = (iconName: ExtraProductItem['iconName']) => {
    const props = { className: 'w-6 h-6 text-[#39FF14]' };
    switch (iconName) {
      case 'CupSoda':
        return <CupSoda {...props} />;
      case 'IceCreamCone':
        return <IceCreamCone {...props} />;
      default:
        return <PackageCheck {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#090B0A] text-[#F3F7F4] flex flex-col">
      {/* 1. HEADER — Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 glass-surface border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="#beranda"
            className="text-lg sm:text-xl font-extrabold tracking-tight text-[#F3F7F4] hover:text-[#39FF14] transition-colors whitespace-nowrap shrink-0"
          >
            NJR CELL
          </a>

          {/* Zone 2: 5 Concise Single-Line Navigation Links */}
          <nav
            aria-label="Navigasi Utama"
            className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#B8C7BD]"
          >
            <a
              href="#lokasi-outlet"
              className="hover:text-[#39FF14] transition-colors whitespace-nowrap shrink-0"
            >
              Peta & Lokasi
            </a>
            <a
              href="#layanan-digital"
              className="hover:text-[#39FF14] transition-colors whitespace-nowrap shrink-0"
            >
              Layanan Digital
            </a>
            <a
              href="#transfer-agen"
              className="hover:text-[#39FF14] transition-colors whitespace-nowrap shrink-0"
            >
              Transfer & Agen
            </a>
            <a
              href="#aksesori-hydrogel"
              className="hover:text-[#39FF14] transition-colors whitespace-nowrap shrink-0"
            >
              Aksesori & Produk
            </a>
            <a
              href="#pembayaran-qris"
              className="hover:text-[#39FF14] transition-colors whitespace-nowrap shrink-0"
            >
              Pembayaran & Harga
            </a>
          </nav>

          {/* Zone 3: 1 Primary Action + Admin Login Shortcut */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setAdminModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-[#39FF14] text-[#D1DDD5] hover:text-[#070A08] text-xs font-bold border border-white/10 hover:border-[#39FF14] transition-colors cursor-pointer"
              title="Buka CMS Admin Slideshow untuk Login dan Upload Banner"
            >
              <Lock className="w-3.5 h-3.5 text-[#39FF14] group-hover:text-[#070A08]" />
              <span className="hidden sm:inline">Login Admin</span>
            </button>

            <button
              type="button"
              onClick={() => openWaWithTopic('umum')}
              className="px-4 py-2.5 rounded-xl bg-[#39FF14] hover:bg-[#2ee00e] text-[#070A08] font-bold text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Hubungi WhatsApp
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Buka menu navigasi"
              aria-expanded={mobileMenuOpen}
              className="lg:hidden p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#F3F7F4] border border-white/10 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[#0D110F] px-4 py-4 space-y-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setAdminModalOpen(true);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold text-[#070A08] bg-[#39FF14] hover:bg-[#2ee00e] transition-colors cursor-pointer mb-2"
            >
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#070A08]" />
                <span>Login Admin (Upload Banner)</span>
              </span>
              <span className="text-xs bg-black/20 px-2 py-0.5 rounded">CMS</span>
            </button>
            <a
              href="#lokasi-outlet"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-bold text-[#39FF14] hover:bg-white/5"
            >
              Peta & Lokasi Outlet (Sukajadi & Ciherang)
            </a>
            <a
              href="#layanan-digital"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#D1DDD5] hover:bg-white/5 hover:text-[#39FF14]"
            >
              Layanan Digital 24 Jam
            </a>
            <a
              href="#transfer-agen"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#D1DDD5] hover:bg-white/5 hover:text-[#39FF14]"
            >
              Transfer, Tarik Tunai, Mandiri Agen & BRILink
            </a>
            <a
              href="#aksesori-hydrogel"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#D1DDD5] hover:bg-white/5 hover:text-[#39FF14]"
            >
              Aksesori HP, Hydrogel & Garskin
            </a>
            <a
              href="#produk-tambahan"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#D1DDD5] hover:bg-white/5 hover:text-[#39FF14]"
            >
              Minuman Dingin, Es Krim & Produk Konter
            </a>
            <a
              href="#pembayaran-qris"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#D1DDD5] hover:bg-white/5 hover:text-[#39FF14]"
            >
              Rekening Resmi, QRIS & Daftar Harga
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#D1DDD5] hover:bg-white/5 hover:text-[#39FF14]"
            >
              Tanya Jawab (FAQ)
            </a>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* 2 & 3. HERO SECTION: PENJELASAN NJR CELL (KIRI) + PETA LOKASI LANGSUNG (KANAN) */}
        <section
          id="beranda"
          className="relative overflow-hidden py-8 sm:py-12 lg:py-16 border-b border-white/10"
        >
          {/* Ambient radial glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[680px] h-[340px] rounded-full bg-[#39FF14]/10 blur-[110px]"
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
              {/* Left Column: Penjelasan Identitas & Layanan NJR CELL + Tombol Utama */}
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div>
                  {/* Brand Identity Lockup + Unboxed Regional Metadata */}
                  <div className="flex items-center gap-3.5 mb-5">
                    {!imgErrors['logo'] ? (
                      <img
                        src={BRAND_INFO.logoPath}
                        alt="Logo Resmi NJR CELL"
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setImgErrors((prev) => ({ ...prev, logo: true }))
                        }
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-contain bg-[#111613] p-1.5 border border-[#39FF14]/40 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-[#39FF14]/15 border border-[#39FF14]/40 flex items-center justify-center font-extrabold text-lg text-[#39FF14] shrink-0">
                        NJR
                      </div>
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-[#39FF14]">
                        <span>NJR CELL CIAMIS</span>
                        <span aria-hidden="true">·</span>
                        <span>Pamarican & Banjarsari</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#A3B3A8] mt-0.5">
                        Pusat Layanan Digital 24 Jam, Perbankan & Aksesori HP
                      </p>
                    </div>
                  </div>

                  <h1
                    className="text-2xl sm:text-4xl lg:text-[40px] font-extrabold text-[#F3F7F4] tracking-tight leading-[1.18] mb-4"
                    style={{ textWrap: 'balance' }}
                  >
                    {BRAND_INFO.heroHeadline}
                  </h1>

                  <p className="text-sm sm:text-base text-[#B8C7BD] leading-relaxed mb-6">
                    {BRAND_INFO.heroSubheadline}
                  </p>

                  {/* Ringkasan Cepat Layanan Utama agar Penjelasan Langsung Terbaca */}
                  <div className="grid grid-cols-2 gap-2.5 mb-6">
                    <button
                      type="button"
                      onClick={() => openWaWithTopic('tarik-tunai')}
                      className="p-3 rounded-xl bg-[#111613] hover:bg-[#171F1B] border border-white/10 hover:border-[#39FF14]/40 text-left transition-colors cursor-pointer"
                    >
                      <p className="text-xs sm:text-sm font-bold text-[#F3F7F4]">
                        Transfer & Tarik Tunai
                      </p>
                      <p className="text-[11px] sm:text-xs text-[#A3B3A8] mt-0.5">
                        Bank, E-Wallet & Mini ATM
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => openWaWithTopic('mandiri-agen')}
                      className="p-3 rounded-xl bg-[#111613] hover:bg-[#171F1B] border border-white/10 hover:border-[#39FF14]/40 text-left transition-colors cursor-pointer"
                    >
                      <p className="text-xs sm:text-sm font-bold text-[#F3F7F4]">
                        Mandiri Agen & BRILink
                      </p>
                      <p className="text-[11px] sm:text-xs text-[#A3B3A8] mt-0.5 font-mono-num">
                        Kode BRILink: {BRAND_INFO.brilinkAgentCode}
                      </p>
                    </button>

                    <a
                      href={BRAND_INFO.buylinkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-[#111613] hover:bg-[#171F1B] border border-white/10 hover:border-[#39FF14]/40 text-left transition-colors block"
                    >
                      <p className="text-xs sm:text-sm font-bold text-[#F3F7F4] flex items-center justify-between">
                        <span>Pulsa & Kuota 24 Jam</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#39FF14] shrink-0" />
                      </p>
                      <p className="text-[11px] sm:text-xs text-[#A3B3A8] mt-0.5">
                        Top Up Game & Voucher
                      </p>
                    </a>

                    <a
                      href={BRAND_INFO.hydrogelCatalogUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-[#111613] hover:bg-[#171F1B] border border-white/10 hover:border-[#39FF14]/40 text-left transition-colors block"
                    >
                      <p className="text-xs sm:text-sm font-bold text-[#F3F7F4] flex items-center justify-between">
                        <span>Hydrogel & Garskin</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#39FF14] shrink-0" />
                      </p>
                      <p className="text-[11px] sm:text-xs text-[#A3B3A8] mt-0.5">
                        Charger, Es Krim & Minuman
                      </p>
                    </a>
                  </div>
                </div>

                {/* 3. Tombol Utama: Hubungi WhatsApp & Lihat Detail Kedua Lokasi */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openWaWithTopic('umum')}
                      className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#39FF14] hover:bg-[#2ee00e] text-[#070A08] font-extrabold text-sm sm:text-base neon-glow-strong transition-all whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Hubungi WhatsApp</span>
                    </button>

                    <a
                      href="#lokasi-outlet"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#151C18] hover:bg-[#1C2620] text-[#F3F7F4] font-bold text-sm border border-white/15 hover:border-[#39FF14]/50 transition-colors whitespace-nowrap shrink-0"
                    >
                      <MapPin className="w-4 h-4 text-[#39FF14]" />
                      <span>Lihat Kedua Outlet Lengkap</span>
                    </a>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#A3B3A8]">
                    <span>Agen BRILink Resmi: <strong className="font-mono-num text-[#F3F7F4]">{BRAND_INFO.brilinkAgentCode}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>Mandiri Agen</span>
                    <span aria-hidden="true">·</span>
                    <span>Rekening a.n. AMIR NURJAMAN</span>
                  </div>
                </div>
              </div>

              {/* Right Column: PETA & LOKASI OUTLET LANGSUNG TERLIHAT SAAT BUKA WEB */}
              <div className="lg:col-span-6 flex">
                <div className="w-full rounded-2xl bg-[#111613] border border-[#39FF14]/35 p-4 sm:p-6 flex flex-col justify-between neon-glow-subtle">
                  <div>
                    {/* Top Header + Interactive Outlet Switcher Tabs */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
                      <div>
                        <p className="text-xs font-bold text-[#39FF14] tracking-wide flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>PETA & LOKASI KONTER NJR CELL</span>
                        </p>
                        <h2 className="text-base sm:text-lg font-extrabold text-[#F3F7F4] mt-0.5">
                          Pilih Outlet Terdekat Anda:
                        </h2>
                      </div>

                      {/* Interactive Segmented Control to Switch Map Immediately */}
                      <div
                        role="tablist"
                        aria-label="Pilih peta lokasi outlet"
                        className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#0A0D0B] border border-white/10"
                      >
                        <button
                          type="button"
                          role="tab"
                          aria-selected={heroSelectedOutletId === 'sukajadi'}
                          onClick={() => setHeroSelectedOutletId('sukajadi')}
                          className={`px-3 py-2 rounded-lg text-xs font-extrabold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            heroSelectedOutletId === 'sukajadi'
                              ? 'bg-[#39FF14] text-[#070A08]'
                              : 'text-[#B8C7BD] hover:text-[#F3F7F4]'
                          }`}
                        >
                          1. Sukajadi (Pamarican)
                        </button>
                        <button
                          type="button"
                          role="tab"
                          aria-selected={heroSelectedOutletId === 'ciherang'}
                          onClick={() => setHeroSelectedOutletId('ciherang')}
                          className={`px-3 py-2 rounded-lg text-xs font-extrabold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            heroSelectedOutletId === 'ciherang'
                              ? 'bg-[#39FF14] text-[#070A08]'
                              : 'text-[#B8C7BD] hover:text-[#F3F7F4]'
                          }`}
                        >
                          2. Ciherang (Banjarsari)
                        </button>
                      </div>
                    </div>

                    {/* Prominent Map Preview Image with Direct Google Maps Click */}
                    <a
                      href={activeHeroOutlet.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative rounded-xl overflow-hidden border border-white/15 bg-[#090B0A] h-48 sm:h-56 group mb-4"
                    >
                      {!imgErrors[`hero-${activeHeroOutlet.id}`] ? (
                        <img
                          key={activeHeroOutlet.id}
                          src={activeHeroOutlet.mapPreviewImage}
                          alt={`Peta Lokasi ${activeHeroOutlet.name}`}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setImgErrors((prev) => ({
                              ...prev,
                              [`hero-${activeHeroOutlet.id}`]: true,
                            }))
                          }
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#121915]">
                          <MapPin className="w-10 h-10 text-[#39FF14] mb-2" />
                          <p className="text-sm font-bold text-[#F3F7F4]">
                            {activeHeroOutlet.name}
                          </p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex items-end justify-between p-3.5 sm:p-4">
                        <div>
                          <span className="text-[11px] font-bold text-[#39FF14] block">
                            {activeHeroOutlet.code}
                          </span>
                          <span className="text-sm sm:text-base font-extrabold text-[#F3F7F4]">
                            {activeHeroOutlet.name}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#39FF14] text-[#070A08] text-xs font-extrabold shadow-lg whitespace-nowrap shrink-0">
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Petunjuk Arah Maps</span>
                        </span>
                      </div>
                    </a>

                    {/* Active Outlet Address & Landmark Summary */}
                    <div className="p-3.5 rounded-xl bg-[#161D19] border border-white/10 mb-4 space-y-1">
                      <p className="text-xs sm:text-sm text-[#F3F7F4] font-semibold leading-snug">
                        {activeHeroOutlet.address}
                      </p>
                      <p className="text-xs text-[#39FF14] font-medium">
                        {activeHeroOutlet.landmarkNote}
                      </p>
                    </div>
                  </div>

                  {/* Direct Action Buttons for the Selected Outlet in Hero */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <a
                      href={activeHeroOutlet.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#39FF14] hover:bg-[#2ee00e] text-[#070A08] font-extrabold text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>
                        Buka Google Maps{' '}
                        {activeHeroOutlet.id === 'sukajadi' ? 'Sukajadi' : 'Ciherang'}
                      </span>
                    </a>

                    <a
                      href={activeHeroOutlet.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-[#F3F7F4] font-bold text-xs sm:text-sm border border-white/15 transition-colors whitespace-nowrap shrink-0"
                    >
                      <MessageCircle className="w-4 h-4 text-[#39FF14]" />
                      <span>
                        WA {activeHeroOutlet.id === 'sukajadi' ? 'Sukajadi' : 'Ciherang'} (
                        {activeHeroOutlet.whatsappNumberDisplay})
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. SLIDESHOW PROMOSI YANG RINGAN & MUDAH DIGANTI */}
        <PromoSlideshow
          externalAdminModalOpen={adminModalOpen}
          onExternalAdminModalClose={() => setAdminModalOpen(false)}
        />

        {/* 5. KATEGORI LAYANAN DIGITAL */}
        <section
          id="layanan-digital"
          className="py-14 md:py-20 border-b border-white/10"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <p className="text-xs font-medium tracking-wider text-[#39FF14] mb-1.5">
                  02. KATEGORI LAYANAN DIGITAL & ONLINE 24 JAM
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#F3F7F4] tracking-tight">
                  Pulsa, Kuota, Token Listrik & Top Up Digital
                </h2>
                <p className="text-sm sm:text-base text-[#A3B3A8] mt-1 max-w-2xl">
                  Transaksi mandiri kapan saja melalui portal resmi Buylink NJR CELL, atau datang langsung ke konter jika Anda ingin dibantu oleh petugas kami.
                </p>
              </div>

              <a
                href={BRAND_INFO.buylinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#39FF14] hover:bg-[#2ee00e] text-[#070A08] font-bold text-sm transition-colors whitespace-nowrap shrink-0 self-start md:self-auto"
              >
                <span>Buka Portal Buylink 24 Jam</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {DIGITAL_SERVICES.map((service) => (
                <div
                  key={service.id}
                  className="rounded-2xl bg-[#111613] border border-white/10 hover:border-[#39FF14]/40 p-5 sm:p-6 flex flex-col justify-between transition-colors"
                >
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-[#17221B] border border-[#39FF14]/25 flex items-center justify-center mb-4">
                      {renderServiceIcon(service.iconName)}
                    </div>
                    <p className="text-xs text-[#A3B3A8] mb-1">{service.channel}</p>
                    <h3 className="text-lg font-bold text-[#F3F7F4] mb-2">
                      {service.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#A3B3A8] leading-relaxed mb-5">
                      {service.description}
                    </p>
                  </div>

                  <a
                    href={service.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-white/5 hover:bg-[#39FF14] text-[#F3F7F4] hover:text-[#070A08] text-xs sm:text-sm font-bold border border-white/10 transition-colors"
                  >
                    <span>{service.actionLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-[#121815] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-[#B8C7BD]">
              <span>
                Catatan: Tidak semua produk digital ditampilkan satu per satu di halaman ini. Jika produk digital yang Anda cari belum tertera, silakan tanyakan langsung melalui WhatsApp.
              </span>
              <button
                type="button"
                onClick={() => openWaWithTopic('umum')}
                className="text-[#39FF14] font-bold hover:underline whitespace-nowrap shrink-0 text-left sm:text-right cursor-pointer"
              >
                Tanya Produk via WhatsApp →
              </button>
            </div>
          </div>
        </section>

        {/* 6 & 7. BAGIAN TRANSFER & TARIK TUNAI + MANDIRI AGEN & PEMBAYARAN TAGIHAN */}
        <section
          id="transfer-agen"
          className="py-14 md:py-20 border-b border-white/10 bg-[#0B0E0C]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            {/* Section Header */}
            <div>
              <p className="text-xs font-medium tracking-wider text-[#39FF14] mb-1.5">
                03. LAYANAN TRANSAKSI KEUANGAN, AGEN BANK RESMI & PPOB DI KONTER
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F3F7F4] tracking-tight">
                Transfer Bank, Tarik Tunai, Mandiri Agen, Agen BRILink & Bayar Tagihan
              </h2>
              <p className="text-sm sm:text-base text-[#A3B3A8] mt-1 max-w-2xl">
                Tidak perlu bingung atau takut salah pencet. Datang ke konter NJR CELL Sukajadi maupun Ciherang, petugas kami siap melayani transaksi perbankan dan tagihan Anda dengan aman.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* 6. Bagian Transfer dan Tarik Tunai */}
              <div className="lg:col-span-6 rounded-2xl bg-[#111613] border border-white/10 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[#17221B] border border-[#39FF14]/30 flex items-center justify-center shrink-0">
                      <Banknote className="w-5 h-5 text-[#39FF14]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#39FF14] font-semibold">
                        LAYANAN KONTER & MINI ATM
                      </p>
                      <h3 className="text-xl font-bold text-[#F3F7F4]">
                        Transfer Bank, Setor & Tarik Tunai
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm text-[#B8C7BD] leading-relaxed mb-5">
                    Melayani pengiriman uang (transfer) ke rekening bank, setor tunai, serta pencairan uang tunai (tarik tunai) dari rekening bank maupun saldo e-wallet Anda.
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="p-3.5 rounded-xl bg-[#161D19] border border-white/10">
                      <p className="text-xs font-bold text-[#F3F7F4]">
                        1. Cara Mudah Tarik Tunai di Konter
                      </p>
                      <p className="text-xs text-[#A3B3A8] mt-1 leading-relaxed">
                        Transfer ke rekening/e-wallet resmi NJR CELL (a.n. AMIR NURJAMAN) atau scan QRIS resmi di konter, lalu tunjukkan bukti transfer kepada petugas untuk mengambil uang tunai.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#161D19] border border-white/10">
                      <p className="text-xs font-bold text-[#F3F7F4]">
                        2. Aturan Dihitung Bersama di Tempat (Transparan)
                      </p>
                      <p className="text-xs text-[#A3B3A8] mt-1 leading-relaxed">
                        Sesuai ketentuan resmi NJR CELL, uang tarik tunai wajib dihitung bersama-sama saat transaksi berlangsung di konter agar sama-sama jelas dan aman.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => openWaWithTopic('tarik-tunai')}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#39FF14] hover:bg-[#2ee00e] text-[#070A08] font-bold text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat WA untuk Transfer / Tarik Tunai</span>
                  </button>
                  <a
                    href="#pembayaran-qris"
                    className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-[#F3F7F4] text-xs sm:text-sm font-semibold border border-white/10 transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Lihat Nomor Rekening Resmi</span>
                  </a>
                </div>
              </div>

              {/* 7. Bagian Mandiri Agen, Agen BRILink dan Pembayaran Tagihan */}
              <div className="lg:col-span-6 rounded-2xl bg-[#111613] border border-white/10 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#17221B] border border-[#39FF14]/30 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-[#39FF14]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#39FF14] font-semibold">
                          MITRA AGEN PERBANKAN RESMI & PPOB
                        </p>
                        <h3 className="text-xl font-bold text-[#F3F7F4]">
                          Mandiri Agen, BRILink & Tagihan
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Highlighted Official BRILink Agent Code Box */}
                  <div className="mb-4 p-3.5 rounded-xl bg-[#142019] border border-[#39FF14]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <p className="text-xs font-bold text-[#39FF14]">
                        TERDAFTAR RESMI SEBAGAI AGEN BRILINK
                      </p>
                      <p className="text-xs sm:text-sm text-[#F3F7F4] mt-0.5">
                        Kode Agen BRILink NJR CELL:{' '}
                        <strong className="font-mono-num text-base text-[#39FF14] tracking-wider">
                          {BRAND_INFO.brilinkAgentCode}
                        </strong>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyAccount('brilink-code', BRAND_INFO.brilinkAgentCode)
                      }
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-[#39FF14] text-[#F3F7F4] hover:text-[#070A08] text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {copiedAccountId === 'brilink-code' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Kode Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Kode Agen</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    <div className="p-3.5 rounded-xl bg-[#161D19] border border-white/10">
                      <p className="text-xs font-bold text-[#39FF14] mb-1">
                        Mandiri Agen & Agen BRILink
                      </p>
                      <p className="text-xs text-[#D1DDD5] leading-relaxed">
                        Setor tunai, tarik tunai, transfer sesama maupun antarbank melalui layanan resmi Mandiri Agen dan BRILink (Kode Agen: 12400836), serta fasilitasi administrasi awal pengajuan pinjaman resmi Bank Mandiri.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#161D19] border border-white/10">
                      <p className="text-xs font-bold text-[#39FF14] mb-1">
                        Tagihan Bulanan (PPOB)
                      </p>
                      <p className="text-xs text-[#D1DDD5] leading-relaxed">
                        Bayar BPJS Kesehatan, tagihan listrik PLN, TV & Internet bulanan, cicilan, hingga pembayaran Gas dengan bukti struk transaksi yang jelas.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => openWaWithTopic('mandiri-agen')}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#39FF14] hover:bg-[#2ee00e] text-[#070A08] font-bold text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Tanya Mandiri Agen / BRILink</span>
                  </button>
                  <a
                    href={BRAND_INFO.buylinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-[#F3F7F4] text-xs sm:text-sm font-semibold border border-white/10 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Receipt className="w-4 h-4 text-[#39FF14]" />
                    <span>Bayar Tagihan via Buylink</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. BAGIAN AKSESORI HP, HYDROGEL, DAN GARSKIN CUSTOM */}
        <section
          id="aksesori-hydrogel"
          className="py-14 md:py-20 border-b border-white/10"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <p className="text-xs font-medium tracking-wider text-[#39FF14] mb-1.5">
                  04. PERLINDUNGAN PERANGKAT & AKSESORI KONTER
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#F3F7F4] tracking-tight">
                  Pelindung Layar Hydrogel, Garskin Custom & Aksesori HP
                </h2>
                <p className="text-sm sm:text-base text-[#A3B3A8] mt-1 max-w-2xl">
                  Lindungi layar dan bodi HP Anda dengan bahan berkualitas yang dipotong presisi sesuai tipe HP, dilengkapi pilihan charger dan kelengkapan seluler di konter.
                </p>
              </div>

              <a
                href={BRAND_INFO.hydrogelCatalogUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#39FF14] hover:bg-[#2ee00e] text-[#070A08] font-bold text-sm transition-colors whitespace-nowrap shrink-0 self-start md:self-auto"
              >
                <span>Buka Katalog Hydrogel Resmi</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Hydrogel */}
              <div className="rounded-2xl bg-[#111613] border border-white/10 p-6 flex flex-col justify-between">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#17221B] border border-[#39FF14]/30 flex items-center justify-center mb-4">
                    <ShieldCheck className="w-5 h-5 text-[#39FF14]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#F3F7F4] mb-2">
                    Pelindung Layar Hydrogel
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A3B3A8] leading-relaxed mb-6">
                    Pelindung layar lentur, responsif terhadap sentuhan jari, dan dipotong sesuai ukuran layar HP Anda. Cocok untuk berbagai merk dan tipe handphone.
                  </p>
                </div>
                <div className="space-y-2.5 pt-4 border-t border-white/10">
                  <a
                    href={BRAND_INFO.hydrogelCatalogUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-[#39FF14] text-[#070A08] font-bold text-xs sm:text-sm hover:bg-[#2ee00e] transition-colors"
                  >
                    <span>Lihat Halaman Produk Hydrogel</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => openWaWithTopic('hydrogel')}
                    className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#F3F7F4] font-semibold text-xs border border-white/10 transition-colors cursor-pointer"
                  >
                    <span>Pesan / Tanya Tipe HP via WA</span>
                    <MessageCircle className="w-4 h-4 text-[#39FF14]" />
                  </button>
                </div>
              </div>

              {/* Card 2: Garskin Custom */}
              <div className="rounded-2xl bg-[#111613] border border-white/10 p-6 flex flex-col justify-between">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#17221B] border border-[#39FF14]/30 flex items-center justify-center mb-4">
                    <Layers className="w-5 h-5 text-[#39FF14]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#F3F7F4] mb-2">
                    Garskin HP Custom
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A3B3A8] leading-relaxed mb-6">
                    Lapisi bodi belakang HP agar terhindar dari jamur dan goresan sekaligus tampil beda. Dipasang langsung dengan rapi oleh petugas konter NJR CELL.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => openWaWithTopic('garskin')}
                    className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-white/5 hover:bg-[#39FF14] text-[#F3F7F4] hover:text-[#070A08] font-bold text-xs sm:text-sm border border-white/10 transition-colors cursor-pointer"
                  >
                    <span>Pesan Garskin via WhatsApp</span>
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card 3: Charger ROBOT/VIVAN & Kartu Perdana */}
              <div className="rounded-2xl bg-[#111613] border border-white/10 p-6 flex flex-col justify-between">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#17221B] border border-[#39FF14]/30 flex items-center justify-center mb-4">
                    <Plug className="w-5 h-5 text-[#39FF14]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#F3F7F4] mb-2">
                    Charger ROBOT/VIVAN & Aksesori
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A3B3A8] leading-relaxed mb-6">
                    Tersedia kepala charger, kabel data merk ROBOT / VIVAN, aksesori pendukung HP, serta kartu perdana dan voucher fisik internet di konter.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => openWaWithTopic('charger')}
                    className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-white/5 hover:bg-[#39FF14] text-[#F3F7F4] hover:text-[#070A08] font-bold text-xs sm:text-sm border border-white/10 transition-colors cursor-pointer"
                  >
                    <span>Tanya Stok Charger / Aksesori</span>
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. BAGIAN PRODUK TAMBAHAN DI KONTER (SIAP LAUNCHING) */}
        <section
          id="produk-tambahan"
          className="py-14 md:py-20 border-b border-white/10 bg-[#0B0E0C]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <p className="text-xs font-medium tracking-wider text-[#39FF14] mb-1.5">
                  05. PRODUK TAMBAHAN DI KONTER FISIK
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#F3F7F4] tracking-tight">
                  Minuman Dingin, Es Krim & Kebutuhan Harian di Konter
                </h2>
                <p className="text-sm sm:text-base text-[#A3B3A8] mt-1 max-w-2xl">
                  Selain layanan digital dan aksesori HP, konter fisik NJR CELL juga menyediakan minuman dingin segar, es krim, serta produk harian pendamping saat Anda berkunjung.
                </p>
              </div>

              <a
                href="#lokasi-outlet"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-[#F3F7F4] font-bold text-sm border border-white/15 transition-colors whitespace-nowrap shrink-0 self-start md:self-auto"
              >
                <MapPin className="w-4 h-4 text-[#39FF14]" />
                <span>Lihat Lokasi Konter</span>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {EXTRA_STORE_PRODUCTS.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-[#111613] border border-white/10 hover:border-[#39FF14]/40 p-6 flex flex-col justify-between transition-colors"
                >
                  <div>
                    {/* Visual Placeholder Header for Store Product */}
                    <div className="h-36 rounded-xl bg-gradient-to-br from-[#16221B] via-[#111814] to-[#0C100E] border border-white/10 flex flex-col items-center justify-center p-4 mb-5 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-[#39FF14]/15 border border-[#39FF14]/35 flex items-center justify-center mb-2">
                        {renderExtraProductIcon(item.iconName)}
                      </div>
                      <span className="text-xs font-medium text-[#A3B3A8]">
                        {item.categoryLabel}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#F3F7F4] mb-2">
                      {item.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#A3B3A8] leading-relaxed mb-4">
                      {item.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <p className="text-xs text-[#39FF14] font-medium">
                      {item.availabilityNote}
                    </p>
                    <button
                      type="button"
                      onClick={() => openWaWithTopic(item.whatsappTopicId)}
                      className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-white/5 hover:bg-[#39FF14] text-[#F3F7F4] hover:text-[#070A08] font-bold text-xs sm:text-sm border border-white/10 transition-colors cursor-pointer"
                    >
                      <span>Tanya Ketersediaan via WA</span>
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 10 & 11. BAGIAN INFORMASI PEMBAYARAN, QRIS TERVERIFIKASI & DAFTAR HARGA */}
        <section
          id="pembayaran-qris"
          className="py-14 md:py-20 border-b border-white/10"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <p className="text-xs font-medium tracking-wider text-[#39FF14] mb-1.5">
                06. REKENING RESMI & QRIS TERVERIFIKASI
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F3F7F4] tracking-tight">
                Informasi Pembayaran, Transfer & Tarik Tunai
              </h2>
              <p className="text-sm sm:text-base text-[#A3B3A8] mt-1 max-w-2xl">
                Untuk kemudahan transaksi atau pengambilan uang tunai di outlet NJR CELL, silakan gunakan nomor rekening, e-wallet, atau QRIS resmi di bawah ini.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left: Verified Bank & E-Wallet Accounts */}
              <div className="lg:col-span-7 rounded-2xl bg-[#111613] border border-white/10 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-white/10">
                    <div>
                      <p className="text-xs text-[#A3B3A8]">
                        Atas Nama Rekening & E-Wallet Resmi:
                      </p>
                      <p className="text-lg sm:text-xl font-extrabold text-[#39FF14] tracking-wide">
                        a.n. AMIR NURJAMAN
                      </p>
                    </div>
                    <span className="text-xs text-[#A3B3A8]">
                      Klik tombol Salin untuk menyalin nomor
                    </span>
                  </div>

                  <div className="space-y-3">
                    {PAYMENT_ACCOUNTS.map((acc) => {
                      const isCopied = copiedAccountId === acc.id;
                      return (
                        <div
                          key={acc.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#161D19] border border-white/10 hover:border-[#39FF14]/40 transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2 text-xs text-[#A3B3A8]">
                              <span className="font-bold text-[#F3F7F4] text-sm">
                                {acc.provider}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{acc.category}</span>
                              <span aria-hidden="true">·</span>
                              <span>a.n. {acc.accountHolder}</span>
                            </div>
                            <p className="font-mono-num text-lg sm:text-xl font-bold text-[#F3F7F4] mt-1 tracking-wider">
                              {acc.displayNumber}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopyAccount(acc.id, acc.rawNumber)}
                            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                              isCopied
                                ? 'bg-[#39FF14] text-[#070A08]'
                                : 'bg-white/10 hover:bg-[#39FF14] text-[#F3F7F4] hover:text-[#070A08]'
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Tersalin!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                <span>Salin Nomor</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Official Security Notice from njrcell.web.id */}
                <div className="mt-6 p-4 rounded-xl bg-[#181612] border border-amber-400/30 space-y-1.5 text-xs sm:text-sm text-[#E5E0D5]">
                  <p className="font-bold text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Peringatan Keamanan Transaksi NJR CELL:</span>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-[#D1DDD5]">
                    <li>Simpan bukti transfer untuk mempercepat proses pengambilan tunai di konter.</li>
                    <li>Nomor rekening resmi NJR CELL hanya yang tercantum di halaman resmi ini (a.n. AMIR NURJAMAN).</li>
                    <li>Abaikan jika ada pihak lain yang mengaku dari NJR CELL dengan nomor rekening berbeda.</li>
                  </ul>
                </div>
              </div>

              {/* Right: Verified QRIS Card */}
              <div className="lg:col-span-5 rounded-2xl bg-[#111613] border border-white/10 p-6 sm:p-8 flex flex-col justify-between items-center text-center">
                <div className="w-full">
                  <p className="text-xs font-semibold text-[#39FF14] mb-1">
                    SCAN & PAY RESMI
                  </p>
                  <h3 className="text-xl font-bold text-[#F3F7F4]">
                    QRIS Resmi NJR CELL
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A3B3A8] mt-1">
                    Mendukung pembayaran dari aplikasi mobile banking dan e-wallet yang mendukung QRIS
                  </p>
                </div>

                <div className="my-6 p-4 rounded-2xl bg-white border-4 border-[#39FF14]/40 shadow-xl max-w-[260px] w-full flex items-center justify-center">
                  {!imgErrors['qris'] ? (
                    <img
                      src={QRIS_INFO.imagePath}
                      alt="Kode QRIS Resmi NJR CELL NMID ID1020035674883"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={() =>
                        setImgErrors((prev) => ({ ...prev, qris: true }))
                      }
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  ) : (
                    <div className="py-12 px-4 text-center text-[#070A08]">
                      <p className="font-bold text-sm">QRIS NJR CELL</p>
                      <p className="font-mono-num text-xs mt-1">
                        NMID: {QRIS_INFO.nmid}
                      </p>
                    </div>
                  )}
                </div>

                <div className="w-full space-y-4">
                  <div className="p-3.5 rounded-xl bg-[#161D19] border border-white/10 text-xs sm:text-sm">
                    <p className="text-[#A3B3A8]">
                      Merchant: <strong className="text-[#F3F7F4]">{QRIS_INFO.merchantName}</strong>
                    </p>
                    <p className="text-[#A3B3A8] mt-0.5 font-mono-num">
                      NMID: <strong className="text-[#39FF14]">{QRIS_INFO.nmid}</strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadQris}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#39FF14] hover:bg-[#2ee00e] text-[#070A08] font-bold text-sm transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Gambar QRIS</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 10. BAGIAN HARGA YANG MENGAMBIL DATA DARI SUMBER RESMI */}
            <div id="daftar-harga" className="mt-12 rounded-2xl bg-[#111613] border border-white/10 p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-5 border-b border-white/10">
                <div>
                  <p className="text-xs font-semibold text-[#39FF14] mb-1">
                    SUMBER HARGA MITRA OTOREPORT
                  </p>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#F3F7F4]">
                    Daftar Harga Produk Digital Live
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A3B3A8] mt-0.5">
                    Data harga di bawah ini diambil langsung dari tautan resmi mitra yang digunakan pada website NJR CELL.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPriceIframeKey((k) => k + 1)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#F3F7F4] border border-white/10 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#39FF14]" />
                    <span>Muat Ulang Tabel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPriceIframe((s) => !s)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#F3F7F4] border border-white/10 transition-colors cursor-pointer"
                  >
                    <span>{showPriceIframe ? 'Sembunyikan Tabel' : 'Tampilkan Tabel'}</span>
                  </button>

                  <a
                    href={BRAND_INFO.livePriceEmbedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#39FF14] text-[#070A08] font-bold text-xs hover:bg-[#2ee00e] transition-colors"
                  >
                    <span>Buka di Tab Baru</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {showPriceIframe && (
                <div className="rounded-xl overflow-hidden border border-white/15 bg-white h-[420px] sm:h-[500px]">
                  <iframe
                    key={priceIframeKey}
                    src={BRAND_INFO.livePriceEmbedUrl}
                    title="Daftar Harga Resmi NJR CELL"
                    loading="lazy"
                    className="w-full h-full border-0"
                  />
                </div>
              )}

              <p className="text-xs text-[#A3B3A8] mt-3">
                * Harga dapat berubah sewaktu-waktu mengikuti ketentuan mitra. Silakan periksa kembali atau tanyakan kepada petugas sebelum bertransaksi.
              </p>
            </div>
          </div>
        </section>

        {/* 12. DUA KARTU OUTLET DENGAN ALAMAT, WHATSAPP, DAN GOOGLE MAPS MASING-MASING */}
        <section
          id="lokasi-outlet"
          className="py-14 md:py-20 border-b border-white/10 bg-[#0B0E0C]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <p className="text-xs font-medium tracking-wider text-[#39FF14] mb-1.5">
                07. DETAIL LENGKAP KEDUA KONTER FISIK NJR CELL
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F3F7F4] tracking-tight">
                Perbandingan Lokasi Outlet Sukajadi & Ciherang
              </h2>
              <p className="text-sm sm:text-base text-[#A3B3A8] mt-1 max-w-2xl">
                Setiap outlet memiliki nomor WhatsApp dan titik Google Maps masing-masing. Pastikan Anda menghubungi outlet yang sesuai dengan lokasi kunjungan Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
              {OUTLETS.map((outlet) => (
                <div
                  key={outlet.id}
                  className="rounded-2xl bg-[#111613] border border-white/10 hover:border-[#39FF14]/40 overflow-hidden flex flex-col justify-between transition-colors"
                >
                  <div>
                    {/* Visual Map Preview Header */}
                    <a
                      href={outlet.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative bg-[#0A0E0C] h-56 sm:h-64 overflow-hidden group border-b border-white/10"
                    >
                      {!imgErrors[outlet.id] ? (
                        <img
                          src={outlet.mapPreviewImage}
                          alt={`Peta Lokasi ${outlet.name}`}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          onError={() =>
                            setImgErrors((prev) => ({ ...prev, [outlet.id]: true }))
                          }
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#121915]">
                          <MapPin className="w-10 h-10 text-[#39FF14] mb-2" />
                          <p className="text-sm font-bold text-[#F3F7F4]">
                            {outlet.name}
                          </p>
                          <p className="text-xs text-[#A3B3A8] mt-1">
                            Klik untuk membuka petunjuk arah di Google Maps
                          </p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex items-end justify-between p-4">
                        <span className="text-xs font-bold text-[#39FF14] tracking-wider">
                          {outlet.code}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#090B0A]/90 text-[#F3F7F4] text-xs font-semibold border border-white/15">
                          <MapPin className="w-3.5 h-3.5 text-[#39FF14]" />
                          Buka Peta
                        </span>
                      </div>
                    </a>

                    {/* Outlet Information */}
                    <div className="p-6 sm:p-8">
                      <p className="text-xs font-medium text-[#A3B3A8] mb-1">
                        {outlet.shortArea}
                      </p>
                      <h3 className="text-2xl font-extrabold text-[#F3F7F4] mb-3">
                        {outlet.name}
                      </h3>

                      <div className="space-y-2.5 text-sm text-[#D1DDD5] mb-5">
                        <p className="leading-relaxed">
                          <strong className="text-[#F3F7F4]">Alamat:</strong>{' '}
                          {outlet.address}
                        </p>
                        <p className="text-xs sm:text-sm text-[#39FF14] font-medium">
                          {outlet.landmarkNote}
                        </p>
                        <p className="text-xs sm:text-sm text-[#A3B3A8]">
                          WhatsApp Khusus Outlet:{' '}
                          <strong className="font-mono-num text-[#F3F7F4]">
                            {outlet.whatsappNumberDisplay}
                          </strong>
                        </p>
                      </div>

                      <div className="pt-4 border-t border-white/10">
                        <p className="text-xs font-semibold text-[#A3B3A8] mb-2">
                          LAYANAN TERSEDIA DI OUTLET INI:
                        </p>
                        <ul className="space-y-1 text-xs text-[#B8C7BD] list-disc list-inside">
                          {outlet.servicesAvailable.map((srv, i) => (
                            <li key={i}>{srv}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Separate Verified Action Buttons for Each Outlet */}
                  <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href={outlet.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-[#39FF14] hover:bg-[#2ee00e] text-[#070A08] font-extrabold text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp {outlet.id === 'sukajadi' ? 'Sukajadi' : 'Ciherang'}</span>
                    </a>

                    <a
                      href={outlet.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#F3F7F4] font-bold text-xs sm:text-sm border border-white/15 transition-colors whitespace-nowrap shrink-0"
                    >
                      <MapPin className="w-4 h-4 text-[#39FF14]" />
                      <span>Google Maps {outlet.id === 'sukajadi' ? 'Sukajadi' : 'Ciherang'}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 13. TAUTAN MEDIA SOSIAL DAN LAYANAN ONLINE */}
        <section
          id="media-sosial"
          className="py-14 md:py-16 border-b border-white/10"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <p className="text-xs font-medium tracking-wider text-[#39FF14] mb-1.5">
                08. KANAL DIGITAL & MEDIA SOSIAL RESMI
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F3F7F4] tracking-tight">
                Tautan Resmi NJR CELL
              </h2>
              <p className="text-sm sm:text-base text-[#A3B3A8] mt-1">
                Ikuti akun resmi kami untuk pembaruan layanan, promo, dan dokumentasi testimoni pelanggan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                href={BRAND_INFO.buylinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 rounded-2xl bg-[#111613] hover:bg-[#161D19] border border-white/10 hover:border-[#39FF14]/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs text-[#39FF14] font-semibold">
                    TRANSAKSI ONLINE 24 JAM
                  </p>
                  <h3 className="text-base font-bold text-[#F3F7F4] mt-1">
                    Buylink NJR CELL
                  </h3>
                  <p className="text-xs text-[#A3B3A8] mt-1 font-mono-num">
                    buylink.id/njrcell
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#39FF14] mt-4">
                  <span>Buka Buylink</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </a>

              <a
                href={BRAND_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 rounded-2xl bg-[#111613] hover:bg-[#161D19] border border-white/10 hover:border-[#39FF14]/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs text-[#39FF14] font-semibold">
                    INSTAGRAM RESMI
                  </p>
                  <h3 className="text-base font-bold text-[#F3F7F4] mt-1">
                    @njrcell88
                  </h3>
                  <p className="text-xs text-[#A3B3A8] mt-1">
                    Info layanan, promo & katalog terbaru
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#39FF14] mt-4">
                  <span>Buka Instagram</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </a>

              <a
                href={BRAND_INFO.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 rounded-2xl bg-[#111613] hover:bg-[#161D19] border border-white/10 hover:border-[#39FF14]/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs text-[#39FF14] font-semibold">
                    TIKTOK RESMI
                  </p>
                  <h3 className="text-base font-bold text-[#F3F7F4] mt-1">
                    @njrcell
                  </h3>
                  <p className="text-xs text-[#A3B3A8] mt-1">
                    Video pemasangan hydrogel, garskin & info konter
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#39FF14] mt-4">
                  <span>Buka TikTok</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </a>

              <a
                href={BRAND_INFO.hydrogelCatalogUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 rounded-2xl bg-[#111613] hover:bg-[#161D19] border border-white/10 hover:border-[#39FF14]/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs text-[#39FF14] font-semibold">
                    MICROSITE PRODUK PELINDUNG
                  </p>
                  <h3 className="text-base font-bold text-[#F3F7F4] mt-1">
                    Katalog Hydrogel NJR CELL
                  </h3>
                  <p className="text-xs text-[#A3B3A8] mt-1">
                    njrcellciherang.my.canva.site/hydrogel
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#39FF14] mt-4">
                  <span>Buka Katalog</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* 14. FAQ SINGKAT */}
        <section id="faq" className="py-14 md:py-20 border-b border-white/10 bg-[#0B0E0C]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <p className="text-xs font-medium tracking-wider text-[#39FF14] mb-1.5">
                09. PERTANYAAN YANG SERING DIAJUKAN (FAQ)
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F3F7F4] tracking-tight">
                Panduan Singkat untuk Pelanggan
              </h2>
              <p className="text-sm sm:text-base text-[#A3B3A8] mt-1">
                Jawaban jelas dan mudah dipahami sebelum Anda bertransaksi online maupun datang ke konter.
              </p>
            </div>

            <div className="space-y-3">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl bg-[#111613] border border-white/10 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <span className="text-sm sm:text-base font-bold text-[#F3F7F4]">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-[#39FF14] shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#B8C7BD] leading-relaxed border-t border-white/5">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 p-5 rounded-2xl bg-[#121815] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-[#39FF14] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[#F3F7F4]">
                    Ingin membaca aturan lengkap transaksi & tarik tunai?
                  </p>
                  <p className="text-xs text-[#A3B3A8] mt-0.5">
                    Baca dokumen resmi Syarat & Ketentuan NJR CELL (10 Pasal) dari website utama.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTermsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-[#39FF14] text-[#F3F7F4] hover:text-[#070A08] font-bold text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Baca Syarat & Ketentuan</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* 15. FOOTER, INFORMASI BISNIS, DAN TAUTAN SYARAT/KETENTUAN */}
      <footer className="bg-[#070908] border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-white/10">
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-3">
                {!imgErrors['footer-logo'] && (
                  <img
                    src={BRAND_INFO.logoPath}
                    alt="Logo NJR CELL"
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setImgErrors((prev) => ({ ...prev, 'footer-logo': true }))
                    }
                    className="w-10 h-10 rounded-xl object-contain bg-[#111613] p-1 border border-white/10"
                  />
                )}
                <span className="text-lg font-extrabold text-[#F3F7F4] tracking-tight">
                  NJR CELL
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#A3B3A8] leading-relaxed max-w-md">
                Melayani transaksi digital 24 jam, Mandiri Agen, Agen BRILink Resmi (Kode Agen: 12400836), transfer bank, tarik tunai, pulsa, paket data, token PLN, pembayaran tagihan PPOB, pelindung layar hydrogel, garskin, hingga minuman dingin & es krim di Kabupaten Ciamis.
              </p>
              <div className="text-xs text-[#A3B3A8] pt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>Rekening Resmi a.n. AMIR NURJAMAN</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-num">BRILink: 12400836</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-num">QRIS NMID: ID1020035674883</span>
              </div>
            </div>

            <div className="md:col-span-4 space-y-2 text-xs sm:text-sm">
              <p className="font-bold text-[#F3F7F4] mb-2">Lokasi Konter Resmi</p>
              <p className="text-[#A3B3A8]">
                <strong className="text-[#D1DDD5]">1. NJR CELL Sukajadi:</strong>{' '}
                Desa Sukajadi RT 006 RW 002, Kec. Pamarican, Kab. Ciamis (Sekitar MAN 4 Ciamis) — WA:{' '}
                <span className="font-mono-num text-[#39FF14]">0853-2000-0303</span>
              </p>
              <p className="text-[#A3B3A8] pt-1">
                <strong className="text-[#D1DDD5]">2. NJR CELL Ciherang:</strong>{' '}
                Jl. Pangandaran No. 84, RT 05 RW 01, Desa Ciherang, Kec. Banjarsari, Kab. Ciamis (Dekat SD 1 Ciherang) — WA:{' '}
                <span className="font-mono-num text-[#39FF14]">0831-2000-0303</span>
              </p>
            </div>

            <div className="md:col-span-3 space-y-2.5 text-xs sm:text-sm">
              <p className="font-bold text-[#F3F7F4] mb-2">Tautan & Ketentuan</p>
              <ul className="space-y-2 text-[#A3B3A8]">
                <li>
                  <button
                    type="button"
                    onClick={() => setTermsModalOpen(true)}
                    className="hover:text-[#39FF14] transition-colors cursor-pointer"
                  >
                    Syarat & Ketentuan Resmi
                  </button>
                </li>
                <li>
                  <a
                    href={BRAND_INFO.buylinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#39FF14] transition-colors"
                  >
                    Portal Buylink 24 Jam
                  </a>
                </li>
                <li>
                  <a
                    href={BRAND_INFO.hydrogelCatalogUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#39FF14] transition-colors"
                  >
                    Katalog Pelindung HP (Hydrogel)
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setAuditModalOpen(true)}
                    className="text-[#39FF14] hover:underline font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    <span>Laporan Audit & Verifikasi</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setAdminModalOpen(true)}
                    className="text-[#A3B3A8] hover:text-[#39FF14] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span>Kelola Slideshow (Admin CMS)</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A3B3A8]">
            <p>© {new Date().getFullYear()} NJR CELL — Seluruh Hak Dilindungi.</p>
            <p>
              NJR CELL Sukajadi (Pamarican) · NJR CELL Ciherang (Banjarsari)
            </p>
          </div>
        </div>
      </footer>

      {/* Interactive Modals */}
      <WhatsAppSelectorModal
        isOpen={waModalOpen}
        onClose={() => setWaModalOpen(false)}
        initialTopic={waModalTopic}
      />

      <TermsModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
      />

      <AuditModal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
      />

      {/* Floating Auto-Chat & WhatsApp Transaction Router */}
      <AutoChatWidget />
    </div>
  );
}
