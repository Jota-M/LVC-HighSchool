// hooks/useReportes.ts
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { reportesService } from '@/services/reportesService';
import { useSnackbar } from 'notistack';
import type {
  ReporteParaleloParams,
  ReporteEstudianteParams,
  ReporteEstadisticoMatriculaParams,
  ReportePreInscripcionIndividualParams,
  ReportePreInscripcionListadoParams,
  ReportePreInscripcionEstadisticoParams,
} from '@/types/reportesTypes';

export const useReportes = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [isGenerating, setIsGenerating] = useState(false);

  // Helper para descargar blob
  const descargarArchivo = (blob: Blob, nombreArchivo: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Helper para generar nombre de archivo
  const generarNombreArchivo = (
    tipo: string,
    formato: 'pdf' | 'excel',
    identificador?: string
  ) => {
    const extension = formato === 'pdf' ? 'pdf' : 'xlsx';
    const timestamp = new Date().toISOString().split('T')[0];
    const id = identificador ? `-${identificador}` : '';
    return `${tipo}${id}-${timestamp}.${extension}`;
  };

  // ==========================================
  // 📚 MUTATIONS: REPORTES DE MATRÍCULAS
  // ==========================================

  const reporteParaleloMutation = useMutation({
    mutationFn: (params: ReporteParaleloParams) =>
      reportesService.descargarReporteParalelo(params),
    onMutate: () => {
      setIsGenerating(true);
      enqueueSnackbar('Generando reporte de paralelo...', { variant: 'info' });
    },
    onSuccess: (blob, variables) => {
      const nombre = generarNombreArchivo(
        'reporte-paralelo',
        variables.formato || 'pdf',
        `${variables.paralelo_id}`
      );
      descargarArchivo(blob, nombre);
      enqueueSnackbar('Reporte descargado exitosamente', { variant: 'success' });
      setIsGenerating(false);
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Error al generar reporte', {
        variant: 'error',
      });
      setIsGenerating(false);
    },
  });

  const reporteEstudianteMutation = useMutation({
    mutationFn: (params: ReporteEstudianteParams) =>
      reportesService.descargarReporteEstudiante(params),
    onMutate: () => {
      setIsGenerating(true);
      enqueueSnackbar('Generando ficha del estudiante...', { variant: 'info' });
    },
    onSuccess: (blob, variables) => {
      const nombre = generarNombreArchivo(
        'ficha-estudiante',
        variables.formato || 'pdf',
        `${variables.estudiante_id}`
      );
      descargarArchivo(blob, nombre);
      enqueueSnackbar('Reporte descargado exitosamente', { variant: 'success' });
      setIsGenerating(false);
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Error al generar reporte', {
        variant: 'error',
      });
      setIsGenerating(false);
    },
  });

  const reporteEstadisticoMutation = useMutation({
    mutationFn: (params: ReporteEstadisticoMatriculaParams) =>
      reportesService.descargarReporteEstadistico(params),
    onMutate: () => {
      setIsGenerating(true);
      enqueueSnackbar('Generando reporte estadístico...', { variant: 'info' });
    },
    onSuccess: (blob, variables) => {
      const nombre = generarNombreArchivo(
        'estadistico-matriculas',
        variables.formato || 'pdf'
      );
      descargarArchivo(blob, nombre);
      enqueueSnackbar('Reporte descargado exitosamente', { variant: 'success' });
      setIsGenerating(false);
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Error al generar reporte', {
        variant: 'error',
      });
      setIsGenerating(false);
    },
  });

  // ==========================================
  // 📝 MUTATIONS: REPORTES DE PRE-INSCRIPCIONES
  // ==========================================

  const reportePreInscripcionIndividualMutation = useMutation({
    mutationFn: (params: ReportePreInscripcionIndividualParams) =>
      reportesService.descargarReportePreInscripcionIndividual(params),
    onMutate: () => {
      setIsGenerating(true);
      enqueueSnackbar('Generando ficha de pre-inscripción...', { variant: 'info' });
    },
    onSuccess: (blob, variables) => {
      const nombre = generarNombreArchivo(
        'preinscripcion',
        variables.formato || 'pdf',
        `${variables.id}`
      );
      descargarArchivo(blob, nombre);
      enqueueSnackbar('Reporte descargado exitosamente', { variant: 'success' });
      setIsGenerating(false);
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Error al generar reporte', {
        variant: 'error',
      });
      setIsGenerating(false);
    },
  });

  const reportePreInscripcionListadoMutation = useMutation({
    mutationFn: (params: ReportePreInscripcionListadoParams) =>
      reportesService.descargarReportePreInscripcionListado(params),
    onMutate: () => {
      setIsGenerating(true);
      enqueueSnackbar('Generando listado de pre-inscripciones...', {
        variant: 'info',
      });
    },
    onSuccess: (blob, variables) => {
      const nombre = generarNombreArchivo(
        'listado-preinscripciones',
        variables.formato || 'pdf'
      );
      descargarArchivo(blob, nombre);
      enqueueSnackbar('Reporte descargado exitosamente', { variant: 'success' });
      setIsGenerating(false);
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Error al generar reporte', {
        variant: 'error',
      });
      setIsGenerating(false);
    },
  });

  const reportePreInscripcionEstadisticoMutation = useMutation({
    mutationFn: (params: ReportePreInscripcionEstadisticoParams) =>
      reportesService.descargarReportePreInscripcionEstadistico(params),
    onMutate: () => {
      setIsGenerating(true);
      enqueueSnackbar('Generando estadísticas de pre-inscripciones...', {
        variant: 'info',
      });
    },
    onSuccess: (blob, variables) => {
      const nombre = generarNombreArchivo(
        'estadistico-preinscripciones',
        variables.formato || 'pdf'
      );
      descargarArchivo(blob, nombre);
      enqueueSnackbar('Reporte descargado exitosamente', { variant: 'success' });
      setIsGenerating(false);
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Error al generar reporte', {
        variant: 'error',
      });
      setIsGenerating(false);
    },
  });

  return {
    isGenerating,

    // Reportes de Matrículas
    generarReporteParalelo: reporteParaleloMutation.mutate,
    generarReporteEstudiante: reporteEstudianteMutation.mutate,
    generarReporteEstadistico: reporteEstadisticoMutation.mutate,

    // Reportes de Pre-inscripciones
    generarReportePreInscripcionIndividual:
      reportePreInscripcionIndividualMutation.mutate,
    generarReportePreInscripcionListado: reportePreInscripcionListadoMutation.mutate,
    generarReportePreInscripcionEstadistico:
      reportePreInscripcionEstadisticoMutation.mutate,
  };
};

// ✅ EXPORTACIÓN POR DEFECTO AGREGADA
export default useReportes;