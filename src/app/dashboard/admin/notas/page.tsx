'use client';
// app/dashboard/admin/notas/page.tsx
// Panel Administrativo de Notas y Calificaciones por Curso
// Vista de Sábana General de Curso y Resumen Trimestral/Anual por Estudiante

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Container, Typography, Fade, Chip, Skeleton, Card, CardContent,
  useTheme, alpha, IconButton, Tooltip, Avatar, Grid, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, TextField,
  InputAdornment, Button, Stack, ToggleButton, ToggleButtonGroup,
  Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem,
  FormControl, InputLabel, CircularProgress, Divider, Alert,
} from '@mui/material';
import { keyframes } from '@mui/system';
import { useSnackbar } from 'notistack';

// Iconos
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import AutoAwesomeMosaicRoundedIcon from '@mui/icons-material/AutoAwesomeMosaicRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

// Hooks y Servicios
import { useAcademicos } from '@/hooks/useAcademicos';
import {
  getNotasCurso,
  actualizarNotaManual,
  CursoNotasData,
  EstudianteCursoNotas,
  MateriaNotaEstudiante,
  MateriaCursoInfo,
} from '@/services/adminNotasService';
import BoletinGeneralAnual from '@/components/padre/notas/BoletinGeneralAnual';
import BoletinNotas from '@/components/padre/notas/BoletinNotas';
import {
  ResumenMateriaPadre,
  ResumenMateriaAnual,
  PeriodoEvaluacion,
  getNivelRendimiento,
} from '@/types/padreNotasTypes';

// ==================== ANIMACIONES ====================
const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ==================== PALETA DE COLOR ====================
const usePalette = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primary = isDark ? '#facc15' : '#0288d1';
  const primaryEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${primary} 0%, ${primaryEnd} 100%)`;
  return { isDark, primary, primaryEnd, gradBg, theme };
};

// ==================== CHIP NOTA MATRIZ ====================
const ChipNotaMatriz: React.FC<{
  nota: number | null | undefined;
  aprobado: boolean | null | undefined;
  minima?: number;
  isDark: boolean;
  editable?: boolean;
  onClick?: () => void;
}> = ({ nota, aprobado, minima = 51, isDark, editable = false, onClick }) => {
  if (nota == null) {
    return (
      <Tooltip title={editable ? 'Sin calificación · Clic para asignar' : 'Sin calificación'} arrow>
        <Box
          onClick={editable ? onClick : undefined}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 28,
            borderRadius: 1.5,
            bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04),
            border: `1px dashed ${isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15)}`,
            cursor: editable ? 'pointer' : 'default',
            transition: 'all 0.15s ease',
            '&:hover': editable ? {
              bgcolor: alpha(isDark ? '#facc15' : '#0288d1', 0.15),
              borderColor: isDark ? '#facc15' : '#0288d1',
              transform: 'scale(1.08)',
            } : {},
          }}
        >
          <Typography variant="caption" color="text.disabled" fontWeight={700}>
            —
          </Typography>
        </Box>
      </Tooltip>
    );
  }

  const color =
    nota >= 70 ? '#10b981' :
      nota >= minima ? '#f59e0b' : '#ef4444';

  const tooltipTitle = editable
    ? `${aprobado ? `Aprobado (Mín: ${minima})` : `Reprobado (Mín: ${minima})`} · Clic para editar nota`
    : (aprobado ? `Aprobado (Mín: ${minima})` : `Reprobado (Mín: ${minima})`);

  return (
    <Tooltip title={tooltipTitle} arrow>
      <Box
        onClick={editable ? onClick : undefined}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 44,
          height: 28,
          px: 0.8,
          borderRadius: 1.5,
          bgcolor: alpha(color, isDark ? 0.2 : 0.1),
          border: `1px solid ${alpha(color, 0.35)}`,
          fontWeight: 800,
          fontSize: '0.82rem',
          color,
          cursor: editable ? 'pointer' : 'default',
          transition: 'all 0.15s ease',
          '&:hover': editable ? {
            transform: 'scale(1.08)',
            boxShadow: `0 2px 10px ${alpha(color, 0.4)}`,
            borderColor: color,
          } : {
            transform: 'scale(1.08)',
            boxShadow: `0 2px 8px ${alpha(color, 0.3)}`,
          },
        }}
      >
        {nota}
      </Box>
    </Tooltip>
  );
};

// ==================== COMPONENTE PRINCIPAL ====================
export default function AdminNotasPage() {
  const { isDark, primary, primaryEnd, gradBg, theme } = usePalette();

  // Academic data
  const {
    paralelos,
    grados,
    turnos,
    niveles,
    periodos: periodosAcademicos,
    periodoActivo,
    loading: loadingAcademicos,
  } = useAcademicos({
    todosLosPeriodos: true,
  });

  // Filtro de Gestión / Periodo Académico
  const [periodoSeleccionadoId, setPeriodoSeleccionadoId] = useState<number | null>(null);

  // Inicializar gestión seleccionada con el periodo activo al cargar
  useEffect(() => {
    if (periodoActivo && !periodoSeleccionadoId) {
      setPeriodoSeleccionadoId(periodoActivo.id);
    }
  }, [periodoActivo, periodoSeleccionadoId]);

  // Filtros de curso
  const [turnoFiltro, setTurnoFiltro] = useState<number | 'todos'>('todos');
  const [nivelFiltro, setNivelFiltro] = useState<number | 'todos'>('todos');
  const [gradoFiltro, setGradoFiltro] = useState<number | 'todos'>('todos');
  const [paraleloSeleccionadoId, setParaleloSeleccionadoId] = useState<number | null>(null);

  // Determinar año académico en cuestión
  const anioSeleccionado = useMemo(() => {
    if (periodoSeleccionadoId) {
      const p = periodosAcademicos.find(item => item.id === periodoSeleccionadoId) ||
                (periodoActivo?.id === periodoSeleccionadoId ? periodoActivo : null);
      if (p?.fecha_inicio) {
        const y = new Date(p.fecha_inicio).getFullYear();
        if (!isNaN(y)) return y;
      }
      if (p?.codigo) {
        const match = p.codigo.match(/\b(20\d{2})\b/);
        if (match) return parseInt(match[1]);
      }
      if (p?.nombre) {
        const match = p.nombre.match(/\b(20\d{2})\b/);
        if (match) return parseInt(match[1]);
      }
    }
    if (periodoActivo) {
      if (periodoActivo.fecha_inicio) {
        const y = new Date(periodoActivo.fecha_inicio).getFullYear();
        if (!isNaN(y)) return y;
      }
      if (periodoActivo.codigo) {
        const match = periodoActivo.codigo.match(/\b(20\d{2})\b/);
        if (match) return parseInt(match[1]);
      }
      if (periodoActivo.nombre) {
        const match = periodoActivo.nombre.match(/\b(20\d{2})\b/);
        if (match) return parseInt(match[1]);
      }
    }
    return new Date().getFullYear();
  }, [periodoSeleccionadoId, periodosAcademicos, periodoActivo]);

  // Período activo (T1, T2, T3 o 'anual')
  const [tabPeriodo, setTabPeriodo] = useState<number | 'anual'>('anual');

  // Modo de visualización: 'sabana' (matriz) o 'boletin' (individual tipo padres)
  const [modoVista, setModoVista] = useState<'sabana' | 'boletin'>('sabana');

  // Datos del curso cargados desde backend
  const [cursoData, setCursoData] = useState<CursoNotasData | null>(null);
  const [loadingCurso, setLoadingCurso] = useState(false);
  const [errorCurso, setErrorCurso] = useState<string | null>(null);

  // Búsqueda y filtros dentro de la tabla
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'aprobado' | 'en_riesgo' | 'reprobado'>('todos');

  // Estudiante activo para el modo boletín
  const [estudianteActivoId, setEstudianteActivoId] = useState<number | null>(null);

  // Modal rápido de boletín al hacer click en fila de la sábana
  const [modalEstudiante, setModalEstudiante] = useState<EstudianteCursoNotas | null>(null);

  const { enqueueSnackbar } = useSnackbar();

  // Estado del modal de edición de notas
  const [modalEditar, setModalEditar] = useState<{
    open: boolean;
    estudiante: EstudianteCursoNotas | null;
    materia: MateriaCursoInfo | null;
    periodoId: number;
    notaInput: string;
    justificacion: string;
    guardando: boolean;
    error: string | null;
  }>({
    open: false,
    estudiante: null,
    materia: null,
    periodoId: 0,
    notaInput: '',
    justificacion: '',
    guardando: false,
    error: null,
  });

  // Abrir editor para un estudiante, materia y periodo específicos
  const handleAbrirEditorNota = (params: {
    estudiante: EstudianteCursoNotas;
    materia?: MateriaCursoInfo;
    periodoId?: number;
  }) => {
    if (!cursoData) return;
    const est = params.estudiante;
    const mat = params.materia || cursoData.materias[0] || null;
    if (!mat) return;

    const defaultPeriodoId =
      params.periodoId ||
      (tabPeriodo !== 'anual' ? (tabPeriodo as number) : (cursoData.periodos[0]?.id || 1));

    const tri = est.trimestres.find(t => t.periodo_id === defaultPeriodoId);
    const mTri = tri?.materias.find(m => m.grado_materia_id === mat.grado_materia_id);
    const notaActual = mTri?.nota_final != null ? String(mTri.nota_final) : '';

    setModalEditar({
      open: true,
      estudiante: est,
      materia: mat,
      periodoId: defaultPeriodoId,
      notaInput: notaActual,
      justificacion: '',
      guardando: false,
      error: null,
    });
  };

  // Cambiar materia dentro del modal de edición
  const handleCambiarMateriaModal = (nuevaMateriaId: number) => {
    if (!cursoData || !modalEditar.estudiante) return;
    const nuevaMat = cursoData.materias.find(m => m.materia_id === nuevaMateriaId) || null;
    if (!nuevaMat) return;

    const tri = modalEditar.estudiante.trimestres.find(t => t.periodo_id === modalEditar.periodoId);
    const mTri = tri?.materias.find(m => m.grado_materia_id === nuevaMat.grado_materia_id);
    const notaActual = mTri?.nota_final != null ? String(mTri.nota_final) : '';

    setModalEditar(prev => ({
      ...prev,
      materia: nuevaMat,
      notaInput: notaActual,
      error: null,
    }));
  };

  // Cambiar periodo dentro del modal de edición
  const handleCambiarPeriodoModal = (nuevoPeriodoId: number) => {
    if (!cursoData || !modalEditar.estudiante || !modalEditar.materia) return;
    const tri = modalEditar.estudiante.trimestres.find(t => t.periodo_id === nuevoPeriodoId);
    const mTri = tri?.materias.find(m => m.grado_materia_id === modalEditar.materia!.grado_materia_id);
    const notaActual = mTri?.nota_final != null ? String(mTri.nota_final) : '';

    setModalEditar(prev => ({
      ...prev,
      periodoId: nuevoPeriodoId,
      notaInput: notaActual,
      error: null,
    }));
  };

  // Guardar calificación manual
  const handleGuardarNota = async () => {
    if (!modalEditar.estudiante || !modalEditar.materia || !modalEditar.periodoId) return;

    const notaNum = parseFloat(modalEditar.notaInput);
    if (isNaN(notaNum) || notaNum < 0 || notaNum > 100) {
      setModalEditar(prev => ({ ...prev, error: 'La calificación debe ser un valor numérico entre 0 y 100' }));
      return;
    }

    setModalEditar(prev => ({ ...prev, guardando: true, error: null }));
    try {
      await actualizarNotaManual({
        matricula_id: modalEditar.estudiante.matricula_id,
        grado_materia_id: modalEditar.materia.grado_materia_id,
        periodo_evaluacion_id: modalEditar.periodoId,
        nota_manual: Math.round(notaNum * 100) / 100,
        justificacion_manual: modalEditar.justificacion.trim() || undefined,
      });

      enqueueSnackbar('Calificación guardada y promedios recalculados exitosamente', {
        variant: 'success',
      });

      // Recargar datos del curso para actualizar todos los promedios
      await cargarNotas();

      // Cerrar modal
      setModalEditar(prev => ({ ...prev, open: false, guardando: false }));
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error al guardar la calificación';
      setModalEditar(prev => ({ ...prev, error: msg, guardando: false }));
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };


  // Filtrar lista de paralelos disponibles según año/gestión, turno, nivel y grado
  const paralelosFiltrados = useMemo(() => {
    return paralelos.filter(p => {
      // ⚠️ Filtrar estrictamente por año académico de la gestión en cuestión
      if (p.anio && Number(p.anio) !== Number(anioSeleccionado)) return false;
      if (turnoFiltro !== 'todos' && p.turno_id !== turnoFiltro) return false;
      if (gradoFiltro !== 'todos' && p.grado_id !== gradoFiltro) return false;
      if (nivelFiltro !== 'todos') {
        const grado = grados.find(g => g.id === p.grado_id);
        if (grado && grado.nivel_academico_id !== nivelFiltro) return false;
      }
      return true;
    });
  }, [paralelos, anioSeleccionado, turnoFiltro, nivelFiltro, gradoFiltro, grados]);

  // Autoseleccionar primer paralelo disponible si no hay uno seleccionado o no pertenece al filtro
  useEffect(() => {
    if (!paraleloSeleccionadoId && paralelosFiltrados.length > 0) {
      setParaleloSeleccionadoId(paralelosFiltrados[0].id);
    } else if (paraleloSeleccionadoId && !paralelosFiltrados.some(p => p.id === paraleloSeleccionadoId)) {
      if (paralelosFiltrados.length > 0) {
        setParaleloSeleccionadoId(paralelosFiltrados[0].id);
      } else {
        setParaleloSeleccionadoId(null);
        setCursoData(null);
      }
    }
  }, [paralelosFiltrados, paraleloSeleccionadoId]);

  // Cargar notas del curso cuando cambie el paralelo o la gestión
  const cargarNotas = useCallback(async () => {
    if (!paraleloSeleccionadoId) return;
    setLoadingCurso(true);
    setErrorCurso(null);
    try {
      const data = await getNotasCurso(paraleloSeleccionadoId, periodoSeleccionadoId || periodoActivo?.id);
      setCursoData(data);
      if (data.estudiantes.length > 0) {
        setEstudianteActivoId(prev => {
          if (prev && data.estudiantes.some(e => e.estudiante_id === prev)) return prev;
          return data.estudiantes[0].estudiante_id;
        });
      } else {
        setEstudianteActivoId(null);
      }
    } catch (err: any) {
      setErrorCurso(err?.response?.data?.message || 'Error al cargar las calificaciones del curso');
      setCursoData(null);
    } finally {
      setLoadingCurso(false);
    }
  }, [paraleloSeleccionadoId, periodoSeleccionadoId, periodoActivo?.id]);

  useEffect(() => {
    cargarNotas();
  }, [cargarNotas]);

  // Si cambia de gestión o curso, verificar que tabPeriodo exista en el curso
  useEffect(() => {
    if (cursoData && tabPeriodo !== 'anual') {
      const existe = cursoData.periodos.some(p => p.id === tabPeriodo);
      if (!existe) {
        setTabPeriodo(cursoData.periodos[0]?.id || 'anual');
      }
    }
  }, [cursoData, tabPeriodo]);

  // Estudiante activo seleccionado para la vista de boletín
  const estudianteActivo = useMemo(() => {
    if (!cursoData || !estudianteActivoId) return null;
    return cursoData.estudiantes.find(e => e.estudiante_id === estudianteActivoId) || cursoData.estudiantes[0] || null;
  }, [cursoData, estudianteActivoId]);

  // Estudiantes filtrados en la sábana (búsqueda y estado)
  const estudiantesFiltrados = useMemo(() => {
    if (!cursoData) return [];
    let list = cursoData.estudiantes;

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      list = list.filter(e =>
        e.nombre_completo.toLowerCase().includes(q) ||
        e.ci?.toLowerCase().includes(q) ||
        e.codigo?.toLowerCase().includes(q)
      );
    }

    if (filtroEstado !== 'todos') {
      list = list.filter(e => {
        if (filtroEstado === 'aprobado') return e.estado_general === 'aprobado' || e.estado_general === 'regular';
        if (filtroEstado === 'en_riesgo') return e.estado_general === 'en_riesgo';
        if (filtroEstado === 'reprobado') return e.estado_general === 'reprobado';
        return true;
      });
    }

    return list;
  }, [cursoData, busqueda, filtroEstado]);

  // Exportar matriz actual a CSV compatible con Excel
  const handleExportarCSV = () => {
    if (!cursoData || cursoData.estudiantes.length === 0) return;

    const materiasHeaders = cursoData.materias.map(m => `"${m.materia_nombre.replace(/"/g, '""')}"`);
    const headerRow = ['"Nro"', '"CI"', '"Estudiante"', ...materiasHeaders, '"Promedio"', '"Estado"'].join(',');

    const rows = cursoData.estudiantes.map((est, idx) => {
      const notasCols = cursoData.materias.map(mat => {
        if (tabPeriodo === 'anual') {
          const matAnual = est.materias_anuales.find(m => m.grado_materia_id === mat.grado_materia_id);
          return matAnual?.promedio_anual != null ? matAnual.promedio_anual : '';
        } else {
          const tri = est.trimestres.find(t => t.periodo_id === tabPeriodo);
          const matTri = tri?.materias.find(m => m.grado_materia_id === mat.grado_materia_id);
          return matTri?.nota_final != null ? matTri.nota_final : '';
        }
      });

      const prom = tabPeriodo === 'anual'
        ? est.promedio_general_anual ?? ''
        : (est.trimestres.find(t => t.periodo_id === tabPeriodo)?.promedio ?? '');

      return [
        idx + 1,
        `"${est.ci || ''}"`,
        `"${est.nombre_completo.replace(/"/g, '""')}"`,
        ...notasCols,
        prom,
        `"${est.estado_general.toUpperCase()}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headerRow, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const periodoLabel = tabPeriodo === 'anual' ? 'Anual' : `T${tabPeriodo}`;
    a.href = url;
    a.download = `Notas_${cursoData.curso.grado_nombre}_${cursoData.curso.paralelo_nombre}_${periodoLabel}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Convertir los datos de un estudiante para BoletinGeneralAnual
  const materiasAnualesParaBoletin: ResumenMateriaAnual[] = useMemo(() => {
    if (!estudianteActivo) return [];
    return estudianteActivo.materias_anuales.map(m => ({
      materia_nombre: m.materia_nombre,
      materia_codigo: m.materia_codigo,
      nota_minima: m.nota_minima,
      trimestres: m.trimestres.map(t => ({
        periodo_id: t.periodo_id,
        periodo_nombre: t.periodo_nombre,
        periodo_orden: t.periodo_orden,
        nota_final: t.nota_final,
        aprobado: t.aprobado,
      })),
      promedio_anual: m.promedio_anual,
      aprobado_anual: m.aprobado_anual,
      nivel: (m.nivel as any) || getNivelRendimiento(m.promedio_anual),
    }));
  }, [estudianteActivo]);

  // Convertir los datos de un estudiante para BoletinNotas (trimestral)
  const boletinTrimestralParaComponente: ResumenMateriaPadre[] = useMemo(() => {
    if (!estudianteActivo || tabPeriodo === 'anual') return [];
    const tri = estudianteActivo.trimestres.find(t => t.periodo_id === tabPeriodo);
    if (!tri) return [];

    return tri.materias.map(m => ({
      materia_nombre: m.materia_nombre,
      materia_codigo: m.materia_codigo,
      grado_materia_id: m.grado_materia_id,
      nota_final: m.nota_final,
      nota_minima: m.nota_minima,
      aprobado: m.aprobado,
      estado_periodo: m.estado,
      nota_ser: m.nota_ser,
      nota_saber: m.nota_saber,
      nota_hacer: m.nota_hacer,
      nota_auto: m.nota_auto,
      nivel: getNivelRendimiento(m.nota_final),
    }));
  }, [estudianteActivo, tabPeriodo]);

  const statsTrimestralEstudiante = useMemo(() => {
    if (!estudianteActivo || tabPeriodo === 'anual') {
      return { promedio: null, aprobadas: 0, reprobadas: 0, sinNota: 0 };
    }
    const tri = estudianteActivo.trimestres.find(t => t.periodo_id === tabPeriodo);
    return {
      promedio: tri?.promedio ?? null,
      aprobadas: tri?.aprobadas ?? 0,
      reprobadas: tri?.reprobadas ?? 0,
      sinNota: tri?.sin_nota ?? 0,
    };
  }, [estudianteActivo, tabPeriodo]);

  const periodosOrdenados: PeriodoEvaluacion[] = useMemo(() => {
    if (!cursoData) return [];
    return cursoData.periodos.map(p => ({
      id: p.id,
      periodo_academico_id: periodoSeleccionadoId || periodoActivo?.id || 0,
      nombre: p.nombre,
      codigo: p.codigo,
      orden: p.orden,
      fecha_inicio: p.fecha_inicio,
      fecha_fin: p.fecha_fin,
      porcentaje: 0,
      activo: p.activo,
      estado: p.activo ? 'activo' : 'cerrado',
    })) as any as PeriodoEvaluacion[];
  }, [cursoData, periodoSeleccionadoId, periodoActivo]);

  // Navegar al anterior o siguiente estudiante
  const indexEstudianteActual = useMemo(() => {
    if (!cursoData || !estudianteActivo) return -1;
    return cursoData.estudiantes.findIndex(e => e.estudiante_id === estudianteActivo.estudiante_id);
  }, [cursoData, estudianteActivo]);

  const handleEstudiantePrev = () => {
    if (!cursoData || indexEstudianteActual <= 0) return;
    setEstudianteActivoId(cursoData.estudiantes[indexEstudianteActual - 1].estudiante_id);
  };

  const handleEstudianteNext = () => {
    if (!cursoData || indexEstudianteActual >= cursoData.estudiantes.length - 1) return;
    setEstudianteActivoId(cursoData.estudiantes[indexEstudianteActual + 1].estudiante_id);
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 3 }}>
      <Container maxWidth="xl">

        {/* ══ HEADER INSTITUCIONAL ══ */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                flexDirection: { xs: 'column', md: 'row' },
                gap: 2,
                mb: 2.5,
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <SchoolRoundedIcon
                    sx={{ color: primary, fontSize: 36, animation: `${bounce} 2s infinite ease-in-out` }}
                  />
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '1.6rem', sm: '2.1rem', md: '2.5rem' },
                      fontWeight: 800,
                      background: gradBg,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Notas y Calificaciones por Curso
                  </Typography>
                  <Chip
                    label={`Gestión ${anioSeleccionado}`}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      bgcolor: alpha(primary, 0.12),
                      color: primary,
                      border: `1px solid ${alpha(primary, 0.3)}`,
                      borderRadius: 1.5,
                      ml: 1,
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mt: 0.5 }}>
                  Panel general de supervisión de calificaciones finales, consolidados trimestrales y boletines por curso
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadRoundedIcon />}
                  onClick={handleExportarCSV}
                  disabled={!cursoData || cursoData.estudiantes.length === 0}
                  sx={{
                    borderRadius: 2.5,
                    textTransform: 'none',
                    fontWeight: 700,
                    borderColor: alpha(primary, 0.4),
                    color: primary,
                    '&:hover': { borderColor: primary, bgcolor: alpha(primary, 0.08) },
                  }}
                >
                  Exportar CSV
                </Button>

                <Tooltip title="Actualizar notas del curso">
                  <IconButton
                    onClick={cargarNotas}
                    disabled={loadingCurso}
                    size="small"
                    sx={{
                      bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                      border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
                      borderRadius: 2.5,
                      p: 1,
                      '&:hover': {
                        bgcolor: alpha(primary, 0.15),
                        transform: 'rotate(180deg)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <RefreshRoundedIcon sx={{ fontSize: 20, color: primary }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* ══ BARRA DE FILTROS DEL CURSO ══ */}
            <Card
              sx={{
                borderRadius: 3,
                p: 2,
                mb: 3,
                border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                background: isDark
                  ? `linear-gradient(145deg, ${alpha('#fff', 0.04)} 0%, ${alpha('#fff', 0.01)} 100%)`
                  : '#ffffff',
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 18px rgba(0,0,0,0.03)',
              }}
            >
              <Grid container spacing={1.5} alignItems="center">
                {/* Gestión / Año */}
                <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="gestion-label" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      Gestión / Año
                    </InputLabel>
                    <Select
                      labelId="gestion-label"
                      label="Gestión / Año"
                      value={periodoSeleccionadoId || ''}
                      onChange={(e) => setPeriodoSeleccionadoId(Number(e.target.value))}
                      sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                      {periodosAcademicos.map(pa => (
                        <MenuItem key={pa.id} value={pa.id}>
                          {pa.nombre} {pa.activo ? '✨ (Activa)' : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Turno */}
                <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="turno-label" sx={{ fontSize: '0.85rem' }}>Turno</InputLabel>
                    <Select
                      labelId="turno-label"
                      label="Turno"
                      value={turnoFiltro}
                      onChange={(e) => setTurnoFiltro(e.target.value as any)}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="todos">Todos los Turnos</MenuItem>
                      {turnos.map(t => (
                        <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Nivel */}
                <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="nivel-label" sx={{ fontSize: '0.85rem' }}>Nivel</InputLabel>
                    <Select
                      labelId="nivel-label"
                      label="Nivel"
                      value={nivelFiltro}
                      onChange={(e) => setNivelFiltro(e.target.value as any)}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="todos">Todos los Niveles</MenuItem>
                      {niveles.map(n => (
                        <MenuItem key={n.id} value={n.id}>{n.nombre}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Grado */}
                <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="grado-label" sx={{ fontSize: '0.85rem' }}>Grado</InputLabel>
                    <Select
                      labelId="grado-label"
                      label="Grado"
                      value={gradoFiltro}
                      onChange={(e) => setGradoFiltro(e.target.value as any)}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="todos">Todos los Grados</MenuItem>
                      {grados.map(g => (
                        <MenuItem key={g.id} value={g.id}>{g.nombre}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Curso / Paralelo Activo */}
                <Grid size={{ xs: 12, md: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="paralelo-label" sx={{ fontSize: '0.85rem', fontWeight: 700 }}>
                      Curso y Paralelo
                    </InputLabel>
                    <Select
                      labelId="paralelo-label"
                      label="Curso y Paralelo"
                      value={paraleloSeleccionadoId || ''}
                      onChange={(e) => setParaleloSeleccionadoId(Number(e.target.value))}
                      disabled={paralelosFiltrados.length === 0}
                      sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                      {paralelosFiltrados.length === 0 ? (
                        <MenuItem value="" disabled>
                          Sin cursos para esta gestión
                        </MenuItem>
                      ) : (
                        paralelosFiltrados.map(p => {
                          const grado = grados.find(g => g.id === p.grado_id);
                          const turno = turnos.find(t => t.id === p.turno_id);
                          return (
                            <MenuItem key={p.id} value={p.id}>
                              <strong>{grado?.nombre || 'Grado'} "{p.nombre}"</strong>
                              <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                ({turno?.nombre || 'General'})
                              </Typography>
                            </MenuItem>
                          );
                        })
                      )}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Chips rápidos de cursos */}
              <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`, display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', fontWeight: 700, mr: 1, whiteSpace: 'nowrap' }}>
                  Cursos rápidos:
                </Typography>
                {paralelosFiltrados.length === 0 ? (
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', py: 0.5 }}>
                    No hay paralelos disponibles para los filtros seleccionados en la gestión {anioSeleccionado}.
                  </Typography>
                ) : (
                  paralelosFiltrados.slice(0, 8).map(p => {
                    const grado = grados.find(g => g.id === p.grado_id);
                    const turno = turnos.find(t => t.id === p.turno_id);
                    const activo = p.id === paraleloSeleccionadoId;
                    return (
                      <Chip
                        key={p.id}
                        size="small"
                        label={`${grado?.nombre || ''} "${p.nombre}" · ${turno?.nombre || ''}`}
                        onClick={() => setParaleloSeleccionadoId(p.id)}
                        sx={{
                          cursor: 'pointer',
                          fontWeight: activo ? 800 : 500,
                          fontSize: 11.5,
                          borderRadius: 2,
                          bgcolor: activo ? alpha(primary, isDark ? 0.25 : 0.12) : alpha(isDark ? '#fff' : '#000', 0.04),
                          color: activo ? primary : 'text.secondary',
                          border: `1px solid ${activo ? primary : alpha(isDark ? '#fff' : '#000', 0.08)}`,
                          '&:hover': { borderColor: primary, bgcolor: alpha(primary, 0.1) },
                        }}
                      />
                    );
                  })
                )}
              </Box>
            </Card>

            {/* ══ SELECTOR DE TRIMESTRE & MODO DE VISTA (Estilo idéntico al portal de padres) ══ */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                mb: 3,
              }}
            >
              {/* Pestañas de Trimestres */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                {cursoData?.periodos.map(p => {
                  const activo = tabPeriodo === p.id;
                  return (
                    <Chip
                      key={p.id}
                      label={p.nombre}
                      onClick={() => setTabPeriodo(p.id)}
                      sx={{
                        height: 36,
                        fontWeight: 700,
                        fontSize: 13,
                        borderRadius: 2.5,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        ...(activo
                          ? {
                            background: gradBg,
                            color: isDark ? '#000' : '#fff',
                            boxShadow: `0 4px 12px ${alpha(primary, 0.35)}`,
                            border: 'none',
                          }
                          : {
                            bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                            color: 'text.secondary',
                            border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
                            '&:hover': { bgcolor: alpha(primary, isDark ? 0.15 : 0.08), color: primary },
                          }),
                      }}
                    />
                  );
                })}

                {/* Tab General (3 Trimestres) */}
                <Chip
                  icon={
                    <AutoAwesomeMosaicRoundedIcon
                      sx={{
                        fontSize: '16px !important',
                        color: tabPeriodo === 'anual' ? (isDark ? '#000 !important' : '#fff !important') : primary,
                      }}
                    />
                  }
                  label="General (3 Trimestres)"
                  onClick={() => setTabPeriodo('anual')}
                  sx={{
                    height: 36,
                    fontWeight: 800,
                    fontSize: 13,
                    borderRadius: 2.5,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    ...(tabPeriodo === 'anual'
                      ? {
                        background: gradBg,
                        color: isDark ? '#000' : '#fff',
                        boxShadow: `0 4px 12px ${alpha(primary, 0.35)}`,
                        border: 'none',
                      }
                      : {
                        bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                        color: 'text.secondary',
                        border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
                        '&:hover': { bgcolor: alpha(primary, isDark ? 0.15 : 0.08), color: primary },
                      }),
                  }}
                />
              </Box>

              {/* Selector de Modo: Sábana vs Boletín */}
              <ToggleButtonGroup
                value={modoVista}
                exclusive
                onChange={(_, val) => val && setModoVista(val)}
                size="small"
                sx={{
                  bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03),
                  borderRadius: 2.5,
                  p: 0.5,
                  border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                  '& .MuiToggleButton-root': {
                    border: 'none',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    px: 1.5,
                    py: 0.5,
                    '&.Mui-selected': {
                      background: alpha(primary, isDark ? 0.2 : 0.12),
                      color: primary,
                      fontWeight: 800,
                    },
                  },
                }}
              >
                <ToggleButton value="sabana">
                  <GridViewRoundedIcon sx={{ fontSize: 18, mr: 0.75 }} />
                  Sábana del Curso
                </ToggleButton>
                <ToggleButton value="boletin">
                  <PersonRoundedIcon sx={{ fontSize: 18, mr: 0.75 }} />
                  Boletín por Estudiante
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
        </Fade>

        {/* ══ CONTENIDO DINÁMICO ══ */}
        {loadingCurso ? (
          <Stack spacing={2}>
            <Grid container spacing={1.5}>
              {[1, 2, 3, 4].map(i => (
                <Grid size={{ xs: 6, sm: 3 }} key={i}>
                  <Skeleton variant="rounded" height={88} sx={{ borderRadius: 3 }} />
                </Grid>
              ))}
            </Grid>
            <Skeleton variant="rounded" height={450} sx={{ borderRadius: 3 }} />
          </Stack>
        ) : errorCurso ? (
          <Paper
            sx={{
              p: 5,
              textAlign: 'center',
              borderRadius: 3,
              border: `1px dashed ${alpha('#ef4444', 0.3)}`,
              bgcolor: alpha('#ef4444', 0.04),
            }}
          >
            <Typography variant="h6" color="error" fontWeight={700} gutterBottom>
              {errorCurso}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Verifique que el curso seleccionado cuente con asignaciones activas y estudiantes matriculados.
            </Typography>
          </Paper>
        ) : !cursoData || cursoData.estudiantes.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 3,
              border: `2px dashed ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
              bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
            }}
          >
            <SchoolRoundedIcon sx={{ fontSize: 50, color: 'text.disabled', mb: 1.5 }} />
            <Typography variant="h6" fontWeight={700} color="text.primary" gutterBottom>
              Sin estudiantes matriculados en este curso
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Seleccione otro curso o paralelo desde los filtros superiores para consultar las notas.
            </Typography>
          </Paper>
        ) : (
          <Fade in timeout={600}>
            <Box sx={{ animation: `${fadeSlideUp} 0.4s ease-out` }}>

              {/* ────────────────────────────────────────── */}
              {/* MODO 1: VISTA SÁBANA (CONSOLIDADO DEL CURSO) */}
              {/* ────────────────────────────────────────── */}
              {modoVista === 'sabana' && (
                <Box>
                  {/* KPI Cards del Curso */}
                  <Grid container spacing={1.5} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Card
                        sx={{
                          borderRadius: 3,
                          p: 2,
                          border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                          background: isDark
                            ? `linear-gradient(135deg, ${alpha('#3b82f6', 0.15)} 0%, transparent 100%)`
                            : `linear-gradient(135deg, ${alpha('#3b82f6', 0.08)} 0%, #fff 100%)`,
                        }}
                      >
                        <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Total Estudiantes
                        </Typography>
                        <Typography variant="h4" fontWeight={900} sx={{ mt: 0.5, color: '#3b82f6' }}>
                          {cursoData.estadisticas.total_estudiantes}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {cursoData.curso.grado_nombre} "{cursoData.curso.paralelo_nombre}" · {cursoData.curso.turno_nombre}
                        </Typography>
                      </Card>
                    </Grid>

                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Card
                        sx={{
                          borderRadius: 3,
                          p: 2,
                          border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                          background: isDark
                            ? `linear-gradient(135deg, ${alpha(primary, 0.18)} 0%, transparent 100%)`
                            : `linear-gradient(135deg, ${alpha(primary, 0.1)} 0%, #fff 100%)`,
                        }}
                      >
                        <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Promedio del Curso
                        </Typography>
                        <Typography variant="h4" fontWeight={900} sx={{ mt: 0.5, color: primary }}>
                          {tabPeriodo === 'anual'
                            ? (cursoData.estadisticas.promedio_general_curso ?? '—')
                            : (cursoData.estadisticas.stats_por_periodo.find(p => p.periodo_id === tabPeriodo)?.promedio_curso ?? '—')}
                          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5, fontWeight: 700 }}>
                            /100
                          </Typography>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {tabPeriodo === 'anual' ? 'Promedio anual acumulado' : 'Promedio en el trimestre activo'}
                        </Typography>
                      </Card>
                    </Grid>

                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Card
                        sx={{
                          borderRadius: 3,
                          p: 2,
                          border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                          background: isDark
                            ? `linear-gradient(135deg, ${alpha('#10b981', 0.15)} 0%, transparent 100%)`
                            : `linear-gradient(135deg, ${alpha('#10b981', 0.08)} 0%, #fff 100%)`,
                        }}
                      >
                        <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Aprobados
                        </Typography>
                        <Typography variant="h4" fontWeight={900} sx={{ mt: 0.5, color: '#10b981' }}>
                          {cursoData.estadisticas.aprobados_total}
                          <Typography component="span" variant="caption" sx={{ ml: 0.75, fontWeight: 700, color: '#10b981' }}>
                            ({cursoData.estadisticas.total_estudiantes > 0
                              ? Math.round((cursoData.estadisticas.aprobados_total / cursoData.estadisticas.total_estudiantes) * 100)
                              : 0}%)
                          </Typography>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Estudiantes con rendimiento regular o excelente
                        </Typography>
                      </Card>
                    </Grid>

                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Card
                        sx={{
                          borderRadius: 3,
                          p: 2,
                          border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                          background: isDark
                            ? `linear-gradient(135deg, ${alpha('#ef4444', 0.15)} 0%, transparent 100%)`
                            : `linear-gradient(135deg, ${alpha('#ef4444', 0.08)} 0%, #fff 100%)`,
                        }}
                      >
                        <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          En Riesgo / Reprobados
                        </Typography>
                        <Typography variant="h4" fontWeight={900} sx={{ mt: 0.5, color: '#ef4444' }}>
                          {cursoData.estadisticas.en_riesgo_total + cursoData.estadisticas.reprobados_total}
                          <Typography component="span" variant="caption" sx={{ ml: 0.75, fontWeight: 700, color: '#ef4444' }}>
                            ({cursoData.estadisticas.en_riesgo_total} riesgo · {cursoData.estadisticas.reprobados_total} repr.)
                          </Typography>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Requieren acompañamiento académico
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Barra de Búsqueda y Filtros de la Tabla */}
                  <Box sx={{ mb: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                    <TextField
                      size="small"
                      placeholder="Buscar estudiante por nombre, apellido o CI..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      sx={{
                        width: { xs: '100%', sm: 320 },
                        '& .MuiOutlinedInput-root': { borderRadius: 2.5 },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchRoundedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                      <Chip
                        size="small"
                        label={`Todos (${cursoData.estudiantes.length})`}
                        onClick={() => setFiltroEstado('todos')}
                        sx={{
                          fontWeight: 700,
                          borderRadius: 2,
                          bgcolor: filtroEstado === 'todos' ? alpha(primary, 0.2) : 'transparent',
                          color: filtroEstado === 'todos' ? primary : 'text.secondary',
                          border: `1px solid ${filtroEstado === 'todos' ? primary : alpha(theme.palette.divider, 0.5)}`,
                        }}
                      />
                      <Chip
                        size="small"
                        label="Aprobados"
                        onClick={() => setFiltroEstado('aprobado')}
                        sx={{
                          fontWeight: 700,
                          borderRadius: 2,
                          bgcolor: filtroEstado === 'aprobado' ? alpha('#10b981', 0.2) : 'transparent',
                          color: filtroEstado === 'aprobado' ? '#10b981' : 'text.secondary',
                          border: `1px solid ${filtroEstado === 'aprobado' ? '#10b981' : alpha(theme.palette.divider, 0.5)}`,
                        }}
                      />
                      <Chip
                        size="small"
                        label="En Riesgo"
                        onClick={() => setFiltroEstado('en_riesgo')}
                        sx={{
                          fontWeight: 700,
                          borderRadius: 2,
                          bgcolor: filtroEstado === 'en_riesgo' ? alpha('#f59e0b', 0.2) : 'transparent',
                          color: filtroEstado === 'en_riesgo' ? '#f59e0b' : 'text.secondary',
                          border: `1px solid ${filtroEstado === 'en_riesgo' ? '#f59e0b' : alpha(theme.palette.divider, 0.5)}`,
                        }}
                      />
                      <Chip
                        size="small"
                        label="Reprobados"
                        onClick={() => setFiltroEstado('reprobado')}
                        sx={{
                          fontWeight: 700,
                          borderRadius: 2,
                          bgcolor: filtroEstado === 'reprobado' ? alpha('#ef4444', 0.2) : 'transparent',
                          color: filtroEstado === 'reprobado' ? '#ef4444' : 'text.secondary',
                          border: `1px solid ${filtroEstado === 'reprobado' ? '#ef4444' : alpha(theme.palette.divider, 0.5)}`,
                        }}
                      />
                    </Box>
                  </Box>

                  {/* ══ TABLA SÁBANA CONSOLIDADA ══ */}
                  <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                      background: isDark
                        ? `linear-gradient(145deg, ${alpha('#fff', 0.03)} 0%, ${alpha('#fff', 0.01)} 100%)`
                        : '#ffffff',
                      boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 18px rgba(0,0,0,0.04)',
                      overflowX: 'auto',
                    }}
                  >
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow
                          sx={{
                            '& th': {
                              bgcolor: isDark ? '#181b20' : '#f8fafc',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              color: 'text.secondary',
                              py: 1.5,
                              letterSpacing: '0.04em',
                              borderBottom: `2px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                            },
                          }}
                        >
                          <TableCell sx={{ width: 40, pl: 2 }}>#</TableCell>
                          <TableCell sx={{ minWidth: 220 }}>Estudiante</TableCell>
                          {cursoData.materias.map(mat => (
                            <TableCell key={mat.materia_id} align="center" sx={{ minWidth: 110 }}>
                              <Tooltip title={mat.docente_nombre ? `Docente: ${mat.docente_nombre}` : mat.materia_nombre} arrow>
                                <Box sx={{ cursor: 'pointer' }}>
                                  <Typography variant="caption" fontWeight={800} display="block" noWrap sx={{ maxWidth: 110 }}>
                                    {mat.materia_nombre}
                                  </Typography>
                                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9.5 }}>
                                    Mín: {mat.nota_minima_aprobacion}
                                  </Typography>
                                </Box>
                              </Tooltip>
                            </TableCell>
                          ))}
                          <TableCell align="center" sx={{ minWidth: 90, color: primary, fontWeight: 900 }}>
                            {tabPeriodo === 'anual' ? 'Prom. Anual' : 'Promedio'}
                          </TableCell>
                          <TableCell align="center" sx={{ minWidth: 90 }}>
                            Estado
                          </TableCell>
                          <TableCell align="center" sx={{ minWidth: 95, pr: 2 }}>
                            Acción
                          </TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {estudiantesFiltrados.map((est, idx) => {
                          const promAMostrar = tabPeriodo === 'anual'
                            ? est.promedio_general_anual
                            : est.trimestres.find(t => t.periodo_id === tabPeriodo)?.promedio;

                          const estadoColor =
                            est.estado_general === 'aprobado' ? '#10b981' :
                              est.estado_general === 'en_riesgo' ? '#f59e0b' :
                                est.estado_general === 'reprobado' ? '#ef4444' :
                                  primary;

                          return (
                            <TableRow
                              key={est.estudiante_id}
                              sx={{
                                '& td': {
                                  py: 1.1,
                                  borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.05)}`,
                                },
                                '&:hover': {
                                  bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.015),
                                },
                              }}
                            >
                              <TableCell sx={{ pl: 2, fontWeight: 700, color: 'text.disabled', fontSize: 12 }}>
                                {idx + 1}
                              </TableCell>

                              {/* Estudiante Avatar + Nombre */}
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                  <Avatar
                                    src={est.foto_url || undefined}
                                    sx={{
                                      width: 30,
                                      height: 30,
                                      fontSize: '0.72rem',
                                      fontWeight: 800,
                                      bgcolor: alpha(primary, 0.2),
                                      color: primary,
                                    }}
                                  >
                                    {est.nombres.charAt(0)}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.85rem', lineHeight: 1.2 }}>
                                      {est.nombre_completo}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                                      CI: {est.ci || est.codigo || '—'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>

                              {/* Notas de cada materia */}
                              {cursoData.materias.map(mat => {
                                let notaAMostrar: number | null = null;
                                let aprobado: boolean | null = null;

                                if (tabPeriodo === 'anual') {
                                  const mAnual = est.materias_anuales.find(m => m.grado_materia_id === mat.grado_materia_id);
                                  notaAMostrar = mAnual?.promedio_anual ?? null;
                                  aprobado = mAnual?.aprobado_anual ?? null;
                                } else {
                                  const tri = est.trimestres.find(t => t.periodo_id === tabPeriodo);
                                  const mTri = tri?.materias.find(m => m.grado_materia_id === mat.grado_materia_id);
                                  notaAMostrar = mTri?.nota_final ?? null;
                                  aprobado = mTri?.aprobado ?? null;
                                }

                                return (
                                  <TableCell key={mat.materia_id} align="center">
                                    <ChipNotaMatriz
                                      nota={notaAMostrar}
                                      aprobado={aprobado}
                                      minima={Number(mat.nota_minima_aprobacion || 51)}
                                      isDark={isDark}
                                      editable={true}
                                      onClick={() => handleAbrirEditorNota({
                                        estudiante: est,
                                        materia: mat,
                                        periodoId: tabPeriodo === 'anual' ? undefined : (tabPeriodo as number),
                                      })}
                                    />
                                  </TableCell>
                                );
                              })}

                              {/* Promedio General */}
                              <TableCell align="center">
                                {promAMostrar != null ? (
                                  <Box
                                    sx={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      minWidth: 46,
                                      height: 30,
                                      px: 1,
                                      borderRadius: 2,
                                      background: isDark
                                        ? `linear-gradient(135deg, ${alpha(primary, 0.3)} 0%, ${alpha(primary, 0.1)} 100%)`
                                        : `linear-gradient(135deg, ${alpha(primary, 0.2)} 0%, ${alpha(primary, 0.08)} 100%)`,
                                      border: `1.5px solid ${alpha(primary, 0.4)}`,
                                      color: primary,
                                      fontWeight: 900,
                                      fontSize: '0.88rem',
                                    }}
                                  >
                                    {promAMostrar}
                                  </Box>
                                ) : (
                                  <Typography variant="caption" color="text.disabled">—</Typography>
                                )}
                              </TableCell>

                              {/* Estado General */}
                              <TableCell align="center">
                                <Chip
                                  size="small"
                                  label={
                                    est.estado_general === 'aprobado' ? 'Aprobado' :
                                      est.estado_general === 'en_riesgo' ? 'En Riesgo' :
                                        est.estado_general === 'reprobado' ? 'Reprobado' :
                                          'Regular'
                                  }
                                  sx={{
                                    height: 22,
                                    fontSize: '0.68rem',
                                    fontWeight: 800,
                                    bgcolor: alpha(estadoColor, isDark ? 0.2 : 0.1),
                                    color: estadoColor,
                                    border: `1px solid ${alpha(estadoColor, 0.35)}`,
                                    borderRadius: 1.5,
                                  }}
                                />
                              </TableCell>

                              {/* Botones de Acción */}
                              <TableCell align="center" sx={{ pr: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
                                  <Tooltip title="Editar calificaciones del estudiante">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleAbrirEditorNota({ estudiante: est })}
                                      sx={{
                                        color: primary,
                                        bgcolor: alpha(primary, 0.1),
                                        '&:hover': { bgcolor: alpha(primary, 0.22) },
                                      }}
                                    >
                                      <EditRoundedIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Ver boletín detallado (estilo padre)">
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        setEstudianteActivoId(est.estudiante_id);
                                        setModalEstudiante(est);
                                      }}
                                      sx={{
                                        color: 'text.secondary',
                                        bgcolor: alpha(isDark ? '#fff' : '#000', 0.05),
                                        '&:hover': { bgcolor: alpha(primary, 0.15), color: primary },
                                      }}
                                    >
                                      <VisibilityRoundedIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* ────────────────────────────────────────── */}
              {/* MODO 2: VISTA BOLETÍN (IDÉNTICO A PADRES) */}
              {/* ────────────────────────────────────────── */}
              {modoVista === 'boletin' && estudianteActivo && (
                <Box>
                  {/* Selector de Estudiante estilo carrusel interactivo */}
                  <Card
                    sx={{
                      borderRadius: 3,
                      p: 2,
                      mb: 3,
                      border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                      background: isDark
                        ? `linear-gradient(145deg, ${alpha('#fff', 0.03)} 0%, ${alpha('#fff', 0.01)} 100%)`
                        : '#ffffff',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonRoundedIcon sx={{ color: primary, fontSize: 22 }} />
                        <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                          Seleccionar Estudiante del Curso ({indexEstudianteActual + 1} de {cursoData.estudiantes.length})
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={handleEstudiantePrev}
                          disabled={indexEstudianteActual <= 0}
                          sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}
                        >
                          <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={handleEstudianteNext}
                          disabled={indexEstudianteActual >= cursoData.estudiantes.length - 1}
                          sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}
                        >
                          <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Chips de estudiantes del curso */}
                    <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5 }}>
                      {cursoData.estudiantes.map((est) => {
                        const activo = est.estudiante_id === estudianteActivo.estudiante_id;
                        return (
                          <Box
                            key={est.estudiante_id}
                            onClick={() => setEstudianteActivoId(est.estudiante_id)}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              px: 1.5,
                              py: 0.75,
                              borderRadius: 2.5,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              transition: 'all 0.2s ease',
                              border: `2px solid ${activo ? primary : alpha(isDark ? '#fff' : '#000', 0.08)}`,
                              bgcolor: activo
                                ? alpha(primary, isDark ? 0.2 : 0.1)
                                : alpha(isDark ? '#fff' : '#000', 0.03),
                              '&:hover': {
                                borderColor: primary,
                                bgcolor: alpha(primary, isDark ? 0.15 : 0.06),
                              },
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 26,
                                height: 26,
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                bgcolor: activo ? primary : alpha(primary, 0.2),
                                color: activo ? (isDark ? '#000' : '#fff') : primary,
                              }}
                            >
                              {est.nombres.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="caption" fontWeight={700} sx={{ color: activo ? primary : 'text.primary', display: 'block', lineHeight: 1.2 }}>
                                {est.nombre_completo}
                              </Typography>
                              <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', lineHeight: 1 }}>
                                Prom: {est.promedio_general_anual ?? '—'}
                              </Typography>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Card>

                  {/* Banner del Estudiante Activo */}
                  <Box
                    sx={{
                      p: 2,
                      mb: 3,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 1.5,
                      bgcolor: alpha(primary, isDark ? 0.12 : 0.06),
                      border: `1px solid ${alpha(primary, 0.25)}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        src={estudianteActivo.foto_url || undefined}
                        sx={{
                          width: 44,
                          height: 44,
                          fontWeight: 800,
                          fontSize: '1rem',
                          bgcolor: primary,
                          color: isDark ? '#000' : '#fff',
                        }}
                      >
                        {estudianteActivo.nombres.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                          {estudianteActivo.nombre_completo}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                          CI: <strong>{estudianteActivo.ci || '—'}</strong> · Curso: <strong>{cursoData.curso.grado_nombre} "{cursoData.curso.paralelo_nombre}"</strong> · Turno: <strong>{cursoData.curso.turno_nombre}</strong>
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditRoundedIcon />}
                        onClick={() => handleAbrirEditorNota({ estudiante: estudianteActivo })}
                        sx={{
                          borderRadius: 2.5,
                          fontWeight: 700,
                          textTransform: 'none',
                          borderColor: alpha(primary, 0.4),
                          color: primary,
                          '&:hover': { borderColor: primary, bgcolor: alpha(primary, 0.1) },
                        }}
                      >
                        Editar Calificaciones
                      </Button>
                      <Chip
                        icon={<BarChartRoundedIcon sx={{ fontSize: '18px !important' }} />}
                        label={
                          tabPeriodo === 'anual'
                            ? `Promedio Anual: ${estudianteActivo.promedio_general_anual ?? '—'}`
                            : `Promedio Trimestre: ${statsTrimestralEstudiante.promedio ?? '—'}`
                        }
                        sx={{
                          height: 32,
                          fontWeight: 800,
                          fontSize: 13,
                          background: gradBg,
                          color: isDark ? '#000' : '#fff',
                          boxShadow: `0 3px 10px ${alpha(primary, 0.3)}`,
                          border: 'none',
                          '& .MuiChip-icon': { color: isDark ? '#000' : '#fff' },
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Renderizado idéntico al portal de padres */}
                  {tabPeriodo === 'anual' ? (
                    <BoletinGeneralAnual
                      materiasAnuales={materiasAnualesParaBoletin}
                      periodos={periodosOrdenados}
                      isLoading={false}
                      promedioGeneral={estudianteActivo.promedio_general_anual}
                      aprobadas={estudianteActivo.aprobadas_anual}
                      reprobadas={estudianteActivo.reprobadas_anual}
                      sinNota={estudianteActivo.sin_nota_anual}
                    />
                  ) : (
                    <BoletinNotas
                      boletin={boletinTrimestralParaComponente}
                      isLoading={false}
                      aprobadas={statsTrimestralEstudiante.aprobadas}
                      reprobadas={statsTrimestralEstudiante.reprobadas}
                      sinNota={statsTrimestralEstudiante.sinNota}
                      promedio={statsTrimestralEstudiante.promedio}
                      matriculaId={estudianteActivo.matricula_id}
                      periodoEvaluacionId={tabPeriodo}
                    />
                  )}
                </Box>
              )}

            </Box>
          </Fade>
        )}

        {/* ══ MODAL DE BOLETÍN RÁPIDO DESDE LA SÁBANA ══ */}
        <Dialog
          open={!!modalEstudiante}
          onClose={() => setModalEstudiante(null)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3.5,
              bgcolor: isDark ? '#13161a' : '#ffffff',
              backgroundImage: 'none',
              p: 1,
            },
          }}
        >
          {modalEstudiante && (
            <>
              <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: primary,
                      color: isDark ? '#000' : '#fff',
                      fontWeight: 800,
                    }}
                  >
                    {modalEstudiante.nombres.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={800}>
                      {modalEstudiante.nombre_completo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Boletín individual · {cursoData?.curso.grado_nombre} "{cursoData?.curso.paralelo_nombre}" ({cursoData?.curso.turno_nombre})
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={() => setModalEstudiante(null)} size="small">
                  <CloseRoundedIcon />
                </IconButton>
              </DialogTitle>

              <DialogContent dividers sx={{ borderColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08) }}>
                {tabPeriodo === 'anual' ? (
                  <BoletinGeneralAnual
                    materiasAnuales={modalEstudiante.materias_anuales as any}
                    periodos={periodosOrdenados}
                    isLoading={false}
                    promedioGeneral={modalEstudiante.promedio_general_anual}
                    aprobadas={modalEstudiante.aprobadas_anual}
                    reprobadas={modalEstudiante.reprobadas_anual}
                    sinNota={modalEstudiante.sin_nota_anual}
                  />
                ) : (
                  <BoletinNotas
                    boletin={(modalEstudiante.trimestres.find(t => t.periodo_id === tabPeriodo)?.materias || []).map(m => ({
                      materia_nombre: m.materia_nombre,
                      materia_codigo: m.materia_codigo,
                      grado_materia_id: m.grado_materia_id,
                      nota_final: m.nota_final,
                      nota_minima: m.nota_minima,
                      aprobado: m.aprobado,
                      estado_periodo: m.estado,
                      nota_ser: m.nota_ser,
                      nota_saber: m.nota_saber,
                      nota_hacer: m.nota_hacer,
                      nota_auto: m.nota_auto,
                      nivel: getNivelRendimiento(m.nota_final),
                    }))}
                    isLoading={false}
                    aprobadas={modalEstudiante.trimestres.find(t => t.periodo_id === tabPeriodo)?.aprobadas ?? 0}
                    reprobadas={modalEstudiante.trimestres.find(t => t.periodo_id === tabPeriodo)?.reprobadas ?? 0}
                    sinNota={modalEstudiante.trimestres.find(t => t.periodo_id === tabPeriodo)?.sin_nota ?? 0}
                    promedio={modalEstudiante.trimestres.find(t => t.periodo_id === tabPeriodo)?.promedio ?? null}
                    matriculaId={modalEstudiante.matricula_id}
                    periodoEvaluacionId={tabPeriodo}
                  />
                )}
              </DialogContent>

              <DialogActions sx={{ px: 3, py: 1.5, gap: 1 }}>
                <Button
                  startIcon={<EditRoundedIcon />}
                  onClick={() => {
                    handleAbrirEditorNota({ estudiante: modalEstudiante });
                  }}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    borderColor: alpha(primary, 0.4),
                    color: primary,
                    '&:hover': { borderColor: primary, bgcolor: alpha(primary, 0.1) },
                  }}
                >
                  Editar Calificación
                </Button>
                <Button
                  onClick={() => {
                    setEstudianteActivoId(modalEstudiante.estudiante_id);
                    setModoVista('boletin');
                    setModalEstudiante(null);
                  }}
                  variant="outlined"
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                >
                  Abrir en Pantalla Completa
                </Button>
                <Button
                  onClick={() => setModalEstudiante(null)}
                  variant="contained"
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, bgcolor: primary, color: isDark ? '#000' : '#fff' }}
                >
                  Cerrar
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* ══ MODAL DE EDICIÓN DE CALIFICACIÓN ══ */}
        <Dialog
          open={modalEditar.open}
          onClose={() => !modalEditar.guardando && setModalEditar(prev => ({ ...prev, open: false }))}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3.5,
              bgcolor: isDark ? '#14171d' : '#ffffff',
              backgroundImage: 'none',
              border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
              boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.6)' : '0 16px 48px rgba(0,0,0,0.12)',
            },
          }}
        >
          {modalEditar.estudiante && modalEditar.materia && (
            <>
              <DialogTitle
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  pb: 1.5,
                  borderBottom: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(primary, isDark ? 0.25 : 0.12),
                      color: primary,
                    }}
                  >
                    <EditRoundedIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                      Editar Calificación
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ajuste manual de notas finales y promedios
                    </Typography>
                  </Box>
                </Box>
                <IconButton
                  onClick={() => !modalEditar.guardando && setModalEditar(prev => ({ ...prev, open: false }))}
                  size="small"
                  disabled={modalEditar.guardando}
                >
                  <CloseRoundedIcon />
                </IconButton>
              </DialogTitle>

              <DialogContent sx={{ pt: 2.5, pb: 2 }}>
                {modalEditar.error && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    {modalEditar.error}
                  </Alert>
                )}

                {/* Resumen del Estudiante */}
                <Box
                  sx={{
                    p: 1.75,
                    mb: 2.5,
                    borderRadius: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.03),
                    border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                  }}
                >
                  <Avatar
                    src={modalEditar.estudiante.foto_url || undefined}
                    sx={{
                      width: 42,
                      height: 42,
                      fontWeight: 800,
                      bgcolor: primary,
                      color: isDark ? '#000' : '#fff',
                    }}
                  >
                    {modalEditar.estudiante.nombres.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" fontWeight={800} noWrap>
                      {modalEditar.estudiante.nombre_completo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      CI: {modalEditar.estudiante.ci || '—'} · Curso: {cursoData?.curso.grado_nombre} "{cursoData?.curso.paralelo_nombre}" ({cursoData?.curso.turno_nombre})
                    </Typography>
                  </Box>
                </Box>

                {/* Selector de Materia */}
                <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
                  <InputLabel id="modal-materia-label" sx={{ fontWeight: 700 }}>Materia / Asignatura</InputLabel>
                  <Select
                    labelId="modal-materia-label"
                    label="Materia / Asignatura"
                    value={modalEditar.materia.materia_id}
                    onChange={(e) => handleCambiarMateriaModal(Number(e.target.value))}
                    disabled={modalEditar.guardando}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                  >
                    {cursoData?.materias.map(m => (
                      <MenuItem key={m.materia_id} value={m.materia_id}>
                        <strong>{m.materia_nombre}</strong>
                        <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                          ({m.materia_codigo || 'COD'} · Mín: {m.nota_minima_aprobacion})
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Selector de Período Evaluativo (Trimestres) */}
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Trimestre a Calificar
                  </Typography>
                  <Grid container spacing={1}>
                    {cursoData?.periodos.map(p => {
                      const activo = modalEditar.periodoId === p.id;
                      const tri = modalEditar.estudiante?.trimestres.find(t => t.periodo_id === p.id);
                      const mTri = tri?.materias.find(m => m.grado_materia_id === modalEditar.materia?.grado_materia_id);
                      const notaPeriodo = mTri?.nota_final;

                      return (
                        <Grid size={{ xs: 4 }} key={p.id}>
                          <Box
                            onClick={() => !modalEditar.guardando && handleCambiarPeriodoModal(p.id)}
                            sx={{
                              p: 1.25,
                              textAlign: 'center',
                              borderRadius: 2,
                              cursor: modalEditar.guardando ? 'default' : 'pointer',
                              border: `1.5px solid ${activo ? primary : isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                              bgcolor: activo
                                ? alpha(primary, isDark ? 0.2 : 0.1)
                                : isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
                              transition: 'all 0.15s ease',
                              '&:hover': !modalEditar.guardando ? {
                                borderColor: primary,
                                bgcolor: alpha(primary, 0.1),
                              } : {},
                            }}
                          >
                            <Typography variant="caption" fontWeight={activo ? 900 : 700} color={activo ? primary : 'text.primary'} display="block">
                              {p.nombre}
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={800}
                              sx={{
                                mt: 0.25,
                                color: notaPeriodo == null ? 'text.disabled' : (notaPeriodo >= 51 ? '#10b981' : '#ef4444'),
                              }}
                            >
                              {notaPeriodo != null ? `${notaPeriodo} pts` : 'Sin nota'}
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>

                {/* Campo de Entrada de Nota */}
                <Box sx={{ mb: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Calificación Final (0 a 100)
                    </Typography>
                    {modalEditar.notaInput.trim() !== '' && !isNaN(parseFloat(modalEditar.notaInput)) && (
                      <Chip
                        size="small"
                        label={
                          parseFloat(modalEditar.notaInput) >= 70
                            ? 'Aprobado (Notable)'
                            : parseFloat(modalEditar.notaInput) >= 51
                              ? 'Aprobado (Regular)'
                              : 'Reprobado (< 51)'
                        }
                        sx={{
                          height: 22,
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          bgcolor: alpha(
                            parseFloat(modalEditar.notaInput) >= 51 ? '#10b981' : '#ef4444',
                            0.15
                          ),
                          color: parseFloat(modalEditar.notaInput) >= 51 ? '#10b981' : '#ef4444',
                          border: `1px solid ${alpha(
                            parseFloat(modalEditar.notaInput) >= 51 ? '#10b981' : '#ef4444',
                            0.3
                          )}`,
                        }}
                      />
                    )}
                  </Box>

                  <TextField
                    fullWidth
                    type="number"
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    placeholder="Ej. 75"
                    value={modalEditar.notaInput}
                    onChange={(e) => setModalEditar(prev => ({ ...prev, notaInput: e.target.value, error: null }))}
                    disabled={modalEditar.guardando}
                    autoFocus
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                        fontSize: '1.25rem',
                        fontWeight: 800,
                      },
                    }}
                  />

                  {/* Atajos de notas rápidas */}
                  <Box sx={{ display: 'flex', gap: 0.75, mt: 1, flexWrap: 'wrap' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mr: 0.5, fontWeight: 700 }}>
                      Atajos:
                    </Typography>
                    {[51, 60, 70, 85, 100].map(val => (
                      <Chip
                        key={val}
                        size="small"
                        label={val === 51 ? '51 (Mínimo)' : `${val} pts`}
                        onClick={() => !modalEditar.guardando && setModalEditar(prev => ({ ...prev, notaInput: String(val), error: null }))}
                        sx={{
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          borderRadius: 1.5,
                          bgcolor: alpha(primary, 0.08),
                          color: primary,
                          border: `1px solid ${alpha(primary, 0.2)}`,
                          '&:hover': { bgcolor: alpha(primary, 0.18) },
                        }}
                      />
                    ))}
                    {modalEditar.notaInput !== '' && (
                      <Chip
                        size="small"
                        label="Borrar"
                        onClick={() => setModalEditar(prev => ({ ...prev, notaInput: '', error: null }))}
                        sx={{ cursor: 'pointer', fontWeight: 700, fontSize: '0.72rem', borderRadius: 1.5 }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Justificación opcional */}
                <TextField
                  fullWidth
                  size="small"
                  label="Motivo / Observación del Ajuste (Opcional)"
                  placeholder="Ej. Corrección de calificación, examen extraordinario..."
                  value={modalEditar.justificacion}
                  onChange={(e) => setModalEditar(prev => ({ ...prev, justificacion: e.target.value }))}
                  disabled={modalEditar.guardando}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, fontStyle: 'italic', fontSize: '0.74rem' }}>
                  * Esta modificación actualizará automáticamente los promedios del estudiante, la sábana del curso y los boletines escolares oficiales.
                </Typography>
              </DialogContent>

              <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}` }}>
                <Button
                  onClick={() => setModalEditar(prev => ({ ...prev, open: false }))}
                  disabled={modalEditar.guardando}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, color: 'text.secondary' }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleGuardarNota}
                  disabled={modalEditar.guardando || modalEditar.notaInput.trim() === ''}
                  variant="contained"
                  startIcon={modalEditar.guardando ? <CircularProgress size={18} color="inherit" /> : <SaveRoundedIcon />}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 800,
                    px: 2.5,
                    bgcolor: primary,
                    color: isDark ? '#000' : '#fff',
                    '&:hover': { bgcolor: primaryEnd },
                  }}
                >
                  {modalEditar.guardando ? 'Guardando...' : 'Guardar Calificación'}
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

      </Container>
    </Box>
  );
}
