// BlockArchitect CAD Voxel Studio Engine (@react-three/fiber + InstancedMesh + PostProcessing Bloom)
// AAA Cinematic Render: Shroomlight, Magma, Crying Obsidian gerçekçi Bloom ışıması, Raycasting ve Katman Slayderı.
import { useLayoutEffect, useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { cleanId, colorFor, isTransparent } from '../lib/blockColors.js';
import { TRANSLATIONS } from '../lib/i18n.js';
import {
  Box,
  Layers,
  Eye,
  Compass,
  RotateCcw,
  Sun,
  Sunset,
  Flame,
  Grid,
  Maximize2,
  Minimize2,
  Sliders,
  Scan,
  Crosshair,
  Sparkles,
} from 'lucide-react';

const cubeGeometry = new THREE.BoxGeometry(0.965, 0.965, 0.965);

// Voksel Grubu Bileşeni (Her blok türü için InstancedMesh + Emissive Bloom Işıması)
function BlockGroup({ id, positions, offset, maxLayerY, wireframe, onHoverBlock }) {
  const meshRef = useRef();
  const color = useMemo(() => new THREE.Color(colorFor(id)), [id]);
  const transparent = isTransparent(id);
  const isEmissive = useMemo(
    () => /shroomlight|glowstone|sea_lantern|lava|magma_block|crying_obsidian|torch|lantern|redstone_lamp/.test(id),
    [id]
  );

  const activePositions = useMemo(() => {
    if (maxLayerY === undefined || maxLayerY === null) return positions;
    return positions.filter((p) => p[1] <= maxLayerY);
  }, [positions, maxLayerY]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || activePositions.length === 0) return;
    const m = new THREE.Matrix4();
    const c = new THREE.Color();

    for (let i = 0; i < activePositions.length; i++) {
      const [x, y, z] = activePositions[i];
      m.setPosition(x + 0.5 + offset[0], y + 0.5, z + 0.5 + offset[2]);
      mesh.setMatrixAt(i, m);

      // İnce mikro varyasyon (Minecraft blok yüzey dokusu hissi)
      const v = 0.94 + (((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) >>> 0) % 100 / 1600;
      mesh.setColorAt(i, c.setScalar(v));
    }
    mesh.count = activePositions.length;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [activePositions, offset]);

  const handlePointerMove = useCallback(
    (e) => {
      e.stopPropagation();
      const idx = e.instanceId;
      if (idx !== undefined && activePositions[idx]) {
        const [x, y, z] = activePositions[idx];
        onHoverBlock?.({ id, x, y, z });
      }
    },
    [activePositions, id, onHoverBlock]
  );

  if (activePositions.length === 0) return null;

  return (
    <instancedMesh
      key={id + activePositions.length}
      ref={meshRef}
      args={[cubeGeometry, undefined, activePositions.length]}
      onPointerMove={handlePointerMove}
      onPointerOut={() => onHoverBlock?.(null)}
    >
      <meshStandardMaterial
        color={color}
        roughness={isEmissive ? 0.35 : 0.65}
        metalness={0.12}
        wireframe={wireframe}
        transparent={transparent}
        opacity={transparent ? 0.6 : 1.0}
        depthWrite={!transparent}
        emissive={isEmissive ? color : '#000000'}
        emissiveIntensity={isEmissive ? 1.6 : 0}
      />
    </instancedMesh>
  );
}

// Boş CAD Sahnesi Kılavuz İskeleti (Holographic Build Pedestal)
function EmptyScaffold() {
  const boxPoints = useMemo(() => {
    const size = 64;
    const h = 32;
    const half = size / 2;
    return [
      [-half, 0, -half], [half, 0, -half],
      [half, 0, -half], [half, 0, half],
      [half, 0, half], [-half, 0, half],
      [-half, 0, half], [-half, 0, -half],
      [-half, h, -half], [half, h, -half],
      [half, h, -half], [half, h, half],
      [half, h, half], [-half, h, half],
      [-half, h, half], [-half, h, -half],
      [-half, 0, -half], [-half, h, -half],
      [half, 0, -half], [half, h, -half],
      [half, 0, half], [half, h, half],
      [-half, 0, half], [-half, h, half],
    ].map((p) => new THREE.Vector3(...p));
  }, []);

  const lineGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(boxPoints), [boxPoints]);

  return (
    <group>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial color="#38bdf8" opacity={0.3} transparent={true} />
      </lineSegments>

      <axesHelper args={[16]} position={[0, 0.05, 0]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[2.5, 2.7, 48]} />
        <meshBasicMaterial color="#f59e0b" opacity={0.7} transparent={true} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[6.0, 6.15, 48]} />
        <meshBasicMaterial color="#38bdf8" opacity={0.35} transparent={true} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// Minecraft 16x16 Chunk Grid Kılavuzu
function ChunkGrid({ size = 128, colorSub = '#181b24', colorChunk = '#333a4c' }) {
  return (
    <group position={[0, -0.01, 0]}>
      <gridHelper args={[size, size, colorChunk, colorSub]} />
      <gridHelper args={[size, Math.floor(size / 16), '#f59e0b', colorChunk]} position={[0, 0.005, 0]} />
    </group>
  );
}

function CameraRig({ controlsRef, target, span }) {
  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      target={target}
      enableDamping={true}
      dampingFactor={0.07}
      minDistance={4}
      maxDistance={Math.max(span * 9, 350)}
      maxPolarAngle={Math.PI * 0.495}
    />
  );
}

export default function VoxelViewer({ structure, isFullscreen, onToggleFullscreen, lang = 'tr' }) {
  const t = (key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS.tr[key] || key;
  const hasStructure = Boolean(structure && structure.blocks && structure.blocks.length > 0);
  const dims = structure?.dimensions || { width: 64, height: 32, depth: 64 };
  const { width, height, depth } = dims;

  const [maxLayerY, setMaxLayerY] = useState(height - 1);
  const [wireframe, setWireframe] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [bloomEnabled, setBloomEnabled] = useState(true);
  const [theme, setTheme] = useState('studio'); // 'studio', 'nether', 'dusk'
  const [hoveredVoxel, setHoveredVoxel] = useState(null);
  const [showSlicer, setShowSlicer] = useState(false);
  const controlsRef = useRef();

  useEffect(() => {
    setMaxLayerY(height - 1);
  }, [height, structure]);

  const groups = useMemo(() => {
    if (!hasStructure) return [];
    const map = new Map();
    for (const b of structure.blocks) {
      const raw = structure.palette[b.state];
      if (!raw) continue;
      const id = cleanId(raw);
      if (!map.has(id)) map.set(id, []);
      map.get(id).push([b.x, b.y, b.z]);
    }
    return [...map.entries()];
  }, [structure, hasStructure]);

  const offset = useMemo(() => [-width / 2, 0, -depth / 2], [width, depth]);
  const span = Math.max(width, height, depth, 32);
  const target = useMemo(() => [0, height / 2, 0], [height]);

  const renderedBlockCount = useMemo(() => {
    if (!hasStructure) return 0;
    if (maxLayerY >= height - 1) return structure.blocks.length;
    return structure.blocks.filter((b) => b.y <= maxLayerY).length;
  }, [structure, hasStructure, maxLayerY, height]);

  const setView = useCallback(
    (view) => {
      const ctrl = controlsRef.current;
      if (!ctrl) return;
      const dist = span * 1.5;
      if (view === 'iso') {
        ctrl.object.position.set(dist, dist * 0.95, dist);
      } else if (view === 'top') {
        ctrl.object.position.set(0, dist * 2.2, 0.01);
      } else if (view === 'front') {
        ctrl.object.position.set(0, height / 2, dist * 1.8);
      } else if (view === 'side') {
        ctrl.object.position.set(dist * 1.8, height / 2, 0);
      } else if (view === 'reset') {
        ctrl.object.position.set(dist * 1.25, dist * 0.95, dist * 1.25);
      }
      ctrl.target.set(0, height / 2, 0);
      ctrl.update();
    },
    [span, height]
  );

  const themes = {
    studio: {
      bg: '#07080a',
      hemiTop: '#ffffff',
      hemiBottom: '#222633',
      dirLight: '#ffffff',
      dirIntensity: 1.75,
      gridChunk: '#383f52',
      gridSub: '#151720',
      bloomIntensity: 0.7,
    },
    nether: {
      bg: '#090507',
      hemiTop: '#ff6243',
      hemiBottom: '#240a10',
      dirLight: '#ff4422',
      dirIntensity: 2.1,
      gridChunk: '#57232b',
      gridSub: '#1a090d',
      bloomIntensity: 1.3,
    },
    dusk: {
      bg: '#0b0a12',
      hemiTop: '#fbcfe8',
      hemiBottom: '#1f1b2e',
      dirLight: '#f472b6',
      dirIntensity: 1.8,
      gridChunk: '#4a3d5e',
      gridSub: '#1a1624',
      bloomIntensity: 0.9,
    },
  };
  const curTheme = themes[theme] || themes.studio;

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-base">
      {/* 3D WebGL Canvas + EffectComposer PostProcessing */}
      <Canvas
        frameloop="demand"
        dpr={[1, 2]}
        camera={{
          position: [span * 1.35, span * 1.05, span * 1.35],
          fov: 45,
          near: 0.1,
          far: 6000,
        }}
      >
        <color attach="background" args={[curTheme.bg]} />
        <hemisphereLight args={[curTheme.hemiTop, curTheme.hemiBottom, 0.85]} />
        <directionalLight position={[span * 1.3, span * 1.9, span * 0.9]} intensity={curTheme.dirIntensity} />
        <directionalLight position={[-span * 1.1, span * 0.7, -span * 1.1]} intensity={0.45} color="#94b8ff" />

        {/* Yapı Yüklü ise Vokseller, Değilse Holografik CAD Kaidesi */}
        {hasStructure ? (
          groups.map(([id, positions]) => (
            <BlockGroup
              key={id}
              id={id}
              positions={positions}
              offset={offset}
              maxLayerY={maxLayerY}
              wireframe={wireframe}
              onHoverBlock={setHoveredVoxel}
            />
          ))
        ) : (
          <EmptyScaffold />
        )}

        {/* Minecraft Chunk ve Blok Izgarası */}
        {showGrid && (
          <ChunkGrid
            size={Math.max(span * 2.2, 96)}
            colorChunk={curTheme.gridChunk}
            colorSub={curTheme.gridSub}
          />
        )}

        <CameraRig controlsRef={controlsRef} target={target} span={span} />

        {/* Post-Processing Bloom & Sinematik Vignette */}
        {bloomEnabled && (
          <EffectComposer multisampling={0}>
            <Bloom
              luminanceThreshold={0.5}
              luminanceSmoothing={0.3}
              intensity={curTheme.bloomIntensity}
            />
            <Vignette offset={0.32} darkness={0.6} />
          </EffectComposer>
        )}
      </Canvas>

      {/* CAD ÜST KONTROL ŞERİDİ (Top Ribbon Toolbar) */}
      <div className="pointer-events-none absolute inset-x-0 top-3 flex items-center justify-between px-3 z-10">
        {/* Sol Durum Hapı: Metrikler ve Hacim Bilgisi */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-auto flex items-center gap-2 rounded-xl border border-line bg-panel/90 px-3 py-1.5 backdrop-blur-md shadow-2xl text-xs font-mono"
        >
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                hasStructure ? 'bg-emerald-cad shadow-[0_0_8px_#10b981]' : 'bg-amber-cad animate-pulse'
              }`}
            />
            <span className="font-semibold text-ink">
              {hasStructure ? renderedBlockCount.toLocaleString('tr-TR') : '0'}
            </span>
            <span className="text-ink-dim">
              {hasStructure ? `/ ${structure.blocks.length.toLocaleString('tr-TR')} Voksel` : 'Voksel (Hazır)'}
            </span>
          </div>

          <span className="h-3 w-px bg-white/10" />

          <div className="flex items-center gap-1 text-[11px] text-ink-muted">
            <Scan className="h-3 w-3 text-cyan-cad" />
            <span>
              {width}×{height}×{depth} Blok
            </span>
          </div>

          {hasStructure && (
            <>
              <span className="h-3 w-px bg-white/10" />
              <div className="text-[11px] text-ink-dim">
                {(width / 16).toFixed(1)}×{(depth / 16).toFixed(1)} Chunk
              </div>
            </>
          )}

          {maxLayerY < height - 1 && (
            <span className="rounded bg-amber-cad/15 border border-amber-cad/30 px-1.5 py-0.2 font-mono text-[10px] font-semibold text-amber-cad">
              Kesit: Y ≤ {maxLayerY}
            </span>
          )}
        </motion.div>

        {/* Sağ Araç Kutusu: Kamera, Tel Kafes, Katman Kesiti ve Işıklandırma */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-auto flex items-center gap-1 rounded-xl border border-line bg-panel/90 p-1 backdrop-blur-md shadow-2xl"
        >
          {/* Kamera Açıları */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setView('iso')}
              title="3B İzometrik Görünüm"
              className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-hover hover:text-ink transition-colors"
            >
              <Box className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setView('top')}
              title="Üst Plan Görünümü (Kuşbakışı)"
              className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-hover hover:text-ink transition-colors"
            >
              <Layers className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setView('front')}
              title="Ön Görünüş (Elevation)"
              className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-hover hover:text-ink transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setView('side')}
              title="Yan Profil Görünüşü"
              className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-hover hover:text-ink transition-colors"
            >
              <Compass className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setView('reset')}
              title="Kamerayı Merkezle & Sıfırla"
              className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-hover hover:text-ink transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          <span className="mx-1 h-3.5 w-px bg-white/10" />

          {/* Katman Kesit Slicer Tıklayıcısı */}
          <button
            type="button"
            onClick={() => setShowSlicer(!showSlicer)}
            title={t('vp_slicer')}
            className={`cursor-pointer flex h-7 items-center gap-1.5 px-2 rounded-lg text-xs font-mono transition-colors ${
              showSlicer
                ? 'bg-amber-cad/20 text-amber-cad border border-amber-cad/40'
                : 'text-ink-muted hover:bg-surface-hover hover:text-ink'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span className="text-[11px]">{lang === 'tr' ? 'Kesit' : 'Slicer'}</span>
          </button>

          <span className="mx-1 h-3.5 w-px bg-white/10" />

          {/* Bloom Efekti Toggle */}
          <button
            type="button"
            onClick={() => setBloomEnabled(!bloomEnabled)}
            title={t('vp_bloom')}
            className={`cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
              bloomEnabled ? 'text-amber-cad bg-surface-hover' : 'text-ink-dim hover:text-ink'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
          </button>

          {/* Izgara ve Tel Kafes */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setShowGrid(!showGrid)}
              title={t('vp_grid')}
              className={`cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                showGrid ? 'text-cyan-cad bg-surface-hover' : 'text-ink-dim hover:text-ink'
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setWireframe(!wireframe)}
              title={t('vp_wireframe')}
              className={`cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                wireframe ? 'text-amber-cad bg-surface-hover' : 'text-ink-dim hover:text-ink'
              }`}
            >
              <Scan className="h-3.5 w-3.5" />
            </button>
          </div>

          <span className="mx-1 h-3.5 w-px bg-white/10" />

          {/* Atmosfer / Işık Modu Seçici */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setTheme('studio')}
              title={t('vp_theme_cad')}
              className={`cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                theme === 'studio' ? 'text-amber-cad bg-surface-hover' : 'text-ink-dim hover:text-ink'
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTheme('nether')}
              title={t('vp_theme_nether')}
              className={`cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                theme === 'nether' ? 'text-red-cad bg-surface-hover' : 'text-ink-dim hover:text-ink'
              }`}
            >
              <Flame className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTheme('dusk')}
              title={t('vp_theme_dusk')}
              className={`cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                theme === 'dusk' ? 'text-pink-400 bg-surface-hover' : 'text-ink-dim hover:text-ink'
              }`}
            >
              <Sunset className="h-3.5 w-3.5" />
            </button>
          </div>

          <span className="mx-1 h-3.5 w-px bg-white/10" />

          {/* Tam Ekran Toggle */}
          <button
            type="button"
            onClick={onToggleFullscreen}
            title={isFullscreen ? t('vp_fullscreen_exit') : t('vp_fullscreen_enter')}
            className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-hover hover:text-ink transition-colors"
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </motion.div>
      </div>

      {/* KATMAN KESİT HUD DOKU (Açıldığında Üstte Görünen Hassas Slayder) */}
      <AnimatePresence>
        {showSlicer && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="pointer-events-auto absolute top-14 right-3 z-20 flex w-76 flex-col gap-2 rounded-xl border border-line bg-panel/95 p-3.5 backdrop-blur-xl shadow-2xl"
          >
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="font-semibold text-ink flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-amber-cad" />
                {t('slicer_title')}
              </span>
              <span className="text-amber-cad font-semibold">
                Y = {maxLayerY} / {height - 1}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={height - 1}
              value={maxLayerY}
              onChange={(e) => setMaxLayerY(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer accent-amber-cad bg-surface rounded appearance-none"
            />
            <div className="flex items-center justify-between font-mono text-[10px] text-ink-dim">
              <span>{t('slicer_base')}</span>
              <button
                type="button"
                onClick={() => setMaxLayerY(height - 1)}
                className="cursor-pointer text-amber-cad hover:underline font-semibold"
              >
                {t('slicer_reset')}
              </button>
              <span>{t('slicer_peak')} (Y: {height - 1})</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ALT CAD DURUM ÇUBUĞU (Voxel Raycasting Denetimi & Navigasyon İpuçları) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-between px-3 font-mono text-[11px] z-10">
        {/* Sol: Hover Edilen Blok Denetimi (Raycaster Voxel Inspector) */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-auto flex items-center gap-2 rounded-xl border border-line bg-panel/90 px-3.5 py-2 backdrop-blur-md shadow-2xl text-ink"
        >
          {hoveredVoxel ? (
            <div className="flex items-center gap-2">
              <span
                className="h-3.5 w-3.5 rounded border border-white/20 shadow-sm"
                style={{ background: colorFor(hoveredVoxel.id) }}
              />
              <span className="font-semibold text-ink">{hoveredVoxel.id}</span>
              <span className="text-ink-dim">|</span>
              <span className="text-cyan-cad">
                [X: {hoveredVoxel.x}, Y: {hoveredVoxel.y}, Z: {hoveredVoxel.z}]
              </span>
              <span className="text-ink-dim">|</span>
              <span className="text-amber-cad">{t('status_layer')}: Y={hoveredVoxel.y}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-ink-dim">
              <Crosshair className="h-3 w-3 text-amber-cad" />
              <span>
                {hasStructure ? t('status_inspect_hint') : t('status_ready')}
              </span>
            </div>
          )}
        </motion.div>

        {/* Sağ: Navigasyon Yardımcısı */}
        <div className="pointer-events-auto hidden md:flex items-center gap-3 rounded-xl border border-line bg-panel/90 px-3.5 py-2 backdrop-blur-md shadow-2xl text-ink-dim">
          <span>{t('nav_left')}</span>
          <span className="text-white/10">•</span>
          <span>{t('nav_right')}</span>
          <span className="text-white/10">•</span>
          <span>{t('nav_wheel')}</span>
        </div>
      </div>
    </div>
  );
}
