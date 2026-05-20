'use client';
// components/docente/asistencia/MisMaterias.tsx
// ✨ PREMIUM VERSION - Diseño glassmorphism con animaciones fluidas

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
  Stack,
} from '@mui/material';
import { keyframes } from '@mui/system';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GroupsIcon from '@mui/icons-material/Groups';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';

// ──────────────────────────────────────────────
// TIPOS
// ──────────────────────────────────────────────

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

// ──────────────────────────────────────────────
// ANIMACIONES PREMIUM
// ──────────────────────────────────────────────

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const slideUp = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(30px) scale(0.95);
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1);
  }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const pulse = keyframes`
  0%, 100% { 
    box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.7);
  }
  50% { 
    box-shadow: 0 0 0 15px rgba(251, 191, 36, 0);
  }
`;

const rotateGradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// ──────────────────────────────────────────────
// PALETA DE COLORES PREMIUM
// ──────────────────────────────────────────────
const COLORES_PREMIUM = {
  light: [
    { primary: '#3b82f6', secondary: '#60a5fa', bg: '#eff6ff' },
    { primary: '#8b5cf6', secondary: '#a78bfa', bg: '#f5f3ff' },
    { primary: '#ec4899', secondary: '#f472b6', bg: '#fdf2f8' },
    { primary: '#10b981', secondary: '#34d399', bg: '#ecfdf5' },
    { primary: '#f59e0b', secondary: '#fbbf24', bg: '#fffbeb' },
    { primary: '#06b6d4', secondary: '#22d3ee', bg: '#ecfeff' },
    { primary: '#ef4444', secondary: '#f87171', bg: '#fef2f2' },
    { primary: '#6366f1', secondary: '#818cf8', bg: '#eef2ff' },
  ],
  dark: [
    { primary: '#60a5fa', secondary: '#93c5fd', bg: '#1e3a8a' },
    { primary: '#a78bfa', secondary: '#c4b5fd', bg: '#4c1d95' },
    { primary: '#f472b6', secondary: '#f9a8d4', bg: '#831843' },
    { primary: '#34d399', secondary: '#6ee7b7', bg: '#065f46' },
    { primary: '#fbbf24', secondary: '#fcd34d', bg: '#78350f' },
    { primary: '#22d3ee', secondary: '#67e8f9', bg: '#164e63' },
    { primary: '#f87171', secondary: '#fca5a5', bg: '#7f1d1d' },
    { primary: '#818cf8', secondary: '#a5b4fc', bg: '#3730a3' },
  ],
};

const getColorScheme = (materia: MateriaDocente, index: number, isDark: boolean) => {
  const palette = isDark ? COLORES_PREMIUM.dark : COLORES_PREMIUM.light;
  return palette[index % palette.length];
};

// ──────────────────────────────────────────────
// SKELETON PREMIUM
// ──────────────────────────────────────────────
const MateriaCardSkeleton = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  return (
    <Card 
      sx={{ 
        borderRadius: 4,
        overflow: 'hidden',
        background: isDark 
          ? 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
          : 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)}`,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Skeleton variant="rounded" width={56} height={56} sx={{ borderRadius: 2.5 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="70%" height={28} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Skeleton variant="rounded" width={80} height={28} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rounded" width={90} height={28} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rounded" width={70} height={28} sx={{ borderRadius: 2 }} />
        </Box>
      </CardContent>
    </Card>
  );
};

// ──────────────────────────────────────────────
// CARD PREMIUM INDIVIDUAL
// ──────────────────────────────────────────────
const MateriaCardPremium: React.FC<{
  materia: MateriaDocente;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}> = ({ materia, index, isSelected, onClick }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colorScheme = getColorScheme(materia, index, isDark);

  return (
    <Card
      sx={{
        borderRadius: 4,
        animation: `${slideUp} 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s both`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        
        // Glassmorphism effect
        background: isSelected
          ? isDark
            ? `linear-gradient(145deg, ${alpha(colorScheme.primary, 0.2)} 0%, ${alpha(colorScheme.secondary, 0.1)} 100%)`
            : `linear-gradient(145deg, ${colorScheme.bg} 0%, ${alpha(colorScheme.primary, 0.05)} 100%)`
          : isDark
            ? 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
            : 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
        
        backdropFilter: 'blur(20px)',
        border: isSelected 
          ? `2px solid ${colorScheme.primary}`
          : `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)}`,
        
        boxShadow: isSelected
          ? `0 20px 60px ${alpha(colorScheme.primary, 0.3)}, 0 0 0 4px ${alpha(colorScheme.primary, 0.1)}`
          : isDark
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.08)',
        
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: `0 25px 70px ${alpha(colorScheme.primary, 0.25)}`,
          border: `2px solid ${colorScheme.primary}`,
          
          '& .hover-icon': {
            transform: 'scale(1.1) rotate(5deg)',
          },
          
          '& .shimmer-effect': {
            animation: `${shimmer} 2s linear infinite`,
          },
        },

        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${colorScheme.primary}, ${colorScheme.secondary})`,
          opacity: isSelected ? 1 : 0,
          transition: 'opacity 0.3s ease',
        },

        '&::after': {
          content: '""',
          position: 'absolute',
          top: -2,
          left: -2,
          right: -2,
          bottom: -2,
          background: `linear-gradient(45deg, ${colorScheme.primary}, ${colorScheme.secondary})`,
          borderRadius: 4,
          opacity: 0,
          zIndex: -1,
          transition: 'opacity 0.3s ease',
          filter: 'blur(20px)',
        },

        ...(isSelected && {
          '&::after': {
            opacity: 0.3,
          },
        }),
      }}
    >
      {/* Shimmer overlay */}
      <Box
        className="shimmer-effect"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(90deg, transparent, ${alpha('#fff', isDark ? 0.05 : 0.3)}, transparent)`,
          backgroundSize: '1000px 100%',
          pointerEvents: 'none',
        }}
      />

      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header con icono y estado */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2.5 }}>
            <Box
              className="hover-icon"
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${colorScheme.primary}, ${colorScheme.secondary})`,
                boxShadow: `0 8px 24px ${alpha(colorScheme.primary, 0.4)}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: `radial-gradient(circle, ${alpha('#fff', 0.3)} 0%, transparent 70%)`,
                  animation: materia.lista_pasada_hoy ? 'none' : `${rotateGradient} 3s linear infinite`,
                },
              }}
            >
              <MenuBookIcon sx={{ fontSize: 28, color: '#fff', zIndex: 1 }} />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              {materia.lista_pasada_hoy ? (
                <Chip
                  icon={<CheckCircleIcon />}
                  label="Lista pasada"
                  size="small"
                  sx={{
                    bgcolor: alpha('#10b981', 0.15),
                    color: '#10b981',
                    fontWeight: 800,
                    fontSize: 11,
                    height: 26,
                    borderRadius: 2,
                    border: `1px solid ${alpha('#10b981', 0.3)}`,
                    '& .MuiChip-icon': { 
                      fontSize: 16,
                      color: '#10b981',
                    },
                  }}
                />
              ) : (
                <Chip
                  icon={<RadioButtonUncheckedIcon />}
                  label="Pendiente"
                  size="small"
                  sx={{
                    bgcolor: alpha('#fbbf24', 0.15),
                    color: '#fbbf24',
                    fontWeight: 800,
                    fontSize: 11,
                    height: 26,
                    borderRadius: 2,
                    border: `1px solid ${alpha('#fbbf24', 0.3)}`,
                    animation: `${pulse} 2s ease-in-out infinite`,
                    '& .MuiChip-icon': { 
                      fontSize: 16,
                      color: '#fbbf24',
                    },
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Nombre de la materia */}
          <Typography
            variant="h6"
            fontWeight={800}
            sx={{
              background: isSelected
                ? `linear-gradient(135deg, ${colorScheme.primary}, ${colorScheme.secondary})`
                : isDark ? '#fff' : '#1f2937',
              WebkitBackgroundClip: isSelected ? 'text' : 'unset',
              WebkitTextFillColor: isSelected ? 'transparent' : 'unset',
              color: isSelected ? 'transparent' : isDark ? '#fff' : '#1f2937',
              mb: 0.5,
              lineHeight: 1.3,
              letterSpacing: -0.5,
            }}
          >
            {materia.materia_nombre}
          </Typography>

          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              fontWeight: 600,
              mb: 2.5,
              display: 'block',
            }}
          >
            {materia.materia_codigo}
          </Typography>

          {/* Info chips con iconos mejorados */}
          <Stack spacing={1} sx={{ mt: 'auto' }}>
            <Chip
              icon={<SchoolIcon sx={{ fontSize: '16px !important' }} />}
              label={`${materia.grado_nombre} "${materia.paralelo_nombre}"`}
              size="small"
              sx={{
                fontSize: 12,
                fontWeight: 600,
                bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.04),
                borderRadius: 2,
                height: 32,
                '& .MuiChip-icon': {
                  color: colorScheme.primary,
                },
              }}
            />
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                icon={<AccessTimeIcon sx={{ fontSize: '14px !important' }} />}
                label={materia.turno_nombre}
                size="small"
                sx={{
                  fontSize: 11,
                  fontWeight: 600,
                  bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.03),
                  borderRadius: 1.5,
                  height: 28,
                  '& .MuiChip-icon': {
                    color: colorScheme.secondary,
                  },
                }}
              />
              
              <Chip
                icon={<GroupsIcon sx={{ fontSize: '14px !important' }} />}
                label={`${materia.total_estudiantes}`}
                size="small"
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.03),
                  borderRadius: 1.5,
                  height: 28,
                  '& .MuiChip-icon': {
                    color: colorScheme.secondary,
                  },
                }}
              />
            </Box>
          </Stack>

          {materia.hora_ultimo_registro && (
            <Typography 
              variant="caption" 
              sx={{ 
                mt: 2,
                pt: 2,
                borderTop: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
                color: 'text.disabled',
                display: 'block',
              }}
            >
              ⏱ {materia.hora_ultimo_registro}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

// ──────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ──────────────────────────────────────────────
const MisMaterias: React.FC<Props> = ({
  materias,
  isLoading = false,
  seleccionada,
  onSeleccionar,
  fecha,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const pendientes = materias.filter(m => !m.lista_pasada_hoy).length;
  const completadas = materias.filter(m => m.lista_pasada_hoy).length;

  return (
    <Box>
      {/* Header premium con estadísticas */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3,
          p: 3,
          borderRadius: 4,
          background: isDark
            ? 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'
            : 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.05)}`,
          boxShadow: isDark
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.05)',
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography 
              variant="h5" 
              fontWeight={900}
              sx={{
                background: isDark
                  ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                  : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: -0.5,
              }}
            >
              Mis Materias
            </Typography>
            {!isLoading && materias.length > 0 && (
              <Chip 
                label={materias.length}
                size="small"
                sx={{
                  bgcolor: isDark ? alpha('#fbbf24', 0.2) : alpha('#3b82f6', 0.15),
                  color: isDark ? '#fbbf24' : '#3b82f6',
                  fontWeight: 800,
                  fontSize: 12,
                  height: 24,
                  minWidth: 24,
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Seleccioná una materia para gestionar la asistencia
          </Typography>
        </Box>

        {!isLoading && materias.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Box
              sx={{
                px: 2,
                py: 1,
                borderRadius: 2.5,
                bgcolor: alpha('#10b981', 0.1),
                border: `1px solid ${alpha('#10b981', 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 18, color: '#10b981' }} />
              <Typography variant="body2" fontWeight={700} color="#10b981">
                {completadas}
              </Typography>
            </Box>
            
            <Box
              sx={{
                px: 2,
                py: 1,
                borderRadius: 2.5,
                bgcolor: alpha('#fbbf24', 0.1),
                border: `1px solid ${alpha('#fbbf24', 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <TrendingUpIcon sx={{ fontSize: 18, color: '#fbbf24' }} />
              <Typography variant="body2" fontWeight={700} color="#fbbf24">
                {pendientes}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Grid de materias */}
      <Grid container spacing={3}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={i}>
                <MateriaCardSkeleton />
              </Grid>
            ))
          : materias.length === 0
          ? (
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  textAlign: 'center',
                  py: 8,
                  borderRadius: 4,
                  background: isDark
                    ? 'linear-gradient(145deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)'
                    : 'linear-gradient(145deg, #fafafa 0%, #f3f4f6 100%)',
                  border: `2px dashed ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                }}
              >
                <MenuBookIcon 
                  sx={{ 
                    fontSize: 64, 
                    color: 'text.disabled',
                    mb: 2,
                    opacity: 0.5,
                  }} 
                />
                <Typography 
                  variant="h6" 
                  color="text.secondary" 
                  fontWeight={700}
                  sx={{ mb: 1 }}
                >
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