// services/egresos.ts - SERVICIO DE EGRESOS
import api from '../lib/api';
import type {
    TipoEgreso,
    Egreso,
    CrearTipoEgresoRequest,
    ActualizarTipoEgresoRequest,
    CrearEgresoRequest,
    AnularEgresoRequest,
    TiposEgresoResponse,
    TipoEgresoResponse,
    EgresosResponse,
    EgresoResponse,
    ResumenCategoriasEgresoResponse,
    ResumenMetodosPagoEgresoResponse,
    EgresosDiariosResponse,
    EstadisticasEgresoResponse,
    FiltrosTipoEgreso,
    FiltrosEgreso,
    FiltrosResumenEgreso,
    MetodoPago,
    EstadoEgreso,
    CategoriaEgreso,
} from '../types/egresos';

class EgresosService {
    // ============== GESTIÓN DE TIPOS DE EGRESO ==============

    async listarTipos(filtros?: FiltrosTipoEgreso): Promise<TiposEgresoResponse> {
        const { data } = await api.get<TiposEgresoResponse>('/api/egreso/tipos', { params: filtros });
        return data;
    }

    async obtenerTipoPorId(id: number): Promise<TipoEgresoResponse> {
        const { data } = await api.get<TipoEgresoResponse>(`/api/egreso/tipos/${id}`);
        return data;
    }

    async crearTipo(request: CrearTipoEgresoRequest): Promise<TipoEgresoResponse> {
        const { data } = await api.post<TipoEgresoResponse>('/api/egreso/tipos', request);
        return data;
    }

    async actualizarTipo(id: number, request: ActualizarTipoEgresoRequest): Promise<TipoEgresoResponse> {
        const { data } = await api.put<TipoEgresoResponse>(`/api/egreso/tipos/${id}`, request);
        return data;
    }

    // ============== GESTIÓN DE EGRESOS ==============

    async listarEgresos(filtros?: FiltrosEgreso): Promise<EgresosResponse> {
        const { data } = await api.get<EgresosResponse>('/api/egreso', { params: filtros });
        return data;
    }

    async obtenerEgresoPorId(id: number): Promise<EgresoResponse> {
        const { data } = await api.get<EgresoResponse>(`/api/egreso/${id}`);
        return data;
    }

    async obtenerEgresoPorCodigo(codigo: string): Promise<EgresoResponse> {
        const { data } = await api.get<EgresoResponse>(`/api/egreso/codigo/${codigo}`);
        return data;
    }

    async crearEgreso(request: CrearEgresoRequest, comprobante?: File): Promise<EgresoResponse> {
        const formData = new FormData();

        Object.entries(request).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value.toString());
            }
        });

        if (comprobante) {
            formData.append('comprobante', comprobante);
        }

        const { data } = await api.post<EgresoResponse>('/api/egreso', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return data;
    }

    async verificarEgreso(id: number): Promise<EgresoResponse> {
        const { data } = await api.patch<EgresoResponse>(`/api/egreso/${id}/verificar`);
        return data;
    }

    async anularEgreso(id: number, request: AnularEgresoRequest): Promise<EgresoResponse> {
        const { data } = await api.patch<EgresoResponse>(`/api/egreso/${id}/anular`, request);
        return data;
    }

    // ============== REPORTES Y ESTADÍSTICAS ==============

    async obtenerResumenPorCategoria(filtros?: FiltrosResumenEgreso): Promise<ResumenCategoriasEgresoResponse> {
        const { data } = await api.get<ResumenCategoriasEgresoResponse>('/api/egreso/resumen/categoria', {
            params: filtros
        });
        return data;
    }

    async obtenerResumenPorMetodoPago(filtros?: FiltrosResumenEgreso): Promise<ResumenMetodosPagoEgresoResponse> {
        const { data } = await api.get<ResumenMetodosPagoEgresoResponse>('/api/egreso/resumen/metodo-pago', {
            params: filtros
        });
        return data;
    }

    async obtenerEgresosDiarios(filtros?: FiltrosResumenEgreso): Promise<EgresosDiariosResponse> {
        const { data } = await api.get<EgresosDiariosResponse>('/api/egreso/resumen/diario', {
            params: filtros
        });
        return data;
    }

    async obtenerEstadisticas(filtros?: FiltrosResumenEgreso): Promise<EstadisticasEgresoResponse> {
        const { data } = await api.get<EstadisticasEgresoResponse>('/api/egreso/estadisticas', {
            params: filtros
        });
        return data;
    }

    // ============== UTILIDADES ==============

    formatearMonto(monto: number): string {
        return new Intl.NumberFormat('es-BO', {
            style: 'currency',
            currency: 'BOB',
            minimumFractionDigits: 2
        }).format(monto);
    }

    getMetodoPagoLabel(metodo: MetodoPago): string {
        const labels: Record<MetodoPago, string> = {
            efectivo: 'Efectivo',
            transferencia: 'Transferencia Bancaria',
            qr: 'QR',
            tarjeta: 'Tarjeta'
        };
        return labels[metodo];
    }

    getEstadoEgresoLabel(estado: EstadoEgreso): string {
        const labels: Record<EstadoEgreso, string> = {
            registrado: 'Registrado',
            verificado: 'Verificado',
            anulado: 'Anulado'
        };
        return labels[estado];
    }

    getEstadoEgresoColor(estado: EstadoEgreso): string {
        const colors: Record<EstadoEgreso, string> = {
            registrado: 'text-yellow-600 bg-yellow-50',
            verificado: 'text-green-600 bg-green-50',
            anulado: 'text-red-600 bg-red-50'
        };
        return colors[estado];
    }

    getCategoriaEgresoLabel(categoria?: CategoriaEgreso): string {
        const labels: Record<CategoriaEgreso, string> = {
            personal: 'Personal (planillas)',
            operativo: 'Operativo',
            administrativo: 'Administrativo',
            otro: 'Otro'
        };
        return labels[categoria ?? 'otro'];
    }

    getCategoriaColor(categoria?: CategoriaEgreso): string {
        const colors: Record<CategoriaEgreso, string> = {
            personal: '#ef4444',
            operativo: '#f97316',
            administrativo: '#8b5cf6',
            otro: '#6b7280'
        };
        return colors[categoria ?? 'otro'];
    }

    getCategoriaIcon(categoria?: CategoriaEgreso): string {
        const icons: Record<CategoriaEgreso, string> = {
            personal: '🧑‍🏫',
            operativo: '🛠️',
            administrativo: '📋',
            otro: '📦'
        };
        return icons[categoria ?? 'otro'];
    }

    formatearFecha(fecha: string): string {
        return new Date(fecha).toLocaleDateString('es-BO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatearFechaHora(fecha: string): string {
        return new Date(fecha).toLocaleString('es-BO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatearFechaCorta(fecha: string): string {
        return new Date(fecha).toLocaleDateString('es-BO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    obtenerNombreCompleto(nombres: string, apellidoPaterno?: string, apellidoMaterno?: string): string {
        const partes = [nombres, apellidoPaterno, apellidoMaterno].filter(Boolean);
        return partes.join(' ');
    }

    calcularPorcentaje(parte: number, total: number): number {
        if (total === 0) return 0;
        return (parte / total) * 100;
    }

    agruparPorFecha(egresos: Egreso[]): Record<string, Egreso[]> {
        return egresos.reduce((acc, egreso) => {
            const fecha = this.formatearFechaCorta(egreso.fecha_egreso);
            if (!acc[fecha]) {
                acc[fecha] = [];
            }
            acc[fecha].push(egreso);
            return acc;
        }, {} as Record<string, Egreso[]>);
    }

    agruparPorCategoria(egresos: Egreso[]): Record<CategoriaEgreso, Egreso[]> {
        return egresos.reduce((acc, egreso) => {
            const categoria = egreso.tipo_egreso_categoria || 'otro';
            if (!acc[categoria]) {
                acc[categoria] = [];
            }
            acc[categoria].push(egreso);
            return acc;
        }, {} as Record<CategoriaEgreso, Egreso[]>);
    }

    calcularTotalPorMetodo(egresos: Egreso[]): Record<MetodoPago, number> {
        return egresos.reduce((acc, egreso) => {
            const metodo = egreso.metodo_pago;
            acc[metodo] = (acc[metodo] || 0) + egreso.monto_neto;
            return acc;
        }, {} as Record<MetodoPago, number>);
    }

    obtenerTop5Categorias(resumen: any[]): any[] {
        return resumen
            .sort((a, b) => b.monto_neto - a.monto_neto)
            .slice(0, 5);
    }

    generarCodigoEgreso(): string {
        const fecha = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        return `EGR-${fecha}-${random}`;
    }

    validarNIT(nit: string): boolean {
        if (!nit) return true;
        const nitLimpio = nit.replace(/[^0-9]/g, '');
        return nitLimpio.length >= 7 && nitLimpio.length <= 15;
    }

    validarMonto(monto: number): { valido: boolean; mensaje?: string } {
        if (monto <= 0) {
            return { valido: false, mensaje: 'El monto debe ser mayor a 0' };
        }
        if (monto > 1000000) {
            return { valido: false, mensaje: 'El monto no puede exceder Bs. 1,000,000' };
        }
        return { valido: true };
    }

    esEgresoReciente(fechaEgreso: string, dias: number = 7): boolean {
        const fecha = new Date(fechaEgreso);
        const hoy = new Date();
        const diferencia = hoy.getTime() - fecha.getTime();
        const diasDiferencia = diferencia / (1000 * 3600 * 24);
        return diasDiferencia <= dias;
    }

    obtenerMesActual(): string {
        return new Date().toISOString().slice(0, 7);
    }

    obtenerFechaInicioPeriodo(tipo: 'mes' | 'anio' = 'mes'): string {
        const fecha = new Date();
        if (tipo === 'mes') {
            fecha.setDate(1);
        } else {
            fecha.setMonth(0, 1);
        }
        return fecha.toISOString().split('T')[0];
    }

    obtenerFechaFinPeriodo(tipo: 'mes' | 'anio' = 'mes'): string {
        const fecha = new Date();
        if (tipo === 'mes') {
            fecha.setMonth(fecha.getMonth() + 1, 0);
        } else {
            fecha.setMonth(11, 31);
        }
        return fecha.toISOString().split('T')[0];
    }

    compararPeriodos(actual: number, anterior: number): {
        diferencia: number;
        porcentaje: number;
        esPositivo: boolean;
    } {
        const diferencia = actual - anterior;
        const porcentaje = anterior === 0 ? 100 : (diferencia / anterior) * 100;
        return {
            diferencia,
            porcentaje,
            esPositivo: diferencia >= 0
        };
    }

    formatearVariacion(porcentaje: number): string {
        const signo = porcentaje >= 0 ? '+' : '';
        return `${signo}${porcentaje.toFixed(1)}%`;
    }

    exportarDatosCSV(egresos: Egreso[]): string {
        const headers = [
            'Código',
            'Fecha',
            'Tipo',
            'Concepto',
            'Beneficiario',
            'Monto',
            'Método',
            'Estado'
        ];

        const rows = egresos.map(e => [
            e.codigo_egreso,
            this.formatearFechaCorta(e.fecha_egreso),
            e.tipo_egreso_nombre || '',
            e.concepto,
            e.beneficiario || this.obtenerNombreCompleto(
                e.docente_nombres || '',
                e.docente_apellido_paterno,
                e.docente_apellido_materno
            ),
            e.monto_neto,
            this.getMetodoPagoLabel(e.metodo_pago),
            this.getEstadoEgresoLabel(e.estado)
        ]);

        const csv = [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');

        return csv;
    }

    // ============== EXPORTACIÓN PDF / EXCEL ==============

    private descargarArchivo(blob: Blob, filename: string): void {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }

    private getFilenameDesdeHeaders(contentDisposition: string | undefined, fallback: string): string {
        if (!contentDisposition) return fallback;
        const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
        if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1].replace(/"/g, ''));
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
        return filenameMatch?.[1] || fallback;
    }

    async exportarReporteEgresos(filtros: {
        fecha_desde: string;
        fecha_hasta: string;
        formato: 'pdf' | 'excel';
        tipo_egreso_id?: number;
    }): Promise<void> {
        const response = await api.get<Blob>('/api/egreso/exportar/egresos', {
            params: filtros,
            responseType: 'blob',
        });

        const extension = filtros.formato === 'excel' ? 'xlsx' : 'pdf';
        const mime = filtros.formato === 'excel'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/pdf';

        const fallback = `reporte-egresos-${filtros.fecha_desde}_${filtros.fecha_hasta}.${extension}`;
        const filename = this.getFilenameDesdeHeaders(response.headers['content-disposition'], fallback);
        const blob = new Blob([response.data], { type: mime });

        this.descargarArchivo(blob, filename);
    }
}

export default new EgresosService();