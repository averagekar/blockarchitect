// Minecraft 1.8.9 Classic MCEdit .schematic Generator & Block Downsampler
// WorldEdit 6.x (1.8.9 Spigot / Paper / Hypixel Clones) bu formati dogrudan //schem load ile okur.
import nbt from 'prismarine-nbt';
import zlib from 'node:zlib';

/**
 * 1.13+ Blok Kimliklerini -> 1.8.9 Klasik Blok ID (0..255) ve Metadata (0..15) ikilisine cevirir.
 */
export function modernToLegacy18(blockName, props = {}) {
  const name = blockName.replace(/^minecraft:/, '').toLowerCase();

  // 1. Yun (Wool) - ID 35
  const woolMatch = name.match(/^(white|orange|magenta|light_blue|yellow|lime|pink|gray|light_gray|cyan|purple|blue|brown|green|red|black)_wool$/);
  if (woolMatch) {
    const colors = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray', 'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black'];
    return { id: 35, data: Math.max(0, colors.indexOf(woolMatch[1])) };
  }

  // 2. Beton (Concrete) ve Terracotta (Hardened Clay) -> 1.8.9'da Stained Clay (ID 159) veya Wool (ID 35)
  const concreteMatch = name.match(/^(white|orange|magenta|light_blue|yellow|lime|pink|gray|light_gray|cyan|purple|blue|brown|green|red|black)_(concrete|terracotta|stained_hardened_clay|stained_clay)$/);
  if (concreteMatch) {
    const colors = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray', 'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black'];
    return { id: 159, data: Math.max(0, colors.indexOf(concreteMatch[1])) };
  }

  // 3. Renkli Cam (Stained Glass) - ID 95
  const glassMatch = name.match(/^(white|orange|magenta|light_blue|yellow|lime|pink|gray|light_gray|cyan|purple|blue|brown|green|red|black)_stained_glass$/);
  if (glassMatch) {
    const colors = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray', 'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black'];
    return { id: 95, data: Math.max(0, colors.indexOf(glassMatch[1])) };
  }

  // 4. Renkli Cam Levha (Stained Glass Pane) - ID 160
  const paneMatch = name.match(/^(white|orange|magenta|light_blue|yellow|lime|pink|gray|light_gray|cyan|purple|blue|brown|green|red|black)_stained_glass_pane$/);
  if (paneMatch) {
    const colors = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray', 'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black'];
    return { id: 160, data: Math.max(0, colors.indexOf(paneMatch[1])) };
  }

  // 5. Ahsap Tahtalar (Planks) - ID 5
  if (name.includes('planks')) {
    if (name.includes('spruce')) return { id: 5, data: 1 };
    if (name.includes('birch') || name.includes('cherry') || name.includes('bamboo')) return { id: 5, data: 2 };
    if (name.includes('jungle') || name.includes('mangrove') || name.includes('crimson')) return { id: 5, data: 3 };
    if (name.includes('acacia')) return { id: 5, data: 4 };
    if (name.includes('dark_oak')) return { id: 5, data: 5 };
    if (name.includes('warped')) return { id: 168, data: 2 }; // Dark Prismarine
    return { id: 5, data: 0 }; // Oak
  }

  // 6. Kutukler (Logs) - ID 17 ve ID 162
  if (name.includes('_log') || name.includes('_wood') || name.includes('_stem')) {
    if (name.includes('spruce')) return { id: 17, data: 1 };
    if (name.includes('birch')) return { id: 17, data: 2 };
    if (name.includes('jungle')) return { id: 17, data: 3 };
    if (name.includes('acacia')) return { id: 162, data: 0 };
    if (name.includes('dark_oak')) return { id: 162, data: 1 };
    if (name.includes('crimson') || name.includes('mangrove')) return { id: 112, data: 0 }; // Nether Brick
    if (name.includes('warped')) return { id: 168, data: 1 }; // Prismarine Bricks
    return { id: 17, data: 0 }; // Oak
  }

  // 7. Merdiven Yon ve Yarim Hesabi (Stairs)
  const getStairData = (p) => {
    // 1.8 Stair metadata: 0=east, 1=west, 2=south, 3=north (+4 for upside-down)
    let d = 0;
    if (p.facing === 'west') d = 1;
    else if (p.facing === 'south') d = 2;
    else if (p.facing === 'north') d = 3;
    if (p.half === 'top') d += 4;
    return d;
  };

  if (name.includes('stairs')) {
    const d = getStairData(props);
    if (name.includes('spruce')) return { id: 134, data: d };
    if (name.includes('birch')) return { id: 135, data: d };
    if (name.includes('jungle')) return { id: 136, data: d };
    if (name.includes('acacia')) return { id: 163, data: d };
    if (name.includes('dark_oak')) return { id: 164, data: d };
    if (name.includes('stone_brick') || name.includes('deepslate')) return { id: 109, data: d };
    if (name.includes('brick')) return { id: 108, data: d };
    if (name.includes('nether_brick') || name.includes('blackstone')) return { id: 114, data: d };
    if (name.includes('sandstone')) return { id: 128, data: d };
    if (name.includes('quartz')) return { id: 156, data: d };
    return { id: 67, data: d }; // Cobblestone stairs
  }

  // 8. Basamaklar (Slabs) - ID 44 ve ID 126
  if (name.includes('slab')) {
    const isTop = props.type === 'top' ? 8 : 0;
    if (name.includes('stone_brick') || name.includes('deepslate')) return { id: 44, data: 5 + isTop };
    if (name.includes('sandstone')) return { id: 44, data: 1 + isTop };
    if (name.includes('cobble')) return { id: 44, data: 3 + isTop };
    if (name.includes('brick')) return { id: 44, data: 4 + isTop };
    if (name.includes('nether_brick') || name.includes('blackstone')) return { id: 44, data: 6 + isTop };
    if (name.includes('quartz')) return { id: 44, data: 7 + isTop };
    if (name.includes('spruce')) return { id: 126, data: 1 + isTop };
    if (name.includes('birch')) return { id: 126, data: 2 + isTop };
    if (name.includes('jungle')) return { id: 126, data: 3 + isTop };
    if (name.includes('acacia')) return { id: 126, data: 4 + isTop };
    if (name.includes('dark_oak')) return { id: 126, data: 5 + isTop };
    return { id: 44, data: 0 + isTop }; // Stone slab
  }

  // 9. Modern Bloklar -> 1.8.9 En Yakin Esdeger Tablosu
  const LEGACY_MAP = {
    // Derin kayalar (Deepslate) -> Tas ve Tas Tugla
    deepslate: { id: 1, data: 0 },
    deepslate_bricks: { id: 98, data: 0 },
    cracked_deepslate_bricks: { id: 98, data: 2 },
    deepslate_tiles: { id: 98, data: 0 },
    cobbled_deepslate: { id: 4, data: 0 },
    chiseled_deepslate: { id: 98, data: 3 },
    polished_deepslate: { id: 1, data: 0 },

    // Karatas (Blackstone) -> Obsidyen & Komur Blogu & Nether Tuglasi
    blackstone: { id: 49, data: 0 }, // Obsidian
    polished_blackstone: { id: 173, data: 0 }, // Coal block
    polished_blackstone_bricks: { id: 112, data: 0 }, // Nether brick
    cracked_polished_blackstone_bricks: { id: 112, data: 0 },
    gilded_blackstone: { id: 41, data: 0 }, // Gold block
    crying_obsidian: { id: 49, data: 0 }, // Obsidian

    // Isiklar ve Pariltilar
    shroomlight: { id: 89, data: 0 }, // Glowstone
    sea_lantern: { id: 169, data: 0 }, // Sea Lantern (1.8'de var!)
    glowstone: { id: 89, data: 0 },
    ochre_froglight: { id: 89, data: 0 },
    verdant_froglight: { id: 169, data: 0 },
    pearlescent_froglight: { id: 169, data: 0 },
    end_rod: { id: 50, data: 5 }, // Torch
    lantern: { id: 89, data: 0 },
    soul_lantern: { id: 169, data: 0 },

    // Kristaller & Madenler
    amethyst_block: { id: 22, data: 0 }, // Lapis Lazuli block
    calcite: { id: 155, data: 0 }, // Quartz block
    tuff: { id: 1, data: 5 }, // Andesite
    dripstone_block: { id: 159, data: 12 }, // Brown stained clay
    pointed_dripstone: { id: 101, data: 0 }, // Iron bars
    copper_block: { id: 159, data: 1 }, // Orange clay
    cut_copper: { id: 159, data: 1 },
    exposed_copper: { id: 159, data: 3 },
    weathered_copper: { id: 159, data: 9 },
    oxidized_copper: { id: 168, data: 0 }, // Prismarine
    netherite_block: { id: 173, data: 0 }, // Coal block

    // Temel Dogal Bloklar
    stone: { id: 1, data: 0 },
    granite: { id: 1, data: 1 },
    polished_granite: { id: 1, data: 2 },
    diorite: { id: 1, data: 3 },
    polished_diorite: { id: 1, data: 4 },
    andesite: { id: 1, data: 5 },
    polished_andesite: { id: 1, data: 6 },
    grass_block: { id: 2, data: 0 },
    dirt: { id: 3, data: 0 },
    coarse_dirt: { id: 3, data: 1 },
    podzol: { id: 3, data: 2 },
    cobblestone: { id: 4, data: 0 },
    bedrock: { id: 7, data: 0 },
    water: { id: 9, data: 0 },
    // Guvenlik & Sunucu Koruma: Alevlerde akan lav sunucuyu yakmasin ve lag yapmasin diye renkli cam pane'e cevrilir
    lava: { id: 160, data: 14 }, // Red stained glass pane (flicker fire)
    flowing_lava: { id: 160, data: 1 }, // Orange stained glass pane
    web: { id: 30, data: 0 }, // Cobweb / Orumcek Agi
    cobweb: { id: 30, data: 0 },
    barrier: { id: 166, data: 0 },
    sand: { id: 12, data: 0 },
    red_sand: { id: 12, data: 1 },
    gravel: { id: 13, data: 0 },
    gold_ore: { id: 14, data: 0 },
    iron_ore: { id: 15, data: 0 },
    coal_ore: { id: 16, data: 0 },
    sponge: { id: 19, data: 0 },
    glass: { id: 20, data: 0 },
    lapis_block: { id: 22, data: 0 },
    dispenser: { id: 23, data: 0 },
    sandstone: { id: 24, data: 0 },
    chiseled_sandstone: { id: 24, data: 1 },
    smooth_sandstone: { id: 24, data: 2 },
    gold_block: { id: 41, data: 0 },
    iron_block: { id: 42, data: 0 },
    bricks: { id: 45, data: 0 },
    bookshelf: { id: 47, data: 0 },
    mossy_cobblestone: { id: 48, data: 0 },
    obsidian: { id: 49, data: 0 },
    torch: { id: 50, data: 5 },
    diamond_block: { id: 57, data: 0 },
    crafting_table: { id: 58, data: 0 },
    ice: { id: 79, data: 0 },
    snow_block: { id: 80, data: 0 },
    clay: { id: 82, data: 0 },
    netherrack: { id: 87, data: 0 },
    soul_sand: { id: 88, data: 0 },
    stone_bricks: { id: 98, data: 0 },
    mossy_stone_bricks: { id: 98, data: 1 },
    cracked_stone_bricks: { id: 98, data: 2 },
    chiseled_stone_bricks: { id: 98, data: 3 },
    iron_bars: { id: 101, data: 0 },
    glass_pane: { id: 102, data: 0 },
    nether_bricks: { id: 112, data: 0 },
    end_stone: { id: 121, data: 0 },
    emerald_block: { id: 133, data: 0 },
    beacon: { id: 138, data: 0 },
    cobblestone_wall: { id: 139, data: 0 },
    mossy_cobblestone_wall: { id: 139, data: 1 },
    quartz_block: { id: 155, data: 0 },
    chiseled_quartz_block: { id: 155, data: 1 },
    quartz_pillar: { id: 155, data: 2 },
    stained_hardened_clay: { id: 159, data: 0 },
    hay_block: { id: 170, data: 0 },
    coal_block: { id: 173, data: 0 },
    packed_ice: { id: 174, data: 0 },
    prismarine: { id: 168, data: 0 },
    prismarine_bricks: { id: 168, data: 1 },
    dark_prismarine: { id: 168, data: 2 },
    bone_block: { id: 155, data: 0 }, // Quartz block as solid bone
    magma_block: { id: 89, data: 0 }, // Glowstone/Lava glow
  };

  if (LEGACY_MAP[name]) return LEGACY_MAP[name];

  // Hicbir sey uyusmuyorsa tas blogu ver
  return { id: 1, data: 0 };
}

/**
 * 1.8.9 Klasik MCEdit / WorldEdit 6 .schematic NBT dosyasini olusturur.
 * Boyut Sirasi: (y * length + z) * width + x
 */
export function structureToLegacySchematic(structure) {
  const { width, height, depth } = structure.dimensions; // width: X, height: Y, depth: Z (Length)
  const totalBlocks = width * height * depth;

  const blocksArray = new Uint8Array(totalBlocks);
  const dataArray = new Uint8Array(totalBlocks);

  // Palet haritasi: state id -> { id: number, data: number }
  const stateToLegacy = new Map();
  for (const [stateKey, blockName] of Object.entries(structure.palette)) {
    // Props ayristir
    const m = blockName.match(/^([^\[]+)(?:\[(.*)\])?$/);
    const baseName = m ? m[1] : blockName;
    const propStr = m && m[2] ? m[2] : '';
    const props = {};
    if (propStr) {
      for (const pair of propStr.split(',')) {
        const [k, v] = pair.split('=');
        if (k && v) props[k.trim()] = v.trim();
      }
    }
    stateToLegacy.set(Number(stateKey), modernToLegacy18(baseName, props));
  }

  // Bloklari MCEdit dizisine yerlestir
  for (const b of structure.blocks) {
    if (b.x < 0 || b.x >= width || b.y < 0 || b.y >= height || b.z < 0 || b.z >= depth) continue;
    const index = (b.y * depth + b.z) * width + b.x;
    const leg = stateToLegacy.get(b.state) || { id: 1, data: 0 };
    blocksArray[index] = leg.id;
    dataArray[index] = leg.data;
  }

  // NBT Yapisi (Classic WorldEdit MCEdit format)
  // ByteArray isaretli sayilar bekledigi icin Int8Array'e map ediyoruz
  const signedBlocks = Array.from(blocksArray).map((b) => (b << 24) >> 24);
  const signedData = Array.from(dataArray).map((b) => (b << 24) >> 24);

  const root = {
    type: 'compound',
    name: 'Schematic',
    value: {
      Width: { type: 'short', value: width },
      Height: { type: 'short', value: height },
      Length: { type: 'short', value: depth },
      Materials: { type: 'string', value: 'Alpha' },
      Blocks: { type: 'byteArray', value: signedBlocks },
      Data: { type: 'byteArray', value: signedData },
      Entities: { type: 'list', value: { type: 'compound', value: [] } },
      TileEntities: { type: 'list', value: { type: 'compound', value: [] } },
    },
  };

  return zlib.gzipSync(nbt.writeUncompressed(root, 'big'));
}
