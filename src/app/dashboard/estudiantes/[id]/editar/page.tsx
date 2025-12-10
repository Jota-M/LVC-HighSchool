// pages/EstudianteEditar.tsx
'use client';
import React, { useState, useEffect, use } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  IconButton,
  Avatar,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  useTheme,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  CameraAlt as CameraIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Accessible as AccessibleIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useParams, useRouter } from 'next/navigation';
import { useEstudiante } from '@/hooks/useEstudiantes';
import { useEstudiantes } from '@/hooks/useEstudiantes';
import dayjs, { Dayjs } from 'dayjs';
import { EstudianteUpdate } from '@/types/estudianteTypes';

const generoOptions = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
];

export const EstudianteEditar: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { estudiante, isLoading: isLoadingEstudiante } = useEstudiante(id ? parseInt(id) : null);
  const { actualizar, eliminarFoto, isUpdating } = useEstudiantes();

  const [formData, setFormData] = useState<EstudianteUpdate>({
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    fecha_nacimiento: '',
    ci: '',
    lugar_nacimiento: '',
    genero: undefined,
    direccion: '',
    zona: '',
    ciudad: '',
    telefono: '',
    email: '',
    contacto_emergencia: '',
    telefono_emergencia: '',
    tiene_discapacidad: false,
    tipo_discapacidad: '',
    observaciones: '',
    activo: true,
  });

  const [fechaNacimiento, setFechaNacimiento] = useState<Dayjs | null>(null);
  const [nuevaFoto, setNuevaFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [deletePhotoDialog, setDeletePhotoDialog] = useState(false);

  // Cargar datos del estudiante
  useEffect(() => {
    if (estudiante) {
      setFormData({
        nombres: estudiante.nombres,
        apellido_paterno: estudiante.apellido_paterno,
        apellido_materno: estudiante.apellido_materno || '',
        fecha_nacimiento: estudiante.fecha_nacimiento,
        ci: estudiante.ci || '',
        lugar_nacimiento: estudiante.lugar_nacimiento || '',
        genero: estudiante.genero as any,
        direccion: estudiante.direccion || '',
        zona: estudiante.zona || '',
        ciudad: estudiante.ciudad || '',
        telefono: estudiante.telefono || '',
        email: estudiante.email || '',
        contacto_emergencia: estudiante.contacto_emergencia || '',
        telefono_emergencia: estudiante.telefono_emergencia || '',
        tiene_discapacidad: estudiante.tiene_discapacidad || false,
        tipo_discapacidad: estudiante.tipo_discapacidad || '',
        observaciones: estudiante.observaciones || '',
        activo: estudiante.activo,
      });

      setFechaNacimiento(dayjs(estudiante.fecha_nacimiento));
      setFotoPreview(estudiante.foto_url || null);
    }
  }, [estudiante]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNuevaFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setFotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePhoto = async () => {
    if (!id) return;
    await eliminarFoto(parseInt(id));
    setFotoPreview(null);
    setNuevaFoto(null);
    setDeletePhotoDialog(false);
  };

  const handleSubmit = async () => {
    if (!id) return;

    const dataToUpdate = {
      ...formData,
      fecha_nacimiento: fechaNacimiento ? fechaNacimiento.format('YYYY-MM-DD') : formData.fecha_nacimiento,
    };

    await actualizar({
      id: parseInt(id),
      data: dataToUpdate,
      foto: nuevaFoto || undefined,
    });

    router.push(`/dashboard/estudiantes/${id}`);
  };

  const fieldStyle = {
    width: '100%',
    '& .MuiInputBase-root': {
      borderRadius: '12px',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.9)',
    },
  };

  if (isLoadingEstudiante) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDark
            ? 'linear-gradient(135deg, #090B26, #000000)'
            : 'linear-gradient(135deg, #fdfcfb, #B9BED4)',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!estudiante) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDark
            ? 'linear-gradient(135deg, #090B26, #000000)'
            : 'linear-gradient(135deg, #fdfcfb, #B9BED4)',
        }}
      >
        <Alert severity="error">Estudiante no encontrado</Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          minHeight: '100vh',
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Fade in timeout={500}>
            <Box>
              {/* Header */}
              <Box sx={{ mb: 3 }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => router.push(`/dashboard/estudiantes/${id}`)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    color: isDark ? '#facc15' : '#0288d1',
                    mb: 2,
                  }}
                >
                  Volver al perfil
                </Button>

                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    background: isDark
                      ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                  }}
                >
                  Editar Estudiante
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Modifica la información del estudiante
                </Typography>
              </Box>

              {/* Formulario */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 5 },
                  borderRadius: '24px',
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* Foto */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={fotoPreview || undefined}
                      sx={{
                        width: 150,
                        height: 150,
                        border: '4px solid',
                        borderColor: isDark ? '#facc15' : '#0288d1',
                        fontSize: '3rem',
                        fontWeight: 700,
                        bgcolor: isDark ? '#facc15' : '#0288d1',
                        color: isDark ? '#000' : '#fff',
                      }}
                    >
                      {!fotoPreview &&
                        `${formData.nombres?.charAt(0) || ''}${formData.apellido_paterno?.charAt(0) || ''}`}
                    </Avatar>

                    <IconButton
                      component="label"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        backgroundColor: isDark ? '#facc15' : '#0288d1',
                        color: isDark ? '#000' : '#fff',
                        '&:hover': {
                          backgroundColor: isDark ? '#eab308' : '#0277bd',
                        },
                      }}
                    >
                      <CameraIcon />
                      <input type="file" accept="image/*" onChange={handleFotoChange} hidden />
                    </IconButton>

                    {fotoPreview && (
                      <IconButton
                        onClick={() => setDeletePhotoDialog(true)}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          backgroundColor: '#ef4444',
                          color: '#fff',
                          '&:hover': {
                            backgroundColor: '#dc2626',
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                </Box>

                {/* Sección: Información Personal */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <PersonIcon sx={{ fontSize: 28, color: isDark ? '#facc15' : '#0288d1' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Información Personal
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid size={{xs:12, md:6}} >
                      <TextField
                        fullWidth
                        size="small"
                        label="Nombres *"
                        value={formData.nombres}
                        onChange={(e) => handleChange('nombres', e.target.value)}
                        sx={fieldStyle}
                        required
                      />
                    </Grid>
                    <Grid size={{xs:12, md:3}}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Apellido Paterno *"
                        value={formData.apellido_paterno}
                        onChange={(e) => handleChange('apellido_paterno', e.target.value)}
                        sx={fieldStyle}
                        required
                      />
                    </Grid>
                    <Grid size={{xs:12, md:3}}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Apellido Materno"
                        value={formData.apellido_materno}
                        onChange={(e) => handleChange('apellido_materno', e.target.value)}
                        sx={fieldStyle}
                      />
                    </Grid>

                    <Grid size={{xs:12, md:3}}>
                      <DatePicker
                        label="Fecha de Nacimiento *"
                        value={fechaNacimiento}
                        onChange={(date) => setFechaNacimiento(date)}
                        sx={fieldStyle}
                        slotProps={{ textField: { fullWidth: true, size: 'small', required: true } }}
                      />
                    </Grid>
                    <Grid size={{xs:12, md:3}}>
                      <TextField
                        fullWidth
                        size="small"
                        label="CI"
                        value={formData.ci}
                        onChange={(e) => handleChange('ci', e.target.value)}
                        sx={fieldStyle}
                      />
                    </Grid>
                    <Grid size={{xs:12, md:3}}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Lugar de Nacimiento"
                        value={formData.lugar_nacimiento}
                        onChange={(e) => handleChange('lugar_nacimiento', e.target.value)}
                        sx={fieldStyle}
                      />
                    </Grid>
                    <Grid size={{xs:12, md:3}}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Género"
                        value={formData.genero || ''}
                        onChange={(e) => handleChange('genero', e.target.value)}
                        sx={fieldStyle}
                      >
                        {generoOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </Grid>
                </Box>

                {/* Sección: Contacto y Ubicación */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <HomeIcon sx={{ fontSize: 28, color: isDark ? '#facc15' : '#0288d1' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Contacto y Ubicación
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid size={{xs:12, md:9}}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Dirección"
                        value={formData.direccion}
                        onChange={(e) => handleChange('direccion', e.target.value)}
                        sx={fieldStyle}
                      />
                    </Grid>
                    <Grid size={{xs:12, md:3}}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Zona"
                        value={formData.zona}
                        onChange={(e) => handleChange('zona', e.target.value)}
                        sx={fieldStyle}
                      />
                    </Grid>

                    <Grid size={{xs:12, md:4}}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Ciudad"
                        value={formData.ciudad}
                        onChange={(e) => handleChange('ciudad', e.target.value)}
                        sx={fieldStyle}
                      />
                    </Grid>
                    <Grid size={{xs:12, md:4}}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Teléfono"
                        value={formData.telefono}
                        onChange={(e) => handleChange('telefono', e.target.value)}
                        InputProps={{
                          startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
                        }}
                        sx={fieldStyle}
                      />
                    </Grid>
                    <Grid size={{xs:12, md:4}}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        InputProps={{
                          startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
                        }}
                        sx={fieldStyle}
                      />
                    </Grid>

                    <Grid size={{xs:12, md:6}}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Contacto de Emergencia"
                        value={formData.contacto_emergencia}
                        onChange={(e) => handleChange('contacto_emergencia', e.target.value)}
                        sx={fieldStyle}
                      />
                    </Grid>
                    <Grid size={{xs:12, md:6}}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Teléfono de Emergencia"
                        value={formData.telefono_emergencia}
                        onChange={(e) => handleChange('telefono_emergencia', e.target.value)}
                        sx={fieldStyle}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Sección: Información Adicional */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <AccessibleIcon sx={{ fontSize: 28, color: isDark ? '#facc15' : '#0288d1' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Información Adicional
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid size={{xs:12}}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.tiene_discapacidad}
                            onChange={(e) => handleChange('tiene_discapacidad', e.target.checked)}
                          />
                        }
                        label="¿Tiene alguna discapacidad?"
                      />
                    </Grid>

                    {formData.tiene_discapacidad && (
                      <Grid size={{xs:12}}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Tipo de discapacidad"
                          value={formData.tipo_discapacidad}
                          onChange={(e) => handleChange('tipo_discapacidad', e.target.value)}
                          sx={fieldStyle}
                        />
                      </Grid>
                    )}

                    <Grid size={{xs:12}}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Observaciones"
                        value={formData.observaciones}
                        onChange={(e) => handleChange('observaciones', e.target.value)}
                        sx={fieldStyle}
                      />
                    </Grid>

                    <Grid size={{xs:12}}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.activo}
                            onChange={(e) => handleChange('activo', e.target.checked)}
                          />
                        }
                        label="Estudiante activo"
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Botones de acción */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Button
                    variant="outlined"
                    onClick={() => router.push(`/dashboard/estudiantes/${id}`)}
                    disabled={isUpdating}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 4,
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={isUpdating ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleSubmit}
                    disabled={isUpdating}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 4,
                      background: isDark
                        ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                        : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                      color: isDark ? '#000' : '#fff',
                    }}
                  >
                    {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Fade>
        </Container>

        {/* Dialog para confirmar eliminación de foto */}
        <Dialog
          open={deletePhotoDialog}
          onClose={() => setDeletePhotoDialog(false)}
          PaperProps={{
            sx: {
              borderRadius: '20px',
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>¿Eliminar foto?</DialogTitle>
          <DialogContent>
            <Typography>¿Estás seguro de que deseas eliminar la foto del estudiante?</Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              onClick={() => setDeletePhotoDialog(false)}
              variant="outlined"
              sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeletePhoto}
              variant="contained"
              color="error"
              sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
            >
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default EstudianteEditar;