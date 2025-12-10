// pages/FormularioMatriculacion.tsx
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  Avatar,
  Chip,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  SelectChangeEvent,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { useMatriculacion, useDisponibilidadParalelo } from '@/hooks/useMatriculacion';
import { useGestionAcademica } from '@/hooks/useRegistroCompleto';
import { useEstudiante } from '@/hooks/useEstudiantes';
import { TIPOS_DOCUMENTO_MATRICULA } from '@/types/matriculacionTypes';
import { Paralelo } from '@/types/estudianteTypes';

const steps = ['Información del Estudiante', 'Datos de Matrícula', 'Documentos', 'Confirmación'];

interface DocumentoForm {
  tipo_documento: string;
  file: File | null;
  observaciones: string;
}

const FormularioMatriculacion: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const params = useParams();
  const isDark = theme.palette.mode === 'dark';
  const estudianteId = Number(params.id);

  const [activeStep, setActiveStep] = useState(0);
  const [paralelosDisponibles, setParalelosDisponibles] = useState<Paralelo[]>([]);
  const [isLoadingParalelos, setIsLoadingParalelos] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    periodo_academico_id: null as number | null,
    paralelo_id: null as number | null,
    es_repitente: false,
    es_becado: false,
    porcentaje_beca: null as number | null,
    tipo_beca: '',
    observaciones: '',
  });

  const [documentos, setDocumentos] = useState<DocumentoForm[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Hooks
  const { estudiante, isLoading: isLoadingEstudiante } = useEstudiante(estudianteId);
  const { matricular, isMatriculando } = useMatriculacion();
  const {
    periodos,
    periodoActivo,
    grados,
    isLoadingPeriodos,
    obtenerTodosLosParalelos,
  } = useGestionAcademica();

  // Disponibilidad del paralelo
  const { disponibilidad, puedeMatricular } = useDisponibilidadParalelo(
    formData.paralelo_id,
    formData.periodo_academico_id
  );

  // Establecer periodo activo por defecto
  useEffect(() => {
    if (periodoActivo && !formData.periodo_academico_id) {
      setFormData(prev => ({ ...prev, periodo_academico_id: periodoActivo.id }));
    }
  }, [periodoActivo, formData.periodo_academico_id]);

  // Cargar paralelos cuando cambia el periodo
  useEffect(() => {
    const cargarParalelos = async () => {
      if (!formData.periodo_academico_id) return;
      
      setIsLoadingParalelos(true);
      try {
        const anioActual = new Date().getFullYear();
        const paralelos = await obtenerTodosLosParalelos(anioActual);
        setParalelosDisponibles(paralelos);
      } catch (error) {
        console.error('Error al cargar paralelos:', error);
      } finally {
        setIsLoadingParalelos(false);
      }
    };

    cargarParalelos();
  }, [formData.periodo_academico_id, obtenerTodosLosParalelos]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleNext = () => {
    // Validate current step
    if (activeStep === 1) {
      const newErrors: Record<string, string> = {};
      if (!formData.periodo_academico_id) {
        newErrors.periodo_academico_id = 'Periodo académico requerido';
      }
      if (!formData.paralelo_id) {
        newErrors.paralelo_id = 'Paralelo requerido';
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const agregarDocumento = () => {
    setDocumentos(prev => [
      ...prev,
      { tipo_documento: 'cedula_estudiante', file: null, observaciones: '' }
    ]);
  };

  const eliminarDocumento = (index: number) => {
    setDocumentos(prev => prev.filter((_, i) => i !== index));
  };

  const actualizarDocumento = (index: number, field: keyof DocumentoForm, value: any) => {
    setDocumentos(prev => {
      const newDocs = [...prev];
      newDocs[index] = { ...newDocs[index], [field]: value };
      return newDocs;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!puedeMatricular) {
      alert('El paralelo no tiene capacidad disponible');
      return;
    }

    // Preparar documentos
    const documentosArchivos = documentos
      .filter((doc) => doc.file !== null)
      .map((doc) => ({
        file: doc.file!,
        tipo_documento: doc.tipo_documento,
        observaciones: doc.observaciones,
      }));

    const documentosMetadata = documentosArchivos.map((doc) => ({
      tipo_documento: doc.tipo_documento,
      observaciones: doc.observaciones,
    }));

    matricular(
      {
        estudianteId,
        data: {
          matricula: {
            periodo_academico_id: formData.periodo_academico_id!,
            paralelo_id: formData.paralelo_id!,
            es_repitente: formData.es_repitente,
            es_becado: formData.es_becado,
            porcentaje_beca: formData.es_becado ? formData.porcentaje_beca : null,
            tipo_beca: formData.es_becado ? formData.tipo_beca : null,
            observaciones: formData.observaciones || null,
          },
          documentos: documentosMetadata,
          documentos_archivos: documentosArchivos,
        },
      },
      {
        onSuccess: () => {
          router.push('/dashboard/matriculacion');
        },
      }
    );
  };

  if (isLoadingEstudiante) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!estudiante) {
    return (
      <Container>
        <Alert severity="error">Estudiante no encontrado</Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<BackIcon />}
            variant="outlined"
            color='secondary'
            onClick={() => router.back()}
            sx={{ mb: 2, textTransform: 'none' }}
          >
            Volver
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
            Matricular Estudiante
          </Typography>
        </Box>

        {/* Stepper */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: '20px',
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
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

        <form onSubmit={handleSubmit}>
          {/* Step 0: Información del Estudiante */}
          {activeStep === 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: '20px',
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Información del Estudiante
              </Typography>

              {/* DEBUG: Info de matrícula actual */}
              {estudiante.matriculas && estudiante.matriculas.length > 0 && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  <strong>Última Matrícula:</strong> {estudiante.matriculas[estudiante.matriculas.length - 1].grado} - 
                  {estudiante.matriculas[estudiante.matriculas.length - 1].periodo}
                </Alert>
              )}
              {(!estudiante.matriculas || estudiante.matriculas.length === 0) && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <strong>Sin matrículas previas registradas</strong>
                </Alert>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                <Avatar
                  src={estudiante.foto_url || undefined}
                  sx={{ width: 80, height: 80 }}
                >
                  {estudiante.nombres.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {estudiante.nombres} {estudiante.apellido_paterno} {estudiante.apellido_materno}
                  </Typography>
                  <Chip label={`Código: ${estudiante.codigo}`} size="small" sx={{ mr: 1 }} />
                  {estudiante.ci && <Chip label={`CI: ${estudiante.ci}`} size="small" />}
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Grid container spacing={3}>
                <Grid size={{xs:12, md:6}}>
                  <Typography variant="body2" color="text.secondary">Fecha de Nacimiento</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {new Date(estudiante.fecha_nacimiento).toLocaleDateString('es-ES')}
                  </Typography>
                </Grid>
                <Grid size={{xs:12, md:6}}>
                  <Typography variant="body2" color="text.secondary">Teléfono</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {estudiante.telefono || 'No registrado'}
                  </Typography>
                </Grid>
                <Grid size={{xs:12, md:6}}>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {estudiante.email || 'No registrado'}
                  </Typography>
                </Grid>
                <Grid size={{xs:12, md:6}}>
                  <Typography variant="body2" color="text.secondary">Dirección</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {estudiante.direccion || 'No registrada'}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    px: 4,
                    background: isDark
                      ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                    color: isDark ? '#000' : '#fff',
                  }}
                >
                  Siguiente
                </Button>
              </Box>
            </Paper>
          )}

          {/* Step 1: Datos de Matrícula */}
          {activeStep === 1 && (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: '20px',
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Datos de Matrícula
              </Typography>

              {/* DEBUG: Info de carga de paralelos */}
              {estudiante.matriculas && estudiante.matriculas.length > 0 && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  <strong>Grado Previo:</strong> {estudiante.matriculas[estudiante.matriculas.length - 1].grado}
                  <br />
                  <strong>Paralelos disponibles:</strong> {paralelosDisponibles.length} encontrados
                  {paralelosDisponibles.length > 0 && (
                    <> para <strong>{paralelosDisponibles[0].grado_nombre}</strong></>
                  )}
                </Alert>
              )}
              {isLoadingParalelos && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  Cargando paralelos...
                </Alert>
              )}

              <Grid container spacing={3}>
                {/* Periodo Académico */}
                <Grid size={{xs:12,md:6}} >
                  <FormControl fullWidth error={!!errors.periodo_academico_id}>
                    <InputLabel>Periodo Académico *</InputLabel>
                    <Select
                      value={formData.periodo_academico_id || ''}
                      onChange={(e) => handleInputChange('periodo_academico_id', e.target.value)}
                      label="Periodo Académico *"
                    >
                      {periodos.map((periodo) => (
                        <MenuItem key={periodo.id} value={periodo.id}>
                          {periodo.nombre}
                          {periodo.activo && <Chip label="ACTIVO" size="small" sx={{ ml: 1 }} />}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.periodo_academico_id && (
                      <Typography variant="caption" color="error">
                        {errors.periodo_academico_id}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                {/* Paralelo */}
                <Grid size={{xs:12, md:6}}>
                  <FormControl fullWidth error={!!errors.paralelo_id} disabled={!formData.periodo_academico_id}>
                    <InputLabel>Paralelo *</InputLabel>
                    <Select
                      value={formData.paralelo_id || ''}
                      onChange={(e) => handleInputChange('paralelo_id', e.target.value)}
                      label="Paralelo *"
                    >
                      {paralelosDisponibles.map((paralelo) => (
                        <MenuItem key={paralelo.id} value={paralelo.id}>
                          {paralelo.grado_nombre} - {paralelo.nombre} ({paralelo.turno_nombre})
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.paralelo_id && (
                      <Typography variant="caption" color="error">
                        {errors.paralelo_id}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                {/* Disponibilidad */}
                {disponibilidad && (
                  <Grid size={{xs:12}}>
                    <Alert severity={puedeMatricular ? 'success' : 'warning'}>
                      Capacidad: {disponibilidad.capacidad.ocupada}/{disponibilidad.capacidad.maxima} - 
                      Disponibles: {disponibilidad.capacidad.disponible} 
                      ({disponibilidad.capacidad.porcentaje_ocupacion}% ocupado)
                    </Alert>
                  </Grid>
                )}

                {/* Es Repitente */}
                <Grid size={{xs:12, md:6}}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.es_repitente}
                        onChange={(e) => handleInputChange('es_repitente', e.target.checked)}
                      />
                    }
                    label="Estudiante Repitente"
                  />
                </Grid>

                {/* Es Becado */}
                <Grid size={{xs:12, md:6}}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.es_becado}
                        onChange={(e) => handleInputChange('es_becado', e.target.checked)}
                      />
                    }
                    label="Estudiante Becado"
                  />
                </Grid>

                {/* Campos de Beca (condicionales) */}
                {formData.es_becado && (
                  <>
                    <Grid size={{xs:12, md:6}}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Porcentaje de Beca (%)"
                        value={formData.porcentaje_beca || ''}
                        onChange={(e) => handleInputChange('porcentaje_beca', Number(e.target.value))}
                        inputProps={{ min: 0, max: 100 }}
                      />
                    </Grid>
                    <Grid size={{xs:12, md:6}}>
                      <TextField
                        fullWidth
                        label="Tipo de Beca"
                        value={formData.tipo_beca}
                        onChange={(e) => handleInputChange('tipo_beca', e.target.value)}
                      />
                    </Grid>
                  </>
                )}

                {/* Observaciones */}
                <Grid size={{xs:12}}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Observaciones"
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange('observaciones', e.target.value)}
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button onClick={handleBack} sx={{ textTransform: 'none' }}>
                  Atrás
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!puedeMatricular}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    px: 4,
                    background: isDark
                      ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                    color: isDark ? '#000' : '#fff',
                  }}
                >
                  Siguiente
                </Button>
              </Box>
            </Paper>
          )}

          {/* Step 2: Documentos */}
          {activeStep === 2 && (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: '20px',
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Documentos de Matrícula
              </Typography>

              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={agregarDocumento}
                sx={{ mb: 3, textTransform: 'none' }}
              >
                Agregar Documento
              </Button>

              {documentos.map((doc, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={{xs:12, md:4}}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Tipo de Documento</InputLabel>
                          <Select
                            value={doc.tipo_documento}
                            onChange={(e) => actualizarDocumento(index, 'tipo_documento', e.target.value)}
                            label="Tipo de Documento"
                          >
                            {TIPOS_DOCUMENTO_MATRICULA.map((tipo) => (
                              <MenuItem key={tipo} value={tipo}>
                                {tipo.replace(/_/g, ' ').toUpperCase()}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{xs:12, md:4}}>
                        <Button
                          variant="outlined"
                          component="label"
                          fullWidth
                          startIcon={<UploadIcon />}
                        >
                          {doc.file ? doc.file.name : 'Subir Archivo'}
                          <input
                            type="file"
                            hidden
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) actualizarDocumento(index, 'file', file);
                            }}
                          />
                        </Button>
                      </Grid>
                      <Grid size={{xs:12, md:3}}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Observaciones"
                          value={doc.observaciones}
                          onChange={(e) => actualizarDocumento(index, 'observaciones', e.target.value)}
                        />
                      </Grid>
                      <Grid size={{xs:12, md:1}}>
                        <IconButton onClick={() => eliminarDocumento(index)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button onClick={handleBack} sx={{ textTransform: 'none' }}>
                  Atrás
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    px: 4,
                    background: isDark
                      ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                    color: isDark ? '#000' : '#fff',
                  }}
                >
                  Siguiente
                </Button>
              </Box>
            </Paper>
          )}

          {/* Step 3: Confirmación */}
          {activeStep === 3 && (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: '20px',
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Confirmación
              </Typography>

              <Alert severity="info" sx={{ mb: 3 }}>
                Por favor, revisa todos los datos antes de confirmar la matrícula.
              </Alert>

              {/* Resumen */}
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Resumen de Matrícula
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">Estudiante:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                  {estudiante.nombres} {estudiante.apellido_paterno}
                </Typography>

                <Typography variant="body2" color="text.secondary">Periodo:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                  {periodos.find((p) => p.id === formData.periodo_academico_id)?.nombre}
                </Typography>

                <Typography variant="body2" color="text.secondary">Paralelo:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                  {paralelosDisponibles.find((p) => p.id === formData.paralelo_id)?.nombre}
                </Typography>

                {formData.es_becado && (
                  <>
                    <Typography variant="body2" color="text.secondary">Beca:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                      {formData.porcentaje_beca}% - {formData.tipo_beca}
                    </Typography>
                  </>
                )}

                <Typography variant="body2" color="text.secondary">Documentos:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {documentos.filter((d) => d.file).length} documento(s) adjunto(s)
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button onClick={handleBack} sx={{ textTransform: 'none' }}>
                  Atrás
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isMatriculando}
                  startIcon={isMatriculando ? <CircularProgress size={20} /> : <SaveIcon />}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    px: 4,
                    background: isDark
                      ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                    color: isDark ? '#000' : '#fff',
                  }}
                >
                  {isMatriculando ? 'Guardando...' : 'Confirmar Matrícula'}
                </Button>
              </Box>
            </Paper>
          )}
        </form>
      </Container>
    </Box>
  );
};

export default FormularioMatriculacion;