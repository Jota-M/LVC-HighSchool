import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  CircularProgress,
  alpha,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Category as CategoryIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { AreaConocimiento, AreaFormData } from '../../services/materias';

interface AreaFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: AreaFormData) => Promise<void>;
  editingArea: AreaConocimiento | null;
  loading?: boolean;
  areas: AreaConocimiento[];
}

const coloresAreas = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
];

export const AreaFormDialog: React.FC<AreaFormDialogProps> = ({
  open,
  onClose,
  onSave,
  editingArea,
  loading = false,
  areas
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [formData, setFormData] = useState<AreaFormData>({
    nombre: '',
    descripcion: '',
    color: '#3B82F6',
    orden: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── tokens (mismos que NuevoHorarioModal) ─────────────────────────────────
  const brand = isDark ? '#facc15' : '#0288d1';
  const brandDim = isDark ? 'rgba(250,204,21,0.12)' : 'rgba(2,136,209,0.10)';
  const brandBorder = isDark ? 'rgba(250,204,21,0.25)' : 'rgba(2,136,209,0.25)';
  const bgModal = isDark ? '#09101dff' : '#ffffff';
  const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const R = '14px';

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: R,
      background: bgField,
      '& fieldset': {
        borderColor: borderField,
        borderRadius: R,
      },
      '&:hover fieldset': { borderColor: alpha(brand, 0.5) },
      '&.Mui-focused fieldset': {
        borderColor: brand,
        borderWidth: '1.5px',
        borderRadius: R,
      },
      '&.Mui-focused': {
        boxShadow: `0 0 0 3px ${alpha(brand, 0.12)}`,
        borderRadius: R,
      },
    },
    '& .MuiInputLabel-root': { color: 'text.secondary' },
    '& .MuiInputLabel-root.Mui-focused': { color: brand },
  };

  useEffect(() => {
    if (editingArea) {
      setFormData({
        nombre: editingArea.nombre,
        descripcion: editingArea.descripcion || '',
        color: editingArea.color || '#3B82F6',
        orden: editingArea.orden
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        color: '#3B82F6',
        orden: areas.length + 1
      });
    }
    setErrors({});
  }, [editingArea, open, areas.length]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const handleChange = (field: keyof AreaFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'number'
      ? (e.target.value ? parseInt(e.target.value) : 0)
      : e.target.value;

    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px !important',
          overflow: 'hidden',
          background: bgModal,
          border: `1.5px solid ${brandBorder}`,
          boxShadow: isDark
            ? `0 0 0 1px rgba(250,204,21,0.06), 0 32px 64px rgba(0,0,0,0.8)`
            : `0 32px 64px rgba(0,0,0,0.18)`,
        }
      }}
    >
      {/* ── HEADER ── */}
      <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${borderField}`, background: brandDim }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Box>
            <Typography
              sx={{
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: alpha(brand, 0.7),
                mb: 0.4,
              }}
            >
              {editingArea ? 'Editar área' : 'Nueva área'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box
                sx={{
                  width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
                  background: alpha(brand, 0.15),
                  border: `1px solid ${alpha(brand, 0.3)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {editingArea ? <EditIcon sx={{ color: brand, fontSize: 18 }} /> : <AddIcon sx={{ color: brand, fontSize: 18 }} />}
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', lineHeight: 1.1, color: 'text.primary' }}>
                {editingArea ? 'Editar Área de Conocimiento' : 'Área de Conocimiento'}
              </Typography>
            </Box>
          </Box>

          <Box
            onClick={onClose}
            sx={{
              width: 32, height: 32, borderRadius: '9px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${borderField}`,
              color: 'text.secondary',
              transition: 'all 0.15s',
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
          <Grid size={{ xs: 12 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {editingArea ? 'Modifica la información del área' : 'Crea una nueva área educativa'}
            </Typography>
          </Grid>

          {/* Nombre */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Nombre del Área"
              value={formData.nombre}
              onChange={handleChange('nombre')}
              placeholder="Ej: Ciencias Exactas"
              error={!!errors.nombre}
              helperText={errors.nombre}
              InputProps={{
                startAdornment: <CategoryIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
              sx={fieldSx}
            />
          </Grid>

          {/* Descripción */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Descripción (opcional)"
              value={formData.descripcion}
              onChange={handleChange('descripcion')}
              placeholder="Describe el área de conocimiento"
              multiline
              rows={3}
              sx={fieldSx}
            />
          </Grid>

          {/* Orden */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              type="number"
              label="Orden"
              value={formData.orden}
              onChange={handleChange('orden')}
              sx={fieldSx}
            />
          </Grid>

          {/* Color */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>
              Color Identificador
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {coloresAreas.map((color) => (
                <Tooltip key={color} title={color}>
                  <Box
                    onClick={() => setFormData({ ...formData, color })}
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '9px',
                      bgcolor: color,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: formData.color === color
                        ? `2px solid ${brand}`
                        : `1px solid ${borderField}`,
                      boxShadow: formData.color === color ? `0 0 0 3px ${alpha(brand, 0.15)}` : 'none',
                      transition: 'all 0.15s',
                      '&:hover': {
                        transform: 'scale(1.08)',
                      }
                    }}
                  >
                    {formData.color === color && <CheckCircleIcon sx={{ color: 'white', fontSize: 18 }} />}
                  </Box>
                </Tooltip>
              ))}
            </Box>
          </Grid>

          {/* Vista Previa */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{
              p: 1.75,
              borderRadius: '12px',
              background: alpha(brand, 0.08),
              border: `1px solid ${alpha(brand, 0.2)}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
            }}>
              <Box
                sx={{
                  width: 44, height: 44, borderRadius: '10px', flexShrink: 0,
                  bgcolor: formData.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <CategoryIcon sx={{ color: 'white', fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={700} sx={{ color: brand }}>
                  {formData.nombre || 'Nombre del área'}
                </Typography>
                <Typography variant="caption" sx={{ color: alpha(brand, 0.7) }}>
                  Orden: {formData.orden}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      {/* ── FOOTER ── */}
      <Box sx={{ px: 3, pb: 3, pt: 2, display: 'flex', alignItems: 'center', gap: 1, borderTop: `1px solid ${borderField}` }}>
        <Box sx={{ flex: 1 }} />
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ borderRadius: '10px', color: 'text.secondary', px: 2, textTransform: 'none', fontWeight: 600, '&:hover': { background: 'rgba(255,255,255,0.05)' } }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={loading}
          onClick={handleSave}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : (editingArea ? <EditIcon /> : <AddIcon />)}
          sx={{
            borderRadius: '10px', px: 3, fontWeight: 700, textTransform: 'none',
            background: brand, color: isDark ? '#000' : '#fff',
            boxShadow: `0 4px 16px ${alpha(brand, 0.4)}`,
            '&:hover': { background: isDark ? '#eab308' : '#01579b', boxShadow: `0 6px 20px ${alpha(brand, 0.5)}` },
            '&.Mui-disabled': { opacity: 0.3, background: brand, color: isDark ? '#000' : '#fff' },
          }}
        >
          {loading ? 'Guardando...' : (editingArea ? 'Actualizar Área' : 'Crear Área')}
        </Button>
      </Box>
    </Dialog>
  );
};