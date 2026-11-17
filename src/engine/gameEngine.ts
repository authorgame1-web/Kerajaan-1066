import defaultGameData from '../data/gameData.json';
import { sfx } from '../utils/audio';
import {
  ActiveEvent,
  Character,
  DiplomacyModal,
  Dynasty,
  GameData,
  GameState,
  Province,
  ReligionDef,
  RouteEntry,
  Title,
} from './types';

const KEY = 'k1066';

const slug = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

const R = (a: number, b: number): number => a + Math.floor(Math.random() * (b - a + 1));
const pick = <T,>(a: T[]): T => a[R(0, a.length - 1)];
const cl = (v: number): number => Math.max(0, Math.min(100, v));
const sumObj = (o: Record<string, number>): number => Object.values(o).reduce((a, b) => a + b, 0);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRule = any;

export interface StartFormInput {
  pr: string;
  nm: string;
  dn: string;
  gn: 'L' | 'P';
  bd: string;
  ag: string;
  s1: string;
  s2: string;
  pf: string;
  lc: string;
  tk: string;
  bg?: string;
}

export const REL_RANKS = [
  { id: 'biarawan', nama: 'Biarawan / Biarawati', minPiety: 0, bonus: { kesalehan: 1 } },
  { id: 'diakon', nama: 'Diakon', minPiety: 25, bonus: { emas: 1, kesalehan: 2 } },
  { id: 'imam', nama: 'Imam Paroki', minPiety: 60, bonus: { emas: 2, prestise: 1 } },
  { id: 'uskup', nama: 'Uskup', minPiety: 120, bonus: { emas: 5, prestise: 3 } },
  { id: 'uskup_agung', nama: 'Uskup Agung', minPiety: 220, bonus: { emas: 9, prestise: 5 } },
  { id: 'kardinal', nama: 'Kardinal', minPiety: 350, bonus: { emas: 12, prestise: 8 } },
  { id: 'paus', nama: 'Paus', minPiety: 600, bonus: { emas: 25, prestise: 20 } },
];

export const HERALDS = [
  { id: 'singa', nama: 'Singa Emas', simbol: '🦁', makna: 'Keberanian & Kedaulatan' },
  { id: 'elang', nama: 'Elang Kekaisaran', simbol: '🦅', makna: 'Penguasaan & Visi' },
  { id: 'salib', nama: 'Salib Ksatria', simbol: '✠', makna: 'Kesalehan & Perang Suci' },
  { id: 'naga', nama: 'Naga Merah', simbol: '🐉', makna: 'Kekuatan & Legenda' },
  { id: 'mahkota', nama: 'Mahkota Tiga', simbol: '👑', makna: 'Warisan Raja' },
  { id: 'bunga', nama: 'Fleur-de-Lis', simbol: '⚜', makna: 'Kemuliaan & Tradisi' },
  { id: 'pedang', nama: 'Pedang Kembar', simbol: '⚔', makna: 'Kejayaan Militer' },
  { id: 'menara', nama: 'Benteng Batu', simbol: '🏰', makna: 'Ketahanan Wilayah' },
];

export const BACKGROUNDS: Record<
  string,
  { nama: string; desc: string; emas?: number; prestise?: number; kesalehan?: number; sk?: Record<string, number>; sp?: Record<string, number> }
> = {
  noble: {
    nama: 'Bangsawan Terdidik',
    desc: 'Tumbuh di istana terhormat dengan tata krama istana dan warisan keluarga.',
    emas: 25,
    prestise: 15,
    sk: { diplomasi: 6, administrasi: 4 },
  },
  warrior: {
    nama: 'Ksatria Lapangan',
    desc: 'Terbiasa di medan tempur, turnamen, dan memimpin pasukan garda depan.',
    prestise: 10,
    sk: { perang: 8 },
    sp: { duel: 10, kesehatan: 5 },
  },
  scholar: {
    nama: 'Sarjana Biara',
    desc: 'Menghabiskan masa muda menelaah manuskrip, hukum kanon, dan filsafat.',
    kesalehan: 20,
    sk: { pembelajaran: 10, administrasi: 4 },
  },
  merchant: {
    nama: 'Saudagar Kota',
    desc: 'Paham neraca perdagangan, jaringan gilda, dan rute kapal niaga.',
    emas: 60,
    sk: { administrasi: 8, diplomasi: 4 },
  },
  schemer: {
    nama: 'Ahli Intrik Istana',
    desc: 'Lihai membaca bisik-bisik lorong istana, rahasia bangsawan, dan spionase.',
    prestise: 5,
    sk: { spionase: 10, diplomasi: 4 },
  },
};

export const TUTORS: Record<string, { nama: string; biaya: number; stat: string; gain: number; desc: string }> = {
  militer: { nama: 'Pelatih Militer', biaya: 15, stat: 'perang', gain: 6, desc: 'Latihan taktik medan & duel (+Perang)' },
  sarjana: { nama: 'Sarjana Istana', biaya: 15, stat: 'pembelajaran', gain: 6, desc: 'Bahasa Latin, hukum & naskah (+Pembelajaran)' },
  diplomat: { nama: 'Guru Tata Krama', biaya: 15, stat: 'diplomasi', gain: 6, desc: 'Retorika istana & negosiasi (+Diplomasi)' },
  bendahara: { nama: 'Guru Dagang', biaya: 15, stat: 'administrasi', gain: 6, desc: 'Hitung pajak & logistik (+Administrasi)' },
};

export const ORDERS: Record<string, { nama: string; biaya: number; prestiseMin: number; bonus: string }> = {
  templar: { nama: 'Ordo Ksatria Templar', biaya: 40, prestiseMin: 25, bonus: '+2 Prestise/th, +5 Duel' },
  hospitaller: { nama: 'Ordo St. Yohanes (Hospitaller)', biaya: 35, prestiseMin: 15, bonus: '+2 Kesalehan/th, +5 Kesehatan' },
  teutonik: { nama: 'Ordo Teutonik', biaya: 45, prestiseMin: 30, bonus: '+2 Perang, +1 Prestise/th' },
  st_george: { nama: 'Ordo St. George', biaya: 30, prestiseMin: 20, bonus: '+5 Moral Pasukan, +3 Duel' },
};

export const ACHIEVEMENTS: { id: string; nama: string; desc: string; icon: string }[] = [
  { id: 'first_win', nama: 'Penakluk Pertama', desc: 'Memenangkan perang pertamamu', icon: '⚔️' },
  { id: 'rich_500', nama: 'Pundi Penuh Emas', desc: 'Memiliki 500 emas sekaligus', icon: '💰' },
  { id: 'great_dynasty', nama: 'Dinasti Agung', desc: 'Mencapai 500 prestise dinasti', icon: '👑' },
  { id: 'tier_king', nama: 'Mahkota Raja', desc: 'Menjadi Raja / Ratu berdaulat', icon: '🏰' },
  { id: 'tier_emperor', nama: 'Kaisar Eropa', desc: 'Mencapai gelar Kekaisaran (Tier 7)', icon: '🦅' },
  { id: 'crusader', nama: 'Ksatria Salib', desc: 'Memenangkan Perang Salib', icon: '✠' },
  { id: 'long_reign', nama: 'Penguasa Panjang Umur', desc: 'Hidup mencapai usia 70 tahun', icon: '🕯️' },
  { id: 'marry_5', nama: 'Keluarga Besar', desc: 'Memiliki minimal 5 anak', icon: '👨‍👩‍👧‍👦' },
  { id: 'pope', nama: 'Wakil Santo Petrus', desc: 'Menjabat sebagai Paus Gereja Katolik', icon: '⛪' },
  { id: 'protestant', nama: 'Reformator Iman', desc: 'Memeluk atau memicu gerakan Reformasi', icon: '📜' },
  { id: 'expedition_win', nama: 'Penjelajah Samudra', desc: 'Sukses menuntaskan ekspedisi laut', icon: '🧭' },
  { id: 'survive_plague', nama: 'Selamat dari Pes Hitam', desc: 'Bertahan melewati wabah besar', icon: '🛡️' },
];

export const OFFICE_TRAITS = ['jujur', 'korup', 'jenius', 'setia', 'malas', 'ambisius'] as const;


class GameEngine {
  public D: GameData;
  public T: Record<string, Title> = {};
  public C: Record<string, Character> = {};
  public DY: Record<string, Dynasty> = {};
  public P: Record<string, Province[]> = {};
  public G!: GameState;
  public stack: RouteEntry[] = [{ view: 'start' }];
  public toastMessage: string | null = null;

  private listeners = new Set<() => void>();

  // Derived caches from D.teks_game and D.event_*
  private NM: Record<'L' | 'P', string[]> = { L: ['Anon'], P: ['Anna'] };
  private RUM: string[] = ['{n} dikabarkan sibuk.'];
  private SEAS: { d: string; e: Record<string, number> }[] = [{ d: '', e: {} }];
  public FAKSI: Record<string, { nama: string; efek: string; icon: string }> = {};
  public FACTION_RANKS: { min: number; nama: string; efek: Record<string, number> }[] = [
    { min: 0, nama: 'Netral', efek: {} },
  ];
  public CRUSADE_TARGETS: {
    id: string;
    nama: string;
    kekuatan: number;
    hadiah: { emas: number; prestise: number; kesalehan: number };
    region?: string;
    jarak?: number;
  }[] = [];

  private TRI: Record<string, string> = { pedang: 'kavaleri', pemanah: 'pedang', kavaleri: 'pemanah' };
  private INV: Record<string, string> = { pedang: 'pemanah', pemanah: 'kavaleri', kavaleri: 'pedang' };
  private CEV: Record<string, { t: string; d: string; e: Record<string, number | [number, number]>; c: ((p: Character) => boolean) | null }[]> = {};
  private CHAINS: {
    id: string;
    title: string;
    teks: string;
    ulang?: number;
    peluang?: number;
    when: () => boolean;
    pilihan: { teks: string; fn: () => string }[];
  }[] = [];
  private FAM_EVENTS: typeof this.CHAINS = [];
  private AT_KEY: 'rankY' | 'kelasY' = 'rankY';

  constructor() {
    this.D = this.loadStoredData() || this.cloneData(defaultGameData);
    this.applyTeks();
    this.newWorld();
  }

  private cloneData(d: GameData): GameData {
    return JSON.parse(JSON.stringify(d));
  }

  private loadStoredData(): GameData | null {
    try {
      const custom = localStorage.getItem(KEY + 'custom');
      const raw = localStorage.getItem(KEY + 'd');
      if (custom && raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.jabatan) return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  public notify(): void {
    this.listeners.forEach((fn) => fn());
  }

  public currentRoute(): RouteEntry {
    return this.stack[this.stack.length - 1] || { view: 'start' };
  }

  public go(view: string, arg?: string): void {
    sfx.playClick();
    this.stack = [...this.stack, { view, arg }];
    this.notify();
  }

  public back(): void {
    sfx.playClick();
    if (this.stack.length > 1) {
      this.stack = this.stack.slice(0, -1);
    }
    this.notify();
  }

  public home(): void {
    this.stack = [{ view: 'main' }];
    this.notify();
  }

  public toStart(): void {
    this.newWorld();
    this.stack = [{ view: 'start' }];
    this.notify();
  }

  public clearToast(): void {
    this.toastMessage = null;
    this.notify();
  }

  public showToast(s: string): void {
    this.toastMessage = s;
    this.notify();
  }

  public hasSave(): boolean {
    try {
      return !!localStorage.getItem(KEY + 's');
    } catch {
      return false;
    }
  }

  public save(): void {
    try {
      localStorage.setItem(
        KEY + 's',
        JSON.stringify({ T: this.T, C: this.C, DY: this.DY, P: this.P, G: this.G })
      );
    } catch {
      // ignore storage quota errors
    }
  }

  public loadSave(): boolean {
    try {
      const raw = localStorage.getItem(KEY + 's');
      if (!raw) {
        this.showToast('Save tidak ditemukan.');
        return false;
      }
      const s = JSON.parse(raw);
      this.T = s.T;
      this.C = s.C;
      this.DY = s.DY;
      this.P = s.P;
      this.G = s.G;
      this.migrateState();
      this.stack = [{ view: 'main' }];
      this.notify();
      return true;
    } catch {
      this.showToast('Gagal memuat save.');
      return false;
    }
  }

  public async loadCustomJsonFiles(files: FileList | File[]): Promise<string> {
    const arr = Array.from(files);
    if (!arr.length) return 'Tidak ada file dipilih.';
    try {
      const texts = await Promise.all(arr.map((f) => f.text()));
      const combined: GameData = {};
      texts.forEach((t) => Object.assign(combined, JSON.parse(t)));
      if (!combined.jabatan) {
        return 'File JSON belum lengkap (pilih semua file di folder data/ atau satu data_v3.json gabungan).';
      }
      this.D = combined;
      this.applyTeks();
      try {
        localStorage.setItem(KEY + 'd', JSON.stringify(combined));
        localStorage.setItem(KEY + 'custom', '1');
      } catch {
        // ignore
      }
      this.newWorld();
      this.stack = [{ view: 'start' }];
      this.notify();
      return 'Data kustom berhasil dimuat.';
    } catch (err) {
      return 'JSON tidak valid: ' + (err instanceof Error ? err.message : String(err));
    }
  }

  public resetCustomData(): void {
    try {
      localStorage.removeItem(KEY + 'custom');
      localStorage.removeItem(KEY + 'd');
    } catch {
      // ignore
    }
    this.D = this.cloneData(defaultGameData);
    this.applyTeks();
    this.newWorld();
    this.stack = [{ view: 'start' }];
    this.notify();
  }

  // ============ RULES HELPERS ============
  public RG = (): AnyRule => this.D.aturan_game || {};
  public RP = (): AnyRule => this.D.aturan_pertunangan || {};
  public RWf = (): AnyRule => this.D.aturan_pasangan_wafat || {};
  public RD = (): AnyRule => this.D.aturan_dinasti || {};
  public RT = (): AnyRule => this.D.aturan_turun_tahta || {};
  public RAg = (): AnyRule => this.D.aturan_agama || {};
  public LAW = (id: string): string | null => {
    const h = (this.D.hukum || []).find((x: AnyRule) => x.id === id);
    return h ? h.aktif : null;
  };
  public unlocked = (id: string): boolean => {
    const m = (this.D.modernisasi || []).find((x: AnyRule) => x.id === id);
    return m ? this.G.tahun >= m.tahun : true;
  };
  public SB = (k: string, f: string, df: AnyRule): AnyRule => {
    const o = (this.D?.sistem_besar || {})[k];
    return o && o[f] !== undefined ? o[f] : df;
  };
  public TG = (k: string, df: AnyRule): AnyRule => (this.D?.teks_game && this.D.teks_game[k]) || df;

  public applyTeks(): void {
    if (this.D?.pasukan_segitiga) {
      this.TRI = this.D.pasukan_segitiga;
      this.INV = Object.fromEntries(Object.entries(this.TRI).map(([a, b]) => [b as string, a]));
    }
    this.CEV = this.AT_cev(this.D.event_kelas);
    this.CHAINS = this.AT_events(this.D.event_berantai);
    this.FAM_EVENTS = this.AT_events(this.D.event_keluarga);
    const t = this.D?.teks_game;
    if (!t) return;
    if (t.nama_acak) this.NM = t.nama_acak;
    if (t.rumor) this.RUM = t.rumor;
    if (t.musim) this.SEAS = t.musim;
    if (t.faksi_istana) this.FAKSI = t.faksi_istana;
    if (t.pangkat_faksi) this.FACTION_RANKS = t.pangkat_faksi;
    if (t.target_perang_salib) this.CRUSADE_TARGETS = t.target_perang_salib;
  }

  // ============ BASIC HELPERS ============
  public me = (): Character => this.C[this.G.pid];
  public umur = (c: Character): number => (c.hidup || !c.wafat ? this.G.tahun : c.wafat) - c.lahir;
  public tn = (t: number): AnyRule =>
    this.D.tingkatan_gelar.find((x: AnyRule) => x.tier === t) || this.D.tingkatan_gelar[0];
  public held = (id: string): Title[] => Object.values(this.T).filter((t) => t.pem === id);
  public tierOf = (c: Character): number => Math.max(0, ...this.held(c.id).map((t) => t.tier));

  public PN = (f: AnyRule, c?: Character): string =>
    (f.nama_per_agama && c && f.nama_per_agama[c.agama]) || f.nama;

  public noMarry = (f: AnyRule, c: Character): boolean =>
    f.boleh_menikah === false && !(f.boleh_menikah_agama || []).includes(c.agama);

  public jenjangOf(c: Character): AnyRule | null {
    const f = this.D.profesi.find((x: AnyRule) => x.id === c.profesi);
    if (!f || !f.jenjang || !this.D.jenjang_karier) return null;
    const id = typeof f.jenjang === 'string' ? f.jenjang : f.jenjang[c.agama] || f.jenjang.default;
    const J = this.D.jenjang_karier[id];
    return J ? Object.assign({ id }, J) : null;
  }

  public rankIdx = (c: Character, J: AnyRule): number =>
    Math.min((c.rank || {})[J.id] || 0, J.pangkat.length - 1);

  public rankNama(c: Character): string | null {
    const J = this.jenjangOf(c);
    return J ? J.pangkat[this.rankIdx(c, J)].nama : null;
  }

  public rankInc(c: Character): number {
    const J = this.jenjangOf(c);
    return J ? J.pangkat[this.rankIdx(c, J)].pendapatan || 0 : 0;
  }

  public tTitle(c: Character): string {
    const t = this.tierOf(c);
    if (t) {
      const b = c.gender === 'P' ? this.tn(t).nama_wanita : this.tn(t).nama;
      const J = c.profesi && this.jenjangOf(c);
      return J && this.rankIdx(c, J) > 0 ? `${b} · ${this.rankNama(c)}` : b;
    }
    const p = this.D.profesi.find((x: AnyRule) => x.id === c.profesi);
    return p
      ? this.rankNama(c) || this.PN(p, c)
      : c.kelas === 'rakyat_jelata'
        ? 'Rakyat Jelata'
        : c.kelas === 'warga_kota'
          ? 'Warga Kota'
          : 'Bangsawan';
  }

  public primaryTitle(c: Character): Title | undefined {
    if (this.G.primary && this.T[this.G.primary] && this.T[this.G.primary].pem === c.id) {
      return this.T[this.G.primary];
    }
    return this.held(c.id).sort((a, b) => b.tier - a.tier)[0];
  }

  public mainT(c: Character): string {
    const h = this.primaryTitle(c);
    const jb =
      this.G.job && this.G.job.id === c.id
        ? this.D.jabatan.find((j: AnyRule) => j.id === this.G.job?.j)
        : null;
    return (h ? ' dari ' + h.nama : '') + (jb ? ' · ' + jb.nama : '');
  }

  public full(c: Character): string {
    const dy = c.dinasti ? this.DY[c.dinasti] : undefined;
    const dName = dy?.nama || '';
    const appendDynasty =
      (dName.startsWith('von ') || dy?.gen) &&
      !c.nama.includes(dName) &&
      !c.nama.includes('von');
    return (c.gp ? c.gp + ' ' : '') + c.nama + (appendDynasty ? ' ' + dName : '');
  }

  public AG(id: string): ReligionDef {
    return (
      (this.D.agama as ReligionDef[])
        .concat(this.G?.ag || [])
        .find((x) => x.id === id) || { id, nama: id, keluarga: 'x', efek: {} }
    );
  }

  public lv = (): number => (this.G.tahun >= 1350 ? 3 : this.G.tahun >= 1200 ? 2 : 1);
  public bi = (id: string): AnyRule => this.D.bangunan.find((x: AnyRule) => x.id === id);
  public kin = (a: Character, b: Character): boolean =>
    Boolean((a.ibu && a.ibu === b.ibu) || a.anak.includes(b.id) || b.anak.includes(a.id));
  public opn = (a: Character, b: Character): number => a.op[b.id] ?? (this.kin(a, b) ? 20 : 0);
  public hv = (s: string): number => [...s].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 100, 7);
  public SRT = (): AnyRule[] => this.D.surat || [];
  public PJK = (): AnyRule[] => this.D.pajak || [];
  public ef2 = (e?: Record<string, number>): string =>
    Object.entries(e || {})
      .map(([k, v]) => `${k.replace(/_/g, ' ')} ${v > 0 ? '+' : ''}${v}`)
      .join(', ');
  public ageOK = (c: Character): boolean => this.umur(c) >= 16 && c.hidup;
  public single(c: Character): boolean {
    const f = this.D.profesi.find((x: AnyRule) => x.id === c.profesi);
    if (f && this.noMarry(f, c)) return false;
    return !c.pasangan && ['lajang', 'janda', 'duda', 'bercerai'].includes(c.sn) && this.umur(c) >= 16;
  }
  public lifeSpan = (c: Character): string =>
    c.hidup ? `lahir ${c.lahir}` : `${c.lahir}–${c.wafat || '?'}`;
  public lifeText = (c: Character): string =>
    `Lahir ${c.lahir} · ${
      c.hidup
        ? `Hidup, usia ${this.umur(c)}`
        : `Wafat ${c.wafat || 'tahun tak tercatat'} (usia ${this.umur(c)})`
    }`;

  // ============ PROVINCES & BUILDINGS ============
  public provs(t: Title): Province[] {
    if (!this.P[t.id]) {
      const nm = t.prov || [t.nama.replace(/^\S+\s/, '')];
      this.P[t.id] = nm.map((n) => {
        const d =
          (this.D.provinsi_detail || []).find((x: AnyRule) => x.nama === n && x.wilayah === t.id) || {};
        return {
          nama: n,
          dev: d.perkembangan || R(15, 35),
          eko: 8,
          b: [],
          pes: d.pesisir !== false,
          agama: d.agama || t.agama || t.budaya,
          agamaP: d.agama || t.budaya,
          culture: d.budaya || t.budaya,
        };
      });
    }
    return this.P[t.id];
  }

  public provEffects(c: Character): Record<string, number> {
    const eff: Record<string, number> = {
      maks_pasukan: 0,
      pasukan_tahunan: 0,
      pembelajaran: 0,
      administrasi: 0,
      biaya_rekrut_persen: 0,
      ekonomi: 0,
      kesalehan_per_tahun: 0,
    };
    this.held(c.id).forEach((t) => {
      if (t.tier <= 3) {
        this.provs(t).forEach((v) => {
          v.b.forEach((b) => {
            const x = this.bi(b);
            if (x && x.efek) {
              for (const [k, val] of Object.entries(x.efek as Record<string, number>)) {
                if (k in eff) eff[k] += val;
              }
            }
          });
        });
      }
    });
    return eff;
  }

  public slotProv(v: Province): number {
    return 2 + Math.floor(v.dev / 25);
  }

  // ============ TRAITS & CHARACTER CREATION ============
  private applyTr(c: Character): void {
    c.sifat.forEach((i) => {
      const e = (this.D.sifat.find((s: AnyRule) => s.id === i) || { efek: {} }).efek;
      for (const k in e) {
        if (k in c.sk) (c.sk as AnyRule)[k] = cl((c.sk as AnyRule)[k] + e[k]);
        else if (k in c.sp) (c.sp as AnyRule)[k] = cl((c.sp as AnyRule)[k] + e[k]);
      }
    });
  }

  private yr(p: Character, k: string): number {
    return (
      p.sifat.reduce(
        (a, i) => a + ((this.D.sifat.find((s: AnyRule) => s.id === i) || { efek: {} }).efek[k] || 0),
        0
      ) + ((this.AG(p.agama).efek || {})[k] || 0)
    );
  }

  private oppose(c: Character): string | null {
    const opp = this.D.sifat.find((x: AnyRule) => x.id === c.sifat[0]);
    if (!opp || !opp.lawan) return null;
    if (c.sifat.includes(opp.lawan)) {
      const lawan = this.D.sifat.find((x: AnyRule) => x.id === opp.lawan);
      return `Konflik sifat: ${opp.nama} vs ${lawan?.nama || opp.lawan}`;
    }
    return null;
  }

  public mkC(o: Partial<Character>): Character {
    const g: 'L' | 'P' = o.gender || pick(['L', 'P']);
    const c: Character = Object.assign(
      {
        id: 'n' + ++this.G.n,
        gender: g,
        nama: pick(this.NM[g]),
        lahir: this.G.tahun - R(18, 45),
        budaya: 'german',
        agama: 'katolik',
        sifat: [],
        sn: 'lajang',
        pasangan: null,
        anak: [],
        ibu: null,
        ayah: null,
        hidup: true,
        dinasti: null,
        kelas: 'bangsawan',
        profesi: null,
        op: {},
        items: [],
        sp: {
          kebahagiaan: R(30, 70),
          kesehatan: R(40, 90),
          penampilan: R(20, 80),
          kesuburan: R(30, 90),
          duel: R(5, 40),
        },
        sk: {
          diplomasi: R(5, 70),
          spionase: R(5, 70),
          perang: R(5, 70),
          administrasi: R(5, 70),
          pembelajaran: R(5, 70),
        },
        res: { prestise: R(5, 40), emas: R(10, 60), kesalehan: R(20, 60) },
        claims: [],
      },
      o
    );
    this.C[c.id] = c;
    this.applyTr(c);
    return c;
  }

  // ============ WORLD INIT ============
  public newWorld(): void {
    this.T = {};
    this.C = {};
    this.DY = {};
    this.P = {};
    this.G = {
      tahun: this.D.meta.tahun_mulai,
      startYear: this.D.meta.tahun_mulai,
      n: 0,
      pid: '',
      log: [],
      tr: { pedang: 0, pemanah: 0, kavaleri: 0 },
      tun: [],
      was: { allowTiri: false, perWilayah: {}, wali: null },
      us: [],
      q: [],
      tab: 0,
      done: {},
      ev: null,
      kpt: 0,
      pen: {},
      al: [],
      ag: [],
      sh: {},
      sel: [],
      md: null,
      f: '',
      fav: [],
      jail: {},
      paj: 1,
      primary: null,
      claims: {},
      sieges: {},
      war: null,
      modern: [],
      divorce: [],
      widows: {},
      rakyat: { bahagia: 50 },
      rumorLog: [],
      plague: {},
      chainDone: {},
      faction: null,
      factionRep: { militer: 0, gereja: 0, _nextGen: {} },
      deeds: {},
      dynHist: {},
      rulers: {},
      regency: null,
      crusades: [],
      crusadeHistory: [],
      reformed: [],
      treeExpand: {},
      treeDepth: 3,
      treeUp: 2,
      greatWars: [],
      greatWarHistory: [],
      cadetBranches: {},
      renaissance: { unlocked: false, points: 0 },
      blackDeath: null,
      peasantRevolt: null,
      protestantStarted: false,
      thirtyYearsWar: null,
      hw: {},
      hwLog: [],
      relRank: {},
      church: {
        pope: null,
        cardinals: [],
        bishops: [],
        saints: [],
        doctrine: 'ortodoks',
        excom: {},
        interdict: {},
        antiPope: null,
      },
      notifs: [],
      timeline: [],
      trade: [],
      loans: [],
      books: [],
      crimes: {},
      popeHistory: [],
      expeditions: [],
      siegeDetail: {},
      spyAct: null,
      histDone: {},
      background: 'noble',
      council: [],
      councilVote: null,
      achievements: [],
      anglican: false,
      tudorSpawned: false,
      anneSpawned: false,
      lutherSpawned: false,
      coups: [],
      prices: { grain: 2, iron: 5, cloth: 4, spice: 10 },
      orders: {},
      morale: 80,
      travel: null,
      childTutor: {},
      office: {},
      officerHistory: [],
      logistics: { supply: 100, morale: 85, forage: 0 },
      warCampaign: null,
      familyView: { depth: 3, showSpouses: true, showDead: false, centered: '' },
      familyFocus: '',
    };

    const add = (node: AnyRule, up: string | null) => {
      if (typeof node === 'string') node = { nama: node };
      const tier = node.tier || 3;
      const id = node.id || (tier === 3 ? 'c_' : 't_') + slug(node.nama);
      this.T[id] = {
        id,
        nama: tier === 3 && !/^Wilayah/.test(node.nama) ? 'Wilayah ' + node.nama : node.nama,
        tier,
        pem: node.pemegang || null,
        atas: up,
        budaya: node.budaya || (up && this.T[up]?.budaya) || 'german',
        agama: node.agama || (up && this.T[up]?.agama) || 'katolik',
        prov: node.provinsi || null,
        kids: [],
      };
      if (up && this.T[up]) this.T[up].kids.push(id);
      (node.wilayah || []).forEach((w: AnyRule) => add(w, id));
      (node.bawahan || []).forEach((b: AnyRule) => add(b, id));
    };

    add(this.D.dunia, null);
    (this.D.dunia_lain || []).forEach((x: AnyRule) => add(x, null));
    (this.D.independen || []).forEach((x: AnyRule) => add(x, null));
    (this.D.dinasti || []).forEach((d: AnyRule) => {
      this.DY[d.id] = { ...d };
    });

    (this.D.karakter || []).forEach((k: AnyRule) => {
      const c = this.mkC({
        id: k.id,
        nama: k.nama,
        gender: k.gender,
        lahir: k.lahir,
        budaya: k.budaya,
        agama: k.agama,
        sifat: (k.sifat || []).slice(),
        sn: k.status_nikah || 'lajang',
        pasangan: k.pasangan || null,
        anak: (k.anak || []).slice(),
        ibu: k.ibu || null,
        ayah: k.ayah || null,
        dinasti: k.dinasti,
        kelas: k.kelas || 'bangsawan',
        profesi: k.profesi || null,
        gp: k.gelar_depan,
      });
      if (k.stat_pribadi) c.sp = { ...k.stat_pribadi };
      if (k.stat_kerajaan) c.sk = { ...k.stat_kerajaan };
      if (k.sumber_daya) {
        const s = k.sumber_daya;
        c.res = {
          prestise: s.prestise || 0,
          emas: s.emas || 0,
          kesalehan: s.kesalehan || 0,
        };
        if (s.pasukan) c.pas = s.pasukan;
      }
    });

    (this.D.klaim_gelar_tambahan || []).forEach((k: AnyRule) => {
      const cid = Object.keys(k)[0].replace('_klaim', '');
      if (this.C[cid]) {
        this.G.claims[cid] = this.G.claims[cid] || [];
        this.G.claims[cid].push({ id: k[cid], nama: k.nama, kendali: k.kendali });
      }
    });

    (this.D.hubungan_awal || []).forEach((h: AnyRule) => {
      if (this.C[h.dari] && this.C[h.ke]) {
        this.C[h.dari].op[h.ke] = h.nilai;
        this.C[h.ke].op[h.dari] = h.nilai;
      }
    });

    Object.values(this.C).forEach((c) => {
      const cf = this.oppose(c);
      if (cf) this.G.log.push(cf);
    });

    if (this.C['paus']?.hidup) {
      this.G.church.pope = 'paus';
      this.G.relRank['paus'] = 'paus';
      this.G.popeHistory.push({ id: 'paus', y: this.G.tahun });
    }
    this.seedDynHist();
  }

  private migrateState(): void {
    if (!this.G.startYear) this.G.startYear = this.D.meta.tahun_mulai;
    if (!this.G.rakyat) this.G.rakyat = { bahagia: 50 };
    if (!this.G.rumorLog) this.G.rumorLog = [];
    if (!this.G.plague) this.G.plague = {};
    if (!this.G.chainDone) this.G.chainDone = {};
    if (this.G.faction === undefined) this.G.faction = null;
    if (!this.G.deeds) this.G.deeds = {};
    if (!this.G.dynHist) this.G.dynHist = {};
    if (!this.G.rulers) this.G.rulers = {};
    if (!this.G.was) this.G.was = {};
    if (this.G.was.allowTiri === undefined) this.G.was.allowTiri = false;
    if (!this.G.was.perWilayah) this.G.was.perWilayah = {};
    if (this.G.was.wali === undefined) this.G.was.wali = null;
    if (this.G.regency === undefined) this.G.regency = null;
    if (!this.G.factionRep) this.G.factionRep = { militer: 0, gereja: 0, _nextGen: {} };
    if (!this.G.factionRep._nextGen) this.G.factionRep._nextGen = {};
    if (!this.G.crusades) this.G.crusades = [];
    if (!this.G.crusadeHistory) this.G.crusadeHistory = [];
    if (!this.G.reformed) this.G.reformed = [];
    if (!this.G.treeExpand) this.G.treeExpand = {};
    if (this.G.treeDepth === undefined) this.G.treeDepth = 3;
    if (this.G.treeUp === undefined) this.G.treeUp = 2;
    if (!this.G.greatWars) this.G.greatWars = [];
    if (!this.G.greatWarHistory) this.G.greatWarHistory = [];
    if (!this.G.cadetBranches) this.G.cadetBranches = {};
    if (!this.G.renaissance) this.G.renaissance = { unlocked: false, points: 0 };
    if (this.G.blackDeath === undefined) this.G.blackDeath = null;
    if (this.G.peasantRevolt === undefined) this.G.peasantRevolt = null;
    if (this.G.protestantStarted === undefined) this.G.protestantStarted = false;
    if (this.G.thirtyYearsWar === undefined) this.G.thirtyYearsWar = null;
    if (!this.G.hw) this.G.hw = {};
    if (!this.G.hwLog) this.G.hwLog = [];
    if (!this.G.relRank) this.G.relRank = {};
    if (!this.G.church) {
      this.G.church = {
        pope: this.C['paus']?.hidup ? 'paus' : null,
        cardinals: [],
        bishops: [],
        saints: [],
        doctrine: 'ortodoks',
        excom: {},
        interdict: {},
        antiPope: null,
      };
    }
    if (!this.G.notifs) this.G.notifs = [];
    if (!this.G.timeline) this.G.timeline = [];
    if (!this.G.trade) this.G.trade = [];
    if (!this.G.loans) this.G.loans = [];
    if (!this.G.books) this.G.books = [];
    if (!this.G.crimes) this.G.crimes = {};
    if (!this.G.popeHistory) this.G.popeHistory = [];
    if (!this.G.expeditions) this.G.expeditions = [];
    if (!this.G.siegeDetail) this.G.siegeDetail = {};
    if (!this.G.histDone) this.G.histDone = {};
    if (!this.G.background) this.G.background = 'noble';
    if (!this.G.council) this.G.council = [];
    if (this.G.councilVote === undefined) this.G.councilVote = null;
    if (!this.G.achievements) this.G.achievements = [];
    if (this.G.anglican === undefined) this.G.anglican = false;
    if (this.G.tudorSpawned === undefined) this.G.tudorSpawned = false;
    if (this.G.anneSpawned === undefined) this.G.anneSpawned = false;
    if (this.G.lutherSpawned === undefined) this.G.lutherSpawned = false;
    if (!this.G.coups) this.G.coups = [];
    if (!this.G.prices) this.G.prices = { grain: 2, iron: 5, cloth: 4, spice: 10 };
    if (!this.G.orders) this.G.orders = {};
    if (this.G.morale === undefined) this.G.morale = 80;
    if (this.G.travel === undefined) this.G.travel = null;
    if (!this.G.childTutor) this.G.childTutor = {};
    if (!this.G.office) this.G.office = {};
    if (!this.G.officerHistory) this.G.officerHistory = [];
    if (!this.G.logistics) this.G.logistics = { supply: 100, morale: 85, forage: 0 };
    if (this.G.warCampaign === undefined) this.G.warCampaign = null;
    if (!this.G.familyView) this.G.familyView = { depth: 3, showSpouses: true, showDead: false, centered: this.G.pid || '' };
    if (!this.G.familyFocus) this.G.familyFocus = this.G.pid || '';
    if (this.G.tahun >= 1400) {
      this.ensureRenaissanceBuildings();
    }
    this.seedDynHist();
  }

  private seedDynHist(): void {
    if (this.G._v8seed) return;
    (this.D.dinasti || []).forEach((d: AnyRule) => {
      if (!this.G.dynHist[d.id]) this.G.dynHist[d.id] = [];
      if (this.G.dynHist[d.id].length) return;
      const age = Math.min(200, Math.floor(d.prestise / 5));
      const word =
        d.prestise >= 800
          ? 'kuno dan agung'
          : d.prestise >= 300
            ? 'tua dan terhormat'
            : d.prestise >= 100
              ? 'berakar dalam'
              : 'muda';
      this.G.dynHist[d.id].push({
        y: this.D.meta.tahun_mulai - age,
        text: `Dinasti ${d.nama} (${word}) tercatat sejak abad lampau`,
      });
      if (d.prestise >= 300) {
        const nm = pick(this.TG('nama_leluhur', ['Heinrich']));
        const jl = pick(this.TG('julukan_leluhur', ['yang Berani']));
        this.G.dynHist[d.id].push({
          y: this.D.meta.tahun_mulai - age + 30,
          text: `Leluhur ${nm} ${jl} memperluas wilayah dinasti`,
        });
      }
      if (d.prestise >= 600) {
        this.G.dynHist[d.id].push({
          y: this.D.meta.tahun_mulai - age + 80,
          text: `Dinasti mencapai puncak kejayaan di bawah ${pick(['Konrad', 'Otto', 'Friedrich'])} yang Agung`,
        });
      }
    });
    this.G._v8seed = true;
  }

  private npc(t: Title): void {
    const raw = t.nama.replace(/^\S+\s/, '');
    const st =
      t.tier >= 7
        ? 'dinasti_kekaisaran'
        : t.tier >= 6
          ? 'dinasti_kerajaan'
          : t.tier >= 4
            ? 'bangsawan_tinggi'
            : 'bangsawan_lokal';
    const dy: Dynasty = {
      id: 'y' + ++this.G.n,
      nama: 'von ' + raw,
      prestise: t.tier * 30,
      status: st,
      kepala: null,
    };
    this.DY[dy.id] = dy;
    const c = this.mkC({
      lahir: this.G.tahun - R(24, 58),
      budaya: t.budaya,
      agama: t.agama || 'katolik',
      dinasti: dy.id,
      kelas: 'penguasa',
    });
    c.res.emas = t.tier * 30 + R(0, 40);
    dy.kepala = c.id;
    t.pem = c.id;
  }

  private pool(n: number): void {
    const NT = (this.D.teks_game && this.D.teks_game.nama_tempat) || {};
    const A = (NT.awal || ['Hohen']) as string[];
    const B = (NT.akhir || ['burg']) as string[];
    const counties = Object.values(this.T).filter((x) => x.tier === 3);
    if (!counties.length) return;
    for (let i = 0; i < n; i++) {
      const t = pick(counties);
      const dn = pick(A) + pick(B);
      const dy: Dynasty = {
        id: 'y' + ++this.G.n,
        nama: 'von ' + dn,
        prestise: 5,
        status: 'bangsawan_lokal',
        kepala: null,
      };
      this.DY[dy.id] = dy;
      const c = this.mkC({
        lahir: this.G.tahun - R(16, 45),
        budaya: t.budaya,
        agama: t.agama || 'katolik',
        dinasti: dy.id,
        kelas: 'bangsawan',
      });
      dy.kepala = c.id;
      const bt: Title = {
        id: 'b_' + c.id,
        nama: 'Baron ' + pick(A) + pick(B),
        tier: 1,
        pem: c.id,
        atas: t.id,
        kids: [],
        budaya: t.budaya,
        agama: t.agama,
        prov: null,
      };
      this.T[bt.id] = bt;
      t.kids.push(bt.id);
    }
  }

  public fill(): void {
    Object.values(this.T).forEach((t) => {
      if (!t.pem) this.npc(t);
    });
    this.pool(25);
    this.fillFamilies14();
  }

  private fillFamilies14(): void {
    const GN = this.D?.generator || {};
    const K = GN.keluarga || {};
    const minM = K.min_anggota_dinasti || 4;
    const cnt: Record<string, number> = {};
    Object.values(this.C).forEach((c) => {
      if (c.dinasti) cnt[c.dinasti] = (cnt[c.dinasti] || 0) + 1;
    });
    const mk = (d: Dynasty, h: Character, o: Partial<Character>) => {
      const c = this.mkC(
        Object.assign({ dinasti: d.id, budaya: h.budaya, agama: h.agama, kelas: 'bangsawan' }, o)
      );
      if (!o.nama) {
        c.nama = pick((o.gender === 'P' ? GN.nama_perempuan : GN.nama_laki) || this.NM[o.gender || 'L']);
      }
      return c;
    };

    Object.values(this.DY).forEach((d) => {
      if (d.fam14 || (cnt[d.id] || 0) >= minM) return;
      const h = d.kepala ? this.C[d.kepala] : undefined;
      if (!h || !h.hidup) return;
      d.fam14 = 1;
      const ha = this.umur(h);
      if (!h.ayah && !h.ibu) {
        const fa = mk(d, h, { gender: 'L', lahir: h.lahir - R(20, 34) });
        const mo = mk(d, h, { gender: 'P', lahir: h.lahir - R(18, 30) });
        [fa, mo].forEach((x) => {
          const a = this.G.tahun - x.lahir;
          if (a > 68 || Math.random() < 0.5) {
            x.hidup = false;
            x.wafat = Math.min(this.G.tahun - 1, Math.max(h.lahir + R(0, 25), x.lahir + R(40, 70)));
          }
        });
        fa.pasangan = mo.id;
        mo.pasangan = fa.id;
        fa.sn = mo.sn = 'menikah';
        fa.anak.push(h.id);
        mo.anak.push(h.id);
        h.ayah = fa.id;
        h.ibu = mo.id;
        const ns = R(0, K.saudara_maks ?? 2);
        for (let i = 0; i < ns; i++) {
          const g: 'L' | 'P' = Math.random() < 0.5 ? 'L' : 'P';
          const s = mk(d, h, { gender: g, lahir: h.lahir + R(-6, 6), ayah: fa.id, ibu: mo.id });
          fa.anak.push(s.id);
          mo.anak.push(s.id);
          if (s.lahir >= this.G.tahun) s.lahir = this.G.tahun - 1;
        }
      }
      if (ha >= (K.umur_nikah_min || 18) && !h.pasangan && Math.random() < (K.peluang_menikah ?? 0.8)) {
        const sp = mk(d, h, { gender: h.gender === 'L' ? 'P' : 'L', lahir: h.lahir + R(-4, 8) });
        if (this.umur(sp) < 16) sp.lahir = this.G.tahun - 16;
        h.pasangan = sp.id;
        sp.pasangan = h.id;
        h.sn = sp.sn = 'menikah';
        const n = ha >= 20 ? R(K.anak_min ?? 1, K.anak_maks ?? 4) : 0;
        for (let i = 0; i < n; i++) {
          const bl = Math.min(this.G.tahun - i, h.lahir + R(18, 32) + i * R(1, 3));
          if (bl > this.G.tahun) continue;
          const g: 'L' | 'P' = Math.random() < 0.5 ? 'L' : 'P';
          const f = h.gender === 'L' ? h : sp;
          const m = h.gender === 'L' ? sp : h;
          const k = mk(d, h, { gender: g, lahir: bl, ayah: f.id, ibu: m.id });
          h.anak.push(k.id);
          sp.anak.push(k.id);
        }
      }
    });
  }

  public startNewGame(input: StartFormInput): void {
    this.newWorld();
    const pr = input.pr;
    if (pr === 'king' || pr === 'emperor') {
      this.G.pid = input.tk;
    } else {
      const po = (this.D.pengaturan_mulai?.peran_awal || []).find((x: AnyRule) => x.id === pr) || {};
      const id = 'pl';
      const did = 'dy_pl';
      this.DY[did] = {
        id: did,
        nama: input.dn || 'Baru',
        prestise: po.prestise_awal || 0,
        status: po.tier ? 'bangsawan_lokal' : 'rakyat_biasa',
        kepala: id,
        warna: '#9A6614',
      };
      const c = this.mkC({
        id,
        nama: input.nm || 'Pemain',
        gender: input.gn,
        lahir: this.G.tahun - R(18, 30),
        budaya: input.bd,
        agama: input.ag,
        dinasti: did,
        kelas: pr === 'rakyat_jelata' ? 'rakyat_jelata' : pr === 'pengusaha' ? 'warga_kota' : 'bangsawan',
        profesi: pr === 'pengusaha' ? 'pengusaha' : pr === 'rakyat_jelata' ? input.pf : null,
        loc: input.lc,
        sifat: [...new Set([input.s1, input.s2])].filter(Boolean),
      });
      c.res = { prestise: po.prestise_awal || 0, emas: po.emas_awal || 10, kesalehan: 30 };
      this.G.pid = id;
      if (po.tier === 1 || po.tier === 2) {
        this.makeBaron(c, input.lc, po.tier);
      } else if (po.tier && this.T[input.lc]) {
        this.T[input.lc].pem = id;
      }
    }
    this.fill();
    if (input.bg && pr !== 'king' && pr !== 'emperor') {
      this.applyBackground(input.bg);
    } else if (input.bg) {
      this.G.background = input.bg;
    }
    const p = this.me();
    this.G.familyFocus = p.id;
    this.G.familyView.centered = p.id;
    const t = this.tierOf(p);
    const tot = p.pas || (t ? Math.round(this.tn(t).pasukan_maks * 0.25) : 0);
    this.G.tr = {
      pedang: Math.round(tot * 0.55),
      pemanah: Math.round(tot * 0.3),
      kavaleri: Math.round(tot * 0.15),
    };
    this.G.log.unshift(`Permainan dimulai tahun ${this.G.tahun}.`);
    this.notifyLog(`Memulai perjalanan sebagai ${this.full(p)} di tahun ${this.G.tahun}`, '🏰');
    this.G.fam14 = 1;
    this.save();
    sfx.playChime();
    this.stack = [{ view: 'main' }];
    this.notify();
  }

  public startRandomWorld(): void {
    this.newWorld();
    const GN = this.D.generator;
    if (!GN) {
      this.showToast('Data generator belum tersedia.');
      return;
    }
    let s = Date.now();
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    const rInt = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1));
    const rPick = <T,>(a: T[]): T => a[Math.floor(rnd() * a.length)];

    this.DY = {};
    this.C = {};
    this.G.n = 0;
    this.G.claims = {};
    const NUM_DYN = GN.jumlah_dinasti || 100;
    const NUM_CHR = GN.jumlah_karakter || 1000;
    const titles = Object.values(this.T).filter((t) => t.tier >= 3);
    const dynList: Dynasty[] = [];

    for (let i = 0; i < NUM_DYN; i++) {
      const c = rPick<string>(GN.budaya);
      const nm = rPick<string>(GN.prefix_dinasti[c]) + ' ' + rPick<string>(GN.akar_dinasti[c]);
      const pr = rInt(0, 800);
      let st2 = 'bangsawan_lokal';
      if (pr >= 800) st2 = 'dinasti_kekaisaran';
      else if (pr >= 300) st2 = 'dinasti_kerajaan';
      else if (pr >= 100) st2 = 'bangsawan_tinggi';
      const id = 'dy' + i;
      const dy: Dynasty = {
        id,
        nama: nm,
        budaya: c,
        prestise: pr,
        status: st2,
        moto: '',
        warna: rPick<string>(GN.warna),
        kepala: null,
        gen: true,
      };
      this.DY[id] = dy;
      dynList.push(dy);
    }

    dynList.sort((a, b) => b.prestise - a.prestise);
    const sT = titles.slice().sort((a, b) => b.tier - a.tier);
    let di = 0;
    sT.forEach((t) => {
      t._dy = dynList[di++ % dynList.length].id;
    });

    let n = 0;
    dynList.forEach((d) => {
      const g: 'L' | 'P' = rnd() < 0.8 ? 'L' : 'P';
      const c = this.mkC({
        lahir: this.G.tahun - rInt(30, 55),
        dinasti: d.id,
        gender: g,
        budaya: d.budaya || 'german',
        kelas: 'penguasa',
      });
      c.nama = rPick(g === 'L' ? GN.nama_laki : GN.nama_perempuan);
      d.kepala = c.id;
      n++;
    });

    sT.forEach((t) => {
      const d = t._dy ? this.DY[t._dy] : undefined;
      if (!d || !d.kepala) return;
      t.pem = d.kepala;
      const h = this.C[d.kepala];
      h.titles = h.titles || [];
      h.titles.push(t.id);
      if (t.tier >= 4) h.kelas = 'penguasa';
      delete t._dy;
    });

    const roles = ['family', 'family', 'family', 'family', 'courtier', 'knight', 'knight', 'clergy'];
    let at = 0;
    while (n < NUM_CHR && at < NUM_CHR * 5) {
      at++;
      const d = rPick(dynList);
      const role = rPick(roles);
      const g: 'L' | 'P' = rnd() < 0.5 ? 'L' : 'P';
      const c = this.mkC({
        lahir: this.G.tahun - rInt(16, 65),
        dinasti: d.id,
        gender: g,
        budaya: d.budaya || 'german',
        kelas: role === 'knight' ? 'ksatria' : 'bangsawan',
      });
      c.nama = rPick(g === 'L' ? GN.nama_laki : GN.nama_perempuan);
      if (role === 'family') {
        const head = d.kepala ? this.C[d.kepala] : undefined;
        if (head && rnd() < 0.6 && this.umur(head) >= this.umur(c) + 16) {
          c.ayah = head.id;
          head.anak.push(c.id);
        }
      }
      n++;
    }

    this.fill();
    const top = Object.values(this.C)
      .filter((c) => c.hidup && this.held(c.id).length)
      .sort((a, b) => this.tierOf(b) - this.tierOf(a));
    if (top.length) this.G.pid = top[0].id;
    const p = this.me();
    const t = this.tierOf(p);
    const tot = t ? Math.round(this.tn(t).pasukan_maks * 0.25) : 0;
    this.G.tr = {
      pedang: Math.round(tot * 0.55),
      pemanah: Math.round(tot * 0.3),
      kavaleri: Math.round(tot * 0.15),
    };
    this.G.log = [`Dunia acak terbentuk: ${NUM_DYN} dinasti, ${Object.keys(this.C).length} karakter.`];
    this.G.genWorld = true;
    this.G.fam14 = 1;
    this.save();
    sfx.playChime();
    this.stack = [{ view: 'main' }];
    this.notify();
  }

  // ============ SUCCESSION & KINSHIP ============
  public ancD(c: Character | undefined, d = 0, m = new Map<string, number>()): Map<string, number> {
    if (!c || (m.has(c.id) && (m.get(c.id) ?? 99) <= d)) return m;
    m.set(c.id, d);
    if (c.ibu) this.ancD(this.C[c.ibu], d + 1, m);
    if (c.ayah) this.ancD(this.C[c.ayah], d + 1, m);
    return m;
  }

  public dist(a: Character, b: Character): number {
    const A = this.ancD(a);
    const B = this.ancD(b);
    let r = 99;
    A.forEach((v, k) => {
      if (B.has(k)) r = Math.min(r, v + (B.get(k) ?? 99));
    });
    return r;
  }

  public blood = (a: Character, b: Character): boolean => this.dist(a, b) < 99;

  public isStep(parent: Character, child: Character): boolean {
    if (!parent || !child || this.blood(parent, child)) return false;
    const sp = parent.pasangan ? this.C[parent.pasangan] : null;
    if (sp && sp.anak && sp.anak.includes(child.id)) return true;
    if (sp && child.ibu && child.ibu === sp.id) return true;
    return false;
  }

  public heir(c: Character, pl: boolean): Character | null {
    const ok = (x: Character | undefined): x is Character => Boolean(x && x.hidup && x.id !== c.id);
    if (pl && this.G.was.heir) {
      const chosen = this.C[this.G.was.heir];
      if (ok(chosen) && (this.blood(c, chosen) || (this.G.was.allowTiri && this.isStep(c, chosen)))) {
        return chosen;
      }
    }

    const Ac = this.ancD(c);
    const g = (x: Character) => (Ac.has(x.id) ? 2 : this.ancD(x).has(c.id) ? 0 : 1);
    const kids = c.anak.map((i) => this.C[i]).filter((x): x is Character => Boolean(x && x.hidup));
    const law = this.LAW('suksesi_kerajaan') || 'primogenitur';
    const gen = this.LAW('suksesi_gender') || 'agnatik_kognatik';
    const srt = (a: Character, b: Character) => {
      if (gen === 'agnatik') return (a.gender === 'L' ? 0 : 1) - (b.gender === 'L' ? 0 : 1) || a.lahir - b.lahir;
      if (gen === 'kesetaraan') return a.lahir - b.lahir;
      const gd = (a.gender === 'L' ? -1 : 1) + (b.gender === 'L' ? 1 : -1);
      return gd === 0 ? a.lahir - b.lahir : a.gender === 'L' ? -1 : 1;
    };

    let result: Character | null = null;
    if (law === 'ultimogenitur') {
      result =
        kids.sort(srt).slice(-1)[0] ||
        Object.values(this.C)
          .filter((x) => ok(x) && this.dist(c, x) <= 8)
          .sort((a, b) => this.dist(c, b) - this.dist(c, a))[0] ||
        null;
    } else if (law === 'tanistri') {
      const sib = Object.values(this.C)
        .filter((x) => ok(x) && c.ibu && x.ibu === c.ibu)
        .sort(srt);
      result = sib[0] || kids.sort(srt)[0] || null;
    } else {
      result =
        kids.sort(srt)[0] ||
        Object.values(this.C)
          .filter((x) => ok(x) && this.dist(c, x) <= 8)
          .sort((a, b) => g(a) - g(b) || this.dist(c, a) - this.dist(c, b) || srt(a, b))[0] ||
        null;
    }

    if (!result && this.G.was.allowTiri) {
      const sp = c.pasangan ? this.C[c.pasangan] : null;
      if (sp) {
        const steps = sp.anak
          .map((i) => this.C[i])
          .filter((x): x is Character => Boolean(x && x.hidup && x.id !== c.id && !this.blood(c, x)))
          .sort((a, b) => (a.gender === 'L' ? 0 : 1) - (b.gender === 'L' ? 0 : 1) || a.lahir - b.lahir);
        if (steps.length) return steps[0];
      }
      const allSteps = Object.values(this.C)
        .filter((x) => x.hidup && x.id !== c.id && this.isStep(c, x))
        .sort((a, b) => (a.gender === 'L' ? 0 : 1) - (b.gender === 'L' ? 0 : 1) || a.lahir - b.lahir);
      if (allSteps.length) return allSteps[0];
    }
    return result;
  }

  // ============ DEATH & BIRTH ============
  public die(c: Character, a: number): void {
    const wasPlayer = c.id === this.G.pid;
    const titlesBefore = this.held(c.id).map((t) => ({ id: t.id, nama: t.nama, tier: t.tier }));
    const dSave = c.dinasti;
    const ep = this.computeEpithet(c);

    // v9 per-wilayah will split before standard inheritance
    this.held(c.id)
      .filter((t) => t.tier <= 3)
      .forEach((t) => {
        const targetId = this.G.was.perWilayah?.[t.id];
        if (targetId) {
          const r = this.C[targetId];
          if (r && r.hidup) t.pem = r.id;
        }
      });

    c.hidup = false;
    c.wafat = this.G.tahun;
    const s = c.pasangan ? this.C[c.pasangan] : null;
    if (s) {
      s.sn = s.gender === 'P' ? 'janda' : 'duda';
      s.pasangan = null;
      if (s.gender === 'P' && this.RWf().janda) {
        const myTitles = this.held(c.id).filter((t) => t.tier <= 3);
        const wn = Math.floor((myTitles.length * (this.RWf().janda.tanah_janda_persen || 20)) / 100);
        for (let i = 0; i < wn && i < myTitles.length; i++) {
          myTitles[i].pem = s.id;
          this.G.widows[s.id] = this.G.widows[s.id] || [];
          this.G.widows[s.id].push(myTitles[i].id);
        }
      }
    }

    this.G.tun = this.G.tun.filter((x) => x.a !== c.id && x.b !== c.id);
    const h = this.heir(c, wasPlayer);
    const was = this.G.was || {};
    const bag = this.held(c.id).filter((t) => t.tier <= 3 && t.pem === c.id);

    if (was.heir && this.C[was.heir]?.hidup && (this.blood(c, this.C[was.heir]) || (was.allowTiri && this.isStep(c, this.C[was.heir])))) {
      bag.forEach((t) => (t.pem = was.heir!));
    } else if (this.LAW('suksesi_kerajaan') === 'terbagi' && bag.length > 1) {
      const kids = c.anak.map((i) => this.C[i]).filter((x): x is Character => Boolean(x && x.hidup));
      bag.forEach((t, i) => {
        if (kids[i]) t.pem = kids[i].id;
        else if (h) t.pem = h.id;
        else {
          t.pem = null;
          this.npc(t);
        }
      });
    } else if (h) {
      bag.forEach((t) => (t.pem = h.id));
    } else {
      bag.forEach((t) => {
        t.pem = null;
        this.npc(t);
      });
    }

    const hi = this.held(c.id).filter((t) => t.tier > 3 && t.pem === c.id);
    hi.forEach((t) => {
      if (h) t.pem = h.id;
      else {
        t.pem = null;
        this.npc(t);
      }
    });

    if (h) {
      h.res.emas += c.res.emas * 0.8;
      h.res.prestise += c.res.prestise * 0.5;
      if (wasPlayer && was.gereja) {
        h.res.emas -= c.res.emas * 0.2;
        h.res.kesalehan += 25;
      }
    }

    const dy = c.dinasti ? this.DY[c.dinasti] : undefined;
    if (dy && dy.kepala === c.id) {
      const mem = Object.values(this.C)
        .filter((x) => x.hidup && x.dinasti === c.dinasti)
        .sort((x, y) => this.tierOf(y) - this.tierOf(x) || this.umur(y) - this.umur(x));
      dy.kepala = mem[0] ? mem[0].id : null;
    }

    if (wasPlayer) {
      if (h) {
        this.G.pid = h.id;
        this.G.log.push(`${this.full(c)} wafat (usia ${a}). Kamu kini bermain sebagai ${this.full(h)}.`);
      } else {
        this.G.over = 1;
      }
    } else if (this.kin(this.me(), c)) {
      this.G.log.push(`${this.full(c)} wafat pada usia ${a}.`);
    }

    // Record v8 rulers & chronicle
    titlesBefore.forEach((t) => {
      if (!this.G.rulers[t.id]) this.G.rulers[t.id] = [];
      this.G.rulers[t.id].push({
        id: c.id,
        nama: c.nama,
        julukan: ep,
        dari: Math.max(c.lahir + 16, this.G.tahun - Math.max(1, a - 16)),
        sampai: this.G.tahun,
        sebab: 'wafat',
      });
      if (this.G.rulers[t.id].length > 15) this.G.rulers[t.id] = this.G.rulers[t.id].slice(-15);
    });

    if (dSave) {
      if (ep) this.dynLog(dSave, `${this.full(c)} wafat — dikenang sebagai "${ep}"`);
      else this.dynLog(dSave, `${this.full(c)} wafat pada usia ${a}`);
      if (titlesBefore.length) {
        this.dynLog(dSave, `Masa pemerintahan ${this.full(c)} atas ${titlesBefore.map((t) => t.nama).join(', ')} berakhir`);
      }
    }

    if (wasPlayer && this.G.pid && this.G.pid !== c.id) {
      const np = this.C[this.G.pid];
      if (np) {
        if (this.isStep(c, np)) this.dynLog(dSave, `${this.full(np)} (anak tiri) mewarisi gelar keluarga`);
        else if (this.blood(c, np)) this.dynLog(dSave, `${this.full(np)} mewarisi gelar dari ${this.full(c)}`);

        if (this.umur(np) < 16) {
          let regent: Character | null = null;
          if (this.G.was.wali && this.C[this.G.was.wali]?.hidup) {
            regent = this.C[this.G.was.wali];
          } else {
            const cs = Object.values(this.C)
              .filter((x) => x.hidup && x.id !== np.id && x.id !== c.id && x.dinasti === c.dinasti)
              .sort((x, y) => this.umur(y) - this.umur(x));
            regent = cs[0] || null;
          }
          this.G.regency = { player: np.id, regent: regent ? regent.id : null, until: np.lahir + 16 };
          this.G.log.push(
            `${this.full(np)} masih di bawah umur. ${regent ? this.full(regent) + ' menjadi wali.' : 'Tidak ada wali.'}`
          );
        }
        if (this.G.factionRep._nextGen?.[this.G.pid]) {
          const ng = this.G.factionRep._nextGen[this.G.pid];
          (this.G.factionRep as AnyRule)[ng.faction] = ((this.G.factionRep as AnyRule)[ng.faction] || 0) + ng.rep;
          if (!this.G.faction) this.G.faction = ng.faction;
          this.G.log.push(`Mewarisi reputasi faksi ${ng.faction} (+${ng.rep})`);
          delete this.G.factionRep._nextGen[this.G.pid];
        }
      }
    }
  }

  private birth(c: Character): void {
    if (c.gender !== 'P' || c.sn !== 'menikah' || !c.pasangan || !this.C[c.pasangan]?.hidup) return;
    const pf = this.D.profesi.find((x: AnyRule) => x.id === c.profesi);
    if (pf && this.noMarry(pf, c)) return;
    const a = this.umur(c);
    if (a < 16 || a > 42 || Math.random() > (this.RG().peluang_hamil_per_tahun_pasangan * c.sp.kesuburan) / 100) return;
    const f = this.C[c.pasangan];
    const k = this.mkC({
      lahir: this.G.tahun,
      dinasti: f.dinasti,
      budaya: f.budaya,
      agama: f.agama,
      ibu: c.id,
      ayah: f.id,
      kelas: f.kelas,
    });
    c.anak.push(k.id);
    f.anak.push(k.id);
    if (c.id === this.G.pid || f.id === this.G.pid) {
      this.G.log.push(`Anak lahir: ${this.full(k)}.`);
      if (this.G.faction && this.G.factionRep && (this.G.factionRep as AnyRule)[this.G.faction]) {
        this.G.factionRep._nextGen = this.G.factionRep._nextGen || {};
        this.G.factionRep._nextGen[k.id] = {
          faction: this.G.faction,
          rep: Math.floor(((this.G.factionRep as AnyRule)[this.G.faction] || 0) / 2),
        };
      }
    }
    if (k && k.dinasti && this.DY[k.dinasti] && this.DY[k.dinasti].prestise >= 100) {
      this.dynLog(k.dinasti, `Kelahiran ${this.full(k)} (anak ${this.full(c)})`);
    }
  }

  // ============ INCOME & MILITARY ============
  public factionRank(rep: number): { min: number; nama: string; efek: Record<string, number> } {
    let r = this.FACTION_RANKS[0] || { min: 0, nama: 'Netral', efek: {} };
    for (const x of this.FACTION_RANKS) {
      if (rep >= x.min) r = x;
    }
    return r;
  }

  public income(): number {
    const p = this.me();
    if (!p) return 0;
    let g = 0;
    const m = (this.PJK()[this.G.paj ?? 1] || this.PJK()[1] || { mult: 1 }).mult;
    this.held(p.id).forEach((t) => {
      if (t.tier <= 3) {
        this.provs(t).forEach((v) => (g += v.eko * this.RG().pendapatan_emas_per_provinsi_per_ekonomi));
      } else {
        g += t.kids.length * 1.5;
      }
    });
    const pf = this.D.profesi.find((x: AnyRule) => x.id === p.profesi);
    if (pf) g += pf.pendapatan + this.rankInc(p);
    this.G.us.forEach((u) => (g += u.p * 0.85));

    const vt = this.held(p.id).reduce(
      (s, t) =>
        s +
        t.kids
          .filter((k) => this.T[k] && this.T[k].pem && this.T[k].pem !== p.id && this.T[k].tier <= 3)
          .reduce((a, k) => a + this.provs(this.T[k]).reduce((b, v) => b + v.eko * 0.5 * 0.2, 0), 0),
      0
    );
    g += vt * m;

    const eff = this.provEffects(p);
    g += eff.ekonomi * 0.5;
    const treas = this.G.pen.bendahara ? this.C[this.G.pen.bendahara] : null;
    const treasEff = treas ? this.officeEfficiency('bendahara') : 1;
    g *= 1 + ((this.AG(p.agama).efek.emas_persen || 0) + (treas ? (treas.sk.administrasi / 6) * treasEff : 0)) / 100;

    this.D.pasukan_jenis.forEach((k: AnyRule) => {
      g -= (this.G.tr[k.id] * k.tingkat[this.lv() - 1].biaya_tahunan) / 100;
    });
    this.D.jabatan.forEach((j: AnyRule) => {
      if (this.G.pen[j.id] && this.C[this.G.pen[j.id]!]) g -= j.gaji;
    });

    const pop = this.G.rakyat?.bahagia ?? 50;
    const popMult = pop < 25 ? 0.6 : pop < 40 ? 0.8 : pop < 50 ? 0.95 : pop > 70 ? 1.05 : 1;
    let total = g * popMult;

    if (this.G.faction && this.G.factionRep) {
      const r = this.factionRank((this.G.factionRep as AnyRule)[this.G.faction] || 0);
      if (r.efek.emas) total += r.efek.emas;
    }

    // v14 Additions: Church income, trade routes, loan interest
    total += this.relIncome(p);
    this.G.trade.forEach((tr) => {
      total += tr.income;
    });
    this.G.loans.forEach((ln) => {
      total -= ln.int;
    });
    if (this.G.church?.excom?.[p.id]) {
      total *= 0.85;
    }
    return total;
  }

  public army(c: Character): Record<string, number> {
    if (c.id === this.G.pid) return { ...this.G.tr };
    const t = this.tierOf(c);
    const n = t ? this.tn(t).pasukan_maks * (0.3 + this.hv(c.id) / 250) : 50;
    return { pedang: n * 0.55, pemanah: n * 0.3, kavaleri: n * 0.15 };
  }

  public mil(a: Record<string, number>): number {
    return this.D.pasukan_jenis.reduce((s: number, k: AnyRule) => {
      const u = k.tingkat[this.lv() - 1];
      return s + (a[k.id] || 0) * ((u.serang + u.bertahan) / 40);
    }, 0);
  }

  public pwr(c: Character): number {
    const mar = c.id === this.G.pid && this.G.pen.marsekal ? this.C[this.G.pen.marsekal] : null;
    const marEff = mar ? this.officeEfficiency('marsekal') : 1;
    const moraleMult = c.id === this.G.pid ? 0.75 + (this.G.morale ?? 80) / 320 : 1;
    return (
      this.mil(this.army(c)) *
      (mar ? 1 + (mar.sk.perang * marEff) / 200 : 1) *
      (1 + (this.AG(c.agama).efek.pasukan_persen || 0) / 100) *
      moraleMult
    );
  }

  public massa(t: Title): string {
    for (let x: Title | undefined = t; x; x = x.atas ? this.T[x.atas] : undefined) {
      for (const [m, l] of Object.entries((this.D.pulau || {}) as Record<string, string[]>)) {
        if (l.includes(x.id)) return m;
      }
    }
    return 'eu';
  }

  public yard(): boolean {
    const p = this.me();
    return this.held(p.id).some((t) => t.tier <= 3 && this.provs(t).some((v) => v.b.includes('galangan_kapal')));
  }

  public kap = (): number =>
    this.D.kapal.reduce((s: number, k: AnyRule) => s + (this.G.sh[k.id] || 0) * k.kapasitas, 0);

  public navy = (): number =>
    this.D.kapal.reduce((s: number, k: AnyRule) => s + (this.G.sh[k.id] || 0) * k.serang, 0);

  private fight(A: Record<string, number>, B: Record<string, number>, ma: number, mb: number) {
    const a = { ...A };
    const b = { ...B };
    let w = 0;
    const l: string[] = [];
    const cf = (x: Record<string, number>, y: Record<string, number>) => {
      const sx = sumObj(x) || 1;
      const sy = sumObj(y) || 1;
      return this.D.pasukan_jenis.reduce(
        (s: number, k: AnyRule) =>
          s + (x[k.id] / sx) * (((y[this.TRI[k.id]] || 0) - (y[this.INV[k.id]] || 0)) / sy),
        0
      );
    };
    for (let i = 1; i <= 4 && sumObj(a) > 5 && sumObj(b) > 5; i++) {
      const fa = this.mil(a) * ma * (1 + 0.3 * cf(a, b));
      const fb = this.mil(b) * mb * (1 + 0.3 * cf(b, a));
      const win = fa / (fa + fb) + (Math.random() - 0.5) * 0.2 > 0.5;
      w += win ? 1 : -1;
      const la = win ? R(8, 15) : R(22, 35);
      const lb = win ? R(22, 35) : R(8, 15);
      for (const k in a) a[k] *= 1 - la / 100;
      for (const k in b) b[k] *= 1 - lb / 100;
      l.push(`Pertempuran ${i}: ${win ? 'menang' : 'kalah'} (${Math.round(sumObj(a))} vs ${Math.round(sumObj(b))})`);
      if (Math.abs(w) >= 2) break;
    }
    return { win: w > 0, a, b, l };
  }

  // ============ MISC ACTIONS & CHRONICLES ============
  private msg(s: string): void {
    this.G.log = [s];
    this.save();
    this.home();
  }

  public deed(id: string, k: string, a = 1): void {
    if (!this.G.deeds[id]) {
      this.G.deeds[id] = {
        wars_won: 0,
        wars_lost: 0,
        buildings: 0,
        prestige_gain: 0,
        charity: 0,
        kills: 0,
        titles: 0,
        plague_fought: 0,
      };
    }
    this.G.deeds[id][k] = (this.G.deeds[id][k] || 0) + a;
  }

  public dynLog(id: string | null | undefined, text: string): void {
    if (!id) return;
    if (!this.G.dynHist[id]) this.G.dynHist[id] = [];
    this.G.dynHist[id].push({ y: this.G.tahun, text });
    if (this.G.dynHist[id].length > 80) this.G.dynHist[id] = this.G.dynHist[id].slice(-80);
  }

  public computeEpithet(c: Character): string {
    const d = this.G.deeds[c.id] || {};
    const pts: [string, number][] = [
      ['yang Agung', (d.wars_won || 0) * 8 + (d.titles || 0) * 6 + (d.prestige_gain || 0) * 0.3],
      ['Sang Penakluk', (d.wars_won || 0) * 10 - (d.wars_lost || 0) * 3],
      ['yang Bijaksana', (c.sk.pembelajaran || 0) * 0.6 + (c.sk.administrasi || 0) * 0.4],
      ['yang Saleh', (c.res.kesalehan || 0) * 0.8 + (d.charity || 0) * 5],
      ['yang Kejam', (d.kills || 0) * 10 + (c.sifat.includes('kejam') ? 20 : 0)],
      ['Sang Pembangun', (d.buildings || 0) * 8],
      ['yang Malang', (d.wars_lost || 0) * 10],
      ['yang Adil', this.G.rakyat && this.G.rakyat.bahagia > 60 ? 15 : 0],
      ['Sang Penjaga', (d.plague_fought || 0) * 12],
      ['yang Tua', this.umur(c) > 60 ? 15 : 0],
      ['yang Muda', this.umur(c) < 25 ? 20 : 0],
      ['Sang Pemberani', c.sifat.includes('berani') ? 12 : 0],
      ['yang Licik', c.sifat.includes('licik') ? 12 : 0],
      ['yang Pendiam', 3],
    ];
    pts.sort((a, b) => b[1] - a[1]);
    return pts[0][1] > 5 ? pts[0][0] : '';
  }

  public ap(p: Character, k: string, v: AnyRule): void {
    if (k in p.res) (p.res as AnyRule)[k] += v;
    else if (k in p.sp) (p.sp as AnyRule)[k] = cl((p.sp as AnyRule)[k] + v);
    else if (k in p.sk) (p.sk as AnyRule)[k] = cl((p.sk as AnyRule)[k] + v);
    else if (k === 'ekonomi') {
      const t = this.held(p.id).find((x) => x.tier <= 3);
      if (t) this.provs(t)[0].eko += v;
    } else if (k === 'naik_tier' && !this.tierOf(p)) {
      const counties = Object.values(this.T).filter((t) => t.tier === 3);
      this.makeBaron(p, p.loc || (counties.length ? pick(counties).id : ''));
    } else if (k === 'item') {
      p.items = p.items || [];
      p.items.push(v);
    } else if (k === 'tamu') {
      const t = this.held(p.id).find((x) => x.tier <= 3);
      if (t) {
        const npc2 = this.mkC({
          lahir: this.G.tahun - R(20, 45),
          budaya: t.budaya,
          agama: t.agama,
          kelas: 'bangsawan',
        });
        npc2.op[p.id] = 30;
        p.op[npc2.id] = 20;
        this.G.log.push('Tamu bangsawan: ' + this.full(npc2));
      }
    }
  }

  public makeBaron(c: Character, loc: string, tier = 1): void {
    if (!loc || !this.T[loc]) return;
    const t: Title = {
      id: 'b_' + c.id,
      nama: `${this.tn(tier).nama} ${this.T[loc].nama.replace(/^\S+\s/, '')}`,
      tier,
      pem: c.id,
      atas: loc,
      kids: [],
      budaya: this.T[loc].budaya,
      agama: this.T[loc].agama,
      prov: null,
    };
    this.T[t.id] = t;
    this.T[loc].kids.push(t.id);
    c.kelas = 'bangsawan';
    const d = c.dinasti ? this.DY[c.dinasti] : undefined;
    if (d && d.status === 'rakyat_biasa') d.status = 'bangsawan_lokal';
    this.G.log.push(`Kamu kini ${this.tn(tier).nama} di ${this.T[loc].nama}!`);
  }

  private ensureRenaissanceBuildings(): void {
    if (!this.D.bangunan.find((b: AnyRule) => b.id === 'universitas')) {
      this.D.bangunan.push(
        { id: 'universitas', nama: 'Universitas', ikon: '🎓', biaya: 200, waktu_tahun: 5, efek: { pembelajaran: 5 } },
        { id: 'bank', nama: 'Bank', ikon: '🏦', biaya: 180, waktu_tahun: 4, efek: { ekonomi: 6 } },
        { id: 'percetakan', nama: 'Percetakan', ikon: '📰', biaya: 150, waktu_tahun: 3, efek: { pembelajaran: 3 } }
      );
    }
  }

  // ============ TICK (NEXT YEAR) ============
  public tick(): void {
    if (this.G.over) return;
    const p = this.me();
    const beforeBuilt = Object.values(this.P).reduce((s, a) => s + a.reduce((x, v) => x + v.b.length, 0), 0);

    this.G.log = [];
    this.G.tahun++;
    this.G.done = {};
    this.G.ev = null;

    if (this.G.tahun >= 1400) {
      this.ensureRenaissanceBuildings();
    }

    const inc = this.income();
    p.res.emas = Math.round((p.res.emas + inc) * 10) / 10;
    this.G.log.push(`Pendapatan: ${inc.toFixed(1)} emas.`);
    p.res.prestise += 1 + this.yr(p, 'prestise_per_tahun');
    if (this.G.faction && this.G.factionRep) {
      const fr = this.factionRank((this.G.factionRep as AnyRule)[this.G.faction] || 0);
      if (fr.efek.prestise) p.res.prestise += fr.efek.prestise;
    }
    p.res.kesalehan += this.yr(p, 'kesalehan_per_tahun') + this.G.kpt;
    if (this.G.faction === 'gereja') p.res.kesalehan += 1;

    // Sieges
    Object.entries(this.G.sieges).forEach(([tid, s]) => {
      s.turns++;
      const t = this.T[tid];
      const def = t && t.pem ? this.C[t.pem] : null;
      const wall = def ? Math.floor(this.tierOf(def) * 8 + (this.provEffects(def).maks_pasukan || 0) / 20) : 0;
      const mine = (this.G.tr.meriam || 0) * 20 + Math.floor(p.sk.perang / 4);
      if (s.turns >= 3 && mine > wall) {
        if (t) {
          t.pem = p.id;
          this.G.log.push(`Pengepungan ${t.nama} berhasil!`);
        }
        delete this.G.sieges[tid];
      } else if (s.turns >= 5 && mine <= wall) {
        delete this.G.sieges[tid];
        this.G.log.push(`Pengepungan ${t?.nama || tid} gagal, pasukan mundur.`);
      }
    });

    if (this.G.war) {
      this.G.war.turns++;
      if (this.G.war.turns >= 5) {
        const t = this.T[this.G.war.tid];
        if (t && t.pem !== p.id) this.G.log.push('Perang usai, tanpa hasil.');
        this.G.war = null;
      }
    }

    // Deaths & births
    Object.values(this.C).forEach((c) => {
      if (!c.hidup) return;
      const a = this.umur(c);
      const pd =
        this.RG().peluang_meninggal_dasar_per_tahun +
        (a > 50 ? (a - 50) * this.RG().tambahan_peluang_meninggal_per_tahun_setelah_umur_50 : 0) +
        (c.sp.kesehatan < 25 ? 0.05 : 0);
      if (Math.random() < pd) this.die(c, a);
      else {
        this.birth(c);
        if (c.id !== this.G.pid && Math.random() < 0.03) {
          c.sp.kesehatan = cl(c.sp.kesehatan + R(-8, 5));
        }
      }
    });

    // Safety net for orphaned titles
    Object.values(this.T).forEach((t) => {
      const o = t.pem ? this.C[t.pem] : null;
      if (o && !o.hidup && o.id !== this.G.pid) {
        const n = this.heir(o, false);
        if (n && n.hidup) t.pem = n.id;
        else {
          t.pem = null;
          this.npc(t);
        }
      }
    });

    if (this.G.over) {
      this.save();
      this.notify();
      return;
    }

    // Betrothals
    this.G.tun = this.G.tun.filter((x) => {
      const a = this.C[x.a];
      const b = this.C[x.b];
      if (!a || !b || !a.hidup || !b.hidup) return false;
      const yrOn = this.G.tahun - x.y;
      if (yrOn > this.RP().masa_tunangan_maks_tahun) {
        if (a.res.prestise >= this.RP().batal_tunangan.denda_prestise) {
          a.res.prestise -= this.RP().batal_tunangan.denda_prestise;
          a.sn = b.sn = 'lajang';
          a.pasangan = b.pasangan = null;
          if (a.id === this.G.pid) this.G.log.push('Pertunangan dibatalkan (lewat waktu).');
        }
        return false;
      }
      if (yrOn >= 1 && this.umur(a) >= 16 && this.umur(b) >= 16) {
        a.sn = b.sn = 'menikah';
        if (a.id === this.G.pid || b.id === this.G.pid) this.G.log.push('Pernikahan dilangsungkan!');
        return false;
      }
      return true;
    });

    // Buildings
    this.G.q = this.G.q.filter((x) => {
      if (x.end > this.G.tahun) return true;
      const v = this.provs(this.T[x.tid])[x.i];
      const e = this.bi(x.b).efek || {};
      v.b.push(x.b);
      if (e.ekonomi) v.eko += e.ekonomi;
      if (e.perkembangan) v.dev += e.perkembangan;
      if (e.kesalehan_per_tahun) this.G.kpt += e.kesalehan_per_tahun;
      this.G.log.push(`${this.bi(x.b).nama} selesai di ${v.nama}.`);
      return false;
    });

    // Alliances
    this.G.al = this.G.al.filter(
      (a) => this.C[a.id] && this.C[a.id].hidup && (a.tp === 'pernikahan' || this.G.tahun < a.y + (a.dur || 99))
    );
    this.G.al.forEach((a) => {
      if (a.tp === 'ekonomi') p.res.emas += 4;
      if (a.tp === 'dagang') p.res.emas += 3;
    });

    // Sect penalty
    if (this.AG(p.agama).sekte) {
      p.res.prestise = Math.max(0, p.res.prestise - 1);
      p.sp.kebahagiaan = cl(p.sp.kebahagiaan - 1);
    }

    // Vasal tax loyalty
    const pp = this.PJK()[this.G.paj ?? 1] || { op: 0 };
    if (pp.op) {
      this.held(p.id).forEach((t) =>
        t.kids.forEach((i) => {
          const o = this.T[i]?.pem ? this.C[this.T[i].pem!] : null;
          if (o && o.id !== p.id) this.bump(o, pp.op);
        })
      );
    }

    // Court job check
    if (this.G.job) {
      const r = this.C[this.G.job.r];
      const j = this.D.jabatan.find((x: AnyRule) => x.id === this.G.job?.j);
      if (this.G.job.id !== this.G.pid || !r || !r.hidup || !j) {
        if (this.G.job.id === this.G.pid) this.G.log.push('Jabatan berakhir.');
        this.G.job = null;
      } else {
        p.res.prestise += 1;
        this.bump(r, 2);
        if (Math.random() < 0.2) (p.sk as AnyRule)[j.stat] = cl((p.sk as AnyRule)[j.stat] + 1);
      }
    }

    Object.keys(this.G.pen).forEach((j) => {
      const c = this.G.pen[j] ? this.C[this.G.pen[j]!] : null;
      if (!c || !c.hidup || this.G.jail[c.id]) this.G.pen[j] = null;
    });

    (this.D.modernisasi || []).forEach((m: AnyRule) => {
      if (this.G.tahun >= m.tahun && !this.G.modern.includes(m.id)) {
        this.G.modern.push(m.id);
        this.G.log.push(`Kemajuan: ${m.nama}!`);
      }
    });

    (this.D.dinasti || []).forEach((d: AnyRule) => {
      const dy = this.DY[d.id];
      if (!dy) return;
      const mem = Object.values(this.C).filter((x) => x.hidup && x.dinasti === d.id);
      mem.forEach((m) => {
        if (this.tierOf(m) >= 3) dy.prestise += 0.5;
      });
      const s = this.D.status_dinasti
        .slice()
        .reverse()
        .find((x: AnyRule) => dy.prestise >= (x.prestise_min || 0) && x.tingkat > 0);
      if (s && s.tingkat > (dy.status_tier || 0)) {
        dy.status = s.id;
        dy.status_tier = s.tingkat;
      }
    });

    const ev = (this.D.peristiwa || []).filter((e: AnyRule) => {
      const s = e.syarat || {};
      return (
        (!s.kelas || s.kelas === p.kelas) &&
        (!s.prestise_min || p.res.prestise >= s.prestise_min) &&
        Math.random() < e.peluang_per_tahun
      );
    })[0];
    if (ev) this.G.ev = ev;

    if (Math.random() < 0.5) this.pool(1);

    // v6: Season, class events, rumors, public opinion, vasal revolts
    const curPlayer = this.me();
    const seasIdx = (this.G.tahun - this.D.meta.tahun_mulai) % Math.max(1, this.SEAS.length);
    const s = this.SEAS[seasIdx];
    if (s) {
      for (const [k, v] of Object.entries(s.e || {})) this.ap(curPlayer, k, v);
      if (s.d) this.G.log.unshift(s.d);
    }
    this.G.log.unshift(...this.classTick(curPlayer));
    this.G.log.unshift(...this.rumorTick(curPlayer));
    this.popTick();
    const rb = this.rebelTick(curPlayer);
    if (rb.length) this.G.log.unshift('Pemberontakan! ' + rb.join(', ') + ' melepaskan diri.');

    // v7: Plagues, provincial events, chain events
    this.G.log.unshift(...this.plagueTick(curPlayer));
    this.G.log.unshift(...this.provEventTick(curPlayer));
    this.G.log.unshift(...this.chainTick());

    // v8: Built tracking
    const afterBuilt = Object.values(this.P).reduce((sum, a) => sum + a.reduce((x, v) => x + v.b.length, 0), 0);
    if (afterBuilt > beforeBuilt) {
      const diff = afterBuilt - beforeBuilt;
      this.deed(curPlayer.id, 'buildings', diff);
      if (diff >= 2) this.dynLog(curPlayer.dinasti, `${this.full(curPlayer)} menyelesaikan ${diff} pembangunan`);
    }

    // v9: Regency + Faction rep
    if (this.G.regency) {
      const h = this.C[this.G.regency.player];
      if (!h || !h.hidup || this.umur(h) >= this.G.regency.until) {
        this.G.regency = null;
        this.G.log.unshift('Ahli waris dewasa, perwalian berakhir.');
      } else {
        curPlayer.res.emas = Math.max(0, curPlayer.res.emas - 3);
        curPlayer.res.prestise = Math.max(0, curPlayer.res.prestise - 1);
        this.G.log.unshift('Perwalian: -3 emas, -1 prestise.');
        if (this.G.regency.regent && this.C[this.G.regency.regent]?.hidup) {
          this.C[this.G.regency.regent].res.emas += 2;
        }
      }
    }
    if (this.G.faction && this.G.factionRep) {
      (this.G.factionRep as AnyRule)[this.G.faction] = ((this.G.factionRep as AnyRule)[this.G.faction] || 0) + 1;
    }

    // v10: Crusades & Reform
    this.crusadeTick();
    this.reformTick();

    // v11: Great wars, family events, renaissance
    this.greatWarTick();
    this.G.log.unshift(...this.familyTick());
    this.G.log.unshift(...this.renaissanceTick());

    // v12: Black Death, Peasant revolt, Reformation, 30 years war
    this.G.log.unshift(...this.blackDeathTick());
    this.G.log.unshift(...this.peasantRevoltTick());
    this.G.log.unshift(...this.protestantReformationTick());
    this.G.log.unshift(...this.thirtyYearsTick());

    // Historical Wars
    this.G.log.unshift(...this.warHistTick());

    // v14: Papal succession, NPC agency, crime, detailed siege, weather/disasters
    this.churchTick();
    this.npcAgencyTick();
    this.siegeDetailTick();
    this.G.log.unshift(...this.crimeAndWeatherTick());

    // v15: Historical scripted events, coups, achievements
    this.histEventTick();
    this.kudetaTick();

    // v16: Dynamic prices, knightly orders upkeep/bonus, troop morale, travel
    this.priceTick();
    this.ordersTick();
    this.moraleTick();
    this.travelTick();

    // v18: Office corruption, war logistics supply & campaign
    this.officeCorruptionTick();
    this.supplyTick();
    this.campaignTick();

    // Finalize achievements check after all ticks
    this.checkAchievements();

    sfx.playChime();
    this.save();
    this.notify();
  }

  private classTick(p: Character): string[] {
    const pool = this.CEV[p.kelas] || this.CEV.rakyat_jelata || [];
    const out: string[] = [];
    if (!pool.length) return out;
    const n = R(...(this.D.aturan_event?.jumlah_event_kelas || [2, 4]) as [number, number]);
    for (let i = 0; i < n; i++) {
      let ev;
      let tries = 0;
      do {
        ev = pick(pool);
        tries++;
      } while (ev.c && !ev.c(p) && tries < 10);
      if (ev.c && !ev.c(p)) continue;
      if (ev.e) {
        for (const [k, v0] of Object.entries(ev.e)) {
          const v = this.AT_num(v0);
          if (k === 'rakyat') this.G.rakyat.bahagia = cl(this.G.rakyat.bahagia + v);
          else this.ap(p, k, v);
        }
      }
      out.push(`${ev.t}: ${ev.d}`);
    }
    return out;
  }

  private rumorTick(p: Character): string[] {
    if (Math.random() > (this.D.aturan_event?.peluang_rumor ?? 0.4)) return [];
    const others = Object.values(this.C).filter((c) => c.hidup && c.id !== p.id && this.tierOf(c) >= 1);
    if (!others.length) return [];
    return [pick(this.RUM).replace('{n}', this.full(pick(others)))];
  }

  private rebelTick(p: Character): string[] {
    if (this.G.rakyat.bahagia > 25) return [];
    const out: string[] = [];
    this.held(p.id).forEach((t) => {
      if (t.tier >= 4) return;
      t.kids.forEach((k) => {
        const v = this.T[k];
        const vc = v && v.pem ? this.C[v.pem] : null;
        if (!vc || vc.id === p.id) return;
        if (this.opn(vc, p) > -40 || Math.random() > 0.08) return;
        v.atas = null;
        vc.res.prestise += 10;
        vc.op[p.id] = -80;
        p.op[vc.id] = -80;
        out.push(this.full(vc));
      });
    });
    return out;
  }

  private popTick(): void {
    const k = this.PJK()[this.G.paj ?? 1] || { bahagia: 0 };
    this.G.rakyat.bahagia = cl(this.G.rakyat.bahagia + (k.bahagia || 0) * 2);
    if (this.G.war) this.G.rakyat.bahagia = cl(this.G.rakyat.bahagia - 2);
    if (this.G.rakyat.bahagia > 50 && Math.random() < 0.3) this.G.rakyat.bahagia--;
    if (this.G.rakyat.bahagia < 50 && Math.random() < 0.3) this.G.rakyat.bahagia++;
  }

  private chainTick(): string[] {
    if (this.G.ev) return [];
    const cands = this.CHAINS.filter(
      (c) => (!this.G.chainDone[c.id] || (c.ulang && this.G.tahun - this.G.chainDone[c.id] >= c.ulang)) && (!c.when || c.when())
    );
    if (!cands.length) return [];
    const ev0 = pick(cands);
    if (Math.random() < (ev0.peluang ?? this.D.aturan_event?.peluang_berantai ?? 0.18)) {
      this.G.ev = {
        judul: ev0.title,
        teks: ev0.teks,
        pilihan: ev0.pilihan.map((x) => ({ teks: x.teks, fn: x.fn })),
        isChain: true,
      };
      this.G.chainDone[ev0.id] = this.G.tahun;
      return ['Peristiwa: ' + ev0.title];
    }
    return [];
  }

  private familyTick(): string[] {
    if (this.G.ev) return [];
    const cands = this.FAM_EVENTS.filter(
      (e) => (!this.G.chainDone[e.id] || (e.ulang && this.G.tahun - this.G.chainDone[e.id] >= e.ulang)) && e.when()
    );
    if (!cands.length) return [];
    const ev0 = pick(cands);
    if (Math.random() < (ev0.peluang ?? this.D.aturan_event?.peluang_keluarga ?? 0.15)) {
      this.G.ev = {
        judul: ev0.title,
        teks: ev0.teks,
        pilihan: ev0.pilihan.map((x) => ({ teks: x.teks, fn: x.fn })),
        isChain: true,
      };
      this.G.chainDone[ev0.id] = this.G.tahun;
      return ['Peristiwa Keluarga: ' + ev0.title];
    }
    return [];
  }

  private plagueTick(p: Character): string[] {
    const out: string[] = [];
    Object.keys(this.G.plague).forEach((tid) => {
      const pl = this.G.plague[tid];
      pl.turns++;
      const t = this.T[tid];
      if (!t) {
        delete this.G.plague[tid];
        return;
      }
      if (t.tier <= 3) this.provs(t).forEach((v) => (v.dev = Math.max(5, v.dev - 1)));
      if (t.pem === p.id) {
        this.G.rakyat.bahagia = cl(this.G.rakyat.bahagia - 1);
        p.sp.kesehatan = cl(p.sp.kesehatan - 3);
      }
      const gp = t.atas && this.T[t.atas] ? this.T[t.atas].atas : null;
      Object.values(this.T).forEach((t2) => {
        if (t2.id === tid || this.G.plague[t2.id] || t2.tier !== 3) return;
        const near = t2.atas === t.atas || (gp && t2.atas && this.T[t2.atas]?.atas === gp);
        if (near && Math.random() < 0.4) {
          this.G.plague[t2.id] = { turns: 1, sev: Math.max(10, pl.sev - 10) };
          out.push('Wabah menyebar ke ' + t2.nama);
        }
      });
      if (pl.turns >= 3 + Math.floor(pl.sev / 30)) {
        delete this.G.plague[tid];
        out.push('Wabah mereda di ' + t.nama);
      }
    });
    if (Math.random() < 0.05) {
      const cands = Object.values(this.T).filter((t) => t.tier === 3 && !this.G.plague[t.id]);
      if (cands.length) {
        const t = pick(cands);
        this.G.plague[t.id] = { turns: 1, sev: R(30, 70) };
        out.push('Wabah baru di ' + t.nama);
      }
    }
    return out;
  }

  private provEventTick(p: Character): string[] {
    const out: string[] = [];
    this.held(p.id).forEach((t) => {
      if (t.tier > 3 || Math.random() > 0.1) return;
      const pr = this.provs(t);
      if (!pr.length) return;
      const v = pick(pr);
      const roll = Math.random();
      if (roll < 0.2) {
        const d = R(1, 3);
        v.dev = Math.max(5, v.dev - d);
        out.push(`Kebakaran di ${v.nama} (dev -${d})`);
      } else if (roll < 0.35) {
        v.eko = Math.max(1, v.eko - R(1, 2));
        out.push(`Kelaparan di ${v.nama}`);
      } else if (roll < 0.55) {
        v.dev = Math.min(100, v.dev + R(1, 2));
        out.push(`Pembangunan di ${v.nama}`);
      } else if (roll < 0.7) {
        this.G.rakyat.bahagia = cl(this.G.rakyat.bahagia + 3);
        out.push(`Festival di ${v.nama}`);
      } else if (roll < 0.8 && v.b.length) {
        const lost = v.b.pop()!;
        out.push(`${this.bi(lost)?.nama || lost} hancur di ${v.nama}`);
      } else if (roll < 0.9) {
        const g = R(3, 8);
        p.res.emas += g;
        out.push(`Pajak tambahan dari ${v.nama} (+${g})`);
      } else {
        this.G.rakyat.bahagia = cl(this.G.rakyat.bahagia - 3);
        out.push(`Kerusuhan kecil di ${v.nama}`);
      }
    });
    return out;
  }

  private crusadeTick(): void {
    this.G.crusades = this.G.crusades.filter((c) => {
      c.turns++;
      if (c.turns >= 3) {
        const p = this.me();
        const mar = this.G.pen.marsekal ? this.C[this.G.pen.marsekal] : null;
        const myPower = sumObj(this.G.tr) * 2 + (mar ? mar.sk.perang * 3 : 0);
        const totalPower = myPower + c.allies.reduce((s, a) => s + a.power, 0);
        const enemy = (c.target.kekuatan * R(80, 120)) / 100;
        const win = totalPower > enemy;
        if (win) {
          this.G.log.unshift(`PERANG SALIB MENANG di ${c.target.nama}!`);
          p.res.emas += c.target.hadiah.emas;
          p.res.prestise += c.target.hadiah.prestise;
          p.res.kesalehan += c.target.hadiah.kesalehan;
          this.deed(p.id, 'wars_won', 2);
          this.dynLog(p.dinasti, `${this.full(p)} memenangkan Perang Salib ke ${c.target.nama}`);
          c.allies.forEach((a) => {
            if (this.C[a.id]) this.bump(this.C[a.id], 30);
          });
          this.G.crusadeHistory.push({ id: c.id, target: { id: c.target.id, nama: c.target.nama }, result: 'win', year: this.G.tahun });
        } else {
          this.G.log.unshift(`PERANG SALIB KALAH di ${c.target.nama}.`);
          p.res.prestise = Math.max(0, p.res.prestise - 30);
          p.res.kesalehan = Math.max(0, p.res.kesalehan - 20);
          this.deed(p.id, 'wars_lost', 1);
          this.dynLog(p.dinasti, `${this.full(p)} gagal dalam Perang Salib ke ${c.target.nama}`);
          c.allies.forEach((a) => {
            if (this.C[a.id]) this.bump(this.C[a.id], -15);
          });
          this.G.crusadeHistory.push({ id: c.id, target: { id: c.target.id, nama: c.target.nama }, result: 'lose', year: this.G.tahun });
        }
        return false;
      }
      this.G.log.unshift(`Perang Salib ke ${c.target.nama} berlangsung (tahun ${c.turns}/3)`);
      return true;
    });
  }

  private reformTick(): void {
    this.G.reformed.forEach((r) => {
      const rel = this.G.ag.find((x) => x.id === r.id);
      if (!rel) return;
      const believers = Object.values(this.C).filter((c) => c.hidup && c.agama === r.id).length;
      if (believers < 3 && Math.random() < 0.3) {
        const founder = this.C[r.founder];
        if (!founder || !founder.hidup) return;
        const cands = Object.values(this.C).filter(
          (c) => c.hidup && c.id !== r.founder && c.agama === rel.induk && Math.random() < 0.1
        );
        if (cands.length) {
          const c = pick(cands);
          c.agama = r.id;
          this.G.log.unshift(`${this.full(c)} memeluk ${rel.nama}`);
        }
      }
    });
  }

  private greatWarTick(): void {
    if (!this.G.greatWars.length) return;
    this.G.greatWars = this.G.greatWars.filter((w) => {
      w.turns++;
      const p = this.me();
      const o = this.C[w.enemy];
      if (!o || !o.hidup) {
        this.G.log.unshift('Perang Besar berakhir karena musuh wafat.');
        return false;
      }
      const roll = Math.random() + ((w.myPower - w.theirPower) / Math.max(w.myPower + w.theirPower, 1)) * 0.5;
      if (roll > 0.5) {
        const gain = R(80, 250);
        w.myPower += gain;
        w.theirPower = Math.max(0, w.theirPower - R(50, 150));
        this.G.log.unshift(`Perang Besar thn ${w.turns}/5: menang (+${gain})`);
      } else {
        const loss = R(80, 250);
        w.myPower = Math.max(0, w.myPower - loss);
        w.theirPower += R(50, 150);
        this.G.log.unshift(`Perang Besar thn ${w.turns}/5: kalah (-${loss})`);
      }
      if (w.turns >= 5 || w.myPower <= 10 || w.theirPower <= 10) {
        if (w.myPower > w.theirPower) {
          this.G.log.unshift('PERANG BESAR MENANG!');
          const t = this.T[w.tid];
          if (t) t.pem = p.id;
          p.res.prestise += 100;
          p.res.emas += 150;
          w.myAllies.forEach((id) => {
            if (this.C[id]?.hidup) {
              this.bump(this.C[id], 30);
              this.C[id].res.prestise += 20;
            }
          });
          w.theirAllies.forEach((id) => {
            if (this.C[id]?.hidup) this.bump(this.C[id], -40);
          });
          this.deed(p.id, 'wars_won', 2);
          this.dynLog(p.dinasti, `${this.full(p)} menang Perang Besar melawan ${this.full(o)}`);
          this.G.greatWarHistory.push({ target: w.tid, result: 'win', year: this.G.tahun, enemy: w.enemy });
        } else {
          this.G.log.unshift('PERANG BESAR KALAH.');
          p.res.prestise = Math.max(0, p.res.prestise - 50);
          p.res.emas *= 0.7;
          this.deed(p.id, 'wars_lost', 1);
          this.dynLog(p.dinasti, `${this.full(p)} kalah Perang Besar melawan ${this.full(o)}`);
          this.G.greatWarHistory.push({ target: w.tid, result: 'lose', year: this.G.tahun, enemy: w.enemy });
        }
        return false;
      }
      return true;
    });
  }

  private renaissanceTick(): string[] {
    if (this.G.tahun < 1400) return [];
    const p = this.me();
    const out: string[] = [];
    if (!this.G.renaissance.unlocked) {
      this.G.renaissance.unlocked = true;
      out.push('Era Renaissance dimulai! Ilmu & seni berkembang.');
      this.dynLog(p.dinasti, 'Era Renaissance dimulai di Eropa');
    }
    this.G.renaissance.points = (this.G.renaissance.points || 0) + 1;
    if (this.G.renaissance.points % 5 === 0) {
      p.sk.pembelajaran = cl(p.sk.pembelajaran + 1);
      if (Math.random() < 0.3) out.push('Pembelajaran +1 (Renaissance)');
    }
    if (Math.random() < 0.1) {
      p.res.prestise += 2;
      out.push('Seniman lokal memuji kemurahanmu. +2 prestise.');
    }
    return out;
  }

  private blackDeathTick(): string[] {
    const out: string[] = [];
    if (this.G.tahun < this.SB('pes_hitam', 'tahun_mulai', 1347)) return out;
    if (!this.G.blackDeath) {
      if (Math.random() < this.SB('pes_hitam', 'peluang_tiba', 0.3)) {
        const dur = this.SB('pes_hitam', 'durasi', [3, 6]) as [number, number];
        this.G.blackDeath = { active: true, started: this.G.tahun, duration: R(dur[0], dur[1]) };
        out.push('WABAH PES HITAM tiba di Eropa!');
        this.dynLog(this.me().dinasti, 'Wabah Pes Hitam melanda Eropa');
      }
      return out;
    }
    if (!this.G.blackDeath.active) return out;
    const turns = this.G.tahun - this.G.blackDeath.started;
    if (turns > this.G.blackDeath.duration) {
      this.G.blackDeath.active = false;
      out.push(`Pes Hitam mereda setelah ${turns} tahun.`);
      return out;
    }
    let kills = 0;
    Object.values(this.C).forEach((c) => {
      if (!c.hidup || c.id === this.G.pid) return;
      if (Math.random() < this.SB('pes_hitam', 'peluang_mati_npc', 0.25)) {
        c.hidup = false;
        c.wafat = this.G.tahun;
        kills++;
        const dy = c.dinasti ? this.DY[c.dinasti] : undefined;
        if (dy && dy.kepala === c.id) {
          const mem = Object.values(this.C)
            .filter((x) => x.hidup && x.dinasti === c.dinasti && x.id !== c.id)
            .sort((a, b) => this.tierOf(b) - this.tierOf(a) || this.umur(b) - this.umur(a));
          dy.kepala = mem[0] ? mem[0].id : null;
        }
      }
    });
    this.held(this.me().id).forEach((t) => {
      if (t.tier <= 3) {
        this.provs(t).forEach((v) => {
          const et = this.SB('pes_hitam', 'eko_turun', [1, 3]) as [number, number];
          const dt = this.SB('pes_hitam', 'dev_turun', [1, 4]) as [number, number];
          v.eko = Math.max(1, v.eko - R(et[0], et[1]));
          v.dev = Math.max(5, v.dev - R(dt[0], dt[1]));
        });
      }
    });
    this.G.rakyat.bahagia = cl(this.G.rakyat.bahagia - this.SB('pes_hitam', 'rakyat_turun', 5));
    const p = this.me();
    const st = this.SB('pes_hitam', 'sehat_turun', [2, 5]) as [number, number];
    p.sp.kesehatan = cl(p.sp.kesehatan - R(st[0], st[1]));
    out.push(`Pes Hitam tahun ${turns + 1}: ${kills} jiwa wafat`);
    return out;
  }

  private peasantRevoltTick(): string[] {
    const out: string[] = [];
    if (this.G.peasantRevolt?.active) {
      this.G.peasantRevolt.turns++;
      const maxD = this.SB('pemberontakan_petani', 'durasi_maks', 3);
      if (this.G.peasantRevolt.turns > maxD) {
        this.G.peasantRevolt.active = false;
        out.push(`Pemberontakan petani padam setelah ${maxD} tahun.`);
        return out;
      }
      out.push(`Pemberontakan petani masih berkecamuk (tahun ${this.G.peasantRevolt.turns}/${maxD})`);
      if (Math.random() < 0.4) {
        const lost = this.held(this.me().id).find((t) => t.tier <= 3);
        if (lost) {
          const v = this.provs(lost)[0];
          v.eko = Math.max(1, v.eko - 2);
        }
      }
      return out;
    }
    const badPop = this.G.rakyat.bahagia < this.SB('pemberontakan_petani', 'ambang_bahagia', 20);
    const hasPlague = this.G.blackDeath?.active;
    const highTax = (this.PJK()[this.G.paj ?? 1] || {}).mult >= 1.5;
    if (badPop && (hasPlague || highTax) && Math.random() < this.SB('pemberontakan_petani', 'peluang_muncul', 0.15)) {
      const sz = this.SB('pemberontakan_petani', 'ukuran', [200, 800]) as [number, number];
      this.G.peasantRevolt = { active: true, turns: 0, size: R(sz[0], sz[1]) };
      out.push(`PEMBERONTAKAN PETANI! ${this.G.peasantRevolt.size} petani mengangkat senjata.`);
      this.dynLog(this.me().dinasti, 'Pemberontakan petani meletus');
    }
    return out;
  }

  private protestantReformationTick(): string[] {
    if (this.G.tahun < this.SB('reformasi', 'tahun', 1517) || this.G.protestantStarted) return [];
    if (Math.random() < this.SB('reformasi', 'peluang', 0.3)) {
      this.G.protestantStarted = true;
      let convCount = 0;
      let provCount = 0;
      Object.values(this.C).forEach((c) => {
        if (!c.hidup || c.agama !== 'katolik') return;
        if (this.tierOf(c) >= 3 && Math.random() < this.SB('reformasi', 'peluang_bangsawan', 0.2)) {
          c.agama = 'protestan';
          convCount++;
        }
      });
      Object.values(this.P).forEach((arr) =>
        arr.forEach((v) => {
          if (v.agama === 'katolik' && Math.random() < this.SB('reformasi', 'peluang_provinsi', 0.25)) {
            v.agama = 'protestan';
            provCount++;
          }
        })
      );
      this.dynLog(this.me().dinasti, 'Reformasi Protestan dimulai di Eropa (1517)');
      return [`REFORMASI PROTESTAN dimulai! ${convCount} bangsawan dan ${provCount} provinsi memeluk Protestan.`];
    }
    return [];
  }

  private thirtyYearsTick(): string[] {
    if (!this.G.thirtyYearsWar) return [];
    const w = this.G.thirtyYearsWar;
    const out: string[] = [];
    w.turns++;
    const roll = Math.random() + ((w.power - w.enemy) / Math.max(w.power + w.enemy, 1)) * 0.5;
    if (roll > 0.5) {
      w.power += R(100, 300);
      w.enemy = Math.max(0, w.enemy - R(80, 200));
      out.push(`Perang 30 Tahun thn ${w.turns}/10: menang (${Math.round(w.power)} vs ${Math.round(w.enemy)})`);
    } else {
      w.power = Math.max(0, w.power - R(80, 250));
      w.enemy += R(80, 200);
      out.push(`Perang 30 Tahun thn ${w.turns}/10: kalah (${Math.round(w.power)} vs ${Math.round(w.enemy)})`);
    }
    if (w.turns >= 10 || w.power <= 10 || w.enemy <= 10) {
      const p = this.me();
      if (w.power > w.enemy) {
        out.push('PERANG 30 TAHUN MENANG! Protestan unggul di Eropa.');
        p.res.prestise += 200;
        p.res.emas += 400;
        p.res.kesalehan += 50;
        this.deed(p.id, 'wars_won', 3);
        this.dynLog(p.dinasti, 'Menang Perang 30 Tahun — Protestan menang di Eropa');
        this.G.reformed.push({ id: 'protestan', year: this.G.tahun, founder: p.id, parent: 'katolik' });
      } else {
        out.push('PERANG 30 TAHUN KALAH.');
        p.res.prestise = Math.max(0, p.res.prestise - 100);
        p.res.emas *= 0.5;
        this.deed(p.id, 'wars_lost', 2);
        this.dynLog(p.dinasti, 'Kalah Perang 30 Tahun');
      }
      this.G.thirtyYearsWar = null;
    }
    return out;
  }

  // ============ HISTORICAL WARS ============
  public hwKerajaan(c: Character): string | null {
    let t: Title | undefined = this.held(c.id).sort((a, b) => b.tier - a.tier)[0] || (c.loc ? this.T[c.loc] : undefined);
    let n = 0;
    while (t && t.tier < 6 && t.atas && n++ < 10) t = this.T[t.atas];
    return t && t.tier >= 6 ? t.id : null;
  }

  private hwPow = (c: Character, b = 0): number =>
    (c.sk.perang || 10) + 0.15 * c.res.prestise + 2 * this.held(c.id).length + b;

  private hwLead(df: AnyRule, w: AnyRule, s: string): Character | null {
    if (df.jenis !== 'perang_saudara') {
      const t = this.T[df.sisi[s].gelar];
      const c = t?.pem ? this.C[t.pem] : null;
      return c && c.hidup ? c : null;
    }
    const c = this.C[w.p[s]];
    if (c && c.hidup) return c;
    const n = c ? this.heir(c, false) : null;
    if (n && n.hidup) {
      w.p[s] = n.id;
      return n;
    }
    return null;
  }

  private hwLog(t: string): void {
    this.G.hwLog = this.G.hwLog || [];
    this.G.hwLog.unshift(t);
  }

  private hwStart(df: AnyRule, out: string[]): AnyRule | null {
    const ks = Object.keys(df.sisi);
    const w: AnyRule = { aktif: true, mulai: this.G.tahun, skor: { [ks[0]]: 0, [ks[1]]: 0 }, p: {} };
    let a: Character | null = null;
    let b: Character | null = null;
    if (df.jenis === 'perang_saudara') {
      const t = this.T[df.takhta];
      const k = t?.pem ? this.C[t.pem] : null;
      if (!k || !k.hidup) return null;
      const cands = t.kids
        .map((i) => this.T[i])
        .filter((x) => x && x.pem && this.C[x.pem]?.hidup && x.pem !== k.id)
        .map((x) => this.C[x.pem!])
        .sort((x, y) => y.res.prestise + y.sk.perang - (x.res.prestise + x.sk.perang));
      if (!cands.length) return null;
      a = k;
      b = cands[0];
      w.p[ks[0]] = a.id;
      w.p[ks[1]] = b.id;
    } else {
      a = this.hwLead(df, w, ks[0]);
      b = this.hwLead(df, w, ks[1]);
      if (!a || !b) return null;
    }
    a.op[b.id] = b.op[a.id] = -60;
    this.G.hw = this.G.hw || {};
    this.G.hw[df.id] = w;
    const txt = `${df.nama} pecah! ${df.pembukaan} (${df.sisi[ks[0]].nama}: ${this.full(a)} vs ${df.sisi[ks[1]].nama}: ${this.full(b)})`;
    out.push(txt);
    this.hwLog(`${this.G.tahun}: ${txt}`);
    if (this.me()) this.dynLog(this.me().dinasti, `${df.nama} pecah`);
    return w;
  }

  private hwEnd(df: AnyRule, w: AnyRule, out: string[]): void {
    const ks = Object.keys(df.sisi);
    const win =
      w.skor[ks[0]] > w.skor[ks[1]]
        ? ks[0]
        : w.skor[ks[0]] < w.skor[ks[1]]
          ? ks[1]
          : df.pemenang_sejarah;
    const los = ks.find((k) => k !== win)!;
    const lw = this.hwLead(df, w, win);
    const ll = this.hwLead(df, w, los);
    const hs = df.hasil || {};
    const p = this.me();
    const give = (c: Character | null, o: Record<string, number>) => {
      if (c && o) for (const [k, v] of Object.entries(o)) this.ap(c, k, v);
    };
    give(lw, hs.pemenang);
    give(ll, hs.kalah);
    if (df.jenis === 'perang_saudara' && lw) {
      const t = this.T[df.takhta];
      if (t) t.pem = lw.id;
      if (ll && ll.id !== this.G.pid && Math.random() < (df.peluang_kalah_tewas ?? 0.5)) {
        this.hwLog(`${this.G.tahun}: ${this.full(ll)} gugur setelah kekalahan.`);
        this.die(ll, this.umur(ll));
      }
    }
    if (p.tag && p.tag[df.id]) {
      const m = p.tag[df.id] === win ? 'menang' : 'kalah';
      give(p, hs.pendukung?.[m]);
      out.push(m === 'menang' ? 'Pihak yang kamu dukung menang. Kamu diganjar.' : 'Pihak yang kamu dukung kalah. Kamu dihukum.');
    }
    w.aktif = false;
    w.selesai = this.G.tahun;
    w.pemenang = win;
    const txt = (df.penutup && df.penutup[win]) || `${df.nama} berakhir.`;
    out.push(txt);
    this.hwLog(`${this.G.tahun}: ${txt}`);
    if (p) this.dynLog(p.dinasti, `${df.nama} berakhir (${df.sisi[win].nama} menang)`);
  }

  private warHistTick(): string[] {
    this.G.hw = this.G.hw || {};
    const out: string[] = [];
    (this.D.perang_sejarah || []).forEach((df: AnyRule) => {
      let w = this.G.hw![df.id];
      if (!w) {
        if (this.G.tahun < df.mulai || this.G.tahun > df.akhir) return;
        w = this.hwStart(df, out) as AnyRule;
        if (!w) return;
      }
      if (!w.aktif) return;
      const ks = Object.keys(df.sisi);
      (df.pertempuran || [])
        .filter((b: AnyRule) => b.tahun === this.G.tahun)
        .forEach((b: AnyRule) => {
          const hist = Math.random() < (df.ikut_sejarah ?? 0.7);
          const win = hist ? b.menang : ks.find((k) => k !== b.menang)!;
          w.skor[win] += b.bobot || 3;
          const t = `${b.nama}: ${hist ? b.cerita || `${df.sisi[win].nama} unggul.` : `Sejarah berbalik! ${df.sisi[win].nama} unggul.`}`;
          out.push(t);
          this.hwLog(`${this.G.tahun}: ${t}`);
          if (b.takhta && df.takhta) {
            const l = this.hwLead(df, w, win);
            const t2 = this.T[df.takhta];
            if (l && t2 && t2.pem !== l.id) {
              t2.pem = l.id;
              const m = `Takhta berpindah ke ${this.full(l)}.`;
              out.push(m);
              this.hwLog(`${this.G.tahun}: ${m}`);
            }
          }
        });
      if (Math.random() < (df.bentrok ?? 0.5)) {
        const a = this.hwLead(df, w, ks[0]);
        const b = this.hwLead(df, w, ks[1]);
        if (a && b) {
          const pa = this.hwPow(a, (df.bias || {})[ks[0]]);
          const pb = this.hwPow(b, (df.bias || {})[ks[1]]);
          const win = Math.random() < pa / (pa + pb) ? ks[0] : ks[1];
          w.skor[win] += R(1, 2);
          if (Math.random() < 0.3) {
            out.push(`Bentrokan di medan perang: ${df.sisi[win].nama} unggul.`);
          }
        }
      }
      const diff = Math.abs(w.skor[ks[0]] - w.skor[ks[1]]);
      if (this.G.tahun >= df.akhir || diff >= (df.selesai_jika_selisih || 999)) {
        this.hwEnd(df, w, out);
      }
    });
    return out;
  }

  // ============ DSL RULE ENGINE ============
  private AT_num = (n: number | [number, number]): number => (Array.isArray(n) ? R(n[0], n[1]) : n);
  private AT_sibs = (p: Character): Character[] =>
    Object.values(this.C).filter(
      (c) => c.hidup && c.id !== p.id && ((p.ibu && c.ibu === p.ibu) || (p.ayah && c.ayah === p.ayah))
    );

  public AT_get(p: Character, k: string): AnyRule {
    switch (k) {
      case 'rakyat': return this.G.rakyat.bahagia;
      case 'tier': return this.tierOf(p);
      case 'tahun': return this.G.tahun;
      case 'pasukan': return sumObj(this.G.tr);
      case 'jumlah_anak': return p.anak.length;
      case 'jumlah_saudara': return this.AT_sibs(p).length;
      case 'jumlah_saudara_bertitel': return this.AT_sibs(p).filter((c) => this.tierOf(c) >= 1).length;
      case 'jumlah_wilayah_kecil': return this.held(p.id).filter((t) => t.tier <= 3).length;
      case 'jumlah_penguasa_lain': return Object.values(this.C).filter((c) => c.hidup && this.tierOf(c) >= 3 && c.id !== p.id).length;
      case 'kerajaan_asal': return this.hwKerajaan(p);
      case 'faksi': return this.G.faction;
      case 'profesi': return p.profesi;
      case 'umur': return this.umur(p);
      case 'status_nikah': return p.sn;
      case 'pangkat_karier': {
        const J = this.jenjangOf(p);
        return J ? this.rankIdx(p, J) : 0;
      }
      case 'tahun_di_pangkat':
        return this.G.tahun - ((p[this.AT_KEY] as number | undefined) ?? p.lahir + 18);
      case 'hubungan_penguasa': {
        const t = p.loc ? this.T[p.loc] : null;
        const r = t?.pem ? this.C[t.pem] : null;
        return r ? this.opn(p, r) : 0;
      }
      case 'agama': return p.agama;
      case 'agama_keluarga': return this.AG(p.agama).keluarga;
      case 'kelas': return p.kelas;
      default:
        if (k in p.res) return (p.res as AnyRule)[k];
        if (k in p.sp) return (p.sp as AnyRule)[k];
        if (k in p.sk) return (p.sk as AnyRule)[k];
        return undefined;
    }
  }

  public AT_cek(c: AnyRule, p: Character, X: Record<string, Character | null> = {}): boolean {
    if (c == null) return true;
    if (Array.isArray(c)) return c.every((x) => this.AT_cek(x, p, X));
    if (c.atau) return c.atau.some((x: AnyRule) => this.AT_cek(x, p, X));
    if (c.tidak) return !this.AT_cek(c.tidak, p, X);
    if (c.perang) {
      const w = this.G.hw?.[c.perang];
      return Boolean(w && w.aktif);
    }
    if (c.kosong) {
      const holderId = (this.G as AnyRule)[c.kosong];
      return !(holderId && this.C[holderId]?.hidup);
    }
    if ('peluang' in c) return Math.random() < c.peluang;
    if (c.ada) return Boolean(X[c.ada]);
    const a = c.tanda ? (p.tag || {})[c.tanda] : this.AT_get(p, c.v);
    const b = c.n;
    switch (c.op || '==') {
      case '==': return a == b;
      case '!=': return a != b;
      case '<': return a < b;
      case '<=': return a <= b;
      case '>': return a > b;
      case '>=': return a >= b;
      case 'dalam': return b.includes(a);
      case 'tidak_dalam': return !b.includes(a);
      default: return false;
    }
  }

  private AT_pilih(type: string, p: Character): Character[] {
    switch (type) {
      case 'saudara': return this.AT_sibs(p);
      case 'musuh': return Object.values(this.C).filter((c) => c.hidup && c.id !== p.id && this.opn(p, c) < -30);
      case 'sekutu': return Object.values(this.C).filter((c) => c.hidup && this.tierOf(c) >= 3 && c.id !== p.id);
      case 'raja': {
        const k = this.hwKerajaan(p);
        const t = k ? this.T[k] : null;
        const c = t?.pem ? this.C[t.pem] : null;
        return c && c.hidup && c.id !== p.id ? [c] : [];
      }
      case 'uskup': return this.G.pen.uskup && this.C[this.G.pen.uskup] ? [this.C[this.G.pen.uskup]] : [];
      case 'marsekal': return this.G.pen.marsekal && this.C[this.G.pen.marsekal] ? [this.C[this.G.pen.marsekal]] : [];
      default: return [];
    }
  }

  private AT_run(list: AnyRule[], x: { p: Character; X: Record<string, Character | null>; msg: string; stop: boolean }): void {
    for (const a of list || []) {
      if (x.stop) break;
      this.AT_one(a, x);
    }
  }

  private AT_one(a: AnyRule, x: { p: Character; X: Record<string, Character | null>; msg: string; stop: boolean }): void {
    const p = x.p;
    if (a.wajib) {
      if (!this.AT_cek(a.wajib, p, x.X)) {
        x.msg = a.gagal || 'Syarat tidak terpenuhi.';
        x.stop = true;
      }
      return;
    }
    if (a.jika) {
      this.AT_run(this.AT_cek(a.jika, p, x.X) ? a.maka : a.lain, x);
      return;
    }
    if (a.pesan !== undefined) {
      x.msg = String(a.pesan).replace(/\{(\w+)\}/g, (m, k) => (x.X[k] ? this.full(x.X[k]!) : m));
      return;
    }
    if (a.ubah) {
      const v = this.AT_num(a.n);
      const t = a.pada ? x.X[a.pada] : p;
      if (!t) return;
      if (a.ubah === 'rakyat') this.G.rakyat.bahagia = cl(this.G.rakyat.bahagia + v);
      else if (a.ubah === 'pajak') this.G.paj = Math.max(0, (this.G.paj ?? 1) + v);
      else if (a.ubah in t.res) (t.res as AnyRule)[a.ubah] = Math.max(0, (t.res as AnyRule)[a.ubah] + v);
      else this.ap(t, a.ubah, v);
      return;
    }
    if (a.kurangi_pasukan) {
      const tot = sumObj(this.G.tr);
      const take = Math.min(this.AT_num(a.kurangi_pasukan), tot);
      if (!tot) return;
      for (const k of ['pedang', 'pemanah', 'kavaleri']) {
        this.G.tr[k] -= Math.min(this.G.tr[k], Math.ceil((take * this.G.tr[k]) / tot));
      }
      return;
    }
    if (a.pilih) {
      const r = this.AT_pilih(a.pilih, p).filter(Boolean);
      const t = a.urut === 'pertama' ? r[0] : r.length ? pick(r) : null;
      x.X[a.simpan || a.pilih] = t || null;
      if (!t && a.kosong) {
        x.msg = a.kosong;
        x.stop = true;
      }
      return;
    }
    if ('hubungan' in a) {
      const ts = a.pada === 'semua_saudara' ? this.AT_sibs(p) : [x.X[a.pada]].filter((y): y is Character => Boolean(y));
      ts.forEach((t) => this.bump(t, this.AT_num(a.hubungan)));
      return;
    }
    if (a.aliansi) {
      const t = x.X[a.pada];
      if (t) this.G.al.push({ id: t.id, tp: a.aliansi, y: this.G.tahun, dur: a.durasi || 10 });
      return;
    }
    if (a.beri_wilayah) {
      const s = x.X[a.beri_wilayah];
      const ts = this.held(p.id).filter((t) => t.tier <= 3);
      if (!s || !ts.length) return;
      ts[0].pem = s.id;
      this.bump(s, 40);
      x.msg = `${ts[0].nama} diberikan ke ${this.full(s)}.`;
      return;
    }
    if (a.dukung) {
      const df = (this.D.perang_sejarah || []).find((z: AnyRule) => z.id === a.dukung);
      const w = this.G.hw?.[a.dukung];
      if (!df || !w || !w.aktif) return;
      let s = a.sisi;
      if (s === 'asal') {
        const k = this.hwKerajaan(p);
        s = Object.keys(df.sisi).find((z) => df.sisi[z].gelar === k);
      } else if (s === 'tanda') {
        s = (p.tag || {})[a.dukung];
      }
      if (!s || !(s in w.skor)) return;
      w.skor[s] += this.AT_num(a.n || 1);
      p.tag = p.tag || {};
      p.tag[a.dukung] = s;
      return;
    }
    if (a.jabat) {
      (this.G as AnyRule)[a.jabat] = p.id;
      return;
    }
    if (a.mati) {
      const t = x.X[a.mati];
      if (t) {
        t.hidup = false;
        t.wafat = this.G.tahun;
      }
    }
  }

  private AT_events(list: AnyRule[]) {
    return (list || []).map((e) => ({
      id: e.id,
      title: e.judul,
      teks: e.teks,
      ulang: e.ulang,
      peluang: e.peluang,
      when: () => this.AT_cek(e.syarat, this.me()),
      pilihan: (e.pilihan || []).map((o: AnyRule) => ({
        teks: o.teks,
        fn: () => {
          const x = { p: this.me(), X: {}, msg: '', stop: false };
          this.AT_run(o.aksi, x);
          return x.msg || 'Selesai.';
        },
      })),
    }));
  }

  private AT_cev(o: AnyRule) {
    const r: typeof this.CEV = {};
    for (const [k, l] of Object.entries(o || {})) {
      r[k] = (l as AnyRule[]).map((e) => ({
        t: e.judul,
        d: e.teks,
        e: e.efek,
        c: e.syarat ? (p: Character) => this.AT_cek(e.syarat, p) : null,
      }));
    }
    return r;
  }

  // ============ PLAYER INTERACTIONS ============
  public evc(i: number): void {
    if (!this.G.ev) return;
    const o = this.G.ev.pilihan[i];
    if (!o) return;
    if (this.G.ev.isChain && o.fn) {
      const res = o.fn();
      this.G.log.push(`${this.G.ev.judul}: ${res}`);
    } else if (o.efek) {
      const p = this.me();
      for (const [k, v] of Object.entries(o.efek)) this.ap(p, k, v);
      this.G.log.push(`${this.G.ev.judul}: ${o.teks}`);
    }
    this.G.ev = null;
    sfx.playClick();
    this.save();
    this.notify();
  }

  public bump(c: Character, v: number): void {
    const p = this.me();
    const n = Math.max(-100, Math.min(100, this.opn(p, c) + v));
    c.op[p.id] = n;
    p.op[c.id] = n;
  }

  public acc(o: Character, k: string): { f: [string, number][]; t: number } {
    const p = this.me();
    const f: [string, number][] = [];
    const ad = (n: string, v: number) => f.push([n, v]);
    const ra = this.AG(p.agama);
    const rb = this.AG(o.agama);
    const cl2 = (v: number, m: number) => Math.max(-m, Math.min(m, v));

    ad('Dasar', 55);
    ad('Opini', this.opn(o, p) * 0.5);
    ad('Budaya', o.budaya === p.budaya ? 15 : -10);
    ad('Agama', p.agama === o.agama ? 20 : ra.keluarga === rb.keluarga ? -10 - (ra.sekte ? 25 : 0) : -40);
    ad('Pengaruh', ra.efek.diplomasi || 0);
    ad('Ukuran', cl2((this.tierOf(p) - this.tierOf(o)) * 10, 30));
    ad('Tentara', cl2(((this.pwr(p) - this.pwr(o)) / (this.pwr(o) + 1)) * 15, 30));
    const kan = this.G.pen.kanselir ? this.C[this.G.pen.kanselir] : null;
    ad('Kanselir', kan ? kan.sk.diplomasi / 5 : 0);
    if (k === 'nikah') {
      ad('Suksesi', !this.tierOf(o) && [o.ibu, o.ayah].some((i) => i && this.C[i] && this.tierOf(this.C[i])) ? -30 : 10);
    } else {
      ad('Kepentingan', 10);
    }
    return { f, t: f.reduce((s, x) => s + x[1], 0) };
  }

  public closeModal(): void {
    this.G.md = null;
    this.notify();
  }

  public lamar(id: string, force = false): void {
    const p = this.me();
    const o = this.C[id];
    if (!o) return;
    const pp = this.D.profesi.find((x: AnyRule) => x.id === p.profesi);
    const po = this.D.profesi.find((x: AnyRule) => x.id === o.profesi);
    if (pp && this.noMarry(pp, p)) return this.msg('Profesimu tidak boleh menikah.');
    if (po && this.noMarry(po, o)) return this.msg('Dia tidak boleh menikah.');
    if (!this.ageOK(o) || !this.ageOK(p)) return this.msg('Umur tidak memenuhi.');
    if (p.sn === 'menikah' || o.sn === 'menikah') return this.msg('Sudah menikah.');
    if (this.LAW('poligami') === 'dilarang' && [p, o].some((x) => x.sn === 'menikah')) {
      return this.msg('Poligami dilarang.');
    }
    const mahar = this.RP().mahar_emas_default || 20;
    if (p.res.emas < mahar && !force) return this.msg(`Butuh mahar ${mahar} emas.`);
    const r = this.acc(o, 'nikah');
    if (r.t >= 100 || force) {
      if (force) {
        p.res.prestise -= 15;
        o.op[p.id] = (o.op[p.id] || 0) - 40;
      }
      p.res.emas -= mahar;
      p.sn = o.sn = 'bertunangan';
      p.pasangan = id;
      o.pasangan = p.id;
      this.G.tun.push({ a: p.id, b: id, y: this.G.tahun });
      this.G.al.push({ id, tp: 'pernikahan', y: this.G.tahun, dur: 99 });
      this.G.md = null;
      return this.msg(`Pertunangan dengan ${this.full(o)} diterima! (mahar ${mahar} emas)`);
    }
    this.G.md = {
      kind: 'acc_reject',
      targetId: id,
      title: 'Pernikahan Ditolak',
      factors: r.f,
      total: r.t,
      canUltimatum: this.pwr(p) >= 1.5 * this.pwr(o),
      onForceAction: { type: 'lamar' },
    };
    this.notify();
  }

  public batalTun(id: string): void {
    const p = this.me();
    const o = this.C[id];
    if (!o || p.pasangan !== id) return;
    const d = this.RP().batal_tunangan || { denda_prestise: 15, hubungan_keluarga: -40 };
    p.res.prestise = Math.max(0, p.res.prestise - d.denda_prestise);
    p.sn = o.sn = 'lajang';
    p.pasangan = o.pasangan = null;
    this.G.tun = this.G.tun.filter((x) => x.a !== p.id && x.b !== p.id);
    [o.ibu, o.ayah].forEach((i) => {
      if (i && this.C[i]) this.C[i].op[p.id] = (this.C[i].op[p.id] || 0) - 40;
    });
    this.G.al = this.G.al.filter((a) => a.id !== id);
    this.msg(`Pertunangan dibatalkan. Prestise -${d.denda_prestise}, hubungan keluarga -40.`);
  }

  public cerai(): void {
    const p = this.me();
    const o = p.pasangan ? this.C[p.pasangan] : null;
    if (!o || p.sn !== 'menikah') return this.msg('Tidak ada pernikahan aktif.');
    const d = this.D.status_pernikahan.find((x: AnyRule) => x.id === 'bercerai');
    p.sn = o.sn = 'bercerai';
    p.pasangan = o.pasangan = null;
    p.res.prestise = Math.max(0, p.res.prestise - (d?.denda_prestise || 10));
    this.G.al = this.G.al.filter((a) => a.id !== o.id);
    this.msg(`Kamu bercerai. Prestise -${d?.denda_prestise || 10}.`);
  }

  public prop(id: string, tp: string, force = false): void {
    const p = this.me();
    const o = this.C[id];
    const x = this.D.perjanjian_aliansi.find((y: AnyRule) => y.id === tp);
    if (!o || !x) return;
    if (this.G.al.some((a) => a.id === id && a.tp === tp)) return this.msg('Perjanjian sudah ada.');
    const r = this.acc(o, tp);
    if (r.t < 100 && !force) {
      this.G.md = {
        kind: 'acc_reject',
        targetId: id,
        title: `${x.nama} Ditolak`,
        factors: r.f,
        total: r.t,
        canUltimatum: this.pwr(p) >= 1.5 * this.pwr(o),
        onForceAction: { type: 'prop', tp },
      };
      this.notify();
      return;
    }
    if (force) {
      p.res.prestise -= 15;
      o.op[p.id] = (o.op[p.id] || 0) - 40;
    } else {
      p.res.prestise -= x.biaya_prestise;
    }
    this.G.al.push({ id, tp, y: this.G.tahun, dur: x.durasi });
    if (tp === 'gereja') {
      const t = this.held(p.id).find((z) => z.tier <= 3);
      if (t) {
        const v = this.provs(t)[0];
        if (!v.b.includes('gereja')) v.b.push('gereja');
      }
      p.res.kesalehan += 10;
    }
    this.G.md = null;
    this.msg(`${x.nama} dengan ${this.full(o)} disepakati.`);
  }

  public breakAlliance(id: string, tp: string): void {
    this.G.al = this.G.al.filter((x) => !(x.id === id && x.tp === tp));
    this.me().res.prestise -= 15;
    this.msg('Perjanjian diputus.');
  }

  public executeModalUltimatum(): void {
    const md = this.G.md;
    if (!md) return;
    if (md.onForceAction.type === 'lamar') this.lamar(md.targetId, true);
    else this.prop(md.targetId, md.onForceAction.tp, true);
  }

  public war(tid: string, cb: string, force = false): void {
    const p = this.me();
    const t = this.T[tid];
    const o = t?.pem ? this.C[t.pem] : null;
    const mt = this.held(p.id).sort((a, b) => b.tier - a.tier)[0];
    if (this.G.done.perang) return this.msg('Hanya satu perang/tahun.');
    if (!mt) return this.msg('Butuh gelar untuk berperang.');
    if (!o) return this.msg('Tidak ada lawan.');
    if (this.G.al.some((a) => a.id === o.id && ['perlindungan', 'pernikahan', 'militer'].includes(a.tp))) {
      return this.msg('Terikat perjanjian.');
    }
    const tp = this.tierOf(p);
    const cap = tp ? this.tn(tp).maks_provinsi : 0;
    const cur = Object.values(this.T).filter((x) => x.tier === 3 && x.pem === p.id).length;
    if (cur >= cap) return this.msg(`Batas provinsi tercapai (${cur}/${cap}).`);

    if (cb === 'tak') {
      if (p.res.prestise < 20 && !force) return this.msg('Butuh 20 prestise.');
      p.res.prestise -= 20;
    }
    if (cb === 'klaim' && !(this.G.claims[p.id] || []).some((c) => c.id === tid)) return this.msg('Tidak ada klaim sah.');
    if (cb === 'suci') {
      if (this.AG(p.agama).keluarga === this.AG(o.agama).keluarga) return this.msg('Bukan beda agama.');
      p.res.kesalehan += 20;
    }
    if (cb === 'batal') {
      if (!this.G.tun.some((x) => x.a === o.id || x.b === o.id)) return this.msg('Tidak ada pertunangan yang dibatalkan.');
      p.res.prestise -= 10;
    }
    if (cb === 'pemberontakan' && !(t.atas && this.T[t.atas]?.pem === p.id)) return this.msg('Bukan vasalmu.');
    if (cb === 'pembebasan' && !Object.keys(this.G.jail).some((i) => this.C[i] && this.kin(this.C[i], p))) {
      return this.msg('Tidak ada kerabat ditahan.');
    }

    let ma = 1;
    this.G.al
      .filter((a) => a.tp === 'militer' && this.C[a.id]?.hidup && a.id !== o.id)
      .forEach((a) => {
        const ally = this.C[a.id];
        if (ally.res.prestise >= 0 && Math.random() < 0.7) {
          ma += (this.pwr(ally) / (this.mil(this.army(p)) + 1)) * 0.25;
        } else {
          ally.res.prestise -= 25;
          this.bump(ally, -50);
          this.G.log.push(`Sekutu ${this.full(ally)} menolak panggilan (-25 prestise mereka).`);
        }
      });

    const L: string[] = [];
    const A = this.army(p);
    let r = 1;
    if (this.massa(t) !== this.massa(mt)) {
      const need = sumObj(A);
      if (this.kap() < need * 0.3) return this.msg('Butuh kapal angkut ≥30%.');
      r = Math.min(1, this.kap() / need);
      const fl = this.tierOf(o) * 12 * (0.5 + this.hv(o.id) / 100);
      if (Math.random() > this.navy() / (this.navy() + fl)) {
        const k = this.D.kapal.find((x: AnyRule) => this.G.sh[x.id]);
        if (k) this.G.sh[k.id]--;
        this.G.done.perang = 1;
        return this.msg('Armada kalah di laut.');
      }
      L.push('Armada menang.');
    }

    const A2: Record<string, number> = {};
    for (const k in A) A2[k] = A[k] * r;
    const sp = this.G.pen.mata && this.C[this.G.pen.mata] ? this.C[this.G.pen.mata].sk.spionase / 300 : 0;
    const f = this.fight(A2, this.army(o), ma * (this.pwr(p) / (this.mil(this.army(p)) || 1)), 1 - sp);
    const lost = 1 - sumObj(f.a) / (sumObj(A2) || 1);
    for (const k in this.G.tr) this.G.tr[k] = Math.round(this.G.tr[k] * (1 - lost));

    sfx.playDrum();
    if (f.win) {
      t.pem = p.id;
      if (this.G.primary === tid) this.G.primary = null;
      p.res.prestise += 20;
      p.res.emas += o.res.emas * 0.3;
      o.res.emas *= 0.7;
      o.op[p.id] = -50;
      this.G.al = this.G.al.filter((a) => a.id !== o.id);
      this.G.morale = Math.min(100, (this.G.morale ?? 80) + 10);
      L.push(`Kamu merebut ${t.nama}!`);
      this.notifyLog(`Menaklukkan ${t.nama} dalam perang`, '⚔️');
      if (this.G.claims[p.id]) this.G.claims[p.id] = this.G.claims[p.id].filter((c) => c.id !== tid);
      if (p.dinasti && this.DY[p.dinasti]) this.DY[p.dinasti].prestise += 15;
      this.deed(p.id, 'wars_won', 1);
      this.deed(p.id, 'titles', 1);
      this.dynLog(p.dinasti, `${this.full(p)} menaklukkan ${t.nama} dalam perang`);
    } else {
      p.res.emas *= 0.7;
      p.res.prestise -= 20;
      this.G.morale = Math.max(20, (this.G.morale ?? 80) - 12);
      L.push('Kamu kalah.');
      this.deed(p.id, 'wars_lost', 1);
      this.dynLog(p.dinasti, `${this.full(p)} kalah dalam perang di ${t.nama}`);
    }

    this.G.war = { tid, turns: 0 };
    this.G.done.perang = 1;
    this.G.log = [...L, ...f.l];
    this.checkAchievements();
    this.save();
    this.home();
  }

  public siege(tid: string): void {
    const p = this.me();
    const t = this.T[tid];
    const o = t?.pem ? this.C[t.pem] : null;
    if (!o || o.id === p.id) return this.msg('Tidak ada target.');
    if (this.G.sieges[tid]) return this.msg('Sudah mengepung.');
    if (!(this.G.tr.meriam > 0) && this.lv() < 3) return this.msg('Butuh Meriam (era akhir).');
    const cost = sumObj(this.G.tr) * 0.3;
    if (p.res.emas < cost) return this.msg('Biaya logistik kurang.');
    p.res.emas -= cost;
    this.G.sieges[tid] = { turns: 0 };
    sfx.playDrum();
    this.msg(`Pengepungan ${t.nama} dimulai.`);
  }

  public greatWar(tid: string): void {
    const p = this.me();
    const t = this.T[tid];
    const o = t?.pem ? this.C[t.pem] : null;
    if (!o) return this.msg('Target tidak valid.');
    if (this.G.done.greatWar) return this.msg('Perang Besar sudah tahun ini.');
    if (this.G.greatWars.length) return this.msg('Sudah ada Perang Besar aktif.');
    const myAllies = this.G.al
      .filter((a) => a.tp === 'militer' && this.C[a.id]?.hidup && a.id !== o.id)
      .map((a) => this.C[a.id]);
    if (myAllies.length < 2) return this.msg('Butuh minimal 2 sekutu militer.');
    if (p.res.prestise < 30) return this.msg('Butuh 30 prestise.');
    if (sumObj(this.G.tr) < 100) return this.msg('Butuh 100 pasukan.');
    p.res.prestise -= 30;
    const theirAllies = Object.values(this.C)
      .filter((c) => c.hidup && c.id !== o.id && c.id !== p.id && c.op[o.id] >= 40 && this.tierOf(c) >= 3)
      .slice(0, 5);
    const myPower = sumObj(this.G.tr) + myAllies.reduce((s, a) => s + this.pwr(a), 0);
    const theirPower = this.pwr(o) + theirAllies.reduce((s, a) => s + this.pwr(a), 0);
    this.G.greatWars.push({
      tid,
      target: t.nama,
      enemy: o.id,
      myAllies: myAllies.map((a) => a.id),
      theirAllies: theirAllies.map((a) => a.id),
      myPower,
      theirPower,
      turns: 0,
    });
    this.G.done.greatWar = 1;
    this.G.log = [`PERANG BESAR dimulai! ${myAllies.length} sekutu vs ${theirAllies.length} musuh.`];
    this.dynLog(p.dinasti, `${this.full(p)} memulai Perang Besar melawan ${this.full(o)}`);
    sfx.playDrum();
    this.save();
    this.home();
  }

  public callCrusade(tid: string): void {
    const p = this.me();
    const target = this.CRUSADE_TARGETS.find((x) => x.id === tid);
    if (!target) return this.msg('Target tidak valid.');
    if (this.AG(p.agama).keluarga !== 'kristen' || p.agama !== 'katolik') {
      return this.msg('Hanya Kristen Katolik yang bisa memanggil perang salib.');
    }
    if (this.G.crusades.some((c) => c.id === tid)) return this.msg('Perang salib ke sana sudah berlangsung.');
    if (p.res.kesalehan < 50) return this.msg('Butuh 50 kesalehan.');
    if (p.res.prestise < 30) return this.msg('Butuh 30 prestise.');
    if (sumObj(this.G.tr) < 100) return this.msg('Butuh minimal 100 pasukan.');
    p.res.kesalehan -= 50;
    p.res.prestise -= 30;
    const allies: { id: string; nama: string; power: number }[] = [];
    Object.values(this.C).forEach((c) => {
      if (c.id === p.id || !c.hidup) return;
      if (this.AG(c.agama).keluarga !== 'kristen' || !this.tierOf(c) || this.pwr(c) < 100) return;
      if (Math.random() < 0.4) {
        allies.push({ id: c.id, nama: this.full(c), power: this.pwr(c) });
        c.op[p.id] = (c.op[p.id] || 0) + 10;
      }
    });
    const totalPower = sumObj(this.G.tr) + allies.reduce((s, a) => s + a.power, 0);
    this.G.crusades.push({ id: tid, target, turns: 0, allies, power: totalPower, lead: p.id });
    this.G.log = [`Perang Salib dipanggil! ${allies.length} sekutu bergabung.`];
    this.dynLog(p.dinasti, `${this.full(p)} memanggil Perang Salib ke ${target.nama}`);
    sfx.playDrum();
    this.save();
    this.home();
  }

  public contributeCrusade(tid: string): void {
    const p = this.me();
    const c = this.G.crusades.find((x) => x.id === tid);
    if (!c) return this.msg('Tidak ada perang salib.');
    if (p.res.emas < 20) return this.msg('Butuh 20 emas.');
    p.res.emas -= 20;
    c.power += R(30, 70);
    c.allies.push({ id: p.id, nama: this.full(p), power: 60, late: true });
    p.res.kesalehan += 5;
    p.res.prestise += 2;
    this.msg('Kamu mengirim bantuan. +5 kesalehan, +2 prestise.');
  }

  public quellRevolt(mode: 'force' | 'negi' | 'tax'): void {
    const p = this.me();
    const r = this.G.peasantRevolt;
    if (!r || !r.active) return this.msg('Tidak ada pemberontakan.');
    if (mode === 'force') {
      const tot = sumObj(this.G.tr);
      if (tot < r.size) return this.msg(`Pasukan tidak cukup (${tot} vs ${r.size}).`);
      const take = Math.ceil(r.size * 0.7);
      for (const k of ['pedang', 'pemanah', 'kavaleri']) {
        this.G.tr[k] -= Math.min(this.G.tr[k], Math.ceil((take * this.G.tr[k]) / tot));
      }
      r.active = false;
      this.G.rakyat.bahagia = cl(this.G.rakyat.bahagia - 10);
      p.res.prestise += 5;
      this.dynLog(p.dinasti, 'Pemberontakan petani ditumpas dengan kekerasan');
      sfx.playDrum();
      this.msg('Pemberontakan ditumpas. -10 kebahagiaan, +5 prestise.');
    } else if (mode === 'negi') {
      if (p.res.emas < 50) return this.msg('Butuh 50 emas.');
      p.res.emas -= 50;
      r.active = false;
      this.G.rakyat.bahagia = cl(this.G.rakyat.bahagia + 15);
      this.dynLog(p.dinasti, 'Pemberontakan petani diselesaikan via negosiasi');
      this.msg('Negosiasi berhasil. +15 kebahagiaan rakyat.');
    } else {
      this.G.paj = Math.max(0, (this.G.paj ?? 1) - 1);
      r.active = false;
      this.G.rakyat.bahagia = cl(this.G.rakyat.bahagia + 10);
      this.msg('Pajak diturunkan. Pemberontakan reda.');
    }
  }

  public trigger30YearsWar(): void {
    const p = this.me();
    if (p.agama !== 'protestan') return this.msg('Hanya Protestan yang bisa memicu Perang 30 Tahun.');
    if (this.G.thirtyYearsWar) return this.msg('Perang 30 Tahun sudah berlangsung.');
    if (p.res.prestise < 50) return this.msg('Butuh 50 prestise.');
    if (sumObj(this.G.tr) < 100) return this.msg('Butuh 100 pasukan.');
    p.res.prestise -= 50;
    this.G.thirtyYearsWar = { turns: 0, power: sumObj(this.G.tr) * 2, enemy: 3000 };
    this.G.log = ['PERANG 30 TAHUN dimulai! Koalisi Katolik menyerang Protestan.'];
    this.dynLog(p.dinasti, 'Memimpin Perang 30 Tahun membela Protestan');
    sfx.playDrum();
    this.save();
    this.home();
  }

  public rec(k: string): void {
    const p = this.me();
    const u = this.D.pasukan_jenis.find((x: AnyRule) => x.id === k).tingkat[this.lv() - 1];
    const eff = this.provEffects(p);
    const cost = Math.round(u.biaya_rekrut * 2 * (1 - eff.biaya_rekrut_persen / 100));
    const t = this.tierOf(p);
    const cap = t ? this.tn(t).pasukan_maks + eff.maks_pasukan : 0;
    if (!t) return this.msg('Butuh gelar.');
    if (p.res.emas < cost) return this.msg('Emas tidak cukup.');
    if (sumObj(this.G.tr) + 50 > cap) return this.msg(`Batas pasukan (${cap}).`);
    p.res.emas -= cost;
    if (this.G.faction === 'militer') {
      const refund = Math.floor(cost * 0.1);
      if (refund > 0) p.res.emas += refund;
    }
    this.G.tr[k] += 50;
    this.msg(`Merekrut 50 ${u.nama}.`);
  }

  public bd(tid: string, i: number, b: string): void {
    const p = this.me();
    const v = this.provs(this.T[tid])[i];
    const x = this.bi(b);
    const q = this.G.q.filter((y) => y.tid === tid && y.i === i).length;
    if (v.b.length + q >= this.slotProv(v)) return this.msg('Slot bangunan penuh.');
    if (x.butuh_pesisir && v.pes === false) return this.msg('Butuh pesisir.');
    if (x.butuh_bangunan && !v.b.includes(x.butuh_bangunan)) {
      return this.msg(`Butuh ${this.bi(x.butuh_bangunan).nama} dulu.`);
    }
    if (p.res.emas < x.biaya) return this.msg('Emas tidak cukup.');
    p.res.emas -= x.biaya;
    this.G.q.push({ tid, i, b, end: this.G.tahun + x.waktu_tahun });
    this.msg(`Membangun ${x.nama} di ${v.nama}.`);
  }

  public buyShip(id: string): void {
    const p = this.me();
    const k = this.D.kapal.find((x: AnyRule) => x.id === id);
    if (!this.yard()) return this.msg('Butuh Galangan Kapal.');
    if (p.res.emas < k.biaya) return this.msg('Emas kurang.');
    p.res.emas -= k.biaya;
    this.G.sh[id] = (this.G.sh[id] || 0) + 1;
    this.msg(`Membeli ${k.nama}.`);
  }

  public okB(g: AnyRule): boolean {
    const p = this.me();
    const s = g.syarat;
    return s.kuasai_wilayah.every((i: string) => this.T[i] && this.T[i].pem === p.id) && this.tierOf(p) >= (s.tier_min || 0);
  }

  public bentuk(id: string): void {
    const p = this.me();
    const g = this.D.gelar_dapat_dibentuk.find((x: AnyRule) => x.id === id);
    if (!g || !this.okB(g)) return this.msg('Syarat belum terpenuhi.');
    this.T[id] = {
      id,
      nama: g.nama,
      tier: g.tier,
      pem: p.id,
      atas: null,
      budaya: g.budaya || p.budaya,
      agama: p.agama,
      prov: null,
      kids: [],
    };
    g.syarat.kuasai_wilayah.forEach((i: string) => {
      if (this.T[i]) {
        const o = this.T[i].atas ? this.T[this.T[i].atas!] : null;
        if (o) o.kids = o.kids.filter((k) => k !== i);
        this.T[i].atas = id;
        this.T[id].kids.push(i);
      }
    });
    p.res.prestise += 50;
    this.msg(`Membentuk ${g.nama}!`);
  }

  public toggleDoctrine(id: string): void {
    this.G.sel = this.G.sel.includes(id) ? this.G.sel.filter((x) => x !== id) : [...this.G.sel, id].slice(-2);
    this.notify();
  }

  public mkSekte(nm: string): void {
    const p = this.me();
    if (p.res.kesalehan < 100 || p.res.prestise < 50 || !this.G.sel.length) {
      return this.msg('Butuh kesalehan 100, prestise 50, dan 1-2 doktrin.');
    }
    const par = this.AG(p.agama);
    const ef: Record<string, number> = {};
    const id = 'sk' + ++this.G.n;
    this.G.sel.forEach((i) => {
      const dok = this.D.aturan_agama.doktrin.find((x: AnyRule) => x.id === i);
      if (dok) {
        for (const [k, v] of Object.entries(dok.efek as Record<string, number>)) {
          ef[k] = (ef[k] || 0) + v;
        }
      }
    });
    this.G.ag.push({
      id,
      nama: nm || `Sekte ${this.G.ag.length + 1}`,
      keluarga: par.keluarga,
      induk: par.id,
      sekte: true,
      efek: ef,
    });
    p.res.kesalehan -= 100;
    p.res.prestise -= 50;
    p.agama = id;
    this.G.sel = [];
    this.msg('Mendirikan sekte baru.');
  }

  public reformSect(): void {
    const p = this.me();
    const a = this.AG(p.agama);
    if (!a.sekte) return this.msg('Kamu bukan anggota sekte.');
    if (p.res.kesalehan < 300) return this.msg('Butuh 300 kesalehan untuk reformasi.');
    if (p.res.prestise < 100) return this.msg('Butuh 100 prestise.');
    if (this.tierOf(p) < 3) return this.msg('Butuh minimal gelar Count.');
    p.res.kesalehan -= 300;
    p.res.prestise -= 100;
    const newId = 'ref_' + a.id;
    let rel = this.G.ag.find((x) => x.id === newId);
    if (!rel) {
      rel = {
        id: newId,
        nama: a.nama.replace('Sekte', 'Reformasi'),
        keluarga: a.keluarga,
        induk: a.induk,
        reformed: true,
        efek: { ...a.efek },
      };
      this.G.ag.push(rel);
    }
    p.agama = newId;
    this.G.reformed.push({ id: newId, year: this.G.tahun, founder: p.id, parent: a.id });
    let converted = 0;
    Object.values(this.C).forEach((c) => {
      if (c.id === p.id || !c.hidup || c.agama !== a.id) return;
      if (Math.random() < 0.4) {
        c.agama = newId;
        converted++;
      }
    });
    this.held(p.id).forEach((t) => {
      if (t.tier <= 3) {
        this.provs(t).forEach((v) => {
          if (Math.random() < 0.6) v.agama = newId;
        });
      }
    });
    this.dynLog(p.dinasti, `${this.full(p)} mereformasi sekte menjadi ${rel.nama}`);
    this.deed(p.id, 'charity', 5);
    this.msg(`Reformasi berhasil! ${rel.nama} lahir. ${converted} pengikut bergabung.`);
  }

  public conv(i: string): void {
    const p = this.me();
    const rel = this.AG(i);
    if (rel.reformed) {
      const isFounder = this.G.reformed.some((r) => r.id === i && r.founder === p.id);
      if (!isFounder && p.res.kesalehan < 100) return this.msg('Butuh 100 kesalehan untuk memeluk mazhab reformasi.');
      if (!isFounder) p.res.kesalehan -= 100;
    }
    if (p.res.prestise < 30) return this.msg('Butuh 30 prestise.');
    p.res.prestise -= 30;
    p.sp.kebahagiaan = cl(p.sp.kebahagiaan - 10);
    p.agama = i;
    this.msg(`Berpindah ke ${this.AG(i).nama}.`);
  }

  public alignFaksi(id: string): void {
    const p = this.me();
    if (this.G.faction === id) return this.msg('Sudah memihak faksi itu.');
    if (this.G.faction) p.res.prestise = Math.max(0, p.res.prestise - 5);
    this.G.faction = id;
    if (id === 'militer') p.sk.perang = cl(p.sk.perang + 2);
    else if (id === 'gereja') {
      p.res.kesalehan += 10;
      p.sk.diplomasi = cl(p.sk.diplomasi + 3);
    }
    this.msg(`Kamu memihak ${this.FAKSI[id]?.nama || id}.`);
  }

  public quarantine(tid: string): void {
    const p = this.me();
    if (!this.G.plague[tid]) return this.msg('Tidak ada wabah di sana.');
    if (p.res.emas < 20) return this.msg('Butuh 20 emas.');
    p.res.emas -= 20;
    delete this.G.plague[tid];
    p.res.prestise += 2;
    this.deed(p.id, 'plague_fought', 1);
    this.msg(`Wabah di ${this.T[tid] ? this.T[tid].nama : tid} dikarantina.`);
  }

  public dynFund(): void {
    const p = this.me();
    const d = p.dinasti ? this.DY[p.dinasti] : null;
    if (!d) return this.msg('Tidak ada dinasti.');
    const pct = this.RD().dana_dinasti?.iuran_persen_emas || 5;
    const amt = Math.round((p.res.emas * pct) / 100);
    if (amt <= 0) return this.msg('Emas tidak cukup.');
    p.res.emas -= amt;
    d.fund = (d.fund || 0) + amt;
    this.msg(`Iuran dinasti: ${amt} emas.`);
  }

  public dynCadet(childId?: string): void {
    const p = this.me();
    const d = p.dinasti ? this.DY[p.dinasti] : null;
    if (!d) return this.msg('Tidak ada dinasti.');
    const req = this.RD().cabang_dinasti?.syarat || { emas: 100, tier_min: 1 };
    if (this.tierOf(p) < req.tier_min) return this.msg(`Butuh tier ≥ ${req.tier_min}`);
    if (p.res.emas < req.emas) return this.msg(`Butuh ${req.emas} emas.`);
    if (!childId) {
      const cands = Object.values(this.C).filter(
        (c) => c.hidup && c.id !== p.id && c.dinasti === p.dinasti && this.umur(c) >= 16
      );
      if (!cands.length) return this.msg('Tidak ada anggota dewasa.');
      this.go('cadetPick');
      return;
    }
    const c = this.C[childId];
    if (!c || !c.hidup || c.dinasti !== p.dinasti) return this.msg('Tidak valid.');
    p.res.emas -= req.emas;
    const nm = `${d.nama.replace(/^von /, '')}-${pick(['Muda', 'Utara', 'Selatan', 'Timur', 'Barat', 'Tengah'])}`;
    const nid = 'c' + ++this.G.n;
    const newDyn: Dynasty = {
      id: nid,
      nama: 'von ' + nm,
      prestise: Math.floor((d.prestise || 0) * 0.3),
      status: d.status || 'bangsawan_lokal',
      moto: '',
      kepala: c.id,
      parent: d.id,
      warna: d.warna || '#888',
    };
    this.DY[nid] = newDyn;
    this.G.cadetBranches[d.id] = this.G.cadetBranches[d.id] || [];
    this.G.cadetBranches[d.id].push(nid);
    c.dinasti = nid;
    Object.values(this.C).forEach((x) => {
      if (x.dinasti === p.dinasti && (x.ayah === childId || x.ibu === childId)) x.dinasti = nid;
    });
    this.dynLog(d.id, `${this.full(c)} mendirikan cabang ${newDyn.nama}`);
    this.dynLog(nid, `Cabang ${newDyn.nama} didirikan oleh ${this.full(c)}`);
    this.msg(`Cabang dinasti ${newDyn.nama} didirikan.`);
  }

  public reunifyDynasty(parentId: string): void {
    const p = this.me();
    const d = this.DY[parentId];
    if (!d) return this.msg('Dinasti induk tidak ada.');
    if (p.dinasti === parentId) return this.msg('Kamu sudah di induk.');
    const oldDyn = p.dinasti ? this.DY[p.dinasti] : null;
    if (!oldDyn || oldDyn.parent !== parentId) return this.msg('Dinastimu bukan cabang dari ini.');
    if (p.res.prestise < 100) return this.msg('Butuh 100 prestise.');
    if (this.tierOf(p) < 3) return this.msg('Butuh minimal Count.');
    p.res.prestise -= 100;
    p.dinasti = parentId;
    Object.values(this.C).forEach((c) => {
      if (c.hidup && c.dinasti === oldDyn.id) c.dinasti = parentId;
    });
    this.dynLog(parentId, `Cabang ${oldDyn.nama} reunifikasi dengan ${d.nama}`);
    this.dynLog(oldDyn.id, 'Cabang reunifikasi dengan induk');
    this.msg(`Dinasti reunifikasi dengan ${d.nama}!`);
  }

  public gift(id: string): void {
    const p = this.me();
    if (p.res.emas < 20) return this.msg('Emas kurang.');
    p.res.emas -= 20;
    p.op[id] = (p.op[id] || 0) + 15;
    this.C[id].op[p.id] = p.op[id];
    this.msg('Hadiah diberikan.');
  }

  public usaha(j: string): void {
    const p = this.me();
    const x = this.D.usaha_pengusaha.jenis.find((y: AnyRule) => y.id === j);
    if (!x) return;
    if (this.G.us.length >= 4) return this.msg('Maks 4 usaha.');
    if (x.butuh_pesisir && !this.held(p.id).some((t) => t.tier <= 3 && this.provs(t).some((v) => v.pes))) {
      return this.msg('Butuh pesisir.');
    }
    if (x.butuh_kota && !this.held(p.id).some((t) => t.tier <= 3 && this.provs(t).some((v) => v.dev >= 30))) {
      return this.msg('Butuh kota (dev ≥ 30).');
    }
    if (p.res.emas < x.biaya) return this.msg('Emas kurang.');
    p.res.emas -= x.biaya;
    this.G.us.push({ j, p: x.pendapatan });
    this.msg(`Usaha dibuka: ${x.nama}`);
  }

  public turun(o: string): void {
    const p = this.me();
    const h = this.heir(p, true);
    const rule = this.RT().syarat || { umur_min: 35 };
    const exc = this.RT().pengecualian_sakit || { kesehatan_maks: 25 };
    if (!h || this.umur(h) < 16) return this.msg('Belum ada ahli waris dewasa.');
    if (this.umur(p) < rule.umur_min && p.sp.kesehatan > exc.kesehatan_maks) {
      return this.msg('Belum memenuhi syarat.');
    }
    if (this.G.war) return this.msg('Tidak bisa turun tahta saat perang.');
    this.held(p.id).forEach((t) => (t.pem = h.id));
    h.res.emas += p.res.emas * 0.5;
    p.res.emas *= 0.5;
    p.res.prestise *= 0.8;
    if (o === 'biarawan') {
      p.sn = 'selibat';
      p.res.kesalehan += 40;
    } else {
      p.sp.kebahagiaan = cl(p.sp.kebahagiaan + 15);
    }
    this.G.log = [`Turun tahta. Kini bermain sebagai ${this.full(h)}.`];
    this.G.pid = h.id;
    this.save();
    this.home();
  }

  public togglePaj(i: number): void {
    this.G.paj = i;
    this.msg(`Pajak: ${this.PJK()[i]?.nama || '?'}`);
  }

  public jobApply(rid: string, jid: string): void {
    const p = this.me();
    const r = this.C[rid];
    const j = this.D.jabatan.find((x: AnyRule) => x.id === jid);
    if (this.G.job) return this.msg('Sudah memegang jabatan.');
    if (this.tierOf(p) > 2) return this.msg('Gelarmu terlalu tinggi untuk jabatan pelayan.');
    if (p.res.prestise < 5) return this.msg('Butuh prestise 5.');
    if (this.G.done['job' + rid]) return this.msg('Sudah melamar tahun ini.');
    this.G.done['job' + rid] = 1;
    if (Math.random() < Math.min(0.9, 0.25 + (p.sk as AnyRule)[j.stat] / 160 + this.opn(r, p) / 300)) {
      this.G.job = { id: p.id, j: jid, r: rid, y: this.G.tahun };
      this.bump(r, 5);
      this.msg(`Diangkat menjadi ${j.nama}.`);
    } else {
      p.res.prestise -= 2;
      this.msg('Ditolak. Prestise -2.');
    }
  }

  public quitJob(): void {
    this.G.job = null;
    this.msg('Mengundurkan diri.');
  }

  public surat(id: string, sid: string): void {
    const p = this.me();
    const c = this.C[id];
    const s = this.SRT().find((x: AnyRule) => x.id === sid);
    if (!c || !s) return;
    const b = s.biaya || {};
    if (!c.hidup || this.G.jail[id]) return this.msg('Tidak bisa dikirim.');
    if ((b.emas || 0) > p.res.emas) return this.msg('Emas kurang.');
    if (this.G.done['s' + sid + id]) return this.msg('Sudah dikirim tahun ini.');
    this.G.done['s' + sid + id] = 1;
    p.res.emas -= b.emas || 0;
    const o = this.opn(c, p);
    if (s.op_min != null && o < s.op_min) {
      this.bump(c, -2);
      return this.msg(`${this.full(c)} menolak: hubungan kurang dekat.`);
    }
    if (s.peluang >= 1 || Math.random() < Math.min(0.95, Math.max(0.05, s.peluang + o / 250))) {
      this.bump(c, s.op || 0);
      for (const [k, v] of Object.entries((s.efek || {}) as Record<string, number>)) {
        if (k in p.sk) (p.sk as AnyRule)[k] = cl((p.sk as AnyRule)[k] + v);
        else this.ap(p, k, v);
      }
      this.msg(`Surat dibalas baik: ${this.ef2(s.efek)}`);
    } else {
      this.bump(c, -3);
      this.msg(`${this.full(c)} tidak membalas.`);
    }
  }

  public jail(id: string): void {
    const p = this.me();
    const c = this.C[id];
    if (!c) return;
    if (this.G.jail[id]) {
      delete this.G.jail[id];
      this.bump(c, 10);
      return this.msg(`${this.full(c)} dibebaskan.`);
    }
    const vas = this.held(p.id).some((x) => x.kids.some((k) => this.T[k]?.pem === id));
    if (!(this.tierOf(p) > this.tierOf(c) || vas)) return this.msg('Tidak berwenang.');
    if (p.res.prestise < 5) return this.msg('Butuh 5 prestise.');
    p.res.prestise -= 5;
    this.G.jail[id] = this.G.tahun;
    this.bump(c, -50);
    c.anak.concat(c.pasangan ? [c.pasangan] : []).forEach((i) => {
      if (this.C[i]) this.C[i].op[p.id] = (this.C[i].op[p.id] || 0) - 15;
    });
    Object.keys(this.G.pen).forEach((j) => {
      if (this.G.pen[j] === id) this.G.pen[j] = null;
    });
    this.msg(`${this.full(c)} dipenjara.`);
  }

  public givep(tid: string, id: string): void {
    const p = this.me();
    const t = this.T[tid];
    const c = this.C[id];
    if (!t || !c || !this.ageOK(c)) return this.msg('Tidak memenuhi syarat.');
    if (this.held(p.id).length < 2) return this.msg('Harus tetap pegang 1 gelar.');
    t.pem = id;
    this.bump(c, 40);
    c.kelas = 'bangsawan';
    this.msg(`${t.nama} diberikan kepada ${this.full(c)}.`);
  }

  public appoint(jid: string, id: string): void {
    const p = this.me();
    const c = this.C[id];
    const j = this.D.jabatan.find((x: AnyRule) => x.id === jid);
    if (!c || !j || !this.ageOK(c)) return this.msg('Tidak bisa menjabat.');
    if (this.opn(c, p) < -30) return this.msg(`${this.full(c)} menolak.`);
    if (this.tierOf(c) >= 3) return this.msg('Penguasa tidak mau jadi pejabat bawahan.');
    Object.keys(this.G.pen).forEach((k) => {
      if (this.G.pen[k] === id) {
        this.G.pen[k] = null;
        delete this.G.office[k];
      }
    });
    this.G.pen[jid] = id;
    this.officeEnsure(jid);
    this.G.officerHistory.push({ id, j: jid, y: this.G.tahun, type: 'appointed' });
    this.bump(c, 10);
    this.msg(`${this.full(c)} menjabat ${j.nama}.`);
  }

  public dismissAdvisor(jid: string): void {
    const oldId = this.G.pen[jid];
    if (oldId) this.G.officerHistory.push({ id: oldId, j: jid, y: this.G.tahun, type: 'dismissed' });
    this.G.pen[jid] = null;
    delete this.G.office[jid];
    this.notify();
  }

  public togFav(id: string): void {
    this.G.fav = this.G.fav.includes(id) ? this.G.fav.filter((x) => x !== id) : [...this.G.fav, id];
    this.notify();
  }

  public act(k: 'talk' | 'puji' | 'hina' | 'obat', id: string): void {
    const p = this.me();
    const c = this.C[id];
    if (!c) return;
    if (k === 'obat' && p.res.emas < 15) return this.msg('Emas kurang.');
    if (this.G.done['a' + k + id]) return this.msg('Sudah dilakukan tahun ini.');
    this.G.done['a' + k + id] = 1;
    if (k === 'talk') {
      const d = R(-2, 6) - (c.sifat.includes('pemalu') ? 2 : 0);
      this.bump(c, d);
      return this.msg(`Bicara selesai. Hubungan ${d >= 0 ? '+' : ''}${d}.`);
    }
    if (k === 'puji') {
      const d = R(5, 10) + (c.sifat.includes('sombong') ? 5 : 0);
      this.bump(c, d);
      return this.msg(`Pujian +${d}.`);
    }
    if (k === 'hina') {
      const d = R(15, 25);
      this.bump(c, -d);
      p.res.prestise -= 1;
      return this.msg(`Hinaan -${d}, prestise -1.`);
    }
    p.res.emas -= 15;
    c.sp.kesehatan = cl(c.sp.kesehatan + 15);
    this.bump(c, 5);
    return this.msg('Kesehatan +15.');
  }

  public setProf(id: string): void {
    const p = this.me();
    const f = this.D.profesi.find((x: AnyRule) => x.id === id);
    if (!f) return;
    if (p.res.emas < 10) return this.msg('Butuh 10 emas.');
    if (f.butuh_pesisir && p.loc && this.T[p.loc] && this.provs(this.T[p.loc])[0].pes === false) {
      return this.msg('Butuh pesisir.');
    }
    if (this.noMarry(f, p) && p.sn === 'menikah') return this.msg('Profesi ini tidak boleh menikah.');
    p.res.emas -= 10;
    p.profesi = id;
    for (const k in f.bonus) {
      if (k in p.sk) (p.sk as AnyRule)[k] = cl((p.sk as AnyRule)[k] + f.bonus[k]);
      else if (k in p.sp) (p.sp as AnyRule)[k] = cl((p.sp as AnyRule)[k] + f.bonus[k]);
    }
    p.rank = {};
    p.rankY = this.G.tahun;
    this.msg(`Kini bekerja sebagai ${this.PN(f, p)}.`);
  }

  public dec(id: string): void {
    const d = this.D.keputusan.find((x: AnyRule) => x.id === id);
    if (!d) return;
    const p = this.me();
    const b = d.biaya || {};
    if (this.G.done[id]) return this.msg('Sudah dijalankan tahun ini.');
    if ((b.emas || 0) > p.res.emas) return this.msg('Emas kurang.');
    const beforeP = p.res.kesalehan;
    p.res.emas -= b.emas || 0;
    this.G.done[id] = 1;
    if (id === 'pilih_gelar_utama') {
      this.go('gelar');
      return;
    }
    for (const [k, v] of Object.entries(d.efek || {})) this.ap(p, k, v);
    if (id === 'jadi_selibat' && !p.pasangan) p.sn = 'selibat';
    if (p.res.kesalehan > beforeP + 5) {
      this.deed(p.id, 'charity', Math.floor((p.res.kesalehan - beforeP) / 5));
    }
    this.G.log = [`${d.nama} dijalankan.`];
    this.save();
    this.home();
  }

  // ============ CAREER & STATUS LADDERS ============
  public ladderInfo(kind: 'rank' | 'kelas', p: Character): AnyRule | null {
    this.AT_KEY = kind === 'rank' ? 'rankY' : 'kelasY';
    let Jx: AnyRule;
    let idx: number;
    if (kind === 'rank') {
      Jx = this.jenjangOf(p);
      if (!Jx) return null;
      idx = this.rankIdx(p, Jx);
    } else {
      Jx = this.D.jenjang_status;
      if (!Jx || this.tierOf(p)) return null;
      idx = Jx.pangkat.findIndex((x: AnyRule) => x.id === p.kelas);
      if (idx < 0) return null;
    }
    return { J: Jx, idx, cur: Jx.pangkat[idx], next: Jx.pangkat[idx + 1] };
  }

  public jalurOk(j: AnyRule, p: Character): boolean {
    const b = (j.biaya && j.biaya.emas) || 0;
    return this.AT_cek(j.syarat, p, {}) && p.res.emas >= b;
  }

  public sTeks(c: AnyRule, p: Character): string {
    if (c.teks) return c.teks;
    if (c.kosong) return `Jabatan ${c.kosong} kosong`;
    if (c.atau) return c.atau.map((x: AnyRule) => this.sTeks(x, p)).join(' / ');
    if (c.tidak) return `Bukan: ${this.sTeks(c.tidak, p)}`;
    if ('peluang' in c) return 'Keberuntungan';
    const LBL: Record<string, string> = {
      prestise: 'Prestise',
      emas: 'Emas',
      kesalehan: 'Kesalehan',
      pembelajaran: 'Pembelajaran',
      umur: 'Usia',
      tahun_di_pangkat: 'Lama di pangkat (th)',
      pasukan: 'Pasukan',
      hubungan_penguasa: 'Hubungan dgn penguasa',
      perang: 'Perang',
      diplomasi: 'Diplomasi',
      administrasi: 'Administrasi',
      spionase: 'Spionase',
      pangkat_karier: 'Pangkat karier',
    };
    const k = this.AT_get(p, c.v);
    return `${LBL[c.v] || c.v} ${(c.op || '==').replace('==', '=')} ${Array.isArray(c.n) ? c.n.join('/') : c.n}${
      typeof k === 'number' ? ` (kini ${Math.round(k)})` : ''
    }`;
  }

  public naikJab(kind: 'rank' | 'kelas', i: number): void {
    const p = this.me();
    this.AT_KEY = kind === 'rank' ? 'rankY' : 'kelasY';
    const L = this.ladderInfo(kind, p);
    if (!L || !L.next) return;
    const j = L.next.jalur[i];
    if (!j || !this.jalurOk(j, p)) return this.msg('Syarat belum terpenuhi.');
    const b = (j.biaya && j.biaya.emas) || 0;
    p.res.emas -= b;
    const x = { p, X: {}, msg: '', stop: false };
    this.AT_run(j.aksi, x);
    if (kind === 'rank') {
      p.rank = p.rank || {};
      p.rank[L.J.id] = L.idx + 1;
      p.rankY = this.G.tahun;
    } else if (L.next.id !== 'bangsawan') {
      p.kelas = L.next.id;
      p.kelasY = this.G.tahun;
    }
    this.msg(`Naik menjadi ${L.next.nama}!${x.msg ? ' ' + x.msg : ''}`);
  }

  public toggleTab(): void {
    this.G.tab = 1 - this.G.tab;
    this.notify();
  }

  public setPrimaryTitle(tid: string, nama: string): void {
    this.G.primary = tid;
    this.msg(`Gelar utama: ${nama}`);
  }

  public cand(): Character[] {
    const p = this.me();
    return Object.values(this.C)
      .filter(
        (x) =>
          x.hidup &&
          x.gender !== p.gender &&
          !x.pasangan &&
          ['lajang', 'janda', 'duda', 'bercerai'].includes(x.sn) &&
          this.umur(x) >= 16 &&
          Math.abs(this.umur(x) - this.umur(p)) <= 15 &&
          !this.kin(p, x)
      )
      .sort((a, b) => Math.abs(this.tierOf(a) - this.tierOf(p)) - Math.abs(this.tierOf(b) - this.tierOf(p)))
      .slice(0, 12);
  }

  // =========================================================================
  // v14 FEATURES: Notifications, Catholic Church & Papacy, Spy, Trade, Loans,
  // Books, Expeditions, Heraldry, Disasters, Detailed Siege, Save Export/Import
  // =========================================================================
  public notifyLog(text: string, icon = '📜'): void {
    if (!this.G.notifs) this.G.notifs = [];
    if (!this.G.timeline) this.G.timeline = [];
    this.G.notifs.unshift({ y: this.G.tahun, text, icon, read: false });
    if (this.G.notifs.length > 50) this.G.notifs = this.G.notifs.slice(0, 50);
    this.G.timeline.unshift({ y: this.G.tahun, text, icon });
    if (this.G.timeline.length > 120) this.G.timeline = this.G.timeline.slice(0, 120);
  }

  public markNotifsRead(): void {
    this.G.notifs.forEach((n) => (n.read = true));
    this.notify();
  }

  public relRankOf(c: Character): string {
    if (this.G.church.pope === c.id) return 'paus';
    if (this.G.church.cardinals.includes(c.id)) return 'kardinal';
    if (this.G.church.bishops.includes(c.id)) return 'uskup';
    return this.G.relRank[c.id] || (c.profesi === 'pendeta' ? 'biarawan' : '');
  }

  public relRankDef(rankId: string) {
    return REL_RANKS.find((r) => r.id === rankId) || null;
  }

  public nextRelRank(c: Character) {
    const cur = this.relRankOf(c);
    if (!cur) return REL_RANKS[0];
    const idx = REL_RANKS.findIndex((r) => r.id === cur);
    return idx >= 0 && idx < REL_RANKS.length - 1 ? REL_RANKS[idx + 1] : null;
  }

  public canAdvanceRel(c: Character): boolean {
    if (c.agama !== 'katolik') return false;
    const nxt = this.nextRelRank(c);
    if (!nxt) return false;
    if (nxt.id === 'paus' && this.G.church.pope && this.C[this.G.church.pope]?.hidup) return false;
    return c.res.kesalehan >= nxt.minPiety;
  }

  public relIncome(c: Character): number {
    const r = this.relRankOf(c);
    if (!r) return 0;
    const def = this.relRankDef(r);
    return def?.bonus?.emas || 0;
  }

  public advanceRel(): void {
    const p = this.me();
    if (p.agama !== 'katolik') return this.msg('Karier hierarki Gereja hanya terbuka untuk umat Katolik.');
    const nxt = this.nextRelRank(p);
    if (!nxt) return this.msg('Kamu sudah mencapai puncak hierarki Gereja.');
    if (p.res.kesalehan < nxt.minPiety) return this.msg(`Butuh ${nxt.minPiety} kesalehan untuk menjadi ${nxt.nama}.`);
    if (nxt.id === 'paus') {
      if (this.G.church.pope && this.C[this.G.church.pope]?.hidup) {
        return this.msg('Takhta Paus saat ini masih diduduki. Tunggu konklaf berikutnya.');
      }
      this.G.church.pope = p.id;
      this.G.popeHistory.push({ id: p.id, y: this.G.tahun });
      this.notifyLog(`${this.full(p)} terpilih sebagai Paus Roma!`, '⛪');
    } else if (nxt.id === 'uskup' && !this.G.church.bishops.includes(p.id)) {
      this.G.church.bishops.push(p.id);
    } else if (nxt.id === 'kardinal' && !this.G.church.cardinals.includes(p.id)) {
      this.G.church.cardinals.push(p.id);
    }
    this.G.relRank[p.id] = nxt.id;
    p.res.prestise += 15;
    this.dynLog(p.dinasti, `${this.full(p)} diangkat menjadi ${nxt.nama}`);
    this.checkAchievements();
    this.msg(`Selamat! Kamu diangkat menjadi ${nxt.nama}.`);
  }

  public advanceNPCBishop(cid: string): void {
    const p = this.me();
    const c = this.C[cid];
    if (!c || !c.hidup || c.agama !== 'katolik') return this.msg('Kandidat tidak valid.');
    if (p.res.emas < 30) return this.msg('Butuh 30 emas untuk menominasikan.');
    p.res.emas -= 30;
    if (!this.G.church.bishops.includes(cid)) this.G.church.bishops.push(cid);
    this.G.relRank[cid] = 'uskup';
    this.bump(c, 25);
    p.res.kesalehan += 10;
    this.msg(`${this.full(c)} ditahbiskan sebagai Uskup atas usulanmu. (+10 kesalehan)`);
  }

  public openConclave(): void {
    const curPope = this.G.church.pope ? this.C[this.G.church.pope] : null;
    if (curPope && curPope.hidup) return this.msg('Takhta Suci belum kosong.');
    const cards = Object.values(this.C)
      .filter((c) => c.hidup && c.agama === 'katolik' && (this.G.church.cardinals.includes(c.id) || this.G.church.bishops.includes(c.id) || c.profesi === 'pendeta' || c.res.kesalehan >= 120))
      .sort((a, b) => b.res.kesalehan + b.sk.diplomasi - (a.res.kesalehan + a.sk.diplomasi));
    const winner = cards[0] || this.mkC({ nama: 'Gregorius', gender: 'L', agama: 'katolik', budaya: 'italia', lahir: this.G.tahun - 52, profesi: 'pendeta', kelas: 'rohaniwan' });
    this.G.church.pope = winner.id;
    this.G.relRank[winner.id] = 'paus';
    this.G.popeHistory.push({ id: winner.id, y: this.G.tahun });
    this.notifyLog(`Konklaf memilih ${this.full(winner)} sebagai Paus baru!`, '⛪');
    this.msg(`Konklaf selesai! Paus baru: ${this.full(winner)}.`);
  }

  public excommunicate(cid: string): void {
    const p = this.me();
    const target = this.C[cid];
    if (!target || !target.hidup) return;
    const isPope = this.G.church.pope === p.id;
    if (!isPope && p.res.kesalehan < 100) return this.msg('Butuh jabatan Paus atau 100 kesalehan untuk memohon ekskomunikasi.');
    if (!isPope) p.res.kesalehan -= 80;
    this.G.church.excom[cid] = { by: p.id, y: this.G.tahun };
    this.bump(target, -60);
    target.res.prestise = Math.max(0, target.res.prestise - 30);
    this.notifyLog(`${this.full(target)} diekskomunikasi dari Gereja!`, '🔥');
    this.msg(`${this.full(target)} resmi diekskomunikasi.`);
  }

  public liftExcom(cid: string): void {
    if (!this.G.church.excom[cid]) return;
    const p = this.me();
    if (this.G.church.pope !== p.id && cid !== p.id) return this.msg('Hanya Paus yang bisa mencabut ekskomunikasi orang lain.');
    if (cid === p.id) {
      if (p.res.emas < 60 && p.res.kesalehan < 80) return this.msg('Butuh 60 emas atau 80 kesalehan untuk tebusan dosa.');
      if (p.res.emas >= 60) p.res.emas -= 60;
      else p.res.kesalehan -= 80;
    }
    delete this.G.church.excom[cid];
    this.msg(`Ekskomunikasi atas ${this.full(this.C[cid])} dicabut.`);
  }

  public interdictKingdom(tid: string): void {
    const p = this.me();
    const t = this.T[tid];
    if (!t) return;
    if (this.G.church.pope !== p.id && p.res.kesalehan < 150) return this.msg('Butuh jabatan Paus atau 150 kesalehan.');
    if (this.G.church.pope !== p.id) p.res.kesalehan -= 120;
    this.G.church.interdict[tid] = { by: p.id, y: this.G.tahun };
    if (t.pem && this.C[t.pem]) this.bump(this.C[t.pem], -50);
    this.notifyLog(`Interdik gerejawi dijatuhkan atas ${t.nama}.`, '⛔');
    this.msg(`Interdik dijatuhkan atas ${t.nama}.`);
  }

  public setChurchDoctrine(doc: string): void {
    const p = this.me();
    if (this.G.church.pope !== p.id && !this.G.church.cardinals.includes(p.id)) {
      return this.msg('Hanya Paus atau Kardinal yang bisa menetapkan doktrin Konsili.');
    }
    this.G.church.doctrine = doc;
    p.res.prestise += 15;
    this.msg(`Konsili Gereja menetapkan doktrin: ${doc}.`);
  }

  private churchTick(): void {
    const pope = this.G.church.pope ? this.C[this.G.church.pope] : null;
    if ((!pope || !pope.hidup) && this.me().agama === 'katolik') {
      const cards = Object.values(this.C).filter((c) => c.hidup && c.agama === 'katolik' && c.profesi === 'pendeta');
      const next = cards[0] || this.mkC({ nama: 'Urbanus', gender: 'L', agama: 'katolik', budaya: 'perancis', lahir: this.G.tahun - 50, profesi: 'pendeta', kelas: 'rohaniwan' });
      this.G.church.pope = next.id;
      this.G.relRank[next.id] = 'paus';
      this.G.popeHistory.push({ id: next.id, y: this.G.tahun });
      this.G.log.unshift(`Paus baru terpilih lewat konklaf: ${this.full(next)}.`);
    }
  }

  public spyAction(type: 'intip' | 'sabotase' | 'fitnah' | 'bunuh', targetId: string): void {
    const p = this.me();
    const o = this.C[targetId];
    if (!o || !o.hidup || o.id === p.id) return this.msg('Target tidak valid.');
    if (this.G.done['spy_' + targetId]) return this.msg('Operasi intelijen ke target ini sudah berjalan tahun ini.');
    const costs: Record<string, number> = { intip: 10, sabotase: 25, fitnah: 20, bunuh: 60 };
    const cost = costs[type] || 15;
    if (p.res.emas < cost) return this.msg(`Butuh ${cost} emas.`);
    p.res.emas -= cost;
    this.G.done['spy_' + targetId] = 1;

    const spy = this.G.pen.mata ? this.C[this.G.pen.mata] : null;
    const mySkill = p.sk.spionase + (spy ? spy.sk.spionase * 0.5 * this.officeEfficiency('mata') : 0);
    const chance = Math.min(0.92, Math.max(0.12, 0.35 + (mySkill - o.sk.spionase) / 140));
    const ok = Math.random() < chance;

    if (!ok) {
      this.bump(o, -35);
      p.res.prestise = Math.max(0, p.res.prestise - 10);
      return this.msg(`Operasi rahasia terhadap ${this.full(o)} terbongkar! Hubungan memburuk.`);
    }

    if (type === 'intip') {
      const a = this.army(o);
      return this.msg(`Laporan Intel: ${this.full(o)} punya ${Math.round(o.res.emas)} emas & ${Math.round(sumObj(a))} pasukan.`);
    }
    if (type === 'sabotase') {
      o.res.emas = Math.max(0, o.res.emas * 0.75);
      return this.msg(`Sabotase berhasil! Gudang logistik ${this.full(o)} terbakar.`);
    }
    if (type === 'fitnah') {
      o.res.prestise = Math.max(0, o.res.prestise - 25);
      return this.msg(`Skandal disebarkan. Prestise ${this.full(o)} turun 25.`);
    }
    this.deed(p.id, 'kills', 1);
    this.die(o, this.umur(o));
    this.notifyLog(`${this.full(o)} wafat secara misterius.`, '🗡️');
    this.msg(`Target ${this.full(o)} berhasil dilenyapkan tanpa jejak.`);
  }

  public establishTrade(partnerId: string): void {
    const p = this.me();
    const o = this.C[partnerId];
    if (!o || !o.hidup || o.id === p.id) return this.msg('Rekan dagang tidak valid.');
    if (this.G.trade.some((x) => x.with === partnerId)) return this.msg('Rute dagang sudah aktif.');
    if (this.G.trade.length >= 5) return this.msg('Maksimal 5 rute dagang aktif.');
    if (p.res.emas < 30) return this.msg('Butuh 30 emas modal kafilah dagang.');
    p.res.emas -= 30;
    const inc = Math.max(3, Math.round(3 + (p.sk.administrasi + o.sk.administrasi) / 35 + this.tierOf(o) * 0.8));
    this.G.trade.push({ with: partnerId, income: inc, start: this.G.tahun });
    this.bump(o, 10);
    this.msg(`Rute dagang dengan ${this.full(o)} dibuka (+${inc} emas/tahun).`);
  }

  public cancelTrade(partnerId: string): void {
    this.G.trade = this.G.trade.filter((x) => x.with !== partnerId);
    this.msg('Rute dagang ditutup.');
  }

  public takeLoan(amt: number): void {
    const p = this.me();
    if (this.G.loans.length >= 3) return this.msg('Maksimal 3 pinjaman aktif.');
    const interest = Math.max(2, Math.round(amt * 0.12));
    p.res.emas += amt;
    this.G.loans.push({ amt, int: interest, y: this.G.tahun });
    this.msg(`Pinjaman ${amt} emas diterima (bunga ${interest} emas/tahun).`);
  }

  public repayLoan(idx: number): void {
    const p = this.me();
    const ln = this.G.loans[idx];
    if (!ln) return;
    if (p.res.emas < ln.amt) return this.msg(`Butuh ${ln.amt} emas untuk melunasi.`);
    p.res.emas -= ln.amt;
    this.G.loans.splice(idx, 1);
    this.msg(`Pinjaman ${ln.amt} emas lunas.`);
  }

  public convertProvince(tid: string, provIdx: number): void {
    const p = this.me();
    const t = this.T[tid];
    if (!t || t.pem !== p.id) return this.msg('Bukan wilayahmu.');
    const prov = this.provs(t)[provIdx];
    if (!prov) return;
    if (prov.agama === p.agama) return this.msg('Provinsi sudah memeluk agamamu.');
    if (p.res.kesalehan < 20 || p.res.emas < 15) return this.msg('Butuh 20 kesalehan & 15 emas untuk misionaris.');
    p.res.kesalehan -= 20;
    p.res.emas -= 15;
    prov.agama = p.agama;
    this.msg(`${prov.nama} kini menganut ${this.AG(p.agama).nama}.`);
  }

  public setHerald(heraldId: string): void {
    const p = this.me();
    const d = p.dinasti ? this.DY[p.dinasti] : null;
    if (!d) return this.msg('Tidak memiliki dinasti.');
    if (p.res.emas < 10) return this.msg('Butuh 10 emas untuk melukis lambang perisai.');
    p.res.emas -= 10;
    d.herald = heraldId;
    const h = HERALDS.find((x) => x.id === heraldId);
    this.msg(`Lambang dinasti ${d.nama} diubah menjadi ${h?.simbol || ''} ${h?.nama || heraldId}.`);
  }

  public writeBook(customTitle?: string): void {
    const p = this.me();
    if (this.G.done.book) return this.msg('Sudah menulis naskah tahun ini.');
    if (p.sk.pembelajaran < 15) return this.msg('Butuh stat Pembelajaran ≥ 15.');
    if (p.res.emas < 20) return this.msg('Butuh 20 emas untuk perkamen & tinta.');
    p.res.emas -= 20;
    this.G.done.book = 1;
    const topics = ['Tawarikh Kerajaan', 'Risalah Hukum & Takhta', 'Seni Perang Abad Pertengahan', 'Renungan Iman & Filsafat', 'Catatan Ekonomi Wilayah'];
    const title = (customTitle || '').trim() || `${pick(topics)} oleh ${p.nama}`;
    this.G.books.unshift({ title, author: this.full(p), y: this.G.tahun });
    p.res.prestise += 15;
    p.sk.pembelajaran = cl(p.sk.pembelajaran + 2);
    if (this.G.tahun >= 1400) this.G.renaissance.points += 3;
    this.notifyLog(`Kitab "${title}" rampung ditulis.`, '📖');
    this.msg(`Naskah "${title}" selesai! +15 prestise, +2 Pembelajaran.`);
  }

  public holdCourt(): void {
    const p = this.me();
    if (this.G.done.court) return this.msg('Sidang istana sudah digelar tahun ini.');
    if (p.res.emas < 15) return this.msg('Butuh 15 emas untuk jamuan & sidang.');
    p.res.emas -= 15;
    this.G.done.court = 1;
    const roll = Math.random();
    if (roll < 0.35) {
      this.G.rakyat.bahagia = cl(this.G.rakyat.bahagia + 6);
      p.res.prestise += 5;
      this.msg('Sidang istana mengabulkan petisi rakyat. +6 kebahagiaan rakyat, +5 prestise.');
    } else if (roll < 0.7) {
      p.res.emas += 25;
      this.msg('Sengketa pajak bangsawan diselesaikan: kas menerima denda +25 emas.');
    } else {
      p.res.kesalehan += 10;
      p.res.prestise += 4;
      this.msg('Utusan gereja memuji keadilanmu dalam sidang (+10 kesalehan, +4 prestise).');
    }
  }

  public patronArt(): void {
    const p = this.me();
    if (this.G.done.art) return this.msg('Sudah membiayai seniman tahun ini.');
    if (p.res.emas < 40) return this.msg('Butuh 40 emas.');
    p.res.emas -= 40;
    this.G.done.art = 1;
    p.res.prestise += 20;
    this.G.rakyat.bahagia = cl(this.G.rakyat.bahagia + 4);
    if (this.G.tahun >= 1400) this.G.renaissance.points += 5;
    this.dynLog(p.dinasti, `${this.full(p)} mensponsori karya seni & arsitektur istana`);
    this.msg('Karya seni agung diresmikan! +20 prestise, +4 kebahagiaan rakyat.');
  }

  public launchExpedition(): void {
    const p = this.me();
    if (this.G.tahun < 1400) return this.msg('Ekspedisi samudra baru terbuka mulai tahun 1400.');
    if (this.G.done.exp) return this.msg('Sudah mengirim ekspedisi tahun ini.');
    if (!this.yard() && Object.values(this.G.sh).reduce((a, b) => a + b, 0) < 1) {
      return this.msg('Butuh Galangan Kapal atau minimal 1 kapal.');
    }
    if (p.res.emas < 60) return this.msg('Butuh 60 emas untuk bekal armada.');
    p.res.emas -= 60;
    this.G.done.exp = 1;
    const ok = Math.random() < 0.62 + p.sk.pembelajaran / 250;
    if (ok) {
      const gold = R(90, 220);
      p.res.emas += gold;
      p.res.prestise += 25;
      this.G.expeditions.unshift({ y: this.G.tahun, result: 'success', gold });
      this.notifyLog(`Ekspedisi pulang membawa rempah & emas (+${gold} emas)!`, '🧭');
      this.checkAchievements();
      this.msg(`Ekspedisi sukses! Membawa pulang ${gold} emas & +25 prestise.`);
    } else {
      this.G.expeditions.unshift({ y: this.G.tahun, result: 'fail' });
      this.msg('Ekspedisi tertimpa badai di lautan lepas dan pulang dengan tangan hampa.');
    }
  }

  public startDetailedSiege(tid: string): void {
    const p = this.me();
    const t = this.T[tid];
    if (!t || t.pem === p.id) return this.msg('Target tidak valid.');
    if (this.G.siegeDetail[tid]) return this.msg('Pengepungan terperinci ke wilayah ini sudah berlangsung.');
    if (p.res.emas < 30) return this.msg('Butuh 30 emas untuk mendirikan kamp pengepungan.');
    p.res.emas -= 30;
    this.G.siegeDetail[tid] = {
      by: p.id,
      turns: 0,
      food: 100,
      walls: 100,
      siegeWeapons: (this.G.tr.meriam || 0) + 1,
    };
    sfx.playDrum();
    this.msg(`Kamp pengepungan terperinci didirikan di depan benteng ${t.nama}.`);
  }

  private siegeDetailTick(): void {
    const p = this.me();
    Object.keys(this.G.siegeDetail).forEach((tid) => {
      const sd = this.G.siegeDetail[tid];
      const t = this.T[tid];
      if (!t || t.pem === p.id) {
        delete this.G.siegeDetail[tid];
        return;
      }
      sd.turns++;
      sd.food = Math.max(0, sd.food - R(18, 32));
      sd.walls = Math.max(0, sd.walls - (10 + sd.siegeWeapons * 8));
      if (sd.food <= 0 || sd.walls <= 0) {
        t.pem = p.id;
        p.res.prestise += 20;
        this.deed(p.id, 'wars_won', 1);
        this.G.log.unshift(`Benteng ${t.nama} jatuh akibat pengepungan! Wilayah direbut.`);
        this.notifyLog(`Benteng ${t.nama} menyerah!`, '🏰');
        delete this.G.siegeDetail[tid];
      }
    });
  }

  private npcAgencyTick(): void {
    const p = this.me();
    Object.values(this.C).forEach((c) => {
      if (!c.hidup || c.id === p.id || Math.random() > 0.04) return;
      if (!c.ambisi) {
        c.ambisi = pick(['kekayaan', 'kuasa', 'kesalehan', 'keluarga']);
      }
      if (c.ambisi === 'kekayaan') c.res.emas += 5;
      if (c.ambisi === 'kesalehan') c.res.kesalehan += 4;
      if (c.ambisi === 'kuasa' && this.opn(c, p) < -50 && Math.random() < 0.15) {
        this.G.log.unshift(`Kabar istana: ${this.full(c)} diam-diam menggalang dukungan lawan politikmu.`);
      }
    });
  }

  private crimeAndWeatherTick(): string[] {
    const out: string[] = [];
    const p = this.me();
    if (Math.random() < 0.08) {
      const r = Math.random();
      if (r < 0.4) {
        this.G.crimes.bandit = (this.G.crimes.bandit || 0) + 1;
        p.res.emas = Math.max(0, p.res.emas - 8);
        out.push('Gerombolan bandit mencegat kereta pajak (-8 emas).');
      } else if (r < 0.7) {
        this.G.rakyat.bahagia = cl(this.G.rakyat.bahagia - 2);
        out.push('Musim dingin ekstrem merusak panen sebagian petani (-2 kebahagiaan).');
      } else {
        p.res.emas += 12;
        out.push('Panen gandum melimpah di lumbung istana (+12 emas).');
      }
    }
    return out;
  }

  public exportSave(): string {
    return JSON.stringify({ T: this.T, C: this.C, DY: this.DY, P: this.P, G: this.G });
  }

  public importSaveText(raw: string): boolean {
    try {
      const s = JSON.parse(raw);
      if (!s || !s.T || !s.C || !s.G) {
        this.showToast('Format JSON save tidak valid.');
        return false;
      }
      this.T = s.T;
      this.C = s.C;
      this.DY = s.DY || {};
      this.P = s.P || {};
      this.G = s.G;
      this.migrateState();
      this.save();
      this.stack = [{ view: 'main' }];
      this.notify();
      this.showToast('Save berhasil diimpor.');
      return true;
    } catch {
      this.showToast('Gagal membaca teks save.');
      return false;
    }
  }

  // =========================================================================
  // v15 FEATURES: Historical Events, Noble Council, Coups, Achievements, BG
  // =========================================================================
  public applyBackground(bgId: string): void {
    const bg = BACKGROUNDS[bgId];
    if (!bg) return;
    this.G.background = bgId;
    const p = this.me();
    if (bg.emas) p.res.emas += bg.emas;
    if (bg.prestise) p.res.prestise += bg.prestise;
    if (bg.kesalehan) p.res.kesalehan += bg.kesalehan;
    if (bg.sk) {
      for (const [k, v] of Object.entries(bg.sk)) {
        (p.sk as AnyRule)[k] = cl((p.sk as AnyRule)[k] + v);
      }
    }
    if (bg.sp) {
      for (const [k, v] of Object.entries(bg.sp)) {
        (p.sp as AnyRule)[k] = cl((p.sp as AnyRule)[k] + v);
      }
    }
  }

  private histEventTick(): void {
    if (this.G.ev) return;
    const y = this.G.tahun;
    const p = this.me();

    // 1. Hastings 1067 aftermath
    if (y === 1067 && !this.G.histDone.hastings_1067) {
      this.G.histDone.hastings_1067 = true;
      const eng = this.T['k_inggris'];
      if (eng) {
        this.G.ev = {
          judul: 'Dampak Pertempuran Hastings (1067)',
          teks: 'Penaklukan Norman atas Inggris mengguncang keseimbangan Eropa. Bagaimana sikap istanamu?',
          isChain: true,
          pilihan: [
            {
              teks: 'Akui kekuasaan Norman atas Inggris (+10 Hubungan dengan Raja Inggris, +5 Prestise)',
              fn: () => {
                p.res.prestise += 5;
                if (eng.pem && this.C[eng.pem]) this.bump(this.C[eng.pem], 10);
                return 'Istana mengirim ucapan selamat ke London.';
              },
            },
            {
              teks: 'Kirim sukarelawan ke perlawanan Anglo-Saxon (+10 Emas imbalan, +5 Perang)',
              fn: () => {
                p.res.emas += 10;
                p.sk.perang = cl(p.sk.perang + 3);
                return 'Para pejuang kembali dengan pengalaman tempur.';
              },
            },
          ],
        };
        return;
      }
    }

    // 2. Henry VIII 1509
    if (y >= 1509 && !this.G.tudorSpawned) {
      this.G.tudorSpawned = true;
      const h8 = this.mkC({
        id: 'henry8',
        nama: 'Henry VIII Tudor',
        gender: 'L',
        lahir: 1491,
        budaya: 'inggris',
        agama: 'katolik',
        kelas: 'penguasa',
      });
      if (this.T['k_inggris']) this.T['k_inggris'].pem = h8.id;
      this.notifyLog('Henry VIII naik takhta Kerajaan Inggris.', '👑');
    }

    // 3. Martin Luther 1517
    if (y >= 1517 && !this.G.lutherSpawned) {
      this.G.lutherSpawned = true;
      this.mkC({
        id: 'luther',
        nama: 'Martin Luther',
        gender: 'L',
        lahir: 1483,
        budaya: 'german',
        agama: 'protestan',
        kelas: 'rohaniwan',
        profesi: 'pendeta',
      });
      this.G.ev = {
        judul: '95 Dalil Martin Luther (1517)',
        teks: 'Di Wittenberg, biarawan Martin Luther memaku 95 Dalil menentang penjualan surat pengampunan dosa Gereja.',
        isChain: true,
        pilihan: [
          {
            teks: 'Lindungi kaum Reformis Protestan (Peluk Protestan / +15 Pembelajaran)',
            fn: () => {
              p.sk.pembelajaran = cl(p.sk.pembelajaran + 15);
              if (p.agama === 'katolik') p.agama = 'protestan';
              this.checkAchievements();
              return 'Semangat pembaruan menyebar cepat di wilayahmu.';
            },
          },
          {
            teks: 'Setia pada Roma & kecam ajaran baru (+25 Kesalehan, +10 Hubungan Paus)',
            fn: () => {
              p.res.kesalehan += 25;
              if (this.G.church.pope && this.C[this.G.church.pope]) this.bump(this.C[this.G.church.pope], 15);
              return 'Paus memuji kesetiaan istanamu.';
            },
          },
        ],
      };
      return;
    }

    // 4. Anne Boleyn & Anglican 1533
    if (y >= 1533 && !this.G.anglican && !this.G.histDone.anglican_1533) {
      this.G.histDone.anglican_1533 = true;
      this.doAnglicanReform();
    }
  }

  public doAnglicanReform(): void {
    this.G.anglican = true;
    if (!this.AG('anglikan').keluarga || this.AG('anglikan').keluarga === 'x') {
      this.G.ag.push({
        id: 'anglikan',
        nama: 'Gereja Anglikan',
        keluarga: 'kristen',
        induk: 'katolik',
        reformed: true,
        efek: { administrasi: 2, kesalehan_per_tahun: 1 },
      });
    }
    const h8 = this.C['henry8'];
    if (h8 && h8.hidup) h8.agama = 'anglikan';
    this.notifyLog('Inggris memisahkan diri dari Roma dan mendirikan Gereja Anglikan.', '⛪');
  }

  public buildCouncil(): Character[] {
    const p = this.me();
    const vasals = this.held(p.id)
      .flatMap((t) => t.kids.map((k) => this.T[k]?.pem))
      .filter((id): id is string => Boolean(id && id !== p.id && this.C[id]?.hidup))
      .map((id) => this.C[id]);
    const advisors = Object.values(this.G.pen)
      .filter((id): id is string => Boolean(id && this.C[id]?.hidup))
      .map((id) => this.C[id]);
    const uniq = Array.from(new Map([...vasals, ...advisors].map((c) => [c.id, c])).values()).slice(0, 6);
    this.G.council = uniq.map((c) => c.id);
    return uniq;
  }

  public councilPropose(type: 'pajak' | 'perang' | 'reformasi'): void {
    const p = this.me();
    const members = this.buildCouncil();
    if (!members.length) {
      this.G.councilVote = {
        type,
        passed: true,
        details: ['Tidak ada anggota dewan — usulan disahkan langsung oleh mahkota.'],
        y: this.G.tahun,
      };
      this.msg('Usulan disetujui (belum ada anggota Dewan Bangsawan).');
      return;
    }
    let yes = 0;
    const details: string[] = [];
    members.forEach((m) => {
      const score = this.opn(m, p) + p.sk.diplomasi * 0.4 + (m.sifat.includes('setia') ? 20 : 0);
      const v = score >= 15;
      if (v) yes++;
      details.push(`${this.full(m)}: ${v ? 'Setuju' : 'Menolak'}`);
    });
    const passed = yes >= Math.ceil(members.length / 2);
    this.G.councilVote = { type, passed, details, y: this.G.tahun };
    if (passed) {
      p.res.prestise += 8;
      if (type === 'pajak') p.res.emas += 30;
      if (type === 'perang') this.G.morale = Math.min(100, (this.G.morale ?? 80) + 8);
      if (type === 'reformasi') this.G.rakyat.bahagia = cl(this.G.rakyat.bahagia + 6);
    } else {
      p.res.prestise = Math.max(0, p.res.prestise - 5);
    }
    this.msg(`Pemungutan suara Dewan (${type}): ${passed ? 'LOLOS' : 'DITOLAK'} (${yes}/${members.length}).`);
  }

  private kudetaTick(): void {
    const p = this.me();
    if (this.tierOf(p) < 3 || this.G.coups.length > 0) return;
    const angryVasal = this.held(p.id)
      .flatMap((t) => t.kids.map((k) => this.T[k]?.pem))
      .map((id) => (id ? this.C[id] : null))
      .find((c): c is Character => Boolean(c && c.hidup && c.id !== p.id && this.opn(c, p) <= -65));
    if (angryVasal && Math.random() < 0.12) {
      this.G.coups.push({ rebelId: angryVasal.id, y: this.G.tahun });
      this.notifyLog(`WASPADA KUDETA! ${this.full(angryVasal)} menghimpun pasukan pemberontak!`, '🚨');
    }
  }

  public resolveKudeta(mode: 'perang' | 'damai'): void {
    const p = this.me();
    const coup = this.G.coups[0];
    if (!coup) return;
    const rebel = this.C[coup.rebelId];
    this.G.coups.shift();
    if (mode === 'damai') {
      if (p.res.emas < 50) return this.msg('Butuh 50 emas untuk menyuap & meredam konspirasi.');
      p.res.emas -= 50;
      if (rebel) this.bump(rebel, 40);
      return this.msg('Konspirasi kudeta berhasil diredam lewat konsesi emas.');
    }
    const win = !rebel || this.pwr(p) >= this.pwr(rebel) * 0.9;
    sfx.playDrum();
    if (win) {
      if (rebel) {
        this.G.jail[rebel.id] = this.G.tahun;
        rebel.op[p.id] = -90;
      }
      p.res.prestise += 20;
      this.msg(`Kudeta gagal! Pemimpin pemberontak ditangkap.`);
    } else {
      p.res.prestise = Math.max(0, p.res.prestise - 30);
      p.res.emas *= 0.6;
      this.msg('Pasukan pemberontak mendesak istana! Kas & prestise terpangkas.');
    }
  }

  public checkAchievements(): void {
    const p = this.me();
    const unlock = (id: string) => {
      if (!this.G.achievements.includes(id)) {
        this.G.achievements.push(id);
        const def = ACHIEVEMENTS.find((a) => a.id === id);
        if (def) this.notifyLog(`Pencapaian Terbuka: ${def.icon} ${def.nama}`, '🏆');
      }
    };
    const d = this.G.deeds[p.id] || {};
    if ((d.wars_won || 0) >= 1) unlock('first_win');
    if (p.res.emas >= 500) unlock('rich_500');
    const dy = p.dinasti ? this.DY[p.dinasti] : null;
    if (dy && dy.prestise >= 500) unlock('great_dynasty');
    if (this.tierOf(p) >= 6) unlock('tier_king');
    if (this.tierOf(p) >= 7) unlock('tier_emperor');
    if (this.G.crusadeHistory.some((c) => c.result === 'win')) unlock('crusader');
    if (this.umur(p) >= 70) unlock('long_reign');
    if (p.anak.length >= 5) unlock('marry_5');
    if (this.G.church.pope === p.id) unlock('pope');
    if (p.agama === 'protestan' || p.agama === 'anglikan' || this.G.reformed.length > 0) unlock('protestant');
    if (this.G.expeditions.some((e) => e.result === 'success')) unlock('expedition_win');
    if (this.G.blackDeath && !this.G.blackDeath.active) unlock('survive_plague');
  }

  public computeScore(): number {
    const p = this.me();
    const dy = p.dinasti ? this.DY[p.dinasti] : null;
    const years = Math.max(1, this.G.tahun - (this.G.startYear || this.D.meta.tahun_mulai));
    const titles = this.held(p.id).length * 40;
    const ach = this.G.achievements.length * 50;
    return Math.round(
      years * 5 + p.res.prestise + p.res.kesalehan * 0.5 + (dy?.prestise || 0) * 0.5 + titles + ach
    );
  }

  // =========================================================================
  // v16 FEATURES: Commoner Marriage, Rejection Boost, Tutors, Orders, Market,
  // Morale & Travel
  // =========================================================================
  public boostRej(mode: 'gift' | 'prestige' | 'army'): void {
    const md = this.G.md;
    if (!md) return;
    const p = this.me();
    const o = this.C[md.targetId];
    if (!o) return;
    if (mode === 'gift') {
      if (p.res.emas < 50) return this.showToast('Butuh 50 emas untuk hadiah lamaran.');
      p.res.emas -= 50;
      this.bump(o, 25);
    } else if (mode === 'prestige') {
      if (p.res.prestise < 20) return this.showToast('Butuh 20 prestise.');
      p.res.prestise -= 20;
      this.bump(o, 20);
    } else if (mode === 'army') {
      p.res.emas = Math.max(0, p.res.emas - 20);
      this.bump(o, 15);
    }
    const r = this.acc(o, md.onForceAction.type === 'lamar' ? 'nikah' : md.onForceAction.tp);
    if (r.t >= 100) {
      if (md.onForceAction.type === 'lamar') this.lamar(o.id, false);
      else this.prop(o.id, md.onForceAction.tp, false);
    } else {
      this.G.md = {
        ...md,
        factors: r.f,
        total: r.t,
      };
      this.notify();
    }
  }

  public makeCommoner(locId?: string): Character {
    const p = this.me();
    const g: 'L' | 'P' = p.gender === 'L' ? 'P' : 'L';
    const loc = locId || p.loc || this.held(p.id)[0]?.id;
    const t = loc ? this.T[loc] : null;
    return this.mkC({
      gender: g,
      lahir: this.G.tahun - R(18, 28),
      budaya: t?.budaya || p.budaya,
      agama: p.agama,
      kelas: 'rakyat_jelata',
      loc,
      op: { [p.id]: 35 },
    });
  }

  public marryCommoner(id: string): void {
    const p = this.me();
    const o = this.C[id];
    if (!o || !o.hidup) return;
    const pp = this.D.profesi.find((x: AnyRule) => x.id === p.profesi);
    if (pp && this.noMarry(pp, p)) return this.msg('Profesimu tidak boleh menikah.');
    if (p.sn === 'menikah') return this.msg('Sudah menikah.');
    p.sn = o.sn = 'menikah';
    p.pasangan = o.id;
    o.pasangan = p.id;
    o.dinasti = p.dinasti;
    p.res.prestise = Math.max(0, p.res.prestise - 5);
    p.sp.kebahagiaan = cl(p.sp.kebahagiaan + 15);
    this.msg(`Menikah dengan ${this.full(o)} dari kalangan rakyat jelata! (+15 Kebahagiaan, -5 Prestise)`);
  }

  public educateChild(childId: string, tutorId: string): void {
    const p = this.me();
    const child = this.C[childId];
    const tutor = TUTORS[tutorId];
    if (!child || !tutor) return;
    if (this.umur(child) >= 16) return this.msg('Anak sudah dewasa (≥ 16 tahun).');
    if (this.G.done['edu_' + childId]) return this.msg('Anak sudah dilatih tahun ini.');
    if (p.res.emas < tutor.biaya) return this.msg(`Butuh ${tutor.biaya} emas.`);
    p.res.emas -= tutor.biaya;
    this.G.done['edu_' + childId] = 1;
    (child.sk as AnyRule)[tutor.stat] = cl((child.sk as AnyRule)[tutor.stat] + tutor.gain);
    this.G.childTutor[childId] = (this.G.childTutor[childId] || 0) + 1;
    this.msg(`${child.nama} belajar bersama ${tutor.nama}: ${tutor.stat} +${tutor.gain}.`);
  }

  public joinOrder(orderId: string): void {
    const p = this.me();
    const ord = ORDERS[orderId];
    if (!ord) return;
    if (this.G.orders[orderId]) return this.msg('Kamu sudah tergabung di ordo ini.');
    if (p.res.emas < ord.biaya) return this.msg(`Butuh ${ord.biaya} emas untuk iuran masuk.`);
    if (p.res.prestise < ord.prestiseMin) return this.msg(`Butuh ${ord.prestiseMin} prestise.`);
    p.res.emas -= ord.biaya;
    this.G.orders[orderId] = this.G.tahun;
    if (orderId === 'templar') p.sp.duel = cl(p.sp.duel + 5);
    if (orderId === 'hospitaller') p.sp.kesehatan = cl(p.sp.kesehatan + 5);
    if (orderId === 'teutonik') p.sk.perang = cl(p.sk.perang + 2);
    if (orderId === 'st_george') {
      this.G.morale = Math.min(100, (this.G.morale ?? 80) + 5);
      p.sp.duel = cl(p.sp.duel + 3);
    }
    this.notifyLog(`Bergabung dengan ${ord.nama}.`, '🛡️');
    this.msg(`Kamu resmi dilantik ke dalam ${ord.nama}!`);
  }

  private ordersTick(): void {
    const p = this.me();
    if (this.G.orders.templar) p.res.prestise += 2;
    if (this.G.orders.hospitaller) p.res.kesalehan += 2;
    if (this.G.orders.teutonik) p.res.prestise += 1;
  }

  private priceTick(): void {
    const base: Record<keyof GameState['prices'], number> = { grain: 2, iron: 5, cloth: 4, spice: 10 };
    (Object.keys(base) as (keyof GameState['prices'])[]).forEach((k) => {
      let val = this.G.prices[k] * (1 + (Math.random() - 0.5) * 0.25);
      if (k === 'iron' && (this.G.war || this.G.greatWars.length > 0)) val *= 1.1;
      if (k === 'grain' && this.G.blackDeath?.active) val *= 1.15;
      const minP = base[k] * 0.5;
      const maxP = base[k] * 2;
      this.G.prices[k] = Math.round(Math.max(minP, Math.min(maxP, val)) * 10) / 10;
    });
  }

  public sellGrain(units = 10): void {
    const p = this.me();
    if (this.G.done.sellGrain) return this.msg('Sudah berdagang gandum di pasar tahun ini.');
    const count = this.held(p.id).filter((t) => t.tier <= 3).length;
    if (count < 1) return this.msg('Butuh minimal 1 wilayah penghasil hasil bumi.');
    this.G.done.sellGrain = 1;
    const rev = Math.round(units * this.G.prices.grain * count);
    p.res.emas += rev;
    this.msg(`Menjual hasil bumi di pasar seharga ${rev} emas (kurs ${this.G.prices.grain}/karung).`);
  }

  private moraleTick(): void {
    if (this.G.morale === undefined) this.G.morale = 80;
    if (!this.G.war && this.G.morale < 80) this.G.morale = Math.min(80, this.G.morale + 3);
    if (this.G.rakyat.bahagia < 30) this.G.morale = Math.max(20, this.G.morale - 3);
  }

  public titleDistance(fromId: string | undefined, toId: string): number {
    if (!fromId || fromId === toId) return 1;
    const a = this.T[fromId];
    const b = this.T[toId];
    if (!a || !b) return 2;
    if (a.atas && a.atas === b.atas) return 1;
    const ga = a.atas && this.T[a.atas] ? this.T[a.atas].atas : null;
    const gb = b.atas && this.T[b.atas] ? this.T[b.atas].atas : null;
    if (ga && ga === gb) return 2;
    return 3;
  }

  public travelTo(tid: string): void {
    const p = this.me();
    const t = this.T[tid];
    if (!t) return this.msg('Tujuan tidak valid.');
    if (this.G.travel) return this.msg('Kamu masih berada di tengah perjalanan.');
    if (p.res.emas < 15) return this.msg('Butuh 15 emas untuk bekal perjalanan.');
    p.res.emas -= 15;
    const fromId = this.held(p.id)[0]?.id || p.loc;
    const dist = this.titleDistance(fromId, tid);
    this.G.travel = { to: tid, years: dist, risk: dist * 10, start: this.G.tahun };
    this.msg(`Rombongan berangkat menuju ${t.nama} (perkiraan ${dist} tahun).`);
  }

  private travelTick(): void {
    const tr = this.G.travel;
    if (!tr) return;
    tr.years--;
    const p = this.me();
    const dest = this.T[tr.to];
    if (Math.random() < 0.25) {
      const r = Math.random();
      if (r < 0.45) {
        p.res.emas = Math.max(0, p.res.emas - 10);
        this.G.log.unshift('Di perjalanan: bandit menghadang kafilah (-10 emas).');
      } else {
        p.sk.diplomasi = cl(p.sk.diplomasi + 2);
        this.G.log.unshift('Di perjalanan: bertemu sarjana pengelana (+2 Diplomasi).');
      }
    }
    if (tr.years <= 0) {
      p.loc = tr.to;
      p.res.prestise += 10;
      if (dest?.pem && this.C[dest.pem]) this.bump(this.C[dest.pem], 15);
      this.G.travel = null;
      this.notifyLog(`Tiba di ${dest?.nama || tr.to}!`, '🐎');
      this.G.log.unshift(`Tiba selamat di ${dest?.nama || tr.to}! (+10 Prestise)`);
    }
  }

  // =========================================================================
  // v18 PART 1 & 3: Detailed Bureaucracy, War Logistics Campaigns, Family SVG
  // =========================================================================
  public officeEnsure(jid: string) {
    if (!this.G.office[jid]) {
      this.G.office[jid] = {
        quality: R(35, 85),
        loyalty: R(45, 90),
        corruption: R(0, 35),
        trait: pick([...OFFICE_TRAITS]),
        since: this.G.tahun,
      };
    }
    return this.G.office[jid];
  }

  public officeQualityName(q: number): string {
    if (q >= 85) return 'Brilian';
    if (q >= 65) return 'Kompeten';
    if (q >= 45) return 'Cukup';
    return 'Lemah';
  }

  public officeLoyaltyName(l: number): string {
    if (l >= 80) return 'Sangat Setia';
    if (l >= 55) return 'Setia';
    if (l >= 35) return 'Ragu';
    return 'Membangkang';
  }

  public officeEfficiency(jid: string): number {
    const od = this.G.office[jid];
    if (!od) return 1;
    let m = 0.65 + od.quality / 140;
    if (od.trait === 'jenius') m += 0.25;
    if (od.trait === 'malas') m -= 0.2;
    if (od.trait === 'korup') m -= 0.1;
    return Math.max(0.4, Math.min(1.5, m));
  }

  private officeCorruptionTick(): void {
    const p = this.me();
    Object.keys(this.G.pen).forEach((jid) => {
      const cid = this.G.pen[jid];
      if (!cid || !this.C[cid]?.hidup) return;
      const od = this.officeEnsure(jid);
      const stealChance = (od.corruption + (od.trait === 'korup' ? 20 : 0) - (od.trait === 'jujur' ? 25 : 0)) / 200;
      if (Math.random() < stealChance) {
        const stolen = R(3, 12);
        p.res.emas = Math.max(0, p.res.emas - stolen);
        this.G.officerHistory.push({ id: cid, j: jid, y: this.G.tahun, type: 'corruption', stolen });
        this.G.log.unshift(`Audit kas: ditemukan kebocoran anggaran ${stolen} emas di pos ${jid}.`);
      }
    });
  }

  public officePromote(jid: string): void {
    const p = this.me();
    const cid = this.G.pen[jid];
    if (!cid) return this.msg('Pos ini kosong.');
    if (p.res.emas < 50) return this.msg('Butuh 50 emas untuk penghargaan pejabat.');
    p.res.emas -= 50;
    const od = this.officeEnsure(jid);
    od.quality = Math.min(100, od.quality + 12);
    od.loyalty = Math.min(100, od.loyalty + 15);
    this.bump(this.C[cid], 15);
    this.msg(`Pejabat dipromosikan! Kualitas & loyalitas meningkat.`);
  }

  public officeInvestigate(jid: string): void {
    const p = this.me();
    const cid = this.G.pen[jid];
    if (!cid) return this.msg('Pos ini kosong.');
    if (p.res.emas < 30) return this.msg('Butuh 30 emas biaya penyelidikan.');
    p.res.emas -= 30;
    const od = this.officeEnsure(jid);
    if (od.corruption >= 25 || od.trait === 'korup') {
      const recovered = Math.round(od.corruption * 0.8);
      p.res.emas += recovered;
      od.corruption = Math.max(0, od.corruption - 20);
      this.bump(this.C[cid], -20);
      this.msg(`Penyelidikan menemukan penyelewengan! Disita kembali ${recovered} emas.`);
    } else {
      od.loyalty = Math.max(0, od.loyalty - 5);
      this.msg('Tidak ditemukan bukti korupsi yang berarti.');
    }
  }

  public supplyTick(): void {
    const p = this.me();
    const troops = sumObj(this.G.tr);
    if (!this.G.logistics) this.G.logistics = { supply: 100, morale: 85, forage: 0 };
    if (troops <= 0) {
      this.G.logistics.supply = 100;
      return;
    }
    if (this.G.warCampaign) {
      const drain = Math.max(5, Math.round(troops / 45));
      this.G.logistics.supply = Math.max(0, this.G.logistics.supply - drain);
      if (this.G.logistics.supply < 20) {
        const lossPct = 0.08;
        for (const k of Object.keys(this.G.tr)) {
          this.G.tr[k] = Math.max(0, Math.round(this.G.tr[k] * (1 - lossPct)));
        }
        this.G.morale = Math.max(20, (this.G.morale ?? 80) - 8);
        this.G.log.unshift(`Logistik menipis (${this.G.logistics.supply}%)! Pasukan mengalami desersi.`);
      }
    } else {
      this.G.logistics.supply = Math.min(100, this.G.logistics.supply + 15);
    }
    void p;
  }

  public forageAction(): void {
    if (this.G.done.forage) return this.msg('Sudah menjarah suplai tahun ini.');
    this.G.done.forage = 1;
    const gain = R(15, 30);
    this.G.logistics.supply = Math.min(100, this.G.logistics.supply + gain);
    this.G.rakyat.bahagia = cl(this.G.rakyat.bahagia - 4);
    this.msg(`Pasukan mengumpulkan bahan pangan (+${gain}% suplai, -4 kebahagiaan rakyat).`);
  }

  public supplyAction(): void {
    const p = this.me();
    if (p.res.emas < 25) return this.msg('Butuh 25 emas untuk kereta perbekalan.');
    p.res.emas -= 25;
    this.G.logistics.supply = Math.min(100, this.G.logistics.supply + 35);
    this.msg('Konvoi perbekalan tiba (+35% suplai pasukan).');
  }

  public campaignStart(tid: string): void {
    const p = this.me();
    const t = this.T[tid];
    const o = t?.pem ? this.C[t.pem] : null;
    if (!t || !o || o.id === p.id) return this.msg('Target kampanye tidak valid.');
    if (this.G.warCampaign) return this.msg('Kampanye militer masih berjalan.');
    if (sumObj(this.G.tr) < 50) return this.msg('Butuh minimal 50 pasukan untuk memulai kampanye.');
    const fromId = this.held(p.id)[0]?.id || p.loc;
    const dist = this.titleDistance(fromId, tid);
    this.G.warCampaign = { tid, distance: dist, turns: 0, start: this.G.tahun, enemy: o.id };
    sfx.playDrum();
    this.notifyLog(`Kampanye militer menuju ${t.nama} diberangkatkan.`, '⚔️');
    this.msg(`Ekspedisi militer menuju ${t.nama} dimulai (jarak ${dist} tahun).`);
  }

  private campaignTick(): void {
    const wc = this.G.warCampaign;
    if (!wc) return;
    wc.turns++;
    if (wc.turns >= wc.distance) {
      const tid = wc.tid;
      this.G.warCampaign = null;
      this.G.done.perang = 0;
      this.war(tid, 'tak', true);
    } else {
      this.G.log.unshift(`Kampanye militer menuju ${this.T[wc.tid]?.nama || wc.tid}: perjalanan tahun ${wc.turns}/${wc.distance}.`);
    }
  }

  public buildFamilyTree(focusId?: string, depth = 3) {
    const rootId = focusId || this.G.familyFocus || this.G.pid;
    const focus = this.C[rootId] || this.me();
    if (!focus) return { nodes: [], edges: [] };

    const showSpouses = this.G.familyView?.showSpouses ?? true;
    const showDead = this.G.familyView?.showDead ?? false;

    const nodesMap = new Map<string, { id: string; char: Character; gen: number; role: string }>();
    const edges: { from: string; to: string; kind: 'parent' | 'spouse' }[] = [];

    const addNode = (c: Character | undefined, gen: number, role: string) => {
      if (!c) return;
      if (!showDead && !c.hidup && c.id !== focus.id) return;
      if (!nodesMap.has(c.id)) nodesMap.set(c.id, { id: c.id, char: c, gen, role });
    };

    addNode(focus, 0, 'Fokus');

    // Walk ancestors up to depth
    let frontier: { c: Character; gen: number }[] = [{ c: focus, gen: 0 }];
    for (let d = 1; d <= Math.min(2, depth); d++) {
      const next: { c: Character; gen: number }[] = [];
      frontier.forEach(({ c, gen }) => {
        if (c.ayah && this.C[c.ayah]) {
          addNode(this.C[c.ayah], gen - 1, 'Leluhur');
          if (nodesMap.has(c.ayah)) {
            edges.push({ from: c.ayah, to: c.id, kind: 'parent' });
            next.push({ c: this.C[c.ayah], gen: gen - 1 });
          }
        }
        if (c.ibu && this.C[c.ibu]) {
          addNode(this.C[c.ibu], gen - 1, 'Leluhur');
          if (nodesMap.has(c.ibu)) {
            edges.push({ from: c.ibu, to: c.id, kind: 'parent' });
            next.push({ c: this.C[c.ibu], gen: gen - 1 });
          }
        }
      });
      frontier = next;
    }

    // Siblings
    this.AT_sibs(focus).forEach((s) => {
      addNode(s, 0, 'Saudara');
      if (nodesMap.has(s.id) && s.ayah && nodesMap.has(s.ayah)) {
        edges.push({ from: s.ayah, to: s.id, kind: 'parent' });
      }
    });

    // Descendants up to depth
    let downFrontier: { c: Character; gen: number }[] = [{ c: focus, gen: 0 }];
    for (let d = 1; d <= depth; d++) {
      const next: { c: Character; gen: number }[] = [];
      downFrontier.forEach(({ c, gen }) => {
        c.anak.forEach((kidId) => {
          const kid = this.C[kidId];
          if (!kid) return;
          addNode(kid, gen + 1, gen === 0 ? 'Anak' : 'Cucu/Keturunan');
          if (nodesMap.has(kid.id)) {
            edges.push({ from: c.id, to: kid.id, kind: 'parent' });
            next.push({ c: kid, gen: gen + 1 });
          }
        });
      });
      downFrontier = next;
    }

    // Spouses
    if (showSpouses) {
      Array.from(nodesMap.values()).forEach((n) => {
        const spId = n.char.pasangan;
        if (spId && this.C[spId] && !nodesMap.has(spId)) {
          addNode(this.C[spId], n.gen, 'Pasangan');
          if (nodesMap.has(spId)) {
            edges.push({ from: n.id, to: spId, kind: 'spouse' });
          }
        }
      });
    }

    return { nodes: Array.from(nodesMap.values()), edges };
  }
}

export const engine = new GameEngine();
