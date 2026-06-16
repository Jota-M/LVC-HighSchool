'use client';
// components/docente/seguimiento/ListaEstudiantesSeguimiento.tsx

import React, { useState } from 'react';
import {
  Box, Typography, Grid, Avatar, Chip, Stack,
  Skeleton, TextField, InputAdornment, Tooltip, useTheme, alpha,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ErrorIcon from '@mui/icons-material/Error';
import GroupsIcon from '@mui/icons-material/Groups';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { keyframes } from '@mui/system';

import { ResumenEstudianteAsignacion } from '@/types/seguimientoPedagogicoTypes';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─────────────────────────────────────
// CARD individual
// ─────────────────────────────────────

interface EstudianteCardProps {
  est: ResumenEstudianteAsignacion;
  seleccionado: boolean;
  onSeleccionar: (matriculaId: number) => void;
  index: number;
  brand: string;
  brandEnd: string;
  gradBg: string;
}

const EstudianteCard: React.FC<EstudianteCardProps> = ({
  est, seleccionado, onSeleccionar, index, brand, brandEnd, gradBg,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const tieneUrgente = est.urgentes > 0;
  const tieneAtencion = est.requieren_atencion > 0;

  const iniciales = `${est.estudiante_nombres.charAt(0)}${est.estudiante_apellidos.charAt(0)}`.toUpperCase();

  // Color del borde superior (acento) y del avatar
  const accentColor = tieneUrgente
    ? '#dc2626'
    : tieneAtencion
      ? '#d97706'
      : brand;

  const avatarBg = tieneUrgente
    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
    : tieneAtencion
      ? 'linear-gradient(135deg, #f59e0b, #d97706)'
      : gradBg;

  const borderColor = isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07);
  const selectedBorder = seleccionado ? `2px solid ${accentColor}` : `1.5px solid ${borderColor}`;

  return (
    <Box
      onClick={() => onSeleccionar(est.matricula_id)}
      sx={{
        borderRadius: '16px',
        border: selectedBorder,
        bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
        cursor: 'pointer',
        overflow: 'hidden',
        boxShadow: seleccionado
          ? `0 4px 20px ${alpha(accentColor, 0.2)}`
          : isDark ? 'none' : '0 1px 8px rgba(0,0,0,0.05)',
        transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s',
        animation: `${fadeUp} 0.35s ease-out ${index * 0.04}s both`,
        '&:hover': {
          transform: 'translateY(-3px)',
          borderColor: alpha(accentColor, 0.5),
          boxShadow: isDark
            ? `0 4px 20px ${alpha(accentColor, 0.15)}`
            : `0 6px 24px ${alpha(accentColor, 0.18)}`,
        },
        // borde superior de color (mismo truco que imagen 2)
        '&::before': {
          content: '""',
          display: 'block',
          height: '3px',
          background: accentColor,
          borderRadius: '16px 16px 0 0',
          marginTop: '-1.5px',
        },
      }}
    >
      {/* ── Cabecera: avatar + nombre ── */}
      <Box sx={{ px: 2.5, pt: 2, pb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          sx={{
            width: 44, height: 44,
            background: avatarBg,
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.95rem',
            flexShrink: 0,
          }}
        >
          {iniciales}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            fontWeight={700}
            sx={{
              lineHeight: 1.25,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {est.estudiante_apellidos}, {est.estudiante_nombres}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            {est.estudiante_codigo}
          </Typography>
        </Box>

        <ChevronRightIcon sx={{ fontSize: 18, color: alpha(accentColor, 0.6), flexShrink: 0 }} />
      </Box>

      {/* ── Stats en cajitas (igual que imagen 2) ── */}
      <Box sx={{ px: 2.5, pb: 1.5, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        {/* Observaciones totales */}
        <Box sx={{
          bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#f8f9fa', 0.9),
          borderRadius: '10px',
          p: 1.2,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
            <GroupsIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
              Observaciones
            </Typography>
          </Box>
          <Typography variant="body2" fontWeight={800}>
            {est.total_obs}
          </Typography>
        </Box>

        {/* Urgentes / sin leer */}
        <Box sx={{
          bgcolor: tieneUrgente
            ? alpha('#dc2626', 0.07)
            : isDark ? alpha('#fff', 0.04) : alpha('#f8f9fa', 0.9),
          borderRadius: '10px',
          p: 1.2,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
            <ErrorIcon sx={{ fontSize: 12, color: tieneUrgente ? '#dc2626' : 'text.disabled' }} />
            <Typography
              variant="caption"
              sx={{ fontSize: '0.68rem', color: tieneUrgente ? '#dc2626' : 'text.secondary' }}
            >
              Urgentes
            </Typography>
          </Box>
          <Typography
            variant="body2"
            fontWeight={800}
            sx={{ color: tieneUrgente ? '#dc2626' : 'text.primary' }}
          >
            {est.urgentes > 0 ? est.urgentes : '—'}
          </Typography>
        </Box>
      </Box>

      {/* ── Footer: última obs + chip estado ── */}
      <Box sx={{
        px: 2.5,
        py: 1.25,
        borderTop: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem' }}>
          {est.ultima_obs_fecha
            ? `Última: ${new Date(est.ultima_obs_fecha + 'T12:00:00').toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })}`
            : 'Sin observaciones'}
        </Typography>

        {/* Badge de estado */}
        {tieneUrgente ? (
          <Chip size="small" label="Urgente"
            sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700, bgcolor: alpha('#dc2626', 0.1), color: '#dc2626', border: `1px solid ${alpha('#dc2626', 0.2)}` }} />
        ) : tieneAtencion ? (
          <Chip size="small" label="Atención"
            sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700, bgcolor: alpha('#d97706', 0.1), color: '#d97706', border: `1px solid ${alpha('#d97706', 0.2)}` }} />
        ) : est.no_acusados > 0 ? (
          <Chip size="small" label="Sin leer"
            sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700, bgcolor: alpha('#7c3aed', 0.1), color: '#7c3aed', border: `1px solid ${alpha('#7c3aed', 0.2)}` }} />
        ) : (
          <Tooltip title="Registrar observación">
            <AddCircleIcon sx={{ fontSize: 16, color: alpha(brand, 0.5) }} />
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────
// LISTA COMPLETA
// ─────────────────────────────────────

interface ListaEstudiantesSeguimientoProps {
  resumen: ResumenEstudianteAsignacion[];
  isLoading: boolean;
  estudianteSeleccionado: number | null;
  onSeleccionar: (matriculaId: number) => void;
}

const ListaEstudiantesSeguimiento: React.FC<ListaEstudiantesSeguimientoProps> = ({
  resumen, isLoading, estudianteSeleccionado, onSeleccionar,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [busqueda, setBusqueda] = useState('');

  // ── tokens ──
  const brand = isDark ? '#facc15' : '#0288d1';
  const brandEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${brand} 0%, ${brandEnd} 100%)`;

  const filtrados = resumen.filter(e => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return (
      e.estudiante_nombres.toLowerCase().includes(q) ||
      e.estudiante_apellidos.toLowerCase().includes(q) ||
      e.estudiante_codigo.toLowerCase().includes(q)
    );
  });

  const urgentes = resumen.filter(e => e.urgentes > 0).length;
  const conPendiente = resumen.filter(e => e.no_acusados > 0).length;

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
            <Skeleton variant="rounded" height={160} sx={{ borderRadius: '16px' }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box>
      {/* Barra búsqueda + resumen */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Buscar estudiante..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
            sx: { borderRadius: '12px' },
          }}
          sx={{
            flex: 1,
            minWidth: 200,
            maxWidth: 320,
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': { borderColor: alpha(brand, 0.5) },
              '&.Mui-focused fieldset': { borderColor: brand },
            },
          }}
        />

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            size="small"
            label={`${resumen.length} estudiantes`}
            sx={{
              bgcolor: isDark ? alpha('#fff', 0.07) : alpha('#000', 0.05),
              fontWeight: 700,
              fontSize: '0.72rem',
            }}
          />
          {urgentes > 0 && (
            <Chip
              size="small"
              icon={<ErrorIcon sx={{ fontSize: '13px !important', color: '#dc2626 !important' }} />}
              label={`${urgentes} con urgentes`}
              sx={{ bgcolor: alpha('#dc2626', 0.08), color: '#dc2626', border: `1px solid ${alpha('#dc2626', 0.2)}`, fontWeight: 700, fontSize: '0.72rem' }}
            />
          )}
          {conPendiente > 0 && (
            <Chip
              size="small"
              label={`${conPendiente} sin leer`}
              sx={{ bgcolor: alpha('#7c3aed', 0.08), color: '#7c3aed', border: `1px solid ${alpha('#7c3aed', 0.2)}`, fontWeight: 700, fontSize: '0.72rem' }}
            />
          )}
        </Stack>
      </Box>

      {/* Grid */}
      {filtrados.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary" fontWeight={600}>
            No se encontró ningún estudiante
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filtrados.map((est, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={est.matricula_id}>
              <EstudianteCard
                est={est}
                seleccionado={estudianteSeleccionado === est.matricula_id}
                onSeleccionar={onSeleccionar}
                index={i}
                brand={brand}
                brandEnd={brandEnd}
                gradBg={gradBg}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ListaEstudiantesSeguimiento;