'use client';
// components/roles/RolFormModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, Button, IconButton,
  alpha, useTheme, CircularProgress,
} from '@mui/material';
import CloseRoundedIcon    from '@mui/icons-material/CloseRounded';
import ShieldRoundedIcon   from '@mui/icons-material/ShieldRounded';
import SaveRoundedIcon     from '@mui/icons-material/SaveRounded';
import { Rol, CrearRolDTO, ActualizarRolDTO } from '@/types/permisosTypes';

interface RolFormModalProps {
  open:        boolean;
  rol?:        Rol | null;       // null → crear, Rol → editar
  isSubmitting: boolean;
  onClose:     () => void;
  onCreate:    (data: CrearRolDTO) => Promise<boolean>;
  onUpdate:    (id: number, data: ActualizarRolDTO) => Promise<boolean>;
}

const EMPTY = { nombre: '', descripcion: '' };

export function RolFormModal({
  open, rol, isSubmitting, onClose, onCreate, onUpdate,
}: RolFormModalProps) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? '#818cf8' : '#4f46e5';

  const [form,   setForm]   = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!rol;

  useEffect(() => {
    if (open) {
      setForm(rol
        ? { nombre: rol.nombre, descripcion: rol.descripcion ?? '' }
        : EMPTY
      );
      setErrors({});
    }
  }, [open, rol]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio';
    else if (form.nombre.length < 2) e.nombre = 'Mínimo 2 caracteres';
    else if (form.nombre.length > 50) e.nombre = 'Máximo 50 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    const data = { nombre: form.nombre.trim(), descripcion: form.descripcion.trim() || undefined };
    const ok   = isEditing
      ? await onUpdate(rol!.id, data)
      : await onCreate(data);
    if (ok) onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07)}`,
          bgcolor: isDark ? '#0f0f1a' : '#fff',
          boxShadow: isDark
            ? `0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px ${alpha(accent, 0.15)}`
            : '0 24px 80px rgba(0,0,0,0.12)',
          overflow: 'hidden',
        },
      }}
    >
      {/* Franja superior decorativa */}
      <Box sx={{
        height: 4,
        background: `linear-gradient(90deg, ${accent} 0%, ${isDark ? '#c084fc' : '#7c3aed'} 100%)`,
      }} />

      {/* Header */}
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5,
          px: 3, py: 2.5,
        }}>
          <Box sx={{
            width: 38, height: 38, borderRadius: '12px',
            bgcolor: alpha(accent, isDark ? 0.2 : 0.1),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShieldRoundedIcon sx={{ fontSize: 20, color: accent }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography fontWeight={800} sx={{ fontSize: 16, lineHeight: 1.2 }}>
              {isEditing ? 'Editar Rol' : 'Nuevo Rol'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isEditing ? `Editando "${rol?.nombre}"` : 'Completá los datos del nuevo rol'}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              borderRadius: '10px',
              '&:hover': { bgcolor: alpha('#ef4444', 0.1), color: '#ef4444' },
            }}
          >
            <CloseRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Divider */}
      <Box sx={{ height: '1px', bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06) }} />

      {/* Contenido */}
      <DialogContent sx={{ px: 3, py: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.8, display: 'block', letterSpacing: 0.5, textTransform: 'uppercase', fontSize: 10 }}>
              Nombre del rol *
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="ej. coordinador_académico"
              value={form.nombre}
              onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              error={!!errors.nombre}
              helperText={errors.nombre}
              autoFocus
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  fontSize: 14,
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: accent,
                    borderWidth: 2,
                  },
                },
              }}
            />
          </Box>

          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.8, display: 'block', letterSpacing: 0.5, textTransform: 'uppercase', fontSize: 10 }}>
              Descripción
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Describí brevemente las responsabilidades de este rol"
              value={form.descripcion}
              onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  fontSize: 14,
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: accent,
                    borderWidth: 2,
                  },
                },
              }}
            />
          </Box>

          {/* Nota informativa */}
          <Box sx={{
            p: 1.5,
            borderRadius: '12px',
            bgcolor: isDark ? alpha(accent, 0.08) : alpha(accent, 0.05),
            border: `1px solid ${alpha(accent, 0.15)}`,
          }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12, lineHeight: 1.5 }}>
              💡 Después de crear el rol, podrás asignarle permisos desde el panel de permisos del rol.
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      {/* Footer */}
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
            '&:hover': {
              borderColor: isDark ? alpha('#fff', 0.3) : alpha('#000', 0.3),
              bgcolor: 'transparent',
            },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting
            ? <CircularProgress size={14} sx={{ color: 'inherit' }} />
            : <SaveRoundedIcon sx={{ fontSize: 16 }} />
          }
          sx={{
            borderRadius: '12px', fontWeight: 700, fontSize: 13,
            background: `linear-gradient(135deg, ${accent} 0%, ${isDark ? '#c084fc' : '#7c3aed'} 100%)`,
            boxShadow: 'none',
            '&:hover': { boxShadow: `0 4px 14px ${alpha(accent, 0.4)}` },
            '&.Mui-disabled': { opacity: 0.55 },
          }}
        >
          {isSubmitting ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear rol'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}