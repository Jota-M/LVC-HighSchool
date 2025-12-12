import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Avatar,
  Chip,
  Alert,
  Paper,
  useTheme,
} from '@mui/material';
import {
  ArrowForward as NextIcon,
  ArrowBack as BackIcon,
  Person as PersonIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { ValidacionResponse } from '@/types/autoMatriculacionTypes';

interface InformacionStepProps {
  datosEstudiante: ValidacionResponse['data'];
  onNext: () => void;
  onBack: () => void;
}

export const InformacionStep: React.FC<InformacionStepProps> = ({
  datosEstudiante,
  onNext,
  onBack,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 4,
          p: 2,
          borderRadius: 3,
          background: isDark
            ? 'rgba(250, 204, 21, 0.08)'
            : 'rgba(2, 136, 209, 0.08)',
        }}
      >
        <PersonIcon
          sx={{
            fontSize: 38,
            color: isDark ? '#facc15' : '#0288d1',
            filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.4))',
          }}
        />
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            color: isDark ? '#facc15' : '#0288d1',
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          Información del Estudiante
        </Typography>
      </Box>

      {datosEstudiante.ya_matriculado && (
        <Alert 
          severity="info" 
          sx={{ 
            mb: 3, 
            borderRadius: '12px',
            border: '2px solid rgba(33, 150, 243, 0.3)',
          }}
        >
          <Typography fontWeight={600}>Ya estás matriculado</Typography>
          <Typography variant="body2">
            Periodo: <strong>{datosEstudiante.periodo_activo?.nombre}</strong>
          </Typography>
        </Alert>
      )}

      {/* Información Personal */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: '16px',
          border: '2px solid',
          borderColor: isDark ? 'rgba(250, 204, 21, 0.2)' : 'rgba(2, 136, 209, 0.2)',
          backgroundColor: isDark ? 'rgba(250, 204, 21, 0.05)' : 'rgba(2, 136, 209, 0.05)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
          <Avatar
            src={datosEstudiante.estudiante.foto_url || undefined}
            sx={{ 
              width: 80, 
              height: 80,
              border: '3px solid',
              borderColor: isDark ? '#facc15' : '#0288d1',
            }}
          >
            {datosEstudiante.estudiante.nombres.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              {datosEstudiante.estudiante.nombres}{' '}
              {datosEstudiante.estudiante.apellido_paterno}{' '}
              {datosEstudiante.estudiante.apellido_materno}
            </Typography>
            <Chip
              label={`Código: ${datosEstudiante.estudiante.codigo}`}
              size="small"
              sx={{
                backgroundColor: isDark ? 'rgba(250, 204, 21, 0.2)' : 'rgba(2, 136, 209, 0.2)',
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">Email</Typography>
            <Typography variant="body2" fontWeight={500}>
              {datosEstudiante.estudiante.email || 'No registrado'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">Teléfono</Typography>
            <Typography variant="body2" fontWeight={500}>
              {datosEstudiante.estudiante.telefono || 'No registrado'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary">Dirección</Typography>
            <Typography variant="body2" fontWeight={500}>
              {datosEstudiante.estudiante.direccion || 'No registrado'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Última Matrícula */}
      {datosEstudiante.ultima_matricula && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: '16px',
            border: '2px solid rgba(76, 175, 80, 0.3)',
            backgroundColor: 'rgba(76, 175, 80, 0.05)',
          }}
        >
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckIcon sx={{ color: '#4caf50' }} />
            Última Matrícula
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">Periodo</Typography>
              <Typography variant="body2" fontWeight={600}>
                {datosEstudiante.ultima_matricula.periodo_nombre}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">Grado</Typography>
              <Typography variant="body2" fontWeight={600}>
                {datosEstudiante.ultima_matricula.grado_nombre}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">Paralelo</Typography>
              <Typography variant="body2" fontWeight={600}>
                {datosEstudiante.ultima_matricula.paralelo_nombre}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">Estado</Typography>
              <Chip
                label={datosEstudiante.ultima_matricula.estado}
                size="small"
                color="success"
                sx={{ fontWeight: 600 }}
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Periodo Disponible */}
      {datosEstudiante.periodo_activo && !datosEstudiante.ya_matriculado && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3, 
            borderRadius: '12px',
            border: '2px solid rgba(76, 175, 80, 0.3)',
          }}
        >
          <Typography fontWeight={600} sx={{ mb: 0.5 }}>
            📅 Periodo Disponible para Inscripción
          </Typography>
          <Typography variant="body2">
            <strong>{datosEstudiante.periodo_activo.nombre}</strong>
          </Typography>
          <Typography variant="body2">
            Inscripciones hasta: {new Date(datosEstudiante.periodo_activo.fecha_fin).toLocaleDateString('es-ES')}
          </Typography>
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button 
          onClick={onBack} 
          startIcon={<BackIcon />} 
          sx={{ 
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Volver
        </Button>
        {!datosEstudiante.ya_matriculado && datosEstudiante.periodo_activo && (
          <Button
            variant="contained"
            onClick={onNext}
            endIcon={<NextIcon />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              px: 4,
              fontWeight: 600,
              background: isDark
                ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                : 'linear-gradient(135deg, #0288d1 0%, #0277bd 100%)',
              color: isDark ? '#000' : '#fff',
            }}
          >
            Continuar con Matrícula
          </Button>
        )}
      </Box>
    </Box>
  );
};