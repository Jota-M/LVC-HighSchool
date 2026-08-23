'use client';
// components/padre/seguimiento/TarjetasHijos.tsx
// Tarjetas de resumen por hijo — el padre ve cuántas observaciones
// tiene cada uno y puede seleccionar al que quiere revisar.
// Restyled: el acento "sin novedades" (antes morado fijo) ahora usa el token
// de marca compartido (ámbar oscuro / azul claro). Los acentos de urgente
// (rojo) y atención (ámbar-alerta) son semánticos y se mantienen igual.

import React from 'react';
import {
  Box, Card, CardContent, CardActionArea, Typography, Avatar,
  Chip, Stack, Skeleton, Badge, useTheme, alpha,
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import CheckIcon from '@mui/icons-material/Check';
import PersonIcon from '@mui/icons-material/Person';
import { keyframes } from '@mui/system';

import { ResumenHijo } from '@/types/seguimientoPadreTypes';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

interface TarjetasHijosProps {
  resumen: ResumenHijo[];
  isLoading: boolean;
  hijoSeleccionado: number | null; // estudiante_id
  onSeleccionar: (hijoId: number) => void;
}

const TarjetasHijos: React.FC<TarjetasHijosProps> = ({
  resumen, isLoading, hijoSeleccionado, onSeleccionar,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // ─── Token de marca compartido (mismo criterio que financiero / seguimiento) ───
  const primary = isDark ? '#facc15' : '#0288d1';

  if (isLoading) {
    return (
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} variant="rounded" width={220} height={130} sx={{ borderRadius: 3 }} />
        ))}
      </Stack>
    );
  }

  if (resumen.length === 0) return null;

  return (
    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
      {resumen.map((hijo, i) => {
        const seleccionado = hijoSeleccionado === hijo.estudiante_id;
        const tieneUrgente = hijo.urgentes > 0;
        const tieneAtencion = hijo.requieren_atencion > 0;
        const iniciales = `${hijo.estudiante_nombres.charAt(0)}${hijo.estudiante_apellidos.charAt(0)}`;

        const accentColor = tieneUrgente
          ? '#dc2626'
          : tieneAtencion
            ? '#d97706'
            : primary;

        return (
          <Card
            key={hijo.estudiante_id}
            sx={{
              borderRadius: 3,
              width: { xs: '100%', sm: 220 },
              border: seleccionado
                ? `2px solid ${accentColor}`
                : tieneUrgente
                  ? `1.5px solid ${alpha('#dc2626', 0.4)}`
                  : `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
              background: seleccionado
                ? isDark
                  ? `linear-gradient(145deg, ${alpha(accentColor, 0.15)}, ${alpha(accentColor, 0.05)})`
                  : `linear-gradient(145deg, ${alpha(accentColor, 0.07)}, #fff)`
                : isDark ? alpha('#fff', 0.03) : '#fff',
              boxShadow: seleccionado
                ? `0 4px 20px ${alpha(accentColor, 0.25)}`
                : tieneUrgente
                  ? `0 4px 16px ${alpha('#dc2626', 0.15)}`
                  : '0 2px 8px rgba(0,0,0,0.06)',
              animation: `${fadeUp} 0.4s ease-out ${i * 0.08}s both`,
              transition: 'all 0.2s ease',
            }}
          >
            <CardActionArea
              onClick={() => onSeleccionar(hijo.estudiante_id)}
              sx={{ borderRadius: 3 }}
            >
              <CardContent sx={{ p: 2.5 }}>
                {/* Avatar + nombre */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Badge
                    badgeContent={hijo.no_leidos > 0 ? hijo.no_leidos : undefined}
                    color="error"
                    overlap="circular"
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        minWidth: 18,
                        height: 18,
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 46, height: 46,
                        background: tieneUrgente
                          ? 'linear-gradient(135deg, #fee2e2, #fecaca)'
                          : tieneAtencion
                            ? 'linear-gradient(135deg, #fef3c7, #fde68a)'
                            : isDark
                              ? `linear-gradient(135deg, ${alpha(accentColor, 0.3)}, ${alpha(accentColor, 0.15)})`
                              : `linear-gradient(135deg, ${alpha(accentColor, 0.15)}, ${alpha(accentColor, 0.08)})`,
                        color: tieneUrgente ? '#dc2626' : tieneAtencion ? '#d97706' : accentColor,
                        fontWeight: 800,
                        fontSize: '1rem',
                      }}
                    >
                      {iniciales}
                    </Avatar>
                  </Badge>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      fontWeight={800}
                      sx={{
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {hijo.estudiante_nombres}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                      }}
                    >
                      {hijo.estudiante_apellidos}
                    </Typography>
                  </Box>
                </Box>

                {/* Chips de estado */}
                {hijo.total_observaciones > 0 ? (
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {hijo.urgentes > 0 && (
                      <Chip
                        size="small"
                        icon={<ErrorIcon sx={{ fontSize: '11px !important', color: '#dc2626 !important' }} />}
                        label={hijo.urgentes}
                        sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 800, fontSize: '0.68rem', height: 20 }}
                      />
                    )}
                    {hijo.requieren_atencion > 0 && (
                      <Chip
                        size="small"
                        icon={<WarningIcon sx={{ fontSize: '11px !important', color: '#d97706 !important' }} />}
                        label={hijo.requieren_atencion}
                        sx={{ bgcolor: '#fef3c7', color: '#d97706', fontWeight: 800, fontSize: '0.68rem', height: 20 }}
                      />
                    )}
                    {hijo.informativos > 0 && (
                      <Chip
                        size="small"
                        label={`${hijo.informativos} info`}
                        sx={{ bgcolor: isDark ? alpha('#fff', 0.08) : '#f1f5f9', color: 'text.secondary', fontWeight: 700, fontSize: '0.68rem', height: 20 }}
                      />
                    )}
                    {hijo.no_leidos === 0 && hijo.total_observaciones > 0 && (
                      <Chip
                        size="small"
                        icon={<CheckIcon sx={{ fontSize: '11px !important', color: '#16a34a !important' }} />}
                        label="Al día"
                        sx={{ bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 700, fontSize: '0.68rem', height: 20 }}
                      />
                    )}
                  </Stack>
                ) : (
                  <Typography variant="caption" color="text.disabled" fontStyle="italic">
                    Sin observaciones
                  </Typography>
                )}
              </CardContent>
            </CardActionArea>
          </Card>
        );
      })}
    </Stack>
  );
};

export default TarjetasHijos;