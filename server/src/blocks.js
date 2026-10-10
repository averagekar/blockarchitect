// Gecerli (Java 1.21.1) blok kimlikleri. Model sadece bunlari kullanabilir;
// bilinmeyen kimlikler builder tarafindan guvenli bir benzeriyle degistirilir,
// boylece .schem dosyasi WorldEdit'te her zaman sorunsuz yuklenir.

export const WOOD_TYPES = ['oak', 'spruce', 'birch', 'jungle', 'acacia', 'dark_oak', 'mangrove', 'cherry'];
export const NETHER_WOOD = ['crimson', 'warped'];
export const COLORS = ['white', 'light_gray', 'gray', 'black', 'brown', 'red', 'orange', 'yellow', 'lime', 'green', 'cyan', 'light_blue', 'blue', 'purple', 'magenta', 'pink'];

const WOOD_SHAPES = ['planks', 'stairs', 'slab', 'fence', 'fence_gate', 'door', 'trapdoor', 'button', 'pressure_plate', 'sign', 'wall_sign', 'hanging_sign', 'wall_hanging_sign'];

// [tam blok, stairs/slab/wall icin kok ad, sekiller]
const SSW = ['stairs', 'slab', 'wall'];
const SS = ['stairs', 'slab'];
export const FAMILIES = [
  ['stone', 'stone', SS], ['cobblestone', 'cobblestone', SSW], ['mossy_cobblestone', 'mossy_cobblestone', SSW],
  ['stone_bricks', 'stone_brick', SSW], ['mossy_stone_bricks', 'mossy_stone_brick', SSW], ['smooth_stone', 'smooth_stone', ['slab']],
  ['andesite', 'andesite', SSW], ['diorite', 'diorite', SSW], ['granite', 'granite', SSW],
  ['polished_andesite', 'polished_andesite', SS], ['polished_diorite', 'polished_diorite', SS], ['polished_granite', 'polished_granite', SS],
  ['bricks', 'brick', SSW], ['mud_bricks', 'mud_brick', SSW],
  ['sandstone', 'sandstone', SSW], ['smooth_sandstone', 'smooth_sandstone', SS], ['cut_sandstone', 'cut_sandstone', ['slab']],
  ['red_sandstone', 'red_sandstone', SSW], ['smooth_red_sandstone', 'smooth_red_sandstone', SS], ['cut_red_sandstone', 'cut_red_sandstone', ['slab']],
  ['nether_bricks', 'nether_brick', [...SSW, 'fence']], ['red_nether_bricks', 'red_nether_brick', SSW],
  ['deepslate_bricks', 'deepslate_brick', SSW], ['deepslate_tiles', 'deepslate_tile', SSW],
  ['cobbled_deepslate', 'cobbled_deepslate', SSW], ['polished_deepslate', 'polished_deepslate', SSW],
  ['blackstone', 'blackstone', SSW], ['polished_blackstone', 'polished_blackstone', SSW], ['polished_blackstone_bricks', 'polished_blackstone_brick', SSW],
  ['quartz_block', 'quartz', SS], ['smooth_quartz', 'smooth_quartz', SS],
  ['prismarine', 'prismarine', SSW], ['prismarine_bricks', 'prismarine_brick', SS], ['dark_prismarine', 'dark_prismarine', SS],
  ['purpur_block', 'purpur', SS], ['end_stone_bricks', 'end_stone_brick', SSW],
  ['tuff', 'tuff', SSW], ['tuff_bricks', 'tuff_brick', SSW], ['polished_tuff', 'polished_tuff', SSW],
  ['cut_copper', 'cut_copper', SS], ['exposed_cut_copper', 'exposed_cut_copper', SS],
  ['weathered_cut_copper', 'weathered_cut_copper', SS], ['oxidized_cut_copper', 'oxidized_cut_copper', SS],
  ['bamboo_mosaic', 'bamboo_mosaic', SS],
];

const COLOR_BLOCKS = ['concrete', 'concrete_powder', 'wool', 'carpet', 'terracotta', 'glazed_terracotta', 'stained_glass', 'stained_glass_pane', 'bed', 'banner', 'wall_banner', 'candle', 'shulker_box'];

const MISC = `stone dirt grass_block coarse_dirt rooted_dirt podzol mycelium dirt_path farmland gravel sand red_sand clay mud packed_mud
snow snow_block powder_snow ice packed_ice blue_ice water lava obsidian crying_obsidian netherrack soul_sand soul_soil magma_block
basalt polished_basalt smooth_basalt gilded_blackstone end_stone deepslate calcite dripstone_block pointed_dripstone amethyst_block moss_block moss_carpet terracotta
cracked_stone_bricks chiseled_stone_bricks cracked_deepslate_bricks cracked_deepslate_tiles chiseled_deepslate chiseled_sandstone chiseled_red_sandstone
chiseled_quartz_block quartz_pillar quartz_bricks cracked_nether_bricks chiseled_nether_bricks cracked_polished_blackstone_bricks chiseled_polished_blackstone
chiseled_tuff chiseled_tuff_bricks purpur_pillar
iron_block gold_block copper_block exposed_copper weathered_copper oxidized_copper diamond_block emerald_block lapis_block redstone_block coal_block netherite_block raw_iron_block raw_copper_block raw_gold_block
glass glass_pane tinted_glass iron_bars chain iron_door iron_trapdoor
torch wall_torch soul_torch soul_wall_torch lantern soul_lantern campfire soul_campfire glowstone sea_lantern shroomlight jack_o_lantern redstone_lamp end_rod candle
ochre_froglight verdant_froglight pearlescent_froglight
bookshelf chiseled_bookshelf crafting_table furnace blast_furnace smoker chest trapped_chest ender_chest barrel anvil chipped_anvil damaged_anvil grindstone loom
cartography_table fletching_table smithing_table stonecutter brewing_stand cauldron water_cauldron composter lectern bell hay_block bone_block melon pumpkin carved_pumpkin cake
flower_pot ladder scaffolding lever stone_button stone_pressure_plate rail powered_rail cobweb enchanting_table jukebox note_block beacon lodestone target beehive bee_nest
honey_block honeycomb_block sponge slime_block hopper dispenser dropper piston sticky_piston observer daylight_detector lightning_rod decorated_pot
dandelion poppy blue_orchid allium azure_bluet red_tulip orange_tulip white_tulip pink_tulip oxeye_daisy cornflower lily_of_the_valley sunflower lilac rose_bush peony
short_grass tall_grass fern large_fern vine azalea flowering_azalea azalea_leaves flowering_azalea_leaves lily_pad sugar_cane wheat carrots potatoes beetroots
melon_stem pumpkin_stem sweet_berry_bush bamboo cactus dead_bush brown_mushroom red_mushroom brown_mushroom_block red_mushroom_block mushroom_stem
big_dripleaf small_dripleaf spore_blossom glow_lichen hanging_roots mangrove_roots muddy_mangrove_roots kelp seagrass tall_seagrass
oak_sapling spruce_sapling birch_sapling jungle_sapling acacia_sapling dark_oak_sapling cherry_sapling nether_wart_block warped_wart_block
potted_dandelion potted_poppy potted_blue_orchid potted_allium potted_azure_bluet potted_red_tulip potted_oxeye_daisy potted_cornflower potted_fern
potted_oak_sapling potted_spruce_sapling potted_bamboo potted_cactus`.split(/\s+/);

const KNOWN = new Set();
const add = (...names) => names.forEach((n) => KNOWN.add(`minecraft:${n}`));

for (const w of WOOD_TYPES) {
  WOOD_SHAPES.forEach((s) => add(`${w}_${s}`));
  add(`${w}_log`, `${w}_wood`, `stripped_${w}_log`, `stripped_${w}_wood`, `${w}_leaves`);
}
for (const n of NETHER_WOOD) {
  WOOD_SHAPES.forEach((s) => add(`${n}_${s}`));
  add(`${n}_stem`, `${n}_hyphae`, `stripped_${n}_stem`, `stripped_${n}_hyphae`);
}
WOOD_SHAPES.forEach((s) => add(`bamboo_${s}`));
add('bamboo_block', 'stripped_bamboo_block');
for (const [full, stem, shapes] of FAMILIES) {
  add(full);
  shapes.forEach((s) => add(`${stem}_${s}`));
}
for (const c of COLORS) COLOR_BLOCKS.forEach((b) => add(`${c}_${b}`));
add(...MISC);

export const isKnownBlock = (name) => KNOWN.has(name);

/** Bilinmeyen bir blok icin ayni ailede guvenli bir yedek. */
export function fallbackBlock(name) {
  const n = name.replace('minecraft:', '');
  const rules = [
    [/_stairs$/, 'cobblestone_stairs'], [/_slab$/, 'cobblestone_slab'], [/_wall$/, 'cobblestone_wall'],
    [/_fence_gate$/, 'oak_fence_gate'], [/_fence$/, 'oak_fence'], [/_trapdoor$/, 'oak_trapdoor'], [/_door$/, 'oak_door'],
    [/_pane$/, 'glass_pane'], [/glass$/, 'glass'], [/_planks$/, 'oak_planks'], [/_log$|_wood$/, 'oak_log'],
    [/_leaves$/, 'oak_leaves'], [/lantern$/, 'lantern'], [/torch$/, 'torch'],
  ];
  for (const [re, fb] of rules) if (re.test(n)) return `minecraft:${fb}`;
  return 'minecraft:stone_bricks';
}

/** minecraft:spruce_stairs -> minecraft:spruce_planks (cati sirti blogu). */
export function stairToFull(stairName) {
  const stem = stairName.replace(/^minecraft:/, '').replace(/_(stairs|slab)$/, '');
  const plural = {
    stone_brick: 'stone_bricks', mossy_stone_brick: 'mossy_stone_bricks', brick: 'bricks', mud_brick: 'mud_bricks',
    nether_brick: 'nether_bricks', red_nether_brick: 'red_nether_bricks', deepslate_brick: 'deepslate_bricks',
    deepslate_tile: 'deepslate_tiles', polished_blackstone_brick: 'polished_blackstone_bricks',
    prismarine_brick: 'prismarine_bricks', end_stone_brick: 'end_stone_bricks', tuff_brick: 'tuff_bricks',
    quartz: 'quartz_block', purpur: 'purpur_block',
  };
  if (plural[stem]) return `minecraft:${plural[stem]}`;
  if ([...WOOD_TYPES, ...NETHER_WOOD, 'bamboo'].includes(stem)) return `minecraft:${stem}_planks`;
  return `minecraft:${stem}`;
}

/** Sistem istemine girecek kisa katalog. */
export function describeCatalog() {
  const stemLines = FAMILIES.filter(([, , s]) => s.length)
    .map(([full, stem, shapes]) => `${full} -> ${stem}_{${shapes.join('|')}}`)
    .join('; ');
  return [
    `WOOD (${WOOD_TYPES.join(', ')}): T_planks, T_stairs, T_slab, T_fence, T_fence_gate, T_door, T_trapdoor, T_button, T_pressure_plate, T_sign, T_wall_sign, T_hanging_sign, T_log, T_wood, stripped_T_log, stripped_T_wood, T_leaves.`,
    `NETHER WOOD (${NETHER_WOOD.join(', ')}): same shapes but T_stem / T_hyphae instead of log / wood. BAMBOO: bamboo_planks (+shapes), bamboo_block, stripped_bamboo_block.`,
    `STONE FAMILIES (full block -> shapes): ${stemLines}.`,
    `COLORS (${COLORS.join(', ')}): C_concrete, C_concrete_powder, C_wool, C_carpet, C_terracotta, C_glazed_terracotta, C_stained_glass, C_stained_glass_pane, C_bed, C_banner, C_candle, C_shulker_box.`,
    `OTHER BLOCKS: ${MISC.join(' ')}.`,
  ].join('\n');
}
