// components/preinscripcion/ModoRegistroSelector.tsx
'use client';
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Radio,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Container,
  Paper,
  useTheme,
  Fade,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import SearchIcon from '@mui/icons-material/Search';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import preinscripcionService from '@/services/preinscripcionService';

interface PadreEncontrado {
  id: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  ci: string;
  telefono: string;
  celular: string | null;
  email: string | null;
  direccion: string | null;
  ocupacion: string | null;
  tiene_hijos_matriculados: boolean;
  hijos?: Array<{
    id: number;
    nombres: string;
    apellido_paterno: string;
    grado_actual: string;
    paralelo: string;
  }>;
}

interface ModoRegistroSelectorProps {
  onModoSeleccionado: (data: { modo: string; padre: PadreEncontrado | null }) => void;
}

export default function ModoRegistroSelector({ onModoSeleccionado }: ModoRegistroSelectorProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [modo, setModo] = useState('nuevo');
  const [ciBusqueda, setCiBusqueda] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [padreEncontrado, setPadreEncontrado] = useState<PadreEncontrado | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBuscarPadre = async () => {
    if (!ciBusqueda || ciBusqueda.length < 4) {
      setError('Ingrese un CI válido (mínimo 4 dígitos)');
      return;
    }

    setBuscando(true);
    setError(null);
    setPadreEncontrado(null);

    try {
      const data = await preinscripcionService.buscarPadrePorCI(ciBusqueda);

      if (data.success && data.data?.encontrado) {
        setPadreEncontrado(data.data.padre || null);
        setError(null);
      } else {
        setError(data.message || 'No se encontró un padre con ese CI');
        setPadreEncontrado(null);
      }
    } catch (err: any) {
      setError(err.message || 'Error al buscar padre');
      setPadreEncontrado(null);
    } finally {
      setBuscando(false);
    }
  };

  const handleContinuar = () => {
    if (modo === 'padre_existente' && !padreEncontrado) {
      setError('Primero debe buscar y verificar al padre');
      return;
    }

    onModoSeleccionado({
      modo,
      padre: padreEncontrado,
    });
  };

  const cardStyle = {
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: '20px',
    overflow: 'hidden',
    position: 'relative',
    '&:hover': {
      transform: 'translateY(-8px)',
      boxShadow: isDark ? '0 20px 60px rgba(250, 204, 21, 0.3)' : '0 20px 60px rgba(2, 136, 209, 0.3)',
    },
  };

  const iconBoxStyle = (color: string, isSelected: boolean) => ({
    width: 80,
    height: 80,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: isSelected
      ? isDark
        ? `linear-gradient(135deg, ${color}, ${color}dd)`
        : `linear-gradient(135deg, ${color}, ${color}dd)`
      : isDark
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.03)',
    transition: 'all 0.3s ease',
    boxShadow: isSelected ? `0 8px 25px ${color}40` : 'none',
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isDark
          ? 'linear-gradient(135deg, #090B26, #000000)'
          : 'linear-gradient(135deg, #fdfcfb, #B9BED4)',
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Fade in timeout={500}>
          <Box>
            {/* Header */}
            <Box sx={{ mb: 6, textAlign: 'center' }}>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: 'Roboto',
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  fontWeight: 700,
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2,
                }}
              >
                Inscripción de Estudiantes
              </Typography>
              <Typography variant="h5"  color="text.secondary" fontWeight={500} fontFamily={'Roboto'}>
                ¿Cómo desea realizar la inscripción?
              </Typography>
            </Box>

            {/* Cards de Opciones */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
              {/* Opción 1: Nuevo */}
              <Card
                sx={{
                  ...cardStyle,
                  border: modo === 'nuevo' ? `3px solid #0288d1` : `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                }}
                onClick={() => setModo('nuevo')}
              >
                <CardContent sx={{ p: 4, textAlign: 'center',}}>
                  <Box sx={iconBoxStyle('#0288d1', modo === 'nuevo', )} mx="auto" mb={3} >
                    <PersonAddIcon sx={{ fontSize: 40, color: modo === 'nuevo' ? '#fff' : '#0288d1' }} />
                  </Box>
                  <Radio value="nuevo" checked={modo === 'nuevo'}  sx={{ position: 'absolute', top: 16, right: 16 }} />
                  <Typography variant="h6" fontFamily={'Roboto'} fontWeight={700} mb={1}>
                    Nuevo Padre/Tutor
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Registrar un estudiante con un nuevo padre/tutor
                  </Typography>
                </CardContent>
              </Card>

              {/* Opción 2: Padre Existente */}
              <Card
                sx={{
                  ...cardStyle,
                  border: modo === 'padre_existente' ? `3px solid #10b981` : `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                }}
                onClick={() => setModo('padre_existente')}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box sx={iconBoxStyle('#10b981', modo === 'padre_existente')} mx="auto" mb={3}>
                    <FamilyRestroomIcon sx={{ fontSize: 40, color: modo === 'padre_existente' ? '#fff' : '#10b981' }} />
                  </Box>
                  <Radio value="padre_existente" checked={modo === 'padre_existente'} sx={{ position: 'absolute', top: 16, right: 16 }} />
                  <Typography variant="h6" fontFamily={'Roboto'} fontWeight={700} mb={1}>
                    Padre Existente
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ya tengo un hijo aquí, registrar otro
                  </Typography>
                </CardContent>
              </Card>

              {/* Opción 3: Múltiple */}
              <Card
                sx={{
                  ...cardStyle,
                  border: modo === 'multiple' ? `3px solid #f59e0b` : `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                }}
                onClick={() => setModo('multiple')}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box sx={iconBoxStyle('#f59e0b', modo === 'multiple')} mx="auto" mb={3}>
                    <GroupAddIcon sx={{ fontSize: 40, color: modo === 'multiple' ? '#fff' : '#f59e0b' }} />
                  </Box>
                  <Radio value="multiple" checked={modo === 'multiple'} sx={{ position: 'absolute', top: 16, right: 16 }} />
                  <Typography variant="h6" fontFamily={'Roboto'} fontWeight={700} mb={1}>
                    Varios Estudiantes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Registrar varios hermanos a la vez (máximo 5)
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Búsqueda de Padre (solo si padre_existente) */}
            {modo === 'padre_existente' && (
              <Fade in timeout={300}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: '20px',
                    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(1, 87, 155, 0.1)',
                    mb: 4,
                  }}
                >
                  <Typography variant="h6"  fontFamily={'Roboto'} fontWeight={700} mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SearchIcon /> Buscar Padre/Tutor Existente
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  <Box display="flex" gap={2} mb={3}>
                    <TextField
                      fullWidth
                      label="Cédula de Identidad"
                      value={ciBusqueda}
                      onChange={(e) => setCiBusqueda(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleBuscarPadre();
                      }}
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: '12px',
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleBuscarPadre}
                      disabled={buscando}
                      startIcon={buscando ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                      sx={{
                        borderRadius: '12px',
                        px: 4,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        minWidth: 150,
                      }}
                    >
                      Buscar
                    </Button>
                  </Box>

                  {error && (
                    <Alert severity="error" sx={{ borderRadius: '12px' }}>
                      {error}
                    </Alert>
                  )}

                  {padreEncontrado && (
                    <Alert
                      severity="success"
                      icon={<CheckCircleIcon />}
                      sx={{
                        borderRadius: '12px',
                        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                      }}
                    >
                      <Typography variant="body1" fontWeight={700} mb={2}>
                        ✅ Padre/Tutor Encontrado
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Nombre Completo
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {padreEncontrado.nombres} {padreEncontrado.apellido_paterno} {padreEncontrado.apellido_materno}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Cédula de Identidad
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {padreEncontrado.ci}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Teléfono
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {padreEncontrado.telefono}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Email
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {padreEncontrado.email || 'No registrado'}
                          </Typography>
                        </Box>
                      </Box>

                      {padreEncontrado.hijos && padreEncontrado.hijos.length > 0 && (
                        <Box mt={2}>
                          <Typography variant="body2" fontWeight={600} mb={1}>
                            Hijos actualmente matriculados:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {padreEncontrado.hijos.map((hijo) => (
                              <Chip
                                key={`${hijo.id}-${hijo.grado_actual}`}
                                label={`${hijo.nombres} ${hijo.apellido_paterno} - ${hijo.grado_actual} ${hijo.paralelo}`}
                                color="success"
                                variant="outlined"
                                sx={{ fontWeight: 600 }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Alert>
                  )}
                </Paper>
              </Fade>
            )}

            {/* Botón Continuar */}
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleContinuar}
                disabled={modo === 'padre_existente' && !padreEncontrado}
                sx={{
                  py: 2,
                  px: 6,
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  borderRadius: '16px',
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  color: isDark ? '#000' : '#fff',
                  textTransform: 'none',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.3)',
                  },
                }}
              >
                {modo === 'nuevo' && 'Continuar con Registro Nuevo'}
                {modo === 'padre_existente' && 'Continuar con Padre Existente'}
                {modo === 'multiple' && 'Continuar con Registro Múltiple'}
              </Button>
            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}