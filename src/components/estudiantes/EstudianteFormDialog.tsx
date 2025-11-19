'use client';

import { useState, useEffect } from 'react';
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
  IconButton,
  Typography,
  MenuItem,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  Divider,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PersonIcon from '@mui/icons-material/Person';
import estudiantesService, { Estudiante, EstudianteFormData } from '../../services/estudiantesService';

interface Props {
  open: boolean;
  onClose: () => void;
  estudiante?: Estudiante; // si se pasa, estamos editando
  onSave?: (estudiante: Estudiante) => void;
}

export default function EstudianteFormDialog({ open, onClose, estudiante, onSuccess }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isEditing = !!estudiante;

  // Estados del formulario
  const [formData, setFormData] = useState<EstudianteFormData>({
  nombres: '',
  apellidos: '',
  fecha_nacimiento: '',
  genero: '',
  documento_identidad: '',
  tipo_documento: 'CI',
  direccion: '',
  telefono: '',
  email: '',
  nombre_padre: '',
  telefono_padre: '',
  email_padre: '',
  nombre_madre: '',
  telefono_madre: '',
  email_madre: '',
  contacto_emergencia: '',
  telefono_emergencia: '',
  observaciones: '',
  activo: true,
});


  const [fotoPreview, setFotoPreview] = useState<string>('');
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar datos al editar
  useEffect(() => {
    if (estudiante) {
      setFormData({
        nombres: estudiante.nombres || '',
        apellidos: estudiante.apellidos || '',
        fecha_nacimiento: estudiante.fecha_nacimiento || '',
        genero: estudiante.genero || '',
        documento_identidad: estudiante.documento_identidad || '',
        tipo_documento: estudiante.tipo_documento || 'CI',
        direccion: estudiante.direccion || '',
        telefono: estudiante.telefono || '',
        email: estudiante.email || '',
        nombre_padre: estudiante.nombre_padre || '',
        telefono_padre: estudiante.telefono_padre || '',
        email_padre: estudiante.email_padre || '',
        nombre_madre: estudiante.nombre_madre || '',
        telefono_madre: estudiante.telefono_madre || '',
        email_madre: estudiante.email_madre || '',
        contacto_emergencia: estudiante.contacto_emergencia || '',
        telefono_emergencia: estudiante.telefono_emergencia || '',
        observaciones: estudiante.observaciones || '',
        activo: estudiante.activo,
      });
      setFotoPreview(estudiante.foto_url || '');
    } else {
      resetForm();
    }
  }, [estudiante, open]);

  const resetForm = () => {
    setFormData({
      nombres: '',
      apellidos: '',
      fecha_nacimiento: '',
      genero: '',
      documento_identidad: '',
      tipo_documento: 'CI',
      direccion: '',
      telefono: '',
      email: '',
      nombre_padre: '',
      telefono_padre: '',
      email_padre: '',
      nombre_madre: '',
      telefono_madre: '',
      email_madre: '',
      contacto_emergencia: '',
      telefono_emergencia: '',
      observaciones: '',
      activo: true,
    });
    setFotoPreview('');
    setFotoFile(null);
    setError('');
  };

  const handleChange = (field: keyof EstudianteFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten archivos de imagen');
        return;
      }

      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe superar los 5MB');
        return;
      }

      setFotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.nombres.trim()) {
      setError('El nombre es requerido');
      return false;
    }
    if (!formData.apellidos.trim()) {
      setError('Los apellidos son requeridos');
      return false;
    }
    if (!formData.documento_identidad.trim()) {
      setError('El documento de identidad es requerido');
      return false;
    }
    if (!formData.fecha_nacimiento) {
      setError('La fecha de nacimiento es requerida');
      return false;
    }
    if (!formData.genero) {
      setError('El género es requerido');
      return false;
    }

    // Validar email si se proporciona
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('El email del estudiante no es válido');
      return false;
    }
    if (formData.email_padre && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_padre)) {
      setError('El email del padre no es válido');
      return false;
    }
    if (formData.email_madre && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_madre)) {
      setError('El email de la madre no es válido');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      const dataToSend: EstudianteFormData = { ...formData };
      if (fotoFile) {
        dataToSend.foto = fotoFile;
      }

      if (isEditing) {
        await estudiantesService.actualizar(estudiante.id, dataToSend);
      } else {
        await estudiantesService.crear(dataToSend);
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar el estudiante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: isDark ? '#1a1f2e' : '#fff',
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>
            {isEditing ? 'Editar Estudiante' : 'Nuevo Estudiante'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Foto */}
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={fotoPreview || '/default-avatar.png'}
                sx={{
                  width: 120,
                  height: 120,
                  border: '4px solid #0288d1',
                }}
              />
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="foto-upload"
                type="file"
                onChange={handleFotoChange}
              />
              <label htmlFor="foto-upload">
                <IconButton
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: '#0288d1',
                    color: 'white',
                    '&:hover': { backgroundColor: '#01579b' },
                  }}
                >
                  <PhotoCameraIcon />
                </IconButton>
              </label>
            </Box>
          </Grid>

          {/* Datos Personales */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
              Datos Personales
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nombres"
              value={formData.nombres}
              onChange={(e) => handleChange('nombres', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Apellidos"
              value={formData.apellidos}
              onChange={(e) => handleChange('apellidos', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Fecha de Nacimiento"
              type="date"
              value={formData.fecha_nacimiento}
              onChange={(e) => handleChange('fecha_nacimiento', e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Género"
              value={formData.genero}
              onChange={(e) => handleChange('genero', e.target.value)}
              required
            >
              <MenuItem value="Masculino">Masculino</MenuItem>
              <MenuItem value="Femenino">Femenino</MenuItem>
              <MenuItem value="Otro">Otro</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              label="Tipo Documento"
              value={formData.tipo_documento}
              onChange={(e) => handleChange('tipo_documento', e.target.value)}
            >
              <MenuItem value="CI">CI</MenuItem>
              <MenuItem value="Pasaporte">Pasaporte</MenuItem>
              <MenuItem value="Otro">Otro</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Documento de Identidad"
              value={formData.documento_identidad}
              onChange={(e) => handleChange('documento_identidad', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Dirección"
              value={formData.direccion}
              onChange={(e) => handleChange('direccion', e.target.value)}
              multiline
              rows={2}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Teléfono"
              value={formData.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </Grid>

          {/* Datos del Padre */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom sx={{ mt: 2 }}>
              Datos del Padre
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Nombre del Padre"
              value={formData.nombre_padre}
              onChange={(e) => handleChange('nombre_padre', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Teléfono del Padre"
              value={formData.telefono_padre}
              onChange={(e) => handleChange('telefono_padre', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Email del Padre"
              type="email"
              value={formData.email_padre}
              onChange={(e) => handleChange('email_padre', e.target.value)}
            />
          </Grid>

          {/* Datos de la Madre */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom sx={{ mt: 2 }}>
              Datos de la Madre
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Nombre de la Madre"
              value={formData.nombre_madre}
              onChange={(e) => handleChange('nombre_madre', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Teléfono de la Madre"
              value={formData.telefono_madre}
              onChange={(e) => handleChange('telefono_madre', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Email de la Madre"
              type="email"
              value={formData.email_madre}
              onChange={(e) => handleChange('email_madre', e.target.value)}
            />
          </Grid>

          {/* Contacto de Emergencia */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom sx={{ mt: 2 }}>
              Contacto de Emergencia
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nombre Contacto de Emergencia"
              value={formData.contacto_emergencia}
              onChange={(e) => handleChange('contacto_emergencia', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Teléfono de Emergencia"
              value={formData.telefono_emergencia}
              onChange={(e) => handleChange('telefono_emergencia', e.target.value)}
            />
          </Grid>

          {/* Observaciones */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Observaciones"
              value={formData.observaciones}
              onChange={(e) => handleChange('observaciones', e.target.value)}
              multiline
              rows={3}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.activo}
                  onChange={(e) => handleChange('activo', e.target.checked)}
                  color="primary"
                />
              }
              label="Estudiante Activo"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            background: 'linear-gradient(90deg, #0288d1, #01579b)',
            minWidth: 120,
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : isEditing ? 'Actualizar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}