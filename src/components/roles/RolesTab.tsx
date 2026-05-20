'use client';
// components/roles/RolesTab.tsx
import React, { useState, useCallback } from 'react';
import {
  Box, Typography, TextField, Button, InputAdornment,
  LinearProgress, Alert, alpha, useTheme, Fade,
  Chip, Tooltip,
} from '@mui/material';
import SearchRoundedIcon   from '@mui/icons-material/SearchRounded';
import AddRoundedIcon      from '@mui/icons-material/AddRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import LockRoundedIcon     from '@mui/icons-material/LockRounded';

import { useRoles, useRolPermisos } from '@/hooks/usePermisos';
import { Rol } from '@/types/permisosTypes';

import { RolCard }           from './RolCard';
import { MatrixPanel }       from './MatrixPanel';
import { RolFormModal }      from './RolFormModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

// Animación
const fadeUpStyle = (delay: number) => ({
  opacity: 0,
  animation: `fadeUp 0.3s ease-out ${delay}s forwards`,
  '@keyframes fadeUp': {
    from: { opacity: 0, transform: 'translateY(8px)' },
    to:   { opacity: 1, transform: 'translateY(0)' },
  },
});

export function RolesTab() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent    = isDark ? '#818cf8' : '#4f46e5';
  const accentEnd = isDark ? '#c084fc' : '#7c3aed';

  // ── Estado UI ──────────────────────────────────────────────────────────────
  const [search,         setSearch]         = useState('');
  const [soloSistema,    setSoloSistema]    = useState<boolean | undefined>(undefined);
  const [rolSeleccionado, setRolSeleccionado] = useState<Rol | null>(null);

  // Modales
  const [formModal,    setFormModal]    = useState<{ open: boolean; rol?: Rol }>({ open: false });
  const [deleteModal,  setDeleteModal]  = useState<{ open: boolean; rol?: Rol }>({ open: false });

  // ── Hooks de datos ─────────────────────────────────────────────────────────
  const rolesHook  = useRoles({ search, es_sistema: soloSistema });
  const matrixHook = useRolPermisos(rolSeleccionado?.id ?? null);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSelect = useCallback((rol: Rol) => {
    setRolSeleccionado(prev => prev?.id === rol.id ? null : rol);
  }, []);

  const handleEdit = useCallback((rol: Rol) => {
    setFormModal({ open: true, rol });
  }, []);

  const handleDelete = useCallback((rol: Rol) => {
    setDeleteModal({ open: true, rol });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteModal.rol) return;
    const ok = await rolesHook.eliminar(deleteModal.rol.id);
    if (ok) {
      setDeleteModal({ open: false });
      if (rolSeleccionado?.id === deleteModal.rol.id) setRolSeleccionado(null);
    }
  }, [deleteModal.rol, rolesHook, rolSeleccionado]);

  const handleCloseMatrix = useCallback(() => {
    setRolSeleccionado(null);
  }, []);

  // ── Stats rápidas ──────────────────────────────────────────────────────────
  const totalRoles   = rolesHook.total;
  const rolesSistema = rolesHook.roles.filter(r => r.es_sistema).length;
  const rolesCustom  = rolesHook.roles.filter(r => !r.es_sistema).length;

  return (
    <Box>
      {/* ── Stats cards ───────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Total roles',   value: totalRoles,   color: accent       },
          { label: 'De sistema',    value: rolesSistema, color: '#6b7280'    },
          { label: 'Personalizados', value: rolesCustom, color: '#10b981'    },
        ].map((s, i) => (
          <Box
            key={s.label}
            sx={{
              px: 2.5, py: 1.5,
              borderRadius: '14px',
              border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
              bgcolor: isDark ? alpha('#fff', 0.025) : '#fff',
              display: 'flex', alignItems: 'center', gap: 1.5,
              ...fadeUpStyle(i * 0.05),
            }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: 22, color: s.color, lineHeight: 1 }}>
              {s.value}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
              {s.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* ── Layout: lista + panel ─────────────────────────────────────── */}
      <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>

        {/* Lista de roles */}
        <Box sx={{ flex: 1, minWidth: 0 }}>

          {/* Toolbar */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Buscar rol…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                flex: 1, maxWidth: 280,
                '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: 13 },
              }}
            />

            {/* Filtro sistema / custom */}
            <Box sx={{ display: 'flex', gap: 0.8 }}>
              {[
                { label: 'Todos',      value: undefined,  icon: null },
                { label: 'Sistema',    value: true,       icon: <LockRoundedIcon sx={{ fontSize: 12 }} /> },
                { label: 'Propios',    value: false,      icon: null },
              ].map(f => {
                const active = soloSistema === f.value;
                return (
                  <Chip
                    key={String(f.value)}
                    label={f.label}
                    icon={f.icon ?? undefined}
                    size="small"
                    onClick={() => setSoloSistema(f.value)}
                    sx={{
                      height: 30, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      bgcolor: active
                        ? alpha(accent, isDark ? 0.2 : 0.1)
                        : isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05),
                      color: active ? accent : 'text.secondary',
                      border: active ? `1px solid ${alpha(accent, 0.3)}` : '1px solid transparent',
                      '&:hover': { bgcolor: alpha(accent, isDark ? 0.15 : 0.08) },
                    }}
                  />
                );
              })}
            </Box>

            <Box sx={{ flex: 1 }} />

            <Button
              variant="contained"
              startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
              onClick={() => setFormModal({ open: true })}
              size="small"
              sx={{
                borderRadius: '12px', fontWeight: 700, fontSize: 13, height: 36,
                background: `linear-gradient(135deg, ${accent} 0%, ${accentEnd} 100%)`,
                boxShadow: 'none', px: 2,
                '&:hover': { boxShadow: `0 4px 14px ${alpha(accent, 0.35)}` },
              }}
            >
              Nuevo rol
            </Button>
          </Box>

          {rolesHook.isLoading && (
            <LinearProgress sx={{ borderRadius: 4, height: 2, mb: 2, bgcolor: alpha(accent, 0.12),
              '& .MuiLinearProgress-bar': { bgcolor: accent },
            }} />
          )}

          {/* Cards */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {rolesHook.roles.map((rol, i) => (
              <Box key={rol.id} sx={fadeUpStyle(i * 0.04)}>
                <RolCard
                  rol={rol}
                  isSelected={rolSeleccionado?.id === rol.id}
                  onSelect={handleSelect}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  index={i}
                />
              </Box>
            ))}

            {!rolesHook.isLoading && rolesHook.roles.length === 0 && (
              <Fade in>
                <Alert
                  severity="info"
                  sx={{ borderRadius: '14px', mt: 1 }}
                >
                  {search
                    ? `Sin resultados para "${search}"`
                    : 'No hay roles creados todavía.'
                  }
                </Alert>
              </Fade>
            )}
          </Box>

          {/* Hint: click para ver permisos */}
          {rolesHook.roles.length > 0 && !rolSeleccionado && (
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ mt: 2, display: 'block', textAlign: 'center', fontSize: 11 }}
            >
              Hacé clic en un rol para gestionar sus permisos →
            </Typography>
          )}
        </Box>

        {/* Panel lateral de permisos */}
        {rolSeleccionado && (
          <Fade in timeout={250}>
            <Box sx={{ width: 480, flexShrink: 0, height: 'calc(100vh - 280px)', position: 'sticky', top: 20 }}>
              <MatrixPanel
                rol={rolSeleccionado}
                hook={matrixHook}
                onClose={handleCloseMatrix}
              />
            </Box>
          </Fade>
        )}
      </Box>

      {/* ── Modales ───────────────────────────────────────────────────── */}
      <RolFormModal
        open={formModal.open}
        rol={formModal.rol}
        isSubmitting={rolesHook.isSubmitting}
        onClose={() => setFormModal({ open: false })}
        onCreate={rolesHook.crear}
        onUpdate={rolesHook.actualizar}
      />

      <ConfirmDeleteModal
        open={deleteModal.open}
        rol={deleteModal.rol}
        isSubmitting={rolesHook.isSubmitting}
        onClose={() => setDeleteModal({ open: false })}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}