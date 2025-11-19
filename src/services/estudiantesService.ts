import api from '../lib/api';

export interface Estudiante {
  id: number;
  usuario_id?: number;
  codigo: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  apellidos: string; // campo generado
  fecha_nacimiento: string;
  ci: string;
  lugar_nacimiento?: string;
  genero: string;
  direccion?: string;
  zona?: string;
  ciudad?: string;
  telefono?: string;
  email?: string;
  foto_url?: string;
  tipo_sangre?: string;
  alergias?: string;
  condiciones_medicas?: string;
  contacto_emergencia?: string;
  telefono_emergencia?: string;
  religion?: string;
  lengua_materna?: string;
  tiene_discapacidad: boolean;
  tipo_discapacidad?: string;
  observaciones?: string;
  activo: boolean;
  created_at: string;
  // Relaciones
  tutores?: any[];
  matriculas?: any[];
  matricula_id?: number;
  estado_matricula?: string;
  paralelo?: string;
  grado?: string;
  nivel?: string;
}

export interface Tutor {
  id?: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  ci: string;
  telefono: string;
  celular?: string;
  email?: string;
  direccion?: string;
  ocupacion?: string;
  parentesco: string;
  es_tutor_principal?: boolean;
  vive_con_estudiante?: boolean;
  autorizado_recoger?: boolean;
}

export interface EstudianteFormData {
  codigo?: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  fecha_nacimiento: string;
  ci: string;
  lugar_nacimiento?: string;
  genero: string;
  direccion?: string;
  zona?: string;
  ciudad?: string;
  telefono?: string;
  email?: string;
  tipo_sangre?: string;
  alergias?: string;
  condiciones_medicas?: string;
  contacto_emergencia?: string;
  telefono_emergencia?: string;
  religion?: string;
  lengua_materna?: string;
  tiene_discapacidad?: boolean;
  tipo_discapacidad?: string;
  observaciones?: string;
  activo?: boolean;
  foto?: File;
  tutores?: Tutor[];
}

class EstudiantesService {
  async listar(params?: {
    page?: number;
    limit?: number;
    search?: string;
    genero?: string;
    activo?: boolean;
    nivel_academico_id?: number;
    grado_id?: number;
    paralelo_id?: number;
    periodo_academico_id?: number;
  }) {
    const { data } = await api.get('/estudiantes', { params });
    return data;
  }

  async obtenerPorId(id: number): Promise<Estudiante> {
    const { data } = await api.get(`/estudiantes/${id}`);
    return data.data.estudiante;
  }

  async crear(estudiante: EstudianteFormData) {
    const formData = new FormData();

    // Agregar campos básicos
    Object.keys(estudiante).forEach((key) => {
      const value = estudiante[key as keyof EstudianteFormData];
      
      if (value !== undefined && value !== null) {
        if (key === 'foto' && value instanceof File) {
          formData.append('foto', value);
        } else if (key === 'tutores') {
          // Enviar tutores como JSON
          formData.append('tutores', JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const { data } = await api.post('/estudiantes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  }

  async actualizar(id: number, estudiante: Partial<EstudianteFormData>) {
    const formData = new FormData();

    Object.keys(estudiante).forEach((key) => {
      const value = estudiante[key as keyof EstudianteFormData];
      
      if (value !== undefined && value !== null) {
        if (key === 'foto' && value instanceof File) {
          formData.append('foto', value);
        } else if (key === 'tutores') {
          formData.append('tutores', JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const { data } = await api.put(`/estudiantes/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  }

  async eliminar(id: number) {
    const { data } = await api.delete(`/estudiantes/${id}`);
    return data;
  }

  async estadisticas() {
    const { data } = await api.get('/estudiantes/estadisticas');
    return data;
  }
}

export default new EstudiantesService();