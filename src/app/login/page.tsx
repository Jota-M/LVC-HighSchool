'use client';

import { useRouter } from 'next/navigation';
import { getRoleBasedRoute } from '../../lib/roleRoutes';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isAxiosError } from 'axios';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  useTheme,
  Container,
  Grid,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SchoolIcon from '@mui/icons-material/School';
import VerifiedIcon from '@mui/icons-material/Verified';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import GroupsIcon from '@mui/icons-material/Groups';
import Header from './Header';

export default function LoginPage() {
  const { user, login, loading: authLoading } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading || !user) return;

    const roles = user.roles?.map((role) => role.nombre) ?? [];
    router.replace(getRoleBasedRoute(roles));
  }, [authLoading, router, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const fullUser = await login(credential, password);
      const roles = fullUser?.roles?.map((role) => role.nombre) ?? [];
      router.replace(getRoleBasedRoute(roles));
    } catch (err: unknown) {
      const message = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
          ? err.message
          : 'Error al iniciar sesión';

      setError(message || 'Error al iniciar sesión');
      setLoading(false);
    }
  };

  if (authLoading || user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: '#facc15' }} />
      </Box>
    );
  }

  const colors = {
    background: isDark ? '#0a0a0a' : '#f0f4f8',
    cardBg: isDark ? 'rgba(20, 20, 20, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    textPrimary: isDark ? '#ffffff' : '#1a202c',
    textSecondary: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
    inputBg: isDark ? 'rgba(30, 30, 30, 0.5)' : 'rgba(255, 255, 255, 0.8)',
    inputBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)',
    gradient1: isDark ? 'rgba(250, 204, 21, 0.15)' : 'rgba(250, 204, 21, 0.1)',
    gradient2: isDark ? 'rgba(2, 119, 189, 0.15)' : 'rgba(2, 119, 189, 0.1)',
    iconColor: isDark ? '#facc15' : '#f59e0b',
    primaryColor: isDark ? '#facc15' : '#f59e0b',
    secondaryColor: isDark ? '#0277bd' : '#01579b',
  };

  return (
    <>
    <Header />
    <Box
      sx={{
        pt: { xs: 8 },
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: "url('/Fondos/fondo.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background 0.5s ease',
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: isDark 
            ? "rgba(0, 0, 0, 0.75)"
            : "rgba(0, 0, 0, 0.4)",
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
        <Grid container spacing={0} sx={{ minHeight: '500px' }}>
          {/* Columna Izquierda - Información */}
          <Grid size={{xs:12, md:6}} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Box
              sx={{
                width: '100%',
                background: isDark 
                  ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.15), rgba(2, 119, 189, 0.15))'
                  : 'linear-gradient(135deg, rgba(250, 204, 21, 0.2), rgba(2, 119, 189, 0.2))',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px 0 0 20px',
                padding: 4,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                border: `1px solid ${colors.borderColor}`,
                borderRight: 'none',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: `radial-gradient(circle, ${colors.gradient1} 0%, transparent 70%)`,
                  animation: 'pulse 8s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
                    '50%': { opacity: 0.6, transform: 'scale(1.1)' },
                  },
                },
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                {/* Logo */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      p: 2,
                      borderRadius: '16px',
                      background: isDark 
                        ? 'rgba(250, 204, 21, 0.15)'
                        : 'rgba(250, 204, 21, 0.2)',
                      border: `1px solid ${colors.iconColor}`,
                      mb: 2,
                    }}
                  >
                    <img src="/logo.png" style={{ width: 100 }} alt="" />
                  </Box>
                  
                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 600,
                      background: `linear-gradient(135deg, ${colors.iconColor}, ${colors.secondaryColor})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 0.5,
                      fontSize: '0.9rem',
                    }}
                  >
                    Unidad Educativa Particular
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 800,
                      color: colors.textPrimary,
                      mb: 1,
                      fontSize: '1.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                    }}
                  >
                    La Voz de Cristo
                  </Typography>
                  
                  

                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.textSecondary,
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: '0.8rem',
                      fontStyle: 'italic',
                    }}
                  >
                    &quot;Educación con valores y excelencia&quot;
                  </Typography>
                </Box>

                {/* Características */}
                <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: '10px',
                        background: isDark 
                          ? 'rgba(250, 204, 21, 0.1)'
                          : 'rgba(250, 204, 21, 0.15)',
                        border: `1px solid ${colors.iconColor}40`,
                      }}
                    >
                      <VerifiedIcon sx={{ color: colors.iconColor, fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: colors.textPrimary,
                          fontWeight: 700,
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: '0.85rem',
                        }}
                      >
                        Valores Cristianos
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: colors.textSecondary,
                          fontSize: '0.75rem',
                        }}
                      >
                        Formación integral basada en principios
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: '10px',
                        background: isDark 
                          ? 'rgba(2, 119, 189, 0.1)'
                          : 'rgba(2, 119, 189, 0.15)',
                        border: `1px solid ${colors.secondaryColor}40`,
                      }}
                    >
                      <AutoStoriesIcon sx={{ color: colors.secondaryColor, fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: colors.textPrimary,
                          fontWeight: 700,
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: '0.85rem',
                        }}
                      >
                        Excelencia Académica
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: colors.textSecondary,
                          fontSize: '0.75rem',
                        }}
                      >
                        Educación de calidad para el futuro
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: '10px',
                        background: isDark 
                          ? 'rgba(250, 204, 21, 0.1)'
                          : 'rgba(250, 204, 21, 0.15)',
                        border: `1px solid ${colors.iconColor}40`,
                      }}
                    >
                      <GroupsIcon sx={{ color: colors.iconColor, fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: colors.textPrimary,
                          fontWeight: 700,
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: '0.85rem',
                        }}
                      >
                        Comunidad Educativa
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: colors.textSecondary,
                          fontSize: '0.75rem',
                        }}
                      >
                        Juntos construimos conocimiento
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Columna Derecha - Login Form */}
          <Grid size={{xs:12, md:6}}>
            <Card 
              sx={{ 
                width: '100%',
                height: '100%',
                background: colors.cardBg,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${colors.borderColor}`,
                borderRadius: { xs: '20px', md: '0 20px 20px 0' },
                boxShadow: isDark 
                  ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)' 
                  : '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: `linear-gradient(90deg, ${colors.primaryColor}, ${colors.secondaryColor}, ${colors.primaryColor})`,
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 3s linear infinite',
                  '@keyframes shimmer': {
                    '0%': { backgroundPosition: '200% 0' },
                    '100%': { backgroundPosition: '-200% 0' },
                  },
                },
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 4, md: 4 } }}>
                {/* Logo móvil */}
                <Box sx={{ textAlign: 'center', mb: 3, display: { xs: 'block', md: 'none' } }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      p: 1.5,
                      borderRadius: '16px',
                      background: isDark 
                        ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.15), rgba(2, 119, 189, 0.15))'
                        : 'linear-gradient(135deg, rgba(250, 204, 21, 0.1), rgba(2, 119, 189, 0.1))',
                      border: `1px solid ${colors.iconColor}30`,
                      mb: 1.5,
                    }}
                  >
                    <SchoolIcon sx={{ fontSize: 40, color: colors.iconColor }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 800,
                      color: colors.textPrimary,
                      fontSize: '1.1rem',
                    }}
                  >
                    La Voz de Cristo
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 700,
                      fontFamily: "'Montserrat', sans-serif",
                      background: `linear-gradient(135deg, ${colors.iconColor}, ${colors.secondaryColor})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 0.5,
                      letterSpacing: '-0.01em',
                      fontSize: { xs: '1.5rem', sm: '1.6rem' },
                    }}
                  >
                    Bienvenido
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: colors.textSecondary, 
                      fontSize: '0.85rem',
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    Ingresa tus credenciales para continuar
                  </Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {error && (
                      <Alert 
                        severity="error"
                        sx={{
                          background: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          borderRadius: '10px',
                          color: isDark ? '#fca5a5' : '#dc2626',
                          fontSize: '0.85rem',
                          py: 0.5,
                          '& .MuiAlert-icon': { color: isDark ? '#fca5a5' : '#dc2626' },
                        }}
                      >
                        {error}
                      </Alert>
                    )}

                    <TextField
                      fullWidth
                      label="Usuario o Email"
                      value={credential}
                      onChange={(e) => setCredential(e.target.value)}
                      disabled={loading}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          background: colors.inputBg,
                          borderRadius: '12px',
                          '& fieldset': {
                            borderColor: colors.inputBorder,
                          },
                          '&:hover fieldset': {
                            borderColor: `${colors.primaryColor}80`,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: colors.primaryColor,
                            borderWidth: '2px',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: colors.textSecondary,
                          '&.Mui-focused': {
                            color: colors.iconColor,
                          },
                        },
                        '& .MuiInputBase-input': {
                          color: colors.textPrimary,
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonOutlineIcon sx={{ color: colors.iconColor }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Contraseña"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          background: colors.inputBg,
                          borderRadius: '12px',
                          '& fieldset': {
                            borderColor: colors.inputBorder,
                          },
                          '&:hover fieldset': {
                            borderColor: `${colors.primaryColor}80`,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: colors.primaryColor,
                            borderWidth: '2px',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: colors.textSecondary,
                          '&.Mui-focused': {
                            color: colors.iconColor,
                          },
                        },
                        '& .MuiInputBase-input': {
                          color: colors.textPrimary,
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon sx={{ color: colors.iconColor }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton 
                              onClick={() => setShowPassword(!showPassword)} 
                              edge="end"
                              sx={{ color: colors.textSecondary }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={loading || !credential || !password}
                      sx={{
                        background: `linear-gradient(135deg, ${colors.primaryColor}, ${colors.secondaryColor})`,
                        py: 1.5,
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        fontFamily: "'Montserrat', sans-serif",
                        borderRadius: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        boxShadow: `0 3px 12px 0 ${colors.primaryColor}40`,
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          background: `linear-gradient(135deg, ${isDark ? '#f59e0b' : '#d97706'}, ${isDark ? '#01579b' : '#003c6c'})`,
                          boxShadow: `0 6px 20px 0 ${colors.primaryColor}66`,
                          transform: 'translateY(-2px)',
                        },
                        '&:disabled': {
                          background: `${colors.primaryColor}4D`,
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                          transition: 'left 0.5s',
                        },
                        '&:hover::before': {
                          left: '100%',
                        },
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} sx={{ color: '#fff' }} />
                      ) : (
                        'Iniciar Sesión'
                      )}
                    </Button>
                  </Box>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
    </>
  );
}
