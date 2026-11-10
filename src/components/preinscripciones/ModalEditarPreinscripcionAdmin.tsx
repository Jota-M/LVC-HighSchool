'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Avatar,
  IconButton,
  Paper,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  FamilyRestroom as FamilyIcon,
  Save as SaveIcon,
  AccessTime as AccessTimeIcon,
  Badge as BadgeIcon,
  Phone as PhoneIcon,
  EditNote as EditNoteIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import { preinscripcionService } from '@/services/preinscripcionService';
import { gestionAcademicaService } from '@/services/estudiantesService';
import api from '@/lib/api';

interface ModalEditarPreinscripcionAdminProps {
  open: boolean;
  onClose: () => void;
  preinscripcion: any | null;
  gradosList?: any[];
  turnosList?: any[];
  onSuccess: () => void;
}

export default function ModalEditarPreinscripcionAdmin({
  open,
  onClose,
  preinscripcion,
  gradosList = [],
  turnosList = [],
  onSuccess,
}: ModalEditarPreinscripcionAdminProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? '#facc15' : '#0288d1';

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Listas paramétricas locales si no vienen en props
  const [grados, setGrados] = useState<any[]>(gradosList);
  const [turnos, setTurnos] = useState<any[]>(turnosList);

  // Campos Curso y Turno
  const [gradoId, setGradoId] = useState<number | ''>('');
  const [turnoId, setTurnoId] = useState<number | ''>('');
  const [estado, setEstado] = useState<string>('iniciada');

  // Campos Estudiante
  const [nombres, setNombres] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [ci, setCi] = useState('');
  const [rude, setRude] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [genero, setGenero] = useState<'masculino' | 'femenino'>('masculino');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');

  // Campos Tutor
  const [tutorNombres, setTutorNombres] = useState('');
  const [tutorApellidoPaterno, setTutorApellidoPaterno] = useState('');
  const [tutorApellidoMaterno, setTutorApellidoMaterno] = useState('');
  const [tutorCi, setTutorCi] = useState('');
  const [tutorTelefono, setTutorTelefono] = useState('');
  const [tutorParentesco, setTutorParentesco] = useState('padre');

  // Observaciones
  const [observaciones, setObservaciones] = useState('');

  // Cargar paramétricas si vienen vacías
  useEffect(() => {
    if (!open) return;
    const fetchParams = async () => {
      try {
        if (grados.length === 0) {
          const gData = await gestionAcademicaService.obtenerGrados();
          if (Array.isArray(gData)) setGrados(gData);
        }
        if (turnos.length === 0) {
          const resT = await api.get('/turno');
          const tList = Array.isArray(resT.data)
            ? resT.data
            : resT.data?.data?.turnos || resT.data?.turnos || [];
          if (Array.isArray(tList)) setTurnos(tList);
        }
      } catch (e) {
        console.error('Error cargando paramétricas:', e);
      }
    };
    fetchParams();
  }, [open, grados.length, turnos.length]);

  // Inicializar formulario con datos de la preinscripción
  useEffect(() => {
    if (!open || !preinscripcion) return;

    setError(null);
    setGradoId(preinscripcion.grado_id || '');
    setTurnoId(preinscripcion.turno_preferido_id || '');
    setEstado(preinscripcion.estado || 'iniciada');
    setObservaciones(preinscripcion.observaciones || '');

    // Estudiante (puede venir en preinscripcion.estudiante o planos)
    const est = preinscripcion.estudiante || {};
    setNombres(est.nombres || preinscripcion.estudiante_nombre?.split(' ')[0] || '');
    setApellidoPaterno(
      est.apellido_paterno || preinscripcion.estudiante_nombre?.split(' ')[1] || ''
    );
    setApellidoMaterno(est.apellido_materno || '');
    setCi(est.ci || preinscripcion.estudiante_ci || '');
    setRude(est.rude || '');
    setFechaNacimiento(est.fecha_nacimiento ? est.fecha_nacimiento.substring(0, 10) : '');
    const genStr = (est.genero || '').toLowerCase();
    setGenero(genStr.startsWith('f') ? 'femenino' : 'masculino');
    setTelefono(est.telefono || '');
    setEmail(est.email || '');
    setDireccion(est.direccion || '');

    // Tutor
    const tut = preinscripcion.tutor || {};
    setTutorNombres(tut.nombres || preinscripcion.tutor_nombre?.split(' ')[0] || '');
    setTutorApellidoPaterno(
      tut.apellido_paterno || preinscripcion.tutor_nombre?.split(' ')[1] || ''
    );
    setTutorApellidoMaterno(tut.apellido_materno || '');
    setTutorCi(tut.ci || '');
    setTutorTelefono(tut.telefono || tut.celular || preinscripcion.tutor_telefono || '');
    setTutorParentesco(tut.parentesco || 'padre');
  }, [open, preinscripcion]);

  const handleGuardar = async () => {
    if (!preinscripcion) return;
    if (!nombres.trim() || !apellidoPaterno.trim()) {
      setError('El nombre y apellido paterno del estudiante son obligatorios.');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      grado_id: gradoId !== '' ? Number(gradoId) : null,
      turno_preferido_id: turnoId !== '' ? Number(turnoId) : null,
      estado,
      observaciones: observaciones.trim() || null,
      estudiante: {
        nombres: nombres.trim(),
        apellido_paterno: apellidoPaterno.trim(),
        apellido_materno: apellidoMaterno.trim() || null,
        ci: ci.trim() || null,
        rude: rude.trim() || null,
        fecha_nacimiento: fechaNacimiento || null,
        genero,
        telefono: telefono.trim() || null,
        email: email.trim() || null,
        direccion: direccion.trim() || null,
      },
      tutor: {
        nombres: tutorNombres.trim() || null,
        apellido_paterno: tutorApellidoPaterno.trim() || null,
        apellido_materno: tutorApellidoMaterno.trim() || null,
        ci: tutorCi.trim() || null,
        telefono: tutorTelefono.trim() || null,
        celular: tutorTelefono.trim() || null,
        parentesco: tutorParentesco || 'padre',
      },
    };

    try {
      await preinscripcionService.actualizarAdmin(preinscripcion.id, payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar los cambios de la preinscripción');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => !saving && onClose()}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          bgcolor: isDark ? '#0b1320' : '#ffffff',
          backgroundImage: 'none',
          boxShadow: isDark
            ? '0 24px 60px rgba(0,0,0,0.7)'
            : '0 20px 50px rgba(0,0,0,0.15)',
        },
      }}
    >
      {/* Cabecera */}
      <DialogTitle
        sx={{
          p: 3,
          pb: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar
            sx={{
              bgcolor: alpha(accent, 0.15),
              color: accent,
              width: 44,
              height: 44,
            }}
          >
            <EditNoteIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={800} color="text.primary">
              Editar Datos, Curso y Cupo de Preinscripción
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Expediente: <strong>{preinscripcion?.codigo_inscripcion || `PRE-${preinscripcion?.id}`}</strong>
            </Typography>
          </Box>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          disabled={saving}
          sx={{
            borderRadius: '10px',
            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack spacing={3}>
          {error && (
            <Alert severity="error" sx={{ borderRadius: '14px' }}>
              {error}
            </Alert>
          )}

          {/* SECCIÓN 1: CURSO, TURNO Y GESTIÓN DE CUPO */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '18px',
              bgcolor: isDark ? alpha(accent, 0.08) : alpha(accent, 0.03),
              border: `1.5px solid ${alpha(accent, 0.3)}`,
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <SchoolIcon sx={{ color: accent, fontSize: 22 }} />
              <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                Asignación de Curso, Turno y Vacante
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {/* Selector de Grado */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Grado / Curso Solicitado *</InputLabel>
                  <Select
                    value={gradoId}
                    label="Grado / Curso Solicitado *"
                    onChange={(e) => setGradoId(e.target.value as number)}
                  >
                    {grados.map((g) => (
                      <MenuItem key={g.id} value={g.id}>
                        {g.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Selector de Turno */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Turno Preferido *</InputLabel>
                  <Select
                    value={turnoId}
                    label="Turno Preferido *"
                    onChange={(e) => setTurnoId(e.target.value as number)}
                  >
                    {turnos.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Estado de la Preinscripción */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Estado del Expediente</InputLabel>
                  <Select
                    value={estado}
                    label="Estado del Expediente"
                    onChange={(e) => setEstado(e.target.value)}
                  >
                    <MenuItem value="iniciada">Iniciada</MenuItem>
                    <MenuItem value="datos_completos">Datos Completos</MenuItem>
                    <MenuItem value="documentos_pendientes">Documentos Pendientes</MenuItem>
                    <MenuItem value="en_revision">En Revisión</MenuItem>
                    <MenuItem value="documentos_aprobados">Documentos Aprobados</MenuItem>
                    <MenuItem value="entrevista_pendiente">Entrevista Pendiente</MenuItem>
                    <MenuItem value="entrevista_programada">Entrevista Programada</MenuItem>
                    <MenuItem value="entrevista_completada">Entrevista Completada</MenuItem>
                    <MenuItem value="aprobada">Aprobada</MenuItem>
                    <MenuItem value="en_espera">En Lista de Espera</MenuItem>
                    <MenuItem value="rechazada">Rechazada</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Vacante actual */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    p: 1.2,
                    px: 2,
                    borderRadius: '10px',
                    bgcolor: preinscripcion?.tiene_cupo_asignado
                      ? alpha('#10b981', 0.12)
                      : alpha('#f59e0b', 0.12),
                    border: `1px solid ${
                      preinscripcion?.tiene_cupo_asignado
                        ? alpha('#10b981', 0.3)
                        : alpha('#f59e0b', 0.3)
                    }`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant="body2" fontWeight={700}>
                    {preinscripcion?.tiene_cupo_asignado ? 'Cupo Vacante Asignado' : 'Sin Vacante Directa'}
                  </Typography>
                  <Chip
                    size="small"
                    label={preinscripcion?.tiene_cupo_asignado ? 'Con Vacante' : 'Lista Espera'}
                    sx={{
                      fontWeight: 700,
                      bgcolor: preinscripcion?.tiene_cupo_asignado ? '#10b981' : '#f59e0b',
                      color: '#fff',
                      fontSize: '0.68rem',
                    }}
                  />
                </Box>
              </Grid>
            </Grid>

            <Alert
              severity="info"
              icon={<InfoIcon fontSize="small" />}
              sx={{
                mt: 2,
                borderRadius: '12px',
                py: 0.5,
                fontSize: '0.82rem',
                bgcolor: alpha(accent, 0.05),
              }}
            >
              Si modificas el grado o turno, el sistema recalcula dinámicamente los cupos disponibles en el nuevo curso y libera automáticamente la vacante del curso anterior.
            </Alert>
          </Paper>

          {/* SECCIÓN 2: DATOS DEL ESTUDIANTE */}
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <PersonIcon sx={{ color: '#3b82f6', fontSize: 22 }} />
              <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                Datos del Postulante
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nombres *"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Apellido Paterno *"
                  value={apellidoPaterno}
                  onChange={(e) => setApellidoPaterno(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Apellido Materno"
                  value={apellidoMaterno}
                  onChange={(e) => setApellidoMaterno(e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Cédula de Identidad (CI)"
                  value={ci}
                  onChange={(e) => setCi(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Código RUDE"
                  value={rude}
                  onChange={(e) => setRude(e.target.value)}
                  placeholder="Ej: 8073005..."
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Género</InputLabel>
                  <Select
                    value={genero}
                    label="Género"
                    onChange={(e) => setGenero(e.target.value as 'masculino' | 'femenino')}
                  >
                    <MenuItem value="masculino">Masculino</MenuItem>
                    <MenuItem value="femenino">Femenino</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Fecha de Nacimiento"
                  InputLabelProps={{ shrink: true }}
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Teléfono / Contacto Estudiante"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Dirección / Domicilio Residencial"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* SECCIÓN 3: DATOS DEL TUTOR */}
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <FamilyIcon sx={{ color: '#10b981', fontSize: 22 }} />
              <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                Datos del Padre / Madre / Tutor Principal
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nombres del Tutor"
                  value={tutorNombres}
                  onChange={(e) => setTutorNombres(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Apellido Paterno Tutor"
                  value={tutorApellidoPaterno}
                  onChange={(e) => setTutorApellidoPaterno(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Apellido Materno Tutor"
                  value={tutorApellidoMaterno}
                  onChange={(e) => setTutorApellidoMaterno(e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="CI del Tutor"
                  value={tutorCi}
                  onChange={(e) => setTutorCi(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Teléfono / Celular (WhatsApp) *"
                  value={tutorTelefono}
                  onChange={(e) => setTutorTelefono(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Parentesco</InputLabel>
                  <Select
                    value={tutorParentesco}
                    label="Parentesco"
                    onChange={(e) => setTutorParentesco(e.target.value)}
                  >
                    <MenuItem value="padre">Padre</MenuItem>
                    <MenuItem value="madre">Madre</MenuItem>
                    <MenuItem value="tutor">Tutor / Representante Legal</MenuItem>
                    <MenuItem value="abuelo">Abuelo / Abuela</MenuItem>
                    <MenuItem value="tio">Tío / Tía</MenuItem>
                    <MenuItem value="hermano">Hermano / Hermana Mayor</MenuItem>
                    <MenuItem value="otro">Otro</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* SECCIÓN 4: OBSERVACIONES */}
          <Box>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              label="Notas u Observaciones Administrativas"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Indica motivos de corrección de curso o turno, antecedentes u observaciones del expediente..."
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2.5,
          pt: 1.5,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
          gap: 1.5,
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={saving}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleGuardar}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 700,
            px: 3,
            bgcolor: accent,
            color: isDark ? '#000' : '#fff',
            '&:hover': {
              bgcolor: alpha(accent, 0.85),
            },
          }}
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

