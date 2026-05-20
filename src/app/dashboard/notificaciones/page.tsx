'use client';
// app/dashboard/secretaria/notificaciones/page.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Typography, Chip, IconButton, Tooltip,
  Stack, CircularProgress, Fade, alpha, useTheme,
  Collapse, Divider, LinearProgress,
} from '@mui/material';
import { keyframes } from '@mui/system';

import NotificationsRoundedIcon       from '@mui/icons-material/NotificationsRounded';
import AddRoundedIcon                  from '@mui/icons-material/AddRounded';
import SendRoundedIcon                 from '@mui/icons-material/SendRounded';
import DeleteRoundedIcon               from '@mui/icons-material/DeleteRounded';
import RefreshRoundedIcon              from '@mui/icons-material/RefreshRounded';
import WhatsAppIcon                    from '@mui/icons-material/WhatsApp';
import EmailRoundedIcon                from '@mui/icons-material/EmailRounded';
import NotificationsActiveRoundedIcon  from '@mui/icons-material/NotificationsActiveRounded';
import CheckCircleRoundedIcon          from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon                from '@mui/icons-material/ErrorRounded';
import PeopleRoundedIcon               from '@mui/icons-material/PeopleRounded';
import VisibilityRoundedIcon           from '@mui/icons-material/VisibilityRounded';
import KeyboardArrowDownRoundedIcon    from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon      from '@mui/icons-material/KeyboardArrowUpRounded';
import EditRoundedIcon                 from '@mui/icons-material/EditRounded';
import AccessTimeRoundedIcon           from '@mui/icons-material/AccessTimeRounded';
import CampaignRoundedIcon             from '@mui/icons-material/CampaignRounded';
import PaymentRoundedIcon              from '@mui/icons-material/PaymentRounded';
import SchoolRoundedIcon               from '@mui/icons-material/SchoolRounded';
import PersonRoundedIcon               from '@mui/icons-material/PersonRounded';
import HourglassEmptyRoundedIcon       from '@mui/icons-material/HourglassEmptyRounded';
import AttachFileRoundedIcon           from '@mui/icons-material/AttachFileRounded';

import { useRouter } from 'next/navigation';
import { useNotificaciones } from '@/hooks/useNotificaciones';
import { notificacionService } from '@/services/notificacionService';
import {
  NotificacionInstitucional,
  TipoNotificacion,
  EstadoNotificacion,
  ResumenEnvioCanal,
  AUDIENCIAS,
  PRIORIDADES,
} from '@/types/notificacionTypes';

// ─── Animaciones ──────────────────────────────────────────────────────────────
const bounceIcon = keyframes`
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-5px); }
`;
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const cardIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const pulseRing = keyframes`
  0%, 100% { transform: scale(1);    opacity: 1; }
  50%       { transform: scale(1.18); opacity: 0.45; }
`;
const spinAnim = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

// ─── Paleta idéntica a la página de notas ─────────────────────────────────────
const usePalette = () => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold    = isDark ? '#facc15' : '#0288d1';
  const goldEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg  = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;
  return { isDark, gold, gradBg };
};

// ─── Config de tipos (≈ DIMENSIONES_CONFIG en notas) ─────────────────────────
const TIPO_CONFIG: Record<TipoNotificacion, {
  color: string; bgColor: string; label: string; Icon: React.ElementType;
}> = {
  aviso_general:           { color: '#2563eb', bgColor: '#dbeafe', label: 'Aviso general',    Icon: CampaignRoundedIcon },
  pago_vencido:            { color: '#dc2626', bgColor: '#fee2e2', label: 'Pago vencido',     Icon: PaymentRoundedIcon  },
  comunicado_grado:        { color: '#7c3aed', bgColor: '#ede9fe', label: 'Comunicado grado', Icon: SchoolRoundedIcon   },
  notificacion_individual: { color: '#059669', bgColor: '#d1fae5', label: 'Individual',       Icon: PersonRoundedIcon   },
};
const TIPOS_ORDEN: TipoNotificacion[] = [
  'aviso_general', 'pago_vencido', 'comunicado_grado', 'notificacion_individual',
];
const ESTADO_META: Record<string, { color: string; label: string }> = {
  borrador:   { color: '#6b7280', label: 'Borrador'   },
  programada: { color: '#2563eb', label: 'Programada' },
  enviando:   { color: '#d97706', label: 'Enviando…'  },
  enviada:    { color: '#16a34a', label: 'Enviada'    },
  fallida:    { color: '#dc2626', label: 'Fallida'    },
};
const CANAL_META = {
  whatsapp: { color: '#16a34a', Icon: WhatsAppIcon,                   label: 'WhatsApp' },
  email:    { color: '#2563eb', Icon: EmailRoundedIcon,               label: 'Email'    },
  interno:  { color: '#7c3aed', Icon: NotificationsActiveRoundedIcon, label: 'App'      },
} as const;

// ─── DetallePanel ─────────────────────────────────────────────────────────────
// FIX: depende de `isOpen` — el fetch solo ocurre cuando el card se abre
// por primera vez. Antes MUI montaba el componente aunque Collapse estuviera
// cerrado, haciendo el fetch en mount para TODAS las cards a la vez.
const DetallePanel: React.FC<{
  notif: NotificacionInstitucional;
  accentColor: string;
  isDark: boolean;
  isOpen: boolean;
}> = ({ notif, accentColor, isDark, isOpen }) => {
  const [resumen, setResumen]       = useState<ResumenEnvioCanal[]>([]);
  const [loadingRes, setLoadingRes] = useState(false);
  const fetched = useRef(false); // evita re-pedir si el usuario abre/cierra varias veces

  useEffect(() => {
    // Solo cuando se abre, y solo una vez
    if (!isOpen || fetched.current || notif.estado === 'borrador') return;
    fetched.current = true;
    setLoadingRes(true);
    notificacionService.resumenEnvios(notif.id)
      .then(r => setResumen(r.data.resumen))
      .catch(() => {})
      .finally(() => setLoadingRes(false));
  }, [isOpen]); // isOpen es la única dependencia que importa para el trigger

  const audiencia = AUDIENCIAS.find(a => a.value === notif.audiencia);
  const prioridad = PRIORIDADES.find(p => p.value === notif.prioridad);

  const SectionLabel = ({ text }: { text: string }) => (
    <Typography variant="caption" fontWeight={800} sx={{
      color: accentColor, fontSize: 10, letterSpacing: 0.5,
      textTransform: 'uppercase', display: 'block', mb: 1,
    }}>
      {text}
    </Typography>
  );

  const metaRows = [
    { label: 'Audiencia',  value: `${audiencia?.icon ?? ''} ${audiencia?.label ?? notif.audiencia}` },
    { label: 'Prioridad',  value: prioridad?.label ?? notif.prioridad, color: prioridad?.color },
    { label: 'Creada por', value: notif.creada_por_username ?? `#${notif.creada_por}` },
    { label: 'Fecha',      value: new Date(notif.created_at).toLocaleString('es-BO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
    ...(notif.enviada_en ? [{ label: 'Enviada', value: new Date(notif.enviada_en).toLocaleString('es-BO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) }] : []),
    ...(notif.grado_nombre ? [{ label: 'Grado', value: `${notif.grado_nombre}${notif.paralelo_nombre ? ` "${notif.paralelo_nombre}"` : ''}` }] : []),
    ...(notif.nivel_nombre ? [{ label: 'Nivel', value: notif.nivel_nombre }] : []),
  ];

  return (
    <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

      {/* ── Mensaje ── */}
      <Box>
        <SectionLabel text="Mensaje" />
        <Typography variant="body2" color="text.secondary" sx={{
          p: 2, borderRadius: '12px', lineHeight: 1.75, fontSize: 13.5, whiteSpace: 'pre-wrap',
          bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.03),
          border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
        }}>
          {notif.mensaje}
        </Typography>
      </Box>

      {/* ── Foto ── */}
      {notif.foto_url && (
        <Box>
          <SectionLabel text="Imagen adjunta" />
          <Box component="img" src={notif.foto_url} alt="Foto"
            sx={{
              width: '100%', maxHeight: 220, objectFit: 'contain', borderRadius: '12px',
              border: `1.5px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
              bgcolor: isDark ? alpha('#000', 0.3) : '#f8f9fa',
            }} />
        </Box>
      )}

      {/* ── Info ── */}
      <Box>
        <SectionLabel text="Información" />
        <Box sx={{
          borderRadius: '12px', overflow: 'hidden',
          border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
        }}>
          {metaRows.map((r, i) => (
            <Box key={r.label} sx={{
              display: 'flex', gap: 2, px: 2, py: 1.1,
              bgcolor: i % 2 === 0 ? (isDark ? alpha('#fff', 0.015) : alpha('#f8f9fa', 0.7)) : 'transparent',
              borderBottom: i < metaRows.length - 1 ? `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04)}` : 'none',
            }}>
              <Typography variant="caption" sx={{ minWidth: 88, color: 'text.disabled', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                {r.label}
              </Typography>
              <Typography variant="caption" fontWeight={600} sx={{ fontSize: 12.5, color: (r as any).color ?? 'text.primary' }}>
                {r.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Resumen de envíos ── */}
      {notif.estado !== 'borrador' && (
        <Box>
          <SectionLabel text="Resumen de envíos" />
          {loadingRes ? (
            <Box sx={{ py: 2, textAlign: 'center' }}>
              <CircularProgress size={18} sx={{ color: accentColor }} />
            </Box>
          ) : resumen.length === 0 ? (
            <Typography variant="caption" color="text.disabled"
              sx={{ display: 'block', textAlign: 'center', py: 1.5, fontStyle: 'italic' }}>
              Sin datos de envío todavía
            </Typography>
          ) : (
            <Stack spacing={1}>
              {resumen.map(r => {
                const cm = CANAL_META[r.canal as keyof typeof CANAL_META];
                if (!cm) return null;
                const CIcon = cm.Icon;
                const pct = r.total > 0 ? Math.round((r.enviados / r.total) * 100) : 0;
                return (
                  <Box key={r.canal} sx={{
                    p: 1.5, borderRadius: '10px',
                    border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                    bgcolor: isDark ? alpha('#fff', 0.02) : '#fafafa',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.9 }}>
                      <CIcon sx={{ fontSize: 14, color: cm.color }} />
                      <Typography variant="caption" fontWeight={700} sx={{ color: cm.color, flex: 1, fontSize: 12 }}>
                        {cm.label}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1.5 }}>
                        {r.enviados > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                            <CheckCircleRoundedIcon sx={{ fontSize: 11, color: '#16a34a' }} />
                            <Typography variant="caption" sx={{ fontSize: 11, color: '#16a34a', fontWeight: 700 }}>{r.enviados}</Typography>
                          </Box>
                        )}
                        {r.fallidos > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                            <ErrorRoundedIcon sx={{ fontSize: 11, color: '#dc2626' }} />
                            <Typography variant="caption" sx={{ fontSize: 11, color: '#dc2626', fontWeight: 700 }}>{r.fallidos}</Typography>
                          </Box>
                        )}
                        {r.leidos > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                            <VisibilityRoundedIcon sx={{ fontSize: 11, color: '#2563eb' }} />
                            <Typography variant="caption" sx={{ fontSize: 11, color: '#2563eb', fontWeight: 700 }}>{r.leidos}</Typography>
                          </Box>
                        )}
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, fontWeight: 600 }}>
                          {r.total} total
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress variant="determinate" value={pct} sx={{
                        flex: 1, height: 5, borderRadius: 4,
                        bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06),
                        '& .MuiLinearProgress-bar': { bgcolor: cm.color, borderRadius: 4 },
                      }} />
                      <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 700, color: cm.color, minWidth: 28 }}>
                        {pct}%
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>
      )}
    </Box>
  );
};

// ─── NotificacionCard ─────────────────────────────────────────────────────────
const NotificacionCard: React.FC<{
  notif: NotificacionInstitucional;
  index: number;
  isDark: boolean;
  onEnviar: (id: number) => void;
  onEliminar: (id: number) => void;
  isSubmitting: boolean;
}> = ({ notif, index, isDark, onEnviar, onEliminar, isSubmitting }) => {
  const [open, setOpen] = useState(false);

  const cfg         = TIPO_CONFIG[notif.tipo];
  const estadoMeta  = ESTADO_META[notif.estado] ?? { color: '#6b7280', label: notif.estado };
  const accentColor = cfg?.color ?? '#2563eb';
  const TypeIcon    = cfg?.Icon  ?? CampaignRoundedIcon;
  const esEnviando  = notif.estado === 'enviando';
  const audiencia   = AUDIENCIAS.find(a => a.value === notif.audiencia);

  const canalesActivos = ([
    notif.enviar_whatsapp && 'whatsapp',
    notif.enviar_email    && 'email',
    notif.enviar_interno  && 'interno',
  ].filter(Boolean)) as Array<keyof typeof CANAL_META>;

  return (
    <Box sx={{
      borderRadius: '16px',
      border: `1.5px solid ${open ? accentColor : isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
      overflow: 'hidden',
      animation: `${cardIn} 0.3s ease-out ${index * 0.06}s both`,
      transition: 'border-color 0.18s, box-shadow 0.18s',
      boxShadow: open
        ? `0 0 0 3px ${alpha(accentColor, 0.1)}, 0 6px 20px ${alpha(accentColor, 0.12)}`
        : isDark ? 'none' : '0 1px 6px rgba(0,0,0,0.05)',
    }}>

      {/* ── Cabecera ── */}
      <Box
        onClick={() => setOpen(o => !o)}
        sx={{
          p: 2, cursor: 'pointer',
          bgcolor: open
            ? isDark ? alpha(accentColor, 0.1) : alpha(cfg?.bgColor ?? '#dbeafe', 0.45)
            : isDark ? alpha('#fff', 0.02) : '#fff',
          transition: 'background 0.18s',
          display: 'flex', alignItems: 'center', gap: 1.5,
          '&:hover': { bgcolor: isDark ? alpha(accentColor, 0.07) : alpha(cfg?.bgColor ?? '#dbeafe', 0.3) },
        }}
      >
        {/* Ícono tipo */}
        <Box sx={{ position: 'relative', flexShrink: 0 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: '12px',
            bgcolor: open ? alpha(accentColor, 0.2) : isDark ? alpha('#fff', 0.05) : alpha(accentColor, 0.08),
            border: `1.5px solid ${open ? alpha(accentColor, 0.4) : 'transparent'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.18s',
          }}>
            <TypeIcon sx={{
              fontSize: 20,
              color: open ? accentColor : isDark ? alpha('#fff', 0.35) : alpha(accentColor, 0.65),
            }} />
          </Box>
          {esEnviando && (
            <Box sx={{
              position: 'absolute', inset: -3, borderRadius: '14px',
              border: `2px solid ${accentColor}`,
              animation: `${pulseRing} 1.2s ease-in-out infinite`,
            }} />
          )}
        </Box>

        {/* Texto */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.4, flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" fontWeight={800} noWrap
              sx={{ fontSize: 13.5, color: open ? accentColor : 'text.primary', transition: 'color 0.18s' }}>
              {notif.titulo}
            </Typography>
            <Chip label={estadoMeta.label} size="small" sx={{
              fontSize: 10, height: 18, fontWeight: 700,
              bgcolor: alpha(estadoMeta.color, 0.12), color: estadoMeta.color,
            }} />
            {notif.prioridad !== 'normal' && (
              <Chip
                label={notif.prioridad === 'urgente' ? '🚨 Urgente' : notif.prioridad === 'alta' ? '⚠️ Alta' : 'Baja'}
                size="small"
                sx={{
                  fontSize: 10, height: 18, fontWeight: 700,
                  bgcolor: alpha(notif.prioridad === 'urgente' ? '#dc2626' : notif.prioridad === 'alta' ? '#d97706' : '#6b7280', 0.12),
                  color: notif.prioridad === 'urgente' ? '#dc2626' : notif.prioridad === 'alta' ? '#d97706' : '#6b7280',
                }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center', flexWrap: 'wrap', mb: 0.6 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
              {audiencia?.icon} {audiencia?.label}
            </Typography>
            {notif.grado_nombre && (
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
                · {notif.grado_nombre}{notif.paralelo_nombre ? ` "${notif.paralelo_nombre}"` : ''}
              </Typography>
            )}
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
              · {new Date(notif.created_at).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.6, alignItems: 'center', flexWrap: 'wrap' }}>
            {canalesActivos.map(c => {
              const cm = CANAL_META[c];
              const CIcon = cm.Icon;
              return (
                <Box key={c} sx={{
                  display: 'flex', alignItems: 'center', gap: 0.4,
                  px: 0.8, py: 0.25, borderRadius: '6px',
                  bgcolor: alpha(cm.color, 0.1), color: cm.color, fontSize: 10, fontWeight: 700,
                }}>
                  <CIcon sx={{ fontSize: 11 }} />
                  {cm.label}
                </Box>
              );
            })}
            {notif.foto_url && <AttachFileRoundedIcon sx={{ fontSize: 12, color: 'text.disabled', ml: 0.4 }} />}
            {(notif.total_destinatarios ?? 0) > 0 && (
              <>
                <Divider orientation="vertical" flexItem sx={{ mx: 0.3, my: 0.25 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                  <PeopleRoundedIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: 10 }}>
                    {notif.total_destinatarios}
                  </Typography>
                </Box>
                {(notif.enviados ?? 0) > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    <CheckCircleRoundedIcon sx={{ fontSize: 10, color: '#16a34a' }} />
                    <Typography variant="caption" sx={{ fontSize: 10, color: '#16a34a', fontWeight: 700 }}>
                      {notif.enviados}
                    </Typography>
                  </Box>
                )}
                {(notif.fallidos ?? 0) > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    <ErrorRoundedIcon sx={{ fontSize: 10, color: '#dc2626' }} />
                    <Typography variant="caption" sx={{ fontSize: 10, color: '#dc2626', fontWeight: 700 }}>
                      {notif.fallidos}
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>

        {/* Acciones */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}
          onClick={e => e.stopPropagation()}>
          {notif.estado === 'borrador' && (
            <Tooltip title="Enviar ahora">
              <span>
                <IconButton size="small" disabled={isSubmitting} onClick={() => onEnviar(notif.id)}
                  sx={{ color: '#16a34a', bgcolor: alpha('#16a34a', 0.08), '&:hover': { bgcolor: alpha('#16a34a', 0.18) } }}>
                  <SendRoundedIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </span>
            </Tooltip>
          )}
          {['borrador', 'programada'].includes(notif.estado) && (
            <Tooltip title="Eliminar">
              <span>
                <IconButton size="small" disabled={isSubmitting} onClick={() => onEliminar(notif.id)}
                  sx={{ color: isDark ? alpha('#fff', 0.2) : '#d1d5db', '&:hover': { color: '#dc2626', bgcolor: alpha('#dc2626', 0.08) } }}>
                  <DeleteRoundedIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </span>
            </Tooltip>
          )}
          <Box sx={{ color: open ? accentColor : 'text.disabled', transition: 'color 0.18s', display: 'flex', ml: 0.5 }}>
            {open ? <KeyboardArrowUpRoundedIcon sx={{ fontSize: 18 }} /> : <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18 }} />}
          </Box>
        </Box>
      </Box>

      {/* ── Detalle expandido ── */}
      <Collapse in={open} timeout={240}>
        <Box sx={{
          borderTop: `1.5px solid ${alpha(accentColor, 0.2)}`,
          bgcolor: isDark ? alpha('#fff', 0.015) : alpha(cfg?.bgColor ?? '#dbeafe', 0.1),
        }}>
          {/* isOpen controla el fetch — no se llama hasta que el usuario abra el card */}
          <DetallePanel notif={notif} accentColor={accentColor} isDark={isDark} isOpen={open} />
        </Box>
      </Collapse>
    </Box>
  );
};

// ─── Página ───────────────────────────────────────────────────────────────────
export default function NotificacionesPage() {
  const router               = useRouter();
  const { isDark, gold, gradBg } = usePalette();

  const [tipoTab,      setTipoTab]      = useState<TipoNotificacion | 'todos'>('todos');
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoNotificacion | ''>('');

  const {
    notificaciones, paginacion, isLoading, isSubmitting,
    actualizarFiltros, enviar, eliminar, refrescar,
  } = useNotificaciones({ limit: 30 });

  useEffect(() => {
    actualizarFiltros({ tipo: tipoTab === 'todos' ? undefined : tipoTab as TipoNotificacion });
  }, [tipoTab]);

  useEffect(() => {
    actualizarFiltros({ estado: estadoFiltro || undefined });
  }, [estadoFiltro]);

  const activeColor     = tipoTab === 'todos' ? gold : (TIPO_CONFIG[tipoTab as TipoNotificacion]?.color ?? gold);
  const totalEnviadas   = notificaciones.filter(n => n.estado === 'enviada').length;
  const totalBorradores = notificaciones.filter(n => n.estado === 'borrador').length;
  const totalEnviando   = notificaciones.filter(n => n.estado === 'enviando').length;

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">

        {/* HEADER */}
        <Fade in timeout={400}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <NotificationsRoundedIcon sx={{
                  color: gold, fontSize: 34,
                  animation: `${bounceIcon} 1.5s ease-in-out infinite`,
                }} />
                <Box>
                  <Typography variant="h1" sx={{
                    fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.2rem' }, fontWeight: 800,
                    background: gradBg, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>
                    Notificaciones
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.4 }}>
                    <Chip label={`${paginacion.total} comunicados`} size="small"
                      sx={{ background: gradBg, color: isDark ? '#000' : '#fff', fontWeight: 700, fontSize: 11 }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Unidad Educativa La Voz de Cristo
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Tooltip title="Refrescar">
                  <IconButton onClick={refrescar} disabled={isLoading}
                    sx={{ border: `1.5px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}` }}>
                    {isLoading ? <CircularProgress size={16} /> : <RefreshRoundedIcon sx={{ fontSize: 18 }} />}
                  </IconButton>
                </Tooltip>
                <Box component="button"
                  onClick={() => router.push('/dashboard/notificaciones/nueva')}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 0.8,
                    px: 2, py: 1, borderRadius: '12px', border: 'none',
                    background: gradBg, color: isDark ? '#000' : '#fff',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    transition: 'opacity .15s, transform .15s',
                    '&:hover': { opacity: 0.88, transform: 'translateY(-1px)' },
                  }}>
                  <AddRoundedIcon sx={{ fontSize: 18 }} />
                  Nueva Notificación
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.2, mt: 2.5, flexWrap: 'wrap' }}>
              {[
                { label: 'Enviadas',   value: totalEnviadas,   color: '#16a34a', icon: <CheckCircleRoundedIcon sx={{ fontSize: 14 }} /> },
                { label: 'Borradores', value: totalBorradores, color: '#6b7280', icon: <EditRoundedIcon sx={{ fontSize: 14 }} /> },
                ...(totalEnviando > 0 ? [{ label: 'Enviando', value: totalEnviando, color: '#d97706', icon: <AccessTimeRoundedIcon sx={{ fontSize: 14, animation: `${spinAnim} 2s linear infinite` }} /> }] : []),
              ].map(s => (
                <Box key={s.label} sx={{
                  display: 'flex', alignItems: 'center', gap: 0.8,
                  px: 1.5, py: 0.8, borderRadius: '10px',
                  bgcolor: alpha(s.color, 0.08), border: `1px solid ${alpha(s.color, 0.2)}`,
                }}>
                  <Box sx={{ color: s.color }}>{s.icon}</Box>
                  <Typography variant="body2" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Fade>

        {/* TABS */}
        <Fade in timeout={450}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ background: gradBg, borderRadius: '16px', p: 1, display: 'flex', gap: 0.5, overflowX: 'auto' }}>
              {[
                { key: 'todos' as const, label: 'Todos', count: paginacion.total },
                ...TIPOS_ORDEN.map(k => ({
                  key: k, label: TIPO_CONFIG[k].label,
                  count: notificaciones.filter(n => n.tipo === k).length,
                })),
              ].map(tab => {
                const isActive = tipoTab === tab.key;
                return (
                  <Box key={tab.key} onClick={() => setTipoTab(tab.key)} sx={{
                    flex: 1, minWidth: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8,
                    px: 1.5, py: 1.2, borderRadius: '12px', cursor: 'pointer',
                    bgcolor: isActive ? (isDark ? alpha('#000', 0.25) : alpha('#fff', 0.3)) : 'transparent',
                    transition: 'background .15s',
                    '&:hover': { bgcolor: isDark ? alpha('#000', 0.15) : alpha('#fff', 0.2) },
                  }}>
                    <Typography variant="caption" fontWeight={isActive ? 800 : 600}
                      sx={{ color: isDark ? '#000' : '#fff', fontSize: 13, whiteSpace: 'nowrap' }}>
                      {tab.label}
                    </Typography>
                    {tab.count > 0 && (
                      <Box sx={{
                        fontSize: 10, fontWeight: 800,
                        bgcolor: isDark ? alpha('#000', 0.28) : alpha('#fff', 0.28),
                        color: isDark ? '#000' : '#fff',
                        borderRadius: '8px', px: 0.8, py: 0.1, lineHeight: 1.5, flexShrink: 0,
                      }}>
                        {tab.count}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Fade>

        {/* FILTRO ESTADO */}
        <Fade in timeout={470}>
          <Box sx={{ display: 'flex', gap: 0.75, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11, fontWeight: 600, mr: 0.5 }}>
              Estado:
            </Typography>
            {[
              { value: '', label: 'Todos' },
              ...Object.entries(ESTADO_META).map(([v, m]) => ({ value: v, label: m.label })),
            ].map(e => {
              const isActive = estadoFiltro === e.value;
              const ec = e.value ? ESTADO_META[e.value] : null;
              return (
                <Box key={e.value} onClick={() => setEstadoFiltro(e.value as EstadoNotificacion | '')} sx={{
                  px: 1.2, py: 0.4, borderRadius: '20px', cursor: 'pointer', fontSize: 11,
                  border: `1px solid ${isActive ? (ec?.color ?? activeColor) : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                  bgcolor: isActive ? alpha(ec?.color ?? activeColor, 0.1) : 'transparent',
                  color: isActive ? (ec?.color ?? activeColor) : 'text.secondary',
                  fontWeight: isActive ? 700 : 500, transition: 'all .15s',
                  '&:hover': { borderColor: ec?.color ?? activeColor },
                }}>
                  {e.label}
                </Box>
              );
            })}
          </Box>
        </Fade>

        {/* LISTA */}
        <Fade in timeout={500} key={tipoTab + estadoFiltro}>
          <Box sx={{ animation: `${fadeUp} 0.28s ease-out` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, px: 0.5 }}>
              {tipoTab !== 'todos' && (
                <Box sx={{
                  width: 8, height: 8, borderRadius: '50%', bgcolor: activeColor,
                  boxShadow: `0 0 8px ${alpha(activeColor, 0.6)}`, mr: 1,
                }} />
              )}
              <Typography variant="body2" fontWeight={700} color="text.secondary">
                {notificaciones.length} notificacion{notificaciones.length !== 1 ? 'es' : ''}
                {estadoFiltro ? ` · ${ESTADO_META[estadoFiltro]?.label}` : ''}
              </Typography>
            </Box>

            {isLoading ? (
              <Box sx={{ py: 8, textAlign: 'center' }}>
                <CircularProgress size={28} sx={{ color: activeColor }} />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                  Cargando…
                </Typography>
              </Box>

            ) : notificaciones.length === 0 ? (
              <Box sx={{
                textAlign: 'center', py: 10, borderRadius: '16px',
                border: `2px dashed ${alpha(activeColor, 0.25)}`,
                bgcolor: isDark ? alpha(activeColor, 0.03)
                  : tipoTab !== 'todos'
                    ? alpha(TIPO_CONFIG[tipoTab as TipoNotificacion]?.bgColor ?? '#dbeafe', 0.2)
                    : alpha('#dbeafe', 0.15),
                animation: `${fadeUp} 0.3s ease-out`,
              }}>
                <HourglassEmptyRoundedIcon sx={{ fontSize: 42, color: alpha(activeColor, 0.35), mb: 1.5 }} />
                <Typography variant="h6" fontWeight={700} sx={{ color: activeColor, mb: 0.5 }}>
                  Sin notificaciones{tipoTab !== 'todos' ? ` de "${TIPO_CONFIG[tipoTab as TipoNotificacion]?.label}"` : ''}
                </Typography>
                <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
                  {estadoFiltro
                    ? `No hay notificaciones con estado "${ESTADO_META[estadoFiltro]?.label}"`
                    : 'Creá el primer comunicado institucional'}
                </Typography>
                <Box component="button"
                  onClick={() => router.push('/dashboard/notificaciones/nueva')}
                  sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 0.8,
                    px: 2.5, py: 1, borderRadius: '12px', border: 'none',
                    background: gradBg, color: isDark ? '#000' : '#fff',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    transition: 'opacity .15s', '&:hover': { opacity: 0.88 },
                  }}>
                  <AddRoundedIcon sx={{ fontSize: 17 }} />
                  Nueva Notificación
                </Box>
              </Box>

            ) : (
              <Stack spacing={1.5}>
                {notificaciones.map((notif, i) => (
                  <NotificacionCard
                    key={notif.id} notif={notif} index={i}
                    isDark={isDark} isSubmitting={isSubmitting}
                    onEnviar={enviar} onEliminar={eliminar}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Fade>

      </Container>
    </Box>
  );
}