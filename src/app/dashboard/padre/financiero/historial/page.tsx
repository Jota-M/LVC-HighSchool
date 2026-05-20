'use client';
// app/dashboard/padre/financiero/historial/page.tsx
// Historial de Pagos — registro completo de pagos y comprobantes

import React, { useState, useCallback, useMemo } from 'react';
import {
  Box, Container, Typography, useTheme, alpha, Fade,
  Chip, Skeleton, IconButton, Tooltip, Select, MenuItem,
  FormControl, InputLabel, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Stack,
} from '@mui/material';
import { keyframes } from '@mui/system';
import HistoryRoundedIcon           from '@mui/icons-material/HistoryRounded';
import ArrowBackRoundedIcon         from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon       from '@mui/icons-material/CheckCircleRounded';
import QrCode2RoundedIcon           from '@mui/icons-material/QrCode2Rounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import CalendarMonthRoundedIcon     from '@mui/icons-material/CalendarMonthRounded';
import TrendingUpRoundedIcon        from '@mui/icons-material/TrendingUpRounded';
import AccessTimeRoundedIcon        from '@mui/icons-material/AccessTimeRounded';
import RefreshRoundedIcon           from '@mui/icons-material/RefreshRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import ReceiptLongRoundedIcon       from '@mui/icons-material/ReceiptLongRounded';
import SchoolRoundedIcon            from '@mui/icons-material/SchoolRounded';

import { useRouter } from 'next/navigation';
import { useHijosConPagos, useMensualidadesHijo } from '@/hooks/usePadrePagos';
import { MESES_LABELS, formatFechaPago } from '@/types/padrePagosTypes';
import type { MensualidadHijo, HijoPagoInfo } from '@/types/padrePagosTypes';

// ─── Animaciones ──────────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const shimmer = keyframes`
  0%   { background-position: -1000px 0; }
  100% { background-position:  1000px 0; }
`;
const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
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

// ─── Card de estadística ──────────────────────────────────────────────────────
const StatCard: React.FC<{
  label:  string;
  valor:  string;
  sub:    string;
  icon:   React.ReactNode;
  color:  string;
  delay?: number;
  isDark: boolean;
}> = ({ label, valor, sub, icon, color, delay = 0, isDark }) => (
  <Box sx={{
    p: 2.5, borderRadius: '18px',
    bgcolor: isDark ? alpha('#fff', 0.03) : '#fff',
    border: `1.5px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
    boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.05)',
    animation: `${fadeUp} 0.4s ease-out ${delay}s both`,
    position: 'relative', overflow: 'hidden',
  }}>
    <Box sx={{
      position: 'absolute', top: -16, right: -16,
      width: 64, height: 64, borderRadius: '50%',
      bgcolor: alpha(color, isDark ? 0.08 : 0.06),
      pointerEvents: 'none',
    }} />
    <Box sx={{
      width: 38, height: 38, borderRadius: '11px', mb: 1.5,
      bgcolor: alpha(color, isDark ? 0.15 : 0.1),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color,
    }}>
      {icon}
    </Box>
    <Typography variant="h5" fontWeight={900} sx={{ color, lineHeight: 1, mb: 0.4 }}>
      {valor}
    </Typography>
    <Typography variant="body2" fontWeight={700} sx={{ fontSize: 12, mb: 0.2 }}>
      {label}
    </Typography>
    <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
      {sub}
    </Typography>
  </Box>
);

// ─── Fila del historial ───────────────────────────────────────────────────────
const FilaHistorial: React.FC<{
  mens:  MensualidadHijo;
  index: number;
  isDark: boolean;
  gold:   string;
}> = ({ mens, index, isDark, gold }) => {
  const mesLabel = MESES_LABELS[mens.mes_correspondiente] ?? mens.mes_correspondiente;

  // Determinar método de pago desde qr_estado
  const metodo = mens.qr_estado === 'pagado' ? 'QR' : 'Efectivo/Transferencia';
  const esQR   = mens.qr_estado === 'pagado';

  return (
    <TableRow
      sx={{
        animation: `${slideIn} 0.3s ease-out ${index * 0.05}s both`,
        '&:hover': { bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.01) },
        transition: 'background 0.15s',
      }}
    >
      {/* Fecha */}
      <TableCell sx={{
        py: 1.75,
        borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04)}`,
      }}>
        <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>
          {formatFechaPago(mens.fecha_pago)}
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
          {mens.fecha_pago
            ? new Date(mens.fecha_pago).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
            : '—'}
        </Typography>
      </TableCell>

      {/* Concepto */}
      <TableCell sx={{
        py: 1.75,
        borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04)}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box sx={{
            width: 30, height: 30, borderRadius: '9px', flexShrink: 0,
            background: 'linear-gradient(135deg, #10b981, #34d399)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#fff' }} />
          </Box>
          <Box>
            <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>
              Mensualidad {mesLabel}
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
              Cuota #{mens.numero_cuota}
            </Typography>
          </Box>
        </Box>
      </TableCell>

      {/* Monto */}
      <TableCell sx={{
        py: 1.75,
        borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04)}`,
      }}>
        <Typography variant="body2" fontWeight={900} sx={{ color: '#10b981', fontSize: 14 }}>
          Bs {parseFloat(String(mens.monto_pagado || mens.monto_final)).toFixed(2)}
        </Typography>
        {mens.monto_beca > 0 && (
          <Typography variant="caption" sx={{ color: '#8b5cf6', fontSize: 10, fontWeight: 700 }}>
            Beca: -Bs {parseFloat(String(mens.monto_beca)).toFixed(2)}
          </Typography>
        )}
      </TableCell>

      {/* Método */}
      <TableCell sx={{
        py: 1.75,
        borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04)}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {esQR
            ? <QrCode2RoundedIcon sx={{ fontSize: 15, color: isDark ? gold : '#d97706' }} />
            : <AccountBalanceWalletRoundedIcon sx={{ fontSize: 15, color: '#6b7280' }} />}
          <Typography variant="caption" fontWeight={700} sx={{
            color: esQR ? (isDark ? gold : '#d97706') : 'text.secondary',
            fontSize: 12,
          }}>
            {metodo}
          </Typography>
        </Box>
      </TableCell>

      {/* Estado */}
      <TableCell sx={{
        py: 1.75,
        borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04)}`,
      }}>
        <Chip
          label="Pagado"
          size="small"
          sx={{
            height: 22, fontSize: 11, fontWeight: 800,
            bgcolor: isDark ? alpha('#10b981', 0.15) : alpha('#10b981', 0.1),
            color: '#10b981', borderRadius: 1.5,
          }}
        />
      </TableCell>

      {/* Comprobante */}
      <TableCell sx={{
        py: 1.75,
        borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04)}`,
      }}>
        <Tooltip title="Referencia del pago">
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.5,
            px: 1.25, py: 0.4, borderRadius: '8px',
            bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
            cursor: 'default',
          }}>
            <ReceiptLongRoundedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, fontFamily: 'monospace' }}>
              {mens.transaccion_id
                ? mens.transaccion_id.slice(0, 12) + '...'
                : `MEN-${String(mens.mensualidad_id).padStart(6, '0')}`}
            </Typography>
          </Box>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

// ─── Página principal ─────────────────────────────────────────────────────────
export default function HistorialPagosPage() {
  const { isDark, gold, goldEnd, gradBg } = usePalette();
  const router = useRouter();

  const { hijos, isLoading: loadingHijos, refrescar } = useHijosConPagos();
  const [hijoActivo, setHijoActivo] = useState<HijoPagoInfo | null>(null);

  React.useEffect(() => {
    if (hijos.length > 0 && !hijoActivo) setHijoActivo(hijos[0]);
  }, [hijos]);

  const { mensualidades, isLoading: loadingMens, refrescar: refrescarMens } =
    useMensualidadesHijo(hijoActivo?.estudiante_id ?? null);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'pagado' | 'pendiente'>('todos');

  // Solo las pagadas para el historial
  const pagadas = useMemo(() =>
    mensualidades.filter(m => m.estado === 'pagado'),
    [mensualidades]
  );

  // Filtradas según selector
  const historialFiltrado = useMemo(() => {
    if (filtroEstado === 'todos') return pagadas;
    return pagadas.filter(m => m.estado === filtroEstado);
  }, [pagadas, filtroEstado]);

  // Estadísticas
  const totalPagado = pagadas.reduce(
    (acc, m) => acc + parseFloat(String(m.monto_pagado || m.monto_final)), 0
  );
  const pagosQR     = pagadas.filter(m => m.qr_estado === 'pagado').length;
  const pagosOtros  = pagadas.length - pagosQR;
  const porcentajePuntual = mensualidades.length > 0
    ? Math.round((pagadas.filter(m => {
        if (!m.fecha_pago || !m.fecha_vencimiento) return false;
        return new Date(m.fecha_pago) <= new Date(m.fecha_vencimiento);
      }).length / Math.max(pagadas.length, 1)) * 100)
    : 0;

  // Método preferido
  const metodoPreferido = pagosQR >= pagosOtros ? 'QR' : 'Efectivo/Transf.';

  const handleRefrescar = useCallback(() => {
    refrescar();
    refrescarMens();
  }, [refrescar, refrescarMens]);

  return (
    <Box sx={{
      minHeight: '100vh',
      background: isDark
        ? 'radial-gradient(ellipse at bottom right, rgba(250,204,21,0.04) 0%, transparent 50%)'
        : 'radial-gradient(ellipse at bottom right, rgba(245,158,11,0.03) 0%, transparent 50%)',
    }}>
      <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, sm: 3 } }}>
        <Box sx={{ pt: 3, pb: 6 }}>

          {/* ══ HEADER ══ */}
          <Fade in timeout={400}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{
                p: { xs: 2, sm: 3 }, borderRadius: '24px',
                background: isDark
                  ? 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))'
                  : '#fff',
                border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.05)}`,
                boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)',
                position: 'relative', overflow: 'hidden',
              }}>
                <Box sx={{
                  position: 'absolute', inset: 0,
                  background: `linear-gradient(90deg, transparent, ${alpha('#fff', isDark ? 0.02 : 0.06)}, transparent)`,
                  backgroundSize: '1000px 100%',
                  animation: `${shimmer} 4s linear infinite`,
                  pointerEvents: 'none',
                }} />

                <Box sx={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', flexWrap: 'wrap', gap: 2,
                  position: 'relative', zIndex: 1,
                }}>
                  {/* Título */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Tooltip title="Volver">
                      <IconButton
                        onClick={() => router.push('/dashboard/padre/financiero')}
                        size="small"
                        sx={{
                          bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                          border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)}`,
                          borderRadius: '10px',
                        }}
                      >
                        <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>

                    <Box sx={{
                      width: 50, height: 50, borderRadius: '15px',
                      background: gradBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 5px 18px ${alpha(gold, 0.4)}`,
                      flexShrink: 0,
                    }}>
                      <HistoryRoundedIcon sx={{ fontSize: 26, color: isDark ? '#000' : '#fff' }} />
                    </Box>

                    <Box>
                      <Typography variant="h5" fontWeight={900} sx={{
                        background: gradBg,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: -0.3, lineHeight: 1.2,
                      }}>
                        Historial de Pagos
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Registro completo de pagos y comprobantes
                      </Typography>
                    </Box>
                  </Box>

                  {/* Acciones */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    {/* Selector hijo */}
                    {hijos.length > 1 && (
                      <FormControl size="small">
                        <Select
                          value={hijoActivo?.estudiante_id ?? ''}
                          onChange={e => {
                            const h = hijos.find(h => h.estudiante_id === Number(e.target.value));
                            if (h) setHijoActivo(h);
                          }}
                          IconComponent={KeyboardArrowDownRoundedIcon}
                          displayEmpty
                          renderValue={() => hijoActivo
                            ? `${hijoActivo.nombres} ${hijoActivo.apellidos}`
                            : 'Seleccioná un hijo'
                          }
                          sx={{
                            borderRadius: '12px', minWidth: 200,
                            bgcolor: isDark ? alpha('#fff', 0.04) : '#fff',
                            fontSize: 13, fontWeight: 700,
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(gold, 0.3) },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: gold },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: gold },
                          }}
                        >
                          {hijos.map(h => (
                            <MenuItem key={h.estudiante_id} value={h.estudiante_id}>
                              {h.nombres} {h.apellidos}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}

                    {/* Refrescar */}
                    <Tooltip title="Actualizar">
                      <IconButton
                        onClick={handleRefrescar}
                        size="small"
                        sx={{
                          bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                          border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)}`,
                          borderRadius: '10px',
                          transition: 'all 0.3s',
                          '&:hover': {
                            bgcolor: isDark ? alpha(gold, 0.15) : alpha(gold, 0.08),
                            transform: 'rotate(180deg)',
                          },
                        }}
                      >
                        <RefreshRoundedIcon sx={{ fontSize: 16, color: isDark ? gold : '#d97706' }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Fade>

          {/* ══ CARDS DE STATS ══ */}
          {hijoActivo && (
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
              gap: 2, mb: 3,
            }}>
              {loadingMens ? (
                [1, 2, 3, 4].map(i => (
                  <Skeleton key={i} variant="rounded" height={110} sx={{ borderRadius: '18px' }} />
                ))
              ) : (
                <>
                  <StatCard
                    label="Total Pagado"
                    valor={`Bs ${totalPagado.toFixed(2)}`}
                    sub={`${pagadas.length} transacciones`}
                    icon={<AccountBalanceWalletRoundedIcon sx={{ fontSize: 19 }} />}
                    color={isDark ? gold : '#d97706'}
                    delay={0}
                    isDark={isDark}
                  />
                  <StatCard
                    label="Pagos con QR"
                    valor={String(pagosQR)}
                    sub={`${pagosOtros} por otros medios`}
                    icon={<QrCode2RoundedIcon sx={{ fontSize: 19 }} />}
                    color="#3b82f6"
                    delay={0.05}
                    isDark={isDark}
                  />
                  <StatCard
                    label="Pagos Puntuales"
                    valor={`${porcentajePuntual}%`}
                    sub={`${pagadas.filter(m => {
                      if (!m.fecha_pago || !m.fecha_vencimiento) return false;
                      return new Date(m.fecha_pago) <= new Date(m.fecha_vencimiento);
                    }).length} de ${pagadas.length} a tiempo`}
                    icon={<AccessTimeRoundedIcon sx={{ fontSize: 19 }} />}
                    color="#10b981"
                    delay={0.1}
                    isDark={isDark}
                  />
                  <StatCard
                    label="Método Preferido"
                    valor={metodoPreferido}
                    sub={`${metodoPreferido === 'QR' ? pagosQR : pagosOtros} de ${pagadas.length} pagos`}
                    icon={<TrendingUpRoundedIcon sx={{ fontSize: 19 }} />}
                    color="#8b5cf6"
                    delay={0.15}
                    isDark={isDark}
                  />
                </>
              )}
            </Box>
          )}

          {/* ══ TABLA HISTORIAL ══ */}
          <Fade in timeout={500}>
            <Box sx={{
              borderRadius: '20px',
              background: isDark
                ? 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))'
                : '#fff',
              border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
              boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.05)',
              overflow: 'hidden',
            }}>
              {/* Header tabla */}
              <Box sx={{
                px: 3, py: 2,
                borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 2,
                bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#f8f9fa', 0.5),
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <HistoryRoundedIcon sx={{ fontSize: 17, color: isDark ? gold : '#d97706' }} />
                  <Typography variant="subtitle2" fontWeight={800}>
                    Resumen del Historial
                  </Typography>
                  {!loadingMens && (
                    <Chip
                      label={`${pagadas.length} pago${pagadas.length !== 1 ? 's' : ''}`}
                      size="small"
                      sx={{
                        height: 20, fontSize: 10, fontWeight: 700,
                        bgcolor: isDark ? alpha('#10b981', 0.12) : alpha('#10b981', 0.08),
                        color: '#10b981', borderRadius: 1.5,
                      }}
                    />
                  )}
                </Box>

                {/* Filtros */}
                {!loadingMens && pagadas.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {(['todos', 'pagado'] as const).map(f => (
                      <Chip
                        key={f}
                        label={f === 'todos' ? 'Todos' : 'Pagados'}
                        onClick={() => setFiltroEstado(f)}
                        sx={{
                          height: 28, fontSize: 12, fontWeight: 700,
                          cursor: 'pointer',
                          bgcolor: filtroEstado === f
                            ? isDark ? alpha(gold, 0.2) : alpha(gold, 0.12)
                            : isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                          color: filtroEstado === f
                            ? isDark ? gold : '#d97706'
                            : 'text.secondary',
                          border: `1px solid ${filtroEstado === f ? alpha(gold, 0.4) : 'transparent'}`,
                          borderRadius: 2,
                          '&:hover': { bgcolor: isDark ? alpha(gold, 0.12) : alpha(gold, 0.08) },
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>

              {/* Sin hijo */}
              {!hijoActivo && !loadingHijos && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <SchoolRoundedIcon sx={{ fontSize: 48, color: alpha(gold, 0.3), mb: 1.5 }} />
                  <Typography variant="body1" fontWeight={700} color="text.secondary">
                    Seleccioná un hijo para ver su historial
                  </Typography>
                </Box>
              )}

              {/* Loading */}
              {(loadingHijos || loadingMens) && (
                <Box sx={{ p: 3 }}>
                  {[1, 2, 3].map(i => (
                    <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                      <Skeleton variant="rounded" width={80} height={36} sx={{ borderRadius: '10px' }} />
                      <Skeleton variant="rounded" height={20} sx={{ flex: 1, borderRadius: 2 }} />
                      <Skeleton variant="rounded" width={80} height={20} sx={{ borderRadius: 2 }} />
                      <Skeleton variant="rounded" width={60} height={20} sx={{ borderRadius: 2 }} />
                    </Box>
                  ))}
                </Box>
              )}

              {/* Sin pagos */}
              {hijoActivo && !loadingMens && pagadas.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <CalendarMonthRoundedIcon sx={{ fontSize: 48, color: alpha(gold, 0.3), mb: 1.5 }} />
                  <Typography variant="body1" fontWeight={700} color="text.secondary" sx={{ mb: 0.5 }}>
                    Sin pagos registrados
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    Cuando realices tu primer pago aparecerá aquí
                  </Typography>
                </Box>
              )}

              {/* Tabla */}
              {hijoActivo && !loadingMens && historialFiltrado.length > 0 && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{
                        '& th': {
                          fontWeight: 800, fontSize: 11,
                          color: 'text.disabled',
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                          bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#f8f9fa', 0.8),
                          borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                          py: 1.25,
                        },
                      }}>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Concepto</TableCell>
                        <TableCell>Monto</TableCell>
                        <TableCell>Método</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Referencia</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historialFiltrado.map((m, i) => (
                        <FilaHistorial
                          key={m.mensualidad_id}
                          mens={m}
                          index={i}
                          isDark={isDark}
                          gold={gold}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Footer con total */}
              {hijoActivo && !loadingMens && historialFiltrado.length > 0 && (
                <Box sx={{
                  px: 3, py: 2,
                  borderTop: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
                  bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#f8f9fa', 0.5),
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  flexWrap: 'wrap', gap: 2,
                }}>
                  <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ fontSize: 11 }}>
                    {historialFiltrado.length} registro{historialFiltrado.length !== 1 ? 's' : ''} encontrado{historialFiltrado.length !== 1 ? 's' : ''}
                  </Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ fontSize: 10, display: 'block' }}>
                      TOTAL
                    </Typography>
                    <Typography variant="h6" fontWeight={900} sx={{
                      background: gradBg,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      lineHeight: 1,
                    }}>
                      Bs {historialFiltrado.reduce(
                        (acc, m) => acc + parseFloat(String(m.monto_pagado || m.monto_final)), 0
                      ).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Fade>

        </Box>
      </Container>
    </Box>
  );
}