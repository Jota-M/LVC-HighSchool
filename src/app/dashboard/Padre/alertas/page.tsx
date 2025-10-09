'use client';
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  useTheme,
  LinearProgress,
  Button,
} from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import TodayIcon from '@mui/icons-material/Today';
import { styled } from '@mui/system';

type ColorType =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'info'
  | 'warning'
  | 'default';

const estudiantes = [
  { nombre: 'Juan Pérez', iniciales: 'JP', color: 'success' as ColorType },
  { nombre: 'María Gómez', iniciales: 'MG', color: 'primary' as ColorType },
];

const alerts = [
  {
    type: 'critical',
    title: 'Calificación Muy Baja en Educación Física',
    description:
      'Juan ha obtenido una calificación de 5.8 en Educación Física, por debajo del mínimo requerido.',
    action: 'Contactar Profesor',
    timestamp: 'Hace 2 horas',
    details: [
      { label: 'Clase de Educación Física', value: '5.8' },
      { label: 'Recomendación', value: 'Tomar clases de apoyo' },
    ],
  },
  {
    type: 'warning',
    title: 'Llegadas Tarde Frecuentes',
    description: 'Juan ha tenido llegadas tarde recurrentes. Se recomienda mejorar la puntualidad.',
    action: 'Ver Más',
    timestamp: 'Hace 1 día',
    details: [
      { label: 'Frecuencia de Llegadas Tarde', value: '5 veces' },
      { label: 'Recomendación', value: 'Revisar horario y ser más puntual' },
    ],
  },
];

const summary = {
  totalAlerts: 12,
  criticalAlerts: 3,
  unreadAlerts: 7,
  resolvedAlerts: 8,
};

const CustomCard = styled(Card)(({ theme }) => ({
  borderRadius: '10px',
  overflow: 'hidden',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: (theme.shadows as any)[5], // Asegurarse que esté usando la sombra del tema correctamente
  },
}));

const CustomCardContent = styled(CardContent)(({ theme }) => ({
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
}));

const SummaryCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: (theme.shadows as any)[3], 
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: (theme.shadows as any)[6],
  },
}));

export default function AlertsPage() {
  const theme = useTheme();

  const getPaletteColor = (colorKey: ColorType) => {
    const paletteItem = (theme.palette as any)[colorKey];
    if (paletteItem && typeof paletteItem === 'object') {
      return paletteItem as {
        main: string;
        light?: string;
        dark?: string;
        contrastText?: string;
      };
    }
    return {
      main: theme.palette.grey[400],
      light: theme.palette.grey[200],
      dark: theme.palette.grey[700],
      contrastText: theme.palette.getContrastText(theme.palette.grey[400]),
    };
  };

  // Calcular los porcentajes de alerta
  const criticalPercentage = (summary.criticalAlerts / summary.totalAlerts) * 100;
  const unreadPercentage = (summary.unreadAlerts / summary.totalAlerts) * 100;
  const resolvedPercentage = (summary.resolvedAlerts / summary.totalAlerts) * 100;

  return (
    <Box sx={{ p: 1, bgcolor: theme.palette.background.default }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Seleccionar Estudiante
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {estudiantes.map((e, i) => {
              const paletteColor = getPaletteColor(e.color);
              return (
                <Chip
                  key={i}
                  avatar={<Avatar>{e.iniciales}</Avatar>}
                  label={e.nombre}
                  sx={{
                    bgcolor:
                      theme.palette.mode === 'light'
                        ? paletteColor.light ?? paletteColor.main
                        : paletteColor.dark ?? paletteColor.main,
                    color:
                      theme.palette.mode === 'light'
                        ? paletteColor.dark ?? paletteColor.contrastText
                        : paletteColor.light ?? paletteColor.contrastText,
                    fontWeight: 600,
                  }}
                />
              );
            })}
          </Box>
        </CardContent>
      </Card>

      <Typography variant="h3" fontWeight="bold" gutterBottom>
        Alertas y Notificaciones <span style={{ fontSize: 22 }}>📋</span>
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Mantente Informado sobre las informaciones importantes de Juan Pérez
      </Typography>

      {/* Resumen de Alertas */}
      <Grid container spacing={3}>
        {/* Alerta Total */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard sx={{ bgcolor: theme.palette.primary.light }}>
            <CustomCardContent>
              <Typography variant="body2" color="text.secondary" fontWeight="bold">
                Total de Alertas
              </Typography>
              <Typography variant="h4" color="text.primary">
                {summary.totalAlerts}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(summary.totalAlerts / 12) * 100}
                sx={{ marginTop: 2 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                {`De ${summary.totalAlerts} alertas totales`}
              </Typography>
            </CustomCardContent>
          </SummaryCard>
        </Grid>

        {/* Alerta Crítica */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard sx={{ bgcolor: theme.palette.error.light }}>
            <CustomCardContent>
              <Typography variant="body2" color="text.secondary" fontWeight="bold">
                Alertas Críticas
              </Typography>
              <Typography variant="h4" color="error.main">
                {summary.criticalAlerts}
              </Typography>
              <LinearProgress variant="determinate" value={criticalPercentage} sx={{ marginTop: 2 }} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                {`Críticas: ${criticalPercentage.toFixed(0)}%`}
              </Typography>
            </CustomCardContent>
          </SummaryCard>
        </Grid>

        {/* Alerta Sin Leer */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard sx={{ bgcolor: theme.palette.info.light }}>
            <CustomCardContent>
              <Typography variant="body2" color="text.secondary" fontWeight="bold">
                Sin Leer
              </Typography>
              <Typography variant="h4" color="info.main">
                {summary.unreadAlerts}
              </Typography>
              <LinearProgress variant="determinate" value={unreadPercentage} sx={{ marginTop: 2 }} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                {`No leídas: ${unreadPercentage.toFixed(0)}%`}
              </Typography>
            </CustomCardContent>
          </SummaryCard>
        </Grid>

        {/* Alerta Resuelta */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard sx={{ bgcolor: theme.palette.success.light }}>
            <CustomCardContent>
              <Typography variant="body2" color="text.secondary" fontWeight="bold">
                Alertas Resueltas
              </Typography>
              <Typography variant="h4" color="success.main">
                {summary.resolvedAlerts}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={resolvedPercentage}
                sx={{ marginTop: 2 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                {`Resueltas: ${resolvedPercentage.toFixed(0)}%`}
              </Typography>
            </CustomCardContent>
          </SummaryCard>
        </Grid>
      </Grid>

      {/* Detalles de alertas */}
      <Box sx={{ mt: 3 }}>
        {alerts.map((alert, index) => (
          <CustomCard key={index} sx={{ mb: 2, borderLeft: `6px solid ${alert.type === 'critical' ? theme.palette.error.main : theme.palette.warning.main}` }}>
            <CustomCardContent>
              <Typography variant="h6" fontWeight="bold" color={alert.type === 'critical' ? 'error' : 'warning'}>
                {alert.title}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {alert.description}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ mt: 1 }}>
                {alert.timestamp}
              </Typography>
              <Box sx={{ mt: 2 }}>
                {alert.details.map((detail, idx) => (
                  <Typography key={idx} variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong>{detail.label}: </strong>{detail.value}
                  </Typography>
                ))}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="contained" color={alert.type === 'critical' ? 'error' : 'warning'} sx={{ borderRadius: 20 }}>
                  {alert.action}
                </Button>
              </Box>
            </CustomCardContent>
          </CustomCard>
        ))}
      </Box>
    </Box>
  );
}
