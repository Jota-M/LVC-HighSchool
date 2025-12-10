
import React, { useState } from 'react';
import { Paper, TextField, Button, Grid, Alert, CircularProgress, useTheme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

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
    onBuscar(codigo);
  };

  const fieldStyle = {
    '& .MuiInputBase-root': {
      borderRadius: '12px',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.9)',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(1, 87, 155, 0.2)',
      borderWidth: '2px',
    },
  };

  return (
    <Paper
      elevation={8}
      sx={{
        p: 4,
        borderRadius: 4,
        mb: 4,
        background: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(1, 87, 155, 0.1)',
      }}
    >
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{xs:12, md:8}}>
            <TextField
              fullWidth
              label="Código de Preinscripción"
              placeholder="Ej: PRE-2025-0001"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              sx={fieldStyle}
            />
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
              disabled={loading}
              sx={{
                borderRadius: 3,
                py: 1.8,
                fontSize: '1rem',
                fontWeight: 700,
                background: isDark
                  ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                  : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                color: isDark ? '#000' : '#fff',
                textTransform: 'none',
                '&:hover': {
                  background: isDark
                    ? 'linear-gradient(135deg, #f59e0b 0%, #ea980b 100%)'
                    : 'linear-gradient(135deg, #01579b 0%, #014a7f 100%)',
                },
              }}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
      </form>
    </Paper>
  );
};
