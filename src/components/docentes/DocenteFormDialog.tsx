'use client';
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, TextField, Grid, IconButton,
  Avatar, FormControl, InputLabel, Select, MenuItem,
  Switch, FormControlLabel, Stepper, Step, StepLabel,
  alpha, useTheme, Divider, InputAdornment, CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  AccountCircle as AccountIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon
} from '@mui/icons-material';
import { Docente, DocenteFormData, RegistroCompletoData } from '../../services/docentes';

interface DocenteFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: RegistroCompletoData, files?: { foto?: File; cv?: File }) => Promise<void>;
  editingDocente?: Docente | null;
  loading?: boolean;
}

const steps = ['Datos Personales', 'Formación', 'Contrato', 'Usuario'];

const DocenteFormDialog: React.FC<DocenteFormDialogProps> = ({
  open, onClose, onSave, editingDocente, loading
}) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [crearUsuario, setCrearUsuario] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<DocenteFormData>({
    nombres: '', apellido_paterno: '', apellido_materno: '', ci: '',
    fecha_nacimiento: '', genero: '', telefono: '', celular: '',
    email: '', direccion: '', titulo_profesional: '', titulo_postgrado: '',
    especialidad: '', nivel_formacion: '', experiencia_anios: undefined,
    salario_mensual: undefined, numero_cuenta: '', fecha_contratacion: '',
    tipo_contrato: 'contrato'
  });

  const [credenciales, setCredenciales] = useState({ username: '', password: '', email: '' });

  // Reset al abrir/cerrar
  useEffect(() => {
    if (open) {
      if (editingDocente) {
        setFormData({
          nombres: editingDocente.nombres || '',
          apellido_paterno: editingDocente.apellido_paterno || '',
          apellido_materno: editingDocente.apellido_materno || '',
          ci: editingDocente.ci || '',
          fecha_nacimiento: editingDocente.fecha_nacimiento?.split('T')[0] || '',
          genero: editingDocente.genero || '',
          telefono: editingDocente.telefono || '',
          celular: editingDocente.celular || '',
          email: editingDocente.email || '',
          direccion: editingDocente.direccion || '',
          titulo_profesional: editingDocente.titulo_profesional || '',
          titulo_postgrado: editingDocente.titulo_postgrado || '',
          especialidad: editingDocente.especialidad || '',
          nivel_formacion: editingDocente.nivel_formacion || '',
          experiencia_anios: editingDocente.experiencia_anios,
          salario_mensual: editingDocente.salario_mensual,
          numero_cuenta: editingDocente.numero_cuenta || '',
          fecha_contratacion: editingDocente.fecha_contratacion?.split('T')[0] || '',
          tipo_contrato: editingDocente.tipo_contrato || 'contrato'
        });
        setFotoPreview(editingDocente.foto_url || null);
        setCrearUsuario(false);
      } else {
        resetForm();
      }
    }
  }, [open, editingDocente]);

  const resetForm = () => {
    setFormData({
      nombres: '', apellido_paterno: '', apellido_materno: '', ci: '',
      fecha_nacimiento: '', genero: '', telefono: '', celular: '',
      email: '', direccion: '', titulo_profesional: '', titulo_postgrado: '',
      especialidad: '', nivel_formacion: '', experiencia_anios: undefined,
      salario_mensual: undefined, numero_cuenta: '', fecha_contratacion: '',
      tipo_contrato: 'contrato'
    });
    setCredenciales({ username: '', password: '', email: '' });
    setFotoFile(null);
    setFotoPreview(null);
    setCvFile(null);
    setCrearUsuario(false);
    setActiveStep(0);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoFile(file);
      const reader = new FileReader();
      reader.onload = () => setFotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const data: RegistroCompletoData = {
        docente: formData,
        crear_usuario: crearUsuario && !editingDocente,
        credenciales: crearUsuario ? credenciales : undefined
      };
      const files = { foto: fotoFile || undefined, cv: cvFile || undefined };
      await onSave(data, files);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0: return formData.nombres && formData.apellido_paterno && formData.ci;
      case 1: return true;
      case 2: return formData.tipo_contrato;
      case 3: return true;
      default: return true;
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Datos Personales
        return (
          <Grid container spacing={2}>
            <Grid size={{xs:12}} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar src={fotoPreview || undefined} sx={{ width: 100, height: 100, border: `3px solid ${theme.palette.primary.main}` }}>
                  <PersonIcon sx={{ fontSize: 48 }} />
                </Avatar>
                <IconButton component="label" size="small" sx={{
                  position: 'absolute', bottom: 0, right: 0,
                  bgcolor: 'primary.main', color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}>
                  <UploadIcon fontSize="small" />
                  <input type="file" hidden accept="image/*" onChange={handleFotoChange} />
                </IconButton>
              </Box>
            </Grid>
            <Grid size={{xs:12, sm:6}} >
              <TextField fullWidth label="Nombres *" value={formData.nombres}
                onChange={(e) => handleChange('nombres', e.target.value)} />
            </Grid>
            <Grid size={{xs:12, sm:6}} >
              <TextField fullWidth label="Apellido Paterno *" value={formData.apellido_paterno}
                onChange={(e) => handleChange('apellido_paterno', e.target.value)} />
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <TextField fullWidth label="Apellido Materno" value={formData.apellido_materno}
                onChange={(e) => handleChange('apellido_materno', e.target.value)} />
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <TextField fullWidth label="CI *" value={formData.ci}
                onChange={(e) => handleChange('ci', e.target.value)} />
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <TextField fullWidth label="Fecha de Nacimiento" type="date" value={formData.fecha_nacimiento}
                onChange={(e) => handleChange('fecha_nacimiento', e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <FormControl fullWidth>
                <InputLabel>Género</InputLabel>
                <Select value={formData.genero} label="Género" onChange={(e) => handleChange('genero', e.target.value)}>
                  <MenuItem value="masculino">Masculino</MenuItem>
                  <MenuItem value="femenino">Femenino</MenuItem>
                  <MenuItem value="otro">Otro</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <TextField fullWidth label="Teléfono" value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)} />
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <TextField fullWidth label="Celular" value={formData.celular}
                onChange={(e) => handleChange('celular', e.target.value)} />
            </Grid>
            <Grid size={{xs:12}}>
              <TextField fullWidth label="Email" type="email" value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)} />
            </Grid>
            <Grid size={{xs:12}}>
              <TextField fullWidth label="Dirección" multiline rows={2} value={formData.direccion}
                onChange={(e) => handleChange('direccion', e.target.value)} />
            </Grid>
          </Grid>
        );

      case 1: // Formación
        return (
          <Grid container spacing={2}>
            <Grid size={{xs:12}}>
              <TextField fullWidth label="Título Profesional" value={formData.titulo_profesional}
                onChange={(e) => handleChange('titulo_profesional', e.target.value)}
                placeholder="Ej: Licenciado en Matemáticas" />
            </Grid>
            <Grid size={{xs:12}}>
              <TextField fullWidth label="Título de Postgrado" value={formData.titulo_postgrado}
                onChange={(e) => handleChange('titulo_postgrado', e.target.value)}
                placeholder="Ej: Maestría en Educación" />
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <TextField fullWidth label="Especialidad" value={formData.especialidad}
                onChange={(e) => handleChange('especialidad', e.target.value)}
                placeholder="Ej: Matemáticas, Física" />
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <FormControl fullWidth>
                <InputLabel>Nivel de Formación</InputLabel>
                <Select value={formData.nivel_formacion} label="Nivel de Formación"
                  onChange={(e) => handleChange('nivel_formacion', e.target.value)}>
                  <MenuItem value="bachiller">Bachiller</MenuItem>
                  <MenuItem value="licenciatura">Licenciatura</MenuItem>
                  <MenuItem value="maestria">Maestría</MenuItem>
                  <MenuItem value="doctorado">Doctorado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <TextField fullWidth label="Años de Experiencia" type="number"
                value={formData.experiencia_anios || ''}
                onChange={(e) => handleChange('experiencia_anios', parseInt(e.target.value) || undefined)}
                inputProps={{ min: 0 }} />
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <Button variant="outlined" component="label" fullWidth sx={{ height: 56 }}
                startIcon={<UploadIcon />}>
                {cvFile ? cvFile.name : 'Subir CV (PDF)'}
                <input type="file" hidden accept=".pdf,.doc,.docx"
                  onChange={(e) => setCvFile(e.target.files?.[0] || null)} />
              </Button>
            </Grid>
          </Grid>
        );

      case 2: // Contrato
        return (
          <Grid container spacing={2}>
            <Grid size={{xs:12, sm:6}}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Contrato *</InputLabel>
                <Select value={formData.tipo_contrato} label="Tipo de Contrato *"
                  onChange={(e) => handleChange('tipo_contrato', e.target.value)}>
                  <MenuItem value="planta">Planta</MenuItem>
                  <MenuItem value="contrato">Contrato</MenuItem>
                  <MenuItem value="honorarios">Honorarios</MenuItem>
                  <MenuItem value="medio_tiempo">Medio Tiempo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <TextField fullWidth label="Fecha de Contratación" type="date"
                value={formData.fecha_contratacion}
                onChange={(e) => handleChange('fecha_contratacion', e.target.value)}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <TextField fullWidth label="Salario Mensual" type="number"
                value={formData.salario_mensual || ''}
                onChange={(e) => handleChange('salario_mensual', parseFloat(e.target.value) || undefined)}
                InputProps={{ startAdornment: <InputAdornment position="start">Bs.</InputAdornment> }} />
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <TextField fullWidth label="Número de Cuenta" value={formData.numero_cuenta}
                onChange={(e) => handleChange('numero_cuenta', e.target.value)} />
            </Grid>
          </Grid>
        );

      case 3: // Usuario
        return (
          <Box>
            {editingDocente ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <AccountIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary">
                  Para crear usuario, usa la opción "Crear Usuario" desde el menú del docente.
                </Typography>
              </Box>
            ) : (
              <>
                <FormControlLabel
                  control={<Switch checked={crearUsuario} onChange={(e) => setCrearUsuario(e.target.checked)} />}
                  label="Crear cuenta de usuario para este docente"
                  sx={{ mb: 3 }}
                />
                {crearUsuario && (
                  <Grid container spacing={2}>
                    <Grid size={{xs:12}}>
                      <TextField fullWidth label="Username" value={credenciales.username}
                        onChange={(e) => setCredenciales({ ...credenciales, username: e.target.value })}
                        helperText="Déjalo vacío para generar automáticamente" />
                    </Grid>
                    <Grid size={{xs:12}}>
                      <TextField fullWidth label="Contraseña" value={credenciales.password}
                        onChange={(e) => setCredenciales({ ...credenciales, password: e.target.value })}
                        helperText="Déjalo vacío para generar automáticamente" />
                    </Grid>
                    <Grid size={{xs:12}}>
                      <TextField fullWidth label="Email del usuario" type="email" value={credenciales.email}
                        onChange={(e) => setCredenciales({ ...credenciales, email: e.target.value })}
                        helperText="Por defecto usa el email del docente" />
                    </Grid>
                  </Grid>
                )}
              </>
            )}
          </Box>
        );

      default: return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" fontWeight="700">
            {editingDocente ? '✏️ Editar Docente' : '👨‍🏫 Nuevo Docente'}
          </Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>

      <Box sx={{ px: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label} completed={activeStep > index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <DialogContent sx={{ pt: 3 }}>
        {renderStepContent()}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} disabled={submitting}>Cancelar</Button>
        <Box sx={{ flex: 1 }} />
        {activeStep > 0 && (
          <Button startIcon={<BackIcon />} onClick={() => setActiveStep(prev => prev - 1)} disabled={submitting}>
            Atrás
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button variant="contained" endIcon={<NextIcon />} onClick={() => setActiveStep(prev => prev + 1)}
            disabled={!canProceed()} sx={{ borderRadius: 2 }}>
            Siguiente
          </Button>
        ) : (
          <Button variant="contained" onClick={handleSubmit} disabled={submitting || !canProceed()}
            startIcon={submitting ? <CircularProgress size={18} /> : null}
            sx={{ borderRadius: 2, px: 4 }}>
            {editingDocente ? 'Guardar Cambios' : 'Registrar Docente'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DocenteFormDialog;