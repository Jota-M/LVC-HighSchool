'use client'

import React, { useState } from 'react'
import {
  Grid,
  Typography,
  TextField,
  Button,
  Box,
  useTheme,
  Paper,
  Fade,
  Zoom,
  Slide,
} from '@mui/material'
import AccountCircleSharpIcon from '@mui/icons-material/AccountCircleSharp'
import SearchSharpIcon from '@mui/icons-material/SearchSharp'
import RocketLaunchSharpIcon from '@mui/icons-material/RocketLaunchSharp'
import DataExplorationSharpIcon from '@mui/icons-material/DataExplorationSharp'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import SpeedIcon from '@mui/icons-material/Speed'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'

// Componente de tarjeta informativa mejorada
interface InfoCardProps {
  icon: React.ElementType;
  title: string;
  delay?: number; // or string — depending on what you use it for
}

const InfoCard: React.FC<InfoCardProps> = ({ icon: Icon, title, delay }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  
  return (
    <Zoom in={true} style={{ transitionDelay: `${delay}ms` }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          bgcolor: isDark ? 'rgba(144, 202, 249, 0.08)' : 'rgba(0, 105, 92, 0.06)',
          border: `1px solid ${isDark ? 'rgba(144, 202, 249, 0.2)' : 'rgba(0, 105, 92, 0.15)'}`,
          textAlign: 'center',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: isDark 
              ? 'linear-gradient(90deg, transparent, rgba(144, 202, 249, 0.1), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(0, 105, 92, 0.08), transparent)',
            transition: 'left 0.6s ease',
          },
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: isDark 
              ? '0 12px 40px rgba(144, 202, 249, 0.25)'
              : '0 12px 40px rgba(0, 105, 92, 0.2)',
            '&::before': {
              left: '100%',
            },
          },
        }}
      >
        <Box
          sx={{
            width: 70,
            height: 70,
            borderRadius: '50%',
            bgcolor: isDark ? 'rgba(144, 202, 249, 0.15)' : 'rgba(0, 105, 92, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
            transition: 'transform 0.4s ease',
            '&:hover': {
              transform: 'rotate(360deg) scale(1.1)',
            },
          }}
        >
          <Icon sx={{ fontSize: 35, color: isDark ? '#90caf9' : '#00695c' }} />
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: '1rem',
            color: isDark ? 'grey.100' : 'grey.800',
          }}
        >
          {title}
        </Typography>
      </Paper>
    </Zoom>
  )
}

// Componente principal
function Page() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [formData, setFormData] = useState({
    carnet: '',
    apellido: '',
    fecha: '',
  })

  const handleInputChange = (field: string) => (event: { target: { value: any } }) => {
    setFormData({ ...formData, [field]: event.target.value })
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isDark
          ? 'linear-gradient(135deg, #0a0e27 0%, #1a1d3a 50%, #0f1129 100%)'
          : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: isDark 
            ? 'radial-gradient(circle, rgba(66, 165, 245, 0.15), transparent)'
            : 'radial-gradient(circle, rgba(0, 105, 92, 0.08), transparent)',
          animation: 'float 20s ease-in-out infinite',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-30%',
          left: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: isDark 
            ? 'radial-gradient(circle, rgba(38, 198, 218, 0.12), transparent)'
            : 'radial-gradient(circle, rgba(0, 105, 92, 0.06), transparent)',
          animation: 'float 25s ease-in-out infinite reverse',
        },
      }}
    >
      <Grid container sx={{ position: 'relative', zIndex: 1, pt: 8, pb: 6 }}>
        {/* Hero Section */}
        <Grid size={{xs:12}}>
          <Fade in={true} timeout={1000}>
            <Box sx={{ textAlign: 'center', mb: 6, px: 3 }}>
              <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    p: 2,
                    borderRadius: '50%',
                    bgcolor: isDark ? 'rgba(144, 202, 249, 0.1)' : 'rgba(0, 105, 92, 0.08)',
                    mb: 3,
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                >
                  <VerifiedUserIcon
                    sx={{
                      fontSize: 70,
                      color: isDark ? '#90caf9' : '#00695c',
                    }}
                  />
                </Box>
              </Zoom>
              
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 800,
                  background: isDark
                    ? 'linear-gradient(135deg, #90caf9 0%, #26c6da 100%)'
                    : 'linear-gradient(135deg, #00695c 0%, #00897b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2,
                  letterSpacing: '-0.02em',
                }}
              >
                ¡Bienvenido de Nuevo!
              </Typography>
              
              <Typography
                variant="h6"
                sx={{
                  maxWidth: 600,
                  mx: 'auto',
                  color: isDark ? 'grey.400' : 'grey.700',
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  lineHeight: 1.6,
                  fontWeight: 400,
                }}
              >
                Como estudiante regular, tu proceso de renovación es{' '}
                <Box component="span" sx={{ 
                  fontWeight: 700, 
                  color: isDark ? '#90caf9' : '#00695c',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -2,
                    left: 0,
                    width: '100%',
                    height: 2,
                    background: isDark ? '#90caf9' : '#00695c',
                    animation: 'underline 1.5s ease-in-out infinite',
                  }
                }}>
                  rápido y sencillo
                </Box>
              </Typography>
            </Box>
          </Fade>
        </Grid>

        {/* Info Cards */}
        <Grid size={{xs:12}} >
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 3,
              px: 3,
              mb: 6,
              maxWidth: 900,
              mx: 'auto',
            }}
          >
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 30%' } }}>
              <InfoCard icon={SpeedIcon} title="Proceso Acelerado" delay={200} />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 30%' } }}>
              <InfoCard icon={DataExplorationSharpIcon} title="Datos Preguardados" delay={400} />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 30%' } }}>
              <InfoCard icon={AutoAwesomeIcon} title="Fácil de Usar" delay={600} />
            </Box>
          </Box>
        </Grid>

        {/* Form Section */}
        <Grid size={{xs:12, md:10, lg:8}}sx={{ mx: 'auto', px: 3 }}>
          <Slide direction="up" in={true} timeout={800}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 5,
                bgcolor: isDark ? 'rgba(17, 25, 54, 0.7)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${isDark ? 'rgba(144, 202, 249, 0.1)' : 'rgba(0, 105, 92, 0.08)'}`,
                boxShadow: isDark 
                  ? '0 20px 60px rgba(0, 0, 0, 0.5)'
                  : '0 20px 60px rgba(0, 0, 0, 0.08)',
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 1,
                    color: isDark ? 'white' : 'grey.900',
                    fontSize: { xs: '1.5rem', md: '2rem' },
                  }}
                >
                  Verificación de Identidad
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: isDark ? 'grey.400' : 'grey.600',
                    fontSize: { xs: '0.9rem', md: '1rem' },
                  }}
                >
                  Ingresa tu información para localizar tu registro académico
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                }}
              >
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Número de Carnet"
                  value={formData.carnet}
                  onChange={handleInputChange('carnet')}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: isDark 
                          ? '0 4px 20px rgba(144, 202, 249, 0.2)'
                          : '0 4px 20px rgba(0, 105, 92, 0.15)',
                      },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  variant="outlined"
                  label="Apellido Paterno"
                  value={formData.apellido}
                  onChange={handleInputChange('apellido')}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: isDark 
                          ? '0 4px 20px rgba(144, 202, 249, 0.2)'
                          : '0 4px 20px rgba(0, 105, 92, 0.15)',
                      },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  variant="outlined"
                  label="Fecha de Nacimiento"
                  type="date"
                  value={formData.fecha}
                  onChange={handleInputChange('fecha')}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: isDark 
                          ? '0 4px 20px rgba(144, 202, 249, 0.2)'
                          : '0 4px 20px rgba(0, 105, 92, 0.15)',
                      },
                    },
                  }}
                />

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<SearchSharpIcon />}
                  sx={{
                    py: 2,
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    background: isDark
                      ? 'linear-gradient(135deg, #90caf9 0%, #64b5f6 100%)'
                      : 'linear-gradient(135deg, #00695c 0%, #00897b 100%)',
                    boxShadow: isDark 
                      ? '0 8px 24px rgba(144, 202, 249, 0.3)'
                      : '0 8px 24px rgba(0, 105, 92, 0.3)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: 0,
                      height: 0,
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.3)',
                      transform: 'translate(-50%, -50%)',
                      transition: 'width 0.6s, height 0.6s',
                    },
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: isDark 
                        ? '0 12px 32px rgba(144, 202, 249, 0.4)'
                        : '0 12px 32px rgba(0, 105, 92, 0.4)',
                      '&::before': {
                        width: '300px',
                        height: '300px',
                      },
                    },
                    '&:active': {
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Buscar mi Registro
                </Button>
              </Box>
            </Paper>
          </Slide>
        </Grid>
      </Grid>

      {/* Animaciones CSS */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-30px) translateX(20px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes underline {
          0%, 100% {
            transform: scaleX(1);
          }
          50% {
            transform: scaleX(0.8);
          }
        }
      `}</style>
    </Box>
  )
}

export default Page