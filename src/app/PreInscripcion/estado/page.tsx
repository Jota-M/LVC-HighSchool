'use client';

import React from 'react';
import { Box, Container, Typography, useTheme, Button } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Header from '../../login/Header';
import { useSeguimientoPreinscripcion } from '@/hooks/useSeguimientoPreinscripcion';
import {
  BuscadorPreinscripcion,
  EstadoPreinscripcion,
  TabsEdicion,
} from '../../../components/seguimiento-preinscripcion';

export default function SeguimientoPreinscripcionPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const {
    preinscripcion,
    loading,
    error,
    guardando,
    buscarPorCodigo,
    actualizarEstudiante,
    actualizarTutor,
    resubirDocumento,
    recargar,
  } = useSeguimientoPreinscripcion();

  return (
    <>
      {/* Header oficial compartido con el formulario de preinscripción */}
      <Header />

      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box
          sx={{
            minHeight: '100vh',
            background: isDark
              ? 'linear-gradient(135deg, #090B26 0%, #000000 100%)'
              : 'linear-gradient(135deg, #fdfcfb 0%, #B9BED4 100%)',
            py: { xs: 16, md: 14 },
          }}
        >
          <Container maxWidth="lg">
            {/* Botón Volver sutil */}
            <Box sx={{ mb: 3 }}>
              <Button
                href="/PreInscripcion"
                startIcon={<ArrowBackIcon />}
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  textTransform: 'none',
                  color: isDark ? '#facc15' : '#01579b',
                  borderRadius: '10px',
                  px: 2,
                  py: 0.8,
                  bgcolor: isDark ? 'rgba(250, 204, 21, 0.08)' : 'rgba(1, 87, 155, 0.08)',
                  border: `1px solid ${isDark ? 'rgba(250, 204, 21, 0.2)' : 'rgba(1, 87, 155, 0.15)'}`,
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(250, 204, 21, 0.15)' : 'rgba(1, 87, 155, 0.15)',
                    transform: 'translateX(-3px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Volver a Preinscripción
              </Button>
            </Box>

            {/* Título de la página estilo formulario de preinscripción */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography
                variant="h3"
                fontWeight={800}
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1.5,
                  fontSize: { xs: '1.8rem', md: '2.5rem' },
                  letterSpacing: '0.02em',
                }}
              >
                Consulta y Seguimiento de Preinscripción
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  color: isDark ? 'rgba(255, 255, 255, 0.75)' : '#475569',
                  maxWidth: 680,
                  mx: 'auto',
                  fontSize: { xs: '0.95rem', md: '1.05rem' },
                }}
              >
                Consulta el estado de tu solicitud, revisa observaciones o actualiza la documentación requerida.
              </Typography>
            </Box>

            {/* Buscador estilizado */}
            <BuscadorPreinscripcion
              onBuscar={buscarPorCodigo}
              loading={loading}
              error={error}
            />

            {/* Resultados */}
            {preinscripcion && (
              <>
                {/* Estado Actual y Stepper Visual */}
                <EstadoPreinscripcion
                  preinscripcion={preinscripcion}
                  onRecargar={recargar}
                />

                {/* Tabs de Edición */}
                {(preinscripcion.estado === 'documentos_pendientes' ||
                  preinscripcion.estado === 'en_revision' ||
                  preinscripcion.estado === 'rechazada') && (
                  <TabsEdicion
                    preinscripcion={preinscripcion}
                    onActualizarEstudiante={actualizarEstudiante}
                    onActualizarTutor={actualizarTutor}
                    onResubirDocumento={resubirDocumento}
                    guardando={guardando}
                  />
                )}
              </>
            )}
          </Container>
        </Box>
      </LocalizationProvider>
    </>
  );
}