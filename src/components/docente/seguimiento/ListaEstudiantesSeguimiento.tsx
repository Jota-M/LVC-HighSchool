'use client';
// components/docente/seguimiento/ListaEstudiantesSeguimiento.tsx
// Lista de estudiantes de un paralelo con sus conteos de observaciones.
// Mismo estilo visual que MisMaterias / PaseListaInteractivo.

import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Avatar, Chip, Stack,
  Skeleton, TextField, InputAdornment, Badge, Tooltip, useTheme, alpha,
} from '@mui/material';
import SearchIcon    from '@mui/icons-material/Search';
import WarningIcon   from '@mui/icons-material/Warning';
import InfoIcon      from '@mui/icons-material/Info';
import ErrorIcon     from '@mui/icons-material/Error';
import CheckIcon     from '@mui/icons-material/Check';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { keyframes } from '@mui/system';

import { ResumenEstudianteAsignacion } from '@/types/seguimientoPedagogicoTypes';

const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─────────────────────────────────────
// CARD individual de estudiante
// ─────────────────────────────────────

interface EstudianteCardProps {
  est: ResumenEstudianteAsignacion;
  seleccionado: boolean;
  onSeleccionar: (matriculaId: number) => void;
  index: number;
}

const EstudianteCard: React.FC<EstudianteCardProps> = ({
  est, seleccionado, onSeleccionar, index,
}) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const tieneUrgente  = est.urgentes > 0;
  const tieneAtencion = est.requieren_atencion > 0;
  const sinLeer       = est.no_acusados > 0;

  const borderColor = tieneUrgente
    ? alpha('#dc2626', 0.5)
    : tieneAtencion
      ? alpha('#d97706', 0.4)
      : seleccionado
        ? isDark ? '#fbbf24' : '#3b82f6'
        : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08);

  const iniciales = `${est.estudiante_nombres.charAt(0)}${est.estudiante_apellidos.charAt(0)}`;

  const avatarBg = tieneUrgente
    ? 'linear-gradient(135deg, #fee2e2, #fecaca)'
    : tieneAtencion
      ? 'linear-gradient(135deg, #fef3c7, #fde68a)'
      : isDark
        ? 'linear-gradient(135deg, #1e3a5f, #1e40af)'
        : 'linear-gradient(135deg, #dbeafe, #bfdbfe)';

  const avatarColor = tieneUrgente ? '#dc2626' : tieneAtencion ? '#d97706' : isDark ? '#93c5fd' : '#1d4ed8';

  return (
    <Card
      onClick={() => onSeleccionar(est.matricula_id)}
      sx={{
        borderRadius: 3,
        cursor: 'pointer',
        border: `1.5px solid ${borderColor}`,
        background: seleccionado
          ? isDark
            ? `linear-gradient(145deg, ${alpha('#fbbf24', 0.12)}, ${alpha('#fbbf24', 0.04)})`
            : `linear-gradient(145deg, ${alpha('#3b82f6', 0.08)}, ${alpha('#3b82f6', 0.02)})`
          : isDark
            ? alpha('#fff', 0.03)
            : '#fff',
        boxShadow: seleccionado
          ? isDark
            ? `0 0 0 3px ${alpha('#fbbf24', 0.25)}, 0 4px 20px rgba(0,0,0,0.3)`
            : `0 0 0 3px ${alpha('#3b82f6', 0.2)}, 0 4px 20px rgba(0,0,0,0.1)`
          : tieneUrgente
            ? `0 4px 16px ${alpha('#dc2626', 0.15)}`
            : '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'all 0.25s ease',
        animation: `${fadeSlideUp} 0.4s ease-out ${index * 0.04}s both`,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: isDark
            ? `0 8px 24px rgba(0,0,0,0.4)`
            : `0 8px 24px rgba(0,0,0,0.12)`,
        },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          {/* Avatar */}
          <Badge
            badgeContent={tieneUrgente ? '!' : undefined}
            color="error"
            overlap="circular"
            invisible={!tieneUrgente}
          >
            <Avatar
              sx={{
                width: 42, height: 42,
                background: avatarBg,
                color: avatarColor,
                fontWeight: 800,
                fontSize: '0.9rem',
                flexShrink: 0,
              }}
            >
              {iniciales}
            </Avatar>
          </Badge>

          {/* Nombre */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{ lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {est.estudiante_apellidos}, {est.estudiante_nombres}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {est.estudiante_codigo}
            </Typography>
          </Box>

          {/* Ícono de nueva obs */}
          <Tooltip title="Seleccionar para registrar observación">
            <AddCircleIcon
              sx={{
                fontSize: 20,
                color: isDark ? alpha('#fbbf24', 0.5) : alpha('#3b82f6', 0.5),
                flexShrink: 0,
              }}
            />
          </Tooltip>
        </Box>

        {/* Chips de conteo */}
        {est.total_obs > 0 ? (
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {est.urgentes > 0 && (
              <Chip
                size="small"
                icon={<ErrorIcon sx={{ fontSize: '12px !important', color: '#dc2626 !important' }} />}
                label={`${est.urgentes} urgente${est.urgentes > 1 ? 's' : ''}`}
                sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 700, fontSize: '0.68rem', height: 22 }}
              />
            )}
            {est.requieren_atencion > 0 && (
              <Chip
                size="small"
                icon={<WarningIcon sx={{ fontSize: '12px !important', color: '#d97706 !important' }} />}
                label={`${est.requieren_atencion} atención`}
                sx={{ bgcolor: '#fef3c7', color: '#d97706', fontWeight: 700, fontSize: '0.68rem', height: 22 }}
              />
            )}
            {est.informativos > 0 && (
              <Chip
                size="small"
                icon={<InfoIcon sx={{ fontSize: '12px !important', color: '#1d4ed8 !important' }} />}
                label={`${est.informativos} info`}
                sx={{ bgcolor: '#dbeafe', color: '#1d4ed8', fontWeight: 700, fontSize: '0.68rem', height: 22 }}
              />
            )}
            {sinLeer && (
              <Chip
                size="small"
                label={`${est.no_acusados} sin leer`}
                sx={{ bgcolor: '#f3e8ff', color: '#7c3aed', fontWeight: 700, fontSize: '0.68rem', height: 22 }}
              />
            )}
          </Stack>
        ) : (
          <Typography variant="caption" color="text.disabled" fontStyle="italic">
            Sin observaciones aún
          </Typography>
        )}

        {/* Última observación */}
        {est.ultima_obs_fecha && (
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1 }}>
            Última: {new Date(est.ultima_obs_fecha + 'T12:00:00').toLocaleDateString('es-BO', {
              day: '2-digit', month: 'short',
            })}
          </Typography>
        )}
      </CardContent>
    </Card>
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
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [busqueda, setBusqueda] = useState('');

  const filtrados = resumen.filter(e => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return (
      e.estudiante_nombres.toLowerCase().includes(q) ||
      e.estudiante_apellidos.toLowerCase().includes(q) ||
      e.estudiante_codigo.toLowerCase().includes(q)
    );
  });

  // Conteos para el header
  const urgentes    = resumen.filter(e => e.urgentes > 0).length;
  const conPendiente = resumen.filter(e => e.no_acusados > 0).length;

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Grid size={{xs:12,sm:6,md:4,lg:3}}  key={i}>
            <Skeleton variant="rounded" height={110} sx={{ borderRadius: 3 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box>
      {/* Barra de búsqueda + resumen */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        mb: 3,
        flexWrap: 'wrap',
      }}>
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
          sx={{ flex: 1, minWidth: 200, maxWidth: 320 }}
        />

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            size="small"
            label={`${resumen.length} estudiantes`}
            sx={{ bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06), fontWeight: 700, fontSize: '0.75rem' }}
          />
          {urgentes > 0 && (
            <Chip
              size="small"
              icon={<ErrorIcon sx={{ fontSize: '13px !important', color: '#dc2626 !important' }} />}
              label={`${urgentes} con urgentes`}
              sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 700, fontSize: '0.75rem' }}
            />
          )}
          {conPendiente > 0 && (
            <Chip
              size="small"
              label={`${conPendiente} sin leer`}
              sx={{ bgcolor: '#f3e8ff', color: '#7c3aed', fontWeight: 700, fontSize: '0.75rem' }}
            />
          )}
        </Stack>
      </Box>

      {/* Grid de cards */}
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
            <Grid size={{xs:12,sm:6,md:4,lg:3}}  key={est.matricula_id}>
              <EstudianteCard
                est={est}
                seleccionado={estudianteSeleccionado === est.matricula_id}
                onSeleccionar={onSeleccionar}
                index={i}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ListaEstudiantesSeguimiento;