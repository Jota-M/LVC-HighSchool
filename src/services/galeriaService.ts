// services/galeriaService.ts
import api from '@/lib/api';
import {
    FotoGaleria,
    FiltrosGaleria,
    GaleriaListResponse,
    GaleriaVigentesResponse,
    GaleriaDetailResponse,
    CrearFotoDTO,
    ActualizarFotoDTO,
} from '@/types/galeriaTypes';

export const galeriaService = {
    // GET /galeria (Gestión admin/secretaría con paginación y filtros)
    async listar(filters: FiltrosGaleria = {}): Promise<GaleriaListResponse> {
        const params = new URLSearchParams();
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.activo !== undefined) params.append('activo', filters.activo.toString());
        if (filters.vigente !== undefined) params.append('vigente', filters.vigente.toString());

        const query = params.toString() ? `?${params.toString()}` : '';
        const response = await api.get<GaleriaListResponse>(`/galeria${query}`);
        return response.data;
    },

    // GET /galeria/vigentes (Público/home carrusel)
    async vigentes(): Promise<GaleriaVigentesResponse> {
        const response = await api.get<GaleriaVigentesResponse>('/galeria/vigentes');
        return response.data;
    },

    // GET /galeria/:id
    async obtenerPorId(id: number): Promise<GaleriaDetailResponse> {
        const response = await api.get<GaleriaDetailResponse>(`/galeria/${id}`);
        return response.data;
    },

    // POST /galeria (multipart/form-data)
    async crear(data: CrearFotoDTO): Promise<GaleriaDetailResponse> {
        const formData = new FormData();
        formData.append('foto', data.foto);
        formData.append('titulo', data.titulo);
        if (data.orden !== undefined && data.orden !== null) {
            formData.append('orden', data.orden.toString());
        }
        if (data.fecha_inicio) {
            formData.append('fecha_inicio', data.fecha_inicio);
        }
        if (data.fecha_fin) {
            formData.append('fecha_fin', data.fecha_fin);
        }

        const response = await api.post<GaleriaDetailResponse>('/galeria', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // PUT /galeria/:id (multipart/form-data)
    async actualizar(id: number, data: ActualizarFotoDTO): Promise<GaleriaDetailResponse> {
        const formData = new FormData();
        if (data.foto) {
            formData.append('foto', data.foto);
        }
        if (data.titulo !== undefined) {
            formData.append('titulo', data.titulo);
        }
        if (data.orden !== undefined && data.orden !== null) {
            formData.append('orden', data.orden.toString());
        }
        if (data.fecha_inicio !== undefined) {
            formData.append('fecha_inicio', data.fecha_inicio || '');
        }
        if (data.fecha_fin !== undefined) {
            formData.append('fecha_fin', data.fecha_fin || '');
        }
        if (data.activo !== undefined) {
            formData.append('activo', data.activo.toString());
        }

        const response = await api.put<GaleriaDetailResponse>(`/galeria/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // PATCH /galeria/:id/activo
    async toggleActivo(id: number): Promise<GaleriaDetailResponse> {
        const response = await api.patch<GaleriaDetailResponse>(`/galeria/${id}/activo`);
        return response.data;
    },

    // DELETE /galeria/:id
    async eliminar(id: number): Promise<{ success: boolean; message: string }> {
        const response = await api.delete<{ success: boolean; message: string }>(`/galeria/${id}`);
        return response.data;
    },
};

export default galeriaService;
