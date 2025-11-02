'use client';
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  Chip,
} from '@mui/material';
import {
  School,
  MenuBook,
  EmojiEvents,
  Groups,
  Science,
  Language,
  SportsBasketball,
  Psychology,
  ArrowForward,
  CheckCircle,
} from '@mui/icons-material';

function MallaCurricularLanding() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const features = [
    {
      icon: <MenuBook sx={{ fontSize: 40 }} />,
      title: 'Educación Integral',
      description: 'Formación académica completa que desarrolla todas las capacidades del estudiante',
      color: '#3b82f6',
    },
    {
      icon: <Science sx={{ fontSize: 40 }} />,
      title: 'Enfoque STEM',
      description: 'Énfasis en Ciencias, Tecnología, Ingeniería y Matemáticas para el futuro',
      color: '#10b981',
    },
    {
      icon: <Language sx={{ fontSize: 40 }} />,
      title: 'Idiomas',
      description: 'Programa bilingüe con inglés intensivo y desarrollo de competencias comunicativas',
      color: '#f59e0b',
    },
    {
      icon: <Psychology sx={{ fontSize: 40 }} />,
      title: 'Desarrollo Personal',
      description: 'Formación en valores, liderazgo y habilidades socioemocionales',
      color: '#8b5cf6',
    },
    {
      icon: <SportsBasketball sx={{ fontSize: 40 }} />,
      title: 'Actividad Física',
      description: 'Deportes y educación física para un desarrollo integral y saludable',
      color: '#ef4444',
    },
    {
      icon: <Groups sx={{ fontSize: 40 }} />,
      title: 'Trabajo Colaborativo',
      description: 'Metodologías activas que fomentan el trabajo en equipo y la cooperación',
      color: '#06b6d4',
    },
  ];

  const stats = [
    { number: '12', label: 'Materias Core', icon: <MenuBook /> },
    { number: '6', label: 'Años de Formación', icon: <School /> },
    { number: '100%', label: 'Educación en Valores', icon: <EmojiEvents /> },
    { number: '8+', label: 'Actividades Extracurriculares', icon: <Groups /> },
  ];

  const benefits = [
    'Curriculum actualizado y adaptado a estándares internacionales',
    'Desarrollo de competencias del siglo XXI',
    'Preparación para la educación superior',
    'Formación basada en valores cristanos',
    'Metodologías innovadoras de enseñanza',
    'Evaluación continua y personalizada',
  ];

  return (
    <Box
      sx={{
        background: isDark
          ? 'linear-gradient(135deg, #090B26 0%, #000000 100%)'
          : 'linear-gradient(135deg, #fdfcfb 0%, #e0e7ff 100%)',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decoraciones de fondo */}
      <Box
        sx={{
          position: 'absolute',
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -200,
          left: -200,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 8 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Chip
            label="Nuestra Propuesta Educativa"
            sx={{
              mb: 3,
              bgcolor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
              fontWeight: 600,
              fontSize: '0.9rem',
              px: 3,
              py: 3,
            }}
          />

          <Typography
            variant="h1"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2.5rem', md: '4rem' },
              background: isDark
                ? 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)'
                : 'linear-gradient(135deg, #01579b 0%, #5b21b6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3,
              lineHeight: 1.2,
            }}
          >
            Malla Curricular
          </Typography>

          <Typography
            variant="h5"
            sx={{
              color: isDark ? 'grey.400' : 'grey.700',
              maxWidth: 800,
              mx: 'auto',
              mb: 2,
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            Un programa educativo integral diseñado para formar estudiantes preparados para los desafíos del futuro
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: isDark ? 'grey.500' : 'grey.600',
              maxWidth: 700,
              mx: 'auto',
              mb: 5,
            }}
          >
            Descubre cómo nuestra malla curricular combina excelencia académica, formación en valores y desarrollo de habilidades para el siglo XXI
          </Typography>

          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            sx={{
              bgcolor: isDark ? '#3b82f6' : '#01579b',
              color: 'white',
              px: 5,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: 3,
              textTransform: 'none',
              boxShadow: isDark
                ? '0 10px 30px rgba(59, 130, 246, 0.3)'
                : '0 10px 30px rgba(1, 87, 155, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: isDark ? '#2563eb' : '#004d7a',
                transform: 'translateY(-3px)',
                boxShadow: isDark
                  ? '0 15px 40px rgba(59, 130, 246, 0.4)'
                  : '0 15px 40px rgba(1, 87, 155, 0.4)',
              },
            }}
          >
            Ver Malla Completa
          </Button>
        </Box>

        {/* Stats Section */}
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {stats.map((stat, index) => (
            <Grid size={{ xs: 6, md: 3 }} key={index}>
              <Card
                elevation={0}
                sx={{
                  textAlign: 'center',
                  p: 3,
                  borderRadius: 3,
                  bgcolor: isDark ? 'rgba(17, 25, 54, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: isDark
                      ? '0 12px 30px rgba(0,0,0,0.4)'
                      : '0 12px 30px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <Box
                  sx={{
                    color: '#3b82f6',
                    mb: 2,
                    '& svg': { fontSize: 40 },
                  }}
                >
                  {stat.icon}
                </Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    color: isDark ? 'white' : 'grey.900',
                    mb: 1,
                  }}
                >
                  {stat.number}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: isDark ? 'grey.400' : 'grey.600',
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Features Grid */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h3"
            align="center"
            sx={{
              fontWeight: 700,
              color: isDark ? 'white' : 'grey.900',
              mb: 2,
            }}
          >
            ¿Qué hace especial nuestra malla?
          </Typography>
          <Typography
            variant="body1"
            align="center"
            sx={{
              color: isDark ? 'grey.400' : 'grey.600',
              mb: 6,
              maxWidth: 700,
              mx: 'auto',
            }}
          >
            Descubre los pilares fundamentales que conforman nuestra propuesta educativa
          </Typography>

          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    p: 3,
                    borderRadius: 3,
                    bgcolor: isDark ? 'rgba(17, 25, 54, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      borderColor: feature.color,
                      boxShadow: isDark
                        ? `0 12px 30px ${feature.color}30`
                        : `0 12px 30px ${feature.color}20`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: `${feature.color}${isDark ? '25' : '15'}`,
                      color: feature.color,
                      mb: 2,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: isDark ? 'white' : 'grey.900',
                      mb: 1,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: isDark ? 'grey.400' : 'grey.600',
                      lineHeight: 1.7,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Benefits Section */}
        <Card
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            bgcolor: isDark
              ? 'rgba(59, 130, 246, 0.1)'
              : 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
            border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`,
            mb: 8,
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: isDark ? 'white' : 'grey.900',
                  mb: 2,
                }}
              >
                Beneficios de Nuestro Programa
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: isDark ? 'grey.400' : 'grey.700',
                  lineHeight: 1.7,
                }}
              >
                Una educación que prepara a los estudiantes para enfrentar con éxito los retos académicos y personales del futuro
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Grid container spacing={2}>
                {benefits.map((benefit, index) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={index}>
                    <Box display="flex" alignItems="flex-start" gap={1.5}>
                      <CheckCircle
                        sx={{
                          color: '#10b981',
                          fontSize: 24,
                          flexShrink: 0,
                          mt: 0.5,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: isDark ? 'grey.300' : 'grey.700',
                          fontWeight: 500,
                          lineHeight: 1.6,
                        }}
                      >
                        {benefit}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Card>

        {/* CTA Final */}
        <Card
          elevation={0}
          sx={{
            textAlign: 'center',
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            bgcolor: isDark
              ? 'linear-gradient(135deg, #1e40af 0%, #5b21b6 100%)'
              : 'linear-gradient(135deg, #01579b 0%, #5b21b6 100%)',
            color: 'white',
            border: 'none',
          }}
        >
          <School sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            ¿Listo para conocer más?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
            Explora en detalle cada materia, nivel y área de formación de nuestra malla curricular
          </Typography>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            sx={{
              bgcolor: 'white',
              color: '#01579b',
              px: 5,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: 3,
              textTransform: 'none',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.9)',
                transform: 'translateY(-3px)',
                boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
              },
            }}
          >
            Ver Malla Curricular Completa
          </Button>
        </Card>
      </Container>
    </Box>
  );
}

export default MallaCurricularLanding;