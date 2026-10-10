import { z } from 'zod';

export const MAX_DIM = 400;
export const MAX_VOLUME = 400 * 400 * 400;

const int = z.number().int();
const dim = int.min(1).max(MAX_DIM);
// "minecraft:oak_stairs[facing=north,half=bottom]" gibi bloklara izin verir.
const blockId = z
  .string()
  .max(300)
  .regex(/^([a-z0-9_.-]+:)?[a-z0-9_/.-]+(\[[a-z0-9_=,.:-]*\])?$/i, 'Gecersiz blok kimligi');

export const StructureSchema = z.object({
  structure_name: z.string().min(1).max(100).default('structure'),
  dimensions: z.object({ width: dim, height: dim, depth: dim }),
  palette: z.record(z.string().regex(/^\d+$/), blockId),
  blocks: z
    .array(z.object({ x: int, y: int, z: int, state: int.min(0) }))
    .max(1000000)
    .default([]),
  fills: z
    .array(
      z.object({
        x1: int, y1: int, z1: int,
        x2: int, y2: int, z2: int,
        state: int.min(0),
      })
    )
    .max(10000)
    .optional()
    .default([]),
});

/**
 * Ham (model veya istemci) verisini dogrular ve "fills" -> "blocks" olarak
 * acar. Sinir disi / palette'te olmayan bloklari eler. Cikti her zaman
 * { structure_name, dimensions, palette, blocks } formatindadir.
 */
export function normalizeStructure(raw) {
  const s = StructureSchema.parse(raw);
  const { width, height, depth } = s.dimensions;
  if (width * height * depth > MAX_VOLUME) throw new Error('Yapi cok buyuk');

  // Palet: state 0 = hava, ayrilmistir.
  const palette = {};
  for (const [k, v] of Object.entries(s.palette)) {
    if (k === '0') continue;
    palette[k] = v.includes(':') ? v : `minecraft:${v}`;
  }

  // Dolgu + tekil bloklar bir 3D izgarada birlestirilir (sonraki yazim oncekini ezer).
  const grid = new Map(); // "x,y,z" -> state
  const inBounds = (x, y, z) =>
    x >= 0 && y >= 0 && z >= 0 && x < width && y < height && z < depth;
  const valid = (st) => st === 0 || palette[String(st)] !== undefined;

  for (const f of s.fills) {
    if (!valid(f.state)) continue;
    const [x1, x2] = [Math.min(f.x1, f.x2), Math.max(f.x1, f.x2)];
    const [y1, y2] = [Math.min(f.y1, f.y2), Math.max(f.y1, f.y2)];
    const [z1, z2] = [Math.min(f.z1, f.z2), Math.max(f.z1, f.z2)];
    for (let y = Math.max(0, y1); y <= Math.min(height - 1, y2); y++)
      for (let z = Math.max(0, z1); z <= Math.min(depth - 1, z2); z++)
        for (let x = Math.max(0, x1); x <= Math.min(width - 1, x2); x++)
          grid.set(`${x},${y},${z}`, f.state);
  }
  for (const b of s.blocks) {
    if (!inBounds(b.x, b.y, b.z) || !valid(b.state)) continue;
    grid.set(`${b.x},${b.y},${b.z}`, b.state);
  }

  const blocks = [];
  for (const [key, state] of grid) {
    if (state === 0) continue; // hava
    const [x, y, z] = key.split(',').map(Number);
    blocks.push({ x, y, z, state });
  }
  if (blocks.length === 0) throw new Error('Yapi bos');

  return {
    structure_name: s.structure_name,
    dimensions: s.dimensions,
    palette,
    blocks,
  };
}
