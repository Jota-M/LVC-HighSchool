// utils/cursoUtils.ts

/**
 * Extrae el peso del nivel y el número del grado/curso para ordenamiento académico natural
 * (Ej: 1ro, 2do, 3ro... de Secundaria / Primaria)
 */
export function parseCursoOrder(gradoNombre?: string, nivelNombre?: string): { nivel: number; grado: number } {
  const g = (gradoNombre || '').toLowerCase();
  const n = (nivelNombre || '').toLowerCase();

  // 1. Determinar nivel educativo
  let nivel = 2; // Primaria por defecto
  if (n.includes('inicial') || g.includes('inicial') || g.includes('kinder') || g.includes('nido')) {
    nivel = 1;
  } else if (n.includes('secundaria') || g.includes('secundaria')) {
    nivel = 3;
  } else if (n.includes('primaria') || g.includes('primaria')) {
    nivel = 2;
  }

  // 2. Extraer número del curso (1ro, 2do, 3ro, etc.)
  let grado = 99;
  const numMatch = g.match(/\b(\d+)/);
  if (numMatch) {
    grado = parseInt(numMatch[1], 10);
  } else if (g.includes('primer')) {
    grado = 1;
  } else if (g.includes('segund')) {
    grado = 2;
  } else if (g.includes('tercer')) {
    grado = 3;
  } else if (g.includes('cuart')) {
    grado = 4;
  } else if (g.includes('quint')) {
    grado = 5;
  } else if (g.includes('sext')) {
    grado = 6;
  } else if (g.includes('pre-kinder') || g.includes('prekinder')) {
    grado = 1;
  } else if (g.includes('kinder')) {
    grado = 2;
  }

  return { nivel, grado };
}

/**
 * Ordena asignaciones o materias por Nivel -> Grado (1ro, 2do, 3ro...) -> Paralelo (A, B, C...) -> Materia
 */
export function sortCursos<T extends { grado_nombre?: string; nivel_nombre?: string; paralelo_nombre?: string; materia_nombre?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const orderA = parseCursoOrder(a.grado_nombre, a.nivel_nombre);
    const orderB = parseCursoOrder(b.grado_nombre, b.nivel_nombre);

    if (orderA.nivel !== orderB.nivel) {
      return orderA.nivel - orderB.nivel;
    }
    if (orderA.grado !== orderB.grado) {
      return orderA.grado - orderB.grado;
    }

    const parA = (a.paralelo_nombre || '').trim();
    const parB = (b.paralelo_nombre || '').trim();
    const parComp = parA.localeCompare(parB, undefined, { numeric: true, sensitivity: 'base' });
    if (parComp !== 0) return parComp;

    const matA = (a.materia_nombre || '').trim();
    const matB = (b.materia_nombre || '').trim();
    return matA.localeCompare(matB, undefined, { sensitivity: 'base' });
  });
}

/**
 * Ordena lista de nombres de grados para selectores y filtros (ej. 1ro de Primaria, 2do de Primaria...)
 */
export function sortGrados(grados: string[]): string[] {
  return [...grados].sort((a, b) => {
    const orderA = parseCursoOrder(a);
    const orderB = parseCursoOrder(b);
    if (orderA.nivel !== orderB.nivel) return orderA.nivel - orderB.nivel;
    if (orderA.grado !== orderB.grado) return orderA.grado - orderB.grado;
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });
}
