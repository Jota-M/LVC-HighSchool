'use client';
// app/dashboard/padre/financiero/pagar/page.tsx
// Pagar Online — pago individual/múltiple + pago familiar (multi-hijo)
// Restyle: mismo lenguaje visual que financiero/page.tsx y transporte/page.tsx
// (header sin contenedor, tarjetas planas sin shimmer/glow, bordes sutiles).

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box, Container, Typography, useTheme, alpha, Fade, Checkbox,
  Chip, Skeleton, IconButton, Tooltip, CircularProgress, Avatar,
} from '@mui/material';
import { keyframes } from '@mui/system';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  useHijosConPagos, useMensualidadesHijo,
  useQRMultiple, useQRPago, useQRFamiliar,
} from '@/hooks/usePadrePagos';
import { MESES_LABELS, formatFechaPago } from '@/types/padrePagosTypes';
import type { MensualidadHijo, HijoPagoInfo } from '@/types/padrePagosTypes';

// ─── Animaciones ───────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;
const pulse = (color: string) => keyframes`
  0%, 100% { box-shadow: 0 0 0 0 ${alpha(color, 0.35)}; }
  50%       { box-shadow: 0 0 0 7px ${alpha(color, 0)}; }
`;
const scanLine = keyframes`
  0%   { top: 0%; }
  100% { top: 100%; }
`;
const successPop = keyframes`
  0%   { transform: scale(0.5); opacity: 0; }
  70%  { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
`;
const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

// ─── Paleta ────────────────────────────────────────────────────────────────
const usePalette = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primary = isDark ? '#facc15' : '#0288d1';
  const primaryEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${primary} 0%, ${primaryEnd} 100%)`;
  return { isDark, primary, primaryEnd, gradBg };
};

// ─── Utilidad: descargar/compartir QR (mobile-friendly) ───────────────────
/**
 * En Android/Chrome y desktop, un <a download> con data-URI funciona directo.
 * En iOS Safari eso normalmente NO descarga (abre la imagen en una pestaña nueva).
 * Por eso primero intentamos Web Share API (navigator.share con archivos),
 * que dispara el menú nativo "Guardar imagen / Compartir" tanto en iOS como Android.
 * Si el navegador no soporta compartir archivos, caemos al <a download> clásico.
 */
async function descargarOCompartirQR(base64Png: string, filename: string) {
  try {
    const byteChars = atob(base64Png);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });
    const file = new File([blob], filename, { type: 'image/png' });

    // @ts-ignore — canShare/share con files no siempre está tipado
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'QR de pago',
        text: 'Código QR para pagar',
      });
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err: any) {
    if (err?.name === 'AbortError') return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64Png}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// ─── Countdown ────────────────────────────────────────────────────────────
const QRCountdown: React.FC<{ expiracion: string; isDark: boolean; primary: string }> = ({
  expiracion, isDark, primary,
}) => {
  const [segundos, setSegundos] = useState(0);
  useEffect(() => {
    const calcular = () => {
      const diff = Math.max(0, Math.floor((new Date(expiracion).getTime() - Date.now()) / 1000));
      setSegundos(diff);
    };
    calcular();
    const iv = setInterval(calcular, 1000);
    return () => clearInterval(iv);
  }, [expiracion]);
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const segs = segundos % 60;
  const urgente = segundos < 300;
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1,
      px: 1.5, py: 0.6, borderRadius: '10px',
      bgcolor: urgente ? alpha('#ef4444', isDark ? 0.15 : 0.08) : alpha(primary, isDark ? 0.12 : 0.08),
      border: `1px solid ${urgente ? alpha('#ef4444', 0.3) : alpha(primary, 0.25)}`,
    }}>
      <AccessTimeRoundedIcon sx={{ fontSize: 14, color: urgente ? '#ef4444' : primary }} />
      <Typography variant="caption" fontWeight={800} sx={{ color: urgente ? '#ef4444' : primary, fontFamily: 'monospace', fontSize: 13 }}>
        {String(horas).padStart(2, '0')}:{String(minutos).padStart(2, '0')}:{String(segs).padStart(2, '0')}
      </Typography>
    </Box>
  );
};

// ─── Card mensualidad seleccionable ───────────────────────────────────────
const MensualidadCard: React.FC<{
  mens: MensualidadHijo; selected: boolean; onToggle: () => void;
  disabled: boolean; isDark: boolean; primary: string; index: number;
  nombreHijo?: string; // solo en modo familiar
}> = ({ mens, selected, onToggle, disabled, isDark, primary, index, nombreHijo }) => {
  const esVencido = mens.estado === 'vencido';
  const mesLabel = MESES_LABELS[mens.mes_correspondiente] ?? mens.mes_correspondiente;
  const accent = esVencido ? '#ef4444' : primary;
  return (
    <Box
      onClick={() => !disabled && onToggle()}
      sx={{
        display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: '14px',
        border: `1.5px solid ${selected ? alpha(accent, 0.5) : isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
        borderLeft: `3px solid ${selected ? accent : 'transparent'}`,
        bgcolor: selected ? alpha(accent, isDark ? 0.07 : 0.04) : isDark ? alpha('#fff', 0.02) : '#fafafa',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1,
        transition: 'all 0.15s', animation: `${fadeUp} 0.3s ease-out ${index * 0.04}s both`,
        '&:hover': !disabled ? { border: `1.5px solid ${alpha(accent, 0.4)}` } : {},
      }}
    >
      <Checkbox
        checked={selected} disabled={disabled} onChange={onToggle}
        onClick={e => e.stopPropagation()}
        sx={{ p: 0, color: isDark ? alpha('#fff', 0.2) : alpha('#000', 0.15), '&.Mui-checked': { color: accent } }}
      />
      <Box sx={{
        width: 34, height: 34, borderRadius: '10px', flexShrink: 0,
        bgcolor: alpha(accent, isDark ? 0.16 : 0.1),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 900, color: accent,
      }}>
        {mens.numero_cuota}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={800} sx={{ fontSize: 14 }}>
          {nombreHijo ? `${nombreHijo} — ` : ''}Mensualidad {mesLabel}
        </Typography>
        <Typography variant="caption" sx={{ color: esVencido ? '#ef4444' : 'text.disabled', fontSize: 11, fontWeight: 600 }}>
          {esVencido ? '⚠ Vencida · ' : ''}Vence: {formatFechaPago(mens.fecha_vencimiento)}
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
        <Typography variant="body2" fontWeight={900} sx={{ fontSize: 15, color: accent }}>
          Bs {parseFloat(String(mens.monto_final)).toFixed(2)}
        </Typography>
        {mens.monto_beca > 0 && (
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, textDecoration: 'line-through' }}>
            Bs {parseFloat(String(mens.monto_original)).toFixed(2)}
          </Typography>
        )}
      </Box>
      <Chip
        label={esVencido ? 'Vencida' : 'Pendiente'} size="small"
        sx={{
          height: 20, fontSize: 10, fontWeight: 800, flexShrink: 0,
          bgcolor: alpha(accent, isDark ? 0.15 : 0.08), color: accent, borderRadius: 1.5,
        }}
      />
    </Box>
  );
};

// ─── Panel QR (reutilizado en ambos modos) ────────────────────────────────
const PanelQR: React.FC<{
  qrData: any; estadoQR: any; pagado: boolean; isGenerando: boolean; isCancelando: boolean;
  onCancelar: () => void; onVerificar?: () => void;
  isDark: boolean; primary: string; gradBg: string; totalMonto: number; mesesLabel: string;
}> = ({ qrData, estadoQR, pagado, isGenerando, isCancelando, onCancelar, onVerificar, isDark, primary, gradBg, totalMonto, mesesLabel }) => {

  const [descargando, setDescargando] = useState(false);

  const handleDescargarQR = useCallback(async () => {
    if (!qrData?.imagenQr || descargando) return;
    setDescargando(true);
    try {
      const filename = `qr-pago-lvc-${Date.now()}.png`;
      await descargarOCompartirQR(qrData.imagenQr, filename);
    } finally {
      setDescargando(false);
    }
  }, [qrData, descargando]);

  if (pagado) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6, gap: 2 }}>
      <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: alpha('#10b981', isDark ? 0.15 : 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', animation: `${successPop} 0.5s ease-out both` }}>
        <CheckCircleRoundedIcon sx={{ fontSize: 40, color: '#10b981' }} />
      </Box>
      <Typography variant="h6" fontWeight={900} sx={{ color: '#10b981' }}>¡Pago Confirmado!</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>{mesesLabel} — Bs {totalMonto.toFixed(2)}</Typography>
      {estadoQR?.datos_pago && (
        <Box sx={{ p: 2, borderRadius: '14px', mt: 1, bgcolor: isDark ? alpha('#10b981', 0.08) : alpha('#10b981', 0.05), border: `1px solid ${alpha('#10b981', 0.2)}`, width: '100%' }}>
          {estadoQR.datos_pago.nombreCliente && <Typography variant="caption" display="block" fontWeight={700} sx={{ color: '#10b981' }}>Cliente: {estadoQR.datos_pago.nombreCliente}</Typography>}
          {estadoQR.datos_pago.fecha && <Typography variant="caption" display="block" color="text.disabled">Fecha: {new Date(estadoQR.datos_pago.fecha).toLocaleString('es-BO')}</Typography>}
        </Box>
      )}
    </Box>
  );

  if (isGenerando) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 2 }}>
      <Box sx={{ animation: `${spin} 1s linear infinite` }}>
        <QrCode2RoundedIcon sx={{ fontSize: 44, color: primary, opacity: 0.6 }} />
      </Box>
      <Typography variant="body2" fontWeight={700} color="text.secondary">Generando QR...</Typography>
    </Box>
  );

  if (!qrData) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 1.5 }}>
      <QrCode2RoundedIcon sx={{ fontSize: 52, color: alpha(primary, 0.3) }} />
      <Typography variant="body2" fontWeight={700} color="text.secondary">Seleccioná los meses y generá el QR</Typography>
      <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'center', px: 2 }}>El QR se conecta directamente con tu banco para procesar el pago de forma segura</Typography>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Box sx={{ position: 'relative', p: 1.5, borderRadius: '16px', bgcolor: '#fff', border: `1.5px solid ${alpha(primary, 0.3)}`, overflow: 'hidden' }}>
        <img src={`data:image/png;base64,${qrData.imagenQr}`} alt="QR de pago" style={{ width: 200, height: 200, display: 'block', borderRadius: 8 }} />
        <Box sx={{ position: 'absolute', left: 12, right: 12, height: 2, background: `linear-gradient(90deg, transparent, ${primary}, transparent)`, animation: `${scanLine} 2s ease-in-out infinite`, opacity: 0.7 }} />

        <Tooltip title={descargando ? 'Preparando...' : 'Descargar QR'}>
          <span>
            <IconButton
              onClick={handleDescargarQR}
              disabled={descargando}
              size="small"
              sx={{
                position: 'absolute', top: 6, right: 6,
                bgcolor: alpha('#000', 0.55),
                color: '#fff',
                backdropFilter: 'blur(4px)',
                width: 28, height: 28,
                '&:hover': { bgcolor: alpha('#000', 0.75) },
              }}
            >
              {descargando ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <FileDownloadRoundedIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          </span>
        </Tooltip>
      </Box>
      {qrData.qr_expiracion && <QRCountdown expiracion={qrData.qr_expiracion} isDark={isDark} primary={primary} />}
      {qrData.bancoDestino && (
        <Box sx={{ width: '100%', p: 1.5, borderRadius: '12px', bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03), border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}` }}>
          <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ fontSize: 10 }}>BANCO DESTINO</Typography>
          <Typography variant="body2" fontWeight={800} sx={{ fontSize: 13 }}>{qrData.bancoDestino}</Typography>
          {qrData.cuentaDestino && <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>Cuenta: {qrData.cuentaDestino}</Typography>}
        </Box>
      )}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ fontSize: 10 }}>MONTO A PAGAR</Typography>
        <Typography variant="h5" fontWeight={900} sx={{ background: gradBg, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Bs {totalMonto.toFixed(2)}
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>{mesesLabel}</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.8, borderRadius: '10px', bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03) }}>
        <CircularProgress size={12} sx={{ color: primary }} />
        <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ fontSize: 11 }}>Esperando confirmación del banco...</Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
        {onVerificar && (
          <Box onClick={onVerificar} sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.6, py: 1, borderRadius: '10px', border: `1.5px solid ${alpha(primary, 0.4)}`, color: primary, fontWeight: 700, fontSize: 12, cursor: 'pointer', '&:hover': { bgcolor: alpha(primary, 0.05) } }}>
            <RefreshRoundedIcon sx={{ fontSize: 14 }} />Verificar
          </Box>
        )}
        <Box onClick={!descargando ? handleDescargarQR : undefined} sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.6, py: 1, borderRadius: '10px', border: `1.5px solid ${alpha(primary, 0.4)}`, color: primary, fontWeight: 700, fontSize: 12, cursor: descargando ? 'not-allowed' : 'pointer', opacity: descargando ? 0.6 : 1, '&:hover': { bgcolor: alpha(primary, 0.05) } }}>
          <FileDownloadRoundedIcon sx={{ fontSize: 14 }} />
          {descargando ? 'Preparando...' : 'Descargar'}
        </Box>
        <Box onClick={!isCancelando ? onCancelar : undefined} sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.6, py: 1, borderRadius: '10px', border: `1.5px solid ${alpha('#ef4444', 0.3)}`, color: '#ef4444', fontWeight: 700, fontSize: 12, cursor: isCancelando ? 'not-allowed' : 'pointer', opacity: isCancelando ? 0.6 : 1, '&:hover': { bgcolor: alpha('#ef4444', 0.05) } }}>
          <CancelRoundedIcon sx={{ fontSize: 14 }} />
          {isCancelando ? 'Cancelando...' : 'Cancelar'}
        </Box>
      </Box>
    </Box>
  );
};

// ─── Toggle de modo ────────────────────────────────────────────────────────
const ModoToggle: React.FC<{
  modo: 'individual' | 'familiar';
  onChange: (m: 'individual' | 'familiar') => void;
  tieneMultiplesHijos: boolean;
  isDark: boolean; primary: string;
}> = ({ modo, onChange, tieneMultiplesHijos, isDark, primary }) => {
  if (!tieneMultiplesHijos) return null;
  return (
    <Box sx={{ display: 'flex', gap: 0.5, p: 0.5, borderRadius: '12px', bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04), border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)}` }}>
      {([
        { value: 'individual', icon: <PersonRoundedIcon sx={{ fontSize: 15 }} />, label: 'Un hijo' },
        { value: 'familiar', icon: <PeopleRoundedIcon sx={{ fontSize: 15 }} />, label: 'Familiar' },
      ] as const).map(opt => {
        const activo = modo === opt.value;
        return (
          <Box
            key={opt.value}
            onClick={() => onChange(opt.value)}
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.8,
              px: 1.5, py: 0.75, borderRadius: '9px', cursor: 'pointer',
              transition: 'all 0.15s',
              bgcolor: activo ? alpha(primary, isDark ? 0.15 : 0.1) : 'transparent',
              color: activo ? primary : 'text.secondary',
              fontWeight: activo ? 800 : 600, fontSize: 13,
              '&:hover': !activo ? { bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03) } : {},
            }}
          >
            {opt.icon}
            <Typography variant="caption" fontWeight="inherit" sx={{ fontSize: 12 }}>
              {opt.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

// ─── Hook para mensualidades de todos los hijos (modo familiar) ───────────
const useMensualidadesFamiliares = (hijos: HijoPagoInfo[]) => {
  const [mensualidadesPorHijo, setMensualidadesPorHijo] = useState<
    Record<number, MensualidadHijo[]>
  >({});
  const [isLoading, setIsLoading] = useState(false);

  const cargar = useCallback(async () => {
    if (hijos.length === 0) return;
    setIsLoading(true);
    try {
      const { getMensualidadesHijo } = await import('@/services/padrePagosService');
      const resultados = await Promise.all(
        hijos
          .filter(h => h.matricula_id)
          .map(async h => {
            try {
              const data = await getMensualidadesHijo(h.estudiante_id);
              return { estudiante_id: h.estudiante_id, mensualidades: data.mensualidades };
            } catch {
              return { estudiante_id: h.estudiante_id, mensualidades: [] };
            }
          })
      );
      const mapa: Record<number, MensualidadHijo[]> = {};
      for (const r of resultados) mapa[r.estudiante_id] = r.mensualidades;
      setMensualidadesPorHijo(mapa);
    } finally {
      setIsLoading(false);
    }
  }, [hijos.map(h => h.estudiante_id).join(',')]);

  useEffect(() => { cargar(); }, [cargar]);

  return { mensualidadesPorHijo, isLoading, refrescar: cargar };
};

// ─── Vista modo familiar ──────────────────────────────────────────────────
const VistaFamiliar: React.FC<{
  hijos: HijoPagoInfo[];
  isDark: boolean; primary: string; gradBg: string;
  hayQRActivo: boolean;
  seleccionadas: Set<number>;
  onToggle: (id: number) => void;
}> = ({ hijos, isDark, primary, gradBg, hayQRActivo, seleccionadas, onToggle }) => {
  const { mensualidadesPorHijo, isLoading } = useMensualidadesFamiliares(hijos);

  if (isLoading) return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: '14px' }} />)}
    </Box>
  );

  const hijosConPendientes = hijos.filter(h => {
    const mens = mensualidadesPorHijo[h.estudiante_id] ?? [];
    return mens.some(m => m.estado === 'vencido' || m.estado === 'pendiente');
  });

  if (hijosConPendientes.length === 0) return (
    <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
      <CheckCircleRoundedIcon sx={{ fontSize: 52, color: '#10b981', mb: 1.5, opacity: 0.7 }} />
      <Typography variant="body1" fontWeight={800} color="text.secondary">¡Toda la familia al día!</Typography>
      <Typography variant="caption" color="text.disabled">No hay mensualidades pendientes</Typography>
    </Box>
  );

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {hijos.map(hijo => {
        const mens = mensualidadesPorHijo[hijo.estudiante_id] ?? [];
        const pagables = mens.filter(m => m.estado === 'vencido' || m.estado === 'pendiente');
        if (pagables.length === 0) return null;

        const iniciales = `${hijo.nombres.charAt(0)}${hijo.apellidos.charAt(0)}`.toUpperCase();
        const vencidas = pagables.filter(m => m.estado === 'vencido');
        const pendientes = pagables.filter(m => m.estado === 'pendiente');
        const seleccionadasDeEsteHijo = pagables.filter(m => seleccionadas.has(m.mensualidad_id)).length;

        return (
          <Box key={hijo.estudiante_id}>
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5,
              px: 1, py: 0.75, borderRadius: '10px',
              bgcolor: isDark ? alpha(primary, 0.06) : alpha(primary, 0.04),
              border: `1px solid ${alpha(primary, 0.15)}`,
            }}>
              <Avatar sx={{ width: 30, height: 30, fontSize: '0.7rem', fontWeight: 800, background: gradBg, color: isDark ? '#000' : '#fff' }}>
                {iniciales}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                  {hijo.nombres.split(' ')[0]} {hijo.apellidos.split(' ')[0]}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                  {hijo.grado} "{hijo.paralelo}"
                </Typography>
              </Box>
              {seleccionadasDeEsteHijo > 0 && (
                <Chip
                  label={`${seleccionadasDeEsteHijo} seleccionada${seleccionadasDeEsteHijo > 1 ? 's' : ''}`}
                  size="small"
                  sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: alpha(primary, 0.15), color: primary, borderRadius: 1.5 }}
                />
              )}
            </Box>

            {vencidas.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" fontWeight={800} sx={{ color: '#ef4444', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, mb: 0.75, display: 'block', px: 0.5 }}>
                  ⚠ Vencidas
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {vencidas.map((m, i) => (
                    <MensualidadCard
                      key={m.mensualidad_id} mens={m} index={i}
                      selected={seleccionadas.has(m.mensualidad_id)}
                      onToggle={() => onToggle(m.mensualidad_id)}
                      disabled={hayQRActivo} isDark={isDark} primary={primary}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {pendientes.length > 0 && (
              <Box>
                <Typography variant="caption" fontWeight={800} sx={{ color: primary, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, mb: 0.75, display: 'block', px: 0.5 }}>
                  Pendientes
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {pendientes.map((m, i) => (
                    <MensualidadCard
                      key={m.mensualidad_id} mens={m} index={i}
                      selected={seleccionadas.has(m.mensualidad_id)}
                      onToggle={() => onToggle(m.mensualidad_id)}
                      disabled={hayQRActivo} isDark={isDark} primary={primary}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

// ─── Página principal ──────────────────────────────────────────────────────
export default function PagarOnlinePage() {
  const { isDark, primary, gradBg } = usePalette();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mesParam = searchParams.get('mes');

  // ── Datos base ──
  const { hijos, isLoading: loadingHijos } = useHijosConPagos();
  const [hijoActivo, setHijoActivo] = useState<HijoPagoInfo | null>(null);

  // ── Modo: individual | familiar ──
  const [modo, setModo] = useState<'individual' | 'familiar'>('individual');
  const tieneMultiplesHijos = hijos.filter(h => h.matricula_id).length > 1;

  useEffect(() => {
    if (hijos.length > 0 && !hijoActivo) setHijoActivo(hijos[0]);
  }, [hijos]);

  // ── Datos modo individual ──
  const { mensualidades, isLoading: loadingMens } =
    useMensualidadesHijo(modo === 'individual' ? (hijoActivo?.estudiante_id ?? null) : null);

  const pagables = mensualidades.filter(m => m.estado === 'vencido' || m.estado === 'pendiente');

  // ── Selección (compartido entre modos) ──
  const [seleccionadas, setSeleccionadas] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (modo === 'individual') {
      if (pagables.length === 0) return;
      if (mesParam) {
        const id = parseInt(mesParam);
        if (!isNaN(id)) setSeleccionadas(new Set([id]));
      } else {
        setSeleccionadas(new Set(pagables.filter(m => m.estado === 'vencido').map(m => m.mensualidad_id)));
      }
    } else {
      setSeleccionadas(new Set());
    }
  }, [mensualidades.length, mesParam, modo]);

  useEffect(() => { setSeleccionadas(new Set()); }, [modo]);

  const toggleSeleccion = useCallback((id: number) => {
    setSeleccionadas(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const seleccionarTodas = useCallback(() => {
    if (seleccionadas.size === pagables.length) setSeleccionadas(new Set());
    else setSeleccionadas(new Set(pagables.map(m => m.mensualidad_id)));
  }, [pagables, seleccionadas.size]);

  // ── Cálculos de totales (modo individual) ──
  const mensSeleccionadas = pagables.filter(m => seleccionadas.has(m.mensualidad_id));
  const totalMontoInd = mensSeleccionadas.reduce((acc, m) => acc + parseFloat(String(m.monto_final)), 0);
  const mesesLabelInd = mensSeleccionadas.map(m => MESES_LABELS[m.mes_correspondiente] ?? m.mes_correspondiente).join(', ');

  // ── Hooks QR ──
  const {
    qrData: qrMultiple, estadoQR: estadoMultiple, pagado: pagadoMultiple,
    isGenerando: generandoMultiple, isCancelando: cancelandoMultiple,
    generarQR: generarMultiple, cancelarQR: cancelarMultiple,
    verificarEstado: verificarMultiple, resetear: resetearMultiple,
  } = useQRMultiple();

  const mensualidadIdIndividual = mensSeleccionadas.length === 1 ? mensSeleccionadas[0].mensualidad_id : null;

  const {
    qrData: qrIndividual, estadoQR: estadoIndividual, pagado: pagadoIndividual,
    isGenerando: generandoIndividual, isCancelando: cancelandoIndividual,
    generarQR: generarIndividual, cancelarQR: cancelarIndividual, verificarEstado,
  } = useQRPago(mensualidadIdIndividual, false);

  const {
    qrData: qrFamiliar, estadoQR: estadoFamiliar, pagado: pagadoFamiliar,
    isGenerando: generandoFamiliar, isCancelando: cancelandoFamiliar,
    generarQR: generarFamiliarQR, cancelarQR: cancelarFamiliar,
    verificarEstado: verificarFamiliar, resetear: resetearFamiliar,
  } = useQRFamiliar();

  // ── Estado unificado ──
  const esIndividual = modo === 'individual' && mensSeleccionadas.length === 1;
  const qrData = modo === 'familiar' ? qrFamiliar : esIndividual ? qrIndividual : qrMultiple;
  const estadoQR = modo === 'familiar' ? estadoFamiliar : esIndividual ? estadoIndividual : estadoMultiple;
  const pagado = modo === 'familiar' ? pagadoFamiliar : esIndividual ? pagadoIndividual : pagadoMultiple;
  const isGenerando = modo === 'familiar' ? generandoFamiliar : esIndividual ? generandoIndividual : generandoMultiple;
  const isCancelando = modo === 'familiar' ? cancelandoFamiliar : esIndividual ? cancelandoIndividual : cancelandoMultiple;
  const verificarQR = modo === 'familiar' ? verificarFamiliar : esIndividual ? verificarEstado : verificarMultiple;

  const totalMonto = modo === 'familiar'
    ? (qrFamiliar?.monto_total ?? 0)
    : totalMontoInd;

  const mesesLabel = modo === 'familiar'
    ? (qrFamiliar
      ? qrFamiliar.hijos.map(h => `${h.nombres.split(' ')[0]}: ${h.meses.map(m => MESES_LABELS[m] ?? m).join(', ')}`).join(' | ')
      : `${seleccionadas.size} mensualidades familiares`)
    : mesesLabelInd;

  const hayQRActivo = !!qrData && !pagado;
  const puedeGenerar = modo === 'familiar' ? seleccionadas.size >= 2 : mensSeleccionadas.length > 0;

  // ── Handlers ──
  const handleGenerarQR = useCallback(async () => {
    if (!puedeGenerar) return;

    if (modo === 'familiar') {
      resetearFamiliar();
      await generarFamiliarQR(Array.from(seleccionadas));
    } else {
      resetearMultiple();
      if (mensSeleccionadas.length === 1) {
        await generarIndividual();
      } else {
        await generarMultiple(mensSeleccionadas.map(m => m.mensualidad_id), hijoActivo!.estudiante_id);
      }
    }
  }, [modo, puedeGenerar, seleccionadas, mensSeleccionadas, hijoActivo, generarFamiliarQR, generarIndividual, generarMultiple, resetearFamiliar, resetearMultiple]);

  const handleCancelar = useCallback(async () => {
    if (modo === 'familiar') await cancelarFamiliar();
    else if (esIndividual) await cancelarIndividual();
    else await cancelarMultiple();
  }, [modo, esIndividual, cancelarFamiliar, cancelarIndividual, cancelarMultiple]);

  const handleCambioModo = useCallback((nuevoModo: 'individual' | 'familiar') => {
    if (hayQRActivo) handleCancelar();
    setModo(nuevoModo);
  }, [hayQRActivo, handleCancelar]);

  useEffect(() => {
    if (pagado) {
      const timer = setTimeout(() => router.push('/dashboard/padre/financiero'), 3000);
      return () => clearTimeout(timer);
    }
  }, [pagado, router]);

  const labelBotonGenerar = () => {
    if (isGenerando) return null;
    if (modo === 'familiar') {
      if (seleccionadas.size < 2) return 'Seleccioná al menos 2 mensualidades de distintos hijos';
      return `Generar QR familiar · ${seleccionadas.size} mensualidades`;
    }
    if (mensSeleccionadas.length === 0) return 'Seleccioná al menos un mes';
    return `Generar QR · Bs ${totalMontoInd.toFixed(2)}`;
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">

        {/* ══ HEADER — mismo patrón que financiero/page.tsx: sin contenedor ══ */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, md: 0 },
                mb: 2,
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Tooltip title="Volver">
                    <IconButton
                      onClick={() => router.push('/dashboard/padre/financiero')}
                      size="small"
                      sx={{
                        bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                        border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)}`,
                        borderRadius: '10px', mr: 0.5,
                      }}
                    >
                      <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                  <QrCode2RoundedIcon
                    sx={{ color: primary, fontSize: 32, animation: `${bounce} 1.5s infinite` }}
                  />
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.2rem' },
                      fontWeight: 800,
                      background: gradBg,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Pagar Online
                  </Typography>
                </Box>

                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, letterSpacing: 0.3, ml: { xs: 0, md: 6.5 } }}>
                  Generá un QR y pagá desde la app de tu banco.
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap',
                  width: { xs: '100%', md: 'auto' },
                  justifyContent: { xs: 'flex-start', md: 'flex-end' },
                }}
              >
                <ModoToggle
                  modo={modo}
                  onChange={handleCambioModo}
                  tieneMultiplesHijos={tieneMultiplesHijos}
                  isDark={isDark}
                  primary={primary}
                />

                {modo === 'individual' && hijoActivo && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1, borderRadius: '12px', bgcolor: isDark ? alpha('#fff', 0.04) : alpha(primary, 0.05), border: `1px solid ${alpha(primary, 0.2)}` }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: '9px', background: gradBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: isDark ? '#000' : '#fff', flexShrink: 0 }}>
                      {hijoActivo.nombres.charAt(0)}{hijoActivo.apellidos.charAt(0)}
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={800} sx={{ fontSize: 13, lineHeight: 1.2 }}>{hijoActivo.nombres} {hijoActivo.apellidos}</Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>{hijoActivo.grado} "{hijoActivo.paralelo}"</Typography>
                    </Box>
                  </Box>
                )}

                {modo === 'familiar' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, borderRadius: '12px', bgcolor: isDark ? alpha(primary, 0.1) : alpha(primary, 0.06), border: `1px solid ${alpha(primary, 0.3)}` }}>
                    <PeopleRoundedIcon sx={{ fontSize: 16, color: primary }} />
                    <Typography variant="caption" fontWeight={800} sx={{ color: primary, fontSize: 12 }}>
                      {hijos.filter(h => h.matricula_id).length} hijos · Pago familiar
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Selector de hijo — solo modo individual con múltiples hijos */}
            {modo === 'individual' && tieneMultiplesHijos && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', ml: { xs: 0, md: 6.5 } }}>
                {hijos.filter(h => h.matricula_id).map(hijo => {
                  const activo = hijoActivo?.estudiante_id === hijo.estudiante_id;
                  return (
                    <Box
                      key={hijo.estudiante_id}
                      onClick={() => { if (!hayQRActivo) { setHijoActivo(hijo); setSeleccionadas(new Set()); } }}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75,
                        borderRadius: '10px', cursor: hayQRActivo ? 'not-allowed' : 'pointer',
                        border: `1.5px solid ${activo ? alpha(primary, 0.5) : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                        bgcolor: activo ? alpha(primary, isDark ? 0.12 : 0.07) : 'transparent',
                        opacity: hayQRActivo && !activo ? 0.5 : 1,
                        transition: 'all 0.15s',
                      }}
                    >
                      <Avatar sx={{ width: 22, height: 22, fontSize: '0.6rem', fontWeight: 800, background: activo ? gradBg : alpha(primary, 0.2), color: activo ? (isDark ? '#000' : '#fff') : primary }}>
                        {hijo.nombres.charAt(0)}{hijo.apellidos.charAt(0)}
                      </Avatar>
                      <Typography variant="caption" fontWeight={activo ? 800 : 600} sx={{ color: activo ? primary : 'text.secondary', fontSize: 12 }}>
                        {hijo.nombres.split(' ')[0]}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </Fade>

        {/* ══ CUERPO ══ */}
        <Fade in timeout={700}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 380px' }, gap: 2.5, alignItems: 'start' }}>

            {/* ── COLUMNA IZQUIERDA ── */}
            <Box sx={{
              borderRadius: '16px',
              bgcolor: isDark ? alpha('#fff', 0.03) : '#fff',
              border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
              overflow: 'hidden',
            }}>

              <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {modo === 'familiar'
                    ? <PeopleRoundedIcon sx={{ fontSize: 17, color: primary }} />
                    : <AccountBalanceWalletRoundedIcon sx={{ fontSize: 17, color: primary }} />
                  }
                  <Typography variant="subtitle2" fontWeight={800}>
                    {modo === 'familiar' ? 'Seleccioná mensualidades de tus hijos' : 'Seleccioná los meses a pagar'}
                  </Typography>
                  {seleccionadas.size > 0 && (
                    <Chip
                      label={`${seleccionadas.size} seleccionada${seleccionadas.size > 1 ? 's' : ''}`}
                      size="small"
                      sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: alpha(primary, isDark ? 0.12 : 0.08), color: primary, borderRadius: 1.5 }}
                    />
                  )}
                </Box>

                {modo === 'individual' && !loadingMens && pagables.length > 0 && !hayQRActivo && (
                  <Box onClick={seleccionarTodas} sx={{ fontSize: 12, fontWeight: 700, color: primary, cursor: 'pointer', '&:hover': { opacity: 0.7 } }}>
                    {seleccionadas.size === pagables.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
                  </Box>
                )}

                {modo === 'familiar' && !hayQRActivo && (
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
                    Mínimo 2 mensualidades
                  </Typography>
                )}
              </Box>

              {modo === 'individual' ? (
                <>
                  {(loadingHijos || loadingMens) && (
                    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: '14px' }} />)}
                    </Box>
                  )}
                  {!loadingMens && pagables.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
                      <CheckCircleRoundedIcon sx={{ fontSize: 52, color: '#10b981', mb: 1.5, opacity: 0.7 }} />
                      <Typography variant="body1" fontWeight={800} color="text.secondary">¡Estás al día!</Typography>
                      <Typography variant="caption" color="text.disabled">No tenés mensualidades pendientes de pago</Typography>
                    </Box>
                  )}
                  {!loadingMens && pagables.length > 0 && (
                    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {pagables.filter(m => m.estado === 'vencido').length > 0 && (
                        <Box>
                          <Typography variant="caption" fontWeight={800} sx={{ color: '#ef4444', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, mb: 1, display: 'block', px: 0.5 }}>⚠ Vencidas</Typography>
                          {pagables.filter(m => m.estado === 'vencido').map((m, i) => (
                            <Box key={m.mensualidad_id} sx={{ mb: 1 }}>
                              <MensualidadCard mens={m} selected={seleccionadas.has(m.mensualidad_id)} onToggle={() => toggleSeleccion(m.mensualidad_id)} disabled={hayQRActivo} isDark={isDark} primary={primary} index={i} />
                            </Box>
                          ))}
                        </Box>
                      )}
                      {pagables.filter(m => m.estado === 'pendiente').length > 0 && (
                        <Box>
                          <Typography variant="caption" fontWeight={800} sx={{ color: primary, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, mb: 1, display: 'block', px: 0.5 }}>Pendientes</Typography>
                          {pagables.filter(m => m.estado === 'pendiente').map((m, i) => (
                            <Box key={m.mensualidad_id} sx={{ mb: 1 }}>
                              <MensualidadCard mens={m} selected={seleccionadas.has(m.mensualidad_id)} onToggle={() => toggleSeleccion(m.mensualidad_id)} disabled={hayQRActivo} isDark={isDark} primary={primary} index={i} />
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  )}
                </>
              ) : (
                <VistaFamiliar
                  hijos={hijos.filter(h => h.matricula_id)}
                  isDark={isDark} primary={primary} gradBg={gradBg}
                  hayQRActivo={hayQRActivo}
                  seleccionadas={seleccionadas}
                  onToggle={toggleSeleccion}
                />
              )}

              {/* Footer resumen */}
              {seleccionadas.size > 0 && (
                <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                  <Box>
                    <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ fontSize: 10 }}>
                      {seleccionadas.size} MENSUALIDAD{seleccionadas.size !== 1 ? 'ES' : ''} SELECCIONADA{seleccionadas.size !== 1 ? 'S' : ''}
                      {modo === 'familiar' && ' · FAMILIAR'}
                    </Typography>
                    {modo === 'individual' && (
                      <Typography variant="h6" fontWeight={900} sx={{ background: gradBg, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
                        Bs {totalMontoInd.toFixed(2)}
                      </Typography>
                    )}
                    {modo === 'familiar' && seleccionadas.size < 2 && (
                      <Typography variant="caption" sx={{ color: primary, fontSize: 11, fontWeight: 600 }}>
                        Necesitás al menos 2 para el QR familiar
                      </Typography>
                    )}
                  </Box>
                  {modo === 'individual' && (
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11, maxWidth: 160, textAlign: 'right' }}>{mesesLabelInd}</Typography>
                  )}
                  {modo === 'familiar' && seleccionadas.size >= 2 && (
                    <Chip label="Listo para pagar" size="small" sx={{ height: 22, fontSize: 11, fontWeight: 700, bgcolor: alpha('#10b981', 0.12), color: '#10b981', borderRadius: 1.5 }} />
                  )}
                </Box>
              )}
            </Box>

            {/* ── COLUMNA DERECHA: QR ── */}
            <Box sx={{
              borderRadius: '16px',
              bgcolor: isDark ? alpha('#fff', 0.03) : '#fff',
              border: `1px solid ${pagado ? alpha('#10b981', 0.3) : qrData ? alpha(primary, 0.25) : isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
              overflow: 'hidden', position: { md: 'sticky' }, top: { md: 24 },
            }}>
              <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <QrCode2RoundedIcon sx={{ fontSize: 17, color: pagado ? '#10b981' : primary }} />
                <Typography variant="subtitle2" fontWeight={800}>
                  {pagado ? 'Pago Confirmado' : modo === 'familiar' ? 'QR Familiar' : 'Código QR de Pago'}
                </Typography>
                {qrData && !pagado && (
                  <Chip label="ACTIVO" size="small" sx={{ height: 18, fontSize: 9, fontWeight: 900, bgcolor: alpha('#10b981', 0.12), color: '#10b981', borderRadius: 1.5, animation: `${pulse('#10b981')} 2.5s ease-in-out infinite` }} />
                )}
                {modo === 'familiar' && !qrData && !pagado && (
                  <Chip label="MULTI-HIJO" size="small" sx={{ height: 18, fontSize: 9, fontWeight: 900, bgcolor: alpha(primary, 0.12), color: primary, borderRadius: 1.5 }} />
                )}
              </Box>

              <Box sx={{ p: 3 }}>
                <PanelQR
                  qrData={qrData} estadoQR={estadoQR} pagado={pagado}
                  isGenerando={isGenerando} isCancelando={isCancelando}
                  onCancelar={handleCancelar}
                  onVerificar={verificarQR}
                  isDark={isDark} primary={primary} gradBg={gradBg}
                  totalMonto={totalMonto} mesesLabel={mesesLabel}
                />

                {!qrData && !pagado && (
                  <Box
                    onClick={puedeGenerar && !isGenerando ? handleGenerarQR : undefined}
                    sx={{
                      mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                      py: 1.5, borderRadius: '12px',
                      background: puedeGenerar ? gradBg : isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                      color: puedeGenerar ? (isDark ? '#000' : '#fff') : 'text.disabled',
                      fontWeight: 800, fontSize: 14,
                      cursor: puedeGenerar && !isGenerando ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s',
                      '&:hover': puedeGenerar && !isGenerando ? {
                        transform: 'translateY(-1px)',
                        boxShadow: isDark ? '0 8px 24px rgba(250, 204, 21, 0.3)' : '0 8px 24px rgba(2, 136, 209, 0.3)',
                      } : {},
                    }}
                  >
                    {isGenerando ? (
                      <><CircularProgress size={16} sx={{ color: 'inherit' }} />Generando...</>
                    ) : (
                      <>{modo === 'familiar' ? <PeopleRoundedIcon sx={{ fontSize: 18 }} /> : <QrCode2RoundedIcon sx={{ fontSize: 18 }} />}{labelBotonGenerar()}</>
                    )}
                  </Box>
                )}

                {!qrData && !pagado && !isGenerando && (
                  <Box sx={{ mt: 2 }}>
                    {(modo === 'familiar' ? [
                      { n: '1', t: 'Seleccioná mensualidades de distintos hijos' },
                      { n: '2', t: 'Mínimo 2 mensualidades para el QR familiar' },
                      { n: '3', t: 'Presioná "Generar QR familiar"' },
                      { n: '4', t: 'Escaneá y pagá todo junto desde tu banco' },
                    ] : [
                      { n: '1', t: 'Seleccioná los meses a pagar' },
                      { n: '2', t: 'Presioná "Generar QR"' },
                      { n: '3', t: 'Abrí la app de tu banco' },
                      { n: '4', t: 'Escaneá el QR y confirmá el pago' },
                    ]).map(step => (
                      <Box key={step.n} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Box sx={{ width: 22, height: 22, borderRadius: '7px', flexShrink: 0, bgcolor: alpha(primary, isDark ? 0.12 : 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: primary }}>
                          {step.n}
                        </Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: 12 }}>{step.t}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>

          </Box>
        </Fade>

      </Container>
    </Box>
  );
}