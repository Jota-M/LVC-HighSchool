// pages/EditarDocente.tsx - VERSIÓN MEJORADA
'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  Avatar,
  IconButton,
  CircularProgress,
  useTheme,
  alpha,
  Alert,
  Divider,
  Stack,
  Chip,
  Fade,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  PhotoCamera as PhotoIcon,
  Description as CVIcon,
  Person as PersonIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  ContactMail as ContactIcon,
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import docenteService from '@/services/docenteService';
import {
  Docente,
  ActualizarDocenteDTO,
  GENEROS,
  TIPOS_CONTRATO,
  NIVELES_FORMACION,
} from '@/types/docenteTypes';

export const EditarDocente: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const params = useParams();
  const isDark = theme.palette.mode === 'dark';
  const docenteId = parseInt(params.id as string);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [docente, setDocente] = useState<Docente | null>(null);
  const [formData, setFormData] = useState<ActualizarDocenteDTO>({});

  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>('');
  const [cv, setCV] = useState<File | null>(null);
  const [cvFileName, setCVFileName] = useState<string>('');

  // =============================================
  // CARGAR DATOS DEL DOCENTE
  // =============================================
  useEffect(() => {
    if (docenteId) {
      cargarDocente();
    }
  }, [docenteId]);

  const cargarDocente = async () => {
    setIsLoading(true);
    try {
      const response = await docenteService.obtenerPorId(docenteId);
      setDocente(response.docente);
      
      setFormData({
        nombres: response.docente.nombres,
        apellido_paterno: response.docente.apellido_paterno,
        apellido_materno: response.docente.apellido_materno || '',
        ci: response.docente.ci,
        fecha_nacimiento: response.docente.fecha_nacimiento || '',
        genero: response.docente.genero ?? undefined,
        telefono: response.docente.telefono || '',
        celular: response.docente.celular || '',
        email: response.docente.email || '',
        direccion: response.docente.direccion || '',
        titulo_profesional: response.docente.titulo_profesional || '',
        titulo_postgrado: response.docente.titulo_postgrado || '',
        especialidad: response.docente.especialidad || '',
        salario_mensual: response.docente.salario_mensual || 0,
        numero_cuenta: response.docente.numero_cuenta || '',
        fecha_contratacion: response.docente.fecha_contratacion || '',
        tipo_contrato: response.docente.tipo_contrato ?? undefined,
        nivel_formacion: response.docente.nivel_formacion ?? undefined,
        experiencia_anios: response.docente.experiencia_anios || 0,
        activo: response.docente.activo,
      });

      if (response.docente.foto_url) {
        setFotoPreview(response.docente.foto_url);
      }

      if (response.docente.cv_url) {
        const cvName = response.docente.cv_url.split('/').pop() || 'CV actual';
        setCVFileName(cvName);
      }
    } catch (error: any) {
      console.error('Error al cargar docente:', error);
      toast.error('Error al cargar los datos del docente');
      router.push('/dashboard/docentes');
    } finally {
      setIsLoading(false);
    }
  };

  // =============================================
  // MANEJADORES DE CAMBIOS
  // =============================================
  const handleInputChange = (field: keyof ActualizarDocenteDTO, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten imágenes');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La foto no debe superar los 5MB');
        return;
      }

      setFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCVChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Solo se permiten archivos PDF o Word');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('El CV no debe superar los 10MB');
        return;
      }

      setCV(file);
      setCVFileName(file.name);
    }
  };

  const handleRemoveFoto = () => {
    setFoto(null);
    setFotoPreview(docente?.foto_url || '');
  };

  const handleRemoveCV = () => {
    setCV(null);
    if (docente?.cv_url) {
      const cvName = docente.cv_url.split('/').pop() || 'CV actual';
      setCVFileName(cvName);
    } else {
      setCVFileName('');
    }
  };

  // =============================================
  // GUARDAR CAMBIOS
  // =============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombres?.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    if (!formData.apellido_paterno?.trim()) {
      toast.error('El apellido paterno es requerido');
      return;
    }
    if (!formData.ci?.trim()) {
      toast.error('El CI es requerido');
      return;
    }

    setIsSaving(true);
    try {
      await docenteService.actualizar(
        docenteId,
        formData,
        foto || undefined,
        cv || undefined
      );

      toast.success('Docente actualizado exitosamente');
      router.push(`/dashboard/docentes/${docenteId}`);
    } catch (error: any) {
      console.error('Error al actualizar docente:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar docente');
    } finally {
      setIsSaving(false);
    }
  };

  // =============================================
  // RENDER
  // =============================================
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (!docente) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">No se encontró el docente</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      py: 4, 
      background: isDark 
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    }}>
      <Container maxWidth="lg">
        {/* Header mejorado */}
        <Fade in={true}>
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<BackIcon />}
              onClick={() => router.push(`/dashboard/docentes/${docenteId}`)}
              sx={{
                mb: 3,
                color: isDark ? '#facc15' : '#0288d1',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: alpha(isDark ? '#facc15' : '#0288d1', 0.1),
                },
              }}
            >
              Volver al perfil
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                }}
              >
                <PersonIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    background: isDark
                      ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 0.5,
                  }}
                >
                  Editar Docente
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={docente.codigo} 
                    size="small"
                    sx={{
                      fontWeight: 600,
                      backgroundColor: alpha(isDark ? '#facc15' : '#0288d1', 0.15),
                      color: isDark ? '#facc15' : '#0288d1',
                    }}
                  />
                  <Typography variant="body1" color="text.secondary">
                    {docente.nombres} {docente.apellidos}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* Formulario mejorado */}
        <Fade in={true} style={{ transitionDelay: '100ms' }}>
          <Paper
            component="form"
            onSubmit={handleSubmit}
            elevation={0}
            sx={{
              borderRadius: '24px',
              overflow: 'hidden',
              background: isDark
                ? alpha('#1e293b', 0.8)
                : alpha('#ffffff', 0.9),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            {/* Sección de Foto */}
            <Box
              sx={{
                background: isDark
                  ? `linear-gradient(135deg, ${alpha('#facc15', 0.15)} 0%, ${alpha('#f59e0b', 0.05)} 100%)`
                  : `linear-gradient(135deg, ${alpha('#0288d1', 0.15)} 0%, ${alpha('#01579b', 0.05)} 100%)`,
                p: 4,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Grid container spacing={4} alignItems="center">
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                      <Avatar
                        src={fotoPreview}
                        sx={{
                          width: 180,
                          height: 180,
                          margin: '0 auto',
                          mb: 2,
                          border: `4px solid ${isDark ? '#facc15' : '#0288d1'}`,
                          boxShadow: `0 8px 24px ${alpha(isDark ? '#facc15' : '#0288d1', 0.3)}`,
                        }}
                      >
                        <PersonIcon sx={{ fontSize: 90 }} />
                      </Avatar>
                      {foto && (
                        <Chip
                          icon={<CheckIcon />}
                          label="Nueva foto"
                          size="small"
                          color="success"
                          sx={{
                            position: 'absolute',
                            bottom: 16,
                            right: '50%',
                            transform: 'translateX(50%)',
                          }}
                        />
                      )}
                    </Box>
                    <Stack spacing={1}>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="foto-upload"
                        type="file"
                        onChange={handleFotoChange}
                      />
                      <label htmlFor="foto-upload">
                        <Button
                          variant="contained"
                          component="span"
                          startIcon={<PhotoIcon />}
                          fullWidth
                          sx={{
                            borderRadius: '12px',
                            background: isDark
                              ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                              : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                            color: isDark ? '#000' : '#fff',
                            fontWeight: 600,
                          }}
                        >
                          Cambiar Foto
                        </Button>
                      </label>
                      {foto && (
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={handleRemoveFoto}
                          fullWidth
                          size="small"
                          sx={{ borderRadius: '10px' }}
                        >
                          Restaurar Original
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: alpha(isDark ? '#facc15' : '#0288d1', 0.15),
                      }}
                    >
                      <ContactIcon sx={{ fontSize: 24, color: isDark ? '#facc15' : '#0288d1' }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      Datos Personales
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        required
                        label="Nombres"
                        value={formData.nombres || ''}
                        onChange={(e) => handleInputChange('nombres', e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        required
                        label="Apellido Paterno"
                        value={formData.apellido_paterno || ''}
                        onChange={(e) => handleInputChange('apellido_paterno', e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Apellido Materno"
                        value={formData.apellido_materno || ''}
                        onChange={(e) => handleInputChange('apellido_materno', e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        required
                        label="CI"
                        value={formData.ci || ''}
                        onChange={(e) => handleInputChange('ci', e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Fecha de Nacimiento"
                        value={formData.fecha_nacimiento || ''}
                        onChange={(e) => handleInputChange('fecha_nacimiento', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        select
                        label="Género"
                        value={formData.genero || 'masculino'}
                        onChange={(e) => handleInputChange('genero', e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      >
                        {GENEROS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Teléfono"
                        value={formData.telefono || ''}
                        onChange={(e) => handleInputChange('telefono', e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Celular"
                        value={formData.celular || ''}
                        onChange={(e) => handleInputChange('celular', e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Dirección"
                        multiline
                        rows={2}
                        value={formData.direccion || ''}
                        onChange={(e) => handleInputChange('direccion', e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>

            {/* Formación Académica */}
            <Box sx={{ p: 4, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: alpha('#8b5cf6', 0.15),
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 24, color: '#8b5cf6' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Formación Académica
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Título Profesional"
                    value={formData.titulo_profesional || ''}
                    onChange={(e) => handleInputChange('titulo_profesional', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Título de Postgrado"
                    value={formData.titulo_postgrado || ''}
                    onChange={(e) => handleInputChange('titulo_postgrado', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label="Nivel de Formación"
                    value={formData.nivel_formacion || 'licenciatura'}
                    onChange={(e) => handleInputChange('nivel_formacion', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  >
                    {NIVELES_FORMACION.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Especialidad"
                    value={formData.especialidad || ''}
                    onChange={(e) => handleInputChange('especialidad', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Años de Experiencia"
                    value={formData.experiencia_anios || 0}
                    onChange={(e) => handleInputChange('experiencia_anios', parseInt(e.target.value) || 0)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Información Contractual */}
            <Box sx={{ p: 4, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: alpha('#10b981', 0.15),
                  }}
                >
                  <WorkIcon sx={{ fontSize: 24, color: '#10b981' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Información Contractual
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label="Tipo de Contrato"
                    value={formData.tipo_contrato || 'contrato'}
                    onChange={(e) => handleInputChange('tipo_contrato', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  >
                    {TIPOS_CONTRATO.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Fecha de Contratación"
                    value={formData.fecha_contratacion || ''}
                    onChange={(e) => handleInputChange('fecha_contratacion', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Salario Mensual (Bs.)"
                    value={formData.salario_mensual || 0}
                    onChange={(e) => handleInputChange('salario_mensual', parseFloat(e.target.value) || 0)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Número de Cuenta"
                    value={formData.numero_cuenta || ''}
                    onChange={(e) => handleInputChange('numero_cuenta', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* CV */}
            <Box sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: alpha('#f59e0b', 0.15),
                  }}
                >
                  <CVIcon sx={{ fontSize: 24, color: '#f59e0b' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Curriculum Vitae
                </Typography>
              </Box>

              <Card
                sx={{
                  borderRadius: '16px',
                  border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: alpha(isDark ? '#facc15' : '#0288d1', 0.5),
                    backgroundColor: alpha(isDark ? '#facc15' : '#0288d1', 0.05),
                  },
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
  {/* Si NO hay CV cargado */}
  {!cvFileName ? (
    <Box>
      <Avatar
        sx={{
          width: 80,
          height: 80,
          margin: '0 auto',
          mb: 2,
          backgroundColor: alpha(theme.palette.text.disabled, 0.1),
        }}
      >
        <CVIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
      </Avatar>

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        No hay CV cargado
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Sube el curriculum vitae del docente (PDF o Word)
      </Typography>

      <input
        accept=".pdf,.doc,.docx"
        id="cv-upload"
        type="file"
        style={{ display: 'none' }}
        onChange={handleCVChange}
      />

      <label htmlFor="cv-upload">
        <Button
          variant="contained"
          component="span"
          startIcon={<UploadIcon />}
          size="large"
          sx={{
            borderRadius: '12px',
            px: 4,
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          }}
        >
          Subir CV
        </Button>
      </label>
    </Box>
  ) : (
    /* Si SÍ hay CV cargado */
    <Box>
      <Avatar
        sx={{
          width: 80,
          height: 80,
          margin: '0 auto',
          mb: 2,
          backgroundColor: alpha('#f59e0b', 0.15),
        }}
      >
        <CVIcon sx={{ fontSize: 40, color: '#f59e0b' }} />
      </Avatar>

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        CV cargado
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {cvFileName}
      </Typography>

      {/* Input invisible para reemplazar CV */}
      <input
        accept=".pdf,.doc,.docx"
        id="cv-upload"
        type="file"
        style={{ display: 'none' }}
        onChange={handleCVChange}
      />

      <Stack spacing={2} alignItems="center">
        <label htmlFor="cv-upload">
          <Button
            variant="contained"
            component="span"
            startIcon={<UploadIcon />}
            sx={{
              borderRadius: '12px',
              px: 4,
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            }}
          >
            Reemplazar CV
          </Button>
        </label>

        <Button
          variant="outlined"
          color="error"
          onClick={handleRemoveCV}
          sx={{ borderRadius: '12px', px: 3 }}
          startIcon={<DeleteIcon />}
        >
          Eliminar / Restaurar
        </Button>
      </Stack>
    </Box>
  )}
</CardContent>

              </Card>
            </Box>

            {/* Botones de acción */}
            <Box
              sx={{
                p: 4,
                background: isDark
                  ? alpha('#0f172a', 0.5)
                  : alpha('#f8fafc', 0.5),
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2,
              }}
            >
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push(`/dashboard/docentes/${docenteId}`)}
                disabled={isSaving}
                sx={{ 
                  borderRadius: '12px', 
                  px: 4,
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSaving}
                startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                sx={{
                  borderRadius: '12px',
                  px: 5,
                  fontWeight: 600,
                  textTransform: 'none',
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  color: isDark ? '#000' : '#fff',
                  boxShadow: `0 4px 12px ${alpha(isDark ? '#facc15' : '#0288d1', 0.3)}`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 6px 16px ${alpha(isDark ? '#facc15' : '#0288d1', 0.4)}`,
                  },
                  '&:disabled': {
                    opacity: 0.6,
                  },
                }}
              >
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default EditarDocente;
                        