// src/app/dashboard/preinscripciones/page.tsx

'use client';

import React, { useState } from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useRouter } from 'next/navigation';
import GroupIcon from '@mui/icons-material/Group';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

// Hooks
import { usePreinscripciones } from '../../../hooks/usePreinscripciones';

// Componentes
import { PreinscripcionesHeader } from '@/components/preinscripciones/PreinscripcionesHeader';
import { StatCard } from '@/components/preinscripciones/StatCard';
import { FilterSection } from '@/components/preinscripciones/FilterSection';
import { PreinscripcionCard } from '@/components/preinscripciones/PreinscripcionCard';

export default function PreinscripcionesPage() {
  const router = useRouter();
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

  const {
    filteredPreinscripciones,
    stats,
    loading,
    error,
    filters,
    setSearchTerm,
    setEstadoFilter,
    setGradoFilter,
    setTurnoFilter,
    setPeriodoFilter,
    setConCupoFilter,
    fetchPreinscripciones,
    deletePreinscripcion,
    exportToExcel,
    exportToPDF,
  } = usePreinscripciones();

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta preinscripción? Esto liberará el cupo asignado.')) return;
    
    try {
      await deletePreinscripcion(id);
      showSnackbar('Preinscripción eliminada correctamente', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar';
      showSnackbar(message, 'error');
    }
  };

  const handleExport = async () => {
    try {
      await exportToExcel();
      showSnackbar('Exportación exitosa', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al exportar';
      showSnackbar(message, 'error');
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportToPDF();
      showSnackbar('PDF generado exitosamente', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al generar PDF';
      showSnackbar(message, 'error');
    }
  };

  const goToRevision = (id: number) => {
    router.push(`/dashboard/preinscripciones/detalle/${id}`);
  };

  // Loading state
  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <CircularProgress size={80} thickness={4} sx={{ color: '#fff' }} />
        <Typography variant="h6" color="#fff" mt={3} fontWeight={600}>
          Cargando preinscripciones...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="error" mb={2}>
          Error al cargar las preinscripciones
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* HEADER */}
      <PreinscripcionesHeader
        onRefresh={fetchPreinscripciones}
        onExport={handleExport}
        onExportPDF={handleExportPDF}
        onNew={() => router.push('/dashboard/preinscripciones/nueva')}
      />

      {/* STATS */}
      <Grid container spacing={3} mb={4 }>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Solicitudes"
            value={stats.total}
            subtitle={`${stats.total} registros`}
            color="#667eea"
            icon={<GroupIcon sx={{ fontSize: 32 }} />}
            trend="+23%"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Pendientes"
            value={stats.pendientes}
            subtitle="Requieren revisión"
            color="#f093fb"
            icon={<HourglassEmptyIcon sx={{ fontSize: 32 }} />}
            trend="-8%"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Aprobadas"
            value={stats.aprobadas}
            subtitle={`${stats.total > 0 ? ((stats.aprobadas / stats.total) * 100).toFixed(1) : 0}% tasa`}
            color="#4facfe"
            icon={<CheckCircleIcon sx={{ fontSize: 32 }} />}
            trend="+15%"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Rechazadas"
            value={stats.rechazadas}
            subtitle={`${stats.total > 0 ? ((stats.rechazadas / stats.total) * 100).toFixed(1) : 0}% tasa`}
            color="#fa709a"
            icon={<CancelIcon sx={{ fontSize: 32 }} />}
            trend="-12%"
          />
        </Grid>

        {/* 🆕 STATS DE CUPOS */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Con Cupo Asignado"
            value={stats.con_cupo_asignado}
            subtitle={`${stats.total > 0 ? ((stats.con_cupo_asignado / stats.total) * 100).toFixed(1) : 0}% del total`}
            color="#43a047"
            icon={<AssignmentTurnedInIcon sx={{ fontSize: 32 }} />}
            trend="+10%"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Sin Cupo Asignado"
            value={stats.sin_cupo_asignado}
            subtitle="Requieren asignación"
            color="#fb8c00"
            icon={<EventAvailableIcon sx={{ fontSize: 32 }} />}
            trend="-5%"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Convertidas"
            value={stats.convertidas}
            subtitle="Matriculadas"
            color="#8bc34a"
            icon={<CheckCircleIcon sx={{ fontSize: 32 }} />}
            trend="+18%"
          />
        </Grid>
      </Grid>

      {/* FILTERS */}
      <Box mb={4}>
        <FilterSection
          filters={filters}
          resultCount={filteredPreinscripciones.length}
          onSearchChange={setSearchTerm}
          onEstadoChange={setEstadoFilter}
          onGradoChange={setGradoFilter}
          onTurnoChange={setTurnoFilter}
          onPeriodoChange={setPeriodoFilter}
          onConCupoChange={setConCupoFilter}
        />
      </Box>

      {/* CARDS GRID */}
      <Grid container spacing={3}>
        {filteredPreinscripciones.map((preinscripcion) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={preinscripcion.id}>
            <PreinscripcionCard
              preinscripcion={preinscripcion}
              onRevisar={goToRevision}
              onEliminar={handleDelete}
            />
          </Grid>
        ))}
      </Grid>

      {/* EMPTY STATE */}
      {filteredPreinscripciones.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            No se encontraron preinscripciones
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Intenta ajustar los filtros de búsqueda
          </Typography>
        </Box>
      )}

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ 
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}