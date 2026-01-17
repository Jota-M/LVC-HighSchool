// components/pagos/ReporteMorosos.tsx
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
  TextField,
  Grid,
  Button,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Warning as WarningIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { usePagos } from '@/hooks/usePagos';

export const ReporteMorosos: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { morosos, loadingReportes, cargarMorosos } = usePagos({});

  const [filtros, setFiltros] = useState({
    dias_mora_minimo: 1,
  });

  useEffect(() => {
    cargarMorosos(filtros);
  }, [filtros, cargarMorosos]);

  const deudaTotal = morosos.reduce((sum, m) => sum + m.monto_final, 0);

  const getDiasMoraColor = (dias: number) => {
    if (dias < 7) return '#f59e0b';
    if (dias < 30) return '#ef4444';
    return '#991b1b';
  };

  const handleExportar = () => {
    // TODO: Implementar exportación a Excel/PDF
    console.log('Exportar morosos');
  };

  if (loadingReportes) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Resumen */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
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

        <Grid item xs={12} sm={6}>
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
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportar}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Exportar
            </Button>
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
                    <TableCell align="right">Monto</TableCell>
                    <TableCell align="center">Días Mora</TableCell>
                    <TableCell align="center">Contacto</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {morosos.map((moroso) => (
                    <TableRow
                      key={`${moroso.estudiante_id}-${moroso.numero_cuota}`}
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
                          Bs {moroso.monto_final.toFixed(2)}
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
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};