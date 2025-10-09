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
  useTheme
} from '@mui/material';
import { YouTube, Instagram, Facebook, Twitter } from '@mui/icons-material';

function Contact() {
  const [result, setResult] = useState('');

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult('Enviando...');
    const formData = new FormData(event.target as HTMLFormElement);

    formData.append('access_key', '7067f75d-3d06-44f1-a056-497af5a2e9bb');

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      setResult('Formulario enviado con éxito');
      alert('Formulario enviado con éxito');
      (event.target as HTMLFormElement).reset();
    } else {
      console.log('Error', data);
      alert(data.message);
      setResult('');
    }
  };
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box
      id="Contactos"
      sx={{
        px: { xs: 2, md: 8 },
        py: 10,
        background: isDark
            ? 'linear-gradient(135deg,#090B26, #000000)'
          : 'linear-gradient(135deg, #fdfcfb,#B9BED4)',
      }}
    >
      <Typography
        variant="h2"
        align="center"
        sx={{
          fontWeight: 'bold',
          color: '#01579b',
          mb: 1,
          textTransform: 'uppercase',
        }}
      >
        Contáctanos
      </Typography>

      <Typography
        variant="subtitle1"
        align="center"
        sx={{ mb: 6, 
          color: isDark ? 'grey.300' : 'text.secondary',
        }}
      >
        ¿Tienes alguna duda? ¡Estamos aquí para ayudarte!
      </Typography>

      <Grid container spacing={6} justifyContent="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 4,
              bgcolor: isDark ? '#111936' : 'rgba(255,255,255,0.9)',
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'scale(1.01)' },
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: '#01579b', fontWeight: 'bold' }}
            >
              Mándanos un mensaje
            </Typography>
            <Box
              component="form"
              onSubmit={onSubmit}
              sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
            >
              <TextField name="Nombre" label="Nombre" fullWidth required />
              <TextField
                name="email"
                type="email"
                label="Correo electrónico"
                fullWidth
                required
              />
              <TextField
                name="Mensaje"
                label="Tu mensaje"
                multiline
                rows={6}
                fullWidth
                required
              />
              <Button
                type="submit"
                variant="contained"
                sx={{
                  bgcolor: '#01579b',
                  '&:hover': { bgcolor: '#004d40' },
                  fontWeight: 'bold',
                  py: 1.5,
                }}
              >
                {result ? result : 'Enviar'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Información */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 4,
              bgcolor: isDark ? 'background.paper' : 'white',
              height: '100%',
            }}
          >
            <Typography
              variant="h4"
              gutterBottom
              sx={{ color: '#01579b', fontWeight: 'bold' }}
            >
              Nuestra información
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>LCV High School</strong>
              <br />
              B 37/3 Ground Floor Double Story Ramesh Nagar,
              <br />
              Near Raja Garden Chowk. Delhi: 110015
            </Typography>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ color: 'green', fontWeight: 'bold' }}
            >
              +91 9599272754
            </Typography>
            <Typography variant="body2" gutterBottom>
              hello@info.com.ng
            </Typography>

            {/* Redes sociales */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              {[
                { icon: <YouTube />, href: '' },
                { icon: <Instagram />, href: '#' },
                {
                  icon: <Facebook />,
                  href: 'https://www.facebook.com/profile.php?id=61567742635307',
                },
                { icon: <Twitter />, href: '#' },
              ].map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  target="_blank"
                  color="inherit"
                  sx={{
                    transition: 'all 0.3s',
                    '&:hover': { color: '#01579b', transform: 'scale(1.2)' },
                  }}
                >
                  {React.cloneElement(social.icon, { fontSize: 'large' })}
                </Link>
              ))}
            </Box>

            {/* Mapa */}
            <Box sx={{ mt: 4 }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3759.404608825977!2d-65.76591543765535!3d-19.567159055251953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2sbo!4v1759840783728!5m2!1ses!2sbo"
                width="100%"
                height="200"
                loading="lazy"
                style={{ border: 0, borderRadius: '8px' }}
              ></iframe>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Contact;
