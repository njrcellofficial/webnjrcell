import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  MapPin,
  Phone,
  MessageCircle,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  CreditCard,
  Smartphone,
  Zap,
  Sparkles,
  QrCode,
  Download,
  Maximize2,
  ArrowUpRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Send,
  Landmark,
  Wallet,
  Banknote,
  Receipt,
  Gamepad2,
  Wifi,
  Layers,
  Shield,
  IceCreamCone,
  CupSoda,
  SlidersHorizontal,
  X,
  Plus,
  ArrowUp,
  Terminal,
  Building2,
  Ticket,
  FileText,
  Plug,
  PackageCheck,
  Map,
} from 'lucide-react';
import {
  BRAND_INFO,
  OUTLETS,
  SERVICE_CATEGORIES,
  SERVICE_CATALOG_ITEMS,
  PAYMENT_ACCOUNTS,
  QRIS_INFO,
  FAQ_ITEMS,
  ServiceCategoryId,
  ServiceCatalogItem,
} from './data/njrCellData';
import { WhatsAppSelectorModal, TermsModal, AuditModal } from './components/Modals';
import { AutoChatWidget } from './components/AutoChatWidget';
import { PromoSlideshow } from './components/PromoSlideshow';
import { QuickSearchModal } from './components/QuickSearchModal';

const CATEGORY_ACCENTS: Record<ServiceCategoryId, string> = {
  keuangan: '#39FF14',
  digital: '#00F5A0',
  pembayaran: '#5BFF3D',
  aksesori: '#8AFF70',
  'kebutuhan-harian': '#A8FF52',
};

const ROTATING_WORDS = ['TEMPAT.', 'SOLUSI.', 'LAYANAN.', 'AKSES.'];

// Featured 9 services for the default 3x3 board (matching ojailbreaks.com 9-tile initial grid)
const FEATURED_SERVICE_IDS = [
  'fin-transfer-bank',
  'fin-tarik-tunai',
  'fin-perbankan-brilink',
  'fin-mandiri-agen',
  'dig-pulsa',
  'dig-paket-data',
  'dig-token-listrik',
  'dig-topup-game',
  'acc-hydrogel',
];

const OUTLET_EMBED_URLS: Record<string, string> = {
  sukajadi:
    'https://maps.google.com/maps?q=MAN+4+Ciamis+Sukajadi+Pamarican+Ciamis&t=&z=15&ie=UTF8&iwloc=&output=embed',
  ciherang:
    'https://maps.google.com/maps?q=SDN+1+Ciherang+Jl.+Pangandaran+No.+84+Banjarsari+Ciamis&t=&z=15&ie=UTF8&iwloc=&output=embed',
};

export function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [copiedTree, setCopiedTree] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [rotatorIndex, setRotatorIndex] = useState(0);

  // Modals & Drawers
  const [qrisLightboxOpen, setQrisLightboxOpen] = useState(false);
  const [activePackItem, setActivePackItem] = useState<ServiceCatalogItem | null>(null);
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [waModalTopic, setWaModalTopic] = useState<string>('umum');
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [adminSlideshowOpen, setAdminSlideshowOpen] = useState(false);
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);

  // Interactive Service Library Filters
  const [activeCategory, setActiveCategory] = useState<'all' | ServiceCategoryId>('all');
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [showAllServicesInHero, setShowAllServicesInHero] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Per-outlet map view mode ('pin' = official pin screenshot image, 'live' = interactive Google Maps iframe)
  const [outletMapModes, setOutletMapModes] = useState<Record<string, 'pin' | 'live'>>({
    sukajadi: 'pin',
    ciherang: 'pin',
  });

  // Hero word rotator
  useEffect(() => {
    const interval = setInterval(() => {
      setRotatorIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  // Scroll listener for floating header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 18);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global keyboard shortcuts: Ctrl+K / Cmd+K for Command Palette, '/' for library search, Esc for closing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setQuickSearchOpen((prev) => !prev);
        return;
      }
      const tag = (e.target as HTMLElement)?.tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      if (e.key === '/' && !isTyping && !quickSearchOpen && !activePackItem) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (e.key === 'Escape') {
        if (activePackItem) setActivePackItem(null);
        if (mobileMenuOpen) setMobileMenuOpen(false);
        if (qrisLightboxOpen) setQrisLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickSearchOpen, activePackItem, mobileMenuOpen, qrisLightboxOpen]);

  // Lock body scroll when mobile menu or pack page is open
  useEffect(() => {
    if (mobileMenuOpen || activePackItem) {
      document.documentElement.classList.add('page-open');
    } else {
      document.documentElement.classList.remove('page-open');
    }
  }, [mobileMenuOpen, activePackItem]);

  const handleCopyAccount = (rawNumber: string, id: string) => {
    navigator.clipboard.writeText(rawNumber);
    setCopiedAccount(id);
    setTimeout(() => setCopiedAccount(null), 2200);
  };

  const handleCopyAllAccounts = () => {
    const lines = [
      'DAFTAR REKENING & E-WALLET RESMI NJR CELL',
      ...PAYMENT_ACCOUNTS.map(
        (acc) => `• ${acc.provider}: ${acc.rawNumber} (a.n. ${acc.accountHolder})`
      ),
      `• QRIS Resmi: ${QRIS_INFO.merchantName} (NMID: ${QRIS_INFO.nmid})`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedAccount('all-accounts');
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const jumpToAllAccounts = (targetId = 'rekening-resmi') => {
    setMobileMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(targetId) || document.getElementById('tentang-kami');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 40);
  };

  const openWaWithTopic = (topicId = 'umum') => {
    setWaModalTopic(topicId);
    setWaModalOpen(true);
  };

  const filteredCatalogItems = useMemo(() => {
    const q = serviceSearchQuery.trim().toLowerCase();
    return SERVICE_CATALOG_ITEMS.filter((item) => {
      const matchesCat = activeCategory === 'all' || item.categoryId === activeCategory;
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.keywords.some((kw) => kw.toLowerCase().includes(q))
      );
    });
  }, [activeCategory, serviceSearchQuery]);

  // Displayed items in the 3-column grid:
  // When "Semua" is selected and no search query is typed, show 9 featured items (3x3 grid) unless expanded,
  // so there is zero height mismatch / empty space on the left column!
  const displayedCatalogItems = useMemo(() => {
    if (activeCategory === 'all' && !serviceSearchQuery.trim() && !showAllServicesInHero) {
      const featured = FEATURED_SERVICE_IDS.map((id) =>
        SERVICE_CATALOG_ITEMS.find((item) => item.id === id)
      ).filter((item): item is ServiceCatalogItem => Boolean(item));
      return featured.length === 9 ? featured : filteredCatalogItems.slice(0, 9);
    }
    return filteredCatalogItems;
  }, [activeCategory, serviceSearchQuery, showAllServicesInHero, filteredCatalogItems]);

  const remainderSlots = displayedCatalogItems.length % 3;
  const fillerSpan = remainderSlots === 0 ? 0 : 3 - remainderSlots;

  const renderServiceIcon = (iconName: ServiceCatalogItem['iconName'], className = 'w-6 h-6') => {
    switch (iconName) {
      case 'Banknote':
        return <Banknote className={className} />;
      case 'Wallet':
        return <Wallet className={className} />;
      case 'Building2':
        return <Building2 className={className} />;
      case 'Landmark':
        return <Landmark className={className} />;
      case 'CreditCard':
        return <CreditCard className={className} />;
      case 'Smartphone':
      case 'SimCard':
        return <Smartphone className={className} />;
      case 'Wifi':
        return <Wifi className={className} />;
      case 'Ticket':
        return <Ticket className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'Gamepad2':
        return <Gamepad2 className={className} />;
      case 'Receipt':
        return <Receipt className={className} />;
      case 'FileText':
        return <FileText className={className} />;
      case 'ShieldCheck':
        return <ShieldCheck className={className} />;
      case 'Plug':
        return <Plug className={className} />;
      case 'Layers':
        return <Layers className={className} />;
      case 'IceCreamCone':
        return <IceCreamCone className={className} />;
      case 'CupSoda':
        return <CupSoda className={className} />;
      case 'PackageCheck':
        return <PackageCheck className={className} />;
      default:
        return <Shield className={className} />;
    }
  };

  const openServicePackPage = (item: ServiceCatalogItem) => {
    setActivePackItem(item);
  };

  const navigatePackItem = (direction: 'prev' | 'next') => {
    if (!activePackItem) return;
    const idx = SERVICE_CATALOG_ITEMS.findIndex((i) => i.id === activePackItem.id);
    if (idx === -1) return;
    const nextIdx =
      direction === 'next'
        ? (idx + 1) % SERVICE_CATALOG_ITEMS.length
        : (idx - 1 + SERVICE_CATALOG_ITEMS.length) % SERVICE_CATALOG_ITEMS.length;
    setActivePackItem(SERVICE_CATALOG_ITEMS[nextIdx]);
  };

  const handleJumpToSection = (sectionId: string, categoryFilter?: 'all' | ServiceCategoryId) => {
    if (categoryFilter) {
      setActiveCategory(categoryFilter);
    }
    if (sectionId === 'hubungi-wa') {
      openWaWithTopic('umum');
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { num: '01', label: 'Beranda', href: '#beranda' },
    { num: '02', label: 'Layanan', href: '#layanan' },
    { num: '03', label: 'Promo', href: '#promo' },
    { num: '04', label: 'Tentang Kami', href: '#tentang-kami' },
    { num: '05', label: 'Lokasi', href: '#lokasi-outlet' },
    { num: '06', label: 'FAQ', href: '#faq' },
    { num: '07', label: 'Hubungi Kami', href: '#hubungi-kami' },
  ];

  const activePackIndex = activePackItem
    ? SERVICE_CATALOG_ITEMS.findIndex((i) => i.id === activePackItem.id)
    : -1;

  const siblingPackItems = useMemo(() => {
    if (!activePackItem) return [];
    return SERVICE_CATALOG_ITEMS.filter((i) => i.categoryId === activePackItem.categoryId);
  }, [activePackItem]);

  return (
    <div className="min-h-screen bg-[#040705] text-[#F3F7F4] flex flex-col selection:bg-[#39FF14]/25 selection:text-[#39FF14] relative">
      {/* Ambient Grid Layer */}
      <div className="fixed inset-0 hub-grid-bg pointer-events-none z-0 opacity-65" />

      {/* =====================================================================
          HEADER (OJAILBREAKS.COM EXACT TOP BAR + MOBILE TOGGLE STRUCTURE)
      ===================================================================== */}
      <header className={`ojb-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="ojb-header-inner">
          {/* Brand + Live Online Indicator */}
          <a
            href="#beranda"
            onClick={() => setMobileMenuOpen(false)}
            className="inline-flex items-center gap-3 group focus:outline-none"
          >
            <div className="relative w-10 h-10 rounded-full bg-[#0A130D] border border-[#39FF14]/35 flex items-center justify-center p-1 shadow-[0_0_18px_rgba(57,255,20,0.2)] group-hover:border-[#39FF14] transition-all shrink-0">
              <img
                src="/assets/aistudio/Logo_NJR_CELL_Neon_Hijau_4282a177.png"
                alt="Logo NJR CELL"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = BRAND_INFO.logoPath;
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[15px] sm:text-base tracking-tight text-white leading-none flex items-center gap-0.5 whitespace-nowrap">
                NJR <span className="text-[#39FF14]">CELL</span>
                <span className="text-[#39FF14]">.</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-[#8EA394] mt-1 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] shadow-[0_0_8px_#39FF14] animate-pulse" />
                <b className="font-mono-num text-[#C5D4C9] font-semibold">2 Cabang</b> Online
              </span>
            </div>
          </a>

          {/* Desktop Centered Pill Nav (Hidden on <=1140px like ojailbreaks.com) */}
          <nav className="ojb-site-nav" aria-label="Navigasi Utama">
            {navLinks.slice(0, 6).map((link) => (
              <a key={link.label} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Header Actions */}
          <div className="ojb-header-actions">
            {/* Quick Find Button (Visible on Desktop & Mobile Header) */}
            <button
              type="button"
              onClick={() => setQuickSearchOpen(true)}
              className="ojb-quick-btn cursor-pointer"
              aria-label="Cari Layanan Cepat (Ctrl + K)"
            >
              <Search className="w-4 h-4 text-[#39FF14] shrink-0" />
              <span className="sm:hidden font-semibold text-white">Cari</span>
              <span className="hidden sm:inline">Cari layanan</span>
              <kbd className="ojb-kbd">Ctrl K</kbd>
            </button>

            {/* Admin CMS Button (Desktop) */}
            <button
              type="button"
              onClick={() => setAdminSlideshowOpen(true)}
              className="ojb-admin-top-btn w-11 h-11 rounded-[12px] border border-[#8CFF98]/15 bg-white/[0.02] hover:bg-[#39FF14]/10 hover:border-[#39FF14]/40 flex items-center justify-center text-[#8EA394] hover:text-[#39FF14] transition-all cursor-pointer"
              title="Panel Admin CMS"
              aria-label="Panel Admin CMS"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Primary WhatsApp Header CTA */}
            <button
              type="button"
              onClick={() => openWaWithTopic('umum')}
              className="ojb-wa-cta cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>
                WhatsApp<span className="ojb-wa-long"> Resmi</span>
              </span>
            </button>

            {/* Two-Line Animated Mobile Menu Toggle (ojailbreaks.com exact toggle) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-controls="ojb-mobile-menu"
              aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
              className="ojb-menu-toggle cursor-pointer"
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================================
          FULL-SCREEN CLIP-PATH MOBILE MENU (OJAILBREAKS.COM EXACT OVERLAY)
      ===================================================================== */}
      <div
        id="ojb-mobile-menu"
        className={`ojb-mobile-menu ${mobileMenuOpen ? 'is-open' : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <nav className="ojb-mobile-nav" aria-label="Navigasi Mobile">
          {navLinks.map((link, idx) => (
            <a
              key={link.label}
              href={link.href}
              style={{ ['--i' as string]: idx }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <small>{link.num}</small>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ojb-mobile-foot" style={{ ['--i' as string]: navLinks.length }}>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              openWaWithTopic('umum');
            }}
            className="ojb-btn ojb-btn-primary w-full cursor-pointer"
          >
            <span>Hubungi via WhatsApp</span>
            <span className="ojb-btn-icon">
              <MessageCircle className="w-4 h-4" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setQuickSearchOpen(true);
            }}
            className="ojb-btn ojb-btn-ghost w-full cursor-pointer"
          >
            <span>Pencarian Cepat (Quick find)</span>
            <span className="ojb-btn-icon">
              <Search className="w-4 h-4" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setAdminSlideshowOpen(true);
            }}
            className="ojb-btn ojb-btn-ghost w-full cursor-pointer"
          >
            <span>Panel Admin CMS &amp; Laporan Audit</span>
            <span className="ojb-btn-icon">
              <SlidersHorizontal className="w-4 h-4" />
            </span>
          </button>

          <p className="text-xs text-[#687D6F] pt-1">
            NJR CELL — Semua kebutuhan digital. Satu tempat.
          </p>
        </div>
      </div>

      {/* =====================================================================
          MAIN CONTENT
      ===================================================================== */}
      <main id="top" className="flex-grow relative z-10">
        {/* ===================================================================
            FIRST SCREEN: HERO INTRO + INTERACTIVE SERVICE BOARD (.ojb-lib-hero)
            (Balanced height on desktop & mobile with zero empty gaps!)
        =================================================================== */}
        <section id="beranda" className="ojb-lib-hero" aria-labelledby="hero-title">
          <div className="ojb-lib-glow" aria-hidden="true" />

          {/* LEFT / TOP COLUMN: HERO INTRO + QUICK HUB STATUS CARD */}
          <div className="ojb-lib-intro">
            <h1
              id="hero-title"
              className="ojb-hero-title"
              aria-label="Semua kebutuhan digital. Satu tempat."
            >
              <span className="ojb-hl">SEMUA KEBUTUHAN</span>
              <span className="ojb-hl">DIGITAL.</span>
              <span className="ojb-hl">
                SATU{' '}
                <span className="ojb-rotator" key={ROTATING_WORDS[rotatorIndex]}>
                  {ROTATING_WORDS[rotatorIndex]}
                </span>
              </span>
            </h1>

            <p className="ojb-hero-description">
              Solusi transaksi keuangan, pembayaran digital, internet, aksesoris dan kebutuhan harian Anda. Lebih dekat, mudah dan praktis bersama NJR CELL.
            </p>

            {/* Mobile & Tablet Search Bar right in Hero so HP users immediately see Search without scrolling */}
            <div className="xl:hidden mb-3.5">
              <button
                type="button"
                onClick={() => setQuickSearchOpen(true)}
                className="ojb-search w-full text-left cursor-pointer"
                aria-label="Cari layanan NJR CELL"
              >
                <Search className="w-5 h-5 text-[#39FF14] shrink-0" />
                <span className="flex-1 text-xs sm:text-sm text-[#A3B8A9] truncate">
                  Cari layanan (transfer, kuota, token, QRIS)…
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#39FF14]/15 border border-[#39FF14]/35 text-[11px] font-bold text-[#39FF14] shrink-0">
                  Cari
                </span>
              </button>
            </div>

            {/* 2x2 Balanced CTA Grid — Zero uneven wrapping or empty gaps */}
            <div className="ojb-lib-cta">
              <a href="#layanan" className="ojb-btn ojb-btn-primary">
                <span className="truncate">Jelajahi Layanan</span>
                <span className="ojb-btn-icon">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </a>

              <button
                type="button"
                onClick={() => jumpToAllAccounts('rekening-resmi')}
                className="ojb-btn ojb-btn-ghost cursor-pointer"
              >
                <span className="truncate">Semua Rekening</span>
                <span className="ojb-btn-icon">
                  <Landmark className="w-4 h-4 text-[#39FF14]" />
                </span>
              </button>

              <button
                type="button"
                onClick={handleCopyAllAccounts}
                className="ojb-btn ojb-btn-ghost cursor-pointer"
              >
                <span className="truncate">
                  {copiedAccount === 'all-accounts' ? 'Semua Tersalin!' : 'Copy Rekening'}
                </span>
                <span className="ojb-btn-icon">
                  {copiedAccount === 'all-accounts' ? (
                    <Check className="w-4 h-4 text-[#39FF14]" />
                  ) : (
                    <Copy className="w-4 h-4 text-[#39FF14]" />
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={() => openWaWithTopic('umum')}
                className="ojb-btn ojb-btn-ghost cursor-pointer"
              >
                <span className="truncate">Hubungi Kami</span>
                <span className="ojb-btn-icon">
                  <MessageCircle className="w-4 h-4" />
                </span>
              </button>
            </div>

            <div className="ojb-lib-note">
              <ShieldCheck className="w-4 h-4 text-[#39FF14] shrink-0 mt-0.5" />
              <span>
                Terdaftar resmi <b>Agen Mandiri (Kode: {BRAND_INFO.mandiriAgentCode})</b> &amp; <b>BRILink (Kode: {BRAND_INFO.brilinkAgentCode})</b> · <b>{BRAND_INFO.atmNetwork}</b> · Ketuk kartu untuk detail.
              </span>
            </div>

            {/* Quick Digital Hub Status Panel */}
            <div className="mt-4 p-4 rounded-2xl glass-surface border border-white/[0.09] space-y-3">
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/[0.07]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src="/assets/aistudio/Logo_NJR_CELL_Neon_Hijau_4282a177.png"
                    alt="NJR CELL"
                    className="w-8 h-8 object-contain shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block leading-tight truncate">
                      Pusat Transaksi Resmi NJR CELL
                    </span>
                    <span className="text-[11px] text-[#8EA394] block truncate">
                      Pamarican &amp; Banjarsari, Kab. Ciamis
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => jumpToAllAccounts('rekening-resmi')}
                    className="px-2.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-[#39FF14]/20 border border-white/10 hover:border-[#39FF14]/40 text-white hover:text-[#39FF14] text-[11px] font-bold inline-flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Landmark className="w-3.5 h-3.5 text-[#39FF14]" />
                    <span>Rekening</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQrisLightboxOpen(true)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#39FF14]/15 hover:bg-[#39FF14] text-[#39FF14] hover:text-[#041006] text-[11px] font-bold inline-flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>QRIS</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <button
                  type="button"
                  onClick={() => jumpToAllAccounts('keagenan-resmi')}
                  className="p-2 rounded-xl bg-black/35 border border-white/[0.06] hover:border-[#39FF14]/40 transition-all cursor-pointer text-center"
                >
                  <span className="text-[10px] text-[#8EA394] block">Agen Mandiri</span>
                  <span className="font-mono-num text-xs font-bold text-[#39FF14] mt-0.5 block">
                    {BRAND_INFO.mandiriAgentCode}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => jumpToAllAccounts('keagenan-resmi')}
                  className="p-2 rounded-xl bg-black/35 border border-white/[0.06] hover:border-[#39FF14]/40 transition-all cursor-pointer text-center"
                >
                  <span className="text-[10px] text-[#8EA394] block">Agen BRILink</span>
                  <span className="font-mono-num text-xs font-bold text-[#39FF14] mt-0.5 block">
                    {BRAND_INFO.brilinkAgentCode}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => jumpToAllAccounts('keagenan-resmi')}
                  className="p-2 rounded-xl bg-black/35 border border-white/[0.06] hover:border-[#39FF14]/40 transition-all cursor-pointer text-center"
                >
                  <span className="text-[10px] text-[#8EA394] block">Jaringan ATM</span>
                  <span className="text-xs font-bold text-[#9EFF8A] mt-0.5 block">
                    BERSAMA · 24J
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT / BOTTOM COLUMN: SERVICE LIBRARY BOARD (3-column square tile grid) */}
          <div id="layanan" className="ojb-lib-board">
            <div className="ojb-lib-tools">
              {/* Real-time Search Box */}
              <label className="ojb-search" htmlFor="service-board-search">
                <Search className="w-5 h-5 text-[#9EFF8A] shrink-0" />
                <input
                  ref={searchInputRef}
                  id="service-board-search"
                  type="search"
                  value={serviceSearchQuery}
                  onChange={(e) => setServiceSearchQuery(e.target.value)}
                  placeholder="Cari layanan (transfer, kuota, token, garskin)…"
                  aria-label="Cari layanan NJR CELL"
                  autoComplete="off"
                  spellCheck={false}
                />
                {serviceSearchQuery ? (
                  <button
                    type="button"
                    onClick={() => setServiceSearchQuery('')}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                    aria-label="Hapus pencarian"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="ojb-kbd">/</kbd>
                )}
              </label>

              {/* Segmented Category Filter */}
              <div className="ojb-segment" role="group" aria-label="Filter kategori layanan">
                <button
                  type="button"
                  aria-pressed={activeCategory === 'all'}
                  onClick={() => setActiveCategory('all')}
                  className="cursor-pointer"
                >
                  Semua
                  <span className="cnt">{SERVICE_CATALOG_ITEMS.length}</span>
                </button>
                {SERVICE_CATEGORIES.map((cat) => {
                  const count = SERVICE_CATALOG_ITEMS.filter((i) => i.categoryId === cat.id).length;
                  const shortLabel =
                    cat.id === 'kebutuhan-harian'
                      ? 'Harian'
                      : cat.id === 'pembayaran'
                        ? 'Bayar'
                        : cat.shortTitle;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      aria-pressed={activeCategory === cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className="cursor-pointer"
                    >
                      {shortLabel}
                      <span className="cnt">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Board Header: Result count + Quick link */}
            <div className="ojb-lib-board-head">
              <span className="ojb-result-count" role="status">
                Menampilkan <b>{displayedCatalogItems.length}</b> dari{' '}
                <b>{filteredCatalogItems.length}</b> layanan
              </span>
              <a href="#tentang-kami" className="ojb-lib-how">
                Cara transaksi &amp; rekening
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* 3-COLUMN SQUARE TILE GRID (.ojb-pack-grid — Always 3 columns with zero empty cells!) */}
            {displayedCatalogItems.length > 0 ? (
              <>
                <div className="ojb-pack-grid">
                  {displayedCatalogItems.map((item) => {
                    const accent = CATEGORY_ACCENTS[item.categoryId] || '#39FF14';
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => openServicePackPage(item)}
                        className="ojb-card"
                        style={{ ['--accent' as string]: accent }}
                      >
                        <span className="ojb-card-glow" aria-hidden="true" />
                        <span className="ojb-card-holo" aria-hidden="true">
                          {renderServiceIcon(item.iconName, 'w-full h-full')}
                        </span>

                        <div className="ojb-card-top">
                          <span className="ojb-card-logo" aria-hidden="true">
                            {renderServiceIcon(item.iconName, 'w-5 h-5 sm:w-6 sm:h-6')}
                          </span>
                          <span className="ojb-status">
                            <i />
                            {item.categoryLabel}
                          </span>
                        </div>

                        <div className="ojb-card-body">
                          <div className="ojb-card-name">{item.title}</div>
                          <div className="ojb-card-meta">{item.availability}</div>
                        </div>

                        <span className="ojb-card-go" aria-hidden="true">
                          <ArrowUpRight className="w-4 h-4" />
                        </span>
                      </button>
                    );
                  })}

                  {/* Automatic Grid-Completer Tile when search results are not divisible by 3 (prevents any empty grid hole!) */}
                  {fillerSpan > 0 && (
                    <button
                      type="button"
                      onClick={() => openWaWithTopic('umum')}
                      className="ojb-card"
                      style={{
                        ['--accent' as string]: '#39FF14',
                        gridColumn: `span ${fillerSpan}`,
                      }}
                    >
                      <span className="ojb-card-glow" aria-hidden="true" />
                      <div className="ojb-card-top">
                        <span className="ojb-card-logo" aria-hidden="true">
                          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                        </span>
                        <span className="ojb-status">
                          <i />
                          Bantuan Cepat
                        </span>
                      </div>
                      <div className="ojb-card-body">
                        <div className="ojb-card-name">Tanya Layanan Lain via WA</div>
                        <div className="ojb-card-meta">
                          Hubungi Admin NJR CELL langsung untuk bantuan transaksi
                        </div>
                      </div>
                      <span className="ojb-card-go" aria-hidden="true">
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </button>
                  )}
                </div>

                {/* Expand / Collapse All 27 Services Bar when in 'all' view */}
                {activeCategory === 'all' && !serviceSearchQuery.trim() && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setShowAllServicesInHero((prev) => !prev)}
                      className="w-full py-3 px-4 rounded-2xl border border-[#8CFF98]/20 bg-[#08110B]/85 hover:border-[#39FF14]/50 hover:bg-[#39FF14]/10 text-xs sm:text-sm font-bold text-[#C5D4C9] hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {showAllServicesInHero ? (
                        <>
                          <ChevronUp className="w-4 h-4 text-[#39FF14]" />
                          <span>Ringkas ke 9 Layanan Utama</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 text-[#39FF14]" />
                          <span>
                            Lihat Seluruh Katalog Lengkap ({SERVICE_CATALOG_ITEMS.length} Layanan · Semua Kategori)
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-10 rounded-[22px] border border-dashed border-[#8CFF98]/20 bg-[#080F0B]/70 text-center">
                <div className="w-12 h-12 rounded-full border border-[#8CFF98]/20 flex items-center justify-center mx-auto mb-3 text-[#39FF14]">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Layanan tidak ditemukan</h3>
                <p className="text-sm text-[#8EA394] mb-4">
                  Coba kata kunci lain atau tampilkan seluruh kategori layanan.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('all');
                    setServiceSearchQuery('');
                  }}
                  className="ojb-btn ojb-btn-ghost !h-10 !px-4 text-xs cursor-pointer"
                >
                  <span>Reset Filter</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ===================================================================
            6-CARD SYMMETRICAL CATEGORY OVERVIEW GRID (3x2 on Desktop, 2x3 on Tablet)
            (Zero empty slots on any screen size!)
        =================================================================== */}
        <section className="max-w-[1360px] mx-auto px-[clamp(18px,4.2vw,56px)] pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
            <div>
              <span className="ojb-eyebrow !mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#39FF14]" />
                Katalog Berdasarkan Kategori
              </span>
              <h2 className="font-display-ojb text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
                5 KATEGORI LAYANAN + PORTAL 24 JAM.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#8EA394]">
              Ketuk salah satu kategori untuk memfilter katalog atau membuka halaman detail layanan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {SERVICE_CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat.id;
              const catItems = SERVICE_CATALOG_ITEMS.filter((i) => i.categoryId === cat.id);
              const firstService = catItems[0];
              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(isSelected ? 'all' : cat.id);
                    document.getElementById('layanan')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`group rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#39FF14]/[0.1] border-[#39FF14] shadow-[0_0_25px_rgba(57,255,20,0.16)]'
                      : 'glass-surface border-white/[0.08] hover:border-[#39FF14]/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/10 text-[11px] font-mono-num font-bold text-[#39FF14]">
                        {cat.code}
                      </span>
                      <span className="text-xs font-mono-num text-[#8EA394]">
                        {catItems.length} layanan
                      </span>
                    </div>
                    <h3 className="font-display-ojb text-2xl sm:text-3xl font-black uppercase text-white tracking-wide group-hover:text-[#39FF14] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#8EA394] mt-1.5 leading-relaxed">
                      {cat.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {cat.highlights.map((hl) => (
                        <span
                          key={hl}
                          className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.07] text-[11px] text-[#C5D4C9]"
                        >
                          {hl}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (firstService) openServicePackPage(firstService);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#39FF14] hover:underline cursor-pointer"
                    >
                      <span>Lihat Layanan</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] text-[#687D6F]">
                      {isSelected ? 'Filter Aktif ✓' : 'Ketuk untuk Filter'}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* 6th Symmetrical Card: Portal Transaksi Online 24 Jam & Bantuan Cepat */}
            <div className="rounded-2xl p-5 border border-[#39FF14]/30 bg-gradient-to-br from-[#0D1E13]/90 to-[#060B08]/95 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-md bg-[#39FF14]/15 border border-[#39FF14]/30 text-[11px] font-mono-num font-bold text-[#39FF14]">
                    ONLINE 24 JAM &amp; KONTER
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-mono-num text-[#9EFF8A]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
                    Aktif
                  </span>
                </div>
                <h3 className="font-display-ojb text-2xl sm:text-3xl font-black uppercase text-white tracking-wide">
                  Transaksi Mandiri &amp; Bantuan WA
                </h3>
                <p className="text-xs sm:text-sm text-[#8EA394] mt-1.5 leading-relaxed">
                  Belanja pulsa, paket data, token PLN, dan top-up game otomatis 24 jam via Buylink, atau hubungi Admin WhatsApp untuk bantuan langsung.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.07] text-[11px] text-[#C5D4C9]">
                    Buylink 24 Jam
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.07] text-[11px] text-[#C5D4C9]">
                    Katalog Hydrogel
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.07] text-[11px] text-[#C5D4C9]">
                    QRIS Resmi
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
                <a
                  href={BRAND_INFO.buylinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#39FF14] hover:underline"
                >
                  <span>Buka Buylink 24 Jam</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => openWaWithTopic('umum')}
                  className="text-xs font-bold text-white hover:text-[#39FF14] cursor-pointer"
                >
                  Chat Admin →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION: PROMOTION SECTION (#promo) — CONNECTED TO FIREBASE CMS
            (Single unified header inside PromoSlideshow — no duplicate headers or gaps!)
        =================================================================== */}
        <section id="promo" className="ojb-section" aria-label="Galeri Informasi dan Promosi Layanan NJR CELL">
          <PromoSlideshow
            externalAdminModalOpen={adminSlideshowOpen}
            onExternalAdminModalClose={() => setAdminSlideshowOpen(false)}
          />
        </section>

        {/* ===================================================================
            SECTION: REKENING RESMI, QRIS & KEAGENAN (#tentang-kami / #rekening-resmi)
            DIBUKA SEMUA TANPA TAB TERSEMBUNYI — RAMAH UNTUK PELANGGAN AWAM / GAPTEK!
        =================================================================== */}
        <section id="tentang-kami" className="ojb-section" aria-labelledby="how-title">
          {/* Top Section Header + Quick Copy All Button */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
            <div>
              <p className="ojb-eyebrow">
                <ShieldCheck className="w-4 h-4 text-[#39FF14]" />
                Tentang Kami · Rekening, QRIS &amp; Keagenan Resmi
              </p>
              <h2 id="how-title" className="ojb-h2 !mb-2">
                REKENING, QRIS &amp; KODE AGEN.
                <br />
                <span className="ojb-soft">DIBUKA SEMUA &amp; MUDAH DICARI.</span>
              </h2>
              <p className="ojb-lede">
                Semua nomor rekening bank, e-wallet, barcode QRIS, serta kode resmi Agen Mandiri &amp; BRILink ditampilkan langsung di bawah ini (tanpa tersembunyi di balik tab) agar siapa saja mudah melihat dan menyalinnya.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleCopyAllAccounts}
                className={`ojb-btn !h-12 !px-4 text-xs cursor-pointer ${
                  copiedAccount === 'all-accounts' ? 'ojb-btn-primary' : 'ojb-btn-ghost'
                }`}
              >
                <span>
                  {copiedAccount === 'all-accounts'
                    ? 'Semua Rekening Tersalin!'
                    : 'Copy Semua Rekening Sekaligus'}
                </span>
                <span className="ojb-btn-icon !w-9 !h-9">
                  {copiedAccount === 'all-accounts' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4 text-[#39FF14]" />
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={() => openWaWithTopic('tarik-tunai')}
                className="ojb-btn ojb-btn-primary !h-12 !px-4 text-xs cursor-pointer"
              >
                <span>Kirim Bukti Transfer via WA</span>
                <span className="ojb-btn-icon !w-9 !h-9">
                  <MessageCircle className="w-4 h-4" />
                </span>
              </button>
            </div>
          </div>

          {/* OPEN ALL-IN-ONE BENTO GRID:
              Left (7 cols): All 6 Bank & E-Wallet Accounts + Easy Guide
              Right (5 cols): Open QRIS Card + Open Keagenan Mandiri & BRILink Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* PANEL 01: DAFTAR LENGKAP 6 REKENING BANK & E-WALLET RESMI */}
            <div
              id="rekening-resmi"
              className="lg:col-span-7 ojb-scene scroll-mt-24 flex flex-col justify-between"
            >
              <div>
                <div className="ojb-scene-bar bg-[#050907]">
                  <span className="ojb-dots">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="ojb-scene-url" translate="no">
                    01 · <b className="text-[#9EFF8A] font-semibold">DAFTAR REKENING BANK &amp; E-WALLET RESMI</b>
                  </span>
                  <span className="font-mono-num text-[#39FF14] font-bold">
                    {PAYMENT_ACCOUNTS.length} Rekening
                  </span>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-white/[0.07]">
                    <div>
                      <h3 className="text-base sm:text-lg font-extrabold text-white">
                        1. Nomor Rekening Bank &amp; E-Wallet Resmi NJR CELL
                      </h3>
                      <p className="text-xs text-[#8EA394] mt-0.5">
                        Tekan tombol <b className="text-[#39FF14]">Salin Nomor</b> di samping bank/e-wallet yang ingin Anda tuju.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyAllAccounts}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                        copiedAccount === 'all-accounts'
                          ? 'bg-[#39FF14] text-[#041006] shadow-[0_0_16px_rgba(57,255,20,0.35)]'
                          : 'bg-[#39FF14]/15 hover:bg-[#39FF14] text-[#39FF14] hover:text-[#041006] border border-[#39FF14]/35'
                      }`}
                    >
                      {copiedAccount === 'all-accounts' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Semua Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Semua Rekening</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {PAYMENT_ACCOUNTS.map((acc) => {
                      const isCopied = copiedAccount === acc.id;
                      return (
                        <div
                          key={acc.id}
                          className="p-3 sm:p-4 rounded-xl bg-[#070D0A] border border-white/[0.09] hover:border-[#39FF14]/45 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-14 h-10 sm:w-16 sm:h-11 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-sm">
                              <img
                                src={acc.logoPath}
                                alt={acc.provider}
                                className="w-full h-full object-contain"
                                loading="lazy"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-xs sm:text-sm font-bold text-white">
                                  {acc.provider}
                                </span>
                                <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#39FF14]/10 border border-[#39FF14]/25 text-[#9EFF8A] font-semibold">
                                  a.n. {acc.accountHolder}
                                </span>
                              </div>
                              <div className="font-mono-num text-base sm:text-lg font-extrabold text-[#39FF14] tracking-wider mt-0.5 break-all">
                                {acc.displayNumber}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopyAccount(acc.rawNumber, acc.id)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                              isCopied
                                ? 'bg-[#39FF14] text-[#041006]'
                                : 'bg-white/[0.07] hover:bg-[#39FF14] text-white hover:text-[#041006] border border-white/15'
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Nomor Tersalin ✓</span>
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
              </div>

              {/* Simple Step-by-Step Guide inside Left Column so heights balance with zero empty gap */}
              <div className="px-4 pb-4 sm:px-6 sm:pb-6">
                <div className="p-4 rounded-xl bg-[#050A07] border border-white/[0.08] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#9EFF8A]">
                    <ShieldCheck className="w-4 h-4 text-[#39FF14] shrink-0" />
                    <span>Panduan Mudah Transfer &amp; Tarik Tunai (Untuk Pelanggan Baru):</span>
                  </div>
                  <ol className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#C5D4C9] pt-1">
                    <li className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                      <b className="text-[#39FF14] block mb-0.5">Langkah 1</b>
                      Salin nomor rekening / e-wallet di atas atau scan barcode QRIS di samping.
                    </li>
                    <li className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                      <b className="text-[#39FF14] block mb-0.5">Langkah 2</b>
                      Pastikan nama tujuan <b>AMIR NURJAMAN</b> (atau <b>AHMAD SIDIK</b> khusus DANA 0831-2000-0303).
                    </li>
                    <li className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                      <b className="text-[#39FF14] block mb-0.5">Langkah 3</b>
                      Tunjukkan bukti transfer ke petugas konter atau kirim ke WhatsApp Admin.
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (5 cols): PANEL 02 (QRIS TERBUKA) + PANEL 03 (KEAGENAN TERBUKA) */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-5">
              {/* PANEL 02: QRIS RESMI NASIONAL (DIBUKA LANGSUNG) */}
              <div id="qris-resmi" className="ojb-scene scroll-mt-24">
                <div className="ojb-scene-bar bg-[#050907]">
                  <span className="ojb-dots">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="ojb-scene-url" translate="no">
                    02 · <b className="text-[#9EFF8A] font-semibold">BARCODE QRIS RESMI (SEMUA BANK &amp; E-WALLET)</b>
                  </span>
                </div>

                <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4">
                  <div
                    onClick={() => setQrisLightboxOpen(true)}
                    className="relative group cursor-pointer bg-white p-2.5 rounded-2xl shadow-lg w-[165px] sm:w-[175px] shrink-0 overflow-hidden"
                  >
                    <img
                      src={QRIS_INFO.imagePath}
                      alt="QRIS Resmi NJR CELL"
                      className="w-full h-auto rounded-lg object-contain"
                    />
                    <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-2.5 py-1.5 rounded-lg bg-[#39FF14] text-[#041006] font-bold text-xs flex items-center gap-1">
                        <Maximize2 className="w-3.5 h-3.5" /> Perbesar
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#39FF14]/15 border border-[#39FF14]/30 text-[#39FF14] text-[11px] font-bold mb-1.5">
                      <QrCode className="w-3 h-3" /> Standar QRIS Nasional
                    </span>
                    <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                      2. Scan QRIS: {QRIS_INFO.merchantName}
                    </h3>
                    <p className="text-xs font-mono-num font-bold text-[#39FF14] mt-0.5">
                      NMID: {QRIS_INFO.nmid}
                    </p>
                    <p className="text-xs text-[#8EA394] mt-2 leading-relaxed">
                      Bisa di-scan langsung dari BRImo, Livin&apos; Mandiri, BCA, SeaBank, DANA, OVO, GoPay, &amp; ShopeePay tanpa ketik nomor rekening.
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-3.5">
                      <button
                        type="button"
                        onClick={() => setQrisLightboxOpen(true)}
                        className="py-2.5 px-3 rounded-xl bg-[#39FF14] hover:bg-[#5BFF3D] text-[#041006] font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Perbesar QRIS</span>
                      </button>
                      <a
                        href={QRIS_INFO.imagePath}
                        download="QRIS-NJR-CELL.png"
                        className="py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Download className="w-3.5 h-3.5 text-[#39FF14]" />
                        <span>Simpan QRIS</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* PANEL 03: KEAGENAN RESMI MANDIRI & BRILINK · JARINGAN BERSAMA (DIBUKA LANGSUNG) */}
              <div id="keagenan-resmi" className="ojb-scene scroll-mt-24 flex-1 flex flex-col justify-between">
                <div>
                  <div className="ojb-scene-bar bg-[#050907]">
                    <span className="ojb-dots">
                      <i />
                      <i />
                      <i />
                    </span>
                    <span className="ojb-scene-url" translate="no">
                      03 · <b className="text-[#9EFF8A] font-semibold">KEAGENAN RESMI PERBANKAN &amp; JARINGAN BERSAMA</b>
                    </span>
                  </div>

                  <div className="p-4 sm:p-5 space-y-3.5">
                    <div>
                      <h3 className="text-base sm:text-lg font-extrabold text-white">
                        3. Identitas Keagenan Resmi Bank &amp; Jaringan ATM
                      </h3>
                      <p className="text-xs text-[#8EA394] mt-0.5">
                        Terdaftar resmi Agen Mandiri (Kode: {BRAND_INFO.mandiriAgentCode}) &amp; BRILink (Kode: {BRAND_INFO.brilinkAgentCode}) · {BRAND_INFO.atmNetwork}.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Agen Mandiri Card */}
                      <div className="p-3.5 rounded-xl bg-[#070D0A] border border-[#39FF14]/25 flex flex-col justify-between gap-2.5">
                        <div>
                          <span className="text-[11px] font-semibold text-[#9EFF8A] block">
                            Kode Agen Mandiri Resmi
                          </span>
                          <span className="font-mono-num text-xl font-extrabold text-[#39FF14] mt-0.5 block">
                            {BRAND_INFO.mandiriAgentCode}
                          </span>
                          <span className="text-[11px] text-[#8EA394] mt-0.5 block">
                            Setor, tarik tunai &amp; transfer Bank Mandiri
                          </span>
                        </div>
                        <div className="pt-2 border-t border-white/[0.06] flex items-center gap-1.5 text-[11px] font-semibold text-[#9EFF8A]">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#39FF14] shrink-0" />
                          <span>Identitas Keagenan Resmi</span>
                        </div>
                      </div>

                      {/* Agen BRILink Card */}
                      <div className="p-3.5 rounded-xl bg-[#070D0A] border border-[#39FF14]/25 flex flex-col justify-between gap-2.5">
                        <div>
                          <span className="text-[11px] font-semibold text-[#9EFF8A] block">
                            Kode Agen BRILink Resmi
                          </span>
                          <span className="font-mono-num text-xl font-extrabold text-[#39FF14] mt-0.5 block">
                            {BRAND_INFO.brilinkAgentCode}
                          </span>
                          <span className="text-[11px] text-[#8EA394] mt-0.5 block">
                            Setor, tarik tunai, BRIVA &amp; transfer BRI
                          </span>
                        </div>
                        <div className="pt-2 border-t border-white/[0.06] flex items-center gap-1.5 text-[11px] font-semibold text-[#9EFF8A]">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#39FF14] shrink-0" />
                          <span>Identitas Keagenan Resmi</span>
                        </div>
                      </div>
                    </div>

                    {/* Jaringan BERSAMA + Konfirmasi WA Box */}
                    <div className="p-3.5 rounded-xl bg-[#39FF14]/[0.07] border border-[#39FF14]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs text-[#C5D4C9] leading-relaxed">
                        <b className="text-[#39FF14] block mb-0.5">
                          {BRAND_INFO.atmNetwork} · Mesin EDC &amp; Mini ATM Konter
                        </b>
                        Melayani transaksi seluruh kartu ATM bank nasional &amp; bantuan langsung di konter Sukajadi dan Ciherang.
                      </div>
                      <button
                        type="button"
                        onClick={() => openWaWithTopic('mandiri-agen')}
                        className="ojb-wa-cta !h-10 !px-3.5 text-xs shrink-0 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Tanya Admin</span>
                      </button>
                    </div>
                  </div>
                </div>

                <p className="px-4 py-2.5 border-t border-white/[0.06] text-center font-mono-num text-[11px] text-[#687D6F]">
                  Terdaftar resmi Agen Mandiri ({BRAND_INFO.mandiriAgentCode}) &amp; BRILink ({BRAND_INFO.brilinkAgentCode}) · {BRAND_INFO.atmNetwork}
                </p>
              </div>
            </div>
          </div>

          {/* Info Penting Bar */}
          <div className="mt-6 pt-5 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
              <span className="text-sm font-bold text-[#9EFF8A] whitespace-nowrap">
                Info Penting Pelanggan
              </span>
              <p className="text-sm text-[#8EA394] leading-relaxed">
                Pastikan nama penerima rekening sesuai (<b>AMIR NURJAMAN</b> atau <b>AHMAD SIDIK</b> untuk DANA 0831 2000 0303). Simpan struk transaksi hingga saldo atau layanan diterima.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTermsModalOpen(true)}
              className="text-xs font-bold text-[#39FF14] hover:underline whitespace-nowrap cursor-pointer self-start"
            >
              Baca Syarat &amp; Ketentuan →
            </button>
          </div>
        </section>

        {/* ===================================================================
            SECTION: LOCATION SECTION (#lokasi-outlet)
            BOTH SUKAJADI & CIHERANG CARDS HAVE THEIR OWN DEDICATED MAP WINDOW!
        =================================================================== */}
        <section id="lokasi-outlet" className="ojb-section" aria-labelledby="lokasi-title">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <p className="ojb-eyebrow">
                <MapPin className="w-3.5 h-3.5 text-[#39FF14]" />2 Cabang Fisik Resmi di Kabupaten Ciamis
              </p>
              <h2 id="lokasi-title" className="ojb-h2 !mb-2">
                LOKASI &amp; PETA OUTLET.
                <br />
                <span className="ojb-soft">SUKAJADI &amp; CIHERANG.</span>
              </h2>
              <p className="ojb-lede">
                Masing-masing cabang dilengkapi peta titik lokasi, alamat lengkap, patokan jalan, tombol Google Maps, dan WhatsApp cabang langsung.
              </p>
            </div>
          </div>

          {/* 2 Outlet Cards — EACH with its own Map Window (Sukajadi Map + Ciherang Map both visible!) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {OUTLETS.map((outlet) => {
              const mapMode = outletMapModes[outlet.id] || 'pin';
              const embedSrc = OUTLET_EMBED_URLS[outlet.id] || OUTLET_EMBED_URLS.sukajadi;
              return (
                <div
                  key={outlet.id}
                  className="rounded-[24px] glass-surface border border-[#39FF14]/30 hover:border-[#39FF14]/65 shadow-[0_24px_55px_-28px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col justify-between transition-all"
                >
                  <div>
                    {/* Dedicated Map Scene Bar for This Outlet */}
                    <div className="ojb-scene-bar bg-[#050907]">
                      <span className="ojb-dots">
                        <i />
                        <i />
                        <i />
                      </span>
                      <span className="ojb-scene-url">
                        maps://njr-cell/<b className="text-[#9EFF8A]">{outlet.id}</b> — {outlet.shortArea}
                      </span>

                      {/* Toggle between Pin Image & Live Embed */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setOutletMapModes((prev) => ({ ...prev, [outlet.id]: 'pin' }))
                          }
                          className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                            mapMode === 'pin'
                              ? 'bg-[#39FF14] text-[#041006]'
                              : 'bg-white/[0.05] text-[#8EA394] hover:text-white'
                          }`}
                        >
                          Titik Pin
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setOutletMapModes((prev) => ({ ...prev, [outlet.id]: 'live' }))
                          }
                          className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                            mapMode === 'live'
                              ? 'bg-[#39FF14] text-[#041006]'
                              : 'bg-white/[0.05] text-[#8EA394] hover:text-white'
                          }`}
                        >
                          Peta Interaktif
                        </button>
                      </div>
                    </div>

                    {/* Dedicated Map Display for This Outlet (Both Sukajadi & Ciherang have their own map!) */}
                    <div className="relative w-full h-[220px] sm:h-[260px] bg-[#070C09] border-b border-white/[0.08] overflow-hidden group">
                      {mapMode === 'pin' ? (
                        <>
                          <img
                            src={outlet.mapPreviewImage}
                            alt={`Peta Lokasi ${outlet.name}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#040705] via-transparent to-black/20 pointer-events-none" />
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                            <span className="px-3 py-1 rounded-full bg-black/80 border border-[#39FF14]/40 text-[#39FF14] text-xs font-bold backdrop-blur-md inline-flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              Peta {outlet.name}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setOutletMapModes((prev) => ({ ...prev, [outlet.id]: 'live' }))
                              }
                              className="px-3 py-1 rounded-full bg-black/80 hover:bg-[#39FF14] text-white hover:text-[#041006] border border-white/20 text-xs font-bold backdrop-blur-md inline-flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Map className="w-3.5 h-3.5" />
                              <span>Geser Peta Live</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <iframe
                          src={embedSrc}
                          title={`Peta Interaktif ${outlet.name}`}
                          className="w-full h-full border-0"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      )}
                    </div>

                    {/* Outlet Information Body */}
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full bg-[#39FF14]/15 border border-[#39FF14]/30 text-[#39FF14] text-xs font-bold">
                          {outlet.code}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#8EA394] font-mono-num">
                          <Clock className="w-3.5 h-3.5 text-[#39FF14]" />
                          {outlet.shortArea}
                        </span>
                      </div>

                      <h3 className="font-display-ojb text-3xl sm:text-4xl font-black uppercase text-white tracking-tight mb-2">
                        {outlet.name}
                      </h3>
                      <p className="text-sm text-[#C5D4C9] leading-relaxed mb-4">
                        {outlet.address}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
                        <div className="p-3 rounded-xl bg-[#050907] border border-white/[0.06]">
                          <span className="text-[11px] text-[#8EA394] block">Patokan Lokasi</span>
                          <span className="text-xs font-bold text-white mt-0.5 block">
                            {outlet.landmarkNote}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#050907] border border-white/[0.06]">
                          <span className="text-[11px] text-[#8EA394] block">WhatsApp Cabang</span>
                          <span className="text-xs font-mono-num font-bold text-[#39FF14] mt-0.5 block">
                            {outlet.whatsappNumberDisplay}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {outlet.servicesAvailable.map((srv) => (
                          <span
                            key={srv}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs text-[#C5D4C9]"
                          >
                            {srv}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4 border-t border-white/[0.08]">
                      <a
                        href={outlet.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ojb-btn ojb-btn-primary !h-12"
                      >
                        <span>Buka Google Maps</span>
                        <span className="ojb-btn-icon !w-9 !h-9">
                          <ExternalLink className="w-4 h-4" />
                        </span>
                      </a>
                      <a
                        href={outlet.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ojb-btn ojb-btn-ghost !h-12"
                      >
                        <span>Chat WhatsApp</span>
                        <span className="ojb-btn-icon !w-9 !h-9">
                          <MessageCircle className="w-4 h-4" />
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ===================================================================
            SECTION: FAQ ACCORDION (#faq) — OJAILBREAKS.COM 2-COLUMN LAYOUT
        =================================================================== */}
        <section id="faq" className="ojb-section" aria-labelledby="faq-title">
          <div className="ojb-faq">
            <div className="ojb-faq-head">
              <p className="ojb-eyebrow">Informasi &amp; Bantuan</p>
              <h2 id="faq-title" className="ojb-h2">
                PERTANYAAN
                <br />
                UMUM.
                <br />
                <span className="ojb-soft">JAWABAN JELAS.</span>
              </h2>
              <p className="ojb-lede mb-5">
                Penjelasan singkat seputar layanan transaksi, jam operasional, dan produk di NJR CELL.
              </p>
              <button
                type="button"
                onClick={() => setQuickSearchOpen(true)}
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-[#8CFF98]/20 bg-white/[0.03] hover:border-[#39FF14]/50 hover:text-white text-sm text-[#C5D4C9] transition-all cursor-pointer"
              >
                <Search className="w-4 h-4 text-[#9EFF8A]" />
                <span>Cari layanan lain?</span>
                <kbd className="ojb-kbd">Ctrl K</kbd>
              </button>
            </div>

            <div className="border-t border-white/[0.09]">
              {FAQ_ITEMS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="border-b border-white/[0.09]">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full py-5 sm:py-6 flex items-center justify-between gap-4 text-left group cursor-pointer"
                    >
                      <span className="text-base sm:text-lg font-semibold text-white group-hover:text-[#39FF14] transition-colors">
                        {faq.question}
                      </span>
                      <span
                        className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isOpen
                            ? 'bg-[#39FF14] border-[#39FF14] text-[#041006] rotate-45'
                            : 'border-white/15 bg-white/[0.03] text-[#9EFF8A] group-hover:border-[#39FF14]/50'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </span>
                    </button>
                    {isOpen && (
                      <div className="pb-6 pr-4 sm:pr-12 text-sm sm:text-[15px] text-[#8EA394] leading-relaxed">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION: CLOSING / HUBUNGI KAMI (#hubungi-kami)
            (Identical structure to ojailbreaks.com .closing-panel)
        =================================================================== */}
        <section id="hubungi-kami" className="ojb-closing" aria-labelledby="closing-title">
          <div className="ojb-closing-panel">
            <div>
              <p className="ojb-eyebrow">Hubungi Kami</p>
              <h2 id="closing-title" className="ojb-h2">
                SIAP TRANSAKSI?
                <br />
                <span className="ojb-soft">MULAI DI SINI.</span>
              </h2>
              <p className="ojb-lede mb-7">
                Hubungi Admin NJR CELL melalui WhatsApp untuk menanyakan ketersediaan saldo, konfirmasi bukti transfer, maupun pemesanan produk digital.
              </p>

              <div className="flex flex-wrap gap-3 mb-7">
                <button
                  type="button"
                  onClick={() => openWaWithTopic('umum')}
                  className="ojb-btn ojb-btn-primary cursor-pointer"
                >
                  <span>Chat WhatsApp Resmi</span>
                  <span className="ojb-btn-icon">
                    <MessageCircle className="w-4 h-4" />
                  </span>
                </button>

                <a
                  href={BRAND_INFO.buylinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ojb-btn ojb-btn-ghost"
                >
                  <span>Portal Buylink 24 Jam</span>
                  <span className="ojb-btn-icon">
                    <ExternalLink className="w-4 h-4" />
                  </span>
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <a
                  href={BRAND_INFO.generalWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-black/35 border border-white/[0.08] hover:border-[#39FF14]/40 transition-all flex items-center gap-3"
                >
                  <Phone className="w-4 h-4 text-[#39FF14] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[11px] text-[#8EA394] block">WA Layanan Umum</span>
                    <span className="text-xs font-mono-num font-bold text-white truncate block">
                      {BRAND_INFO.generalWhatsappDisplay}
                    </span>
                  </div>
                </a>
                <a
                  href={OUTLETS[1].whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-black/35 border border-white/[0.08] hover:border-[#39FF14]/40 transition-all flex items-center gap-3"
                >
                  <MapPin className="w-4 h-4 text-[#39FF14] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[11px] text-[#8EA394] block">WA Cabang Ciherang</span>
                    <span className="text-xs font-mono-num font-bold text-white truncate block">
                      {OUTLETS[1].whatsappNumberDisplay}
                    </span>
                  </div>
                </a>
                <a
                  href={OUTLETS[0].whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-black/35 border border-white/[0.08] hover:border-[#39FF14]/40 transition-all flex items-center gap-3"
                >
                  <MapPin className="w-4 h-4 text-[#39FF14] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[11px] text-[#8EA394] block">WA Cabang Sukajadi</span>
                    <span className="text-xs font-mono-num font-bold text-white truncate block">
                      {OUTLETS[0].whatsappNumberDisplay}
                    </span>
                  </div>
                </a>
              </div>
            </div>

            <div className="ojb-closing-art" aria-hidden="true">
              <div className="relative w-44 h-44 sm:w-64 sm:h-64 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#39FF14]/15 blur-2xl" />
                <img
                  src="/assets/aistudio/Logo_NJR_CELL_Neon_Hijau_4282a177.png"
                  alt="NJR CELL Emblem"
                  className="relative w-full h-full object-contain drop-shadow-[0_0_32px_rgba(57,255,20,0.4)]"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================================
          FOOTER (OJAILBREAKS.COM FOOTER + GIANT DISPLAY WATERMARK)
      ===================================================================== */}
      <footer className="ojb-footer relative z-10">
        <div className="ojb-footer-top">
          {/* Brand Column */}
          <div className="ojb-footer-brand space-y-4">
            <a href="#top" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0D1510] border border-white/10 flex items-center justify-center p-1.5">
                <img
                  src="/img/njrcell.png"
                  alt="Logo NJR CELL"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">
                NJR CELL<span className="text-[#39FF14]">.</span>
              </span>
            </a>
            <p className="text-sm text-[#8EA394] max-w-sm leading-relaxed">
              Solusi transaksi keuangan, pembayaran digital, internet, aksesoris dan kebutuhan harian Anda di Pamarican &amp; Banjarsari, Ciamis.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href={BRAND_INFO.generalWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-10 px-3.5 rounded-xl border border-white/10 bg-white/[0.02] hover:border-[#39FF14]/50 hover:text-white text-xs font-semibold text-[#C5D4C9] transition-all"
              >
                <MessageCircle className="w-4 h-4 text-[#39FF14]" />
                <span>WhatsApp</span>
              </a>
              <a
                href={BRAND_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-10 px-3.5 rounded-xl border border-white/10 bg-white/[0.02] hover:border-[#39FF14]/50 hover:text-white text-xs font-semibold text-[#C5D4C9] transition-all"
              >
                <span>Instagram</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#8EA394]" />
              </a>
              <a
                href={BRAND_INFO.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-10 px-3.5 rounded-xl border border-white/10 bg-white/[0.02] hover:border-[#39FF14]/50 hover:text-white text-xs font-semibold text-[#C5D4C9] transition-all"
              >
                <span>TikTok</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#8EA394]" />
              </a>
            </div>
          </div>

          {/* Navigate Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Navigasi
            </h4>
            <div className="grid gap-2 text-sm text-[#C5D4C9]">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="hover:text-[#39FF14] transition-colors py-0.5"
                >
                  {link.label}
                </a>
              ))}
              <button
                type="button"
                onClick={() => setTermsModalOpen(true)}
                className="text-left hover:text-[#39FF14] transition-colors py-0.5 cursor-pointer"
              >
                Syarat &amp; Ketentuan
              </button>
            </div>
          </div>

          {/* Lokasi & Kategori Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Lokasi Outlet
            </h4>
            <div className="grid gap-3 text-sm text-[#C5D4C9]">
              {OUTLETS.map((o) => (
                <a
                  key={o.id}
                  href={o.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <span className="font-semibold text-white group-hover:text-[#39FF14] transition-colors block">
                    {o.name}
                  </span>
                  <span className="text-xs text-[#8EA394] block mt-0.5">{o.landmarkNote}</span>
                </a>
              ))}
              <div className="pt-2 border-t border-white/[0.06] text-xs text-[#8EA394] space-y-1">
                <div>
                  Agen Mandiri: <b className="font-mono-num text-[#39FF14]">{BRAND_INFO.mandiriAgentCode}</b> · BRILink: <b className="font-mono-num text-[#39FF14]">{BRAND_INFO.brilinkAgentCode}</b>
                </div>
                <div className="text-[11px] text-[#9EFF8A] font-semibold">
                  {BRAND_INFO.atmNetwork}
                </div>
              </div>
            </div>
          </div>

          {/* Shortcuts Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Pintasan Cepat
            </h4>
            <div className="grid gap-2.5 text-sm text-[#8EA394]">
              <div className="flex items-center gap-3">
                <kbd className="ojb-kbd min-w-[44px]">/</kbd>
                <span>Cari katalog layanan</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="ojb-kbd min-w-[44px]">Ctrl K</kbd>
                <span>Quick find palette</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="ojb-kbd min-w-[44px]">Esc</kbd>
                <span>Tutup panel detail</span>
              </div>
            </div>
          </div>
        </div>

        {/* Giant Watermark Word (ojailbreaks.com .footer-word) */}
        <div className="ojb-footer-word" aria-hidden="true" translate="no">
          <span>NJR CELL</span>
        </div>

        {/* Footer Bottom */}
        <div className="pt-5 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4 text-xs text-[#687D6F]">
          <span>© {new Date().getFullYear()} {BRAND_INFO.name}. Seluruh hak cipta dilindungi.</span>
          <span>
            Terdaftar resmi Agen Mandiri (Kode: {BRAND_INFO.mandiriAgentCode}) &amp; BRILink (Kode: {BRAND_INFO.brilinkAgentCode}) · {BRAND_INFO.atmNetwork}
          </span>
          <a
            href="#top"
            aria-label="Kembali ke atas"
            className="w-11 h-11 rounded-full border border-[#8CFF98]/20 bg-white/[0.02] hover:border-[#39FF14] hover:text-[#39FF14] flex items-center justify-center text-white transition-all"
          >
            <ArrowUp className="w-4 h-4" />
          </a>
        </div>
      </footer>

      {/* =====================================================================
          FULL-SCREEN PACK / SERVICE DETAIL PAGE (.ojb-pack-page)
          (Opens when clicking any tile in .ojb-pack-grid, matching ojailbreaks.com #pack-page)
      ===================================================================== */}
      {activePackItem && (
        <div
          className="ojb-pack-page"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pp-title"
          style={{
            ['--accent' as string]: CATEGORY_ACCENTS[activePackItem.categoryId] || '#39FF14',
          }}
        >
          <div className="ojb-pp-glow" aria-hidden="true" />

          {/* Top Bar */}
          <div className="ojb-pp-bar">
            <button
              type="button"
              onClick={() => setActivePackItem(null)}
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] text-xs font-semibold text-[#C5D4C9] hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Semua Layanan</span>
            </button>

            <div className="ojb-pp-crumb text-xs text-[#687D6F] truncate">
              Katalog Layanan <span className="mx-1.5">/</span>
              <span className="text-[#8EA394]">{activePackItem.categoryLabel}</span>
              <span className="mx-1.5">/</span>
              <b className="text-[#C5D4C9] font-semibold">{activePackItem.title}</b>
            </div>

            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                onClick={() => navigatePackItem('prev')}
                aria-label="Layanan sebelumnya"
                className="w-9 h-9 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] flex items-center justify-center text-[#C5D4C9] hover:text-white cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="ojb-pp-count font-mono-num text-xs text-[#8EA394] px-2">
                {String(activePackIndex + 1).padStart(2, '0')} /{' '}
                {String(SERVICE_CATALOG_ITEMS.length).padStart(2, '0')}
              </span>
              <button
                type="button"
                onClick={() => navigatePackItem('next')}
                aria-label="Layanan berikutnya"
                className="w-9 h-9 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] flex items-center justify-center text-[#C5D4C9] hover:text-white cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setActivePackItem(null)}
                aria-label="Tutup halaman layanan"
                className="w-9 h-9 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-red-500/20 hover:border-red-500/40 flex items-center justify-center text-[#C5D4C9] hover:text-white cursor-pointer ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Layout: Sidebar (Horizontal Strip on Mobile) + Main Detail */}
          <div className="ojb-pp-layout">
            <nav className="ojb-pp-side" aria-label="Semua layanan">
              <p className="ojb-pp-side-title text-xs font-bold uppercase tracking-wider text-[#687D6F] px-2 pb-2">
                Semua Layanan ({SERVICE_CATALOG_ITEMS.length})
              </p>
              <div className="ojb-pp-list">
                {SERVICE_CATALOG_ITEMS.map((srv) => {
                  const isCurrent = srv.id === activePackItem.id;
                  return (
                    <button
                      key={srv.id}
                      type="button"
                      aria-current={isCurrent ? 'page' : undefined}
                      onClick={() => setActivePackItem(srv)}
                      className="ojb-pp-item cursor-pointer"
                    >
                      <span className="w-8 h-8 rounded-lg border border-white/10 bg-white/[0.04] flex items-center justify-center text-[#39FF14] shrink-0">
                        {renderServiceIcon(srv.iconName, 'w-4 h-4')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-white truncate">{srv.title}</div>
                        <small className="ojb-pp-item-sub text-[11px] text-[#687D6F] truncate block">
                          {srv.categoryLabel}
                        </small>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] shrink-0 hidden sm:inline-block" />
                    </button>
                  );
                })}
              </div>
            </nav>

            <div className="ojb-pp-main">
              {/* Pack Header */}
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-16 h-16 sm:w-22 sm:h-22 rounded-[20px] sm:rounded-[26px] border border-[#39FF14]/35 bg-[#0A160E] flex items-center justify-center text-[#39FF14] shadow-[0_20px_50px_-15px_rgba(57,255,20,0.45)] shrink-0">
                  {renderServiceIcon(activePackItem.iconName, 'w-8 h-8 sm:w-11 sm:h-11')}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-[#8EA394] mb-1">
                    Kategori · {activePackItem.categoryLabel}
                  </p>
                  <h2
                    id="pp-title"
                    className="font-display-ojb text-4xl sm:text-6xl font-black uppercase text-white tracking-tight leading-[0.9]"
                  >
                    {activePackItem.title}
                  </h2>
                </div>
              </div>

              <p className="text-sm sm:text-base text-[#C5D4C9] max-w-2xl mt-5 mb-4 leading-relaxed">
                {activePackItem.description}
              </p>

              {/* Status & Tags */}
              <div className="flex flex-wrap items-center gap-2.5 mb-7">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#39FF14]/35 bg-[#39FF14]/10 text-xs font-semibold text-[#39FF14]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14]" />
                  {activePackItem.availability}
                </span>
                <span className="text-xs text-[#687D6F]">
                  {activePackItem.keywords.join(' · ')}
                </span>
              </div>

              {/* Primary Actions */}
              <div className="flex flex-wrap items-center gap-3 mb-9">
                {activePackItem.actionType === 'external' ? (
                  <a
                    href={activePackItem.actionTarget}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ojb-btn ojb-btn-primary"
                  >
                    <span>{activePackItem.actionLabel}</span>
                    <span className="ojb-btn-icon">
                      <ExternalLink className="w-4 h-4" />
                    </span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const topic = activePackItem.actionTarget;
                      setActivePackItem(null);
                      openWaWithTopic(topic);
                    }}
                    className="ojb-btn ojb-btn-primary cursor-pointer"
                  >
                    <span>{activePackItem.actionLabel}</span>
                    <span className="ojb-btn-icon">
                      <Send className="w-4 h-4" />
                    </span>
                  </button>
                )}

                <a
                  href="#lokasi-outlet"
                  onClick={() => setActivePackItem(null)}
                  className="ojb-btn ojb-btn-ghost"
                >
                  <span>Kunjungi Outlet Terdekat</span>
                  <span className="ojb-btn-icon">
                    <MapPin className="w-4 h-4" />
                  </span>
                </a>
              </div>

              {/* Sibling Services in Same Category (.pp-models equivalent) */}
              <div className="max-w-[1060px] mb-5 p-4 sm:p-5 rounded-[18px] border border-[#39FF14]/20 bg-[#08120C]/80">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white">
                    Layanan dalam Kategori {activePackItem.categoryLabel}
                  </h3>
                  <span className="text-xs text-[#8EA394]">
                    {siblingPackItems.length} layanan tersedia
                  </span>
                </div>
                <div className="grid gap-2">
                  {siblingPackItems.map((sib) => {
                    const isSelected = sib.id === activePackItem.id;
                    return (
                      <div
                        key={sib.id}
                        className={`p-3 sm:p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                          isSelected
                            ? 'bg-[#39FF14]/[0.08] border-[#39FF14]/45'
                            : 'bg-[#040806]/70 border-white/[0.07] hover:border-white/20'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{sib.title}</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-[#9EFF8A]">
                              {sib.categoryLabel}
                            </span>
                          </div>
                          <p className="text-xs text-[#8EA394] mt-0.5 line-clamp-1">
                            {sib.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {!isSelected && (
                            <button
                              type="button"
                              onClick={() => setActivePackItem(sib)}
                              className="h-9 px-3 rounded-lg border border-white/15 bg-white/[0.04] hover:bg-white/[0.1] text-xs font-semibold text-white cursor-pointer"
                            >
                              Lihat Detail
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setActivePackItem(null);
                              openWaWithTopic(sib.actionTarget);
                            }}
                            className="h-9 px-3.5 rounded-lg bg-[#39FF14] hover:bg-[#5BFF3D] text-[#041006] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Order WA</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2-Column Info Grid (.ojb-pp-grid: What's Inside Terminal + How to Use Steps) */}
              <div className="ojb-pp-grid">
                <div className="p-5 rounded-[18px] border border-white/[0.08] bg-[#070E0A]/80">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#39FF14]" />
                    <span>Cakupan Layanan &amp; Kata Kunci</span>
                  </h3>
                  <div className="rounded-2xl border border-white/10 bg-[#030604] overflow-hidden">
                    <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/[0.07] font-mono-num text-[11px] text-[#8EA394]">
                      <span className="ojb-dots">
                        <i />
                        <i />
                        <i />
                      </span>
                      <span>njr-cell/{activePackItem.id}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${activePackItem.title} — ${activePackItem.keywords.join(', ')}`
                          );
                          setCopiedTree(true);
                          setTimeout(() => setCopiedTree(false), 2000);
                        }}
                        className="px-2 py-1 rounded border border-white/15 text-[10px] text-[#C5D4C9] hover:text-white cursor-pointer"
                      >
                        {copiedTree ? 'Tersalin ✓' : 'Salin Info'}
                      </button>
                    </div>
                    <div className="p-4 font-mono-num text-xs text-[#C5D4C9] space-y-2">
                      <div className="text-[#39FF14] font-bold">
                        /{activePackItem.categoryId}/{activePackItem.id}
                      </div>
                      {activePackItem.keywords.map((kw, i) => (
                        <div key={i} className="pl-3 flex items-center gap-2">
                          <span className="text-[#687D6F]">
                            {i === activePackItem.keywords.length - 1 ? '└──' : '├──'}
                          </span>
                          <Check className="w-3.5 h-3.5 text-[#39FF14] shrink-0" />
                          <span>{kw}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-[#8EA394] mt-3 leading-relaxed">
                    Tersedia di <b>NJR CELL Ciherang</b> &amp; <b>NJR CELL Sukajadi</b>.
                  </p>
                </div>

                <div className="p-5 rounded-[18px] border border-white/[0.08] bg-[#070E0A]/80">
                  <h3 className="text-sm font-bold text-white mb-4">Cara Transaksi Cepat</h3>
                  <ol className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full border border-[#39FF14]/40 bg-[#39FF14]/10 text-[#39FF14] text-xs font-bold flex items-center justify-center shrink-0">
                        1
                      </span>
                      <div className="text-xs sm:text-sm text-[#8EA394]">
                        <b className="text-white block mb-0.5">Hubungi Admin atau Datang ke Outlet</b>
                        Ketuk tombol <b>{activePackItem.actionLabel}</b> atau kunjungi langsung cabang Ciherang / Sukajadi.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full border border-[#39FF14]/40 bg-[#39FF14]/10 text-[#39FF14] text-xs font-bold flex items-center justify-center shrink-0">
                        2
                      </span>
                      <div className="text-xs sm:text-sm text-[#8EA394]">
                        <b className="text-white block mb-0.5">Lakukan Pembayaran Resmi</b>
                        Bayar tunai di konter, transfer ke rekening resmi a.n. AMIR NURJAMAN / AHMAD SIDIK, atau scan QRIS NJR CELL.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full border border-[#39FF14]/40 bg-[#39FF14]/10 text-[#39FF14] text-xs font-bold flex items-center justify-center shrink-0">
                        3
                      </span>
                      <div className="text-xs sm:text-sm text-[#8EA394]">
                        <b className="text-white block mb-0.5">Transaksi Diproses Instan</b>
                        Simpan bukti struk resmi. Layanan atau saldo Anda langsung diproses saat itu juga.
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          QRIS FULLSCREEN LIGHTBOX MODAL
      ===================================================================== */}
      {qrisLightboxOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="QRIS Resmi NJR CELL"
          onClick={() => setQrisLightboxOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-[#0D1310] border border-white/15 p-5 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-left">
                <h3 className="text-base font-bold text-white">QRIS Resmi {QRIS_INFO.merchantName}</h3>
                <p className="text-xs font-mono-num text-[#39FF14]">NMID: {QRIS_INFO.nmid}</p>
              </div>
              <button
                type="button"
                onClick={() => setQrisLightboxOpen(false)}
                className="p-2 rounded-lg text-[#8EA394] hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-white p-3 rounded-xl mb-4">
              <img
                src={QRIS_INFO.imagePath}
                alt="QRIS NJR CELL"
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>
            <div className="flex gap-2.5">
              <a
                href={QRIS_INFO.imagePath}
                download="QRIS-NJR-CELL.png"
                className="ojb-btn ojb-btn-primary flex-1 !h-11 text-xs"
              >
                <span>Unduh Gambar QRIS</span>
                <span className="ojb-btn-icon !w-8 !h-8">
                  <Download className="w-4 h-4" />
                </span>
              </a>
              <button
                type="button"
                onClick={() => setQrisLightboxOpen(false)}
                className="ojb-btn ojb-btn-ghost !h-11 !px-4 text-xs cursor-pointer"
              >
                <span>Tutup</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODALS & FLOATING WIDGETS (100% PRESERVED)
      ===================================================================== */}
      <QuickSearchModal
        isOpen={quickSearchOpen}
        onClose={() => setQuickSearchOpen(false)}
        onSelectServiceItem={(item) => {
          setActivePackItem(item);
        }}
        onJumpToSection={handleJumpToSection}
      />

      <WhatsAppSelectorModal
        isOpen={waModalOpen}
        onClose={() => setWaModalOpen(false)}
        initialTopic={waModalTopic}
      />

      <TermsModal isOpen={termsModalOpen} onClose={() => setTermsModalOpen(false)} />

      <AuditModal isOpen={auditModalOpen} onClose={() => setAuditModalOpen(false)} />

      <AutoChatWidget />
    </div>
  );
}

export default App;
