'use client';
// client/src/components/admin/notas/EstudiantesCriticosTab.tsx
// Panel de Análisis de Estudiantes en Estado Crítico / Riesgo de Reprobación
// Basado en el rendimiento real del 1er y 2do Trimestre (T1 + T2) y proyección matemática para T3

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Tooltip,
  IconButton,
  Button,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  alpha,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Collapse,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  WarningAmberRounded as WarningAmberIcon,
  ErrorOutlineRounded as ErrorIcon,
  CheckCircleOutlineRounded as CheckCircleIcon,
  TrendingDownRounded as TrendingDownIcon,
  SchoolRounded as SchoolIcon,
  VisibilityRounded as VisibilityIcon,
  DownloadRounded as DownloadIcon,
  FilterListRounded as FilterListIcon,
  InfoOutlined as InfoIcon,
  HelpOutlineRounded as HelpIcon,
  CloseRounded as CloseIcon,
  ExpandMoreRounded as ExpandMoreIcon,
  ExpandLessRounded as ExpandLessIcon,
  CalculateRounded as CalculateIcon,
} from '@mui/icons-material';

import {
  CursoNotasData,
  EstudianteCursoNotas,
  MateriaCursoInfo,
} from '@/services/adminNotasService';

export interface EvaluacionMateriaEstudiante {
  materia_id: number;
  grado_materia_id: number;
  materia_nombre: string;
  materia_codigo: string;
  t1: number | null;
  t2: number | null;
  sumaT1T2: number;
  promedioT1T2: number | null;
  notaMinima: number;
  puntosNecesariosAnual: number;
  t3Requerido: number;
  estadoMateria: 'irrecuperable' | 'critico' | 'en_riesgo' | 'alcanzable' | 'aprobado_seguro' | 'sin_datos';
}

export interface AnalisisEstudiante {
  estudiante: EstudianteCursoNotas;
  promedioAcumuladoT1T2: number | null;
  materiasEvaluadas: EvaluacionMateriaEstudiante[];
  materiasEnRiesgo: EvaluacionMateriaEstudiante[];
  materiasIrrecuperables: EvaluacionMateriaEstudiante[];
  materiasCriticas: EvaluacionMateriaEstudiante[];
  estadoGeneral: 'critico' | 'alerta' | 'estable';
}

interface EstudiantesCriticosTabProps {
  cursoData: CursoNotasData;
  materiasConNotas: MateriaCursoInfo[];
  isDark: boolean;
  primary: string;
  gradBg: string;
  onVerBoletin: (estudiante: EstudianteCursoNotas) => void;
}

export const EstudiantesCriticosTab: React.FC<EstudiantesCriticosTabProps> = ({
  cursoData,
  materiasConNotas,
  isDark,
  primary,
  gradBg,
  onVerBoletin,
}) => {
  const theme = useTheme();

  // Estados de filtro y búsqueda
  const [filtroGravedad, setFiltroGravedad] = useState<'todos' | 'critico' | 'alerta' | 'estable'>('todos');
  const [busqueda, setBusqueda] = useState('');

  // Modal de Diagnóstico de Materias en Peligro
  const [estudianteModal, setEstudianteModal] = useState<AnalisisEstudiante | null>(null);
  const [mostrarMateriasSeguras, setMostrarMateriasSeguras] = useState(false);

  // ═════════════════════════════════════════════════════════════════════════
  // CÁLCULO DETERMINISTA DE ESTADO CRÍTICO (T1 + T2 -> T3)
  // ═════════════════════════════════════════════════════════════════════════
  const estudiantesAnalizados: AnalisisEstudiante[] = useMemo(() => {
    if (!cursoData || !cursoData.estudiantes || materiasConNotas.length === 0) return [];

    return cursoData.estudiantes.map((est) => {
      // Buscar notas de T1 y T2
      const tri1 = est.trimestres?.find((t) => t.periodo_orden === 1);
      const tri2 = est.trimestres?.find((t) => t.periodo_orden === 2);

      const materiasEvaluadas: EvaluacionMateriaEstudiante[] = materiasConNotas.map((mat) => {
        const mTri1 = tri1?.materias?.find(
          (m) => m.grado_materia_id === mat.grado_materia_id || m.materia_id === mat.materia_id
        );
        const mTri2 = tri2?.materias?.find(
          (m) => m.grado_materia_id === mat.grado_materia_id || m.materia_id === mat.materia_id
        );

        const t1 = mTri1?.nota_final != null ? Number(mTri1.nota_final) : null;
        const t2 = mTri2?.nota_final != null ? Number(mTri2.nota_final) : null;
        const notaMinima = Number(mat.nota_minima_aprobacion || 51);
        const puntosNecesariosAnual = notaMinima * 3;

        if (t1 == null && t2 == null) {
          return {
            materia_id: mat.materia_id,
            grado_materia_id: mat.grado_materia_id,
            materia_nombre: mat.materia_nombre,
            materia_codigo: mat.materia_codigo,
            t1: null,
            t2: null,
            sumaT1T2: 0,
            promedioT1T2: null,
            notaMinima,
            puntosNecesariosAnual,
            t3Requerido: notaMinima,
            estadoMateria: 'sin_datos',
          };
        }

        const suma = (t1 ?? 0) + (t2 ?? 0);
        const t3Requerido = Math.max(0, puntosNecesariosAnual - suma);
        const cantidadTrisConNota = (t1 != null ? 1 : 0) + (t2 != null ? 1 : 0);
        const promedioT1T2 = cantidadTrisConNota > 0 ? Math.round((suma / cantidadTrisConNota) * 10) / 10 : null;

        let estadoMateria: EvaluacionMateriaEstudiante['estadoMateria'] = 'alcanzable';

        if (t3Requerido > 100) {
          // Aunque saque 100 en T3, no alcanza a 153 (ej: 25 + 25 = 50 -> necesita 103)
          estadoMateria = 'irrecuperable';
        } else if (t3Requerido > 70) {
          // Necesita una nota muy alta (más de 70) en T3
          estadoMateria = 'critico';
        } else if (t3Requerido > notaMinima) {
          // Necesita más de la nota mínima (52 a 70) en T3
          estadoMateria = 'en_riesgo';
        } else if (t3Requerido <= 0) {
          // Ya superó los 153 puntos acumulados
          estadoMateria = 'aprobado_seguro';
        } else {
          // Con nota mínima (51 o menos) en T3 aprueba
          estadoMateria = 'alcanzable';
        }

        return {
          materia_id: mat.materia_id,
          grado_materia_id: mat.grado_materia_id,
          materia_nombre: mat.materia_nombre,
          materia_codigo: mat.materia_codigo,
          t1,
          t2,
          sumaT1T2: suma,
          promedioT1T2,
          notaMinima,
          puntosNecesariosAnual,
          t3Requerido,
          estadoMateria,
        };
      });

      // Materias en riesgo del alumno (donde necesita más de la nota mínima para aprobar, o irrecuperables)
      const materiasEnRiesgo = materiasEvaluadas.filter(
        (m) => m.estadoMateria === 'irrecuperable' || m.estadoMateria === 'critico' || m.estadoMateria === 'en_riesgo'
      );
      const materiasIrrecuperables = materiasEvaluadas.filter((m) => m.estadoMateria === 'irrecuperable');
      const materiasCriticas = materiasEvaluadas.filter((m) => m.estadoMateria === 'critico');

      // Promedio general de T1 y T2 en las materias evaluadas
      const conPromedio = materiasEvaluadas.filter((m) => m.promedioT1T2 != null);
      const promedioAcumuladoT1T2 =
        conPromedio.length > 0
          ? Math.round((conPromedio.reduce((acc, curr) => acc + (curr.promedioT1T2 || 0), 0) / conPromedio.length) * 10) / 10
          : null;

      // Diagnóstico general del alumno:
      // - CRÍTICO: 2 o más materias en riesgo, o 1 irrecuperable, o promedio general < 51
      // - ALERTA: exactamente 1 materia en riesgo
      // - ESTABLE: 0 materias en riesgo
      let estadoGeneral: 'critico' | 'alerta' | 'estable' = 'estable';
      if (
        materiasEnRiesgo.length >= 2 ||
        materiasIrrecuperables.length >= 1 ||
        (promedioAcumuladoT1T2 != null && promedioAcumuladoT1T2 < 51)
      ) {
        estadoGeneral = 'critico';
      } else if (materiasEnRiesgo.length === 1) {
        estadoGeneral = 'alerta';
      } else {
        estadoGeneral = 'estable';
      }

      return {
        estudiante: est,
        promedioAcumuladoT1T2,
        materiasEvaluadas,
        materiasEnRiesgo,
        materiasIrrecuperables,
        materiasCriticas,
        estadoGeneral,
      };
    });
  }, [cursoData, materiasConNotas]);

  // ═════════════════════════════════════════════════════════════════════════
  // ESTADÍSTICAS GLOBALES DEL CURSO
  // ═════════════════════════════════════════════════════════════════════════
  const estadisticas = useMemo(() => {
    const total = estudiantesAnalizados.length;
    const criticos = estudiantesAnalizados.filter((e) => e.estadoGeneral === 'critico').length;
    const alerta = estudiantesAnalizados.filter((e) => e.estadoGeneral === 'alerta').length;
    const estables = estudiantesAnalizados.filter((e) => e.estadoGeneral === 'estable').length;

    // Conteo de materias con más estudiantes en riesgo
    const conteoMaterias: Record<string, { nombre: string; totalRiesgo: number; irrecuperables: number }> = {};
    materiasConNotas.forEach((m) => {
      conteoMaterias[m.materia_codigo || m.materia_nombre] = {
        nombre: m.materia_nombre,
        totalRiesgo: 0,
        irrecuperables: 0,
      };
    });

    estudiantesAnalizados.forEach((e) => {
      e.materiasEnRiesgo.forEach((m) => {
        const key = m.materia_codigo || m.materia_nombre;
        if (conteoMaterias[key]) {
          conteoMaterias[key].totalRiesgo += 1;
          if (m.estadoMateria === 'irrecuperable') {
            conteoMaterias[key].irrecuperables += 1;
          }
        }
      });
    });

    const materiasRanking = Object.values(conteoMaterias)
      .filter((m) => m.totalRiesgo > 0)
      .sort((a, b) => b.totalRiesgo - a.totalRiesgo)
      .slice(0, 4);

    return {
      total,
      criticos,
      alerta,
      estables,
      materiasRanking,
    };
  }, [estudiantesAnalizados, materiasConNotas]);

  // ═════════════════════════════════════════════════════════════════════════
  // FILTRADO DE LA TABLA
  // ═════════════════════════════════════════════════════════════════════════
  const estudiantesFiltrados = useMemo(() => {
    return estudiantesAnalizados.filter((item) => {
      // Filtro por gravedad
      if (filtroGravedad !== 'todos' && item.estadoGeneral !== filtroGravedad) {
        return false;
      }

      // Filtro por búsqueda
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim();
        const est = item.estudiante;
        const matchNombre = est.nombre_completo.toLowerCase().includes(q);
        const matchCI = est.ci?.toLowerCase().includes(q);
        const matchCodigo = est.codigo?.toLowerCase().includes(q);
        return matchNombre || matchCI || matchCodigo;
      }

      return true;
    });
  }, [estudiantesAnalizados, filtroGravedad, busqueda]);

  // Exportar a CSV de estudiantes críticos
  const handleExportarInforme = () => {
    if (estudiantesAnalizados.length === 0) return;

    const headers = [
      '"Nro"',
      '"CI"',
      '"Estudiante"',
      '"Estado"',
      '"Promedio T1+T2"',
      '"Materias en Riesgo"',
      '"Detalle Materias Comprometidas (T1 | T2 -> Requerido T3)"',
    ].join(',');

    const rows = estudiantesFiltrados.map((item, idx) => {
      const est = item.estudiante;
      const detalle = item.materiasEnRiesgo
        .map(
          (m) =>
            `${m.materia_nombre} [T1: ${m.t1 ?? '-'}, T2: ${m.t2 ?? '-'} -> Nec. T3: ${m.estadoMateria === 'irrecuperable' ? 'IRRECUPERABLE (' + m.t3Requerido + ')' : m.t3Requerido
            }]`
        )
        .join('; ');

      return [
        idx + 1,
        `"${est.ci || ''}"`,
        `"${est.nombre_completo.replace(/"/g, '""')}"`,
        `"${item.estadoGeneral.toUpperCase()}"`,
        item.promedioAcumuladoT1T2 ?? '',
        item.materiasEnRiesgo.length,
        `"${detalle.replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Estudiantes_Criticos_${cursoData.curso.grado_nombre}_${cursoData.curso.paralelo_nombre}_T1_T2.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      {/* ══ TARJETAS DE IMPACTO Y SEMÁFORO DEL CURSO ══ */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Card 1: Críticos */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              borderRadius: 3,
              p: 2.2,
              bgcolor: isDark ? alpha('#ef4444', 0.08) : '#fff5f5',
              border: `1.5px solid ${alpha('#ef4444', 0.3)}`,
              boxShadow: `0 4px 18px ${alpha('#ef4444', 0.12)}`,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
              <Typography variant="caption" fontWeight={800} color="#ef4444" textTransform="uppercase" letterSpacing={0.5}>
                Estado Crítico (2+ Mat.)
              </Typography>
              <Avatar sx={{ bgcolor: alpha('#ef4444', 0.18), color: '#ef4444', width: 34, height: 34 }}>
                <ErrorIcon sx={{ fontSize: 20 }} />
              </Avatar>
            </Box>
            <Typography variant="h3" fontWeight={900} color="#ef4444">
              {estadisticas.criticos}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {estadisticas.total > 0
                ? `${((estadisticas.criticos / estadisticas.total) * 100).toFixed(1)}% del curso en riesgo inminente`
                : 'Sin estudiantes'}
            </Typography>
          </Card>
        </Grid>

        {/* Card 2: En Alerta */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              borderRadius: 3,
              p: 2.2,
              bgcolor: isDark ? alpha('#f59e0b', 0.08) : '#fffbeb',
              border: `1.5px solid ${alpha('#f59e0b', 0.3)}`,
              boxShadow: `0 4px 18px ${alpha('#f59e0b', 0.12)}`,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
              <Typography variant="caption" fontWeight={800} color="#f59e0b" textTransform="uppercase" letterSpacing={0.5}>
                En Alerta (1 Materia)
              </Typography>
              <Avatar sx={{ bgcolor: alpha('#f59e0b', 0.18), color: '#f59e0b', width: 34, height: 34 }}>
                <WarningAmberIcon sx={{ fontSize: 20 }} />
              </Avatar>
            </Box>
            <Typography variant="h3" fontWeight={900} color="#f59e0b">
              {estadisticas.alerta}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {estadisticas.total > 0
                ? `${((estadisticas.alerta / estadisticas.total) * 100).toFixed(1)}% recuperables en 3er trimestre`
                : 'Sin estudiantes'}
            </Typography>
          </Card>
        </Grid>

        {/* Card 3: Estables */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              borderRadius: 3,
              p: 2.2,
              bgcolor: isDark ? alpha('#10b981', 0.08) : '#f0fdf4',
              border: `1.5px solid ${alpha('#10b981', 0.3)}`,
              boxShadow: `0 4px 18px ${alpha('#10b981', 0.12)}`,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
              <Typography variant="caption" fontWeight={800} color="#10b981" textTransform="uppercase" letterSpacing={0.5}>
                Estables / Buen Camino
              </Typography>
              <Avatar sx={{ bgcolor: alpha('#10b981', 0.18), color: '#10b981', width: 34, height: 34 }}>
                <CheckCircleIcon sx={{ fontSize: 20 }} />
              </Avatar>
            </Box>
            <Typography variant="h3" fontWeight={900} color="#10b981">
              {estadisticas.estables}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {estadisticas.total > 0
                ? `${((estadisticas.estables / estadisticas.total) * 100).toFixed(1)}% con notas aprobatorias`
                : 'Sin estudiantes'}
            </Typography>
          </Card>
        </Grid>

        {/* Card 4: Materias en Conflicto */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              borderRadius: 3,
              p: 2.2,
              bgcolor: isDark ? alpha('#6366f1', 0.08) : '#eef2ff',
              border: `1.5px solid ${alpha('#6366f1', 0.3)}`,
              boxShadow: `0 4px 18px ${alpha('#6366f1', 0.12)}`,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
              <Typography variant="caption" fontWeight={800} color="#6366f1" textTransform="uppercase" letterSpacing={0.5}>
                Materias Más Críticas
              </Typography>
              <Avatar sx={{ bgcolor: alpha('#6366f1', 0.18), color: '#6366f1', width: 34, height: 34 }}>
                <TrendingDownIcon sx={{ fontSize: 20 }} />
              </Avatar>
            </Box>
            {estadisticas.materiasRanking.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1 }}>
                ¡Ninguna materia en riesgo en este curso!
              </Typography>
            ) : (
              <Stack spacing={0.6} sx={{ mt: 0.5 }}>
                {estadisticas.materiasRanking.map((m) => (
                  <Box key={m.nombre} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" fontWeight={700} noWrap sx={{ maxWidth: 140 }}>
                      {m.nombre}
                    </Typography>
                    <Chip
                      size="small"
                      label={`${m.totalRiesgo} en riesgo`}
                      sx={{
                        fontSize: '0.68rem',
                        height: 20,
                        fontWeight: 800,
                        bgcolor: alpha('#ef4444', 0.15),
                        color: '#ef4444',
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* ══ EXPLICACIÓN DIDÁCTICA DEL CÁLCULO ══ */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2.5,
          bgcolor: isDark ? alpha('#fff', 0.02) : '#f8fafc',
          border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.07)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <InfoIcon sx={{ color: primary, fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={800}>
              Fórmula de Proyección Trimestral (T1 + T2 → T3)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Para aprobar el año escolar, el promedio anual debe ser &ge; 51 (Total acumulado &ge; 153 puntos).
              La nota requerida en T3 es: <strong>153 &minus; (T1 + T2)</strong>. Si la nota requerida supera los 100 puntos, es matemáticamente irrecuperable.
            </Typography>
          </Box>
        </Box>
        <Chip
          size="small"
          label={`${materiasConNotas.length} materias con calificaciones analizadas`}
          sx={{ fontWeight: 700, bgcolor: alpha(primary, 0.12), color: primary, border: `1px solid ${alpha(primary, 0.3)}` }}
        />
      </Paper>

      {/* ══ BARRA DE HERRAMIENTAS Y FILTROS DE LA TABLA ══ */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 2.5,
        }}
      >
        {/* Selector de gravedad */}
        <ToggleButtonGroup
          size="small"
          value={filtroGravedad}
          exclusive
          onChange={(_, val) => val && setFiltroGravedad(val)}
          sx={{
            bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03),
            borderRadius: 2,
            '& .MuiToggleButton-root': {
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 700,
              px: 2,
              py: 0.7,
              fontSize: '0.82rem',
              border: 'none',
              '&.Mui-selected': {
                bgcolor:
                  filtroGravedad === 'critico'
                    ? '#ef4444'
                    : filtroGravedad === 'alerta'
                      ? '#f59e0b'
                      : filtroGravedad === 'estable'
                        ? '#10b981'
                        : primary,
                color: isDark && filtroGravedad === 'todos' ? '#000' : '#fff',
                '&:hover': {
                  bgcolor:
                    filtroGravedad === 'critico'
                      ? '#dc2626'
                      : filtroGravedad === 'alerta'
                        ? '#d97706'
                        : filtroGravedad === 'estable'
                          ? '#059669'
                          : primary,
                },
              },
            },
          }}
        >
          <ToggleButton value="todos">Todos ({estadisticas.total})</ToggleButton>
          <ToggleButton value="critico">Críticos ({estadisticas.criticos})</ToggleButton>
          <ToggleButton value="alerta">En Alerta ({estadisticas.alerta})</ToggleButton>
          <ToggleButton value="estable">Estables ({estadisticas.estables})</ToggleButton>
        </ToggleButtonGroup>

        {/* Buscador y Exportación */}
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <TextField
            size="small"
            placeholder="Buscar por estudiante o CI..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 2, minWidth: { xs: '100%', sm: 260 } },
            }}
          />

          <Tooltip title="Exportar informe en CSV">
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleExportarInforme}
              disabled={estudiantesFiltrados.length === 0}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                borderColor: alpha(primary, 0.4),
                color: primary,
                whiteSpace: 'nowrap',
                '&:hover': { borderColor: primary, bgcolor: alpha(primary, 0.08) },
              }}
            >
              Exportar
            </Button>
          </Tooltip>
        </Stack>
      </Box>

      {/* ══ TABLA PRINCIPAL DE ESTUDIANTES CRÍTICOS ══ */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
          bgcolor: isDark ? alpha('#fff', 0.015) : '#ffffff',
          overflow: 'hidden',
          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 18px rgba(0,0,0,0.03)',
        }}
      >
        <Table size="small">
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
              <TableCell align="center" sx={{ minWidth: 120 }}>
                Estado General
              </TableCell>
              <TableCell align="center" sx={{ minWidth: 100 }}>
                Prom. T1+T2
              </TableCell>
              <TableCell align="center" sx={{ minWidth: 90 }}>
                Mat. en Riesgo
              </TableCell>
              <TableCell sx={{ minWidth: 380 }}>Detalle de Materias Comprometidas (T1 | T2 → Necesita en T3)</TableCell>
              <TableCell align="center" sx={{ minWidth: 90, pr: 2 }}>
                Acción
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {estudiantesFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" fontWeight={700} color="text.secondary">
                    No se encontraron estudiantes para los filtros seleccionados
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    Prueba cambiando el filtro de gravedad o el término de búsqueda
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              estudiantesFiltrados.map((item, idx) => {
                const est = item.estudiante;
                const esCritico = item.estadoGeneral === 'critico';
                const esAlerta = item.estadoGeneral === 'alerta';

                return (
                  <TableRow
                    key={est.estudiante_id}
                    sx={{
                      '& td': {
                        py: 1.3,
                        borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.05)}`,
                      },
                      bgcolor: esCritico
                        ? isDark
                          ? alpha('#ef4444', 0.04)
                          : alpha('#ef4444', 0.02)
                        : esAlerta
                          ? isDark
                            ? alpha('#f59e0b', 0.03)
                            : alpha('#f59e0b', 0.015)
                          : 'inherit',
                      '&:hover': {
                        bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                      },
                    }}
                  >
                    {/* Número */}
                    <TableCell sx={{ pl: 2, fontWeight: 700, color: 'text.disabled', fontSize: 12 }}>
                      {idx + 1}
                    </TableCell>

                    {/* Estudiante */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Avatar
                          src={est.foto_url || undefined}
                          sx={{
                            width: 32,
                            height: 32,
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            bgcolor: esCritico
                              ? alpha('#ef4444', 0.2)
                              : esAlerta
                                ? alpha('#f59e0b', 0.2)
                                : alpha('#10b981', 0.2),
                            color: esCritico ? '#ef4444' : esAlerta ? '#f59e0b' : '#10b981',
                          }}
                        >
                          {est.nombres.charAt(0)}
                        </Avatar>
                        <Box
                          onClick={() => {
                            setEstudianteModal(item);
                            setMostrarMateriasSeguras(false);
                          }}
                          sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                        >
                          <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.86rem', lineHeight: 1.2 }}>
                            {est.nombre_completo}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                            CI: {est.ci || est.codigo || '—'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Estado General Badge */}
                    <TableCell align="center">
                      {esCritico ? (
                        <Chip
                          size="small"
                          icon={<ErrorIcon sx={{ fontSize: '14px !important', color: '#ef4444' }} />}
                          label="CRÍTICO (2+ MAT)"
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.68rem',
                            bgcolor: alpha('#ef4444', 0.15),
                            color: '#ef4444',
                            border: `1px solid ${alpha('#ef4444', 0.3)}`,
                          }}
                        />
                      ) : esAlerta ? (
                        <Chip
                          size="small"
                          icon={<WarningAmberIcon sx={{ fontSize: '14px !important', color: '#f59e0b' }} />}
                          label="EN ALERTA (1 MAT)"
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.68rem',
                            bgcolor: alpha('#f59e0b', 0.15),
                            color: '#f59e0b',
                            border: `1px solid ${alpha('#f59e0b', 0.3)}`,
                          }}
                        />
                      ) : (
                        <Chip
                          size="small"
                          icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: '#10b981' }} />}
                          label="ESTABLE"
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.68rem',
                            bgcolor: alpha('#10b981', 0.15),
                            color: '#10b981',
                            border: `1px solid ${alpha('#10b981', 0.3)}`,
                          }}
                        />
                      )}
                    </TableCell>

                    {/* Promedio T1+T2 */}
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.2,
                          py: 0.3,
                          borderRadius: 1.5,
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          bgcolor:
                            (item.promedioAcumuladoT1T2 ?? 0) >= 51
                              ? alpha('#10b981', 0.15)
                              : alpha('#ef4444', 0.15),
                          color:
                            (item.promedioAcumuladoT1T2 ?? 0) >= 51
                              ? '#10b981'
                              : '#ef4444',
                        }}
                      >
                        {item.promedioAcumuladoT1T2 != null ? item.promedioAcumuladoT1T2 : '—'}
                      </Box>
                    </TableCell>

                    {/* Cantidad de materias en riesgo */}
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={item.materiasEnRiesgo.length}
                        sx={{
                          fontWeight: 900,
                          bgcolor:
                            item.materiasEnRiesgo.length >= 2
                              ? alpha('#ef4444', 0.2)
                              : item.materiasEnRiesgo.length === 1
                                ? alpha('#f59e0b', 0.2)
                                : alpha('#10b981', 0.1),
                          color:
                            item.materiasEnRiesgo.length >= 2
                              ? '#ef4444'
                              : item.materiasEnRiesgo.length === 1
                                ? '#f59e0b'
                                : '#10b981',
                          minWidth: 28,
                        }}
                      />
                    </TableCell>

                    {/* Detalle de materias comprometidas */}
                    <TableCell>
                      {item.materiasEnRiesgo.length === 0 ? (
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          Todas las materias aprobando holgadamente (&le; 51 requeridos en T3)
                        </Typography>
                      ) : (
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {item.materiasEnRiesgo.map((mat) => {
                            const esIrrecuperable = mat.estadoMateria === 'irrecuperable';
                            const esCritica = mat.estadoMateria === 'critico';
                            const badgeColor = esIrrecuperable ? '#ef4444' : esCritica ? '#f59e0b' : '#3b82f6';

                            const tooltipText = `T1: ${mat.t1 ?? 'Sin nota'} | T2: ${mat.t2 ?? 'Sin nota'} (Suma: ${mat.sumaT1T2}/153). ${esIrrecuperable
                              ? '⛔ IRRECUPERABLE: Necesita más de 100 en T3'
                              : `Necesita sacar mínimo ${mat.t3Requerido} puntos en T3 para aprobar la materia con 51.`
                              }`;

                            return (
                              <Tooltip key={mat.materia_id} title={tooltipText} arrow>
                                <Chip
                                  size="small"
                                  label={
                                    <span>
                                      <strong>{mat.materia_nombre}</strong>:{' '}
                                      {esIrrecuperable ? (
                                        <span style={{ color: '#ef4444', fontWeight: 900 }}>Irrecuperable ({mat.t3Requerido})</span>
                                      ) : (
                                        <span>Nec. {mat.t3Requerido} en T3</span>
                                      )}
                                    </span>
                                  }
                                  sx={{
                                    fontSize: '0.72rem',
                                    height: 24,
                                    borderRadius: 1.5,
                                    bgcolor: alpha(badgeColor, isDark ? 0.2 : 0.1),
                                    border: `1px solid ${alpha(badgeColor, 0.4)}`,
                                    color: badgeColor,
                                    fontWeight: 600,
                                    cursor: 'help',
                                    '&:hover': {
                                      bgcolor: alpha(badgeColor, 0.3),
                                    },
                                  }}
                                />
                              </Tooltip>
                            );
                          })}
                        </Box>
                      )}
                    </TableCell>

                    {/* Botón Acción: Ver Diagnóstico de Materias en Peligro */}
                    <TableCell align="center" sx={{ pr: 2 }}>
                      <Tooltip title="Ver qué materias peligra, por qué y cuánto necesita para aprobar">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VisibilityIcon sx={{ fontSize: 16 }} />}
                          onClick={() => {
                            setEstudianteModal(item);
                            setMostrarMateriasSeguras(false);
                          }}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.74rem',
                            borderColor: alpha(primary, 0.35),
                            color: primary,
                            py: 0.5,
                            px: 1.25,
                            whiteSpace: 'nowrap',
                            '&:hover': {
                              borderColor: primary,
                              bgcolor: alpha(primary, 0.1),
                            },
                          }}
                        >
                          Diagnóstico
                        </Button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* MODAL DE DIAGNÓSTICO: QUÉ MATERIAS PELIGRA, POR QUÉ Y CUÁNTO NECESITA */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={Boolean(estudianteModal)}
        onClose={() => setEstudianteModal(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3.5,
            bgcolor: isDark ? '#11141a' : '#ffffff',
            backgroundImage: 'none',
            border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
            boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.7)' : '0 20px 60px rgba(0,0,0,0.15)',
            maxHeight: '90vh',
          },
        }}
      >
        {estudianteModal && (
          <>
            {/* Header del Modal */}
            <DialogTitle
              sx={{
                p: 2.5,
                pb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={estudianteModal.estudiante.foto_url || undefined}
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor:
                      estudianteModal.estadoGeneral === 'critico'
                        ? '#ef4444'
                        : estudianteModal.estadoGeneral === 'alerta'
                          ? '#f59e0b'
                          : '#10b981',
                    color: '#fff',
                    fontWeight: 900,
                    fontSize: '1.2rem',
                    boxShadow: `0 4px 14px ${alpha(
                      estudianteModal.estadoGeneral === 'critico'
                        ? '#ef4444'
                        : estudianteModal.estadoGeneral === 'alerta'
                          ? '#f59e0b'
                          : '#10b981',
                      0.4
                    )}`,
                  }}
                >
                  {estudianteModal.estudiante.nombres.charAt(0)}
                </Avatar>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1.2 }}>
                      {estudianteModal.estudiante.nombre_completo}
                    </Typography>
                    <Chip
                      size="small"
                      label={
                        estudianteModal.estadoGeneral === 'critico'
                          ? '🔴 Estado Crítico'
                          : estudianteModal.estadoGeneral === 'alerta'
                            ? '🟡 En Alerta'
                            : '🟢 Rendimiento Favorable'
                      }
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.74rem',
                        height: 24,
                        bgcolor: alpha(
                          estudianteModal.estadoGeneral === 'critico'
                            ? '#ef4444'
                            : estudianteModal.estadoGeneral === 'alerta'
                              ? '#f59e0b'
                              : '#10b981',
                          0.15
                        ),
                        color:
                          estudianteModal.estadoGeneral === 'critico'
                            ? '#ef4444'
                            : estudianteModal.estadoGeneral === 'alerta'
                              ? '#f59e0b'
                              : '#10b981',
                        border: `1px solid ${alpha(
                          estudianteModal.estadoGeneral === 'critico'
                            ? '#ef4444'
                            : estudianteModal.estadoGeneral === 'alerta'
                              ? '#f59e0b'
                              : '#10b981',
                          0.35
                        )}`,
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              <IconButton
                onClick={() => setEstudianteModal(null)}
                size="small"
                sx={{
                  color: 'text.secondary',
                  bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                  '&:hover': { bgcolor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1) },
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 2.5, overflowY: 'auto' }}>
              {/* Tarjetas Resumen KPIs del Estudiante */}
              <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 2.5,
                      border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                      bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(primary, 0.12),
                        color: primary,
                      }}
                    >
                      <TrendingDownIcon />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        Promedio T1 + T2
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={900}
                        color={(estudianteModal.promedioAcumuladoT1T2 ?? 0) >= 51 ? '#10b981' : '#ef4444'}
                      >
                        {estudianteModal.promedioAcumuladoT1T2 != null ? `${estudianteModal.promedioAcumuladoT1T2} pts` : '—'}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 6, sm: 4 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 2.5,
                      border: `1px solid ${alpha(estudianteModal.materiasEnRiesgo.length > 0 ? '#ef4444' : '#10b981', 0.25)}`,
                      bgcolor: alpha(estudianteModal.materiasEnRiesgo.length > 0 ? '#ef4444' : '#10b981', isDark ? 0.08 : 0.04),
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(estudianteModal.materiasEnRiesgo.length > 0 ? '#ef4444' : '#10b981', 0.15),
                        color: estudianteModal.materiasEnRiesgo.length > 0 ? '#ef4444' : '#10b981',
                      }}
                    >
                      <WarningAmberIcon />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        Materias en Peligro
                      </Typography>
                      <Typography variant="h6" fontWeight={900} color={estudianteModal.materiasEnRiesgo.length > 0 ? '#ef4444' : '#10b981'}>
                        {estudianteModal.materiasEnRiesgo.length} <Typography component="span" variant="caption" color="text.secondary">/ {estudianteModal.materiasEvaluadas.length}</Typography>
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 6, sm: 4 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 2.5,
                      border: `1px solid ${alpha(estudianteModal.materiasIrrecuperables.length > 0 ? '#991b1b' : '#3b82f6', 0.25)}`,
                      bgcolor: alpha(estudianteModal.materiasIrrecuperables.length > 0 ? '#991b1b' : '#3b82f6', isDark ? 0.08 : 0.04),
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(estudianteModal.materiasIrrecuperables.length > 0 ? '#991b1b' : '#3b82f6', 0.15),
                        color: estudianteModal.materiasIrrecuperables.length > 0 ? '#ef4444' : '#3b82f6',
                      }}
                    >
                      <ErrorIcon />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        Irrecuperables (&gt; 100)
                      </Typography>
                      <Typography variant="h6" fontWeight={900} color={estudianteModal.materiasIrrecuperables.length > 0 ? '#ef4444' : 'text.primary'}>
                        {estudianteModal.materiasIrrecuperables.length} materias
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* Regla de Evaluación y Nota Necesaria */}
              <Alert
                severity="info"
                icon={<CalculateIcon />}
                sx={{
                  mb: 2.5,
                  borderRadius: 2.5,
                  fontSize: '0.84rem',
                  lineHeight: 1.45,
                  bgcolor: isDark ? alpha('#3b82f6', 0.1) : alpha('#3b82f6', 0.08),
                  color: isDark ? '#93c5fd' : '#1e40af',
                  border: `1px solid ${alpha('#3b82f6', 0.25)}`,
                  '& .MuiAlert-icon': { color: '#3b82f6' },
                }}
              >
                <strong>Regla de Aprobación Oficial:</strong> Cada materia requiere una nota mínima final de <strong>51 puntos</strong> (un total acumulado de <strong>153 puntos</strong> entre los 3 trimestres: T1 + T2 + T3 &ge; 153). A continuación se analizan las materias donde el acumulado actual exige un esfuerzo extraordinario en el 3er Trimestre o donde matemáticamente ya no es posible aprobar.
              </Alert>

              {/* SECCIÓN PRINCIPAL: QUÉ MATERIAS PELIGRA, POR QUÉ Y CUÁNTO NECESITA */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={900} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <WarningAmberIcon sx={{ color: estudianteModal.materiasEnRiesgo.length > 0 ? '#ef4444' : '#10b981' }} />
                  {estudianteModal.materiasEnRiesgo.length > 0
                    ? `Materias en Riesgo de Reprobación (${estudianteModal.materiasEnRiesgo.length})`
                    : 'Sin Materias en Riesgo'}
                </Typography>

                {estudianteModal.materiasEnRiesgo.length === 0 ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      borderRadius: 3,
                      border: `1px solid ${alpha('#10b981', 0.3)}`,
                      bgcolor: alpha('#10b981', isDark ? 0.08 : 0.04),
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 44, color: '#10b981', mb: 1 }} />
                    <Typography variant="h6" fontWeight={800} color="#10b981" gutterBottom>
                      ¡Este estudiante no tiene materias en peligro!
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 540, mx: 'auto' }}>
                      En todas las materias evaluadas durante el 1er y 2do trimestre, el estudiante mantiene un acumulado que le permite aprobar el año obteniendo una calificación regular de 51 puntos o menos en el 3er Trimestre.
                    </Typography>
                  </Paper>
                ) : (
                  <Stack spacing={2}>
                    {estudianteModal.materiasEnRiesgo.map((mat) => {
                      const esIrrecuperable = mat.estadoMateria === 'irrecuperable';
                      const esCritica = mat.estadoMateria === 'critico';
                      const colorSeveridad = esIrrecuperable ? '#ef4444' : esCritica ? '#ea580c' : '#f59e0b';
                      const porcentajeAcumulado = Math.min(100, Math.round((mat.sumaT1T2 / 153) * 100));

                      return (
                        <Card
                          key={mat.materia_id}
                          elevation={0}
                          sx={{
                            borderRadius: 3,
                            border: `1.5px solid ${alpha(colorSeveridad, 0.4)}`,
                            bgcolor: isDark ? alpha(colorSeveridad, 0.04) : alpha(colorSeveridad, 0.02),
                            overflow: 'hidden',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {/* Header de la materia */}
                          <Box
                            sx={{
                              p: 2,
                              pb: 1.5,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: 1,
                              bgcolor: alpha(colorSeveridad, isDark ? 0.12 : 0.06),
                              borderBottom: `1px solid ${alpha(colorSeveridad, 0.2)}`,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                              <Box
                                sx={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: 2,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  bgcolor: colorSeveridad,
                                  color: '#fff',
                                  fontWeight: 900,
                                }}
                              >
                                {esIrrecuperable ? '⛔' : esCritica ? '🔴' : '⚠️'}
                              </Box>
                              <Box>
                                <Typography variant="subtitle1" fontWeight={900}>
                                  {mat.materia_nombre}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Código: {mat.materia_codigo || '—'} · Mínimo Aprobación: {mat.notaMinima} pts
                                </Typography>
                              </Box>
                            </Box>

                            <Chip
                              label={
                                esIrrecuperable
                                  ? '⛔ MATEMÁTICAMENTE IRRECUPERABLE'
                                  : esCritica
                                    ? '🔴 RIESGO CRÍTICO (Requiere > 70)'
                                    : '🟡 EN RIESGO (Requiere > 51)'
                              }
                              sx={{
                                fontWeight: 900,
                                fontSize: '0.74rem',
                                bgcolor: alpha(colorSeveridad, 0.18),
                                color: colorSeveridad,
                                border: `1px solid ${alpha(colorSeveridad, 0.4)}`,
                              }}
                            />
                          </Box>

                          <CardContent sx={{ p: 2 }}>
                            <Grid container spacing={2}>
                              {/* COLUMNA 1: ¿POR QUÉ PELIGRA? */}
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Box
                                  sx={{
                                    p: 1.75,
                                    height: '100%',
                                    borderRadius: 2.5,
                                    bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                                    border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    fontWeight={900}
                                    color={colorSeveridad}
                                    sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}
                                  >
                                    ¿Por qué está en peligro?
                                  </Typography>

                                  {/* Resumen de notas previas */}
                                  <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                                    <Box
                                      sx={{
                                        px: 1.25,
                                        py: 0.5,
                                        borderRadius: 1.5,
                                        bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                                        textAlign: 'center',
                                      }}
                                    >
                                      <Typography variant="caption" color="text.secondary" display="block">1er Trim</Typography>
                                      <Typography variant="body2" fontWeight={800} color={(mat.t1 ?? 0) >= 51 ? '#10b981' : '#ef4444'}>
                                        {mat.t1 != null ? `${mat.t1} pts` : 'Sin nota'}
                                      </Typography>
                                    </Box>
                                    <Box
                                      sx={{
                                        px: 1.25,
                                        py: 0.5,
                                        borderRadius: 1.5,
                                        bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                                        textAlign: 'center',
                                      }}
                                    >
                                      <Typography variant="caption" color="text.secondary" display="block">2do Trim</Typography>
                                      <Typography variant="body2" fontWeight={800} color={(mat.t2 ?? 0) >= 51 ? '#10b981' : '#ef4444'}>
                                        {mat.t2 != null ? `${mat.t2} pts` : 'Sin nota'}
                                      </Typography>
                                    </Box>
                                    <Box
                                      sx={{
                                        px: 1.25,
                                        py: 0.5,
                                        borderRadius: 1.5,
                                        bgcolor: alpha(colorSeveridad, 0.1),
                                        textAlign: 'center',
                                      }}
                                    >
                                      <Typography variant="caption" color="text.secondary" display="block">Acumulado</Typography>
                                      <Typography variant="body2" fontWeight={900} color={colorSeveridad}>
                                        {mat.sumaT1T2} / 153 pts
                                      </Typography>
                                    </Box>
                                  </Box>

                                  {/* Diagnóstico explicativo */}
                                  <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.45, fontSize: '0.84rem' }}>
                                    {esIrrecuperable ? (
                                      <>
                                        El estudiante obtuvo un acumulado muy bajo de <strong>{mat.sumaT1T2} puntos</strong> entre T1 y T2 (promedio de <strong>{mat.promedioT1T2} pts</strong>).
                                        Arrastra un déficit de <strong>{153 - mat.sumaT1T2} puntos</strong> respecto a los 153 mínimos requeridos.
                                      </>
                                    ) : esCritica ? (
                                      <>
                                        El estudiante acumula solamente <strong>{mat.sumaT1T2} puntos</strong> de los 153 necesarios (promedio parcial de <strong>{mat.promedioT1T2} pts</strong>).
                                        Debido a las bajas notas de los dos primeros trimestres, quedó con un margen de maniobra extremadamente estrecho para el cierre del año.
                                      </>
                                    ) : (
                                      <>
                                        El estudiante acumula <strong>{mat.sumaT1T2} puntos</strong> (promedio parcial de <strong>{mat.promedioT1T2} pts</strong>).
                                        No alcanzó el ritmo base de 51 puntos por trimestre, por lo que necesita un 3er trimestre con nota por encima del mínimo para compensar.
                                      </>
                                    )}
                                  </Typography>

                                  {/* Barra visual de puntos acumulados */}
                                  <Box sx={{ mt: 1.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                      <Typography variant="caption" color="text.secondary">
                                        Progreso hacia la meta (153 pts)
                                      </Typography>
                                      <Typography variant="caption" fontWeight={800} color={colorSeveridad}>
                                        {mat.sumaT1T2} de 153 ({porcentajeAcumulado}%)
                                      </Typography>
                                    </Box>
                                    <LinearProgress
                                      variant="determinate"
                                      value={porcentajeAcumulado}
                                      sx={{
                                        height: 8,
                                        borderRadius: 4,
                                        bgcolor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08),
                                        '& .MuiLinearProgress-bar': {
                                          bgcolor: colorSeveridad,
                                          borderRadius: 4,
                                        },
                                      }}
                                    />
                                  </Box>
                                </Box>
                              </Grid>

                              {/* COLUMNA 2: ¿CUÁNTO NECESITA PARA APROBAR? */}
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Box
                                  sx={{
                                    p: 2,
                                    height: '100%',
                                    borderRadius: 2.5,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    bgcolor: alpha(colorSeveridad, isDark ? 0.12 : 0.06),
                                    border: `1.5px dashed ${alpha(colorSeveridad, 0.5)}`,
                                  }}
                                >
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      fontWeight={900}
                                      color={colorSeveridad}
                                      sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5 }}
                                    >
                                      ¿Cuánto necesita para aprobar?
                                    </Typography>

                                    {/* Nota destacada requerida */}
                                    <Box sx={{ my: 1, display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                      <Typography
                                        variant="h3"
                                        fontWeight={950}
                                        color={colorSeveridad}
                                        sx={{ lineHeight: 1 }}
                                      >
                                        {mat.t3Requerido}
                                      </Typography>
                                      <Typography variant="subtitle2" fontWeight={800} color="text.secondary">
                                        / 100 puntos en T3
                                      </Typography>
                                    </Box>

                                    {/* Mensaje de viabilidad matemática */}
                                    <Typography
                                      variant="body2"
                                      fontWeight={700}
                                      sx={{
                                        color: colorSeveridad,
                                        lineHeight: 1.4,
                                        fontSize: '0.85rem',
                                      }}
                                    >
                                      {esIrrecuperable ? (
                                        <>
                                          ⛔ MATEMÁTICAMENTE IMPOSIBLE: La nota máxima posible en el 3er Trimestre es 100.
                                          Aún sacando calificación perfecta (100/100), alcanzaría como máximo {mat.sumaT1T2 + 100} puntos, quedando a {mat.t3Requerido - 100} puntos del mínimo (153).
                                        </>
                                      ) : esCritica ? (
                                        <>
                                          🔴 ALERTA MÁXIMA: Debe sacar mínimo {mat.t3Requerido} sobre 100 en el 3er Trimestre para alcanzar los 153 puntos y promediar 51. Cualquier nota menor causará la reprobación directa de la materia.
                                        </>
                                      ) : (
                                        <>
                                          🟡 RECUPERABLE: Requiere obtener al menos {mat.t3Requerido} puntos en el 3er Trimestre. Con esa calificación sumará exactamente 153 puntos y aprobará la materia con 51 de promedio final.
                                        </>
                                      )}
                                    </Typography>
                                  </Box>

                                  {/* Fórmula aplicada */}
                                  <Box
                                    sx={{
                                      mt: 1.5,
                                      pt: 1.25,
                                      borderTop: `1px solid ${alpha(colorSeveridad, 0.2)}`,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                    }}
                                  >
                                    <Typography variant="caption" color="text.secondary">
                                      Cálculo: 153 - ({mat.t1 ?? 0} + {mat.t2 ?? 0})
                                    </Typography>
                                    <Chip
                                      size="small"
                                      label={`Meta T3: ${mat.t3Requerido} pts`}
                                      sx={{
                                        height: 22,
                                        fontWeight: 800,
                                        fontSize: '0.7rem',
                                        bgcolor: colorSeveridad,
                                        color: '#fff',
                                      }}
                                    />
                                  </Box>
                                </Box>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Stack>
                )}
              </Box>

              {/* SECCIÓN PLEGABLE: MATERIAS FUERA DE PELIGRO */}
              {(() => {
                const materiasSeguras = estudianteModal.materiasEvaluadas.filter(
                  (m) => m.estadoMateria === 'alcanzable' || m.estadoMateria === 'aprobado_seguro'
                );
                if (materiasSeguras.length === 0) return null;

                return (
                  <Box sx={{ mt: 2.5 }}>
                    <Button
                      fullWidth
                      variant="text"
                      onClick={() => setMostrarMateriasSeguras(!mostrarMateriasSeguras)}
                      endIcon={mostrarMateriasSeguras ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      sx={{
                        justifyContent: 'space-between',
                        textTransform: 'none',
                        fontWeight: 700,
                        color: 'text.secondary',
                        p: 1.5,
                        borderRadius: 2.5,
                        bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
                        border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                        '&:hover': {
                          bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon sx={{ fontSize: 18, color: '#10b981' }} />
                        <span>Ver materias fuera de peligro ({materiasSeguras.length} asignaturas)</span>
                      </Box>
                    </Button>

                    <Collapse in={mostrarMateriasSeguras}>
                      <Box sx={{ pt: 1.5 }}>
                        <TableContainer
                          component={Paper}
                          elevation={0}
                          sx={{
                            borderRadius: 2.5,
                            border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                            bgcolor: 'transparent',
                          }}
                        >
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02) }}>
                                <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem' }}>Materia</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 800, fontSize: '0.74rem' }}>T1</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 800, fontSize: '0.74rem' }}>T2</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 800, fontSize: '0.74rem' }}>Acumulado</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 800, fontSize: '0.74rem' }}>Requiere en T3</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 800, fontSize: '0.74rem' }}>Situación</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {materiasSeguras.map((m) => (
                                <TableRow key={m.materia_id} hover>
                                  <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                                    {m.materia_nombre}
                                  </TableCell>
                                  <TableCell align="center" sx={{ fontSize: '0.8rem' }}>{m.t1 ?? '—'}</TableCell>
                                  <TableCell align="center" sx={{ fontSize: '0.8rem' }}>{m.t2 ?? '—'}</TableCell>
                                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                                    {m.sumaT1T2} / 153
                                  </TableCell>
                                  <TableCell align="center">
                                    <Chip
                                      size="small"
                                      label={m.t3Requerido <= 0 ? '0 pts (Ya aprobó)' : `${m.t3Requerido} pts`}
                                      sx={{
                                        height: 20,
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        bgcolor: alpha('#10b981', 0.12),
                                        color: '#10b981',
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell align="center">
                                    <Typography variant="caption" color="text.secondary">
                                      {m.t3Requerido <= 0 ? 'Aprobado seguro' : 'Alcanzable holgadamente'}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </Collapse>
                  </Box>
                );
              })()}
            </DialogContent>

            <DialogActions
              sx={{
                px: 3,
                py: 2,
                borderTop: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Button
                variant="outlined"
                onClick={() => {
                  if (onVerBoletin && estudianteModal) {
                    onVerBoletin(estudianteModal.estudiante);
                  }
                }}
                startIcon={<SchoolIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                }}
              >
                Ver Boletín Completo
              </Button>

              <Button
                variant="contained"
                onClick={() => setEstudianteModal(null)}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 800,
                  bgcolor: primary,
                  color: isDark ? '#000' : '#fff',
                  px: 3,
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

export default EstudiantesCriticosTab;