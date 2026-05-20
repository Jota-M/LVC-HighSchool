'use client';
// components/permisos/PermisosTab.tsx
import React, { useState, useCallback } from 'react';
import {
  Box, Typography, TextField, Button, InputAdornment,
  LinearProgress, Alert, alpha, useTheme, Fade,
  Chip, IconButton, Tooltip,
} from '@mui/material';
import SearchRoundedIcon  from '@mui/icons-material/SearchRounded';
import AddRoundedIcon     from '@mui/icons-material/AddRounded';
import EditRoundedIcon    from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon  from '@mui/icons-material/DeleteRounded';

import { usePermisos }       from '@/hooks/usePermisos';
import { Permiso, getModuloConfig, getAccionConfig } from '@/types/permisosTypes';
import { PermisoFormModal }  from './PermisoFormModal';

// ── Confirm inline ────────────────────────────────────────────────────────────
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress,
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

function ConfirmDeletePermisoModal({
  open, permiso, isSubmitting, onClose, onConfirm,
}: {
  open: boolean;
  permiso?: Permiso | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  if (!permiso) return null;
  const accionCfg = getAccionConfig(permiso.accion);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          border: `1px solid ${isDark ? alpha('#ef4444', 0.2) : alpha('#ef4444', 0.15)}`,
          bgcolor: isDark ? '#140a0a' : '#fff',
          overflow: 'hidden',
        },
      }}
    >
      <Box sx={{ height: 4, bgcolor: '#ef4444' }} />
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3, py: 2.5 }}>
          <Box sx={{ width: 38, height: 38, borderRadius: '12px', bgcolor: alpha('#ef4444', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <WarningAmberRoundedIcon sx={{ fontSize: 20, color: '#ef4444' }} />
          </Box>
          <Typography fontWeight={800} sx={{ fontSize: 16, flex: 1 }}>Eliminar permiso</Typography>
          <IconButton onClick={onClose} size="small" sx={{ borderRadius: '10px', '&:hover': { bgcolor: alpha('#ef4444', 0.1), color: '#ef4444' } }}>
            <CloseRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </DialogTitle>
      <Box sx={{ height: '1px', bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06) }} />
      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Box sx={{ p: 2, mb: 2, borderRadius: '12px', bgcolor: alpha('#ef4444', 0.05), border: `1px solid ${alpha('#ef4444', 0.15)}` }}>
          <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace', color: '#ef4444' }}>
            {permiso.nombre}
          </Typography>
          <Chip label={accionCfg.label} size="small" sx={{ mt: 0.5, height: 18, fontSize: 10, fontWeight: 700, bgcolor: alpha(accionCfg.color, 0.1), color: accionCfg.color }} />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, lineHeight: 1.6 }}>
          Si este permiso está asignado a algún rol, la operación fallará automáticamente.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: '10px', fontWeight: 600, fontSize: 13, borderColor: isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15), color: 'text.secondary', '&:hover': { bgcolor: 'transparent' } }}>
          Cancelar
        </Button>
        <Button onClick={onConfirm} variant="contained" disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={14} sx={{ color: 'inherit' }} /> : <DeleteRoundedIcon sx={{ fontSize: 16 }} />}
          sx={{ borderRadius: '10px', fontWeight: 700, fontSize: 13, bgcolor: '#ef4444', boxShadow: 'none', '&:hover': { bgcolor: '#dc2626' }, '&.Mui-disabled': { opacity: 0.55 } }}
        >
          {isSubmitting ? 'Eliminando…' : 'Sí, eliminar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function PermisosTab() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent    = isDark ? '#facc15' : '#0288d1';
  const accentEnd = isDark ? '#f59e0b' : '#01579b';

  const [search,       setSearch]       = useState('');
  const [moduloFiltro, setModuloFiltro] = useState('');
  const [formModal,    setFormModal]    = useState<{ open: boolean; permiso?: Permiso }>({ open: false });
  const [deleteModal,  setDeleteModal]  = useState<{ open: boolean; permiso?: Permiso }>({ open: false });

  const permisosHook = usePermisos({ search, modulo: moduloFiltro });

  const handleEdit   = useCallback((p: Permiso) => setFormModal({ open: true, permiso: p }), []);
  const handleDelete = useCallback((p: Permiso) => setDeleteModal({ open: true, permiso: p }), []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteModal.permiso) return;
    const ok = await permisosHook.eliminar(deleteModal.permiso.id);
    if (ok) setDeleteModal({ open: false });
  }, [deleteModal.permiso, permisosHook]);

  // Stats
  const totalPermisos = permisosHook.total;
  const totalModulos  = permisosHook.modulos.length;

  return (
    <Box>
      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Total permisos', value: totalPermisos, color: accent },
          { label: 'Módulos',        value: totalModulos,  color: isDark ? '#a78bfa' : '#7c3aed' },
        ].map((s, i) => (
          <Box key={s.label} sx={{
            px: 2.5, py: 1.5, borderRadius: '14px',
            border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
            bgcolor: isDark ? alpha('#fff', 0.025) : '#fff',
            display: 'flex', alignItems: 'center', gap: 1.5,
          }}>
            <Typography sx={{ fontWeight: 800, fontSize: 22, color: s.color, lineHeight: 1 }}>
              {s.value}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
              {s.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Toolbar */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Buscar permiso…"
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

        {/* Filtros por módulo */}
        <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', flex: 1 }}>
          {['', ...permisosHook.modulos].map(mod => {
            const cfg    = mod ? getModuloConfig(mod) : null;
            const active = moduloFiltro === mod;
            return (
              <Chip
                key={mod || '__todos'}
                label={cfg ? cfg.label : 'Todos'}
                size="small"
                onClick={() => setModuloFiltro(mod)}
                sx={{
                  height: 28, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  bgcolor: active
                    ? (cfg ? alpha(cfg.color, isDark ? 0.2 : 0.12) : alpha(accent, 0.12))
                    : (isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)),
                  color: active ? (cfg?.color ?? accent) : 'text.secondary',
                  border: active
                    ? `1px solid ${alpha(cfg?.color ?? accent, 0.35)}`
                    : '1px solid transparent',
                  '&:hover': { opacity: 0.85 },
                }}
              />
            );
          })}
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
          onClick={() => setFormModal({ open: true })}
          size="small"
          sx={{
            borderRadius: '12px', fontWeight: 700, fontSize: 13, height: 36, px: 2,
            background: `linear-gradient(135deg, ${accent} 0%, ${accentEnd} 100%)`,
            color: isDark ? '#000' : '#fff',
            boxShadow: 'none',
            '&:hover': { boxShadow: `0 4px 14px ${alpha(accent, 0.35)}` },
          }}
        >
          Nuevo permiso
        </Button>
      </Box>

      {permisosHook.isLoading && (
        <LinearProgress sx={{
          borderRadius: 4, height: 2, mb: 2,
          bgcolor: alpha(accent, 0.12),
          '& .MuiLinearProgress-bar': { bgcolor: accent },
        }} />
      )}

      {/* Tabla agrupada por módulo */}
      {Object.entries(permisosHook.agrupado).map(([modulo, perms], gi) => {
        const cfg = getModuloConfig(modulo);
        return (
          <Box
            key={modulo}
            sx={{
              mb: 2,
              borderRadius: '16px',
              border: `1.5px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
              overflow: 'hidden',
              bgcolor: isDark ? alpha('#fff', 0.015) : '#fff',
              boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            {/* Cabecera del módulo */}
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1.5,
              px: 2.5, py: 1.5,
              bgcolor: isDark ? alpha(cfg.color, 0.08) : alpha(cfg.color, 0.04),
              borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)}`,
            }}>
              <Typography sx={{ fontSize: 18, lineHeight: 1 }}>{cfg.icon}</Typography>
              <Typography variant="body2" fontWeight={800} sx={{ color: cfg.color, flex: 1 }}>
                {cfg.label}
              </Typography>
              <Chip
                label={`${perms.length} ${perms.length === 1 ? 'permiso' : 'permisos'}`}
                size="small"
                sx={{ fontSize: 10, height: 20, bgcolor: alpha(cfg.color, 0.12), color: cfg.color, fontWeight: 700 }}
              />
            </Box>

            {/* Filas */}
            {perms.map((permiso, pi) => {
              const accionCfg = getAccionConfig(permiso.accion);
              return (
                <Box
                  key={permiso.id}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 2,
                    px: 2.5, py: 1.2,
                    borderBottom: pi < perms.length - 1
                      ? `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04)}`
                      : 'none',
                    transition: 'background 0.15s',
                    '&:hover': {
                      bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.015),
                      '& .actions': { opacity: 1 },
                    },
                  }}
                >
                  <Chip
                    label={accionCfg.label}
                    size="small"
                    sx={{
                      fontSize: 10, height: 22, fontWeight: 700, flexShrink: 0,
                      bgcolor: alpha(accionCfg.color, 0.1),
                      color: accionCfg.color,
                      minWidth: 76, justifyContent: 'center',
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2" fontWeight={600}
                      sx={{ fontSize: 13, fontFamily: 'monospace' }}
                      noWrap
                    >
                      {permiso.nombre}
                    </Typography>
                    {permiso.descripcion && (
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: 11 }}>
                        {permiso.descripcion}
                      </Typography>
                    )}
                  </Box>
                  <Box
                    className="actions"
                    sx={{ display: 'flex', gap: 0.5, flexShrink: 0, opacity: 0, transition: 'opacity 0.15s' }}
                  >
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(permiso)}
                        sx={{ width: 28, height: 28, borderRadius: '8px', '&:hover': { bgcolor: alpha(accent, 0.1), color: accent } }}
                      >
                        <EditRoundedIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(permiso)}
                        sx={{ width: 28, height: 28, borderRadius: '8px', '&:hover': { bgcolor: alpha('#ef4444', 0.1), color: '#ef4444' } }}
                      >
                        <DeleteRoundedIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              );
            })}
          </Box>
        );
      })}

      {!permisosHook.isLoading && permisosHook.permisos.length === 0 && (
        <Fade in>
          <Alert severity="info" sx={{ borderRadius: '14px' }}>
            {search || moduloFiltro
              ? `Sin resultados para los filtros aplicados.`
              : 'No hay permisos creados todavía.'
            }
          </Alert>
        </Fade>
      )}

      {/* Modales */}
      <PermisoFormModal
        open={formModal.open}
        permiso={formModal.permiso}
        modulos={permisosHook.modulos}
        isSubmitting={permisosHook.isSubmitting}
        onClose={() => setFormModal({ open: false })}
        onCreate={permisosHook.crear}
        onUpdate={permisosHook.actualizar}
      />

      <ConfirmDeletePermisoModal
        open={deleteModal.open}
        permiso={deleteModal.permiso}
        isSubmitting={permisosHook.isSubmitting}
        onClose={() => setDeleteModal({ open: false })}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}