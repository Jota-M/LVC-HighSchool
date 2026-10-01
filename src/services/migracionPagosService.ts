// services/migracionPagosService.ts
import api from '../lib/api';

export interface PagoHistoricoItem {
  id: number;
  codigo_pago: string;
  mensualidad_id: number;
  monto_pagado: number;
  metodo_pago: 'efectivo' | 'qr' | 'transferencia' | 'tarjeta';
  numero_comprobante: string | null;
  entrego_factura: boolean;
  numero_factura: string | null;
  fecha_pago: string;
  observaciones: string | null;
  registrado_por_nombre?: string;
}

export interface CuotaMatrizItem {
  numero_cuota: number;
  mes: string;
  mensualidad_id: number | null;
  monto_original: number;
  monto_beca: number;
  monto_recargo: number;
  monto_final: number;
  estado: 'pagado' | 'pendiente' | 'cancelado' | 'pagado_parcial' | 'vencido' | 'anulado' | 'no_generado';
  observaciones: string | null;
  fecha_vencimiento: string | null;
  pagos: PagoHistoricoItem[];
}

export interface EstudianteMatrizItem {
  estudiante_id: number;
  ci: string;
  codigo_estudiante: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  nombre_completo: string;
  matricula_id: number;
  estado_matricula: string;
  es_becado: boolean;
  porcentaje_beca: number | string | null;
  tipo_beca: string | null;
  monto_base_cuota?: number;
  cuotas: CuotaMatrizItem[];
}

export interface CursoInfoMatriz {
  paralelo_id: number;
  paralelo_nombre: string;
  grado_id: number;
  grado_nombre: string;
  nivel_id: number;
  nivel_nombre: string;
  periodo_academico_id: number;
  periodo_nombre: string;
  monto_base_cuota: number;
}

/**
 * Retorna la fecha por defecto para una cuota histórica: día 10 del mes correspondiente (Ej: 10/02/2026, 10/03/2026)
 * Cuota 1 = Febrero (mes 02), Cuota 2 = Marzo (mes 03), ..., Cuota 10 = Noviembre (mes 11)
 */
export const obtenerFechaDefectoCuota = (numeroCuota: number, anio?: number | string): string => {
  const anioFinal = anio ? Number(anio) : new Date().getFullYear();
  const mes = numeroCuota + 1; // 1->Feb, 2->Mar, ..., 10->Nov
  const mesStr = String(mes).padStart(2, '0');
  return `${anioFinal}-${mesStr}-10`;
};

export interface MatrizCursoResponse {
  success: boolean;
  data: {
    curso: CursoInfoMatriz;
    total_estudiantes: number;
    estudiantes: EstudianteMatrizItem[];
  };
}

export interface RegistrarPagoHistoricoPayload {
  matricula_id: number;
  numero_cuota: number;
  monto_pagado?: number;
  metodo_pago: 'efectivo' | 'qr' | 'transferencia' | 'tarjeta';
  tipo_documento: 'recibo' | 'factura' | 'ambos' | 'sin_documento';
  numero_comprobante?: string | null;
  numero_factura?: string | null;
  entrego_factura?: boolean;
  fecha_pago?: string;
  observaciones?: string;
}

export interface ActualizarPagoHistoricoPayload {
  monto_pagado?: number;
  metodo_pago?: 'efectivo' | 'qr' | 'transferencia' | 'tarjeta';
  tipo_documento?: 'recibo' | 'factura' | 'ambos' | 'sin_documento';
  numero_comprobante?: string | null;
  numero_factura?: string | null;
  entrego_factura?: boolean;
  fecha_pago?: string;
  observaciones?: string;
}

export interface ConfigurarBecaPayload {
  matricula_id: number;
  es_becado: boolean;
  porcentaje_beca?: number;
  tipo_beca?: string;
  cuotas_exoneradas: number[]; // e.g. [1, 2, 3, ... 10]
}

export interface RegistrarLotePayload {
  matricula_id: number;
  cuotas: {
    numero_cuota: number;
    monto?: number;
    metodo_pago: 'efectivo' | 'qr' | 'transferencia' | 'tarjeta';
    tipo_documento: 'recibo' | 'factura' | 'ambos' | 'sin_documento';
    numero_factura?: string | null;
    numero_comprobante?: string | null;
    fecha_pago?: string;
    observaciones?: string;
  }[];
}

export const migracionPagosService = {
  // Obtener matriz del curso completo
  getMatrizCurso: async (paraleloId: number, periodoId?: number): Promise<MatrizCursoResponse> => {
    const params = periodoId ? { periodo_academico_id: periodoId } : {};
    const res = await api.get(`/api/migracion-mensualidades/matriz-curso/${paraleloId}`, { params });
    return res.data;
  },

  // Obtener historial de estudiante individual
  getEstudianteHistorial: async (estudianteId: number, periodoId?: number) => {
    const params = periodoId ? { periodo_academico_id: periodoId } : {};
    const res = await api.get(`/api/migracion-mensualidades/estudiante/${estudianteId}`, { params });
    return res.data;
  },

  // Registrar pago histórico de una cuota
  registrarPagoHistorico: async (data: RegistrarPagoHistoricoPayload) => {
    const res = await api.post('/api/migracion-mensualidades/registrar-pago', data);
    return res.data;
  },

  // Actualizar un pago histórico existente
  actualizarPagoHistorico: async (pagoId: number, data: ActualizarPagoHistoricoPayload) => {
    const res = await api.put(`/api/migracion-mensualidades/pago/${pagoId}`, data);
    return res.data;
  },

  // Eliminar un pago histórico
  eliminarPagoHistorico: async (pagoId: number) => {
    const res = await api.delete(`/api/migracion-mensualidades/pago/${pagoId}`);
    return res.data;
  },

  // Configurar beca y exonerar cuotas
  configurarBeca: async (data: ConfigurarBecaPayload) => {
    const res = await api.post('/api/migracion-mensualidades/configurar-beca', data);
    return res.data;
  },

  // Generar cuotas pendientes faltantes para todo el curso
  generarCuotasPendientesCurso: async (paraleloId: number, periodoId?: number) => {
    const res = await api.post('/api/migracion-mensualidades/generar-pendientes-curso', {
      paralelo_id: paraleloId,
      periodo_academico_id: periodoId
    });
    return res.data;
  },

  // Registrar lote de cuotas
  registrarLoteEstudiante: async (data: RegistrarLotePayload) => {
    const res = await api.post('/api/migracion-mensualidades/registrar-lote', data);
    return res.data;
  },

  // Importar JSON directo para un estudiante
  importarJsonEstudiante: async (matriculaId: number, jsonData: any) => {
    const res = await api.post('/api/migracion-mensualidades/importar-json-estudiante', {
      matricula_id: matriculaId,
      json_data: jsonData
    });
    return res.data;
  },

  // Importar JSON para un curso completo
  importarJsonCurso: async (paraleloId: number, jsonData: any, periodoId?: number) => {
    const res = await api.post('/api/migracion-mensualidades/importar-json-curso', {
      paralelo_id: paraleloId,
      periodo_academico_id: periodoId,
      json_data: jsonData
    });
    return res.data;
  },

  // Obtener mensualidades observadas o pendientes
  getMensualidadesObservadas: async (filtros: FiltrosObservadas = {}): Promise<{
    success: boolean;
    data: {
      items: MensualidadObservadaItem[];
      metricas: MetricasObservadas;
    };
  }> => {
    const res = await api.get('/api/migracion-mensualidades/observadas-pendientes', { params: filtros });
    return res.data;
  }
};

export interface MensualidadObservadaItem {
  mensualidad_id: number;
  numero_cuota: number;
  mes_correspondiente: string;
  fecha_vencimiento: string | null;
  monto_original: number;
  monto_beca: number;
  monto_recargo: number;
  monto_final: number;
  mensualidad_estado: string;
  mensualidad_observaciones: string | null;
  matricula_id: number;
  periodo_academico_id: number;
  es_becado: boolean;
  porcentaje_beca: number | null;
  estudiante_id: number;
  estudiante_codigo: string;
  estudiante_ci: string;
  estudiante_nombres: string;
  estudiante_apellido_paterno: string;
  estudiante_apellido_materno: string;
  estudiante_apellidos: string;
  estudiante_nombre_completo: string;
  paralelo_id: number;
  paralelo_nombre: string;
  grado_id: number;
  grado_nombre: string;
  nivel_id: number;
  nivel_nombre: string;
  pago_id: number | null;
  codigo_pago: string | null;
  monto_pagado: number | null;
  metodo_pago: string | null;
  numero_comprobante: string | null;
  entrego_factura: boolean | null;
  numero_factura: string | null;
  fecha_pago: string | null;
  pago_observaciones: string | null;
  pago_anulado: boolean | null;
  tipo_observacion: 'cuota_pendiente' | 'pago_parcial' | 'sin_documento' | 'comprobante_por_confirmar' | 'observacion_general';
}

export interface MetricasObservadas {
  total: number;
  pendientes: number;
  parciales: number;
  sin_documento: number;
  monto_total_observado: number;
  monto_pagado_observado: number;
}

export interface FiltrosObservadas {
  periodo_academico_id?: number;
  nivel_id?: number;
  grado_id?: number;
  paralelo_id?: number;
  tipo?: 'todos' | 'sin_documento' | 'pendientes' | 'parciales' | 'con_observacion';
  search?: string;
}

export default migracionPagosService;

