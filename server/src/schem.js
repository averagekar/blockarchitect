// ADIM 2 - Sponge Schematic v2 (.schem) uretici.
// WorldEdit / FAWE / Litematica(import) / Axiom bu formati dogrudan okur.
import nbt from 'prismarine-nbt';
import zlib from 'node:zlib';

const DATA_VERSION = Number(process.env.MC_DATA_VERSION || 3955);

/** Pozitif tam sayiyi Minecraft VarInt baytlarina cevirir. */
function pushVarInt(out, value) {
  let v = value >>> 0;
  while (v > 0x7f) {
    out.push((v & 0x7f) | 0x80);
    v >>>= 7;
  }
  out.push(v);
}

/**
 * Normalize edilmis yapiyi (bkz. validate.js) gzip'li .schem Buffer'ina cevirir.
 * Blok sirasi (spec): index = x + z * Width + y * Width * Length
 */
export function structureToSchem(structure) {
  const { width, height, depth } = structure.dimensions; // depth == Length (Z)

  // 1) Palet: benzersiz blok adlari -> 0..N. 0 daima minecraft:air.
  const nameToIndex = new Map([['minecraft:air', 0]]);
  const stateToIndex = new Map([[0, 0]]);
  for (const [stateKey, name] of Object.entries(structure.palette)) {
    if (!nameToIndex.has(name)) nameToIndex.set(name, nameToIndex.size);
    stateToIndex.set(Number(stateKey), nameToIndex.get(name));
  }

  // 2) 3D matrisi duz diziye yaz (varsayilan 0 = hava).
  const grid = new Uint32Array(width * height * depth);
  for (const b of structure.blocks) {
    grid[b.x + b.z * width + b.y * width * depth] = stateToIndex.get(b.state) ?? 0;
  }

  // 3) VarInt ile kodla; NBT ByteArray isaretli bayt bekler.
  const bytes = [];
  for (const idx of grid) pushVarInt(bytes, idx);
  const blockData = bytes.map((b) => (b << 24) >> 24);

  // 4) NBT agaci. Kok etiketin adi "Schematic" olmalidir.
  const paletteTag = {};
  for (const [name, index] of nameToIndex) paletteTag[name] = { type: 'int', value: index };

  const root = {
    type: 'compound',
    name: 'Schematic',
    value: {
      Version: { type: 'int', value: 2 },
      DataVersion: { type: 'int', value: DATA_VERSION },
      Metadata: {
        type: 'compound',
        value: {
          Name: { type: 'string', value: structure.structure_name },
          Author: { type: 'string', value: 'BlockArchitect AI' },
        },
      },
      Width: { type: 'short', value: width },
      Height: { type: 'short', value: height },
      Length: { type: 'short', value: depth },
      Offset: { type: 'intArray', value: [0, 0, 0] },
      PaletteMax: { type: 'int', value: nameToIndex.size },
      Palette: { type: 'compound', value: paletteTag },
      BlockData: { type: 'byteArray', value: blockData },
      BlockEntities: { type: 'list', value: { type: 'compound', value: [] } },
    },
  };

  // 5) Big-endian NBT -> GZIP (.schem dosyalari gzip'lidir).
  return zlib.gzipSync(nbt.writeUncompressed(root, 'big'));
}
