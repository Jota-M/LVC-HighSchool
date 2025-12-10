'use client';
import { use, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  MenuItem,
  Alert,
  AlertTitle,
  CircularProgress,
  Avatar,
  Chip,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Stack,
  LinearProgress,
  Tooltip,
  useTheme,
  FormControl,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SchoolIcon from '@mui/icons-material/School';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupsIcon from '@mui/icons-material/Groups';
import InfoIcon from '@mui/icons-material/Info';
import FilterListIcon from '@mui/icons-material/FilterList';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import DescriptionIcon from '@mui/icons-material/Description';
import { useConversionPreinscripcion } from '@/hooks/useConversionPreinscripcion';

export default function ConversionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const theme = useTheme();

  const [paraleloId, setParaleloId] = useState('');
  const [periodoAcademicoId, setPeriodoAcademicoId] = useState('');
  const [gradoFiltro, setGradoFiltro] = useState<number | null>(null);
  const [showCredenciales, setShowCredenciales] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    estudiante: false,
    padre: false
  });

  const {
    preinscripcion,
    periodos,
    paralelos,
    grados,
    isLoading,
    loadingParalelos,
    loadingGrados,
    convertir,
    isConverting,
    conversionExitosa,
  } = useConversionPreinscripcion(parseInt(id));

  useEffect(() => {
    if (periodos && periodos.length > 0 && !periodoAcademicoId) {
      const periodoActivo = periodos.find(p => p.activo);
      if (periodoActivo) {
        setPeriodoAcademicoId(periodoActivo.id.toString());
      }
    }
  }, [periodos, periodoAcademicoId]);

  const paralelosFiltrados = useMemo(() => {
    if (!paralelos) return [];
    if (!gradoFiltro) return paralelos;
    return paralelos.filter((p) => p.grado_id === gradoFiltro);
  }, [paralelos, gradoFiltro]);

  // Mostrar credenciales cuando la conversión es exitosa
  useEffect(() => {
    if (conversionExitosa && (conversionExitosa.data.credenciales_estudiante || conversionExitosa.data.credenciales_padre)) {
      setShowCredenciales(true);
    }
  }, [conversionExitosa]);

  const handleConvertir = () => {
    if (!paraleloId || !periodoAcademicoId) return;
    convertir({
      paralelo_id: parseInt(paraleloId),
      periodo_academico_id: parseInt(periodoAcademicoId),
    });
  };

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    // Aquí podrías agregar un snackbar de confirmación
  };

  const handleCloseCredenciales = () => {
    setShowCredenciales(false);
    router.push(`/dashboard/estudiantes/${conversionExitosa?.data.estudiante.id}`);
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
        sx={{
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <CircularProgress size={80} thickness={4} sx={{ color: '#fff', mb: 3 }} />
        <Typography variant="h6" color="#fff" fontWeight={600}>
          Cargando información...
        </Typography>
      </Box>
    );
  }

  if (!preinscripcion) {
    return (
      <Box p={4}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          <AlertTitle>Error</AlertTitle>
          No se pudo cargar la preinscripción
        </Alert>
      </Box>
    );
  }

  const pre = preinscripcion as any;
  const nombreCompleto = `${pre.estudiante?.nombres ?? ''} ${pre.estudiante?.apellido_paterno ?? ''} ${pre.estudiante?.apellido_materno ?? ''}`.trim();
  const iniciales = `${(pre.estudiante?.nombres?.[0] ?? '')}${(pre.estudiante?.apellido_paterno?.[0] ?? '')}`;

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, minHeight: '100vh' }}>
      {/* Alert de Éxito */}
      <Alert
        icon={<CheckCircleIcon sx={{ fontSize: 32 }} />}
        severity="success"
        sx={{
          borderRadius: 4,
          mb: 4,
          border: '2px solid #10b981',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)',
        }}
      >
        <AlertTitle sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
          ¡Preinscripción Aprobada!
        </AlertTitle>
        <Typography variant="body2">
          La preinscripción de <strong>{nombreCompleto}</strong> ha sido aprobada. 
          Ahora puedes convertirla a estudiante oficial.
        </Typography>
      </Alert>

      {/* Stepper */}
      <Card sx={{ borderRadius: 4, mb: 4, boxShadow: theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Stepper activeStep={conversionExitosa ? 2 : 1}>
            <Step completed>
              <StepLabel>Revisión y Aprobación</StepLabel>
            </Step>
            <Step completed={!!conversionExitosa}>
              <StepLabel>Asignar Paralelo y Periodo</StepLabel>
            </Step>
            <Step>
              <StepLabel>Estudiante Oficial</StepLabel>
            </Step>
          </Stepper>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Información del Estudiante */}
        <Grid size={{xs:12, md:5}}>
          <Card sx={{ borderRadius: 4, height: '100%', boxShadow: theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Información del Estudiante
              </Typography>

              <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                <Avatar
                  src={preinscripcion.estudiante.foto_url}
                  sx={{
                    width: 100,
                    height: 100,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    mb: 2,
                    border: '4px solid',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  }}
                >
                  {iniciales}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {nombreCompleto}
                </Typography>
                <Chip label={preinscripcion.codigo_inscripcion} color="primary" size="small" sx={{ fontWeight: 600 }} />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">CI</Typography>
                  <Typography variant="body1" fontWeight={600}>{preinscripcion.estudiante.ci || 'No especificado'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Fecha de Nacimiento</Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {new Date(preinscripcion.estudiante.fecha_nacimiento).toLocaleDateString('es-BO')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Grado Solicitado</Typography>
                  <Chip label={preinscripcion.estudiante.grado_solicitado} size="small" color="secondary" sx={{ fontWeight: 600, mt: 0.5 }} />
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" color="text.secondary">Representante</Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {preinscripcion.tutor.nombres} {preinscripcion.tutor.apellido_paterno}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Tel: {preinscripcion.tutor.telefono}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Formulario de Conversión */}
        <Grid size={{xs:12, md:7}}>
          <Card sx={{ borderRadius: 4, boxShadow: theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Box sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                }}>
                  <SchoolIcon sx={{ color: '#fff', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Asignar a Paralelo</Typography>
                  <Typography variant="body2" color="text.secondary">Selecciona el paralelo y periodo académico</Typography>
                </Box>
              </Box>

              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <CalendarTodayIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="subtitle2" fontWeight={600}>Periodo Académico</Typography>
                  </Stack>
                  <FormControl fullWidth>
                    <Select
                      value={periodoAcademicoId}
                      onChange={(e) => setPeriodoAcademicoId(e.target.value)}
                      disabled={!periodos || periodos.length === 0 || isConverting}
                      sx={{ borderRadius: 3 }}
                    >
                      {periodos && periodos.length > 0 ? (
                        periodos.map((periodo) => (
                          <MenuItem key={periodo.id} value={periodo.id}>
                            <Box>
                              <Typography fontWeight={600}>{periodo.nombre}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(periodo.fecha_inicio).toLocaleDateString('es-BO')} - {new Date(periodo.fecha_fin).toLocaleDateString('es-BO')}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No hay periodos activos</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <FilterListIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="subtitle2" fontWeight={600}>Filtrar por Grado</Typography>
                    {loadingGrados && <CircularProgress size={16} />}
                  </Stack>
                  <FormControl fullWidth>
                    <Select
                      value={gradoFiltro || ''}
                      onChange={(e) => setGradoFiltro(e.target.value ? Number(e.target.value) : null)}
                      disabled={!grados || grados.length === 0 || loadingGrados || isConverting}
                      sx={{ borderRadius: 3 }}
                    >
                      <MenuItem value="">Todos los grados</MenuItem>
                      {grados && grados.map((grado) => (
                        <MenuItem key={grado.id} value={grado.id}>
                          {grado.nombre} ({grado.nivel_nombre})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <GroupsIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="subtitle2" fontWeight={600}>Paralelo</Typography>
                    {loadingParalelos && <CircularProgress size={16} />}
                  </Stack>
                  <FormControl fullWidth>
                    <Select
                      value={paraleloId}
                      onChange={(e) => setParaleloId(e.target.value)}
                      disabled={!paralelosFiltrados || paralelosFiltrados.length === 0 || loadingParalelos || isConverting}
                      sx={{ borderRadius: 3 }}
                    >
                      {paralelosFiltrados && paralelosFiltrados.length > 0 ? (
                        paralelosFiltrados.map((paralelo: any) => (
                          <MenuItem key={paralelo.id} value={paralelo.id}>
                            <Box sx={{ width: '100%' }}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                  <Typography fontWeight={600}>
                                    {paralelo.grado_nombre} - Paralelo {paralelo.nombre}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {paralelo.turno_nombre} • Aula {paralelo.aula || 'N/A'}
                                  </Typography>
                                </Box>
                                <Tooltip title={`${paralelo.disponibles} cupos disponibles de ${paralelo.capacidad_maxima}`}>
                                  <Chip
                                    label={`${paralelo.disponibles}/${paralelo.capacidad_maxima}`}
                                    size="small"
                                    color={paralelo.disponibles > 5 ? "success" : "warning"}
                                    sx={{ fontWeight: 700 }}
                                  />
                                </Tooltip>
                              </Stack>
                            </Box>
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>
                          {loadingParalelos ? "Cargando paralelos..." : "No hay paralelos disponibles"}
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Box>

                <Alert severity="info" icon={<InfoIcon />} sx={{ borderRadius: 2 }}>
                  <AlertTitle sx={{ fontWeight: 600 }}>¿Qué sucederá al convertir?</AlertTitle>
                  <Stack spacing={0.5} component="ul" sx={{ pl: 2, mt: 1 }}>
                    <li>Se creará un nuevo registro de estudiante oficial</li>
                    <li>Se generará un código único de estudiante</li>
                    <li>Se creará la matrícula para el periodo seleccionado</li>
                    <li>Se crearán usuarios para el estudiante y el padre</li>
                    <li>Se migrarán los documentos adjuntados</li>
                    <li>Se enviará notificación de bienvenida</li>
                  </Stack>
                </Alert>

                <Divider />

                <Stack direction="row" justifyContent="space-between" gap={2}>
                  <Button
                    variant="outlined"
                    onClick={() => router.back()}
                    disabled={isConverting}
                    sx={{ borderRadius: 3, textTransform: 'none', px: 3 }}
                  >
                    Cancelar
                  </Button>

                  <Button
                    variant="contained"
                    startIcon={isConverting ? <CircularProgress size={20} /> : <PersonAddIcon />}
                    onClick={handleConvertir}
                    disabled={!paraleloId || !periodoAcademicoId || isConverting}
                    sx={{
                      borderRadius: 3,
                      textTransform: 'none',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      px: 4,
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                      },
                    }}
                  >
                    {isConverting ? 'Convirtiendo...' : 'Convertir a Estudiante Oficial'}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 🆕 DIALOG DE CREDENCIALES */}
      <Dialog 
        open={showCredenciales} 
        onClose={handleCloseCredenciales}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <CheckCircleIcon sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h6" fontWeight={700}>¡Conversión Exitosa!</Typography>
            <Typography variant="caption">Credenciales de acceso generadas</Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            <AlertTitle>Estudiante creado correctamente</AlertTitle>
            <Typography variant="body2">
              <strong>Código:</strong> {conversionExitosa?.data.estudiante.codigo}
            </Typography>
            {(conversionExitosa?.data.documentos_migrados ?? 0) > 0 && (
              <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 1 }}>
                <DescriptionIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption">
                  {conversionExitosa?.data.documentos_migrados ?? 0} documento(s) migrado(s) exitosamente
                </Typography>
              </Stack>
            )}
          </Alert>

          <Stack spacing={3}>
            {/* Credenciales Estudiante */}
            {conversionExitosa?.data.credenciales_estudiante && (
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper' }}>
                <Stack direction="row" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <SchoolIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>Credenciales del Estudiante</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {conversionExitosa.data.estudiante.nombres} {conversionExitosa.data.estudiante.apellidos}
                    </Typography>
                  </Box>
                </Stack>

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <EmailIcon sx={{ fontSize: 16 }} /> Email
                    </Typography>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Typography variant="body1" fontWeight={600}>
                        {conversionExitosa.data.credenciales_estudiante.email}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => handleCopyToClipboard(conversionExitosa?.data.credenciales_estudiante?.email ?? '', 'Email')}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">Usuario</Typography>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Typography variant="body1" fontWeight={600}>
                        {conversionExitosa.data.credenciales_estudiante.username}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => handleCopyToClipboard(conversionExitosa?.data.credenciales_estudiante?.username ?? '', 'Usuario')}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LockIcon sx={{ fontSize: 16 }} /> Contraseña
                    </Typography>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Typography variant="body1" fontWeight={600} fontFamily="monospace">
                        {showPasswords.estudiante 
                          ? conversionExitosa.data.credenciales_estudiante.password 
                          : '••••••••••'}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => setShowPasswords(prev => ({ ...prev, estudiante: !prev.estudiante }))}
                      >
                        {showPasswords.estudiante ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleCopyToClipboard(conversionExitosa?.data.credenciales_estudiante?.password ?? '', 'Contraseña')}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>

                  <Alert severity="warning" sx={{ borderRadius: 2 }}>
                    <Typography variant="caption">
                      El estudiante deberá cambiar su contraseña en el primer inicio de sesión
                    </Typography>
                  </Alert>
                </Stack>
              </Paper>
            )}

            {/* Credenciales Padre */}
            {conversionExitosa?.data.credenciales_padre && (
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper' }}>
                <Stack direction="row" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <GroupsIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>Credenciales del Padre/Tutor</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {preinscripcion.tutor.nombres} {preinscripcion.tutor.apellido_paterno}
                    </Typography>
                  </Box>
                </Stack>

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <EmailIcon sx={{ fontSize: 16 }} /> Email
                    </Typography>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Typography variant="body1" fontWeight={600}>
                        {conversionExitosa.data.credenciales_padre.email}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => handleCopyToClipboard(conversionExitosa?.data.credenciales_padre?.email ?? '', 'Email')}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">Usuario</Typography>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Typography variant="body1" fontWeight={600}>
                        {conversionExitosa.data.credenciales_padre.username}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => handleCopyToClipboard(conversionExitosa?.data.credenciales_padre?.username ?? '', 'Usuario')}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LockIcon sx={{ fontSize: 16 }} /> Contraseña
                    </Typography>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Typography variant="body1" fontWeight={600} fontFamily="monospace">
                        {showPasswords.padre 
                          ? conversionExitosa.data.credenciales_padre.password 
                          : '••••••••••'}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => setShowPasswords(prev => ({ ...prev, padre: !prev.padre }))}
                      >
                        {showPasswords.padre ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleCopyToClipboard(conversionExitosa?.data.credenciales_padre?.password ?? '', 'Contraseña')}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>

                  <Alert severity="warning" sx={{ borderRadius: 2 }}>
                    <Typography variant="caption">
                      El padre/tutor deberá cambiar su contraseña en el primer inicio de sesión
                    </Typography>
                  </Alert>
                </Stack>
              </Paper>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button 
            variant="contained" 
            onClick={handleCloseCredenciales}
            sx={{ 
              borderRadius: 3,
              px: 4,
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            }}
          >
            Ir al Perfil del Estudiante
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}