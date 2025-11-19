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
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { NivelAcademico, NivelFormData } from '../../services/niveles';

interface NivelFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: NivelFormData) => Promise<void>;
  editingNivel: NivelAcademico | null;
  loading?: boolean;
  niveles: NivelAcademico[];
}

const colores = ['#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3'];
const iconos = ['🎨', '📚', '🎓', '🔬', '🎭', '⚽'];

export const NivelFormDialog: React.FC<NivelFormDialogProps> = ({
  open,
  onClose,
  onSave,
  editingNivel,
  loading = false,
  niveles
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState<NivelFormData>({
    nombre: '',
    codigo: '',
    descripcion: '',
    orden: 0,
    edad_minima: undefined,
    edad_maxima: undefined,
    activo: true,
    color: '#4ECDC4',
    icono: '📚'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos al editar
  useEffect(() => {
    if (editingNivel) {
      setFormData({
        nombre: editingNivel.nombre,
        codigo: editingNivel.codigo,
        descripcion: editingNivel.descripcion || '',
        orden: editingNivel.orden,
        edad_minima: editingNivel.edad_minima,
        edad_maxima: editingNivel.edad_maxima,
        activo: editingNivel.activo,
        color: editingNivel.color || '#4ECDC4',
        icono: editingNivel.icono || '📚'
      });
    } else {
      setFormData({
        nombre: '',
        codigo: '',
        descripcion: '',
        orden: niveles.length + 1,
        edad_minima: undefined,
        edad_maxima: undefined,
        activo: true,
        color: '#4ECDC4',
        icono: '📚'
      });
    }
    setErrors({});
  }, [editingNivel, open, niveles.length]);

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    if (formData.edad_minima && formData.edad_maxima) {
      if (formData.edad_maxima <= formData.edad_minima) {
        newErrors.edad_maxima = 'La edad máxima debe ser mayor a la edad mínima';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar guardado
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (field: keyof NivelFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'number' 
      ? (e.target.value ? parseInt(e.target.value) : undefined)
      : e.target.value;
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Auto-generar código si está vacío
    if (field === 'nombre' && !editingNivel && !formData.codigo) {
      const codigo = String(value)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 10);
      setFormData(prev => ({ ...prev, codigo }));
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
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
            bgcolor: editingNivel ? 'warning.main' : 'success.main',
            width: 48,
            height: 48
          }}>
            {editingNivel ? <EditIcon /> : <AddIcon />}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="800">
              {editingNivel ? '✏️ Editar Nivel Académico' : '➕ Nuevo Nivel Académico'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {editingNivel ? 'Modifica la información del nivel' : 'Crea un nuevo nivel educativo'}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          {/* Nombre */}
          <Grid size={{xs:12, md:6}}>
            <TextField
              fullWidth
              label="Nombre del Nivel"
              value={formData.nombre}
              onChange={handleChange('nombre')}
              placeholder="Ej: Educación Primaria"
              error={!!errors.nombre}
              helperText={errors.nombre}
              InputProps={{
                startAdornment: <SchoolIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>

          {/* Código */}
          <Grid size={{xs:12, md:6}}>
            <TextField
              fullWidth
              label="Código"
              value={formData.codigo}
              onChange={handleChange('codigo')}
              placeholder="Se genera automáticamente"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>

          {/* Descripción */}
          <Grid size={{xs:12}}>
            <TextField
              fullWidth
              label="Descripción (opcional)"
              value={formData.descripcion}
              onChange={handleChange('descripcion')}
              placeholder="Describe el nivel académico"
              multiline
              rows={2}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>

          {/* Orden */}
          <Grid size={{xs:12, md:4}}>
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

          {/* Edad Mínima */}
          <Grid size={{xs:12, md:4}}>
            <TextField
              fullWidth
              type="number"
              label="Edad Mínima (opcional)"
              value={formData.edad_minima || ''}
              onChange={handleChange('edad_minima')}
              placeholder="Ej: 6"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>

          {/* Edad Máxima */}
          <Grid size={{xs:12, md:4}}>
            <TextField
              fullWidth
              type="number"
              label="Edad Máxima (opcional)"
              value={formData.edad_maxima || ''}
              onChange={handleChange('edad_maxima')}
              placeholder="Ej: 12"
              error={!!errors.edad_maxima}
              helperText={errors.edad_maxima}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>

          {/* Color Identificador */}
          <Grid size={{xs:12, md:6}}>
            <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>
              Color Identificador
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {colores.map((color) => (
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

          {/* Ícono Representativo */}
          <Grid size={{xs:12, md:6}}>
            <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>
              Ícono Representativo
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {iconos.map((icon) => (
                <Tooltip key={icon} title={icon}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: alpha(formData.color || '#4ECDC4', 0.2),
                      cursor: 'pointer',
                      fontSize: '1.5rem',
                      border: formData.icono === icon 
                        ? `3px solid ${formData.color}` 
                        : '2px solid transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.2)',
                        bgcolor: alpha(formData.color || '#4ECDC4', 0.4)
                      }
                    }}
                    onClick={() => setFormData({ ...formData, icono: icon })}
                  >
                    {icon}
                  </Avatar>
                </Tooltip>
              ))}
            </Box>
          </Grid>

          {/* Vista Previa */}
          <Grid size={{xs:12}}>
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
                  bgcolor: formData.color, 
                  fontSize: '1.5rem' 
                }}>
                  {formData.icono}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="700">
                    {formData.nombre || 'Nombre del nivel'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Orden: {formData.orden}
                    {formData.edad_minima && formData.edad_maxima && 
                      ` | Edades: ${formData.edad_minima}-${formData.edad_maxima} años`
                    }
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
          startIcon={editingNivel ? <EditIcon /> : <AddIcon />}
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
          {loading ? 'Guardando...' : (editingNivel ? 'Actualizar Nivel' : 'Crear Nivel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};