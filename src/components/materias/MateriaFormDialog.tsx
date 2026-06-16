import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  alpha,
  useTheme,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  MenuBook as MenuBookIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
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
  const isDark = theme.palette.mode === 'dark';

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
              {editingMateria ? 'Editar materia' : 'Nueva materia'}
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
                {editingMateria ? <EditIcon sx={{ color: brand, fontSize: 18 }} /> : <AddIcon sx={{ color: brand, fontSize: 18 }} />}
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', lineHeight: 1.1, color: 'text.primary' }}>
                {editingMateria ? 'Editar Materia' : 'Materia'}
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
              {editingMateria ? 'Modifica la información de la materia' : 'Crea una nueva materia'}
            </Typography>
          </Grid>

          {/* Área de Conocimiento */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              select
              label="Área de Conocimiento"
              value={formData.area_conocimiento_id || (areas.length > 0 ? areas[0].id : '')}
              onChange={handleChange('area_conocimiento_id')}
              error={!!errors.area_conocimiento_id}
              helperText={errors.area_conocimiento_id}
              sx={fieldSx}
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
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Código"
              value={formData.codigo}
              onChange={handleChange('codigo')}
              placeholder="Ej: MAT101"
              error={!!errors.codigo}
              helperText={errors.codigo}
              sx={fieldSx}
            />
          </Grid>

          {/* Nombre */}
          <Grid size={{ xs: 12 }}>
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
              placeholder="Describe la materia"
              multiline
              rows={2}
              sx={fieldSx}
            />
          </Grid>

          {/* Horas Semanales */}
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="Horas Semanales"
              value={formData.horas_semanales}
              onChange={handleChange('horas_semanales')}
              inputProps={{ min: 0, max: 40 }}
              sx={fieldSx}
            />
          </Grid>

          {/* Créditos */}
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="Créditos"
              value={formData.creditos}
              onChange={handleChange('creditos')}
              inputProps={{ min: 0, max: 20 }}
              sx={fieldSx}
            />
          </Grid>

          {/* Color (heredado del área) */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{
              p: 1.75,
              borderRadius: '12px',
              border: `1px solid ${alpha(areaSeleccionada?.color || brand, 0.25)}`,
              background: alpha(areaSeleccionada?.color || brand, 0.08),
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              height: '100%',
            }}>
              <Box
                sx={{
                  width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
                  bgcolor: areaSeleccionada?.color || brand,
                }}
              />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Color del Área
                </Typography>
                <Typography variant="body2" fontWeight={700} sx={{ color: areaSeleccionada?.color || brand }}>
                  {areaSeleccionada?.nombre || '—'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Switches */}
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.es_obligatoria}
                  onChange={handleChange('es_obligatoria')}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: brand },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: brand },
                  }}
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

          <Grid size={{ xs: 12, md: 4 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.tiene_laboratorio}
                  onChange={handleChange('tiene_laboratorio')}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: brand },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: brand },
                  }}
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

          <Grid size={{ xs: 12, md: 4 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.activo}
                  onChange={handleChange('activo')}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: brand },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: brand },
                  }}
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
          <Grid size={{ xs: 12 }}>
            <Box sx={{
              p: 1.75,
              borderRadius: '12px',
              background: alpha(brand, 0.08),
              border: `1px solid ${alpha(brand, 0.2)}`,
            }}>
              <Typography variant="caption" sx={{ color: alpha(brand, 0.8), mb: 1, display: 'block', fontWeight: 700 }}>
                Resumen
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`${formData.horas_semanales}h semanales`}
                  size="small"
                  sx={{ borderRadius: '8px', fontWeight: 600, bgcolor: alpha(brand, 0.15), color: brand, border: `1px solid ${alpha(brand, 0.3)}` }}
                />
                <Chip
                  label={`${formData.creditos} créditos`}
                  size="small"
                  sx={{ borderRadius: '8px', fontWeight: 600, bgcolor: alpha(brand, 0.15), color: brand, border: `1px solid ${alpha(brand, 0.3)}` }}
                />
                {formData.es_obligatoria && (
                  <Chip label="Obligatoria" size="small" sx={{ borderRadius: '8px', fontWeight: 600 }} color="error" />
                )}
                {formData.tiene_laboratorio && (
                  <Chip label="Con Laboratorio" size="small" sx={{ borderRadius: '8px', fontWeight: 600 }} color="warning" />
                )}
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
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : (editingMateria ? <EditIcon /> : <AddIcon />)}
          sx={{
            borderRadius: '10px', px: 3, fontWeight: 700, textTransform: 'none',
            background: brand, color: isDark ? '#000' : '#fff',
            boxShadow: `0 4px 16px ${alpha(brand, 0.4)}`,
            '&:hover': { background: isDark ? '#eab308' : '#01579b', boxShadow: `0 6px 20px ${alpha(brand, 0.5)}` },
            '&.Mui-disabled': { opacity: 0.3, background: brand, color: isDark ? '#000' : '#fff' },
          }}
        >
          {loading ? 'Guardando...' : (editingMateria ? 'Actualizar Materia' : 'Crear Materia')}
        </Button>
      </Box>
    </Dialog>
  );
};