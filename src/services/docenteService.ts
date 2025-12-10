// services/docenteService.ts - VERSIÓN ACTUALIZADA
import api from '@/lib/api';
import {
  Docente,
  DocentesFiltros,
  DocentesListResponse,
  DocenteResponse,
  CrearDocenteDTO,
  ActualizarDocenteDTO,
  RegistroCompletoResponse,
  CrearUsuarioDocenteDTO,
  CrearUsuarioResponse,
  DocenteEstadisticas,
} from '@/types/docenteTypes';

// =============================================
// DOCENTES - CRUD BÁSICO
// =============================================

export const docentesService = {
  // Obtener estadísticas generales
  async obtenerEstadisticas(): Promise<{
    success: boolean;
    data: {
      estadisticas: {
        total_docentes: number;
        activos: number;
        inactivos: number;
        por_tipo_contrato: {
          planta: number;
          contrato: number;
          honorarios: number;
          medio_tiempo: number;
        };
        por_nivel_formacion: {
          bachiller: number;
          licenciatura: number;
          maestria: number;
          doctorado: number;
        };
        total_asignaciones: number;
        promedio_asignaciones: number;
        docentes_con_asignaciones: number;
        top_especialidades?: Array<{ especialidad: string; cantidad: number }>;
      };
    };
  }> {
    const response = await api.get('/docente/estadisticas');
    return response.data;
  },

  // Listar docentes con filtros y paginación
  async listar(filters: DocentesFiltros = {}): Promise<DocentesListResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.activo !== undefined) params.append('activo', filters.activo.toString());
    if (filters.tipo_contrato) params.append('tipo_contrato', filters.tipo_contrato);
    if (filters.especialidad) params.append('especialidad', filters.especialidad);

    const response = await api.get(`/docente?${params}`);
    return response.data;
  },

  // Obtener docente por ID
  async obtenerPorId(id: number): Promise<{ docente: Docente; estadisticas: DocenteEstadisticas }> {
    const response = await api.get(`/docente/${id}`);
    return response.data.data;
  },

  // Actualizar docente
  async actualizar(id: number, data: ActualizarDocenteDTO, foto?: File, cv?: File): Promise<Docente> {
    const formData = new FormData();

    // Agregar archivos
    if (foto) {
      formData.append('foto', foto);
    }

    if (cv) {
      formData.append('cv', cv);
    }

    // Agregar datos del docente
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    const response = await api.put(`/docente/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.data.docente;
  },

  // Eliminar docente
  async eliminar(id: number): Promise<void> {
    await api.delete(`/docente/${id}`);
  },

  // Crear usuario para docente existente
  async crearUsuario(id: number, data: CrearUsuarioDocenteDTO): Promise<CrearUsuarioResponse> {
    const response = await api.post(`/docente/${id}/crear-usuario`, data);
    return response.data;
  },
};

// =============================================
// REGISTRO COMPLETO (SIN ASIGNACIONES)
// =============================================

export const registroCompletoDocenteService = {
  async registrar(data: CrearDocenteDTO, foto?: File, cv?: File): Promise<RegistroCompletoResponse> {
    const formData = new FormData();

    // 1. FOTO DEL DOCENTE
    if (foto) {
      formData.append('foto', foto);
    }

    // 2. CV DEL DOCENTE
    if (cv) {
      formData.append('cv', cv);
    }

    // 3. DATOS DEL DOCENTE (JSON string)
    formData.append('docente', JSON.stringify(data.docente));

    // 4. FLAG DE CREAR USUARIO
    formData.append('crear_usuario', String(data.crear_usuario || false));

    // 5. CREDENCIALES (si se proporciona)
    if (data.credenciales) {
      formData.append('credenciales', JSON.stringify(data.credenciales));
    }

    // YA NO SE ENVÍAN ASIGNACIONES AQUÍ

    const response = await api.post('/docente/registro-completo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },
};

// =============================================
// EXPORTAR TODOS LOS SERVICIOS
// =============================================

export default {
  ...docentesService,
  registroCompleto: registroCompletoDocenteService,
};