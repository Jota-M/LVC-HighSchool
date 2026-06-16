'use client';
// components/docente/asistencia/MisMaterias.tsx

import React from 'react';
import {
  Box, Typography, Chip, Grid, Skeleton,
  useTheme, alpha, Stack,
} from '@mui/material';
import { keyframes } from '@mui/system';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GroupsIcon from '@mui/icons-material/Groups';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// ── tipos ─────────────────────────────────────────────────────────────────────

export interface MateriaDocente {
  asignacion_id: number;
  materia_nombre: string;
  materia_codigo: string;
  paralelo_nombre: string;
  grado_nombre: string;
  turno_nombre: string;
  turno_hora_inicio: string;
  turno_hora_fin: string;
  total_estudiantes: number;
  color?: string;
  lista_pasada_hoy?: boolean;
  hora_ultimo_registro?: string;
}

interface Props {
  materias: MateriaDocente[];
  isLoading?: boolean;
  seleccionada: number | null;
  onSeleccionar: (asignacion_id: number) => void;
  fecha: string;
}

// ── animaciones ───────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ── paleta (misma que antes) ──────────────────────────────────────────────────

const COLORES_PREMIUM = {
  light: [
    { primary: '#3b82f6', secondary: '#60a5fa' },
    { primary: '#8b5cf6', secondary: '#a78bfa' },
    { primary: '#ec4899', secondary: '#f472b6' },
    { primary: '#10b981', secondary: '#34d399' },
    { primary: '#f59e0b', secondary: '#fbbf24' },
    { primary: '#06b6d4', secondary: '#22d3ee' },
    { primary: '#ef4444', secondary: '#f87171' },
    { primary: '#6366f1', secondary: '#818cf8' },
  ],
  dark: [
    { primary: '#60a5fa', secondary: '#93c5fd' },
    { primary: '#a78bfa', secondary: '#c4b5fd' },
    { primary: '#f472b6', secondary: '#f9a8d4' },
    { primary: '#34d399', secondary: '#6ee7b7' },
    { primary: '#fbbf24', secondary: '#fcd34d' },
    { primary: '#22d3ee', secondary: '#67e8f9' },
    { primary: '#f87171', secondary: '#fca5a5' },
    { primary: '#818cf8', secondary: '#a5b4fc' },
  ],
};

const getColorScheme = (index: number, isDark: boolean) => {
  const palette = isDark ? COLORES_PREMIUM.dark : COLORES_PREMIUM.light;
  return palette[index % palette.length];
};

// iniciales de la materia (hasta 2 chars)
const getIniciales = (nombre: string) =>
  nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

// ── skeleton ──────────────────────────────────────────────────────────────────

const MateriaCardSkeleton = () => (
  <Box sx={{ borderRadius: '16px', overflow: 'hidden' }}>
    <Skeleton variant="rounded" height={180} sx={{ borderRadius: '16px' }} />
  </Box>
);

// ── card individual ───────────────────────────────────────────────────────────

const MateriaCardPremium: React.FC<{
  materia: MateriaDocente;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}> = ({ materia, index, isSelected, onClick }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const cs = getColorScheme(index, isDark);
  const iniciales = getIniciales(materia.materia_nombre);

  const borderColor = isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07);
  const bgCard = isDark ? alpha('#fff', 0.02) : '#fff';
  const bgStat = isDark ? alpha('#fff', 0.04) : alpha('#f8f9fa', 0.9);

  return (
    <Box
      onClick={onClick}
      sx={{
        borderRadius: '16px',
        border: isSelected
          ? `2px solid ${cs.primary}`
          : `1.5px solid ${borderColor}`,
        bgcolor: bgCard,
        cursor: 'pointer',
        overflow: 'hidden',
        boxShadow: isSelected
          ? `0 4px 20px ${alpha(cs.primary, 0.22)}`
          : isDark ? 'none' : '0 1px 8px rgba(0,0,0,0.05)',
        transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s',
        animation: `${fadeUp} 0.35s ease-out ${index * 0.07}s both`,
        '&:hover': {
          transform: 'translateY(-3px)',
          borderColor: alpha(cs.primary, 0.55),
          boxShadow: isDark
            ? `0 4px 20px ${alpha(cs.primary, 0.15)}`
            : `0 6px 24px ${alpha(cs.primary, 0.18)}`,
        },
        // borde superior de color
        '&::before': {
          content: '""',
          display: 'block',
          height: '3px',
          background: `linear-gradient(90deg, ${cs.primary}, ${cs.secondary})`,
          borderRadius: '16px 16px 0 0',
          marginTop: '-1.5px',
        },
      }}
    >
      {/* ── cabecera: avatar + nombre + chevron ── */}
      <Box sx={{ px: 2.5, pt: 2, pb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {/* Avatar cuadrado con iniciales */}
        <Box sx={{
          width: 46, height: 46, borderRadius: '12px', flexShrink: 0,
          background: `linear-gradient(135deg, ${cs.primary}, ${cs.secondary})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 12px ${alpha(cs.primary, 0.35)}`,
        }}>
          <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.9rem', letterSpacing: 0.5 }}>
            {iniciales}
          </Typography>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body1"
            fontWeight={800}
            sx={{
              lineHeight: 1.2,
              color: isSelected ? cs.primary : 'text.primary',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}
          >
            {materia.materia_nombre}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {materia.grado_nombre} "{materia.paralelo_nombre}" · {materia.turno_nombre}
          </Typography>
        </Box>

        <ChevronRightIcon sx={{ fontSize: 18, color: alpha(cs.primary, 0.6), flexShrink: 0 }} />
      </Box>

      {/* ── stats en cajitas ── */}
      <Box sx={{ px: 2.5, pb: 1.5, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        <Box sx={{ bgcolor: bgStat, borderRadius: '10px', p: 1.2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
            <GroupsIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
              Estudiantes
            </Typography>
          </Box>
          <Typography variant="body2" fontWeight={800}>{materia.total_estudiantes}</Typography>
        </Box>

        <Box sx={{ bgcolor: bgStat, borderRadius: '10px', p: 1.2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
            <AccessTimeIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
              Código
            </Typography>
          </Box>
          <Typography variant="body2" fontWeight={800}>{materia.materia_codigo}</Typography>
        </Box>
      </Box>

      {/* ── footer: estado ── */}
      <Box sx={{
        px: 2.5, py: 1.25,
        borderTop: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem' }}>
          {materia.hora_ultimo_registro ? `⏱ ${materia.hora_ultimo_registro}` : materia.turno_hora_inicio
            ? `${materia.turno_hora_inicio} – ${materia.turno_hora_fin}`
            : ''}
        </Typography>

        {materia.lista_pasada_hoy ? (
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: '12px !important', color: '#10b981 !important' }} />}
            label="Lista pasada"
            size="small"
            sx={{
              height: 22, fontSize: '0.62rem', fontWeight: 700,
              bgcolor: alpha('#10b981', 0.1), color: '#10b981',
              border: `1px solid ${alpha('#10b981', 0.25)}`,
            }}
          />
        ) : (
          <Chip
            icon={<RadioButtonUncheckedIcon sx={{ fontSize: '12px !important', color: '#f59e0b !important' }} />}
            label="Pendiente"
            size="small"
            sx={{
              height: 22, fontSize: '0.62rem', fontWeight: 700,
              bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b',
              border: `1px solid ${alpha('#f59e0b', 0.25)}`,
            }}
          />
        )}
      </Box>
    </Box>
  );
};

// ── componente principal (header sin cambios) ─────────────────────────────────

const MisMaterias: React.FC<Props> = ({
  materias, isLoading = false, seleccionada, onSeleccionar, fecha,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const brand = isDark ? '#facc15' : '#0288d1';
  const brandEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${brand} 0%, ${brandEnd} 100%)`;

  const pendientes = materias.filter(m => !m.lista_pasada_hoy).length;
  const completadas = materias.filter(m => m.lista_pasada_hoy).length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        mb: 3, p: 3, borderRadius: '16px',
        bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
        border: `1.5px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
        boxShadow: isDark ? 'none' : '0 1px 8px rgba(0,0,0,0.05)',
      }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.4 }}>
            <Typography variant="h6" fontWeight={800} sx={{
              background: gradBg,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Mis Materias
            </Typography>
            {!isLoading && materias.length > 0 && (
              <Chip label={materias.length} size="small" sx={{
                bgcolor: alpha(brand, 0.12), color: brand,
                fontWeight: 800, fontSize: 12, height: 22,
                '& .MuiChip-label': { px: 1 },
              }} />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Seleccioná una materia para gestionar la asistencia
          </Typography>
        </Box>

        {!isLoading && materias.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Box sx={{
              px: 2, py: 1, borderRadius: '10px',
              bgcolor: alpha('#10b981', 0.08),
              border: `1px solid ${alpha('#10b981', 0.2)}`,
              display: 'flex', alignItems: 'center', gap: 1,
            }}>
              <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981' }} />
              <Typography variant="body2" fontWeight={700} color="#10b981">{completadas}</Typography>
            </Box>
            <Box sx={{
              px: 2, py: 1, borderRadius: '10px',
              bgcolor: alpha('#f59e0b', 0.08),
              border: `1px solid ${alpha('#f59e0b', 0.2)}`,
              display: 'flex', alignItems: 'center', gap: 1,
            }}>
              <TrendingUpIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
              <Typography variant="body2" fontWeight={700} color="#f59e0b">{pendientes}</Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Grid */}
      <Grid container spacing={2}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={i}>
              <MateriaCardSkeleton />
            </Grid>
          ))
          : materias.length === 0
            ? (
              <Grid size={{ xs: 12 }}>
                <Box sx={{
                  textAlign: 'center', py: 8, borderRadius: '16px',
                  border: `2px dashed ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                }}>
                  <MenuBookIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" color="text.secondary" fontWeight={700} sx={{ mb: 0.5 }}>
                    Sin materias asignadas
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    No tenés materias asignadas para este período académico
                  </Typography>
                </Box>
              </Grid>
            )
            : materias.map((m, i) => (
              <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={m.asignacion_id}>
                <MateriaCardPremium
                  materia={m}
                  index={i}
                  isSelected={seleccionada === m.asignacion_id}
                  onClick={() => onSeleccionar(m.asignacion_id)}
                />
              </Grid>
            ))
        }
      </Grid>
    </Box>
  );
};

export default MisMaterias;