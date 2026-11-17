export interface StatPribadi {
  kebahagiaan: number;
  kesehatan: number;
  penampilan: number;
  kesuburan: number;
  duel: number;
}

export interface StatKerajaan {
  diplomasi: number;
  spionase: number;
  perang: number;
  administrasi: number;
  pembelajaran: number;
}

export interface Resources {
  prestise: number;
  emas: number;
  kesalehan: number;
}

export interface Character {
  id: string;
  nama: string;
  gender: 'L' | 'P';
  lahir: number;
  wafat?: number;
  budaya: string;
  agama: string;
  sifat: string[];
  sn: string;
  pasangan: string | null;
  anak: string[];
  ibu: string | null;
  ayah: string | null;
  hidup: boolean;
  dinasti: string | null;
  kelas: string;
  profesi: string | null;
  gp?: string;
  loc?: string;
  op: Record<string, number>;
  items: string[];
  sp: StatPribadi;
  sk: StatKerajaan;
  res: Resources;
  pas?: number;
  claims?: unknown[];
  titles?: string[];
  rank?: Record<string, number>;
  rankY?: number;
  kelasY?: number;
  tag?: Record<string, string>;
  ambisi?: string | null;
}

export interface Title {
  id: string;
  nama: string;
  tier: number;
  pem: string | null;
  atas: string | null;
  budaya: string;
  agama: string;
  prov: string[] | null;
  kids: string[];
  _dy?: string;
}

export interface Dynasty {
  id: string;
  nama: string;
  budaya?: string;
  prestise: number;
  status: string;
  status_tier?: number;
  moto?: string;
  kepala: string | null;
  warna?: string;
  herald?: string;
  fund?: number;
  parent?: string;
  gen?: boolean;
  fam14?: number;
}

export interface Province {
  nama: string;
  dev: number;
  eko: number;
  b: string[];
  pes: boolean;
  agama: string;
  agamaP?: string;
  culture: string;
}

export interface Betrothal {
  a: string;
  b: string;
  y: number;
}

export interface BuildingQueueItem {
  tid: string;
  i: number;
  b: string;
  end: number;
}

export interface Alliance {
  id: string;
  tp: string;
  y: number;
  dur?: number;
}

export interface ReligionDef {
  id: string;
  nama: string;
  keluarga: string;
  efek: Record<string, number>;
  pemimpin?: string;
  tersedia_dari?: number;
  induk?: string;
  sekte?: boolean;
  reformed?: boolean;
}

export interface ActiveEventChoice {
  teks: string;
  efek?: Record<string, number>;
  fn?: () => string;
}

export interface ActiveEvent {
  judul: string;
  teks: string;
  pilihan: ActiveEventChoice[];
  isChain?: boolean;
}

export interface DiplomacyModal {
  kind: 'acc_reject';
  targetId: string;
  title: string;
  factors: [string, number][];
  total: number;
  canUltimatum: boolean;
  onForceAction: { type: 'lamar' } | { type: 'prop'; tp: string };
}

export interface OfficeDetail {
  quality: number;
  loyalty: number;
  corruption: number;
  trait: string;
  since: number;
}

export interface GameState {
  tahun: number;
  startYear: number;
  n: number;
  pid: string;
  log: string[];
  tr: Record<string, number>;
  tun: Betrothal[];
  was: {
    heir?: string | null;
    gereja?: boolean;
    allowTiri?: boolean;
    perWilayah?: Record<string, string>;
    wali?: string | null;
  };
  us: { j: string; p: number }[];
  q: BuildingQueueItem[];
  tab: number;
  done: Record<string, number>;
  ev: ActiveEvent | null;
  kpt: number;
  pen: Record<string, string | null>;
  al: Alliance[];
  ag: ReligionDef[];
  sh: Record<string, number>;
  sel: string[];
  md: DiplomacyModal | null;
  f: string;
  fav: string[];
  jail: Record<string, number>;
  paj: number;
  primary: string | null;
  claims: Record<string, { id: string; nama: string; kendali: number }[]>;
  sieges: Record<string, { turns: number }>;
  war: { tid: string; turns: number } | null;
  modern: string[];
  divorce: unknown[];
  widows: Record<string, string[]>;
  job?: { id: string; j: string; r: string; y: number } | null;
  over?: number;
  rakyat: { bahagia: number };
  rumorLog: string[];
  plague: Record<string, { turns: number; sev: number }>;
  chainDone: Record<string, number>;
  faction: string | null;
  factionRep: Record<string, unknown> & {
    militer: number;
    gereja: number;
    _nextGen?: Record<string, { faction: string; rep: number }>;
  };
  deeds: Record<string, Record<string, number>>;
  dynHist: Record<string, { y: number; text: string }[]>;
  rulers: Record<string, { id: string; nama: string; julukan: string; dari: number; sampai: number; sebab: string }[]>;
  _v8seed?: boolean;
  regency: { player: string; regent: string | null; until: number } | null;
  crusades: {
    id: string;
    target: { id: string; nama: string; kekuatan: number; hadiah: { emas: number; prestise: number; kesalehan: number } };
    turns: number;
    allies: { id: string; nama: string; power: number; late?: boolean }[];
    power: number;
    lead: string;
  }[];
  crusadeHistory: {
    id: string;
    target: { id: string; nama: string };
    result: 'win' | 'lose';
    year: number;
  }[];
  reformed: { id: string; year: number; founder: string; parent: string }[];
  treeExpand: Record<string, boolean>;
  treeDepth: number;
  treeUp: number;
  greatWars: {
    tid: string;
    target: string;
    enemy: string;
    myAllies: string[];
    theirAllies: string[];
    myPower: number;
    theirPower: number;
    turns: number;
  }[];
  greatWarHistory: { target: string; result: 'win' | 'lose'; year: number; enemy: string }[];
  cadetBranches: Record<string, string[]>;
  renaissance: { unlocked: boolean; points: number };
  blackDeath: { active: boolean; started: number; duration: number } | null;
  peasantRevolt: { active: boolean; turns: number; size: number } | null;
  protestantStarted: boolean;
  thirtyYearsWar: { turns: number; power: number; enemy: number } | null;
  fam14?: number;
  genWorld?: boolean;
  hw?: Record<string, { aktif: boolean; mulai: number; selesai?: number; pemenang?: string; skor: Record<string, number>; p: Record<string, string> }>;
  hwLog?: string[];
  paus?: string;

  // v14 additions (Church, Spy, Trade, Loans, Books, Notifs, Expeditions, Detailed Siege)
  relRank: Record<string, string>;
  church: {
    pope: string | null;
    cardinals: string[];
    bishops: string[];
    saints: string[];
    doctrine: string;
    excom: Record<string, { by: string; y: number }>;
    interdict: Record<string, { by: string; y: number }>;
    antiPope: string | null;
  };
  notifs: { y: number; text: string; icon: string; read: boolean }[];
  timeline: { y: number; text: string; icon: string }[];
  trade: { with: string; income: number; start: number }[];
  loans: { amt: number; int: number; y: number }[];
  books: { title: string; author: string; y: number }[];
  crimes: Record<string, number>;
  popeHistory: { id: string; y: number }[];
  expeditions: { y: number; result: 'success' | 'fail'; gold?: number }[];
  siegeDetail: Record<string, { by: string; turns: number; food: number; walls: number; siegeWeapons: number }>;
  spyAct?: string | null;

  // v15 additions (Historical Events, Noble Council, Coups, Achievements, Background)
  histDone: Record<string, boolean>;
  background: string;
  council: string[];
  councilVote: { type: string; passed: boolean; details: string[]; y: number } | null;
  achievements: string[];
  anglican: boolean;
  tudorSpawned: boolean;
  anneSpawned: boolean;
  lutherSpawned: boolean;
  coups: { rebelId: string; y: number }[];

  // v16 additions (Market Prices, Tutors, Orders, Morale, Travel)
  prices: { grain: number; iron: number; cloth: number; spice: number };
  orders: Record<string, number>;
  morale: number;
  travel: { to: string; years: number; risk: number; start: number } | null;
  childTutor: Record<string, number>;

  // v18 additions (Bureaucracy Detail, Logistics Campaign, Family Tree View)
  office: Record<string, OfficeDetail>;
  officerHistory: { id: string; j: string; y: number; type: string; stolen?: number }[];
  logistics: { supply: number; morale: number; forage: number };
  warCampaign: { tid: string; distance: number; turns: number; start: number; enemy: string } | null;
  familyView: { depth: number; showSpouses: boolean; showDead: boolean; centered: string };
  familyFocus: string;
}

export interface RouteEntry {
  view: string;
  arg?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GameData = Record<string, any>;
