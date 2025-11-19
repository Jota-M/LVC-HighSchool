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
  alpha,
  useTheme,
  Fade
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ClassIcon from '@mui/icons-material/Class';
import { Grado, GradoFormData, NivelAcademico } from '../../services/niveles';

interface GradoFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: GradoFormData) => Promise<void>;
  editingGrado: { nivel_id: number; grado: Grado | null };
  loading?: boolean;
  niveles: NivelAcademico[];
}

export const GradoFormDialog: React.FC<GradoFormDialogProps> = ({
  open,
  onClose,
  onSave,
  editingGrado,
  loading = false,
  niveles
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState<GradoFormData>({
    nivel_academico_id: 0,
    nombre: '',
    codigo: '',
    descripcion: '',
    orden: 0,
    activo: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Obtener el nivel actual
  const nivelActual = niveles.find(n => n.id === editingGrado.nivel_id);

  // Cargar datos al abrir el diálogo
  useEffect(() => {
    if (editingGrado.grado) {
      // Editando grado existente
      setFormData({
        nivel_academico_id: editingGrado.grado.nivel_academico_id,
        nombre: editingGrado.grado.nombre,
        codigo: editingGrado.grado.codigo,
        descripcion: editingGrado.grado.descripcion || '',
        orden: editingGrado.grado.orden,
        activo: editingGrado.grado.activo
      });
    } else {
      // Nuevo grado
      const gradosCount = nivelActual?.grados?.length || 0;
      setFormData({
        nivel_academico_id: editingGrado.nivel_id,
        nombre: '',
        codigo: '',
        descripcion: '',
        orden: gradosCount + 1,
        activo: true
      });
    }
    setErrors({});
  }, [editingGrado, nivelActual, open]);

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
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
  const handleChange = (field: keyof GradoFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'number' 
      ? (e.target.value ? parseInt(e.target.value) : 0)
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
    if (field === 'nombre' && !editingGrado.grado && !formData.codigo) {
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
        background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ 
            bgcolor: editingGrado.grado ? 'warning.main' : 'success.main',
            width: 48,
            height: 48
          }}>
            {editingGrado.grado ? <EditIcon /> : <AddIcon />}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="800">
              {editingGrado.grado ? '✏️ Editar Grado' : '➕ Nuevo Grado'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {nivelActual?.nombre || 'Nivel Académico'}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          {/* Nombre */}
          <Grid size={{xs:12}}>
            <TextField
              fullWidth
              label="Nombre del Grado"
              value={formData.nombre}
              onChange={handleChange('nombre')}
              placeholder="Ej: 1ro de Primaria"
              error={!!errors.nombre}
              helperText={errors.nombre}
              InputProps={{
                startAdornment: <ClassIcon sx={{ mr: 1, color: 'action.active' }} />
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

          {/* Orden */}
          <Grid size={{xs:12, md:6}}>
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

          {/* Descripción */}
          <Grid size={{xs:12}}>
            <TextField
              fullWidth
              label="Descripción (opcional)"
              value={formData.descripcion}
              onChange={handleChange('descripcion')}
              placeholder="Describe el grado"
              multiline
              rows={2}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>

          {/* Tip */}
          <Grid size={{xs:12}}>
            <Box sx={{
              p: 2,
              bgcolor: alpha(theme.palette.success.main, 0.05),
              borderRadius: 2,
              border: `1px dashed ${alpha(theme.palette.success.main, 0.3)}`
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                ✨ <strong>Tip:</strong> Usa nombres descriptivos como "1ro de Primaria", "Kinder A", "5to de Secundaria"
              </Typography>
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
          startIcon={editingGrado.grado ? <EditIcon /> : <AddIcon />}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            px: 4,
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
            boxShadow: `0 8px 16px ${alpha(theme.palette.secondary.main, 0.4)}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 12px 24px ${alpha(theme.palette.secondary.main, 0.5)}`,
            }
          }}
        >
          {loading ? 'Guardando...' : (editingGrado.grado ? 'Actualizar Grado' : 'Crear Grado')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};