// services/prediccionService.ts
import api from '@/lib/api';
import {
  PrediccionEstudianteDTO,
  PrediccionEstudianteResponse,
  SimulacionDTO,
  SimulacionResponse,
  ClaseResponse,
  PlanRecuperacionResponse,
  MLHealthResponse,
  EscenarioSimulacion,
  SimulacionOptimoDTO,
  SimulacionOptimoResponse,
  SimulacionOptimoV2Response,
  SimulacionOptimoV2DTO,
  NotificarPadreDTO,
} from '@/types/prediccionTypes';

// ============================================
// OPCIONES DE QUERY PARAMS
// ============================================

interface OpcionesPrediccion {
  incluirGemini?: boolean;
  incluirPlan?: boolean;
  usarXgboost?: boolean;
}

interface OpcionesClase {
  incluirGemini?: boolean;
  usarXgboost?: boolean;
}

// ============================================
// SERVICE
// ============================================

export const prediccionService = {

  /**
   * Predicción individual de rendimiento de un estudiante.
   * Express consulta la BD, arma el contexto y llama al ML.
   */
  async predecirEstudiante(
    data: PrediccionEstudianteDTO,
    opciones: OpcionesPrediccion = {},
  ): Promise<PrediccionEstudianteResponse> {
    const params = new URLSearchParams();
    if (opciones.incluirGemini !== undefined)
      params.append('incluir_gemini', String(opciones.incluirGemini));
    if (opciones.incluirPlan !== undefined)
      params.append('incluir_plan', String(opciones.incluirPlan));
    if (opciones.usarXgboost !== undefined)
      params.append('usar_xgboost', String(opciones.usarXgboost));

    const response = await api.post(
      `/prediccion/estudiante?${params}`,
      data,
    );
    return response.data;
  },

  /**
   * Análisis de rendimiento de toda la clase.
   * El backend obtiene todos los estudiantes del paralelo automáticamente.
   */
  async predecirClase(
    data: { asignacion_docente_id: number; periodo_evaluacion_id: number; paralelo_id: number },
    opciones: OpcionesClase = {},
  ): Promise<ClaseResponse> {
    const params = new URLSearchParams();
    if (opciones.incluirGemini !== undefined)
      params.append('incluir_gemini', String(opciones.incluirGemini));
    if (opciones.usarXgboost !== undefined)
      params.append('usar_xgboost', String(opciones.usarXgboost));

    const response = await api.post(
      `/prediccion/clase?${params}`,
      data,
    );
    return response.data;
  },

  /**
   * Notifica al padre/madre de un estudiante en riesgo crítico — SOLO se
   * llama cuando el docente confirma desde ModalNotificarPadre. No se
   * dispara automáticamente desde predecirEstudiante ni predecirClase.
   */
  async notificarPadre(
    data: NotificarPadreDTO,
  ): Promise<{ success: boolean; data: any }> {
    const response = await api.post('/prediccion/notificar-padre', data);
    return response.data;
  },

  /**
   * Plan de recuperación semana a semana (requiere Gemini).
   * Retorna plan: null si riesgo es bajo o quedan < 2 semanas.
   */
  async planRecuperacion(
    data: PrediccionEstudianteDTO,
  ): Promise<PlanRecuperacionResponse> {
    const response = await api.post('/prediccion/plan', data);
    return response.data;
  },

  /**
   * Simulación de hasta 5 escenarios de intervención.
   * Muestra cómo cambiaría el riesgo en cada escenario hipotético.
   */
  async simular(
    data: SimulacionDTO,
    opciones: OpcionesClase = {},
  ): Promise<SimulacionResponse> {
    const params = new URLSearchParams();
    if (opciones.incluirGemini !== undefined)
      params.append('incluir_gemini', String(opciones.incluirGemini));
    if (opciones.usarXgboost !== undefined)
      params.append('usar_xgboost', String(opciones.usarXgboost));

    const response = await api.post(
      `/prediccion/simular?${params}`,
      data,
    );
    return response.data;
  },
  async simularOptimo(
    data: SimulacionOptimoDTO,
    opciones: { usarXgboost?: boolean } = {},
  ): Promise<{ success: boolean; data: SimulacionOptimoResponse }> {
    const params = new URLSearchParams();
    if (opciones.usarXgboost !== undefined)
      params.append('usar_xgboost', String(opciones.usarXgboost));

    const response = await api.post(
      `/prediccion/simular/optimo?${params}`,
      data,
    );
    return response.data;
  },

  async simularOptimoV2(
    data: SimulacionOptimoV2DTO,
    opciones: { usarXgboost?: boolean } = {},
  ): Promise<{ success: boolean; data: SimulacionOptimoV2Response }> {
    const params = new URLSearchParams();
    if (opciones.usarXgboost !== undefined)
      params.append('usar_xgboost', String(opciones.usarXgboost));
    const response = await api.post(`/prediccion/simular/optimo/v2?${params}`, data);
    return response.data;
  },


  /**
   * Estado del microservicio ML.
   * Útil para mostrar un indicador en el dashboard.
   */
  async health(): Promise<MLHealthResponse> {
    const response = await api.get('/prediccion/health');
    return response.data;
  },
};

export default prediccionService;