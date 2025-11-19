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
  MenuItem,
  Divider,
  Fade,
  alpha,
  useTheme,
  Tooltip,
  Alert,
  Chip,
  Card
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ClassIcon from '@mui/icons-material/Class';
import GroupsIcon from '@mui/icons-material/Groups';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Paralelo, ParaleloFormData, Turno } from '../../services/paralelos';
import paralelosService from '../../services/paralelos';

interface Grado {
  id: number;
  nombre: string;
}

interface ParaleloFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ParaleloFormData) => Promise<void>;
  editingParalelo: Paralelo | null;
  loading?: boolean;
  grados: Grado[];
  turnos: Turno[];
  anioActual: number;
}

export const ParaleloFormDialog: React.FC<ParaleloFormDialogProps> = ({
  open,
  onClose,
  onSave,
  editingParalelo,
  loading = false,
  grados,
  turnos,
  anioActual
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState<ParaleloFormData>({
    grado_id: 0,
    turno_id: 0,
    nombre: '',
    capacidad_maxima: 30,
    capacidad_minima: 15,
    anio: anioActual,
    aula: '',
    activo: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const letrasParalelos = paralelosService.generarNombresParalelos();

  useEffect(() => {
    if (editingParalelo) {
      setFormData({
        grado_id: editingParalelo.grado_id,
        turno_id: editingParalelo.turno_id,
        nombre: editingParalelo.nombre,
        capacidad_maxima: editingParalelo.capacidad_maxima,
        capacidad_minima: editingParalelo.capacidad_minima,
        anio: editingParalelo.anio,
        aula: editingParalelo.aula || '',
        activo: editingParalelo.activo
      });
    } else {
      setFormData({
        grado_id: grados.length > 0 ? grados[0].id : 0,
        turno_id: turnos.length > 0 ? turnos[0].id : 0,
        nombre: '',
        capacidad_maxima: 30,
        capacidad_minima: 15,
        anio: anioActual,
        aula: '',
        activo: true
      });
    }
    setErrors({});
  }, [editingParalelo, open, grados, turnos, anioActual]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre) {
      newErrors.nombre = 'Selecciona la letra del paralelo';
    }

    if (!formData.grado_id) {
      newErrors.grado_id = 'Selecciona un grado';
    }

    if (!formData.turno_id) {
      newErrors.turno_id = 'Selecciona un turno';
    }

    const capacidadError = paralelosService.validarCapacidades(
      formData.capacidad_minima || 0,
      formData.capacidad_maxima || 0
    );

    if (capacidadError) {
      newErrors.capacidad = capacidadError;
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

  const handleChange = (field: keyof ParaleloFormData) => (
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

  const turnoSeleccionado = turnos.find(t => t.id === formData.turno_id);
  const gradoSeleccionado = grados.find(g => g.id === formData.grado_id);

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
            bgcolor: editingParalelo ? 'warning.main' : 'success.main',
            width: 48,
            height: 48
          }}>
            {editingParalelo ? <EditIcon /> : <AddIcon />}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="800">
              {editingParalelo ? '✏️ Editar Paralelo' : '➕ Nuevo Paralelo'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {editingParalelo ? `Modificar ${editingParalelo.nombre}` : 'Crear nueva sección'}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          {/* Grado */}
          <Grid size={{xs:12, md:6}}>
            <TextField
              fullWidth
              select
              label="Grado"
              value={formData.grado_id}
              onChange={handleChange('grado_id')}
              error={!!errors.grado_id}
              helperText={errors.grado_id}
              InputProps={{
                startAdornment: <ClassIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            >
              {grados.map((grado) => (
                <MenuItem key={grado.id} value={grado.id}>
                  {grado.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Turno */}
          <Grid size={{xs:12, md:6}}>
            <TextField
              fullWidth
              select
              label="Turno"
              value={formData.turno_id}
              onChange={handleChange('turno_id')}
              error={!!errors.turno_id}
              helperText={errors.turno_id}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            >
              {turnos.map((turno) => (
                <MenuItem key={turno.id} value={turno.id}>
                  {turno.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Selector de Letra */}
          <Grid size={{xs:12}}>
            <Typography variant="body2" fontWeight="600" sx={{ mb: 1.5 }}>
              Identificación del Paralelo *
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {letrasParalelos.map((letra) => (
                <Tooltip key={letra} title={`Paralelo ${letra}`}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: formData.nombre === letra ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.1),
                      color: formData.nombre === letra ? 'white' : theme.palette.primary.main,
                      cursor: 'pointer',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      border: formData.nombre === letra ? `3px solid ${theme.palette.primary.main}` : '2px solid transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.15)',
                        bgcolor: theme.palette.primary.main,
                        color: 'white',
                        boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.4)}`
                      }
                    }}
                    onClick={() => setFormData({ ...formData, nombre: letra })}
                  >
                    {letra}
                  </Avatar>
                </Tooltip>
              ))}
            </Box>
            {errors.nombre && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                {errors.nombre}
              </Typography>
            )}
          </Grid>

          {/* Capacidades */}
          <Grid size={{xs:12, md:6}}>
            <TextField
              fullWidth
              type="number"
              label="Capacidad Mínima"
              value={formData.capacidad_minima}
              onChange={handleChange('capacidad_minima')}
              inputProps={{ min: 5, max: 50 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>

          <Grid size={{xs:12, md:6}}>
            <TextField
              fullWidth
              type="number"
              label="Capacidad Máxima"
              value={formData.capacidad_maxima}
              onChange={handleChange('capacidad_maxima')}
              error={!!errors.capacidad}
              helperText={errors.capacidad}
              inputProps={{ min: 5, max: 50 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>

          {/* Aula */}
          <Grid size={{xs:12, md:6}}>
            <TextField
              fullWidth
              label="Aula (opcional)"
              value={formData.aula}
              onChange={handleChange('aula')}
              placeholder="Ej: 101, A-203"
              InputProps={{
                startAdornment: <span style={{ marginRight: 8 }}>🚪</span>
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>

          {/* Año */}
          <Grid size={{xs:12, md:6}}>
            <TextField
              fullWidth
              type="number"
              label="Año"
              value={formData.anio}
              onChange={handleChange('anio')}
              inputProps={{ min: 2020, max: 2030 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>

          {/* Preview */}
          <Grid size={{xs:12}}>
            <Divider sx={{ my: 1 }} />
            <Box sx={{
              p: 2,
              bgcolor: alpha(theme.palette.info.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                💡 <strong>Vista previa:</strong>
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={`Paralelo ${formData.nombre || '?'}`} 
                  color="primary" 
                  sx={{ fontWeight: 'bold' }}
                />
                <Chip 
                  label={gradoSeleccionado?.nombre || 'Sin grado'} 
                  variant="outlined"
                />
                <Chip 
                  label={turnoSeleccionado?.nombre || 'Sin turno'} 
                  variant="outlined"
                />
                <Chip 
                  icon={<GroupsIcon />}
                  label={`${formData.capacidad_minima} - ${formData.capacidad_maxima} estudiantes`} 
                  variant="outlined"
                />
                {formData.aula && (
                  <Chip 
                    label={`🚪 Aula ${formData.aula}`} 
                    variant="outlined"
                  />
                )}
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
          startIcon={editingParalelo ? <EditIcon /> : <AddIcon />}
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
          {loading ? 'Guardando...' : (editingParalelo ? 'Actualizar Paralelo' : 'Crear Paralelo')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};