'use client';
// app/dashboard/padre/financiero/pagar/page.tsx
// Pagar Online — pago individual/múltiple + pago familiar (multi-hijo)

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box, Container, Typography, useTheme, alpha, Fade, Checkbox,
  Chip, Skeleton, IconButton, Tooltip, CircularProgress, Avatar,
} from '@mui/material';
import { keyframes } from '@mui/system';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  useHijosConPagos, useMensualidadesHijo,
  useQRMultiple, useQRPago, useQRFamiliar,
} from '@/hooks/usePadrePagos';
import { MESES_LABELS, formatFechaPago } from '@/types/padrePagosTypes';
import type { MensualidadHijo, HijoPagoInfo } from '@/types/padrePagosTypes';

// ─── Animaciones ───────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const shimmer = keyframes`
  0%   { background-position: -1000px 0; }
  100% { background-position:  1000px 0; }
`;
const pulseGreen = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
  50%       { box-shadow: 0 0 0 12px rgba(16,185,129,0); }
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
  const gold = isDark ? '#facc15' : '#f59e0b';
  const goldEnd = isDark ? '#f59e0b' : '#d97706';
  const gradBg = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;
  return { isDark, gold, goldEnd, gradBg };
};

// ─── Countdown ────────────────────────────────────────────────────────────
const QRCountdown: React.FC<{ expiracion: string; isDark: boolean; gold: string }> = ({
  expiracion, isDark, gold,
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
      bgcolor: urgente ? alpha('#ef4444', isDark ? 0.15 : 0.08) : alpha(gold, isDark ? 0.12 : 0.08),
      border: `1px solid ${urgente ? alpha('#ef4444', 0.3) : alpha(gold, 0.25)}`,
    }}>
      <AccessTimeRoundedIcon sx={{ fontSize: 14, color: urgente ? '#ef4444' : gold }} />
      <Typography variant="caption" fontWeight={800} sx={{ color: urgente ? '#ef4444' : gold, fontFamily: 'monospace', fontSize: 13 }}>
        {String(horas).padStart(2, '0')}:{String(minutos).padStart(2, '0')}:{String(segs).padStart(2, '0')}
      </Typography>
    </Box>
  );
};

// ─── Card mensualidad seleccionable ───────────────────────────────────────
const MensualidadCard: React.FC<{
  mens: MensualidadHijo; selected: boolean; onToggle: () => void;
  disabled: boolean; isDark: boolean; gold: string; index: number;
  nombreHijo?: string; // solo en modo familiar
}> = ({ mens, selected, onToggle, disabled, isDark, gold, index, nombreHijo }) => {
  const esVencido = mens.estado === 'vencido';
  const mesLabel = MESES_LABELS[mens.mes_correspondiente] ?? mens.mes_correspondiente;
  return (
    <Box
      onClick={() => !disabled && onToggle()}
      sx={{
        display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: '16px',
        border: `1.5px solid ${selected ? (esVencido ? alpha('#ef4444', 0.5) : alpha(gold, 0.5)) : isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
        bgcolor: selected ? (esVencido ? (isDark ? alpha('#ef4444', 0.07) : alpha('#ef4444', 0.03)) : (isDark ? alpha(gold, 0.07) : alpha(gold, 0.03))) : isDark ? alpha('#fff', 0.02) : '#fafafa',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s', animation: `${fadeUp} 0.3s ease-out ${index * 0.05}s both`,
        '&:hover': !disabled ? { border: `1.5px solid ${esVencido ? alpha('#ef4444', 0.4) : alpha(gold, 0.4)}`, transform: 'translateY(-1px)' } : {},
      }}
    >
      <Checkbox
        checked={selected} disabled={disabled} onChange={onToggle}
        onClick={e => e.stopPropagation()}
        sx={{ p: 0, color: isDark ? alpha('#fff', 0.2) : alpha('#000', 0.15), '&.Mui-checked': { color: esVencido ? '#ef4444' : gold } }}
      />
      <Box sx={{
        width: 36, height: 36, borderRadius: '11px', flexShrink: 0,
        background: esVencido ? 'linear-gradient(135deg, #ef4444, #f87171)' : `linear-gradient(135deg, ${gold}, ${isDark ? '#f59e0b' : '#d97706'})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 900, color: isDark && !esVencido ? '#000' : '#fff',
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
        <Typography variant="body2" fontWeight={900} sx={{ fontSize: 15, color: esVencido ? '#ef4444' : isDark ? gold : '#d97706' }}>
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
          bgcolor: esVencido ? (isDark ? alpha('#ef4444', 0.15) : alpha('#ef4444', 0.08)) : (isDark ? alpha(gold, 0.15) : alpha(gold, 0.08)),
          color: esVencido ? '#ef4444' : isDark ? gold : '#d97706', borderRadius: 1.5,
        }}
      />
    </Box>
  );
};

// ─── Panel QR (reutilizado en ambos modos) ────────────────────────────────
const PanelQR: React.FC<{
  qrData: any; estadoQR: any; pagado: boolean; isGenerando: boolean; isCancelando: boolean;
  onCancelar: () => void; onVerificar?: () => void;
  isDark: boolean; gold: string; gradBg: string; totalMonto: number; mesesLabel: string;
}> = ({ qrData, estadoQR, pagado, isGenerando, isCancelando, onCancelar, onVerificar, isDark, gold, gradBg, totalMonto, mesesLabel }) => {

  if (pagado) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6, gap: 2 }}>
      <Box sx={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: `${successPop} 0.5s ease-out both`, boxShadow: '0 8px 32px rgba(16,185,129,0.4)' }}>
        <CheckCircleRoundedIcon sx={{ fontSize: 44, color: '#fff' }} />
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
        <QrCode2RoundedIcon sx={{ fontSize: 48, color: isDark ? gold : '#d97706', opacity: 0.6 }} />
      </Box>
      <Typography variant="body2" fontWeight={700} color="text.secondary">Generando QR...</Typography>
    </Box>
  );

  if (!qrData) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 1.5 }}>
      <QrCode2RoundedIcon sx={{ fontSize: 56, color: isDark ? alpha(gold, 0.3) : alpha('#d97706', 0.3) }} />
      <Typography variant="body2" fontWeight={700} color="text.secondary">Seleccioná los meses y generá el QR</Typography>
      <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'center', px: 2 }}>El QR se conecta directamente con tu banco para procesar el pago de forma segura</Typography>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Box sx={{ position: 'relative', p: 1.5, borderRadius: '20px', bgcolor: '#fff', boxShadow: `0 8px 32px ${alpha(isDark ? gold : '#d97706', 0.25)}`, border: `3px solid ${isDark ? alpha(gold, 0.4) : alpha('#d97706', 0.3)}`, overflow: 'hidden' }}>
        <img src={`data:image/png;base64,${qrData.imagenQr}`} alt="QR de pago" style={{ width: 200, height: 200, display: 'block', borderRadius: 8 }} />
        <Box sx={{ position: 'absolute', left: 12, right: 12, height: 2, background: `linear-gradient(90deg, transparent, ${gold}, transparent)`, animation: `${scanLine} 2s ease-in-out infinite`, opacity: 0.7 }} />
      </Box>
      {qrData.qr_expiracion && <QRCountdown expiracion={qrData.qr_expiracion} isDark={isDark} gold={gold} />}
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
        <CircularProgress size={12} sx={{ color: gold }} />
        <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ fontSize: 11 }}>Esperando confirmación del banco...</Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
        {onVerificar && (
          <Box onClick={onVerificar} sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.6, py: 1, borderRadius: '10px', border: `1.5px solid ${alpha(gold, 0.4)}`, color: isDark ? gold : '#d97706', fontWeight: 700, fontSize: 12, cursor: 'pointer', '&:hover': { bgcolor: alpha(gold, 0.05) } }}>
            <RefreshRoundedIcon sx={{ fontSize: 14 }} />Verificar
          </Box>
        )}
        <Box onClick={!isCancelando ? onCancelar : undefined} sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.6, py: 1, borderRadius: '10px', border: `1.5px solid ${alpha('#ef4444', 0.3)}`, color: '#ef4444', fontWeight: 700, fontSize: 12, cursor: isCancelando ? 'not-allowed' : 'pointer', opacity: isCancelando ? 0.6 : 1, '&:hover': { bgcolor: alpha('#ef4444', 0.05) } }}>
          <CancelRoundedIcon sx={{ fontSize: 14 }} />
          {isCancelando ? 'Cancelando...' : 'Cancelar QR'}
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
  isDark: boolean; gold: string;
}> = ({ modo, onChange, tieneMultiplesHijos, isDark, gold }) => {
  if (!tieneMultiplesHijos) return null;
  return (
    <Box sx={{ display: 'flex', gap: 1, p: 0.5, borderRadius: '14px', bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04), border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)}` }}>
      {([
        { value: 'individual', icon: <PersonRoundedIcon sx={{ fontSize: 15 }} />, label: 'Un hijo' },
        { value: 'familiar', icon: <PeopleRoundedIcon sx={{ fontSize: 15 }} />, label: 'Pago familiar' },
      ] as const).map(opt => {
        const activo = modo === opt.value;
        return (
          <Box
            key={opt.value}
            onClick={() => onChange(opt.value)}
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.8,
              px: 1.5, py: 0.75, borderRadius: '10px', cursor: 'pointer',
              transition: 'all 0.2s',
              bgcolor: activo ? (isDark ? alpha(gold, 0.15) : alpha(gold, 0.1)) : 'transparent',
              color: activo ? (isDark ? gold : '#d97706') : 'text.secondary',
              fontWeight: activo ? 800 : 600, fontSize: 13,
              border: activo ? `1px solid ${alpha(gold, 0.4)}` : '1px solid transparent',
              '&:hover': !activo ? { bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03) } : {},
            }}
          >
            {opt.icon}
            <Typography variant="caption" fontWeight="inherit" sx={{ fontSize: 12 }}>
              {opt.label}
            </Typography>
            {opt.value === 'familiar' && activo && (
              <Chip label="NUEVO" size="small" sx={{ height: 16, fontSize: 8, fontWeight: 900, bgcolor: alpha(gold, 0.2), color: isDark ? gold : '#d97706', borderRadius: 1, ml: 0.5 }} />
            )}
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
  isDark: boolean; gold: string; gradBg: string;
  hayQRActivo: boolean;
  seleccionadas: Set<number>;
  onToggle: (id: number) => void;
}> = ({ hijos, isDark, gold, gradBg, hayQRActivo, seleccionadas, onToggle }) => {
  const { mensualidadesPorHijo, isLoading } = useMensualidadesFamiliares(hijos);

  if (isLoading) return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: '16px' }} />)}
    </Box>
  );

  const hijosConPendientes = hijos.filter(h => {
    const mens = mensualidadesPorHijo[h.estudiante_id] ?? [];
    return mens.some(m => m.estado === 'vencido' || m.estado === 'pendiente');
  });

  if (hijosConPendientes.length === 0) return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <CheckCircleRoundedIcon sx={{ fontSize: 52, color: '#10b981', mb: 1.5, opacity: 0.6 }} />
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
            {/* Cabecera del hijo */}
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5,
              px: 1, py: 0.75, borderRadius: '12px',
              bgcolor: isDark ? alpha(gold, 0.06) : alpha(gold, 0.04),
              border: `1px solid ${alpha(gold, 0.15)}`,
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
                  sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: alpha(gold, 0.15), color: isDark ? gold : '#d97706', borderRadius: 1.5 }}
                />
              )}
            </Box>

            {/* Mensualidades vencidas */}
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
                      disabled={hayQRActivo} isDark={isDark} gold={gold}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Mensualidades pendientes */}
            {pendientes.length > 0 && (
              <Box>
                <Typography variant="caption" fontWeight={800} sx={{ color: isDark ? gold : '#d97706', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, mb: 0.75, display: 'block', px: 0.5 }}>
                  Pendientes
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {pendientes.map((m, i) => (
                    <MensualidadCard
                      key={m.mensualidad_id} mens={m} index={i}
                      selected={seleccionadas.has(m.mensualidad_id)}
                      onToggle={() => onToggle(m.mensualidad_id)}
                      disabled={hayQRActivo} isDark={isDark} gold={gold}
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
  const { isDark, gold, goldEnd, gradBg } = usePalette();
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

  // Preseleccionar al cambiar de hijo/modo
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
      setSeleccionadas(new Set()); // en familiar el padre elige manualmente
    }
  }, [mensualidades.length, mesParam, modo]);

  // Limpiar al cambiar modo
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

  // ── Cálculos familiar ──
  // El total familiar se calcula dentro de VistaFamiliar pero necesitamos pasarlo al QR panel.
  // Como no tenemos acceso directo, usamos seleccionadas + un mapa de montos.
  // Para simplificar, mostramos el total a través del estado de useQRFamiliar.
  const totalMontoFam = seleccionadas.size > 0
    ? Array.from(seleccionadas).length * 0 // placeholder: el monto real viene del qrData
    : 0;

  // ── Hooks QR ──
  const {
    qrData: qrMultiple, estadoQR: estadoMultiple, pagado: pagadoMultiple,
    isGenerando: generandoMultiple, isCancelando: cancelandoMultiple,
    generarQR: generarMultiple, cancelarQR: cancelarMultiple, resetear: resetearMultiple,
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
    generarQR: generarFamiliarQR, cancelarQR: cancelarFamiliar, resetear: resetearFamiliar,
  } = useQRFamiliar();

  // ── Estado unificado ──
  const esIndividual = modo === 'individual' && mensSeleccionadas.length === 1;
  const qrData = modo === 'familiar' ? qrFamiliar : esIndividual ? qrIndividual : qrMultiple;
  const estadoQR = modo === 'familiar' ? estadoFamiliar : esIndividual ? estadoIndividual : estadoMultiple;
  const pagado = modo === 'familiar' ? pagadoFamiliar : esIndividual ? pagadoIndividual : pagadoMultiple;
  const isGenerando = modo === 'familiar' ? generandoFamiliar : esIndividual ? generandoIndividual : generandoMultiple;
  const isCancelando = modo === 'familiar' ? cancelandoFamiliar : esIndividual ? cancelandoIndividual : cancelandoMultiple;

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
    // Cancelar QR activo al cambiar de modo
    if (hayQRActivo) handleCancelar();
    setModo(nuevoModo);
  }, [hayQRActivo, handleCancelar]);

  useEffect(() => {
    if (pagado) {
      const timer = setTimeout(() => router.push('/dashboard/padre/financiero'), 3000);
      return () => clearTimeout(timer);
    }
  }, [pagado, router]);

  // ── Label del botón generar ──
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
    <Box sx={{ minHeight: '100vh', background: isDark ? 'radial-gradient(ellipse at top left, rgba(250,204,21,0.04) 0%, transparent 50%)' : 'radial-gradient(ellipse at top left, rgba(245,158,11,0.03) 0%, transparent 50%)' }}>
      <Container maxWidth="lg" disableGutters sx={{ px: { xs: 2, sm: 3 } }}>
        <Box sx={{ pt: 3, pb: 6 }}>

          {/* ══ HEADER ══ */}
          <Fade in timeout={400}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{
                p: { xs: 2, sm: 3 }, borderRadius: '24px',
                background: isDark ? 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))' : '#fff',
                border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.05)}`,
                boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)',
                position: 'relative', overflow: 'hidden',
              }}>
                <Box sx={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, transparent, ${alpha('#fff', isDark ? 0.02 : 0.05)}, transparent)`, backgroundSize: '1000px 100%', animation: `${shimmer} 4s linear infinite`, pointerEvents: 'none' }} />

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Tooltip title="Volver">
                      <IconButton onClick={() => router.push('/dashboard/padre/financiero')} size="small" sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04), border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)}`, borderRadius: '10px' }}>
                        <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Box sx={{ width: 48, height: 48, borderRadius: '14px', background: gradBg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 16px ${alpha(gold, 0.4)}`, flexShrink: 0 }}>
                      <QrCode2RoundedIcon sx={{ fontSize: 24, color: isDark ? '#000' : '#fff' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={900} sx={{ background: gradBg, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: -0.3, lineHeight: 1.2 }}>
                        Pagar Online
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Generá un QR y pagá desde la app de tu banco
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    {/* Toggle modo — solo si hay múltiples hijos */}
                    <ModoToggle
                      modo={modo}
                      onChange={handleCambioModo}
                      tieneMultiplesHijos={tieneMultiplesHijos}
                      isDark={isDark}
                      gold={gold}
                    />

                    {/* Info hijo activo (solo modo individual) */}
                    {modo === 'individual' && hijoActivo && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1, borderRadius: '12px', bgcolor: isDark ? alpha('#fff', 0.04) : alpha(gold, 0.05), border: `1px solid ${alpha(gold, 0.2)}` }}>
                        <Box sx={{ width: 30, height: 30, borderRadius: '9px', background: gradBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: isDark ? '#000' : '#fff', flexShrink: 0 }}>
                          {hijoActivo.nombres.charAt(0)}{hijoActivo.apellidos.charAt(0)}
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={800} sx={{ fontSize: 13, lineHeight: 1.2 }}>{hijoActivo.nombres} {hijoActivo.apellidos}</Typography>
                          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>{hijoActivo.grado} "{hijoActivo.paralelo}"</Typography>
                        </Box>
                      </Box>
                    )}

                    {/* Badge modo familiar activo */}
                    {modo === 'familiar' && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, borderRadius: '12px', bgcolor: isDark ? alpha(gold, 0.1) : alpha(gold, 0.06), border: `1px solid ${alpha(gold, 0.3)}` }}>
                        <PeopleRoundedIcon sx={{ fontSize: 16, color: isDark ? gold : '#d97706' }} />
                        <Typography variant="caption" fontWeight={800} sx={{ color: isDark ? gold : '#d97706', fontSize: 12 }}>
                          {hijos.filter(h => h.matricula_id).length} hijos · Pago familiar
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Selector de hijo — solo modo individual con múltiples hijos */}
                {modo === 'individual' && tieneMultiplesHijos && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)}`, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {hijos.filter(h => h.matricula_id).map(hijo => {
                      const activo = hijoActivo?.estudiante_id === hijo.estudiante_id;
                      return (
                        <Box
                          key={hijo.estudiante_id}
                          onClick={() => { if (!hayQRActivo) { setHijoActivo(hijo); setSeleccionadas(new Set()); } }}
                          sx={{
                            display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75,
                            borderRadius: '10px', cursor: hayQRActivo ? 'not-allowed' : 'pointer',
                            border: `1.5px solid ${activo ? alpha(gold, 0.5) : alpha(isDark ? '#fff' : '#000', 0.1)}`,
                            bgcolor: activo ? alpha(gold, isDark ? 0.12 : 0.07) : 'transparent',
                            opacity: hayQRActivo && !activo ? 0.5 : 1,
                            transition: 'all 0.15s',
                          }}
                        >
                          <Avatar sx={{ width: 22, height: 22, fontSize: '0.6rem', fontWeight: 800, background: activo ? gradBg : alpha(gold, 0.2), color: activo ? (isDark ? '#000' : '#fff') : gold }}>
                            {hijo.nombres.charAt(0)}{hijo.apellidos.charAt(0)}
                          </Avatar>
                          <Typography variant="caption" fontWeight={activo ? 800 : 600} sx={{ color: activo ? (isDark ? gold : '#d97706') : 'text.secondary', fontSize: 12 }}>
                            {hijo.nombres.split(' ')[0]}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            </Box>
          </Fade>

          {/* ══ CUERPO ══ */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 380px' }, gap: 3, alignItems: 'start' }}>

            {/* ── COLUMNA IZQUIERDA ── */}
            <Box sx={{ borderRadius: '20px', background: isDark ? 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))' : '#fff', border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`, boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

              {/* Header lista */}
              <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#f8f9fa', 0.5) }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {modo === 'familiar'
                    ? <PeopleRoundedIcon sx={{ fontSize: 17, color: isDark ? gold : '#d97706' }} />
                    : <AccountBalanceWalletRoundedIcon sx={{ fontSize: 17, color: isDark ? gold : '#d97706' }} />
                  }
                  <Typography variant="subtitle2" fontWeight={800}>
                    {modo === 'familiar' ? 'Seleccioná mensualidades de tus hijos' : 'Seleccioná los meses a pagar'}
                  </Typography>
                  {seleccionadas.size > 0 && (
                    <Chip
                      label={`${seleccionadas.size} seleccionada${seleccionadas.size > 1 ? 's' : ''}`}
                      size="small"
                      sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: isDark ? alpha(gold, 0.12) : alpha(gold, 0.08), color: isDark ? gold : '#d97706', borderRadius: 1.5 }}
                    />
                  )}
                </Box>

                {/* Seleccionar todas (solo modo individual) */}
                {modo === 'individual' && !loadingMens && pagables.length > 0 && !hayQRActivo && (
                  <Box onClick={seleccionarTodas} sx={{ fontSize: 12, fontWeight: 700, color: isDark ? gold : '#d97706', cursor: 'pointer', '&:hover': { opacity: 0.7 } }}>
                    {seleccionadas.size === pagables.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
                  </Box>
                )}

                {/* Info familiar */}
                {modo === 'familiar' && !hayQRActivo && (
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
                    Mínimo 2 mensualidades
                  </Typography>
                )}
              </Box>

              {/* ── CONTENIDO según modo ── */}
              {modo === 'individual' ? (
                <>
                  {(loadingHijos || loadingMens) && (
                    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: '16px' }} />)}
                    </Box>
                  )}
                  {!loadingMens && pagables.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <CheckCircleRoundedIcon sx={{ fontSize: 52, color: '#10b981', mb: 1.5, opacity: 0.6 }} />
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
                              <MensualidadCard mens={m} selected={seleccionadas.has(m.mensualidad_id)} onToggle={() => toggleSeleccion(m.mensualidad_id)} disabled={hayQRActivo} isDark={isDark} gold={gold} index={i} />
                            </Box>
                          ))}
                        </Box>
                      )}
                      {pagables.filter(m => m.estado === 'pendiente').length > 0 && (
                        <Box>
                          <Typography variant="caption" fontWeight={800} sx={{ color: isDark ? gold : '#d97706', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, mb: 1, display: 'block', px: 0.5 }}>Pendientes</Typography>
                          {pagables.filter(m => m.estado === 'pendiente').map((m, i) => (
                            <Box key={m.mensualidad_id} sx={{ mb: 1 }}>
                              <MensualidadCard mens={m} selected={seleccionadas.has(m.mensualidad_id)} onToggle={() => toggleSeleccion(m.mensualidad_id)} disabled={hayQRActivo} isDark={isDark} gold={gold} index={i} />
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
                  isDark={isDark} gold={gold} gradBg={gradBg}
                  hayQRActivo={hayQRActivo}
                  seleccionadas={seleccionadas}
                  onToggle={toggleSeleccion}
                />
              )}

              {/* Footer resumen */}
              {seleccionadas.size > 0 && (
                <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`, bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#f8f9fa', 0.5), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                      <Typography variant="caption" sx={{ color: isDark ? alpha(gold, 0.7) : '#d97706', fontSize: 11, fontWeight: 600 }}>
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
              borderRadius: '20px',
              background: isDark ? 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))' : '#fff',
              border: `1px solid ${pagado ? alpha('#10b981', 0.3) : qrData ? alpha(gold, 0.25) : isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
              boxShadow: pagado ? `0 4px 24px ${alpha('#10b981', 0.15)}` : isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.05)',
              overflow: 'hidden', position: { md: 'sticky' }, top: { md: 24 },
            }}>
              <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)}`, bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#f8f9fa', 0.5), display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <QrCode2RoundedIcon sx={{ fontSize: 17, color: pagado ? '#10b981' : isDark ? gold : '#d97706' }} />
                <Typography variant="subtitle2" fontWeight={800}>
                  {pagado ? 'Pago Confirmado' : modo === 'familiar' ? 'QR Familiar' : 'Código QR de Pago'}
                </Typography>
                {qrData && !pagado && (
                  <Chip label="ACTIVO" size="small" sx={{ height: 18, fontSize: 9, fontWeight: 900, bgcolor: alpha('#10b981', 0.12), color: '#10b981', borderRadius: 1.5, animation: `${pulseGreen} 2s ease-in-out infinite` }} />
                )}
                {modo === 'familiar' && !qrData && !pagado && (
                  <Chip label="MULTI-HIJO" size="small" sx={{ height: 18, fontSize: 9, fontWeight: 900, bgcolor: alpha(gold, 0.12), color: isDark ? gold : '#d97706', borderRadius: 1.5 }} />
                )}
              </Box>

              <Box sx={{ p: 3 }}>
                <PanelQR
                  qrData={qrData} estadoQR={estadoQR} pagado={pagado}
                  isGenerando={isGenerando} isCancelando={isCancelando}
                  onCancelar={handleCancelar}
                  onVerificar={modo !== 'familiar' ? verificarEstado : undefined}
                  isDark={isDark} gold={gold} gradBg={gradBg}
                  totalMonto={totalMonto} mesesLabel={mesesLabel}
                />

                {/* Botón generar */}
                {!qrData && !pagado && (
                  <Box
                    onClick={puedeGenerar && !isGenerando ? handleGenerarQR : undefined}
                    sx={{
                      mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                      py: 1.5, borderRadius: '14px',
                      background: puedeGenerar ? gradBg : isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                      color: puedeGenerar ? (isDark ? '#000' : '#fff') : 'text.disabled',
                      fontWeight: 800, fontSize: 14,
                      cursor: puedeGenerar && !isGenerando ? 'pointer' : 'not-allowed',
                      boxShadow: puedeGenerar ? `0 4px 16px ${alpha(gold, 0.4)}` : 'none',
                      transition: 'all 0.2s',
                      '&:hover': puedeGenerar && !isGenerando ? { opacity: 0.88, transform: 'translateY(-1px)' } : {},
                    }}
                  >
                    {isGenerando ? (
                      <><CircularProgress size={16} sx={{ color: 'inherit' }} />Generando...</>
                    ) : (
                      <>{modo === 'familiar' ? <PeopleRoundedIcon sx={{ fontSize: 18 }} /> : <QrCode2RoundedIcon sx={{ fontSize: 18 }} />}{labelBotonGenerar()}</>
                    )}
                  </Box>
                )}

                {/* Instrucciones */}
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
                        <Box sx={{ width: 22, height: 22, borderRadius: '7px', flexShrink: 0, bgcolor: isDark ? alpha(gold, 0.12) : alpha(gold, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: isDark ? gold : '#d97706' }}>
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
        </Box>
      </Container>
    </Box>
  );
}