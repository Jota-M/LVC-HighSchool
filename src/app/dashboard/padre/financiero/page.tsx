'use client';
// app/dashboard/padre/financiero/page.tsx
// Estado de Pagos — vista principal del módulo financiero del padre
// Header estilo Estudiantes.tsx (paleta dual, sin contenedor) + stats y tabla componentizadas.

import React, { useState, useCallback } from 'react';
import {
  Box, Container, Typography, useTheme, alpha, Fade,
  IconButton, Tooltip, Select, MenuItem, FormControl, Skeleton,
} from '@mui/material';
import { keyframes } from '@mui/system';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

import { useRouter } from 'next/navigation';
import { useHijosConPagos, useMensualidadesHijo, useQRMultiple } from '@/hooks/usePadrePagos';
import { calcularProgreso, formatFechaPago, MESES_LABELS } from '@/types/padrePagosTypes';
import type { HijoPagoInfo } from '@/types/padrePagosTypes';

import { ResumenPagosCards, type ResumenPagosCardData } from '@/components/pagos/ResumenPagosCards';
import { TablaMensualidadesVencidas } from '@/components/pagos/TablaMensualidadesVencidas';

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

// ─── Paleta — misma lógica dual que Estudiantes.tsx ────────────────────────
const usePalette = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primary = isDark ? '#facc15' : '#0288d1';
  const primaryEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${primary} 0%, ${primaryEnd} 100%)`;
  return { isDark, primary, primaryEnd, gradBg };
};

// ─── Selector de hijo ─────────────────────────────────────────────────────────
const SelectorHijo: React.FC<{
  hijos: HijoPagoInfo[];
  hijoActivo: HijoPagoInfo | null;
  onChange: (h: HijoPagoInfo) => void;
  isLoading: boolean;
  isDark: boolean;
  primary: string;
  gradBg: string;
}> = ({ hijos, hijoActivo, onChange, isLoading, isDark, primary, gradBg }) => {
  if (isLoading) return (
    <Skeleton variant="rounded" height={56} sx={{ borderRadius: '16px', width: 320 }} />
  );

  if (hijos.length === 1) return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1.5,
      px: 2, py: 1.2, borderRadius: '14px',
      bgcolor: isDark ? alpha('#fff', 0.05) : alpha(primary, 0.06),
      border: `1.5px solid ${alpha(primary, 0.3)}`,
    }}>
      <Box sx={{
        width: 32, height: 32, borderRadius: '10px',
        background: gradBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 900, color: isDark ? '#000' : '#fff',
      }}>
        {hijos[0].nombres.charAt(0)}{hijos[0].apellidos.charAt(0)}
      </Box>
      <Box>
        <Typography variant="body2" fontWeight={800} sx={{ lineHeight: 1.2 }}>
          {hijos[0].nombres} {hijos[0].apellidos}
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
          {hijos[0].grado} "{hijos[0].paralelo}"
        </Typography>
      </Box>
    </Box>
  );

  return (
    <FormControl size="small">
      <Select
        value={hijoActivo?.estudiante_id ?? ''}
        onChange={e => {
          const hijo = hijos.find(h => h.estudiante_id === Number(e.target.value));
          if (hijo) onChange(hijo);
        }}
        IconComponent={KeyboardArrowDownRoundedIcon}
        renderValue={() => hijoActivo ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 28, height: 28, borderRadius: '8px', flexShrink: 0,
              background: gradBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 900, color: isDark ? '#000' : '#fff',
            }}>
              {hijoActivo.nombres.charAt(0)}{hijoActivo.apellidos.charAt(0)}
            </Box>
            <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>
              {hijoActivo.nombres} {hijoActivo.apellidos}
            </Typography>
          </Box>
        ) : <Typography variant="body2">Seleccioná un hijo</Typography>}
        sx={{
          borderRadius: '14px', minWidth: 260,
          bgcolor: isDark ? alpha('#fff', 0.04) : '#fff',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(primary, 0.3) },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: primary },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: primary },
        }}
      >
        {hijos.map(h => (
          <MenuItem key={h.estudiante_id} value={h.estudiante_id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
              <Box sx={{
                width: 30, height: 30, borderRadius: '9px', flexShrink: 0,
                background: gradBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 900, color: isDark ? '#000' : '#fff',
              }}>
                {h.nombres.charAt(0)}{h.apellidos.charAt(0)}
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>
                  {h.nombres} {h.apellidos}
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
                  {h.grado} "{h.paralelo}" · {h.mensualidades_pendientes} pendiente(s)
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

// ─── Página principal ─────────────────────────────────────────────────────────
export default function EstadoPagosPage() {
  const { isDark, primary, gradBg } = usePalette();
  const theme = useTheme();
  const errorColor = theme.palette.error.main;
  const successColor = theme.palette.success.main;
  const router = useRouter();

  const { hijos, isLoading: loadingHijos, refrescar } = useHijosConPagos();
  const [hijoActivo, setHijoActivo] = useState<HijoPagoInfo | null>(null);

  React.useEffect(() => {
    if (hijos.length > 0 && !hijoActivo) {
      setHijoActivo(hijos[0]);
    }
  }, [hijos]);

  const { mensualidades, resumen, isLoading: loadingMens, refrescar: refrescarMens } =
    useMensualidadesHijo(hijoActivo?.estudiante_id ?? null);

  const { generarQR: generarQRMultiple, isGenerando: generandoMultiple } = useQRMultiple();

  const progreso = calcularProgreso(resumen);
  const proximaPendiente = mensualidades.find(m => m.estado === 'pendiente');
  const mensualidadesVencidas = mensualidades.filter(m => m.estado === 'vencido');
  const totalVencidas = mensualidadesVencidas.length;
  const totalVencidoMonto = mensualidadesVencidas.reduce(
    (sum, m) => sum + parseFloat(String(m.monto_final)), 0
  );

  const handleRefrescar = useCallback(() => {
    refrescar();
    refrescarMens();
  }, [refrescar, refrescarMens]);

  const handlePagarUna = useCallback((mensualidadId: number) => {
    router.push(`/dashboard/padre/financiero/pagar?mes=${mensualidadId}`);
  }, [router]);

  const handlePagarTodasVencidas = useCallback(async () => {
    if (!hijoActivo || mensualidadesVencidas.length === 0) return;
    await generarQRMultiple(
      mensualidadesVencidas.map(m => m.mensualidad_id),
      hijoActivo.estudiante_id
    );
    router.push('/dashboard/padre/financiero/pagar');
  }, [hijoActivo, mensualidadesVencidas, generarQRMultiple, router]);

  const statsCards: ResumenPagosCardData[] = [
    {
      label: 'Mensualidades Vencidas',
      valor: `Bs ${totalVencidoMonto.toFixed(2)}`,
      sub: `${totalVencidas} mes${totalVencidas !== 1 ? 'es' : ''} vencido${totalVencidas !== 1 ? 's' : ''} sin pagar`,
      icon: <WarningAmberRoundedIcon sx={{ fontSize: 20 }} />,
      color: totalVencidas > 0 ? errorColor : primary,
      urgent: totalVencidas > 0,
    },
    {
      label: 'Próxima Mensualidad',
      valor: proximaPendiente
        ? `${MESES_LABELS[proximaPendiente.mes_correspondiente]}`
        : totalVencidas > 0 ? '¡Regularizá!' : '¡Al día!',
      sub: proximaPendiente
        ? `Vence: ${formatFechaPago(proximaPendiente.fecha_vencimiento)}`
        : totalVencidas > 0
          ? `Tenés ${totalVencidas} mes${totalVencidas !== 1 ? 'es' : ''} vencido${totalVencidas !== 1 ? 's' : ''}`
          : 'Todas las mensualidades pagadas',
      icon: <CalendarMonthRoundedIcon sx={{ fontSize: 20 }} />,
      color: totalVencidas > 0 ? errorColor : primary,
    },
    {
      label: 'Total Pagado 2026',
      valor: `Bs ${(resumen.pagadas * parseFloat(String(mensualidades[0]?.monto_final || 0))).toFixed(2)}`,
      sub: `${resumen.pagadas} de ${resumen.total} pagos realizados · ${progreso}%`,
      icon: <TrendingUpRoundedIcon sx={{ fontSize: 20 }} />,
      color: successColor,
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">

        {/* ══ HEADER — mismo patrón que Estudiantes.tsx: sin contenedor ══ */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, md: 0 },
                mb: 3,
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <AccountBalanceWalletRoundedIcon
                    sx={{ color: primary, fontSize: 36, animation: `${bounce} 1.5s infinite` }}
                  />
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                      fontWeight: 800,
                      background: gradBg,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      animation: 'fadeIn 1s ease-out',
                      '@keyframes fadeIn': {
                        from: { opacity: 0, transform: 'translateY(-10px)' },
                        to: { opacity: 1, transform: 'translateY(0)' },
                      },
                    }}
                  >
                    Estado de Pagos
                  </Typography>
                </Box>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    fontWeight: 500,
                    letterSpacing: 0.3,
                    animation: 'fadeInText 1.2s ease-out',
                    '@keyframes fadeInText': {
                      from: { opacity: 0, transform: 'translateY(5px)' },
                      to: { opacity: 1, transform: 'translateY(0)' },
                    },
                  }}
                >
                  Gestión financiera y estado de cuenta de tus hijos.
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap',
                  width: { xs: '100%', md: 'auto' },
                  justifyContent: { xs: 'flex-start', md: 'flex-end' },
                }}
              >
                <SelectorHijo
                  hijos={hijos}
                  hijoActivo={hijoActivo}
                  onChange={setHijoActivo}
                  isLoading={loadingHijos}
                  isDark={isDark}
                  primary={primary}
                  gradBg={gradBg}
                />

                <Box
                  onClick={() => router.push('/dashboard/padre/financiero/pagar')}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 0.8,
                    px: 2.5, py: 1.5, borderRadius: '12px',
                    background: gradBg,
                    color: isDark ? '#000' : '#fff',
                    fontWeight: 600, fontSize: '1rem', cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: isDark
                        ? '0 8px 24px rgba(250, 204, 21, 0.3)'
                        : '0 8px 24px rgba(2, 136, 209, 0.3)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <QrCode2RoundedIcon sx={{ fontSize: 18 }} />
                  Pagar Online
                </Box>

                <Tooltip title="Actualizar">
                  <IconButton
                    onClick={handleRefrescar}
                    size="small"
                    sx={{
                      bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                      border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)}`,
                      borderRadius: '10px',
                      '&:hover': { bgcolor: isDark ? alpha(primary, 0.15) : alpha(primary, 0.08), transform: 'rotate(180deg)' },
                      transition: 'all 0.3s',
                    }}
                  >
                    <RefreshRoundedIcon sx={{ fontSize: 16, color: primary }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* ══ STATS ══ */}
        {hijoActivo && (
          <ResumenPagosCards cards={statsCards} isLoading={loadingMens} />
        )}

        {/* ══ TABLA DE VENCIDAS ══ */}
        <Fade in timeout={700}>
          <Box>
            <TablaMensualidadesVencidas
              hijoSeleccionado={!!hijoActivo}
              isLoading={loadingMens}
              isLoadingHijos={loadingHijos}
              mensualidadesVencidas={mensualidadesVencidas}
              progreso={progreso}
              totalPagos={resumen.total}
              totalVencidoMonto={totalVencidoMonto}
              generandoQR={generandoMultiple}
              onPagarUna={handlePagarUna}
              onPagarTodas={handlePagarTodasVencidas}
              primary={primary}
              gradBg={gradBg}
            />
          </Box>
        </Fade>

      </Container>
    </Box>
  );
}