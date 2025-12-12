import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  Chip,
  Grid,
  useTheme,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { AutoMatriculacionResponse } from '@/types/autoMatriculacionTypes';

interface ConfirmacionStepProps {
  matriculaExitosa: AutoMatriculacionResponse;
  onReiniciar: () => void;
}

export const ConfirmacionStep: React.FC<ConfirmacionStepProps> = ({
  matriculaExitosa,
  onReiniciar,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ textAlign: 'center' }}>
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
          boxShadow: '0 8px 32px rgba(34, 197, 94, 0.4)',
        }}
      >
        <CheckIcon sx={{ fontSize: 64, color: '#fff' }} />
      </Box>

      <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
        ¡Matrícula Exitosa!
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Tu matrícula ha sido procesada correctamente
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: '16px',
          border: '2px solid #10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.05)',
          textAlign: 'left',
        }}
      >
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary">
              Número de Matrícula
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981' }}>
              {matriculaExitosa.data.matricula.numero_matricula}
            </Typography>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Grado y Paralelo
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {matriculaExitosa.data.matricula.grado_nombre} -{' '}
              {matriculaExitosa.data.matricula.paralelo_nombre}
            </Typography>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Turno
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {matriculaExitosa.data.matricula.turno_nombre}
            </Typography>
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary">
              Fecha de Matrícula
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {new Date(matriculaExitosa.data.matricula.fecha_matricula).toLocaleDateString(
                'es-ES',
                { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
              )}
            </Typography>
          </Grid>
          
          {matriculaExitosa.data.documentos && matriculaExitosa.data.documentos.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Documentos Subidos
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {matriculaExitosa.data.documentos.map((doc, index) => (
                  <Chip
                    key={index}
                    label={doc.tipo_documento.replace(/_/g, ' ')}
                    size="small"
                    color="success"
                    sx={{ fontWeight: 600 }}
                  />
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Alert
        severity="success"
        sx={{
          mb: 3,
          borderRadius: '12px',
          textAlign: 'left',
          border: '2px solid #10b981',
        }}
      >
        <Typography fontWeight={600} sx={{ mb: 1 }}>
          ✅ Próximos Pasos
        </Typography>
        <Typography variant="body2">
          Tu matrícula ha sido confirmada exitosamente. Debes presentarte en la institución en las
          fechas indicadas con los <strong>documentos originales</strong> para validar tu inscripción
          y completar el proceso.
        </Typography>
      </Alert>

      <Button
        variant="contained"
        size="large"
        onClick={onReiniciar}
        startIcon={<HomeIcon />}
        sx={{
          borderRadius: '12px',
          textTransform: 'none',
          px: 4,
          py: 1.5,
          fontWeight: 600,
          fontSize: '1rem',
          background: isDark
            ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
            : 'linear-gradient(135deg, #0288d1 0%, #0277bd 100%)',
          color: isDark ? '#000' : '#fff',
        }}
      >
        Volver al Inicio
      </Button>
    </Box>
  );
};