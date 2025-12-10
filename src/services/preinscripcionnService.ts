// src/app/dashboard/preinscripciones/services/preinscripcionService.ts

import api from '@/lib/api';
import { Preinscripcion, EstadoPreinscripcion } from '../types/preinscripcioonTypes';

/**
 * Mapea la respuesta del backend al formato esperado en el frontend
 */
const mapPreinscripcion = (p: any): Preinscripcion => ({
  id: p.id,
  codigo_inscripcion: p.codigo_inscripcion,
  estado: p.estado,
  estudiante_nombre: p.estudiante_nombre,
  estudiante_ci: p.ci || p.estudiante_ci || 'Sin CI',
  estudiante_foto: p.estudiante_foto || p.foto_url,
  grado_solicitado: p.grado_solicitado,
  tutor_nombre: p.tutor_nombre,
  tutor_telefono: p.tutor_telefono,
  created_at: p.created_at,
});

/**
 * Servicio para gestionar las preinscripciones
 */
class PreinscripcionService {
  /**
   * Obtiene todas las preinscripciones
   */
  async listarPreinscripciones(params?: { 
    estado?: string; 
    grado?: string;
    search?: string;
  }): Promise<any> {
    const { data } = await api.get('/preinscripcion', { params });
    
    // Mapear las preinscripciones al formato esperado
    const preinscripciones = data.data?.preinscripciones?.map(mapPreinscripcion) || [];
    
    return {
      ...data,
      data: {
        ...data.data,
        preinscripciones
      }
    };
  }

  /**
   * Obtiene una preinscripción por ID
   */
  async obtenerPreinscripcion(id: number): Promise<any> {
    const { data } = await api.get(`/preinscripcion/${id}`);
    
    return {
      ...data,
      data: data.data ? mapPreinscripcion(data.data) : null
    };
  }

  /**
   * Crea una nueva preinscripción
   */
  async crearPreinscripcion(datos: Partial<Preinscripcion>): Promise<any> {
    const { data } = await api.post('/preinscripcion', datos);
    
    return {
      ...data,
      data: data.data ? mapPreinscripcion(data.data) : null
    };
  }

  /**
   * Actualiza una preinscripción existente
   */
  async actualizarPreinscripcion(id: number, datos: Partial<Preinscripcion>): Promise<any> {
    const { data } = await api.put(`/preinscripcion/${id}`, datos);
    
    return {
      ...data,
      data: data.data ? mapPreinscripcion(data.data) : null
    };
  }

  /**
   * Elimina una preinscripción
   */
  async eliminarPreinscripcion(id: number): Promise<any> {
    const { data } = await api.delete(`/preinscripcion/${id}`);
    return data;
  }

  /**
   * Cambia el estado de una preinscripción
   */
  async cambiarEstado(id: number, nuevoEstado: EstadoPreinscripcion): Promise<any> {
    const { data } = await api.patch(`/preinscripcion/${id}/estado`, { 
      estado: nuevoEstado 
    });
    
    return {
      ...data,
      data: data.data ? mapPreinscripcion(data.data) : null
    };
  }

  /**
   * Aprueba documentos de una preinscripción
   */
  async aprobarDocumentos(id: number): Promise<any> {
    const { data } = await api.post(`/preinscripcion/${id}/aprobar-documentos`);
    
    return {
      ...data,
      data: data.data ? mapPreinscripcion(data.data) : null
    };
  }

  /**
   * Rechaza una preinscripción
   */
  async rechazarPreinscripcion(id: number, motivo?: string): Promise<any> {
    const { data } = await api.post(`/preinscripcion/${id}/rechazar`, { motivo });
    
    return {
      ...data,
      data: data.data ? mapPreinscripcion(data.data) : null
    };
  }

  /**
   * Convierte una preinscripción en inscripción
   */
  async convertirAInscripcion(id: number): Promise<any> {
    const { data } = await api.post(`/preinscripcion/${id}/convertir`);
    return data;
  }

  /**
   * Obtiene estadísticas de preinscripciones
   */
  async obtenerEstadisticas(params?: { 
    periodo?: string; 
    grado?: string;
  }): Promise<any> {
    const { data } = await api.get('/preinscripcion/estadisticas', { params });
    return data;
  }

  /**
   * Exporta preinscripciones a Excel
   */
  async exportarExcel(params?: { 
    estado?: string; 
    grado?: string;
  }): Promise<Blob> {
    const { data } = await api.get('/preinscripcion/export/excel', {
      params,
      responseType: 'blob'
    });
    return data;
  }

  // ========== UTILIDADES ==========
  
  /**
   * Formatea el código de inscripción
   */
  formatCodigoInscripcion(codigo: string): string {
    return codigo.toUpperCase();
  }

  /**
   * Obtiene el label formateado del grado
   */
  formatGradoLabel(grado: string): string {
    const grados: Record<string, string> = {
      'TERCERO DE PRIMARIA': '3° Primaria',
      'PRIMERO_SEC': '1° Secundaria',
      'SEGUNDO_SEC': '2° Secundaria',
      'TERCERO_SEC': '3° Secundaria',
      'CUARTO_SEC': '4° Secundaria',
      'QUINTO_SEC': '5° Secundaria',
      'SEXTO_SEC': '6° Secundaria',
    };
    return grados[grado] || grado;
  }

  /**
   * Valida si se puede editar una preinscripción según su estado
   */
  puedeEditar(estado?: EstadoPreinscripcion): boolean {
    const estadosEditables: EstadoPreinscripcion[] = [
      'iniciada', 
      'datos_completos', 
      'documentos_pendientes'
    ];
    return estado ? estadosEditables.includes(estado) : false;
  }

  /**
   * Valida si se puede eliminar una preinscripción según su estado
   */
  puedeEliminar(estado?: EstadoPreinscripcion): boolean {
    const estadosEliminables: EstadoPreinscripcion[] = [
      'iniciada', 
      'rechazada'
    ];
    return estado ? estadosEliminables.includes(estado) : false;
  }

  /**
   * Valida si se puede aprobar una preinscripción según su estado
   */
  puedeAprobar(estado?: EstadoPreinscripcion): boolean {
    const estadosAprobables: EstadoPreinscripcion[] = [
      'en_revision',
      'documentos_aprobados'
    ];
    return estado ? estadosAprobables.includes(estado) : false;
  }
}

export default new PreinscripcionService();