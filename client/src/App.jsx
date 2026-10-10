// BlockArchitect CAD Studio - Elite 3D Voxel Engine
// Modüler & Rafine Tripartite Mimari: Canlı Palet Dönüştürücü, Hızlı Temalar, 3D OBJ Export, Survival BOM ve TR/EN i18n.
import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import confetti from 'canvas-confetti';
import VoxelViewer from './components/VoxelViewer.jsx';
import { generateStructure, downloadSchem } from './lib/api.js';
import { cleanId, colorFor } from './lib/blockColors.js';
import { exportStructureToOBJ } from './lib/objExporter.js';
import {
  LANGUAGES,
  TRANSLATIONS,
  BLUEPRINTS_I18N,
  QUICK_SNIPPETS_I18N,
} from './lib/i18n.js';
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
  FolderDown,
  Activity,
  Cpu,
  Wand2,
  SlidersHorizontal,
  Globe,
  FileCode,
  PackageCheck,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';

const MODEL_OPTIONS = [
  { id: 'auto', label: 'Auto Master Router', badgeKey: 'model_recommended', descKey: 'model_auto_desc', icon: Wand2 },
  { id: 'gemini', label: 'Gemini Thinking (2026)', badgeKey: 'model_google', descKey: 'model_gemini_desc', icon: Sparkles },
  { id: 'deepseek', label: 'DeepSeek-V3 / R1', badgeKey: 'model_failover', descKey: 'model_deepseek_desc', icon: Cpu },
];

const SNIPPET_ICONS = [Type, Flame, Cloud, Mountain, Landmark];

const POPULAR_SWAP_BLOCKS = [
  { id: 'minecraft:polished_blackstone_bricks', label: 'Blackstone Bricks' },
  { id: 'minecraft:blackstone', label: 'Blackstone' },
  { id: 'minecraft:deepslate_bricks', label: 'Deepslate Bricks' },
  { id: 'minecraft:mossy_stone_bricks', label: 'Mossy Stone Bricks' },
  { id: 'minecraft:crying_obsidian', label: 'Crying Obsidian' },
  { id: 'minecraft:cherry_planks', label: 'Cherry Planks' },
  { id: 'minecraft:crimson_planks', label: 'Crimson Planks' },
  { id: 'minecraft:warped_planks', label: 'Warped Planks' },
  { id: 'minecraft:calcite', label: 'Calcite' },
  { id: 'minecraft:quartz_block', label: 'Quartz Block' },
  { id: 'minecraft:shroomlight', label: 'Shroomlight' },
  { id: 'minecraft:sea_lantern', label: 'Sea Lantern' },
  { id: 'minecraft:magma_block', label: 'Magma Block' },
  { id: 'minecraft:packed_ice', label: 'Packed Ice' },
  { id: 'minecraft:blue_ice', label: 'Blue Ice' },
  { id: 'minecraft:tinted_glass', label: 'Tinted Glass' },
];

export default function App() {
  // Dil Durumu (Persisted in localStorage)
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('blockarchitect_lang') || 'tr';
    } catch {
      return 'tr';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('blockarchitect_lang', lang);
    } catch {}
  }, [lang]);

  const t = (key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS.tr[key] || key;

  const [provider, setProvider] = useState('deepseek');
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [leftTab, setLeftTab] = useState('prompt'); // 'prompt' | 'blueprints'
  const [rightTab, setRightTab] = useState('palette'); // 'palette' | 'survival' | 'deployment'

  const [prompt, setPrompt] = useState('');
  const [maxSpan, setMaxSpan] = useState(180);
  const [symmetry, setSymmetry] = useState('x'); // 'none' | 'x' | 'z'
  const [dithering, setDithering] = useState(true);

  const [structure, setStructure] = useState(null);
  const [paletteOverrides, setPaletteOverrides] = useState({});
  const [swappingBlock, setSwappingBlock] = useState(null);

  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedDiscord, setCopiedDiscord] = useState(false);

  const [paletteCategory, setPaletteCategory] = useState('all'); // 'all' | 'stone' | 'light' | 'organic'
  const [paletteSearch, setPaletteSearch] = useState('');

  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [telemetryStep, setTelemetryStep] = useState(0);

  const dropdownRef = useRef(null);

  // Aktif dilde hazır şablonlar ve hızlı kod parçacıkları
  const activeBlueprints = BLUEPRINTS_I18N[lang] || BLUEPRINTS_I18N.tr;
  const activeSnippets = QUICK_SNIPPETS_I18N[lang] || QUICK_SNIPPETS_I18N.tr;

  // Canlı Palet Değişiklikleri Uygulanmış Efektif Yapı (0ms Gerçek Zamanlı Renklendirme)
  const effectiveStructure = useMemo(() => {
    if (!structure) return null;
    if (Object.keys(paletteOverrides).length === 0) return structure;
    const newPalette = structure.palette.map((blockId) => {
      const clean = cleanId(blockId);
      if (paletteOverrides[clean]) return paletteOverrides[clean];
      if (paletteOverrides[blockId]) return paletteOverrides[blockId];
      return blockId;
    });
    return {
      ...structure,
      palette: newPalette,
    };
  }, [structure, paletteOverrides]);

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
    setPaletteOverrides({});
    try {
      let fullPrompt = prompt.trim();
      if (maxSpan) fullPrompt += ` (Span limit: ${maxSpan} blocks)`;
      if (symmetry === 'x') fullPrompt += ` (Left-Right X-axis mirror symmetry)`;
      if (symmetry === 'z') fullPrompt += ` (Front-Back Z-axis mirror symmetry)`;
      if (dithering) fullPrompt += ` (WorldEdit % gradient dithering enabled)`;

      const res = await generateStructure(fullPrompt, provider);
      setStructure(res);
      setRightOpen(true);
      toast.success(t('toast_compile_success'), {
        description: `${res.structure_name} • ${res.blocks.length.toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')} ${t('metric_voxels')}`,
      });
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.82 },
        colors: ['#f59e0b', '#38bdf8', '#10b981', '#ffffff'],
      });
    } catch (err) {
      setError(err.message);
      toast.error(t('toast_compile_error'), {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!effectiveStructure) return;
    setDownloading(true);
    setError('');
    try {
      await downloadSchem(effectiveStructure);
      toast.success(t('toast_download_schem'), {
        description: `${effectiveStructure.structure_name}.schem (Sponge v2)`,
      });
    } catch (err) {
      setError(err.message);
      toast.error('Download Error', { description: err.message });
    } finally {
      setDownloading(false);
    }
  }

  function handleDownloadOBJ() {
    if (!effectiveStructure) return;
    try {
      exportStructureToOBJ(effectiveStructure);
      toast.success(t('toast_obj_download'));
    } catch (err) {
      toast.error('OBJ Export Error', { description: err.message });
    }
  }

  function handleCopyCommand() {
    if (!effectiveStructure) return;
    const safeName = (effectiveStructure.structure_name || 'structure').replace(/[^a-z0-9_-]+/gi, '_');
    const cmd = `//schem load ${safeName}\n//paste -a`;
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    toast.info(t('copied_cmd_toast'), {
      description: `//schem load ${safeName} & //paste -a`,
    });
    setTimeout(() => setCopiedCmd(false), 2000);
  }

  // 1-Tık Hızlı Tema Dönüştürücü Fonksiyonu (Viral Özellik)
  function applyThemePreset(themeKey) {
    if (!structure) return;
    if (themeKey === 'reset') {
      setPaletteOverrides({});
      toast.info(t('toast_theme_applied'));
      return;
    }

    const newOverrides = {};
    for (const blockId of structure.palette) {
      const clean = cleanId(blockId);
      if (themeKey === 'nether') {
        if (/stone_brick|deepslate_brick/.test(clean)) {
          newOverrides[clean] = 'minecraft:polished_blackstone_bricks';
        } else if (/stone|deepslate|cobblestone|andesite|tuff/.test(clean)) {
          newOverrides[clean] = 'minecraft:blackstone';
        } else if (/planks|log|wood/.test(clean)) {
          newOverrides[clean] = 'minecraft:crimson_planks';
        } else if (/shroomlight|glowstone|lantern|sea_lantern/.test(clean)) {
          newOverrides[clean] = 'minecraft:magma_block';
        } else if (/glass/.test(clean)) {
          newOverrides[clean] = 'minecraft:red_stained_glass';
        }
      } else if (themeKey === 'cherry') {
        if (/planks|wood|log/.test(clean)) {
          newOverrides[clean] = 'minecraft:cherry_planks';
        } else if (/stone_brick|deepslate/.test(clean)) {
          newOverrides[clean] = 'minecraft:calcite';
        } else if (/stone|blackstone/.test(clean)) {
          newOverrides[clean] = 'minecraft:quartz_block';
        } else if (/glass/.test(clean)) {
          newOverrides[clean] = 'minecraft:pink_stained_glass';
        }
      } else if (themeKey === 'frozen') {
        if (/stone|deepslate|blackstone/.test(clean)) {
          newOverrides[clean] = 'minecraft:packed_ice';
        } else if (/planks|wood|concrete/.test(clean)) {
          newOverrides[clean] = 'minecraft:blue_ice';
        } else if (/glowstone|lantern|torch/.test(clean)) {
          newOverrides[clean] = 'minecraft:sea_lantern';
        } else if (/glass/.test(clean)) {
          newOverrides[clean] = 'minecraft:cyan_stained_glass';
        }
      } else if (themeKey === 'ancient') {
        if (/stone_brick/.test(clean)) {
          newOverrides[clean] = 'minecraft:mossy_stone_bricks';
        } else if (/cobblestone/.test(clean)) {
          newOverrides[clean] = 'minecraft:mossy_cobblestone';
        } else if (/stone|andesite/.test(clean)) {
          newOverrides[clean] = 'minecraft:cracked_stone_bricks';
        }
      }
    }

    setPaletteOverrides(newOverrides);
    toast.success(t('toast_theme_applied'));
  }

  // Survival Malzeme Hesaplaması
  const survivalData = useMemo(() => {
    if (!effectiveStructure || !effectiveStructure.blocks) return null;
    const counts = new Map();
    for (const b of effectiveStructure.blocks) {
      const raw = effectiveStructure.palette[b.state];
      if (!raw) continue;
      const name = cleanId(raw);
      counts.set(name, (counts.get(name) || 0) + 1);
    }
    const list = [...counts.entries()].map(([name, count]) => {
      const shulkers = Math.floor(count / (27 * 64));
      const remAfterShulker = count % (27 * 64);
      const stacks = Math.floor(remAfterShulker / 64);
      const remBlocks = remAfterShulker % 64;
      return { name, count, shulkers, stacks, remBlocks };
    });
    list.sort((a, b) => b.count - a.count);
    const total = effectiveStructure.blocks.length;
    const totalShulkers = Math.floor(total / (27 * 64));
    const totalStacks = Math.floor(total / 64);
    return { list, total, totalShulkers, totalStacks };
  }, [effectiveStructure]);

  function handleCopyDiscordBOM() {
    if (!survivalData || !effectiveStructure) return;
    const lines = [
      `📦 **BlockArchitect Survival ${t('survival_title')}**`,
      `🏰 ${lang === 'tr' ? 'Yapı' : 'Structure'}: **${effectiveStructure.structure_name}** | ${t('survival_total_blocks')}: **${survivalData.total.toLocaleString()}**`,
      `🎒 ${lang === 'tr' ? 'Toplam İhtiyaç' : 'Total Required'}: **${survivalData.totalShulkers} ${t('survival_format_shulker')} + ${survivalData.totalStacks} ${t('survival_format_stack')}**`,
      `─────────────────────────────────────`,
    ];
    for (const item of survivalData.list) {
      const parts = [];
      if (item.shulkers > 0) parts.push(`${item.shulkers} ${t('survival_format_shulker')}`);
      if (item.stacks > 0) parts.push(`${item.stacks} ${t('survival_format_stack')}`);
      if (item.remBlocks > 0 || parts.length === 0) parts.push(`${item.remBlocks} ${t('survival_format_block')}`);
      lines.push(`• **${item.name}**: ${item.count.toLocaleString()}x (${parts.join(' + ')})`);
    }
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedDiscord(true);
    toast.success(t('survival_copied_toast'));
    setTimeout(() => setCopiedDiscord(false), 2000);
  }

  function handleDownloadMcfunction() {
    if (!effectiveStructure || !effectiveStructure.blocks) return;
    const lines = [
      `# ==========================================`,
      `# BlockArchitect CAD Studio - Vanilla Export`,
      `# Structure: ${effectiveStructure.structure_name}`,
      `# Total Blocks: ${effectiveStructure.blocks.length}`,
      `# Date: ${new Date().toISOString()}`,
      `# ==========================================`,
      ``,
    ];
    for (const b of effectiveStructure.blocks) {
      const raw = effectiveStructure.palette[b.state];
      if (!raw) continue;
      const id = cleanId(raw);
      lines.push(`setblock ~${b.x} ~${b.y} ~${b.z} ${id}`);
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (effectiveStructure.structure_name || 'structure').replace(/[^a-z0-9_-]+/gi, '_');
    a.download = `${safeName}.mcfunction`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('survival_mcfunction_toast'));
  }

  const dims = effectiveStructure?.dimensions;

  const stats = useMemo(() => {
    if (!effectiveStructure) return { topBlocks: [], total: 0 };
    const counts = new Map();
    for (const b of effectiveStructure.blocks) {
      const name = cleanId(effectiveStructure.palette[b.state]);
      counts.set(name, (counts.get(name) || 0) + 1);
    }
    const total = effectiveStructure.blocks.length;
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    return { topBlocks: sorted, total };
  }, [effectiveStructure]);

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
    t('telemetry_1'),
    t('telemetry_2'),
    t('telemetry_3'),
    t('telemetry_4'),
    t('telemetry_5'),
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
            <span className="text-[10px] text-ink-dim tracking-normal">/ CAD STUDIO</span>
          </div>

          <span className="h-3 w-px bg-white/10" />

          {/* Aktif Şema Adı */}
          <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
            <span className="text-ink font-medium">
              {effectiveStructure ? `${effectiveStructure.structure_name}.schem` : 'untitled_project.schem'}
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
                  {lang === 'tr' ? 'Yapay Zeka Mimar Motoru' : 'AI Architect Engine'}
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
                        toast.info(`${opt.label} active.`);
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
                            {t(opt.badgeKey)}
                          </span>
                        </div>
                        <p className="text-[10px] text-ink-dim mt-0.5 truncate">{t(opt.descKey)}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sağ: Dil Seçici, Hızlı İşlem Düğmeleri ve Panel Toggles */}
        <div className="flex items-center gap-2">
          {/* TR / EN Dil Seçici */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => {
              const nextLang = lang === 'tr' ? 'en' : 'tr';
              setLang(nextLang);
              toast.success(nextLang === 'tr' ? 'Türkçe arayüz aktif.' : 'English interface enabled.');
            }}
            title={lang === 'tr' ? 'Switch interface to English' : 'Arayüzü Türkçe yap'}
            className="cursor-pointer flex h-7 items-center gap-1.5 rounded-lg border border-line bg-surface/90 px-2 text-[11px] font-mono text-ink hover:border-line-bright hover:bg-surface-hover transition-colors shadow-sm"
          >
            <Globe className="h-3 w-3 text-cyan-cad" />
            <span>{LANGUAGES[lang].flag}</span>
            <span className="font-semibold text-amber-cad uppercase">{lang}</span>
          </motion.button>

          <span className="h-3 w-px bg-white/10" />

          {effectiveStructure && (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleCopyCommand}
                title="WorldEdit (//schem load & //paste)"
                className="cursor-pointer flex h-7 items-center gap-1.5 rounded-lg bg-surface px-2.5 text-[11px] text-ink border border-line hover:border-line-bright hover:bg-surface-hover transition-colors shadow-sm"
              >
                {copiedCmd ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-cad" />
                    <span className="text-emerald-cad font-semibold">{t('copied_cmd_toast')}</span>
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
                title="WorldEdit .schem"
                className="cursor-pointer flex h-7 items-center gap-1.5 rounded-lg bg-amber-cad/15 px-2.5 text-[11px] text-amber-cad border border-amber-cad/30 hover:bg-amber-cad/25 transition-colors disabled:opacity-40 shadow-sm"
              >
                <Download className="h-3 w-3" />
                <span>{downloading ? t('compiling') : t('download_schem')}</span>
              </motion.button>
            </>
          )}

          <span className="h-3 w-px bg-white/10" />

          {/* Sol Panel (Mimar) Toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setLeftOpen(!leftOpen)}
            title={leftOpen ? 'Hide Left Panel' : 'Show Left Panel'}
            className={`cursor-pointer flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[11px] border transition-colors ${
              leftOpen ? 'bg-surface text-ink border-line' : 'text-ink-dim border-transparent hover:text-ink'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">{lang === 'tr' ? 'Mimar' : 'Architect'}</span>
          </motion.button>

          {/* Sağ Panel (Denetçi) Toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setRightOpen(!rightOpen)}
            title={rightOpen ? 'Hide Right Panel' : 'Show Right Panel'}
            className={`cursor-pointer flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[11px] border transition-colors ${
              rightOpen ? 'bg-surface text-ink border-line' : 'text-ink-dim border-transparent hover:text-ink'
            }`}
          >
            <Palette className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">{lang === 'tr' ? 'Denetçi' : 'Inspector'}</span>
          </motion.button>
        </div>
      </header>

      {/* TRIPARTITE ÇALIŞMA ALANI: Solda Mimar, Ortada 3B Viewport, Sağda Denetçi */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* SOL CAD MİMAR PANELİ (360px) */}
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
                    {t('tab_directive')}
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
                    {t('tab_blueprints')} ({activeBlueprints.length})
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
                          {t('cad_console_title')}
                        </span>
                        <span className="text-ink-dim">{prompt.length} / 4000</span>
                      </div>

                      <div className="rounded-xl border border-line bg-surface p-2.5 focus-within:border-amber-cad/60 focus-within:ring-1 focus-within:ring-amber-cad/20 transition-all shadow-inner">
                        <textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          maxLength={4000}
                          rows={6}
                          placeholder={t('prompt_placeholder')}
                          className="w-full resize-none bg-transparent font-mono text-xs leading-relaxed text-ink outline-none placeholder:text-ink-dim"
                        />
                      </div>

                      {/* Hızlı Mimari Parçacıkları */}
                      <div className="space-y-1.5">
                        <span className="font-mono text-[10px] text-ink-dim uppercase">{t('quick_snippets')}:</span>
                        <div className="flex flex-wrap gap-1">
                          {activeSnippets.map((s, idx) => {
                            const Icon = SNIPPET_ICONS[idx % SNIPPET_ICONS.length];
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

                      {/* CAD Parametre Kılavuzları */}
                      <div className="space-y-2 rounded-xl border border-line bg-surface/50 p-3 font-mono text-xs">
                        <span className="text-[10px] text-ink-dim uppercase flex items-center gap-1">
                          <SlidersHorizontal className="h-3 w-3 text-amber-cad" />
                          {t('cad_controls_title')}:
                        </span>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-ink-muted">{t('max_volume_span')}:</span>
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
                          <span className="text-ink-muted">{t('mirror_symmetry')}:</span>
                          <div className="flex rounded-lg border border-line bg-surface p-0.5 gap-0.5">
                            {[
                              { id: 'none', label: t('sym_none') },
                              { id: 'x', label: t('sym_x') },
                              { id: 'z', label: t('sym_z') },
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
                          <span className="text-ink-muted">{t('gradient_dithering')}:</span>
                          <button
                            type="button"
                            onClick={() => setDithering(!dithering)}
                            className={`cursor-pointer px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors ${
                              dithering
                                ? 'bg-emerald-cad/15 text-emerald-cad border-emerald-cad/30'
                                : 'bg-surface text-ink-dim border-line'
                            }`}
                          >
                            {dithering ? 'ON' : 'OFF'}
                          </button>
                        </div>
                      </div>

                      {/* Derle Butonu */}
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading || prompt.trim().length < 3}
                        className="cursor-pointer group flex w-full items-center justify-center gap-2 rounded-xl bg-amber-cad px-4 py-2.5 font-mono text-xs font-bold text-base shadow-lg shadow-amber-cad/10 transition-all hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>{loading ? t('compiling') : t('compile_btn')}</span>
                        <kbd className="hidden sm:inline rounded bg-base/20 px-1.5 py-0.2 font-mono text-[10px] text-base">
                          Ctrl + ↵
                        </kbd>
                      </motion.button>
                    </form>

                    {/* Hata Raporu */}
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
                            💡 <strong>DeepSeek Balance Alert:</strong> Top up at{' '}
                            <a
                              href="https://platform.deepseek.com/top_up"
                              target="_blank"
                              rel="noreferrer"
                              className="underline text-amber-cad ml-1"
                            >
                              platform.deepseek.com/top_up
                            </a>.
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
                            Pipeline Active
                          </span>
                          <span>Step {Math.min(telemetryStep + 1, 5)} / 5</span>
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
                      <span>{t('blueprints_header')}</span>
                      <span>{activeBlueprints.length} Presets</span>
                    </div>

                    <div className="space-y-2.5">
                      {activeBlueprints.map((bp) => (
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
                            {bp.tags.map((tg) => (
                              <span key={tg} className="rounded bg-base/80 px-1.5 py-0.2 text-[9px] text-amber-cad border border-white/5">
                                {tg}
                              </span>
                            ))}
                          </div>

                          <p className="text-[11px] text-ink-dim leading-relaxed">{bp.desc}</p>

                          <button
                            type="button"
                            onClick={() => {
                              setPrompt(bp.prompt);
                              setLeftTab('prompt');
                              toast.success(`"${bp.title}" injected into console!`);
                            }}
                            className="cursor-pointer w-full flex items-center justify-center gap-1.5 rounded-lg bg-base py-1.5 text-[10px] text-ink border border-line hover:border-amber-cad/50 hover:text-amber-cad transition-colors font-semibold"
                          >
                            <Play className="h-3 w-3 fill-current" />
                            <span>{t('blueprint_use_btn')}</span>
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

        {/* ORTA: KESİNTİSİZ VE DAİMİ 3B VIEWPORT */}
        <main className="relative flex-1 h-full w-full bg-base overflow-hidden">
          <VoxelViewer
            structure={effectiveStructure}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
            lang={lang}
          />
        </main>

        {/* SAĞ CAD DENETÇİ PANELİ (330px - Palet, Survival BOM & WorldEdit) */}
        <AnimatePresence initial={false}>
          {rightOpen && !isFullscreen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 330, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="shrink-0 flex flex-col border-l border-line bg-panel z-20 overflow-hidden shadow-2xl"
            >
              {/* Sağ Üst 3'lü Gliding Tab Switcher */}
              <div className="w-[330px] border-b border-line bg-surface/40 p-1.5 flex items-center gap-1 font-mono text-[10px]">
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
                  <span className="relative z-10 flex items-center justify-center gap-1">
                    <Palette className="h-3 w-3 text-amber-cad" />
                    {t('tab_palette')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRightTab('survival')}
                  className={`relative cursor-pointer flex-1 py-1.5 rounded-lg text-center font-semibold transition-colors ${
                    rightTab === 'survival' ? 'text-ink' : 'text-ink-dim hover:text-ink-muted'
                  }`}
                >
                  {rightTab === 'survival' && (
                    <motion.div
                      layoutId="rightTabIndicator"
                      className="absolute inset-0 rounded-lg bg-surface border border-line shadow-sm"
                      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-1">
                    <PackageCheck className="h-3 w-3 text-emerald-cad" />
                    {t('tab_survival')}
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
                  <span className="relative z-10 flex items-center justify-center gap-1">
                    <FolderDown className="h-3 w-3 text-amber-cad" />
                    {t('tab_deployment')}
                  </span>
                </button>
              </div>

              {/* Sağ Panel İçerik Alanı */}
              <div className="w-[330px] flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
                {rightTab === 'palette' && (
                  <div className="space-y-4">
                    {/* Hacim & Voksel İstatistiği */}
                    <div className="space-y-2">
                      <span className="text-ink-muted uppercase tracking-wider text-[11px] font-semibold flex items-center gap-1.5">
                        <Box className="h-3.5 w-3.5 text-amber-cad" />
                        {t('metric_volume')} & {t('metric_voxels')}
                      </span>

                      {effectiveStructure ? (
                        <div className="rounded-xl border border-line bg-surface p-3 space-y-2.5 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-ink font-bold text-sm tracking-tight truncate">
                              {effectiveStructure.structure_name}
                            </span>
                            <span className="text-emerald-cad text-[10px] bg-emerald-cad/10 px-1.5 py-0.5 rounded border border-emerald-cad/20 font-semibold">
                              OK
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                            <div className="rounded border border-line bg-base p-1.5">
                              <div className="text-ink-dim">{t('metric_volume')}</div>
                              <div className="text-ink font-semibold mt-0.5">
                                {dims.width}×{dims.height}×{dims.depth}
                              </div>
                            </div>
                            <div className="rounded border border-line bg-base p-1.5">
                              <div className="text-ink-dim">{t('metric_voxels')}</div>
                              <div className="text-emerald-cad font-semibold mt-0.5">
                                {stats.total.toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')}
                              </div>
                            </div>
                            <div className="rounded border border-line bg-base p-1.5">
                              <div className="text-ink-dim">{t('metric_chunk')}</div>
                              <div className="text-cyan-cad font-semibold mt-0.5">
                                {(dims.width / 16).toFixed(1)}×{(dims.depth / 16).toFixed(1)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-line bg-surface/50 p-4 text-center text-ink-dim text-[11px]">
                          {t('empty_prompt_hint')}
                        </div>
                      )}
                    </div>

                    {/* HIZLI TEMA DÖNÜŞTÜRÜCÜ (Viral 1-Click Themes) */}
                    {effectiveStructure && (
                      <div className="space-y-2 pt-2 border-t border-line">
                        <div className="flex items-center justify-between">
                          <span className="text-ink-muted uppercase tracking-wider text-[10px] font-semibold flex items-center gap-1.5">
                            <Sparkles className="h-3 w-3 text-amber-cad" />
                            {t('theme_presets_title')}
                          </span>
                          {Object.keys(paletteOverrides).length > 0 && (
                            <button
                              type="button"
                              onClick={() => applyThemePreset('reset')}
                              className="cursor-pointer text-[10px] text-amber-cad hover:underline flex items-center gap-1"
                            >
                              <RotateCcw className="h-2.5 w-2.5" />
                              {t('theme_reset')}
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={() => applyThemePreset('nether')}
                            className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-red-200 hover:bg-red-500/20 transition-colors font-semibold"
                          >
                            <span>🌋</span>
                            <span className="truncate">{t('theme_nether')}</span>
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={() => applyThemePreset('cherry')}
                            className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-pink-500/30 bg-pink-500/10 p-2 text-pink-200 hover:bg-pink-500/20 transition-colors font-semibold"
                          >
                            <span>🌸</span>
                            <span className="truncate">{t('theme_cherry')}</span>
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={() => applyThemePreset('frozen')}
                            className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-2 text-cyan-200 hover:bg-cyan-500/20 transition-colors font-semibold"
                          >
                            <span>❄️</span>
                            <span className="truncate">{t('theme_frozen')}</span>
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={() => applyThemePreset('ancient')}
                            className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-emerald-200 hover:bg-emerald-500/20 transition-colors font-semibold"
                          >
                            <span>🏛️</span>
                            <span className="truncate">{t('theme_ancient')}</span>
                          </motion.button>
                        </div>
                      </div>
                    )}

                    {/* Malzeme Paleti & Kategori Filtresi */}
                    <div className="space-y-2.5 pt-2 border-t border-line">
                      <div className="flex items-center justify-between">
                        <span className="text-ink-muted uppercase tracking-wider text-[11px] font-semibold flex items-center gap-1.5">
                          <Palette className="h-3.5 w-3.5 text-amber-cad" />
                          {t('tab_palette')}
                        </span>
                        <span className="text-ink-dim text-[10px]">{filteredBlocks.length}</span>
                      </div>

                      {/* Kategori Filtre Hapları */}
                      <div className="flex rounded-lg border border-line bg-surface p-0.5 gap-0.5 text-[10px]">
                        {[
                          { id: 'all', label: t('palette_cat_all') },
                          { id: 'stone', label: t('palette_cat_stone') },
                          { id: 'light', label: t('palette_cat_light') },
                          { id: 'organic', label: t('palette_cat_organic') },
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
                          placeholder={t('palette_search')}
                          className="w-full rounded-lg border border-line bg-surface py-1 pl-8 pr-3 text-[11px] text-ink outline-none placeholder:text-ink-dim focus:border-amber-cad/50"
                        />
                      </div>

                      {filteredBlocks.length === 0 ? (
                        <div className="p-4 text-center text-ink-dim text-[11px]">
                          {t('no_blocks_found')}
                        </div>
                      ) : (
                        <ul className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
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
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => setSwappingBlock(name)}
                                      title={t('swap_block_btn')}
                                      className="cursor-pointer text-[10px] text-ink-dim hover:text-amber-cad flex items-center gap-1 px-1.5 py-0.5 rounded bg-base/80 border border-white/5 hover:border-amber-cad/40 transition-colors"
                                    >
                                      <RefreshCw className="h-2.5 w-2.5" />
                                      <span>{t('swap_block_btn')}</span>
                                    </button>
                                    <span className="text-amber-cad font-semibold">%{pct}</span>
                                  </div>
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
                )}

                {/* SURVIVAL BOM (ALISVERIS LISTESI) SEKMESI */}
                {rightTab === 'survival' && (
                  <div className="space-y-3.5">
                    <span className="text-ink-muted uppercase tracking-wider text-[11px] font-semibold flex items-center gap-1.5">
                      <PackageCheck className="h-3.5 w-3.5 text-emerald-cad" />
                      {t('survival_title')}
                    </span>

                    <p className="text-[11px] text-ink-dim leading-relaxed">
                      {t('survival_desc')}
                    </p>

                    {survivalData ? (
                      <div className="space-y-3">
                        {/* Shulker & Stack Özet Kartı */}
                        <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                          <div className="rounded-xl border border-line bg-surface p-2">
                            <div className="text-ink-dim">{t('survival_total_blocks')}</div>
                            <div className="text-amber-cad font-bold text-xs mt-0.5">
                              {survivalData.total.toLocaleString()}
                            </div>
                          </div>
                          <div className="rounded-xl border border-line bg-surface p-2">
                            <div className="text-ink-dim">{t('survival_shulkers')}</div>
                            <div className="text-emerald-cad font-bold text-xs mt-0.5">
                              {survivalData.totalShulkers} Sb
                            </div>
                          </div>
                          <div className="rounded-xl border border-line bg-surface p-2">
                            <div className="text-ink-dim">{t('survival_stacks')}</div>
                            <div className="text-cyan-cad font-bold text-xs mt-0.5">
                              {survivalData.totalStacks} St
                            </div>
                          </div>
                        </div>

                        {/* Aksiyon Düğmeleri: Discord Kopyala & Vanilla .mcfunction */}
                        <div className="grid grid-cols-2 gap-1.5">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={handleCopyDiscordBOM}
                            className="cursor-pointer flex items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-2 text-[10px] text-ink hover:bg-surface-hover hover:border-emerald-cad/40 transition-colors shadow-sm font-semibold"
                          >
                            {copiedDiscord ? (
                              <Check className="h-3 w-3 text-emerald-cad" />
                            ) : (
                              <Copy className="h-3 w-3 text-ink-dim" />
                            )}
                            <span className="truncate">{t('survival_copy_discord')}</span>
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={handleDownloadMcfunction}
                            className="cursor-pointer flex items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-2 text-[10px] text-amber-cad hover:bg-surface-hover hover:border-amber-cad/40 transition-colors shadow-sm font-semibold"
                          >
                            <FileCode className="h-3 w-3" />
                            <span className="truncate">.mcfunction</span>
                          </motion.button>
                        </div>

                        {/* Detaylı Malzeme Listesi */}
                        <div className="space-y-1.5 pt-1">
                          <div className="text-[10px] text-ink-dim uppercase">
                            {lang === 'tr' ? 'Malzeme Ayrıştırması' : 'Material Breakdown'}:
                          </div>
                          <ul className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                            {survivalData.list.map((item) => (
                              <li
                                key={item.name}
                                className="rounded-lg border border-line bg-surface/70 p-2 text-[11px] space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 truncate">
                                    <span
                                      className="h-3 w-3 shrink-0 rounded border border-white/20 shadow-sm"
                                      style={{ background: colorFor(item.name) }}
                                    />
                                    <span className="truncate text-ink font-mono font-medium">{item.name}</span>
                                  </div>
                                  <span className="text-amber-cad font-bold shrink-0">
                                    {item.count.toLocaleString()}x
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-ink-dim font-mono">
                                  {item.shulkers > 0 && (
                                    <span className="text-emerald-cad font-semibold">
                                      {item.shulkers} {t('survival_format_shulker')}
                                    </span>
                                  )}
                                  {item.stacks > 0 && (
                                    <span className="text-cyan-cad">
                                      {item.stacks} {t('survival_format_stack')}
                                    </span>
                                  )}
                                  {item.remBlocks > 0 && (
                                    <span>
                                      {item.remBlocks} {t('survival_format_block')}
                                    </span>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-line bg-surface/50 p-4 text-center text-ink-dim text-[11px]">
                        {t('empty_prompt_hint')}
                      </div>
                    )}
                  </div>
                )}

                {/* WORLDEDIT & 3D DIŞA AKTARMA SEKMESI */}
                {rightTab === 'deployment' && (
                  <div className="space-y-4">
                    <span className="text-ink-muted uppercase tracking-wider text-[11px] font-semibold flex items-center gap-1.5">
                      <FolderDown className="h-3.5 w-3.5 text-amber-cad" />
                      {t('deployment_title')}
                    </span>

                    <div className="rounded-xl border border-line bg-surface/70 p-3 space-y-2 text-[11px] text-ink-dim leading-relaxed">
                      <div className="text-ink font-semibold flex items-center gap-1">
                        <Check className="h-3.5 w-3.5 text-emerald-cad" />
                        FAWE / Axiom / Blender 3D
                      </div>
                      <p>{t('deployment_desc')}</p>
                    </div>

                    {effectiveStructure ? (
                      <div className="space-y-2.5">
                        <div className="rounded-xl border border-line bg-surface p-3 font-mono text-[11px] text-ink space-y-1.5 shadow-inner">
                          <div className="text-ink-dim text-[10px]">// WorldEdit:</div>
                          <div className="text-amber-cad select-all font-semibold">
                            //schem load {(effectiveStructure.structure_name || 'structure').replace(/[^a-z0-9_-]+/gi, '_')}
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
                              <span className="text-emerald-cad">{t('copied_cmd_toast')}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 text-ink-muted" />
                              <span>{t('copy_cmd')}</span>
                            </>
                          )}
                        </motion.button>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={handleDownload}
                            disabled={downloading}
                            className="cursor-pointer flex items-center justify-center gap-1.5 rounded-xl bg-amber-cad py-2.5 font-bold text-base hover:bg-amber-400 transition-colors disabled:opacity-40 shadow-lg shadow-amber-cad/10"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>.schem (Sponge v2)</span>
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={handleDownloadOBJ}
                            className="cursor-pointer flex items-center justify-center gap-1.5 rounded-xl border border-cyan-cad/40 bg-cyan-cad/10 py-2.5 font-bold text-cyan-cad hover:bg-cyan-cad/20 transition-colors shadow-sm"
                          >
                            <Box className="h-3.5 w-3.5" />
                            <span>3D .OBJ (Blender)</span>
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-line bg-surface/50 p-4 text-center text-ink-dim text-[11px]">
                        {t('empty_prompt_hint')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* BLOK DEGISTIRME MODALI */}
      <AnimatePresence>
        {swappingBlock && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-mono text-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="w-full max-w-md rounded-2xl border border-line bg-panel p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3.5 w-3.5 rounded border border-white/20 shadow-sm"
                    style={{ background: colorFor(swappingBlock) }}
                  />
                  <span className="font-bold text-sm text-ink">{t('swap_modal_title')}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSwappingBlock(null)}
                  className="cursor-pointer text-ink-dim hover:text-ink text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="text-[11px] text-ink-muted">
                <span className="text-amber-cad font-semibold">{swappingBlock}</span> {lang === 'tr' ? 'bloğu tüm yapıda şu blokla değiştirilecek:' : 'block will be replaced across the entire model with:'}
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                {POPULAR_SWAP_BLOCKS.map((pb) => (
                  <button
                    key={pb.id}
                    type="button"
                    onClick={() => {
                      setPaletteOverrides((prev) => ({ ...prev, [swappingBlock]: pb.id }));
                      setSwappingBlock(null);
                      toast.success(`${swappingBlock} ➔ ${pb.id}`);
                    }}
                    className="cursor-pointer flex items-center gap-2 rounded-lg border border-line bg-surface p-2 text-left hover:border-amber-cad/50 hover:bg-surface-hover transition-colors"
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded border border-white/20 shadow-sm"
                      style={{ background: colorFor(pb.id) }}
                    />
                    <span className="truncate text-ink font-medium">{pb.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
