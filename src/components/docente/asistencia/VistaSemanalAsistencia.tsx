'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Tooltip,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  useTheme,
  alpha,
  Fade,
} from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import EditCalendarRoundedIcon from '@mui/icons-material/EditCalendarRounded';
import { toast } from 'react-hot-toast';

import { asistenciaService } from '@/services/asistenciaService';
import {
  Asistencia,
  EstadoAsistencia,
  EstudianteDia,
} from '@/types/asistenciaTypes';

// ─── Paleta y tema (Idéntico a Resumen) ─────────────────────────────────────────
const usePalette = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold = isDark ? '#facc15' : '#0288d1';
  const goldEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;
  return { isDark, gold, goldEnd, gradBg, theme };
};

// ─── Utilidades de porcentaje y color (Idéntico a SeccionResumen) ───────────────
const getPctColor = (p: number) =>
  p >= 80 ? '#10b981' : p >= 65 ? '#f59e0b' : '#ef4444';

const getPctGrad = (p: number) =>
  p >= 80
    ? 'linear-gradient(90deg,#10b981,#34d399)'
    : p >= 65
      ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
      : 'linear-gradient(90deg,#ef4444,#f87171)';

// ─── Configuración de estados ──────────────────────────────────────────────────
export const ESTADOS_CONFIG_SEMANA: Record<
  EstadoAsistencia,
  { label: string; labelCorto: string; color: string; icon: React.ReactElement }
> = {
  presente: {
    label: 'Presente',
    labelCorto: 'P',
    color: '#10b981',
    icon: <CheckCircleRoundedIcon sx={{ fontSize: 15 }} />,
  },
  ausente: {
    label: 'Ausente',
    labelCorto: 'A',
    color: '#ef4444',
    icon: <CancelRoundedIcon sx={{ fontSize: 15 }} />,
  },
  tardanza: {
    label: 'Tardanza',
    labelCorto: 'T',
    color: '#f59e0b',
    icon: <AccessTimeRoundedIcon sx={{ fontSize: 15 }} />,
  },
  justificado: {
    label: 'Justificado',
    labelCorto: 'J',
    color: '#3b82f6',
    icon: <VerifiedRoundedIcon sx={{ fontSize: 15 }} />,
  },
  falta_parcial: {
    label: 'Falta Parcial',
    labelCorto: 'FP',
    color: '#8b5cf6',
    icon: <RemoveCircleOutlineRoundedIcon sx={{ fontSize: 15 }} />,
  },
};

// ─── Utilidades de fechas ──────────────────────────────────────────────────────
const normalizarFecha = (raw: any): string => {
  if (!raw) return '';
  if (typeof raw === 'string') {
    const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }
  try {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dia = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dia}`;
    }
  } catch {}
  return String(raw).slice(0, 10);
};

const parseFechaRef = (f?: string): Date => {
  if (f) {
    const clean = f.slice(0, 10);
    return new Date(clean + 'T12:00:00');
  }
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return new Date(`${y}-${m}-${d}T12:00:00`);
};

interface DiaSemana {
  fecha: string; // YYYY-MM-DD
  date: Date;
  nombreDia: string;
  nombreCorto: string;
  numeroDia: number;
  mesNombre: string;
  esHoy: boolean;
}

const getDiasDeSemana = (refDate: Date): DiaSemana[] => {
  const d = new Date(refDate);
  const day = d.getDay(); // 0: Dom, 1: Lun, 2: Mar...
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const lunes = new Date(d);
  lunes.setDate(d.getDate() + diffToMonday);

  const now = new Date();
  const yHoy = now.getFullYear();
  const mHoy = String(now.getMonth() + 1).padStart(2, '0');
  const dHoy = String(now.getDate()).padStart(2, '0');
  const hoyStr = `${yHoy}-${mHoy}-${dHoy}`;

  const nombres = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const nombresCortos = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];

  const dias: DiaSemana[] = [];
  for (let i = 0; i < 5; i++) {
    const dia = new Date(lunes);
    dia.setDate(lunes.getDate() + i);
    const yyyy = dia.getFullYear();
    const mm = String(dia.getMonth() + 1).padStart(2, '0');
    const dd = String(dia.getDate()).padStart(2, '0');
    const fechaStr = `${yyyy}-${mm}-${dd}`;

    dias.push({
      fecha: fechaStr,
      date: dia,
      nombreDia: nombres[i],
      nombreCorto: nombresCortos[i],
      numeroDia: dia.getDate(),
      mesNombre: dia.toLocaleDateString('es-BO', { month: 'short' }),
      esHoy: fechaStr === hoyStr,
    });
  }
  return dias;
};

// ─── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  asignacionId: number;
  fechaInicial?: string;
  triggerRecarga?: number;
  onIrAPaseDia?: (fecha: string) => void;
}

export const VistaSemanalAsistencia: React.FC<Props> = ({
  asignacionId,
  fechaInicial,
  triggerRecarga = 0,
  onIrAPaseDia,
}) => {
  const { isDark, gold, gradBg } = usePalette();

  // Fecha de referencia para la semana (lunes - viernes)
  const [fechaReferencia, setFechaReferencia] = useState<Date>(() => parseFechaRef(fechaInicial));
  const diasSemana = useMemo(() => getDiasDeSemana(fechaReferencia), [fechaReferencia]);

  useEffect(() => {
    if (fechaInicial) {
      setFechaReferencia(parseFechaRef(fechaInicial));
    }
  }, [fechaInicial]);

  // Datos
  const [estudiantes, setEstudiantes] = useState<EstudianteDia[]>([]);
  const [asistenciasMap, setAsistenciasMap] = useState<Record<number, Record<string, Asistencia>>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filtros idénticos a Resumen
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtro, setFiltro] = useState<'todos' | 'criticos' | 'perfectos'>('todos');

  // Modal de edición rápida
  const [modalEdicion, setModalEdicion] = useState<{
    open: boolean;
    estudiante?: EstudianteDia;
    dia?: DiaSemana;
    asistencia?: Asistencia;
  } | null>(null);

  const [estadoEdit, setEstadoEdit] = useState<EstadoAsistencia>('presente');
  const [observacionesEdit, setObservacionesEdit] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // ─── Carga de datos de la semana ─────────────────────────────────────────────
  const cargarDatosSemana = useCallback(async () => {
    if (!asignacionId) return;
    setIsLoading(true);
    try {
      const fechaInicio = diasSemana[0].fecha;
      const fechaFin = diasSemana[4].fecha;

      const [resLista, resAsistencias] = await Promise.all([
        asistenciaService.getListaDia(asignacionId, fechaInicio),
        asistenciaService.listar({
          asignacion_docente_id: asignacionId,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          limit: 1000,
        }),
      ]);

      const listaAlumnos: EstudianteDia[] =
        resLista.data?.lista ||
        (resLista.data as any)?.estudiantes ||
        (Array.isArray(resLista.data) ? resLista.data : []);

      const listaAsistencias: Asistencia[] =
        resAsistencias.data?.asistencias ||
        (Array.isArray(resAsistencias.data) ? resAsistencias.data : []);

      // Mapear por [matricula_id][fecha]
      const mapa: Record<number, Record<string, Asistencia>> = {};
      listaAsistencias.forEach(a => {
        const matId = Number(a.matricula_id);
        const fechaNorm = normalizarFecha(a.fecha);
        if (!mapa[matId]) mapa[matId] = {};
        mapa[matId][fechaNorm] = a;
      });

      // Sincronizar por si getListaDia tiene marcación del día consultado
      listaAlumnos.forEach(est => {
        if (est.estado && est.matricula_id) {
          const matId = Number(est.matricula_id);
          const fDia = diasSemana[0].fecha;
          if (!mapa[matId]) mapa[matId] = {};
          if (!mapa[matId][fDia]) {
            mapa[matId][fDia] = {
              id: est.id || 0,
              matricula_id: est.matricula_id,
              asignacion_docente_id: asignacionId,
              fecha: fDia,
              estado: est.estado,
              hora_marcacion: est.hora_marcacion || '',
              observaciones: est.observaciones || null,
              solicitud_permiso_id: est.solicitud_permiso_id || null,
              marcado_por: 0,
              created_at: '',
              updated_at: '',
            };
          }
        }
      });

      setEstudiantes(listaAlumnos);
      setAsistenciasMap(mapa);
    } catch (err: any) {
      console.error('Error cargando vista semanal:', err);
      toast.error('No se pudieron cargar los datos de la semana');
    } finally {
      setIsLoading(false);
    }
  }, [asignacionId, diasSemana]);

  useEffect(() => {
    cargarDatosSemana();
  }, [cargarDatosSemana, triggerRecarga]);

  // ─── Navegación entre semanas ────────────────────────────────────────────────
  const irSemanaAnterior = () => {
    setFechaReferencia(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const irSemanaSiguiente = () => {
    setFechaReferencia(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const irSemanaActual = () => {
    setFechaReferencia(parseFechaRef());
  };

  // ─── Métricas y Estadísticas de la semana ───────────────────────────────────
  const metricasSemana = useMemo(() => {
    let totalMarcados = 0;
    let presentes = 0;
    let ausentes = 0;
    let tardanzas = 0;
    let justificados = 0;
    let faltasParciales = 0;

    const diasConClaseSet = new Set<string>();

    estudiantes.forEach(est => {
      const registroEst = asistenciasMap[est.matricula_id] || {};
      diasSemana.forEach(d => {
        const asis = registroEst[d.fecha];
        if (asis) {
          totalMarcados++;
          diasConClaseSet.add(d.fecha);
          if (asis.estado === 'presente') presentes++;
          else if (asis.estado === 'ausente') ausentes++;
          else if (asis.estado === 'tardanza') tardanzas++;
          else if (asis.estado === 'justificado') justificados++;
          else if (asis.estado === 'falta_parcial') faltasParciales++;
        }
      });
    });

    const porcentajeGlobal =
      totalMarcados > 0
        ? Math.round(((presentes + tardanzas + justificados) / totalMarcados) * 100)
        : 0;

    const diasConClaseCount = diasConClaseSet.size;
    let alumnosPerfectos = 0;
    let alumnosCriticos = 0;

    estudiantes.forEach(est => {
      const registroEst = asistenciasMap[est.matricula_id] || {};
      let diasRegistrados = 0;
      let diasAsistidos = 0;
      let tieneFaltas = false;

      diasSemana.forEach(d => {
        const asis = registroEst[d.fecha];
        if (asis) {
          diasRegistrados++;
          if (asis.estado === 'presente' || asis.estado === 'tardanza' || asis.estado === 'justificado') {
            diasAsistidos++;
          }
          if (asis.estado === 'ausente' || asis.estado === 'falta_parcial') {
            tieneFaltas = true;
          }
        }
      });

      const pctEst = diasRegistrados > 0 ? (diasAsistidos / diasRegistrados) * 100 : 100;
      if (diasRegistrados > 0 && pctEst === 100 && !tieneFaltas) alumnosPerfectos++;
      if (diasRegistrados > 0 && pctEst < 70) alumnosCriticos++;
    });

    return {
      totalMarcados,
      diasConClase: diasConClaseCount,
      porcentajeGlobal,
      presentes,
      ausentes,
      tardanzas,
      justificados,
      faltasParciales,
      alumnosPerfectos,
      alumnosCriticos,
    };
  }, [estudiantes, asistenciasMap, diasSemana]);

  // ─── Filtrado de estudiantes ─────────────────────────────────────────────────
  const estudiantesFiltrados = useMemo(() => {
    return estudiantes.filter(est => {
      const matchBusqueda =
        busqueda.trim() === '' ||
        `${est.estudiante_nombres} ${est.estudiante_apellidos} ${est.estudiante_codigo}`
          .toLowerCase()
          .includes(busqueda.toLowerCase());

      if (!matchBusqueda) return false;

      const registroEst = asistenciasMap[est.matricula_id] || {};
      let diasRegistrados = 0;
      let diasAsistidos = 0;

      diasSemana.forEach(d => {
        const asis = registroEst[d.fecha];
        if (asis) {
          diasRegistrados++;
          if (asis.estado === 'presente' || asis.estado === 'tardanza' || asis.estado === 'justificado') {
            diasAsistidos++;
          }
        }
      });

      const pctEst = diasRegistrados > 0 ? (diasAsistidos / diasRegistrados) * 100 : 100;

      if (filtro === 'criticos') return diasRegistrados > 0 && pctEst < 70;
      if (filtro === 'perfectos') return diasRegistrados > 0 && pctEst === 100;

      return true;
    });
  }, [estudiantes, busqueda, filtro, asistenciasMap, diasSemana]);

  // ─── Modal de Edición Rápida ─────────────────────────────────────────────────
  const handleAbrirEdicion = (est: EstudianteDia, dia: DiaSemana) => {
    const asis = asistenciasMap[est.matricula_id]?.[dia.fecha];
    setModalEdicion({
      open: true,
      estudiante: est,
      dia,
      asistencia: asis,
    });
    setEstadoEdit(asis ? asis.estado : 'presente');
    setObservacionesEdit(asis?.observaciones || '');
  };

  const handleGuardarEdicion = async () => {
    if (!modalEdicion?.estudiante || !modalEdicion?.dia) return;

    setIsSaving(true);
    try {
      const { estudiante, dia, asistencia } = modalEdicion;

      if (asistencia?.id) {
        await asistenciaService.corregir(asistencia.id, {
          estado: estadoEdit,
          observaciones: observacionesEdit || undefined,
        });
      } else {
        await asistenciaService.registrar({
          matricula_id: estudiante.matricula_id,
          asignacion_docente_id: asignacionId,
          fecha: dia.fecha,
          estado: estadoEdit,
          observaciones: observacionesEdit || undefined,
        });
      }

      toast.success('Asistencia actualizada correctamente');
      setModalEdicion(null);
      await cargarDatosSemana();
    } catch (err: any) {
      console.error('Error al guardar asistencia:', err);
      toast.error(err.response?.data?.message || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  // Etiqueta legible del rango de la semana
  const labelRango = useMemo(() => {
    const dIni = diasSemana[0];
    const dFin = diasSemana[4];
    return `${dIni.numeroDia} ${dIni.mesNombre} — ${dFin.numeroDia} ${dFin.mesNombre}, ${dFin.date.getFullYear()}`;
  }, [diasSemana]);

  return (
    <Box>
      {/* ══ 1. HEADER RESUMEN SEMANAL (Estilo idéntico a SeccionResumen) ══ */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
          p: 2.5,
          borderRadius: '12px',
          border: `1.5px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
          bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CalendarMonthRoundedIcon sx={{ color: gold, fontSize: 26 }} />
          <Box>
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{
                background: gradBg,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Sábana Semanal de Asistencia
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {labelRango} · {estudiantes.length} estudiantes
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {/* Navegador de Semanas */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03),
              p: 0.4,
              borderRadius: '10px',
              border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)}`,
            }}
          >
            <Tooltip title="Semana anterior">
              <IconButton size="small" onClick={irSemanaAnterior} sx={{ color: 'text.secondary', p: 0.6 }}>
                <ChevronLeftRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Ir a semana actual">
              <Button
                size="small"
                onClick={irSemanaActual}
                startIcon={<TodayRoundedIcon sx={{ fontSize: 14 }} />}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: 11,
                  py: 0.4,
                  px: 1,
                  color: gold,
                }}
              >
                Hoy
              </Button>
            </Tooltip>

            <Tooltip title="Semana siguiente">
              <IconButton size="small" onClick={irSemanaSiguiente} sx={{ color: 'text.secondary', p: 0.6 }}>
                <ChevronRightRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Refrescar */}
          <Box
            onClick={() => cargarDatosSemana()}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              cursor: 'pointer',
              color: 'text.disabled',
              fontSize: 12,
              fontWeight: 600,
              '&:hover': { color: gold },
            }}
          >
            <RefreshRoundedIcon sx={{ fontSize: 16 }} />
            Refrescar
          </Box>

          {/* Badge Promedio Semana */}
          <Box
            sx={{
              px: 2.5,
              py: 1,
              borderRadius: 2.5,
              background: getPctGrad(metricasSemana.porcentajeGlobal),
              boxShadow: `0 4px 14px ${alpha(getPctColor(metricasSemana.porcentajeGlobal), 0.35)}`,
            }}
          >
            <Typography variant="h6" fontWeight={900} sx={{ color: '#fff', lineHeight: 1 }}>
              {metricasSemana.porcentajeGlobal}%
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.9), fontSize: 10 }}>
              Semana
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ══ 2. STAT CARDS (Grid idéntico a SeccionResumen) ══ */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: 1.5,
          mb: 3,
        }}
      >
        {[
          { label: 'Estudiantes', value: estudiantes.length, color: '#3b82f6' },
          { label: 'Días con clase', value: `${metricasSemana.diasConClase}/5`, color: '#8b5cf6' },
          { label: 'Presentes', value: metricasSemana.presentes, color: '#10b981' },
          { label: 'Ausentes', value: metricasSemana.ausentes, color: '#ef4444' },
          { label: 'Tardanzas', value: metricasSemana.tardanzas, color: '#f59e0b' },
          { label: 'F. Parciales', value: metricasSemana.faltasParciales, color: '#8b5cf6' },
          { label: '100% Asistencia', value: metricasSemana.alumnosPerfectos, color: '#10b981' },
          { label: 'Críticos <70%', value: metricasSemana.alumnosCriticos, color: '#ef4444' },
        ].map(s => (
          <Box
            key={s.label}
            sx={{
              p: 2,
              borderRadius: '12px',
              border: `1.5px solid ${alpha(s.color, 0.2)}`,
              bgcolor: isDark ? alpha(s.color, 0.08) : alpha(s.color, 0.04),
            }}
          >
            <Typography variant="h5" fontWeight={900} sx={{ color: s.color, lineHeight: 1, mb: 0.5 }}>
              {s.value}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {s.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* ══ 3. FILTROS (Idéntico a SeccionResumen) ══ */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'center',
          mb: 3,
          p: 2,
          borderRadius: '12px',
          border: `1.5px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
          bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
        }}
      >
        <TextField
          size="small"
          placeholder="Buscar estudiante..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            flex: 1,
            minWidth: 180,
            '& .MuiOutlinedInput-root': { borderRadius: 2.5, fontSize: 14 },
          }}
        />

        <ToggleButtonGroup
          value={filtro}
          exclusive
          onChange={(_, v) => v && setFiltro(v)}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              borderRadius: '8px !important',
              px: 1.5,
              fontWeight: 700,
              fontSize: 12,
              textTransform: 'none',
            },
          }}
        >
          <ToggleButton value="todos">Todos ({estudiantes.length})</ToggleButton>
          <ToggleButton
            value="criticos"
            sx={{
              color: '#ef4444',
              '&.Mui-selected': { bgcolor: alpha('#ef4444', 0.1), color: '#ef4444' },
            }}
          >
            ⚠️ Críticos ({metricasSemana.alumnosCriticos})
          </ToggleButton>
          <ToggleButton
            value="perfectos"
            sx={{
              color: '#10b981',
              '&.Mui-selected': { bgcolor: alpha('#10b981', 0.1), color: '#10b981' },
            }}
          >
            🏆 100% ({metricasSemana.alumnosPerfectos})
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* ══ 4. ENCABEZADO DE COLUMNAS DE DÍAS (SÁBANA) ══ */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
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
        <Typography variant="caption" fontWeight={800} color="text.disabled" sx={{ flex: 1 }}>
          ESTUDIANTE
        </Typography>

        {/* 5 Días Encabezado */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {diasSemana.map(dia => (
            <Box
              key={dia.fecha}
              sx={{
                width: 64,
                textAlign: 'center',
                p: 0.5,
                borderRadius: '8px',
                bgcolor: dia.esHoy ? alpha(gold, isDark ? 0.2 : 0.1) : 'transparent',
                border: dia.esHoy ? `1px solid ${alpha(gold, 0.4)}` : '1px solid transparent',
              }}
            >
              <Typography
                variant="caption"
                fontWeight={800}
                sx={{
                  color: dia.esHoy ? gold : 'text.primary',
                  fontSize: 11,
                  display: 'block',
                  lineHeight: 1.1,
                }}
              >
                {dia.nombreCorto} {dia.numeroDia}
              </Typography>
              {onIrAPaseDia && (
                <Tooltip title={`Pase de lista del ${dia.nombreDia} ${dia.numeroDia}`}>
                  <Box
                    onClick={() => onIrAPaseDia(dia.fecha)}
                    sx={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: dia.esHoy ? gold : 'text.disabled',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.3,
                      mt: 0.2,
                      '&:hover': { color: gold },
                    }}
                  >
                    <EditCalendarRoundedIcon sx={{ fontSize: 10 }} />
                    <span>Pase</span>
                  </Box>
                </Tooltip>
              )}
            </Box>
          ))}
        </Box>

        <Typography variant="caption" fontWeight={800} color="text.disabled" sx={{ width: 90, textAlign: 'right' }}>
          % SEMANA
        </Typography>
      </Box>

      {/* ══ 5. LISTA DE ESTUDIANTES (Estilo idéntico a SeccionResumen) ══ */}
      {isLoading ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <CircularProgress size={28} sx={{ color: gold }} />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
            Cargando sábana semanal...
          </Typography>
        </Box>
      ) : estudiantesFiltrados.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 7 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            No se encontraron estudiantes para los filtros seleccionados
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1} sx={{ mb: 2 }}>
          {estudiantesFiltrados.map((est, i) => {
            const regEst = asistenciasMap[est.matricula_id] || {};
            const iniciales = `${est.estudiante_nombres[0] || ''}${est.estudiante_apellidos[0] || ''}`;

            // Calcular % individual de la semana
            let diasConRegistro = 0;
            let diasValidos = 0;
            diasSemana.forEach(d => {
              const asis = regEst[d.fecha];
              if (asis) {
                diasConRegistro++;
                if (asis.estado === 'presente' || asis.estado === 'tardanza' || asis.estado === 'justificado') {
                  diasValidos++;
                }
              }
            });

            const pct = diasConRegistro > 0 ? Math.round((diasValidos / diasConRegistro) * 100) : 100;
            const color = getPctColor(pct);

            return (
              <Box
                key={est.matricula_id}
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: { xs: 'stretch', md: 'center' },
                  gap: { xs: 1.2, md: 2 },
                  p: 1.5,
                  borderRadius: '12px',
                  border: `1.5px solid ${alpha(color, pct < 70 ? 0.25 : 0.1)}`,
                  bgcolor: isDark ? alpha(color, 0.05) : alpha(color, 0.02),
                  transition: 'all 0.15s',
                  '&:hover': { transform: { md: 'translateX(4px)' } },
                }}
              >
                {/* Bloque 1: # + Avatar + Nombre */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: { md: '1 1 auto' } }}>
                  <Typography
                    variant="caption"
                    fontWeight={800}
                    color="text.disabled"
                    sx={{ minWidth: 22, textAlign: 'center', flexShrink: 0 }}
                  >
                    {i + 1}
                  </Typography>
                  <Avatar
                    src={est.estudiante_foto ?? undefined}
                    sx={{
                      width: 36,
                      height: 36,
                      fontSize: 12,
                      fontWeight: 800,
                      flexShrink: 0,
                      background: getPctGrad(pct),
                      border: `2px solid ${alpha(color, 0.3)}`,
                      color: '#fff',
                    }}
                  >
                    {iniciales}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Typography variant="body2" fontWeight={800} noWrap>
                        {est.estudiante_apellidos}, {est.estudiante_nombres}
                      </Typography>
                      {pct < 70 && (
                        <WarningAmberRoundedIcon sx={{ fontSize: 14, color: '#ef4444', flexShrink: 0 }} />
                      )}
                    </Box>
                    <Typography variant="caption" color="text.disabled">
                      {est.estudiante_codigo || `Mat: #${est.matricula_id}`}
                    </Typography>
                  </Box>
                </Box>

                {/* Bloque 2: Las 5 Celdas de los Días de la Semana */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    pl: { xs: '52px', md: 0 },
                    flexShrink: 0,
                  }}
                >
                  {diasSemana.map(dia => {
                    const asis = regEst[dia.fecha];
                    const cfg = asis ? ESTADOS_CONFIG_SEMANA[asis.estado] : null;

                    return (
                      <Tooltip
                        key={dia.fecha}
                        title={
                          asis ? (
                            <Box sx={{ p: 0.5 }}>
                              <Typography variant="caption" fontWeight={800} display="block">
                                {cfg?.label} — {dia.nombreDia} {dia.numeroDia}
                              </Typography>
                              {asis.hora_marcacion && (
                                <Typography variant="caption" display="block">
                                  Hora: {asis.hora_marcacion}
                                </Typography>
                              )}
                              {asis.observaciones && (
                                <Typography variant="caption" display="block" color="warning.light">
                                  Obs: {asis.observaciones}
                                </Typography>
                              )}
                              <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 0.5 }}>
                                👉 Clic para corregir
                              </Typography>
                            </Box>
                          ) : (
                            <Box sx={{ p: 0.5 }}>
                              <Typography variant="caption" fontWeight={700} display="block">
                                Sin registrar ({dia.nombreDia} {dia.numeroDia})
                              </Typography>
                              <Typography variant="caption" color="text.disabled" display="block">
                                👉 Clic para registrar
                              </Typography>
                            </Box>
                          )
                        }
                      >
                        <Box
                          onClick={() => handleAbrirEdicion(est, dia)}
                          sx={{
                            width: 64,
                            height: 32,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 0.4,
                            border: `1.5px solid ${
                              cfg
                                ? alpha(cfg.color, 0.4)
                                : isDark
                                  ? alpha('#fff', 0.08)
                                  : alpha('#000', 0.08)
                            }`,
                            bgcolor: cfg
                              ? alpha(cfg.color, isDark ? 0.18 : 0.1)
                              : isDark
                                ? alpha('#fff', 0.03)
                                : alpha('#000', 0.02),
                            color: cfg ? cfg.color : 'text.disabled',
                            fontWeight: 800,
                            fontSize: 11,
                            transition: 'all 0.15s',
                            userSelect: 'none',
                            position: 'relative',
                            '&:hover': {
                              transform: 'scale(1.06)',
                              boxShadow: cfg ? `0 2px 8px ${alpha(cfg.color, 0.3)}` : 'none',
                              borderColor: cfg ? cfg.color : gold,
                            },
                          }}
                        >
                          {/* En mobile agregamos una etiqueta del día */}
                          <Typography
                            variant="caption"
                            sx={{
                              display: { xs: 'inline', md: 'none' },
                              fontSize: 9,
                              fontWeight: 700,
                              color: 'text.disabled',
                              mr: 0.2,
                            }}
                          >
                            {dia.nombreCorto}:
                          </Typography>
                          <span>{cfg ? cfg.labelCorto : '—'}</span>

                          {/* Punto indicador de observación o permiso */}
                          {asis && (asis.observaciones || asis.solicitud_permiso_id) && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 3,
                                right: 3,
                                width: 4,
                                height: 4,
                                borderRadius: '50%',
                                bgcolor: cfg ? cfg.color : gold,
                              }}
                            />
                          )}
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Box>

                {/* Bloque 3: Barra % (Idéntico a SeccionResumen) */}
                <Box
                  sx={{
                    flex: { xs: 1, md: 'unset' },
                    width: { xs: 'auto', md: 90 },
                    minWidth: { xs: 100, md: 90 },
                    pl: { xs: '52px', md: 0 },
                    flexShrink: 0,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                      Semana
                    </Typography>
                    <Typography variant="caption" fontWeight={800} sx={{ color, fontSize: 10 }}>
                      {pct}%
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${pct}%`,
                        background: getPctGrad(pct),
                        borderRadius: 3,
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Stack>
      )}

      {/* ══ 6. LEYENDA INFERIOR (Estilo unificado) ══ */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          p: 2,
          borderRadius: '12px',
          border: `1.5px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
          bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.disabled" fontWeight={700}>
            Leyenda:
          </Typography>
          {Object.entries(ESTADOS_CONFIG_SEMANA).map(([key, cfg]) => (
            <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <Box
                sx={{
                  px: 1,
                  py: 0.2,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.4,
                  fontSize: 10,
                  fontWeight: 900,
                  bgcolor: alpha(cfg.color, 0.15),
                  color: cfg.color,
                  border: `1px solid ${alpha(cfg.color, 0.35)}`,
                }}
              >
                <span>{cfg.labelCorto}</span>
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {cfg.label}
              </Typography>
            </Box>
          ))}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <Box
              sx={{
                px: 1,
                py: 0.2,
                borderRadius: 1,
                fontSize: 10,
                fontWeight: 900,
                bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                color: 'text.disabled',
                border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
              }}
            >
              —
            </Box>
            <Typography variant="caption" color="text.disabled" fontWeight={600}>
              Sin marcar
            </Typography>
          </Box>
        </Box>

        <Typography variant="caption" color="text.disabled" fontWeight={600}>
          💡 Clic en cualquier celda para ver historial o corregir asistencia
        </Typography>
      </Box>

      {/* ══ MODAL DE EDICIÓN / REGISTRO RÁPIDO ══ */}
      {modalEdicion && (
        <Dialog
          open={modalEdicion.open}
          onClose={() => !isSaving && setModalEdicion(null)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              p: 1,
              border: `1.5px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
              boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
              bgcolor: isDark ? '#1e1e2e' : '#fff',
            },
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={800}>
                {modalEdicion.asistencia ? 'Corregir Asistencia' : 'Registrar Asistencia'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {modalEdicion.dia?.nombreDia} {modalEdicion.dia?.numeroDia} de {modalEdicion.dia?.mesNombre}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setModalEdicion(null)} disabled={isSaving}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ pt: 1 }}>
            {/* Alumno */}
            <Box
              sx={{
                p: 1.5,
                mb: 2,
                borderRadius: '12px',
                bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Avatar
                src={modalEdicion.estudiante?.estudiante_foto || undefined}
                sx={{
                  bgcolor: alpha(gold, 0.2),
                  color: gold,
                  fontWeight: 800,
                  width: 38,
                  height: 38,
                }}
              >
                {modalEdicion.estudiante?.estudiante_nombres[0]}
                {modalEdicion.estudiante?.estudiante_apellidos[0]}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={800}>
                  {modalEdicion.estudiante?.estudiante_apellidos}, {modalEdicion.estudiante?.estudiante_nombres}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {modalEdicion.estudiante?.estudiante_codigo}
                </Typography>
              </Box>
            </Box>

            {/* Selector de Estado */}
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              SELECCIONAR ESTADO:
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mb: 2 }}>
              {(Object.keys(ESTADOS_CONFIG_SEMANA) as EstadoAsistencia[]).map(st => {
                const cfg = ESTADOS_CONFIG_SEMANA[st];
                const selected = estadoEdit === st;
                return (
                  <Box
                    key={st}
                    onClick={() => setEstadoEdit(st)}
                    sx={{
                      p: 1.2,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      border: `1.5px solid ${selected ? cfg.color : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                      bgcolor: selected ? alpha(cfg.color, 0.15) : 'transparent',
                      color: selected ? cfg.color : 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      fontWeight: selected ? 800 : 600,
                      fontSize: 12,
                      transition: 'all 0.15s',
                      '&:hover': {
                        borderColor: cfg.color,
                        color: cfg.color,
                      },
                    }}
                  >
                    {cfg.icon}
                    <span>{cfg.label}</span>
                  </Box>
                );
              })}
            </Box>

            {/* Observaciones */}
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              label="Observaciones (opcional)"
              placeholder="Ej: Justificativo médico entregado..."
              value={observacionesEdit}
              onChange={e => setObservacionesEdit(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />
          </DialogContent>

          <DialogActions sx={{ px: 2, pb: 2 }}>
            <Button
              onClick={() => setModalEdicion(null)}
              disabled={isSaving}
              variant="outlined"
              size="small"
              sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGuardarEdicion}
              disabled={isSaving}
              variant="contained"
              size="small"
              startIcon={isSaving ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <SaveRoundedIcon />}
              sx={{
                background: gradBg,
                color: isDark ? '#000' : '#fff',
                textTransform: 'none',
                borderRadius: 2,
                fontWeight: 800,
                px: 2,
              }}
            >
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default VistaSemanalAsistencia;
