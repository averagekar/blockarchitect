// BlockArchitect 3D Wavefront OBJ Exporter
// Blender, Cinema4D, Maya ve 3D Yazıcılar için Voksel Geometri Dönüştürücüsü.
import { cleanId } from './blockColors.js';

export function exportStructureToOBJ(structure) {
  if (!structure || !structure.blocks || structure.blocks.length === 0) {
    throw new Error('Dışa aktarılacak voksel bulunamadı.');
  }

  const { blocks, palette, structure_name } = structure;
  const name = structure_name || 'structure';

  // Blokları ID'ye göre grupla (Blender'da her blok ayrı material/object olur)
  const grouped = new Map();
  for (const b of blocks) {
    const raw = palette[b.state];
    if (!raw) continue;
    const id = cleanId(raw);
    if (!grouped.has(id)) grouped.set(id, []);
    grouped.get(id).push(b);
  }

  const lines = [
    `# =======================================================`,
    `# BlockArchitect CAD Studio - Wavefront 3D OBJ Export`,
    `# Model: ${name}`,
    `# Total Voxels: ${blocks.length}`,
    `# Generated: ${new Date().toISOString()}`,
    `# Ready for Blender Cycles/Eevee, Cinema4D, 3D Printing`,
    `# =======================================================`,
    `mtllib ${name}.mtl`,
    ``,
  ];

  let vertexOffset = 1;

  for (const [id, list] of grouped.entries()) {
    const safeId = id.replace(/[^a-z0-9_]/gi, '_');
    lines.push(`g ${safeId}`);
    lines.push(`usemtl ${safeId}`);

    for (const b of list) {
      const x = b.x;
      const y = b.y;
      const z = b.z;

      // 8 Köşe Noktası (Vertices)
      lines.push(`v ${x} ${y} ${z}`);
      lines.push(`v ${x + 1} ${y} ${z}`);
      lines.push(`v ${x + 1} ${y + 1} ${z}`);
      lines.push(`v ${x} ${y + 1} ${z}`);
      lines.push(`v ${x} ${y} ${z + 1}`);
      lines.push(`v ${x + 1} ${y} ${z + 1}`);
      lines.push(`v ${x + 1} ${y + 1} ${z + 1}`);
      lines.push(`v ${x} ${y + 1} ${z + 1}`);

      // 6 Yüzey (Quad Faces - CCW winding)
      const vo = vertexOffset;
      // Front (Z+)
      lines.push(`f ${vo + 4} ${vo + 5} ${vo + 6} ${vo + 7}`);
      // Back (Z-)
      lines.push(`f ${vo + 1} ${vo + 0} ${vo + 3} ${vo + 2}`);
      // Top (Y+)
      lines.push(`f ${vo + 3} ${vo + 2} ${vo + 6} ${vo + 7}`);
      // Bottom (Y-)
      lines.push(`f ${vo + 0} ${vo + 1} ${vo + 5} ${vo + 4}`);
      // Right (X+)
      lines.push(`f ${vo + 1} ${vo + 2} ${vo + 6} ${vo + 5}`);
      // Left (X-)
      lines.push(`f ${vo + 0} ${vo + 4} ${vo + 7} ${vo + 3}`);

      vertexOffset += 8;
    }
    lines.push(``);
  }

  const objContent = lines.join('\n');
  const blob = new Blob([objContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeFileName = name.replace(/[^a-z0-9_-]+/gi, '_');
  a.download = `${safeFileName}.obj`;
  a.click();
  URL.revokeObjectURL(url);
}
