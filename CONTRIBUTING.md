# 🤝 Contributing to BlockArchitect

Thank you for your interest in contributing to **BlockArchitect**! We welcome contributions from developers, architects, 3D artists, and Minecraft server administrators.

---

## 🧭 Code of Conduct

By participating in this project, you agree to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please treat all contributors with respect and kindness.

---

## 🛠️ Development Setup

### 1. Prerequisites
- **Node.js** `>= 20.6.0` (LTS recommended)
- **npm** `>= 9.0.0`
- Git

### 2. Fork and Clone
```bash
git clone https://github.com/<your-username>/blockarchitect.git
cd blockarchitect
```

### 3. Install All Dependencies
```bash
npm run install:all
```

### 4. Setup Environment Variables
```bash
cp server/.env.example server/.env
```
Provide either a DeepSeek API Key (`DEEPSEEK_API_KEY`) or Gemini API Key (`GEMINI_API_KEY`).

### 5. Start the Development Studio
```bash
npm run dev
```
- Web CAD Studio: `http://localhost:5173`
- Backend API: `http://localhost:8787`

---

## 🌿 Branching Strategy & Git Workflow

1. Create a dedicated topic branch from `main`:
   ```bash
   git checkout -b feat/texture-atlas-shader
   # or
   git checkout -b fix/schem-palette-alignment
   ```
2. Commit with conventional commit messages:
   - `feat:` New features or UI components
   - `fix:` Bug fixes or schema corrections
   - `perf:` Performance optimizations (draw calls, memory)
   - `docs:` Documentation improvements
   - `refactor:` Code refactoring without behavioral change
   - `ci:` GitHub Actions workflow changes
3. Ensure the client builds cleanly before pushing:
   ```bash
   npm run build
   ```
4. Push your branch and open a Pull Request against `main`.

---

## 🏗️ Architecture Overview

- **`client/` (Frontend):**
  - **React 18 + Vite + Tailwind CSS**
  - **Three.js (`@react-three/fiber` & `@react-three/drei`):** High-density `InstancedMesh` rendering grouped by block type to minimize draw calls.
  - **`@react-three/postprocessing`:** Selective Bloom and emissive shaders for light-emitting blocks (magma, lava, crying obsidian, shroomlight).
  - **Framer Motion:** Tactile CAD drawer physics, gliding layout tabs.
  - **Sonner:** Toast notifications for system status and clipboard interactions.

- **`server/` (Backend):**
  - **Express 4 + Helmet + Rate Limit**
  - **`src/ai.js`:** Multi-provider engine (DeepSeek-V3 primary + Gemini fallback) with automated failover and JSON object mode.
  - **`src/builder.js`:** Voxel rasterizer converting high-level geometric primitives (Catmull-Rom splines, ellipsoids, cones, extruded 3D typography, barycentric membranes, Simplex noise) into discrete 3D voxel arrays.
  - **`src/validate.js`:** Auto-healing validation loops repairing floating voxels and bounding box compliance.
  - **`src/schem.js`:** Sponge Schematic v2 binary encoder writing standard NBT compounds with gzip compression compatible with WorldEdit & FAWE.

---

## 🧪 Testing Your Changes

- **Client Production Build:** Run `npm run build` inside `client/` to verify Vite bundle compilation and tree-shaking.
- **Server Module Validation:** Ensure server modules import and execute without syntax errors.
- **Schematic Verification:** Test generated `.schem` files inside a local Minecraft server or via NBT viewers like NBTExplorer or Axiom.

---

## 💬 Getting Help

If you run into issues or have questions, feel free to open a [GitHub Discussion](https://github.com/averagekar/blockarchitect/discussions) or submit an [Issue](https://github.com/averagekar/blockarchitect/issues).
