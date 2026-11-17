import React from 'react';
import { getPortraitUrl } from '../assets/media';
import { engine } from '../engine/gameEngine';
import { GameImage, StatBar } from './GameImage';

export const RulerSidebar: React.FC = () => {
  const c = engine.me();
  if (!c) return null;

  const dy = c.dinasti ? engine.DY[c.dinasti] : null;
  const stats = engine.G.tab ? c.sk : c.sp;
  const troopsTotal = Object.values(engine.G.tr).reduce((a, b) => a + b, 0);
  const pop = Math.round(engine.G.rakyat?.bahagia ?? 50);
  const inc = engine.income();

  return (
    <aside className="space-y-4">
      {/* Ruler Dossier Card */}
      <div className="bg-white border border-[#DDD6C3] rounded-lg overflow-hidden shadow-xs">
        {/* Heraldic Dynasty Color Strip */}
        <div
          className="h-2 w-full"
          style={{ backgroundColor: dy?.warna || '#9A6614' }}
        />

        <div className="p-4 flex lg:flex-col items-center lg:items-stretch gap-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-full lg:h-56 shrink-0 rounded-md overflow-hidden border border-[#DDD6C3] bg-[#1C1917] relative">
            <GameImage
              src={getPortraitUrl(c.gender)}
              alt={`Potret ${engine.full(c)}`}
              fallbackTitle={engine.full(c)}
              className="w-full h-full object-cover object-top"
            />
            <div className="hidden lg:block absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/75 to-transparent" />
            <div className="hidden lg:flex absolute inset-x-3 bottom-2.5 items-center justify-between text-xs text-white font-medium">
              <span>{engine.tTitle(c)}</span>
              <span className="font-num">Tahun {engine.G.tahun}</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-display text-base sm:text-lg font-bold text-[#1C1917] leading-snug truncate">
              {engine.full(c)}
            </h2>
            <p className="text-xs text-[#57534E] mt-0.5 leading-relaxed">
              {engine.tTitle(c)}
              {engine.mainT(c)}
              {' · '}
              <span className="font-num">Usia {engine.umur(c)} th</span>
              {' · '}
              <span className="font-num">Thn {engine.G.tahun}</span>
            </p>
            {dy && (
              <button
                type="button"
                onClick={() => engine.go('dd', dy.id)}
                className="mt-1.5 text-xs font-medium text-[#9A6614] hover:underline cursor-pointer text-left"
              >
                Dinasti {dy.nama}
              </button>
            )}
          </div>
        </div>

        {/* Treasury & Key Resources (Tabular Numerals) */}
        <div className="grid grid-cols-2 border-t border-[#E6E1D3] bg-[#FAF8F2]">
          <div className="p-3 border-r border-b border-[#E6E1D3]">
            <div className="text-[11px] text-[#57534E] font-medium">Emas</div>
            <div className="font-num text-sm font-bold text-[#1C1917] mt-0.5">
              {Math.round(c.res.emas)}
              <span className="text-[11px] font-normal text-[#57534E] ml-1">
                ({inc >= 0 ? '+' : ''}
                {inc.toFixed(1)}/th)
              </span>
            </div>
          </div>
          <div className="p-3 border-b border-[#E6E1D3]">
            <div className="text-[11px] text-[#57534E] font-medium">Prestise</div>
            <div className="font-num text-sm font-bold text-[#1C1917] mt-0.5">
              {Math.round(c.res.prestise)}
            </div>
          </div>
          <div className="p-3 border-r border-[#E6E1D3]">
            <div className="text-[11px] text-[#57534E] font-medium">Kesalehan</div>
            <div className="font-num text-sm font-bold text-[#1C1917] mt-0.5">
              {Math.round(c.res.kesalehan)}
            </div>
          </div>
          <div className="p-3">
            <div className="text-[11px] text-[#57534E] font-medium">Pasukan</div>
            <div className="font-num text-sm font-bold text-[#1C1917] mt-0.5">
              {troopsTotal}
            </div>
          </div>
        </div>

        {/* Public Opinion */}
        <div className="p-4 border-t border-[#E6E1D3]">
          <StatBar value={pop} label="Opini Rakyat" showText />
        </div>
      </div>

      {/* Stats Toggle Panel */}
      <div className="bg-white border border-[#DDD6C3] rounded-lg overflow-hidden shadow-xs">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#ECE7D8] border-b border-[#DDD6C3]">
          <span className="text-xs font-semibold text-[#44403C]">
            {engine.G.tab ? 'Statistik Kerajaan' : 'Statistik Pribadi'}
          </span>
          <button
            type="button"
            onClick={() => engine.toggleTab()}
            className="text-xs font-semibold text-[#9A6614] hover:text-[#7E520E] cursor-pointer whitespace-nowrap"
          >
            {engine.G.tab ? 'Lihat Pribadi' : 'Lihat Kerajaan'}
          </button>
        </div>
        <div className="p-4 space-y-2.5">
          {Object.entries(stats).map(([k, v]) => (
            <StatBar key={k} label={k} value={v} />
          ))}
        </div>
      </div>

      {/* Quick Utility Actions on Desktop */}
      <div className="hidden lg:grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => engine.go('lain')}
          className="px-3 py-2 text-xs font-semibold text-[#1C1917] bg-white border border-[#DDD6C3] hover:bg-[#F1EDE0] rounded-md transition-colors cursor-pointer"
        >
          Semua Menu
        </button>
        <button
          type="button"
          onClick={() => {
            engine.save();
            engine.showToast('Permainan berhasil disimpan.');
          }}
          className="px-3 py-2 text-xs font-semibold text-[#1C1917] bg-white border border-[#DDD6C3] hover:bg-[#F1EDE0] rounded-md transition-colors cursor-pointer"
        >
          Simpan
        </button>
      </div>
    </aside>
  );
};
