'use client';

import React, { useState, useMemo } from 'react';
import {
  Box, Container, Typography, Fade, Chip, Skeleton,
  useTheme, alpha, IconButton, Tooltip, Button, Card, CardContent,
} from '@mui/material';
import { keyframes } from '@mui/system';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts';

// Icons
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import GradeRoundedIcon from '@mui/icons-material/GradeRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import ClassRoundedIcon from '@mui/icons-material/ClassRounded';

// Hooks & Services
import { useAuth } from '@/context/AuthContext';
import { useMisAsignaciones } from '@/hooks/useAsistencia';
import { useMisMateriasNotas } from '@/hooks/useNotas';
import { useHorarioDocente } from '@/hooks/useHorarioDocente';
import { useDocentePerfil } from '@/hooks/useDocentePerfil';
import academicosService, { PeriodoAcademico } from '@/services/academicos';
import { solicitudPermisoService } from '@/services/asistenciaService';
import { observacionService } from '@/services/seguimientoPedagogicoService';
import { MOTIVOS_PERMISO } from '@/types/asistenciaTypes';
import { MateriaDocenteNotas } from '@/types/notasTypes';
import { sortCursos } from '@/utils/cursoUtils';

// ─── Animaciones ──────────────────────────────────────────────────────────────
const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.9); }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Paleta Unificada (mismos tokens que temario/calificaciones/horario) ────────
const usePalette = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accentColor = isDark ? '#facc15' : '#0288d1';
  const accentEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${accentColor} 0%, ${accentEnd} 100%)`;
  return { isDark, accentColor, accentEnd, gradBg };
};

const DIAS_NOMBRE: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
};

const DIAS_CORTO: Record<number, string> = {
  1: 'Lun',
  2: 'Mar',
  3: 'Mié',
  4: 'Jue',
  5: 'Vie',
  6: 'Sáb',
};

// Formateador de etiqueta legible para el gráfico de barras
function formatEtiquetaCurso(m: MateriaDocenteNotas, soloUnaMateria: boolean): string {
  const match = m.grado_nombre?.match(/\d+/);
  const num = match ? `${match[0]}°` : (m.grado_nombre || '').slice(0, 3);
  const par = m.paralelo_nombre || '';
  const nivel = (m.nivel_nombre || m.grado_nombre || '').toLowerCase().includes('sec') ? 'Sec' :
    (m.nivel_nombre || m.grado_nombre || '').toLowerCase().includes('prim') ? 'Prim' : '';

  const cursoStr = `${num}${par ? `${par}` : ''} ${nivel}`.trim();

  if (soloUnaMateria) {
    return cursoStr;
  }
  const cod = m.materia_codigo || m.materia_nombre?.slice(0, 4) || '';
  return `${cod} ${cursoStr}`.trim();
}

function getNombreCortoMateria(nombre?: string | null, codigo?: string | null): string {
  if (!nombre) return '';
  const n = nombre.trim();
  const lower = n.toLowerCase();

  if (lower.includes('valores') || lower.includes('espiritualidad') || lower.includes('religi')) return 'Valores';
  if (lower.includes('sociales') || lower.includes('historia')) return 'Sociales';
  if (lower.includes('castellana') || lower.includes('lenguaje') || lower.includes('lengua') || lower.includes('literatura')) return 'Lenguaje';
  if (lower.includes('matemática') || lower.includes('matematica')) return 'Matemáticas';
  if (lower.includes('biología') || lower.includes('biologia')) return 'Biología';
  if (lower.includes('física') || lower.includes('fisica')) return 'Física';
  if (lower.includes('química') || lower.includes('quimica')) return 'Química';
  if (lower.includes('musical') || lower.includes('música') || lower.includes('musica')) return 'Música';
  if (lower.includes('educación física') || lower.includes('educacion fisica') || lower.includes('deportes')) return 'Ed. Física';
  if (lower.includes('artes plástica') || lower.includes('artes plasticas') || lower.includes('artes')) return 'Artes';
  if (lower.includes('tecnol') || lower.includes('técnica') || lower.includes('tecnica')) return 'Tecnología';
  if (lower.includes('filosofía') || lower.includes('filosofia')) return 'Filosofía';
  if (lower.includes('psicología') || lower.includes('psicologia')) return 'Psicología';
  if (lower.includes('geografía') || lower.includes('geografia')) return 'Geografía';
  if (lower.includes('computación') || lower.includes('computacion') || lower.includes('sistemas') || lower.includes('informática')) return 'Computación';
  if (lower.includes('inglés') || lower.includes('ingles') || lower.includes('extranjera')) return 'Inglés';

  if (codigo && codigo.length <= 5) return codigo;
  if (n.includes(',')) return n.split(',')[0].trim();
  if (n.includes('-')) return n.split('-')[0].trim();

  if (n.length > 16) {
    const palabras = n.split(' ');
    if (palabras.length > 1) return palabras.slice(0, 2).join(' ');
  }
  return n;
}

function saludo(): string {
  const hora = new Date().getHours();
  if (hora >= 5 && hora < 12) return 'Buenos días,';
  if (hora >= 12 && hora < 19) return 'Buenas tardes,';
  return 'Buenas noches,';
}

function fechaLarga(): string {
  const f = new Date();
  return f.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function motivoLabel(motivo: string): string {
  return MOTIVOS_PERMISO.find(m => m.value === motivo)?.label ?? motivo;
}

// ─── Interfaces Locales ───────────────────────────────────────────────────────
type EstadoClase = 'en_curso' | 'proxima' | 'pendiente' | 'finalizada' | 'programada';

interface ClaseHorario {
  key: string;
  horaInicio: string;
  horaFin: string;
  materiaNombre: string;
  materiaColor?: string | null;
  gradoNombre: string;
  paraleloNombre: string;
  titulo: string;
  aula: string | null;
  estudiantes: number | null;
  estado: EstadoClase;
}

interface AlertaItem {
  key: string;
  titulo: string;
  subtitulo: string;
  color: string;
  Icon: React.ElementType;
  url?: string;
}

// ─────────────────────────────────────────────────────────────
// CONTENEDOR DE SECCIÓN (Estilo consistente con temario/calificaciones)
// ─────────────────────────────────────────────────────────────
const SectionCard: React.FC<{
  children: React.ReactNode;
  isDark: boolean;
  accentColor: string;
  delay?: number;
  sx?: any;
}> = ({ children, isDark, accentColor, delay = 0, sx }) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: '20px',
      border: `1.5px solid ${alpha(isDark ? '#fff' : '#000', isDark ? 0.09 : 0.08)}`,
      background: isDark
        ? 'rgba(15, 23, 42, 0.65)'
        : '#ffffff',
      backdropFilter: 'blur(12px)',
      boxShadow: isDark
        ? '0 8px 30px rgba(0,0,0,0.35)'
        : '0 4px 20px rgba(0, 0, 0, 0.04)',
      overflow: 'hidden',
      p: { xs: 2, sm: 2.5, md: 3 },
      animation: `${fadeUp} 0.4s ease-out ${delay}ms both`,
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        borderColor: alpha(accentColor, 0.35),
        boxShadow: isDark
          ? `0 12px 36px rgba(0,0,0,0.45)`
          : `0 8px 26px ${alpha(accentColor, 0.12)}`,
      },
      ...sx,
    }}
  >
    {children}
  </Card>
);

// ─────────────────────────────────────────────────────────────
// ENCABEZADO DE TARJETA
// ─────────────────────────────────────────────────────────────
const SectionHeader: React.FC<{
  icon: React.ElementType;
  title: string;
  color: string;
  isDark: boolean;
  sx?: any;
  action?: React.ReactNode;
}> = ({ icon: Icon, title, color, isDark, sx, action }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.2, ...sx }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4 }}>
      <Box sx={{
        width: 40, height: 40, borderRadius: '12px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: alpha(color, isDark ? 0.18 : 0.12),
        color,
        border: `1.5px solid ${alpha(color, 0.35)}`,
        boxShadow: `0 3px 10px ${alpha(color, 0.18)}`,
      }}>
        <Icon sx={{ fontSize: 22, color }} />
      </Box>
      <Typography variant="h6" fontWeight={800} sx={{ fontSize: '1.08rem', letterSpacing: '-0.01em' }}>
        {title}
      </Typography>
    </Box>
    {action}
  </Box>
);

// ─────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL: DOCENTE HOME (VISTA GLOBAL OPTIMIZADA)
// ─────────────────────────────────────────────────────────────
export default function DocenteHomePage() {
  const router = useRouter();
  const { isDark, accentColor, gradBg } = usePalette();
  const { user } = useAuth();

  // ── 1. Carga optimizada de Perfil Docente y Periodo Activo ─────────────────
  const { docente, docenteId, isLoadingPerfil } = useDocentePerfil();

  const { data: periodoActivo } = useQuery<PeriodoAcademico | null>({
    queryKey: ['periodo-academico-activo'],
    queryFn: async () => {
      const res = await academicosService.obtenerPeriodoActivo();
      return res.data?.periodo || null;
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
  });

  const periodoId = periodoActivo?.id ?? null;

  // ── 2. Consultas Principales (Con caché y sin efectos en bucle) ─────────────
  const { asignaciones, isLoading: loadingAsig, refrescar: refrescarAsig } = useMisAsignaciones();
  const { materias: materiasNotas, isLoading: loadingNotas } = useMisMateriasNotas();
  const { celdas, diasConClases, isLoading: loadingHorario, refetch: refetchHorario } = useHorarioDocente(docenteId, periodoId);

  // Solicitudes de permiso pendientes (Caché de 3 minutos)
  const { data: permisosData, isLoading: loadingPermisos } = useQuery({
    queryKey: ['docente-solicitudes-permiso-pendientes'],
    queryFn: () => solicitudPermisoService.listar({ estado: 'pendiente', limit: 5 }),
    staleTime: 1000 * 60 * 3,
  });
  const permisosPendientes = permisosData?.data?.solicitudes ?? [];

  // Observaciones urgentes/atención requerida (Solo cuando docenteId existe, caché 3 minutos)
  const { data: obsData, isLoading: loadingObs } = useQuery({
    queryKey: ['docente-observaciones-urgentes', docenteId],
    queryFn: () => observacionService.listar({ docente_id: docenteId!, limit: 5 }),
    enabled: !!docenteId,
    staleTime: 1000 * 60 * 3,
  });
  const observacionesLista = obsData?.data?.observaciones ?? [];

  // ── Stats Globales Derivadas ───────────────────────────────────────────────
  const totalEstudiantes = useMemo(() =>
    asignaciones.reduce((a, m) => a + Number(m.total_estudiantes), 0), [asignaciones]);

  const materiasUnicas = useMemo(() =>
    new Set(asignaciones.map(a => a.materia_id)).size, [asignaciones]);

  const soloUnaMateriaDocente = materiasUnicas <= 1;

  // Clases que tienen clase programada HOY según el horario oficial
  const materiasDelDiaHoy = useMemo(() =>
    asignaciones.filter(a => Boolean(a.tiene_clase_hoy)),
    [asignaciones]
  );

  const totalClasesHoy = materiasDelDiaHoy.length;

  const materiasCompletasHoy = useMemo(() =>
    materiasDelDiaHoy.filter(a => a.asistencia_completa).length,
    [materiasDelDiaHoy]
  );

  const listasSinRegistrarHoy = totalClasesHoy - materiasCompletasHoy;

  const asistenciaPromedioHoy = useMemo(() => {
    if (totalClasesHoy === 0) return null;
    const marcados = materiasDelDiaHoy.reduce((a, m) => a + Number(m.total_marcados), 0);
    const presentes = materiasDelDiaHoy.reduce((a, m) => a + Number(m.presentes), 0);
    return marcados > 0 ? Math.round((presentes / marcados) * 100) : null;
  }, [materiasDelDiaHoy, totalClasesHoy]);

  const observacionesAtencion = useMemo(() =>
    observacionesLista.filter(o => o.nivel_relevancia === 'urgente' || o.nivel_relevancia === 'requiere_atencion'),
    [observacionesLista]);

  const observacionesUrgentesCount = useMemo(() =>
    observacionesLista.filter(o => o.nivel_relevancia === 'urgente').length, [observacionesLista]);

  const alertasPendientesTotal = permisosPendientes.length + observacionesAtencion.length;

  const alertChips = useMemo(() => {
    const chips: { texto: string; color: string; Icon: React.ElementType }[] = [];
    if (observacionesUrgentesCount > 0)
      chips.push({ texto: `${observacionesUrgentesCount} observación${observacionesUrgentesCount > 1 ? 'es' : ''} urgente${observacionesUrgentesCount > 1 ? 's' : ''}`, color: '#ef4444', Icon: ErrorOutlineRoundedIcon });
    if (permisosPendientes.length > 0)
      chips.push({ texto: `${permisosPendientes.length} permiso${permisosPendientes.length > 1 ? 's' : ''} pendiente${permisosPendientes.length > 1 ? 's' : ''}`, color: accentColor, Icon: EventBusyRoundedIcon });
    if (totalClasesHoy > 0 && listasSinRegistrarHoy > 0)
      chips.push({ texto: `${listasSinRegistrarHoy} lista${listasSinRegistrarHoy > 1 ? 's' : ''} sin registrar hoy`, color: '#f59e0b', Icon: WarningAmberRoundedIcon });
    return chips;
  }, [observacionesUrgentesCount, permisosPendientes.length, totalClasesHoy, listasSinRegistrarHoy, accentColor]);

  // ── Horario y Control Dinámico de Día ────────────────────────────────────────
  const hoyNum: number | null = useMemo(() => {
    const d = new Date().getDay();
    return (d === 0 || d === 6) ? null : d;
  }, []);

  const [diaSeleccionado, setDiaSeleccionado] = useState<number>(() => hoyNum ?? 1);

  const diasDisponibles = useMemo(() => {
    const tieneSabado = diasConClases?.includes(6);
    return tieneSabado ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5];
  }, [diasConClases]);

  const esElDiaDeHoy = hoyNum !== null && diaSeleccionado === hoyNum;

  const clasesDelDia: ClaseHorario[] = useMemo(() => {
    const ahoraMin = new Date().getHours() * 60 + new Date().getMinutes();
    const diaOrdenadas = celdas
      .filter((c: any) => c.dia_semana === diaSeleccionado && c.materia_nombre)
      .sort((a: any, b: any) => (a.hora_inicio ?? '').localeCompare(b.hora_inicio ?? ''));

    let proximaAsignada = false;

    return diaOrdenadas.map((c: any, i: number) => {
      const [hh, mm] = (c.hora_inicio ?? '0:0').split(':').map(Number);
      const [eh, em] = (c.hora_fin ?? '0:0').split(':').map(Number);
      const startMin = hh * 60 + mm;
      const endMin = eh * 60 + em;

      let estado: EstadoClase;
      if (esElDiaDeHoy) {
        if (ahoraMin >= startMin && ahoraMin < endMin) estado = 'en_curso';
        else if (endMin <= ahoraMin) estado = 'finalizada';
        else if (!proximaAsignada) { estado = 'proxima'; proximaAsignada = true; }
        else estado = 'pendiente';
      } else {
        estado = 'programada';
      }

      const asignacionMatch = asignaciones.find(a =>
        a.materia_nombre === c.materia_nombre &&
        a.grado_nombre === c.grado_nombre &&
        a.paralelo_nombre === c.paralelo_nombre
      );

      return {
        key: `${c.dia_semana}-${c.bloque_horario_id}-${i}`,
        horaInicio: (c.hora_inicio ?? '').slice(0, 5),
        horaFin: (c.hora_fin ?? '').slice(0, 5),
        materiaNombre: c.materia_nombre,
        materiaColor: c.materia_color,
        gradoNombre: c.grado_nombre,
        paraleloNombre: c.paralelo_nombre,
        titulo: `${c.materia_nombre} · ${c.grado_nombre} "${c.paralelo_nombre}"`,
        aula: c.aula ?? null,
        estudiantes: asignacionMatch?.total_estudiantes ?? null,
        estado,
      };
    });
  }, [celdas, asignaciones, diaSeleccionado, esElDiaDeHoy]);

  const claseDestacada = esElDiaDeHoy
    ? (clasesDelDia.find(c => c.estado === 'en_curso') ?? clasesDelDia.find(c => c.estado === 'proxima') ?? null)
    : null;
  const colorDestacada = claseDestacada?.estado === 'en_curso' ? '#10b981' : accentColor;

  // ── Trimestres extraídos directamente de materiasNotas (Sin peticiones extra) ─
  const trimestresDisponibles = useMemo(() => {
    const map = new Map<number, { id: number; nombre: string; orden: number }>();
    const pAcademicoId = periodoActivo?.id;

    const materiasDelPeriodo = pAcademicoId
      ? materiasNotas.filter(m => Number(m.periodo_academico_id) === Number(pAcademicoId))
      : materiasNotas;

    materiasDelPeriodo.forEach((m) => {
      if (m.periodo_evaluacion_id && !map.has(m.periodo_evaluacion_id)) {
        map.set(m.periodo_evaluacion_id, {
          id: m.periodo_evaluacion_id,
          nombre: m.trimestre_nombre || `Trimestre ${m.trimestre_orden || ''}`,
          orden: m.trimestre_orden ?? m.periodo_evaluacion_id,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.orden - b.orden);
  }, [materiasNotas, periodoActivo]);

  const [selectedTrimestreId, setSelectedTrimestreId] = useState<number | null>(null);

  // Mantener trimestre seleccionado válido (prioriza el último/en curso por defecto)
  const trimestreActivoId = useMemo(() => {
    if (selectedTrimestreId && trimestresDisponibles.some(t => t.id === selectedTrimestreId)) {
      return selectedTrimestreId;
    }
    return trimestresDisponibles.length > 0 ? trimestresDisponibles[trimestresDisponibles.length - 1].id : null;
  }, [selectedTrimestreId, trimestresDisponibles]);

  // Filtrar materias por trimestre (ordenadas naturalmente por cursos: 1ro, 2do, 3ro...)
  const materiasDelTrimestre = useMemo(() => {
    const pAcademicoId = periodoActivo?.id;
    const materiasBase = pAcademicoId
      ? materiasNotas.filter(m => Number(m.periodo_academico_id) === Number(pAcademicoId))
      : materiasNotas;

    if (!trimestreActivoId) return sortCursos(materiasBase);
    return sortCursos(materiasBase.filter((m) => Number(m.periodo_evaluacion_id) === Number(trimestreActivoId)));
  }, [materiasNotas, trimestreActivoId, periodoActivo]);

  // ── Rendimiento Global por Curso ───────────────────────────────────────────
  const rendimientoData = useMemo(() => {
    const materias = materiasDelTrimestre.filter(m => Number(m.total_estudiantes) > 0);
    const soloUnaMateria = new Set(materias.map(m => m.materia_id)).size <= 1;

    return materias.map(m => {
      const total = Number(m.total_estudiantes) || 0;
      const aprobados = Number(m.aprobados) || 0;
      const reprobados = Number(m.reprobados) || 0;
      const evaluados = Number(m.estudiantes_con_nota_final) || 0;
      const rendimiento = evaluados > 0
        ? Math.round((aprobados / evaluados) * 100)
        : (total > 0 ? Math.round((aprobados / total) * 100) : 0);
      const nombre = formatEtiquetaCurso(m, soloUnaMateria);
      const nombreCompleto = `${m.grado_nombre} "${m.paralelo_nombre}"`;

      return {
        nombre,
        nombreCompleto,
        materiaNombre: m.materia_nombre,
        rendimiento,
        aprobados,
        reprobados,
        evaluados,
        totalEstudiantes: total,
      };
    });
  }, [materiasDelTrimestre]);

  const totalEvaluadosTrimestre = useMemo(() => {
    return rendimientoData.reduce((acc, d) => acc + (d.evaluados || 0), 0);
  }, [rendimientoData]);

  const rendimientoPromedio = useMemo(() => {
    if (rendimientoData.length === 0) return null;
    const conEvaluados = rendimientoData.filter(d => d.evaluados > 0);
    if (conEvaluados.length === 0) return 0;
    return Math.round(conEvaluados.reduce((a, d) => a + d.rendimiento, 0) / conEvaluados.length);
  }, [rendimientoData]);

  // ── Alertas Globales Recientes ─────────────────────────────────────────────
  const alertas: AlertaItem[] = useMemo(() => {
    const dePermisos: AlertaItem[] = permisosPendientes.slice(0, 3).map((p: any) => ({
      key: `permiso-${p.id}`,
      titulo: `${p.estudiante_nombres ?? ''} ${p.estudiante_apellidos ?? ''}`.trim() || 'Solicitud de permiso',
      subtitulo: `Permiso · ${motivoLabel(p.motivo)}`,
      color: accentColor,
      Icon: EventBusyRoundedIcon,
      url: '/dashboard/docente/asistencia',
    }));

    const deObservaciones: AlertaItem[] = observacionesAtencion.slice(0, 3).map((o: any) => ({
      key: `obs-${o.id}`,
      titulo: `${o.estudiante_nombres ?? ''} ${o.estudiante_apellidos ?? ''}`.trim() || 'Observación pedagógica',
      subtitulo: `${o.categoria_nombre ?? 'Observación'}${o.materia_nombre ? ` · ${o.materia_nombre}` : ''}`,
      color: o.nivel_relevancia === 'urgente' ? '#ef4444' : accentColor,
      Icon: o.nivel_relevancia === 'urgente' ? ErrorOutlineRoundedIcon : WarningAmberRoundedIcon,
      url: '/dashboard/docente/seguimiento',
    }));

    return [...deObservaciones, ...dePermisos].slice(0, 5);
  }, [permisosPendientes, observacionesAtencion, accentColor]);

  const loadingStats = loadingAsig || loadingPermisos || loadingObs || isLoadingPerfil;

  const nombreDocente = docente
    ? `${docente.nombres} ${docente.apellidos}`
    : user?.username || 'Docente';

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 2.5, md: 4 } }}>
      <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>

        {/* ══ 1. HEADER GLOBAL ══ */}
        <Fade in timeout={400}>
          <Box sx={{ mb: 3.5 }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 52, height: 52, borderRadius: '16px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: alpha(accentColor, isDark ? 0.16 : 0.12),
                  border: `1.5px solid ${alpha(accentColor, 0.3)}`,
                  boxShadow: `0 4px 16px ${alpha(accentColor, 0.2)}`,
                }}>
                  <DashboardRoundedIcon sx={{
                    color: accentColor,
                    fontSize: 28,
                    animation: `${float} 2.5s ease-in-out infinite`,
                  }} />
                </Box>
                <Box>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.1rem' },
                      fontWeight: 800,
                      background: gradBg,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      lineHeight: 1.2,
                    }}
                  >
                    {saludo()} {nombreDocente}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
                    {periodoActivo?.nombre ? `${periodoActivo.nombre} · ` : ''}{fechaLarga()}
                  </Typography>
                </Box>
              </Box>

              {/* Controles de cabecera */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}>
                {asignaciones.length > 0 && (
                  <Chip
                    icon={<ClassRoundedIcon sx={{ fontSize: '16px !important', color: `${accentColor} !important` }} />}
                    label={soloUnaMateriaDocente
                      ? `${asignaciones.length} Cursos · ${asignaciones[0].materia_nombre}`
                      : `${asignaciones.length} Cursos Asignados`}
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      height: 38,
                      borderRadius: '12px',
                      bgcolor: isDark ? alpha(accentColor, 0.12) : alpha(accentColor, 0.08),
                      color: accentColor,
                      border: `1.5px solid ${alpha(accentColor, 0.3)}`,
                      display: { xs: 'none', sm: 'inline-flex' },
                    }}
                  />
                )}

                <Tooltip title="Actualizar datos">
                  <IconButton
                    size="small"
                    onClick={() => {
                      refrescarAsig();
                      refetchHorario();
                    }}
                    sx={{
                      p: 1.1, borderRadius: '14px',
                      border: `1.5px solid ${alpha(accentColor, 0.25)}`,
                      bgcolor: isDark ? alpha(accentColor, 0.08) : alpha(accentColor, 0.05),
                      color: accentColor,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: alpha(accentColor, 0.15),
                        transform: 'rotate(180deg)',
                      },
                    }}
                  >
                    <RefreshRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Franja de advertencia/atención rápida global */}
            {alertChips.length > 0 && (
              <Box sx={{
                mt: 2.2, p: 1.6, borderRadius: '14px',
                display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center',
                bgcolor: isDark ? alpha('#ef4444', 0.1) : alpha('#ef4444', 0.06),
                border: `1px solid ${alpha('#ef4444', 0.25)}`,
                backdropFilter: 'blur(8px)',
              }}>
                <ErrorOutlineRoundedIcon sx={{ color: '#ef4444', fontSize: 19, flexShrink: 0 }} />
                <Typography variant="caption" fontWeight={800} sx={{ color: isDark ? '#f87171' : '#dc2626', mr: 0.5, fontSize: 12 }}>
                  Requiere atención:
                </Typography>
                {alertChips.map((a, i) => (
                  <Chip
                    key={i}
                    icon={<a.Icon sx={{ fontSize: '13px !important', color: `${a.color} !important` }} />}
                    label={a.texto}
                    size="small"
                    sx={{
                      height: 24, fontWeight: 700, fontSize: '0.68rem', borderRadius: '8px',
                      bgcolor: alpha(a.color, isDark ? 0.18 : 0.12),
                      color: a.color,
                      border: `1px solid ${alpha(a.color, 0.3)}`,
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Fade>

        {/* ══ 2. KPI METRICS CARDS (GLOBALES) ══ */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3.5,
        }}>
          {[
            {
              title: 'Estudiantes Totales',
              value: loadingAsig ? '…' : totalEstudiantes,
              subtitle: `En ${asignaciones.length} cursos asignados`,
              color: '#3b82f6',
              icon: GroupsRoundedIcon,
              badge: 'Alumnos',
            },
            {
              title: 'Materias Asignadas',
              value: loadingAsig ? '…' : asignaciones.length,
              subtitle: `${materiasUnicas} materias diferentes`,
              color: '#8b5cf6',
              icon: MenuBookRoundedIcon,
              badge: 'Cursos',
            },
            {
              title: 'Asistencia Hoy',
              value: loadingAsig
                ? '…'
                : totalClasesHoy === 0
                  ? 'Sin clases'
                  : (asistenciaPromedioHoy != null ? `${asistenciaPromedioHoy}%` : (materiasCompletasHoy === totalClasesHoy ? '100%' : 'Pendiente')),
              subtitle: totalClasesHoy === 0
                ? 'Sin clases programadas hoy'
                : `${materiasCompletasHoy} de ${totalClasesHoy} lista${totalClasesHoy > 1 ? 's' : ''} tomada${materiasCompletasHoy !== 1 ? 's' : ''}`,
              color: totalClasesHoy === 0
                ? '#10b981'
                : (materiasCompletasHoy === totalClasesHoy ? '#10b981' : '#f59e0b'),
              icon: ChecklistRoundedIcon,
              badge: totalClasesHoy === 0
                ? 'Al día'
                : (materiasCompletasHoy === totalClasesHoy ? 'Completado' : 'Pendiente'),
            },
            {
              title: 'Atención Requerida',
              value: loadingStats ? '…' : (alertasPendientesTotal > 0 ? alertasPendientesTotal : 'Al día'),
              subtitle: alertasPendientesTotal > 0 ? 'Permisos u observaciones' : 'Sin pendientes',
              color: alertasPendientesTotal > 0 ? '#f59e0b' : '#10b981',
              icon: alertasPendientesTotal > 0 ? WarningAmberRoundedIcon : CheckCircleRoundedIcon,
              badge: 'Pendientes',
            },
          ].map((kpi, idx) => (
            <Card
              key={kpi.title}
              sx={{
                borderRadius: '16px',
                animation: `${fadeUp} 0.4s ease-out ${idx * 0.06}s both`,
                border: `2px solid ${alpha(kpi.color, isDark ? 0.25 : 0.2)}`,
                background: isDark
                  ? `linear-gradient(135deg, ${alpha(kpi.color, 0.09)} 0%, rgba(15, 23, 42, 0.75) 100%)`
                  : `linear-gradient(135deg, ${alpha(kpi.color, 0.06)} 0%, #ffffff 100%)`,
                boxShadow: isDark
                  ? '0 4px 18px rgba(0, 0, 0, 0.3)'
                  : '0 2px 12px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.22s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  borderColor: kpi.color,
                  boxShadow: `0 8px 24px ${alpha(kpi.color, 0.25)}`,
                },
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 2.2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
                  <Box sx={{
                    width: 44, height: 44, borderRadius: '13px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: alpha(kpi.color, isDark ? 0.2 : 0.14),
                    color: kpi.color,
                    border: `1.5px solid ${alpha(kpi.color, 0.35)}`,
                    boxShadow: `0 3px 10px ${alpha(kpi.color, 0.18)}`,
                  }}>
                    <kpi.icon sx={{ fontSize: 24, color: kpi.color }} />
                  </Box>
                  <Chip
                    size="small"
                    label={kpi.badge}
                    sx={{
                      height: 22,
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      letterSpacing: 0.4,
                      textTransform: 'uppercase',
                      bgcolor: alpha(kpi.color, isDark ? 0.18 : 0.12),
                      color: kpi.color,
                      border: `1px solid ${alpha(kpi.color, 0.3)}`,
                      borderRadius: '8px',
                    }}
                  />
                </Box>

                <Typography
                  variant="h3"
                  fontWeight={900}
                  sx={{
                    color: kpi.color,
                    lineHeight: 1,
                    mb: 0.8,
                    fontSize: { xs: '1.8rem', sm: '2.2rem' },
                  }}
                >
                  {kpi.value}
                </Typography>

                <Typography
                  variant="caption"
                  fontWeight={800}
                  sx={{
                    color: kpi.color,
                    fontSize: 12,
                    letterSpacing: 0.4,
                    textTransform: 'uppercase',
                    display: 'block',
                    mb: 0.4,
                  }}
                >
                  {kpi.title}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: '0.75rem', fontWeight: 500 }}
                >
                  {kpi.subtitle}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* ══ 3. CONTENIDO PRINCIPAL: DOS COLUMNAS ══ */}
        <Box sx={{ display: 'grid', gap: { xs: 2, md: 3 }, gridTemplateColumns: { xs: '100%', md: '1.35fr 1fr' } }}>

          {/* COLUMNA IZQUIERDA */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>

            {/* CARD: HORARIO DE HOY / CAMBIO DE DÍA */}
            <SectionCard isDark={isDark} accentColor={accentColor} delay={80}>
              <SectionHeader
                icon={CalendarMonthRoundedIcon}
                title={esElDiaDeHoy ? `Horario de Hoy (${DIAS_NOMBRE[diaSeleccionado]})` : `Horario del ${DIAS_NOMBRE[diaSeleccionado]}`}
                color={accentColor}
                isDark={isDark}
                action={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {hoyNum !== null && !esElDiaDeHoy && (
                      <Button
                        size="small"
                        startIcon={<TodayRoundedIcon sx={{ fontSize: 15 }} />}
                        onClick={() => setDiaSeleccionado(hoyNum)}
                        sx={{
                          borderRadius: '10px',
                          fontSize: 11.5,
                          fontWeight: 800,
                          textTransform: 'none',
                          bgcolor: alpha(accentColor, isDark ? 0.15 : 0.1),
                          color: accentColor,
                          border: `1px solid ${alpha(accentColor, 0.3)}`,
                          py: 0.4,
                          px: 1.2,
                          '&:hover': {
                            bgcolor: alpha(accentColor, 0.2),
                            borderColor: accentColor,
                          },
                        }}
                      >
                        Ir a Hoy
                      </Button>
                    )}
                    <Button
                      size="small"
                      onClick={() => router.push('/dashboard/docente/horario')}
                      endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />}
                      sx={{
                        color: accentColor,
                        fontSize: 12,
                        fontWeight: 700,
                        textTransform: 'none',
                      }}
                    >
                      Ver completo
                    </Button>
                  </Box>
                }
              />

              {/* Selector y Navegador de Días Interactivo */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: { xs: 0.5, sm: 1 },
                mb: 2.5,
                p: 0.8,
                borderRadius: '16px',
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.015)',
                border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.06)}`,
              }}>
                <Tooltip title="Día anterior">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => {
                        const idx = diasDisponibles.indexOf(diaSeleccionado);
                        if (idx > 0) setDiaSeleccionado(diasDisponibles[idx - 1]);
                      }}
                      disabled={diaSeleccionado === diasDisponibles[0]}
                      sx={{
                        borderRadius: '10px',
                        border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.1)}`,
                        p: 0.8,
                        color: accentColor,
                        '&.Mui-disabled': { opacity: 0.25 },
                      }}
                    >
                      <ChevronLeftRoundedIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>

                <Box sx={{
                  display: 'flex',
                  gap: { xs: 0.6, sm: 1 },
                  flex: 1,
                  justifyContent: 'center',
                }}>
                  {diasDisponibles.map(d => {
                    const isSelected = d === diaSeleccionado;
                    const esHoy = d === hoyNum;
                    const countClases = celdas.filter((c: any) => c.dia_semana === d && c.materia_nombre).length;
                    const tieneClases = countClases > 0;

                    return (
                      <Box
                        key={d}
                        onClick={() => setDiaSeleccionado(d)}
                        sx={{
                          flex: 1,
                          py: { xs: 0.8, sm: 1.1 },
                          px: { xs: 0.4, sm: 1 },
                          borderRadius: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.4,
                          cursor: 'pointer',
                          background: isSelected
                            ? gradBg
                            : (isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02)),
                          border: isSelected
                            ? 'none'
                            : `1px solid ${tieneClases ? alpha(accentColor, 0.3) : alpha(isDark ? '#fff' : '#000', 0.08)}`,
                          boxShadow: isSelected
                            ? `0 4px 14px ${alpha(accentColor, 0.35)}`
                            : 'none',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            borderColor: accentColor,
                            bgcolor: isSelected ? undefined : alpha(accentColor, 0.08),
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: isSelected ? 900 : 700,
                              fontSize: { xs: '0.72rem', sm: '0.82rem' },
                              color: isSelected ? (isDark ? '#000' : '#fff') : 'text.primary',
                            }}
                          >
                            {DIAS_CORTO[d]}
                          </Typography>
                          {esHoy && (
                            <Box
                              component="span"
                              sx={{
                                fontSize: '0.58rem',
                                fontWeight: 900,
                                px: 0.5,
                                py: 0.1,
                                borderRadius: '5px',
                                bgcolor: isSelected ? (isDark ? '#000' : '#fff') : alpha(accentColor, 0.2),
                                color: isSelected ? accentColor : (isDark ? '#facc15' : '#0288d1'),
                              }}
                            >
                              HOY
                            </Box>
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{
                            width: 5, height: 5, borderRadius: '50%',
                            bgcolor: isSelected ? (isDark ? '#000' : '#fff') : (tieneClases ? accentColor : 'transparent'),
                          }} />
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              color: isSelected ? (isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)') : 'text.secondary',
                            }}
                          >
                            {tieneClases ? `${countClases}h` : '—'}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>

                <Tooltip title="Día siguiente">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => {
                        const idx = diasDisponibles.indexOf(diaSeleccionado);
                        if (idx < diasDisponibles.length - 1) setDiaSeleccionado(diasDisponibles[idx + 1]);
                      }}
                      disabled={diaSeleccionado === diasDisponibles[diasDisponibles.length - 1]}
                      sx={{
                        borderRadius: '10px',
                        border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.1)}`,
                        p: 0.8,
                        color: accentColor,
                        '&.Mui-disabled': { opacity: 0.25 },
                      }}
                    >
                      <ChevronRightRoundedIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>

              {/* Tarjeta de clase destacada (En curso / Próxima) si es el día de hoy */}
              {esElDiaDeHoy && !loadingHorario && claseDestacada && (
                <Card sx={{
                  p: 2, borderRadius: '16px', mb: 2.2,
                  border: `2px solid ${alpha(colorDestacada, 0.4)}`,
                  background: isDark
                    ? `linear-gradient(135deg, ${alpha(colorDestacada, 0.16)} 0%, rgba(15, 23, 42, 0.8) 100%)`
                    : `linear-gradient(135deg, ${alpha(colorDestacada, 0.12)} 0%, #ffffff 100%)`,
                  boxShadow: `0 6px 20px ${alpha(colorDestacada, 0.2)}`,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
                    <FiberManualRecordIcon sx={{ fontSize: 13, color: colorDestacada, animation: `${pulse} 1.5s infinite` }} />
                    <Typography variant="caption" fontWeight={900} sx={{ color: colorDestacada, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 11 }}>
                      {claseDestacada.estado === 'en_curso' ? 'En clase ahora' : 'Próxima clase programada'}
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight={800} sx={{ fontSize: '1.15rem', lineHeight: 1.3 }}>
                    {claseDestacada.titulo}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.8, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeRoundedIcon sx={{ fontSize: 15, color: colorDestacada }} />
                      <Typography variant="caption" fontWeight={700} sx={{ color: 'text.primary', fontSize: 12 }}>
                        {claseDestacada.horaInicio} – {claseDestacada.horaFin}
                      </Typography>
                    </Box>
                    {claseDestacada.aula && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <MeetingRoomRoundedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>
                          Aula {claseDestacada.aula}
                        </Typography>
                      </Box>
                    )}
                    {claseDestacada.estudiantes != null && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <GroupsRoundedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>
                          {claseDestacada.estudiantes} estudiantes
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Card>
              )}

              {/* Lista de clases del día */}
              {(loadingHorario || isLoadingPerfil) ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={68} sx={{ borderRadius: '14px' }} />)}
                </Box>
              ) : clasesDelDia.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {clasesDelDia.map(c => {
                    const statusMeta = {
                      en_curso: { label: 'En curso', color: '#10b981' },
                      proxima: { label: 'Próxima', color: accentColor },
                      pendiente: { label: 'Pendiente', color: isDark ? '#94a3b8' : '#64748b' },
                      finalizada: { label: 'Finalizada', color: isDark ? '#64748b' : '#94a3b8' },
                      programada: { label: 'Programada', color: accentColor },
                    }[c.estado];

                    const asigMatch = asignaciones.find(a =>
                      a.materia_nombre === c.materiaNombre &&
                      a.grado_nombre === c.gradoNombre &&
                      a.paralelo_nombre === c.paraleloNombre
                    );

                    return (
                      <Card
                        key={c.key}
                        sx={{
                          borderRadius: '16px',
                          border: `1.5px solid ${c.estado === 'en_curso' ? alpha('#10b981', 0.45) : alpha(isDark ? '#fff' : '#000', isDark ? 0.08 : 0.07)}`,
                          background: c.estado === 'en_curso'
                            ? (isDark
                              ? `linear-gradient(135deg, ${alpha('#10b981', 0.15)} 0%, rgba(15, 23, 42, 0.75) 100%)`
                              : `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, #ffffff 100%)`)
                            : (isDark
                              ? `linear-gradient(135deg, ${alpha(accentColor, 0.04)} 0%, rgba(15, 23, 42, 0.65) 100%)`
                              : `linear-gradient(135deg, ${alpha(accentColor, 0.02)} 0%, #ffffff 100%)`),
                          boxShadow: c.estado === 'en_curso'
                            ? `0 4px 16px ${alpha('#10b981', 0.2)}`
                            : (isDark ? '0 2px 10px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.03)'),
                          transition: 'all 0.22s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            borderColor: alpha(statusMeta.color, 0.45),
                            boxShadow: `0 6px 20px ${alpha(statusMeta.color, 0.18)}`,
                          },
                        }}
                      >
                        <CardContent sx={{ p: { xs: 1.2, sm: 1.4 }, '&:last-child': { pb: { xs: 1.2, sm: 1.4 } } }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                            }}
                          >
                            {/* Horario compacto */}
                            <Box sx={{
                              width: { xs: 54, sm: 60 },
                              py: 0.6,
                              borderRadius: '11px',
                              flexShrink: 0,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: alpha(statusMeta.color, isDark ? 0.16 : 0.1),
                              color: statusMeta.color,
                              border: `1.2px solid ${alpha(statusMeta.color, 0.3)}`,
                            }}>
                              <Typography variant="caption" fontWeight={900} sx={{ fontSize: '0.78rem', lineHeight: 1.1 }}>
                                {c.horaInicio}
                              </Typography>
                              <Typography variant="caption" sx={{ fontSize: '0.64rem', color: 'text.secondary', fontWeight: 700, mt: 0.2 }}>
                                {c.horaFin}
                              </Typography>
                            </Box>

                            {/* Detalle central */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.3 }}>
                                <Typography noWrap variant="body2" fontWeight={800} sx={{ fontSize: { xs: '0.88rem', sm: '0.96rem' } }}>
                                  {c.gradoNombre} "{c.paraleloNombre}"
                                </Typography>

                                {!soloUnaMateriaDocente && (
                                  <Chip
                                    label={getNombreCortoMateria(c.materiaNombre)}
                                    size="small"
                                    sx={{
                                      height: 20,
                                      fontWeight: 800,
                                      fontSize: '0.66rem',
                                      bgcolor: alpha(c.materiaColor || accentColor, isDark ? 0.2 : 0.12),
                                      color: c.materiaColor || accentColor,
                                      border: `1px solid ${alpha(c.materiaColor || accentColor, 0.3)}`,
                                      borderRadius: '6px',
                                    }}
                                  />
                                )}

                                <Chip
                                  label={statusMeta.label}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontWeight: 800,
                                    fontSize: '0.66rem',
                                    bgcolor: alpha(statusMeta.color, isDark ? 0.2 : 0.12),
                                    color: statusMeta.color,
                                    border: `1px solid ${alpha(statusMeta.color, 0.3)}`,
                                    borderRadius: '6px',
                                  }}
                                />
                              </Box>

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ fontSize: 11.5 }}>
                                  {c.materiaNombre}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                  <MeetingRoomRoundedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11.5 }}>
                                    {c.aula ? `Aula ${c.aula}` : 'Sin aula'}
                                  </Typography>
                                </Box>
                                {c.estudiantes != null && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                    <GroupsRoundedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11.5 }}>
                                      {c.estudiantes} est.
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>

                            {/* Enlace directo a Tomar Asistencia */}
                            <Tooltip title="Ir a tomar asistencia">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  if (asigMatch) {
                                    router.push(`/dashboard/docente/asistencia/${asigMatch.asignacion_id}`);
                                  } else {
                                    router.push('/dashboard/docente/asistencia');
                                  }
                                }}
                                sx={{
                                  borderRadius: '11px',
                                  border: `1.5px solid ${alpha(accentColor, 0.25)}`,
                                  color: accentColor,
                                  p: 1,
                                  bgcolor: isDark ? alpha(accentColor, 0.08) : alpha(accentColor, 0.04),
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    bgcolor: alpha(accentColor, 0.16),
                                    borderColor: accentColor,
                                    transform: 'translateX(2px)',
                                  },
                                }}
                              >
                                <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              ) : (
                <Box sx={{
                  textAlign: 'center',
                  py: 4,
                  px: 2,
                  borderRadius: '16px',
                  border: `1px dashed ${alpha(accentColor, 0.25)}`,
                  bgcolor: isDark ? alpha(accentColor, 0.03) : alpha(accentColor, 0.02),
                }}>
                  <EventBusyRoundedIcon sx={{ fontSize: 44, color: alpha(accentColor, 0.45), mb: 1.2 }} />
                  <Typography variant="body1" fontWeight={700} color="text.primary">
                    Sin clases programadas para el {DIAS_NOMBRE[diaSeleccionado]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 400, mx: 'auto' }}>
                    {esElDiaDeHoy
                      ? '¡Disfruta tu jornada! No tienes periodos lectivos asignados para el día de hoy.'
                      : `No tienes clases asignadas en tu horario para los días ${DIAS_NOMBRE[diaSeleccionado].toLowerCase()}.`}
                  </Typography>
                  {hoyNum !== null && !esElDiaDeHoy && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<TodayRoundedIcon sx={{ fontSize: 16 }} />}
                      onClick={() => setDiaSeleccionado(hoyNum)}
                      sx={{
                        mt: 2,
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: 12,
                        textTransform: 'none',
                        borderColor: alpha(accentColor, 0.4),
                        color: accentColor,
                        '&:hover': {
                          borderColor: accentColor,
                          bgcolor: alpha(accentColor, 0.08),
                        },
                      }}
                    >
                      Ver horario de hoy
                    </Button>
                  )}
                </Box>
              )}
            </SectionCard>

            {/* CARD: ACCIONES RÁPIDAS (6 Acciones Globales) */}
            <SectionCard isDark={isDark} accentColor={accentColor} delay={120}>
              <SectionHeader
                icon={BoltRoundedIcon}
                title="Acciones Rápidas"
                color={accentColor}
                isDark={isDark}
              />
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
                gap: 1.6,
              }}>
                {[
                  {
                    title: 'Calificaciones',
                    subtitle: 'Registro y notas',
                    icon: GradeRoundedIcon,
                    href: '/dashboard/docente/calificaciones',
                    color: '#f59e0b',
                  },
                  {
                    title: 'Asistencia',
                    subtitle: 'Control y permisos',
                    icon: EventAvailableRoundedIcon,
                    href: '/dashboard/docente/asistencia',
                    color: '#10b981',
                  },
                  {
                    title: 'Evaluaciones',
                    subtitle: 'Dimensiones y tareas',
                    icon: AssignmentRoundedIcon,
                    href: '/dashboard/docente/notas',
                    color: '#3b82f6',
                  },
                  {
                    title: 'Materiales',
                    subtitle: 'Archivos y recursos',
                    icon: FolderRoundedIcon,
                    href: '/dashboard/docente/materiales',
                    color: '#8b5cf6',
                  },
                  {
                    title: 'Seguimiento',
                    subtitle: 'Fichas y conducta',
                    icon: GroupsRoundedIcon,
                    href: '/dashboard/docente/seguimiento',
                    color: '#ec4899',
                  },
                  {
                    title: 'Reportes',
                    subtitle: 'Boletines y central',
                    icon: AssessmentRoundedIcon,
                    href: '/dashboard/docente/reportes',
                    color: '#14b8a6',
                  },
                ].map(action => (
                  <Card
                    key={action.title}
                    onClick={() => router.push(action.href)}
                    sx={{
                      borderRadius: '16px',
                      cursor: 'pointer',
                      border: `1.5px solid ${alpha(action.color, isDark ? 0.24 : 0.18)}`,
                      background: isDark
                        ? `linear-gradient(135deg, ${alpha(action.color, 0.08)} 0%, rgba(15, 23, 42, 0.7) 100%)`
                        : `linear-gradient(135deg, ${alpha(action.color, 0.05)} 0%, #ffffff 100%)`,
                      boxShadow: isDark ? '0 4px 18px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.03)',
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: 1.2,
                      transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        borderColor: action.color,
                        boxShadow: `0 8px 24px ${alpha(action.color, 0.25)}`,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 46, height: 46, borderRadius: '13px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: alpha(action.color, isDark ? 0.2 : 0.14),
                        color: action.color,
                        border: `1.5px solid ${alpha(action.color, 0.35)}`,
                        boxShadow: `0 3px 10px ${alpha(action.color, 0.18)}`,
                      }}
                    >
                      <action.icon sx={{ fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={800} sx={{ fontSize: 13.5, lineHeight: 1.2 }}>
                        {action.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11, mt: 0.2, display: 'block' }}>
                        {action.subtitle}
                      </Typography>
                    </Box>
                  </Card>
                ))}
              </Box>
            </SectionCard>

          </Box>

          {/* COLUMNA DERECHA */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>

            {/* CARD: RENDIMIENTO GLOBAL POR CURSO */}
            <SectionCard isDark={isDark} accentColor={accentColor} delay={160}>
              <SectionHeader
                icon={TrendingUpRoundedIcon}
                title="Rendimiento por Curso"
                color="#10b981"
                isDark={isDark}
                action={
                  rendimientoPromedio !== null && (
                    <Chip
                      label={
                        totalEvaluadosTrimestre === 0
                          ? 'Sin notas aún'
                          : rendimientoPromedio > 0
                            ? `${rendimientoPromedio}% aprobación`
                            : `0% aprobación (${totalEvaluadosTrimestre} calificados)`
                      }
                      size="small"
                      sx={{
                        fontWeight: 800, fontSize: 11,
                        bgcolor: alpha(
                          totalEvaluadosTrimestre === 0
                            ? (isDark ? '#64748b' : '#94a3b8')
                            : rendimientoPromedio >= 51
                              ? '#10b981'
                              : '#ef4444',
                          isDark ? 0.18 : 0.12
                        ),
                        color: totalEvaluadosTrimestre === 0
                          ? (isDark ? '#cbd5e1' : '#64748b')
                          : rendimientoPromedio >= 51
                            ? '#10b981'
                            : '#ef4444',
                        border: `1px solid ${alpha(
                          totalEvaluadosTrimestre === 0
                            ? (isDark ? '#64748b' : '#94a3b8')
                            : rendimientoPromedio >= 51
                              ? '#10b981'
                              : '#ef4444',
                          0.3
                        )}`,
                        borderRadius: '8px',
                      }}
                    />
                  )
                }
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, fontSize: 11.5 }}>
                Tasa de aprobación trimestral (calificación final ≥ 51 pts)
              </Typography>

              {/* Selector de Trimestre interactivo estilo chip */}
              {trimestresDisponibles.length > 1 && (
                <Box sx={{ display: 'flex', gap: 0.8, mb: 2, flexWrap: 'wrap' }}>
                  {trimestresDisponibles.map(t => {
                    const activo = trimestreActivoId === t.id;
                    return (
                      <Chip
                        key={t.id}
                        label={t.nombre}
                        size="small"
                        clickable
                        onClick={() => setSelectedTrimestreId(t.id)}
                        sx={{
                          height: 26,
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          borderRadius: '10px',
                          bgcolor: activo ? accentColor : (isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03)),
                          color: activo ? (isDark ? '#000' : '#fff') : 'text.secondary',
                          border: `1.5px solid ${activo ? accentColor : alpha(isDark ? '#fff' : '#000', 0.08)}`,
                          boxShadow: activo ? `0 3px 10px ${alpha(accentColor, 0.3)}` : 'none',
                          '&:hover': {
                            bgcolor: activo ? accentColor : alpha(accentColor, 0.12),
                            borderColor: accentColor,
                          },
                        }}
                      />
                    );
                  })}
                </Box>
              )}

              {loadingNotas ? (
                <Skeleton variant="rounded" height={160} sx={{ borderRadius: '14px' }} />
              ) : rendimientoData.length > 0 ? (
                <Box sx={{ height: 210, mt: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={rendimientoData}
                      margin={{ left: 0, right: 15, top: 24, bottom: 5 }}
                    >
                      <XAxis
                        dataKey="nombre"
                        tick={{
                          fontSize: 11,
                          fontWeight: 700,
                          fill: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                        }}
                        axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                        tickLine={false}
                        interval={0}
                      />
                      <YAxis
                        domain={[0, 100]}
                        ticks={[0, 50, 100]}
                        tick={{
                          fontSize: 10,
                          fontWeight: 600,
                          fill: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                        }}
                        tickFormatter={(v) => `${v}%`}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                      />
                      <ChartTooltip
                        cursor={{
                          fill: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                          radius: 8,
                        }}
                        formatter={(v: number, _n, p: any) => {
                          const payload = p?.payload;
                          const evaluados = payload?.evaluados ?? 0;
                          const total = payload?.totalEstudiantes ?? 0;
                          const aprobados = payload?.aprobados ?? 0;
                          const reprobados = payload?.reprobados ?? 0;

                          if (evaluados === 0) {
                            return [
                              `Sin notas cerradas aún (${total} estudiantes)`,
                              payload?.materiaNombre ?? 'Materia',
                            ];
                          }
                          return [
                            `${v}% aprobados (${aprobados} aprobados · ${reprobados} reprobados de ${evaluados} evaluados)`,
                            payload?.materiaNombre ?? 'Materia',
                          ];
                        }}
                        labelFormatter={(_label, payload) => {
                          const item = payload?.[0]?.payload;
                          return item ? `${item.nombreCompleto}` : '';
                        }}
                        contentStyle={{
                          fontSize: 12,
                          borderRadius: 12,
                          background: isDark ? '#0f172a' : '#ffffff',
                          border: `1.5px solid ${alpha(accentColor, 0.3)}`,
                          boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.45)' : '0 4px 16px rgba(0,0,0,0.1)',
                          color: isDark ? '#ffffff' : '#0f172a',
                          padding: '8px 12px',
                        }}
                        itemStyle={{
                          color: isDark ? '#e2e8f0' : '#1e293b',
                          fontWeight: 600,
                          fontSize: 11.5,
                        }}
                        labelStyle={{
                          color: accentColor,
                          fontWeight: 800,
                          fontSize: 12,
                          marginBottom: 4,
                        }}
                      />
                      <Bar
                        dataKey="rendimiento"
                        radius={[6, 6, 0, 0]}
                        barSize={32}
                        minPointSize={10}
                        background={{
                          fill: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                        }}
                      >
                        <LabelList
                          dataKey="rendimiento"
                          position="top"
                          formatter={(v: any) => `${v}%`}
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            fill: isDark ? '#ffffff' : '#0f172a',
                          }}
                        />
                        {rendimientoData.map((d, i) => (
                          <Cell
                            key={i}
                            fill={
                              d.evaluados === 0
                                ? (isDark ? alpha('#94a3b8', 0.25) : alpha('#94a3b8', 0.35))
                                : d.rendimiento >= 51
                                  ? '#10b981'
                                  : '#ef4444'
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <TrendingUpRoundedIcon sx={{ fontSize: 38, color: alpha(accentColor, 0.3), mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Aún no hay calificaciones registradas para este trimestre.
                  </Typography>
                </Box>
              )}
            </SectionCard>

            {/* CARD: ALERTAS Y SEGUIMIENTO RECIENTE */}
            <SectionCard isDark={isDark} accentColor={accentColor} delay={200}>
              <SectionHeader
                icon={CampaignRoundedIcon}
                title="Alertas y Permisos"
                color="#f59e0b"
                isDark={isDark}
                action={
                  <Button
                    size="small"
                    onClick={() => router.push('/dashboard/docente/seguimiento')}
                    endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      color: accentColor,
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: 'none',
                    }}
                  >
                    Seguimiento
                  </Button>
                }
              />

              {loadingStats ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[1, 2].map(i => <Skeleton key={i} variant="rounded" height={60} sx={{ borderRadius: '14px' }} />)}
                </Box>
              ) : alertas.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {alertas.map(a => (
                    <Card
                      key={a.key}
                      onClick={() => a.url && router.push(a.url)}
                      sx={{
                        p: 1.6,
                        borderRadius: '14px',
                        bgcolor: isDark
                          ? `linear-gradient(135deg, ${alpha(a.color, 0.06)} 0%, rgba(15, 23, 42, 0.7) 100%)`
                          : `linear-gradient(135deg, ${alpha(a.color, 0.035)} 0%, #ffffff 100%)`,
                        border: `1.5px solid ${alpha(a.color, isDark ? 0.25 : 0.2)}`,
                        boxShadow: isDark ? '0 2px 10px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        cursor: a.url ? 'pointer' : 'default',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: alpha(a.color, isDark ? 0.14 : 0.08),
                          borderColor: a.color,
                          transform: a.url ? 'translateX(3px)' : 'none',
                          boxShadow: `0 4px 16px ${alpha(a.color, 0.2)}`,
                        },
                      }}
                    >
                      <Box sx={{
                        width: 40, height: 40, borderRadius: '12px', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: alpha(a.color, isDark ? 0.2 : 0.14),
                        border: `1.5px solid ${alpha(a.color, 0.35)}`,
                        boxShadow: `0 2px 8px ${alpha(a.color, 0.15)}`,
                        color: a.color,
                      }}>
                        <a.Icon sx={{ fontSize: 20 }} />
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography noWrap variant="body2" fontWeight={800} sx={{ fontSize: 13.5 }}>
                          {a.titulo}
                        </Typography>
                        <Typography noWrap variant="caption" color="text.secondary" sx={{ fontSize: 11.5 }}>
                          {a.subtitulo}
                        </Typography>
                      </Box>
                      {a.url && (
                        <IconButton size="small" sx={{ color: 'text.disabled', p: 0.5 }}>
                          <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      )}
                    </Card>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircleRoundedIcon sx={{ fontSize: 40, color: '#10b981', mb: 1, opacity: 0.8 }} />
                  <Typography variant="body2" fontWeight={700} sx={{ color: '#10b981' }}>
                    ¡Todo al día!
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    No tienes solicitudes de permiso ni alertas pendientes.
                  </Typography>
                </Box>
              )}
            </SectionCard>

          </Box>

        </Box>

      </Container>
    </Box>
  );
}