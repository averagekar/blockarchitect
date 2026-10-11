// Master Architectural Presets (Hazir Ust Seviye Sablonlar)
// AI beklemeden 0ms'de kusursuz mimari derleyen veya prompt olarak yuklenebilen basyapitlar.

export const MASTER_PRESETS = {
  nova_citadel: {
    structure_name: 'Grand NOVA Spawn Citadel',
    materials: {
      foundation: '60%minecraft:polished_blackstone_bricks,30%minecraft:blackstone,10%minecraft:cracked_polished_blackstone_bricks',
      gilded: '60%minecraft:gilded_blackstone,40%minecraft:gold_block',
      gold_face: 'minecraft:gold_block',
      dark_depth: 'minecraft:polished_blackstone',
      neon_glow: 'minecraft:sea_lantern',
      obsidian_arch: 'minecraft:crying_obsidian',
      flame_glow: 'minecraft:shroomlight',
      crystal: 'minecraft:amethyst_block',
      scales: '60%minecraft:black_concrete,30%minecraft:crying_obsidian,10%minecraft:polished_blackstone',
      horn: 'minecraft:bone_block',
      fire: '40%minecraft:orange_stained_glass_pane,35%minecraft:red_stained_glass_pane,15%minecraft:yellow_stained_glass_pane,10%minecraft:web'
    },
    ops: [
      // 1. Dairesel Buyuk PvP Spawn Meydani (1.8.9 ve 1.21 uyumlu)
      { op: 'cylinder', cx: 0, cz: 0, y: 0, radius: 48, height: 3, block: 'foundation', axis: 'y' },
      { op: 'cylinder', cx: 0, cz: 0, y: 3, radius: 42, height: 2, block: 'gilded', axis: 'y' },
      { op: 'torus', cx: 0, cy: 5, cz: 0, R: 38, r: 1.8, axis: 'y', block: 'neon_glow' },

      // 2. Anitsal Sarp Kaide (Yazinin oturdugu taht)
      { op: 'fill', x1: -32, y1: 5, z1: -8, x2: 32, y2: 12, z2: 12, block: 'foundation' },
      { op: 'fill', x1: -28, y1: 12, z1: -6, x2: 28, y2: 15, z2: 10, block: 'gilded' },

      // 3. Devasa Portalli Obsidyen Halo ve Isik Halkasi
      { op: 'torus', cx: 0, cy: 36, cz: -6, R: 28, r: 3.5, axis: 'z', block: 'obsidian_arch' },
      { op: 'torus', cx: 0, cy: 36, cz: -4, R: 24, r: 1.8, axis: 'z', block: 'gilded' },
      { op: 'torus', cx: 0, cy: 36, cz: -2, R: 18, r: 1.2, axis: 'z', block: 'neon_glow' },

      // 4. Sag ve Sol Muhafiz Gotik Kuleler (x=0 ile aynalanir)
      { op: 'tapered_cylinder', x1: -38, y1: 5, z1: 0, x2: -42, y2: 52, z2: -2, r1: 5.5, r2: 1.0, block: 'foundation' },
      { op: 'curve', points: [[-42, 52, -2], [-38, 64, -2], [-32, 72, 0]], r1: 2.2, r2: 0.6, block: 'crystal' },
      { op: 'tapered_cylinder', x1: -28, y1: 8, z1: 16, x2: -32, y2: 42, z2: 14, r1: 4.0, r2: 0.8, block: 'foundation' },
      { op: 'ellipsoid', cx: -32, cy: 45, cz: 14, rx: 2.5, ry: 4.5, rz: 2.5, block: 'flame_glow' },

      // 5. Kanatli Gotik Destek Kemeri
      { op: 'curve', points: [[-44, 15, -6], [-38, 30, -6], [-26, 44, -4], [-14, 50, -4]], r1: 2.2, r2: 1.2, block: 'gilded' },
      { op: 'membrane', p1: [-38, 30, -6], p2: [-26, 44, -4], p3: [-32, 22, -5], thickness: 1, block: 'neon_glow' },

      // Sol tarafi saga aynala (YAZIDAN ONCE!)
      { op: 'mirror', axis: 'x', at: 0 },

      // 6. HEROIC 7x9 "NOVA" 3D LOGOSU (Aynadan korunmus, multi-layer kabartmali ve alt kaideli!)
      {
        op: 'text_3d',
        text: 'NOVA',
        cx: 0,
        y: 20,
        cz: 4,
        scale: 3,
        depth: 4,
        arch: 2.5,
        block: 'gold_face',
        depth_block: 'dark_depth',
        outline: 'dark_depth',
        pedestal: true,
        facing: 'south'
      },

      // 7. Altina Pariltili Isik Seridi ve Basamaklar
      { op: 'fill', x1: -30, y1: 18, z1: 1, x2: 30, y2: 19, z2: 3, block: 'neon_glow' },
      { op: 'staircase', x: -14, y: 0, z: 48, dir: 'north', steps: 16, width: 28, block: 'minecraft:polished_blackstone_brick_stairs', support: 'foundation' }
    ]
  },

  infernal_dragon: {
    structure_name: 'Colossal Infernal Dragon',
    materials: {
      rock: '60%minecraft:blackstone,30%minecraft:deepslate,10%minecraft:crying_obsidian',
      scales: '60%minecraft:black_concrete,30%minecraft:crying_obsidian,10%minecraft:polished_blackstone',
      belly: '60%minecraft:red_concrete,30%minecraft:orange_concrete,10%minecraft:red_stained_hardened_clay',
      bone: 'minecraft:bone_block',
      wing_bone: 'minecraft:polished_blackstone',
      wing_skin: '50%minecraft:red_stained_glass,30%minecraft:orange_stained_glass,20%minecraft:crying_obsidian',
      // PRO BUILDER FORMULA: Lav yerine katmanli ince camlar + orumcek agi dumani + parlak kor
      fire: '45%minecraft:orange_stained_glass_pane,30%minecraft:red_stained_glass_pane,15%minecraft:yellow_stained_glass_pane,10%minecraft:web',
      fire_core: 'minecraft:glowstone',
      smoke: '70%minecraft:web,30%minecraft:light_gray_stained_glass_pane',
      glow: 'minecraft:shroomlight'
    },
    ops: [
      // 1. Zemin Taburu (40x40 Kayalik)
      { op: 'terrain', cx: 0, cz: 18, y: 0, rx: 42, rz: 42, height: 10, roughness: 0.65, block: 'rock' },

      // 2. Ana Govde ve Gogus
      { op: 'ellipsoid', cx: 0, cy: 18, cz: 14, rx: 9, ry: 8, rz: 16, block: 'scales' },
      { op: 'ellipsoid', cx: 0, cy: 14, cz: 14, rx: 7, ry: 4.5, rz: 14, block: 'belly' },

      // 3. Sag On Bacak & Zemine Kenetlenen Pence
      { op: 'curve', points: [[8, 18, 20], [14, 11, 23], [16, 5, 25], [16, 1, 25]], r1: 3.5, r2: 2.0, block: 'scales' },
      { op: 'cone_3d', x1: 16, y1: 3, z1: 25, x2: 17, y2: 0, z2: 30, r1: 1.4, r2: 0.2, block: 'bone' },
      { op: 'cone_3d', x1: 14, y1: 3, z1: 25, x2: 14, y2: 0, z2: 30, r1: 1.2, r2: 0.2, block: 'bone' },

      // 4. Sag Arka Bacak & Guclu Uyluk
      { op: 'ellipsoid', cx: 10, cy: 16, cz: 4, rx: 5.0, ry: 6.5, rz: 5.0, block: 'scales' },
      { op: 'tapered_cylinder', x1: 10, y1: 12, z1: 4, x2: 13, y2: 3, z2: 1, r1: 2.8, r2: 1.6, block: 'scales' },
      { op: 'cone_3d', x1: 13, y1: 3, z1: 1, x2: 15, y2: 0, z2: 5, r1: 1.2, r2: 0.2, block: 'bone' },

      // 5. S-Kavisli Boyun ve Bas
      { op: 'curve', points: [[0, 20, 25], [0, 30, 32], [0, 42, 30], [0, 48, 40]], r1: 5.5, r2: 3.5, block: 'scales' },
      { op: 'ellipsoid', cx: 0, cy: 49, cz: 44, rx: 5.2, ry: 4.5, rz: 7.5, block: 'scales' },
      { op: 'tapered_cylinder', x1: 0, y1: 48, z1: 48, x2: 0, y2: 47, z2: 58, r1: 3.5, r2: 2.0, block: 'scales' },
      { op: 'tapered_cylinder', x1: 0, y1: 44, z1: 48, x2: 0, y2: 43, z2: 55, r1: 2.5, r2: 1.4, block: 'belly' },
      { op: 'set', x: 4, y: 50, z: 47, block: 'glow' },
      { op: 'set', x: -4, y: 50, z: 47, block: 'glow' },

      // 6. Boynuzlar
      { op: 'cone_3d', x1: 3.5, y1: 52, z1: 42, x2: 8, y2: 64, z2: 30, r1: 2.0, r2: 0.3, block: 'bone' },
      { op: 'cone_3d', x1: -3.5, y1: 52, z1: 42, x2: -8, y2: 64, z2: 30, r1: 2.0, r2: 0.3, block: 'bone' },

      // 7. Kuyruk
      { op: 'curve', points: [[0, 17, 0], [0, 14, -14], [8, 16, -28], [-8, 18, -44], [0, 22, -58]], r1: 4.8, r2: 0.9, block: 'scales' },

      // 8. Sag Kanat
      { op: 'curve', points: [[7, 23, 16], [32, 44, 14], [56, 54, 8]], r1: 3.5, r2: 1.4, block: 'wing_bone' },
      { op: 'tapered_cylinder', x1: 32, y1: 44, z1: 14, x2: 46, y2: 28, z2: 12, r1: 1.8, r2: 0.7, block: 'wing_bone' },
      { op: 'tapered_cylinder', x1: 56, y1: 54, z1: 8, x2: 64, y2: 35, z2: 7, r1: 1.4, r2: 0.4, block: 'wing_bone' },
      { op: 'membrane', p1: [7, 23, 16], p2: [32, 44, 14], p3: [46, 28, 12], thickness: 1, block: 'wing_skin' },
      { op: 'membrane', p1: [32, 44, 14], p2: [56, 54, 8], p3: [64, 35, 7], p4: [46, 28, 12], thickness: 1, block: 'wing_skin' },

      // 9. Aynala (Sol kanat, bacaklar ve boynuzlar simetrik olusur)
      { op: 'mirror', axis: 'x', at: 0 },

      // 10. Agizdan 35 Blok Ileriye Genisleyen Lavsiz Ince Cam & Ag Alev Konisi
      // A) Ic Sicak Kor
      { op: 'cone_3d', x1: 0, y1: 46, z1: 58, x2: 0, y2: 40, z2: 74, r1: 1.2, r2: 4.0, block: 'fire_core' },
      // B) Ana Alev Dilleri (Renkli Ince Camlar: Kirmizi, Turuncu, Sari & Ag)
      { op: 'cone_3d', x1: 0, y1: 46, z1: 58, x2: 0, y2: 38, z2: 92, r1: 2.2, r2: 14, block: 'fire' },
      // C) Uclarda Havaya Karisan Ag Dumani
      { op: 'cone_3d', x1: 0, y1: 38, z1: 86, x2: 0, y2: 36, z2: 98, r1: 8.0, r2: 16, block: 'smoke' }
    ]
  },

  // 1.8.9 ICIN OZEL TASARLANMIS SAF 1.8 PRESETLERI:
  nova_citadel_18: {
    structure_name: 'Grand NOVA Spawn Citadel (1.8.9)',
    materials: {
      foundation: '60%minecraft:stone_bricks,30%minecraft:obsidian,10%minecraft:cracked_stone_bricks',
      gilded: '60%minecraft:gold_block,40%minecraft:coal_block',
      gold_face: 'minecraft:gold_block',
      dark_depth: 'minecraft:obsidian',
      neon_glow: 'minecraft:sea_lantern',
      obsidian_arch: 'minecraft:obsidian',
      flame_glow: 'minecraft:glowstone',
      crystal: 'minecraft:lapis_block',
      scales: '60%minecraft:black_stained_hardened_clay,30%minecraft:obsidian,10%minecraft:coal_block',
      fire: '45%minecraft:orange_stained_glass_pane,35%minecraft:red_stained_glass_pane,10%minecraft:yellow_stained_glass_pane,10%minecraft:web'
    },
    ops: [
      { op: 'cylinder', cx: 0, cz: 0, y: 0, radius: 48, height: 3, block: 'foundation', axis: 'y' },
      { op: 'cylinder', cx: 0, cz: 0, y: 3, radius: 42, height: 2, block: 'gilded', axis: 'y' },
      { op: 'torus', cx: 0, cy: 5, cz: 0, R: 38, r: 1.8, axis: 'y', block: 'neon_glow' },
      { op: 'fill', x1: -32, y1: 5, z1: -8, x2: 32, y2: 12, z2: 12, block: 'foundation' },
      { op: 'fill', x1: -28, y1: 12, z1: -6, x2: 28, y2: 15, z2: 10, block: 'gilded' },
      { op: 'torus', cx: 0, cy: 36, cz: -6, R: 28, r: 3.5, axis: 'z', block: 'obsidian_arch' },
      { op: 'torus', cx: 0, cy: 36, cz: -4, R: 24, r: 1.8, axis: 'z', block: 'gilded' },
      { op: 'torus', cx: 0, cy: 36, cz: -2, R: 18, r: 1.2, axis: 'z', block: 'neon_glow' },
      { op: 'tapered_cylinder', x1: -38, y1: 5, z1: 0, x2: -42, y2: 52, z2: -2, r1: 5.5, r2: 1.0, block: 'foundation' },
      { op: 'curve', points: [[-42, 52, -2], [-38, 64, -2], [-32, 72, 0]], r1: 2.2, r2: 0.6, block: 'crystal' },
      { op: 'tapered_cylinder', x1: -28, y1: 8, z1: 16, x2: -32, y2: 42, z2: 14, r1: 4.0, r2: 0.8, block: 'foundation' },
      { op: 'ellipsoid', cx: -32, cy: 45, cz: 14, rx: 2.5, ry: 4.5, rz: 2.5, block: 'flame_glow' },
      { op: 'curve', points: [[-44, 15, -6], [-38, 30, -6], [-26, 44, -4], [-14, 50, -4]], r1: 2.2, r2: 1.2, block: 'gilded' },
      { op: 'membrane', p1: [-38, 30, -6], p2: [-26, 44, -4], p3: [-32, 22, -5], thickness: 1, block: 'neon_glow' },
      { op: 'mirror', axis: 'x', at: 0 },
      {
        op: 'text_3d',
        text: 'NOVA',
        cx: 0,
        y: 20,
        cz: 4,
        scale: 3,
        depth: 4,
        arch: 2.5,
        block: 'gold_face',
        depth_block: 'dark_depth',
        outline: 'dark_depth',
        pedestal: true,
        facing: 'south'
      },
      { op: 'fill', x1: -30, y1: 18, z1: 1, x2: 30, y2: 19, z2: 3, block: 'neon_glow' },
      { op: 'staircase', x: -14, y: 0, z: 48, dir: 'north', steps: 16, width: 28, block: 'minecraft:stone_brick_stairs', support: 'foundation' }
    ]
  },

  infernal_dragon_18: {
    structure_name: 'Colossal Infernal Dragon (1.8.9)',
    materials: {
      rock: '60%minecraft:obsidian,30%minecraft:stone_bricks,10%minecraft:coal_block',
      scales: '60%minecraft:black_stained_hardened_clay,30%minecraft:obsidian,10%minecraft:coal_block',
      belly: '60%minecraft:red_stained_hardened_clay,30%minecraft:orange_stained_hardened_clay,10%minecraft:glowstone',
      bone: 'minecraft:quartz_block',
      wing_bone: 'minecraft:obsidian',
      wing_skin: '50%minecraft:red_stained_glass,30%minecraft:orange_stained_glass,20%minecraft:black_stained_glass',
      fire: '45%minecraft:orange_stained_glass_pane,30%minecraft:red_stained_glass_pane,15%minecraft:yellow_stained_glass_pane,10%minecraft:web',
      fire_core: 'minecraft:glowstone',
      smoke: '70%minecraft:web,30%minecraft:stained_glass_pane',
      glow: 'minecraft:glowstone'
    },
    ops: [
      { op: 'terrain', cx: 0, cz: 18, y: 0, rx: 42, rz: 42, height: 10, roughness: 0.65, block: 'rock' },
      { op: 'ellipsoid', cx: 0, cy: 18, cz: 14, rx: 9, ry: 8, rz: 16, block: 'scales' },
      { op: 'ellipsoid', cx: 0, cy: 14, cz: 14, rx: 7, ry: 4.5, rz: 14, block: 'belly' },
      { op: 'curve', points: [[8, 18, 20], [14, 11, 23], [16, 5, 25], [16, 1, 25]], r1: 3.5, r2: 2.0, block: 'scales' },
      { op: 'cone_3d', x1: 16, y1: 3, z1: 25, x2: 17, y2: 0, z2: 30, r1: 1.4, r2: 0.2, block: 'bone' },
      { op: 'cone_3d', x1: 14, y1: 3, z1: 25, x2: 14, y2: 0, z2: 30, r1: 1.2, r2: 0.2, block: 'bone' },
      { op: 'ellipsoid', cx: 10, cy: 16, cz: 4, rx: 5.0, ry: 6.5, rz: 5.0, block: 'scales' },
      { op: 'tapered_cylinder', x1: 10, y1: 12, z1: 4, x2: 13, y2: 3, z2: 1, r1: 2.8, r2: 1.6, block: 'scales' },
      { op: 'cone_3d', x1: 13, y1: 3, z1: 1, x2: 15, y2: 0, z2: 5, r1: 1.2, r2: 0.2, block: 'bone' },
      { op: 'curve', points: [[0, 20, 25], [0, 30, 32], [0, 42, 30], [0, 48, 40]], r1: 5.5, r2: 3.5, block: 'scales' },
      { op: 'ellipsoid', cx: 0, cy: 49, cz: 44, rx: 5.2, ry: 4.5, rz: 7.5, block: 'scales' },
      { op: 'tapered_cylinder', x1: 0, y1: 48, z1: 48, x2: 0, y2: 47, z2: 58, r1: 3.5, r2: 2.0, block: 'scales' },
      { op: 'tapered_cylinder', x1: 0, y1: 44, z1: 48, x2: 0, y2: 43, z2: 55, r1: 2.5, r2: 1.4, block: 'belly' },
      { op: 'set', x: 4, y: 50, z: 47, block: 'glow' },
      { op: 'set', x: -4, y: 50, z: 47, block: 'glow' },
      { op: 'cone_3d', x1: 3.5, y1: 52, z1: 42, x2: 8, y2: 64, z2: 30, r1: 2.0, r2: 0.3, block: 'bone' },
      { op: 'cone_3d', x1: -3.5, y1: 52, z1: 42, x2: -8, y2: 64, z2: 30, r1: 2.0, r2: 0.3, block: 'bone' },
      { op: 'curve', points: [[0, 17, 0], [0, 14, -14], [8, 16, -28], [-8, 18, -44], [0, 22, -58]], r1: 4.8, r2: 0.9, block: 'scales' },
      { op: 'curve', points: [[7, 23, 16], [32, 44, 14], [56, 54, 8]], r1: 3.5, r2: 1.4, block: 'wing_bone' },
      { op: 'tapered_cylinder', x1: 32, y1: 44, z1: 14, x2: 46, y2: 28, z2: 12, r1: 1.8, r2: 0.7, block: 'wing_bone' },
      { op: 'tapered_cylinder', x1: 56, y1: 54, z1: 8, x2: 64, y2: 35, z2: 7, r1: 1.4, r2: 0.4, block: 'wing_bone' },
      { op: 'membrane', p1: [7, 23, 16], p2: [32, 44, 14], p3: [46, 28, 12], thickness: 1, block: 'wing_skin' },
      { op: 'membrane', p1: [32, 44, 14], p2: [56, 54, 8], p3: [64, 35, 7], p4: [46, 28, 12], thickness: 1, block: 'wing_skin' },
      { op: 'mirror', axis: 'x', at: 0 },
      { op: 'cone_3d', x1: 0, y1: 46, z1: 58, x2: 0, y2: 40, z2: 74, r1: 1.2, r2: 4.0, block: 'fire_core' },
      { op: 'cone_3d', x1: 0, y1: 46, z1: 58, x2: 0, y2: 38, z2: 92, r1: 2.2, r2: 14, block: 'fire' },
      { op: 'cone_3d', x1: 0, y1: 38, z1: 86, x2: 0, y2: 36, z2: 98, r1: 8.0, r2: 16, block: 'smoke' }
    ]
  }
};
