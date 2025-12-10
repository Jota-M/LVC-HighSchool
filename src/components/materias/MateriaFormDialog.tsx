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
  FormControlLabel,
  Switch,
  Fade,
  alpha,
  useTheme,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Materia, MateriaFormData, AreaConocimiento } from '../../services/materias';

interface MateriaFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: MateriaFormData) => Promise<void>;
  editingMateria: Materia | null;
  loading?: boolean;
  areas: AreaConocimiento[];
}

export const MateriaFormDialog: React.FC<MateriaFormDialogProps> = ({
  open,
  onClose,
  onSave,
  editingMateria,
  loading = false,
  areas
}) => {
  const theme = useTheme();

  const [formData, setFormData] = useState<MateriaFormData>({
    area_conocimiento_id: areas.length > 0 ? areas[0].id : 0,
    codigo: '',
    nombre: '',
    descripcion: '',
    horas_semanales: 0,
    creditos: 0,
    es_obligatoria: true,
    tiene_laboratorio: false,
    color: '',
    activo: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
  if (editingMateria) {
    setFormData({
      area_conocimiento_id: editingMateria.area_conocimiento_id,
      codigo: editingMateria.codigo,
      nombre: editingMateria.nombre,
      descripcion: editingMateria.descripcion || '',
      horas_semanales: editingMateria.horas_semanales || 0,
      creditos: editingMateria.creditos || 0,
      es_obligatoria: editingMateria.es_obligatoria,
      tiene_laboratorio: editingMateria.tiene_laboratorio,
      color: editingMateria.color || '',
      activo: editingMateria.activo
    });
  } else {
    // 🔥 ASEGURARSE que siempre haya un área válida
    const primeraArea = areas.length > 0 ? areas[0].id : undefined;
    
    setFormData({
      area_conocimiento_id: primeraArea || 1, // 🔥 Fallback a 1 si no hay áreas
      codigo: '',
      nombre: '',
      descripcion: '',
      horas_semanales: 0,
      creditos: 0,
      es_obligatoria: true,
      tiene_laboratorio: false,
      color: '',
      activo: true
    });
  }
  setErrors({});
}, [editingMateria, open, areas]);


  const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  if (!formData.nombre.trim()) {
    newErrors.nombre = 'El nombre es requerido';
  }

  if (!formData.codigo.trim()) {
    newErrors.codigo = 'El código es requerido';
  }

  // 🔥 Validación mejorada
  if (!formData.area_conocimiento_id || formData.area_conocimiento_id === 0) {
    newErrors.area_conocimiento_id = 'Selecciona un área de conocimiento';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleSave = async () => {
    if (!validateForm()) return;
console.log('📤 Datos a enviar:', formData);
  console.log('📤 Tipo de area_conocimiento_id:', typeof formData.area_conocimiento_id);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const handleChange = (field: keyof MateriaFormData) => (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  let value: any;
  
  // Determinar el tipo de valor según el campo
  if (e.target.type === 'number') {
    value = e.target.value ? parseFloat(e.target.value) : 0;
  } else if (e.target.type === 'checkbox') {
    value = (e.target as HTMLInputElement).checked;
  } else if (field === 'area_conocimiento_id') {
    // CRÍTICO: Convertir a número para el área de conocimiento
    value = parseInt(e.target.value, 10);
    console.log('🎯 Área seleccionada:', value, typeof value);
  } else {
    value = e.target.value;
  }
  
  setFormData(prev => ({ ...prev, [field]: value }));
  
  // Limpiar error del campo
  if (errors[field]) {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }

  // Auto-generar código cuando cambia el nombre
  if (field === 'nombre' && !editingMateria) {
    const area = areas.find(a => a.id === formData.area_conocimiento_id);
    if (area) {
      const codigo = `${area.nombre.substring(0, 2).toUpperCase()}${String(value).substring(0, 3).toUpperCase()}`;
      setFormData(prev => ({ ...prev, codigo }));
    }
  }
  
  // Auto-generar código cuando cambia el área
  if (field === 'area_conocimiento_id' && !editingMateria && formData.nombre) {
    const area = areas.find(a => a.id === value);
    if (area) {
      const codigo = `${area.nombre.substring(0, 2).toUpperCase()}${formData.nombre.substring(0, 3).toUpperCase()}`;
      setFormData(prev => ({ ...prev, codigo }));
    }
  }
};

  const areaSeleccionada = areas.find(a => a.id === formData.area_conocimiento_id);

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
            bgcolor: editingMateria ? 'warning.main' : 'success.main',
            width: 48,
            height: 48
          }}>
            {editingMateria ? <EditIcon /> : <AddIcon />}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="800">
              {editingMateria ? '✏️ Editar Materia' : '➕ Nueva Materia'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {editingMateria ? 'Modifica la información de la materia' : 'Crea una nueva materia'}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          {/* Área de Conocimiento */}
          <Grid size={{xs:12, md:6}}>
            <TextField
              fullWidth
              select
              label="Área de Conocimiento"
              value={formData.area_conocimiento_id || (areas.length > 0 ? areas[0].id : '')}
              onChange={handleChange('area_conocimiento_id')}
              error={!!errors.area_conocimiento_id}
              helperText={errors.area_conocimiento_id}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            >
              {areas.map((area) => (
                <MenuItem key={area.id} value={area.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      bgcolor: area.color 
                    }} />
                    {area.nombre}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Código */}
          <Grid size={{xs:12, md:6}}>
            <TextField
              fullWidth
              label="Código"
              value={formData.codigo}
              onChange={handleChange('codigo')}
              placeholder="Ej: MAT101"
              error={!!errors.codigo}
              helperText={errors.codigo}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>

          {/* Nombre */}
          <Grid size={{xs:12}}>
            <TextField
              fullWidth
              label="Nombre de la Materia"
              value={formData.nombre}
              onChange={handleChange('nombre')}
              placeholder="Ej: Matemáticas Avanzadas"
              error={!!errors.nombre}
              helperText={errors.nombre}
              InputProps={{
                startAdornment: <MenuBookIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
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
              placeholder="Describe la materia"
              multiline
              rows={2}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>

          {/* Horas Semanales */}
          <Grid size={{xs:12, md:4}}>
            <TextField
              fullWidth
              type="number"
              label="Horas Semanales"
              value={formData.horas_semanales}
              onChange={handleChange('horas_semanales')}
              inputProps={{ min: 0, max: 40 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>

          {/* Créditos */}
          <Grid size={{xs:12, md:4}}>
            <TextField
              fullWidth
              type="number"
              label="Créditos"
              value={formData.creditos}
              onChange={handleChange('creditos')}
              inputProps={{ min: 0, max: 20 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>

          {/* Color (heredado del área) */}
          <Grid size={{xs:12, md:4}}>
            <Box sx={{ 
              p: 2, 
              border: `2px dashed ${areaSeleccionada?.color || theme.palette.divider}`,
              borderRadius: 2,
              textAlign: 'center',
              bgcolor: alpha(areaSeleccionada?.color || theme.palette.primary.main, 0.05)
            }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Color del Área
              </Typography>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                bgcolor: areaSeleccionada?.color,
                mx: 'auto',
                mt: 1
              }} />
            </Box>
          </Grid>

          {/* Switches */}
          <Grid size={{xs:12, md:4}}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.es_obligatoria}
                  onChange={handleChange('es_obligatoria')}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight="600">
                    Obligatoria
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Materia requerida
                  </Typography>
                </Box>
              }
            />
          </Grid>

          <Grid size={{xs:12, md:4}}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.tiene_laboratorio}
                  onChange={handleChange('tiene_laboratorio')}
                  color="secondary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight="600">
                    Tiene Laboratorio
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Incluye prácticas
                  </Typography>
                </Box>
              }
            />
          </Grid>

          <Grid size={{xs:12, md:4}}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.activo}
                  onChange={handleChange('activo')}
                  color="success"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight="600">
                    Activo
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Disponible
                  </Typography>
                </Box>
              }
            />
          </Grid>

          {/* Resumen */}
          <Grid size={{xs:12}} >
            <Box sx={{
              p: 2,
              bgcolor: alpha(theme.palette.info.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                📊 Resumen:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={`${formData.horas_semanales}h semanales`} size="small" color="primary" variant="outlined" />
                <Chip label={`${formData.creditos} créditos`} size="small" color="secondary" variant="outlined" />
                {formData.es_obligatoria && <Chip label="Obligatoria" size="small" color="error" />}
                {formData.tiene_laboratorio && <Chip label="Con Laboratorio" size="small" color="warning" />}
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
          startIcon={editingMateria ? <EditIcon /> : <AddIcon />}
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
          {loading ? 'Guardando...' : (editingMateria ? 'Actualizar Materia' : 'Crear Materia')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};