import React, { useState } from 'react';
import { getBannerForRoute } from '../../assets/media';
import { engine, REL_RANKS } from '../../engine/gameEngine';
import { ListRow, SectionHeader, StatBar, ViewShell } from '../GameImage';

interface Props {
  view: string;
  arg?: string;
}

export const CourtDiplomacyChurchView: React.FC<Props> = ({ view, arg }) => {
  const p = engine.me();
  const [sectName, setSectName] = useState('');

  if (view === 'dip') {
    const rulers = Object.values(engine.C)
      .filter((c) => c.hidup && c.id !== p.id && engine.tierOf(c) >= 3)
      .sort((a, b) => engine.tierOf(b) - engine.tierOf(a))
      .slice(0, 35);
    return (
      <ViewShell
        title="Diplomasi, Dewan & Spionase"
        onBack={() => engine.back()}
        onHome={() => engine.home()}
        bannerUrl={getBannerForRoute('dip').url}
        bannerCaption="Balairung Diplomatik"
      >
        <SectionHeader title="Institusi Istana" />
        <ListRow
          icon="👔"
          title="Penasihat & Birokrasi Detail"
          subtitle="Kelola pejabat, kualitas, loyalitas, & investigasi korupsi"
          onClick={() => engine.go('pen')}
        />
        <ListRow
          icon="🏛️"
          title="Dewan Bangsawan"
          subtitle="Ajukan rancangan pajak, perang, atau reformasi ke pemungutan suara"
          onClick={() => engine.go('dewan')}
        />
        <ListRow
          icon="🕵️"
          title="Jaringan Spionase & Intelijen"
          subtitle="Intip kekayaan, sabotase logistik, fitnah, atau eliminasi rival"
          onClick={() => engine.go('spy')}
        />
        <ListRow
          icon="⚔️"
          title="Faksi Istana"
          subtitle={engine.G.faction ? `Memihak: ${engine.FAKSI[engine.G.faction]?.nama || engine.G.faction}` : 'Netral'}
          onClick={() => engine.go('faksi')}
        />
        <ListRow
          icon="💼"
          title="Lamar Jabatan Istana Atasan"
          subtitle={engine.G.job ? 'Sedang menjabat di istana atasan' : 'Cari pos pelayan istana (khusus tier ≤ 2)'}
          onClick={() => engine.go('job')}
        />

        <SectionHeader title="Aliansi Aktif" right={`${engine.G.al.length} perjanjian`} />
        {engine.G.al.length === 0 ? (
          <div className="p-4 text-xs text-[#57534E]">Belum ada perjanjian aliansi aktif.</div>
        ) : (
          engine.G.al.map((a, idx) => {
            const o = engine.C[a.id];
            return (
              <ListRow
                key={idx}
                title={o ? engine.full(o) : a.id}
                subtitle={`Jenis: ${a.tp} (sejak ${a.y})`}
                rightLabel="Putus"
                onClick={() => engine.breakAlliance(a.id, a.tp)}
              />
            );
          })
        )}

        <SectionHeader title="Penguasa Eropa" />
        {rulers.map((r) => (
          <ListRow
            key={r.id}
            title={engine.full(r)}
            subtitle={`${engine.tTitle(r)} · Opini ${Math.round(engine.opn(r, p))} · Kekuatan ${Math.round(engine.pwr(r))}`}
            onClick={() => engine.go('dc', r.id)}
          />
        ))}
      </ViewShell>
    );
  }

  if (view === 'dc' && arg) {
    const o = engine.C[arg];
    if (!o) return null;
    const deals = engine.D.perjanjian_aliansi || [];
    return (
      <ViewShell title={`Diplomasi · ${engine.full(o)}`} onBack={() => engine.back()} onHome={() => engine.home()}>
        <div className="p-4 bg-[#FAF8F2] border-b border-[#E6E1D3] text-xs text-[#44403C]">
          {engine.tTitle(o)} · Opini terhadapmu:{' '}
          <span className="font-num font-bold">{Math.round(engine.opn(o, p))}</span>
        </div>
        <SectionHeader title="Tawarkan Perjanjian" />
        {deals.map((d: { id: string; nama: string; biaya_prestise: number; durasi: number }) => (
          <ListRow
            key={d.id}
            title={d.nama}
            subtitle={`Biaya ${d.biaya_prestise} prestise · Durasi ${d.durasi} tahun`}
            onClick={() => engine.prop(o.id, d.id)}
          />
        ))}
        <SectionHeader title="Aksi Lainnya" />
        <ListRow icon="✉️" title="Kirim Surat Diplomatik" onClick={() => engine.go('sr', o.id)} />
        <ListRow icon="👤" title="Lihat Profil Karakter" onClick={() => engine.go('ch', o.id)} />
      </ViewShell>
    );
  }

  if (view === 'sr' && arg) {
    const o = engine.C[arg];
    if (!o) return null;
    return (
      <ViewShell title={`Kirim Surat ke ${engine.full(o)}`} onBack={() => engine.back()} onHome={() => engine.home()}>
        {engine.SRT().map((s: { id: string; nama: string; biaya?: { emas?: number }; op?: number }) => (
          <ListRow
            key={s.id}
            icon="✉️"
            title={s.nama}
            subtitle={`Biaya ${s.biaya?.emas || 0} emas · Opini +${s.op || 0}`}
            onClick={() => engine.surat(o.id, s.id)}
          />
        ))}
      </ViewShell>
    );
  }

  if (view === 'pen' || view === 'pejabat' || view === 'offView') {
    const jobs = engine.D.jabatan || [];
    return (
      <ViewShell title="Penasihat & Birokrasi Istana" onBack={() => engine.back()} onHome={() => engine.home()}>
        {jobs.map((j: { id: string; nama: string; stat: string; gaji: number }) => {
          const cid = engine.G.pen[j.id];
          const holder = cid ? engine.C[cid] : null;
          const od = holder ? engine.officeEnsure(j.id) : null;
          return (
            <div key={j.id} className="border-b border-[#DDD6C3]">
              <SectionHeader
                title={j.nama}
                right={`Stat: ${j.stat} · Gaji ${j.gaji} emas/th`}
              />
              {holder && od ? (
                <div className="p-4 space-y-3 bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold text-[#1C1917]">{engine.full(holder)}</div>
                      <div className="text-xs text-[#57534E]">
                        Sifat Jabatan: <span className="capitalize font-medium">{od.trait}</span> · Efisiensi{' '}
                        <span className="font-num font-semibold">{Math.round(engine.officeEfficiency(j.id) * 100)}%</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => engine.officePromote(j.id)}
                        className="px-2.5 py-1 text-xs font-semibold bg-[#9A6614] text-white rounded cursor-pointer"
                      >
                        Promosi (50g)
                      </button>
                      <button
                        type="button"
                        onClick={() => engine.officeInvestigate(j.id)}
                        className="px-2.5 py-1 text-xs font-semibold bg-[#FAF8F2] border border-[#D6CFC0] text-[#1C1917] rounded cursor-pointer"
                      >
                        Audit (30g)
                      </button>
                      <button
                        type="button"
                        onClick={() => engine.go('pj', j.id)}
                        className="px-2.5 py-1 text-xs font-semibold bg-[#FAF8F2] border border-[#D6CFC0] text-[#1C1917] rounded cursor-pointer"
                      >
                        Ganti
                      </button>
                      <button
                        type="button"
                        onClick={() => engine.dismissAdvisor(j.id)}
                        className="px-2.5 py-1 text-xs font-semibold bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] rounded cursor-pointer"
                      >
                        Pecat
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <StatBar value={od.quality} label={`Kualitas (${engine.officeQualityName(od.quality)})`} />
                    <StatBar value={od.loyalty} label={`Loyalitas (${engine.officeLoyaltyName(od.loyalty)})`} />
                    <StatBar value={100 - od.corruption} label={`Integritas (Risiko Korupsi ${od.corruption}%)`} />
                  </div>
                </div>
              ) : (
                <ListRow
                  title="Jabatan Masih Kosong"
                  subtitle={`Tunjuk pejabat untuk memimpin pos ${j.nama}`}
                  rightLabel="Tunjuk"
                  onClick={() => engine.go('pj', j.id)}
                />
              )}
            </div>
          );
        })}
        {engine.G.officerHistory?.length > 0 && (
          <>
            <SectionHeader title="Catatan Birokrasi Terbaru" />
            <ul className="divide-y divide-[#E6E1D3]">
              {engine.G.officerHistory.slice(-10).reverse().map((h, i) => (
                <li key={i} className="px-4 py-2 text-xs text-[#44403C]">
                  <span className="font-num font-bold mr-2">Thn {h.y}</span>
                  {engine.C[h.id]?.nama || h.id} · {h.j} · {h.type}
                  {h.stolen ? ` (-${h.stolen} emas)` : ''}
                </li>
              ))}
            </ul>
          </>
        )}
      </ViewShell>
    );
  }

  if (view === 'pj' && arg) {
    const j = (engine.D.jabatan || []).find((x: { id: string; stat?: string }) => x.id === arg);
    const statKey = (j?.stat || 'administrasi') as keyof typeof p.sk;
    const cands = Object.values(engine.C)
      .filter((c) => c.hidup && c.id !== p.id && engine.ageOK(c) && engine.tierOf(c) < 3)
      .sort((a, b) => (b.sk[statKey] || 0) - (a.sk[statKey] || 0))
      .slice(0, 20);
    return (
      <ViewShell title={`Pilih ${j?.nama || arg}`} onBack={() => engine.back()} onHome={() => engine.home()}>
        {cands.map((c) => (
          <ListRow
            key={c.id}
            title={engine.full(c)}
            subtitle={`${j?.stat || 'Stat'}: ${c.sk[statKey] || 0} · Opini ${Math.round(engine.opn(c, p))}`}
            rightLabel="Angkat"
            onClick={() => engine.appoint(arg, c.id)}
          />
        ))}
      </ViewShell>
    );
  }

  if (view === 'dewan') {
    const members = engine.buildCouncil();
    const vote = engine.G.councilVote;
    return (
      <ViewShell title="Dewan Bangsawan Kerajaan" onBack={() => engine.back()} onHome={() => engine.home()}>
        <SectionHeader title="Ajukan Rancangan ke Dewan" />
        <ListRow title="Rancangan Pajak Darurat (+30 Emas)" subtitle="Butuh mayoritas suara dewan" onClick={() => engine.councilPropose('pajak')} />
        <ListRow title="Mobilisasi Dukungan Perang (+8% Moral)" subtitle="Tingkatkan kesiapan tempur" onClick={() => engine.councilPropose('perang')} />
        <ListRow title="Piagam Reformasi Rakyat (+6 Kebahagiaan)" subtitle="Memperbaiki citra istana" onClick={() => engine.councilPropose('reformasi')} />

        {vote && (
          <div className="p-4 bg-[#FAF8F2] border-b border-[#E6E1D3] text-xs space-y-1">
            <div className="font-bold text-[#1C1917]">
              Hasil Sidang Tahun {vote.y} ({vote.type}): {vote.passed ? 'DISETUJUI' : 'DITOLAK'}
            </div>
            {vote.details.map((d, i) => (
              <div key={i} className="text-[#57534E]">{d}</div>
            ))}
          </div>
        )}

        <SectionHeader title="Anggota Dewan Bangsawan" right={`${members.length} tokoh`} />
        {members.length === 0 ? (
          <div className="p-4 text-xs text-[#57534E]">Belum ada vasal atau penasihat yang duduk di dewan.</div>
        ) : (
          members.map((m) => (
            <ListRow
              key={m.id}
              title={engine.full(m)}
              subtitle={`${engine.tTitle(m)} · Opini ${Math.round(engine.opn(m, p))}`}
              onClick={() => engine.go('ch', m.id)}
            />
          ))
        )}
      </ViewShell>
    );
  }

  if (view === 'spy') {
    const targets = Object.values(engine.C)
      .filter((c) => c.hidup && c.id !== p.id && engine.tierOf(c) >= 2)
      .slice(0, 20);
    return (
      <ViewShell title="Jaringan Spionase & Intelijen" onBack={() => engine.back()} onHome={() => engine.home()}>
        <div className="p-4 bg-[#FAF8F2] border-b border-[#E6E1D3] text-xs text-[#44403C]">
          Skill Spionase Pribadi: <span className="font-num font-bold">{p.sk.spionase}</span>
          {engine.G.pen.mata && engine.C[engine.G.pen.mata]
            ? ` · Kepala Telik Sandi: ${engine.full(engine.C[engine.G.pen.mata])}`
            : ' · Kepala Telik Sandi belum ditunjuk'}
        </div>
        {targets.map((c) => (
          <div key={c.id} className="p-3.5 border-b border-[#E6E1D3] flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-[#1C1917]">{engine.full(c)}</div>
              <div className="text-xs text-[#57534E]">
                {engine.tTitle(c)} · Intrigue {c.sk.spionase}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => engine.spyAction('intip', c.id)}
                className="px-2.5 py-1 text-xs font-medium bg-[#FAF8F2] border border-[#D6CFC0] rounded cursor-pointer"
              >
                Intip (10g)
              </button>
              <button
                type="button"
                onClick={() => engine.spyAction('fitnah', c.id)}
                className="px-2.5 py-1 text-xs font-medium bg-[#FAF8F2] border border-[#D6CFC0] rounded cursor-pointer"
              >
                Fitnah (20g)
              </button>
              <button
                type="button"
                onClick={() => engine.spyAction('sabotase', c.id)}
                className="px-2.5 py-1 text-xs font-medium bg-[#FAF3E0] border border-[#E6D9B5] text-[#78350F] rounded cursor-pointer"
              >
                Sabotase (25g)
              </button>
              <button
                type="button"
                onClick={() => engine.spyAction('bunuh', c.id)}
                className="px-2.5 py-1 text-xs font-medium bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] rounded cursor-pointer"
              >
                Asasinasi (60g)
              </button>
            </div>
          </div>
        ))}
      </ViewShell>
    );
  }

  if (view === 'gereja' || view === 'relView') {
    const pope = engine.G.church.pope ? engine.C[engine.G.church.pope] : null;
    const myRankId = engine.relRankOf(p);
    const myRank = REL_RANKS.find((r) => r.id === myRankId);
    const nextRank = engine.nextRelRank(p);
    const isExcom = Boolean(engine.G.church.excom[p.id]);
    return (
      <ViewShell
        title="Gereja Katolik, Takhta Suci & Agama"
        onBack={() => engine.back()}
        onHome={() => engine.home()}
        bannerUrl={getBannerForRoute('agama').url}
        bannerCaption="Katedral & Takhta Suci"
      >
        <div className="p-4 bg-[#FAF8F2] border-b border-[#E6E1D3] space-y-1 text-xs text-[#44403C]">
          <div>
            Agamamu: <strong>{engine.AG(p.agama).nama}</strong> · Doktrin Konsili: <strong>{engine.G.church.doctrine}</strong>
          </div>
          <div>
            Paus Saat Ini: <strong>{pope && pope.hidup ? engine.full(pope) : 'Kosong (Konklaf Dibuka)'}</strong>
          </div>
          {myRank && (
            <div>
              Jabatan Rohanimu: <strong>{myRank.nama}</strong>
            </div>
          )}
          {isExcom && (
            <div className="text-[#991B1B] font-semibold">
              Kamu sedang diekskomunikasi (-15% pendapatan emas)!
            </div>
          )}
        </div>

        <SectionHeader title="Hierarki Gereja & Wewenang Kepausan" />
        {p.agama === 'katolik' && nextRank && (
          <ListRow
            icon="⛪"
            title={`Naik Pangkat Rohani: ${nextRank.nama}`}
            subtitle={`Syarat ${nextRank.minPiety} kesalehan (kini ${Math.round(p.res.kesalehan)})`}
            onClick={() => engine.advanceRel()}
          />
        )}
        {(!pope || !pope.hidup) && (
          <ListRow icon="🗳️" title="Gelar Konklaf Pemilihan Paus" subtitle="Takhta Suci kosong" onClick={() => engine.openConclave()} />
        )}
        {isExcom && (
          <ListRow icon="🙏" title="Mohon Pencabutan Ekskomunikasi" subtitle="60 Emas atau 80 Kesalehan" onClick={() => engine.liftExcom(p.id)} />
        )}
        <ListRow icon="🔥" title="Ekskomunikasi Tokoh" subtitle="Keluarkan tokoh dari persekutuan Gereja" onClick={() => engine.go('excom')} />
        <ListRow icon="⛔" title="Jatuhkan Interdik Kerajaan" subtitle="Hukum wilayah penguasa pembangkang" onClick={() => engine.go('interdict')} />
        <ListRow icon="📜" title="Tetapkan Doktrin Konsili" subtitle="Khusus Paus / Kardinal" onClick={() => engine.go('council')} />
        <ListRow icon="✝️" title="Nominasikan Uskup Baru" subtitle="30 Emas · +10 Kesalehan" onClick={() => engine.go('appointB')} />

        <SectionHeader title="Agama, Sekte & Reformasi" />
        <ListRow icon="🕯️" title="Pindah Agama / Mazhab" subtitle="Peluk agama lain yang tersedia" onClick={() => engine.go('agama')} />
        <ListRow icon="📖" title="Dirikan Sekte Baru" subtitle="Pilih 1–2 doktrin khusus" onClick={() => engine.go('sekte')} />
        <ListRow icon="⚡" title="Reformasi Sekte" subtitle="Jadikan sektemu mazhab resmi berdaulat" onClick={() => engine.go('reform')} />
        <ListRow icon="🛡️" title="Reformasi Protestan & Perang 30 Tahun" subtitle="Status pergolakan iman abad ke-16" onClick={() => engine.go('prot')} />
      </ViewShell>
    );
  }

  if (view === 'excom') {
    const cands = Object.values(engine.C)
      .filter((c) => c.hidup && c.id !== p.id && c.agama === 'katolik' && engine.tierOf(c) >= 3)
      .slice(0, 25);
    return (
      <ViewShell title="Ekskomunikasi Penguasa" onBack={() => engine.back()} onHome={() => engine.home()}>
        {cands.map((c) => {
          const ex = Boolean(engine.G.church.excom[c.id]);
          return (
            <ListRow
              key={c.id}
              title={engine.full(c)}
              subtitle={`${engine.tTitle(c)} · ${ex ? 'Sudah Diekskomunikasi' : 'Katolik Aktif'}`}
              rightLabel={ex ? 'Cabut' : 'Ekskomunikasi'}
              onClick={() => (ex ? engine.liftExcom(c.id) : engine.excommunicate(c.id))}
            />
          );
        })}
      </ViewShell>
    );
  }

  if (view === 'interdict') {
    const kingdoms = Object.values(engine.T).filter((t) => t.tier >= 5 && t.pem && t.pem !== p.id);
    return (
      <ViewShell title="Interdik Wilayah" onBack={() => engine.back()} onHome={() => engine.home()}>
        {kingdoms.map((t) => (
          <ListRow
            key={t.id}
            title={t.nama}
            subtitle={t.pem && engine.C[t.pem] ? `Penguasa: ${engine.full(engine.C[t.pem])}` : '—'}
            rightLabel={engine.G.church.interdict[t.id] ? 'Terkena Interdik' : 'Jatuhkan'}
            onClick={() => engine.interdictKingdom(t.id)}
          />
        ))}
      </ViewShell>
    );
  }

  if (view === 'appointB') {
    const cands = Object.values(engine.C)
      .filter((c) => c.hidup && c.agama === 'katolik' && !engine.G.church.bishops.includes(c.id) && engine.umur(c) >= 20)
      .slice(0, 20);
    return (
      <ViewShell title="Tahbiskan Uskup Baru (30 Emas)" onBack={() => engine.back()} onHome={() => engine.home()}>
        {cands.map((c) => (
          <ListRow
            key={c.id}
            title={engine.full(c)}
            subtitle={`Kesalehan ${Math.round(c.res.kesalehan)} · Pembelajaran ${c.sk.pembelajaran}`}
            rightLabel="Tahbiskan"
            onClick={() => engine.advanceNPCBishop(c.id)}
          />
        ))}
      </ViewShell>
    );
  }

  if (view === 'council') {
    const docs = ['Ortodoks Tradisional', 'Supremasi Takhta Suci', 'Reformasi Moral Biara', 'Toleransi Akademik'];
    return (
      <ViewShell title="Konsili Gereja" onBack={() => engine.back()} onHome={() => engine.home()}>
        {docs.map((doc) => (
          <ListRow
            key={doc}
            title={doc}
            rightLabel={engine.G.church.doctrine === doc ? 'Aktif' : 'Tetapkan'}
            onClick={() => engine.setChurchDoctrine(doc)}
          />
        ))}
      </ViewShell>
    );
  }

  if (view === 'agama') {
    const list = (engine.D.agama || []).concat(engine.G.ag || []);
    return (
      <ViewShell title="Pindah Agama / Mazhab" onBack={() => engine.back()} onHome={() => engine.home()}>
        {list.map((a: { id: string; nama: string; tersedia_dari?: number; efek?: Record<string, number> }) => {
          const locked = Boolean(a.tersedia_dari && engine.G.tahun < a.tersedia_dari);
          return (
            <ListRow
              key={a.id}
              title={a.nama}
              subtitle={locked ? `Tersedia mulai tahun ${a.tersedia_dari}` : engine.ef2(a.efek)}
              rightLabel={p.agama === a.id ? 'Aktif' : 'Peluk'}
              disabled={locked || p.agama === a.id}
              onClick={() => engine.conv(a.id)}
            />
          );
        })}
      </ViewShell>
    );
  }

  if (view === 'sekte') {
    const doktrin = engine.D.aturan_agama?.doktrin || [];
    return (
      <ViewShell title="Dirikan Sekte Baru" onBack={() => engine.back()} onHome={() => engine.home()}>
        <div className="p-4 bg-[#FAF8F2] border-b border-[#E6E1D3] space-y-2">
          <input
            type="text"
            value={sectName}
            onChange={(e) => setSectName(e.target.value)}
            placeholder="Nama sekte barumu..."
            className="w-full px-3 py-2 text-xs bg-white border border-[#D6CFC0] rounded"
          />
          <button
            type="button"
            onClick={() => engine.mkSekte(sectName)}
            className="w-full py-2 text-xs font-semibold text-white bg-[#9A6614] hover:bg-[#7E520E] rounded cursor-pointer"
          >
            Dirikan Sekte (100 Kesalehan, 50 Prestise, pilih 1–2 doktrin)
          </button>
        </div>
        <SectionHeader title="Pilih 1–2 Doktrin" right={`${engine.G.sel.length}/2 dipilih`} />
        {doktrin.map((d: { id: string; nama: string; efek?: Record<string, number> }) => (
          <ListRow
            key={d.id}
            title={d.nama}
            subtitle={engine.ef2(d.efek)}
            rightLabel={engine.G.sel.includes(d.id) ? 'Dipilih' : 'Pilih'}
            onClick={() => engine.toggleDoctrine(d.id)}
          />
        ))}
      </ViewShell>
    );
  }

  if (view === 'reform') {
    const cur = engine.AG(p.agama);
    return (
      <ViewShell title="Reformasi Sekte" onBack={() => engine.back()} onHome={() => engine.home()}>
        <div className="p-4 text-xs text-[#44403C] space-y-2">
          <div>Agama saat ini: <strong>{cur.nama}</strong></div>
          <p>Syarat reformasi: Sekte aktif, 300 kesalehan, 100 prestise, dan minimal gelar Count.</p>
          <button
            type="button"
            onClick={() => engine.reformSect()}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#9A6614] rounded cursor-pointer"
          >
            Lakukan Reformasi Iman
          </button>
        </div>
      </ViewShell>
    );
  }

  if (view === 'prot') {
    const tyw = engine.G.thirtyYearsWar;
    return (
      <ViewShell title="Reformasi Protestan & Perang 30 Tahun" onBack={() => engine.back()} onHome={() => engine.home()}>
        <div className="p-4 bg-[#FAF8F2] border-b border-[#E6E1D3] text-xs text-[#44403C] space-y-1">
          <div>Status Reformasi Protestan: <strong>{engine.G.protestantStarted ? 'Sudah Dimulai' : 'Belum Dimulai'}</strong></div>
          <div>Gereja Anglikan: <strong>{engine.G.anglican ? 'Berdiri' : 'Belum Berdiri'}</strong></div>
          {tyw && (
            <div className="text-[#991B1B] font-semibold">
              Perang 30 Tahun berlangsung (Tahun {tyw.turns}/10 · {Math.round(tyw.power)} vs {Math.round(tyw.enemy)})
            </div>
          )}
        </div>
        <ListRow
          title="Picu Perang 30 Tahun"
          subtitle="Khusus penguasa Protestan (50 prestise, ≥100 pasukan)"
          onClick={() => engine.trigger30YearsWar()}
        />
      </ViewShell>
    );
  }

  if (view === 'faksi') {
    return (
      <ViewShell title="Faksi Istana & Karantina Wabah" onBack={() => engine.back()} onHome={() => engine.home()}>
        <SectionHeader title="Pilih Faksi Istana" />
        {Object.entries(engine.FAKSI).map(([id, f]) => {
          const rep = (engine.G.factionRep as Record<string, number>)[id] || 0;
          return (
            <ListRow
              key={id}
              icon={f.icon}
              title={f.nama}
              subtitle={`${f.efek} · Reputasi ${rep}`}
              rightLabel={engine.G.faction === id ? 'Aktif' : 'Gabung'}
              onClick={() => engine.alignFaksi(id)}
            />
          );
        })}
        <SectionHeader title="Wabah Lokal Aktif" />
        {Object.keys(engine.G.plague).length === 0 ? (
          <div className="p-4 text-xs text-[#57534E]">Tidak ada wabah aktif.</div>
        ) : (
          Object.entries(engine.G.plague).map(([tid, pl]) => (
            <ListRow
              key={tid}
              title={engine.T[tid]?.nama || tid}
              subtitle={`Keparahan ${pl.sev}% · Tahun ke-${pl.turns}`}
              rightLabel="Karantina (20g)"
              onClick={() => engine.quarantine(tid)}
            />
          ))
        )}
      </ViewShell>
    );
  }

  if (view === 'job') {
    const rulers = Object.values(engine.C)
      .filter((c) => c.hidup && c.id !== p.id && engine.tierOf(c) >= 3)
      .slice(0, 18);
    return (
      <ViewShell title="Jabatan Istana" onBack={() => engine.back()} onHome={() => engine.home()}>
        {engine.G.job ? (
          <ListRow
            title="Mengundurkan Diri dari Jabatan Saat Ini"
            subtitle={`Mengabdi pada ${engine.C[engine.G.job.r]?.nama || engine.G.job.r}`}
            onClick={() => engine.quitJob()}
          />
        ) : (
          rulers.map((r) => (
            <ListRow
              key={r.id}
              title={engine.full(r)}
              subtitle={`${engine.tTitle(r)} · Opini ${Math.round(engine.opn(r, p))}`}
              onClick={() => engine.go('ja', r.id)}
            />
          ))
        )}
      </ViewShell>
    );
  }

  if (view === 'ja' && arg) {
    return (
      <ViewShell title="Pilih Posisi Jabatan" onBack={() => engine.back()} onHome={() => engine.home()}>
        {(engine.D.jabatan || []).map((j: { id: string; nama: string; stat: string }) => (
          <ListRow
            key={j.id}
            title={j.nama}
            subtitle={`Stat utama: ${j.stat}`}
            onClick={() => engine.jobApply(arg, j.id)}
          />
        ))}
      </ViewShell>
    );
  }

  return null;
};
