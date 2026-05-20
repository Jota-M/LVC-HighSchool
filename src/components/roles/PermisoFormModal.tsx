'use client';
// components/permisos/PermisoFormModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, Button, IconButton,
  alpha, useTheme, CircularProgress, MenuItem, Select,
  FormControl, InputLabel, FormHelperText,
} from '@mui/material';
import CloseRoundedIcon  from '@mui/icons-material/CloseRounded';
import KeyRoundedIcon    from '@mui/icons-material/KeyRounded';
import SaveRoundedIcon   from '@mui/icons-material/SaveRounded';
import { CrearPermisoDTO, ActualizarPermisoDTO, Permiso, MODULO_CONFIG, ACCION_CONFIG, getModuloConfig, getAccionConfig } from '@/types/permisosTypes';

interface PermisoFormModalProps {
  open:         boolean;
  permiso?:     Permiso | null;
  modulos:      string[];
  isSubmitting: boolean;
  onClose:      () => void;
  onCreate:     (data: CrearPermisoDTO) => Promise<boolean>;
  onUpdate:     (id: number, data: ActualizarPermisoDTO) => Promise<boolean>;
}

const EMPTY = { modulo: '', accion: '', descripcion: '' };

const ACCIONES_DISPONIBLES = Object.keys(ACCION_CONFIG);

export function PermisoFormModal({
  open, permiso, modulos, isSubmitting, onClose, onCreate, onUpdate,
}: PermisoFormModalProps) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const accent    = isDark ? '#facc15' : '#0288d1';
  const accentEnd = isDark ? '#f59e0b' : '#01579b';

  const [form,   setForm]   = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!permiso;

  // Nombre generado automáticamente
  const nombreGenerado = form.modulo && form.accion
    ? `${form.modulo}.${form.accion}`
    : '';

  useEffect(() => {
    if (open) {
      setForm(permiso
        ? {
            modulo:      permiso.modulo,
            accion:      permiso.accion,
            descripcion: permiso.descripcion ?? '',
          }
        : EMPTY
      );
      setErrors({});
    }
  }, [open, permiso]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.modulo.trim()) e.modulo = 'Seleccioná un módulo';
    if (!form.accion.trim()) e.accion = 'Seleccioná una acción';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    const data: CrearPermisoDTO = {
      modulo:      form.modulo,
      accion:      form.accion,
      nombre:      nombreGenerado,
      descripcion: form.descripcion.trim() || undefined,
    };
    const ok = isEditing
      ? await onUpdate(permiso!.id, data)
      : await onCreate(data);
    if (ok) onClose();
  }

  const moduloCfg  = form.modulo ? getModuloConfig(form.modulo)  : null;
  const accionCfg  = form.accion ? getAccionConfig(form.accion)  : null;

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
          bgcolor: isDark ? '#0f0f10' : '#fff',
          boxShadow: isDark
            ? `0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px ${alpha(accent, 0.15)}`
            : '0 24px 80px rgba(0,0,0,0.12)',
          overflow: 'hidden',
        },
      }}
    >
      {/* Franja superior */}
      <Box sx={{
        height: 4,
        background: `linear-gradient(90deg, ${accent} 0%, ${accentEnd} 100%)`,
      }} />

      {/* Header */}
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3, py: 2.5 }}>
          <Box sx={{
            width: 38, height: 38, borderRadius: '12px',
            bgcolor: alpha(accent, isDark ? 0.2 : 0.1),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <KeyRoundedIcon sx={{ fontSize: 20, color: accent }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography fontWeight={800} sx={{ fontSize: 16, lineHeight: 1.2 }}>
              {isEditing ? 'Editar Permiso' : 'Nuevo Permiso'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isEditing ? `Editando "${permiso?.nombre}"` : 'Completá los datos del permiso'}
            </Typography>
          </Box>
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

          {/* Módulo */}
          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary"
              sx={{ mb: 0.8, display: 'block', letterSpacing: 0.5, textTransform: 'uppercase', fontSize: 10 }}>
              Módulo *
            </Typography>
            <FormControl fullWidth size="small" error={!!errors.modulo}>
              <Select
                value={form.modulo}
                onChange={e => setForm(p => ({ ...p, modulo: e.target.value }))}
                displayEmpty
                sx={{
                  borderRadius: '12px', fontSize: 14,
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: accent },
                }}
                renderValue={val => {
                  if (!val) return <Typography color="text.disabled" sx={{ fontSize: 14 }}>Seleccioná un módulo</Typography>;
                  const cfg = getModuloConfig(val);
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontSize: 16 }}>{cfg.icon}</Typography>
                      <Typography sx={{ fontSize: 14 }}>{cfg.label}</Typography>
                    </Box>
                  );
                }}
              >
                {/* Módulos existentes del sistema */}
                {modulos.map(mod => {
                  const cfg = getModuloConfig(mod);
                  return (
                    <MenuItem key={mod} value={mod}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontSize: 16 }}>{cfg.icon}</Typography>
                        <Typography sx={{ fontSize: 14 }}>{cfg.label}</Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ ml: 0.5 }}>
                          ({mod})
                        </Typography>
                      </Box>
                    </MenuItem>
                  );
                })}
                {/* Opción para módulo personalizado */}
                <MenuItem value="__custom" divider>
                  <Typography sx={{ fontSize: 14, color: accent, fontWeight: 600 }}>
                    + Módulo personalizado…
                  </Typography>
                </MenuItem>
              </Select>
              {errors.modulo && <FormHelperText>{errors.modulo}</FormHelperText>}
            </FormControl>

            {/* Input de módulo custom */}
            {form.modulo === '__custom' && (
              <TextField
                fullWidth
                size="small"
                placeholder="nombre_del_modulo (snake_case)"
                sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: 14 } }}
                onChange={e => setForm(p => ({ ...p, modulo: e.target.value }))}
                autoFocus
              />
            )}
          </Box>

          {/* Acción */}
          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary"
              sx={{ mb: 0.8, display: 'block', letterSpacing: 0.5, textTransform: 'uppercase', fontSize: 10 }}>
              Acción *
            </Typography>
            <FormControl fullWidth size="small" error={!!errors.accion}>
              <Select
                value={form.accion}
                onChange={e => setForm(p => ({ ...p, accion: e.target.value }))}
                displayEmpty
                sx={{
                  borderRadius: '12px', fontSize: 14,
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: accent },
                }}
                renderValue={val => {
                  if (!val) return <Typography color="text.disabled" sx={{ fontSize: 14 }}>Seleccioná una acción</Typography>;
                  const cfg = getAccionConfig(val);
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{
                        width: 10, height: 10, borderRadius: '50%',
                        bgcolor: cfg.color, flexShrink: 0,
                      }} />
                      <Typography sx={{ fontSize: 14 }}>{cfg.label}</Typography>
                    </Box>
                  );
                }}
              >
                {ACCIONES_DISPONIBLES.map(acc => {
                  const cfg = getAccionConfig(acc);
                  return (
                    <MenuItem key={acc} value={acc}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: cfg.color }} />
                        <Typography sx={{ fontSize: 14 }}>{cfg.label}</Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ ml: 0.5 }}>
                          ({acc})
                        </Typography>
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
              {errors.accion && <FormHelperText>{errors.accion}</FormHelperText>}
            </FormControl>
          </Box>

          {/* Preview del nombre generado */}
          {nombreGenerado && (
            <Box sx={{
              p: 1.5, borderRadius: '12px',
              bgcolor: isDark ? alpha(accent, 0.08) : alpha(accent, 0.05),
              border: `1px solid ${alpha(accent, 0.2)}`,
              display: 'flex', alignItems: 'center', gap: 1.5,
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                Nombre generado:
              </Typography>
              <Typography
                variant="caption"
                fontWeight={800}
                sx={{ fontSize: 13, color: accent, fontFamily: 'monospace' }}
              >
                {nombreGenerado}
              </Typography>
            </Box>
          )}

          {/* Descripción */}
          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary"
              sx={{ mb: 0.8, display: 'block', letterSpacing: 0.5, textTransform: 'uppercase', fontSize: 10 }}>
              Descripción
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Describí qué permite hacer este permiso"
              value={form.descripcion}
              onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
              multiline
              rows={2}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px', fontSize: 14,
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: accent },
                },
              }}
            />
          </Box>
        </Box>
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
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting
            ? <CircularProgress size={14} sx={{ color: 'inherit' }} />
            : <SaveRoundedIcon sx={{ fontSize: 16 }} />
          }
          sx={{
            borderRadius: '12px', fontWeight: 700, fontSize: 13,
            background: `linear-gradient(135deg, ${accent} 0%, ${accentEnd} 100%)`,
            color: isDark ? '#000' : '#fff',
            boxShadow: 'none',
            '&:hover': { boxShadow: `0 4px 14px ${alpha(accent, 0.4)}` },
            '&.Mui-disabled': { opacity: 0.55 },
          }}
        >
          {isSubmitting ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear permiso'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}