'use client';
// app/dashboard/admin/permisos/page.tsx
import React, { useState } from 'react';
import {
  Box, Container, Typography, useTheme, alpha,
  Fade, Tab, Tabs,
} from '@mui/material';
import { keyframes } from '@mui/system';

import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import ShieldRoundedIcon   from '@mui/icons-material/ShieldRounded';
import GroupRoundedIcon    from '@mui/icons-material/GroupRounded';
import KeyRoundedIcon      from '@mui/icons-material/KeyRounded';

import { RolesTab }    from '@/components/roles/RolesTab';
import { PermisosTab } from '@/components/roles/PermisosTab';
import { useRoles }    from '@/hooks/usePermisos';
import {
  Rol, getModuloConfig,
} from '@/types/permisosTypes';
import {
  Chip, IconButton, LinearProgress, Alert,
  Avatar, alpha as muiAlpha, Tooltip,
} from '@mui/material';
import LockRoundedIcon    from '@mui/icons-material/LockRounded';
import PersonRoundedIcon  from '@mui/icons-material/PersonRounded';
import VpnKeyRoundedIcon  from '@mui/icons-material/VpnKeyRounded';

// ── Animaciones ───────────────────────────────────────────────────────────────
const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-5px); }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────
const ROL_COLORS: Record<string, string> = {
  superadmin:    '#ef4444',
  administrador: '#3b82f6',
  docente:       '#10b981',
  secretaria:    '#f59e0b',
  padre_familia: '#8b5cf6',
};

function RolAvatarSimple({ rol, size = 40 }: { rol: Rol; size?: number }) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const color  = ROL_COLORS[rol.nombre] ?? '#6b7280';
  return (
    <Avatar sx={{
      width: size, height: size,
      fontSize: size * 0.4,
      bgcolor: alpha(color, isDark ? 0.2 : 0.12),
      color,
      border: `1.5px solid ${alpha(color, 0.3)}`,
      fontWeight: 800,
      borderRadius: `${size * 0.28}px`,
    }}>
      {rol.nombre.charAt(0).toUpperCase()}
    </Avatar>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function PermisosPage() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Paleta igual a Pagos.tsx
  const accent    = isDark ? '#facc15' : '#0288d1';
  const accentEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg    = `linear-gradient(135deg, ${accent} 0%, ${accentEnd} 100%)`;
  const tabColor  = isDark ? '#000' : '#fff';

  const [activeTab, setActiveTab] = useState(0);

  // Para el tab Usuarios
  const rolesHook = useRoles();

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 2, md: 0 },
              mb: 3,
            }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <SecurityRoundedIcon sx={{
                    color: accent,
                    fontSize: 36,
                    animation: `${bounce} 1.5s infinite`,
                  }} />
                  <Typography variant="h1" sx={{
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                    fontWeight: 800,
                    background: gradBg,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    Gestión de Accesos
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, letterSpacing: 0.3, mt: 0.3 }}>
                  Administrá roles, permisos y asignación de usuarios del sistema.
                </Typography>
              </Box>
            </Box>

            {/* Tabs — mismo estilo que Pagos.tsx */}
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                background: gradBg,
                borderRadius: '16px',
                p: 1,
                '& .MuiTab-root': {
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 48,
                  color: isDark ? alpha('#000', 0.7) : alpha('#fff', 0.75),
                  fontSize: { xs: '0.75rem', md: '0.875rem' },
                  transition: 'all 0.2s',
                },
                '& .Mui-selected': {
                  color: `${tabColor} !important`,
                  fontWeight: 700,
                  bgcolor: alpha(isDark ? '#fff' : '#000', 0.15),
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: tabColor,
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab
                icon={<ShieldRoundedIcon sx={{ fontSize: 18 }} />}
                iconPosition="start"
                label="Roles"
              />
              <Tab
                icon={<KeyRoundedIcon sx={{ fontSize: 18 }} />}
                iconPosition="start"
                label="Permisos"
              />
              <Tab
                icon={<GroupRoundedIcon sx={{ fontSize: 18 }} />}
                iconPosition="start"
                label="Usuarios › Roles"
              />
            </Tabs>
          </Box>
        </Fade>

        {/* ── Tab: Roles ──────────────────────────────────────────────────── */}
        {activeTab === 0 && (
          <Fade in timeout={400}>
            <Box>
              <RolesTab />
            </Box>
          </Fade>
        )}

        {/* ── Tab: Permisos ───────────────────────────────────────────────── */}
        {activeTab === 1 && (
          <Fade in timeout={400}>
            <Box>
              <PermisosTab />
            </Box>
          </Fade>
        )}

        {/* ── Tab: Usuarios › Roles ───────────────────────────────────────── */}
        {activeTab === 2 && (
          <Fade in timeout={400}>
            <Box>
              <Alert severity="info" sx={{ borderRadius: '14px', mb: 3 }}>
                Seleccioná un usuario desde el módulo de Usuarios para asignarle roles.
                Aquí podés ver el resumen de asignaciones actuales.
              </Alert>

              {rolesHook.isLoading && (
                <LinearProgress sx={{
                  borderRadius: 4, height: 2, mb: 2,
                  bgcolor: alpha(accent, 0.12),
                  '& .MuiLinearProgress-bar': { bgcolor: accent },
                }} />
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {rolesHook.roles.map((rol, i) => (
                  <Box
                    key={rol.id}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 2,
                      p: 2, borderRadius: '16px',
                      border: `1.5px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
                      bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                      boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
                      animation: `${fadeUp} 0.3s ease-out ${i * 0.05}s both`,
                    }}
                  >
                    <RolAvatarSimple rol={rol} size={44} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Typography variant="body2" fontWeight={700} noWrap>
                          {rol.nombre}
                        </Typography>
                        {rol.es_sistema && (
                          <Tooltip title="Rol de sistema">
                            <LockRoundedIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                          </Tooltip>
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: 12 }}>
                        {rol.descripcion ?? 'Sin descripción'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                      <Chip
                        icon={<PersonRoundedIcon sx={{ fontSize: '12px !important', ml: '6px !important' }} />}
                        label={`${rol.total_usuarios ?? 0} usuarios`}
                        size="small"
                        sx={{
                          height: 24, fontSize: 11, fontWeight: 700,
                          bgcolor: isDark ? alpha('#fff', 0.07) : alpha('#000', 0.05),
                          color: 'text.secondary',
                        }}
                      />
                      <Chip
                        icon={<VpnKeyRoundedIcon sx={{ fontSize: '11px !important', ml: '6px !important' }} />}
                        label={`${rol.total_permisos ?? 0} permisos`}
                        size="small"
                        sx={{
                          height: 24, fontSize: 11, fontWeight: 700,
                          bgcolor: alpha(accent, isDark ? 0.15 : 0.1),
                          color: accent,
                          '& .MuiChip-icon': { color: accent },
                        }}
                      />
                    </Box>
                  </Box>
                ))}

                {!rolesHook.isLoading && rolesHook.roles.length === 0 && (
                  <Alert severity="info" sx={{ borderRadius: '14px' }}>
                    No hay roles en el sistema.
                  </Alert>
                )}
              </Box>
            </Box>
          </Fade>
        )}

      </Container>
    </Box>
  );
}