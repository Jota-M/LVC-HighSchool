'use client'
import React from 'react';
import { Box, Grid, Typography, Link, IconButton, Divider, } from '@mui/material';
import {Facebook,Instagram,YouTube,LocationOn,Phone,Email,AccessTime,Favorite,} from '@mui/icons-material';

function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: '#0f172a', color: 'white', pt: 8, pb: 4, px: { xs: 2, md: 8 } }}>
      <Grid container spacing={2} justifyContent="space-between">
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }} offset={{ lg: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Favorite sx={{ fontSize: 40, color: '#38bdf8', mr: 1 }} />
            <Box>
              <Typography variant="subtitle1">Unidad Educativa Particular Cristiana</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#38bdf8' }}>
                La Voz de Cristo
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOn sx={{ mr: 1, fontSize: 20 }} />
            <Typography variant="body2">
              Av. Amazonas N24-03 y Colón <br /> Quito, Ecuador
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Phone sx={{ mr: 1, fontSize: 20 }} />
            <Typography variant="body2">(02) 234-5678 / (02) 234-5679</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Email sx={{ mr: 1, fontSize: 20 }} />
            <Typography variant="body2">info@lavozdecristo.edu.ec</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTime sx={{ mr: 1, fontSize: 20 }} />
            <Typography variant="body2">Lun - Vie: 7:00 AM - 4:00 PM</Typography>
          </Box>
        </Grid>

        {/* Columna 2 - Enlaces rápidos */}
        <Grid size={{ xs: 12, md: 4, lg: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Enlaces Rápidos
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Link href="#" underline="hover" color="inherit">Inicio</Link>
            <Link href="#" underline="hover" color="inherit">Nosotros</Link>
            <Link href="#" underline="hover" color="inherit">Niveles Educativos</Link>
            <Link href="#" underline="hover" sx={{ color: '#38bdf8' }}>Admisiones 2025</Link>
            <Link href="#" underline="hover" color="inherit">Galería</Link>
            <Link href="#" underline="hover" color="inherit">Noticias</Link>
            <Link href="#" underline="hover" color="inherit">Contacto</Link>
          </Box>
        </Grid>

        {/* Columna 3 - Síguenos */}
        <Grid size={{ xs: 12, md: 4, lg: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Síguenos
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <IconButton sx={{ bgcolor: '#1d4ed8', color: 'white', '&:hover': { bgcolor: '#2563eb' } }}>
              <Facebook />
            </IconButton>
            <IconButton sx={{ bgcolor: '#db2777', color: 'white', '&:hover': { bgcolor: '#be185d' } }}>
              <Instagram />
            </IconButton>
            <IconButton sx={{ bgcolor: '#dc2626', color: 'white', '&:hover': { bgcolor: '#b91c1c' } }}>
              <YouTube />
            </IconButton>
          </Box>

          {/* Mapa / Ubicación */}
          <Box sx={{ bgcolor: '#1e293b', borderRadius: 2, p: 2, textAlign: 'center' }}>
            <Typography variant="body2" gutterBottom>
              Nuestra Ubicación
            </Typography>
            <Link href="#" underline="hover" sx={{ color: '#38bdf8', fontWeight: 'bold' }}>
              Ver ubicación completa
            </Link>
          </Box>
        </Grid>
      </Grid>

      {/* Divider y Derechos */}
      <Divider sx={{ my: 4, bgcolor: 'rgba(255,255,255,0.1)' }} />
      <Typography variant="body2" align="center" sx={{ color: 'gray.400' }}>
        © 2025 Unidad Educativa Particular Cristiana La Voz de Cristo. Todos los derechos reservados.
      </Typography>
    </Box>
  );
}

export default Footer;
