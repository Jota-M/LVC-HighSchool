// components/pagos/ReporteMorosos.tsx - CORREGIDO
'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Grid,
  Button,
  Alert,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Warning as WarningIcon,
  Phone as PhoneIcon,
  CalendarMonth,
} from '@mui/icons-material';
import { usePagos } from '@/hooks/usePagos';
import { useAcademicos } from '@/hooks/useAcademicos'; // 🔧 AGREGAR
import { FormatoReporte } from '@/types/pagos';
import { useSnackbar } from 'notistack';

export const ReporteMorosos: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const {
    morosos,
    loadingReportes,
    loadingExportacionReportes,
    cargarMorosos,
    exportarMorosos
  } = usePagos({});
  const { enqueueSnackbar } = useSnackbar();

  // 🔧 AGREGAR: Obtener período activo
  const { periodoActivo, loading: loadingPeriodo } = useAcademicos({
    autoLoad: true,
    loadPeriodos: true,
    loadTurnos: false,
    loadNiveles: false,
    loadGrados: false,
    loadParalelos: false,
    loadMaterias: false,
    loadGradoMaterias: false
  });

  const [filtros] = useState({
  dias_mora_minimo: 1,
});

// 🔧 MODIFICADO: Solo cargar cuando haya período activo
useEffect(() => {
  if (!periodoActivo) return;

  cargarMorosos({
    ...filtros,
    periodo_academico_id: periodoActivo.id,
  });
}, [periodoActivo, filtros, cargarMorosos]);

  const deudaTotal = morosos.reduce((sum, m) => {
    // 🔧 USAR monto_final
    return sum + parseFloat(m.monto_final.toString());
  }, 0);

  const getDiasMoraColor = (dias: number) => {
    if (dias < 7) return '#f59e0b';
    if (dias < 30) return '#ef4444';
    return '#991b1b';
  };

  const handleExportar = async (formato: FormatoReporte) => {
    if (!periodoActivo) {
      enqueueSnackbar('No hay un período académico activo para generar el reporte', { variant: 'warning' });
      return;
    }

    try {
      await exportarMorosos({
        periodo_academico_id: periodoActivo.id,
        formato,
        dias_mora_minimo: filtros.dias_mora_minimo,
      });
      enqueueSnackbar(`Reporte de morosos descargado (${formato.toUpperCase()})`, { variant: 'success' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al descargar reporte de morosos';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  // 🔧 AGREGAR: Loading período
  if (loadingPeriodo) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" mt={2}>
          Cargando período académico...
        </Typography>
      </Box>
    );
  }

  // 🔧 AGREGAR: Validación período
  if (!periodoActivo) {
    return (
      <Alert severity="error" sx={{ borderRadius: '16px', maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          ⚠️ No hay período académico activo
        </Typography>
        <Typography variant="body2">
          Por favor, activa un período en Configuración → Períodos Académicos
        </Typography>
      </Alert>
    );
  }

  if (loadingReportes) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* 🔧 AGREGAR: Banner período activo */}
      <Alert 
        severity="info" 
        icon={<CalendarMonth />}
        sx={{ 
          mb: 3,
          borderRadius: '16px',
          background: alpha(isDark ? '#facc15' : '#0288d1', 0.1),
          border: `2px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.3)}`,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Box flex={1}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              PERÍODO ACADÉMICO
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {periodoActivo.nombre}
            </Typography>
          </Box>
          <Chip
            label={`ID: ${periodoActivo.id}`}
            size="small"
            sx={{
              borderRadius: '8px',
              fontWeight: 700,
              background: isDark ? '#facc15' : '#0288d1',
              color: isDark ? '#000' : '#fff',
            }}
          />
        </Box>
      </Alert>

      {/* Resumen */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{xs:12, sm:6}} >
          <Card
            sx={{
              borderRadius: '16px',
              background: isDark ? alpha('#fff', 0.05) : alpha('#fff', 0.9),
              border: `1px solid ${alpha('#ef4444', 0.2)}`,
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: alpha('#ef4444', 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ef4444',
                  }}
                >
                  <WarningIcon />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Morosos
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="#ef4444">
                    {morosos.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{xs:12, sm:6}} >
          <Card
            sx={{
              borderRadius: '16px',
              background: isDark ? alpha('#fff', 0.05) : alpha('#fff', 0.9),
              border: `1px solid ${alpha('#ef4444', 0.2)}`,
            }}
          >
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Deuda Total
              </Typography>
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Bs {deudaTotal.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla */}
      <Card
        sx={{
          borderRadius: '20px',
          background: isDark ? alpha('#fff', 0.05) : alpha('#fff', 0.9),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.2)}`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              Lista de Morosos
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleExportar('pdf')}
                disabled={loadingExportacionReportes}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleExportar('excel')}
                disabled={loadingExportacionReportes}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Excel
              </Button>
            </Box>
          </Box>

          {morosos.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                ¡Excelente! No hay estudiantes morosos
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Código</TableCell>
                    <TableCell>Estudiante</TableCell>
                    <TableCell>Grado</TableCell>
                    <TableCell>Cuota</TableCell>
                    <TableCell>Vencimiento</TableCell>
                    <TableCell align="right">Saldo Pendiente</TableCell>
                    <TableCell align="center">Días Mora</TableCell>
                    <TableCell align="center">Contacto</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {morosos.map((moroso, idx) => {
                    // 🔧 USAR monto_final como saldo pendiente
                    const saldoPendiente = parseFloat(moroso.monto_final.toString());
                    
                    return (
                      <TableRow
                        key={`${moroso.estudiante_id}-${moroso.numero_cuota}-${idx}`}
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha(isDark ? '#facc15' : '#0288d1', 0.05),
                          },
                        }}
                      >
                        <TableCell>
                          <Typography fontWeight={600}>{moroso.codigo}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {moroso.nombres} {moroso.apellidos}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {moroso.grado} - {moroso.paralelo}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            Cuota {moroso.numero_cuota}
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              {moroso.mes_correspondiente}
                            </Typography>
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(moroso.fecha_vencimiento).toLocaleDateString('es-BO')}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={700} color="#ef4444">
                            Bs {saldoPendiente.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${moroso.dias_mora} días`}
                            size="small"
                            sx={{
                              backgroundColor: alpha(getDiasMoraColor(moroso.dias_mora), 0.1),
                              color: getDiasMoraColor(moroso.dias_mora),
                              fontWeight: 600,
                              border: `1px solid ${alpha(
                                getDiasMoraColor(moroso.dias_mora),
                                0.3
                              )}`,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            startIcon={<PhoneIcon />}
                            sx={{
                              textTransform: 'none',
                              borderRadius: '8px',
                            }}
                          >
                            Contactar
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
