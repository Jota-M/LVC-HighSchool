import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  ArrowForward as NextIcon,
} from '@mui/icons-material';

interface VerificacionStepProps {
  formData: { codigo: string; ci: string };
  isValidando: boolean;
  onChange: (field: string, value: string) => void;
  onValidar: () => void;
}

export const VerificacionStep: React.FC<VerificacionStepProps> = ({
  formData,
  isValidando,
  onChange,
  onValidar,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const fieldStyle = {
    width: '100%',
    '& .MuiInputLabel-root': {
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
      fontWeight: 500,
      fontSize: '0.95rem',
      '&.Mui-focused': {
        color: isDark ? '#facc15' : '#0288d1',
      },
    },
    '& .MuiInputBase-root': {
      borderRadius: '12px',
      transition: '0.2s ease',
      border: '1px solid transparent',
      '&:hover': {
        borderColor: isDark ? '#facc15' : '#0288d1',
      },
      '&.Mui-focused': {
        borderColor: isDark ? '#facc15' : '#0288d1',
        boxShadow: `0 0 0 2px ${isDark ? 'rgba(250, 204, 21, 0.3)' : 'rgba(2, 136, 209, 0.25)'}`,
      },
    },
    '& .MuiInputBase-input': {
      color: isDark ? '#fff' : '#000',
    },
  };

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
          transition: '0.3s ease',
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
          Verificación de Identidad
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Ingresa tu código de estudiante y cédula de identidad para acceder al sistema de matrícula.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Código de Estudiante"
            placeholder="EST-2024-0001"
            value={formData.codigo}
            onChange={(e) => onChange('codigo', e.target.value.toUpperCase())}
            disabled={isValidando}
            InputProps={{
              startAdornment: <SchoolIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={fieldStyle}
            required
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Cédula de Identidad (CI)"
            placeholder="1234567"
            value={formData.ci}
            onChange={(e) => onChange('ci', e.target.value)}
            disabled={isValidando}
            sx={fieldStyle}
            required
          />
        </Grid>
      </Grid>

      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={onValidar}
        disabled={isValidando || !formData.codigo || !formData.ci}
        endIcon={isValidando ? <CircularProgress size={20} color="inherit" /> : <NextIcon />}
        sx={{
          mt: 4,
          py: 1.5,
          borderRadius: '12px',
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 600,
          background: isDark
            ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
            : 'linear-gradient(135deg, #0288d1 0%, #0277bd 100%)',
          color: isDark ? '#000' : '#fff',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        {isValidando ? 'Verificando...' : 'Verificar y Continuar'}
      </Button>
    </Box>
  );
};