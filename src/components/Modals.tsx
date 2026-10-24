import React, { useState, useEffect } from 'react';
import {
  X,
  MessageCircle,
  CheckCircle2,
  FileText,
  ClipboardCheck,
} from 'lucide-react';
import {
  BRAND_INFO,
  TERMS_AND_CONDITIONS,
  AUDIT_REPORT_SUMMARY,
} from '../data/njrCellData';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
}

const QUICK_TOPICS = [
  { id: 'umum', label: 'Tanya Layanan Umum', text: 'Halo NJR CELL, saya ingin bertanya mengenai layanan konter.' },
  { id: 'tarik-tunai', label: 'Transfer Bank / Tarik Tunai', text: 'Halo NJR CELL, saya ingin transaksi transfer bank / tarik tunai.' },
  { id: 'mandiri-agen', label: 'Mandiri Agen & BRILink (12400836)', text: 'Halo NJR CELL, saya ingin bertanya mengenai layanan Mandiri Agen / Agen BRILink (Kode Agen 12400836).' },
  { id: 'hydrogel', label: 'Pesan Pelindung Layar Hydrogel', text: 'Halo NJR CELL, saya ingin pesan / pasang pelindung layar hydrogel.' },
  { id: 'garskin', label: 'Pesan Garskin Custom', text: 'Halo NJR CELL, saya ingin pesan garskin HP custom.' },
  { id: 'voucher', label: 'Kartu Perdana / Voucher Fisik', text: 'Halo NJR CELL, saya ingin tanya stok kartu perdana / voucher fisik internet.' },
  { id: 'charger', label: 'Charger ROBOT/VIVAN & Aksesori', text: 'Halo NJR CELL, saya ingin tanya stok Charger ROBOT/VIVAN atau aksesori HP.' },
  { id: 'produk-konter', label: 'Minuman Dingin / Es Krim / Produk Konter', text: 'Halo NJR CELL, saya ingin tanya ketersediaan produk di konter (minuman dingin / es krim / produk harian).' },
];

export const WhatsAppSelectorModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  initialTopic = 'umum',
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState(initialTopic);

  useEffect(() => {
    setSelectedTopicId(initialTopic);
  }, [initialTopic]);

  if (!isOpen) return null;

  const activeTopic =
    QUICK_TOPICS.find((t) => t.id === selectedTopicId) || QUICK_TOPICS[0];

  const buildWaUrl = (phoneRaw: string) => {
    return `https://api.whatsapp.com/send?phone=${phoneRaw}&text=${encodeURIComponent(
      activeTopic.text
    )}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wa-modal-title"
    >
      <div className="w-full max-w-xl rounded-2xl bg-[#111613] border border-white/15 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0D110F]">
          <div>
            <h3 id="wa-modal-title" className="text-lg font-bold text-[#F3F7F4]">
              Hubungi WhatsApp Resmi NJR CELL
            </h3>
            <p className="text-xs text-[#A3B3A8]">
              Pilih keperluan Anda lalu klik outlet tujuan agar pesan otomatis tertulis
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela WhatsApp"
            className="p-2 rounded-lg text-[#A3B3A8] hover:text-[#F3F7F4] hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Step 1: Select Topic */}
          <div>
            <label className="block text-xs font-semibold text-[#39FF14] mb-2">
              1. PILIH KEPERLUAN ANDA:
            </label>
            <div className="flex flex-wrap gap-2">
              {QUICK_TOPICS.map((topic) => {
                const isSelected = topic.id === selectedTopicId;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setSelectedTopicId(topic.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#39FF14] text-[#070A08] font-bold'
                        : 'bg-[#171E1A] text-[#D1DDD5] hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {topic.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Choose Outlet WhatsApp */}
          <div>
            <label className="block text-xs font-semibold text-[#39FF14] mb-2.5">
              2. PILIH NOMOR WHATSAPP OUTLET RESMI:
            </label>
            <div className="space-y-3">
              {/* Outlet 1: Sukajadi */}
              <a
                href={buildWaUrl('6285320000303')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-xl bg-[#161D19] hover:bg-[#1C2620] border border-white/10 hover:border-[#39FF14]/50 transition-colors group"
              >
                <div>
                  <p className="text-sm font-bold text-[#F3F7F4] group-hover:text-[#39FF14] transition-colors">
                    WhatsApp Outlet 01 — NJR CELL Sukajadi
                  </p>
                  <p className="text-xs text-[#A3B3A8] mt-0.5">
                    Kec. Pamarican (Sekitar MAN 4 Ciamis) ·{' '}
                    <span className="font-mono-num text-[#F3F7F4]">0853-2000-0303</span>
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#39FF14] text-[#070A08] font-bold text-xs whitespace-nowrap shrink-0">
                  <MessageCircle className="w-4 h-4" />
                  Chat Sukajadi
                </span>
              </a>

              {/* Outlet 2: Ciherang */}
              <a
                href={buildWaUrl('6283120000303')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-xl bg-[#161D19] hover:bg-[#1C2620] border border-white/10 hover:border-[#39FF14]/50 transition-colors group"
              >
                <div>
                  <p className="text-sm font-bold text-[#F3F7F4] group-hover:text-[#39FF14] transition-colors">
                    WhatsApp Outlet 02 — NJR CELL Ciherang
                  </p>
                  <p className="text-xs text-[#A3B3A8] mt-0.5">
                    Jl. Pangandaran No. 84, Kec. Banjarsari (Dekat SD 1 Ciherang) ·{' '}
                    <span className="font-mono-num text-[#F3F7F4]">0831-2000-0303</span>
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#39FF14] text-[#070A08] font-bold text-xs whitespace-nowrap shrink-0">
                  <MessageCircle className="w-4 h-4" />
                  Chat Ciherang
                </span>
              </a>

              {/* General / Offline Service Number */}
              <a
                href={buildWaUrl('6282120000303')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-xl bg-[#161D19] hover:bg-[#1C2620] border border-white/10 hover:border-[#39FF14]/50 transition-colors group"
              >
                <div>
                  <p className="text-sm font-bold text-[#F3F7F4] group-hover:text-[#39FF14] transition-colors">
                    WhatsApp Layanan Konter & Pemesanan Umum
                  </p>
                  <p className="text-xs text-[#A3B3A8] mt-0.5">
                    Layanan Transfer, Hydrogel, Garskin & Konfirmasi ·{' '}
                    <span className="font-mono-num text-[#F3F7F4]">
                      {BRAND_INFO.generalWhatsappDisplay}
                    </span>
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 group-hover:bg-[#39FF14] text-[#F3F7F4] group-hover:text-[#070A08] font-bold text-xs transition-colors whitespace-nowrap shrink-0">
                  <MessageCircle className="w-4 h-4" />
                  Chat Admin
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
    >
      <div className="w-full max-w-3xl rounded-2xl bg-[#111613] border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0D110F]">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-[#39FF14]" />
            <div>
              <h3 id="terms-modal-title" className="text-lg font-bold text-[#F3F7F4]">
                Syarat & Ketentuan Resmi NJR CELL
              </h3>
              <p className="text-xs text-[#A3B3A8]">
                Sumber terverifikasi: njrcell.web.id/terms.html
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Syarat dan Ketentuan"
            className="p-2 rounded-lg text-[#A3B3A8] hover:text-[#F3F7F4] hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-sm text-[#D1DDD5]">
          <p className="text-xs sm:text-sm text-[#A3B3A8]">
            Dengan menggunakan layanan NJR CELL (baik online maupun langsung di konter Sukajadi dan Ciherang), pelanggan menyetujui syarat dan ketentuan berikut:
          </p>

          <div className="space-y-4">
            {TERMS_AND_CONDITIONS.map((section) => (
              <div
                key={section.number}
                className="p-4 rounded-xl bg-[#151B18] border border-white/10"
              >
                <h4 className="text-base font-bold text-[#F3F7F4] mb-2">
                  <span className="text-[#39FF14] font-mono-num mr-2">
                    {section.number}.
                  </span>
                  {section.title}
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-xs sm:text-sm text-[#B8C7BD] leading-relaxed">
                  {section.points.map((pt, idx) => (
                    <li key={idx}>{pt}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-white/10 bg-[#0D110F] flex items-center justify-between">
          <span className="text-xs text-[#A3B3A8]">
            © NJR CELL — Dokumen Ketentuan Layanan Pelanggan
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#39FF14] text-[#070A08] font-bold text-xs hover:bg-[#2ee00e] transition-colors cursor-pointer"
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditModal: React.FC<AuditModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-modal-title"
    >
      <div className="w-full max-w-4xl rounded-2xl bg-[#111613] border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0D110F]">
          <div className="flex items-center gap-2.5">
            <ClipboardCheck className="w-5 h-5 text-[#39FF14]" />
            <div>
              <h3 id="audit-modal-title" className="text-lg font-bold text-[#F3F7F4]">
                Panel Audit & Status Verifikasi (Siap Launching)
              </h3>
              <p className="text-xs text-[#A3B3A8]">
                Hasil pemeriksaan dari https://njrcell.web.id/ dan https://github.com/njrcell/site
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panel audit"
            className="p-2 rounded-lg text-[#A3B3A8] hover:text-[#F3F7F4] hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Confirmed Updates */}
          <div>
            <h4 className="text-sm font-bold text-[#F3F7F4] mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#39FF14]" />
              <span>Status Pembaruan Sesuai Konfirmasi Pemilik</span>
            </h4>
            <div className="space-y-3">
              {AUDIT_REPORT_SUMMARY.itemsNeedingOwnerConfirmation.map((entry, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#141E18] border border-[#39FF14]/30"
                >
                  <p className="text-sm font-bold text-[#39FF14]">{entry.item}</p>
                  <p className="text-xs text-[#D1DDD5] mt-1 leading-relaxed">
                    {entry.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Verified URLs Table */}
          <div>
            <h4 className="text-sm font-bold text-[#F3F7F4] mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#39FF14]" />
              <span>Daftar Tautan Resmi yang Terverifikasi dari Sumber Asli</span>
            </h4>
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0D110F] text-[#A3B3A8] border-b border-white/10">
                    <th className="py-2.5 px-3 font-semibold">Nama Tautan / Fitur</th>
                    <th className="py-2.5 px-3 font-semibold">URL Tujuan</th>
                    <th className="py-2.5 px-3 font-semibold">Status Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-[#141A17]">
                  {AUDIT_REPORT_SUMMARY.verifiedLinks.map((link, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-medium text-[#F3F7F4]">
                        {link.label}
                      </td>
                      <td className="py-2.5 px-3 font-mono-num text-[#A3B3A8] break-all">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#39FF14] underline"
                        >
                          {link.url}
                        </a>
                      </td>
                      <td className="py-2.5 px-3 text-[#39FF14] whitespace-nowrap">
                        {link.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-white/10 bg-[#0D110F] flex items-center justify-between">
          <span className="text-xs text-[#A3B3A8]">
            Website utama (njrcell.web.id) & repo utama tetap aman tidak tersentuh.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#39FF14] text-[#070A08] font-bold text-xs hover:bg-[#2ee00e] transition-colors cursor-pointer"
          >
            Tutup Panel Audit
          </button>
        </div>
      </div>
    </div>
  );
};
