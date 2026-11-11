import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  MapPin,
  Landmark,
  Smartphone,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  CornerDownLeft,
} from 'lucide-react';
import {
  SERVICE_CATEGORIES,
  SERVICE_CATALOG_ITEMS,
  ServiceCategoryId,
  ServiceCatalogItem,
  OUTLETS,
} from '../data/njrCellData';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectServiceItem: (item: ServiceCatalogItem) => void;
  onJumpToSection: (sectionId: string, categoryFilter?: 'all' | ServiceCategoryId) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectServiceItem,
  onJumpToSection,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | ServiceCategoryId>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveCategory('all');
      setSelectedIndex(0);
      window.setTimeout(() => {
        inputRef.current?.focus();
      }, 40);
    }
  }, [isOpen]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SERVICE_CATALOG_ITEMS.filter((item) => {
      if (activeCategory !== 'all' && item.categoryId !== activeCategory) {
        return false;
      }
      if (!q) return true;
      const inTitle = item.title.toLowerCase().includes(q);
      const inDesc = item.description.toLowerCase().includes(q);
      const inCat = item.categoryLabel.toLowerCase().includes(q);
      const inKeywords = item.keywords.some((kw) => kw.toLowerCase().includes(q));
      return inTitle || inDesc || inCat || inKeywords;
    });
  }, [query, activeCategory]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategory]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredItems.length > 0 ? (prev + 1) % filteredItems.length : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredItems.length > 0
            ? (prev - 1 + filteredItems.length) % filteredItems.length
            : 0
        );
      } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
        e.preventDefault();
        const target = filteredItems[selectedIndex];
        onClose();
        onSelectServiceItem(target);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose, onSelectServiceItem]);

  if (!isOpen) return null;

  const renderCategoryIcon = (categoryId: ServiceCategoryId) => {
    const cls = 'w-4 h-4 text-[#39FF14] shrink-0';
    switch (categoryId) {
      case 'keuangan':
        return <Landmark className={cls} />;
      case 'digital':
        return <Smartphone className={cls} />;
      case 'pembayaran':
        return <Receipt className={cls} />;
      case 'aksesori':
        return <ShieldCheck className={cls} />;
      case 'kebutuhan-harian':
        return <ShoppingBag className={cls} />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-start justify-center pt-14 sm:pt-20 px-3 sm:px-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="Pencarian Cepat Layanan NJR CELL"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-[#0B0F0D] border border-white/15 shadow-[0_24px_70px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[82vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 sm:px-5 py-4 border-b border-white/10 bg-[#0E1411]">
          <Search className="w-5 h-5 text-[#39FF14] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari layanan: Transfer, BRILink, Pulsa, Token PLN, Hydrogel, Aice..."
            className="w-full bg-transparent text-sm sm:text-base text-[#F3F7F4] placeholder-[#7B8C81] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs text-[#A3B3A8] hover:text-[#F3F7F4] px-2 py-1 rounded cursor-pointer"
            >
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pencarian"
            className="p-1.5 rounded-lg text-[#A3B3A8] hover:text-[#F3F7F4] hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter Bar */}
        <div className="px-4 sm:px-5 py-2.5 border-b border-white/10 bg-[#090D0B] flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-[#39FF14] text-[#060807]'
                : 'text-[#A3B3A8] hover:text-[#F3F7F4] hover:bg-white/5'
            }`}
          >
            Semua ({SERVICE_CATALOG_ITEMS.length})
          </button>
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#39FF14] text-[#060807]'
                  : 'text-[#A3B3A8] hover:text-[#F3F7F4] hover:bg-white/5'
              }`}
            >
              {cat.shortTitle}
            </button>
          ))}
        </div>

        {/* Results Body */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-2">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => {
                    onClose();
                    onSelectServiceItem(item);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                    isSelected
                      ? 'bg-[#131E17] border-[#39FF14]/50 shadow-sm'
                      : 'bg-[#0E1310] border-white/8 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#152219] border border-[#39FF14]/25 flex items-center justify-center shrink-0 mt-0.5">
                      {renderCategoryIcon(item.categoryId)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#A3B3A8]">
                        <span className="font-bold text-[#F3F7F4] text-sm">
                          {item.title}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#39FF14]">{item.categoryLabel}</span>
                      </div>
                      <p className="text-xs text-[#A3B3A8] line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-xs font-bold text-[#39FF14]">
                    <span className="hidden sm:inline">{item.actionLabel}</span>
                    {item.actionType === 'external' ? (
                      <ExternalLink className="w-4 h-4" />
                    ) : item.actionType === 'wa' ? (
                      <MessageCircle className="w-4 h-4" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-12 px-4 text-center space-y-2">
              <p className="text-sm font-bold text-[#F3F7F4]">
                Layanan "{query}" tidak ditemukan di daftar cepat.
              </p>
              <p className="text-xs text-[#A3B3A8]">
                Jangan khawatir! Anda dapat menanyakan ketersediaan layanan tersebut langsung ke WhatsApp Admin NJR CELL.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onJumpToSection('hubungi-wa');
                }}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#39FF14] text-[#060807] font-bold text-xs cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Tanya Admin via WhatsApp</span>
              </button>
            </div>
          )}

          {/* Quick Outlet Jump Shortcuts */}
          <div className="pt-3 mt-3 border-t border-white/10">
            <p className="text-[11px] font-semibold text-[#7B8C81] px-1 mb-2">
              LOKASI OUTLET & JALUR CEPAT
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {OUTLETS.map((outlet) => (
                <a
                  key={outlet.id}
                  href={outlet.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="p-2.5 rounded-xl bg-[#0E1310] hover:bg-[#141E18] border border-white/10 hover:border-[#39FF14]/40 flex items-center justify-between gap-2 text-xs transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-[#39FF14] shrink-0" />
                    <span className="font-semibold text-[#F3F7F4] truncate">
                      {outlet.name}
                    </span>
                  </div>
                  <span className="text-[#39FF14] font-mono-num text-[11px] shrink-0">
                    Maps →
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Keyboard Hints */}
        <div className="px-4 sm:px-5 py-2.5 border-t border-white/10 bg-[#090D0B] flex items-center justify-between text-[11px] text-[#7B8C81]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <CornerDownLeft className="w-3 h-3 text-[#39FF14]" />
              <span>Pilih layanan</span>
            </span>
            <span>·</span>
            <span>↑↓ Navigasi</span>
            <span>·</span>
            <span>ESC Tutup</span>
          </div>
          <span className="text-[#A3B3A8]">NJR CELL Quick Hub</span>
        </div>
      </div>
    </div>
  );
};
