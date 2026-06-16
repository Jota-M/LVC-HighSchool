import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  alpha,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { PeriodoAcademico, PeriodoFormData } from '../../services/periodos';

interface PeriodoFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: PeriodoFormData) => Promise<void>;
  editingPeriodo: PeriodoAcademico | null;
  loading?: boolean;
}

export const PeriodoFormDialog: React.FC<PeriodoFormDialogProps> = ({
  open,
  onClose,
  onSave,
  editingPeriodo,
  loading = false,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isEditing = !!editingPeriodo;

  // ── tokens ──────────────────────────────────────────────────────────────────
  const brand = isDark ? '#facc15' : '#0288d1';
  const brandDim = isDark ? 'rgba(250,204,21,0.10)' : 'rgba(2,136,209,0.07)';
  const brandBorder = isDark ? 'rgba(250,204,21,0.28)' : 'rgba(2,136,209,0.22)';
  const bgModal = isDark ? '#09101dff' : '#ffffff';
  const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';
  const R = '12px';

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: R,
      background: bgField,
      '& fieldset': { borderColor: borderField, borderRadius: R },
      '&:hover fieldset': { borderColor: alpha(brand, 0.5) },
      '&.Mui-focused fieldset': { borderColor: brand, borderWidth: '1.5px' },
      '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(brand, 0.12)}` },
    },
    '& .MuiInputLabel-root': { color: 'text.secondary' },
    '& .MuiInputLabel-root.Mui-focused': { color: brand },
  };

  // ── estado ───────────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState<PeriodoFormData>({
    nombre: '', codigo: '', fecha_inicio: '', fecha_fin: '',
    activo: false, permite_inscripciones: true, permite_calificaciones: true, observaciones: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── efectos ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (editingPeriodo) {
      setFormData({
        nombre: editingPeriodo.nombre,
        codigo: editingPeriodo.codigo,
        fecha_inicio: editingPeriodo.fecha_inicio,
        fecha_fin: editingPeriodo.fecha_fin,
        activo: editingPeriodo.activo,
        permite_inscripciones: editingPeriodo.permite_inscripciones,
        permite_calificaciones: editingPeriodo.permite_calificaciones,
        observaciones: editingPeriodo.observaciones || '',
      });
    } else {
      setFormData({ nombre: '', codigo: '', fecha_inicio: '', fecha_fin: '', activo: false, permite_inscripciones: true, permite_calificaciones: true, observaciones: '' });
    }
    setErrors({});
  }, [editingPeriodo, open]);

  // ── lógica ──────────────────────────────────────────────────────────────────
  const validateForm = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!formData.codigo.trim()) e.codigo = 'El código es requerido';
    if (!formData.fecha_inicio) e.fecha_inicio = 'La fecha de inicio es requerida';
    if (!formData.fecha_fin) e.fecha_fin = 'La fecha de fin es requerida';
    if (formData.fecha_inicio && formData.fecha_fin) {
      if (new Date(formData.fecha_fin) <= new Date(formData.fecha_inicio))
        e.fecha_fin = 'La fecha de fin debe ser posterior a la de inicio';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try { await onSave(formData); onClose(); }
    catch (err) { console.error('Error al guardar:', err); }
  };

  const handleChange = (field: keyof PeriodoFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  // helper para los 3 switches
  const switchConfig = [
    {
      field: 'activo' as const,
      label: 'Período activo',
      hint: 'Solo uno puede estar activo',
      color: brand,
    },
    {
      field: 'permite_inscripciones' as const,
      label: 'Permite inscripciones',
      hint: 'Habilitar registro de alumnos',
      color: '#10b981',
    },
    {
      field: 'permite_calificaciones' as const,
      label: 'Permite calificaciones',
      hint: 'Habilitar carga de notas',
      color: '#8b5cf6',
    },
  ];

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px !important',
          overflow: 'hidden',
          background: bgModal,
          border: `1.5px solid ${brandBorder}`,
          boxShadow: isDark
            ? `0 0 0 1px ${alpha(brand, 0.06)}, 0 32px 64px rgba(0,0,0,0.8)`
            : `0 32px 64px rgba(0,0,0,0.14)`,
        },
      }}
    >
      {/* ── HEADER ── */}
      <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${borderField}`, background: brandDim }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{
              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: alpha(brand, 0.7), mb: 0.5,
            }}>
              Períodos académicos · {isEditing ? 'Editar' : 'Nuevo'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box sx={{
                width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
                background: alpha(brand, 0.15), border: `1px solid ${alpha(brand, 0.3)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isEditing
                  ? <EditIcon sx={{ color: brand, fontSize: 18 }} />
                  : <EventNoteIcon sx={{ color: brand, fontSize: 18 }} />}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: 'text.primary', lineHeight: 1.2 }}>
                  {isEditing ? 'Editar período' : 'Nuevo período académico'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isEditing ? 'Modifica la información del período' : 'Crea un nuevo ciclo educativo'}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            onClick={onClose}
            sx={{
              width: 32, height: 32, borderRadius: '9px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.05)', border: `1px solid ${borderField}`,
              color: 'text.secondary', transition: 'all 0.15s',
              '&:hover': { background: alpha(brand, 0.12), borderColor: alpha(brand, 0.4), color: brand },
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </Box>
        </Box>
      </Box>

      {/* ── BODY ── */}
      <DialogContent sx={{ px: 3, py: 3 }}>
        <Grid container spacing={2}>

          {/* Nombre */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Nombre del período"
              value={formData.nombre}
              onChange={handleChange('nombre')}
              placeholder="Ej: Gestión 2025 — Primer Semestre"
              error={!!errors.nombre}
              helperText={errors.nombre}
              InputProps={{
                startAdornment: <EventNoteIcon sx={{ mr: 1, fontSize: 18, color: 'action.active' }} />,
              }}
              sx={fieldSx}
            />
          </Grid>

          {/* Código */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Código"
              value={formData.codigo}
              onChange={handleChange('codigo')}
              placeholder="Ej: 2025-1"
              error={!!errors.codigo}
              helperText={errors.codigo}
              sx={fieldSx}
            />
          </Grid>

          {/* Fecha inicio */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="date"
              label="Fecha de inicio"
              value={formData.fecha_inicio}
              onChange={handleChange('fecha_inicio')}
              error={!!errors.fecha_inicio}
              helperText={errors.fecha_inicio}
              InputLabelProps={{ shrink: true }}
              sx={fieldSx}
            />
          </Grid>

          {/* Fecha fin */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="date"
              label="Fecha de fin"
              value={formData.fecha_fin}
              onChange={handleChange('fecha_fin')}
              error={!!errors.fecha_fin}
              helperText={errors.fecha_fin}
              InputLabelProps={{ shrink: true }}
              sx={fieldSx}
            />
          </Grid>

          {/* Observaciones */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Observaciones"
              value={formData.observaciones}
              onChange={handleChange('observaciones')}
              placeholder="Notas adicionales sobre el período..."
              sx={fieldSx}
            />
          </Grid>

          {/* Switches */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{
              p: 1.75, borderRadius: R,
              background: alpha(brand, 0.06), border: `1px solid ${alpha(brand, 0.18)}`,
              display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1,
            }}>
              {switchConfig.map(({ field, label, hint, color }) => (
                <Box
                  key={field}
                  sx={{
                    flex: 1, p: 1.5, borderRadius: '10px',
                    background: formData[field] ? alpha(color, 0.08) : 'transparent',
                    border: `1px solid ${formData[field] ? alpha(color, 0.22) : 'transparent'}`,
                    transition: 'all 0.2s',
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData[field] as boolean}
                        onChange={handleChange(field)}
                        size="small"
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: color },
                        }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, ml: 0.25 }}>
                        {(formData[field] as boolean)
                          ? <CheckCircleIcon sx={{ color, fontSize: 16 }} />
                          : <RadioButtonUncheckedIcon sx={{ color: 'action.disabled', fontSize: 16 }} />}
                        <Box>
                          <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ lineHeight: 1.2 }}>
                            {label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{hint}</Typography>
                        </Box>
                      </Box>
                    }
                    sx={{ m: 0, width: '100%' }}
                  />
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Tip */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{
              p: 1.5, borderRadius: R,
              background: alpha(brand, 0.06), border: `1px solid ${alpha(brand, 0.18)}`,
              borderLeft: `3px solid ${alpha(brand, 0.6)}`,
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                <strong style={{ color: brand }}>Tip:</strong>{' '}
                Si activas este período, los demás períodos activos se desactivarán automáticamente.
              </Typography>
            </Box>
          </Grid>

        </Grid>
      </DialogContent>

      {/* ── FOOTER ── */}
      <Box sx={{ px: 3, pb: 3, pt: 2, display: 'flex', gap: 1.25, borderTop: `1px solid ${borderField}` }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            flex: 1, borderRadius: '10px', textTransform: 'none', fontWeight: 600,
            color: 'text.secondary', border: `1px solid ${borderField}`,
            '&:hover': { borderColor: alpha(brand, 0.5), color: brand, background: alpha(brand, 0.05) },
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
          startIcon={loading
            ? <CircularProgress size={16} color="inherit" />
            : isEditing ? <EditIcon /> : <AddIcon />}
          sx={{
            flex: 1, borderRadius: '10px', textTransform: 'none', fontWeight: 700,
            background: brand, color: isDark ? '#000' : '#fff',
            boxShadow: `0 4px 16px ${alpha(brand, 0.4)}`,
            '&:hover': {
              background: isDark ? '#eab308' : '#01579b',
              boxShadow: `0 6px 20px ${alpha(brand, 0.5)}`,
            },
            '&.Mui-disabled': { opacity: 0.35, background: brand, color: isDark ? '#000' : '#fff' },
          }}
        >
          {loading ? 'Guardando...' : isEditing ? 'Actualizar período' : 'Crear período'}
        </Button>
      </Box>
    </Dialog>
  );
};