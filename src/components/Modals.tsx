import React from 'react';
import { MEDIA } from '../assets/media';
import { engine } from '../engine/gameEngine';
import { GameImage, StatBar } from './GameImage';

export const Modals: React.FC = () => {
  const ev = engine.G?.ev;
  const md = engine.G?.md;
  const over = engine.G?.over;

  if (over) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
        <div className="bg-[#FAF8F2] border border-[#DDD6C3] rounded-lg max-w-md w-full overflow-hidden shadow-xl">
          <div className="h-40 relative bg-[#1C1917]">
            <GameImage
              src={MEDIA.heroCastle}
              alt="Akhir Dinasti"
              fallbackTitle="Garis Keturunan Berakhir"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5">
              <h2 className="font-display text-xl font-bold text-white">
                Garis Keturunan Berakhir
              </h2>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-sm text-[#44403C] leading-relaxed">
              Tidak ada lagi pewaris sah yang tersisa untuk melanjutkan takhta dan nama dinastimu pada tahun{' '}
              <span className="font-num font-semibold">{engine.G.tahun}</span>.
            </p>
            <button
              type="button"
              onClick={() => engine.toStart()}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#9A6614] hover:bg-[#7E520E] rounded-md transition-colors cursor-pointer"
            >
              Kembali ke Menu Utama
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (ev) {
    return (
      <div className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-4">
        <div className="bg-[#FAF8F2] border border-[#DDD6C3] rounded-lg max-w-md w-full overflow-hidden shadow-xl max-h-[88vh] flex flex-col">
          <div className="h-32 relative bg-[#1C1917] shrink-0">
            <GameImage
              src={MEDIA.sceneCourt}
              alt={ev.judul}
              fallbackTitle={ev.judul}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
            <h3 className="font-display text-lg font-bold text-white absolute bottom-3 left-4 right-4">
              {ev.judul}
            </h3>
          </div>
          <div className="p-5 overflow-y-auto space-y-4">
            <p className="text-sm text-[#292524] leading-relaxed">{ev.teks}</p>
            <div className="space-y-2">
              {ev.pilihan.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => engine.evc(idx)}
                  className="w-full text-left py-2.5 px-4 text-sm font-semibold text-white bg-[#9A6614] hover:bg-[#7E520E] rounded-md transition-colors cursor-pointer"
                >
                  {opt.teks}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (md && md.kind === 'acc_reject') {
    const target = engine.C[md.targetId];
    return (
      <div className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-4">
        <div className="bg-[#FAF8F2] border border-[#DDD6C3] rounded-lg max-w-md w-full overflow-hidden shadow-xl max-h-[88vh] flex flex-col">
          <div className="px-5 py-3.5 bg-[#ECE7D8] border-b border-[#DDD6C3]">
            <h3 className="font-display text-base font-bold text-[#1C1917]">{md.title}</h3>
            {target && (
              <p className="text-xs text-[#57534E] mt-0.5">{engine.full(target)}</p>
            )}
          </div>
          <div className="p-5 overflow-y-auto space-y-3">
            <div className="space-y-2">
              {md.factors.map(([name, val]) => (
                <div key={name}>
                  <div className="flex items-center justify-between text-xs text-[#44403C] mb-0.5">
                    <span>{name}</span>
                    <span className="font-num font-semibold">
                      {val > 0 ? '+' : ''}
                      {Math.round(val)}
                    </span>
                  </div>
                  <StatBar value={(val + 40) * 1.25} />
                </div>
              ))}
            </div>
            <p className="text-xs text-[#44403C] pt-2 border-t border-[#E6E1D3]">
              Diterima jika total ≥ 100. Total saat ini:{' '}
              <span className="font-num font-bold text-[#1C1917]">{Math.round(md.total)}</span>
            </p>
            <div className="space-y-2 pt-1">
              {md.onForceAction.type === 'lamar' && (
                <div className="p-2.5 bg-[#F2EDE0] border border-[#DDD6C3] rounded-md space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#57534E]">
                    Naikkan Peluang Lamaran
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    <button
                      type="button"
                      onClick={() => engine.boostRej('gift')}
                      className="w-full text-left py-1.5 px-3 text-xs font-medium text-[#1C1917] bg-[#FAF8F2] hover:bg-[#ECE7D8] border border-[#DDD6C3] rounded transition-colors cursor-pointer"
                    >
                      Kirim Hadiah Mewah (+25 opini · 50 Emas)
                    </button>
                    <button
                      type="button"
                      onClick={() => engine.boostRej('prestige')}
                      className="w-full text-left py-1.5 px-3 text-xs font-medium text-[#1C1917] bg-[#FAF8F2] hover:bg-[#ECE7D8] border border-[#DDD6C3] rounded transition-colors cursor-pointer"
                    >
                      Pamerkan Martabat Wangsa (+20 opini · 20 Prestise)
                    </button>
                    <button
                      type="button"
                      onClick={() => engine.boostRej('army')}
                      className="w-full text-left py-1.5 px-3 text-xs font-medium text-[#1C1917] bg-[#FAF8F2] hover:bg-[#ECE7D8] border border-[#DDD6C3] rounded transition-colors cursor-pointer"
                    >
                      Unjuk Parade Pasukan (+15 opini · 20 Emas)
                    </button>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => engine.closeModal()}
                className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#9A6614] hover:bg-[#7E520E] rounded-md transition-colors cursor-pointer"
              >
                Oke
              </button>
              {md.canUltimatum && (
                <button
                  type="button"
                  onClick={() => engine.executeModalUltimatum()}
                  className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#78350F] hover:bg-[#5C280B] rounded-md transition-colors cursor-pointer"
                >
                  Kirim Ultimatum (15 Prestise)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
