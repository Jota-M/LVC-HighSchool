'use client';
// app/dashboard/secretaria/notificaciones/nueva/page.tsx

import React, { useState, useRef, useCallback } from 'react';
import {
  Box, Container, Typography, useTheme, alpha, Fade,
  TextField, Stack, Chip, Switch, FormControlLabel,
  Divider, CircularProgress, Collapse,
} from '@mui/material';
import { keyframes } from '@mui/system';

import ArrowBackRoundedIcon           from '@mui/icons-material/ArrowBackRounded';
import NotificationsRoundedIcon       from '@mui/icons-material/NotificationsRounded';
import SendRoundedIcon                 from '@mui/icons-material/SendRounded';
import SaveRoundedIcon                 from '@mui/icons-material/SaveRounded';
import CheckCircleRoundedIcon         from '@mui/icons-material/CheckCircleRounded';
import ImageRoundedIcon               from '@mui/icons-material/ImageRounded';
import WhatsAppIcon                   from '@mui/icons-material/WhatsApp';
import EmailRoundedIcon               from '@mui/icons-material/EmailRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import CampaignRoundedIcon            from '@mui/icons-material/CampaignRounded';
import PaymentRoundedIcon             from '@mui/icons-material/PaymentRounded';
import SchoolRoundedIcon              from '@mui/icons-material/SchoolRounded';
import PersonRoundedIcon              from '@mui/icons-material/PersonRounded';
import PeopleRoundedIcon              from '@mui/icons-material/PeopleRounded';
import TuneRoundedIcon                from '@mui/icons-material/TuneRounded';
import PriorityHighRoundedIcon        from '@mui/icons-material/PriorityHighRounded';
import FilterAltRoundedIcon           from '@mui/icons-material/FilterAltRounded';

import { useRouter } from 'next/navigation';
import { useNotificaciones } from '@/hooks/useNotificaciones';
import { SelectorUsuario } from '@/components/notificaciones/SelectorUsuario';
import { SelectorFiltrosAudiencia, FiltrosAudiencia } from '@/components/notificaciones/SelectorFiltrosAudiencia';
import { Usuario } from '@/services/usuariosService';
import {
  CrearNotificacionDTO,
  TipoNotificacion,
  AudienciaNotificacion,
  PrioridadNotificacion,
  AUDIENCIAS,
  PRIORIDADES,
  NotificacionInstitucional,
} from '@/types/notificacionTypes';

// ─── Animaciones ──────────────────────────────────────────────────────────────
const bounceIcon = keyframes`
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-5px); }
`;
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
`;

// ─── Paleta (igual que notas) ─────────────────────────────────────────────────
const usePalette = () => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold    = isDark ? '#facc15' : '#0288d1';
  const goldEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg  = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;
  return { isDark, gold, gradBg };
};

// ─── Config tipos ─────────────────────────────────────────────────────────────
const TIPO_CONFIG: Record<TipoNotificacion, {
  color: string; bgColor: string; label: string; Icon: React.ElementType; desc: string;
}> = {
  aviso_general:           { color: '#2563eb', bgColor: '#dbeafe', label: 'Aviso general',    Icon: CampaignRoundedIcon, desc: 'Reunión, evento, feriado, anuncio general'       },
  pago_vencido:            { color: '#dc2626', bgColor: '#fee2e2', label: 'Pago vencido',     Icon: PaymentRoundedIcon,  desc: 'Alerta de mensualidad o cuota pendiente'        },
  comunicado_grado:        { color: '#7c3aed', bgColor: '#ede9fe', label: 'Comunicado grado', Icon: SchoolRoundedIcon,   desc: 'Comunicado por grado o paralelo específico'     },
  notificacion_individual: { color: '#059669', bgColor: '#d1fae5', label: 'Individual',       Icon: PersonRoundedIcon,   desc: 'Mensaje directo a un padre, docente o alumno'   },
};
const TIPOS_ORDEN: TipoNotificacion[] = [
  'aviso_general', 'pago_vencido', 'comunicado_grado', 'notificacion_individual',
];
const CANAL_META = {
  enviar_whatsapp: { color: '#16a34a', Icon: WhatsAppIcon,                   label: 'WhatsApp', key: 'enviar_whatsapp' as const },
  enviar_email:    { color: '#2563eb', Icon: EmailRoundedIcon,               label: 'Email',    key: 'enviar_email'    as const },
  enviar_interno:  { color: '#7c3aed', Icon: NotificationsActiveRoundedIcon, label: 'App',      key: 'enviar_interno'  as const },
};

// Audiencias que pueden tener filtros de curso (excluye individual)
const AUDIENCIAS_CON_FILTRO: AudienciaNotificacion[] = [
  'todos', 'docentes', 'padres', 'estudiantes', 'padres_estudiantes',
];

// ─── SectionHeader ────────────────────────────────────────────────────────────
const SectionHeader: React.FC<{
  icon: React.ReactNode; title: string; subtitle?: string;
  accent: string; isDark: boolean;
}> = ({ icon, title, subtitle, accent, isDark }) => (
  <Box sx={{
    px: 2.5, py: 1.8,
    borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
    bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#f8f9fa', 0.7),
    display: 'flex', alignItems: 'center', gap: 1.5,
  }}>
    <Box sx={{
      width: 32, height: 32, borderRadius: '10px', flexShrink: 0,
      bgcolor: alpha(accent, isDark ? 0.2 : 0.1),
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent,
    }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1.2 }}>{title}</Typography>
      {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
    </Box>
  </Box>
);

// ─── VistaExito ───────────────────────────────────────────────────────────────
const VistaExito: React.FC<{
  notif:       NotificacionInstitucional;
  enviada:     boolean;
  usuarioDest: Usuario | null;
  onNueva:     () => void;
  onVolver:    () => void;
  isDark:      boolean;
  gradBg:      string;
}> = ({ notif, enviada, usuarioDest, onNueva, onVolver, isDark, gradBg }) => {
  const cfg         = TIPO_CONFIG[notif.tipo];
  const TypeIcon    = cfg?.Icon ?? CampaignRoundedIcon;
  const accentColor = cfg?.color ?? '#2563eb';
  const audiencia   = AUDIENCIAS.find(a => a.value === notif.audiencia);

  const canales = [
    notif.enviar_whatsapp && CANAL_META.enviar_whatsapp,
    notif.enviar_email    && CANAL_META.enviar_email,
    notif.enviar_interno  && CANAL_META.enviar_interno,
  ].filter(Boolean) as typeof CANAL_META[keyof typeof CANAL_META][];

  return (
    <Fade in timeout={500}>
      <Box sx={{ animation: `${scaleIn} 0.4s ease-out` }}>

        {/* Banner */}
        <Box sx={{
          borderRadius: '16px', mb: 3, p: 2.5,
          background: `linear-gradient(135deg, ${alpha('#16a34a', isDark ? 0.2 : 0.08)}, ${alpha('#16a34a', isDark ? 0.06 : 0.02)})`,
          border: `1.5px solid ${alpha('#16a34a', 0.3)}`,
          display: 'flex', alignItems: 'center', gap: 2,
        }}>
          <CheckCircleRoundedIcon sx={{ color: '#16a34a', fontSize: 32, flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#16a34a', lineHeight: 1.2 }}>
              {enviada ? '¡Notificación creada y enviando!' : '¡Borrador guardado!'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {enviada ? 'El despacho corre en segundo plano.' : 'Podés enviarla desde el listado.'}
            </Typography>
          </Box>
        </Box>

        {/* Card detalle */}
        <Box sx={{
          borderRadius: '16px', overflow: 'hidden',
          border: `1.5px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07)}`,
        }}>
          <Box sx={{
            px: 2.5, py: 2.5,
            background: `linear-gradient(135deg, ${alpha(accentColor, isDark ? 0.2 : 0.1)}, ${alpha(accentColor, isDark ? 0.06 : 0.03)})`,
            borderBottom: `1.5px solid ${alpha(accentColor, 0.2)}`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Box sx={{
                width: 44, height: 44, borderRadius: '12px', flexShrink: 0,
                bgcolor: alpha(accentColor, isDark ? 0.25 : 0.18),
                border: `1.5px solid ${alpha(accentColor, 0.3)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <TypeIcon sx={{ color: accentColor, fontSize: 22 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.2, mb: 0.75 }}>
                  {notif.titulo}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Chip label={cfg?.label} size="small"
                    sx={{ bgcolor: alpha(accentColor, 0.15), color: accentColor, fontWeight: 700, fontSize: 11 }} />
                  {usuarioDest
                    ? <Chip label={`👤 ${usuarioDest.username}`} size="small"
                        sx={{ bgcolor: alpha(accentColor, 0.1), color: accentColor, fontWeight: 700, fontSize: 11 }} />
                    : <Chip label={`${audiencia?.icon} ${audiencia?.label}`} size="small"
                        sx={{ bgcolor: isDark ? alpha('#fff', 0.08) : '#f0f0f0', fontSize: 11 }} />
                  }
                  {canales.map(c => {
                    const CIcon = c.Icon;
                    return (
                      <Box key={c.key} sx={{
                        display: 'flex', alignItems: 'center', gap: 0.4,
                        px: 0.8, py: 0.25, borderRadius: '6px',
                        bgcolor: alpha(c.color, 0.1), color: c.color, fontSize: 10, fontWeight: 700,
                      }}>
                        <CIcon sx={{ fontSize: 11 }} />
                        {c.label}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          </Box>

          <Box sx={{ px: 2.5, py: 2 }}>
            <Typography variant="caption" fontWeight={800}
              sx={{ color: accentColor, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', mb: 1 }}>
              Mensaje
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{
              p: 2, borderRadius: '10px', lineHeight: 1.7, fontSize: 13, whiteSpace: 'pre-wrap',
              bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.03),
              border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
            }}>
              {notif.mensaje}
            </Typography>
          </Box>

          {notif.foto_url && (
            <Box sx={{ px: 2.5, pb: 2 }}>
              <Box component="img" src={notif.foto_url} alt="Foto"
                sx={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: '10px',
                  border: `1.5px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}` }} />
            </Box>
          )}

          <Divider sx={{ mx: 2.5, borderColor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06) }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {[
              { label: 'Código',    value: notif.codigo },
              { label: 'Estado',    value: notif.estado === 'enviando' ? '📨 Enviando…' : '💾 Borrador' },
              { label: 'Prioridad', value: PRIORIDADES.find(p => p.value === notif.prioridad)?.label ?? notif.prioridad },
              { label: 'Creado',    value: new Date(notif.created_at).toLocaleString('es-BO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
            ].map((r, i) => (
              <Box key={r.label} sx={{
                px: 2, py: 1.2,
                bgcolor: i % 2 === 0 ? (isDark ? alpha('#fff', 0.01) : alpha('#f8f9fa', 0.5)) : 'transparent',
                borderRight: i % 2 === 0 ? `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04)}` : 'none',
                borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04)}`,
              }}>
                <Typography variant="caption" color="text.disabled"
                  sx={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 600, display: 'block' }}>
                  {r.label}
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13 }}>{r.value}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <Box component="button" onClick={onVolver} sx={{
            px: 2.5, py: 1, borderRadius: '12px',
            border: `1.5px solid ${isDark ? alpha('#fff', 0.12) : alpha('#000', 0.12)}`,
            bgcolor: 'transparent', color: 'text.secondary',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
            '&:hover': { borderColor: isDark ? alpha('#fff', 0.3) : alpha('#000', 0.3) },
          }}>
            Ver todas las notificaciones
          </Box>
          <Box component="button" onClick={onNueva} sx={{
            display: 'flex', alignItems: 'center', gap: 0.8,
            px: 2.5, py: 1, borderRadius: '12px', border: 'none',
            background: gradBg, color: isDark ? '#000' : '#fff',
            fontWeight: 700, fontSize: 13, cursor: 'pointer',
            '&:hover': { opacity: 0.88, transform: 'translateY(-1px)' },
          }}>
            + Crear otra notificación
          </Box>
        </Box>
      </Box>
    </Fade>
  );
};

// ─── Página ───────────────────────────────────────────────────────────────────
export default function NuevaNotificacionPage() {
  const router = useRouter();
  const { isDark, gold, gradBg } = usePalette();
  const { crear, crearYEnviar, isSubmitting } = useNotificaciones();

  const [tipoTab,     setTipoTab]     = useState<TipoNotificacion>('aviso_general');
  const [created,     setCreated]     = useState<NotificacionInstitucional | null>(null);
  const [enviada,     setEnviada]     = useState(false);
  const [enviarAhora, setEnviarAhora] = useState(true);

  const [form, setForm] = useState<Partial<CrearNotificacionDTO>>({
    enviar_whatsapp: true,
    enviar_email:    true,
    enviar_interno:  true,
    prioridad:       'normal',
    audiencia:       undefined, // empieza sin selección
  });

  // Filtros de curso (solo para audiencias != individual)
  const [filtros, setFiltros] = useState<FiltrosAudiencia>({});

  // Usuario individual seleccionado
  const [usuarioDest, setUsuarioDest] = useState<Usuario | null>(null);

  const [foto,        setFoto]        = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const fotoRef = useRef<HTMLInputElement>(null);

  const cfg         = TIPO_CONFIG[tipoTab];
  const accentColor = cfg.color;
  const TypeIcon    = cfg.Icon;

  const set = (k: keyof CrearNotificacionDTO, v: any) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleAudienciaChange = (valor: AudienciaNotificacion) => {
    set('audiencia', valor);
    // Si cambia a individual, limpiar filtros de curso
    if (valor === 'individual') {
      setFiltros({});
    }
    // Si cambia a masivo, limpiar usuario individual
    if (valor !== 'individual') {
      set('destinatario_usuario_id', undefined);
      setUsuarioDest(null);
    }
  };

  const handleUsuarioSelect = (id: number | undefined, usuario: Usuario | null) => {
    set('destinatario_usuario_id', id);
    setUsuarioDest(usuario);
  };

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFoto(file);
    const reader = new FileReader();
    reader.onload = ev => setFotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const canSubmit =
    !!(form.titulo?.trim()) &&
    !!(form.mensaje?.trim()) &&
    !!(form.audiencia) &&
    (form.audiencia !== 'individual' || !!(form.destinatario_usuario_id));

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || isSubmitting) return;

    const data: CrearNotificacionDTO = {
      titulo:    form.titulo!,
      mensaje:   form.mensaje!,
      tipo:      tipoTab,
      prioridad: form.prioridad ?? 'normal',
      audiencia: form.audiencia!,
      // Filtros de curso desde SelectorFiltrosAudiencia
      nivel_academico_id:      filtros.nivel_academico_id,
      grado_id:                filtros.grado_id,
      paralelo_id:             filtros.paralelo_id,
      periodo_academico_id:    filtros.periodo_academico_id,
      // Usuario individual
      destinatario_usuario_id: form.destinatario_usuario_id,
      enviar_whatsapp: form.enviar_whatsapp ?? true,
      enviar_email:    form.enviar_email    ?? true,
      enviar_interno:  form.enviar_interno  ?? true,
      foto: foto ?? undefined,
    };

    if (enviarAhora) {
      const ok = await crearYEnviar(data);
      if (ok) {
        setEnviada(true);
        setTimeout(() => router.push('/dashboard/notificaciones'), 1200);
      }
    } else {
      const notif = await crear(data);
      if (notif) { setCreated(notif); setEnviada(false); }
    }
  }, [form, filtros, tipoTab, foto, enviarAhora, crear, crearYEnviar, canSubmit, isSubmitting]);

  const handleNueva = () => {
    setCreated(null); setEnviada(false); setEnviarAhora(true);
    setForm({ enviar_whatsapp: true, enviar_email: true, enviar_interno: true, prioridad: 'normal', audiencia: undefined });
    setFiltros({}); setFoto(null); setFotoPreview(null);
    setUsuarioDest(null); setTipoTab('aviso_general');
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: accentColor },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: accentColor },
  };

  // cardSx SIN overflow:hidden para que los Popovers de SelectorFiltrosAudiencia no se corten
  const cardSx = {
    borderRadius: '16px',
    border: `1.5px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07)}`,
    bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
  };

  const TipoTabs = (
    <Box sx={{ background: gradBg, borderRadius: '16px', p: 1, display: 'flex', gap: 0.5, mb: 3, overflowX: 'auto' }}>
      {TIPOS_ORDEN.map(k => {
        const c = TIPO_CONFIG[k];
        const isActive = tipoTab === k;
        return (
          <Box key={k} onClick={() => !created && setTipoTab(k)} sx={{
            flex: 1, minWidth: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8,
            px: 1.5, py: 1.2, borderRadius: '12px',
            cursor: created ? 'default' : 'pointer',
            bgcolor: isActive ? (isDark ? alpha('#000', 0.25) : alpha('#fff', 0.3)) : 'transparent',
            transition: 'background .15s',
            '&:hover': !created ? { bgcolor: isDark ? alpha('#000', 0.15) : alpha('#fff', 0.2) } : {},
          }}>
            <Typography variant="caption" fontWeight={isActive ? 800 : 600}
              sx={{ color: isDark ? '#000' : '#fff', fontSize: 13, whiteSpace: 'nowrap' }}>
              {c.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );

  // Vista éxito
  if (created) return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Fade in timeout={400}>
          <Box>
            <Box onClick={() => router.push('/dashboard/notificaciones')}
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 2,
                cursor: 'pointer', color: 'text.secondary', fontSize: 13, fontWeight: 600,
                '&:hover': { color: gold }, transition: 'color .15s',
              }}>
              <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
              Volver a notificaciones
            </Box>
            {TipoTabs}
            <VistaExito
              notif={created} enviada={enviada} usuarioDest={usuarioDest}
              onNueva={handleNueva}
              onVolver={() => router.push('/dashboard/notificaciones')}
              isDark={isDark} gradBg={gradBg}
            />
          </Box>
        </Fade>
      </Container>
    </Box>
  );

  // Formulario
  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Fade in timeout={400}>
          <Box>

            {/* Header */}
            <Box sx={{ mb: 3 }}>
              <Box onClick={() => router.push('/dashboard/notificaciones')}
                sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 2,
                  cursor: 'pointer', color: 'text.secondary', fontSize: 13, fontWeight: 600,
                  '&:hover': { color: gold }, transition: 'color .15s',
                }}>
                <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
                Volver
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <NotificationsRoundedIcon sx={{ color: gold, fontSize: 34, animation: `${bounceIcon} 1.5s ease-in-out infinite` }} />
                <Box>
                  <Typography variant="h1" sx={{
                    fontSize: { xs: '1.4rem', md: '2rem' }, fontWeight: 800,
                    background: gradBg, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>
                    Nueva Notificación
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Unidad Educativa La Voz de Cristo
                  </Typography>
                </Box>
              </Box>
            </Box>

            {TipoTabs}

            {/* Hint tipo */}
            <Box sx={{
              display: 'flex', alignItems: 'flex-start', gap: 1.2,
              p: 1.5, borderRadius: '10px', mb: 2.5,
              bgcolor: isDark ? alpha(accentColor, 0.1) : alpha(cfg.bgColor, 0.4),
              border: `1px solid ${alpha(accentColor, 0.2)}`,
              animation: `${fadeUp} 0.2s ease-out`,
            }}>
              <TypeIcon sx={{ fontSize: 16, color: accentColor, flexShrink: 0, mt: '1px' }} />
              <Box>
                <Typography variant="caption" fontWeight={700} sx={{ color: accentColor, display: 'block' }}>
                  {cfg.label}
                </Typography>
                <Typography variant="caption" sx={{ color: accentColor, opacity: 0.85 }}>
                  {cfg.desc}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, animation: `${fadeUp} 0.3s ease-out` }}>

              {/* ── BLOQUE 1: Contenido ── */}
              <Box sx={cardSx}>
                <SectionHeader
                  icon={<NotificationsRoundedIcon sx={{ fontSize: 17 }} />}
                  title="Contenido del comunicado"
                  subtitle="Título y mensaje principal"
                  accent={accentColor} isDark={isDark}
                />
                <Box sx={{ p: 2.5 }}>
                  <Stack spacing={2.5}>
                    <TextField fullWidth size="small" label="Título *"
                      placeholder="Ej: Reunión de padres — 2do Secundaria"
                      value={form.titulo ?? ''}
                      onChange={e => set('titulo', e.target.value)}
                      inputProps={{ maxLength: 200 }}
                      helperText={`${(form.titulo ?? '').length}/200`}
                      sx={inputSx}
                    />
                    <TextField fullWidth multiline rows={5} label="Mensaje *"
                      placeholder="Redactá el contenido completo del comunicado…"
                      value={form.mensaje ?? ''}
                      onChange={e => set('mensaje', e.target.value)}
                      sx={inputSx}
                    />

                    {/* Prioridad */}
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}
                        sx={{ display: 'block', mb: 1, fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                        Prioridad
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {PRIORIDADES.map(p => {
                          const sel = form.prioridad === p.value;
                          return (
                            <Box key={p.value} onClick={() => set('prioridad', p.value as PrioridadNotificacion)} sx={{
                              display: 'flex', alignItems: 'center', gap: 0.8,
                              px: 1.5, py: 0.9, borderRadius: '10px', cursor: 'pointer',
                              border: `1.5px solid ${sel ? p.color : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                              bgcolor: sel ? alpha(p.color, isDark ? 0.15 : 0.08) : 'transparent',
                              transition: 'all .15s', '&:hover': { borderColor: p.color },
                            }}>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.color, flexShrink: 0 }} />
                              <Typography variant="caption" fontWeight={sel ? 700 : 500}
                                sx={{ color: sel ? p.color : 'text.secondary', fontSize: 12 }}>
                                {p.label}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  </Stack>
                </Box>
              </Box>

              {/* ── BLOQUE 2: Audiencia ── */}
              {/* overflow visible para que los Popovers de SelectorFiltrosAudiencia no se corten */}
              <Box sx={{ ...cardSx, overflow: 'visible' }}>
                <SectionHeader
                  icon={<PeopleRoundedIcon sx={{ fontSize: 17 }} />}
                  title="Audiencia"
                  subtitle="¿Quién recibe esta notificación?"
                  accent={accentColor} isDark={isDark}
                />
                <Box sx={{ p: 2.5 }}>
                  <Stack spacing={2}>

                    {/* ── Pills de audiencia ── */}
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}
                        sx={{ display: 'block', mb: 1.2, fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                        Destinatarios
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 1 }}>
                        {AUDIENCIAS.map(a => {
                          const sel = form.audiencia === a.value;
                          return (
                            <Box key={a.value}
                              onClick={() => handleAudienciaChange(a.value as AudienciaNotificacion)}
                              sx={{
                                p: 1.3, borderRadius: '12px', cursor: 'pointer',
                                border: `1.5px solid ${sel ? accentColor : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                                bgcolor: sel ? alpha(accentColor, isDark ? 0.15 : 0.07) : 'transparent',
                                transition: 'all .15s',
                                '&:hover': { borderColor: accentColor, bgcolor: alpha(accentColor, 0.05) },
                              }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
                                <Typography sx={{ fontSize: 18, lineHeight: 1 }}>{a.icon}</Typography>
                                <Typography variant="caption" fontWeight={sel ? 800 : 600}
                                  sx={{ color: sel ? accentColor : 'text.primary', fontSize: 12 }}>
                                  {a.label}
                                </Typography>
                                {sel && <CheckCircleRoundedIcon sx={{ fontSize: 13, color: accentColor, ml: 'auto' }} />}
                              </Box>
                              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, lineHeight: 1.3 }}>
                                {a.descripcion}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>

                    {/* ── Filtros de curso — aparece solo con audiencia masiva ── */}
                    <Collapse
                      in={!!(form.audiencia) && AUDIENCIAS_CON_FILTRO.includes(form.audiencia as AudienciaNotificacion)}
                      timeout={280}
                    >
                      <Box sx={{
                        mt: 0.5, p: 2, borderRadius: '12px',
                        border: `1.5px solid ${isDark ? alpha(accentColor, 0.2) : alpha(accentColor, 0.15)}`,
                        bgcolor: isDark ? alpha(accentColor, 0.04) : alpha(cfg.bgColor, 0.15),
                        animation: `${fadeUp} 0.25s ease-out`,
                      }}>
                        <SelectorFiltrosAudiencia
                          value={filtros}
                          onChange={setFiltros}
                          accentColor={accentColor}
                          audiencia={form.audiencia ?? ''}
                        />
                      </Box>
                    </Collapse>

                    {/* ── Selector usuario individual ── */}
                    <Collapse in={form.audiencia === 'individual'} timeout={280}>
                      <Box sx={{
                        mt: 0.5, p: 2, borderRadius: '12px',
                        border: `1.5px solid ${alpha(accentColor, 0.25)}`,
                        bgcolor: isDark ? alpha(accentColor, 0.05) : alpha(cfg.bgColor, 0.2),
                        animation: `${fadeUp} 0.25s ease-out`,
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                          <PersonRoundedIcon sx={{ fontSize: 14, color: accentColor }} />
                          <Typography variant="caption" fontWeight={800}
                            sx={{ color: accentColor, fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                            Destinatario específico
                          </Typography>
                          <Chip label="Requerido" size="small" sx={{
                            fontSize: 9, height: 16,
                            bgcolor: alpha('#dc2626', 0.12), color: '#dc2626', fontWeight: 700, ml: 0.5,
                          }} />
                        </Box>
                        <SelectorUsuario
                          value={form.destinatario_usuario_id}
                          onChange={handleUsuarioSelect}
                          accentColor={accentColor}
                        />
                        {!form.destinatario_usuario_id && (
                          <Typography variant="caption" color="text.disabled"
                            sx={{ display: 'block', mt: 1, fontSize: 11 }}>
                            Elegí el tipo de persona y luego buscá por nombre o email.
                          </Typography>
                        )}
                      </Box>
                    </Collapse>

                    {/* Placeholder si no hay audiencia todavía */}
                    {!form.audiencia && (
                      <Box sx={{
                        p: 2, borderRadius: '12px', textAlign: 'center',
                        border: `1.5px dashed ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                        color: 'text.disabled',
                      }}>
                        <FilterAltRoundedIcon sx={{ fontSize: 22, mb: 0.5, opacity: 0.4 }} />
                        <Typography variant="caption" sx={{ display: 'block', fontSize: 12 }}>
                          Seleccioná una audiencia para ver las opciones de filtro
                        </Typography>
                      </Box>
                    )}

                  </Stack>
                </Box>
              </Box>

              {/* ── BLOQUE 3: Canales ── */}
              <Box sx={cardSx}>
                <SectionHeader
                  icon={<TuneRoundedIcon sx={{ fontSize: 17 }} />}
                  title="Canales de envío"
                  subtitle="Seleccioná por dónde se entrega el mensaje"
                  accent={accentColor} isDark={isDark}
                />
                <Box sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap' }}>
                    {Object.values(CANAL_META).map(c => {
                      const CIcon = c.Icon;
                      const activo = form[c.key] as boolean;
                      return (
                        <Box key={c.key} onClick={() => set(c.key, !activo)} sx={{
                          flex: 1, minWidth: 120,
                          display: 'flex', alignItems: 'center', gap: 1,
                          px: 1.5, py: 1.2, borderRadius: '12px', cursor: 'pointer',
                          border: `1.5px solid ${activo ? c.color : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                          bgcolor: activo ? alpha(c.color, isDark ? 0.15 : 0.08) : 'transparent',
                          transition: 'all .15s', userSelect: 'none',
                          '&:hover': { borderColor: c.color },
                        }}>
                          <CIcon sx={{ fontSize: 18, color: activo ? c.color : 'text.disabled' }} />
                          <Typography variant="caption" fontWeight={activo ? 700 : 500}
                            sx={{ color: activo ? c.color : 'text.secondary', flex: 1, fontSize: 12 }}>
                            {c.label}
                          </Typography>
                          {activo && <CheckCircleRoundedIcon sx={{ fontSize: 14, color: c.color }} />}
                        </Box>
                      );
                    })}
                  </Box>
                  {(!form.enviar_whatsapp && !form.enviar_email && !form.enviar_interno) && (
                    <Box sx={{
                      display: 'flex', alignItems: 'center', gap: 1, mt: 1.5,
                      p: 1.2, borderRadius: '8px',
                      bgcolor: alpha('#dc2626', 0.08), border: `1px solid ${alpha('#dc2626', 0.2)}`,
                    }}>
                      <PriorityHighRoundedIcon sx={{ fontSize: 14, color: '#dc2626' }} />
                      <Typography variant="caption" sx={{ color: '#dc2626', fontSize: 11, fontWeight: 600 }}>
                        Activá al menos un canal de envío
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* ── BLOQUE 4: Imagen ── */}
              <Box sx={cardSx}>
                <SectionHeader
                  icon={<ImageRoundedIcon sx={{ fontSize: 17 }} />}
                  title="Imagen adjunta"
                  subtitle="Opcional — se mostrará en WhatsApp y en la bandeja interna"
                  accent={accentColor} isDark={isDark}
                />
                <Box sx={{ p: 2.5 }}>
                  <input ref={fotoRef} type="file" accept="image/*" hidden onChange={handleFoto} />
                  {fotoPreview ? (
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <Box component="img" src={fotoPreview}
                        sx={{ height: 80, width: 'auto', maxWidth: 140, borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={700} sx={{ color: accentColor, mb: 0.3 }}>
                          {foto?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {foto ? `${(foto.size / 1024).toFixed(1)} KB` : ''}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Box component="button" onClick={() => fotoRef.current?.click()} sx={{
                            px: 1.5, py: 0.5, borderRadius: '8px',
                            border: `1px solid ${alpha(accentColor, 0.3)}`,
                            bgcolor: alpha(accentColor, 0.08), color: accentColor,
                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          }}>
                            Cambiar
                          </Box>
                          <Box component="button" onClick={() => { setFoto(null); setFotoPreview(null); }} sx={{
                            px: 1.5, py: 0.5, borderRadius: '8px',
                            border: `1px solid ${alpha('#dc2626', 0.3)}`,
                            bgcolor: 'transparent', color: '#dc2626',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          }}>
                            Quitar
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  ) : (
                    <Box onClick={() => fotoRef.current?.click()} sx={{
                      p: 3, borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                      border: `2px dashed ${isDark ? alpha('#fff', 0.12) : alpha('#000', 0.12)}`,
                      bgcolor: isDark ? alpha('#fff', 0.02) : '#fafafa',
                      transition: 'border-color .15s, background .15s',
                      '&:hover': { borderColor: accentColor, bgcolor: alpha(accentColor, 0.04) },
                    }}>
                      <ImageRoundedIcon sx={{ fontSize: 28, color: 'text.disabled', mb: 0.5 }} />
                      <Typography variant="body2" fontWeight={600} color="text.secondary">
                        Hacer clic para agregar imagen
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        JPG, PNG, WEBP · Máximo 5MB
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* ── Toggle ── */}
              <Box sx={{
                p: 2, borderRadius: '14px',
                bgcolor: isDark ? alpha('#fff', 0.03) : '#f8f9fa',
                border: `1.5px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
              }}>
                <FormControlLabel
                  control={
                    <Switch checked={enviarAhora} onChange={e => setEnviarAhora(e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: accentColor },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: accentColor },
                      }} />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={700}>
                        {enviarAhora ? '📨 Enviar inmediatamente al crear' : '💾 Guardar como borrador'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {enviarAhora
                          ? 'Se despachará a todos los destinatarios en cuanto confirmes'
                          : 'Podés revisar y enviar después desde el listado'}
                      </Typography>
                    </Box>
                  }
                />
              </Box>

              {/* ── Botones ── */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pb: 4, flexWrap: 'wrap' }}>
                <Box component="button"
                  onClick={() => router.push('/dashboard/notificaciones')}
                  sx={{
                    px: 2.5, py: 1.1, borderRadius: '12px',
                    border: `1.5px solid ${isDark ? alpha('#fff', 0.12) : alpha('#000', 0.12)}`,
                    bgcolor: 'transparent', color: 'text.secondary',
                    fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    '&:hover': { borderColor: isDark ? alpha('#fff', 0.3) : alpha('#000', 0.3) },
                  }}>
                  Cancelar
                </Box>
                <Box component="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    px: 3, py: 1.2, borderRadius: '12px', border: 'none',
                    background: canSubmit ? gradBg : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08),
                    color: canSubmit ? (isDark ? '#000' : '#fff') : 'text.disabled',
                    fontWeight: 700, fontSize: 14,
                    cursor: (!canSubmit || isSubmitting) ? 'default' : 'pointer',
                    transition: 'opacity .15s, transform .15s',
                    '&:hover': {
                      opacity:   (!canSubmit || isSubmitting) ? 1 : 0.88,
                      transform: (!canSubmit || isSubmitting) ? 'none' : 'translateY(-1px)',
                    },
                  }}>
                  {isSubmitting
                    ? <><CircularProgress size={16} sx={{ color: isDark ? '#000' : '#fff' }} /> Procesando…</>
                    : enviarAhora
                      ? <><SendRoundedIcon sx={{ fontSize: 18 }} /> Crear y enviar</>
                      : <><SaveRoundedIcon sx={{ fontSize: 18 }} /> Guardar borrador</>
                  }
                </Box>
              </Box>

            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}