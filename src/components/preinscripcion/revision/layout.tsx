// components/preinscripcion/revision/RevisionLayout.tsx
'use client';
import React from 'react';
import { Box, Alert, AlertTitle, Typography, CircularProgress, Grid } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { usePreinscripcionDetalle } from '@/hooks/usePreinscripcionDetalle';
import ProgresoStepper from './ProgresoStepper';
import PasoDocumentos from './PasoDocumentos';
import PasoDatosPersonales from './PasoDatosPersonales';
import PasoEntrevista from './PasoEntrevista';
import PasoDecisionFinal from './PasoDecisionFinal';

interface RevisionLayoutProps {
  id: string | string[];
}

export default function RevisionLayout({ id }: RevisionLayoutProps) {
  const hookData = usePreinscripcionDetalle(id);
  const { preinscripcion, loading, error, activeStep } = hookData;

  // Loading state
  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={80} thickness={4} />
        <Typography variant="h6" color="text.secondary" mt={3}>
          Cargando información de la preinscripción...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error || !preinscripcion) {
    return (
      <Box p={4}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error || 'No se pudo cargar la información de la preinscripción'}
        </Alert>
      </Box>
    );
  }

  const nombreCompleto = `${preinscripcion.estudiante.nombres} ${preinscripcion.estudiante.apellido_paterno} ${preinscripcion.estudiante.apellido_materno || ''}`.trim();

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Alert de Éxito */}
      <Alert
        icon={<CheckCircleIcon className="alert-icon" />}
        severity="success"
        sx={(theme) => ({
          borderRadius: 4,
          mb: 4,
          p: 2.5,
          border: `2px solid ${theme.palette.success.main}`,
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 8px 24px rgba(16, 185, 129, 0.35)"
              : "0 8px 24px rgba(16, 185, 129, 0.25)",
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, #064e3b 0%, #065f46 100%)"
              : "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
          color: theme.palette.mode === "dark" ? "#ecfdf5" : "inherit",
          animation: "alertFadeIn 0.55s ease-out",
          "& .alert-icon": {
            fontSize: 36,
            color: theme.palette.success.main,
            animation: "iconPulse 1.6s ease-in-out infinite",
          },
        })}
      >
        <AlertTitle sx={{ fontWeight: 700, fontSize: "1.2rem" }}>
          ¡Revisión Iniciada Exitosamente!
        </AlertTitle>
        <Typography variant="body2">
          El proceso de evaluación de <b>{nombreCompleto}</b> ha comenzado. Se han
          enviado las notificaciones correspondientes.
        </Typography>
      </Alert>


      <Grid container spacing={3}>
        {/* Panel Izquierdo - Progreso */}
        <Grid size={{xs:12, lg:4}} >
          <ProgresoStepper activeStep={activeStep} />
        </Grid>

        {/* Panel Derecho - Contenido Dinámico */}
        <Grid size={{xs:12, lg:8}}>
          {activeStep === 0 && (
            <PasoDocumentos
              preinscripcion={preinscripcion}
              notasDocumentos={hookData.notasDocumentos}
              setNotasDocumentos={hookData.setNotasDocumentos}
              aprobarDocumentos={hookData.aprobarDocumentos}
              solicitarDocumentos={hookData.solicitarDocumentos}
              rechazar={hookData.rechazar}
              saving={hookData.saving}
            />
          )}
          {activeStep === 1 && (
            <PasoDatosPersonales
              preinscripcion={preinscripcion}
              notasVerificacionDatos={hookData.notasVerificacionDatos}
              setNotasVerificacionDatos={hookData.setNotasVerificacionDatos}
              aprobarDatos={hookData.aprobarDatos}
              rechazar={hookData.rechazar}
              setActiveStep={hookData.setActiveStep}
              saving={hookData.saving}
            />
          )}
          {activeStep === 2 && (
            <PasoEntrevista
              preinscripcion={preinscripcion}
              setActiveStep={hookData.setActiveStep}
              cambiarEstado={hookData.cambiarEstado}
              saving={hookData.saving}
            />
          )}
          {activeStep === 3 && (
            <PasoDecisionFinal
              preinscripcion={preinscripcion}
              notasDecisionFinal={hookData.notasDecisionFinal}
              setNotasDecisionFinal={hookData.setNotasDecisionFinal}
              decisionFinal={hookData.decisionFinal}
              setDecisionFinal={hookData.setDecisionFinal}
              confirmarDecision={hookData.confirmarDecision}
              setActiveStep={hookData.setActiveStep}
              saving={hookData.saving}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
}