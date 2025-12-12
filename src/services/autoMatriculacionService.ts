// services/autoMatriculacionService.ts
import api from '@/lib/api';
import {
  ValidacionCredenciales,
  ValidacionResponse,
  OpcionesMatriculaResponse,
  AutoMatriculacionData,
  AutoMatriculacionResponse,
  ActualizarDatosPayload,
  ActualizarDatosResponse,
} from '@/types/autoMatriculacionTypes';

export const autoMatriculacionService = {
  /**
   * Validar estudiante con código y CI
   */
  async validarEstudiante(credenciales: ValidacionCredenciales): Promise<ValidacionResponse> {
    const response = await api.post('/auto-matriculacion/validar', credenciales);
    return response.data;
  },

  /**
   * Obtener opciones de matrícula (grados y paralelos disponibles)
   */
  async obtenerOpciones(codigo: string, ci: string): Promise<OpcionesMatriculaResponse> {
    const response = await api.get('/auto-matriculacion/opciones', {
      params: { codigo, ci },
    });
    return response.data;
  },

  /**
   * Actualizar datos del estudiante (con foto opcional)
   */
  async actualizarDatos(payload: ActualizarDatosPayload): Promise<ActualizarDatosResponse> {
    const formData = new FormData();
    
    formData.append('codigo', payload.codigo);
    formData.append('ci', payload.ci);
    
    // Agregar solo campos que tengan valor (no vacíos)
    if (payload.telefono && payload.telefono.trim()) {
      formData.append('telefono', payload.telefono.trim());
    }
    if (payload.email && payload.email.trim()) {
      formData.append('email', payload.email.trim());
    }
    if (payload.direccion && payload.direccion.trim()) {
      formData.append('direccion', payload.direccion.trim());
    }
    if (payload.zona && payload.zona.trim()) {
      formData.append('zona', payload.zona.trim());
    }
    if (payload.ciudad && payload.ciudad.trim()) {
      formData.append('ciudad', payload.ciudad.trim());
    }
    if (payload.contacto_emergencia && payload.contacto_emergencia.trim()) {
      formData.append('contacto_emergencia', payload.contacto_emergencia.trim());
    }
    if (payload.telefono_emergencia && payload.telefono_emergencia.trim()) {
      formData.append('telefono_emergencia', payload.telefono_emergencia.trim());
    }
    
    // Agregar foto si existe
    if (payload.foto) {
      formData.append('foto', payload.foto);
    }

    const response = await api.put('/auto-matriculacion/actualizar-datos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  /**
   * Auto-matricular estudiante (con documentos opcionales)
   */
  async matricular(data: AutoMatriculacionData): Promise<AutoMatriculacionResponse> {
    const formData = new FormData();
    
    formData.append('codigo', data.codigo);
    formData.append('ci', data.ci);
    formData.append('paralelo_id', data.paralelo_id.toString());
    
    // Agregar documentos si existen
    if (data.documentos && data.documentos.length > 0) {
      data.documentos.forEach((doc, index) => {
        formData.append('documentos', doc.file);
      });
      
      // Agregar metadata de documentos
      formData.append('documentos', JSON.stringify(
        data.documentos.map(doc => ({
          tipo_documento: doc.tipo_documento,
          observaciones: doc.observaciones,
        }))
      ));
    }

    const response = await api.post('/auto-matriculacion/matricular', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
};

export default autoMatriculacionService;