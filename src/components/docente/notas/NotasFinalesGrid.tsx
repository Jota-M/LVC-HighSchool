'use client';
// components/docente/notas/NotasFinalesGrid.tsx
//
// Vista consolidada de notas finales para el docente:
//   Junta las 4 dimensiones (SER 10%, SABER 40%, HACER 45%, AUTO 5%)
//   Muestra promedios ponderados, nota final /100, estado y desglose individual por estudiante.
//
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Typography, Avatar, Chip, Tooltip, CircularProgress,
  useTheme, useMediaQuery, alpha, IconButton, TextField,
  InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Divider, LinearProgress,
} from '@mui/material';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import PersonOffRoundedIcon from '@mui/icons-material/PersonOffRounded';

import {
  MateriaDocenteNotas,
  Evaluacion,
  CalificacionEstudiante,
  DIMENSIONES_CONFIG,
  CodigoDimension,
} from '@/types/notasTypes';
import { useDimensiones } from '@/hooks/useNotas';
import { calificacionesService, notasCalculoService } from '@/services/notasService';
import { toast } from 'react-hot-toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function iniciales(apellidos: string, nombres: string) {
  return `${(apellidos ?? '')[0] ?? ''}${(nombres ?? '')[0] ?? ''}`.toUpperCase();
}

function colorNotaFinal(nota: number) {
  if (nota >= 51) return '#10b981'; // Aprobado
  if (nota >= 36) return '#f59e0b'; // En riesgo
  return '#ef4444';                // Reprobado
}

export interface NotasFinalesGridProps {
  seleccionada: MateriaDocenteNotas;
  evaluaciones: Evaluacion[];
  lista: CalificacionEstudiante[];
  isLoadingLista: boolean;
  periodoId: number;
  onRefrescarNotas?: () => Promise<void>;
}

// Estructura de consolidado por estudiante
interface EstudianteConsolidado {
  matricula_id: number;
  estudiante_codigo: string;
  estudiante_nombres: string;
  estudiante_apellidos: string;
  estudiante_foto?: string | null;
  // Notas por dimensión (base 100 y ponderada)
  ser_base100: number | null;
  ser_ponderada: number;
  saber_base100: number | null;
  saber_ponderada: number;
  hacer_base100: number | null;
  hacer_ponderada: number;
  auto_base100: number | null;
  auto_ponderada: number;
  // Total final sobre 100
  nota_final: number;
  aprobado: boolean;
  estado: 'aprobado' | 'en_riesgo' | 'reprobado' | 'sin_notas';
  total_evaluaciones_rendidas: number;
  total_evaluaciones_disponibles: number;
  // Detalle por evaluación para modal
  evaluacionesDetalle: Array<{
    evaluacion_id: number;
    nombre: string;
    dimension_codigo: CodigoDimension;
    puntaje_maximo: number;
    peso_en_dimension: number;
    puntaje_obtenido: number | null;
    esta_ausente: boolean;
    observacion?: string;
  }>;
}

export const NotasFinalesGrid: React.FC<NotasFinalesGridProps> = ({
  seleccionada,
  evaluaciones,
  lista,
  isLoadingLista,
  periodoId,
  onRefrescarNotas,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { dimensionesConfig } = useDimensiones();
  const pctSer = dimensionesConfig.SER.porcentaje;
  const pctSaber = dimensionesConfig.SAB.porcentaje;
  const pctHacer = dimensionesConfig.HAC.porcentaje;
  const pctAuto = dimensionesConfig.AUT.porcentaje;

  // Tokens de estilo basados en Horario Docente
  const accentColor = isDark ? '#facc15' : '#0288d1';
  const accentEnd = isDark ? '#f59e0b' : '#01579b';

  // Estados de datos
  const [loadingDatos, setLoadingDatos] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'aprobados' | 'en_riesgo' | 'reprobados'>('todos');
  const [estudianteModal, setEstudianteModal] = useState<EstudianteConsolidado | null>(null);

  // Mapa de notas por evaluación y matrícula: { evaluacionId: { matriculaId: { puntaje, ausente, observacion } } }
  const [calificacionesRaw, setCalificacionesRaw] = useState<
    Record<number, Record<number, { puntaje: number | null; ausente: boolean; observacion?: string }>>
  >({});

  // Cargar calificaciones de todas las evaluaciones activas
  const cargarTodasCalificaciones = useCallback(async () => {
    if (evaluaciones.length === 0) {
      setCalificacionesRaw({});
      setLoadingDatos(false);
      return;
    }

    setLoadingDatos(true);
    try {
      const results = await Promise.allSettled(
        evaluaciones.map(ev => calificacionesService.listarPorEvaluacion(ev.id))
      );

      const rawMap: Record<number, Record<number, { puntaje: number | null; ausente: boolean; observacion?: string }>> = {};

      results.forEach((r, idx) => {
        if (r.status !== 'fulfilled') return;
        const ev = evaluaciones[idx];
        rawMap[ev.id] = {};

        r.value.data.calificaciones.forEach((c: CalificacionEstudiante) => {
          rawMap[ev.id][c.matricula_id] = {
            puntaje: c.puntaje_obtenido !== null && c.puntaje_obtenido !== undefined ? Number(c.puntaje_obtenido) : null,
            ausente: c.esta_ausente ?? false,
            observacion: c.observacion,
          };
        });
      });

      setCalificacionesRaw(rawMap);
    } catch (err) {
      console.error('Error al cargar consolidado de calificaciones:', err);
      toast.error('Error al cargar el consolidado');
    } finally {
      setLoadingDatos(false);
    }
  }, [evaluaciones]);

  useEffect(() => {
    cargarTodasCalificaciones();
  }, [cargarTodasCalificaciones]);

  // ── Cálculo consolidado por estudiante ────────────────────────────────────
  const consolidados: EstudianteConsolidado[] = useMemo(() => {
    if (lista.length === 0) return [];

    // Agrupar evaluaciones por dimensión
    const evsPorDim: Record<CodigoDimension, Evaluacion[]> = {
      SER: evaluaciones.filter(e => e.dimension_codigo === 'SER'),
      SAB: evaluaciones.filter(e => e.dimension_codigo === 'SAB'),
      HAC: evaluaciones.filter(e => e.dimension_codigo === 'HAC'),
      AUT: evaluaciones.filter(e => e.dimension_codigo === 'AUT'),
    };

    return lista.map(est => {
      const matriculaId = est.matricula_id;
      let totalRendidas = 0;
      const detalleList: EstudianteConsolidado['evaluacionesDetalle'] = [];

      // Función auxiliar para calcular promedio de una dimensión (según ley boliviana)
      const calcDimension = (codigo: CodigoDimension) => {
        const evs = evsPorDim[codigo] ?? [];
        if (evs.length === 0) return { base100: null, ponderada: 0 };

        let sumaPonderada = 0;
        let sumaPesos = 0;
        let tieneNotas = false;

        evs.forEach(ev => {
          const reg = calificacionesRaw[ev.id]?.[matriculaId];
          const peso = Number(ev.peso_en_dimension || 1);
          const max = Number(ev.puntaje_maximo || 100);

          let obtenido: number | null = null;
          let ausente = false;
          let obs = '';

          if (reg) {
            ausente = reg.ausente;
            obtenido = reg.puntaje;
            obs = reg.observacion || '';
          }

          detalleList.push({
            evaluacion_id: ev.id,
            nombre: ev.nombre,
            dimension_codigo: codigo,
            puntaje_maximo: max,
            peso_en_dimension: peso,
            puntaje_obtenido: obtenido,
            esta_ausente: ausente,
            observacion: obs,
          });

          if (ausente) {
            tieneNotas = true;
            totalRendidas++;
            // Ausente cuenta como 0
            sumaPonderada += 0;
            sumaPesos += peso;
          } else if (obtenido !== null && !isNaN(obtenido)) {
            tieneNotas = true;
            totalRendidas++;
            const normalizada = (obtenido / max) * 100;
            sumaPonderada += normalizada * peso;
            sumaPesos += peso;
          }
        });

        if (!tieneNotas || sumaPesos === 0) {
          return { base100: null, ponderada: 0 };
        }

        const base100 = parseFloat((sumaPonderada / sumaPesos).toFixed(2));
        const cfg = dimensionesConfig[codigo] || DIMENSIONES_CONFIG[codigo];
        const ponderada = parseFloat(((base100 * cfg.porcentaje) / 100).toFixed(2));

        return { base100, ponderada };
      };

      const ser = calcDimension('SER');
      const sab = calcDimension('SAB');
      const hac = calcDimension('HAC');
      const aut = calcDimension('AUT');

      const notaFinal = parseFloat((ser.ponderada + sab.ponderada + hac.ponderada + aut.ponderada).toFixed(1));
      const tieneAlgunaNota = [ser.base100, sab.base100, hac.base100, aut.base100].some(v => v !== null);

      let estado: EstudianteConsolidado['estado'] = 'sin_notas';
      if (tieneAlgunaNota) {
        if (notaFinal >= 51) estado = 'aprobado';
        else if (notaFinal >= 36) estado = 'en_riesgo';
        else estado = 'reprobado';
      }

      return {
        matricula_id: matriculaId,
        estudiante_codigo: est.estudiante_codigo,
        estudiante_nombres: est.estudiante_nombres,
        estudiante_apellidos: est.estudiante_apellidos,
        estudiante_foto: est.estudiante_foto,
        ser_base100: ser.base100,
        ser_ponderada: ser.ponderada,
        saber_base100: sab.base100,
        saber_ponderada: sab.ponderada,
        hacer_base100: hac.base100,
        hacer_ponderada: hac.ponderada,
        auto_base100: aut.base100,
        auto_ponderada: aut.ponderada,
        nota_final: notaFinal,
        aprobado: notaFinal >= 51,
        estado,
        total_evaluaciones_rendidas: totalRendidas,
        total_evaluaciones_disponibles: evaluaciones.length,
        evaluacionesDetalle: detalleList,
      };
    });
  }, [lista, evaluaciones, calificacionesRaw, dimensionesConfig]);

  // ── Estadísticas generales del curso ─────────────────────────────────────
  const stats = useMemo(() => {
    const totalEst = consolidados.length;
    if (totalEst === 0) {
      return {
        promedioGeneral: 0,
        aprobados: 0,
        enRiesgo: 0,
        reprobados: 0,
        promSer: 0,
        promSaber: 0,
        promHacer: 0,
        promAuto: 0,
      };
    }

    const conNotas = consolidados.filter(c => c.estado !== 'sin_notas');
    const totalConNotas = conNotas.length || 1;

    const sumaFinal = conNotas.reduce((acc, c) => acc + c.nota_final, 0);
    const sumaSer = conNotas.reduce((acc, c) => acc + c.ser_ponderada, 0);
    const sumaSaber = conNotas.reduce((acc, c) => acc + c.saber_ponderada, 0);
    const sumaHacer = conNotas.reduce((acc, c) => acc + c.hacer_ponderada, 0);
    const sumaAuto = conNotas.reduce((acc, c) => acc + c.auto_ponderada, 0);

    const aprobados = consolidados.filter(c => c.estado === 'aprobado').length;
    const enRiesgo = consolidados.filter(c => c.estado === 'en_riesgo').length;
    const reprobados = consolidados.filter(c => c.estado === 'reprobado').length;

    return {
      promedioGeneral: parseFloat((sumaFinal / totalConNotas).toFixed(1)),
      aprobados,
      enRiesgo,
      reprobados,
      promSer: parseFloat((sumaSer / totalConNotas).toFixed(1)),
      promSaber: parseFloat((sumaSaber / totalConNotas).toFixed(1)),
      promHacer: parseFloat((sumaHacer / totalConNotas).toFixed(1)),
      promAuto: parseFloat((sumaAuto / totalConNotas).toFixed(1)),
    };
  }, [consolidados]);

  // ── Filtrado interactivo ──────────────────────────────────────────────────
  const consolidadosFiltrados = useMemo(() => {
    return consolidados.filter(c => {
      // Filtro texto
      const nombreCompleto = `${c.estudiante_apellidos} ${c.estudiante_nombres} ${c.estudiante_codigo}`.toLowerCase();
      const matchText = !searchQuery || nombreCompleto.includes(searchQuery.toLowerCase());

      // Filtro estado
      let matchEstado = true;
      if (filtroEstado === 'aprobados') matchEstado = c.estado === 'aprobado';
      else if (filtroEstado === 'en_riesgo') matchEstado = c.estado === 'en_riesgo';
      else if (filtroEstado === 'reprobados') matchEstado = c.estado === 'reprobado';

      return matchText && matchEstado;
    });
  }, [consolidados, searchQuery, filtroEstado]);

  // ── Recalcular y persistir en la Base de Datos ───────────────────────────
  const handleRecalcularServidor = async () => {
    if (consolidados.length === 0) return;
    setIsRecalculating(true);
    try {
      const matriculaIds = consolidados.map(c => c.matricula_id);
      await Promise.allSettled(
        matriculaIds.map(mid =>
          notasCalculoService.calcular(mid, seleccionada.grado_materia_id, periodoId)
        )
      );

      toast.success('✅ Notas finales recalculadas y sincronizadas con éxito');
      await cargarTodasCalificaciones();
      if (onRefrescarNotas) await onRefrescarNotas();
    } catch (err: any) {
      console.error('Error al recalcular en servidor:', err);
      toast.error('Ocurrió un inconveniente al recalcular');
    } finally {
      setIsRecalculating(false);
    }
  };

  // ── Exportar a CSV / Planilla ──────────────────────────────────────────────
  const handleExportarCSV = () => {
    if (consolidados.length === 0) return;

    const encabezados = ['Nro', 'Codigo', 'Apellidos', 'Nombres', `SER (${pctSer})`, `SABER (${pctSaber})`, `HACER (${pctHacer})`, `AUTO (${pctAuto})`, 'NOTA FINAL (100)', 'ESTADO'];
    const filas = consolidados.map((c, i) => [
      i + 1,
      `"${c.estudiante_codigo}"`,
      `"${c.estudiante_apellidos}"`,
      `"${c.estudiante_nombres}"`,
      c.ser_ponderada,
      c.saber_ponderada,
      c.hacer_ponderada,
      c.auto_ponderada,
      c.nota_final,
      `"${c.estado.toUpperCase()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' +
      [encabezados.join(','), ...filas.map(f => f.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Consolidado_${seleccionada.materia_nombre.replace(/\s+/g, '_')}_${seleccionada.grado_nombre}_${seleccionada.paralelo_nombre}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Planilla descargada en formato CSV');
  };

  // Estilos compartidos de celdas
  const borderCell = `1px solid ${isDark ? alpha(accentColor, 0.12) : alpha(accentColor, 0.14)}`;
  const thBase: React.CSSProperties = {
    padding: '12px 10px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    fontWeight: 700,
    fontSize: 12,
    borderRight: borderCell,
    borderBottom: `2px solid ${alpha(accentColor, 0.2)}`,
    color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)',
    background: isDark ? alpha('#facc15', 0.06) : alpha('#0288d1', 0.05),
  };

  // ── Spinner inicial ───────────────────────────────────────────────────────
  if (isLoadingLista || loadingDatos) {
    return (
      <Box sx={{
        py: 8, textAlign: 'center', borderRadius: 3,
        border: `1px solid ${alpha(accentColor, 0.2)}`,
        background: isDark
          ? `linear-gradient(135deg, ${alpha('#facc15', 0.07)} 0%, rgba(17, 24, 39, 0.96) 100%)`
          : `linear-gradient(135deg, ${alpha('#0288d1', 0.06)} 0%, #ffffff 100%)`,
      }}>
        <CircularProgress size={36} sx={{ color: accentColor }} />
        <Typography variant="body2" sx={{ mt: 2, fontWeight: 700, color: 'text.secondary' }}>
          Consolidando dimensiones de evaluación...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* ── 1. KPI CARDS & RESUMEN (Estilo idéntico a Horario Docente) ── */}
      <Box sx={{
        mb: 3, p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        border: `1px solid ${alpha(accentColor, 0.2)}`,
        background: isDark
          ? `linear-gradient(135deg, ${alpha('#facc15', 0.08)} 0%, ${alpha('#f59e0b', 0.02)} 100%)`
          : `linear-gradient(135deg, ${alpha('#0288d1', 0.07)} 0%, ${alpha('#01579b', 0.02)} 100%)`,
        boxShadow: isDark
          ? `0 4px 20px rgba(0,0,0,0.25), 0 0 1px ${alpha(accentColor, 0.2)}`
          : `0 2px 14px rgba(2,136,209,0.06)`,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2.5,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Título & Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 240 }}>
          <Avatar sx={{
            width: 46, height: 46,
            background: isDark
              ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
              : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
            color: isDark ? '#000' : '#fff',
            boxShadow: `0 4px 12px ${alpha(accentColor, 0.35)}`,
          }}>
            <WorkspacePremiumRoundedIcon sx={{ fontSize: 26 }} />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
              Consolidado de Calificaciones
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              {seleccionada.materia_nombre} · {seleccionada.grado_nombre} "{seleccionada.paralelo_nombre}" · {consolidados.length} estudiantes
            </Typography>
          </Box>
        </Box>

        {/* Mini stats inline (mismo formato de Horario Docente) */}
        <Box sx={{ display: 'flex', gap: { xs: 1.5, sm: 2.5 }, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { label: 'Promedio General', valor: `${stats.promedioGeneral} pts`, color: accentColor },
            { label: 'Aprobados', valor: stats.aprobados, color: '#10b981' },
            { label: 'En Riesgo', valor: stats.enRiesgo, color: '#f59e0b' },
            { label: 'Reprobados', valor: stats.reprobados, color: '#ef4444' },
          ].map((s) => (
            <Box key={s.label} sx={{ textAlign: 'center', minWidth: 65 }}>
              <Typography variant="h5" fontWeight={800} sx={{ color: s.color, lineHeight: 1.1 }}>
                {s.valor}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', fontWeight: 600 }}>
                {s.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Botones de acción directa */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Tooltip title="Recalcular notas finales y guardar en la base de datos">
            <Button
              variant="contained"
              size="small"
              onClick={handleRecalcularServidor}
              disabled={isRecalculating}
              startIcon={isRecalculating ? <CircularProgress size={16} sx={{ color: isDark ? '#000' : '#fff' }} /> : <AutoAwesomeRoundedIcon />}
              sx={{
                background: isDark
                  ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                  : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                color: isDark ? '#000' : '#fff',
                fontWeight: 700,
                fontSize: 12.5,
                textTransform: 'none',
                borderRadius: '10px',
                px: 1.8,
                py: 0.8,
                boxShadow: `0 4px 14px ${alpha(accentColor, 0.3)}`,
                '&:hover': {
                  opacity: 0.95,
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {isRecalculating ? 'Sincronizando...' : 'Recalcular en BD'}
            </Button>
          </Tooltip>

          <Tooltip title="Descargar planilla en formato CSV / Excel">
            <IconButton
              size="small"
              onClick={handleExportarCSV}
              sx={{
                p: 1, borderRadius: 2,
                border: `1px solid ${alpha(accentColor, 0.25)}`,
                color: accentColor,
                '&:hover': { bgcolor: alpha(accentColor, 0.1) },
              }}
            >
              <DownloadRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Actualizar datos">
            <IconButton
              size="small"
              onClick={cargarTodasCalificaciones}
              sx={{
                p: 1, borderRadius: 2,
                border: `1px solid ${alpha(accentColor, 0.25)}`,
                color: accentColor,
                '&:hover': { bgcolor: alpha(accentColor, 0.1) },
              }}
            >
              <RefreshRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ── 2. FILTROS Y BÚSQUEDA ── */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1.5,
        mb: 2,
      }}>
        {/* Buscador */}
        <TextField
          size="small"
          placeholder="Buscar por estudiante o código..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            minWidth: { xs: '100%', sm: 260 },
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
              border: `1px solid ${alpha(accentColor, 0.2)}`,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ fontSize: 18, color: accentColor }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Filtros rápidos por estado */}
        <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
          {[
            { key: 'todos', label: `Todos (${consolidados.length})` },
            { key: 'aprobados', label: `Aprobados (${stats.aprobados})` },
            { key: 'en_riesgo', label: `En Riesgo (${stats.enRiesgo})` },
            { key: 'reprobados', label: `Reprobados (${stats.reprobados})` },
          ].map((f) => {
            const activo = filtroEstado === f.key;
            return (
              <Chip
                key={f.key}
                label={f.label}
                size="small"
                onClick={() => setFiltroEstado(f.key as any)}
                sx={{
                  fontWeight: 700,
                  fontSize: 11.5,
                  cursor: 'pointer',
                  borderRadius: '8px',
                  bgcolor: activo ? alpha(accentColor, 0.18) : (isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04)),
                  color: activo ? accentColor : 'text.secondary',
                  border: `1px solid ${activo ? accentColor : 'transparent'}`,
                  '&:hover': {
                    bgcolor: alpha(accentColor, 0.12),
                  },
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* ── 3. TABLA CONSOLIDADA (Planilla Excel con Contenedor Degradado) ── */}
      {isMobile ? (
        /* VISTA MÓVIL: TARJETAS CON DESGLOSE */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {consolidadosFiltrados.map((est, idx) => (
            <Box
              key={est.matricula_id}
              sx={{
                p: 2,
                borderRadius: 3,
                border: `1px solid ${alpha(accentColor, 0.2)}`,
                background: isDark
                  ? `linear-gradient(135deg, ${alpha('#facc15', 0.06)} 0%, rgba(20, 26, 38, 0.85) 100%)`
                  : `linear-gradient(135deg, ${alpha('#0288d1', 0.05)} 0%, #ffffff 100%)`,
                boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.2)' : '0 2px 10px rgba(0,0,0,0.03)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <Avatar
                    src={est.estudiante_foto ?? undefined}
                    sx={{
                      width: 38, height: 38,
                      bgcolor: alpha(accentColor, 0.2),
                      color: accentColor,
                      fontWeight: 800, fontSize: 13,
                    }}
                  >
                    {iniciales(est.estudiante_apellidos, est.estudiante_nombres)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={800} sx={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
                      {est.estudiante_apellidos}, {est.estudiante_nombres}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {est.estudiante_codigo}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={`${est.nota_final} pts`}
                  size="small"
                  sx={{
                    fontWeight: 800, fontSize: 13,
                    bgcolor: alpha(colorNotaFinal(est.nota_final), 0.15),
                    color: colorNotaFinal(est.nota_final),
                    border: `1px solid ${colorNotaFinal(est.nota_final)}`,
                  }}
                />
              </Box>

              {/* Grid 4 dimensiones en móvil */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, textAlign: 'center', mb: 1.5 }}>
                {[
                  { label: `SER (${pctSer})`, val: est.ser_ponderada, col: '#10b981' },
                  { label: `SAB (${pctSaber})`, val: est.saber_ponderada, col: '#3b82f6' },
                  { label: `HAC (${pctHacer})`, val: est.hacer_ponderada, col: '#f59e0b' },
                  { label: `AUT (${pctAuto})`, val: est.auto_ponderada, col: '#8b5cf6' },
                ].map(d => (
                  <Box key={d.label} sx={{ p: 1, borderRadius: 2, bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.03) }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 9, fontWeight: 700, display: 'block' }}>
                      {d.label}
                    </Typography>
                    <Typography variant="body2" fontWeight={800} sx={{ color: d.col }}>
                      {d.val}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Button
                fullWidth
                size="small"
                variant="outlined"
                onClick={() => setEstudianteModal(est)}
                startIcon={<VisibilityRoundedIcon fontSize="small" />}
                sx={{
                  borderRadius: 2,
                  borderColor: alpha(accentColor, 0.3),
                  color: accentColor,
                  textTransform: 'none',
                  fontSize: 12,
                }}
              >
                Ver Desglose Completo
              </Button>
            </Box>
          ))}
        </Box>
      ) : (
        /* VISTA DESKTOP: ESTILO ASISTENCIA (Tarjetas por estudiante) */
        <Box sx={{ overflowX: 'auto', pb: 1 }}>
          <Box sx={{ minWidth: 920 }}>
            {/* ══ Encabezado de Columnas (Estilo Asistencia) ══ */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 2,
                py: 1.5,
                mb: 1.5,
                borderRadius: '10px',
                bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                border: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04)}`,
              }}
            >
              <Typography variant="caption" fontWeight={800} color="text.disabled" sx={{ width: 24, textAlign: 'center' }}>
                #
              </Typography>
              <Typography variant="caption" fontWeight={800} color="text.disabled" sx={{ flex: 1, textTransform: 'uppercase' }}>
                ESTUDIANTE ({consolidadosFiltrados.length})
              </Typography>

              {/* Columnas Dimensiones */}
              <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center' }}>
                <Box sx={{ width: 88, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#10b981', display: 'block' }}>
                    SER
                  </Typography>
                  <Typography sx={{ fontSize: 9.5, color: 'text.disabled', fontWeight: 600 }}>
                    /{pctSer} pts
                  </Typography>
                </Box>

                <Box sx={{ width: 88, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#3b82f6', display: 'block' }}>
                    SABER
                  </Typography>
                  <Typography sx={{ fontSize: 9.5, color: 'text.disabled', fontWeight: 600 }}>
                    /{pctSaber} pts
                  </Typography>
                </Box>

                <Box sx={{ width: 88, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#f59e0b', display: 'block' }}>
                    HACER
                  </Typography>
                  <Typography sx={{ fontSize: 9.5, color: 'text.disabled', fontWeight: 600 }}>
                    /{pctHacer} pts
                  </Typography>
                </Box>

                <Box sx={{ width: 88, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#8b5cf6', display: 'block' }}>
                    AUTO
                  </Typography>
                  <Typography sx={{ fontSize: 9.5, color: 'text.disabled', fontWeight: 600 }}>
                    /{pctAuto} pts
                  </Typography>
                </Box>
              </Box>

              {/* NOTA FINAL */}
              <Typography
                variant="caption"
                fontWeight={800}
                sx={{ width: 110, textAlign: 'center', color: accentColor, textTransform: 'uppercase' }}
              >
                NOTA FINAL (/100)
              </Typography>

              {/* ESTADO */}
              <Typography
                variant="caption"
                fontWeight={800}
                color="text.disabled"
                sx={{ width: 105, textAlign: 'center', textTransform: 'uppercase' }}
              >
                ESTADO
              </Typography>

              {/* DETALLE */}
              <Typography
                variant="caption"
                fontWeight={800}
                color="text.disabled"
                sx={{ width: 50, textAlign: 'center', textTransform: 'uppercase' }}
              >
                VER
              </Typography>
            </Box>

            {/* ══ Filas de Estudiantes (Tarjetas tipo Asistencia) ══ */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1.5 }}>
              {consolidadosFiltrados.map((est, estIdx) => {
                const colorNota = colorNotaFinal(est.nota_final);

                return (
                  <Box
                    key={est.matricula_id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 1.5,
                      borderRadius: '12px',
                      border: `1.5px solid ${alpha(isDark ? '#fff' : '#000', 0.06)}`,
                      bgcolor: isDark ? 'rgba(15, 23, 42, 0.65)' : '#ffffff',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        transform: 'translateX(4px)',
                        borderColor: alpha(accentColor, 0.35),
                        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 14px rgba(0,0,0,0.06)',
                      },
                    }}
                  >
                    {/* Bloque 1: # + Avatar + Nombre */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
                      <Typography
                        variant="caption"
                        fontWeight={800}
                        color="text.disabled"
                        sx={{ minWidth: 22, textAlign: 'center', flexShrink: 0 }}
                      >
                        {estIdx + 1}
                      </Typography>
                      <Avatar
                        src={est.estudiante_foto ?? undefined}
                        sx={{
                          width: 36,
                          height: 36,
                          fontSize: 12,
                          fontWeight: 800,
                          flexShrink: 0,
                          background: `linear-gradient(135deg, ${accentColor}, ${alpha(accentColor, 0.7)})`,
                          border: `2px solid ${alpha(accentColor, 0.3)}`,
                          color: isDark ? '#000' : '#fff',
                        }}
                      >
                        {iniciales(est.estudiante_apellidos, est.estudiante_nombres)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={800} noWrap sx={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
                          {est.estudiante_apellidos}, {est.estudiante_nombres}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {est.estudiante_codigo}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Bloque 2: Las 4 Dimensiones en pastillas (SIN porcentaje debajo) */}
                    <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center', flexShrink: 0 }}>
                      {/* SER */}
                      <Box
                        sx={{
                          width: 88,
                          height: 36,
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: alpha('#10b981', isDark ? 0.1 : 0.06),
                          border: `1px solid ${alpha('#10b981', 0.25)}`,
                        }}
                      >
                        <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: '#10b981' }}>
                          {est.ser_ponderada.toFixed(1)}
                        </Typography>
                      </Box>

                      {/* SABER */}
                      <Box
                        sx={{
                          width: 88,
                          height: 36,
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: alpha('#3b82f6', isDark ? 0.1 : 0.06),
                          border: `1px solid ${alpha('#3b82f6', 0.25)}`,
                        }}
                      >
                        <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: '#3b82f6' }}>
                          {est.saber_ponderada.toFixed(1)}
                        </Typography>
                      </Box>

                      {/* HACER */}
                      <Box
                        sx={{
                          width: 88,
                          height: 36,
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: alpha('#f59e0b', isDark ? 0.1 : 0.06),
                          border: `1px solid ${alpha('#f59e0b', 0.25)}`,
                        }}
                      >
                        <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: '#f59e0b' }}>
                          {est.hacer_ponderada.toFixed(1)}
                        </Typography>
                      </Box>

                      {/* AUTO */}
                      <Box
                        sx={{
                          width: 88,
                          height: 36,
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: alpha('#8b5cf6', isDark ? 0.1 : 0.06),
                          border: `1px solid ${alpha('#8b5cf6', 0.25)}`,
                        }}
                      >
                        <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: '#8b5cf6' }}>
                          {est.auto_ponderada.toFixed(1)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Bloque 3: NOTA FINAL */}
                    <Box sx={{ width: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Chip
                        label={`${est.nota_final.toFixed(1)} / 100`}
                        size="small"
                        sx={{
                          fontSize: 12.5,
                          height: 28,
                          fontWeight: 900,
                          bgcolor: alpha(colorNota, isDark ? 0.16 : 0.1),
                          color: colorNota,
                          border: `1.5px solid ${alpha(colorNota, 0.45)}`,
                          borderRadius: '9px',
                          cursor: 'default',
                        }}
                      />
                    </Box>

                    {/* Bloque 4: ESTADO */}
                    <Box sx={{ width: 105, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Chip
                        label={
                          est.estado === 'aprobado' ? 'Aprobado' :
                          est.estado === 'en_riesgo' ? 'En Riesgo' :
                          est.estado === 'reprobado' ? 'Reprobado' : 'Sin notas'
                        }
                        size="small"
                        icon={
                          est.estado === 'aprobado' ? <CheckCircleRoundedIcon sx={{ fontSize: '13px !important' }} /> :
                          est.estado === 'en_riesgo' ? <WarningAmberRoundedIcon sx={{ fontSize: '13px !important' }} /> :
                          <CancelRoundedIcon sx={{ fontSize: '13px !important' }} />
                        }
                        sx={{
                          fontSize: 11,
                          height: 26,
                          fontWeight: 700,
                          borderRadius: '8px',
                          bgcolor:
                            est.estado === 'aprobado' ? alpha('#10b981', 0.12) :
                            est.estado === 'en_riesgo' ? alpha('#f59e0b', 0.12) :
                            est.estado === 'reprobado' ? alpha('#ef4444', 0.12) : alpha('#94a3b8', 0.12),
                          color:
                            est.estado === 'aprobado' ? '#10b981' :
                            est.estado === 'en_riesgo' ? '#f59e0b' :
                            est.estado === 'reprobado' ? '#ef4444' : '#94a3b8',
                          border: `1px solid ${
                            est.estado === 'aprobado' ? alpha('#10b981', 0.3) :
                            est.estado === 'en_riesgo' ? alpha('#f59e0b', 0.3) :
                            est.estado === 'reprobado' ? alpha('#ef4444', 0.3) : alpha('#94a3b8', 0.3)
                          }`,
                        }}
                      />
                    </Box>

                    {/* Bloque 5: DETALLE */}
                    <Box sx={{ width: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Tooltip title="Ver desglose completo" arrow>
                        <IconButton
                          size="small"
                          onClick={() => setEstudianteModal(est)}
                          sx={{
                            width: 34,
                            height: 34,
                            borderRadius: '9px',
                            color: accentColor,
                            bgcolor: isDark ? alpha(accentColor, 0.1) : alpha(accentColor, 0.08),
                            border: `1px solid ${alpha(accentColor, 0.25)}`,
                            transition: 'all 0.15s ease',
                            '&:hover': {
                              bgcolor: alpha(accentColor, 0.2),
                              transform: 'scale(1.08)',
                            },
                          }}
                        >
                          <VisibilityRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* ══ Promedio de Curso (Card Footer Estilo Asistencia) ══ */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 1.5,
                borderRadius: '12px',
                border: `1.5px solid ${alpha(accentColor, isDark ? 0.2 : 0.15)}`,
                bgcolor: isDark ? alpha(accentColor, 0.04) : alpha(accentColor, 0.02),
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0, pl: 0.5 }}>
                <Typography
                  variant="caption"
                  fontWeight={800}
                  sx={{
                    color: isDark ? '#f8fafc' : '#0f172a',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: 11.5,
                  }}
                >
                  Promedio de curso
                </Typography>
              </Box>

              {/* Promedios por Dimensión */}
              <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center', flexShrink: 0 }}>
                <Box sx={{ width: 88, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#10b981' }}>
                    {stats.promSer} / {pctSer}
                  </Typography>
                </Box>
                <Box sx={{ width: 88, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#3b82f6' }}>
                    {stats.promSaber} / {pctSaber}
                  </Typography>
                </Box>
                <Box sx={{ width: 88, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#f59e0b' }}>
                    {stats.promHacer} / {pctHacer}
                  </Typography>
                </Box>
                <Box sx={{ width: 88, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#8b5cf6' }}>
                    {stats.promAuto} / {pctAuto}
                  </Typography>
                </Box>
              </Box>

              {/* Promedio General */}
              <Box sx={{ width: 110, textAlign: 'center', flexShrink: 0 }}>
                <Typography
                  sx={{
                    fontSize: 13.5,
                    fontWeight: 900,
                    color: colorNotaFinal(stats.promedioGeneral),
                  }}
                >
                  {stats.promedioGeneral} / 100
                </Typography>
              </Box>

              {/* Aprobados info */}
              <Box sx={{ width: 165, textAlign: 'center', flexShrink: 0 }}>
                <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 600 }}>
                  {stats.aprobados}/{consolidados.length} aprobados
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* ── 4. MODAL DE DESGLOSE INDIVIDUAL (Fondo 100% Opaco y Sólido) ── */}
      <Dialog
        open={Boolean(estudianteModal)}
        onClose={() => setEstudianteModal(null)}
        maxWidth="md"
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
            },
          },
        }}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            border: `1.5px solid ${alpha(accentColor, 0.35)}`,
            backgroundColor: isDark ? '#0f172a !important' : '#ffffff !important',
            backgroundImage: 'none !important',
            boxShadow: isDark
              ? '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 1px rgba(255,255,255,0.1)'
              : '0 20px 50px rgba(0, 0, 0, 0.15)',
            color: isDark ? '#f8fafc' : '#0f172a',
            overflow: 'hidden',
          },
        }}
      >
        {estudianteModal && (
          <>
            <DialogTitle sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
              p: 2.5,
              bgcolor: isDark ? '#1e293b' : '#f8fafc',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{
                  bgcolor: alpha(accentColor, 0.2), color: accentColor,
                  fontWeight: 800, width: 44, height: 44,
                  border: `2px solid ${alpha(accentColor, 0.4)}`,
                }}
                src={estudianteModal.estudiante_foto ?? undefined}
                >
                  {iniciales(estudianteModal.estudiante_apellidos, estudianteModal.estudiante_nombres)}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={800} sx={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
                    {estudianteModal.estudiante_apellidos}, {estudianteModal.estudiante_nombres}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Código: <strong>{estudianteModal.estudiante_codigo}</strong> · Nota Final: <strong style={{ color: colorNotaFinal(estudianteModal.nota_final) }}>{estudianteModal.nota_final} pts</strong>
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setEstudianteModal(null)} size="small" sx={{ color: 'text.secondary' }}>
                <CloseRoundedIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3, bgcolor: isDark ? '#0f172a' : '#ffffff' }}>
              {/* Tarjetas resumen por dimensión del estudiante */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 1.5, mb: 3 }}>
                {[
                  { label: `SER (${pctSer}%)`, val: estudianteModal.ser_ponderada, col: '#10b981' },
                  { label: `SABER (${pctSaber}%)`, val: estudianteModal.saber_ponderada, col: '#3b82f6' },
                  { label: `HACER (${pctHacer}%)`, val: estudianteModal.hacer_ponderada, col: '#f59e0b' },
                  { label: `AUTO (${pctAuto}%)`, val: estudianteModal.auto_ponderada, col: '#8b5cf6' },
                ].map(d => (
                  <Box key={d.label} sx={{
                    p: 1.8, borderRadius: '12px',
                    border: `1.5px solid ${alpha(d.col, 0.35)}`,
                    bgcolor: isDark ? '#1e293b' : '#f8fafc',
                    textAlign: 'center',
                  }}>
                    <Typography variant="caption" sx={{ fontSize: 11, fontWeight: 800, color: d.col, display: 'block' }}>
                      {d.label}
                    </Typography>
                    <Typography variant="h5" fontWeight={900} sx={{ color: d.col, my: 0.5 }}>
                      {d.val}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, color: isDark ? '#f8fafc' : '#0f172a' }}>
                <AssessmentRoundedIcon sx={{ fontSize: 18, color: accentColor }} />
                Desglose de Actividades Evaluativas ({estudianteModal.evaluacionesDetalle.length})
              </Typography>

              {/* Lista de actividades */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {estudianteModal.evaluacionesDetalle.map((ev) => {
                  const cfgDim = DIMENSIONES_CONFIG[ev.dimension_codigo];
                  const colDim = cfgDim?.color || accentColor;

                  return (
                    <Box
                      key={ev.evaluacion_id}
                      sx={{
                        p: 1.5, borderRadius: '10px',
                        border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                        bgcolor: isDark ? '#1e293b' : '#f8fafc',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Chip
                          label={ev.dimension_codigo}
                          size="small"
                          sx={{
                            fontSize: 10, height: 22, fontWeight: 800,
                            bgcolor: alpha(colDim, 0.15), color: colDim,
                            border: `1px solid ${alpha(colDim, 0.35)}`,
                          }}
                        />
                        <Box>
                          <Typography variant="body2" fontWeight={700} sx={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
                            {ev.nombre}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Puntaje máx: {ev.puntaje_maximo} pts · Peso: {ev.peso_en_dimension}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {ev.esta_ausente ? (
                          <Chip
                            icon={<PersonOffRoundedIcon sx={{ fontSize: 12 }} />}
                            label="Ausente (0 pts)"
                            size="small"
                            sx={{
                              bgcolor: alpha('#ef4444', 0.15),
                              color: '#ef4444',
                              fontWeight: 700,
                              fontSize: 11,
                            }}
                          />
                        ) : ev.puntaje_obtenido !== null ? (
                          <Typography variant="body2" fontWeight={800} sx={{ color: colorNotaFinal((ev.puntaje_obtenido / ev.puntaje_maximo) * 100) }}>
                            {ev.puntaje_obtenido} / {ev.puntaje_maximo} pts
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.disabled">
                            Sin calificar
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </DialogContent>

            <DialogActions sx={{
              p: 2,
              borderTop: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
              bgcolor: isDark ? '#1e293b' : '#f8fafc',
            }}>
              <Button
                onClick={() => setEstudianteModal(null)}
                variant="outlined"
                sx={{
                  color: accentColor,
                  borderColor: alpha(accentColor, 0.4),
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: '8px',
                  '&:hover': {
                    borderColor: accentColor,
                    bgcolor: alpha(accentColor, 0.1),
                  },
                }}
              >
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};
