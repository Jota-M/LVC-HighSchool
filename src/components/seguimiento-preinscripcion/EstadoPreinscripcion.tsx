import { EstadoPreInscripcion, ESTADOS_PREINSCRIPCION, PreInscripcionDetalle } from "@/types/preinscripcionTypes";
import RefreshIcon from '@mui/icons-material/Refresh';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import { Alert, AlertTitle, Box, Chip, Divider, Grid, IconButton, Paper, Step, StepLabel, Stepper, Typography,useTheme } from "@mui/material";

const PASOS_PROCESO = [
  'Solicitud Iniciada',
  'Documentos y Revisión',
  'Entrevista',
  'Resultado',
];

interface EstadoPreinscripcionProps {
  preinscripcion: PreInscripcionDetalle;
  onRecargar: () => void;
}

export const EstadoPreinscripcion: React.FC<EstadoPreinscripcionProps> = ({
  preinscripcion,
  onRecargar,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const getPasoActivo = (estado: EstadoPreInscripcion): number => {
    const mapeo: Record<EstadoPreInscripcion, number> = {
      'iniciada': 0,
      'datos_completos': 1,
      'documentos_pendientes': 1,
      'en_revision': 1,
      'documentos_aprobados': 2,
      'entrevista_pendiente': 2,
      'entrevista_programada': 2,
      'entrevista_completada': 3,
      'aprobada': 4,
      'rechazada': -1,
      'convertida': 5,
      'expirada': -1,
      'cancelada': -1,
    };
    return mapeo[estado] ?? 0;
  };

  const estadoInfo = ESTADOS_PREINSCRIPCION[preinscripcion.estado as EstadoPreInscripcion];
  const pasoActivo = getPasoActivo(preinscripcion.estado as EstadoPreInscripcion);

  return (
    <Paper
      elevation={8}
      sx={{
        p: 4,
        borderRadius: 4,
        mb: 4,
        background: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Estado de tu Solicitud
        </Typography>
        <IconButton onClick={onRecargar} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{xs:12, md:6}}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Código de Inscripción
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {preinscripcion.codigo_inscripcion}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Estudiante
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {preinscripcion.estudiante.nombres} {preinscripcion.estudiante.apellido_paterno}
            </Typography>
          </Box>
        </Grid>
        <Grid size={{xs:12, md:6}}>
          <Box sx={{ textAlign: { md: 'right' } }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Estado Actual
            </Typography>
            <Chip
              label={estadoInfo?.label}
              sx={{
                bgcolor: estadoInfo?.color,
                color: '#fff',
                fontWeight: 700,
                fontSize: '1rem',
                px: 2,
                py: 2.5,
              }}
            />
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Stepper activeStep={pasoActivo} alternativeLabel>
        {PASOS_PROCESO.map((label, index) => (
          <Step key={label} completed={index < pasoActivo}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {preinscripcion.observaciones && (
        <Alert severity="info" icon={<PendingIcon />} sx={{ mt: 3, borderRadius: 2 }}>
          <AlertTitle fontWeight={700}>Observaciones</AlertTitle>
          {preinscripcion.observaciones}
        </Alert>
      )}

      {preinscripcion.motivo_rechazo && (
        <Alert severity="error" icon={<ErrorIcon />} sx={{ mt: 3, borderRadius: 2 }}>
          <AlertTitle fontWeight={700}>Motivo de Rechazo</AlertTitle>
          {preinscripcion.motivo_rechazo}
        </Alert>
      )}
    </Paper>
  );
};
