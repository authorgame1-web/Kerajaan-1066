import React, { useState } from 'react';
import { getPortraitUrl } from '../../assets/media';
import { ACHIEVEMENTS, engine, ORDERS, TUTORS } from '../../engine/gameEngine';
import { Character } from '../../engine/types';
import { DownloadMentahanBox } from '../DownloadMentahanBox';
import { GameImage, ListRow, SectionHeader, StatBar, ViewShell } from '../GameImage';

interface Props {
  view: string;
  arg?: string;
}

export const PlayerProgressAndWorldView: React.FC<Props> = ({ view, arg }) => {
  const p = engine.me();
  const [bookTitle, setBookTitle] = useState('');
  const [exportOut, setExportOut] = useState('');

  if (view === 'ch' && arg) {
    const c = engine.C[arg];
    if (!c) return null;
    const isMe = c.id === p.id;
    const titles = engine.held(c.id);
    return (
      <ViewShell title={engine.full(c)} onBack={() => engine.back()} onHome={() => engine.home()}>
        <div className="p-4 bg-[#FAF8F2] border-b border-[#E6E1D3] flex items-center gap-4">
          <div className="w-16 h-16 rounded-md overflow-hidden border border-[#DDD6C3] shrink-0">
            <GameImage
              src={getPortraitUrl(c.gender)}
              alt={engine.full(c)}
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="text-xs text-[#44403C] space-y-0.5">
            <div className="text-sm font-bold text-[#1C1917]">{engine.tTitle(c)}</div>
            <div>{engine.lifeText(c)}</div>
            <div>
              Agama: <strong>{engine.AG(c.agama).nama}</strong> · Budaya: <strong>{c.budaya}</strong>
              {!isMe && ` · Opini ${Math.round(engine.opn(c, p))}`}
            </div>
            <div>Sifat: {c.sifat.length ? c.sifat.join(', ') : 'Tidak ada'}</div>
          </div>
        </div>

        <SectionHeader title="Statistik Karakter" />
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(c.sk).map(([k, v]) => (
            <StatBar key={k} label={k} value={v} />
          ))}
        </div>

        {!isMe && c.hidup && (
          <>
            <SectionHeader title="Interaksi" />
            <ListRow title="Ajak Bicara" onClick={() => engine.act('talk', c.id)} />
            <ListRow title="Puji" onClick={() => engine.act('puji', c.id)} />
            <ListRow title="Hina" onClick={() => engine.act('hina', c.id)} />
            <ListRow title="Beri Hadiah (20 Emas)" onClick={() => engine.gift(c.id)} />
            <ListRow title="Obati Penyakit (15 Emas)" onClick={() => engine.act('obat', c.id)} />
            <ListRow
              title={engine.G.jail[c.id] ? 'Bebaskan dari Penjara' : 'Penjarakan'}
              onClick={() => engine.jail(c.id)}
            />
            <ListRow
              title={engine.G.fav.includes(c.id) ? 'Hapus dari Favorit' : 'Tandai Favorit'}
              onClick={() => engine.togFav(c.id)}
            />
            {engine.single(c) && (
              <ListRow title="Lamar Menikah" onClick={() => engine.lamar(c.id)} />
            )}
            <ListRow title="Diplomasi & Perjanjian" onClick={() => engine.go('dc', c.id)} />
            {engine.held(p.id).length > 1 && engine.ageOK(c) && (
              <ListRow title="Hibahkan Wilayah ke Tokoh Ini" onClick={() => engine.go('bp', c.id)} />
            )}
          </>
        )}

        {titles.length > 0 && (
          <>
            <SectionHeader title="Gelar Dimiliki" />
            {titles.map((t) => (
              <ListRow key={t.id} title={t.nama} subtitle={`Tier ${t.tier}`} />
            ))}
          </>
        )}
      </ViewShell>
    );
  }

  if (view === 'bp' && arg) {
    return (
      <ViewShell title="Pilih Gelar untuk Dihibahkan" onBack={() => engine.back()} onHome={() => engine.home()}>
        {engine.held(p.id).map((t) => (
          <ListRow key={t.id} title={t.nama} onClick={() => engine.givep(t.id, arg)} />
        ))}
      </ViewShell>
    );
  }

  if (view === 'kep') {
    const list = engine.D.keputusan || [];
    return (
      <ViewShell title="Keputusan Istana & Pengelolaan Diri" onBack={() => engine.back()} onHome={() => engine.home()}>
        <SectionHeader title="Pengembangan & Organisasi" />
        <ListRow icon="🎓" title="Pendidikan Anak & Ahli Waris" subtitle="Sewa guru istana untuk anak di bawah 16 tahun" onClick={() => engine.go('pendidikan')} />
        <ListRow icon="🛡️" title="Ordo Ksatria Abad Pertengahan" subtitle={`${Object.keys(engine.G.orders || {}).length} keanggotaan aktif`} onClick={() => engine.go('ordo')} />
        <ListRow icon="🐎" title="Perjalanan & Ziarah Kerajaan" subtitle={engine.G.travel ? 'Sedang dalam perjalanan' : 'Kunjungi wilayah lain di Eropa'} onClick={() => engine.go('perjalanan')} />
        <ListRow icon="📖" title="Tulis Kitab & Risalah" subtitle={`${engine.G.books.length} naskah ditulis`} onClick={() => engine.go('buku')} />
        <ListRow icon="⚖️" title="Gelar Sidang Pengadilan & Karya Seni" subtitle="Pimpin sidang istana atau biayai seniman" onClick={() => engine.go('pengadilan')} />
        <ListRow icon="📈" title="Karier Profesi & Status Sosial" subtitle="Naik pangkat karier atau status bangsawan" onClick={() => engine.go('jab')} />
        <ListRow icon="📜" title="Wasiat & Turun Tahta" subtitle="Tetapkan pewaris, wali, atau serahkan mahkota" onClick={() => engine.go('was')} />

        <SectionHeader title="Keputusan Tahunan" />
        {list.map((d: { id: string; nama: string; biaya?: { emas?: number }; efek?: Record<string, number> }) => (
          <ListRow
            key={d.id}
            title={d.nama}
            subtitle={`Biaya ${d.biaya?.emas || 0} emas · ${engine.ef2(d.efek)}`}
            rightLabel={engine.G.done[d.id] ? 'Selesai' : 'Jalankan'}
            disabled={Boolean(engine.G.done[d.id])}
            onClick={() => engine.dec(d.id)}
          />
        ))}
      </ViewShell>
    );
  }

  if (view === 'pendidikan' || view === 'edu') {
    const kids = p.anak
      .map((id) => engine.C[id])
      .filter((c): c is Character => Boolean(c && c.hidup && engine.umur(c) < 16));
    const selChild = arg && engine.C[arg] ? engine.C[arg] : kids[0];
    return (
      <ViewShell title="Pendidikan Anak & Ahli Waris" onBack={() => engine.back()} onHome={() => engine.home()}>
        {kids.length === 0 ? (
          <div className="p-4 text-xs text-[#57534E]">Tidak ada anak di bawah 16 tahun untuk dididik.</div>
        ) : (
          <>
            <SectionHeader title="Pilih Anak" />
            {kids.map((k) => (
              <ListRow
                key={k.id}
                title={k.nama}
                subtitle={`Usia ${engine.umur(k)} · Perang ${k.sk.perang} · Diplomasi ${k.sk.diplomasi} · Pembelajaran ${k.sk.pembelajaran}`}
                rightLabel={selChild?.id === k.id ? 'Dipilih' : 'Pilih'}
                onClick={() => engine.go('edu', k.id)}
              />
            ))}
            {selChild && (
              <>
                <SectionHeader title={`Tugaskan Guru untuk ${selChild.nama}`} />
                {Object.entries(TUTORS).map(([tid, t]) => (
                  <ListRow
                    key={tid}
                    title={`${t.nama} (${t.biaya} Emas)`}
                    subtitle={t.desc}
                    onClick={() => engine.educateChild(selChild.id, tid)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </ViewShell>
    );
  }

  if (view === 'ordo') {
    return (
      <ViewShell title="Ordo Ksatria" onBack={() => engine.back()} onHome={() => engine.home()}>
        {Object.entries(ORDERS).map(([id, o]) => {
          const joined = Boolean(engine.G.orders?.[id]);
          return (
            <ListRow
              key={id}
              icon="🛡️"
              title={o.nama}
              subtitle={`${o.bonus} · Biaya ${o.biaya} emas · Syarat ${o.prestiseMin} prestise`}
              rightLabel={joined ? 'Anggota' : 'Gabung'}
              disabled={joined}
              onClick={() => engine.joinOrder(id)}
            />
          );
        })}
      </ViewShell>
    );
  }

  if (view === 'perjalanan') {
    const dests = Object.values(engine.T)
      .filter((t) => t.tier >= 3 && t.tier <= 6)
      .slice(0, 30);
    return (
      <ViewShell title="Perjalanan & Kunjungan Kerajaan" onBack={() => engine.back()} onHome={() => engine.home()}>
        <div className="p-4 bg-[#FAF8F2] border-b border-[#E6E1D3] text-xs text-[#44403C]">
          {engine.G.travel
            ? `Sedang dalam perjalanan ke ${engine.T[engine.G.travel.to]?.nama} (sisa ${engine.G.travel.years} tahun).`
            : 'Pilih wilayah tujuan perjalanan (15 emas bekal · +10 prestise & +15 opini tuan rumah).'}
        </div>
        {dests.map((t) => (
          <ListRow
            key={t.id}
            icon="🐎"
            title={t.nama}
            subtitle={`Perkiraan ${engine.titleDistance(engine.held(p.id)[0]?.id || p.loc, t.id)} tahun perjalanan`}
            onClick={() => engine.travelTo(t.id)}
          />
        ))}
      </ViewShell>
    );
  }

  if (view === 'buku') {
    return (
      <ViewShell title="Perpustakaan & Penulisan Kitab" onBack={() => engine.back()} onHome={() => engine.home()}>
        <div className="p-4 bg-[#FAF8F2] border-b border-[#E6E1D3] space-y-2">
          <input
            type="text"
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            placeholder="Judul naskah (opsional)..."
            className="w-full px-3 py-2 text-xs bg-white border border-[#D6CFC0] rounded"
          />
          <button
            type="button"
            onClick={() => engine.writeBook(bookTitle)}
            className="w-full py-2 text-xs font-semibold text-white bg-[#9A6614] hover:bg-[#7E520E] rounded cursor-pointer"
          >
            Tulis Naskah Baru (20 Emas · Butuh Pembelajaran ≥ 15)
          </button>
        </div>
        <SectionHeader title="Koleksi Naskah Kerajaan" right={`${engine.G.books.length} kitab`} />
        {engine.G.books.map((b, idx) => (
          <ListRow key={idx} icon="📖" title={b.title} subtitle={`Penulis: ${b.author} · Tahun ${b.y}`} />
        ))}
      </ViewShell>
    );
  }

  if (view === 'pengadilan' || view === 'seni') {
    return (
      <ViewShell title="Sidang Istana & Patronase Seni" onBack={() => engine.back()} onHome={() => engine.home()}>
        <ListRow
          icon="⚖️"
          title="Gelar Sidang Pengadilan Kerajaan (15 Emas)"
          subtitle="Selesaikan sengketa bangsawan & petisi rakyat"
          onClick={() => engine.holdCourt()}
        />
        <ListRow
          icon="🎨"
          title="Biayai Seniman & Arsitek Istana (40 Emas)"
          subtitle="+20 Prestise, +4 Kebahagiaan Rakyat, dorong kemajuan Renaisans"
          onClick={() => engine.patronArt()}
        />
      </ViewShell>
    );
  }

  if (view === 'jab' || view === 'kelas' || view === 'gp') {
    const rankInfo = engine.ladderInfo('rank', p);
    const kelasInfo = engine.ladderInfo('kelas', p);
    return (
      <ViewShell title="Karier Profesi & Status Sosial" onBack={() => engine.back()} onHome={() => engine.home()}>
        <SectionHeader title="Pilih / Ganti Profesi (10 Emas)" />
        {(engine.D.profesi || []).map((f: { id: string; nama: string; pendapatan: number }) => (
          <ListRow
            key={f.id}
            title={engine.PN(f, p)}
            subtitle={`Pendapatan ${f.pendapatan} emas/th`}
            rightLabel={p.profesi === f.id ? 'Aktif' : 'Pilih'}
            onClick={() => engine.setProf(f.id)}
          />
        ))}
        {rankInfo?.next && (
          <>
            <SectionHeader title={`Naik Pangkat: ${rankInfo.next.nama}`} />
            {(rankInfo.next.jalur || []).map((j: { biaya?: { emas?: number }; syarat?: unknown }, idx: number) => (
              <ListRow
                key={idx}
                title={`Jalur ${idx + 1} (${j.biaya?.emas || 0} Emas)`}
                subtitle={j.syarat ? engine.sTeks(j.syarat, p) : 'Langsung memenuhi syarat'}
                onClick={() => engine.naikJab('rank', idx)}
              />
            ))}
          </>
        )}
        {kelasInfo?.next && (
          <>
            <SectionHeader title={`Naik Status: ${kelasInfo.next.nama}`} />
            {(kelasInfo.next.jalur || []).map((j: { biaya?: { emas?: number }; syarat?: unknown }, idx: number) => (
              <ListRow
                key={idx}
                title={`Jalur ${idx + 1} (${j.biaya?.emas || 0} Emas)`}
                subtitle={j.syarat ? engine.sTeks(j.syarat, p) : 'Langsung memenuhi syarat'}
                onClick={() => engine.naikJab('kelas', idx)}
              />
            ))}
          </>
        )}
      </ViewShell>
    );
  }

  if (view === 'gelar') {
    return (
      <ViewShell title="Pilih Gelar Utama" onBack={() => engine.back()} onHome={() => engine.home()}>
        {engine.held(p.id).map((t) => (
          <ListRow
            key={t.id}
            title={t.nama}
            subtitle={`Tier ${t.tier}`}
            rightLabel={engine.G.primary === t.id ? 'Utama' : 'Pilih'}
            onClick={() => engine.setPrimaryTitle(t.id, t.nama)}
          />
        ))}
      </ViewShell>
    );
  }

  if (view === 'was' || view === 'wasT' || view === 'wasW' || view === 'turun') {
    const candidates = p.anak.map((id) => engine.C[id]).filter((c): c is Character => Boolean(c && c.hidup));
    return (
      <ViewShell title="Wasiat Pewaris & Turun Tahta" onBack={() => engine.back()} onHome={() => engine.home()}>
        <SectionHeader title="Pengaturan Wasiat" />
        <ListRow
          title={`Wakaf Gereja Saat Wafat (${engine.G.was.gereja ? 'Aktif' : 'Nonaktif'})`}
          subtitle="Serahkan 20% emas ke gereja untuk +25 kesalehan ahli waris"
          onClick={() => {
            engine.G.was.gereja = !engine.G.was.gereja;
            engine.notify();
          }}
        />
        <ListRow
          title={`Izinkan Anak Tiri Mewarisi (${engine.G.was.allowTiri ? 'Ya' : 'Tidak'})`}
          onClick={() => {
            engine.G.was.allowTiri = !engine.G.was.allowTiri;
            engine.notify();
          }}
        />
        <SectionHeader title="Tunjuk Pewaris Utama" />
        {candidates.map((c) => (
          <ListRow
            key={c.id}
            title={engine.full(c)}
            subtitle={`Usia ${engine.umur(c)}`}
            rightLabel={engine.G.was.heir === c.id ? 'Pewaris' : 'Pilih'}
            onClick={() => {
              engine.G.was.heir = c.id;
              engine.notify();
            }}
          />
        ))}
        <SectionHeader title="Turun Tahta" />
        <ListRow title="Turun Tahta sebagai Biarawan (+40 Kesalehan)" onClick={() => engine.turun('biarawan')} />
        <ListRow title="Turun Tahta & Pensiun (+15 Kebahagiaan)" onClick={() => engine.turun('pensiun')} />
      </ViewShell>
    );
  }

  if (view === 'notif') {
    return (
      <ViewShell title="Notifikasi & Garis Waktu" onBack={() => engine.back()} onHome={() => engine.home()}>
        <SectionHeader
          title="Notifikasi Istana"
          right={
            <button
              type="button"
              onClick={() => engine.markNotifsRead()}
              className="text-xs font-semibold text-[#9A6614] hover:underline cursor-pointer"
            >
              Tandai Semua Dibaca
            </button>
          }
        />
        {(engine.G.notifs || []).length === 0 ? (
          <div className="p-4 text-xs text-[#57534E]">Belum ada notifikasi.</div>
        ) : (
          engine.G.notifs.map((n, i) => (
            <ListRow
              key={i}
              icon={n.icon}
              title={n.text}
              subtitle={`Tahun ${n.y} · ${n.read ? 'Sudah dibaca' : 'Baru'}`}
            />
          ))
        )}
      </ViewShell>
    );
  }

  if (view === 'endgame') {
    const score = engine.computeScore();
    return (
      <ViewShell title="Skor Kerajaan & Pencapaian" onBack={() => engine.back()} onHome={() => engine.home()}>
        <div className="p-5 bg-[#FAF8F2] border-b border-[#E6E1D3] text-center space-y-1">
          <div className="text-xs uppercase tracking-wider text-[#57534E]">Total Skor Kronik</div>
          <div className="font-num text-3xl font-bold text-[#9A6614]">{score}</div>
          <div className="text-xs text-[#44403C]">
            {engine.G.achievements.length}/{ACHIEVEMENTS.length} pencapaian terbuka
          </div>
        </div>
        <SectionHeader title="Daftar Pencapaian" />
        {ACHIEVEMENTS.map((a) => {
          const ok = engine.G.achievements.includes(a.id);
          return (
            <ListRow
              key={a.id}
              icon={ok ? a.icon : '🔒'}
              title={a.nama}
              subtitle={a.desc}
              rightLabel={ok ? 'Terbuka' : 'Terkunci'}
            />
          );
        })}
      </ViewShell>
    );
  }

  if (view === 'bigEv' || view === 'renaisans') {
    return (
      <ViewShell title="Era Besar & Bencana Eropa" onBack={() => engine.back()} onHome={() => engine.home()}>
        <ListRow
          icon="🎨"
          title="Era Renaisans"
          subtitle={engine.G.renaissance.unlocked ? `Aktif · Poin Ilmu & Seni: ${engine.G.renaissance.points}` : 'Mulai berkembang tahun 1400'}
        />
        <ListRow
          icon="☠️"
          title="Wabah Pes Hitam (1347+)"
          subtitle={engine.G.blackDeath?.active ? `Berlangsung sejak ${engine.G.blackDeath.started}` : engine.G.blackDeath ? 'Telah berlalu' : 'Belum melanda'}
        />
        <ListRow
          icon="🔥"
          title="Pemberontakan Petani"
          subtitle={engine.G.peasantRevolt?.active ? `Aktif (${engine.G.peasantRevolt.size} petani)` : 'Aman'}
          onClick={() => engine.go('tani')}
        />
      </ViewShell>
    );
  }

  if (view === 'tutorial') {
    return (
      <ViewShell title="Panduan Pemula Kerajaan 1066" onBack={() => engine.back()} onHome={() => (engine.G.pid ? engine.home() : engine.toStart())}>
        <div className="p-5 space-y-3 text-xs sm:text-sm text-[#292524] leading-relaxed">
          <p><strong>1. Dinasti & Suksesi:</strong> Pastikan kamu memiliki ahli waris sebelum penguasa wafat. Atur wasiat di menu Keputusan &rarr; Wasiat.</p>
          <p><strong>2. Ekonomi Wilayah:</strong> Bangun pasar, ladang, atau galangan kapal di provinsi milikmu agar pendapatan emas tahunan terus naik.</p>
          <p><strong>3. Penasihat & Dewan:</strong> Tunjuk Kanselir, Marsekal, Bendahara, dan Telik Sandi dengan kualitas tinggi dan awasi tingkat korupsinya.</p>
          <p><strong>4. Diplomasi & Perang:</strong> Jalin aliansi atau ekspedisi militer terencana, dan pastikan logistik suplai tidak habis di jalan.</p>
          <p><strong>5. Gereja & Sejarah:</strong> Peristiwa historis seperti Hastings, Martin Luther (1517), Pes Hitam (1347), hingga Renaisans (1400) akan membentuk alur duniamu.</p>
        </div>
      </ViewShell>
    );
  }

  if (view === 'lain') {
    return (
      <ViewShell title="Semua Menu, Pencapaian & Ekspor Save" onBack={() => engine.back()} onHome={() => engine.home()}>
        <SectionHeader title="Arsip & Sistem" />
        <ListRow icon="🏆" title="Skor & Pencapaian Kerajaan" subtitle={`Skor ${engine.computeScore()} · ${engine.G.achievements.length}/${ACHIEVEMENTS.length} terbuka`} onClick={() => engine.go('endgame')} />
        <ListRow icon="🔔" title="Notifikasi & Garis Waktu" onClick={() => engine.go('notif')} />
        <ListRow icon="🎨" title="Era Renaisans & Wabah Besar" onClick={() => engine.go('bigEv')} />
        <ListRow icon="📖" title="Panduan Pemula" onClick={() => engine.go('tutorial')} />
        <ListRow icon="🏛️" title="Pilih Gelar Utama" onClick={() => engine.go('gelar')} />
        <ListRow
          icon="💾"
          title="Simpan Permainan Sekarang"
          onClick={() => {
            engine.save();
            engine.showToast('Permainan berhasil disimpan.');
          }}
        />
        <ListRow
          icon="📤"
          title="Ekspor Save ke Teks JSON"
          onClick={() => setExportOut(engine.exportSave())}
        />
        {exportOut && (
          <div className="p-4 bg-[#FAF8F2] border-t border-[#E6E1D3] space-y-2">
            <p className="text-xs font-semibold text-[#44403C]">Salin teks JSON di bawah ini untuk cadangan save:</p>
            <textarea
              readOnly
              rows={4}
              value={exportOut}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              className="w-full p-2 text-[11px] font-mono bg-white border border-[#D6CFC0] rounded"
            />
          </div>
        )}
        <DownloadMentahanBox compact />
        <ListRow
          icon="🚪"
          title="Kembali ke Menu Utama"
          subtitle="Mulai permainan baru atau muat skenario lain"
          onClick={() => engine.toStart()}
        />
      </ViewShell>
    );
  }

  return null;
};
