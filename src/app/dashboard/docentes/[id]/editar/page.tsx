// pages/EditarDocente.tsx
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
  AttachMoney as MoneyIcon,
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

  const accentColor = isDark ? '#facc15' : '#0288d1';

  useEffect(() => {
    if (docenteId) cargarDocente();
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
      if (response.docente.foto_url) setFotoPreview(response.docente.foto_url);
      if (response.docente.cv_url) {
        setCVFileName(response.docente.cv_url.split('/').pop() || 'CV actual');
      }
    } catch (error: any) {
      toast.error('Error al cargar los datos del docente');
      router.push('/dashboard/docentes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ActualizarDocenteDTO, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Solo se permiten imágenes'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('La foto no debe superar los 5MB'); return; }
    setFoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setFotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCVChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) { toast.error('Solo se permiten archivos PDF o Word'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('El CV no debe superar los 10MB'); return; }
    setCV(file);
    setCVFileName(file.name);
  };

  const handleRemoveFoto = () => {
    setFoto(null);
    setFotoPreview(docente?.foto_url || '');
  };

  const handleRemoveCV = () => {
    setCV(null);
    setCVFileName(docente?.cv_url ? (docente.cv_url.split('/').pop() || 'CV actual') : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombres?.trim()) { toast.error('El nombre es requerido'); return; }
    if (!formData.apellido_paterno?.trim()) { toast.error('El apellido paterno es requerido'); return; }
    if (!formData.ci?.trim()) { toast.error('El CI es requerido'); return; }

    setIsSaving(true);
    try {
      await docenteService.actualizar(docenteId, formData, foto || undefined, cv || undefined);
      toast.success('Docente actualizado exitosamente');
      router.push(`/dashboard/docentes/${docenteId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar docente');
    } finally {
      setIsSaving(false);
    }
  };

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

  // ─── Shared section header ────────────────────────────────────────────────
  const SectionHeader = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
      {icon}
      <Typography variant="h6" fontWeight={700}>{label}</Typography>
    </Box>
  );

  // ─── Shared field styles ──────────────────────────────────────────────────
  const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: '12px' } };

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Fade in timeout={500}>
          <Box component="form" onSubmit={handleSubmit}>
            {/* Botón volver */}
            <Box sx={{ mb: 3 }}>
              <Button
                startIcon={<BackIcon />}
                onClick={() => router.push(`/dashboard/docentes/${docenteId}`)}
                sx={{ textTransform: 'none', fontWeight: 600, color: accentColor }}
              >
                Volver al perfil
              </Button>
            </Box>

            {/* Card de encabezado — mismo patrón que detalle */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: '24px',
                overflow: 'hidden',
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                mb: 3,
              }}
            >
              {/* Banner sólido */}
              <Box
                sx={{
                  height: 150,
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                }}
              />

              <Box sx={{ px: 4, pb: 4 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mt: -8,
                  }}
                >
                  {/* Avatar con upload */}
                  <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>
                    <Box sx={{ position: 'relative' }}>
                      <Avatar
                        src={fotoPreview}
                        sx={{
                          width: 150,
                          height: 150,
                          border: '6px solid',
                          borderColor: isDark ? '#0f172a' : '#fff',
                          fontSize: '3rem',
                          fontWeight: 700,
                          bgcolor: accentColor,
                          color: isDark ? '#000' : '#fff',
                        }}
                      >
                        {!fotoPreview && `${docente.nombres.charAt(0)}${docente.apellido_paterno.charAt(0)}`}
                      </Avatar>
                      {/* Botón cámara sobre avatar */}
                      <input
                        accept="image/*"
                        id="foto-upload"
                        type="file"
                        style={{ display: 'none' }}
                        onChange={handleFotoChange}
                      />
                      <label htmlFor="foto-upload">
                        <IconButton
                          component="span"
                          size="small"
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            bgcolor: accentColor,
                            color: isDark ? '#000' : '#fff',
                            width: 32,
                            height: 32,
                            '&:hover': { bgcolor: accentColor, opacity: 0.85 },
                          }}
                        >
                          <PhotoIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </label>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                        {docente.nombres} {docente.apellidos}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Chip
                          label={docente.codigo}
                          size="small"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            bgcolor: isDark ? 'rgba(250,204,21,0.2)' : 'rgba(2,136,209,0.2)',
                            color: accentColor,
                          }}
                        />
                        {foto && (
                          <Chip
                            icon={<CheckIcon sx={{ fontSize: 14 }} />}
                            label="Nueva foto lista"
                            size="small"
                            color="success"
                          />
                        )}
                        {foto && (
                          <Button
                            size="small"
                            color="error"
                            onClick={handleRemoveFoto}
                            sx={{ textTransform: 'none', fontWeight: 600, minWidth: 0 }}
                          >
                            Restaurar original
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* Acciones */}
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => router.push(`/dashboard/docentes/${docenteId}`)}
                      disabled={isSaving}
                      sx={{ borderRadius: '10px', fontWeight: 600, textTransform: 'none' }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      size="small"
                      disabled={isSaving}
                      startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                      sx={{
                        borderRadius: '10px',
                        fontWeight: 600,
                        textTransform: 'none',
                        background: isDark
                          ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                          : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                        color: isDark ? '#000' : '#fff',
                      }}
                    >
                      {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Secciones del formulario */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: '24px',
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                overflow: 'hidden',
              }}
            >
              {/* ── Datos Personales ── */}
              <Box sx={{ p: 4 }}>
                <SectionHeader
                  icon={<ContactIcon sx={{ color: accentColor }} />}
                  label="Datos Personales"
                />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth required label="Nombres" value={formData.nombres || ''}
                      onChange={(e) => handleInputChange('nombres', e.target.value)} sx={fieldSx} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth required label="Apellido Paterno" value={formData.apellido_paterno || ''}
                      onChange={(e) => handleInputChange('apellido_paterno', e.target.value)} sx={fieldSx} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth label="Apellido Materno" value={formData.apellido_materno || ''}
                      onChange={(e) => handleInputChange('apellido_materno', e.target.value)} sx={fieldSx} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth required label="CI" value={formData.ci || ''}
                      onChange={(e) => handleInputChange('ci', e.target.value)} sx={fieldSx} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth type="date" label="Fecha de Nacimiento"
                      value={formData.fecha_nacimiento || ''}
                      onChange={(e) => handleInputChange('fecha_nacimiento', e.target.value)}
                      InputLabelProps={{ shrink: true }} sx={fieldSx} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth select label="Género"
                      value={formData.genero || 'masculino'}
                      onChange={(e) => handleInputChange('genero', e.target.value)} sx={fieldSx}>
                      {GENEROS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth label="Teléfono" value={formData.telefono || ''}
                      onChange={(e) => handleInputChange('telefono', e.target.value)} sx={fieldSx} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth label="Celular" value={formData.celular || ''}
                      onChange={(e) => handleInputChange('celular', e.target.value)} sx={fieldSx} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth type="email" label="Email" value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)} sx={fieldSx} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth multiline rows={2} label="Dirección" value={formData.direccion || ''}
                      onChange={(e) => handleInputChange('direccion', e.target.value)} sx={fieldSx} />
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* ── Formación Académica ── */}
              <Box sx={{ p: 4 }}>
                <SectionHeader
                  icon={<SchoolIcon sx={{ color: '#8b5cf6' }} />}
                  label="Formación Académica"
                />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth label="Título Profesional" value={formData.titulo_profesional || ''}
                      onChange={(e) => handleInputChange('titulo_profesional', e.target.value)} sx={fieldSx} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth label="Título de Postgrado" value={formData.titulo_postgrado || ''}
                      onChange={(e) => handleInputChange('titulo_postgrado', e.target.value)} sx={fieldSx} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth select label="Nivel de Formación"
                      value={formData.nivel_formacion || 'licenciatura'}
                      onChange={(e) => handleInputChange('nivel_formacion', e.target.value)} sx={fieldSx}>
                      {NIVELES_FORMACION.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth label="Especialidad" value={formData.especialidad || ''}
                      onChange={(e) => handleInputChange('especialidad', e.target.value)} sx={fieldSx} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth type="number" label="Años de Experiencia"
                      value={formData.experiencia_anios || 0}
                      onChange={(e) => handleInputChange('experiencia_anios', parseInt(e.target.value) || 0)}
                      sx={fieldSx} />
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* ── Información Contractual ── */}
              <Box sx={{ p: 4 }}>
                <SectionHeader
                  icon={<MoneyIcon sx={{ color: '#10b981' }} />}
                  label="Información Contractual"
                />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth select label="Tipo de Contrato"
                      value={formData.tipo_contrato || 'contrato'}
                      onChange={(e) => handleInputChange('tipo_contrato', e.target.value)} sx={fieldSx}>
                      {TIPOS_CONTRATO.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth type="date" label="Fecha de Contratación"
                      value={formData.fecha_contratacion || ''}
                      onChange={(e) => handleInputChange('fecha_contratacion', e.target.value)}
                      InputLabelProps={{ shrink: true }} sx={fieldSx} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth type="number" label="Salario Mensual (Bs.)"
                      value={formData.salario_mensual || 0}
                      onChange={(e) => handleInputChange('salario_mensual', parseFloat(e.target.value) || 0)}
                      sx={fieldSx} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth label="Número de Cuenta" value={formData.numero_cuenta || ''}
                      onChange={(e) => handleInputChange('numero_cuenta', e.target.value)} sx={fieldSx} />
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* ── Curriculum Vitae ── */}
              <Box sx={{ p: 4 }}>
                <SectionHeader
                  icon={<CVIcon sx={{ color: '#f59e0b' }} />}
                  label="Curriculum Vitae"
                />

                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: '16px',
                    border: `2px dashed ${alpha(theme.palette.divider, 0.4)}`,
                    bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                    textAlign: 'center',
                    transition: 'border-color 0.2s',
                    '&:hover': {
                      borderColor: alpha('#f59e0b', 0.5),
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      margin: '0 auto',
                      mb: 2,
                      bgcolor: cvFileName ? alpha('#f59e0b', 0.15) : alpha(theme.palette.text.disabled, 0.1),
                    }}
                  >
                    <CVIcon sx={{ fontSize: 32, color: cvFileName ? '#f59e0b' : 'text.disabled' }} />
                  </Avatar>

                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                    {cvFileName ? 'CV cargado' : 'No hay CV cargado'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {cvFileName || 'Sube el curriculum vitae del docente (PDF o Word, máx. 10MB)'}
                  </Typography>

                  <input accept=".pdf,.doc,.docx" id="cv-upload" type="file"
                    style={{ display: 'none' }} onChange={handleCVChange} />

                  <Stack direction="row" spacing={2} justifyContent="center">
                    <label htmlFor="cv-upload">
                      <Button
                        variant="contained"
                        component="span"
                        startIcon={<UploadIcon />}
                        sx={{
                          borderRadius: '10px',
                          fontWeight: 600,
                          textTransform: 'none',
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        }}
                      >
                        {cvFileName ? 'Reemplazar CV' : 'Subir CV'}
                      </Button>
                    </label>
                    {cvFileName && (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleRemoveCV}
                        sx={{ borderRadius: '10px', fontWeight: 600, textTransform: 'none' }}
                      >
                        Eliminar
                      </Button>
                    )}
                  </Stack>
                </Paper>
              </Box>

              {/* ── Footer con acciones ── */}
              <Divider />
              <Box
                sx={{
                  px: 4,
                  py: 3,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 2,
                  bgcolor: isDark ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.02)',
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => router.push(`/dashboard/docentes/${docenteId}`)}
                  disabled={isSaving}
                  sx={{ borderRadius: '10px', fontWeight: 600, textTransform: 'none', px: 3 }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSaving}
                  startIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                  sx={{
                    borderRadius: '10px',
                    fontWeight: 600,
                    textTransform: 'none',
                    px: 4,
                    background: isDark
                      ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                    color: isDark ? '#000' : '#fff',
                  }}
                >
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </Box>
            </Paper>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default EditarDocente;