// types/dimensionEvaluacion.ts

export interface DimensionEvaluacion {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  porcentaje_ponderacion: number; // 0-100
  color?: string;
  orden: number;
  activo: boolean;
  created_at?: string;
}

export interface DimensionEvaluacionFormData {
  nombre: string;
  codigo: string;
  descripcion?: string;
  porcentaje_ponderacion: number;
  color?: string;
  orden: number;
  activo?: boolean;
}

// Validación: la suma de porcentajes de dimensiones activas debe ser 100
export function validarSumaPorcentajes(
  dimensiones: DimensionEvaluacion[],
  editandoId: number | null,
  nuevoPorcentaje: number
): number {
  return dimensiones
    .filter(d => d.activo && d.id !== editandoId)
    .reduce((sum, d) => sum + Number(d.porcentaje_ponderacion), 0) + nuevoPorcentaje;
}