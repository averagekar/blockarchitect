// Doku kullanmadan blok kimliginden yuksek kaliteli renk ve malzeme ozellikleri uretir.
const RULES = [
  // Cam, su, buz ve saydamlar
  [/light_blue_stained_glass/, '#66b8d9'],
  [/blue_stained_glass/, '#2d4da8'],
  [/cyan_stained_glass/, '#1c8899'],
  [/stained_glass/, '#a0c0d0'],
  [/glass/, '#a8d8e8'],
  [/ice/, '#9ec9f5'],
  [/water/, '#3f76e4'],
  [/lava/, '#e8661a'],

  // Isik ve organik pariltilar
  [/shroomlight/, '#f3923c'],
  [/sea_lantern/, '#a4d5ce'],
  [/glowstone/, '#f6d56a'],
  [/lantern|torch/, '#ffc83b'],
  [/magma_block/, '#8f3316'],
  [/crying_obsidian/, '#47146b'],
  [/obsidian/, '#15111e'],
  [/sculk/, '#0a1d24'],
  [/bone_block/, '#e2dcce'],

  // Prizmarin ailesi
  [/dark_prismarine/, '#335e58'],
  [/prismarine_brick/, '#63ab9e'],
  [/prismarine/, '#589c93'],

  // Tas ve koyu kayaclar
  [/blackstone/, '#26222b'],
  [/deepslate_brick/, '#3a3a40'],
  [/deepslate_tile/, '#303036'],
  [/deepslate/, '#44444a'],
  [/bedrock/, '#1a1a1c'],
  [/basalt/, '#3f3e45'],
  [/stone_brick/, '#787878'],
  [/cobblestone/, '#7a7a7a'],
  [/smooth_stone/, '#969696'],
  [/stone/, '#848484'],
  [/andesite/, '#888888'],
  [/diorite/, '#cfcfcb'],
  [/granite/, '#946755'],
  [/tuff/, '#5c5b56'],
  [/sandstone/, '#d6c896'],
  [/red_sandstone/, '#b85e2b'],
  [/brick/, '#964d3b'],

  // Renkli bloklar (Once spesifik iki kelimeliler!)
  [/light_blue_concrete_powder|light_blue_concrete|light_blue_wool/, '#3aaad9'],
  [/light_blue_terracotta|light_blue_glazed_terracotta/, '#708cb8'],
  [/light_gray_concrete|light_gray_wool/, '#8c8d8b'],
  [/light_gray_terracotta/, '#98837a'],
  [/gray_concrete|gray_wool/, '#46494e'],
  [/gray_terracotta/, '#574239'],
  [/black_concrete|black_wool/, '#141518'],
  [/black_concrete_powder/, '#1e1f23'],
  [/black_terracotta/, '#251610'],
  [/white_concrete|white_wool/, '#e8eaec'],
  [/white_concrete_powder/, '#eaebee'],
  [/white_terracotta/, '#d1b1a1'],
  [/blue_concrete|blue_wool/, '#2c43a3'],
  [/blue_terracotta|blue_glazed_terracotta/, '#4a4168'],
  [/cyan_concrete|cyan_wool/, '#157788'],
  [/cyan_terracotta/, '#575b5b'],
  [/red_concrete|red_wool/, '#a22929'],
  [/red_terracotta/, '#8f3d2e'],
  [/orange_concrete|orange_wool/, '#e06110'],
  [/orange_terracotta/, '#a15325'],
  [/yellow_concrete|yellow_wool/, '#e5b922'],
  [/yellow_terracotta/, '#b88225'],
  [/lime_concrete|lime_wool/, '#6db421'],
  [/lime_terracotta/, '#677535'],
  [/green_concrete|green_wool/, '#496b24'],
  [/green_terracotta/, '#4c532a'],
  [/purple_concrete|purple_wool/, '#6d2c91'],
  [/purple_terracotta/, '#764656'],
  [/magenta_concrete|magenta_wool/, '#aa3292'],
  [/magenta_terracotta/, '#95586c'],
  [/pink_concrete|pink_wool/, '#d86588'],
  [/pink_terracotta/, '#a14e4e'],
  [/brown_concrete|brown_wool/, '#603b20'],
  [/brown_terracotta/, '#4d3323'],

  // Odunlar ve dogal bitki ortusu
  [/dark_oak/, '#3c2712'],
  [/spruce/, '#684e2e'],
  [/birch/, '#d5c78f'],
  [/jungle/, '#9c734e'],
  [/acacia/, '#ad5d37'],
  [/mangrove/, '#743637'],
  [/cherry/, '#e5b1bd'],
  [/bamboo/, '#c4b54d'],
  [/crimson/, '#792f4f'],
  [/warped/, '#2b7c75'],
  [/oak|log|wood|planks/, '#9f7e4b'],
  [/grass_block|grass/, '#589634'],
  [/dirt|dirt_path|farmland/, '#735234'],
  [/leaves|moss/, '#3c7529'],

  // Madenler ve metaller
  [/iron|chain|anvil/, '#bcbcbc'],
  [/gold/, '#f2c53d'],
  [/copper/, '#c17654'],
  [/diamond/, '#5decf0'],
  [/emerald/, '#17dd62'],
  [/lapis/, '#1e438c'],
  [/netherite/, '#423d3f'],
  [/quartz/, '#eae4dc'],
  [/snow/, '#f5fafb'],
  [/netherrack/, '#682a2a'],
];

export function cleanId(id) {
  if (!id) return 'air';
  return String(id).replace(/^minecraft:/, '').replace(/\[.*\]$/, '');
}

export function colorFor(id) {
  const name = cleanId(id);
  for (const [re, color] of RULES) {
    if (re.test(name)) return color;
  }
  // Bilinmeyen bloklar icin kararli HSL rengi
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return `hsl(${h % 360} 35% 52%)`;
}

export const isTransparent = (id) => /glass|ice|water/.test(cleanId(id));
