import React, { useState } from 'react';
import { Copy, Download, ExternalLink, Check } from 'lucide-react';

interface Props {
  compact?: boolean;
}

export const DownloadMentahanBox: React.FC<Props> = ({ compact = false }) => {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<string>('');

  const zipPath = '/kerajaan-1066-mentahan.zip';
  const fullUrl =
    typeof window !== 'undefined' ? `${window.location.origin}${zipPath}` : zipPath;

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    setStatus('Menyiapkan file zip (5,2 MB)...');
    try {
      const res = await fetch(`${zipPath}?v=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const blob = await res.blob();
      if (blob.size < 100000 || blob.type.includes('text/html')) {
        throw new Error('Respon bukan file zip.');
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kerajaan-1066-mentahan.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 15000);
      setStatus('File sedang diunduh. Jika diblokir preview, gunakan tombol Salin Link atau Buka Tab Baru.');
    } catch {
      setStatus('Unduhan otomatis tertahan oleh preview. Gunakan "Buka Tab Baru" atau "Salin Link" lalu tempel di Chrome.');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setStatus('Link berhasil disalin! Tempel di browser Chrome untuk mengunduh .zip.');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setStatus(`Salin manual link ini: ${fullUrl}`);
    }
  };

  return (
    <div className={compact ? 'p-4 bg-[#FAF6EA] border-t border-[#E6E1D3] space-y-2' : 'pt-2 border-t border-[#E6E1D3] space-y-2'}>
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-[#1C1917] bg-[#F5ECD5] hover:bg-[#EBD9B4] disabled:opacity-60 border border-[#C8B282] rounded-md transition-colors cursor-pointer"
      >
        <Download className="w-3.5 h-3.5 text-[#9A6614]" />
        {downloading ? 'Mengunduh Mentahan (.zip)...' : 'Unduh Mentahan Proyek (.zip) untuk APK'}
      </button>

      <div className="grid grid-cols-2 gap-1.5">
        <a
          href={zipPath}
          target="_blank"
          rel="noopener noreferrer"
          download="kerajaan-1066-mentahan.zip"
          className="flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-medium text-[#44403C] bg-white hover:bg-[#FAF8F2] border border-[#D6CFC0] rounded transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Buka Tab Baru
        </a>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-medium text-[#44403C] bg-white hover:bg-[#FAF8F2] border border-[#D6CFC0] rounded transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3 h-3 text-[#166534]" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Tersalin' : 'Salin Link .zip'}
        </button>
      </div>

      {status && (
        <p className="text-[11px] text-[#9A6614] leading-snug break-all">{status}</p>
      )}
      <p className="text-[11px] text-[#78716C] leading-snug">
        Berisi kode sumber lengkap, Capacitor config, dan GitHub Actions untuk build APK Android.
      </p>
    </div>
  );
};
