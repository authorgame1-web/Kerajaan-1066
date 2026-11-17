import React, { useMemo, useState } from 'react';
import { getBannerForRoute } from '../../assets/media';
import { engine, HERALDS } from '../../engine/gameEngine';
import { Character } from '../../engine/types';
import { ListRow, SectionHeader, ViewShell } from '../GameImage';

interface Props {
  view: string;
  arg?: string;
}

export const FamilyAndTreeView: React.FC<Props> = ({ view, arg }) => {
  const p = engine.me();
  const [commoners, setCommoners] = useState<Character[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const treeData = useMemo(() => {
    const focus = arg || engine.G.familyFocus || p.id;
    const depth = engine.G.familyView?.depth || 3;
    return engine.buildFamilyTree(focus, depth);
  }, [arg, p.id, engine.G.familyFocus, engine.G.familyView?.depth, engine.G.familyView?.showSpouses, engine.G.familyView?.showDead, engine.G.tahun]);

  if (view === 'hub') {
    const sp = p.pasangan ? engine.C[p.pasangan] : null;
    const dy = p.dinasti ? engine.DY[p.dinasti] : null;
    const herald = dy?.herald ? HERALDS.find((h) => h.id === dy.herald) : null;
    return (
      <ViewShell
        title="Keluarga, Hubungan & Dinasti"
        onBack={() => engine.back()}
        onHome={() => engine.home()}
        bannerUrl={getBannerForRoute('hub').url}
        bannerCaption="Silaturahmi Wangsa"
      >
        <SectionHeader title="Ikatan Keluarga & Pernikahan" />
        {sp ? (
          <ListRow
            icon={sp.gender === 'P' ? '👸' : '🤴'}
            title={`${engine.full(sp)} (${p.sn === 'bertunangan' ? 'Tunangan' : 'Pasangan'})`}
            subtitle={`${engine.tTitle(sp)} · Opini ${Math.round(engine.opn(sp, p))}`}
            onClick={() => engine.go('ch', sp.id)}
          />
        ) : (
          <ListRow
            icon="💍"
            title="Cari Pasangan Bangsawan"
            subtitle="Daftar kandidat bangsawan & penguasa lajang"
            onClick={() => engine.go('cari')}
          />
        )}
        {!sp && (
          <ListRow
            icon="🌾"
            title="Nikahi Rakyat Jelata"
            subtitle="Temukan pasangan dari masyarakat lokal (-5 Prestise, +15 Kebahagiaan)"
            onClick={() => {
              setCommoners([engine.makeCommoner(), engine.makeCommoner(), engine.makeCommoner()]);
              engine.go('cariUmum');
            }}
          />
        )}
        {p.sn === 'bertunangan' && p.pasangan && (
          <ListRow
            icon="✖"
            title="Batalkan Pertunangan"
            subtitle="Denda prestise & opini keluarga memburuk"
            onClick={() => engine.batalTun(p.pasangan!)}
          />
        )}
        {p.sn === 'menikah' && (
          <ListRow
            icon="⚖"
            title="Cerai"
            subtitle="Akhiri pernikahan aktif"
            onClick={() => engine.cerai()}
          />
        )}
        <ListRow
          icon="👨‍👩‍👧‍👦"
          title="Keluarga & Orang Dekat"
          subtitle={`${p.anak.length} anak · Orang tua, saudara, & favorit`}
          onClick={() => engine.go('fam')}
        />
        <ListRow
          icon="🌳"
          title="Pohon Silsilah Interaktif"
          subtitle="Diagram visual leluhur, keturunan, & pasangan lintas generasi"
          onClick={() => engine.go('silsilah', p.id)}
        />
        <ListRow
          icon="📊"
          title="Statistik Keluarga & Anggota"
          subtitle="Ringkasan demografi wangsa & jumlah anggota hidup"
          onClick={() => engine.go('statKeluarga')}
        />

        <SectionHeader title="Dinasti & Warisan" />
        <ListRow
          icon={herald?.simbol || '🛡️'}
          title={dy ? `Dinasti ${dy.nama}` : 'Info Dinasti'}
          subtitle={dy ? `Prestise ${Math.round(dy.prestise)} · Status ${dy.status.replace(/_/g, ' ')}` : 'Belum punya dinasti'}
          onClick={() => engine.go('dyn')}
        />
        <ListRow
          icon="🎨"
          title="Lambang Perisai (Heraldik)"
          subtitle={herald ? `Lambang aktif: ${herald.nama}` : 'Pilih lambang kehormatan dinasti'}
          onClick={() => engine.go('herald')}
        />
        <ListRow
          icon="📜"
          title="Kronik Dinasti"
          subtitle="Rekam jejak sejarah wangsa dari generasi ke generasi"
          onClick={() => engine.go('kronik')}
        />
        <ListRow
          icon="🔍"
          title="Direktori Semua Dinasti"
          subtitle="Telusuri daftar wangsa di seluruh Eropa"
          onClick={() => engine.go('dl')}
        />
      </ViewShell>
    );
  }

  if (view === 'cari') {
    const list = engine.cand();
    return (
      <ViewShell title="Kandidat Pasangan Bangsawan" onBack={() => engine.back()} onHome={() => engine.home()}>
        <SectionHeader title="Kandidat Tersedia" right={`${list.length} orang`} />
        {list.length === 0 ? (
          <div className="p-4 text-xs text-[#57534E]">Tidak ada kandidat bangsawan yang cocok saat ini.</div>
        ) : (
          list.map((c) => {
            const acc = engine.acc(c, 'nikah');
            return (
              <ListRow
                key={c.id}
                icon={c.gender === 'P' ? '👩' : '👨'}
                title={engine.full(c)}
                subtitle={`${engine.tTitle(c)} · Usia ${engine.umur(c)} · Skor Peluang ${Math.round(acc.t)}/100`}
                rightLabel="Lamar"
                onClick={() => engine.lamar(c.id)}
              />
            );
          })
        )}
      </ViewShell>
    );
  }

  if (view === 'cariUmum') {
    const list = commoners.length ? commoners : [engine.makeCommoner(), engine.makeCommoner()];
    return (
      <ViewShell title="Nikahi Rakyat Jelata" onBack={() => engine.back()} onHome={() => engine.home()}>
        <SectionHeader
          title="Kandidat Rakyat Lokal"
          right={
            <button
              type="button"
              onClick={() => setCommoners([engine.makeCommoner(), engine.makeCommoner(), engine.makeCommoner()])}
              className="text-xs font-semibold text-[#9A6614] hover:underline cursor-pointer"
            >
              Cari Lagi
            </button>
          }
        />
        {list.map((c) => (
          <ListRow
            key={c.id}
            icon={c.gender === 'P' ? '👩' : '👨'}
            title={engine.full(c)}
            subtitle={`Rakyat Jelata · Usia ${engine.umur(c)} · ${c.budaya}`}
            rightLabel="Nikahi"
            onClick={() => engine.marryCommoner(c.id)}
          />
        ))}
      </ViewShell>
    );
  }

  if (view === 'fam') {
    const parents = [p.ayah ? engine.C[p.ayah] : null, p.ibu ? engine.C[p.ibu] : null].filter(
      (x): x is Character => Boolean(x)
    );
    const kids = p.anak.map((id) => engine.C[id]).filter((x): x is Character => Boolean(x));
    const sibs = Object.values(engine.C).filter(
      (c) => c.id !== p.id && ((p.ibu && c.ibu === p.ibu) || (p.ayah && c.ayah === p.ayah))
    );
    const sp = p.pasangan ? engine.C[p.pasangan] : null;
    return (
      <ViewShell title="Keluarga & Kerabat" onBack={() => engine.back()} onHome={() => engine.home()}>
        <SectionHeader title="Pasangan" />
        {sp ? (
          <ListRow
            icon="💍"
            title={engine.full(sp)}
            subtitle={`${engine.lifeText(sp)} · ${engine.tTitle(sp)}`}
            onClick={() => engine.go('ch', sp.id)}
          />
        ) : (
          <div className="p-4 text-xs text-[#57534E]">Belum menikah.</div>
        )}
        <SectionHeader title="Orang Tua" />
        {parents.length === 0 ? (
          <div className="p-4 text-xs text-[#57534E]">Tidak tercatat.</div>
        ) : (
          parents.map((x) => (
            <ListRow key={x.id} title={engine.full(x)} subtitle={engine.lifeText(x)} onClick={() => engine.go('ch', x.id)} />
          ))
        )}
        <SectionHeader title="Saudara Kandung" />
        {sibs.length === 0 ? (
          <div className="p-4 text-xs text-[#57534E]">Tidak ada saudara tercatat.</div>
        ) : (
          sibs.map((x) => (
            <ListRow key={x.id} title={engine.full(x)} subtitle={`${engine.lifeText(x)} · ${engine.tTitle(x)}`} onClick={() => engine.go('ch', x.id)} />
          ))
        )}
        <SectionHeader title="Anak-Anak" right={`${kids.length} orang`} />
        {kids.length === 0 ? (
          <div className="p-4 text-xs text-[#57534E]">Belum memiliki anak.</div>
        ) : (
          kids.map((x) => (
            <ListRow
              key={x.id}
              title={engine.full(x)}
              subtitle={`${engine.lifeText(x)} · ${engine.tTitle(x)}`}
              rightLabel={engine.umur(x) < 16 ? 'Didik' : undefined}
              onClick={() => engine.go(engine.umur(x) < 16 ? 'edu' : 'ch', x.id)}
            />
          ))
        )}
      </ViewShell>
    );
  }

  if (view === 'silsilah' || view === 'pohon' || view === 'tree') {
    const focus = engine.C[arg || engine.G.familyFocus || p.id] || p;
    const gens = Array.from(new Set(treeData.nodes.map((n) => n.gen))).sort((a, b) => a - b);
    const colW = 190;
    const rowH = 92;
    const positioned = new Map<string, { x: number; y: number; char: Character; role: string }>();

    gens.forEach((g, gi) => {
      const rowNodes = treeData.nodes.filter((n) => n.gen === g);
      rowNodes.forEach((n, ni) => {
        positioned.set(n.id, {
          x: 24 + ni * colW,
          y: 24 + gi * rowH,
          char: n.char,
          role: n.role,
        });
      });
    });

    const maxCols = Math.max(1, ...gens.map((g) => treeData.nodes.filter((n) => n.gen === g).length));
    const svgW = Math.max(520, maxCols * colW + 40);
    const svgH = Math.max(240, gens.length * rowH + 40);

    return (
      <ViewShell title={`Pohon Silsilah · ${engine.full(focus)}`} onBack={() => engine.back()} onHome={() => engine.home()}>
        <div className="p-3 bg-[#FAF8F2] border-b border-[#DDD6C3] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span>Kedalaman:</span>
            {[1, 2, 3, 4, 5].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  engine.G.familyView.depth = d;
                  engine.notify();
                }}
                className={`px-2 py-1 rounded border cursor-pointer font-num ${
                  (engine.G.familyView?.depth || 3) === d
                    ? 'bg-[#9A6614] text-white border-[#9A6614]'
                    : 'bg-white text-[#44403C] border-[#D6CFC0]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={engine.G.familyView?.showSpouses ?? true}
                onChange={(e) => {
                  engine.G.familyView.showSpouses = e.target.checked;
                  engine.notify();
                }}
              />
              <span>Pasangan</span>
            </label>
            <label className="inline-flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={engine.G.familyView?.showDead ?? false}
                onChange={(e) => {
                  engine.G.familyView.showDead = e.target.checked;
                  engine.notify();
                }}
              />
              <span>Wafat</span>
            </label>
          </div>
        </div>

        <div className="overflow-x-auto bg-[#FBF9F4] p-3">
          <svg width={svgW} height={svgH} className="block">
            {treeData.edges.map((ed, idx) => {
              const a = positioned.get(ed.from);
              const b = positioned.get(ed.to);
              if (!a || !b) return null;
              const x1 = a.x + 82;
              const y1 = a.y + (ed.kind === 'spouse' ? 28 : 56);
              const x2 = b.x + 82;
              const y2 = b.y + (ed.kind === 'spouse' ? 28 : 0);
              return (
                <line
                  key={idx}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={ed.kind === 'spouse' ? '#9A6614' : '#A8A29E'}
                  strokeWidth={ed.kind === 'spouse' ? 1.5 : 1.5}
                  strokeDasharray={ed.kind === 'spouse' ? '4 3' : undefined}
                />
              );
            })}

            {Array.from(positioned.entries()).map(([id, pos]) => {
              const isFocus = id === focus.id;
              const dead = !pos.char.hidup;
              return (
                <g
                  key={id}
                  transform={`translate(${pos.x},${pos.y})`}
                  onClick={() => {
                    engine.G.familyFocus = id;
                    engine.go('ch', id);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    width={164}
                    height={56}
                    rx={6}
                    fill={isFocus ? '#FAF3E0' : dead ? '#EFECE3' : '#FFFFFF'}
                    stroke={isFocus ? '#9A6614' : '#D6CFC0'}
                    strokeWidth={isFocus ? 2 : 1}
                  />
                  <text x={10} y={20} fontSize={12} fontWeight={700} fill="#1C1917">
                    {pos.char.nama.slice(0, 20)}
                  </text>
                  <text x={10} y={36} fontSize={10} fill="#57534E">
                    {pos.role} · {engine.lifeSpan(pos.char)}
                  </text>
                  <text x={10} y={49} fontSize={9.5} fill="#78716C">
                    {pos.char.hidup ? `Usia ${engine.umur(pos.char)}` : 'Wafat'}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <SectionHeader title="Anggota dalam Bagan" right={`${treeData.nodes.length} tokoh`} />
        {treeData.nodes.map((n) => (
          <ListRow
            key={n.id}
            title={`${engine.full(n.char)} (${n.role})`}
            subtitle={`${engine.tTitle(n.char)} · ${engine.lifeText(n.char)}`}
            rightLabel="Fokus"
            onClick={() => {
              engine.G.familyFocus = n.id;
              engine.notify();
            }}
          />
        ))}
      </ViewShell>
    );
  }

  if (view === 'statKeluarga' || view === 'anggotaK') {
    const dy = p.dinasti ? engine.DY[p.dinasti] : null;
    const members = Object.values(engine.C).filter((c) => c.dinasti === p.dinasti);
    const living = members.filter((c) => c.hidup);
    return (
      <ViewShell title="Statistik & Anggota Keluarga" onBack={() => engine.back()} onHome={() => engine.home()}>
        <div className="grid grid-cols-3 border-b border-[#E6E1D3] bg-[#FAF8F2] text-center">
          <div className="p-3 border-r border-[#E6E1D3]">
            <div className="text-[11px] text-[#57534E]">Hidup</div>
            <div className="font-num text-base font-bold text-[#1C1917]">{living.length}</div>
          </div>
          <div className="p-3 border-r border-[#E6E1D3]">
            <div className="text-[11px] text-[#57534E]">Total Tercatat</div>
            <div className="font-num text-base font-bold text-[#1C1917]">{members.length}</div>
          </div>
          <div className="p-3">
            <div className="text-[11px] text-[#57534E]">Prestise Dinasti</div>
            <div className="font-num text-base font-bold text-[#1C1917]">{Math.round(dy?.prestise || 0)}</div>
          </div>
        </div>
        <SectionHeader title={`Anggota Wangsa ${dy?.nama || ''}`} right={`${living.length} hidup`} />
        {living.map((m) => (
          <ListRow
            key={m.id}
            title={engine.full(m)}
            subtitle={`${engine.tTitle(m)} · Usia ${engine.umur(m)}`}
            onClick={() => engine.go('ch', m.id)}
          />
        ))}
      </ViewShell>
    );
  }

  if (view === 'herald') {
    const dy = p.dinasti ? engine.DY[p.dinasti] : null;
    return (
      <ViewShell title="Lambang Perisai Dinasti" onBack={() => engine.back()} onHome={() => engine.home()}>
        <SectionHeader title={`Pilih Lambang (${dy?.nama || 'Dinasti'}) · 10 Emas`} />
        {HERALDS.map((h) => (
          <ListRow
            key={h.id}
            icon={h.simbol}
            title={h.nama}
            subtitle={h.makna}
            rightLabel={dy?.herald === h.id ? 'Aktif' : 'Pilih'}
            onClick={() => engine.setHerald(h.id)}
          />
        ))}
      </ViewShell>
    );
  }

  if (view === 'dyn' || view === 'dd') {
    const did = arg || p.dinasti;
    const d = did ? engine.DY[did] : null;
    if (!d) {
      return (
        <ViewShell title="Dinasti" onBack={() => engine.back()} onHome={() => engine.home()}>
          <div className="p-4 text-xs text-[#57534E]">Dinasti tidak ditemukan.</div>
        </ViewShell>
      );
    }
    const head = d.kepala ? engine.C[d.kepala] : null;
    const mems = Object.values(engine.C).filter((c) => c.hidup && c.dinasti === d.id);
    const herald = d.herald ? HERALDS.find((h) => h.id === d.herald) : null;
    return (
      <ViewShell title={`Dinasti ${d.nama}`} onBack={() => engine.back()} onHome={() => engine.home()}>
        <div className="p-4 bg-[#FAF8F2] border-b border-[#E6E1D3] space-y-1 text-xs text-[#44403C]">
          <div className="text-sm font-bold text-[#1C1917]">
            {herald ? `${herald.simbol} ` : ''}
            {d.nama}
          </div>
          <div>
            Prestise: <span className="font-num font-semibold">{Math.round(d.prestise)}</span> · Kas Dinasti:{' '}
            <span className="font-num font-semibold">{Math.round(d.fund || 0)}</span> · Anggota Hidup:{' '}
            <span className="font-num font-semibold">{mems.length}</span>
          </div>
          {head && <div>Kepala Dinasti: {engine.full(head)}</div>}
        </div>
        {did === p.dinasti && (
          <>
            <SectionHeader title="Aksi Dinasti" />
            <ListRow title="Iuran Dana Dinasti" subtitle="Setor 5% emasmu ke kas wangsa" onClick={() => engine.dynFund()} />
            <ListRow title="Dirikan Cabang Dinasti" subtitle="Beri cabang wangsa baru untuk anggota dewasa" onClick={() => engine.dynCadet()} />
            {d.parent && (
              <ListRow
                title="Reunifikasi dengan Dinasti Induk"
                subtitle="Butuh 100 prestise & minimal Count"
                onClick={() => engine.reunifyDynasty(d.parent!)}
              />
            )}
          </>
        )}
        <SectionHeader title="Anggota Dinasti" right={`${mems.length} orang`} />
        {mems.slice(0, 25).map((m) => (
          <ListRow key={m.id} title={engine.full(m)} subtitle={`${engine.tTitle(m)} · Usia ${engine.umur(m)}`} onClick={() => engine.go('ch', m.id)} />
        ))}
      </ViewShell>
    );
  }

  if (view === 'cadetPick') {
    const cands = Object.values(engine.C).filter(
      (c) => c.hidup && c.id !== p.id && c.dinasti === p.dinasti && engine.umur(c) >= 16
    );
    return (
      <ViewShell title="Pilih Pendiri Cabang Dinasti" onBack={() => engine.back()} onHome={() => engine.home()}>
        {cands.map((c) => (
          <ListRow
            key={c.id}
            title={engine.full(c)}
            subtitle={`Usia ${engine.umur(c)} · ${engine.tTitle(c)}`}
            onClick={() => engine.dynCadet(c.id)}
          />
        ))}
      </ViewShell>
    );
  }

  if (view === 'kronik') {
    const did = arg || p.dinasti;
    const logs = (did ? engine.G.dynHist[did] : []) || [];
    return (
      <ViewShell title="Kronik Dinasti" onBack={() => engine.back()} onHome={() => engine.home()}>
        {logs.length === 0 ? (
          <div className="p-4 text-xs text-[#57534E]">Belum ada catatan sejarah dinasti.</div>
        ) : (
          <ul className="divide-y divide-[#E6E1D3]">
            {logs.slice().reverse().map((l, idx) => (
              <li key={idx} className="px-4 py-2.5 text-xs text-[#292524]">
                <span className="font-num font-bold text-[#9A6614] mr-2">Thn {l.y}</span>
                {l.text}
              </li>
            ))}
          </ul>
        )}
      </ViewShell>
    );
  }

  if (view === 'dl') {
    const list = Object.values(engine.DY)
      .filter((d) => !searchTerm.trim() || d.nama.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => b.prestise - a.prestise);
    return (
      <ViewShell title="Direktori Dinasti Eropa" onBack={() => engine.back()} onHome={() => engine.home()}>
        <div className="p-3 bg-[#FAF8F2] border-b border-[#DDD6C3]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama dinasti..."
            className="w-full px-3 py-1.5 text-xs bg-white border border-[#D6CFC0] rounded"
          />
        </div>
        {list.slice(0, 60).map((d) => (
          <ListRow
            key={d.id}
            title={d.nama}
            subtitle={`Prestise ${Math.round(d.prestise)} · ${d.status.replace(/_/g, ' ')}`}
            onClick={() => engine.go('dd', d.id)}
          />
        ))}
      </ViewShell>
    );
  }

  return null;
};
