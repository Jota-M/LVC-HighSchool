'use client';
// app/dashboard/docente/notas/page.tsx

import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Fade,
  alpha,
  useTheme,
  Tooltip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  Badge,
  FormControl,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  LinearProgress,
} from '@mui/material';
import { keyframes } from '@mui/system';
import {
  ChevronRight as ChevronRightIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  ViewModule as ViewModuleIcon,
  TableRows as TableRowsIcon,
  Refresh as RefreshIcon,
  Verified as VerifiedIcon,
  CalendarToday as CalendarIcon,
  CheckCircleRounded as CheckCircleRoundedIcon,
  FactCheckRounded as FactCheckIcon,
  AssignmentTurnedInRounded as AssignmentTurnedInIcon,
  ChildCareRounded as ChildCareRoundedIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMisMateriasNotas } from '@/hooks/useNotas';
import { MateriaDocenteNotas, PeriodoEvaluacion } from '@/types/notasTypes';
import { periodosEvaluacionService } from '@/services/notasService';
import { sortCursos, sortGrados } from '@/utils/cursoUtils';
import { toast } from 'react-hot-toast';

// ─── Animaciones (Mismo estilo que Temario / Estudiantes) ──────────────────────
const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
`;

// Helper: extraer conteo seguro de calificaciones
function getCalificacionesCount(m: MateriaDocenteNotas): number {
  return Number(
    m.calificaciones_registradas ??
    m.total_calificaciones ??
    (m as any).calificaciones ??
    0
  );
}

// Helper: cálculo del porcentaje de progreso de calificaciones
function calcularProgreso(m: MateriaDocenteNotas): number {
  const totalEstudiantes = Number(m.total_estudiantes || 0);
  const totalEvaluaciones = Number(m.total_evaluaciones || 0);
  const totalEsperadas = totalEstudiantes * totalEvaluaciones;
  if (totalEsperadas === 0 || totalEvaluaciones === 0) {
    return 0;
  }
  const califs = getCalificacionesCount(m);
  return Math.min(100, Math.round((califs / totalEsperadas) * 100));
}

// ─── Card de Tarea/Materia (Mismo estilo visual que TemarioCard) ───────────────
interface TareaCardProps {
  materia: MateriaDocenteNotas;
  accentColor: string;
  gradBg: string;
  isDark: boolean;
  onView: (m: MateriaDocenteNotas) => void;
}

const TareaCard: React.FC<TareaCardProps> = ({ materia, accentColor, gradBg, isDark, onView }) => {
  const pct = calcularProgreso(materia);
  const completo = pct === 100 && materia.total_evaluaciones > 0;
  const califs = getCalificacionesCount(materia);
  const totalEsperadas = (materia.total_estudiantes || 0) * (materia.total_evaluaciones || 0);
  const esInicial =
    materia.modalidad_evaluacion === 'cualitativa' ||
    materia.nivel_nombre?.toLowerCase().includes('inicial');

  return (
    <Fade in timeout={300}>
      <Card
        sx={{
          height: '100%',
          borderRadius: '18px',
          border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
          bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: `0 10px 22px ${alpha(accentColor, 0.18)}`,
            borderColor: accentColor,
            '& .btn-gestionar': {
              backgroundColor: alpha(accentColor, 0.15),
              borderColor: accentColor,
              transform: 'translateX(2px)',
            },
          },
        }}
        onClick={() => onView(materia)}
      >
        {/* Badge de Paralelo arriba a la izquierda */}
        <Chip
          label={`Paralelo "${materia.paralelo_nombre}"`}
          size="small"
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 1,
            fontWeight: 700,
            fontSize: '0.68rem',
            height: 22,
            backgroundColor: isDark ? 'rgba(250, 204, 21, 0.15)' : 'rgba(2, 136, 209, 0.12)',
            color: accentColor,
            border: `1px solid ${alpha(accentColor, 0.25)}`,
          }}
        />

        {/* Chip de Titular / Estado arriba a la derecha */}
        <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1, display: 'flex', gap: 0.6 }}>
          {completo && (
            <Tooltip title="Todas las notas ingresadas">
              <Chip
                icon={<CheckCircleRoundedIcon sx={{ fontSize: '13px !important', color: '#16a34a !important' }} />}
                label="Completado"
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  height: 22,
                  backgroundColor: isDark ? 'rgba(22, 163, 74, 0.15)' : 'rgba(22, 163, 74, 0.1)',
                  color: '#16a34a',
                  border: `1px solid ${alpha('#16a34a', 0.25)}`,
                }}
              />
            </Tooltip>
          )}
          {materia.es_titular && (
            <Chip
              icon={<VerifiedIcon sx={{ fontSize: '13px !important', color: `${accentColor} !important` }} />}
              label="Titular"
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.65rem',
                height: 22,
                backgroundColor: isDark ? 'rgba(250, 204, 21, 0.1)' : 'rgba(2, 136, 209, 0.1)',
                color: accentColor,
                border: `1px solid ${alpha(accentColor, 0.2)}`,
              }}
            />
          )}
        </Box>

        <CardContent sx={{ p: 2.2, pt: 4.5, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Avatar mediano centrado con badge de nivel */}
          <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center' }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                materia.nivel_nombre ? (
                  <Tooltip title={`Nivel: ${materia.nivel_nombre}`}>
                    <Chip
                      icon={<SchoolIcon sx={{ fontSize: 11 }} />}
                      label={materia.nivel_nombre}
                      size="small"
                      sx={{
                        height: 20,
                        fontWeight: 700,
                        fontSize: '0.6rem',
                        bgcolor: accentColor,
                        color: isDark ? '#000' : '#fff',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        '& .MuiChip-icon': { ml: 0.4, color: isDark ? '#000' : '#fff' },
                      }}
                    />
                  </Tooltip>
                ) : null
              }
            >
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  margin: '0 auto',
                  bgcolor: esInicial ? '#6366F1' : accentColor,
                  color: isDark ? '#000' : '#fff',
                  border: `3px solid ${alpha(esInicial ? '#6366F1' : accentColor, 0.2)}`,
                  boxShadow: `0 6px 14px ${alpha(esInicial ? '#6366F1' : accentColor, 0.25)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {esInicial ? (
                  <ChildCareRoundedIcon sx={{ fontSize: 36 }} />
                ) : (
                  <AssignmentIcon sx={{ fontSize: 36 }} />
                )}
              </Avatar>
            </Badge>
          </Box>

          {/* Nombre de la Materia */}
          <Typography variant="subtitle1" fontWeight={800} gutterBottom sx={{ fontSize: '1.02rem', lineHeight: 1.25, mb: 0.3 }}>
            {materia.materia_nombre}
          </Typography>
          <Typography variant="caption" color="text.secondary" gutterBottom fontWeight={600} sx={{ fontSize: '0.78rem' }}>
            {materia.grado_nombre}
          </Typography>

          {/* Chip de Código o Turno */}
          <Box sx={{ my: 0.8 }}>
            <Chip
              label={materia.materia_codigo ? `Código: ${materia.materia_codigo}` : (materia.turno_nombre || 'Turno Regular')}
              size="small"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: '0.68rem',
                height: 22,
                backgroundColor: isDark ? 'rgba(250, 204, 21, 0.1)' : 'rgba(2, 136, 209, 0.1)',
                color: accentColor,
              }}
            />
          </Box>

          {/* Botón de acción directo */}
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
            <Button
              className="btn-gestionar"
              size="small"
              variant={esInicial ? 'contained' : 'outlined'}
              endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.74rem',
                px: 1.8,
                py: 0.4,
                borderColor: alpha(accentColor, 0.35),
                bgcolor: esInicial ? '#6366F1' : undefined,
                color: esInicial ? '#fff' : accentColor,
                transition: 'all 0.2s ease',
              }}
            >
              {esInicial ? 'Evaluar Cotejo e Informes' : 'Gestionar Tareas'}
            </Button>
          </Box>

          {/* Información adicional y progreso del trimestre */}
          <Box
            sx={{
              mt: 'auto',
              pt: 1.5,
              borderTop: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.8,
              textAlign: 'left',
            }}
          >
            {/* Estudiantes */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <PersonIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                Estudiantes:
              </Typography>
              <Typography variant="caption" fontWeight={700} sx={{ ml: 'auto', fontSize: '0.74rem' }}>
                {materia.total_estudiantes ?? 0}
              </Typography>
            </Box>

            {esInicial ? (
              <Box
                sx={{
                  py: 1,
                  px: 1.2,
                  borderRadius: '10px',
                  bgcolor: alpha('#6366F1', 0.1),
                  border: `1px solid ${alpha('#6366F1', 0.2)}`,
                  textAlign: 'center',
                }}
              >
                <Typography variant="caption" sx={{ color: '#6366F1', fontWeight: 800, fontSize: '0.72rem' }}>
                  Modalidad Cualitativa Oficial
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.66rem' }}>
                  Listas de cotejo (ED, DA, DO, DP) e informes
                </Typography>
              </Box>
            ) : (
              <>
                {/* Evaluaciones */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <FactCheckIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                    Evaluaciones:
                  </Typography>
                  <Typography variant="caption" fontWeight={700} sx={{ ml: 'auto', fontSize: '0.74rem' }}>
                    {materia.total_evaluaciones ?? 0}
                  </Typography>
                </Box>

                {/* Calificaciones */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <AssignmentTurnedInIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                    Calificaciones:
                  </Typography>
                  <Typography variant="caption" fontWeight={700} sx={{ ml: 'auto', fontSize: '0.74rem' }}>
                    {califs}
                    {totalEsperadas > 0 ? ` / ${totalEsperadas}` : ''}
                  </Typography>
                </Box>

                {/* Mini Desglose por dimensiones bolivianas */}
                <Box sx={{ display: 'flex', gap: 0.5, pt: 0.3, pb: 0.3 }}>
                  {[
                    { label: 'SER', val: materia.evaluaciones_ser ?? 0 },
                    { label: 'SAB', val: materia.evaluaciones_saber ?? 0 },
                    { label: 'HAC', val: materia.evaluaciones_hacer ?? 0 },
                    { label: 'AUT', val: materia.evaluaciones_auto ?? 0 },
                  ].map(({ label, val }) => (
                    <Tooltip key={label} title={`${label}: ${val} evaluaciones creadas`}>
                      <Box
                        sx={{
                          flex: 1,
                          textAlign: 'center',
                          py: 0.4,
                          px: 0.2,
                          borderRadius: '7px',
                          bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                          border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.05)}`,
                        }}
                      >
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.58rem', fontWeight: 700, display: 'block' }}>
                          {label}
                        </Typography>
                        <Typography variant="caption" fontWeight={800} sx={{ fontSize: '0.68rem', color: val > 0 ? accentColor : 'text.disabled' }}>
                          {val}
                        </Typography>
                      </Box>
                    </Tooltip>
                  ))}
                </Box>
              </>
            )}

            {/* Progreso de notas */}
            <Box sx={{ pt: 0.3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', fontWeight: 600 }}>
                  Progreso de notas
                </Typography>
                <Typography variant="caption" fontWeight={800} sx={{ color: accentColor, fontSize: '0.7rem' }}>
                  {pct}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={pct}
                sx={{
                  height: 5,
                  borderRadius: 3,
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                  '& .MuiLinearProgress-bar': {
                    background: gradBg,
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};

// ─── Fila / Vista de Lista (Mismo estilo que TemarioRow) ──────────────────────
interface TareaRowProps {
  materia: MateriaDocenteNotas;
  accentColor: string;
  gradBg: string;
  isDark: boolean;
  onView: (m: MateriaDocenteNotas) => void;
}

const TareaRow: React.FC<TareaRowProps> = ({ materia, accentColor, gradBg, isDark, onView }) => {
  const pct = calcularProgreso(materia);

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: '16px',
        border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
        bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateX(4px)',
          borderColor: accentColor,
          boxShadow: `0 4px 16px ${alpha(accentColor, 0.15)}`,
        },
      }}
      onClick={() => onView(materia)}
    >
      <Avatar
        sx={{
          width: 44,
          height: 44,
          bgcolor: alpha(accentColor, 0.15),
          color: accentColor,
          fontWeight: 800,
        }}
      >
        <AssignmentIcon fontSize="small" />
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="subtitle2" fontWeight={800} noWrap>
            {materia.materia_nombre}
          </Typography>
          <Chip
            size="small"
            label={`Paralelo "${materia.paralelo_nombre}"`}
            sx={{
              height: 20,
              fontSize: '0.65rem',
              fontWeight: 700,
              bgcolor: isDark ? 'rgba(250, 204, 21, 0.1)' : 'rgba(2, 136, 209, 0.1)',
              color: accentColor,
            }}
          />
          {materia.es_titular && (
            <Chip
              size="small"
              label="Titular"
              sx={{
                height: 20,
                fontSize: '0.62rem',
                fontWeight: 700,
                bgcolor: alpha(accentColor, 0.12),
                color: accentColor,
              }}
            />
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.3, display: 'block' }}>
          {materia.grado_nombre} {materia.nivel_nombre ? `· ${materia.nivel_nombre}` : ''}
          {materia.total_estudiantes ? ` · ${materia.total_estudiantes} estudiantes` : ''}
          {` · ${materia.total_evaluaciones ?? 0} evaluaciones`}
          {` · ${getCalificacionesCount(materia)} calificaciones`}
          {` · Progreso: ${pct}%`}
        </Typography>
      </Box>

      <Box sx={{ width: 100, display: { xs: 'none', md: 'block' } }}>
        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{
            height: 5,
            borderRadius: 3,
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            '& .MuiLinearProgress-bar': { background: gradBg, borderRadius: 3 },
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
        <Typography variant="caption" fontWeight={700} sx={{ color: accentColor }}>
          Gestionar tareas
        </Typography>
        <ChevronRightIcon sx={{ fontSize: 18, color: accentColor }} />
      </Box>
    </Card>
  );
};

// ─── Página Principal de Notas/Tareas Docente ─────────────────────────────────
export default function DocenteNotasIndexPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();
  const { user } = useAuth();

  const accentColor = isDark ? '#facc15' : '#0288d1';
  const gradBg = isDark
    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)';

  const { materias, isLoading, sinMaterias, refrescar } = useMisMateriasNotas();
  const [periodos, setPeriodos] = useState<PeriodoEvaluacion[]>([]);
  const [selectedTrimestreId, setSelectedTrimestreId] = useState<number | null>(null);
  const userInteractedTrimestre = useRef(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [gradoFilter, setGradoFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Cargar períodos de evaluación para identificar el activo
  useEffect(() => {
    periodosEvaluacionService
      .listar(undefined, true)
      .then((res) => {
        if (res.data?.periodos) {
          setPeriodos(res.data.periodos);
        }
      })
      .catch(() => {
        // En caso de error, los trimestres se deducen de las materias
      });
  }, []);

  // Lista única de trimestres disponibles deducidos de las materias del docente
  const trimestresDisponibles = useMemo(() => {
    const hoy = new Date().toISOString().slice(0, 10);
    const map = new Map<number, { id: number; nombre: string; orden: number; esActual: boolean }>();

    materias.forEach((m) => {
      if (m.periodo_evaluacion_id && !map.has(m.periodo_evaluacion_id)) {
        const periodoInfo = periodos.find((p) => p.id === m.periodo_evaluacion_id);
        const inicio = periodoInfo?.fecha_inicio ? periodoInfo.fecha_inicio.slice(0, 10) : '';
        const fin = periodoInfo?.fecha_fin ? periodoInfo.fecha_fin.slice(0, 10) : '';
        const dentroDeRango = Boolean(inicio && fin && hoy >= inicio && hoy <= fin);

        map.set(m.periodo_evaluacion_id, {
          id: m.periodo_evaluacion_id,
          nombre: m.trimestre_nombre || periodoInfo?.nombre || `Trimestre ${m.trimestre_orden || ''}`,
          orden: m.trimestre_orden ?? periodoInfo?.orden ?? m.periodo_evaluacion_id,
          esActual: dentroDeRango,
        });
      }
    });

    const list = Array.from(map.values()).sort((a, b) => a.orden - b.orden);

    // Solo evaluar fallback de esActual si los periodos ya están cargados
    if (periodos.length > 0 && list.length > 0) {
      const algunoEsActual = list.some((t) => t.esActual);
      if (!algunoEsActual) {
        const ultimo = list[list.length - 1];
        const periodoUltimo = periodos.find((p) => p.id === ultimo.id);
        const finUltimo = periodoUltimo?.fecha_fin ? periodoUltimo.fecha_fin.slice(0, 10) : '';
        if (finUltimo && hoy >= finUltimo) {
          ultimo.esActual = true;
        } else {
          list[0].esActual = true;
        }
      }
    }

    return list;
  }, [materias, periodos]);

  // Selección automática del trimestre activo por defecto
  useEffect(() => {
    if (trimestresDisponibles.length === 0) return;

    const actual = trimestresDisponibles.find((t) => t.esActual);
    if (!userInteractedTrimestre.current) {
      if (actual) {
        setSelectedTrimestreId(actual.id);
      } else if (selectedTrimestreId === null) {
        setSelectedTrimestreId(trimestresDisponibles[0].id);
      }
    }
  }, [trimestresDisponibles]);

  // Filtrar materias por el trimestre seleccionado
  const materiasDelTrimestre = useMemo(() => {
    if (!selectedTrimestreId) return materias;
    return materias.filter((m) => m.periodo_evaluacion_id === selectedTrimestreId);
  }, [materias, selectedTrimestreId]);

  // Grados disponibles para el filtro (ordenados naturalmente: 1ro, 2do, 3ro...)
  const gradosDisponibles = useMemo(() => {
    const set = new Set(materiasDelTrimestre.map((m) => m.grado_nombre).filter(Boolean));
    return sortGrados(Array.from(set) as string[]);
  }, [materiasDelTrimestre]);

  // Filtrado final por búsqueda y grado, ordenado por cursos (1ro, 2do, 3ro...)
  const materiasFiltradas = useMemo(() => {
    const filtradas = materiasDelTrimestre.filter((m) => {
      const matchesSearch =
        !searchTerm.trim() ||
        m.materia_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.grado_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.paralelo_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.nivel_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.materia_codigo && m.materia_codigo.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesGrado = !gradoFilter || m.grado_nombre === gradoFilter;

      return matchesSearch && matchesGrado;
    });

    return sortCursos(filtradas);
  }, [materiasDelTrimestre, searchTerm, gradoFilter]);

  const handleView = (m: MateriaDocenteNotas) => {
    router.push(`/dashboard/docente/notas/${m.asignacion_id}-${m.periodo_evaluacion_id}`);
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* ══ HEADER (Mismo estilo que Temario / Estudiantes) ══ */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, md: 0 },
                mb: 3,
              }}
            >
              {/* IZQUIERDA: TÍTULO + PÁRRAFO */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <AssignmentIcon
                    sx={{
                      color: accentColor,
                      fontSize: 36,
                      animation: `${bounce} 1.5s infinite`,
                    }}
                  />
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                      fontWeight: 800,
                      background: gradBg,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Gestión de Tareas
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
                  Hola, <strong>{user?.username}</strong> — gestioná las tareas, evaluaciones y calificaciones de tus materias.
                </Typography>
              </Box>

              {/* DERECHA: Conmutador de vista y refrescar */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(_, newMode) => {
                    if (newMode) setViewMode(newMode);
                  }}
                  sx={{
                    borderRadius: '16px',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    '& .MuiToggleButton-root': {
                      borderRadius: '16px',
                      border: 'none',
                      px: 2,
                      py: 1,
                      '&.Mui-selected': {
                        backgroundColor: accentColor,
                        color: isDark ? '#000' : '#fff',
                        '&:hover': {
                          backgroundColor: accentColor,
                        },
                      },
                    },
                  }}
                >
                  <ToggleButton value="cards" aria-label="vista tarjetas">
                    <Tooltip title="Vista de tarjetas">
                      <ViewModuleIcon />
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton value="table" aria-label="vista lista">
                    <Tooltip title="Vista de lista">
                      <TableRowsIcon />
                    </Tooltip>
                  </ToggleButton>
                </ToggleButtonGroup>

                <Tooltip title="Actualizar materias">
                  <IconButton
                    onClick={() => {
                      userInteractedTrimestre.current = false;
                      refrescar();
                    }}
                    disabled={isLoading}
                    sx={{
                      borderRadius: '16px',
                      border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.1)}`,
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                      p: 1.2,
                      color: accentColor,
                      '&:hover': {
                        backgroundColor: alpha(accentColor, 0.1),
                        transform: 'rotate(180deg)',
                        transition: 'all 0.3s ease',
                      },
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* ══ SELECTOR DE TRIMESTRE EN CUESTIÓN ══ */}
            {trimestresDisponibles.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  flexWrap: 'wrap',
                  mb: 3,
                  p: 1.5,
                  borderRadius: '18px',
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.015)',
                  border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.06)}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mr: 1 }}>
                  <CalendarIcon sx={{ fontSize: 20, color: accentColor }} />
                  <Typography variant="subtitle2" fontWeight={800} color="text.secondary">
                    Trimestre en cuestión:
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {trimestresDisponibles.map((t) => {
                    const isSelected = t.id === selectedTrimestreId;
                    return (
                      <Chip
                        key={t.id}
                        clickable
                        onClick={() => {
                          userInteractedTrimestre.current = true;
                          setSelectedTrimestreId(t.id);
                        }}
                        icon={t.esActual ? <VerifiedIcon sx={{ fontSize: '15px !important' }} /> : undefined}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <span>{t.nombre}</span>
                            {t.esActual && (
                              <Box
                                component="span"
                                sx={{
                                  fontSize: '0.62rem',
                                  fontWeight: 800,
                                  px: 0.7,
                                  py: 0.1,
                                  borderRadius: '6px',
                                  bgcolor: isSelected
                                    ? (isDark ? '#000' : '#fff')
                                    : accentColor,
                                  color: isSelected
                                    ? accentColor
                                    : (isDark ? '#000' : '#fff'),
                                }}
                              >
                                EN CURSO
                              </Box>
                            )}
                          </Box>
                        }
                        sx={{
                          height: 38,
                          px: 1.2,
                          borderRadius: '12px',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          transition: 'all 0.25s ease',
                          cursor: 'pointer',
                          backgroundColor: isSelected
                            ? accentColor
                            : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'),
                          color: isSelected ? (isDark ? '#000' : '#fff') : 'text.primary',
                          border: `1.5px solid ${isSelected ? accentColor : alpha(isDark ? '#fff' : '#000', 0.08)}`,
                          boxShadow: isSelected ? `0 4px 14px ${alpha(accentColor, 0.3)}` : 'none',
                          '& .MuiChip-icon': {
                            color: isSelected ? (isDark ? '#000' : '#fff') : accentColor,
                          },
                          '&:hover': {
                            backgroundColor: isSelected ? accentColor : alpha(accentColor, 0.12),
                            borderColor: accentColor,
                            transform: 'translateY(-1px)',
                          },
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* ══ BARRA DE BÚSQUEDA Y FILTRO DE GRADO ══ */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                alignItems: 'center',
                mb: 4,
              }}
            >
              <TextField
                placeholder="Buscar por materia, grado o paralelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: accentColor }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: '16px',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.divider, 0.1),
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(accentColor, 0.4),
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: accentColor,
                    },
                  },
                }}
                sx={{ flex: { xs: '1 1 100%', md: '1 1 auto' } }}
              />

              <FormControl sx={{ minWidth: 200 }}>
                <Select
                  value={gradoFilter}
                  onChange={(e) => setGradoFilter(e.target.value)}
                  displayEmpty
                  size="medium"
                  sx={{
                    borderRadius: '16px',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.divider, 0.1),
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(accentColor, 0.4),
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: accentColor,
                    },
                  }}
                >
                  <MenuItem value="">Todos los grados</MenuItem>
                  {gradosDisponibles.map((grado) => (
                    <MenuItem key={grado} value={grado}>
                      {grado}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Fade>

        {/* ══ CONTENIDO: CARDS O TABLA (Estilo Temario / Estudiantes) ══ */}
        {isLoading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
                <Box
                  sx={{
                    borderRadius: '20px',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    p: 3,
                    textAlign: 'center',
                  }}
                >
                  <Skeleton variant="circular" width={90} height={90} sx={{ margin: '0 auto 16px' }} />
                  <Skeleton variant="text" width="60%" sx={{ margin: '0 auto 8px' }} />
                  <Skeleton variant="text" width="40%" sx={{ margin: '0 auto 16px' }} />
                  <Skeleton variant="rounded" height={32} sx={{ borderRadius: '12px', mb: 2 }} />
                  <Skeleton variant="rectangular" height={80} sx={{ borderRadius: '10px' }} />
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : sinMaterias || materiasFiltradas.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 380,
              flexDirection: 'column',
              gap: 2,
              textAlign: 'center',
            }}
          >
            <AssignmentIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
            <Typography variant="h6" color="text.secondary" fontWeight={700}>
              {searchTerm || gradoFilter
                ? 'No se encontraron materias con ese filtro'
                : 'No tienes materias asignadas para este trimestre'}
            </Typography>
            <Typography variant="body2" color="text.disabled">
              {searchTerm || gradoFilter
                ? 'Intenta borrar los filtros para ver todas tus materias.'
                : 'Contacta a administración si deberías tener materias en este período.'}
            </Typography>
          </Box>
        ) : viewMode === 'cards' ? (
          <Grid container spacing={2.5}>
            {materiasFiltradas.map((m) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={`${m.asignacion_id}-${m.periodo_evaluacion_id}`}>
                <TareaCard
                  materia={m}
                  accentColor={accentColor}
                  gradBg={gradBg}
                  isDark={isDark}
                  onView={handleView}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {materiasFiltradas.map((m) => (
              <TareaRow
                key={`${m.asignacion_id}-${m.periodo_evaluacion_id}`}
                materia={m}
                accentColor={accentColor}
                gradBg={gradBg}
                isDark={isDark}
                onView={handleView}
              />
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}