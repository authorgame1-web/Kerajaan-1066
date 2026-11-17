import React from 'react';
import { getBannerForRoute } from '../../assets/media';
import { engine } from '../../engine/gameEngine';
import { ListRow, SectionHeader, ViewShell } from '../GameImage';

interface Props {
  view: string;
  arg?: string;
}

export const RealmAndEconomyView: React.FC<Props> = ({ view, arg }) => {
  const p = engine.me();
  const heldTitles = engine.held(p.id);

  if (view === 'prov') {
    const counties = heldTitles.filter((t) => t.tier <= 3);
    return (
      <ViewShell
        title="Wilayah & Ekonomi Kerajaan"
        onBack={() => engine.back()}
        onHome={() => engine.home()}
        bannerUrl={getBannerForRoute('prov').url}
        bannerCaption="Tata Ekonomi & Provinsi"
      >
        <SectionHeader title="Perekonomian & Perdagangan" />
        <ListRow
          icon="⚖️"
          title="Pasar Harga Dinamis"
          subtitle={`Gandum ${engine.G.prices?.grain ?? 2}g · Besi ${engine.G.prices?.iron ?? 5}g · Kain ${engine.G.prices?.cloth ?? 4}g · Rempah ${engine.G.prices?.spice ?? 10}g`}
          onClick={() => engine.go('pasar')}
        />
        <ListRow
          icon="🐪"
          title="Rute Perdagangan"
          subtitle={`${engine.G.trade.length}/5 kafilah aktif`}
          onClick={() => engine.go('trade')}
        />
        <ListRow
          icon="🏦"
          title="Pinjaman Bank & Gilda"
          subtitle={`${engine.G.loans.length} pinjaman aktif`}
          onClick={() => engine.go('pinjaman')}
        />
        <ListRow
          icon="🏪"
          title="Usaha Pengusaha"
          subtitle={`${engine.G.us.length}/4 usaha aktif`}
          onClick={() => engine.go('usaha')}
        />
        <ListRow
          icon="💰"
          title="Kebijakan Pajak"
          subtitle={`Tarif saat ini: ${engine.PJK()[engine.G.paj ?? 1]?.nama || 'Normal'}`}
          onClick={() => engine.go('paj')}
        />
        <ListRow
          icon="🧭"
          title="Ekspedisi Samudra (1400+)"
          subtitle={engine.G.tahun >= 1400 ? `${engine.G.expeditions.length} pelayaran tercatat` : 'Terbuka mulai tahun 1400'}
          onClick={() => engine.go('ekspedisi')}
        />

        <SectionHeader title="Provinsi Milikmu" right={`${counties.length} wilayah`} />
        {counties.length === 0 ? (
          <div className="p-4 text-xs text-[#57534E]">Kamu belum memiliki wilayah provinsi secara langsung.</div>
        ) : (
          counties.map((t) => {
            const pr = engine.provs(t);
            return (
              <ListRow
                key={t.id}
                icon="🏘️"
                title={t.nama}
                subtitle={`${pr.length} provinsi · Total Ekonomi ${pr.reduce((s, v) => s + v.eko, 0)}`}
                onClick={() => engine.go('pv', t.id)}
              />
            );
          })
        )}
      </ViewShell>
    );
  }

  if (view === 'pv' && arg) {
    const t = engine.T[arg];
    if (!t) return null;
    const provs = engine.provs(t);
    const buildings = engine.D.bangunan || [];
    return (
      <ViewShell title={`Provinsi di ${t.nama}`} onBack={() => engine.back()} onHome={() => engine.home()}>
        {provs.map((v, idx) => {
          const slots = engine.slotProv(v);
          const qCount = engine.G.q.filter((y) => y.tid === t.id && y.i === idx).length;
          return (
            <div key={idx} className="border-b border-[#DDD6C3]">
              <SectionHeader
                title={v.nama}
                right={`Eko ${v.eko} · Dev ${v.dev} · Slot ${v.b.length + qCount}/${slots}`}
              />
              <div className="px-4 py-2 bg-[#FAF8F2] text-xs text-[#57534E] flex flex-wrap items-center justify-between gap-2">
                <span>
                  Agama: <strong>{engine.AG(v.agama).nama}</strong> · Budaya: <strong>{v.culture}</strong> ·{' '}
                  {v.pes ? 'Pesisir' : 'Daratan'}
                </span>
                {v.agama !== p.agama && (
                  <button
                    type="button"
                    onClick={() => engine.convertProvince(t.id, idx)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-[#9A6614] text-white rounded cursor-pointer"
                  >
                    Kirim Misionaris (20 Kesalehan, 15 Emas)
                  </button>
                )}
              </div>
              {v.b.length > 0 && (
                <div className="px-4 py-2 text-xs text-[#292524]">
                  Terbangun: {v.b.map((bid) => engine.bi(bid)?.nama || bid).join(', ')}
                </div>
              )}
              {buildings.map((b: { id: string; nama: string; biaya: number; waktu_tahun: number; efek?: Record<string, number> }) => (
                <ListRow
                  key={b.id}
                  title={`Bangun ${b.nama}`}
                  subtitle={`Biaya ${b.biaya} emas · ${b.waktu_tahun} tahun · ${engine.ef2(b.efek)}`}
                  onClick={() => engine.bd(t.id, idx, b.id)}
                />
              ))}
            </div>
          );
        })}
      </ViewShell>
    );
  }

  if (view === 'pasar') {
    const pr = engine.G.prices || { grain: 2, iron: 5, cloth: 4, spice: 10 };
    return (
      <ViewShell title="Pasar Komoditas Eropa" onBack={() => engine.back()} onHome={() => engine.home()}>
        <SectionHeader title={`Kurs Harga Tahun ${engine.G.tahun}`} />
        <ListRow title="Gandum" subtitle="Mempengaruhi pasokan pangan saat wabah" rightLabel={`${pr.grain} Emas`} />
        <ListRow title="Besi Tempa" subtitle="Naik tajam saat perang berkecamuk" rightLabel={`${pr.iron} Emas`} />
        <ListRow title="Kain Wol & Sutra" subtitle="Komoditas dagang kota" rightLabel={`${pr.cloth} Emas`} />
        <ListRow title="Rempah Timur" subtitle="Komoditas mewah para bangsawan" rightLabel={`${pr.spice} Emas`} />
        <SectionHeader title="Transaksi Hasil Bumi" />
        <ListRow
          icon="🌾"
          title="Jual 10 Karung Gandum per Wilayah"
          subtitle={`Harga berlaku: ${pr.grain} emas/karung`}
          onClick={() => engine.sellGrain(10)}
        />
      </ViewShell>
    );
  }

  if (view === 'trade') {
    const rulers = Object.values(engine.C)
      .filter((c) => c.hidup && c.id !== p.id && engine.tierOf(c) >= 3)
      .slice(0, 20);
    return (
      <ViewShell title="Rute Perdagangan" onBack={() => engine.back()} onHome={() => engine.home()}>
        <SectionHeader title="Rute Aktif" right={`${engine.G.trade.length}/5`} />
        {engine.G.trade.length === 0 ? (
          <div className="p-4 text-xs text-[#57534E]">Belum ada rute dagang aktif.</div>
        ) : (
          engine.G.trade.map((tr) => {
            const partner = engine.C[tr.with];
            return (
              <ListRow
                key={tr.with}
                title={partner ? engine.full(partner) : tr.with}
                subtitle={`Pendapatan +${tr.income} emas/tahun (sejak ${tr.start})`}
                rightLabel="Tutup"
                onClick={() => engine.cancelTrade(tr.with)}
              />
            );
          })
        )}
        <SectionHeader title="Buka Kafilah Dagang Baru (Modal 30 Emas)" />
        {rulers.map((r) => (
          <ListRow
            key={r.id}
            title={engine.full(r)}
            subtitle={`${engine.tTitle(r)} · Administrasi ${r.sk.administrasi}`}
            rightLabel="Jalin"
            onClick={() => engine.establishTrade(r.id)}
          />
        ))}
      </ViewShell>
    );
  }

  if (view === 'pinjaman') {
    return (
      <ViewShell title="Pinjaman Bank & Pemodal" onBack={() => engine.back()} onHome={() => engine.home()}>
        <SectionHeader title="Pinjaman Aktif" right={`${engine.G.loans.length}/3`} />
        {engine.G.loans.length === 0 ? (
          <div className="p-4 text-xs text-[#57534E]">Kas kerajaan bebas dari utang.</div>
        ) : (
          engine.G.loans.map((ln, idx) => (
            <ListRow
              key={idx}
              title={`Pokok ${ln.amt} Emas`}
              subtitle={`Bunga ${ln.int} emas/tahun (sejak thn ${ln.y})`}
              rightLabel="Lunasi"
              onClick={() => engine.repayLoan(idx)}
            />
          ))
        )}
        <SectionHeader title="Ajukan Pinjaman Baru (Bunga 12%/th)" />
        {[50, 100, 200].map((amt) => (
          <ListRow
            key={amt}
            title={`Pinjam ${amt} Emas`}
            subtitle={`Bunga tahunan ~${Math.max(2, Math.round(amt * 0.12))} emas`}
            onClick={() => engine.takeLoan(amt)}
          />
        ))}
      </ViewShell>
    );
  }

  if (view === 'usaha') {
    const jenis = engine.D.usaha_pengusaha?.jenis || [];
    return (
      <ViewShell title="Usaha Niaga" onBack={() => engine.back()} onHome={() => engine.home()}>
        <SectionHeader title="Usaha Dimiliki" right={`${engine.G.us.length}/4`} />
        {engine.G.us.map((u, idx) => (
          <ListRow key={idx} title={u.j} subtitle={`Pendapatan ${u.p} emas/th`} />
        ))}
        <SectionHeader title="Buka Usaha Baru" />
        {jenis.map((x: { id: string; nama: string; biaya: number; pendapatan: number }) => (
          <ListRow
            key={x.id}
            title={x.nama}
            subtitle={`Modal ${x.biaya} emas · Pendapatan +${x.pendapatan}/th`}
            onClick={() => engine.usaha(x.id)}
          />
        ))}
      </ViewShell>
    );
  }

  if (view === 'paj') {
    return (
      <ViewShell title="Kebijakan Pajak" onBack={() => engine.back()} onHome={() => engine.home()}>
        {engine.PJK().map((pk: { nama: string; mult: number; bahagia?: number; op?: number }, i: number) => (
          <ListRow
            key={i}
            title={pk.nama}
            subtitle={`Pengali pajak x${pk.mult} · Efek kebahagiaan ${pk.bahagia || 0} · Opini vasal ${pk.op || 0}`}
            rightLabel={engine.G.paj === i ? 'Aktif' : 'Pilih'}
            onClick={() => engine.togglePaj(i)}
          />
        ))}
      </ViewShell>
    );
  }

  if (view === 'ekspedisi') {
    return (
      <ViewShell title="Ekspedisi Samudra" onBack={() => engine.back()} onHome={() => engine.home()}>
        <div className="p-4 bg-[#FAF8F2] border-b border-[#E6E1D3] text-xs text-[#44403C]">
          Mulai tahun 1400, kapal layar dapat menembus samudra untuk mencari jalur rempah.
        </div>
        <ListRow
          icon="🧭"
          title="Kirim Ekspedisi Pelayaran (60 Emas)"
          subtitle="Butuh Galangan Kapal atau minimal 1 kapal"
          onClick={() => engine.launchExpedition()}
        />
        <SectionHeader title="Riwayat Pelayaran" />
        {engine.G.expeditions.map((ex, i) => (
          <ListRow
            key={i}
            title={`Tahun ${ex.y} · ${ex.result === 'success' ? 'Sukses' : 'Gagal'}`}
            subtitle={ex.result === 'success' ? `Membawa pulang ${ex.gold} emas` : 'Terhadang badai'}
          />
        ))}
      </ViewShell>
    );
  }

  if (view === 'vasal') {
    const vasals = heldTitles.flatMap((t) =>
      t.kids
        .map((kid) => engine.T[kid])
        .filter((kt) => kt && kt.pem && kt.pem !== p.id)
    );
    return (
      <ViewShell title="Vasal & Peta Kekuasaan" onBack={() => engine.back()} onHome={() => engine.home()}>
        <SectionHeader title="Navigasi Teritorial" />
        <ListRow icon="🗺️" title="Peta Kekuasaan Eropa" subtitle="Lihat kerajaan besar & penguasanya" onClick={() => engine.go('peta')} />
        <ListRow icon="🏛️" title="Hierarki Gelar Wilayah" subtitle="Telusuri struktur kekaisaran, kerajaan, & county" onClick={() => engine.go('gt')} />
        <ListRow icon="👑" title="Bentuk Kerajaan / Gelar Baru" subtitle="Satukan wilayah menjadi takhta berdaulat" onClick={() => engine.go('bentuk')} />
        <SectionHeader title="Vasal Bawahan" right={`${vasals.length} wilayah`} />
        {vasals.length === 0 ? (
          <div className="p-4 text-xs text-[#57534E]">Belum memiliki vasal bawahan langsung.</div>
        ) : (
          vasals.map((vt) => {
            const owner = vt.pem ? engine.C[vt.pem] : null;
            return (
              <ListRow
                key={vt.id}
                title={vt.nama}
                subtitle={owner ? `${engine.full(owner)} · Opini ${Math.round(engine.opn(owner, p))}` : '—'}
                onClick={() => owner && engine.go('ch', owner.id)}
              />
            );
          })
        )}
      </ViewShell>
    );
  }

  if (view === 'peta') {
    const tops = Object.values(engine.T)
      .filter((t) => t.tier >= 5)
      .sort((a, b) => b.tier - a.tier);
    return (
      <ViewShell title="Peta Kekuasaan Eropa" onBack={() => engine.back()} onHome={() => engine.home()}>
        <SectionHeader title="Kerajaan & Kekaisaran Utama" />
        {tops.map((t) => {
          const owner = t.pem ? engine.C[t.pem] : null;
          return (
            <ListRow
              key={t.id}
              icon="👑"
              title={t.nama}
              subtitle={`${owner ? engine.full(owner) : 'Kosong'} · ${t.kids.length} bawahan · Agama ${engine.AG(t.agama).nama}`}
              onClick={() => engine.go('gt', t.id)}
            />
          );
        })}
      </ViewShell>
    );
  }

  if (view === 'gt') {
    const roots = arg
      ? [engine.T[arg]].filter(Boolean)
      : Object.values(engine.T).filter((t) => !t.atas && t.tier >= 4);
    return (
      <ViewShell title="Hierarki Gelar" onBack={() => engine.back()} onHome={() => engine.home()}>
        {roots.map((rt) => (
          <div key={rt.id} className="border-b border-[#DDD6C3]">
            <SectionHeader
              title={rt.nama}
              right={rt.pem && engine.C[rt.pem] ? engine.full(engine.C[rt.pem]) : '—'}
            />
            {rt.kids.map((kid) => {
              const kt = engine.T[kid];
              if (!kt) return null;
              const owner = kt.pem ? engine.C[kt.pem] : null;
              return (
                <ListRow
                  key={kt.id}
                  title={kt.nama}
                  subtitle={`${owner ? engine.full(owner) : '—'} · ${kt.kids.length} sub-wilayah`}
                  onClick={() => (kt.kids.length ? engine.go('gt', kt.id) : owner && engine.go('ch', owner.id))}
                />
              );
            })}
          </div>
        ))}
      </ViewShell>
    );
  }

  if (view === 'bentuk') {
    const list = engine.D.gelar_dapat_dibentuk || [];
    return (
      <ViewShell title="Bentuk Gelar Berdaulat" onBack={() => engine.back()} onHome={() => engine.home()}>
        {list.map((g: { id: string; nama: string; tier: number; syarat: { kuasai_wilayah: string[] } }) => {
          const already = Boolean(engine.T[g.id]);
          const ok = !already && engine.okB(g);
          return (
            <ListRow
              key={g.id}
              title={g.nama}
              subtitle={`Tier ${g.tier} · Syarat kuasai: ${g.syarat.kuasai_wilayah.join(', ')}`}
              rightLabel={already ? 'Sudah Ada' : ok ? 'Bentuk' : 'Belum'}
              onClick={() => !already && engine.bentuk(g.id)}
            />
          );
        })}
      </ViewShell>
    );
  }

  return null;
};
