// app/transporte/rutas/page.tsx
'use client';
import React from 'react';
import { Container, Box } from '@mui/material';
import { GestionRutas } from '@/components/transporte/rutas/Gestionrutas';

/**
 * Página de Gestión de Rutas de Transporte
 * 
 * Esta página utiliza el componente GestionRutas que incluye:
 * - Vista de tabla responsiva
 * - Vista de tarjetas para móvil
 * - Formulario de creación/edición
 * - Diálogo de detalles
 * - Sistema de filtros
 * - Estadísticas en tiempo real
 */
export default function RutasPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <GestionRutas />
    </Container>
  );
}