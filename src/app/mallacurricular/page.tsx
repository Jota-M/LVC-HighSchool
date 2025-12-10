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
  keyframes,
  Tooltip,
  Fade
} from '@mui/material';
import { useState } from "react";
import {
  School,
  MenuBook,
  ChildCare,
  LocalLibrary,
  WorkspacePremium,
  Groups,
  Science,
  Language,
  Favorite,
  Psychology,
  ArrowForward,
  CheckCircle,
  AutoStories,
} from '@mui/icons-material';
import Cards from '../components/HomePage/Card';
import Navbar from '../login/Header';
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;
const fadeSlideIn = keyframes`
  0% { opacity: 0; transform: translateY(30px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const bgPulse = keyframes`
  0% { transform: scale(1) rotate(0deg); opacity: 0.15; }
  50% { transform: scale(1.1) rotate(5deg); opacity: 0.25; }
  100% { transform: scale(1) rotate(0deg); opacity: 0.15; }
`;

const floatParticle = keyframes`
  0%, 100% { transform: translateY(0px) translateX(0px); }
  33% { transform: translateY(-30px) translateX(15px); }
  66% { transform: translateY(-15px) translateX(-15px); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;
function MallaCurricularLanding() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const features = [
    {
      icon: <Favorite sx={{ fontSize: 40 }} />,
      title: 'Formación en Valores Cristianos',
      description: 'Educación centrada en el amor de Cristo y principios bíblicos para formar el carácter',
      color: '#ef4444',
    },
    {
      icon: <Science sx={{ fontSize: 40 }} />,
      title: 'Excelencia Académica',
      description: 'Programa educativo integral con enfoque en ciencias, matemáticas y pensamiento crítico',
      color: '#10b981',
    },
    {
      icon: <Language sx={{ fontSize: 40 }} />,
      title: 'Educación Bilingüe',
      description: 'Programa intensivo de inglés para preparar estudiantes globalmente competentes',
      color: '#f59e0b',
    },
    {
      icon: <Psychology sx={{ fontSize: 40 }} />,
      title: 'Desarrollo Integral',
      description: 'Formación espiritual, emocional, social y física basada en principios cristianos',
      color: '#8b5cf6',
    },
    {
      icon: <Groups sx={{ fontSize: 40 }} />,
      title: 'Comunidad de Fe',
      description: 'Ambiente familiar donde cada estudiante es valorado como hijo de Dios',
      color: '#06b6d4',
    },
    {
      icon: <AutoStories sx={{ fontSize: 40 }} />,
      title: 'Enseñanza Bíblica',
      description: 'Estudio diario de la Palabra de Dios integrado en todas las áreas del conocimiento',
      color: '#3b82f6',
    },
  ];

  const stats = [
    { number: '3', label: 'Niveles Educativos', icon: <School /> },
    { number: '100%', label: 'Educación Cristiana', icon: <Favorite /> },
    { number: '', label: 'Participación familiar', icon: <WorkspacePremium /> },
    { number: '100%', label: 'Seguimiento Academico', icon: <Groups /> },
  ];

  const benefits = [
    'Curriculum basado en principios bíblicos',
    'Excelencia académica con fundamento cristiano',
    'Desarrollo de dones y talentos espirituales',
    'Formación en liderazgo cristiano',
    'Ambiente seguro y lleno de amor',
    'Preparación para ser luz en el mundo',
  ];

    const niveles = [
    {
      link: "/mallacurricular/inicial",
      init: "Initial",
      imageurl: "/Nivels/Initiall.jpg",
      title: "Educación Inicial",
      paragraph:
        "Primeros pasos en el aprendizaje con metodología lúdica, desarrollo psicomotor y formación en valores cristianos.",
      paragraph1: "3 a 5 años",
      paragraph2: "Desarrollo Integral",
      paragraph3: "Valores Cristianos",
    },
    {
      link: "/mallacurricular/primaria",
      init: "Primary",
      imageurl: "/Nivels/Primaryy.jpg",
      title: "Educación Primaria",
      paragraph:
        "Formación académica sólida con énfasis en lectoescritura, matemáticas, ciencias y desarrollo del pensamiento crítico.",
      paragraph1: "6 a 12 años",
      paragraph2: "Bases académicas sólidas",
      paragraph3: "Pensamiento crítico",
    },
    {
      link: "/mallacurricular/secundaria",
      init: "Secondary",
      imageurl: "/Nivels/Secondary.jpg",
      title: "Educación Secundaria",
      paragraph:
        "Preparación integral para la educación superior con bachillerato en ciencias, liderazgo y servicio comunitario.",
      paragraph1: "12 a 18 años",
      paragraph2: "Bachillerato en ciencias",
      paragraph3: "Liderazgo cristiano",
    },
  ];


  return (
    <>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700;800;900&family=Bebas+Neue&display=swap" rel="stylesheet"></link>
      <Navbar />
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
      {/* Decoraciones de fondo animadas */}
      <Box
        sx={{
          position: 'absolute',
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: `${float} 8s ease-in-out infinite`,
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
            ? 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: `${float} 10s ease-in-out infinite`,
          animationDelay: '1s',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 8 }}>
        {/* Hero Section */}
        <Box 
          sx={{ 
            textAlign: 'center', 
            mt: 8,
            mb: 8,
            animation: `${fadeInUp} 1s ease-out`,
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontFamily: "Roboto, sans-serif",
              fontWeight: 600,
              fontSize: { xs: '2.5rem', md: '4rem' },
              background: isDark
                ? 'linear-gradient(135deg, #facc15, #ffd54f)'
                : 'linear-gradient(135deg, #01579b , #0288d1)',
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
            variant="h4"
            sx={{
              fontFamily: "Roboto, sans-serif",
              color: isDark ? '#01579b' :   '#facc15',
              mb: 2,
              fontWeight: 700,
              fontStyle: 'italic',
            }}
          >
            La Voz de Cristo High School
          </Typography>
        </Box>

        {/* Stats Section */}
        <Grid 
          container 
          spacing={3} 
          sx={{ 
            mb: 8,
          }}
        >
          {stats.map((stat, index) => (
            <Grid 
              size={{ xs: 6, md: 3 }} 
              key={index}
              sx={{
                animation: `${fadeInUp} 0.8s ease-out ${index * 0.1}s both`,
              }}
            >
              <Card
                elevation={0}
                sx={{
                  textAlign: 'center',
                  p: 3,
                  borderRadius: 3,
                  bgcolor: isDark ? 'rgba(17, 25, 54, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${isDark ? '#facc15' : '#01579b'}`,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-12px) scale(1.02)',
                    boxShadow: isDark
                      ? '0 20px 40px #facc15'
                      : '0 20px 40px #01579b',
                    borderColor: isDark ? '#facc15' : '#01579b',
                  },
                }}
              >
                <Box
                  sx={{
                    color: isDark ? '#facc15' : '#01579b',
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
          <Box
            sx={{
              textAlign: 'center',
              mb: 6,
              animation: `${fadeInUp} 1s ease-out 0.3s both`,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontFamily: "Roboto, sans-serif",
                fontWeight: 700,
                color: isDark ? 'white' : 'grey.900',
                mb: 2,
              }}
            >
              Nuestra Propuesta Educativa
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: isDark ? 'grey.400' : 'grey.600',
                maxWidth: 700,
                mx: 'auto',
              }}
            >
              Una educación que integra fe y conocimiento para formar discípulos de Cristo preparados para el mundo
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid 
                size={{ xs: 12, md: 6, lg: 4 }}
                key={index}
                sx={{
                  animation: `${index % 2 === 0 ? slideInLeft : slideInRight} 0.8s ease-out ${0.5 + index * 0.1}s both`,
                }}
              >
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    p: 3,
                    borderRadius: 3,
                    bgcolor: isDark ? 'rgba(17, 25, 54, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-12px) scale(1.02)',
                      borderColor: feature.color,
                      boxShadow: isDark
                        ? `0 20px 40px ${feature.color}40`
                        : `0 20px 40px ${feature.color}30`,
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
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'rotate(5deg) scale(1.1)',
                      },
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "Roboto, sans-serif",
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

        {/* Niveles Educativos Section */}
        <Box sx={{ mb: 8 }}>
          <Box
            sx={{
              textAlign: 'center',
              mb: 6,
              animation: `${fadeInUp} 1s ease-out 1.2s both`,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontFamily: "Roboto, sans-serif",
                fontWeight: 700,
                color: isDark ? '#facc15':'#01579b' ,
                mb: 2,
              }}
            >
              Explora Nuestra Malla Curricular
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: isDark ? 'grey.400' : 'grey.600',
                maxWidth: 700,
                mx: 'auto',
              }}
            >
              Selecciona el nivel educativo para conocer en detalle nuestro programa de estudios
            </Typography>
          </Box>
          <Grid 
            container 
            spacing={4} 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              width: '100%'
            }}
          >
            {niveles.map((nivel, index) => (
              <Grid
                key={index}
                size={{ 
                  xs: 12, 
                  sm: 6, 
                  md: 4, 
                  
                }}
                sx={{
                  zIndex: 2,
                  opacity: 0,
                  transform: "translateY(50px)",
                  animation: `${fadeSlideIn} 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
                  animationDelay: `${0.6 + index * 0.2}s`,
                  display: 'flex',
                  justifyContent: 'center'
                }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <Tooltip
                  title={
                    <Box sx={{ p: 1 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ fontWeight: "bold", mb: 0.5 }}
                      >
                        Descubre más sobre {nivel.title}
                      </Typography>
                      <Typography variant="caption">
                        Haz clic para ver el plan de estudios completo
                      </Typography>
                    </Box>
                  }
                  placement="top"
                  arrow
                  TransitionComponent={Fade}
                  TransitionProps={{ timeout: 600 }}
                >
                  <Box
                    sx={{
                      cursor: "pointer",
                      width: '100%',
                      transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      transform: hoveredCard === index 
                        ? "translateY(-15px) scale(1.03)" 
                        : "translateY(0) scale(1)",
                      filter: hoveredCard !== null && hoveredCard !== index 
                        ? "brightness(0.7) blur(2px)" 
                        : "brightness(1) blur(0px)",
                    }}
                  >
                    <Cards {...nivel} />
                  </Box>
                </Tooltip>
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
              ? 'rgba(239, 68, 68, 0.1)'
              : 'linear-gradient(135deg, #fee2e2 0%, #fef3c7 100%)',
            border: `2px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`,
            mb: 8,
            animation: `${fadeInUp} 1s ease-out 0.8s both`,
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <Favorite
                sx={{
                  fontSize: 60,
                  color: '#ef4444',
                  mb: 2,
                  animation: `${pulse} 2s ease-in-out infinite`,
                }} 
              />
              <Typography
                variant="h4"
                sx={{
                  fontFamily: "Roboto, sans-serif",
                  fontWeight: 700,
                  color: isDark ? 'white' : 'grey.900',
                  mb: 2,
                }}
              >
                ¿Por qué elegirnos?
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: isDark ? 'grey.400' : 'grey.700',
                  lineHeight: 1.7,
                }}
              >
                En La Voz de Cristo formamos no solo estudiantes académicamente excelentes, sino discípulos de Cristo preparados para brillar en el mundo
              </Typography>
            </Grid>
            <Grid size={{xs:12, md:7}} >
              <Grid container spacing={2}>
                {benefits.map((benefit, index) => (
                  <Grid 
                    size={{xs:12, md:6}} 
                    key={index}
                    sx={{
                      animation: `${fadeInUp} 0.6s ease-out ${1 + index * 0.1}s both`,
                    }}
                  >
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
        {/* Footer con versículo */}
        <Box 
          sx={{ 
            textAlign: 'center', 
            mt: 8,
            animation: `${fadeInUp} 1s ease-out 2s both`,
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              color: isDark ? 'grey.400' : 'grey.600',
              fontStyle: 'italic',
              mb: 2,
            }}
          >
            "Pero Jesús dijo: Dejad a los niños venir a mí, y no se lo impidáis; porque de los tales es el reino de los cielos"
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: isDark ? 'grey.500' : 'grey.600',
              fontWeight: 600,
            }}
          >
            Mateo 19:14
          </Typography>
        </Box>
      </Container>
    </Box>
    </>
  );
}

export default MallaCurricularLanding;