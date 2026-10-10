// BlockArchitect CAD Studio - Elite 3D Voxel Engine
// Modüler & Rafine Tripartite Mimari: Gliding Pill Sekmeler, CAD Parametre Kontrolleri, Kategori Filtreli Palet ve Sonner Bildirimleri.
import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import confetti from 'canvas-confetti';
import VoxelViewer from './components/VoxelViewer.jsx';
import { generateStructure, downloadSchem } from './lib/api.js';
import { cleanId, colorFor } from './lib/blockColors.js';
import {
  Box,
  Terminal,
  Palette,
  Download,
  Copy,
  Check,
  Search,
  Flame,
  Sparkles,
  Landmark,
  Type,
  Cloud,
  Mountain,
  ChevronDown,
  ShieldAlert,
  Play,
  RotateCcw,
  FolderDown,
  Activity,
  Cpu,
  Wand2,
  Sliders,
  Layers,
  SlidersHorizontal,
  ChevronRight,
  Eye,
  HelpCircle,
} from 'lucide-react';

const BLUEPRINTS = [
  {
    id: 'nova_hub',
    category: 'pvp',
    title: 'Hardcore PvP Hub & 3D "NOVA" Logosu',
    badge: 'Spawn Lobi',
    tags: ['180×180', '3D Logo', 'İkiz Ejderha', 'Volkanik Dağ'],
    desc: '180×180 tabanlı volkanik kale, gökyüzünde 3B bloklarla yazılı devasa "NOVA" logosu, iki ejderha heykeli ve engelsiz PvP meydanı.',
    prompt:
      'Hardcore PvP Network Ana Lobisi (Spawn Citadel, 180x180 taban, 80 yükseklik). Karanlık, agresif ve heybetli volkanik atmosfer; lobiyi ezen dev ejderhalar, sarp obsidyen dağlar, fırtına bulutları ve gökyüzüne kazınmış 3B devasa "NOVA" logosu.\n\n1. GÖKYÜZÜNDEKİ ANITSAL 3D "NOVA" LOGOSU:\n- text_3d operatörü: text: "NOVA", scale:3, depth:4, arch:4 kavisli yay. İçi kan kırmızısı ve alev tonları (%70 red_concrete, %30 orange_concrete). Dış çerçevesi kalın siyah cilalı blackstone derin zırh konturu.\n\n2. LOGOYU KUŞATAN İKİ DEVASA KÜKREYEN EJDERHA HEYKELİ:\n- "NOVA" logosunun sağında ve solunda logoyu tutan iki adet 70 blokluk devasa ejderha (mirror ile simetrik): blackstone ve deepslate pullar, açık çene, bone_block sivri dişler, shroomlight parlayan gözler, 75 blok kanat açıklığı ve parıltılı kırmızı/siyah zar kanatlar (membrane).\n\n3. KESİNTİSİZ, GENİŞ VE DÜZ AYAK PVP DOĞMA MEYDANI:\n- Oyuncuların takılmadan hızla koşabileceği 55 blok çapında dairesel pürüzsüz koyu meydan (%60 polished_blackstone, %30 deepslate_tiles, %10 magma_block çatlak damarları). Ufak eşya/saksı engeli yok, yalnızca 4 yönde yüksek NPC kürsüleri.\n\n4. VOLKANİK DAĞLAR VE FIRTINA BULUTLARI:\n- Sarp keskin volkanik zirveler, dumanlı koyu fırtına bulutları ve göğe asılı devasa demir zincirler.',
  },
  {
    id: 'blue_dragon',
    category: 'organic',
    title: 'Devasa Mavi Ejderha & Alev Konisi',
    badge: 'Heykel',
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
];

const QUICK_SNIPPETS = [
  { label: '3D NOVA Logosu', icon: Type, snippet: ' Gökyüzünde 3B bloklarla devasa kabartmalı "NOVA" logosu (text_3d).' },
  { label: 'İkiz Ejderha', icon: Flame, snippet: ' Logoyu iki yandan kavrayan devasa kükreyen ejderha heykelleri (mirror).' },
  { label: 'Volumetrik Bulut', icon: Cloud, snippet: ' Dağ zirvelerini ve gökyüzünü saran katmanlı beyaz duman bulut kütleleri.' },
  { label: 'Volkanik Dağ & Lav', icon: Mountain, snippet: ' Çevrede sarp siyah taş dağlar, lav şelaleleri ve magma çatlakları.' },
  { label: 'Düz PvP Meydanı', icon: Landmark, snippet: ' Ortada engelsiz, geniş ve düz dairesel cilalı taş PvP doğma meydanı.' },
];

const MODEL_OPTIONS = [
  { id: 'deepseek', label: 'DeepSeek-V3', badge: 'Önerilen', desc: 'deepseek-chat • Yüksek Mantık & Hız (sk-4098...)', icon: Cpu },
  { id: 'gemini', label: 'Gemini 3.8 Flash', badge: 'Google AI', desc: 'gemini-3.8-flash • Hızlı Geometri', icon: Sparkles },
  { id: 'auto', label: 'Otomatik Yönlendirici', badge: 'Failover', desc: 'DeepSeek öncelikli, kotada otomatik geçiş', icon: Wand2 },
];

export default function App() {
  const [provider, setProvider] = useState('deepseek');
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [leftTab, setLeftTab] = useState('prompt'); // 'prompt' | 'blueprints'
  const [rightTab, setRightTab] = useState('palette'); // 'palette' | 'deployment'

  const [prompt, setPrompt] = useState('');
  const [maxSpan, setMaxSpan] = useState(180);
  const [symmetry, setSymmetry] = useState('x'); // 'none' | 'x' | 'z'
  const [dithering, setDithering] = useState(true);

  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [copiedCmd, setCopiedCmd] = useState(false);

  const [paletteCategory, setPaletteCategory] = useState('all'); // 'all' | 'stone' | 'light' | 'organic'
  const [paletteSearch, setPaletteSearch] = useState('');

  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [telemetryStep, setTelemetryStep] = useState(0);

  const dropdownRef = useRef(null);

  // Model menüsünü dışarı tıklandığında kapat
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setModelDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Klavye Kısayolları (Ctrl+Enter: Üret, Esc: Tam Ekran Çık)
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleGenerate();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, prompt, loading, provider]);

  // Simüle edilmiş üretim telemetrisi
  useEffect(() => {
    if (!loading) {
      setTelemetryStep(0);
      return;
    }
    const interval = setInterval(() => {
      setTelemetryStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(interval);
  }, [loading]);

  async function handleGenerate(e) {
    e?.preventDefault();
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError('');
    try {
      // Parametreleri prompt sonuna otomatik ekler
      let fullPrompt = prompt.trim();
      if (maxSpan) fullPrompt += ` (Maksimum Hacim: ${maxSpan} blok)`;
      if (symmetry === 'x') fullPrompt += ` (Sol-Sağ Ayna Simetrisi X-axis mirror)`;
      if (symmetry === 'z') fullPrompt += ` (Ön-Arka Ayna Simetrisi Z-axis mirror)`;
      if (dithering) fullPrompt += ` (WorldEdit % gradyan dithering aktif)`;

      const res = await generateStructure(fullPrompt, provider);
      setStructure(res);
      setRightOpen(true);
      toast.success('3B Mimari Başarıyla Derlendi!', {
        description: `${res.structure_name} • ${res.blocks.length.toLocaleString('tr-TR')} Voksel oluşturuldu.`,
      });
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.82 },
        colors: ['#f59e0b', '#38bdf8', '#10b981', '#ffffff'],
      });
    } catch (err) {
      setError(err.message);
      toast.error('Mimari Üretilemedi', {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!structure) return;
    setDownloading(true);
    setError('');
    try {
      await downloadSchem(structure);
      toast.success('.schem Dosyası İndirildi', {
        description: 'Sponge Schematic v2 formatında sunucuya aktarılmaya hazır.',
      });
    } catch (err) {
      setError(err.message);
      toast.error('İndirme Hatası', { description: err.message });
    } finally {
      setDownloading(false);
    }
  }

  function handleCopyCommand() {
    if (!structure) return;
    const safeName = (structure.structure_name || 'structure').replace(/[^a-z0-9_-]+/gi, '_');
    const cmd = `//schem load ${safeName}\n//paste -a`;
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    toast.info('WorldEdit Komutları Kopyalandı', {
      description: `//schem load ${safeName} & //paste -a panoya aktarıldı.`,
    });
    setTimeout(() => setCopiedCmd(false), 2000);
  }

  const dims = structure?.dimensions;

  const stats = useMemo(() => {
    if (!structure) return { topBlocks: [], total: 0 };
    const counts = new Map();
    for (const b of structure.blocks) {
      const name = cleanId(structure.palette[b.state]);
      counts.set(name, (counts.get(name) || 0) + 1);
    }
    const total = structure.blocks.length;
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    return { topBlocks: sorted, total };
  }, [structure]);

  // Malzeme Kategori Filtreleme
  const filteredBlocks = useMemo(() => {
    let list = stats.topBlocks;
    if (paletteCategory === 'stone') {
      list = list.filter(([name]) => /stone|deepslate|blackstone|concrete|terracotta|brick|andesite|tuff/.test(name));
    } else if (paletteCategory === 'light') {
      list = list.filter(([name]) => /shroomlight|glowstone|magma|lava|lantern|torch|sea_lantern|crying_obsidian/.test(name));
    } else if (paletteCategory === 'organic') {
      list = list.filter(([name]) => /bone|prismarine|glass|ice|water|leaves|log|wood/.test(name));
    }
    if (paletteSearch.trim()) {
      const q = paletteSearch.toLowerCase();
      list = list.filter(([name]) => name.toLowerCase().includes(q));
    }
    return list;
  }, [stats.topBlocks, paletteCategory, paletteSearch]);

  const TELEMETRY_MSGS = [
    'Geometrik mimari ve sınırlayıcı kutu ayrıştırılıyor…',
    '3B Catmull-Rom eğrileri, spline gövdeler ve text_3d glifleri hesaplanıyor…',
    'FBM Simplex gürültüsü arazi ve WorldEdit gradyan dithering matrisi işleniyor…',
    'Sponge Schematic v2 NBT blok bileşimi paketleniyor…',
  ];

  const activeModel = MODEL_OPTIONS.find((m) => m.id === provider) || MODEL_OPTIONS[0];

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-base text-ink font-body">
      {/* Sonner Toast Bildirim Konteyneri */}
      <Toaster position="bottom-right" theme="dark" richColors closeButton />

      {/* ÜST CAD UYGULAMA ÇUBUĞU (Top Ribbon - 42px) */}
      <header className="flex h-10 shrink-0 items-center justify-between border-b border-line bg-panel px-3.5 z-30 font-mono text-xs">
        {/* Sol: Marka ve Proje Başlığı */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-display text-sm font-black tracking-tight text-ink uppercase">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-surface border border-line shadow-sm">
              <Box className="h-4 w-4 text-amber-cad" />
            </div>
            <span>BlockArchitect</span>
            <span className="text-[10px] text-ink-dim tracking-normal">/ CAD WORKSPACE</span>
          </div>

          <span className="h-3 w-px bg-white/10" />

          {/* Aktif Şema Adı */}
          <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
            <span className="text-ink font-medium">
              {structure ? `${structure.structure_name}.schem` : 'untitled_project.schem'}
            </span>
            <span className="rounded bg-surface px-1.5 py-0.2 text-[9px] text-ink-dim border border-line font-mono">
              Sponge v2
            </span>
          </div>
        </div>

        {/* Orta: Özel Glassmorphic AI Model Seçici */}
        <div className="relative" ref={dropdownRef}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="cursor-pointer flex items-center gap-2 rounded-lg border border-line bg-surface/90 px-3 py-1 text-[11px] text-ink hover:border-line-bright hover:bg-surface-hover transition-colors"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-cad shadow-[0_0_6px_#10b981]" />
            <span className="text-ink-dim">Model:</span>
            <span className="text-amber-cad font-semibold flex items-center gap-1">
              {activeModel.label}
            </span>
            <ChevronDown className={`h-3 w-3 text-ink-dim transition-transform ${modelDropdownOpen ? 'rotate-180' : ''}`} />
          </motion.button>

          {/* Model Açılır Menüsü */}
          <AnimatePresence>
            {modelDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute top-9 left-1/2 -translate-x-1/2 z-50 w-76 rounded-xl border border-line bg-panel/95 p-1.5 backdrop-blur-xl shadow-2xl space-y-1"
              >
                <div className="px-2.5 py-1 text-[10px] uppercase tracking-wider text-ink-dim font-mono border-b border-white/5">
                  Yapay Zeka Mimar Motoru
                </div>
                {MODEL_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = provider === opt.id;
                  return (
                    <motion.button
                      whileHover={{ x: 2 }}
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setProvider(opt.id);
                        setModelDropdownOpen(false);
                        toast.info(`${opt.label} aktif motor olarak seçildi.`);
                      }}
                      className={`cursor-pointer flex w-full items-start gap-2.5 rounded-lg p-2 text-left transition-colors ${
                        isSelected ? 'bg-surface border border-line text-ink' : 'text-ink-muted hover:bg-surface-hover hover:text-ink'
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${isSelected ? 'text-amber-cad' : 'text-ink-dim'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs">{opt.label}</span>
                          <span className="rounded bg-base px-1 text-[9px] text-ink-dim border border-line font-mono">
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-ink-dim mt-0.5 truncate">{opt.desc}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sağ: Hızlı İşlem Düğmeleri ve Panel Toggles */}
        <div className="flex items-center gap-2">
          {structure && (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleCopyCommand}
                title="WorldEdit yapıştırma komutunu kopyala (//schem load & //paste)"
                className="cursor-pointer flex h-7 items-center gap-1.5 rounded-lg bg-surface px-2.5 text-[11px] text-ink border border-line hover:border-line-bright hover:bg-surface-hover transition-colors shadow-sm"
              >
                {copiedCmd ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-cad" />
                    <span className="text-emerald-cad font-semibold">Kopyalandı</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 text-ink-muted" />
                    <span>//paste</span>
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                title="WorldEdit .schem dosyasını indir"
                className="cursor-pointer flex h-7 items-center gap-1.5 rounded-lg bg-amber-cad/15 px-2.5 text-[11px] text-amber-cad border border-amber-cad/30 hover:bg-amber-cad/25 transition-colors disabled:opacity-40 shadow-sm"
              >
                <Download className="h-3 w-3" />
                <span>{downloading ? 'Paketleniyor…' : '.schem İndir'}</span>
              </motion.button>
            </>
          )}

          <span className="h-3 w-px bg-white/10" />

          {/* Sol Panel (Mimar) Toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setLeftOpen(!leftOpen)}
            title={leftOpen ? 'Sol Mimar Panelini Gizle' : 'Sol Mimar Panelini Göster'}
            className={`cursor-pointer flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[11px] border transition-colors ${
              leftOpen ? 'bg-surface text-ink border-line' : 'text-ink-dim border-transparent hover:text-ink'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">Mimar</span>
          </motion.button>

          {/* Sağ Panel (Denetçi) Toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setRightOpen(!rightOpen)}
            title={rightOpen ? 'Sağ Denetçi Panelini Gizle' : 'Sağ Denetçi Panelini Göster'}
            className={`cursor-pointer flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[11px] border transition-colors ${
              rightOpen ? 'bg-surface text-ink border-line' : 'text-ink-dim border-transparent hover:text-ink'
            }`}
          >
            <Palette className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">Denetçi</span>
          </motion.button>
        </div>
      </header>

      {/* TRIPARTITE ÇALIŞMA ALANI: Solda Mimar, Ortada 3B Viewport, Sağda Denetçi */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* SOL CAD MİMAR PANELİ (360px - Gliding Tabs ile Rafine Edilmiş Mimar & Şablonlar) */}
        <AnimatePresence initial={false}>
          {leftOpen && !isFullscreen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="shrink-0 flex flex-col border-r border-line bg-panel z-20 overflow-hidden shadow-2xl"
            >
              {/* Sol Üst Gliding Tab Switcher */}
              <div className="w-[360px] border-b border-line bg-surface/40 p-2 flex items-center gap-1 font-mono text-[11px]">
                <button
                  type="button"
                  onClick={() => setLeftTab('prompt')}
                  className={`relative cursor-pointer flex-1 py-1.5 rounded-lg text-center font-semibold transition-colors ${
                    leftTab === 'prompt' ? 'text-ink' : 'text-ink-dim hover:text-ink-muted'
                  }`}
                >
                  {leftTab === 'prompt' && (
                    <motion.div
                      layoutId="leftTabIndicator"
                      className="absolute inset-0 rounded-lg bg-surface border border-line shadow-sm"
                      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-amber-cad" />
                    Mimar Direktifi
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setLeftTab('blueprints')}
                  className={`relative cursor-pointer flex-1 py-1.5 rounded-lg text-center font-semibold transition-colors ${
                    leftTab === 'blueprints' ? 'text-ink' : 'text-ink-dim hover:text-ink-muted'
                  }`}
                >
                  {leftTab === 'blueprints' && (
                    <motion.div
                      layoutId="leftTabIndicator"
                      className="absolute inset-0 rounded-lg bg-surface border border-line shadow-sm"
                      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-1.5">
                    <Landmark className="h-3.5 w-3.5 text-amber-cad" />
                    Şablonlar ({BLUEPRINTS.length})
                  </span>
                </button>
              </div>

              {/* Sol Panel İçerik Alanı */}
              <div className="w-[360px] flex-1 overflow-y-auto p-4 space-y-4">
                {leftTab === 'prompt' ? (
                  <div className="space-y-4">
                    {/* Prompt Giriş Editörü */}
                    <form onSubmit={handleGenerate} className="space-y-3">
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-ink-muted flex items-center gap-1.5 font-semibold uppercase tracking-wider">
                          MİMARİ DİREKTİF KONSOLU
                        </span>
                        <span className="text-ink-dim">{prompt.length} / 4000</span>
                      </div>

                      <div className="rounded-xl border border-line bg-surface p-2.5 focus-within:border-amber-cad/60 focus-within:ring-1 focus-within:ring-amber-cad/20 transition-all shadow-inner">
                        <textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          maxLength={4000}
                          rows={6}
                          placeholder="// Hayal ettiğiniz mimariyi, ejderha heykellerini, 3B logoyu veya gotik katedrali tarif edin... (Ctrl + Enter ile Çalıştır)"
                          className="w-full resize-none bg-transparent font-mono text-xs leading-relaxed text-ink outline-none placeholder:text-ink-dim"
                        />
                      </div>

                      {/* Hızlı Mimari Parçacıkları */}
                      <div className="space-y-1.5">
                        <span className="font-mono text-[10px] text-ink-dim uppercase">Hızlı Mimari Modüller:</span>
                        <div className="flex flex-wrap gap-1">
                          {QUICK_SNIPPETS.map((s) => {
                            const Icon = s.icon;
                            return (
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.95 }}
                                key={s.label}
                                type="button"
                                onClick={() => setPrompt((prev) => prev.trim() + s.snippet)}
                                className="cursor-pointer flex items-center gap-1 rounded bg-surface px-2 py-1 font-mono text-[10px] text-ink-muted border border-line hover:border-amber-cad/40 hover:text-ink hover:bg-surface-hover transition-colors"
                              >
                                <Icon className="h-2.5 w-2.5 text-amber-cad" />
                                <span>{s.label}</span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* CAD Parametre Kılavuzları (Segmented Controls) */}
                      <div className="space-y-2 rounded-xl border border-line bg-surface/50 p-3 font-mono text-xs">
                        <span className="text-[10px] text-ink-dim uppercase flex items-center gap-1">
                          <SlidersHorizontal className="h-3 w-3 text-amber-cad" />
                          Hacim & Geometri Kısıtları:
                        </span>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-ink-muted">Maks. Blok Boyutu:</span>
                          <div className="flex rounded-lg border border-line bg-surface p-0.5 gap-0.5">
                            {[64, 128, 180, 256].map((spanVal) => (
                              <button
                                key={spanVal}
                                type="button"
                                onClick={() => setMaxSpan(spanVal)}
                                className={`cursor-pointer px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                                  maxSpan === spanVal ? 'bg-amber-cad text-base' : 'text-ink-dim hover:text-ink'
                                }`}
                              >
                                {spanVal}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-ink-muted">Ayna Simetrisi:</span>
                          <div className="flex rounded-lg border border-line bg-surface p-0.5 gap-0.5">
                            {[
                              { id: 'none', label: 'Yok' },
                              { id: 'x', label: 'X (Sol-Sağ)' },
                              { id: 'z', label: 'Z (Ön-Arka)' },
                            ].map((sym) => (
                              <button
                                key={sym.id}
                                type="button"
                                onClick={() => setSymmetry(sym.id)}
                                className={`cursor-pointer px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                                  symmetry === sym.id ? 'bg-amber-cad text-base' : 'text-ink-dim hover:text-ink'
                                }`}
                              >
                                {sym.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-0.5">
                          <span className="text-ink-muted">WorldEdit % Gradyan:</span>
                          <button
                            type="button"
                            onClick={() => setDithering(!dithering)}
                            className={`cursor-pointer px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors ${
                              dithering
                                ? 'bg-emerald-cad/15 text-emerald-cad border-emerald-cad/30'
                                : 'bg-surface text-ink-dim border-line'
                            }`}
                          >
                            {dithering ? 'Aktif' : 'Düz Blok'}
                          </button>
                        </div>
                      </div>

                      {/* Çalıştır Butonu */}
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading || prompt.trim().length < 3}
                        className="cursor-pointer group flex w-full items-center justify-center gap-2 rounded-xl bg-amber-cad px-4 py-2.5 font-mono text-xs font-bold text-base shadow-lg shadow-amber-cad/10 transition-all hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>{loading ? 'İnşa Ediliyor…' : 'Mimariyi Çalıştır'}</span>
                        <kbd className="hidden sm:inline rounded bg-base/20 px-1.5 py-0.2 font-mono text-[10px] text-base">
                          Ctrl + ↵
                        </kbd>
                      </motion.button>
                    </form>

                    {/* Hata Raporu ve Bakiye Rehberi */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200"
                      >
                        <div className="flex items-start gap-2">
                          <ShieldAlert className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                          <div className="font-mono text-[11px] leading-relaxed flex-1">{error}</div>
                        </div>
                        {error.includes('Insufficient Balance') && (
                          <div className="mt-1 pt-1.5 border-t border-red-500/20 text-[10px] text-red-300 font-mono">
                            💡 <strong>DeepSeek Bakiye Uyarısı:</strong> DeepSeek API hesabınızda bakiye kalmamış. 
                            <a
                              href="https://platform.deepseek.com/top_up"
                              target="_blank"
                              rel="noreferrer"
                              className="underline text-amber-cad ml-1"
                            >
                              platform.deepseek.com/top_up
                            </a> adresinden bakiye yükledikten hemen sonra çağrılar aktifleşir.
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Canlı Üretim Telemetri Konsolu */}
                    {loading && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-xl border border-line bg-surface p-3 font-mono text-xs space-y-2 shadow-inner"
                      >
                        <div className="flex items-center justify-between text-[11px] text-amber-cad">
                          <span className="flex items-center gap-1.5 font-semibold">
                            <Activity className="h-3 w-3 animate-spin" />
                            Üretim Boru Hattı Aktif
                          </span>
                          <span>Adım {Math.min(telemetryStep + 1, 4)} / 4</span>
                        </div>
                        <div className="space-y-1 text-[11px] text-ink-dim">
                          {TELEMETRY_MSGS.map((msg, idx) => (
                            <div
                              key={msg}
                              className={`flex items-center gap-1.5 transition-colors ${
                                idx === telemetryStep
                                  ? 'text-ink font-medium'
                                  : idx < telemetryStep
                                  ? 'text-emerald-cad line-through opacity-70'
                                  : 'opacity-30'
                              }`}
                            >
                              <span className="text-[9px]">[{idx + 1}]</span>
                              <span>{msg}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  /* Şablon Galerisi Vitrini */
                  <div className="space-y-2.5 font-mono text-xs">
                    <div className="flex items-center justify-between text-ink-dim text-[11px]">
                      <span>HAZIR MİMARİ MODELLER</span>
                      <span>Tek tıkla yükleyin</span>
                    </div>

                    <div className="space-y-2.5">
                      {BLUEPRINTS.map((bp) => (
                        <motion.div
                          whileHover={{ y: -2 }}
                          key={bp.id}
                          className="rounded-xl border border-line bg-surface p-3 transition-colors hover:border-amber-cad/40 hover:bg-surface-hover shadow-sm space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-ink">{bp.title}</span>
                            <span className="rounded bg-base px-1.5 py-0.2 text-[9px] text-ink-dim border border-line">
                              {bp.badge}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {bp.tags.map((t) => (
                              <span key={t} className="rounded bg-base/80 px-1.5 py-0.2 text-[9px] text-amber-cad border border-white/5">
                                {t}
                              </span>
                            ))}
                          </div>

                          <p className="text-[11px] text-ink-dim leading-relaxed">{bp.desc}</p>

                          <button
                            type="button"
                            onClick={() => {
                              setPrompt(bp.prompt);
                              setLeftTab('prompt');
                              toast.success(`"${bp.title}" konsola yüklendi!`);
                            }}
                            className="cursor-pointer w-full flex items-center justify-center gap-1.5 rounded-lg bg-base py-1.5 text-[10px] text-ink border border-line hover:border-amber-cad/50 hover:text-amber-cad transition-colors font-semibold"
                          >
                            <Play className="h-3 w-3 fill-current" />
                            <span>Bu Şablonu Konsola Yükle</span>
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ORTA: KESİNTİSİZ VE DAİMİ 3B VIEWPORT (Always-On Stage) */}
        <main className="relative flex-1 h-full w-full bg-base overflow-hidden">
          <VoxelViewer
            structure={structure}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          />
        </main>

        {/* SAĞ CAD DENETÇİ PANELİ (320px - Gliding Tabs ile Palet & WorldEdit) */}
        <AnimatePresence initial={false}>
          {rightOpen && !isFullscreen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="shrink-0 flex flex-col border-l border-line bg-panel z-20 overflow-hidden shadow-2xl"
            >
              {/* Sağ Üst Gliding Tab Switcher */}
              <div className="w-[320px] border-b border-line bg-surface/40 p-2 flex items-center gap-1 font-mono text-[11px]">
                <button
                  type="button"
                  onClick={() => setRightTab('palette')}
                  className={`relative cursor-pointer flex-1 py-1.5 rounded-lg text-center font-semibold transition-colors ${
                    rightTab === 'palette' ? 'text-ink' : 'text-ink-dim hover:text-ink-muted'
                  }`}
                >
                  {rightTab === 'palette' && (
                    <motion.div
                      layoutId="rightTabIndicator"
                      className="absolute inset-0 rounded-lg bg-surface border border-line shadow-sm"
                      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-1.5">
                    <Palette className="h-3.5 w-3.5 text-amber-cad" />
                    Malzemeler ({stats.topBlocks.length})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRightTab('deployment')}
                  className={`relative cursor-pointer flex-1 py-1.5 rounded-lg text-center font-semibold transition-colors ${
                    rightTab === 'deployment' ? 'text-ink' : 'text-ink-dim hover:text-ink-muted'
                  }`}
                >
                  {rightTab === 'deployment' && (
                    <motion.div
                      layoutId="rightTabIndicator"
                      className="absolute inset-0 rounded-lg bg-surface border border-line shadow-sm"
                      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-1.5">
                    <FolderDown className="h-3.5 w-3.5 text-amber-cad" />
                    WorldEdit
                  </span>
                </button>
              </div>

              {/* Sağ Panel İçerik Alanı */}
              <div className="w-[320px] flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
                {rightTab === 'palette' ? (
                  <div className="space-y-4">
                    {/* Hacim & Voksel İstatistiği */}
                    <div className="space-y-2">
                      <span className="text-ink-muted uppercase tracking-wider text-[11px] font-semibold flex items-center gap-1.5">
                        <Box className="h-3.5 w-3.5 text-amber-cad" />
                        Hacim & Voksel Metrikleri
                      </span>

                      {structure ? (
                        <div className="rounded-xl border border-line bg-surface p-3 space-y-2.5 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-ink font-bold text-sm tracking-tight truncate">
                              {structure.structure_name}
                            </span>
                            <span className="text-emerald-cad text-[10px] bg-emerald-cad/10 px-1.5 py-0.5 rounded border border-emerald-cad/20 font-semibold">
                              Derlendi
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                            <div className="rounded border border-line bg-base p-1.5">
                              <div className="text-ink-dim">Boyut</div>
                              <div className="text-ink font-semibold mt-0.5">
                                {dims.width}×{dims.height}×{dims.depth}
                              </div>
                            </div>
                            <div className="rounded border border-line bg-base p-1.5">
                              <div className="text-ink-dim">Voksel</div>
                              <div className="text-emerald-cad font-semibold mt-0.5">
                                {stats.total.toLocaleString('tr-TR')}
                              </div>
                            </div>
                            <div className="rounded border border-line bg-base p-1.5">
                              <div className="text-ink-dim">Chunk</div>
                              <div className="text-cyan-cad font-semibold mt-0.5">
                                {(dims.width / 16).toFixed(1)}×{(dims.depth / 16).toFixed(1)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-line bg-surface/50 p-4 text-center text-ink-dim text-[11px]">
                          Henüz bir mimari yüklenmedi.
                        </div>
                      )}
                    </div>

                    {/* Malzeme Paleti & Kategori Filtresi */}
                    <div className="space-y-2.5 pt-2 border-t border-line">
                      <div className="flex items-center justify-between">
                        <span className="text-ink-muted uppercase tracking-wider text-[11px] font-semibold flex items-center gap-1.5">
                          <Palette className="h-3.5 w-3.5 text-amber-cad" />
                          Malzeme Envanteri
                        </span>
                        <span className="text-ink-dim text-[10px]">{filteredBlocks.length} Filtrelendi</span>
                      </div>

                      {/* Kategori Filtre Hapları */}
                      <div className="flex rounded-lg border border-line bg-surface p-0.5 gap-0.5 text-[10px]">
                        {[
                          { id: 'all', label: 'Tümü' },
                          { id: 'stone', label: 'Taş/Beton' },
                          { id: 'light', label: 'Işık/Lav' },
                          { id: 'organic', label: 'Doğal/Cam' },
                        ].map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setPaletteCategory(cat.id)}
                            className={`cursor-pointer flex-1 py-1 rounded text-center transition-colors ${
                              paletteCategory === cat.id
                                ? 'bg-amber-cad text-base font-semibold'
                                : 'text-ink-dim hover:text-ink'
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>

                      {/* Arama Girişi */}
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-ink-dim" />
                        <input
                          type="text"
                          value={paletteSearch}
                          onChange={(e) => setPaletteSearch(e.target.value)}
                          placeholder="minecraft:block_id filtrele..."
                          className="w-full rounded-lg border border-line bg-surface py-1 pl-8 pr-3 text-[11px] text-ink outline-none placeholder:text-ink-dim focus:border-amber-cad/50"
                        />
                      </div>

                      {filteredBlocks.length === 0 ? (
                        <div className="p-4 text-center text-ink-dim text-[11px]">
                          {structure ? 'Filtreye uygun blok bulunamadı' : 'Envanter boş'}
                        </div>
                      ) : (
                        <ul className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                          {filteredBlocks.map(([name, count]) => {
                            const pct = ((count / stats.total) * 100).toFixed(1);
                            return (
                              <li
                                key={name}
                                className="rounded-lg border border-line bg-surface/70 p-2 text-[11px] hover:border-line-bright transition-colors space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 truncate">
                                    <span
                                      className="h-3 w-3 shrink-0 rounded border border-white/20 shadow-sm"
                                      style={{ background: colorFor(name) }}
                                    />
                                    <span className="truncate text-ink font-mono">{name}</span>
                                  </div>
                                  <span className="text-amber-cad font-semibold">%{pct}</span>
                                </div>
                                <div className="h-1 w-full bg-base rounded-full overflow-hidden">
                                  <div className="h-full bg-amber-cad rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                ) : (
                  /* WorldEdit & Sunucu Dağıtım Sekmesi */
                  <div className="space-y-4">
                    <span className="text-ink-muted uppercase tracking-wider text-[11px] font-semibold flex items-center gap-1.5">
                      <FolderDown className="h-3.5 w-3.5 text-amber-cad" />
                      WorldEdit & Sunucu Dağıtımı
                    </span>

                    <div className="rounded-xl border border-line bg-surface/70 p-3 space-y-2 text-[11px] text-ink-dim leading-relaxed">
                      <div className="text-ink font-semibold flex items-center gap-1">
                        <Check className="h-3.5 w-3.5 text-emerald-cad" />
                        FAWE / Axiom Uyumlu
                      </div>
                      <p>
                        İndirilen .schem dosyasını sunucunuzun <code className="text-amber-cad">plugins/WorldEdit/schematics/</code> klasörüne atıp aşağıdaki komutla yapıştırabilirsiniz.
                      </p>
                    </div>

                    {structure ? (
                      <div className="space-y-2.5">
                        <div className="rounded-xl border border-line bg-surface p-3 font-mono text-[11px] text-ink space-y-1.5 shadow-inner">
                          <div className="text-ink-dim text-[10px]">// Yapıştırma Komutları:</div>
                          <div className="text-amber-cad select-all font-semibold">
                            //schem load {(structure.structure_name || 'structure').replace(/[^a-z0-9_-]+/gi, '_')}
                          </div>
                          <div className="text-amber-cad select-all font-semibold">//paste -a</div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={handleCopyCommand}
                          className="cursor-pointer flex w-full items-center justify-center gap-1.5 rounded-xl bg-surface py-2.5 text-ink border border-line hover:border-line-bright hover:bg-surface-hover transition-colors shadow-sm font-semibold"
                        >
                          {copiedCmd ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-cad" />
                              <span className="text-emerald-cad">Komutlar Kopyalandı</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 text-ink-muted" />
                              <span>Komutları Kopyala</span>
                            </>
                          )}
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={handleDownload}
                          disabled={downloading}
                          className="cursor-pointer flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-cad py-2.5 font-bold text-base hover:bg-amber-400 transition-colors disabled:opacity-40 shadow-lg shadow-amber-cad/10"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>{downloading ? 'Paketleniyor…' : '.schem İndir (Sponge v2)'}</span>
                        </motion.button>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-line bg-surface/50 p-4 text-center text-ink-dim text-[11px]">
                        Komutları ve dosyayı üretmek için önce bir mimari çalıştırın.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
