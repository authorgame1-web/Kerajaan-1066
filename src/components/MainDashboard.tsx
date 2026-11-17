import React from 'react';
import {
  Bell,
  Church,
  Coins,
  Crown,
  Flame,
  Globe,
  ScrollText,
  Shield,
  Sparkles,
  Swords,
  Users,
} from 'lucide-react';
import { getBannerForRoute } from '../assets/media';
import { engine, HERALDS } from '../engine/gameEngine';
import { GameImage, ListRow, SectionHeader } from './GameImage';

export const MainDashboard: React.FC = () => {
  const p = engine.me();
  if (!p) return null;

  const dy = p.dinasti ? engine.DY[p.dinasti] : null;
  const herald = dy?.herald ? HERALDS.find((h) => h.id === dy.herald) : null;
  const unreadNotifs = (engine.G.notifs || []).filter((n) => !n.read).length;
  const activeHw = Object.entries(engine.G.hw || {}).filter(([, w]) => w.aktif);
  const log = engine.G.log || [];

  const mainMenu = [
    {
      icon: <Users className="w-4 h-4 text-[#9A6614]" />,
      title: 'Keluarga & Hubungan',
      subtitle: 'Pasangan, lamaran, silsilah besar, & kronik dinasti',
      view: 'hub',
    },
    {
      icon: <Swords className="w-4 h-4 text-[#991B1B]" />,
      title: 'Militer & Logistik',
      subtitle: `Pasukan ${Object.values(engine.G.tr).reduce((a, b) => a + b, 0)} · Moral ${engine.G.morale ?? 80}% · Kampanye`,
      view: 'pas',
    },
    {
      icon: <Coins className="w-4 h-4 text-[#9A6614]" />,
      title: 'Wilayah & Ekonomi',
      subtitle: 'Provinsi, bangunan, pasar harga, dagang, & pinjaman',
      view: 'prov',
    },
    {
      icon: <Globe className="w-4 h-4 text-[#3F6212]" />,
      title: 'Vasal & Peta Eropa',
      subtitle: 'Hierarki wilayah, vasal, klaim, & kerajaan dapat dibentuk',
      view: 'vasal',
    },
    {
      icon: <Crown className="w-4 h-4 text-[#9A6614]" />,
      title: 'Istana, Dewan & Spionase',
      subtitle: 'Penasihat detail, Dewan Bangsawan, diplomasi, & intelijen',
      view: 'dip',
    },
    {
      icon: <Church className="w-4 h-4 text-[#78350F]" />,
      title: 'Gereja, Paus & Agama',
      subtitle: 'Karier rohaniwan, konklaf, reformasi, & sekte',
      view: 'gereja',
    },
    {
      icon: <ScrollText className="w-4 h-4 text-[#44403C]" />,
      title: 'Keputusan & Karier',
      subtitle: 'Keputusan istana, pendidikan anak, ordo ksatria, & wasiat',
      view: 'kep',
    },
    {
      icon: <Sparkles className="w-4 h-4 text-[#9A6614]" />,
      title: 'Semua Menu & Arsip',
      subtitle: `Notifikasi (${unreadNotifs}), kitab, pencapaian, & ekspor save`,
      view: 'lain',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Contextual Hero Banner */}
      <div className="bg-white border border-[#DDD6C3] rounded-lg overflow-hidden shadow-xs">
        <div className="relative h-36 sm:h-44 bg-[#1C1917]">
          <GameImage
            src={getBannerForRoute('main').url}
            alt="Ruang Takhta Kerajaan"
            fallbackTitle="Balairung Istana"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-[#E8C57B] font-medium">
                Balairung Istana · Tahun <span className="font-num">{engine.G.tahun}</span>
              </p>
              <h1 className="font-display text-lg sm:text-2xl font-bold text-white truncate">
                {herald ? `${herald.simbol} ` : ''}
                {engine.full(p)}
              </h1>
              <p className="text-xs text-[#E7E5E4] truncate">
                {engine.tTitle(p)}
                {engine.mainT(p)}
                {engine.G.church?.excom?.[p.id] ? ' · Terekskomunikasi' : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={() => engine.tick()}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#9A6614] hover:bg-[#7E520E] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
            >
              Tahun Depan
            </button>
          </div>
        </div>

        {/* Urgent Banners */}
        {engine.G.regency && (
          <div className="px-4 py-2.5 bg-[#FEF3C7] border-t border-[#FDE68A] text-xs text-[#78350F]">
            <strong>Masa Perwalian:</strong> Penguasa belum cukup umur (berakhir pada usia 16).
          </div>
        )}

        {engine.G.coups?.length > 0 && (
          <div className="px-4 py-3 bg-[#FEF2F2] border-t border-[#FECACA] flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-[#991B1B]">
              <strong>Ancaman Kudeta!</strong>{' '}
              {engine.C[engine.G.coups[0].rebelId]
                ? engine.full(engine.C[engine.G.coups[0].rebelId])
                : 'Pemberontak'}{' '}
              menggalang kekuatan melawan takhta.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => engine.resolveKudeta('perang')}
                className="px-3 py-1 text-xs font-semibold text-white bg-[#991B1B] hover:bg-[#7F1D1D] rounded cursor-pointer"
              >
                Tumpas
              </button>
              <button
                type="button"
                onClick={() => engine.resolveKudeta('damai')}
                className="px-3 py-1 text-xs font-semibold text-[#1C1917] bg-white border border-[#D6CFC0] hover:bg-[#FAF8F2] rounded cursor-pointer"
              >
                Suap Damai (50 Emas)
              </button>
            </div>
          </div>
        )}

        {engine.G.travel && (
          <div className="px-4 py-2.5 bg-[#F4F0E4] border-t border-[#DDD6C3] text-xs text-[#44403C]">
            <strong>Dalam Perjalanan:</strong> Menuju{' '}
            {engine.T[engine.G.travel.to]?.nama || engine.G.travel.to} (sisa{' '}
            <span className="font-num font-semibold">{engine.G.travel.years}</span> tahun).
          </div>
        )}

        {engine.G.peasantRevolt?.active && (
          <div className="px-4 py-2.5 bg-[#FEF2F2] border-t border-[#FECACA] flex items-center justify-between gap-2 text-xs text-[#991B1B]">
            <span>
              <Flame className="w-3.5 h-3.5 inline mr-1" />
              <strong>Pemberontakan Petani:</strong> {engine.G.peasantRevolt.size} pemberontak aktif.
            </span>
            <button
              type="button"
              onClick={() => engine.go('tani')}
              className="px-2.5 py-1 font-semibold bg-[#991B1B] text-white rounded cursor-pointer whitespace-nowrap"
            >
              Tangani
            </button>
          </div>
        )}

        {engine.G.blackDeath?.active && (
          <div className="px-4 py-2.5 bg-[#292524] border-t border-[#44403C] flex items-center justify-between gap-2 text-xs text-[#F5F5F4]">
            <span>
              <strong>Wabah Pes Hitam:</strong> Tahun ke-
              {engine.G.tahun - engine.G.blackDeath.started + 1}.
            </span>
            <button
              type="button"
              onClick={() => engine.go('bigEv')}
              className="px-2.5 py-1 font-semibold bg-[#9A6614] text-white rounded cursor-pointer whitespace-nowrap"
            >
              Lihat Wabah
            </button>
          </div>
        )}

        {(engine.G.war || engine.G.warCampaign || activeHw.length > 0) && (
          <div className="px-4 py-2.5 bg-[#FAF3E0] border-t border-[#E6D9B5] flex flex-wrap items-center justify-between gap-2 text-xs text-[#78350F]">
            <span>
              <Shield className="w-3.5 h-3.5 inline mr-1" />
              {engine.G.warCampaign
                ? `Kampanye militer ke ${engine.T[engine.G.warCampaign.tid]?.nama} (${engine.G.warCampaign.turns}/${engine.G.warCampaign.distance} th)`
                : activeHw.length > 0
                  ? `${activeHw.length} Perang Sejarah aktif di Eropa`
                  : `Perang aktif ke ${engine.T[engine.G.war!.tid]?.nama}`}
            </span>
            <button
              type="button"
              onClick={() => engine.go(activeHw.length > 0 ? 'hw' : 'pas')}
              className="px-2.5 py-1 font-semibold bg-[#9A6614] text-white rounded cursor-pointer whitespace-nowrap"
            >
              Pantau Perang
            </button>
          </div>
        )}
      </div>

      {/* Navigation Actions */}
      <div className="bg-white border border-[#DDD6C3] rounded-lg overflow-hidden shadow-xs">
        <SectionHeader
          title="Komando & Pengelolaan"
          right={
            <button
              type="button"
              onClick={() => engine.go('notif')}
              className="inline-flex items-center gap-1 font-semibold text-[#9A6614] hover:underline cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              Notifikasi ({unreadNotifs})
            </button>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:gap-px bg-[#E6E1D3]">
          {mainMenu.map((item) => (
            <div key={item.view} className="bg-white">
              <ListRow
                icon={item.icon}
                title={item.title}
                subtitle={item.subtitle}
                onClick={() => engine.go(item.view)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Chronicle / Annual Events */}
      <div className="bg-white border border-[#DDD6C3] rounded-lg overflow-hidden shadow-xs">
        <SectionHeader
          title="Kronik & Laporan Tahunan"
          right={<span className="font-num">{log.length} catatan</span>}
        />
        {log.length === 0 ? (
          <div className="p-4 text-xs text-[#57534E]">
            Belum ada peristiwa baru tahun ini. Tekan "Tahun Depan" untuk memajukan waktu.
          </div>
        ) : (
          <ul className="divide-y divide-[#E6E1D3]">
            {log.slice(0, 14).map((line, i) => (
              <li key={i} className="px-4 py-2.5 text-xs sm:text-sm text-[#292524] leading-relaxed">
                {line}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
