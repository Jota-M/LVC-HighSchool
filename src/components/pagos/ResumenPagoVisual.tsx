// components/pagos/ResumenPagoVisual.tsx
'use client';
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  alpha,
  useTheme,
  Chip,
  Stack,
  Avatar,
} from '@mui/material';
import {
  Person,
  CalendarMonth,
  AttachMoney,
  Receipt,
  TrendingUp,
} from '@mui/icons-material';

interface MensualidadResumen {
  mensualidad_id: number;
  numero_cuota: number;
  mes_correspondiente: string;
  monto_pagado: number;
}

interface EstudianteResumen {
  estudiante_id: number;
  estudiante_codigo: string;
  nombres: string;
  apellidos: string;
  grado: string;
  paralelo: string;
  mensualidades: MensualidadResumen[];
}

interface ResumenPagoVisualProps {
  estudiantes: EstudianteResumen[];
  metodo_pago: string;
  numero_comprobante?: string;
}

const METODOS_PAGO_ICONS: Record<string, string> = {
  efectivo: '💵',
  transferencia: '🏦',
  qr: '📱',
  tarjeta: '💳',
};

const METODOS_PAGO_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  qr: 'QR',
  tarjeta: 'Tarjeta',
};

export const ResumenPagoVisual: React.FC<ResumenPagoVisualProps> = ({
  estudiantes,
  metodo_pago,
  numero_comprobante,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const totalGeneral = estudiantes.reduce(
    (sum, est) => sum + est.mensualidades.reduce((s, m) => s + m.monto_pagado, 0),
    0
  );

  const totalMensualidades = estudiantes.reduce(
    (sum, est) => sum + est.mensualidades.length,
    0
  );

  return (
    <Box>
      {/* Header con totales */}
      <Card
        sx={{
          mb: 3,
          borderRadius: '16px',
          background: `linear-gradient(135deg, ${
            isDark ? alpha('#facc15', 0.2) : alpha('#0288d1', 0.2)
          } 0%, ${
            isDark ? alpha('#f59e0b', 0.1) : alpha('#01579b', 0.1)
          } 100%)`,
          border: `2px solid ${isDark ? '#facc15' : '#0288d1'}`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid size={{xs:12, sm:4}} >
              <Box textAlign="center">
                <Person sx={{ fontSize: 40, color: isDark ? '#facc15' : '#0288d1', mb: 1 }} />
                <Typography variant="h4" fontWeight={700}>
                  {estudiantes.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Estudiante{estudiantes.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
            </Grid>

            <Grid size={{xs:12, sm:4}}>
              <Box textAlign="center">
                <CalendarMonth sx={{ fontSize: 40, color: isDark ? '#facc15' : '#0288d1', mb: 1 }} />
                <Typography variant="h4" fontWeight={700}>
                  {totalMensualidades}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Mensualidades
                </Typography>
              </Box>
            </Grid>

            <Grid size={{xs:12, sm:4}}>
              <Box textAlign="center">
                <AttachMoney sx={{ fontSize: 40, color: isDark ? '#facc15' : '#0288d1', mb: 1 }} />
                <Typography variant="h3" fontWeight={700} color={isDark ? '#facc15' : '#0288d1'}>
                  Bs {totalGeneral.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total a Pagar
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Método de pago */}
      <Card
        sx={{
          mb: 3,
          borderRadius: '16px',
          background: isDark ? alpha('#fff', 0.05) : alpha('#fff', 0.9),
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Receipt sx={{ fontSize: 32, color: isDark ? '#facc15' : '#0288d1' }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Método de Pago
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {METODOS_PAGO_ICONS[metodo_pago]} {METODOS_PAGO_LABELS[metodo_pago]}
              </Typography>
            </Box>
          </Box>

          {numero_comprobante && (
            <Box display="flex" alignItems="center" gap={2}>
              <Box sx={{ width: 32 }} /> {/* Spacer */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  N° Comprobante
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {numero_comprobante}
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Detalle por estudiante */}
      <Typography variant="h6" fontWeight={700} mb={2}>
        Detalle del Pago
      </Typography>

      <Stack spacing={2}>
        {estudiantes.map((estudiante) => {
          const totalEstudiante = estudiante.mensualidades.reduce(
            (sum, m) => sum + m.monto_pagado,
            0
          );

          return (
            <Card
              key={estudiante.estudiante_id}
              sx={{
                borderRadius: '16px',
                background: isDark ? alpha('#fff', 0.05) : alpha('#fff', 0.9),
                border: `1px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.2)}`,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                {/* Header estudiante */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      sx={{
                        bgcolor: isDark ? '#facc15' : '#0288d1',
                        color: isDark ? '#000' : '#fff',
                        width: 48,
                        height: 48,
                        fontWeight: 700,
                      }}
                    >
                      {estudiante.nombres.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight={700}>
                        {estudiante.nombres} {estudiante.apellidos}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {estudiante.estudiante_codigo} • {estudiante.grado} {estudiante.paralelo}
                      </Typography>
                    </Box>
                  </Box>

                  <Box textAlign="right">
                    <Typography variant="caption" color="text.secondary">
                      Subtotal
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color={isDark ? '#facc15' : '#0288d1'}>
                      Bs {totalEstudiante.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                {/* Mensualidades */}
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {estudiante.mensualidades.map((mens) => (
                    <Chip
                      key={mens.mensualidad_id}
                      label={
                        <Box>
                          <Typography variant="caption" display="block">
                            {mens.mes_correspondiente}
                          </Typography>
                          <Typography variant="caption" fontWeight={700}>
                            Bs {mens.monto_pagado.toFixed(2)}
                          </Typography>
                        </Box>
                      }
                      sx={{
                        height: 'auto',
                        py: 1,
                        px: 1.5,
                        borderRadius: '12px',
                        background: alpha(isDark ? '#facc15' : '#0288d1', 0.1),
                        border: `1px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.3)}`,
                        '& .MuiChip-label': {
                          px: 0,
                        }
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {/* Total final destacado */}
      <Card
        sx={{
          mt: 3,
          borderRadius: '16px',
          background: `linear-gradient(135deg, ${
            isDark ? '#facc15' : '#0288d1'
          } 0%, ${
            isDark ? '#f59e0b' : '#01579b'
          } 100%)`,
          color: isDark ? '#000' : '#fff',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={700}>
              TOTAL A PAGAR
            </Typography>
            <Typography variant="h3" fontWeight={700}>
              Bs {totalGeneral.toFixed(2)}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};