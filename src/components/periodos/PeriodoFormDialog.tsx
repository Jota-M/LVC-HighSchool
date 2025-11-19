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
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Divider,
  Fade,
  alpha,
  useTheme,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import EventNoteIcon from '@mui/icons-material/EventNote';
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
  loading = false
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState<PeriodoFormData>({
    nombre: '',
    codigo: '',
    fecha_inicio: '',
    fecha_fin: '',
    activo: false,
    permite_inscripciones: true,
    permite_calificaciones: true,
    observaciones: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos al editar
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
        observaciones: editingPeriodo.observaciones || ''
      });
    } else {
      setFormData({
        nombre: '',
        codigo: '',
        fecha_inicio: '',
        fecha_fin: '',
        activo: false,
        permite_inscripciones: true,
        permite_calificaciones: true,
        observaciones: ''
      });
    }
    setErrors({});
  }, [editingPeriodo, open]);

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código es requerido';
    }

    if (!formData.fecha_inicio) {
      newErrors.fecha_inicio = 'La fecha de inicio es requerida';
    }

    if (!formData.fecha_fin) {
      newErrors.fecha_fin = 'La fecha de fin es requerida';
    }

    if (formData.fecha_inicio && formData.fecha_fin) {
      const inicio = new Date(formData.fecha_inicio);
      const fin = new Date(formData.fecha_fin);
      
      if (fin <= inicio) {
        newErrors.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
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
  const handleChange = (field: keyof PeriodoFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
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
            bgcolor: editingPeriodo ? 'warning.main' : 'success.main',
            width: 48,
            height: 48
          }}>
            {editingPeriodo ? <EditIcon /> : <AddIcon />}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="800">
              {editingPeriodo ? '✏️ Editar Periodo' : '➕ Nuevo Periodo Académico'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {editingPeriodo ? 'Modifica la información del periodo' : 'Crea un nuevo ciclo educativo'}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          {/* Nombre */}
          <Grid size={{xs:12, md:6}} >
            <TextField
              fullWidth
              label="Nombre del Periodo"
              value={formData.nombre}
              onChange={handleChange('nombre')}
              placeholder="Ej: Gestión 2025 - Primer Semestre"
              error={!!errors.nombre}
              helperText={errors.nombre}
              InputProps={{
                startAdornment: <EventNoteIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>

          {/* Código */}
          <Grid size={{xs:12, md:6}} >
            <TextField
              fullWidth
              label="Código"
              value={formData.codigo}
              onChange={handleChange('codigo')}
              placeholder="Ej: 2025-1"
              error={!!errors.codigo}
              helperText={errors.codigo}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>

          {/* Fecha Inicio */}
          <Grid size={{xs:12, md:6}} >
            <TextField
              fullWidth
              type="date"
              label="Fecha de Inicio"
              value={formData.fecha_inicio}
              onChange={handleChange('fecha_inicio')}
              error={!!errors.fecha_inicio}
              helperText={errors.fecha_inicio}
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>

          {/* Fecha Fin */}
          <Grid size={{xs:12, md:6}} >
            <TextField
              fullWidth
              type="date"
              label="Fecha de Fin"
              value={formData.fecha_fin}
              onChange={handleChange('fecha_fin')}
              error={!!errors.fecha_fin}
              helperText={errors.fecha_fin}
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>

          {/* Observaciones */}
          <Grid size={{xs:12}} >
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Observaciones (opcional)"
              value={formData.observaciones}
              onChange={handleChange('observaciones')}
              placeholder="Notas adicionales sobre el periodo..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>

          {/* Switches */}
          <Grid size={{xs:12}} >
            <Card sx={{ 
              bgcolor: alpha(theme.palette.info.main, 0.05),
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              borderRadius: 2
            }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{xs:12, sm:4}}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.activo}
                          onChange={handleChange('activo')}
                          color="primary"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            Periodo Activo
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Solo uno puede estar activo
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>

                  <Grid size={{xs:12, sm:4}}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.permite_inscripciones}
                          onChange={handleChange('permite_inscripciones')}
                          color="success"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            Permite Inscripciones
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Habilitar registro
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>

                  <Grid size={{xs:12, sm:4}}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.permite_calificaciones}
                          onChange={handleChange('permite_calificaciones')}
                          color="secondary"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            Permite Calificaciones
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Habilitar notas
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Alerta informativa */}
          <Grid size={{xs:12}} >
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="caption">
                💡 <strong>Tip:</strong> Si activas este periodo, los demás periodos activos se desactivarán automáticamente.
              </Typography>
            </Alert>
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
          startIcon={editingPeriodo ? <EditIcon /> : <AddIcon />}
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
          {loading ? 'Guardando...' : (editingPeriodo ? 'Actualizar Periodo' : 'Crear Periodo')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};