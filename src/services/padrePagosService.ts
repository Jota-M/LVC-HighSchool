// services/padrePagosService.ts
// Todas las llamadas axios al backend para el módulo de pagos del padre

import api from '@/lib/api';
import type {
  HijoPagoInfo,
  MensualidadHijo,
  ResumenMensualidades,
  QRGeneradoData,
  EstadoQRResponse,
  QRMultipleData,
  EstadoQRMultipleResponse,
  QRFamiliarData,
} from '@/types/padrePagosTypes';


// Generar QR para múltiples mensualidades
export const generarQRMultiple = async (
  mensualidadIds: number[],
  estudianteId:   number
): Promise<QRMultipleData> => {
  const res = await api.post('/padre-p/mensualidades/generar-qr-multiple', {
    mensualidad_ids: mensualidadIds,
    estudiante_id:   estudianteId,
  });
  return res.data.data;
};
 
// Verificar estado de un QR múltiple por alias
export const getEstadoQRMultiple = async (
  alias: string
): Promise<EstadoQRMultipleResponse> => {
  const res = await api.get(`/padre-p/mensualidades/estado-qr-multiple`, {
    params: { alias },
  });
  return res.data;
};
// =============================================
// 1. OBTENER HIJOS CON RESUMEN DE PAGOS
// GET /api/padre/hijos
// =============================================
export const getHijosConPagos = async (): Promise<{
  hijos: HijoPagoInfo[];
  total: number;
}> => {
  const res = await api.get('/padre-p/hijos');
  return res.data.data;
};

// =============================================
// 2. OBTENER MENSUALIDADES DE UN HIJO
// GET /api/padre/hijos/:estudiante_id/mensualidades
// =============================================
export const getMensualidadesHijo = async (
  estudianteId: number
): Promise<{
  mensualidades: MensualidadHijo[];
  resumen:       ResumenMensualidades;
}> => {
  const res = await api.get(`/padre-p/hijos/${estudianteId}/mensualidades`);
  return res.data.data;
};

// =============================================
// 3. GENERAR QR PARA UNA MENSUALIDAD
// POST /api/padre/mensualidad/:mensualidad_id/generar-qr
// =============================================
export const generarQRMensualidad = async (
  mensualidadId: number
): Promise<QRGeneradoData> => {
  const res = await api.post(`/padre-p/mensualidad/${mensualidadId}/generar-qr`);
  // El backend devuelve { success, message, data: { imagenQr, alias, ... } }
  // o { success, qr_existente: true, data: { ... } } si ya había un QR activo
  return res.data.data;
};

// =============================================
// 4. VERIFICAR ESTADO DEL QR (POLLING)
// GET /api/padre/mensualidad/:mensualidad_id/estado-qr
// =============================================
export const getEstadoQR = async (
  mensualidadId: number
): Promise<EstadoQRResponse> => {
  const res = await api.get(`/padre-p/mensualidad/${mensualidadId}/estado-qr`);
  return res.data;
};

// =============================================
// 5. CANCELAR QR ACTIVO
// DELETE /api/padre/mensualidad/:mensualidad_id/cancelar-qr
// =============================================
export const cancelarQRMensualidad = async (
  mensualidadId: number
): Promise<void> => {
  await api.delete(`/padre-p/mensualidad/${mensualidadId}/cancelar-qr`);
};
// =============================================
// 6. GENERAR QR PARA MENSUALIDADES DE UN HIJO (FAMILIAR)
// POST /api/padre/mensualidades/generar-qr-familiar
// =============================================
export const generarQRFamiliar = async (
  mensualidadIds: number[]
): Promise<QRFamiliarData> => {
  const res = await api.post('/padre-p/mensualidades/generar-qr-familiar', {
    mensualidad_ids: mensualidadIds,
  });
  return res.data.data;
};