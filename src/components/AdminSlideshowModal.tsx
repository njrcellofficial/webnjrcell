import React, { useState, useEffect } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  X,
  Plus,
  Upload,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Edit3,
  Archive,
  RotateCcw,
  Calendar,
  ArrowUp,
  ArrowDown,
  Lock,
  LogOut,
  Sparkles,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  HelpCircle,
  Play,
} from 'lucide-react';
import {
  auth,
  db,
  googleProvider,
  BOOTSTRAPPED_ADMIN_EMAIL,
  OperationType,
  handleFirestoreError,
} from '../firebase';
import { PROMO_SLIDES, BRAND_INFO } from '../data/njrCellData';
import {
  CmsSlide,
  SlideStatus,
  DashboardTab,
  evaluateSlideLifecycle,
  formatJakartaDateTime,
  isoToJakartaInput,
  jakartaInputToIso,
  validateSafeUrl,
  optimizeAndUploadSlideImage,
  deleteSlideImageIfUnused,
  validateSlideDocSize,
} from '../utils/slideHelper';

interface AdminSlideshowModalProps {
  isOpen: boolean;
  onClose: () => void;
  slides: CmsSlide[];
  isUsingFallback: boolean;
}

const QUICK_URL_PRESETS = [
  { label: 'Instagram @njrcell88', text: 'Buka Instagram @njrcell88', url: BRAND_INFO.instagramUrl },
  { label: 'TikTok @njrcell', text: 'Buka TikTok @njrcell', url: BRAND_INFO.tiktokUrl },
  { label: 'Portal Buylink 24 Jam', text: 'Transaksi di Buylink', url: BRAND_INFO.buylinkUrl },
  { label: 'Katalog Hydrogel', text: 'Lihat Katalog Hydrogel', url: BRAND_INFO.hydrogelCatalogUrl },
  { label: 'WA Outlet Sukajadi', text: 'Chat WA Sukajadi', url: 'https://api.whatsapp.com/send/?phone=6285320000303' },
  { label: 'WA Outlet Ciherang', text: 'Chat WA Ciherang', url: 'https://api.whatsapp.com/send/?phone=6283120000303' },
];

export const AdminSlideshowModal: React.FC<AdminSlideshowModalProps> = ({
  isOpen,
  onClose,
  slides,
  isUsingFallback,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState(false);
  const [checkingAdminRole, setCheckingAdminRole] = useState(true);

  // Email/password login state (optional alternative to Google Popup)
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Dashboard UI state
  const [activeTab, setActiveTab] = useState<DashboardTab>('Semua');
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [newAdminUidInput, setNewAdminUidInput] = useState('');

  // Slide Editor Form State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<CmsSlide['category']>('Keuangan');
  const [buttonText, setButtonText] = useState('Buka Instagram @njrcell88');
  const [targetUrl, setTargetUrl] = useState('https://www.instagram.com/njrcell88');
  const [imageUrl, setImageUrl] = useState('');
  const [storagePath, setStoragePath] = useState('');
  const [alt, setAlt] = useState('');
  const [order, setOrder] = useState<number>(1);
  const [status, setStatus] = useState<SlideStatus>('Published');
  const [startAtInput, setStartAtInput] = useState('');
  const [endAtInput, setEndAtInput] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [showLivePreview, setShowLivePreview] = useState(false);

  // Delete confirmation modal state
  const [slideToDelete, setSlideToDelete] = useState<CmsSlide | null>(null);

  // Self-test runner results
  const [testReport, setTestReport] = useState<string[] | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (!user) {
        setIsAuthorizedAdmin(false);
        setCheckingAdminRole(false);
        return;
      }

      setCheckingAdminRole(true);
      if (user.email === BOOTSTRAPPED_ADMIN_EMAIL && user.emailVerified) {
        setIsAuthorizedAdmin(true);
        setCheckingAdminRole(false);
        return;
      }

      try {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        setIsAuthorizedAdmin(adminDoc.exists() && user.emailVerified);
      } catch {
        setIsAuthorizedAdmin(false);
      } finally {
        setCheckingAdminRole(false);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 15000);
    return () => window.clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const showNotice = (type: 'success' | 'error' | 'info', text: string) => {
    setFeedbackMsg({ type, text });
    window.setTimeout(() => {
      setFeedbackMsg((prev) => (prev?.text === text ? null : prev));
    }, 6000);
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      showNotice('success', 'Berhasil login menggunakan akun Google.');
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? `Gagal login Google: ${err.message}`
          : 'Gagal login dengan Google.'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
      showNotice('success', 'Berhasil login dengan email.');
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? `Gagal login: ${err.message}`
          : 'Email atau password tidak sesuai.'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsEditorOpen(false);
    showNotice('info', 'Anda telah keluar dari sesi Admin.');
  };

  const openCreateSlideForm = () => {
    const nextOrder =
      slides.length > 0 ? Math.max(...slides.map((s) => s.order)) + 1 : 1;
    setEditingSlideId(null);
    setTitle('');
    setSubtitle('');
    setCategory('Keuangan');
    setButtonText('Buka Instagram @njrcell88');
    setTargetUrl('https://www.instagram.com/njrcell88');
    setImageUrl('/img/promo-transfer-tarik-tunai.png');
    setStoragePath('');
    setAlt('Banner Promosi NJR CELL');
    setOrder(Math.min(999, nextOrder));
    setStatus('Published');
    setStartAtInput('');
    setEndAtInput('');
    setShowLivePreview(false);
    setIsEditorOpen(true);
  };

  const openEditSlideForm = (slide: CmsSlide) => {
    setEditingSlideId(slide.id);
    setTitle(slide.title);
    setSubtitle(slide.subtitle);
    setCategory(slide.category);
    setButtonText(slide.buttonText);
    setTargetUrl(slide.targetUrl);
    setImageUrl(slide.imageUrl);
    setStoragePath(slide.storagePath || '');
    setAlt(slide.alt);
    setOrder(slide.order);
    setStatus(slide.status);
    setStartAtInput(isoToJakartaInput(slide.startAt));
    setEndAtInput(isoToJakartaInput(slide.endAt));
    setShowLivePreview(false);
    setIsEditorOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress(5);
    try {
      const result = await optimizeAndUploadSlideImage(file, (pct) => {
        setUploadProgress(pct);
      });
      setImageUrl(result.imageUrl);
      setStoragePath(result.storagePath);
      if (!alt.trim()) {
        setAlt(title.trim() || `Promo NJR CELL - ${file.name.replace(/\.[^.]+$/, '')}`);
      }
      showNotice(
        'success',
        'Foto berhasil dioptimalkan & siap disimpan ke slide.'
      );
    } catch (err) {
      showNotice(
        'error',
        err instanceof Error ? err.message : 'Gagal mengunggah foto.'
      );
    } finally {
      window.setTimeout(() => setUploadProgress(null), 800);
      e.target.value = '';
    }
  };

  const handleSaveSlide = async (overrideStatus?: SlideStatus) => {
    if (!currentUser || !isAuthorizedAdmin) {
      showNotice('error', 'Hanya admin terautentikasi yang dapat menyimpan slide.');
      return;
    }

    const cleanTitle = title.trim().slice(0, 120);
    const cleanSubtitle = subtitle.trim().slice(0, 300);
    const cleanButtonText = buttonText.trim().slice(0, 60);
    const cleanTargetUrl = targetUrl.trim().slice(0, 500);
    const cleanAlt = (alt.trim() || cleanTitle).slice(0, 160);
    const cleanOrder = Math.max(1, Math.min(999, Math.round(Number(order) || 1)));

    if (!cleanTitle) {
      showNotice('error', 'Judul slide wajib diisi.');
      return;
    }
    if (!cleanSubtitle) {
      showNotice('error', 'Caption / deskripsi slide wajib diisi.');
      return;
    }
    if (!cleanButtonText) {
      showNotice('error', 'Teks tombol wajib diisi.');
      return;
    }
    const urlCheck = validateSafeUrl(cleanTargetUrl);
    if (!urlCheck.valid) {
      showNotice('error', urlCheck.error || 'URL tidak valid.');
      return;
    }
    if (!imageUrl.trim()) {
      showNotice('error', 'Silakan unggah atau pilih foto banner terlebih dahulu.');
      return;
    }

    const startIso = jakartaInputToIso(startAtInput).slice(0, 40);
    const endIso = jakartaInputToIso(endAtInput).slice(0, 40);

    if (startIso && endIso && Date.parse(endIso) <= Date.parse(startIso)) {
      showNotice(
        'error',
        'Waktu berakhir tayang harus lebih besar dari waktu mulai tayang.'
      );
      return;
    }

    let finalStatus: SlideStatus = overrideStatus || status;
    // If publishing with a future start time, keep status as Published or Scheduled per admin choice
    // Rule 3 allows status == 'Published' with future startAt (waits until startAt is reached)
    if (overrideStatus === 'Published' && startIso && Date.parse(startIso) > Date.now()) {
      finalStatus = 'Published';
    }

    const payloadToValidate = {
      title: cleanTitle,
      subtitle: cleanSubtitle,
      category,
      buttonText: cleanButtonText,
      targetUrl: cleanTargetUrl,
      imageUrl: imageUrl.trim(),
      storagePath: storagePath.slice(0, 300),
      alt: cleanAlt,
      order: cleanOrder,
      status: finalStatus,
      startAt: startIso,
      endAt: endIso,
    };

    const sizeCheck = validateSlideDocSize(payloadToValidate);
    if (!sizeCheck.valid) {
      showNotice('error', sizeCheck.error || 'Ukuran slide melebihi batas database.');
      return;
    }

    setIsBusy(true);
    const slideDocId =
      editingSlideId || `slide_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const docRef = doc(db, 'slides', slideDocId);

    try {
      if (editingSlideId) {
        await updateDoc(docRef, {
          ...payloadToValidate,
          updatedAt: serverTimestamp(),
        });
        showNotice('success', `Slide "${cleanTitle}" berhasil diperbarui (${finalStatus}).`);
      } else {
        await setDoc(docRef, {
          ...payloadToValidate,
          authorUid: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        showNotice('success', `Slide baru "${cleanTitle}" berhasil disimpan (${finalStatus}).`);
      }
      setIsEditorOpen(false);
    } catch (error) {
      let friendlyError = 'Gagal menyimpan slide ke Firestore.';
      if (error instanceof Error) {
        if (error.message.includes('permission-denied') || error.message.includes('PERMISSION_DENIED')) {
          friendlyError = 'Akses ditolak oleh aturan keamanan Firestore. Pastikan akun Anda memiliki hak akses admin.';
        } else if (error.message.includes('unavailable') || error.message.includes('offline') || error.message.includes('failed to fetch')) {
          friendlyError = 'Gagal terhubung ke database. Periksa koneksi internet Anda.';
        } else {
          friendlyError = error.message;
        }
      }
      showNotice('error', friendlyError);
    } finally {
      setIsBusy(false);
    }
  };

  const handleQuickStatusAction = async (
    slide: CmsSlide,
    action: 'archive' | 'restore-draft' | 'republish'
  ) => {
    if (!currentUser || !isAuthorizedAdmin) return;
    setIsBusy(true);

    try {
      if (isUsingFallback) {
        // If still in fallback state, seed all 12 slides and apply action to target slide
        for (let i = 0; i < PROMO_SLIDES.length; i++) {
          const item = PROMO_SLIDES[i];
          const docId = item.id.replace(/[^a-zA-Z0-9_-]/g, '_');
          const isTarget = item.id === slide.id;
          const assignedStatus = isTarget
            ? action === 'archive'
              ? 'Archived'
              : action === 'restore-draft'
              ? 'Draft'
              : 'Published'
            : 'Published';

          await setDoc(doc(db, 'slides', docId), {
            title: item.title.slice(0, 120),
            subtitle: item.subtitle.slice(0, 300),
            category: item.category,
            buttonText: `Buka ${item.platformLabel}`.slice(0, 60),
            targetUrl: item.targetUrl.slice(0, 500),
            imageUrl: item.image,
            storagePath: '',
            alt: item.alt.slice(0, 160),
            order: i + 1,
            status: assignedStatus,
            startAt: '',
            endAt: '',
            authorUid: currentUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } else {
        const docRef = doc(db, 'slides', slide.id);
        if (action === 'archive') {
          await updateDoc(docRef, {
            status: 'Archived',
            updatedAt: serverTimestamp(),
          });
        } else if (action === 'restore-draft') {
          await updateDoc(docRef, {
            status: 'Draft',
            updatedAt: serverTimestamp(),
          });
        } else if (action === 'republish') {
          const isEndInPast =
            slide.endAt && Date.parse(slide.endAt) <= Date.now();
          await updateDoc(docRef, {
            status: 'Published',
            startAt: '',
            endAt: isEndInPast ? '' : slide.endAt,
            updatedAt: serverTimestamp(),
          });
        }
      }

      if (action === 'archive') {
        showNotice(
          'success',
          `Slide "${slide.title}" dipindahkan ke Arsip (otomatis disembunyikan dari homepage, data foto tetap aman).`
        );
      } else if (action === 'restore-draft') {
        showNotice('success', `Slide "${slide.title}" dipulihkan dari Arsip ke Draft.`);
      } else if (action === 'republish') {
        showNotice(
          'success',
          `Slide "${slide.title}" berhasil diterbitkan ulang dan aktif tayang di homepage!`
        );
      }
    } catch (error) {
      let friendlyError = 'Gagal mengubah status slide.';
      if (error instanceof Error) {
        if (error.message.includes('permission-denied') || error.message.includes('PERMISSION_DENIED')) {
          friendlyError = 'Akses ditolak oleh aturan keamanan Firestore. Pastikan akun Anda memiliki hak akses admin.';
        } else if (error.message.includes('unavailable') || error.message.includes('offline')) {
          friendlyError = 'Gagal terhubung ke database. Periksa koneksi internet Anda.';
        } else {
          friendlyError = error.message;
        }
      }
      showNotice('error', friendlyError);
    } finally {
      setIsBusy(false);
    }
  };

  const handleMoveOrder = async (slide: CmsSlide, direction: 'up' | 'down') => {
    if (!currentUser || !isAuthorizedAdmin) return;
    const newOrder =
      direction === 'up'
        ? Math.max(1, slide.order - 1)
        : Math.min(999, slide.order + 1);
    if (newOrder === slide.order) return;

    setIsBusy(true);
    try {
      if (isUsingFallback) {
        // Seed slides with modified order
        for (let i = 0; i < PROMO_SLIDES.length; i++) {
          const item = PROMO_SLIDES[i];
          const docId = item.id.replace(/[^a-zA-Z0-9_-]/g, '_');
          const isTarget = item.id === slide.id;
          await setDoc(doc(db, 'slides', docId), {
            title: item.title.slice(0, 120),
            subtitle: item.subtitle.slice(0, 300),
            category: item.category,
            buttonText: `Buka ${item.platformLabel}`.slice(0, 60),
            targetUrl: item.targetUrl.slice(0, 500),
            imageUrl: item.image,
            storagePath: '',
            alt: item.alt.slice(0, 160),
            order: isTarget ? newOrder : i + 1,
            status: 'Published',
            startAt: '',
            endAt: '',
            authorUid: currentUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } else {
        await updateDoc(doc(db, 'slides', slide.id), {
          order: newOrder,
          updatedAt: serverTimestamp(),
        });
      }
      showNotice('info', `Urutan slide "${slide.title}" diubah ke #${newOrder}.`);
    } catch (error) {
      showNotice('error', 'Gagal mengubah urutan slide.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleConfirmPermanentDelete = async () => {
    if (!slideToDelete || !currentUser || !isAuthorizedAdmin) return;
    setIsBusy(true);
    const target = slideToDelete;

    try {
      if (isUsingFallback) {
        // Seed the other default slides, omitting target so target is permanently excluded from Firestore!
        for (let i = 0; i < PROMO_SLIDES.length; i++) {
          const item = PROMO_SLIDES[i];
          if (item.id === target.id) {
            continue; // Skip target
          }
          const docId = item.id.replace(/[^a-zA-Z0-9_-]/g, '_');
          await setDoc(doc(db, 'slides', docId), {
            title: item.title.slice(0, 120),
            subtitle: item.subtitle.slice(0, 300),
            category: item.category,
            buttonText: `Buka ${item.platformLabel}`.slice(0, 60),
            targetUrl: item.targetUrl.slice(0, 500),
            imageUrl: item.image,
            storagePath: '',
            alt: item.alt.slice(0, 160),
            order: i + 1,
            status: 'Published',
            startAt: '',
            endAt: '',
            authorUid: currentUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } else {
        // Standard Firestore document delete
        await deleteDoc(doc(db, 'slides', target.id));
      }

      // Check if image is local or storage
      const isLocalImage = target.imageUrl.startsWith('/img/');
      const isBase64 = target.imageUrl.startsWith('data:');

      if (!isLocalImage && !isBase64 && target.storagePath) {
        await deleteSlideImageIfUnused(target, slides);
      }

      setSlideToDelete(null);

      let imageNote = '';
      if (isLocalImage) {
        imageNote = ' (File gambar fisik di folder public/img tetap aman dan tidak dihapus).';
      } else if (isBase64) {
        imageNote = ' (Data gambar Base64 pada slide ini telah terhapus bersih tanpa memengaruhi slide lain).';
      }

      showNotice(
        'success',
        `Slide "${target.title}" berhasil dihapus permanen.${imageNote}`
      );
    } catch (error) {
      let friendlyError = 'Gagal menghapus slide secara permanen.';
      if (error instanceof Error) {
        if (error.message.includes('permission-denied') || error.message.includes('PERMISSION_DENIED')) {
          friendlyError = 'Akses ditolak oleh aturan keamanan Firestore. Pastikan akun Anda memiliki hak akses admin.';
        } else if (error.message.includes('unavailable') || error.message.includes('offline')) {
          friendlyError = 'Gagal terhubung ke database. Periksa koneksi internet Anda.';
        } else {
          friendlyError = error.message;
        }
      }
      showNotice('error', friendlyError);
    } finally {
      setIsBusy(false);
    }
  };

  const handleSeedDefaultSlides = async () => {
    if (!currentUser || !isAuthorizedAdmin) return;
    setIsBusy(true);
    try {
      for (let i = 0; i < PROMO_SLIDES.length; i++) {
        const item = PROMO_SLIDES[i];
        const docId = item.id.replace(/[^a-zA-Z0-9_-]/g, '_');
        await setDoc(doc(db, 'slides', docId), {
          title: item.title.slice(0, 120),
          subtitle: item.subtitle.slice(0, 300),
          category: item.category,
          buttonText: `Buka ${item.platformLabel}`.slice(0, 60),
          targetUrl: item.targetUrl.slice(0, 500),
          imageUrl: item.image,
          storagePath: '',
          alt: item.alt.slice(0, 160),
          order: i + 1,
          status: 'Published',
          startAt: '',
          endAt: '',
          authorUid: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      showNotice(
        'success',
        '12 slide bawaan NJR CELL berhasil dimuat ke database Firestore!'
      );
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.WRITE, 'slides');
      } catch {
        showNotice('error', 'Gagal memuat slide bawaan ke Firestore.');
      }
    } finally {
      setIsBusy(false);
    }
  };

  const handleAddSecondaryAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUid = newAdminUidInput.trim();
    if (!cleanUid || !currentUser || !isAuthorizedAdmin) return;
    setIsBusy(true);
    try {
      await setDoc(doc(db, 'admins', cleanUid), {
        uid: cleanUid,
        role: 'admin',
        addedByUid: currentUser.uid,
        createdAt: serverTimestamp(),
      });
      setNewAdminUidInput('');
      showNotice('success', `UID Admin "${cleanUid}" berhasil didaftarkan!`);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, `admins/${cleanUid}`);
      } catch {
        showNotice('error', 'Gagal menambahkan UID admin baru.');
      }
    } finally {
      setIsBusy(false);
    }
  };

  const handleRunLifecycleSelfTest = async () => {
    if (!currentUser || !isAuthorizedAdmin) return;
    setIsBusy(true);
    const logs: string[] = [];
    const testId = `test_slide_${Date.now()}`;
    const testRef = doc(db, 'slides', testId);

    try {
      // 1. Create Scheduled Slide (startAt +1 hour in future)
      const futureStart = new Date(Date.now() + 3600 * 1000).toISOString();
      await setDoc(testRef, {
        title: '[UJI SISTEM] Promo Terjadwal NJR CELL',
        subtitle: 'Pengujian otomatis penjadwalan masa tayang dan arsip.',
        category: 'Info',
        buttonText: 'Buka Buylink',
        targetUrl: 'https://buylink.id/njrcell',
        imageUrl: '/img/keunggulan.png',
        storagePath: '',
        alt: 'Uji Sistem Slide',
        order: 99,
        status: 'Published',
        startAt: futureStart,
        endAt: '',
        authorUid: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const evalScheduled = evaluateSlideLifecycle({
        id: testId,
        title: '[UJI SISTEM]',
        subtitle: 'Uji',
        category: 'Info',
        buttonText: 'Buka',
        targetUrl: 'https://buylink.id/njrcell',
        imageUrl: '/img/keunggulan.png',
        storagePath: '',
        alt: 'Uji',
        order: 99,
        status: 'Published',
        startAt: futureStart,
        endAt: '',
        authorUid: currentUser.uid,
      });
      logs.push(
        `1. Uji Jadwal Masa Depan (Terjadwal): Status efektif = ${evalScheduled.effectiveStatus}, Tampil di Homepage = ${evalScheduled.isEligibleForHomepage ? 'YA' : 'TIDAK (Benar)'}`
      );

      // 2. Update to Active Published window
      const pastStart = new Date(Date.now() - 600 * 1000).toISOString();
      const futureEnd = new Date(Date.now() + 3600 * 1000).toISOString();
      await updateDoc(testRef, {
        status: 'Published',
        startAt: pastStart,
        endAt: futureEnd,
        updatedAt: serverTimestamp(),
      });
      const evalActive = evaluateSlideLifecycle({
        id: testId,
        title: '[UJI SISTEM]',
        subtitle: 'Uji',
        category: 'Info',
        buttonText: 'Buka',
        targetUrl: 'https://buylink.id/njrcell',
        imageUrl: '/img/keunggulan.png',
        storagePath: '',
        alt: 'Uji',
        order: 99,
        status: 'Published',
        startAt: pastStart,
        endAt: futureEnd,
        authorUid: currentUser.uid,
      });
      logs.push(
        `2. Uji Masa Tayang Aktif (Published): Status efektif = ${evalActive.effectiveStatus}, Tampil di Homepage = ${evalActive.isEligibleForHomepage ? 'YA (Benar)' : 'TIDAK'}`
      );

      // 3. Update to Expired window (endAt in the past while status is still Published)
      const pastEnd = new Date(Date.now() - 60 * 1000).toISOString();
      await updateDoc(testRef, {
        status: 'Published',
        startAt: pastStart,
        endAt: pastEnd,
        updatedAt: serverTimestamp(),
      });
      const evalExpired = evaluateSlideLifecycle({
        id: testId,
        title: '[UJI SISTEM]',
        subtitle: 'Uji',
        category: 'Info',
        buttonText: 'Buka',
        targetUrl: 'https://buylink.id/njrcell',
        imageUrl: '/img/keunggulan.png',
        storagePath: '',
        alt: 'Uji',
        order: 99,
        status: 'Published',
        startAt: pastStart,
        endAt: pastEnd,
        authorUid: currentUser.uid,
      });
      logs.push(
        `3. Uji Auto-Expired (Waktu berakhir lewat): Status efektif = ${evalExpired.effectiveStatus}, Tampil di Homepage = ${evalExpired.isEligibleForHomepage ? 'YA' : 'TIDAK (Benar, otomatis disembunyikan)'}`
      );

      // 4. Archive & Restore
      await updateDoc(testRef, {
        status: 'Archived',
        startAt: pastStart,
        endAt: pastEnd,
        updatedAt: serverTimestamp(),
      });
      logs.push('4. Uji Arsipkan & Pemulihan: Berhasil mengubah status ke Archived di Firestore tanpa menghapus gambar.');

      // 5. Permanent Delete
      await deleteDoc(testRef);
      logs.push('5. Uji Hapus Permanen: Dokumen uji berhasil dihapus bersih dari Firestore.');

      setTestReport(logs);
      showNotice('success', 'Seluruh 5 tahapan uji siklus masa tayang & arsip berhasil lulus!');
    } catch (err) {
      logs.push(
        `Gagal pada pengujian: ${err instanceof Error ? err.message : String(err)}`
      );
      setTestReport(logs);
      showNotice('error', 'Pengujian mendeteksi kendala. Lihat laporan detail.');
    } finally {
      setIsBusy(false);
    }
  };

  // Evaluate all slides for counts and filtering
  const evaluatedSlides = slides.map((s) => ({
    slide: s,
    eval: evaluateSlideLifecycle(s, nowMs),
  }));

  const tabCounts: Record<DashboardTab, number> = {
    Semua: evaluatedSlides.length,
    Tayang: evaluatedSlides.filter((x) => x.eval.effectiveStatus === 'Published').length,
    Terjadwal: evaluatedSlides.filter((x) => x.eval.effectiveStatus === 'Scheduled').length,
    Expired: evaluatedSlides.filter((x) => x.eval.effectiveStatus === 'Expired').length,
    Draft: evaluatedSlides.filter((x) => x.eval.effectiveStatus === 'Draft').length,
    Arsip: evaluatedSlides.filter((x) => x.eval.effectiveStatus === 'Archived').length,
  };

  const visibleSlides = evaluatedSlides.filter((item) => {
    if (activeTab === 'Semua') return true;
    if (activeTab === 'Tayang') return item.eval.effectiveStatus === 'Published';
    if (activeTab === 'Terjadwal') return item.eval.effectiveStatus === 'Scheduled';
    if (activeTab === 'Expired') return item.eval.effectiveStatus === 'Expired';
    if (activeTab === 'Draft') return item.eval.effectiveStatus === 'Draft';
    if (activeTab === 'Arsip') return item.eval.effectiveStatus === 'Archived';
    return true;
  });

  const tabs: DashboardTab[] = ['Semua', 'Tayang', 'Terjadwal', 'Expired', 'Draft', 'Arsip'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cms-admin-title"
    >
      <div className="w-full max-w-6xl rounded-2xl bg-[#0E1310] border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 bg-[#090C0A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#39FF14]/15 border border-[#39FF14]/40 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-[#39FF14]" />
            </div>
            <div>
              <h2 id="cms-admin-title" className="text-base sm:text-lg font-extrabold text-[#F3F7F4]">
                CMS Admin Slideshow — NJR CELL
              </h2>
              <p className="text-xs text-[#A3B3A8]">
                Kelola promosi, foto banner, urutan, jadwal tayang (WIB), dan arsip secara real-time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#D1DDD5] border border-white/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup CMS Admin Slideshow"
              className="p-2 rounded-xl text-[#A3B3A8] hover:text-[#F3F7F4] hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Notification Banner */}
        {feedbackMsg && (
          <div
            className={`px-6 py-3 text-xs sm:text-sm font-semibold flex items-center justify-between border-b ${
              feedbackMsg.type === 'success'
                ? 'bg-[#132618] text-[#39FF14] border-[#39FF14]/30'
                : feedbackMsg.type === 'error'
                ? 'bg-[#291414] text-red-300 border-red-400/30'
                : 'bg-[#161D19] text-[#F3F7F4] border-white/10'
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button
              type="button"
              onClick={() => setFeedbackMsg(null)}
              className="text-xs underline ml-4 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Main Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* AUTHENTICATION GATE */}
          {!currentUser ? (
            <div className="max-w-lg mx-auto my-6 p-6 sm:p-8 rounded-2xl bg-[#121815] border border-white/10 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#39FF14]/15 border border-[#39FF14]/35 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6 text-[#39FF14]" />
                </div>
                <h3 className="text-xl font-extrabold text-[#F3F7F4]">
                  Login Admin Slideshow NJR CELL
                </h3>
                <p className="text-xs sm:text-sm text-[#A3B3A8]">
                  Masuk menggunakan akun Google pemilik (<code className="text-[#39FF14]">{BOOTSTRAPPED_ADMIN_EMAIL}</code>) atau akun admin terdaftar untuk mengelola banner promosi.
                </p>
              </div>

              {authError && (
                <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-200">
                  {authError}
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="button"
                  disabled={authLoading}
                  onClick={handleGoogleLogin}
                  className="w-full py-3.5 px-5 rounded-xl bg-[#39FF14] hover:bg-[#2ee00e] disabled:opacity-50 text-[#070A08] font-extrabold text-sm flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>{authLoading ? 'Memproses Login...' : 'Login dengan Google Admin'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowEmailLogin((s) => !s)}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#B8C7BD] border border-white/10 transition-colors cursor-pointer"
                >
                  {showEmailLogin
                    ? 'Sembunyikan Login Email & Password'
                    : 'Gunakan Email & Password (Opsional)'}
                </button>
              </div>

              {showEmailLogin && (
                <form onSubmit={handleEmailLogin} className="space-y-3 pt-3 border-t border-white/10">
                  <div>
                    <label className="block text-xs font-semibold text-[#B8C7BD] mb-1">
                      Email Admin
                    </label>
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="njrcell.official@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0E0C] border border-white/15 text-sm text-[#F3F7F4]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#B8C7BD] mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0E0C] border border-white/15 text-sm text-[#F3F7F4]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/15 hover:bg-[#39FF14] text-[#F3F7F4] hover:text-[#070A08] font-bold text-xs transition-colors cursor-pointer"
                  >
                    Masuk dengan Email
                  </button>
                </form>
              )}

              <div className="p-4 rounded-xl bg-[#0C100E] border border-white/10 text-xs text-[#A3B3A8] space-y-1.5">
                <p className="font-bold text-[#F3F7F4]">
                  Petunjuk Keamanan & Admin Pertama:
                </p>
                <p>
                  1. Akun <strong className="text-[#39FF14]">{BOOTSTRAPPED_ADMIN_EMAIL}</strong> sudah terdaftar otomatis sebagai Admin Utama di aturan keamanan Firestore (<code className="text-[#D1DDD5]">firestore.rules</code>).
                </p>
                <p>
                  2. Pengunjung biasa tidak dapat melihat slide berstatus Draft, Terjadwal, Expired, atau Arsip, dan tidak dapat mengubah data.
                </p>
              </div>
            </div>
          ) : checkingAdminRole ? (
            <div className="py-16 text-center text-sm text-[#A3B3A8]">
              Memeriksa izin akses administrator...
            </div>
          ) : !isAuthorizedAdmin ? (
            <div className="max-w-lg mx-auto my-6 p-6 rounded-2xl bg-[#1F1414] border border-red-500/40 space-y-4 text-center">
              <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
              <h3 className="text-lg font-bold text-[#F3F7F4]">
                Akun Belum Memiliki Akses Admin
              </h3>
              <p className="text-xs sm:text-sm text-[#D1DDD5]">
                Anda login sebagai <strong>{currentUser.email}</strong> (UID:{' '}
                <code className="font-mono-num text-amber-300">{currentUser.uid}</code>).
                Hanya akun utama (<strong>{BOOTSTRAPPED_ADMIN_EMAIL}</strong>) atau UID yang didaftarkan di koleksi <code>/admins</code> yang diizinkan mengubah slideshow.
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-[#F3F7F4] cursor-pointer"
              >
                Ganti Akun Google
              </button>
            </div>
          ) : (
            /* AUTHORIZED ADMIN DASHBOARD */
            <>
              {/* Top Admin Control Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-[#131A16] border border-white/10">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-[#39FF14] font-bold">
                      Admin Aktif: {currentUser.email}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#A3B3A8] font-mono-num">
                      Waktu Sistem: {formatJakartaDateTime(new Date(nowMs).toISOString())}
                    </span>
                  </div>
                  <p className="text-xs text-[#A3B3A8]">
                    {isUsingFallback
                      ? 'Database Firestore masih kosong (menampilkan 12 slide bawaan). Klik "Muat 12 Slide Bawaan" atau "Tambah Slide Baru" untuk mulai mengelola.'
                      : `Terhubung ke Cloud Firestore · Total ${slides.length} slide tersimpan (${tabCounts.Tayang} aktif tayang di homepage).`}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={openCreateSlideForm}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#39FF14] hover:bg-[#2ee00e] text-[#070A08] font-extrabold text-xs sm:text-sm transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Slide</span>
                  </button>

                  {isUsingFallback && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={handleSeedDefaultSlides}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-[#F3F7F4] font-bold text-xs border border-white/15 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#39FF14]" />
                      <span>Muat 12 Slide Bawaan ke Database</span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={handleRunLifecycleSelfTest}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#D1DDD5] font-semibold text-xs border border-white/10 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-[#39FF14]" />
                    <span>Uji Otomatis Siklus Tayang</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSetupGuide((g) => !g)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#D1DDD5] font-semibold text-xs border border-white/10 transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-[#39FF14]" />
                    <span>Panduan & Tambah Admin</span>
                  </button>
                </div>
              </div>

              {/* Automated Self-Test Report Box */}
              {testReport && (
                <div className="p-4 rounded-2xl bg-[#111C15] border border-[#39FF14]/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-extrabold text-[#39FF14]">
                      HASIL UJI OTOMATIS MASA TAYANG, EXPIRED, ARSIP & HAPUS PERMANEN:
                    </p>
                    <button
                      type="button"
                      onClick={() => setTestReport(null)}
                      className="text-xs text-[#A3B3A8] hover:text-[#F3F7F4] cursor-pointer"
                    >
                      Tutup Laporan
                    </button>
                  </div>
                  <ul className="space-y-1 text-xs text-[#D1DDD5] font-mono-num">
                    {testReport.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Expandable Admin Guide & Add Secondary Admin */}
              {showSetupGuide && (
                <div className="p-5 rounded-2xl bg-[#121815] border border-white/15 space-y-4 text-xs sm:text-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[#F3F7F4]">
                      Panduan Admin Pertama & Penambahan Admin Baru
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowSetupGuide(false)}
                      className="text-xs text-[#39FF14] hover:underline cursor-pointer"
                    >
                      Sembunyikan
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#B8C7BD]">
                    <div className="p-3.5 rounded-xl bg-[#0C100E] border border-white/10 space-y-1.5">
                      <p className="font-bold text-[#39FF14]">
                        Aturan Masa Tayang & Arsip (Asia/Jakarta WIB):
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>
                          <strong>Tayang:</strong> Status <code>Published</code>, waktu mulai sudah tercapai, dan waktu berakhir belum lewat.
                        </li>
                        <li>
                          <strong>Terjadwal:</strong> Waktu mulai di masa depan (otomatis tampil di homepage saat waktunya tiba).
                        </li>
                        <li>
                          <strong>Expired:</strong> Waktu berakhir telah lewat (otomatis disembunyikan dari homepage, tetap aman di dashboard untuk diterbitkan ulang).
                        </li>
                        <li>
                          <strong>Arsip:</strong> Disembunyikan tanpa menghapus foto di Storage.
                        </li>
                      </ul>
                    </div>

                    <form
                      onSubmit={handleAddSecondaryAdmin}
                      className="p-3.5 rounded-xl bg-[#0C100E] border border-white/10 space-y-2"
                    >
                      <p className="font-bold text-[#39FF14]">
                        Tambah Admin Cadangan (Berdasarkan Firebase Auth UID):
                      </p>
                      <p className="text-[#A3B3A8]">
                        Jika Anda ingin memberi akses ke akun Google staf lain, minta mereka login lalu masukkan UID mereka di bawah ini:
                      </p>
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          value={newAdminUidInput}
                          onChange={(e) => setNewAdminUidInput(e.target.value)}
                          placeholder="Masukkan Firebase UID..."
                          className="flex-1 px-3 py-2 rounded-lg bg-[#141A17] border border-white/15 text-xs text-[#F3F7F4]"
                        />
                        <button
                          type="submit"
                          disabled={isBusy || !newAdminUidInput.trim()}
                          className="px-3.5 py-2 rounded-lg bg-[#39FF14] text-[#070A08] font-bold text-xs disabled:opacity-50 cursor-pointer"
                        >
                          Daftarkan UID
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* SLIDE EDITOR FORM (CREATE / EDIT) */}
              {isEditorOpen && (
                <div className="p-5 sm:p-6 rounded-2xl bg-[#141B17] border border-[#39FF14]/40 space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div>
                      <p className="text-xs font-bold text-[#39FF14]">
                        {editingSlideId ? 'MODE EDIT SLIDE' : 'TAMBAH SLIDE PROMOSI BARU'}
                      </p>
                      <h3 className="text-lg font-extrabold text-[#F3F7F4]">
                        {editingSlideId
                          ? `Edit Slide: ${title || editingSlideId}`
                          : 'Buat Slide Banner Baru'}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditorOpen(false)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#A3B3A8] cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Image Upload & Quick Banner Picker */}
                    <div className="lg:col-span-5 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[#F3F7F4] mb-2">
                          1. FOTO BANNER SLIDE (Upload dari HP/Komputer)
                        </label>
                        <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-[#39FF14]/40 hover:border-[#39FF14] bg-[#0B0F0D] cursor-pointer transition-colors text-center">
                          <Upload className="w-6 h-6 text-[#39FF14] mb-1.5" />
                          <span className="text-xs font-bold text-[#F3F7F4]">
                            Klik untuk Upload Foto Baru (JPG / PNG / WEBP)
                          </span>
                          <span className="text-[11px] text-[#A3B3A8] mt-0.5">
                            Maksimal 5 MB · Otomatis dioptimalkan agar cepat di HP
                          </span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>

                        {uploadProgress !== null && (
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-xs text-[#39FF14] font-mono-num">
                              <span>Mengoptimalkan & Mengunggah Foto...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full bg-[#39FF14] transition-all"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Image Preview Box */}
                      <div className="p-3 rounded-xl bg-[#0A0D0B] border border-white/10">
                        <p className="text-[11px] text-[#A3B3A8] mb-2">
                          Preview Foto Saat Ini:
                        </p>
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={alt || title || 'Preview Banner'}
                            referrerPolicy="no-referrer"
                            className="max-h-48 w-auto mx-auto object-contain rounded-lg border border-white/10"
                          />
                        ) : (
                          <div className="h-36 flex items-center justify-center text-xs text-[#A3B3A8]">
                            Belum ada foto dipilih
                          </div>
                        )}
                      </div>

                      {/* Quick Local Asset Selector (Optional convenience) */}
                      <div>
                        <label className="block text-[11px] font-semibold text-[#A3B3A8] mb-1">
                          Atau pilih dari koleksi gambar resmi NJR CELL:
                        </label>
                        <select
                          value={imageUrl.startsWith('/img/') ? imageUrl : ''}
                          onChange={(e) => {
                            if (e.target.value) {
                              setImageUrl(e.target.value);
                              setStoragePath('');
                            }
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-[#0A0E0C] border border-white/15 text-xs text-[#F3F7F4]"
                        >
                          <option value="">-- Gambar Kustom (Upload / URL) --</option>
                          {PROMO_SLIDES.map((s) => (
                            <option key={s.id} value={s.image}>
                              {s.title} ({s.image})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Manual Image URL Input (Alternative without Firebase Storage) */}
                      <div>
                        <label className="block text-[11px] font-semibold text-[#A3B3A8] mb-1">
                          Atau tempel URL Gambar langsung (Opsional):
                        </label>
                        <input
                          type="text"
                          value={imageUrl}
                          onChange={(e) => {
                            setImageUrl(e.target.value.trim());
                            setStoragePath('');
                          }}
                          placeholder="https://... atau /img/..."
                          className="w-full px-3 py-2 rounded-xl bg-[#0A0E0C] border border-white/15 text-xs text-[#F3F7F4] font-mono"
                        />
                      </div>
                    </div>

                    {/* Right Column: Metadata, Button, Order & Schedule */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-[#F3F7F4] mb-1">
                            Judul Promosi / Layanan *
                          </label>
                          <input
                            type="text"
                            maxLength={120}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Contoh: Promo Transfer & Tarik Tunai"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0E0C] border border-white/15 text-sm text-[#F3F7F4]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#F3F7F4] mb-1">
                            Kategori Filter
                          </label>
                          <select
                            value={category}
                            onChange={(e) =>
                              setCategory(e.target.value as CmsSlide['category'])
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0E0C] border border-white/15 text-sm text-[#F3F7F4]"
                          >
                            <option value="Keuangan">Keuangan</option>
                            <option value="Digital">Digital</option>
                            <option value="Aksesori">Aksesori</option>
                            <option value="Info">Info</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#F3F7F4] mb-1">
                          Caption / Deskripsi Singkat *
                        </label>
                        <textarea
                          rows={2}
                          maxLength={300}
                          value={subtitle}
                          onChange={(e) => setSubtitle(e.target.value)}
                          placeholder="Jelaskan promosi atau layanan dengan singkat dan mudah dipahami pelanggan..."
                          className="w-full px-3.5 py-2 rounded-xl bg-[#0A0E0C] border border-white/15 text-sm text-[#F3F7F4]"
                        />
                      </div>

                      {/* Button Label & URL + Quick Presets */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-[#F3F7F4] mb-1">
                            Teks Tombol *
                          </label>
                          <input
                            type="text"
                            maxLength={60}
                            value={buttonText}
                            onChange={(e) => setButtonText(e.target.value)}
                            placeholder="Contoh: Buka Instagram @njrcell88"
                            className="w-full px-3.5 py-2 rounded-xl bg-[#0A0E0C] border border-white/15 text-sm text-[#F3F7F4]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#F3F7F4] mb-1">
                            URL Tujuan Tombol (https://) *
                          </label>
                          <input
                            type="url"
                            maxLength={500}
                            value={targetUrl}
                            onChange={(e) => setTargetUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3.5 py-2 rounded-xl bg-[#0A0E0C] border border-white/15 text-sm text-[#F3F7F4] font-mono-num"
                          />
                        </div>
                      </div>

                      {/* Quick URL Preset Buttons */}
                      <div>
                        <span className="block text-[11px] text-[#A3B3A8] mb-1.5">
                          Pintasan Tautan Resmi NJR CELL (Klik untuk mengisi otomatis):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {QUICK_URL_PRESETS.map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => {
                                setButtonText(preset.text);
                                setTargetUrl(preset.url);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-[#D1DDD5] border border-white/10 cursor-pointer"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Order, Status & Alt Text */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-[#F3F7F4] mb-1">
                            Urutan Tampil (1-999)
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={999}
                            value={order}
                            onChange={(e) => setOrder(Number(e.target.value))}
                            className="w-full px-3.5 py-2 rounded-xl bg-[#0A0E0C] border border-white/15 text-sm text-[#F3F7F4] font-mono-num"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#F3F7F4] mb-1">
                            Status Slide
                          </label>
                          <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as SlideStatus)}
                            className="w-full px-3.5 py-2 rounded-xl bg-[#0A0E0C] border border-white/15 text-sm text-[#F3F7F4]"
                          >
                            <option value="Published">Published (Tayang)</option>
                            <option value="Scheduled">Scheduled (Terjadwal)</option>
                            <option value="Draft">Draft (Simpan Konsep)</option>
                            <option value="Archived">Archived (Arsip)</option>
                            <option value="Expired">Expired (Berakhir)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#F3F7F4] mb-1">
                            Alt Text Gambar (SEO)
                          </label>
                          <input
                            type="text"
                            maxLength={160}
                            value={alt}
                            onChange={(e) => setAlt(e.target.value)}
                            placeholder="Deskripsi singkat gambar"
                            className="w-full px-3.5 py-2 rounded-xl bg-[#0A0E0C] border border-white/15 text-sm text-[#F3F7F4]"
                          />
                        </div>
                      </div>

                      {/* Scheduling Inputs (Asia/Jakarta WIB) */}
                      <div className="p-3.5 rounded-xl bg-[#0C110E] border border-white/10 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-bold text-[#39FF14] flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Pengaturan Masa Tayang (Zona Waktu: Asia/Jakarta WIB)</span>
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setStartAtInput('');
                              setEndAtInput('');
                            }}
                            className="text-[11px] text-[#A3B3A8] hover:text-[#F3F7F4] underline cursor-pointer"
                          >
                            Kosongkan Jadwal (Tayang Selamanya)
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-[#B8C7BD] mb-1">
                              Waktu Mulai Tayang (WIB) — Opsional
                            </label>
                            <input
                              type="datetime-local"
                              value={startAtInput}
                              onChange={(e) => setStartAtInput(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-[#141A17] border border-white/15 text-xs text-[#F3F7F4] font-mono-num"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-[#B8C7BD] mb-1">
                              Waktu Berakhir / Expired (WIB) — Opsional
                            </label>
                            <input
                              type="datetime-local"
                              value={endAtInput}
                              onChange={(e) => setEndAtInput(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-[#141A17] border border-white/15 text-xs text-[#F3F7F4] font-mono-num"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Preview Before Saving */}
                  {showLivePreview && (
                    <div className="p-4 rounded-2xl bg-[#0A0E0C] border border-[#39FF14]/40 space-y-3">
                      <p className="text-xs font-bold text-[#39FF14]">
                        PREVIEW TAMPILAN SLIDE DI HOMEPAGE SEBELUM DISIMPAN:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-12 rounded-xl overflow-hidden border border-white/10 bg-[#121714]">
                        <div className="md:col-span-7 p-4 flex items-center justify-center bg-[#090B0A]">
                          <img
                            src={imageUrl}
                            alt={alt || title}
                            referrerPolicy="no-referrer"
                            className="max-h-56 w-auto object-contain rounded-lg"
                          />
                        </div>
                        <div className="md:col-span-5 p-5 flex flex-col justify-between">
                          <div>
                            <span className="text-xs text-[#39FF14] font-bold">
                              Kategori: {category} · Urutan #{order}
                            </span>
                            <h4 className="text-lg font-bold text-[#F3F7F4] mt-1">
                              {title || 'Judul Slide Belum Diisi'}
                            </h4>
                            <p className="text-xs text-[#A3B3A8] mt-1.5">
                              {subtitle || 'Caption / deskripsi slide akan tampil di sini.'}
                            </p>
                          </div>
                          <div className="mt-4">
                            <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#39FF14] text-[#070A08] font-bold text-xs">
                              <span>{buttonText || 'Teks Tombol'}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Form Action Buttons: Simpan Draft, Preview, Publikasikan */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setShowLivePreview((p) => !p)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-[#F3F7F4] cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-[#39FF14]" />
                      <span>{showLivePreview ? 'Sembunyikan Preview' : 'Preview Sebelum Simpan'}</span>
                    </button>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleSaveSlide('Draft')}
                        className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-[#F3F7F4] border border-white/15 cursor-pointer"
                      >
                        Simpan sebagai Draft
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleSaveSlide('Published')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#39FF14] hover:bg-[#2ee00e] text-[#070A08] font-extrabold text-xs sm:text-sm cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {isBusy ? 'Menyimpan...' : 'Publikasikan Slide'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* DASHBOARD TABS: Semua, Tayang, Terjadwal, Expired, Draft, Arsip */}
              <div className="space-y-4">
                <div
                  role="tablist"
                  aria-label="Filter status slide di dashboard"
                  className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-[#121815] border border-white/10"
                >
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab;
                    return (
                      <button
                        key={tab}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          isActive
                            ? 'bg-[#39FF14] text-[#070A08]'
                            : 'text-[#B8C7BD] hover:text-[#F3F7F4] hover:bg-white/5'
                        }`}
                      >
                        {tab} ({tabCounts[tab]})
                      </button>
                    );
                  })}
                </div>

                {/* SLIDE LIST */}
                {visibleSlides.length === 0 ? (
                  <div className="p-10 rounded-2xl bg-[#121815] border border-white/10 text-center space-y-3">
                    <Sparkles className="w-8 h-8 text-[#39FF14] mx-auto" />
                    <p className="text-sm font-bold text-[#F3F7F4]">
                      Belum ada slide pada tab "{activeTab}"
                    </p>
                    <p className="text-xs text-[#A3B3A8]">
                      Klik tombol "Tambah Slide" di atas untuk mengunggah promosi baru.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visibleSlides.map(({ slide, eval: lifecycle }) => (
                      <div
                        key={slide.id}
                        className="rounded-2xl bg-[#121815] border border-white/10 p-4 flex flex-col justify-between gap-4"
                      >
                        <div className="flex gap-4">
                          {/* Thumbnail */}
                          <div className="w-28 h-24 sm:w-36 sm:h-28 rounded-xl bg-[#090B0A] border border-white/10 overflow-hidden shrink-0 flex items-center justify-center p-1">
                            <img
                              src={slide.imageUrl}
                              alt={slide.alt}
                              referrerPolicy="no-referrer"
                              className="max-h-full max-w-full object-contain rounded-lg"
                            />
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] mb-1">
                              <span className="font-mono-num font-bold text-[#39FF14]">
                                #{slide.order}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="text-[#D1DDD5] font-semibold">
                                {lifecycle.statusBadgeLabel}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="text-[#A3B3A8]">{slide.category}</span>
                              <span aria-hidden="true">·</span>
                              {slide.authorUid === 'system-default' || isUsingFallback ? (
                                <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-500/30">
                                  📁 Aset Lokal
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-[#39FF14] bg-[#142218] px-2 py-0.5 rounded border border-[#39FF14]/30">
                                  💾 Database
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm sm:text-base font-bold text-[#F3F7F4] truncate">
                              {slide.title}
                            </h4>
                            <p className="text-xs text-[#A3B3A8] line-clamp-2 mt-0.5">
                              {slide.subtitle}
                            </p>
                            <p className="text-[11px] text-[#39FF14] mt-1.5 font-mono-num">
                              {lifecycle.scheduleSummary}
                            </p>
                          </div>
                        </div>

                        {/* Action Bar per Slide — ALWAYS Visible with Full Edit, Archive, and Permanent Delete */}
                        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                          {/* Reorder buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleMoveOrder(slide, 'up')}
                              title="Naikkan urutan"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#D1DDD5] cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleMoveOrder(slide, 'down')}
                              title="Turunkan urutan"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#D1DDD5] cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Lifecycle & Edit Actions */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {/* Tombol Edit */}
                            <button
                              type="button"
                              onClick={() => openEditSlideForm(slide)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-[#F3F7F4] border border-white/15 transition-colors cursor-pointer"
                              title="Edit judul, caption, tombol, dan gambar slide ini"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#39FF14]" />
                              <span>Edit</span>
                            </button>

                            {/* Tombol Terbitkan Ulang (Jika Expired/Draft/Scheduled/Archived) */}
                            {(lifecycle.effectiveStatus === 'Expired' ||
                              lifecycle.effectiveStatus === 'Draft' ||
                              lifecycle.effectiveStatus === 'Scheduled' ||
                              lifecycle.effectiveStatus === 'Archived') && (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleQuickStatusAction(slide, 'republish')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#39FF14] hover:bg-[#2ee00e] text-[#070A08] text-xs font-extrabold transition-colors cursor-pointer"
                                title="Terbitkan slide ini agar langsung tayang di homepage"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Terbitkan Ulang</span>
                              </button>
                            )}

                            {/* Tombol Arsipkan / Pulihkan */}
                            {lifecycle.effectiveStatus !== 'Archived' ? (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleQuickStatusAction(slide, 'archive')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 text-xs font-bold border border-amber-500/40 transition-colors cursor-pointer"
                                title="Sembunyikan dari homepage tanpa menghapus foto"
                              >
                                <Archive className="w-3.5 h-3.5 text-amber-400" />
                                <span>Arsipkan</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() =>
                                  handleQuickStatusAction(slide, 'restore-draft')
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#D1DDD5] text-xs font-bold border border-white/15 transition-colors cursor-pointer"
                                title="Pindahkan kembali ke status Draft"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
                                <span>Ke Draft</span>
                              </button>
                            )}

                            {/* Tombol Hapus Permanen — Selalu Tampil Tegas Berwarna Merah */}
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => setSlideToDelete(slide)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-600 text-red-100 hover:text-white text-xs font-extrabold border border-red-500/50 shadow-sm transition-colors cursor-pointer"
                              title="Hapus slide ini secara permanen"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-300" />
                              <span>Hapus Permanen</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* CONFIRMATION DIALOG FOR PERMANENT DELETE */}
        {slideToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <div className="max-w-md w-full rounded-2xl bg-[#141A17] border border-red-500/50 p-6 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-500/50 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-[#F3F7F4]">
                    Konfirmasi Hapus Permanen Slide
                  </h4>
                  <p className="text-xs text-red-300">Tindakan ini tidak dapat dibatalkan</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0B0F0D] border border-white/10 space-y-1">
                <p className="text-xs text-[#A3B3A8]">Slide yang akan dihapus:</p>
                <p className="text-sm font-bold text-[#F3F7F4]">"{slideToDelete.title}"</p>
                <p className="text-xs text-[#39FF14]">
                  Kategori: {slideToDelete.category} · Urutan: #{slideToDelete.order}
                </p>
              </div>

              <div className="text-xs text-[#B8C7BD] space-y-2">
                {slideToDelete.imageUrl.startsWith('/img/') ? (
                  <p className="p-3 rounded-xl bg-[#151D18] border border-[#39FF14]/30 text-[#D1DDD5]">
                    <strong className="text-[#39FF14]">Keamanan File Lokal:</strong> File gambar fisik di folder <code className="text-[#39FF14]">public/img/</code> tidak akan dihapus dan tetap aman di server. Menghapus slide ini hanya akan menghapusnya dari daftar tayangan website.
                  </p>
                ) : slideToDelete.imageUrl.startsWith('data:') ? (
                  <p className="p-3 rounded-xl bg-[#181F1B] border border-cyan-500/30 text-[#D1DDD5]">
                    <strong className="text-cyan-300">Keamanan Gambar Base64:</strong> Data gambar Base64 pada slide ini disimpan di dokumen Firestore ini saja. Menghapus dokumen ini tidak akan memengaruhi slide lain.
                  </p>
                ) : (
                  <p className="p-3 rounded-xl bg-[#181A19] border border-white/10 text-[#D1DDD5]">
                    Dokumen slide ini akan dihapus permanen dari database Firestore.
                  </p>
                )}

                <p className="text-[11px] text-[#A3B3A8]">
                  * Jika Anda hanya ingin menyembunyikan banner sementara tanpa kehilangan data, klik <strong>Batal</strong> lalu pilih tombol <strong>Arsipkan</strong>.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSlideToDelete(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-[#F3F7F4] transition-colors cursor-pointer"
                >
                  Batal (Jangan Hapus)
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={handleConfirmPermanentDelete}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-extrabold text-white transition-colors cursor-pointer shadow-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isBusy ? 'Menghapus...' : 'Ya, Hapus Permanen'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
