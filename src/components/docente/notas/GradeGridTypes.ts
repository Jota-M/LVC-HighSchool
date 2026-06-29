// components/docente/notas/GradeGridTypes.ts
// Tipo compartido entre GradeGrid.tsx y [id]/page.tsx
import { Evaluacion } from '@/types/notasTypes';

export interface EvaluacionConProgreso extends Evaluacion {
  con_nota:      number;
  total_alumnos: number;
  ausentes:      number;
}