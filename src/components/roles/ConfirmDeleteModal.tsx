'use client';
// components/roles/ConfirmDeleteModal.tsx
import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, IconButton, alpha, useTheme, CircularProgress,
} from '@mui/material';
import CloseRoundedIcon      from '@mui/icons-material/CloseRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import DeleteRoundedIcon     from '@mui/icons-material/DeleteRounded';
import { Rol } from '@/types/permisosTypes';
import { RolAvatar } from './RolCard';

interface ConfirmDeleteModalProps {
  open:        boolean;
  rol?:        Rol | null;
  isSubmitting: boolean;
  onClose:     () => void;
  onConfirm:   () => Promise<void>;
}

export function ConfirmDeleteModal({
  open, rol, isSubmitting, onClose, onConfirm,
}: ConfirmDeleteModalProps) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!rol) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          border: `1px solid ${isDark ? alpha('#ef4444', 0.2) : alpha('#ef4444', 0.15)}`,
          bgcolor: isDark ? '#140a0a' : '#fff',
          boxShadow: isDark
            ? '0 24px 80px rgba(0,0,0,0.7)'
            : '0 24px 80px rgba(0,0,0,0.12)',
          overflow: 'hidden',
        },
      }}
    >
      {/* Franja roja */}
      <Box sx={{ height: 4, bgcolor: '#ef4444' }} />

      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3, py: 2.5 }}>
          <Box sx={{
            width: 38, height: 38, borderRadius: '12px',
            bgcolor: alpha('#ef4444', isDark ? 0.2 : 0.1),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <WarningAmberRoundedIcon sx={{ fontSize: 20, color: '#ef4444' }} />
          </Box>
          <Typography fontWeight={800} sx={{ fontSize: 16, flex: 1 }}>
            Eliminar rol
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ borderRadius: '10px', '&:hover': { bgcolor: alpha('#ef4444', 0.1), color: '#ef4444' } }}
          >
            <CloseRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </DialogTitle>

      <Box sx={{ height: '1px', bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06) }} />

      <DialogContent sx={{ px: 3, py: 3 }}>
        {/* Preview del rol a eliminar */}
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 2,
          p: 2, mb: 2.5,
          borderRadius: '14px',
          bgcolor: isDark ? alpha('#ef4444', 0.06) : alpha('#ef4444', 0.04),
          border: `1px solid ${alpha('#ef4444', 0.15)}`,
        }}>
          <RolAvatar rol={rol} size={40} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} noWrap>{rol.nombre}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {rol.descripcion ?? 'Sin descripción'}
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, lineHeight: 1.6 }}>
          Esta acción es <strong>irreversible</strong>. Si el rol tiene usuarios asignados, la operación fallará automáticamente.
        </Typography>
      </DialogContent>

      <DialogActions sx={{
        px: 3, py: 2.5,
        borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
        gap: 1,
      }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: '12px', fontWeight: 600, fontSize: 13,
            borderColor: isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15),
            color: 'text.secondary',
            '&:hover': { borderColor: isDark ? alpha('#fff', 0.3) : alpha('#000', 0.3), bgcolor: 'transparent' },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting
            ? <CircularProgress size={14} sx={{ color: 'inherit' }} />
            : <DeleteRoundedIcon sx={{ fontSize: 16 }} />
          }
          sx={{
            borderRadius: '12px', fontWeight: 700, fontSize: 13,
            bgcolor: '#ef4444', boxShadow: 'none',
            '&:hover': { bgcolor: '#dc2626', boxShadow: '0 4px 14px rgba(239,68,68,0.4)' },
            '&.Mui-disabled': { opacity: 0.55 },
          }}
        >
          {isSubmitting ? 'Eliminando…' : 'Sí, eliminar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}