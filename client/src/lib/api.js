// Backend ile konusan ince katman.
async function readError(res) {
  try {
    return (await res.json()).error || `Sunucu hatasi (${res.status})`;
  } catch {
    return `Sunucu hatasi (${res.status})`;
  }
}

export async function generateStructure(prompt, provider = 'auto') {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, provider }),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

// Yapiyi sunucuya gonderir, binary .schem alir ve tarayiciya indirtir.
export async function downloadSchem(structure) {
  const res = await fetch('/api/schem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(structure),
  });
  if (!res.ok) throw new Error(await readError(res));
  const blob = await res.blob();
  const name = (structure.structure_name || 'structure').replace(/[^a-z0-9_-]+/gi, '_');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.schem`;
  a.click();
  URL.revokeObjectURL(url);
}

// 1.8.9 Klasik MCEdit / WorldEdit 6 .schematic dosyasi alir ve indirir.
export async function downloadLegacySchem(structure) {
  const res = await fetch('/api/schematic-legacy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(structure),
  });
  if (!res.ok) throw new Error(await readError(res));
  const blob = await res.blob();
  const name = (structure.structure_name || 'structure_1_8').replace(/[^a-z0-9_-]+/gi, '_');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}_1.8.9.schematic`;
  a.click();
  URL.revokeObjectURL(url);
}

// Hazir master mimari sablonunu (0ms) yukler
export async function fetchPreset(id) {
  const res = await fetch(`/api/presets/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

