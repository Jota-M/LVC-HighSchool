'use client';
import React from 'react';
import { Box, Container, Typography, useTheme } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
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
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          minHeight: '100vh',
          background: isDark
            ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 6,
        }}
      >
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: '#fff',
                mb: 2,
                textShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              Seguimiento de Preinscripción
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Consulta y edita tu solicitud de preinscripción
            </Typography>
          </Box>

          {/* Buscador */}
          <BuscadorPreinscripcion
            onBuscar={buscarPorCodigo}
            loading={loading}
            error={error}
          />

          {/* Resultados */}
          {preinscripcion && (
            <>
              {/* Estado Actual */}
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
  );
}