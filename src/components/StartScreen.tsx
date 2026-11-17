import React, { useMemo, useRef, useState } from 'react';
import { Upload, Shuffle, Play, RotateCcw, BookOpen } from 'lucide-react';
import { MEDIA } from '../assets/media';
import { BACKGROUNDS, engine } from '../engine/gameEngine';
import { DownloadMentahanBox } from './DownloadMentahanBox';
import { GameImage } from './GameImage';

export const StartScreen: React.FC = () => {
  const pm = engine.D.pengaturan_mulai || {};
  const peranAwal = pm.peran_awal || [];
  const karakterList = engine.D.karakter || [];
  const sifatList = engine.D.sifat || [];
  const budayaList = engine.D.budaya || [];
  const agamaList = (engine.D.agama || []).filter((a: { id: string }) => !a.id.includes('sekte'));
  const profesiList = engine.D.profesi || [];
  const counties = useMemo(
    () =>
      Object.values(engine.T)
        .filter((t) => t.tier === 3)
        .sort((a, b) => a.nama.localeCompare(b.nama)),
    []
  );

  const [pr, setPr] = useState<string>(peranAwal[0]?.id || 'king');
  const [tk, setTk] = useState<string>(karakterList[0]?.id || 'h4');
  const [nm, setNm] = useState<string>('Konrad');
  const [dn, setDn] = useState<string>('Hohenstein');
  const [gn, setGn] = useState<'L' | 'P'>('L');
  const [bd, setBd] = useState<string>(budayaList[0]?.id || 'german');
  const [ag, setAg] = useState<string>(agamaList[0]?.id || 'katolik');
  const [bg, setBg] = useState<string>('noble');
  const [s1, setS1] = useState<string>(sifatList[0]?.id || '');
  const [s2, setS2] = useState<string>(sifatList[1]?.id || '');
  const [pf, setPf] = useState<string>(profesiList[0]?.id || 'petani');
  const [lc, setLc] = useState<string>(counties[0]?.id || '');
  const [importText, setImportText] = useState<string>('');
  const [showImport, setShowImport] = useState<boolean>(false);
  const [dataStatus, setDataStatus] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const isMonarch = pr === 'king' || pr === 'emperor';
  const kingOptions = useMemo(() => {
    const filtered = karakterList.filter((k: { id: string; kelas?: string; gelar_awal?: string }) =>
      pr === 'emperor' ? k.id === 'h4' || k.gelar_awal?.includes('k') || true : true
    );
    return filtered;
  }, [karakterList, pr]);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    engine.startNewGame({
      pr: pr === 'custom' ? 'bangsawan' : pr,
      nm: nm.trim() || 'Konrad',
      dn: dn.trim() || 'Hohenstein',
      gn,
      bd,
      ag,
      s1,
      s2,
      pf,
      lc,
      tk,
      bg,
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const msg = await engine.loadCustomJsonFiles(e.target.files);
    setDataStatus(msg);
  };

  const hasCustom = (() => {
    try {
      return Boolean(localStorage.getItem('k1066custom'));
    } catch {
      return false;
    }
  })();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Hero Banner */}
      <div className="relative rounded-lg overflow-hidden border border-[#DDD6C3] bg-[#1C1917] shadow-sm">
        <div className="h-52 sm:h-64 w-full">
          <GameImage
            src={MEDIA.heroCastle}
            alt="Benteng Kerajaan Abad Pertengahan Eropa"
            fallbackTitle="Kerajaan 1066"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/15" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-xs font-medium tracking-wider text-[#E8C57B] uppercase mb-1">
              Kronik Eropa · Tahun {engine.D.meta.tahun_mulai}–1600
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
              Kerajaan 1066
            </h1>
            <p className="text-xs sm:text-sm text-[#E7E5E4] mt-1.5 leading-relaxed">
              Bangun dinasti, kelola wilayah feodal, pimpin ekspedisi militer, dan arahkan takdir
              politik Eropa dari abad ke-11 hingga era Reformasi dan Renaisans.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {engine.hasSave() && (
              <button
                type="button"
                onClick={() => engine.loadSave()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-[#1C1917] bg-[#F6F4EC] hover:bg-white rounded-md transition-colors cursor-pointer whitespace-nowrap"
              >
                <Play className="w-4 h-4" />
                Lanjutkan Save
              </button>
            )}
            <button
              type="button"
              onClick={() => engine.startRandomWorld()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#9A6614] hover:bg-[#7E520E] rounded-md transition-colors cursor-pointer whitespace-nowrap"
            >
              <Shuffle className="w-4 h-4" />
              Dunia Acak
            </button>
          </div>
        </div>
      </div>

      {/* Main Setup Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form
          onSubmit={handleStart}
          className="lg:col-span-2 bg-white border border-[#DDD6C3] rounded-lg overflow-hidden shadow-xs"
        >
          <div className="px-5 py-3.5 bg-[#ECE7D8] border-b border-[#DDD6C3] flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-[#1C1917]">
              Mulai Kronik Baru
            </h2>
            <span className="text-xs font-num text-[#57534E]">
              Mulai Thn {engine.D.meta.tahun_mulai}
            </span>
          </div>

          <div className="p-5 space-y-4">
            {/* Role Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-1.5">
                Peran Awal
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {peranAwal.map((role: { id: string; nama: string; ket?: string }) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setPr(role.id)}
                    className={`text-left p-3 rounded-md border transition-colors cursor-pointer ${
                      pr === role.id
                        ? 'bg-[#FAF3E0] border-[#9A6614] text-[#1C1917]'
                        : 'bg-[#FAF8F2] border-[#E6E1D3] text-[#44403C] hover:bg-[#F2EDE0]'
                    }`}
                  >
                    <div className="text-xs font-bold">{role.nama}</div>
                    {role.ket && (
                      <div className="text-[11px] text-[#57534E] mt-0.5 line-clamp-2">{role.ket}</div>
                    )}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPr('custom')}
                  className={`text-left p-3 rounded-md border transition-colors cursor-pointer ${
                    pr === 'custom'
                      ? 'bg-[#FAF3E0] border-[#9A6614] text-[#1C1917]'
                      : 'bg-[#FAF8F2] border-[#E6E1D3] text-[#44403C] hover:bg-[#F2EDE0]'
                  }`}
                >
                  <div className="text-xs font-bold">Penguasa Kustom</div>
                  <div className="text-[11px] text-[#57534E] mt-0.5">
                    Ciptakan tokoh &amp; wangsa baru di wilayah pilihanmu
                  </div>
                </button>
              </div>
            </div>

            {isMonarch ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#44403C] mb-1">
                    Pilih Tokoh Sejarah
                  </label>
                  <select
                    value={tk}
                    onChange={(e) => setTk(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF8F2] border border-[#D6CFC0] rounded-md text-[#1C1917]"
                  >
                    {kingOptions.map((k: { id: string; nama: string; budaya: string; agama: string }) => (
                      <option key={k.id} value={k.id}>
                        {k.nama} ({k.budaya} · {k.agama})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#44403C] mb-1">
                    Latar Belakang Tokoh
                  </label>
                  <select
                    value={bg}
                    onChange={(e) => setBg(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF8F2] border border-[#D6CFC0] rounded-md text-[#1C1917]"
                  >
                    {Object.entries(BACKGROUNDS).map(([id, b]) => (
                      <option key={id} value={id}>
                        {b.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#44403C] mb-1">
                      Nama Depan
                    </label>
                    <input
                      type="text"
                      value={nm}
                      onChange={(e) => setNm(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#FAF8F2] border border-[#D6CFC0] rounded-md text-[#1C1917]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#44403C] mb-1">
                      Nama Dinasti
                    </label>
                    <input
                      type="text"
                      value={dn}
                      onChange={(e) => setDn(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#FAF8F2] border border-[#D6CFC0] rounded-md text-[#1C1917]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#44403C] mb-1">
                      Gender
                    </label>
                    <select
                      value={gn}
                      onChange={(e) => setGn(e.target.value as 'L' | 'P')}
                      className="w-full px-3 py-2 text-sm bg-[#FAF8F2] border border-[#D6CFC0] rounded-md text-[#1C1917]"
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#44403C] mb-1">
                      Budaya
                    </label>
                    <select
                      value={bd}
                      onChange={(e) => setBd(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#FAF8F2] border border-[#D6CFC0] rounded-md text-[#1C1917]"
                    >
                      {budayaList.map((b: { id: string; nama: string }) => (
                        <option key={b.id} value={b.id}>
                          {b.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#44403C] mb-1">
                      Agama
                    </label>
                    <select
                      value={ag}
                      onChange={(e) => setAg(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#FAF8F2] border border-[#D6CFC0] rounded-md text-[#1C1917]"
                    >
                      {agamaList.map((a: { id: string; nama: string }) => (
                        <option key={a.id} value={a.id}>
                          {a.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#44403C] mb-1">
                      Wilayah Awal
                    </label>
                    <select
                      value={lc}
                      onChange={(e) => setLc(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#FAF8F2] border border-[#D6CFC0] rounded-md text-[#1C1917]"
                    >
                      {counties.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#44403C] mb-1">
                      Sifat Pertama
                    </label>
                    <select
                      value={s1}
                      onChange={(e) => setS1(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#FAF8F2] border border-[#D6CFC0] rounded-md text-[#1C1917]"
                    >
                      {sifatList.map((s: { id: string; nama: string }) => (
                        <option key={s.id} value={s.id}>
                          {s.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#44403C] mb-1">
                      Sifat Kedua
                    </label>
                    <select
                      value={s2}
                      onChange={(e) => setS2(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#FAF8F2] border border-[#D6CFC0] rounded-md text-[#1C1917]"
                    >
                      {sifatList.map((s: { id: string; nama: string }) => (
                        <option key={s.id} value={s.id}>
                          {s.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#44403C] mb-1">
                      Latar Belakang
                    </label>
                    <select
                      value={bg}
                      onChange={(e) => setBg(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#FAF8F2] border border-[#D6CFC0] rounded-md text-[#1C1917]"
                    >
                      {Object.entries(BACKGROUNDS).map(([id, b]) => (
                        <option key={id} value={id}>
                          {b.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {pr === 'rakyat_jelata' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#44403C] mb-1">
                      Profesi Awal
                    </label>
                    <select
                      value={pf}
                      onChange={(e) => setPf(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#FAF8F2] border border-[#D6CFC0] rounded-md text-[#1C1917]"
                    >
                      {profesiList.map((f: { id: string; nama: string }) => (
                        <option key={f.id} value={f.id}>
                          {f.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {BACKGROUNDS[bg] && (
              <div className="p-3 bg-[#FAF8F2] border border-[#E6E1D3] rounded-md text-xs text-[#57534E]">
                <span className="font-semibold text-[#1C1917]">{BACKGROUNDS[bg].nama}:</span>{' '}
                {BACKGROUNDS[bg].desc}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#9A6614] hover:bg-[#7E520E] rounded-md transition-colors cursor-pointer"
            >
              Mulai Bermain
            </button>
          </div>
        </form>

        {/* Right Side: Quick Guides, Import/Export, Custom JSON */}
        <div className="space-y-4">
          <div className="bg-white border border-[#DDD6C3] rounded-lg overflow-hidden shadow-xs">
            <div className="px-4 py-3 bg-[#ECE7D8] border-b border-[#DDD6C3]">
              <h3 className="font-display text-sm font-bold text-[#1C1917]">
                Panduan &amp; Data
              </h3>
            </div>
            <div className="p-4 space-y-3 text-xs text-[#44403C]">
              <p className="leading-relaxed">
                Setiap giliran mewakili satu tahun. Kelola wilayah, tunjuk penasihat, atur
                wasiat pewaris agar garis keturunan tidak terputus, dan hadapi peristiwa sejarah
                Eropa.
              </p>
              <button
                type="button"
                onClick={() => engine.go('tutorial')}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 font-semibold text-[#1C1917] bg-[#FAF8F2] hover:bg-[#ECE7D8] border border-[#DDD6C3] rounded-md transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Buka Panduan Pemula
              </button>
              <button
                type="button"
                onClick={() => setShowImport((v) => !v)}
                className="w-full py-2 px-3 font-semibold text-[#1C1917] bg-[#FAF8F2] hover:bg-[#ECE7D8] border border-[#DDD6C3] rounded-md transition-colors cursor-pointer"
              >
                {showImport ? 'Tutup Impor Save JSON' : 'Impor Save dari Teks JSON'}
              </button>

              {showImport && (
                <div className="space-y-2 pt-1">
                  <textarea
                    rows={4}
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Tempel teks JSON save di sini..."
                    className="w-full p-2 text-xs bg-[#FAF8F2] border border-[#D6CFC0] rounded font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => engine.importSaveText(importText)}
                    className="w-full py-1.5 px-3 text-xs font-semibold text-white bg-[#9A6614] hover:bg-[#7E520E] rounded transition-colors cursor-pointer"
                  >
                    Muat Save JSON
                  </button>
                </div>
              )}

              <div className="pt-2 border-t border-[#E6E1D3] space-y-2">
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept=".json"
                  onChange={handleUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 font-medium text-[#44403C] bg-white hover:bg-[#FAF8F2] border border-[#D6CFC0] rounded-md transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Muat Skenario JSON Kustom
                </button>
                {hasCustom && (
                  <button
                    type="button"
                    onClick={() => {
                      engine.resetCustomData();
                      setDataStatus('Data standar dipulihkan.');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 font-medium text-[#991B1B] bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] rounded-md transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Kembalikan Data Bawaan
                  </button>
                )}
                {dataStatus && <p className="text-[11px] text-[#9A6614]">{dataStatus}</p>}
              </div>

              <DownloadMentahanBox />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
