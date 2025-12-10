'use client';
import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Card,
  CardContent,
  Divider,
  Chip,
  IconButton,
  useTheme,
} from '@mui/material';
import { 
  YouTube, 
  Instagram, 
  Facebook, 
  Twitter,
  Phone,
  Email,
  LocationOn,
  Send,
  CheckCircle,
} from '@mui/icons-material';

function Contact() {
  const [result, setResult] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    mensaje: ''
  });

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult('Enviando...');
    const data = new FormData(event.target as HTMLFormElement);

    data.append('access_key', '7067f75d-3d06-44f1-a056-497af5a2e9bb');

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: data,
    });

    const responseData = await response.json();

    if (responseData.success) {
      setResult('enviado');
      setTimeout(() => {
        setResult('');
        setFormData({ nombre: '', email: '', mensaje: '' });
        (event.target as HTMLFormElement).reset();
      }, 3000);
    } else {
      console.log('Error', responseData);
      alert(responseData.message);
      setResult('');
    }
  };

  const contactInfo = [
    {
      icon: <LocationOn sx={{ fontSize: 28 }} />,
      title: "Dirección",
      content: "Avenida Argentina Nro 200 entre Calle Trujillo y Luis Espinal",
      color: "#3b82f6"
    },
    {
      icon: <Phone sx={{ fontSize: 28 }} />,
      title: "Teléfonos",
      content: "+591 69624189 • 76162425 • 68420862",
      color: "#10b981"
    },
    {
      icon: <Email sx={{ fontSize: 28 }} />,
      title: "Email",
      content: "lavozdecristohighschool@gmail.com",
      color: "#f59e0b"
    }
  ];

  const socialLinks = [
    { 
      icon: <Facebook sx={{ fontSize: 24 }} />, 
      href: 'https://www.facebook.com/profile.php?id=61567742635307',
      color: '#1877f2',
      label: 'Facebook'
    },
    { 
      icon: <Instagram sx={{ fontSize: 24 }} />, 
      href: '#',
      color: '#e4405f',
      label: 'Instagram'
    },
    { 
      icon: <YouTube sx={{ fontSize: 24 }} />, 
      href: '',
      color: '#ff0000',
      label: 'YouTube'
    },
    { 
      icon: <Twitter sx={{ fontSize: 24 }} />, 
      href: '#',
      color: '#1da1f2',
      label: 'Twitter'
    },
  ];

  return (
    <Box
      id="Contactos"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        py: { xs: 8, md: 12 },
        background: isDark
          ? 'linear-gradient(135deg, #090B26 0%, #000000 100%)'
          : 'linear-gradient(135deg, #fdfcfb 0%, #e0e7ff 100%)',
      }}
    >
      {/* Decoración de fondo */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: isDark 
            ? 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1, px: { xs: 2, md: 8 } }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Chip 
            label="Contáctanos" 
            sx={{ 
              mb: 2,
              bgcolor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
              fontWeight: 600,
              fontSize: '0.875rem',
              px: 2,
              py: 2.5,
            }} 
          />
          <Typography
            variant="h2"
            sx={{
              fontFamily: 'Roboto',
              fontWeight: 800,
              background: isDark
                ? 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
                : 'linear-gradient(135deg, #01579b 0%, #0288d1 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
              fontSize: { xs: '2rem', md: '3rem' }
            }}
          >
            Estamos para ayudarte
          </Typography>
          <Typography
            variant="h6"
            sx={{ 
              fontFamily: 'Roboto',
              color: isDark ? 'grey.400' : 'grey.600',
              maxWidth: 600,
              mx: 'auto',
              fontWeight: 400,
            }}
          >
            ¿Tienes alguna pregunta? Envíanos un mensaje y te responderemos lo antes posible
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {/* Formulario */}
          <Grid  size={{ xs: 12, lg: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 4,
                bgcolor: isDark ? 'rgba(17, 25, 54, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                boxShadow: isDark 
                  ? '0 20px 60px rgba(0,0,0,0.4)' 
                  : '0 20px 60px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: isDark
                    ? '0 25px 70px rgba(0,0,0,0.5)'
                    : '0 25px 70px rgba(0,0,0,0.15)',
                },
              }}
            >
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h4"
                  sx={{ 
                    color: isDark ? '#60a5fa' : '#01579b',
                    fontWeight: 700,
                    mb: 1,
                  }}
                >
                  Envíanos un mensaje
                </Typography>
                <Divider 
                  sx={{ 
                    width: 60, 
                    height: 4, 
                    bgcolor: isDark ? '#60a5fa' : '#01579b', 
                    borderRadius: 2 
                  }} 
                />
              </Box>

              <Box
                component="form"
                onSubmit={onSubmit}
                sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
              >
                <TextField 
                  name="Nombre" 
                  label="Nombre completo" 
                  fullWidth 
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
                      },
                      '&.Mui-focused': {
                        bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'white',
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: isDark ? 'grey.400' : 'grey.600',
                    },
                    '& .MuiOutlinedInput-input': {
                      color: isDark ? 'white' : 'grey.900',
                    }
                  }}
                />
                <TextField
                  name="email"
                  type="email"
                  label="Correo electrónico"
                  fullWidth
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
                      },
                      '&.Mui-focused': {
                        bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'white',
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: isDark ? 'grey.400' : 'grey.600',
                    },
                    '& .MuiOutlinedInput-input': {
                      color: isDark ? 'white' : 'grey.900',
                    }
                  }}
                />
                <TextField
                  name="Mensaje"
                  label="Tu mensaje"
                  multiline
                  rows={5}
                  fullWidth
                  required
                  value={formData.mensaje}
                  onChange={(e) => setFormData({...formData, mensaje: e.target.value})}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
                      },
                      '&.Mui-focused': {
                        bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'white',
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: isDark ? 'grey.400' : 'grey.600',
                    },
                    '& .MuiOutlinedInput-input': {
                      color: isDark ? 'white' : 'grey.900',
                    }
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={result === 'enviado'}
                  startIcon={result === 'enviado' ? <CheckCircle /> : <Send />}
                  sx={{
                    bgcolor: result === 'enviado' 
                      ? '#10b981' 
                      : isDark ? '#3b82f6' : '#01579b',
                    color: 'white',
                    fontWeight: 600,
                    py: 1.8,
                    borderRadius: 2,
                    fontSize: '1rem',
                    textTransform: 'none',
                    boxShadow: result === 'enviado'
                      ? '0 8px 20px rgba(16, 185, 129, 0.3)'
                      : isDark 
                        ? '0 8px 20px rgba(59, 130, 246, 0.3)'
                        : '0 8px 20px rgba(1, 87, 155, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      bgcolor: result === 'enviado' 
                        ? '#059669' 
                        : isDark ? '#2563eb' : '#004d7a',
                      transform: 'translateY(-2px)',
                      boxShadow: result === 'enviado'
                        ? '0 12px 28px rgba(16, 185, 129, 0.4)'
                        : isDark
                          ? '0 12px 28px rgba(59, 130, 246, 0.4)'
                          : '0 12px 28px rgba(1, 87, 155, 0.4)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                    '&.Mui-disabled': {
                      bgcolor: '#10b981',
                      color: 'white',
                    }
                  }}
                >
                  {result === 'Enviando...' ? 'Enviando...' : result === 'enviado' ? '¡Mensaje enviado!' : 'Enviar mensaje'}
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Información de contacto */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
              {/* Cards de información */}
              {contactInfo.map((info, index) => (
                <Card
                  key={index}
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                    bgcolor: isDark ? 'rgba(17, 25, 54, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(8px)',
                      boxShadow: isDark 
                        ? '0 8px 24px rgba(0,0,0,0.3)'
                        : '0 8px 24px rgba(0,0,0,0.1)',
                      borderColor: info.color,
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="flex-start" gap={2}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: `${info.color}${isDark ? '25' : '15'}`,
                          color: info.color,
                          flexShrink: 0,
                        }}
                      >
                        {info.icon}
                      </Box>
                      <Box flex={1}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700,
                            color: isDark ? 'white' : 'grey.900',
                            mb: 0.5,
                          }}
                        >
                          {info.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: isDark ? 'grey.400' : 'grey.600',
                            lineHeight: 1.6,
                          }}
                        >
                          {info.content}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}

              {/* Mapa */}
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                  flex: 1,
                }}
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3759.404608825977!2d-65.76591543765535!3d-19.567159055251953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2sbo!4v1759840783728!5m2!1ses!2sbo"
                  width="100%"
                  height="100%"
                  loading="lazy"
                  style={{ border: 0, minHeight: 300 }}
                ></iframe>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Contact;