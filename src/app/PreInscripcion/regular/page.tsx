// pages/AutoMatriculacion.tsx
'use client';
import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Avatar,
  Chip,
  Alert,
  Card,
  CardContent,
  CardActionArea,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  useTheme,
  Stack,
} from '@mui/material';
import {
  School as SchoolIcon,
  CheckCircle as CheckIcon,
  ArrowForward as NextIcon,
  ArrowBack as BackIcon,
  Person as PersonIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import Header from '../../login/Header';
import { useAutoMatriculacion } from '@/hooks/useAutoMatriculacion';

const steps = ['Verificación', 'Información', 'Selección de Paralelo', 'Confirmación'];

const AutoMatriculacion: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    codigo: '',
    ci: '',
  });
  const [paraleloSeleccionado, setParaleloSeleccionado] = useState<number | null>(null);
  const [gradoFiltro, setGradoFiltro] = useState<number | null>(null);

  const {
    validar,
    matricular,
    resetear,
    isValidando,
    isMatriculando,
    isLoadingOpciones,
    datosEstudiante,
    opciones,
    matriculaExitosa,
  } = useAutoMatriculacion();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleValidar = () => {
    if (!formData.codigo || !formData.ci) {
      alert('Por favor completa todos los campos');
      return;
    }
    validar(formData);
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleMatricular = () => {
    if (!paraleloSeleccionado) {
      alert('Por favor selecciona un paralelo');
      return;
    }

    matricular({
      codigo: formData.codigo,
      ci: formData.ci,
      paralelo_id: paraleloSeleccionado,
    });
  };

  const handleReiniciar = () => {
    setActiveStep(0);
    setFormData({ codigo: '', ci: '' });
    setParaleloSeleccionado(null);
    setGradoFiltro(null);
    resetear();
  };

  // Validación exitosa, pasar al siguiente paso
  React.useEffect(() => {
    if (datosEstudiante && activeStep === 0) {
      setActiveStep(1);
    }
  }, [datosEstudiante, activeStep]);

  // Matrícula exitosa, mostrar confirmación
  React.useEffect(() => {
    if (matriculaExitosa) {
      setActiveStep(3);
    }
  }, [matriculaExitosa]);

  // Filtrar paralelos por grado
  const paralelosFiltrados = React.useMemo(() => {
    if (!opciones?.paralelos) return [];
    if (!gradoFiltro) return opciones.paralelos;
    return opciones.paralelos.filter((p) => p.grado_id === gradoFiltro);
  }, [opciones?.paralelos, gradoFiltro]);

  return (
    <>
    <Header></Header>
    <Box
      sx={{
        minHeight: '100vh',
        background: isDark
          ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        pt: 15,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: isDark
                ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
              mb: 2,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            }}
          >
            <SchoolIcon sx={{ fontSize: 48, color: isDark ? '#000' : '#667eea' }} />
          </Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: '#fff',
              mb: 1,
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            }}
          >
            Portal de Matrícula
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            Sistema de Auto-Matriculación para Estudiantes
          </Typography>
        </Box>

        {/* Stepper */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: '20px',
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Step 0: Verificación */}
        {activeStep === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 5,
              borderRadius: '24px',
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <PersonIcon sx={{ fontSize: 64, color: isDark ? '#facc15' : '#667eea', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                Verificación de Identidad
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ingresa tu código de estudiante y CI para continuar
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid size={{xs:12}} >
                <TextField
                  fullWidth
                  label="Código de Estudiante"
                  placeholder="Ej: EST-2024-0001"
                  value={formData.codigo}
                  onChange={(e) => handleInputChange('codigo', e.target.value.toUpperCase())}
                  disabled={isValidando}
                  InputProps={{
                    startAdornment: <SchoolIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                />
              </Grid>
              <Grid size={{xs:12}}>
                <TextField
                  fullWidth
                  label="Cédula de Identidad (CI)"
                  placeholder="Ej: 1234567"
                  value={formData.ci}
                  onChange={(e) => handleInputChange('ci', e.target.value)}
                  disabled={isValidando}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleValidar}
              disabled={isValidando || !formData.codigo || !formData.ci}
              endIcon={isValidando ? <CircularProgress size={20} /> : <NextIcon />}
              sx={{
                mt: 4,
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 700,
                background: isDark
                  ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: isDark ? '#000' : '#fff',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {isValidando ? 'Verificando...' : 'Verificar Identidad'}
            </Button>
          </Paper>
        )}

        {/* Step 1: Información del Estudiante */}
        {activeStep === 1 && datosEstudiante && (
          <Paper
            elevation={0}
            sx={{
              p: 5,
              borderRadius: '24px',
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Tu Información
            </Typography>

            {/* Alerta si ya está matriculado */}
            {datosEstudiante.ya_matriculado && (
              <Alert severity="info" sx={{ mb: 3, borderRadius: '12px' }}>
                <strong>Ya estás matriculado</strong> en el periodo actual:{' '}
                <strong>{datosEstudiante.periodo_activo?.nombre}</strong>
              </Alert>
            )}

            {/* Datos del estudiante */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
              <Avatar
                src={datosEstudiante.estudiante.foto_url || undefined}
                sx={{ width: 100, height: 100 }}
              >
                {datosEstudiante.estudiante.nombres.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {datosEstudiante.estudiante.nombres}{' '}
                  {datosEstudiante.estudiante.apellido_paterno}{' '}
                  {datosEstudiante.estudiante.apellido_materno}
                </Typography>
                <Chip
                  label={`Código: ${datosEstudiante.estudiante.codigo}`}
                  size="small"
                  sx={{ mr: 1, mt: 1 }}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Última matrícula */}
            {datosEstudiante.ultima_matricula && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Última Matrícula
                </Typography>
                <Card sx={{ borderRadius: '12px' }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid size={{xs:6}} >
                        <Typography variant="body2" color="text.secondary">
                          Periodo
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {datosEstudiante.ultima_matricula.periodo_nombre}
                        </Typography>
                      </Grid>
                      <Grid size={{xs:6}} >
                        <Typography variant="body2" color="text.secondary">
                          Grado
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {datosEstudiante.ultima_matricula.grado_nombre}
                        </Typography>
                      </Grid>
                      <Grid size={{xs:6}} >
                        <Typography variant="body2" color="text.secondary">
                          Paralelo
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {datosEstudiante.ultima_matricula.paralelo_nombre}
                        </Typography>
                      </Grid>
                      <Grid size={{xs:6}} >
                        <Typography variant="body2" color="text.secondary">
                          Estado
                        </Typography>
                        <Chip
                          label={datosEstudiante.ultima_matricula.estado}
                          size="small"
                          color="success"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* Periodo disponible */}
            {datosEstudiante.periodo_activo && !datosEstudiante.ya_matriculado && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
                <strong>Periodo Disponible:</strong> {datosEstudiante.periodo_activo.nombre}
                <br />
                <strong>Inscripciones:</strong> Hasta el{' '}
                {new Date(datosEstudiante.periodo_activo.fecha_fin).toLocaleDateString('es-ES')}
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button onClick={handleReiniciar} startIcon={<BackIcon />} sx={{ textTransform: 'none' }}>
                Volver
              </Button>
              {!datosEstudiante.ya_matriculado && datosEstudiante.periodo_activo && (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<NextIcon />}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    px: 4,
                    background: isDark
                      ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: isDark ? '#000' : '#fff',
                  }}
                >
                  Continuar con Matrícula
                </Button>
              )}
            </Box>
          </Paper>
        )}

        {/* Step 2: Selección de Paralelo */}
        {activeStep === 2 && opciones && (
          <Paper
            elevation={0}
            sx={{
              p: 5,
              borderRadius: '24px',
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Selecciona tu Paralelo
            </Typography>

            <Alert severity="info" sx={{ mb: 3, borderRadius: '12px' }}>
              Periodo: <strong>{opciones.periodo_activo.nombre}</strong>
            </Alert>

            {/* Filtro por grado */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Filtrar por Grado</InputLabel>
              <Select
                value={gradoFiltro || ''}
                onChange={(e) => setGradoFiltro(e.target.value ? Number(e.target.value) : null)}
                label="Filtrar por Grado"
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="">Todos los grados</MenuItem>
                {opciones.grados.map((grado) => (
                  <MenuItem key={grado.id} value={grado.id}>
                    {grado.nombre} ({grado.nivel_nombre})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Lista de paralelos */}
            {isLoadingOpciones ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : paralelosFiltrados.length === 0 ? (
              <Alert severity="warning" sx={{ borderRadius: '12px' }}>
                No hay paralelos disponibles para el filtro seleccionado
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {paralelosFiltrados.map((paralelo) => (
                  <Grid size={{xs:12}} key={paralelo.id}>
                    <Card
                      sx={{
                        borderRadius: '16px',
                        border:
                          paraleloSeleccionado === paralelo.id
                            ? `3px solid ${isDark ? '#facc15' : '#667eea'}`
                            : '2px solid transparent',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 4,
                        },
                      }}
                    >
                      <CardActionArea onClick={() => setParaleloSeleccionado(paralelo.id)}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {paralelo.grado_nombre} - Paralelo {paralelo.nombre}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {paralelo.turno_nombre} ({paralelo.hora_inicio} - {paralelo.hora_fin})
                              </Typography>
                              {paralelo.aula && (
                                <Chip label={`Aula: ${paralelo.aula}`} size="small" sx={{ mt: 1 }} />
                              )}
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="body2" color="text.secondary">
                                Disponibles
                              </Typography>
                              <Typography
                                variant="h5"
                                sx={{
                                  fontWeight: 700,
                                  color: paralelo.disponibles > 5 ? 'success.main' : 'warning.main',
                                }}
                              >
                                {paralelo.disponibles}/{paralelo.capacidad_maxima}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {paralelo.porcentaje_ocupacion}% ocupado
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button onClick={handleBack} startIcon={<BackIcon />} sx={{ textTransform: 'none' }}>
                Atrás
              </Button>
              <Button
                variant="contained"
                onClick={handleMatricular}
                disabled={!paraleloSeleccionado || isMatriculando}
                startIcon={isMatriculando ? <CircularProgress size={20} /> : <CheckIcon />}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  px: 4,
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: isDark ? '#000' : '#fff',
                }}
              >
                {isMatriculando ? 'Procesando...' : 'Confirmar Matrícula'}
              </Button>
            </Box>
          </Paper>
        )}

        {/* Step 3: Confirmación */}
        {activeStep === 3 && matriculaExitosa && (
          <Paper
            elevation={0}
            sx={{
              p: 5,
              borderRadius: '24px',
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                mb: 3,
              }}
            >
              <CheckIcon sx={{ fontSize: 64, color: '#fff' }} />
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              ¡Matrícula Exitosa!
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Tu matrícula ha sido procesada correctamente
            </Typography>

            <Card sx={{ borderRadius: '16px', mb: 4 }}>
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Número de Matrícula
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {matriculaExitosa.data.matricula.numero_matricula}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Grado y Paralelo
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {matriculaExitosa.data.matricula.grado_nombre} -{' '}
                      {matriculaExitosa.data.matricula.paralelo_nombre}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Turno
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {matriculaExitosa.data.matricula.turno_nombre}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Fecha de Matrícula
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {new Date(matriculaExitosa.data.matricula.fecha_matricula).toLocaleDateString('es-ES')}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
              Tu matrícula ha sido confirmada. Puedes presentarte en la institución en las fechas indicadas.
            </Alert>

            <Button
              variant="outlined"
              size="large"
              onClick={handleReiniciar}
              startIcon={<HomeIcon />}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                px: 4,
              }}
            >
              Volver al Inicio
            </Button>
          </Paper>
        )}
      </Container>
    </Box>
    </>
  );
};

export default AutoMatriculacion;