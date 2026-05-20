// types/seguimientoPadreTypes.ts
// Extiende seguimientoPedagogicoTypes con lo específico del padre

export interface ObservacionHijo {
  id: number;
  codigo_observacion: string;
  fecha_ocurrencia: string;
  nivel_relevancia: 'informativo' | 'requiere_atencion' | 'urgente';
  descripcion: string;
  fecha_publicacion: string;
  categoria_nombre: string;
  categoria_color: string;
  categoria_icono: string;
  materia_nombre?: string | null;
  docente_nombre: string;
  fecha_lectura?: string | null;
  comentario_padre?: string | null;
  ya_leido: boolean;
}

export interface ResumenHijo {
  estudiante_id: number;
  estudiante_nombres: string;
  estudiante_apellidos: string;
  estudiante_codigo: string;
  total_observaciones: number;
  informativos: number;
  requieren_atencion: number;
  urgentes: number;
  no_leidos: number;
  ultima_observacion?: string | null;
}

export interface ObservacionesHijoResponse {
  success: boolean;
  data: {
    observaciones: ObservacionHijo[];
    total: number;
    no_leidas: number;
  };
}

export interface ResumenPadreResponse {
  success: boolean;
  data: {
    resumen: ResumenHijo[];
  };
}