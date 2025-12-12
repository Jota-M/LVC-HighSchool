import React from 'react';
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Paper,
  Chip,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  ArrowForward as NextIcon,
  ArrowBack as BackIcon,
  School as SchoolIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { OpcionesMatriculaResponse } from '@/types/autoMatriculacionTypes';

interface SeleccionParaleloStepProps {
  opciones: OpcionesMatriculaResponse['data'];
  paraleloSeleccionado: number | null;
  gradoFiltro: number | null;
  isLoadingOpciones: boolean;
  onParaleloChange: (paraleloId: number) => void;
  onGradoFiltroChange: (gradoId: number | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export const SeleccionParaleloStep: React.FC<SeleccionParaleloStepProps> = ({
  opciones,
  paraleloSeleccionado,
  gradoFiltro,
  isLoadingOpciones,
  onParaleloChange,
  onGradoFiltroChange,
  onNext,
  onBack,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const paralelosFiltrados = React.useMemo(() => {
    if (!opciones?.paralelos) return [];
    if (!gradoFiltro) return opciones.paralelos;
    return opciones.paralelos.filter((p) => p.grado_id === gradoFiltro);
  }, [opciones?.paralelos, gradoFiltro]);

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
        <SchoolIcon
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
          Selecciona tu Paralelo
        </Typography>
      </Box>

      <Alert 
        severity="info" 
        sx={{ 
          mb: 3, 
          borderRadius: '12px',
          border: '2px solid rgba(33, 150, 243, 0.3)',
        }}
      >
        <Typography fontWeight={600}>
          📅 Periodo: <strong>{opciones.periodo_activo.nombre}</strong>
        </Typography>
      </Alert>

      <FormControl 
        fullWidth 
        sx={{ 
          mb: 3,
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
          },
        }}
      >
        <InputLabel>Filtrar por Grado</InputLabel>
        <Select
          value={gradoFiltro || ''}
          onChange={(e) => onGradoFiltroChange(e.target.value ? Number(e.target.value) : null)}
          label="Filtrar por Grado"
        >
          <MenuItem value="">📚 Todos los grados</MenuItem>
          {opciones.grados.map((grado) => (
            <MenuItem key={grado.id} value={grado.id}>
              {grado.nombre} - {grado.nivel_nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

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
            <Grid size={{ xs: 12 }} key={paralelo.id}>
              <Paper
                onClick={() => onParaleloChange(paralelo.id)}
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  border: '2px solid',
                  borderColor: paraleloSeleccionado === paralelo.id
                    ? (isDark ? '#facc15' : '#0288d1')
                    : 'transparent',
                  backgroundColor: paraleloSeleccionado === paralelo.id
                    ? (isDark ? 'rgba(250, 204, 21, 0.1)' : 'rgba(2, 136, 209, 0.1)')
                    : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                    borderColor: isDark ? '#facc15' : '#0288d1',
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {paralelo.grado_nombre} - Paralelo {paralelo.nombre}
                      </Typography>
                      {paraleloSeleccionado === paralelo.id && (
                        <CheckIcon sx={{ color: isDark ? '#facc15' : '#0288d1' }} />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      🕒 {paralelo.turno_nombre} ({paralelo.hora_inicio} - {paralelo.hora_fin})
                    </Typography>
                    {paralelo.aula && (
                      <Chip 
                        label={`Aula: ${paralelo.aula}`} 
                        size="small" 
                        sx={{ 
                          fontWeight: 600,
                          backgroundColor: isDark ? 'rgba(250, 204, 21, 0.2)' : 'rgba(2, 136, 209, 0.2)',
                        }} 
                      />
                    )}
                  </Box>
                  <Box sx={{ textAlign: 'right', ml: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Disponibles
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: paralelo.disponibles > 5 ? '#4caf50' : '#ff9800',
                      }}
                    >
                      {paralelo.disponibles}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      de {paralelo.capacidad_maxima}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button 
          onClick={onBack} 
          startIcon={<BackIcon />} 
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Atrás
        </Button>
        <Button
          variant="contained"
          onClick={onNext}
          disabled={!paraleloSeleccionado}
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
          Continuar
        </Button>
      </Box>
    </Box>
  );
};