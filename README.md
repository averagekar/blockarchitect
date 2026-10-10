# BlockArchitect AI

Metinden Minecraft yapısı üretir (Gemini 2.5 Flash), tarayıcıda 3B önizler, WorldEdit `.schem` olarak indirir.

```
blockarchitect/
├── package.json              # kök betikler (iki servisi birlikte çalıştırır)
├── server/                   # Node.js + Express
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js          # API: /api/generate, /api/schem
│       ├── ai.js             # Gemini çağrısı (temperature 0.2, JSON zorlama, retry)
│       ├── prompt.js         # ADIM 1: System Instruction
│       ├── validate.js       # Zod doğrulama + fills açma + sınır kontrolü
│       └── schem.js          # ADIM 2: Sponge Schematic v2 (NBT + gzip)
└── client/                   # React + Vite + Tailwind v4 + R3F
    ├── package.json
    ├── vite.config.js        # /api -> :8787 proxy
    └── src/
        ├── App.jsx           # ADIM 4: arayüz
        ├── components/VoxelViewer.jsx   # ADIM 3: InstancedMesh motoru
        └── lib/ (api.js, blockColors.js)
```

## Kurulum
```bash
npm run install:all
cp server/.env.example server/.env   # GEMINI_API_KEY değerini yaz
npm run dev                          # http://localhost:5173
```
Node.js >= 20.6 gerekir.
