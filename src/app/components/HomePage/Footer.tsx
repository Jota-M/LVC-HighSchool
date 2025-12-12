'use client'
import React from 'react';
import { Box, Grid, Typography, Link, IconButton, Divider, Container } from '@mui/material';
import { Facebook, Instagram, YouTube, LocationOn, Phone, Email, AccessTime, Favorite, ArrowForward } from '@mui/icons-material';

function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: '#0f172a', color: 'white', pt: 10, pb: 4, position: 'relative', overflow: 'hidden' }}>
      {/* Decorative gradient overlay */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100%',
        background: 'radial-gradient(circle at 20% 50%, rgba(56, 189, 248, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4}>
          {/* Columna 1 - Información principal */}
          <Grid size={{xs:12, md:4}}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Favorite sx={{ fontSize: 48, color: '#38bdf8', mr: 1.5 }} />
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Unidad Educativa Particular Cristiana
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#38bdf8', lineHeight: 1.2 }}>
                  La Voz de Cristo
                </Typography>
              </Box>
            </Box>
            
            <Typography variant="body2" sx={{ mb: 3, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
              Formando líderes con valores cristianos, excelencia académica y compromiso con la comunidad.
            </Typography>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <IconButton 
                sx={{ 
                  bgcolor: '#1877f2', 
                  color: 'white', 
                  '&:hover': { bgcolor: '#166fe5', transform: 'translateY(-2px)' },
                  transition: 'all 0.3s'
                }}
              >
                <Facebook />
              </IconButton>
              <IconButton 
                sx={{ 
                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                  color: 'white', 
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(225,48,108,0.4)' },
                  transition: 'all 0.3s'
                }}
              >
                <Instagram />
              </IconButton>
              <IconButton 
                sx={{ 
                  bgcolor: '#ff0000', 
                  color: 'white', 
                  '&:hover': { bgcolor: '#cc0000', transform: 'translateY(-2px)' },
                  transition: 'all 0.3s'
                }}
              >
                <YouTube />
              </IconButton>
            </Box>
          </Grid>

          {/* Columna 2 - Enlaces rápidos */}
          <Grid size={{xs:12, sm:6, md:2.5}}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, position: 'relative', display: 'inline-block' }}>
              Enlaces Rápidos
              <Box sx={{ position: 'absolute', bottom: -8, left: 0, width: 40, height: 3, bgcolor: '#38bdf8', borderRadius: 2 }} />
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {['Inicio', 'Nosotros', 'Niveles Educativos', 'Galería', 'Noticias', 'Contacto'].map((item) => (
                <Link 
                  key={item}
                  href="#" 
                  underline="none" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    transition: 'all 0.3s',
                    '&:hover': { 
                      color: '#38bdf8',
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  <Box sx={{ width: 4, height: 4, bgcolor: 'currentColor', borderRadius: '50%' }} />
                  {item}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Columna 3 - Admisiones destacadas */}
          <Grid size={{xs:12, sm:6, md:2.5}}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, position: 'relative', display: 'inline-block' }}>
              Admisiones
              <Box sx={{ position: 'absolute', bottom: -8, left: 0, width: 40, height: 3, bgcolor: '#38bdf8', borderRadius: 2 }} />
            </Typography>
            <Box sx={{ 
              bgcolor: 'rgba(56, 189, 248, 0.1)', 
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 2, 
              p: 2.5,
              transition: 'all 0.3s',
              '&:hover': {
                bgcolor: 'rgba(56, 189, 248, 0.15)',
                borderColor: 'rgba(56, 189, 248, 0.5)',
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(56, 189, 248, 0.2)'
              }
            }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#38bdf8', mb: 1 }}>
                2026
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.8)' }}>
                ¡Inscripciones abiertas!
              </Typography>
              <Link 
                href="#" 
                sx={{ 
                  color: '#38bdf8', 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  textDecoration: 'none',
                  '&:hover': {
                    gap: 1
                  },
                  transition: 'gap 0.3s'
                }}
              >
                Más información
                <ArrowForward sx={{ fontSize: 18 }} />
              </Link>
            </Box>
          </Grid>

          {/* Columna 4 - Contacto */}
          <Grid size={{xs:12, sm:6, md:2.5}}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, position: 'relative', display: 'inline-block' }}>
              Contacto
              <Box sx={{ position: 'absolute', bottom: -8, left: 0, width: 40, height: 3, bgcolor: '#38bdf8', borderRadius: 2 }} />
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <LocationOn sx={{ fontSize: 20, color: '#38bdf8', flexShrink: 0, mt: 0.3 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                  Av. Argentina Nro 200 entre Calle Trujillo y Luis Espinal, Potosí, Bolivia
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Phone sx={{ fontSize: 20, color: '#38bdf8', flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  +591 69624189<br />76162425 • 68420862
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Email sx={{ fontSize: 20, color: '#38bdf8', flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', wordBreak: 'break-word' }}>
                  lavozdecristohighschool@gmail.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <AccessTime sx={{ fontSize: 20, color: '#38bdf8', flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Lun - Vie<br />1:30 PM - 6:30 PM
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Divider mejorado */}
        <Divider sx={{ my: 5, bgcolor: 'rgba(56, 189, 248, 0.2)' }} />
        
        {/* Footer bottom */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            © 2026 Unidad Educativa Particular Cristiana La Voz de Cristo. Todos los derechos reservados.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="#" underline="hover" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', '&:hover': { color: '#38bdf8' } }}>
              Privacidad
            </Link>
            <Link href="#" underline="hover" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', '&:hover': { color: '#38bdf8' } }}>
              Términos
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;