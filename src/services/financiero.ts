// services/financiero.ts - SERVICIO DE REPORTES FINANCIEROS COMBINADOS
import api from '../lib/api';

class FinancieroService {
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

    async exportarBalance(filtros: {
        fecha_desde: string;
        fecha_hasta: string;
        formato: 'pdf' | 'excel';
    }): Promise<void> {
        const response = await api.get<Blob>('/api/financiero/exportar/balance', {
            params: filtros,
            responseType: 'blob',
        });

        const extension = filtros.formato === 'excel' ? 'xlsx' : 'pdf';
        const mime = filtros.formato === 'excel'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/pdf';

        const fallback = `balance-general-${filtros.fecha_desde}_${filtros.fecha_hasta}.${extension}`;
        const filename = this.getFilenameDesdeHeaders(response.headers['content-disposition'], fallback);
        const blob = new Blob([response.data], { type: mime });

        this.descargarArchivo(blob, filename);
    }
}

export default new FinancieroService();