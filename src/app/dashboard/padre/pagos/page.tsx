'use client';
// app/dashboard/padre/pagos/page.tsx

import React from 'react';
import {
  Box, Container, Typography, Fade, Skeleton,
  useTheme, alpha, LinearProgress, Chip, IconButton, Tooltip,
} from '@mui/material';
import { keyframes } from '@mui/system';
import PaymentsRoundedIcon    from '@mui/icons-material/PaymentsRounded';
import ChevronRightIcon        from '@mui/icons-material/ChevronRight';
import SchoolRoundedIcon       from '@mui/icons-material/SchoolRounded';
import CheckCircleRoundedIcon  from '@mui/icons-material/CheckCircleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import RefreshRoundedIcon      from '@mui/icons-material/RefreshRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';

import { useRouter } from 'next/navigation';
import { useHijosConPagos } from '@/hooks/usePadrePagos';
import { calcularProgreso } from '@/types/padrePagosTypes';
import type { HijoPagoInfo } from '@/types/padrePagosTypes';

// ─── Animaciones ──────────────────────────────────────────────────────────────
const bounceIcon = keyframes`
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
`;
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const shimmer = keyframes`
  0%   { background-position: -1000px 0; }
  100% { background-position:  1000px 0; }
`;
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
`;

// ─── Paleta dorada (igual que el resto de la plataforma) ─────────────────────
const usePalette = () => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold    = isDark ? '#facc15' : '#f59e0b';
  const goldEnd = isDark ? '#f59e0b' : '#d97706';
  const gradBg  = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;
  return { isDark, gold, goldEnd, gradBg, theme };
};

// ─── Skeleton de carga ────────────────────────────────────────────────────────
const HijoSkeleton = () => {
  const { isDark } = usePalette();
  return (
    <Box sx={{
      borderRadius: '20px',
      border: `1.5px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
      bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
      p: 3, overflow: 'hidden', position: 'relative',
    }}>
      <Box sx={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(90deg, transparent, ${alpha('#fff', isDark ? 0.03 : 0.06)}, transparent)`,
        backgroundSize: '1000px 100%',
        animation: `${shimmer} 1.5s linear infinite`,
      }} />
      <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
        <Skeleton variant="circular" width={56} height={56} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="rounded" width="60%" height={20} sx={{ mb: 1, borderRadius: 2 }} />
          <Skeleton variant="rounded" width="40%" height={14} sx={{ borderRadius: 2 }} />
        </Box>
      </Box>
      <Skeleton variant="rounded" height={8} sx={{ borderRadius: 4, mb: 1.5 }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
        {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: '12px' }} />)}
      </Box>
    </Box>
  );
};

// ─── Card de un hijo ──────────────────────────────────────────────────────────
const HijoCard: React.FC<{ hijo: HijoPagoInfo; index: number; onClick: () => void }> = ({
  hijo, index, onClick,
}) => {
  const { isDark, gold, goldEnd, gradBg } = usePalette();

  const progreso  = calcularProgreso({
    total:           hijo.total_mensualidades,
    pagadas:         hijo.mensualidades_pagadas,
    pendientes:      hijo.mensualidades_pendientes,
    vencidas:        0,
    monto_pendiente: 0,
  });

  const alDia     = hijo.mensualidades_pendientes === 0 && hijo.total_mensualidades > 0;
  const tienePend = hijo.mensualidades_pendientes > 0;
  const sinMatric = !hijo.matricula_id;

  // Color del borde según estado
  const borderColor = alDia
    ? alpha('#10b981', 0.4)
    : tienePend
      ? alpha(gold, 0.4)
      : isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07);

  const initials = `${hijo.nombres.charAt(0)}${hijo.apellidos.charAt(0)}`.toUpperCase();

  return (
    <Box
      onClick={sinMatric ? undefined : onClick}
      sx={{
        borderRadius: '20px',
        border: `1.5px solid ${borderColor}`,
        bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
        p: 3,
        cursor: sinMatric ? 'default' : 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
        boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.06)',
        animation: `${fadeUp} 0.35s ease-out ${index * 0.08}s both`,
        position: 'relative',
        overflow: 'hidden',
        opacity: sinMatric ? 0.6 : 1,
        '&:hover': sinMatric ? {} : {
          transform: 'translateY(-4px)',
          borderColor: alpha(gold, 0.6),
          boxShadow: isDark
            ? `0 8px 32px ${alpha(gold, 0.15)}`
            : `0 8px 32px ${alpha(gold, 0.2)}`,
        },
      }}
    >
      {/* Shimmer decorativo en hover */}
      <Box sx={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(135deg, ${alpha(gold, 0.03)}, transparent 60%)`,
        pointerEvents: 'none',
      }} />

      {/* ── Cabecera: avatar + nombre ── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2.5 }}>
        {/* Avatar con iniciales */}
        <Box sx={{
          width: 56, height: 56, borderRadius: '16px', flexShrink: 0,
          background: alDia
            ? 'linear-gradient(135deg, #10b981, #34d399)'
            : gradBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: alDia
            ? '0 4px 16px rgba(16,185,129,0.35)'
            : `0 4px 16px ${alpha(gold, 0.35)}`,
          fontSize: 20, fontWeight: 900, color: isDark ? '#000' : '#fff',
          position: 'relative',
        }}>
          {hijo.foto_url ? (
            <Box
              component="img"
              src={hijo.foto_url}
              alt={hijo.nombres}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : initials}

          {/* Badge al día */}
          {alDia && (
            <Box sx={{
              position: 'absolute', bottom: -4, right: -4,
              width: 18, height: 18, borderRadius: '50%',
              bgcolor: '#10b981', border: `2px solid ${isDark ? '#1a1a2e' : '#fff'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckCircleRoundedIcon sx={{ fontSize: 11, color: '#fff' }} />
            </Box>
          )}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={800} noWrap sx={{ lineHeight: 1.2 }}>
            {hijo.nombres} {hijo.apellidos}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {hijo.grado && hijo.paralelo
              ? `${hijo.grado} "${hijo.paralelo}"`
              : 'Sin matrícula activa'}
            {hijo.nivel && ` · ${hijo.nivel}`}
          </Typography>

          {/* Chip estado */}
          <Box sx={{ mt: 0.75 }}>
            {sinMatric ? (
              <Chip label="Sin matrícula" size="small"
                sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: alpha('#6b7280', 0.12), color: '#6b7280', borderRadius: 1.5 }} />
            ) : alDia ? (
              <Chip label="✓ Al día" size="small"
                sx={{ height: 20, fontSize: 10, fontWeight: 800, bgcolor: alpha('#10b981', 0.12), color: '#10b981', borderRadius: 1.5 }} />
            ) : (
              <Chip
                icon={<WarningAmberRoundedIcon sx={{ fontSize: '11px !important', color: `${gold} !important` }} />}
                label={`${hijo.mensualidades_pendientes} pendiente${hijo.mensualidades_pendientes > 1 ? 's' : ''}`}
                size="small"
                sx={{
                  height: 20, fontSize: 10, fontWeight: 800,
                  bgcolor: isDark ? alpha(gold, 0.15) : alpha(gold, 0.1),
                  color: isDark ? gold : '#d97706',
                  border: `1px solid ${alpha(gold, 0.3)}`,
                  borderRadius: 1.5,
                  '& .MuiChip-icon': { color: gold },
                }}
              />
            )}
          </Box>
        </Box>

        {/* Flecha */}
        {!sinMatric && (
          <ChevronRightIcon sx={{
            color: isDark ? alpha(gold, 0.5) : alpha('#d97706', 0.5),
            fontSize: 22, flexShrink: 0, mt: 0.5,
            transition: 'transform 0.2s, color 0.2s',
          }} />
        )}
      </Box>

      {/* ── Barra de progreso ── */}
      {!sinMatric && hijo.total_mensualidades > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: 11 }}>
              Mensualidades pagadas
            </Typography>
            <Typography variant="caption" fontWeight={800}
              sx={{ color: alDia ? '#10b981' : gold, fontSize: 11 }}>
              {hijo.mensualidades_pagadas}/{hijo.total_mensualidades}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progreso}
            sx={{
              height: 6, borderRadius: 4,
              bgcolor: isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06),
              '& .MuiLinearProgress-bar': {
                background: alDia
                  ? 'linear-gradient(90deg, #10b981, #34d399)'
                  : gradBg,
                borderRadius: 4,
                transition: 'width 0.6s ease',
              },
            }}
          />
        </Box>
      )}

      {/* ── Stats rápidos ── */}
      {!sinMatric && (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
          {[
            {
              label: 'Total',
              value: hijo.total_mensualidades,
              color: isDark ? alpha('#fff', 0.6) : '#6b7280',
            },
            {
              label: 'Pagadas',
              value: hijo.mensualidades_pagadas,
              color: '#10b981',
            },
            {
              label: 'Pendientes',
              value: hijo.mensualidades_pendientes,
              color: hijo.mensualidades_pendientes > 0 ? (isDark ? gold : '#d97706') : '#10b981',
            },
          ].map(stat => (
            <Box key={stat.label} sx={{
              p: 1.25, borderRadius: '12px', textAlign: 'center',
              bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#f8f9fa', 0.8),
              border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)}`,
            }}>
              <Typography variant="h6" fontWeight={900} sx={{ color: stat.color, lineHeight: 1.1 }}>
                {stat.value}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, fontWeight: 600 }}>
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Período académico */}
      {hijo.periodo_academico && (
        <Typography variant="caption" color="text.disabled"
          sx={{ display: 'block', mt: 1.5, fontSize: 10, textAlign: 'right', fontWeight: 600 }}>
          {hijo.periodo_academico}
        </Typography>
      )}
    </Box>
  );
};

// ─── Página principal ─────────────────────────────────────────────────────────
export default function PadrePagosPage() {
  const { isDark, gold, goldEnd, gradBg } = usePalette();
  const router = useRouter();

  const { hijos, isLoading, refrescar } = useHijosConPagos();

  // Totales generales para el resumen del header
  const totalPendientes = hijos.reduce((acc, h) => acc + h.mensualidades_pendientes, 0);
  const totalPagadas    = hijos.reduce((acc, h) => acc + h.mensualidades_pagadas, 0);
  const totalMens       = hijos.reduce((acc, h) => acc + h.total_mensualidades, 0);

  return (
    <Box sx={{
      minHeight: '100vh',
      background: isDark
        ? 'radial-gradient(circle at top right, rgba(250,204,21,0.04), transparent 60%)'
        : 'radial-gradient(circle at top right, rgba(245,158,11,0.03), transparent 60%)',
    }}>
      <Container maxWidth="xl" disableGutters>

        {/* ══ HEADER ══ */}
        <Fade in timeout={400}>
          <Box sx={{ mb: 4, pt: 3 }}>
            <Box sx={{
              p: 3.5, borderRadius: 4,
              background: isDark
                ? 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)'
                : '#fff',
              border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.05)}`,
              boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.06)',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Shimmer decorativo */}
              <Box sx={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(90deg, transparent, ${alpha('#fff', isDark ? 0.03 : 0.08)}, transparent)`,
                backgroundSize: '1000px 100%',
                animation: `${shimmer} 4s linear infinite`,
                pointerEvents: 'none',
              }} />

              <Box sx={{
                display: 'flex', alignItems: 'flex-start',
                justifyContent: 'space-between', flexWrap: 'wrap', gap: 2,
                position: 'relative', zIndex: 1,
              }}>
                {/* Título */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{
                    width: 56, height: 56, borderRadius: 3,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: gradBg,
                    boxShadow: `0 6px 20px ${alpha(gold, 0.4)}`,
                  }}>
                    <AccountBalanceWalletRoundedIcon
                      sx={{ fontSize: 30, color: isDark ? '#000' : '#fff',
                        animation: `${bounceIcon} 2s ease-in-out infinite` }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={900} sx={{
                      background: gradBg,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      letterSpacing: -0.5, lineHeight: 1.2,
                    }}>
                      Pagos y Mensualidades
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mt: 0.25 }}>
                      Seleccioná un hijo para ver sus mensualidades
                    </Typography>
                  </Box>
                </Box>

                {/* Botón refrescar */}
                <Tooltip title="Actualizar">
                  <IconButton
                    onClick={refrescar}
                    disabled={isLoading}
                    size="small"
                    sx={{
                      bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                      border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)}`,
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: isDark ? alpha(gold, 0.15) : alpha(gold, 0.08),
                        transform: 'rotate(180deg)',
                      },
                    }}
                  >
                    <RefreshRoundedIcon sx={{ fontSize: 18, color: isDark ? gold : '#d97706' }} />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* ── Resumen global (solo si hay datos) ── */}
              {!isLoading && totalMens > 0 && (
                <Box sx={{
                  mt: 2.5, pt: 2.5,
                  borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)}`,
                  display: 'flex', gap: 3, flexWrap: 'wrap',
                  position: 'relative', zIndex: 1,
                }}>
                  {[
                    { label: 'Total mensualidades', value: totalMens,       color: isDark ? alpha('#fff', 0.7) : '#6b7280' },
                    { label: 'Pagadas',              value: totalPagadas,    color: '#10b981' },
                    { label: 'Pendientes',           value: totalPendientes, color: totalPendientes > 0 ? (isDark ? gold : '#d97706') : '#10b981' },
                  ].map(stat => (
                    <Box key={stat.label}>
                      <Typography variant="h5" fontWeight={900} sx={{ color: stat.color, lineHeight: 1 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ fontSize: 11 }}>
                        {stat.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Fade>

        {/* ══ GRID DE HIJOS ══ */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          },
          gap: 2.5,
          pb: 6,
        }}>

          {/* Loading skeletons */}
          {isLoading && [1, 2, 3].map(i => <HijoSkeleton key={i} />)}

          {/* Sin hijos */}
          {!isLoading && hijos.length === 0 && (
            <Box sx={{
              gridColumn: '1 / -1',
              textAlign: 'center', py: 8, borderRadius: '20px',
              border: `2px dashed ${isDark ? alpha(gold, 0.25) : alpha('#d97706', 0.25)}`,
              bgcolor: isDark ? alpha(gold, 0.03) : alpha(gold, 0.02),
            }}>
              <SchoolRoundedIcon sx={{ fontSize: 48, color: alpha(gold, 0.4), mb: 1.5 }} />
              <Typography variant="h6" fontWeight={700} sx={{ color: isDark ? gold : '#d97706', mb: 0.5 }}>
                No tenés hijos registrados
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Contactá al administrador si esto es un error
              </Typography>
            </Box>
          )}

          {/* Cards de hijos */}
          {!isLoading && hijos.map((hijo, i) => (
            <HijoCard
              key={hijo.estudiante_id}
              hijo={hijo}
              index={i}
              onClick={() => router.push(`/dashboard/padre/pagos/${hijo.estudiante_id}`)}
            />
          ))}
        </Box>

      </Container>
    </Box>
  );
}