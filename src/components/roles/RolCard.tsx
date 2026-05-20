'use client';
// components/roles/RolCard.tsx
import React from 'react';
import {
  Box, Typography, Chip, IconButton, Tooltip, alpha, useTheme,
} from '@mui/material';
import EditRoundedIcon    from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon  from '@mui/icons-material/DeleteRounded';
import LockRoundedIcon    from '@mui/icons-material/LockRounded';
import PersonRoundedIcon  from '@mui/icons-material/PersonRounded';
import VpnKeyRoundedIcon  from '@mui/icons-material/VpnKeyRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { Rol } from '@/types/permisosTypes';

// ── Helpers ──────────────────────────────────────────────────────────────────
const ROL_COLORS: Record<string, { color: string; bg: string; darkBg: string }> = {
  superadmin:    { color: '#ef4444', bg: '#fef2f2',  darkBg: '#3f1212' },
  administrador: { color: '#3b82f6', bg: '#eff6ff',  darkBg: '#0f2340' },
  docente:       { color: '#10b981', bg: '#ecfdf5',  darkBg: '#052e1e' },
  secretaria:    { color: '#f59e0b', bg: '#fffbeb',  darkBg: '#2d1f04' },
  padre_familia: { color: '#8b5cf6', bg: '#f5f3ff',  darkBg: '#1e1340' },
};

function getRolStyle(nombre: string) {
  return ROL_COLORS[nombre] ?? { color: '#6b7280', bg: '#f9fafb', darkBg: '#1c1c1e' };
}

export function RolAvatar({ rol, size = 40 }: { rol: Rol; size?: number }) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const style  = getRolStyle(rol.nombre);

  return (
    <Box sx={{
      width: size, height: size,
      borderRadius: `${size * 0.28}px`,
      bgcolor: isDark ? style.darkBg : style.bg,
      border: `1.5px solid ${alpha(style.color, 0.3)}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: style.color,
      fontWeight: 800,
      fontSize: size * 0.38,
      flexShrink: 0,
      letterSpacing: -0.5,
    }}>
      {rol.nombre.charAt(0).toUpperCase()}
    </Box>
  );
}

// ── Componente ────────────────────────────────────────────────────────────────
interface RolCardProps {
  rol:        Rol;
  isSelected: boolean;
  onSelect:   (rol: Rol) => void;
  onEdit:     (rol: Rol) => void;
  onDelete:   (rol: Rol) => void;
  index:      number;
}

export function RolCard({ rol, isSelected, onSelect, onEdit, onDelete, index }: RolCardProps) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const style  = getRolStyle(rol.nombre);

  return (
    <Box
      onClick={() => onSelect(rol)}
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        borderRadius: '16px',
        border: `1.5px solid`,
        borderColor: isSelected
          ? alpha(style.color, 0.5)
          : isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07),
        bgcolor: isSelected
          ? isDark ? alpha(style.color, 0.08) : alpha(style.color, 0.03)
          : isDark ? alpha('#fff', 0.025) : '#fff',
        cursor: 'pointer',
        transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
        animationDelay: `${index * 0.04}s`,
        boxShadow: isSelected
          ? `0 0 0 1px ${alpha(style.color, 0.15)}, 0 4px 20px ${alpha(style.color, 0.08)}`
          : isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
        '&:hover': {
          borderColor: alpha(style.color, 0.4),
          transform: 'translateY(-1px)',
          boxShadow: isDark
            ? `0 4px 20px ${alpha(style.color, 0.1)}`
            : `0 4px 16px rgba(0,0,0,0.06)`,
        },
        '&:active': { transform: 'translateY(0)' },

        // Barra lateral izquierda cuando está seleccionado
        '&::before': isSelected ? {
          content: '""',
          position: 'absolute',
          left: -1, top: '20%', bottom: '20%',
          width: 3,
          borderRadius: '0 3px 3px 0',
          bgcolor: style.color,
        } : {},
      }}
    >
      <RolAvatar rol={rol} size={44} />

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
          <Typography
            variant="body2"
            fontWeight={700}
            noWrap
            sx={{ fontSize: 14, color: isSelected ? style.color : 'text.primary' }}
          >
            {rol.nombre}
          </Typography>
          {rol.es_sistema && (
            <Tooltip title="Rol de sistema — solo lectura">
              <LockRoundedIcon sx={{ fontSize: 12, color: 'text.disabled', flexShrink: 0 }} />
            </Tooltip>
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: 12 }}>
          {rol.descripcion ?? 'Sin descripción'}
        </Typography>
      </Box>

      {/* Contadores */}
      <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
        <Chip
          icon={<VpnKeyRoundedIcon sx={{ fontSize: '11px !important', ml: '6px !important' }} />}
          label={rol.total_permisos ?? 0}
          size="small"
          sx={{
            height: 24, fontSize: 11, fontWeight: 700,
            bgcolor: alpha(style.color, isDark ? 0.18 : 0.1),
            color: style.color,
            '& .MuiChip-icon': { color: style.color },
          }}
        />
        <Chip
          icon={<PersonRoundedIcon sx={{ fontSize: '11px !important', ml: '6px !important' }} />}
          label={rol.total_usuarios ?? 0}
          size="small"
          sx={{
            height: 24, fontSize: 11, fontWeight: 700,
            bgcolor: isDark ? alpha('#fff', 0.07) : alpha('#000', 0.05),
            color: 'text.secondary',
          }}
        />
      </Box>

      {/* Acciones */}
      <Box
        sx={{ display: 'flex', gap: 0.5, flexShrink: 0, opacity: 0, transition: 'opacity 0.15s',
          '.MuiBox-root:hover > &': { opacity: 1 },
        }}
        onClick={e => e.stopPropagation()}
      >
        {!rol.es_sistema && (
          <>
            <Tooltip title="Editar rol">
              <IconButton
                size="small"
                onClick={() => onEdit(rol)}
                sx={{
                  width: 28, height: 28, borderRadius: '8px',
                  '&:hover': { bgcolor: alpha(style.color, 0.12), color: style.color },
                }}
              >
                <EditRoundedIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar rol">
              <IconButton
                size="small"
                onClick={() => onDelete(rol)}
                sx={{
                  width: 28, height: 28, borderRadius: '8px',
                  '&:hover': { bgcolor: alpha('#ef4444', 0.1), color: '#ef4444' },
                }}
              >
                <DeleteRoundedIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>

      {/* Flecha de selección */}
      <ChevronRightRoundedIcon
        sx={{
          fontSize: 18, flexShrink: 0,
          color: isSelected ? style.color : 'text.disabled',
          transition: 'transform 0.2s',
          transform: isSelected ? 'rotate(90deg)' : 'none',
        }}
      />
    </Box>
  );
}