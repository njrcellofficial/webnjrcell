import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Pause,
  Play,
  Sparkles,
  Settings,
  Calendar,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from 'firebase/firestore';
import { PROMO_SLIDES, PromoSlide, BRAND_INFO } from '../data/njrCellData';
import {
  auth,
  db,
  BOOTSTRAPPED_ADMIN_EMAIL,
} from '../firebase';
import {
  CmsSlide,
  evaluateSlideLifecycle,
  formatJakartaDateTime,
  validateSafeUrl,
} from '../utils/slideHelper';
import { AdminSlideshowModal } from './AdminSlideshowModal';

interface PromoSlideshowProps {
  externalAdminModalOpen?: boolean;
  onExternalAdminModalClose?: () => void;
}

const FALLBACK_CMS_SLIDES: CmsSlide[] = PROMO_SLIDES.map((s, idx) => ({
  id: s.id,
  title: s.title,
  subtitle: s.subtitle,
  imageUrl: s.image,
  storagePath: '',
  alt: s.alt,
  category: s.category,
  buttonText: `Buka ${s.platformLabel}`,
  targetUrl: s.targetUrl,
  order: idx + 1,
  status: 'Published',
  startAt: '',
  endAt: '',
  authorUid: 'system-default',
}));

export const PromoSlideshow: React.FC<PromoSlideshowProps> = ({
  externalAdminModalOpen = false,
  onExternalAdminModalClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | PromoSlide['category']>('Semua');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Real-time Firestore state
  const [cmsSlides, setCmsSlides] = useState<CmsSlide[]>([]);
  const [hasLoadedFirestore, setHasLoadedFirestore] = useState(false);
  const [firestoreError, setFirestoreError] = useState(false);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  // Auth & Admin modal state
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [internalAdminOpen, setInternalAdminOpen] = useState(false);

  const isAdminModalOpen = internalAdminOpen || externalAdminModalOpen;

  const handleCloseAdminModal = () => {
    setInternalAdminOpen(false);
    if (onExternalAdminModalClose) {
      onExternalAdminModalClose();
    }
  };

  // Keep `nowMs` updated every 15 seconds so scheduled/expired slides transition automatically in real time
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 15000);
    return () => window.clearInterval(timer);
  }, []);

  // Listen for Firebase Auth changes to determine if the current user is an admin
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAdminUser(false);
        return;
      }
      if (
        user.email &&
        user.email.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase() &&
        user.emailVerified
      ) {
        setIsAdminUser(true);
        return;
      }
      try {
        const adminSnap = await getDoc(doc(db, 'admins', user.uid));
        setIsAdminUser(adminSnap.exists() && adminSnap.data()?.role === 'admin');
      } catch {
        setIsAdminUser(false);
      }
    });
    return () => unsub();
  }, []);

  // Subscribe to Firestore `/slides`
  // Public visitors subscribe to `status == 'Published'` (enforced by Firestore Security Rules).
  // Verified admins subscribe to the full `/slides` collection to manage Draft, Scheduled, Published, Expired, and Archived slides.
  useEffect(() => {
    const slidesRef = collection(db, 'slides');
    const slidesQuery = isAdminUser
      ? slidesRef
      : query(slidesRef, where('status', '==', 'Published'));

    const unsub = onSnapshot(
      slidesQuery,
      (snapshot) => {
        const loaded: CmsSlide[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            title: String(d.title || ''),
            subtitle: String(d.subtitle || ''),
            imageUrl: String(d.imageUrl || d.image || ''),
            storagePath: String(d.storagePath || ''),
            alt: String(d.alt || d.title || 'Banner Promosi NJR CELL'),
            category: (['Keuangan', 'Digital', 'Aksesori', 'Info'].includes(d.category)
              ? d.category
              : 'Info') as PromoSlide['category'],
            buttonText: String(d.buttonText || 'Info Selengkapnya'),
            targetUrl: String(d.targetUrl || BRAND_INFO.buylinkUrl),
            order: typeof d.order === 'number' ? d.order : 1,
            status: d.status || 'Draft',
            startAt: String(d.startAt || ''),
            endAt: String(d.endAt || ''),
            authorUid: String(d.authorUid || ''),
            createdAt: d.createdAt || null,
            updatedAt: d.updatedAt || null,
          };
        });

        loaded.sort((a, b) => a.order - b.order);
        setCmsSlides(loaded);
        setHasLoadedFirestore(true);
        setFirestoreError(false);
      },
      () => {
        // Fallback safely if Firestore is offline or unreachable
        setFirestoreError(true);
        setHasLoadedFirestore(true);
      }
    );

    return () => unsub();
  }, [isAdminUser]);

  // Determine whether we are using fallback default slides (when database is empty or offline)
  const isUsingFallback = !hasLoadedFirestore || firestoreError || cmsSlides.length === 0;

  // Compute homepage-eligible slides:
  // If using fallback (database not seeded yet), use FALLBACK_CMS_SLIDES.
  // If database has slides, strictly filter by `evaluateSlideLifecycle(slide, nowMs).isEligibleForHomepage`
  // which guarantees:
  //   1. status === 'Published' (never Draft or Archived)
  //   2. startAt is empty or now >= startAt (never future Scheduled)
  //   3. endAt is empty or now <= endAt (never Expired, even if stored status in DB is still 'Published')
  const eligibleHomepageSlides = useMemo(() => {
    const sourceSlides = isUsingFallback ? FALLBACK_CMS_SLIDES : cmsSlides;
    return sourceSlides
      .filter((slide) => evaluateSlideLifecycle(slide, nowMs).isEligibleForHomepage)
      .sort((a, b) => a.order - b.order);
  }, [isUsingFallback, cmsSlides, nowMs]);

  const filteredSlides = useMemo(() => {
    if (selectedCategory === 'Semua') {
      return eligibleHomepageSlides;
    }
    return eligibleHomepageSlides.filter((slide) => slide.category === selectedCategory);
  }, [eligibleHomepageSlides, selectedCategory]);

  const safeIndex =
    filteredSlides.length > 0 && currentIndex < filteredSlides.length ? currentIndex : 0;
  const activeSlide = filteredSlides[safeIndex] || null;

  const handleNext = useCallback(() => {
    if (filteredSlides.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % filteredSlides.length);
  }, [filteredSlides.length]);

  const handlePrev = useCallback(() => {
    if (filteredSlides.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + filteredSlides.length) % filteredSlides.length);
  }, [filteredSlides.length]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedCategory]);

  useEffect(() => {
    if (isPaused || filteredSlides.length <= 1) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const timer = window.setInterval(() => {
      handleNext();
    }, 5500);

    return () => window.clearInterval(timer);
  }, [isPaused, filteredSlides.length, handleNext]);

  const categories: Array<'Semua' | PromoSlide['category']> = [
    'Semua',
    'Keuangan',
    'Digital',
    'Aksesori',
    'Info',
  ];

  // Validate activeSlide CTA URL so unsafe schemes (javascript:, data:, etc.) can never execute
  const safeTargetUrl = useMemo(() => {
    if (!activeSlide) return BRAND_INFO.buylinkUrl;
    const check = validateSafeUrl(activeSlide.targetUrl);
    return check.valid ? activeSlide.targetUrl.trim() : BRAND_INFO.buylinkUrl;
  }, [activeSlide]);

  const buttonLabel = useMemo(() => {
    if (!activeSlide) return 'Buka Layanan Resmi';
    if (activeSlide.buttonText && activeSlide.buttonText.trim().length > 0) {
      return activeSlide.buttonText.trim();
    }
    return 'Info Selengkapnya';
  }, [activeSlide]);

  return (
    <section
      id="promo"
      aria-label="Galeri Informasi dan Promosi Layanan NJR CELL"
      className="py-12 md:py-16 border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <p className="text-xs font-medium tracking-wider text-[#39FF14]">
                01. GALERI LAYANAN & PROMOSI RESMI
              </p>
              <button
                type="button"
                onClick={() => setInternalAdminOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#142218] hover:bg-[#39FF14] text-[#39FF14] hover:text-[#070A08] border border-[#39FF14]/40 hover:border-[#39FF14] text-xs font-bold transition-all shadow-sm cursor-pointer"
                title="Buka CMS Admin Slideshow untuk Upload dan Kelola Banner"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isAdminUser ? 'Dashboard Admin Aktif' : 'Login Admin / Upload Banner'}</span>
              </button>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F3F7F4] tracking-tight">
              Informasi Layanan NJR CELL
            </h2>
            <p className="text-sm sm:text-base text-[#A3B3A8] mt-1">
              Geser atau pilih kategori untuk melihat layanan yang tersedia di konter maupun online.
            </p>
          </div>

          {/* Interactive Filter Controls */}
          <div
            role="tablist"
            aria-label="Filter kategori banner promosi"
            className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-[#111613] border border-white/10"
          >
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#39FF14] text-[#070A08]'
                      : 'text-[#A3B3A8] hover:text-[#F3F7F4] hover:bg-white/5'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Slideshow Card */}
        {activeSlide ? (
          <div
            className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#101512] shadow-2xl"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              {/* Banner Visual Area */}
              <div className="lg:col-span-7 relative bg-[#0A0E0C] flex items-center justify-center min-h-[240px] sm:min-h-[340px] p-3 sm:p-6">
                {!failedImages[activeSlide.id] ? (
                  <img
                    key={activeSlide.id}
                    src={activeSlide.imageUrl}
                    alt={activeSlide.alt}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={() =>
                      setFailedImages((prev) => ({ ...prev, [activeSlide.id]: true }))
                    }
                    className="max-h-[340px] w-auto max-w-full object-contain rounded-xl border border-white/10 shadow-lg"
                  />
                ) : (
                  <div className="w-full h-64 rounded-xl border border-[#39FF14]/30 bg-[#111714] flex flex-col items-center justify-center p-6 text-center">
                    <Sparkles className="w-10 h-10 text-[#39FF14] mb-3" />
                    <p className="text-base font-bold text-[#F3F7F4]">{activeSlide.title}</p>
                    <p className="text-xs text-[#A3B3A8] mt-1">{activeSlide.subtitle}</p>
                  </div>
                )}

                {/* Prev / Next Overlay Controls for Quick Mobile Tap */}
                {filteredSlides.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrev}
                      aria-label="Banner sebelumnya"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-[#090B0A]/85 hover:bg-[#39FF14] text-[#F3F7F4] hover:text-[#070A08] border border-white/15 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      aria-label="Banner berikutnya"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-[#090B0A]/85 hover:bg-[#39FF14] text-[#F3F7F4] hover:text-[#070A08] border border-white/15 flex items-center justify-center justify-items-center transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Slide Explanation & Action */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/10 bg-[#121714]">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#A3B3A8] mb-3">
                    <span>
                      Kategori: <strong className="text-[#39FF14]">{activeSlide.category}</strong>
                    </span>
                    <span className="font-mono-num">
                      Slide {safeIndex + 1} / {filteredSlides.length}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-[#F3F7F4] mb-2.5 leading-snug">
                    {activeSlide.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#A3B3A8] leading-relaxed mb-4">
                    {activeSlide.subtitle}
                  </p>

                  {/* Optional Promo Schedule End Notice if the slide has an active endAt */}
                  {activeSlide.endAt && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16211A] border border-[#39FF14]/25 text-xs text-[#D1DDD5] mb-4">
                      <Calendar className="w-3.5 h-3.5 text-[#39FF14] shrink-0" />
                      <span>
                        Berlaku s/d: <strong className="text-[#F3F7F4]">{formatJakartaDateTime(activeSlide.endAt)}</strong>
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={safeTargetUrl}
                      target={safeTargetUrl.startsWith('#') ? undefined : '_blank'}
                      rel={safeTargetUrl.startsWith('#') ? undefined : 'noopener noreferrer'}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#39FF14] hover:bg-[#2ee00e] text-[#070A08] font-bold text-sm transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>{buttonLabel}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    {filteredSlides.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setIsPaused((p) => !p)}
                        className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-[#F3F7F4] text-xs font-medium border border-white/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        {isPaused ? (
                          <>
                            <Play className="w-3.5 h-3.5 text-[#39FF14]" />
                            <span>Lanjutkan Slide</span>
                          </>
                        ) : (
                          <>
                            <Pause className="w-3.5 h-3.5 text-[#39FF14]" />
                            <span>Jeda Otomatis</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Slide Thumbnails / Dots */}
                  <div className="pt-3 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto pb-1">
                    {filteredSlides.map((slide, idx) => {
                      const isCurrent = idx === safeIndex;
                      return (
                        <button
                          key={slide.id}
                          type="button"
                          onClick={() => setCurrentIndex(idx)}
                          aria-label={`Pilih slide ${idx + 1}: ${slide.title}`}
                          className={`h-2.5 rounded-full transition-all shrink-0 cursor-pointer ${
                            isCurrent
                              ? 'w-8 bg-[#39FF14]'
                              : 'w-2.5 bg-white/20 hover:bg-white/40'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Safe Fallback Card when no slide in the selected category or when all DB slides are expired/archived */
          <div className="rounded-2xl border border-white/10 bg-[#101512] p-8 sm:p-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#16221B] border border-[#39FF14]/30 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6 text-[#39FF14]" />
            </div>
            <div className="max-w-lg mx-auto space-y-1.5">
              <h3 className="text-lg sm:text-xl font-bold text-[#F3F7F4]">
                {selectedCategory !== 'Semua'
                  ? `Belum Ada Banner Aktif di Kategori "${selectedCategory}"`
                  : 'Informasi Layanan Resmi NJR CELL Siap Melayani Anda'}
              </h3>
              <p className="text-xs sm:text-sm text-[#A3B3A8] leading-relaxed">
                {selectedCategory !== 'Semua'
                  ? 'Silakan pilih kategori "Semua" untuk melihat promosi lain yang sedang tayang, atau hubungi konter kami melalui WhatsApp.'
                  : 'Saat ini tidak ada banner promosi terjadwal yang sedang aktif. Seluruh layanan transaksi digital 24 jam, Mandiri Agen, dan Agen BRILink tetap beroperasi normal.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {selectedCategory !== 'Semua' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('Semua')}
                  className="px-4 py-2.5 rounded-xl bg-[#39FF14] text-[#070A08] font-bold text-xs sm:text-sm hover:bg-[#2ee00e] transition-colors cursor-pointer"
                >
                  Tampilkan Semua Kategori
                </button>
              )}
              <a
                href={BRAND_INFO.buylinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#F3F7F4] font-semibold text-xs sm:text-sm border border-white/15 transition-colors"
              >
                <span>Buka Portal Buylink 24 Jam</span>
                <ExternalLink className="w-4 h-4 text-[#39FF14]" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* CMS Admin Slideshow Modal */}
      <AdminSlideshowModal
        isOpen={isAdminModalOpen}
        onClose={handleCloseAdminModal}
        slides={isUsingFallback ? FALLBACK_CMS_SLIDES : cmsSlides}
        isUsingFallback={isUsingFallback}
      />
    </section>
  );
};
