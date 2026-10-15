import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  useTheme,
  Box,
  Typography,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BadgeIcon from '@mui/icons-material/Badge';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface BuscadorPreinscripcionProps {
  onBuscar: (codigo: string) => void;
  loading: boolean;
  error: string;
}

export const BuscadorPreinscripcion: React.FC<BuscadorPreinscripcionProps> = ({
  onBuscar,
  loading,
  error,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [codigo, setCodigo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (codigo.trim()) {
      onBuscar(codigo.trim());
    }
  };

  const paperStyle = {
    p: { xs: 3, md: 4.5 },
    borderRadius: '24px',
    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(1, 87, 155, 0.12)',
    boxShadow: isDark
      ? '0 20px 60px rgba(0, 0, 0, 0.5)'
      : '0 20px 60px rgba(1, 87, 155, 0.1)',
  };

  return (
    <Paper elevation={0} sx={{ ...paperStyle, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              bgcolor: isDark ? 'rgba(250, 204, 21, 0.15)' : 'rgba(2, 136, 209, 0.12)',
              color: isDark ? '#facc15' : '#01579b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BadgeIcon sx={{ fontSize: 22 }} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800,
              color: isDark ? '#ffffff' : '#0f172a',
            }}
          >
            Búsqueda de Solicitud
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{
            fontFamily: "'Montserrat', sans-serif",
            color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b',
          }}
        >
          Ingresa el Código de Preinscripción generado al registrarte o el número de Cédula de Identidad del estudiante.
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 8.5 }}>
            <TextField
              fullWidth
              placeholder="Ej: PRE-2026-0001 o 12345678"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              disabled={loading}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: isDark ? '#facc15' : '#0288d1' }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: '14px',
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
                  fontSize: '1rem',
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(1, 87, 155, 0.2)',
                  borderWidth: '1.5px',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? '#facc15' : '#0288d1',
                },
                '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? '#facc15' : '#01579b',
                  borderWidth: '2px',
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3.5 }}>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
              disabled={loading || !codigo.trim()}
              sx={{
                borderRadius: '14px',
                py: 1.8,
                fontSize: '0.95rem',
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 800,
                textTransform: 'none',
                background: isDark
                  ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                  : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                color: isDark ? '#0f172a' : '#ffffff',
                boxShadow: isDark
                  ? '0 8px 25px rgba(250, 204, 21, 0.3)'
                  : '0 8px 25px rgba(1, 87, 155, 0.3)',
                '&:hover': {
                  background: isDark
                    ? 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)'
                    : 'linear-gradient(135deg, #01579b 0%, #014a7f 100%)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {loading ? 'Consultando...' : 'Consultar Solicitud'}
            </Button>
          </Grid>
        </Grid>

        {error && (
          <Alert
            severity="error"
            icon={<InfoOutlinedIcon />}
            sx={{
              mt: 3,
              borderRadius: '14px',
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
            }}
          >
            {error}
          </Alert>
        )}
      </form>
    </Paper>
  );
};
