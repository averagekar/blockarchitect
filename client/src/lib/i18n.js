// BlockArchitect CAD Studio - Uluslararası Dil Desteği (i18n)
// Türkçe (TR) & English (EN) Tam Sözlük ve Çeviri Motoru

export const LANGUAGES = {
  tr: {
    id: 'tr',
    name: 'Türkçe',
    flag: '🇹🇷',
  },
  en: {
    id: 'en',
    name: 'English',
    flag: '🇬🇧',
  },
};

export const TRANSLATIONS = {
  tr: {
    // Üst Başlık & Marka
    brand_title: 'BlockArchitect CAD Studio',
    brand_tagline: 'Yeni Nesil Parametrik 3D Voxel CAD Stüdyosu & Minecraft Mimarlık Motoru',
    brand_badge_parametric: 'v2.0 Parametrik',
    brand_status_live: 'Canlı Motor Hazır',
    download_schem: '1.21+ (.schem)',
    download_schematic_legacy: '1.8.9 (.schematic)',
    compiling: 'Derleniyor...',

    // Model Seçici
    model_recommended: 'Önerilen',
    model_google: 'Google AI',
    model_failover: 'Yedekleme',
    model_deepseek_desc: 'DeepSeek R1 / V3 • Yüksek Mimari & Mantık',
    model_gemini_desc: 'Gemini Thinking (2048 Bütçe) • 3B Uzamsal Geometri',
    model_auto_desc: 'En akıllı model öncelikli, anında kesintisiz yedekleme',

    // Sol Panel - Sekmeler
    tab_directive: 'Mimari Yönerge',
    tab_blueprints: 'Hazır Şablonlar',
    cad_console_title: 'Doğal Dil CAD Konsolu',
    prompt_placeholder: 'Örn: 180×180 tabanlı volkanik kale, gökyüzünde 3D bloklarla yazılı devasa "NOVA" logosu, iki kükreyen ejderha heykeli ve engelsiz PvP meydanı...',
    quick_snippets: 'Hızlı Modüler Kod Parçacıkları',

    // CAD Parametreleri
    cad_controls_title: 'CAD Parametre Kontrolleri',
    max_volume_span: 'Maksimum Hacim Açıklığı',
    mirror_symmetry: 'Ayna Simetrisi',
    sym_none: 'Yok',
    sym_x: 'Sol-Sağ (X)',
    sym_z: 'Ön-Arka (Z)',
    gradient_dithering: '% Gradyan Dithering',
    compile_btn: '3B Mimariyi Derle',
    quick_compile_hint: 'Ctrl + Enter ile Hızlı Derle',

    // Telemetri Adımları
    telemetry_1: 'Geometrik AST Planı Oluşturuluyor...',
    telemetry_2: 'Catmull-Rom Eğrileri & Membranlar Hesaplanıyor...',
    telemetry_3: '3B Tipografi & Simplex Gürültü Katmanlanıyor...',
    telemetry_4: 'Voksel Çakışmaları & Bounding Box Onarılıyor...',
    telemetry_5: 'NBT Sponge v2 Paleti Hazırlanıyor...',

    // Şablonlar Sekmesi
    blueprints_header: 'Öne Çıkan Mimari Şablonlar',
    blueprints_desc: 'Tek tıkla konsola aktarılmaya hazır profesyonel yapay zeka yönergeleri veya anında 0ms master projeler.',
    blueprint_instant_btn: '⚡ Anında Yükle (Master)',
    blueprint_use_btn: 'Yönergeyi Konsola Aktar',

    // Sağ Panel - Başlık & Sekmeler
    inspector_title: 'Mimari Denetçi',
    tab_palette: 'Palet & Tema',
    tab_survival: 'Survival BOM',
    tab_deployment: 'WorldEdit',

    // Hızlı Tema Dönüştürücü (Viral Özellik)
    theme_presets_title: 'Hızlı Tema Dönüştürücü',
    theme_nether: 'Nether İstilası',
    theme_cherry: 'Kiraz Bahçesi',
    theme_frozen: 'Buzul Arktik',
    theme_ancient: 'Antik Harabe',
    theme_reset: 'Temayı Sıfırla',
    swap_block_btn: 'Değiştir',
    swap_modal_title: 'Blok Dönüştürücü',
    swap_search: 'Yeni blok ara...',
    toast_theme_applied: 'Hızlı Tema Başarıyla Uygulandı!',
    toast_block_swapped: 'Blok Başarıyla Dönüştürüldü!',

    // Metrikler
    metric_volume: 'Hacim',
    metric_width: 'Genişlik',
    metric_height: 'Yükseklik',
    metric_depth: 'Derinlik',
    metric_chunk: 'Chunk Alanı',
    metric_voxels: 'Voksel',
    metric_blocks: 'Blok',

    // Palet Sekmesi
    palette_search: 'Blok ara...',
    palette_cat_all: 'Tümü',
    palette_cat_stone: 'Taş / Beton',
    palette_cat_light: 'Işık / Lav',
    palette_cat_organic: 'Doğal / Cam',
    no_blocks_found: 'Aramaya uygun blok bulunamadı.',

    // Survival BOM (Malzeme Listesi) Sekmesi
    survival_title: 'Survival Alışveriş Listesi (BOM)',
    survival_desc: 'Hayatta kalma modunda yapıyı inşa etmek için gereken kesin malzeme miktarları.',
    survival_total_blocks: 'Toplam Blok',
    survival_shulkers: 'Shulker Kutusu',
    survival_stacks: 'Kalan Stack',
    survival_copy_discord: 'Discord Listesini Kopyala',
    survival_download_mcfunction: 'Vanilla .mcfunction İndir',
    survival_copied_toast: 'Survival Alışveriş Listesi Panoya Kopyalandı!',
    survival_mcfunction_toast: 'Vanilla .mcfunction Dosyası İndirildi!',
    survival_format_shulker: 'Shulker',
    survival_format_stack: 'Stack',
    survival_format_block: 'Blok',

    // WorldEdit & Dağıtım Sekmesi
    deployment_title: 'WorldEdit & 3D Dışa Aktarma',
    deployment_desc: 'Minecraft sunucunuzda tek komutla yapıyı yerleştirin veya Blender için indirin.',
    step_1: '1. .schem İndirin:',
    step_1_desc: 'Yukarıdaki indirme butonuyla Sponge v2 dosyasını kaydedin.',
    step_2: '2. Sunucuya Yükleyin:',
    step_3: '3. Oyunda Yapıştırın:',
    paste_tooltip: '-a bayrağı mevcut araziyle pürüzsüz birleşir (hava bloklarını atlar).',
    copy_cmd: 'Komutu Kopyala',
    copied_cmd_toast: 'WorldEdit Komutu Kopyalandı!',
    download_obj_btn: '3D .OBJ İndir (Blender Mesh)',
    download_obj_desc: 'Blender Cycles/Eevee ve 3D yazıcılar için standart Wavefront mesh.',
    toast_obj_download: '3D .OBJ Mesh Dosyası İndirildi!',

    // 3D Viewport HUD & Kontroller
    vp_reset_camera: 'Kamera Bakışını Sıfırla',
    vp_wireframe: 'Tel Çerçeve Modu (Wireframe)',
    vp_grid: '16×16 Chunk Kılavuzu & Koordinat Izgarası',
    vp_bloom: 'Sinematik Bloom Işıması & Emissive Parıltı',
    vp_slicer: 'Y-Katman Kesit Analizi (Layer Slicer)',
    vp_theme_cad: 'CAD Koyu Stüdyo',
    vp_theme_overworld: 'Overworld Öğle Güneşi',
    vp_theme_nether: 'Nether Cehennem Sisi',
    vp_theme_end: 'The End Kozmik Boyut',
    vp_fullscreen_enter: 'Tam Ekran Görünüm',
    vp_fullscreen_exit: 'Tam Ekrandan Çık',

    // Slicer Detayları
    slicer_title: 'Y-Ekseni Katman Kesit Analizi',
    slicer_base: 'Taban (Y: 0)',
    slicer_reset: 'Sıfırla (Tüm Katmanlar)',
    slicer_peak: 'Zirve',

    // Alt Durum Çubuğu
    status_inspect_hint: 'Voksel üzerine gelerek malzeme ve koordinatı inceleyin',
    status_ready: 'CAD Sahnesi Hazır',
    status_layer: 'Katman',
    nav_left: 'Sol Tık: Yörünge',
    nav_right: 'Sağ Tık: Kaydır',
    nav_wheel: 'Tekerlek: Yakınlaş',

    // Boş Sahne
    empty_prompt_hint: 'Sol panelden bir şablon seçin veya yönerge girerek 3B mimariyi derleyin.',

    // Bildirimler
    toast_compile_success: '3B Mimari Başarıyla Derlendi!',
    toast_compile_error: 'Mimari Üretilemedi',
    toast_download_schem: 'Sponge Schematic (.schem) Dosyası İndiriliyor',
    toast_download_schematic_legacy: '1.8.9 Klasik .schematic Dosyası İndirildi!',
  },

  en: {
    // Top Ribbon & Brand
    brand_title: 'BlockArchitect CAD Studio',
    brand_tagline: 'Next-Gen Parametric 3D Voxel CAD Studio & Minecraft Architecture Engine',
    brand_badge_parametric: 'v2.0 Parametric',
    brand_status_live: 'Live Engine Ready',
    download_schem: '1.21+ (.schem)',
    download_schematic_legacy: '1.8.9 (.schematic)',
    compiling: 'Compiling...',

    // Model Selector
    model_recommended: 'Recommended',
    model_google: 'Google AI',
    model_failover: 'Failover',
    model_deepseek_desc: 'DeepSeek R1 / V3 • High Architecture & Reasoning',
    model_gemini_desc: 'Gemini Thinking (2048 Budget) • 3D Spatial Geometry',
    model_auto_desc: 'Highest reasoning model primary, instant seamless failover',

    // Left Panel - Tabs
    tab_directive: 'Architecture Directive',
    tab_blueprints: 'Blueprints',
    cad_console_title: 'Natural Language CAD Console',
    prompt_placeholder: 'E.g.: 180×180 volcanic fortress breathing fire, monumental 3D block lettering reading "NOVA", twin roaring dragons, and seamless PvP arena...',
    quick_snippets: 'Quick Modular Snippets',

    // CAD Controls
    cad_controls_title: 'CAD Constraint Controls',
    max_volume_span: 'Max Volume Span',
    mirror_symmetry: 'Mirror Symmetry',
    sym_none: 'None',
    sym_x: 'Left-Right (X)',
    sym_z: 'Front-Back (Z)',
    gradient_dithering: '% Gradient Dithering',
    compile_btn: 'Compile 3D Architecture',
    quick_compile_hint: 'Quick Compile with Ctrl + Enter',

    // Telemetry Steps
    telemetry_1: 'Generating Geometric AST Plan...',
    telemetry_2: 'Computing Catmull-Rom Splines & Membranes...',
    telemetry_3: 'Layering 3D Typography & Simplex Noise...',
    telemetry_4: 'Resolving Voxel Collisions & Bounding Boxes...',
    telemetry_5: 'Compiling NBT Sponge v2 Palette...',

    // Blueprints Tab
    blueprints_header: 'Curated Architectural Blueprints',
    blueprints_desc: 'Professional AI prompts ready to inject into the console or instant 0ms pre-compiled master structures.',
    blueprint_instant_btn: '⚡ Instant Load (Master)',
    blueprint_use_btn: 'Load Directive into Console',

    // Right Panel - Title & Tabs
    inspector_title: 'Architecture Inspector',
    tab_palette: 'Palette & Theme',
    tab_survival: 'Survival BOM',
    tab_deployment: 'WorldEdit',

    // Instant Theme Presets
    theme_presets_title: 'Instant Theme Transformer',
    theme_nether: 'Nether Corrupted',
    theme_cherry: 'Cherry Blossom',
    theme_frozen: 'Glacial Ice',
    theme_ancient: 'Ancient Ruin',
    theme_reset: 'Reset Theme',
    swap_block_btn: 'Swap',
    swap_modal_title: 'Block Transformer',
    swap_search: 'Search target block...',
    toast_theme_applied: 'Instant Theme Applied Successfully!',
    toast_block_swapped: 'Block Swapped Successfully!',

    // Metrics
    metric_volume: 'Volume',
    metric_width: 'Width',
    metric_height: 'Height',
    metric_depth: 'Depth',
    metric_chunk: 'Chunk Area',
    metric_voxels: 'Voxels',
    metric_blocks: 'Blocks',

    // Palette Tab
    palette_search: 'Search blocks...',
    palette_cat_all: 'All',
    palette_cat_stone: 'Stone / Concrete',
    palette_cat_light: 'Light / Lava',
    palette_cat_organic: 'Organic / Glass',
    no_blocks_found: 'No blocks matched your search.',

    // Survival BOM (Bill of Materials) Tab
    survival_title: 'Survival Bill of Materials (BOM)',
    survival_desc: 'Exact material quantities required to construct this build in Survival mode.',
    survival_total_blocks: 'Total Blocks',
    survival_shulkers: 'Shulker Boxes',
    survival_stacks: 'Stacks Remainder',
    survival_copy_discord: 'Copy Discord List',
    survival_download_mcfunction: 'Download Vanilla .mcfunction',
    survival_copied_toast: 'Survival Shopping List Copied to Clipboard!',
    survival_mcfunction_toast: 'Vanilla .mcfunction File Downloaded!',
    survival_format_shulker: 'Shulker Box',
    survival_format_stack: 'Stack',
    survival_format_block: 'Block',

    // WorldEdit & Deployment Tab
    deployment_title: 'WorldEdit & 3D Export',
    deployment_desc: 'Spawn into your Minecraft server or export for 3D renders in Blender.',
    step_1: '1. Download .schem:',
    step_1_desc: 'Save the Sponge v2 binary file via the top download button.',
    step_2: '2. Upload to Server:',
    step_3: '3. Paste In-Game:',
    paste_tooltip: '-a flag skips air blocks to seamlessly merge with existing terrain.',
    copy_cmd: 'Copy Command',
    copied_cmd_toast: 'WorldEdit Command Copied!',
    download_obj_btn: 'Download 3D .OBJ (Blender Mesh)',
    download_obj_desc: 'Standard Wavefront mesh for Blender Cycles/Eevee renders & 3D printing.',
    toast_obj_download: '3D .OBJ Mesh File Downloaded!',

    // 3D Viewport HUD & Controls
    vp_reset_camera: 'Reset Camera View',
    vp_wireframe: 'Wireframe Mode',
    vp_grid: '16×16 Chunk Grid & Coordinate Axes',
    vp_bloom: 'Cinematic Bloom Glow & Emissive Shader',
    vp_slicer: 'Y-Axis Layer Slicer',
    vp_theme_cad: 'CAD Dark Studio',
    vp_theme_overworld: 'Overworld Daylight',
    vp_theme_nether: 'Nether Crimson Fog',
    vp_theme_end: 'The End Cosmic Void',
    vp_fullscreen_enter: 'Fullscreen View',
    vp_fullscreen_exit: 'Exit Fullscreen',

    // Slicer Details
    slicer_title: 'Y-Axis Layer Slicer Analysis',
    slicer_base: 'Base (Y: 0)',
    slicer_reset: 'Reset (All Layers)',
    slicer_peak: 'Peak',

    // Bottom Status Bar
    status_inspect_hint: 'Hover over any voxel to inspect its material and coordinates',
    status_ready: 'CAD Viewport Ready',
    status_layer: 'Layer',
    nav_left: 'Left Click: Orbit',
    nav_right: 'Right Click: Pan',
    nav_wheel: 'Scroll: Zoom',

    // Empty Viewport
    empty_prompt_hint: 'Pick a blueprint from the left panel or type a directive to compile 3D architecture.',

    // Toasts
    toast_compile_success: '3D Architecture Compiled Successfully!',
    toast_compile_error: 'Failed to Compile Architecture',
    toast_download_schem: 'Downloading Sponge Schematic (.schem)...',
    toast_download_schematic_legacy: '1.8.9 Classic .schematic Downloaded!',
  },
};

// Çift Dilli Hazır Şablonlar (Blueprints)
export const BLUEPRINTS_I18N = {
  tr: [
    {
      id: 'nova_hub',
      presetId: 'nova_citadel',
      category: 'pvp',
      title: 'Hardcore PvP Hub & 3D "NOVA" Logosu',
      badge: 'Master Blueprint',
      tags: ['180×180', '3D Logo', 'İkiz Ejderha', 'Volkanik Dağ'],
      desc: '180×180 tabanlı volkanik kale, gökyüzünde 3B bloklarla yazılı devasa "NOVA" logosu, iki ejderha heykeli ve engelsiz PvP meydanı.',
      prompt:
        'Hardcore PvP Network Ana Lobisi (Spawn Citadel, 180x180 taban, 80 yükseklik). Karanlık, agresif ve heybetli volkanik atmosfer; lobiyi ezen dev ejderhalar, sarp obsidyen dağlar, fırtına bulutları ve gökyüzüne kazınmış 3B devasa "NOVA" logosu.\n\n1. GÖKYÜZÜNDEKİ ANITSAL 3D "NOVA" LOGOSU:\n- text_3d operatörü: text: "NOVA", scale:3, depth:4, arch:4 kavisli yay. İçi kan kırmızısı ve alev tonları (%70 red_concrete, %30 orange_concrete). Dış çerçevesi kalın siyah cilalı blackstone derin zırh konturu.\n\n2. LOGOYU KUŞATAN İKİ DEVASA KÜKREYEN EJDERHA HEYKELİ:\n- "NOVA" logosunun sağında ve solunda logoyu tutan iki adet 70 blokluk devasa ejderha (mirror ile simetrik): blackstone ve deepslate pullar, açık çene, bone_block sivri dişler, shroomlight parlayan gözler, 75 blok kanat açıklığı ve parıltılı kırmızı/siyah zar kanatlar (membrane).\n\n3. KESİNTİSİZ, GENİŞ VE DÜZ AYAK PVP DOĞMA MEYDANI:\n- Oyuncuların takılmadan hızla koşabileceği 55 blok çapında dairesel pürüzsüz koyu meydan (%60 polished_blackstone, %30 deepslate_tiles, %10 magma_block çatlak damarları). Ufak eşya/saksı engeli yok, yalnızca 4 yönde yüksek NPC kürsüleri.\n\n4. VOLKANİK DAĞLAR VE FIRTINA BULUTLARI:\n- Sarp keskin volkanik zirveler, dumanlı koyu fırtına bulutları ve göğe asılı devasa demir zincirler.',
    },
    {
      id: 'blue_dragon',
      presetId: 'infernal_dragon',
      category: 'organic',
      title: 'Devasa Infernal Ejderha & Alev Konisi',
      badge: 'Master Blueprint',
      tags: ['70 Blok', 'Alev Konisi', 'Prizmarin', 'Kemik Dişler'],
      desc: '70 blok uzunluk, 60 kanat açıklığı, S-biçimli boyun, açık çene kemik dişler, prizmarin boynuzlar ve lav püskürten alev konisi.',
      prompt:
        'Devasa, aşırı detaylı mavi ejderha heykeli (~70 uzun, 60 kanat açıklığı, 40 yüksek). Blackstone/deepslate kayalık platformda, kanatlar açık, ağzından ateş püskürüyor. Sol-sağ simetrik (mirror). Gövde: kademeli daralan ellipsoid ve curve parçaları, blue_concrete ve blue_terracotta, sırtta light_blue_concrete pul deseni, karın white_concrete plakalar. S biçimli boyun, büyük baş: uzun burun, açık çene, bone_block dişler, shroomlight gözler, dark_prismarine boynuzlar. Sırtta bone_block diken sırası. Uzun kıvrımlı kuyruk, ucunda diken. Dört güçlü ayak, bone_block pençeler. Kanatlar: kalın dark_prismarine kemik iskeleti, arası light_blue_stained_glass zar. Ateş: ağızdan 25 blok ileri genişleyen koni, orange_concrete, red_concrete, yellow_concrete, magma_block karışık, yerde lav ve yanık zemin.',
    },
    {
      id: 'gothic_cathedral',
      category: 'monumental',
      title: 'Görkemli Gotik Katedral & Payandalar',
      badge: 'Mimari',
      tags: ['50×80', 'Uçan Payanda', 'Gül Pencere', 'İkiz Çan Kulesi'],
      desc: 'Uçan payandalar (flying buttresses), ikiz sivri çan kuleleri, dairesel vitray gül pencere ve tonozlu kemerler.',
      prompt:
        'Görkemli Gotik Katedral (50x80 taban, 55 yükseklik). Kemerli devasa nef, uçan payandalar (flying buttresses), iki adet yüksek sivri çan kuleleri, vitray camlı dairesel gül pencere (rose window), cilalı andezit ve taş tuğla duvarlar, iç mekan kemerli tavan ve asılı fenerler.',
    },
    {
      id: 'japanese_pagoda',
      category: 'monumental',
      title: 'Üç Katlı Geleneksel Japon Pagodası',
      badge: 'Doğu Mimarisi',
      tags: ['3 Kat', 'Kavisli Saçak', 'Kiraz Çiçeği', 'Taş Kaide'],
      desc: 'Kavisli ahşap çatı saçakları, kırmızı beton sütunlar, taş kaide ve kiraz çiçeği (cherry) bahçesi.',
      prompt:
        'Geleneksel üç katlı Japon Pagodası (25x25 taban, 38 yükseklik). Kavisli ahşap çatı saçakları, kırmızı beton sütunlar, taş kaide, kaide etrafında çitler, kiraz ağaçları (cherry) ve fenerler.',
    },
  ],

  en: [
    {
      id: 'nova_hub',
      presetId: 'nova_citadel',
      category: 'pvp',
      title: 'Hardcore PvP Hub & 3D "NOVA" Logo',
      badge: 'Master Blueprint',
      tags: ['180×180', '3D Logo', 'Twin Dragons', 'Volcanic Peaks'],
      desc: '180×180 volcanic citadel, colossal 3D "NOVA" block lettering across the sky, twin dragon sculptures, and smooth obstacle-free PvP arena.',
      prompt:
        'Hardcore PvP Network Spawn Citadel (180x180 base, 80 height). Dark, aggressive, and majestic volcanic atmosphere with flanking twin dragons, jagged obsidian mountains, storm clouds, and a monumental 3D "NOVA" emblem forged into the sky.\n\n1. MONUMENTAL 3D "NOVA" SKY EMBLEM:\n- text_3d operator: text: "NOVA", scale:3, depth:4, arch:4 curved arch. Core filled with blood red and flame hues (70% red_concrete, 30% orange_concrete). Perimeter traced by thick polished blackstone armor contours.\n\n2. FLANKING TWIN ROARING DRAGON SCULPTURES:\n- Left and right of the logo holding the emblem: two 70-block colossal dragons (symmetrical mirror): blackstone and deepslate scales, open jaw, sharp bone_block teeth, shroomlight glowing eyes, 75-block wingspan with glowing red/black membrane wings.\n\n3. SMOOTH OBSTACLE-FREE ARENA FLOOR:\n- 55-block circular smooth dark courtyard for uninterrupted player sprint (60% polished_blackstone, 30% deepslate_tiles, 10% magma_block cracks). Zero clutter, only 4 elevated NPC pedestals.\n\n4. VOLCANIC CLIFFS & STORM CLOUDS:\n- Jagged volcanic peaks, smoky dark storm clouds, and giant iron chains suspended from the sky.',
    },
    {
      id: 'blue_dragon',
      presetId: 'infernal_dragon',
      category: 'organic',
      title: 'Colossal Infernal Dragon & Flame Plume',
      badge: 'Master Blueprint',
      tags: ['70 Blocks', 'Flame Cone', 'Prismarine', 'Bone Teeth'],
      desc: '70-block length, 60 wingspan, S-curved spine, bone teeth, prismarine horns, and breathing an expansive conical flame plume.',
      prompt:
        'Colossal, hyper-detailed sapphire blue dragon sculpture (~70 length, 60 wingspan, 40 height). Perched on a blackstone and deepslate craggy monolith with open wings breathing fire. Left-right mirror symmetry. Body: tapering ellipsoids and 3D curves, blue_concrete and blue_terracotta, light_blue_concrete dorsal scales, white_concrete belly plates. S-curved spine neck, huge head: open jaws, bone_block teeth, shroomlight eyes, dark_prismarine horns. Bone spine ridges, curled tail. Thick bone wing frame with light_blue_stained_glass membrane webbing. Fire: 25-block forward-expanding cone blending orange, red, yellow concrete and magma blocks.',
    },
    {
      id: 'gothic_cathedral',
      category: 'monumental',
      title: 'High Gothic Cathedral & Buttresses',
      badge: 'Architecture',
      tags: ['50×80', 'Flying Buttress', 'Rose Window', 'Twin Spires'],
      desc: 'Arched flying buttresses, twin soaring spires, circular stained glass rose window, and ribbed groin vault ceilings.',
      prompt:
        'Majestic High Gothic Cathedral (50x80 base, 55 height). Arched monumental nave, double flying buttresses, twin soaring bell spires, circular stained glass rose window, polished andesite and stone brick walls, ribbed vault ceilings, and suspended soul lanterns.',
    },
    {
      id: 'japanese_pagoda',
      category: 'monumental',
      title: 'Traditional 3-Tier Japanese Pagoda',
      badge: 'Eastern Heritage',
      tags: ['3 Tiers', 'Curved Eaves', 'Cherry Blossom', 'Stone Base'],
      desc: 'Curved wooden eaves, crimson concrete pillars, elevated stone foundation platform, and cherry blossom garden.',
      prompt:
        'Traditional three-tier Japanese Pagoda (25x25 base, 38 height). Upturned dark curved eaves, crimson concrete pillars, stone foundation plinth, wooden railing walkways, cherry blossom grove, and hanging stone lanterns.',
    },
  ],
};

// Hızlı Kod Parçacıkları (Snippets)
export const QUICK_SNIPPETS_I18N = {
  tr: [
    { label: '3D NOVA Logosu', snippet: ' Gökyüzünde 3B bloklarla devasa kabartmalı "NOVA" logosu (text_3d).' },
    { label: 'İkiz Ejderha', snippet: ' Logoyu iki yandan kavrayan devasa kükreyen ejderha heykelleri (mirror).' },
    { label: 'Volumetrik Bulut', snippet: ' Dağ zirvelerini ve gökyüzünü saran katmanlı beyaz duman bulut kütleleri.' },
    { label: 'Volkanik Dağ & Lav', snippet: ' Çevrede sarp siyah taş dağlar, lav şelaleleri ve magma çatlakları.' },
    { label: 'Düz PvP Meydanı', snippet: ' Ortada engelsiz, geniş ve düz dairesel cilalı taş PvP doğma meydanı.' },
  ],
  en: [
    { label: '3D NOVA Emblem', snippet: ' Monumental 3D extruded "NOVA" block lettering in the sky (text_3d).' },
    { label: 'Twin Dragons', snippet: ' Colossal roaring dragon sculptures flanking both sides with mirror symmetry.' },
    { label: 'Volumetric Clouds', snippet: ' Layered white smoky cloud masses draping across mountain summits.' },
    { label: 'Volcano & Lava', snippet: ' Jagged blackstone peaks with cascading lava waterfalls and magma cracks.' },
    { label: 'Smooth PvP Arena', snippet: ' Central obstacle-free circular polished stone PvP spawn arena.' },
  ],
};
