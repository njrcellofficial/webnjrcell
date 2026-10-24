import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';
import { PromoSlide } from '../data/njrCellData';

export type SlideStatus = 'Draft' | 'Scheduled' | 'Published' | 'Expired' | 'Archived';

export type DashboardTab = 'Semua' | 'Tayang' | 'Terjadwal' | 'Expired' | 'Draft' | 'Arsip';

export interface CmsSlide {
  id: string;
  title: string;
  subtitle: string;
  category: PromoSlide['category'];
  buttonText: string;
  targetUrl: string;
  imageUrl: string;
  storagePath: string;
  alt: string;
  order: number;
  status: SlideStatus;
  startAt: string; // ISO-8601 UTC string or ""
  endAt: string;   // ISO-8601 UTC string or ""
  authorUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface EffectiveSlideEvaluation {
  effectiveStatus: SlideStatus;
  isEligibleForHomepage: boolean;
  statusBadgeLabel: string;
  scheduleSummary: string;
}

/**
 * Formats an ISO-8601 date string into Asia/Jakarta (WIB) human-readable string.
 */
export function formatJakartaDateTime(isoString?: string): string {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';

  const formatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${formatter.format(date)} WIB`;
}

/**
 * Converts an ISO-8601 UTC string to YYYY-MM-DDTHH:mm in Asia/Jakarta (UTC+7)
 * for use inside <input type="datetime-local" />.
 */
export function isoToJakartaInput(isoString?: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';

  // Shift UTC timestamp by +7 hours to get Asia/Jakarta wall-clock components
  const jakartaMs = date.getTime() + 7 * 60 * 60 * 1000;
  const jakartaDate = new Date(jakartaMs);
  return jakartaDate.toISOString().slice(0, 16);
}

/**
 * Converts a YYYY-MM-DDTHH:mm string from <input type="datetime-local" />
 * (interpreted in Asia/Jakarta UTC+7) into a canonical UTC ISO-8601 string.
 */
export function jakartaInputToIso(inputVal?: string): string {
  if (!inputVal || !inputVal.trim()) return '';
  const clean = inputVal.trim();
  const parsed = new Date(`${clean}:00+07:00`);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString();
}

/**
 * Evaluates a slide's real-time lifecycle status and homepage eligibility.
 * Rules:
 * - Only appears on homepage if status === 'Published', startAt has arrived, and endAt has NOT passed.
 * - Slides whose endAt has passed are automatically treated as 'Expired' and hidden from homepage
 *   even if their stored status in Firestore is still 'Published' or 'Scheduled'.
 */
export function evaluateSlideLifecycle(
  slide: CmsSlide,
  nowMs: number = Date.now()
): EffectiveSlideEvaluation {
  const startMs = slide.startAt ? Date.parse(slide.startAt) : null;
  const endMs = slide.endAt ? Date.parse(slide.endAt) : null;

  const hasValidStart = startMs !== null && !Number.isNaN(startMs);
  const hasValidEnd = endMs !== null && !Number.isNaN(endMs);

  const isBeforeStart = hasValidStart && nowMs < startMs;
  const isPastEnd = hasValidEnd && nowMs > endMs;

  if (slide.status === 'Archived') {
    return {
      effectiveStatus: 'Archived',
      isEligibleForHomepage: false,
      statusBadgeLabel: 'Diarsipkan',
      scheduleSummary: 'Disimpan di arsip (tidak tampil di homepage)',
    };
  }

  if (slide.status === 'Draft') {
    return {
      effectiveStatus: 'Draft',
      isEligibleForHomepage: false,
      statusBadgeLabel: 'Draft',
      scheduleSummary: 'Belum dipublikasikan',
    };
  }

  if (slide.status === 'Expired' || isPastEnd) {
    return {
      effectiveStatus: 'Expired',
      isEligibleForHomepage: false,
      statusBadgeLabel: 'Expired (Masa Tayang Habis)',
      scheduleSummary: hasValidEnd
        ? `Berakhir pada ${formatJakartaDateTime(slide.endAt)}`
        : 'Masa tayang telah berakhir',
    };
  }

  if (slide.status === 'Scheduled' || (slide.status === 'Published' && isBeforeStart)) {
    return {
      effectiveStatus: 'Scheduled',
      isEligibleForHomepage: false,
      statusBadgeLabel: 'Terjadwal',
      scheduleSummary: hasValidStart
        ? `Mulai tayang ${formatJakartaDateTime(slide.startAt)}`
        : 'Menunggu jadwal tayang',
    };
  }

  // status === 'Published' && !isBeforeStart && !isPastEnd
  return {
    effectiveStatus: 'Published',
    isEligibleForHomepage: true,
    statusBadgeLabel: 'Tayang Aktif',
    scheduleSummary: hasValidEnd
      ? `Tayang s/d ${formatJakartaDateTime(slide.endAt)}`
      : 'Tayang aktif tanpa batas akhir',
  };
}

/**
 * Validates that a button URL is safe (http:// or https://) and cannot execute scripts.
 */
export function validateSafeUrl(url: string): { valid: boolean; error?: string } {
  const trimmed = url.trim();
  if (!trimmed) {
    return { valid: false, error: 'URL tujuan tombol wajib diisi.' };
  }
  if (trimmed.length > 500) {
    return { valid: false, error: 'URL terlalu panjang (maksimal 500 karakter).' };
  }
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return {
      valid: false,
      error: 'URL mengandung protokol berbahaya yang tidak diizinkan.',
    };
  }
  if (!/^(https?:\/\/|\/|#)/i.test(trimmed)) {
    return {
      valid: false,
      error: 'URL wajib diawali dengan https://, http://, atau anchor internal (# atau /).',
    };
  }
  return { valid: true };
}

/**
 * Compresses an uploaded image file on the client using HTML5 Canvas to an optimized WebP Base64 Data URL.
 * Guarantees zero billing, zero Firebase Storage dependency, and safe payload size (< 450 KB)
 * well within Cloud Firestore's 1 MiB document limit.
 */
export async function optimizeAndUploadSlideImage(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ imageUrl: string; storagePath: string }> {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Format file tidak didukung. Silakan gunakan foto JPG, PNG, atau WEBP.');
  }

  const maxRawSizeBytes = 5 * 1024 * 1024; // 5 MB
  if (file.size > maxRawSizeBytes) {
    throw new Error('Ukuran file asli terlalu besar (maksimal 5 MB).');
  }

  onProgress?.(25);

  // First pass: 1200px max dimension, WebP quality 0.80
  let { dataUrl } = await compressImageFile(file, 1200, 0.80);
  onProgress?.(65);

  // If payload exceeds 420 KB (~560,000 chars), perform second pass at 960px quality 0.72
  if (dataUrl.length > 560000) {
    const secondPass = await compressImageFile(file, 960, 0.72);
    dataUrl = secondPass.dataUrl;
  }

  // If still larger than 500 KB (~660,000 chars), perform compact pass at 800px quality 0.68
  if (dataUrl.length > 660000) {
    const compactPass = await compressImageFile(file, 800, 0.68);
    dataUrl = compactPass.dataUrl;
  }

  // Final safety check against Firestore 1 MiB document limit
  // 750,000 base64 chars is ~560 KB, leaving ~450 KB margin for all other metadata fields
  if (dataUrl.length > 750000) {
    throw new Error(
      'Gambar masih terlalu besar untuk disimpan langsung di dokumen database. Silakan gunakan gambar dengan resolusi lebih rendah.'
    );
  }

  onProgress?.(100);
  return { imageUrl: dataUrl, storagePath: '' };
}

/**
 * Validates estimated Firestore document size to guarantee safe storage under 1 MiB.
 */
export function validateSlideDocSize(slideData: Record<string, unknown>): {
  valid: boolean;
  estimatedBytes: number;
  error?: string;
} {
  const serialized = JSON.stringify(slideData);
  const estimatedBytes = new TextEncoder().encode(serialized).length;
  const maxSafeBytes = 900 * 1024; // 900 KB safe threshold (Firestore ceiling is 1,048,576 bytes)

  if (estimatedBytes > maxSafeBytes) {
    return {
      valid: false,
      estimatedBytes,
      error: `Ukuran dokumen banner (${Math.round(estimatedBytes / 1024)} KB) melebihi batas aman database Firestore (900 KB). Kurangi ukuran foto sebelum menyimpan.`,
    };
  }

  return { valid: true, estimatedBytes };
}

function compressImageFile(
  file: File,
  maxDimension: number,
  quality: number
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('File bukan gambar yang valid.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Gagal memproses kompresi gambar.'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Gagal mengonversi gambar.'));
              return;
            }
            resolve({ blob, dataUrl });
          },
          'image/webp',
          quality
        );
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Deletes the image from Firebase Storage ONLY if no other slide uses the same storagePath or imageUrl.
 */
export async function deleteSlideImageIfUnused(
  slideToDelete: CmsSlide,
  allSlides: CmsSlide[]
): Promise<boolean> {
  if (!slideToDelete.storagePath) return false;

  const isUsedByOtherSlide = allSlides.some(
    (other) =>
      other.id !== slideToDelete.id &&
      (other.storagePath === slideToDelete.storagePath ||
        other.imageUrl === slideToDelete.imageUrl)
  );

  if (isUsedByOtherSlide) {
    return false;
  }

  try {
    const fileRef = ref(storage, slideToDelete.storagePath);
    await deleteObject(fileRef);
    return true;
  } catch {
    return false;
  }
}
