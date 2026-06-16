// pages/ConfiguracionPage.tsx
'use client';
import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, useTheme, Fade,
  keyframes, alpha, Avatar, Chip, Divider, CircularProgress,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Devices as DevicesIcon,
  Timeline as TimelineIcon,
  VerifiedUser as VerifiedIcon,
  CheckCircle as CheckIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import PerfilTab from '@/components/configuracion/PerfilTab';
import PasswordTab from '@/components/configuracion/PasswordTab';
import SesionesTab from '@/components/configuracion/SesionesTab';
import ActividadTab from '@/components/configuracion/ActividadTab';
import configuracionService, { Perfil } from '@/services/configuracionService';

const bounce = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-5px) rotate(5deg); }
`;

const fadeSlideIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const NAV_ITEMS = [
  { label: 'Perfil',       icon: PersonIcon,  desc: 'Datos de tu cuenta'     },
  { label: 'Contraseña',   icon: LockIcon,    desc: 'Seguridad y acceso'     },
  { label: 'Sesiones',     icon: DevicesIcon, desc: 'Dispositivos conectados' },
  { label: 'Actividad',    icon: TimelineIcon,desc: 'Historial de acciones'  },
];

export default function ConfiguracionPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [activeTab, setActiveTab] = useState(0);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loadingPerfil, setLoadingPerfil] = useState(true);

  const accent   = isDark ? '#facc15' : '#0288d1';
  const accentBg = isDark ? alpha('#facc15', 0.08) : alpha('#0288d1', 0.08);
  const border   = isDark ? alpha('#ffffff', 0.08) : alpha('#000000', 0.07);
  const surface  = isDark ? alpha('#ffffff', 0.03) : alpha('#000000', 0.02);

  useEffect(() => {
    configuracionService.obtenerPerfil()
      .then(setPerfil)
      .catch(console.error)
      .finally(() => setLoadingPerfil(false));
  }, []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });

  const formatRelative = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (m < 1)   return 'Ahora mismo';
    if (m < 60)  return `Hace ${m} min`;
    if (h < 24)  return `Hace ${h}h`;
    if (days < 7) return `Hace ${days}d`;
    return formatDate(d);
  };

  const ActiveIcon = NAV_ITEMS[activeTab].icon;

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">

        {/* ── HEADER ── */}
        <Fade in timeout={400}>
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <SettingsIcon sx={{ color: accent, fontSize: 36, animation: `${bounce} 2s ease-in-out infinite` }} />
            <Box>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '1.6rem', md: '2.4rem' },
                  fontWeight: 800,
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15, #f59e0b)'
                    : 'linear-gradient(135deg, #0288d1, #01579b)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.1,
                }}
              >
                Configuración
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Administra tu perfil, seguridad y preferencias
              </Typography>
            </Box>
          </Box>
        </Fade>

        {/* ── 2-COLUMN LAYOUT ── */}
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', flexDirection: { xs: 'column', lg: 'row' } }}>

          {/* ══ LEFT COLUMN ══ */}
          <Box sx={{ width: { xs: '100%', lg: 280 }, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Profile card */}
            <Box
              sx={{
                borderRadius: 3,
                border: `1px solid ${isDark ? alpha('#facc15', 0.2) : alpha('#0288d1', 0.2)}`,
                background: isDark
                  ? `linear-gradient(160deg, ${alpha('#facc15', 0.07)} 0%, ${alpha('#1a1a2e', 0.6)} 100%)`
                  : `linear-gradient(160deg, ${alpha('#0288d1', 0.07)} 0%, ${alpha('#f0f7ff', 0.8)} 100%)`,
                p: 2.5,
                animation: `${fadeSlideIn} 0.5s ease both`,
              }}
            >
              {loadingPerfil ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={36} sx={{ color: accent }} />
                </Box>
              ) : perfil ? (
                <>
                  {/* Avatar + nombre */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2.5 }}>
                    <Avatar
                      sx={{
                        width: 72, height: 72,
                        fontSize: '1.8rem', fontWeight: 700,
                        background: isDark
                          ? 'linear-gradient(135deg, #facc15, #f59e0b)'
                          : 'linear-gradient(135deg, #0288d1, #01579b)',
                        color: isDark ? '#000' : '#fff',
                        border: `3px solid ${isDark ? alpha('#facc15', 0.35) : alpha('#0288d1', 0.35)}`,
                        mb: 1.5,
                        boxShadow: `0 8px 24px ${alpha(accent, 0.25)}`,
                      }}
                    >
                      {perfil.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="h6" fontWeight={700} textAlign="center" sx={{ lineHeight: 1.2 }}>
                      {perfil.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 0.3 }}>
                      {perfil.email}
                    </Typography>
                    {perfil.verificado && (
                      <Chip
                        icon={<VerifiedIcon sx={{ fontSize: '14px !important', color: `${isDark ? '#000' : '#fff'} !important` }} />}
                        label="Verificado"
                        size="small"
                        sx={{
                          mt: 1,
                          background: isDark
                            ? 'linear-gradient(135deg, #facc15, #f59e0b)'
                            : 'linear-gradient(135deg, #0288d1, #01579b)',
                          color: isDark ? '#000' : '#fff',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                        }}
                      />
                    )}
                  </Box>

                  <Divider sx={{ borderColor: border, mb: 2 }} />

                  {/* Stats grid */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
                    {[
                      { label: 'Estado',    value: perfil.activo ? 'Activa' : 'Inactiva', color: perfil.activo ? '#10b981' : '#ef4444' },
                      { label: 'Roles',     value: perfil.roles?.length ?? 0,              color: accent },
                    ].map((s) => (
                      <Box key={s.label} sx={{ background: surface, border: `1px solid ${border}`, borderRadius: 2, p: 1.5, textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>
                          {s.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Meta info */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {perfil.ultimo_acceso && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, background: accentBg, border: `1px solid ${alpha(accent, 0.2)}`, borderRadius: 2, p: 1.2 }}>
                        <AccessTimeIcon sx={{ fontSize: 15, color: accent, flexShrink: 0 }} />
                        <Box>
                          <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', lineHeight: 1 }}>Último acceso</Typography>
                          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: accent }}>{formatRelative(perfil.ultimo_acceso)}</Typography>
                        </Box>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, background: surface, border: `1px solid ${border}`, borderRadius: 2, p: 1.2 }}>
                      <CalendarIcon sx={{ fontSize: 15, color: 'text.secondary', flexShrink: 0 }} />
                      <Box>
                        <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', lineHeight: 1 }}>Miembro desde</Typography>
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 600 }}>{formatDate(perfil.created_at)}</Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Roles */}
                  {perfil.roles?.length > 0 && (
                    <>
                      <Divider sx={{ borderColor: border, my: 2 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                        Roles asignados
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                        {perfil.roles.map((r) => (
                          <Chip
                            key={r.id}
                            label={r.nombre}
                            size="small"
                            sx={{
                              background: accentBg,
                              color: accent,
                              border: `1px solid ${alpha(accent, 0.25)}`,
                              fontWeight: 600,
                              fontSize: '0.7rem',
                            }}
                          />
                        ))}
                      </Box>
                    </>
                  )}
                </>
              ) : null}
            </Box>

            {/* Nav menu */}
            <Box
              sx={{
                borderRadius: 3,
                border: `1px solid ${border}`,
                overflow: 'hidden',
                animation: `${fadeSlideIn} 0.6s ease both`,
              }}
            >
              {NAV_ITEMS.map((item, i) => {
                const Icon = item.icon;
                const isActive = activeTab === i;
                return (
                  <Box
                    key={item.label}
                    onClick={() => setActiveTab(i)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 2,
                      py: 1.5,
                      cursor: 'pointer',
                      borderLeft: `3px solid ${isActive ? accent : 'transparent'}`,
                      background: isActive ? accentBg : 'transparent',
                      borderBottom: i < NAV_ITEMS.length - 1 ? `1px solid ${border}` : 'none',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: isActive ? accentBg : (isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02)),
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 34, height: 34, borderRadius: 1.5,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isActive ? (isDark ? alpha('#facc15', 0.2) : alpha('#0288d1', 0.15)) : surface,
                        border: `1px solid ${isActive ? alpha(accent, 0.3) : border}`,
                        transition: 'all 0.2s',
                        flexShrink: 0,
                      }}
                    >
                      <Icon sx={{ fontSize: 17, color: isActive ? accent : 'text.secondary' }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: isActive ? 700 : 500, color: isActive ? accent : 'text.primary', lineHeight: 1.2 }}>
                        {item.label}
                      </Typography>
                      <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', lineHeight: 1 }}>
                        {item.desc}
                      </Typography>
                    </Box>
                    {isActive && (
                      <Box sx={{ ml: 'auto', width: 6, height: 6, borderRadius: '50%', background: accent, flexShrink: 0 }} />
                    )}
                  </Box>
                );
              })}
            </Box>

          </Box>

          {/* ══ RIGHT COLUMN ══ */}
          <Box sx={{ flex: 1, minWidth: 0, animation: `${fadeSlideIn} 0.55s ease both` }}>

            {/* Section header */}
            <Box
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                mb: 3, pb: 2,
                borderBottom: `1px solid ${border}`,
              }}
            >
              <Box
                sx={{
                  width: 38, height: 38, borderRadius: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15, #f59e0b)'
                    : 'linear-gradient(135deg, #0288d1, #01579b)',
                }}
              >
                <ActiveIcon sx={{ fontSize: 20, color: isDark ? '#000' : '#fff' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                  {NAV_ITEMS[activeTab].label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {NAV_ITEMS[activeTab].desc}
                </Typography>
              </Box>
            </Box>

            {/* Tab content */}
            <Fade in key={activeTab} timeout={300}>
              <Box>
                {activeTab === 0 && <PerfilTab />}
                {activeTab === 1 && <PasswordTab />}
                {activeTab === 2 && <SesionesTab />}
                {activeTab === 3 && <ActividadTab />}
              </Box>
            </Fade>

          </Box>
        </Box>
      </Container>
    </Box>
  );
}