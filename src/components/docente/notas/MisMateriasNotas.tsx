'use client';
import React from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Chip,
  Grid,
  Skeleton,
  useTheme,
  alpha,
  LinearProgress,
  Tooltip,
  Collapse,
  IconButton,
} from '@mui/material';
import { keyframes } from '@mui/system';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GroupsIcon from '@mui/icons-material/Groups';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import { MateriaDocenteNotas, COLORES_MATERIA, DIMENSIONES_CONFIG } from '@/types/notasTypes';

// ──────────────────────────────────────────────
// ANIMACIONES
// ──────────────────────────────────────────────

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.4); }
  50%       { box-shadow: 0 0 0 8px rgba(245,158,11,0); }
`;

const sectionFade = keyframes`
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
`;

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────

const getColor = (materia: MateriaDocenteNotas, index: number) =>
  materia.materia_color ?? COLORES_MATERIA[index % COLORES_MATERIA.length];

// Genera una key única por combinación asignacion + trimestre
const getKey = (m: MateriaDocenteNotas) =>
  `${m.asignacion_id}_${m.periodo_evaluacion_id ?? 'null'}`;

// ──────────────────────────────────────────────
// MINI BARRA: SER / SABER / HACER
// ──────────────────────────────────────────────

const BarraDimensiones: React.FC<{ ser: number; saber: number; hacer: number }> = ({
  ser, saber, hacer,
}) => {
  if (ser + saber + hacer === 0) return null;
  return (
    <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
      {([
        { codigo: 'SER' as const, count: ser   },
        { codigo: 'SAB' as const, count: saber },
        { codigo: 'HAC' as const, count: hacer },
      ]).map(({ codigo, count }) => {
        const cfg = DIMENSIONES_CONFIG[codigo];
        return (
          <Tooltip key={codigo} title={`${cfg.label}: ${count} eval.`}>
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 0.3,
              px: 0.8, py: 0.2, borderRadius: 1,
              bgcolor: alpha(cfg.color, 0.12),
            }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: cfg.color }} />
              <Typography variant="caption" sx={{ color: cfg.color, fontWeight: 700, fontSize: 10 }}>
                {count}
              </Typography>
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
};

// ──────────────────────────────────────────────
// SKELETON
// ──────────────────────────────────────────────

const CardSkeleton = () => (
  <Card sx={{ borderRadius: 3 }}>
    <CardContent>
      <Skeleton variant="rounded" width={44} height={44} sx={{ mb: 1.5 }} />
      <Skeleton variant="rectangular" height={18} width="70%" sx={{ mb: 0.8, borderRadius: 1 }} />
      <Skeleton variant="rectangular" height={13} width="45%" sx={{ mb: 2, borderRadius: 1 }} />
      <Box sx={{ display: 'flex', gap: 0.8, mb: 1.5 }}>
        <Skeleton variant="rounded" height={20} width={70} />
        <Skeleton variant="rounded" height={20} width={60} />
      </Box>
      <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 4 }} />
    </CardContent>
  </Card>
);

// ──────────────────────────────────────────────
// CARD INDIVIDUAL DE MATERIA
// ──────────────────────────────────────────────

interface MateriaCardProps {
  materia: MateriaDocenteNotas;
  colorIndex: number;   // índice global para asignar color consistente por materia
  isSelected: boolean;
  cardIndex: number;    // para el delay de la animación
  onClick: () => void;
}

const MateriaCard: React.FC<MateriaCardProps> = ({
  materia, colorIndex, isSelected, cardIndex, onClick,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const color = getColor(materia, colorIndex);

  const pctNotas = materia.total_estudiantes > 0
    ? Math.round((materia.estudiantes_con_nota_final / materia.total_estudiantes) * 100)
    : 0;

  const pctAprobados = materia.estudiantes_con_nota_final > 0
    ? Math.round((materia.aprobados / materia.estudiantes_con_nota_final) * 100)
    : null;

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: `2px solid ${isSelected ? color : 'transparent'}`,
        animation: `${slideUp} 0.3s ease-out ${cardIndex * 0.05}s both`,
        transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        ...(isSelected && {
          animation: `${slideUp} 0.3s ease-out ${cardIndex * 0.05}s both, ${glowPulse} 2s infinite`,
          boxShadow: `0 8px 28px ${alpha(color, 0.32)}`,
        }),
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: `0 10px 24px ${alpha(color, 0.22)}`,
          border: `2px solid ${color}`,
        },
      }}
      onClick={onClick}
    >
      {/* Franja superior de color */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 5,
        background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.4)})`,
      }} />

      <CardContent sx={{ pt: 2.5 }}>
        {/* Icono + badge seleccionado */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box sx={{
            width: 42, height: 42, borderRadius: 2, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: alpha(color, isDark ? 0.2 : 0.12), color,
          }}>
            <MenuBookIcon fontSize="small" />
          </Box>

          {isSelected && (
            <Chip
              label="Activa"
              size="small"
              sx={{ bgcolor: alpha(color, 0.15), color, fontWeight: 800, fontSize: 10 }}
            />
          )}
        </Box>

        {/* Nombre de la materia */}
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{ color: isSelected ? color : 'text.primary', lineHeight: 1.2, mb: 0.3 }}
          noWrap
        >
          {materia.materia_nombre}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          {materia.grado_nombre} &ldquo;{materia.paralelo_nombre}&rdquo; · {materia.turno_nombre}
        </Typography>

        {/* Chips de info */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7, mb: 1.5 }}>
          <Chip
            icon={<GroupsIcon sx={{ fontSize: '13px !important' }} />}
            label={`${materia.total_estudiantes} alumnos`}
            size="small"
            sx={{ fontSize: 11, bgcolor: isDark ? alpha('#fff', 0.07) : '#f3f4f6' }}
          />
          <Chip
            icon={<AssignmentTurnedInIcon sx={{ fontSize: '13px !important' }} />}
            label={`${materia.total_evaluaciones} eval.`}
            size="small"
            sx={{ fontSize: 11, bgcolor: isDark ? alpha('#fff', 0.07) : '#f3f4f6' }}
          />
          {pctAprobados !== null && (
            <Chip
              icon={<CheckCircleIcon sx={{ fontSize: '13px !important', color: '#16a34a !important' }} />}
              label={`${materia.aprobados} aprob.`}
              size="small"
              sx={{ fontSize: 11, bgcolor: alpha('#16a34a', 0.1), color: '#16a34a' }}
            />
          )}
          {materia.reprobados > 0 && (
            <Chip
              icon={<CancelIcon sx={{ fontSize: '13px !important', color: '#dc2626 !important' }} />}
              label={`${materia.reprobados} rep.`}
              size="small"
              sx={{ fontSize: 11, bgcolor: alpha('#dc2626', 0.1), color: '#dc2626' }}
            />
          )}
        </Box>

        {/* Mini barra SER/SABER/HACER */}
        <BarraDimensiones
          ser={materia.evaluaciones_ser}
          saber={materia.evaluaciones_saber}
          hacer={materia.evaluaciones_hacer}
        />

        {/* Barra de notas finales */}
        <Box sx={{ mt: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">Notas finales</Typography>
            <Typography variant="caption" fontWeight={700} sx={{ color }}>
              {materia.estudiantes_con_nota_final}/{materia.total_estudiantes}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={pctNotas}
            sx={{
              height: 6, borderRadius: 3,
              bgcolor: isDark ? alpha('#fff', 0.08) : '#e9ecef',
              '& .MuiLinearProgress-bar': {
                bgcolor: color, borderRadius: 3,
                transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

// ──────────────────────────────────────────────
// SECCIÓN DE TRIMESTRE
// ──────────────────────────────────────────────

interface SeccionTrimestreProps {
  trimestre: { id: number; nombre: string; orden: number };
  materias: MateriaDocenteNotas[];
  selectedKey: string | null;
  colorMap: Record<number, number>;   // asignacion_id → índice de color
  sectionIndex: number;
  onSeleccionar: (m: MateriaDocenteNotas) => void;
}

const SeccionTrimestre: React.FC<SeccionTrimestreProps> = ({
  trimestre, materias, selectedKey, colorMap, sectionIndex, onSeleccionar,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [abierta, setAbierta] = React.useState(true);

  const completadas = materias.filter(m => m.total_evaluaciones > 0).length;

  // Color del número de trimestre según el orden
  const trimestreColors = ['#f59e0b', '#3b82f6', '#10b981'];
  const tColor = trimestreColors[(trimestre.orden - 1) % trimestreColors.length];

  return (
    <Box sx={{ animation: `${sectionFade} 0.35s ease-out ${sectionIndex * 0.08}s both` }}>
      {/* Encabezado de sección */}
      <Box
        onClick={() => setAbierta(a => !a)}
        sx={{
          display: 'flex', alignItems: 'center', gap: 2, mb: 2,
          cursor: 'pointer',
          userSelect: 'none',
          '&:hover .section-line': { opacity: 0.6 },
        }}
      >
        {/* Badge de trimestre */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32, borderRadius: 2, flexShrink: 0,
          bgcolor: alpha(tColor, isDark ? 0.2 : 0.12),
          border: `2px solid ${alpha(tColor, 0.4)}`,
        }}>
          <Typography variant="caption" fontWeight={900} sx={{ color: tColor, fontSize: 13 }}>
            T{trimestre.orden}
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: -0.3, lineHeight: 1 }}>
            {trimestre.nombre}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {completadas}/{materias.length} materias con evaluaciones
          </Typography>
        </Box>

        {/* Línea separadora */}
        <Box
          className="section-line"
          sx={{
            flex: 1, height: 1,
            bgcolor: isDark ? alpha('#fff', 0.08) : '#e5e7eb',
            transition: 'opacity 0.2s',
          }}
        />

        {/* Chip resumen */}
        <Chip
          label={`${materias.reduce((a, m) => a + m.total_evaluaciones, 0)} eval.`}
          size="small"
          sx={{ bgcolor: alpha(tColor, 0.1), color: tColor, fontWeight: 700 }}
        />

        {/* Toggle */}
        <IconButton size="small" sx={{ color: 'text.disabled' }}>
          {abierta ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
      </Box>

      {/* Cards de materias */}
      <Collapse in={abierta}>
        <Grid container spacing={2} sx={{ mb: 1 }}>
          {materias.map((m, cardIdx) => (
            <Grid size={{xs:12, sm:6, lg:4, xl:3}} key={getKey(m)}>
              <MateriaCard
                materia={m}
                colorIndex={colorMap[m.asignacion_id] ?? cardIdx}
                isSelected={selectedKey === getKey(m)}
                cardIndex={cardIdx}
                onClick={() => onSeleccionar(m)}
              />
            </Grid>
          ))}
        </Grid>
      </Collapse>
    </Box>
  );
};

// ──────────────────────────────────────────────
// PROPS PRINCIPALES
// ──────────────────────────────────────────────

interface Props {
  // El hook devuelve las materias ya aplanadas (una fila por asignacion × trimestre)
  materias: MateriaDocenteNotas[];
  isLoading?: boolean;
  // Key de la selección actual: `${asignacion_id}_${periodo_evaluacion_id}`
  selectedKey: string | null;
  onSeleccionar: (m: MateriaDocenteNotas) => void;
}

// ──────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ──────────────────────────────────────────────

const MisMateriasNotas: React.FC<Props> = ({
  materias, isLoading = false, selectedKey, onSeleccionar,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // ── Agrupar por trimestre ──
  // Estructura: { id, nombre, orden } → materias[]
  const porTrimestre = materias.reduce<Record<number, {
    trimestre: { id: number; nombre: string; orden: number };
    materias: MateriaDocenteNotas[];
  }>>((acc, m) => {
    if (!m.periodo_evaluacion_id) return acc;
    if (!acc[m.periodo_evaluacion_id]) {
      acc[m.periodo_evaluacion_id] = {
        trimestre: {
          id:     m.periodo_evaluacion_id,
          nombre: m.trimestre_nombre ?? `Trimestre ${m.trimestre_orden}`,
          orden:  m.trimestre_orden ?? 1,
        },
        materias: [],
      };
    }
    acc[m.periodo_evaluacion_id].materias.push(m);
    return acc;
  }, {});

  // Ordenar secciones por orden del trimestre
  const secciones = Object.values(porTrimestre).sort(
    (a, b) => a.trimestre.orden - b.trimestre.orden
  );

  // Mapa de color consistente por asignacion_id (misma materia siempre el mismo color)
  const colorMap: Record<number, number> = {};
  let colorIdx = 0;
  materias.forEach(m => {
    if (!(m.asignacion_id in colorMap)) {
      colorMap[m.asignacion_id] = colorIdx++;
    }
  });

  const totalMaterias   = new Set(materias.map(m => m.asignacion_id)).size;
  const totalTrimestres = secciones.length;

  return (
    <Box>
      {/* Encabezado global */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: -0.3 }}>
            Mis Materias
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {totalMaterias} materia{totalMaterias !== 1 ? 's' : ''} ·{' '}
            {totalTrimestres} trimestre{totalTrimestres !== 1 ? 's' : ''} —
            seleccioná una combinación para gestionar evaluaciones
          </Typography>
        </Box>

        {!isLoading && totalMaterias > 0 && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              icon={<CalendarMonthIcon sx={{ fontSize: '14px !important', color: '#f59e0b !important' }} />}
              label={`${totalTrimestres} trimestres`}
              size="small"
              sx={{ bgcolor: alpha('#f59e0b', 0.12), color: '#d97706', fontWeight: 700 }}
            />
          </Box>
        )}
      </Box>

      {/* Cargando */}
      {isLoading && (
        <Box>
          {/* Simulamos 2 secciones con 3 skeletons cada una */}
          {[0, 1].map(si => (
            <Box key={si} sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Skeleton variant="rounded" width={32} height={32} />
                <Skeleton variant="rectangular" height={20} width={180} sx={{ borderRadius: 1 }} />
                <Box sx={{ flex: 1, height: 1, bgcolor: isDark ? alpha('#fff', 0.06) : '#e5e7eb' }} />
              </Box>
              <Grid container spacing={2}>
                {[0, 1, 2].map(ci => (
                  <Grid size={{xs:12, sm:6, lg:4}} key={ci}>
                    <CardSkeleton />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Box>
      )}

      {/* Sin materias */}
      {!isLoading && secciones.length === 0 && (
        <Box sx={{
          textAlign: 'center', py: 6,
          bgcolor: isDark ? alpha('#fff', 0.02) : '#fafafa',
          borderRadius: 3,
          border: `2px dashed ${isDark ? alpha('#fff', 0.08) : '#e5e7eb'}`,
        }}>
          <MenuBookIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary" fontWeight={600}>
            No tenés materias asignadas con períodos de evaluación activos
          </Typography>
        </Box>
      )}

      {/* Secciones por trimestre */}
      {!isLoading && secciones.map(({ trimestre, materias: ms }, si) => (
        <Box key={trimestre.id} sx={{ mb: si < secciones.length - 1 ? 4 : 0 }}>
          <SeccionTrimestre
            trimestre={trimestre}
            materias={ms}
            selectedKey={selectedKey}
            colorMap={colorMap}
            sectionIndex={si}
            onSeleccionar={onSeleccionar}
          />
        </Box>
      ))}
    </Box>
  );
};

export default MisMateriasNotas;