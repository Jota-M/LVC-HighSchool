// services/dashboard.service.ts - OPTIMIZADO
import api from '../lib/api';
import type {
  ApiResponse,
  EstudianteStats,
  ActividadReciente,
  PeriodoAcademico,
} from '../types/dashboardTypes';

class DashboardService {
  // Cache simple para evitar llamadas duplicadas
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private CACHE_DURATION = 30000; // 30 segundos

  private getCached(key: string) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // ========== MÉTODO PRINCIPAL OPTIMIZADO ==========
  async getDashboardData(): Promise<any> {
    try {
      // Verificar cache
      const cached = this.getCached('dashboard');
      if (cached) {
        console.log('📦 Usando datos en cache');
        return cached;
      }

      console.log('🔄 Cargando datos del dashboard...');

      // Hacer todas las llamadas en paralelo
      const [
        estudiantesStats,
        actividadReciente,
        periodoActivo,
      ] = await Promise.allSettled([
        // Endpoint de estadísticas completas (una sola llamada)
        api.get('/estudiante/estadisticas'),
        // Actividad reciente
        api.get('/actividad', { params: { limit: 10, page: 1 } }),
        // Periodo activo
        api.get('/periodo-academico/activo'),
      ]);

      // Obtener conteos de forma optimizada (solo totales, no activos individuales)
      const [
        docentesTotal,
        usuariosTotal,
        matriculasTotal,
      ] = await Promise.allSettled([
        api.get('/docente', { params: { page: 1, limit: 1 } }),
        api.get('/usuarios', { params: { page: 1, limit: 1 } }),
        api.get('/matricula', { params: { page: 1, limit: 1 } }),
      ]);

      // Construir respuesta
      const estudiantesData = estudiantesStats.status === 'fulfilled' 
        ? estudiantesStats.value.data.data 
        : null;

      const dashboardData = {
        // Estudiantes - desde estadísticas completas
        estudiantes: estudiantesData,
        estudiantesCount: {
          total: estudiantesData?.total || 0,
          activos: estudiantesData?.activos || 0,
        },

        // Docentes
        docentesCount: {
          total: docentesTotal.status === 'fulfilled' 
            ? docentesTotal.value.data.data.paginacion?.total || 0 
            : 0,
          activos: docentesTotal.status === 'fulfilled' 
            ? docentesTotal.value.data.data.paginacion?.total || 0 
            : 0,
        },

        // Usuarios
        usuariosCount: {
          total: usuariosTotal.status === 'fulfilled' 
            ? usuariosTotal.value.data.data.paginacion?.total || 0 
            : 0,
          activos: usuariosTotal.status === 'fulfilled' 
            ? usuariosTotal.value.data.data.paginacion?.total || 0 
            : 0,
        },

        // Matrículas
        matriculasCount: {
          total: matriculasTotal.status === 'fulfilled' 
            ? matriculasTotal.value.data.data.paginacion?.total || 0 
            : 0,
          activas: matriculasTotal.status === 'fulfilled' 
            ? matriculasTotal.value.data.data.paginacion?.total || 0 
            : 0,
        },

        // Actividad
        actividad: actividadReciente.status === 'fulfilled' 
          ? actividadReciente.value.data.data.actividades || [] 
          : [],

        // Periodo
        periodo: periodoActivo.status === 'fulfilled' 
          ? periodoActivo.value.data.data.periodo 
          : null,

        // Agregar nulls para estadísticas opcionales
        actividadStats: null,
        sesionesStats: null,
      };

      // Guardar en cache
      this.setCache('dashboard', dashboardData);

      console.log('✅ Datos del dashboard cargados');
      return dashboardData;

    } catch (error) {
      console.error('❌ Error al obtener datos del dashboard:', error);
      throw error;
    }
  }

  // Método para limpiar cache manualmente
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Cache limpiado');
  }
}

export default new DashboardService();