// services/padreTransportePagosService.ts
// Todas las llamadas axios al backend para el módulo de pagos de transporte del padre

import api from '@/lib/api';
import type {
    HijoTransporteInfo,
    CuotaTransporteHijo,
    ResumenCuotasTransporte,
    QRTransporteGeneradoData,
    EstadoQRTransporteResponse,
    QRFamiliarTransporteData,
    EstadoQRMultipleTransporteResponse,
} from '@/types/padreTransportePagosTypes';

// =============================================
// 1. OBTENER HIJOS CON TRANSPORTE ASIGNADO
// GET /padre-p/transporte/hijos
// =============================================
export const getHijosConTransporte = async (): Promise<{
    hijos: HijoTransporteInfo[];
    total: number;
}> => {
    const res = await api.get('/padre-p/transporte/hijos');
    return res.data.data;
};

// =============================================
// 2. OBTENER CUOTAS DE TRANSPORTE DE UN HIJO
// GET /padre-p/transporte/hijos/:estudiante_id/cuotas
// =============================================
export const getCuotasTransporteHijo = async (
    estudianteId: number
): Promise<{
    cuotas: CuotaTransporteHijo[];
    resumen: ResumenCuotasTransporte;
}> => {
    const res = await api.get(`/padre-p/transporte/hijos/${estudianteId}/cuotas`);
    return res.data.data;
};

// =============================================
// 3. GENERAR QR PARA UNA CUOTA (individual)
// POST /padre-p/transporte/:pago_id/generar-qr
// =============================================
export const generarQRTransporte = async (
    pagoId: number
): Promise<QRTransporteGeneradoData> => {
    const res = await api.post(`/padre-p/transporte/${pagoId}/generar-qr`);
    // El backend devuelve { success, message, data: { imagenQr, alias, ... } }
    // o { success, qr_existente: true, data: { ... } } si ya había un QR activo
    return res.data.data;
};

// =============================================
// 4. VERIFICAR ESTADO DEL QR (POLLING, individual)
// GET /padre-p/transporte/:pago_id/estado-qr
// =============================================
export const getEstadoQRTransporte = async (
    pagoId: number
): Promise<EstadoQRTransporteResponse> => {
    const res = await api.get(`/padre-p/transporte/${pagoId}/estado-qr`);
    return res.data;
};

// =============================================
// 5. CANCELAR QR ACTIVO (individual)
// DELETE /padre-p/transporte/:pago_id/cancelar-qr
// =============================================
export const cancelarQRTransporte = async (
    pagoId: number
): Promise<void> => {
    await api.delete(`/padre-p/transporte/${pagoId}/cancelar-qr`);
};

// =============================================
// 6. GENERAR QR FAMILIAR (varios hijos / varias cuotas)
// POST /padre-p/transporte/cuotas/generar-qr-familiar
// =============================================
export const generarQRFamiliarTransporte = async (
    pagoIds: number[]
): Promise<QRFamiliarTransporteData> => {
    const res = await api.post('/padre-p/transporte/cuotas/generar-qr-familiar', {
        pago_ids: pagoIds,
    });
    return res.data.data;
};

// =============================================
// 7. VERIFICAR ESTADO DE QR FAMILIAR (por alias)
// GET /padre-p/transporte/cuotas/estado-qr-multiple
// =============================================
export const getEstadoQRMultipleTransporte = async (
    alias: string
): Promise<EstadoQRMultipleTransporteResponse> => {
    const res = await api.get('/padre-p/transporte/cuotas/estado-qr-multiple', {
        params: { alias },
    });
    return res.data;
};