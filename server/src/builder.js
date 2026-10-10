// Plan -> 3B blok matrisi. Model koordinat yazmaz; "curve", "ellipsoid", "cone_3d",
// "membrane", "terrain", "gable_roof", "mirror" gibi mimari ve heykeltiras komutlari verir.
// Ayrintilari (merdiven yonu, cati simetrisi, cit baglantilari, kapi yarilari, 3B egriler,
// agirlikli palet dagilimlari) bu dosyadaki deterministik kod hesaplar.
import { isKnownBlock, fallbackBlock, stairToFull } from './blocks.js';
import { MAX_DIM } from './validate.js';

export class BuildError extends Error {}

const LIM = { coord: 400, opVolume: 2_000_000, blocks: 1_000_000, ops: 1200, radius: 200 };
const DIR = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0] };
const AIR = null;
const AXIS_RE = /(_log|_wood|_stem|_hyphae)$|^minecraft:(hay_block|bone_block|basalt|polished_basalt|smooth_basalt|quartz_pillar|purpur_pillar|bamboo_block|stripped_bamboo_block|chain)$/;
const SOLID_RE = /(planks|_log$|_wood$|stone|brick|cobble|concrete$|terracotta$|^minecraft:glass$|stained_glass$|sandstone|deepslate|andesite|diorite|granite|wool$|quartz_block|quartz_pillar|blackstone|prismarine|purpur_block|dirt|grass_block|sand$|gravel|clay|copper_block|cut_copper$|tuff|basalt|netherrack|obsidian|bookshelf|crafting_table|furnace|barrel|hay_block|bone_block|iron_block|gold_block|packed_mud|_stem$|_hyphae$|smooth_)/;
const NOT_SOLID_RE = /(stairs|slab|_wall$|fence|pane|bars|door|trapdoor|pressure_plate|button|sign|carpet|lantern|torch|campfire|chain|ladder|vine|leaves)/;
const isSolid = (n) => SOLID_RE.test(n) && !NOT_SOLID_RE.test(n);

// ---------- yardimcilar ----------
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sort2 = (a, b) => (a <= b ? [a, b] : [b, a]);
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function parseProps(s) {
  const o = {};
  if (!s) return o;
  for (const kv of s.split(',')) {
    const [k, v] = kv.split('=');
    if (k && v !== undefined) o[k.trim()] = v.trim();
  }
  return o;
}

export const formatBlock = ({ name, props }) => {
  const keys = Object.keys(props).sort();
  return keys.length ? `${name}[${keys.map((k) => `${k}=${props[k]}`).join(',')}]` : name;
};
const withProps = (s, extra) => (s ? { name: s.name, props: { ...s.props, ...extra } } : s);

function int(p, k, { optional = false, def } = {}) {
  const v = p[k];
  if (v === undefined || v === null) {
    if (optional) return def;
    throw new BuildError(`'${k}' is required`);
  }
  const n = Number(v);
  if (!Number.isFinite(n)) throw new BuildError(`'${k}' must be a number`);
  const r = Math.round(n);
  if (Math.abs(r) > LIM.coord) throw new BuildError(`'${k}'=${r} is out of range (+-${LIM.coord})`);
  return r;
}

function num(p, k, { optional = false, def } = {}) {
  const v = p[k];
  if (v === undefined || v === null) {
    if (optional) return def;
    throw new BuildError(`'${k}' is required`);
  }
  const n = Number(v);
  if (!Number.isFinite(n)) throw new BuildError(`'${k}' must be a number`);
  return n;
}

function box(p, w) {
  let x1 = p.x1, x2 = p.x2, y1 = p.y1, y2 = p.y2, z1 = p.z1, z2 = p.z2;
  // Eger koordinat verilmemisse dunyanin mevcut sinirlarini kullan
  if (x1 === undefined && w) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const k of w.cells.keys()) {
      const [x, y, z] = k.split(',').map(Number);
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
      if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
    }
    if (minX === Infinity) return { x1: 0, x2: 0, y1: 0, y2: 0, z1: 0, z2: 0 };
    return { x1: minX, x2: maxX, y1: minY, y2: maxY, z1: minZ, z2: maxZ };
  }
  const [rx1, rx2] = sort2(int(p, 'x1'), int(p, 'x2'));
  const [ry1, ry2] = sort2(int(p, 'y1'), int(p, 'y2'));
  const [rz1, rz2] = sort2(int(p, 'z1'), int(p, 'z2'));
  if ((rx2 - rx1 + 1) * (ry2 - ry1 + 1) * (rz2 - rz1 + 1) > LIM.opVolume) {
    throw new BuildError('box is too large for one op');
  }
  return { x1: rx1, y1: ry1, z1: rz1, x2: rx2, y2: ry2, z2: rz2 };
}

function dirOf(v, label = 'facing') {
  if (!DIR[v]) throw new BuildError(`'${label}' must be north, south, east or west`);
  return DIR[v];
}

const need = (spec, suffix, label) => {
  if (!spec || !spec.name.endsWith(suffix)) throw new BuildError(`'${label}' must be a *${suffix} block`);
  return spec;
};

// 2D Noise & FBM (Arazi ve organik dagilimlar icin)
function valueNoise2D(x, z, seed = 0) {
  const X = Math.floor(x), Z = Math.floor(z);
  const fx = x - X, fz = z - Z;
  const u = fx * fx * (3 - 2 * fx);
  const v = fz * fz * (3 - 2 * fz);
  const h = (ix, iz) => {
    let n = Math.imul(ix, 374761393) ^ Math.imul(iz, 668265263) ^ Math.imul(seed, 1013904223);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  };
  const d00 = h(X, Z), d10 = h(X + 1, Z), d01 = h(X, Z + 1), d11 = h(X + 1, Z + 1);
  return (d00 * (1 - u) + d10 * u) * (1 - v) + (d01 * (1 - u) + d11 * u) * v;
}

function fbm2D(x, z, octaves = 3, seed = 0) {
  let val = 0, amp = 0.5, freq = 1, sumAmp = 0;
  for (let i = 0; i < octaves; i++) {
    val += amp * valueNoise2D(x * freq, z * freq, seed + i * 17);
    sumAmp += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return val / sumAmp;
}

class World {
  constructor(seed) {
    this.cells = new Map();
    this.protectedBlocks = new Set();
    this.seed = seed;
    this.rand = mulberry32(seed);
  }
  put(x, y, z, spec, isProtected = false) {
    const k = `${x},${y},${z}`;
    if (spec === AIR) {
      this.cells.delete(k);
      this.protectedBlocks.delete(k);
      return;
    }
    if (!this.cells.has(k) && this.cells.size >= LIM.blocks) {
      throw new BuildError('block limit exceeded');
    }
    this.cells.set(k, { name: spec.name, props: { ...spec.props } });
    if (isProtected) this.protectedBlocks.add(k);
  }
  get(x, y, z) {
    return this.cells.get(`${x},${y},${z}`);
  }
}

// Tekil blok kimligini cozer
function resolveSingleBlock(raw, ctx) {
  if (typeof raw !== 'string' || !raw.trim()) throw new BuildError("'block' is required");
  const id = String(ctx.aliases[raw] ?? raw).trim().toLowerCase().replace(/\s+/g, '');
  const m = id.match(/^((?:minecraft:)?[a-z0-9_]+)(?:\[([^\]]*)\])?$/);
  if (!m) throw new BuildError(`invalid block id: ${raw}`);
  let name = m[1].startsWith('minecraft:') ? m[1] : `minecraft:${m[1]}`;
  if (['minecraft:air', 'minecraft:cave_air', 'minecraft:void_air'].includes(name)) return AIR;
  let props = parseProps(m[2]);
  if (!isKnownBlock(name)) {
    const fb = fallbackBlock(name);
    ctx.warn(`unknown block ${name} was replaced by ${fb}; use only ids from the catalog`, false);
    name = fb;
    props = {};
  }
  if (/_leaves$/.test(name) && !props.persistent) props.persistent = 'true';
  return { name, props };
}

// Blok / Doku Paleti / Gradyan / Agirlikli Doku Cozucu
// Ornek: "60%blue_concrete,30%blue_terracotta,10%white_concrete"
// Veya: { gradient: ["blackstone", "deepslate", "cobbled_deepslate"], axis: "y", min: 0, max: 20 }
function resolveBlock(raw, ctx, x = 0, y = 0, z = 0) {
  if (raw === undefined || raw === null) throw new BuildError("'block' is required");

  // Alias lookup
  if (typeof raw === 'string' && ctx.aliases[raw] !== undefined) {
    raw = ctx.aliases[raw];
  }

  // Gradyan destegi
  if (typeof raw === 'object' && raw !== null && Array.isArray(raw.gradient)) {
    const stops = raw.gradient;
    if (stops.length === 0) return AIR;
    const axisVal = raw.axis === 'x' ? x : raw.axis === 'z' ? z : y;
    const minVal = raw.min ?? 0, maxVal = raw.max ?? 30;
    const t = Math.max(0, Math.min(1, (axisVal - minVal) / Math.max(1, maxVal - minVal)));
    const idx = Math.min(stops.length - 1, Math.floor(t * stops.length));
    return resolveSingleBlock(stops[idx], ctx);
  }

  // Agirlikli veya virgul ile ayrilmis desen (WorldEdit blend / pattern)
  if (typeof raw === 'string' && (raw.includes('%') || (raw.includes(',') && !raw.includes('[')))) {
    const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
    const parsed = [];
    let totalWeight = 0;
    for (const part of parts) {
      const match = part.match(/^(\d+(?:\.\d+)?)%\s*(.+)$/);
      if (match) {
        const weight = parseFloat(match[1]);
        parsed.push({ block: match[2], weight });
        totalWeight += weight;
      } else {
        parsed.push({ block: part, weight: 1 });
        totalWeight += 1;
      }
    }
    const h = (hash(`${x},${y},${z}`) ^ ctx.seed) >>> 0;
    let roll = ((h % 10000) / 10000) * totalWeight;
    for (const item of parsed) {
      roll -= item.weight;
      if (roll <= 0) return resolveSingleBlock(item.block, ctx);
    }
    return resolveSingleBlock(parsed[parsed.length - 1].block, ctx);
  }

  // Dizi olarak liste
  if (Array.isArray(raw)) {
    if (raw.length === 0) return AIR;
    const h = (hash(`${x},${y},${z}`) ^ ctx.seed) >>> 0;
    const item = raw[h % raw.length];
    return resolveSingleBlock(typeof item === 'object' && item.block ? item.block : item, ctx);
  }

  return resolveSingleBlock(raw, ctx);
}

const withAxis = (s, axis) => (s && AXIS_RE.test(s.name) && !s.props.axis ? withProps(s, { axis }) : s);

function mirrorSpec(spec, axis) {
  const props = { ...spec.props };
  const flip = axis === 'x' ? { east: 'west', west: 'east' } : { north: 'south', south: 'north' };
  if (props.facing && flip[props.facing]) props.facing = flip[props.facing];
  const swap = (v) => v.replace(/left$/, '#').replace(/right$/, 'left').replace(/#$/, 'right');
  if (props.shape) props.shape = swap(props.shape);
  if (props.hinge) props.hinge = swap(props.hinge);
  if (props.type === 'left' || props.type === 'right') props.type = swap(props.type);
  return { name: spec.name, props };
}

// 3B cizgi parcasi uzaklik formulu (Tapered cylinder / cone_3d icin)
function distPointToSegment(px, py, pz, x1, y1, z1, x2, y2, z2) {
  const dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
  const l2 = dx * dx + dy * dy + dz * dz;
  if (l2 === 0) return { d2: (px - x1) ** 2 + (py - y1) ** 2 + (pz - z1) ** 2, t: 0 };
  let t = ((px - x1) * dx + (py - y1) * dy + (pz - z1) * dz) / l2;
  t = Math.max(0, Math.min(1, t));
  const cx = x1 + t * dx, cy = y1 + t * dy, cz = z1 + t * dz;
  const d2 = (px - cx) ** 2 + (py - cy) ** 2 + (pz - cz) ** 2;
  return { d2, t };
}

// Catmull-Rom spline interpolasyonu
function catmullRomPoint(points, t) {
  const numSections = points.length - 1;
  const p = t * numSections;
  const sec = Math.min(Math.floor(p), numSections - 1);
  const weight = p - sec;
  const p0 = points[Math.max(0, sec - 1)];
  const p1 = points[sec];
  const p2 = points[Math.min(points.length - 1, sec + 1)];
  const p3 = points[Math.min(points.length - 1, sec + 2)];
  const w2 = weight * weight, w3 = w2 * weight;
  return [
    0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * weight + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * w2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * w3),
    0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * weight + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * w2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * w3),
    0.5 * (2 * p1[2] + (-p0[2] + p2[2]) * weight + (2 * p0[2] - 5 * p1[2] + 4 * p2[2] - p3[2]) * w2 + (-p0[2] + 3 * p1[2] - 3 * p2[2] + p3[2]) * w3),
  ];
}

// 3B Ucgen Vokselleme (Kanat zarlari, yelkenler, bayraklar icin)
function rasterizeTriangle(A, B, C, thickness = 1) {
  const v0 = [B[0] - A[0], B[1] - A[1], B[2] - A[2]];
  const v1 = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
  const N = [
    v0[1] * v1[2] - v0[2] * v1[1],
    v0[2] * v1[0] - v0[0] * v1[2],
    v0[0] * v1[1] - v0[1] * v1[0],
  ];
  const lenN = Math.hypot(...N);
  if (lenN === 0) return [];
  const n = [N[0] / lenN, N[1] / lenN, N[2] / lenN];

  const d00 = v0[0] * v0[0] + v0[1] * v0[1] + v0[2] * v0[2];
  const d01 = v0[0] * v1[0] + v0[1] * v1[1] + v0[2] * v1[2];
  const d11 = v1[0] * v1[0] + v1[1] * v1[1] + v1[2] * v1[2];
  const denom = d00 * d11 - d01 * d01;
  if (denom === 0) return [];

  const minX = Math.floor(Math.min(A[0], B[0], C[0]) - thickness);
  const maxX = Math.ceil(Math.max(A[0], B[0], C[0]) + thickness);
  const minY = Math.floor(Math.min(A[1], B[1], C[1]) - thickness);
  const maxY = Math.ceil(Math.max(A[1], B[1], C[1]) + thickness);
  const minZ = Math.floor(Math.min(A[2], B[2], C[2]) - thickness);
  const maxZ = Math.ceil(Math.max(A[2], B[2], C[2]) + thickness);

  const voxels = [];
  const halfThick = Math.max(0.6, thickness / 2);
  for (let y = minY; y <= maxY; y++) {
    for (let z = minZ; z <= maxZ; z++) {
      for (let x = minX; x <= maxX; x++) {
        const dist = (x - A[0]) * n[0] + (y - A[1]) * n[1] + (z - A[2]) * n[2];
        if (Math.abs(dist) > halfThick) continue;
        const pPrime = [x - dist * n[0], y - dist * n[1], z - dist * n[2]];
        const v2 = [pPrime[0] - A[0], pPrime[1] - A[1], pPrime[2] - A[2]];
        const d20 = v2[0] * v0[0] + v2[1] * v0[1] + v2[2] * v0[2];
        const d21 = v2[0] * v1[0] + v2[1] * v1[1] + v2[2] * v1[2];
        const v = (d11 * d20 - d01 * d21) / denom;
        const w = (d00 * d21 - d01 * d20) / denom;
        const u = 1.0 - v - w;
        if (u >= -0.05 && v >= -0.05 && w >= -0.05) {
          voxels.push([x, y, z]);
        }
      }
    }
  }
  return voxels;
}

// 5x7 Voxel Font A-Z, 0-9
const FONT_5X7 = {
  ' ': ['     ','     ','     ','     ','     ','     ','     '],
  'A': [' ### ','#   #','#   #','#####','#   #','#   #','#   #'],
  'B': ['#### ','#   #','#   #','#### ','#   #','#   #','#### '],
  'C': [' ####','#    ','#    ','#    ','#    ','#    ',' ####'],
  'D': ['#### ','#   #','#   #','#   #','#   #','#   #','#### '],
  'E': ['#####','#    ','#    ','#### ','#    ','#    ','#####'],
  'F': ['#####','#    ','#    ','#### ','#    ','#    ','#    '],
  'G': [' ####','#    ','#    ','# ###','#   #','#   #',' ####'],
  'H': ['#   #','#   #','#   #','#####','#   #','#   #','#   #'],
  'I': ['#####','  #  ','  #  ','  #  ','  #  ','  #  ','#####'],
  'J': ['  ###','    #','    #','    #','#   #','#   #',' ### '],
  'K': ['#   #','#  # ','# #  ','##   ','# #  ','#  # ','#   #'],
  'L': ['#    ','#    ','#    ','#    ','#    ','#    ','#####'],
  'M': ['#   #','## ##','# # #','#   #','#   #','#   #','#   #'],
  'N': ['#   #','##  #','# # #','#  ##','#   #','#   #','#   #'],
  'O': [' ### ','#   #','#   #','#   #','#   #','#   #',' ### '],
  'P': ['#### ','#   #','#   #','#### ','#    ','#    ','#    '],
  'Q': [' ### ','#   #','#   #','# # #','#  ##',' ### ','    #'],
  'R': ['#### ','#   #','#   #','#### ','# #  ','#  # ','#   #'],
  'S': [' ####','#    ','#    ',' ### ','    #','    #','#### '],
  'T': ['#####','  #  ','  #  ','  #  ','  #  ','  #  ','  #  '],
  'U': ['#   #','#   #','#   #','#   #','#   #','#   #',' ### '],
  'V': ['#   #','#   #','#   #','#   #','#   #',' # # ','  #  '],
  'W': ['#   #','#   #','#   #','# # #','# # #','## ##','#   #'],
  'X': ['#   #','#   #',' # # ','  #  ',' # # ','#   #','#   #'],
  'Y': ['#   #','#   #',' # # ','  #  ','  #  ','  #  ','  #  '],
  'Z': ['#####','    #','   # ','  #  ',' #   ','#    ','#####'],
  '0': [' ### ','#  ##','# # #','##  #','#   #','#   #',' ### '],
  '1': ['  #  ',' ##  ','  #  ','  #  ','  #  ','  #  ',' ### '],
  '2': [' ### ','#   #','    #',' ### ','#    ','#    ','#####'],
  '3': ['#### ','    #','    #',' ### ','    #','    #','#### '],
  '4': ['#   #','#   #','#   #','#####','    #','    #','    #'],
  '5': ['#####','#    ','#    ','#### ','    #','    #','#### '],
  '6': [' ### ','#    ','#    ','#### ','#   #','#   #',' ### '],
  '7': ['#####','    #','   # ','  #  ','  #  ','  #  ','  #  '],
  '8': [' ### ','#   #','#   #',' ### ','#   #','#   #',' ### '],
  '9': [' ### ','#   #','#   #',' ####','    #','    #',' ### ']
};

// 7x9 Heroic Architectural Voxel Display Font (A-Z, 0-9)
// Gercek sunucu logolari, Hypixel tarzi anitsal harfler, keskin diyagonaller ve kemerli kavisler
const FONT_HEROIC_7X9 = {
  ' ': ['       ','       ','       ','       ','       ','       ','       ','       ','       '],
  'A': ['  ###  ',' #   # ',' #   # ','#     #','#######','#     #','#     #','#     #','#     #'],
  'B': ['###### ','#     #','#     #','###### ','#     #','#     #','#     #','#     #','###### '],
  'C': [' ##### ','#     #','#      ','#      ','#      ','#      ','#      ','#     #',' ##### '],
  'D': ['###### ','#     #','#     #','#     #','#     #','#     #','#     #','#     #','###### '],
  'E': ['#######','#      ','#      ','#####  ','#      ','#      ','#      ','#      ','#######'],
  'F': ['#######','#      ','#      ','#####  ','#      ','#      ','#      ','#      ','#      '],
  'G': [' ##### ','#     #','#      ','#      ','#  ####','#     #','#     #','#     #',' ##### '],
  'H': ['#     #','#     #','#     #','#######','#     #','#     #','#     #','#     #','#     #'],
  'I': ['#######','   #   ','   #   ','   #   ','   #   ','   #   ','   #   ','   #   ','#######'],
  'J': ['  #####','     # ','     # ','     # ','     # ','     # ','#    # ','#    # ',' ####  '],
  'K': ['#    # ','#   #  ','#  #   ','###    ','#  #   ','#   #  ','#    # ','#    # ','#     #'],
  'L': ['#      ','#      ','#      ','#      ','#      ','#      ','#      ','#      ','#######'],
  'M': ['#     #','##   ##','# # # #','#  #  #','#     #','#     #','#     #','#     #','#     #'],
  'N': ['##    #','###   #','# ##  #','#  ## #','#   ###','#    ##','#     #','#     #','#     #'],
  'O': [' ##### ','#     #','#     #','#     #','#     #','#     #','#     #','#     #',' ##### '],
  'P': ['###### ','#     #','#     #','###### ','#      ','#      ','#      ','#      ','#      '],
  'Q': [' ##### ','#     #','#     #','#     #','#     #','#   # #','#    ##',' ##### ','      #'],
  'R': ['###### ','#     #','#     #','###### ','#   #  ','#    # ','#    # ','#     #','#     #'],
  'S': [' ##### ','#     #','#      ',' ####  ','     # ','      #','      #','#     #',' ##### '],
  'T': ['#######','   #   ','   #   ','   #   ','   #   ','   #   ','   #   ','   #   ','   #   '],
  'U': ['#     #','#     #','#     #','#     #','#     #','#     #','#     #','#     #',' ##### '],
  'V': ['#     #','#     #','#     #',' #   # ',' #   # ','  # #  ','  # #  ','  # #  ','   #   '],
  'W': ['#     #','#     #','#     #','#  #  #','# # # #','# # # #','##   ##','#     #','#     #'],
  'X': ['#     #',' #   # ','  # #  ','   #   ','  # #  ',' #   # ','#     #','#     #','#     #'],
  'Y': ['#     #',' #   # ','  # #  ','   #   ','   #   ','   #   ','   #   ','   #   ','   #   '],
  'Z': ['#######','     # ','    #  ','   #   ','  #    ',' #     ','#      ','#      ','#######'],
  '0': [' ##### ','#    ##','#   # #','#  #  #','# #   #','##    #','#     #','#     #',' ##### '],
  '1': ['   ##  ','  ###  ','   ##  ','   ##  ','   ##  ','   ##  ','   ##  ','   ##  ',' ######'],
  '2': [' ##### ','#     #','      #','   ### ','  #    ',' #     ','#      ','#      ','#######'],
  '3': ['###### ','      #','      #',' ##### ','      #','      #','      #','      #','###### '],
  '4': ['#     #','#     #','#     #','#######','      #','      #','      #','      #','      #'],
  '5': ['#######','#      ','#      ','###### ','      #','      #','      #','      #','###### '],
  '6': [' ##### ','#      ','#      ','###### ','#     #','#     #','#     #','#     #',' ##### '],
  '7': ['#######','     # ','    #  ','   #   ','   #   ','  #    ','  #    ',' #     ',' #     '],
  '8': [' ##### ','#     #','#     #',' ##### ','#     #','#     #','#     #','#     #',' ##### '],
  '9': [' ##### ','#     #','#     #','#     #',' ######','      #','      #','      #',' ##### '],
  '-': ['       ','       ','       ','       ',' ##### ','       ','       ','       ','       '],
  '!': ['  ###  ','  ###  ','  ###  ','  ###  ','   #   ','   #   ','       ','  ###  ','  ###  '],
  '.': ['       ','       ','       ','       ','       ','       ','       ','  ###  ','  ###  ']
};

// ---------- OPERASYONLAR ----------
const OPS = {
  // 1. Dolu kutu (Desen, gradyan ve eksen destekli)
  fill(w, p, ctx) {
    const b = box(p);
    const dx = b.x2 - b.x1, dy = b.y2 - b.y1, dz = b.z2 - b.z1;
    const axis = ['x', 'y', 'z'].includes(p.axis) ? p.axis : dx > 0 && !dy && !dz ? 'x' : dz > 0 && !dx && !dy ? 'z' : 'y';
    for (let y = b.y1; y <= b.y2; y++) {
      for (let z = b.z1; z <= b.z2; z++) {
        for (let x = b.x1; x <= b.x2; x++) {
          const s = withAxis(resolveBlock(p.block, ctx, x, y, z), axis);
          w.put(x, y, z, s);
        }
      }
    }
  },

  // 2. Bos kabuk
  hollow_box(w, p, ctx) {
    const b = box(p);
    const top = p.top !== false, bottom = p.bottom !== false;
    for (let y = b.y1; y <= b.y2; y++) {
      for (let z = b.z1; z <= b.z2; z++) {
        for (let x = b.x1; x <= b.x2; x++) {
          const edge = x === b.x1 || x === b.x2 || z === b.z1 || z === b.z2 || (bottom && y === b.y1) || (top && y === b.y2);
          if (edge) w.put(x, y, z, resolveBlock(p.block, ctx, x, y, z));
          else if (p.clear) w.put(x, y, z, AIR);
        }
      }
    }
  },

  // 3. Dort dikey duvar
  walls(w, p, ctx) {
    const b = box(p);
    for (let y = b.y1; y <= b.y2; y++) {
      for (let z = b.z1; z <= b.z2; z++) {
        for (let x = b.x1; x <= b.x2; x++) {
          if (x === b.x1 || x === b.x2 || z === b.z1 || z === b.z2) {
            w.put(x, y, z, resolveBlock(p.block, ctx, x, y, z));
          }
        }
      }
    }
  },

  // 4. Sutun
  pillar(w, p, ctx) {
    const x = int(p, 'x'), y = int(p, 'y'), z = int(p, 'z'), h = clamp(int(p, 'height'), 1, 256);
    const axis = ['x', 'y', 'z'].includes(p.axis) ? p.axis : 'y';
    for (let i = 0; i < h; i++) {
      const s = withAxis(resolveBlock(p.block, ctx, x, y + i, z), axis);
      w.put(x, y + i, z, s);
    }
  },

  // 5. Silindir (x, y veya z ekseni yonunde olabilir)
  cylinder(w, p, ctx) {
    const cx = int(p, 'cx', { optional: true, def: p.x }),
          cz = int(p, 'cz', { optional: true, def: p.z }),
          y = int(p, 'y');
    const r = clamp(int(p, 'radius', { optional: true, def: p.r ?? 5 }), 1, LIM.radius);
    const h = clamp(int(p, 'height', { optional: true, def: 5 }), 1, 256);
    const hollow = !!p.hollow, top = p.top === true, bottom = p.bottom !== false;
    const axis = p.axis || 'y';

    for (let i = 0; i < h; i++) {
      for (let da = -r; da <= r; da++) {
        for (let db = -r; db <= r; db++) {
          const d2 = da * da + db * db;
          if (d2 > (r + 0.5) ** 2) continue;
          const cap = (bottom && i === 0) || (top && i === h - 1);
          if (hollow && !cap && d2 <= (r - 0.5) ** 2) continue;

          let px = cx, py = y, pz = cz;
          if (axis === 'y') { px = cx + da; py = y + i; pz = cz + db; }
          else if (axis === 'x') { px = cx + i; py = y + da; pz = cz + db; }
          else if (axis === 'z') { px = cx + da; py = y + db; pz = cz + i; }

          w.put(px, py, pz, resolveBlock(p.block, ctx, px, py, pz));
        }
      }
    }
  },

  // 6. Elipsoid & Kure (rx, ry, rz veya r; organlar, kaslar, bulutlar, kubbeler)
  ellipsoid(w, p, ctx) {
    const cx = int(p, 'cx', { optional: true, def: p.x }),
          cy = int(p, 'cy', { optional: true, def: p.y }),
          cz = int(p, 'cz', { optional: true, def: p.z });
    const r = p.r ?? p.radius;
    const rx = clamp(num(p, 'rx', { optional: true, def: r ?? 5 }), 0.5, LIM.radius);
    const ry = clamp(num(p, 'ry', { optional: true, def: r ?? 5 }), 0.5, LIM.radius);
    const rz = clamp(num(p, 'rz', { optional: true, def: r ?? 5 }), 0.5, LIM.radius);
    const hollow = p.hollow === true;
    const thick = clamp(num(p, 'thickness', { optional: true, def: 1 }), 0.5, 10);

    const bx = Math.ceil(rx), by = Math.ceil(ry), bz = Math.ceil(rz);
    for (let dy = -by; dy <= by; dy++) {
      for (let dz = -bz; dz <= bz; dz++) {
        for (let dx = -bx; dx <= bx; dx++) {
          const d2 = (dx / rx) ** 2 + (dy / ry) ** 2 + (dz / rz) ** 2;
          if (d2 > 1.0) continue;
          if (hollow) {
            const inner = ((dx) / Math.max(0.1, rx - thick)) ** 2 +
                          ((dy) / Math.max(0.1, ry - thick)) ** 2 +
                          ((dz) / Math.max(0.1, rz - thick)) ** 2;
            if (inner <= 1.0) continue;
          }
          const px = Math.round(cx + dx), py = Math.round(cy + dy), pz = Math.round(cz + dz);
          w.put(px, py, pz, resolveBlock(p.block, ctx, px, py, pz));
        }
      }
    }
  },

  sphere(w, p, ctx) {
    const r = num(p, 'r', { optional: true, def: p.radius ?? 5 });
    OPS.ellipsoid(w, { ...p, rx: r, ry: r, rz: r }, ctx);
  },

  // 7. 3B Konik / Tapered Cylinder (A noktasindan B noktasina r1'den r2'ye; ejderha boynu, ates puskurmesi, boynuzlar, sivri kuleler)
  tapered_cylinder(w, p, ctx) {
    const x1 = num(p, 'x1'), y1 = num(p, 'y1'), z1 = num(p, 'z1');
    const x2 = num(p, 'x2'), y2 = num(p, 'y2'), z2 = num(p, 'z2');
    const r1 = clamp(num(p, 'r1', { optional: true, def: p.r ?? 3 }), 0.1, LIM.radius);
    const r2 = clamp(num(p, 'r2', { optional: true, def: 0 }), 0, LIM.radius);
    const hollow = p.hollow === true;
    const thick = clamp(num(p, 'thickness', { optional: true, def: 1 }), 0.5, 10);

    const maxR = Math.max(r1, r2);
    const minX = Math.floor(Math.min(x1, x2) - maxR - 1);
    const maxX = Math.ceil(Math.max(x1, x2) + maxR + 1);
    const minY = Math.floor(Math.min(y1, y2) - maxR - 1);
    const maxY = Math.ceil(Math.max(y1, y2) + maxR + 1);
    const minZ = Math.floor(Math.min(z1, z2) - maxR - 1);
    const maxZ = Math.ceil(Math.max(z1, z2) + maxR + 1);

    for (let py = minY; py <= maxY; py++) {
      for (let pz = minZ; pz <= maxZ; pz++) {
        for (let px = minX; px <= maxX; px++) {
          const { d2, t } = distPointToSegment(px, py, pz, x1, y1, z1, x2, y2, z2);
          const rTarget = r1 + t * (r2 - r1);
          if (d2 > (rTarget + 0.4) ** 2) continue;
          if (hollow && d2 <= Math.max(0, rTarget - thick) ** 2) continue;
          w.put(px, py, pz, resolveBlock(p.block, ctx, px, py, pz));
        }
      }
    }
  },

  cone_3d(w, p, ctx) {
    OPS.tapered_cylinder(w, p, ctx);
  },

  // 8. 3B Egri / Spline / Omurga (Catmull-Rom; S-biçimli boyun, kuyruk, sarmal boynuzlar, uzuvlar, gotik kemerler)
  curve(w, p, ctx) {
    const rawPoints = p.points || p.control_points;
    if (!Array.isArray(rawPoints) || rawPoints.length < 2) {
      throw new BuildError("'curve' requires at least 2 control points in 'points' array [[x,y,z], ...]");
    }
    const points = rawPoints.map((pt) => [Number(pt[0]), Number(pt[1]), Number(pt[2])]);
    const r1 = clamp(num(p, 'r1', { optional: true, def: p.r ?? 2 }), 0.5, LIM.radius);
    const r2 = clamp(num(p, 'r2', { optional: true, def: r1 }), 0.5, LIM.radius);
    const hollow = p.hollow === true;
    const thick = clamp(num(p, 'thickness', { optional: true, def: 1 }), 0.5, 10);

    const steps = Math.max(20, (points.length - 1) * 20);
    const sampled = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const pt = catmullRomPoint(points, t);
      const r = r1 + t * (r2 - r1);
      sampled.push({ pt, r });
    }

    // Bosluk kalmamasi icin ardisik ornekler arasinda baglanti silindirleri cizilir
    for (let i = 0; i < sampled.length; i++) {
      const curr = sampled[i];
      const next = sampled[Math.min(sampled.length - 1, i + 1)];
      const maxR = Math.max(curr.r, next.r);
      const minX = Math.floor(Math.min(curr.pt[0], next.pt[0]) - maxR);
      const maxX = Math.ceil(Math.max(curr.pt[0], next.pt[0]) + maxR);
      const minY = Math.floor(Math.min(curr.pt[1], next.pt[1]) - maxR);
      const maxY = Math.ceil(Math.max(curr.pt[1], next.pt[1]) + maxR);
      const minZ = Math.floor(Math.min(curr.pt[2], next.pt[2]) - maxR);
      const maxZ = Math.ceil(Math.max(curr.pt[2], next.pt[2]) + maxR);

      for (let py = minY; py <= maxY; py++) {
        for (let pz = minZ; pz <= maxZ; pz++) {
          for (let px = minX; px <= maxX; px++) {
            const { d2, t } = distPointToSegment(px, py, pz, curr.pt[0], curr.pt[1], curr.pt[2], next.pt[0], next.pt[1], next.pt[2]);
            const rT = curr.r + t * (next.r - curr.r);
            if (d2 > (rT + 0.4) ** 2) continue;
            if (hollow && d2 <= Math.max(0, rT - thick) ** 2) continue;
            w.put(px, py, pz, resolveBlock(p.block, ctx, px, py, pz));
          }
        }
      }
    }
  },

  spline(w, p, ctx) {
    OPS.curve(w, p, ctx);
  },

  tube(w, p, ctx) {
    OPS.curve(w, p, ctx);
  },

  // 9. 3B Zar / Poligon / Ucgen / Kanat Zari (Ejderha kanatlari, yelkenler, bayraklar)
  membrane(w, p, ctx) {
    const p1 = p.p1 || p.points?.[0];
    const p2 = p.p2 || p.points?.[1];
    const p3 = p.p3 || p.points?.[2];
    const p4 = p.p4 || p.points?.[3];
    if (!p1 || !p2 || !p3) throw new BuildError("'membrane' requires p1, p2, p3 vertices [x,y,z]");

    const thick = clamp(num(p, 'thickness', { optional: true, def: 1 }), 0.5, 10);
    const voxels = rasterizeTriangle(p1, p2, p3, thick);
    if (p4) {
      voxels.push(...rasterizeTriangle(p1, p3, p4, thick));
    }
    for (const [vx, vy, vz] of voxels) {
      w.put(vx, vy, vz, resolveBlock(p.block, ctx, vx, vy, vz));
    }
  },

  triangle_3d(w, p, ctx) {
    OPS.membrane(w, p, ctx);
  },

  polygon_patch(w, p, ctx) {
    OPS.membrane(w, p, ctx);
  },

  // 10. Halka / Torus (Portallar, buyu haleleri, yuvarlak pencereler, gotik rozetler)
  torus(w, p, ctx) {
    const cx = num(p, 'cx', { optional: true, def: p.x }),
          cy = num(p, 'cy', { optional: true, def: p.y }),
          cz = num(p, 'cz', { optional: true, def: p.z });
    const R = clamp(num(p, 'R', { optional: true, def: p.major_radius ?? 10 }), 1, LIM.radius);
    const r = clamp(num(p, 'r', { optional: true, def: p.minor_radius ?? 2 }), 0.5, LIM.radius);
    const axis = p.axis || 'y';

    const b = Math.ceil(R + r + 1);
    for (let dy = -b; dy <= b; dy++) {
      for (let dz = -b; dz <= b; dz++) {
        for (let dx = -b; dx <= b; dx++) {
          let majorDist, minorDistSq;
          if (axis === 'y') {
            majorDist = Math.hypot(dx, dz) - R;
            minorDistSq = majorDist * majorDist + dy * dy;
          } else if (axis === 'x') {
            majorDist = Math.hypot(dy, dz) - R;
            minorDistSq = majorDist * majorDist + dx * dx;
          } else {
            majorDist = Math.hypot(dx, dy) - R;
            minorDistSq = majorDist * majorDist + dz * dz;
          }
          if (minorDistSq <= (r + 0.4) ** 2) {
            const px = Math.round(cx + dx), py = Math.round(cy + dy), pz = Math.round(cz + dz);
            w.put(px, py, pz, resolveBlock(p.block, ctx, px, py, pz));
          }
        }
      }
    }
  },

  // 11. Organik Arazi / Kayalik Platform (Noise tabanli dogal kayalik platform, dag tepesi, krater)
  terrain(w, p, ctx) {
    const cx = num(p, 'cx', { optional: true, def: p.x ?? 0 }),
          cz = num(p, 'cz', { optional: true, def: p.z ?? 0 }),
          baseY = int(p, 'y', { optional: true, def: 0 });
    const rx = clamp(num(p, 'rx', { optional: true, def: p.r ?? 25 }), 2, LIM.radius);
    const rz = clamp(num(p, 'rz', { optional: true, def: rx }), 2, LIM.radius);
    const height = clamp(num(p, 'height', { optional: true, def: 8 }), 1, 100);
    const roughness = clamp(num(p, 'roughness', { optional: true, def: 0.5 }), 0, 1);

    const bx = Math.ceil(rx), bz = Math.ceil(rz);
    for (let dz = -bz; dz <= bz; dz++) {
      for (let dx = -bx; dx <= bx; dx++) {
        const dNorm = (dx / rx) ** 2 + (dz / rz) ** 2;
        if (dNorm > 1.0) continue;
        const falloff = Math.cos(dNorm * (Math.PI / 2));
        const n = fbm2D((cx + dx) * 0.08, (cz + dz) * 0.08, 3, ctx.seed);
        const topH = Math.round(baseY + falloff * (1 + (n - 0.5) * roughness * 2) * height);

        for (let py = baseY; py <= topH; py++) {
          const px = Math.round(cx + dx), pz = Math.round(cz + dz);
          w.put(px, py, pz, resolveBlock(p.block, ctx, px, py, pz));
        }
      }
    }
  },

  rock(w, p, ctx) {
    OPS.terrain(w, p, ctx);
  },

  // 12. Spiral / Sarmal (Donen boynuzlar, buyu sarmallari, spiral merdivenler)
  spiral(w, p, ctx) {
    const cx = num(p, 'cx', { optional: true, def: p.x ?? 0 }),
          cz = num(p, 'cz', { optional: true, def: p.z ?? 0 }),
          y1 = num(p, 'y1', { optional: true, def: p.y ?? 0 }),
          y2 = num(p, 'y2', { optional: true, def: y1 + 20 });
    const r = num(p, 'radius', { optional: true, def: p.r ?? 6 });
    const turns = num(p, 'turns', { optional: true, def: 2 });
    const thick = clamp(num(p, 'thickness', { optional: true, def: 1.5 }), 0.5, 10);

    const totalSteps = Math.round(Math.abs(y2 - y1) * 6);
    const points = [];
    for (let i = 0; i <= totalSteps; i++) {
      const t = i / totalSteps;
      const angle = t * turns * Math.PI * 2;
      points.push([cx + Math.cos(angle) * r, y1 + t * (y2 - y1), cz + Math.sin(angle) * r]);
    }
    OPS.curve(w, { points, r: thick, block: p.block }, ctx);
  },

  // 13. 3B Blok Yazi / Sunucu Logosu (NOVA, HYPIXEL, VIPER vb. buyuk harfli 3B logo bloklari)
  text_3d(w, p, ctx) {
    let rawText = String(p.text ?? 'NOVA').toUpperCase();
    const text = rawText
      .replace(/İ/g, 'I')
      .replace(/ı/g, 'I')
      .replace(/Ğ/g, 'G')
      .replace(/ğ/g, 'G')
      .replace(/Ü/g, 'U')
      .replace(/ü/g, 'U')
      .replace(/Ş/g, 'S')
      .replace(/ş/g, 'S')
      .replace(/Ö/g, 'O')
      .replace(/ö/g, 'O')
      .replace(/Ç/g, 'C')
      .replace(/ç/g, 'C');

    const cx = num(p, 'cx', { optional: true, def: p.x ?? 0 });
    const baseY = num(p, 'y', { optional: true, def: 30 });
    const cz = num(p, 'cz', { optional: true, def: p.z ?? 0 });
    const scale = clamp(int(p, 'scale', { optional: true, def: 2 }), 1, 6);
    const depth = clamp(int(p, 'depth', { optional: true, def: 2 }), 1, 12);
    const arch = num(p, 'arch', { optional: true, def: 0 }); // Kavisli yay egimi
    const outline = p.outline ?? p.border_block ?? p.outline_block;
    const facing = p.facing || 'south';

    const fontMode = p.font === '5x7' ? '5x7' : 'heroic';
    const fontTable = fontMode === '5x7' ? FONT_5X7 : FONT_HEROIC_7X9;
    const fontCols = fontMode === '5x7' ? 5 : 7;
    const fontRows = fontMode === '5x7' ? 7 : 9;

    const letterWidth = fontCols * scale;
    const letterHeight = fontRows * scale;
    const spacing = Math.max(1, Math.round(1.5 * scale));
    const totalW = text.length * letterWidth + (text.length - 1) * spacing;
    const startX = Math.round(cx - totalW / 2);

    const pixels = new Set();
    let currX = startX;
    for (const char of text) {
      const bitmap = fontTable[char] || fontTable[' '];
      for (let r = 0; r < fontRows; r++) {
        for (let c = 0; c < fontCols; c++) {
          if (bitmap[r]?.[c] === '#') {
            for (let sr = 0; sr < scale; sr++) {
              for (let sc = 0; sc < scale; sc++) {
                const px = currX + c * scale + sc;
                const py = (fontRows - 1 - r) * scale + sr;
                pixels.add(`${px},${py}`);
              }
            }
          }
        }
      }
      currX += letterWidth + spacing;
    }

    const outlinePixels = new Set();
    if (outline) {
      for (const key of pixels) {
        const [px, py] = key.split(',').map(Number);
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const nk = `${px + dx},${py + dy}`;
            if (!pixels.has(nk)) outlinePixels.add(nk);
          }
        }
      }
    }

    const place2D = (px, py, blockSpec, dStart, dEnd) => {
      const normX = totalW > 0 ? (px - cx) / (totalW / 2) : 0;
      const archY = Math.round(arch * Math.max(0, 1 - normX * normX));
      const actualY = Math.round(baseY + py + archY);

      for (let d = dStart; d <= dEnd; d++) {
        let wx, wy, wz;
        if (facing === 'south') { wx = px; wy = actualY; wz = Math.round(cz + d); }
        else if (facing === 'north') { wx = px; wy = actualY; wz = Math.round(cz - d); }
        else if (facing === 'east') { wx = Math.round(cx + d); wy = actualY; wz = Math.round(cz + (px - cx)); }
        else { wx = Math.round(cx - d); wy = actualY; wz = Math.round(cz - (px - cx)); }

        w.put(wx, wy, wz, resolveBlock(blockSpec, ctx, wx, wy, wz), true);
      }
    };

    // 1. On yuz (Face)
    for (const key of pixels) {
      const [px, py] = key.split(',').map(Number);
      place2D(px, py, p.block, 0, 0);
    }

    // 2. Yan/Arka Derinlik (Extruded Depth)
    const depthBlock = p.depth_block || p.depthBlock || p.block;
    if (depth > 1) {
      for (const key of pixels) {
        const [px, py] = key.split(',').map(Number);
        place2D(px, py, depthBlock, 1, depth - 1);
      }
    }

    // 3. Dis Kontur (Outline Rim)
    if (outline) {
      for (const key of outlinePixels) {
        const [px, py] = key.split(',').map(Number);
        place2D(px, py, outline, -1, depth - 1);
      }
      for (const key of pixels) {
        const [px, py] = key.split(',').map(Number);
        place2D(px, py, outline, -1, -1);
      }
    }

    // 4. Otomatik Anitsal Kaide (Pedestal Stand - Asla havada asili kalmaz)
    if (p.pedestal !== false && p.stand !== false && baseY > 2) {
      const pedBlock = p.pedestal_block || outline || 'minecraft:polished_blackstone_bricks';
      const trimBlock = p.block || 'minecraft:gold_block';
      const pzStart = Math.min(cz - 2, cz + depth + 1);
      const pzEnd = Math.max(cz - 2, cz + depth + 1);

      // Kademe 1 (Ust Ince Trim)
      for (let px = startX - 2; px <= startX + totalW + 1; px++) {
        for (let pz = pzStart; pz <= pzEnd; pz++) {
          w.put(px, Math.round(baseY - 1), pz, resolveBlock(trimBlock, ctx, px, Math.round(baseY - 1), pz), true);
        }
      }
      // Kademe 2 (Alt Saglam Govde)
      for (let py = Math.max(0, Math.round(baseY - 4)); py <= Math.round(baseY - 2); py++) {
        for (let px = startX - 3; px <= startX + totalW + 2; px++) {
          for (let pz = pzStart - 1; pz <= pzEnd + 1; pz++) {
            w.put(px, py, pz, resolveBlock(pedBlock, ctx, px, py, pz), true);
          }
        }
      }
    }
  },

  // Kubbe: cy = en genis katman.
  dome(w, p, ctx) {
    const cx = int(p, 'cx'), cy = int(p, 'cy'), cz = int(p, 'cz'), r = clamp(int(p, 'radius'), 2, LIM.radius);
    const hollow = p.hollow !== false;
    for (let dy = p.full === true ? -r : 0; dy <= r; dy++) {
      for (let dz = -r; dz <= r; dz++) {
        for (let dx = -r; dx <= r; dx++) {
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 > (r + 0.5) ** 2 || (hollow && d2 <= (r - 0.5) ** 2)) continue;
          const px = cx + dx, py = cy + dy, pz = cz + dz;
          w.put(px, py, pz, resolveBlock(p.block, ctx, px, py, pz));
        }
      }
    }
  },

  // Konik kule cati
  cone_roof(w, p, ctx) {
    const cx = int(p, 'cx'), cz = int(p, 'cz'), y = int(p, 'y'), R = clamp(int(p, 'radius'), 1, LIM.radius);
    const solid = p.solid === true;
    for (let i = 0; i <= R; i++) {
      const r = R - i;
      for (let dz = -r; dz <= r; dz++) {
        for (let dx = -r; dx <= r; dx++) {
          const d2 = dx * dx + dz * dz;
          if (d2 > (r + 0.5) ** 2 || (!solid && r > 0 && d2 <= (r - 0.5) ** 2)) continue;
          const px = cx + dx, py = y + i, pz = cz + dz;
          w.put(px, py, pz, resolveBlock(p.block, ctx, px, py, pz));
        }
      }
    }
  },

  // Besik cati
  gable_roof(w, p, ctx) {
    const [x1, x2] = sort2(int(p, 'x1'), int(p, 'x2')), [z1, z2] = sort2(int(p, 'z1'), int(p, 'z2')), y = int(p, 'y');
    const ov = clamp(int(p, 'overhang', { optional: true, def: 1 }), 0, 3);
    const axis = p.axis === 'z' ? 'z' : 'x';
    const stairs = need(resolveBlock(p.block, ctx, x1, y, z1), '_stairs', 'block');
    const ridge = p.ridge_block ? resolveBlock(p.ridge_block, ctx, x1, y, z1) : { name: stairToFull(stairs.name), props: {} };
    const gable = p.gable_block ? resolveBlock(p.gable_block, ctx, x1, y, z1) : AIR;
    const [a0, a1, s0, s1] = axis === 'x' ? [x1, x2, z1, z2] : [z1, z2, x1, x2];
    const place = (a, s, yy, spec) => (axis === 'x' ? w.put(a, yy, s, spec) : w.put(s, yy, a, spec));
    const lowF = axis === 'x' ? 'south' : 'east', highF = axis === 'x' ? 'north' : 'west';
    for (let i = 0, lo = s0 - ov, hi = s1 + ov; lo <= hi; i++, lo++, hi--) {
      const yy = y - ov + i;
      if (lo === hi) {
        for (let a = a0 - ov; a <= a1 + ov; a++) place(a, lo, yy, ridge);
        break;
      }
      for (let a = a0 - ov; a <= a1 + ov; a++) {
        place(a, lo, yy, withProps(stairs, { facing: lowF, half: 'bottom', shape: 'straight' }));
        place(a, hi, yy, withProps(stairs, { facing: highF, half: 'bottom', shape: 'straight' }));
      }
      if (gable && i >= ov) {
        for (let s = Math.max(lo + 1, s0); s <= Math.min(hi - 1, s1); s++) {
          place(a0, s, yy, gable);
          place(a1, s, yy, gable);
        }
      }
    }
  },

  // Kirma cati
  hip_roof(w, p, ctx) {
    const [x1, x2] = sort2(int(p, 'x1'), int(p, 'x2')), [z1, z2] = sort2(int(p, 'z1'), int(p, 'z2')), y = int(p, 'y');
    const ov = clamp(int(p, 'overhang', { optional: true, def: 1 }), 0, 3);
    const stairs = need(resolveBlock(p.block, ctx, x1, y, z1), '_stairs', 'block');
    const ridge = p.ridge_block ? resolveBlock(p.ridge_block, ctx, x1, y, z1) : { name: stairToFull(stairs.name), props: {} };
    for (let i = 0, xl = x1 - ov, xh = x2 + ov, zl = z1 - ov, zh = z2 + ov; xl <= xh && zl <= zh; i++, xl++, xh--, zl++, zh--) {
      const yy = y - ov + i;
      if (xl === xh || zl === zh) {
        for (let z = zl; z <= zh; z++) for (let x = xl; x <= xh; x++) w.put(x, yy, z, ridge);
        break;
      }
      for (let z = zl; z <= zh; z++) {
        for (let x = xl; x <= xh; x++) {
          const N = z === zl, S = z === zh, W = x === xl, E = x === xh;
          if (!(N || S || W || E)) continue;
          let facing, shape = 'straight';
          if (N && W) { facing = 'south'; shape = 'outer_left'; }
          else if (N && E) { facing = 'south'; shape = 'outer_right'; }
          else if (S && W) { facing = 'north'; shape = 'outer_right'; }
          else if (S && E) { facing = 'north'; shape = 'outer_left'; }
          else if (N) facing = 'south';
          else if (S) facing = 'north';
          else if (W) facing = 'east';
          else facing = 'west';
          w.put(x, yy, z, withProps(stairs, { facing, half: 'bottom', shape }));
        }
      }
    }
  },

  pyramid(w, p, ctx) {
    const [x1, x2] = sort2(int(p, 'x1'), int(p, 'x2')), [z1, z2] = sort2(int(p, 'z1'), int(p, 'z2')), y = int(p, 'y');
    for (let i = 0; x1 + i <= x2 - i && z1 + i <= z2 - i; i++) {
      for (let z = z1 + i; z <= z2 - i; z++) {
        for (let x = x1 + i; x <= x2 - i; x++) {
          w.put(x, y + i, z, resolveBlock(p.block, ctx, x, y + i, z));
        }
      }
    }
  },

  window(w, p, ctx) {
    const x = int(p, 'x'), y = int(p, 'y'), z = int(p, 'z');
    if (p.axis !== 'x' && p.axis !== 'z') throw new BuildError("'axis' must be x or z");
    const wd = clamp(int(p, 'w', { optional: true, def: 1 }), 1, 30), h = clamp(int(p, 'h', { optional: true, def: 2 }), 1, 30);
    for (let i = 0; i < wd; i++) {
      for (let j = 0; j < h; j++) {
        const px = x + (p.axis === 'x' ? i : 0), py = y + j, pz = z + (p.axis === 'z' ? i : 0);
        w.put(px, py, pz, resolveBlock(p.glass ?? 'minecraft:glass_pane', ctx, px, py, pz));
      }
    }
  },

  door(w, p, ctx) {
    const x = int(p, 'x'), y = int(p, 'y'), z = int(p, 'z'), f = dirOf(p.facing);
    const base = need(resolveBlock(p.block ?? 'minecraft:oak_door', ctx, x, y, z), '_door', 'block');
    const leaf = (px, pz, hinge) => {
      const props = { facing: p.facing, hinge, open: String(!!p.open), powered: 'false' };
      w.put(px, y, pz, withProps(base, { ...props, half: 'lower' }));
      w.put(px, y + 1, pz, withProps(base, { ...props, half: 'upper' }));
    };
    leaf(x, z, p.hinge === 'right' ? 'right' : 'left');
    if (p.double) {
      const perp = f[0] === 0 ? [1, 0] : [0, 1];
      leaf(x + perp[0], z + perp[1], p.hinge === 'right' ? 'left' : 'right');
    }
  },

  staircase(w, p, ctx) {
    const x = int(p, 'x'), y = int(p, 'y'), z = int(p, 'z'), d = dirOf(p.dir, 'dir');
    const steps = clamp(int(p, 'steps'), 1, 120), width = clamp(int(p, 'width', { optional: true, def: 1 }), 1, 20);
    const stairs = need(resolveBlock(p.block, ctx, x, y, z), '_stairs', 'block');
    const support = p.support ? resolveBlock(p.support, ctx, x, y, z) : AIR;
    const perp = d[0] === 0 ? [1, 0] : [0, 1];
    for (let i = 0; i < steps; i++) {
      for (let k = 0; k < width; k++) {
        const px = x + d[0] * i + perp[0] * k, pz = z + d[1] * i + perp[1] * k;
        w.put(px, y + i, pz, withProps(stairs, { facing: p.dir, half: 'bottom', shape: 'straight' }));
        if (support) for (let sy = y; sy < y + i; sy++) w.put(px, sy, pz, support);
      }
    }
  },

  bed(w, p, ctx) {
    const x = int(p, 'x'), y = int(p, 'y'), z = int(p, 'z'), d = dirOf(p.facing);
    const name = `minecraft:${String(p.color ?? 'red').toLowerCase()}_bed`;
    const bed = resolveBlock(name, ctx, x, y, z);
    w.put(x, y, z, withProps(bed, { facing: p.facing, part: 'foot', occupied: 'false' }));
    w.put(x + d[0], y, z + d[1], withProps(bed, { facing: p.facing, part: 'head', occupied: 'false' }));
  },

  set(w, p, ctx) {
    const x = int(p, 'x'), y = int(p, 'y'), z = int(p, 'z');
    let s = resolveBlock(p.block, ctx, x, y, z);
    if (s && p.props && typeof p.props === 'object') {
      s = withProps(s, Object.fromEntries(Object.entries(p.props).map(([k, v]) => [k, String(v)])));
    }
    w.put(x, y, z, s);
  },

  copy(w, p) {
    const b = box(p, w);
    const dx = int(p, 'dx', { optional: true, def: 0 }),
          dy = int(p, 'dy', { optional: true, def: 0 }),
          dz = int(p, 'dz', { optional: true, def: 0 });
    const count = clamp(int(p, 'count', { optional: true, def: 1 }), 1, 60);
    const snap = [];
    for (let y = b.y1; y <= b.y2; y++) {
      for (let z = b.z1; z <= b.z2; z++) {
        for (let x = b.x1; x <= b.x2; x++) {
          const s = w.get(x, y, z);
          if (s || p.skip_air === false) snap.push([x, y, z, s ?? AIR]);
        }
      }
    }
    for (let k = 1; k <= count; k++) {
      for (const [x, y, z, s] of snap) {
        w.put(x + dx * k, y + dy * k, z + dz * k, s);
      }
    }
  },

  // Simetri / Ayna: koordinatlar belirtilmemisse dunya uzerindeki mevcut tum bloklari aynalar
  mirror(w, p) {
    const b = box(p, w);
    const at = Number(p.at ?? 0);
    if (!Number.isFinite(at) || !Number.isInteger(at * 2)) throw new BuildError("'at' must be an integer or .5 value");
    const axis = p.axis === 'z' ? 'z' : 'x';
    const snap = [];
    for (let y = b.y1; y <= b.y2; y++) {
      for (let z = b.z1; z <= b.z2; z++) {
        for (let x = b.x1; x <= b.x2; x++) {
          const k = `${x},${y},${z}`;
          if (w.protectedBlocks?.has(k)) continue;
          const s = w.get(x, y, z);
          if (s) snap.push([x, y, z, s]);
        }
      }
    }
    for (const [x, y, z, s] of snap) {
      const spec = mirrorSpec(s, axis);
      if (axis === 'x') w.put(Math.round(2 * at - x), y, z, spec);
      else w.put(x, y, Math.round(2 * at - z), spec);
    }
  },

  weather(w, p, ctx) {
    const b = box(p, w), from = resolveBlock(p.from, ctx);
    const targets = (Array.isArray(p.to) ? p.to : [p.to]).map((t) => resolveBlock(t, ctx));
    const chance = clamp(Number(p.chance ?? 0.2), 0, 1);
    if (!from) throw new BuildError("'from' cannot be air");
    for (let y = b.y1; y <= b.y2; y++) {
      for (let z = b.z1; z <= b.z2; z++) {
        for (let x = b.x1; x <= b.x2; x++) {
          const s = w.get(x, y, z);
          if (!s || s.name !== from.name || w.rand() >= chance) continue;
          const t = targets[Math.floor(w.rand() * targets.length)];
          const sfx = (n) => (n.match(/_(stairs|slab|wall)$/) || [])[1];
          w.put(x, y, z, t && sfx(t.name) && sfx(t.name) === sfx(s.name) ? { name: t.name, props: { ...s.props, ...t.props } } : t);
        }
      }
    }
  },

  tree(w, p, ctx) {
    const x = int(p, 'x'), y = int(p, 'y'), z = int(p, 'z'), h = clamp(int(p, 'height', { optional: true, def: 6 }), 3, 30);
    const log = withAxis(resolveBlock(p.log ?? 'minecraft:oak_log', ctx, x, y, z), 'y');
    const leaves = resolveBlock(p.leaves ?? 'minecraft:oak_leaves', ctx, x, y, z);
    const lr = h > 10 ? 3 : 2;
    for (let dy = h - 3; dy <= h + 1; dy++) {
      const r = dy >= h ? lr - 1 : lr;
      for (let dz = -r; dz <= r; dz++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.abs(dx) === r && Math.abs(dz) === r && (dy >= h || w.rand() < 0.5)) continue;
          if (!w.get(x + dx, y + dy, z + dz)) w.put(x + dx, y + dy, z + dz, leaves);
        }
      }
    }
    for (let i = 0; i < h; i++) w.put(x, y + i, z, log);
  },
};

// ---------- BAGLANTILAR ----------
function connectAll(w) {
  const dirs = [['north', 0, -1], ['south', 0, 1], ['east', 1, 0], ['west', -1, 0]];
  for (const [k, s] of w.cells) {
    const n = s.name;
    const fence = /_fence$/.test(n), wall = /_wall$/.test(n) && !/banner|sign/.test(n), pane = /_pane$|iron_bars$/.test(n);
    if (!(fence || wall || pane)) continue;
    const [x, y, z] = k.split(',').map(Number);
    const conn = {};
    let count = 0;
    for (const [d, dx, dz] of dirs) {
      const nb = w.get(x + dx, y, z + dz);
      let c = false;
      if (nb) {
        if (fence) c = (/_fence$/.test(nb.name) && n.includes('nether_brick') === nb.name.includes('nether_brick')) || /_fence_gate$/.test(nb.name) || isSolid(nb.name);
        else if (wall) c = /_wall$/.test(nb.name) || isSolid(nb.name);
        else c = /_pane$|iron_bars$/.test(nb.name) || isSolid(nb.name);
      }
      conn[d] = c;
      if (c) count++;
    }
    for (const [d] of dirs) s.props[d] = wall ? (conn[d] ? 'low' : 'none') : String(conn[d]);
    if (wall) {
      const straight = count === 2 && ((conn.north && conn.south) || (conn.east && conn.west));
      s.props.up = String(!straight || !!w.get(x, y + 1, z));
    }
  }
}

// Zemine/yapiya bagli olmayan "havada kalan" blok gruplari kontrolu
function findFloating(w) {
  const seen = new Set(), out = [];
  let minY = Infinity;
  for (const k of w.cells.keys()) minY = Math.min(minY, Number(k.split(',')[1]));

  const N = [];
  for (let a = -1; a <= 1; a++) {
    for (let b = -1; b <= 1; b++) {
      for (let c = -1; c <= 1; c++) {
        if (a || b || c) N.push([a, b, c]);
      }
    }
  }

  for (const start of w.cells.keys()) {
    if (seen.has(start)) continue;
    const stack = [start];
    seen.add(start);
    let size = 0, grounded = false;
    while (stack.length) {
      const k = stack.pop();
      size++;
      const [x, y, z] = k.split(',').map(Number);
      if (y === minY) grounded = true;
      for (const [a, b, c] of N) {
        const nk = `${x + a},${y + b},${z + c}`;
        if (w.cells.has(nk) && !seen.has(nk)) {
          seen.add(nk);
          stack.push(nk);
        }
      }
    }
    if (!grounded) out.push({ size, at: start });
  }
  return out;
}

/**
 * plan: { structure_name, materials, ops[] }
 * donus: { structure, warnings[], major[] }
 */
export function buildStructure(plan) {
  const warnings = [], major = [], seen = new Set();
  const warn = (msg, isMajor = true) => {
    if (seen.has(msg)) return;
    seen.add(msg);
    warnings.push(msg);
    if (isMajor) major.push(msg);
  };

  const seed = hash(plan.structure_name ?? 'structure');
  const ctx = { aliases: plan.materials ?? {}, seed, warn: (m, maj) => warn(m, maj ?? true) };
  const w = new World(seed);

  plan.ops.slice(0, LIM.ops).forEach((op, i) => {
    const fn = OPS[op?.op];
    if (!fn) return warn(`op #${i}: unknown op '${op?.op}'`, true);
    try {
      fn(w, op, ctx);
    } catch (e) {
      if (e instanceof BuildError) warn(`op #${i} (${op.op}): ${e.message}`, true);
      else throw e;
    }
  });

  if (w.cells.size === 0) throw new BuildError('The plan produced no blocks.');

  connectAll(w);

  // Organik/heykellerde havada kanat/ates parcalari dogaldir; bunlari yikici hata (major) yapmiyoruz
  for (const f of findFloating(w).slice(0, 6)) {
    warn(`${f.size} block(s) near x,y,z=${f.at} are floating (detached from base)`, false);
  }

  let min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const k of w.cells.keys()) {
    k.split(',').forEach((v, i) => {
      min[i] = Math.min(min[i], +v);
      max[i] = Math.max(max[i], +v);
    });
  }

  const dims = { width: max[0] - min[0] + 1, height: max[1] - min[1] + 1, depth: max[2] - min[2] + 1 };
  if (Math.max(dims.width, dims.height, dims.depth) > MAX_DIM) {
    throw new BuildError(`Structure is ${dims.width}x${dims.height}x${dims.depth} but each side must be <= ${MAX_DIM}. Scale down or prune.`);
  }

  const palette = {}, index = new Map(), blocks = [];
  for (const [k, spec] of w.cells) {
    const id = formatBlock(spec);
    if (!index.has(id)) {
      index.set(id, index.size + 1);
      palette[String(index.size)] = id;
    }
    const [x, y, z] = k.split(',').map(Number);
    blocks.push({ x: x - min[0], y: y - min[1], z: z - min[2], state: index.get(id) });
  }

  return {
    structure: {
      structure_name: String(plan.structure_name ?? 'structure').slice(0, 100),
      dimensions: dims,
      palette,
      blocks,
    },
    warnings,
    major,
  };
}
