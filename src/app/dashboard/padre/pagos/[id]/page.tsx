'use client';
// app/dashboard/padre/pagos/[estudianteId]/page.tsx

import React from 'react';
import {
  Box, Container, Typography, Fade, Skeleton,
  useTheme, alpha, LinearProgress, Chip, IconButton,
  Tooltip, Stack, Divider,
} from '@mui/material';
import { keyframes } from '@mui/system';
import ArrowBackRoundedIcon       from '@mui/icons-material/ArrowBackRounded';
import PaymentsRoundedIcon        from '@mui/icons-material/PaymentsRounded';
import CheckCircleRoundedIcon     from '@mui/icons-material/CheckCircleRounded';
import WarningAmberRoundedIcon    from '@mui/icons-material/WarningAmberRounded';
import LockClockRoundedIcon       from '@mui/icons-material/LockClockRounded';
import QrCode2RoundedIcon         from '@mui/icons-material/QrCode2Rounded';
import RefreshRoundedIcon         from '@mui/icons-material/RefreshRounded';
import CalendarMonthRoundedIcon   from '@mui/icons-material/CalendarMonthRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';

import { useRouter, useParams } from 'next/navigation';
import { useMensualidadesHijo } from '@/hooks/usePadrePagos';
import {
  ESTADO_MENSUALIDAD_CONFIG,
  MESES_LABELS,
  calcularProgreso,
  puedePagar,
  formatFechaPago,
} from '@/types/padrePagosTypes';
import type { MensualidadHijo } from '@/types/padrePagosTypes';

// ─── Animaciones ──────────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const shimmer = keyframes`
  0%   { background-position: -1000px 0; }
  100% { background-position:  1000px 0; }
`;
const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.4); }
  50%       { box-shadow: 0 0 0 8px rgba(245,158,11,0); }
`;

// ─── Paleta ───────────────────────────────────────────────────────────────────
const usePalette = () => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold    = isDark ? '#facc15' : '#f59e0b';
  const goldEnd = isDark ? '#f59e0b' : '#d97706';
  const gradBg  = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;
  return { isDark, gold, goldEnd, gradBg };
};

// ─── Card de mensualidad individual ──────────────────────────────────────────
const MensualidadCard: React.FC<{
  mens:    MensualidadHijo;
  index:   number;
  onPagar: () => void;
}> = ({ mens, index, onPagar }) => {
  const { isDark, gold, gradBg } = usePalette();
  const cfg     = ESTADO_MENSUALIDAD_CONFIG[mens.estado];
  const puedeP  = puedePagar(mens);
  const mesLabel = MESES_LABELS[mens.mes_correspondiente] ?? mens.mes_correspondiente;
  const esPagado = mens.estado === 'pagado';
  const esVencido = mens.estado === 'vencido';

  return (
    <Box sx={{
      borderRadius: '16px',
      border: `1.5px solid ${
        esPagado  ? alpha('#10b981', 0.3) :
        esVencido ? alpha('#ef4444', 0.3) :
        mens.tiene_qr_activo ? alpha(gold, 0.5) :
        isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)
      }`,
      bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
      overflow: 'hidden',
      animation: `${fadeUp} 0.3s ease-out ${index * 0.05}s both`,
      transition: 'transform 0.18s, box-shadow 0.18s',
      boxShadow: esPagado
        ? `0 2px 12px ${alpha('#10b981', 0.1)}`
        : isDark ? 'none' : '0 1px 6px rgba(0,0,0,0.04)',
      ...(puedeP && {
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 6px 24px ${alpha(gold, isDark ? 0.2 : 0.15)}`,
        },
      }),
    }}>

      {/* Franja de color superior */}
      <Box sx={{
        height: 3,
        background: esPagado
          ? 'linear-gradient(90deg, #10b981, #34d399)'
          : cfg.gradient,
      }} />

      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>

        {/* Número de cuota */}
        <Box sx={{
          width: 48, height: 48, borderRadius: '14px', flexShrink: 0,
          background: esPagado
            ? 'linear-gradient(135deg, #10b981, #34d399)'
            : cfg.gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: esPagado
            ? '0 4px 12px rgba(16,185,129,0.3)'
            : `0 4px 12px ${alpha(cfg.color, 0.3)}`,
        }}>
          {esPagado ? (
            <CheckCircleRoundedIcon sx={{ fontSize: 22, color: '#fff' }} />
          ) : (
            <Typography variant="h6" fontWeight={900} sx={{ color: '#fff', lineHeight: 1 }}>
              {mens.numero_cuota}
            </Typography>
          )}
        </Box>

        {/* Info central */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.4 }}>
            <Typography variant="subtitle2" fontWeight={800} sx={{ fontSize: 14 }}>
              {mesLabel}
            </Typography>
            <Chip
              label={cfg.label}
              size="small"
              sx={{
                height: 18, fontSize: 10, fontWeight: 800,
                bgcolor: isDark ? alpha(cfg.color, 0.15) : alpha(cfg.color, 0.1),
                color: cfg.color,
                borderRadius: 1.5,
              }}
            />
            {mens.tiene_qr_activo && (
              <Chip
                icon={<QrCode2RoundedIcon sx={{ fontSize: '11px !important' }} />}
                label="QR activo"
                size="small"
                sx={{
                  height: 18, fontSize: 10, fontWeight: 800,
                  bgcolor: isDark ? alpha(gold, 0.15) : alpha(gold, 0.1),
                  color: isDark ? gold : '#d97706',
                  border: `1px solid ${alpha(gold, 0.3)}`,
                  borderRadius: 1.5,
                  animation: `${pulseGlow} 2s ease-in-out infinite`,
                  '& .MuiChip-icon': { color: isDark ? gold : '#d97706' },
                }}
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11, fontWeight: 600 }}>
              <CalendarMonthRoundedIcon sx={{ fontSize: 11, mr: 0.4, verticalAlign: 'middle' }} />
              Vence: {formatFechaPago(mens.fecha_vencimiento)}
            </Typography>
            {mens.monto_beca > 0 && (
              <Chip label={`Beca aplicada`} size="small"
                sx={{ height: 16, fontSize: 9, fontWeight: 700, bgcolor: alpha('#8b5cf6', 0.1), color: '#8b5cf6', borderRadius: 1 }} />
            )}
          </Box>

          {/* Fecha de pago si ya pagó */}
          {esPagado && mens.fecha_pago && (
            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700, fontSize: 11 }}>
              ✓ Pagado el {formatFechaPago(mens.fecha_pago)}
            </Typography>
          )}
        </Box>

        {/* Monto + botón */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, flexShrink: 0 }}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h6" fontWeight={900} sx={{
              color: esPagado ? '#10b981' : isDark ? gold : '#d97706',
              lineHeight: 1,
            }}>
              Bs {parseFloat(String(mens.monto_final)).toFixed(2)}
            </Typography>
            {mens.monto_beca > 0 && (
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, textDecoration: 'line-through' }}>
                Bs {parseFloat(String(mens.monto_original)).toFixed(2)}
              </Typography>
            )}
          </Box>

          {/* Botón pagar */}
          {puedeP && (
            <Box
              onClick={onPagar}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.6,
                px: 1.5, py: 0.6, borderRadius: '10px',
                background: gradBg,
                color: isDark ? '#000' : '#fff',
                fontWeight: 800, fontSize: 12, cursor: 'pointer',
                boxShadow: `0 3px 10px ${alpha(gold, 0.4)}`,
                transition: 'opacity 0.15s, transform 0.15s',
                '&:hover': { opacity: 0.88, transform: 'scale(1.04)' },
              }}
            >
              <QrCode2RoundedIcon sx={{ fontSize: 14 }} />
              Pagar QR
            </Box>
          )}

          {/* Si tiene QR activo → botón continuar */}
          {mens.tiene_qr_activo && !puedeP && (
            <Box
              onClick={onPagar}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.6,
                px: 1.5, py: 0.6, borderRadius: '10px',
                border: `1.5px solid ${alpha(gold, 0.5)}`,
                color: isDark ? gold : '#d97706',
                fontWeight: 800, fontSize: 12, cursor: 'pointer',
                bgcolor: isDark ? alpha(gold, 0.08) : alpha(gold, 0.05),
                '&:hover': { bgcolor: isDark ? alpha(gold, 0.15) : alpha(gold, 0.1) },
              }}
            >
              <QrCode2RoundedIcon sx={{ fontSize: 14 }} />
              Ver QR
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

// ─── Página ───────────────────────────────────────────────────────────────────
export default function MensualidadesHijoPage() {
  const { isDark, gold, goldEnd, gradBg } = usePalette();
  const router = useRouter();
  const params = useParams();
  const estudianteId = Number(params.id);

  const {
    mensualidades, resumen, pagadas, pendientes,
    isLoading, refrescar,
  } = useMensualidadesHijo(estudianteId || null);

  const progreso = calcularProgreso(resumen);

  return (
    <Box sx={{
      minHeight: '100vh',
      background: isDark
        ? 'radial-gradient(circle at top right, rgba(250,204,21,0.04), transparent 60%)'
        : 'radial-gradient(circle at top right, rgba(245,158,11,0.03), transparent 60%)',
    }}>
      <Container maxWidth="lg" disableGutters>

        {/* ══ HEADER ══ */}
        <Fade in timeout={400}>
          <Box sx={{ mb: 3, pt: 3 }}>

            {/* Volver */}
            <Box
              onClick={() => router.push('/dashboard/padre/pagos')}
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 2,
                cursor: 'pointer', color: 'text.secondary', fontSize: 13, fontWeight: 600,
                transition: 'color 0.15s',
                '&:hover': { color: isDark ? gold : '#d97706' },
              }}
            >
              <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
              Volver a mis hijos
            </Box>

            {/* Card resumen */}
            <Box sx={{
              p: 3.5, borderRadius: 4,
              background: isDark
                ? 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)'
                : '#fff',
              border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.05)}`,
              boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.06)',
              position: 'relative', overflow: 'hidden',
            }}>
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
                {/* Ícono + título */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{
                    width: 56, height: 56, borderRadius: 3,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: gradBg,
                    boxShadow: `0 6px 20px ${alpha(gold, 0.4)}`,
                  }}>
                    <AccountBalanceWalletRoundedIcon sx={{ fontSize: 28, color: isDark ? '#000' : '#fff' }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight={900} sx={{
                      background: gradBg,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      letterSpacing: -0.3, lineHeight: 1.2,
                    }}>
                      Mis Mensualidades
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mt: 0.25 }}>
                      Año académico completo · 10 cuotas
                    </Typography>
                  </Box>
                </Box>

                {/* Refrescar */}
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

              {/* Barra de progreso + stats */}
              {!isLoading && resumen.total > 0 && (
                <Box sx={{ mt: 2.5, pt: 2.5, borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)}`, position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      Progreso anual
                    </Typography>
                    <Typography variant="caption" fontWeight={900}
                      sx={{ color: progreso === 100 ? '#10b981' : isDark ? gold : '#d97706' }}>
                      {progreso}% — {resumen.pagadas}/{resumen.total} cuotas
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progreso}
                    sx={{
                      height: 8, borderRadius: 4, mb: 2,
                      bgcolor: isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06),
                      '& .MuiLinearProgress-bar': {
                        background: progreso === 100
                          ? 'linear-gradient(90deg, #10b981, #34d399)'
                          : gradBg,
                        borderRadius: 4, transition: 'width 0.6s ease',
                      },
                    }}
                  />

                  {/* Stats */}
                  <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    {[
                      { label: 'Pagadas',    value: resumen.pagadas,    color: '#10b981' },
                      { label: 'Pendientes', value: resumen.pendientes, color: resumen.pendientes > 0 ? (isDark ? gold : '#d97706') : '#10b981' },
                      { label: 'Monto pendiente', value: `Bs ${parseFloat(String(resumen.monto_pendiente)).toFixed(2)}`, color: isDark ? alpha('#fff', 0.7) : '#6b7280' },
                    ].map(s => (
                      <Box key={s.label}>
                        <Typography variant="h6" fontWeight={900} sx={{ color: s.color, lineHeight: 1 }}>
                          {s.value}
                        </Typography>
                        <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ fontSize: 11 }}>
                          {s.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Fade>

        {/* ══ LISTA DE MENSUALIDADES ══ */}
        <Box sx={{ pb: 6 }}>

          {/* Loading */}
          {isLoading && (
            <Stack spacing={1.5}>
              {[1, 2, 3, 4, 5].map(i => (
                <Box key={i} sx={{
                  borderRadius: '16px', p: 2.5,
                  border: `1.5px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
                  bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: '14px' }} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="rounded" width="40%" height={16} sx={{ mb: 0.75, borderRadius: 2 }} />
                      <Skeleton variant="rounded" width="60%" height={12} sx={{ borderRadius: 2 }} />
                    </Box>
                    <Skeleton variant="rounded" width={80} height={36} sx={{ borderRadius: '10px' }} />
                  </Box>
                </Box>
              ))}
            </Stack>
          )}

          {/* Pendientes / Vencidas */}
          {!isLoading && pendientes.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, px: 0.5 }}>
                <WarningAmberRoundedIcon sx={{ fontSize: 16, color: isDark ? gold : '#d97706' }} />
                <Typography variant="body2" fontWeight={800} sx={{ color: isDark ? gold : '#d97706' }}>
                  Pendientes de pago
                </Typography>
                <Chip label={pendientes.length} size="small"
                  sx={{ height: 18, fontSize: 10, fontWeight: 800,
                    bgcolor: isDark ? alpha(gold, 0.15) : alpha(gold, 0.1),
                    color: isDark ? gold : '#d97706', borderRadius: 1 }} />
              </Box>
              <Stack spacing={1.5}>
                {pendientes.map((m, i) => (
                  <MensualidadCard
                    key={m.mensualidad_id}
                    mens={m}
                    index={i}
                    onPagar={() => router.push(
                      `/dashboard/padre/pagos/${estudianteId}/pagar/${m.mensualidad_id}`
                    )}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Separador */}
          {!isLoading && pendientes.length > 0 && pagadas.length > 0 && (
            <Divider sx={{
              my: 3,
              borderColor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06),
              '&::before, &::after': { borderColor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06) },
            }}>
              <Chip label="Historial de pagos" size="small"
                sx={{ fontSize: 11, fontWeight: 700, bgcolor: isDark ? alpha('#10b981', 0.1) : alpha('#10b981', 0.06), color: '#10b981' }} />
            </Divider>
          )}

          {/* Pagadas */}
          {!isLoading && pagadas.length > 0 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, px: 0.5 }}>
                <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#10b981' }} />
                <Typography variant="body2" fontWeight={800} sx={{ color: '#10b981' }}>
                  Pagadas
                </Typography>
                <Chip label={pagadas.length} size="small"
                  sx={{ height: 18, fontSize: 10, fontWeight: 800,
                    bgcolor: alpha('#10b981', 0.1), color: '#10b981', borderRadius: 1 }} />
              </Box>
              <Stack spacing={1.5}>
                {pagadas.map((m, i) => (
                  <MensualidadCard
                    key={m.mensualidad_id}
                    mens={m}
                    index={i}
                    onPagar={() => {}}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Sin mensualidades */}
          {!isLoading && mensualidades.length === 0 && (
            <Box sx={{
              textAlign: 'center', py: 8, borderRadius: '20px',
              border: `2px dashed ${isDark ? alpha(gold, 0.25) : alpha('#d97706', 0.25)}`,
              bgcolor: isDark ? alpha(gold, 0.03) : alpha(gold, 0.02),
            }}>
              <LockClockRoundedIcon sx={{ fontSize: 48, color: alpha(gold, 0.4), mb: 1.5 }} />
              <Typography variant="h6" fontWeight={700} sx={{ color: isDark ? gold : '#d97706', mb: 0.5 }}>
                Sin mensualidades generadas
              </Typography>
              <Typography variant="body2" color="text.disabled">
                El administrador aún no generó las mensualidades del año
              </Typography>
            </Box>
          )}
        </Box>

      </Container>
    </Box>
  );
}