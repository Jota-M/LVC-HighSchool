import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Avatar,
  Typography,
  Divider,
  Fade,
  alpha,
  useTheme,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CategoryIcon from '@mui/icons-material/Category';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
  const [formData, setFormData] = useState<AreaFormData>({
    nombre: '',
    descripcion: '',
    color: '#3B82F6',
    orden: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 500 }}
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: `0 24px 48px ${alpha(theme.palette.common.black, 0.2)}`,
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 2,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ 
            bgcolor: editingArea ? 'warning.main' : 'success.main',
            width: 48,
            height: 48
          }}>
            {editingArea ? <EditIcon /> : <AddIcon />}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="800">
              {editingArea ? '✏️ Editar Área de Conocimiento' : '➕ Nueva Área de Conocimiento'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {editingArea ? 'Modifica la información del área' : 'Crea una nueva área educativa'}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          {/* Nombre */}
          <Grid size={{xs:12}} >
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>

          {/* Descripción */}
          <Grid size={{xs:12}} >
            <TextField
              fullWidth
              label="Descripción (opcional)"
              value={formData.descripcion}
              onChange={handleChange('descripcion')}
              placeholder="Describe el área de conocimiento"
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>

          {/* Orden */}
          <Grid size={{xs:12}} >
            <TextField
              fullWidth
              type="number"
              label="Orden"
              value={formData.orden}
              onChange={handleChange('orden')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>

          {/* Color */}
          <Grid size={{xs:12}} >
            <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>
              Color Identificador
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {coloresAreas.map((color) => (
                <Tooltip key={color} title={color}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: color,
                      cursor: 'pointer',
                      border: formData.color === color 
                        ? `3px solid ${theme.palette.text.primary}` 
                        : '2px solid transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.2)',
                        boxShadow: `0 4px 12px ${alpha(color, 0.5)}`
                      }
                    }}
                    onClick={() => setFormData({ ...formData, color })}
                  >
                    {formData.color === color && <CheckCircleIcon sx={{ color: 'white' }} />}
                  </Avatar>
                </Tooltip>
              ))}
            </Box>
          </Grid>

          {/* Vista Previa */}
          <Grid size={{xs:12}} >
            <Divider sx={{ my: 1 }} />
            <Box sx={{
              p: 2,
              bgcolor: alpha(theme.palette.info.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                💡 <strong>Vista previa:</strong>
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ 
                  width: 48, 
                  height: 48, 
                  bgcolor: formData.color
                }}>
                  <CategoryIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="700">
                    {formData.nombre || 'Nombre del área'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Orden: {formData.orden}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          size="large"
          disabled={loading}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            px: 3,
            fontWeight: 600
          }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          size="large"
          disabled={loading}
          startIcon={editingArea ? <EditIcon /> : <AddIcon />}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            px: 4,
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.5)}`,
            }
          }}
        >
          {loading ? 'Guardando...' : (editingArea ? 'Actualizar Área' : 'Crear Área')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};