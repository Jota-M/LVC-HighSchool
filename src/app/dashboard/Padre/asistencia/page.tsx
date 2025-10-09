'use client'

import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  Chip,
  Divider,
  Button,
  useTheme,
  Fade,
} from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { useState } from 'react'

type ColorType = 'success' | 'info' | 'warning' | 'error' | 'primary' | 'secondary'

interface Estudiante {
  nombre: string
  iniciales: string
  color: ColorType
}

export default function AttendanceDashboard() {
  const theme = useTheme()
  
  const estudiantes: Estudiante[] = [
    { nombre: 'Juan Pérez', iniciales: 'JP', color: 'success' },
    { nombre: 'María Pérez', iniciales: 'MP', color: 'primary' },
  ]

  const indicadores = [
    {
      titulo: 'Asistencia General',
      valor: '96%',
      icon: <CheckCircleOutlineIcon fontSize="large" />,
      color: 'success' as ColorType,
      descripcion: 'Excelente asistencia',
    },
    {
      titulo: 'Días Presentes',
      valor: '19/20',
      icon: <CalendarTodayIcon fontSize="large" />,
      color: 'info' as ColorType,
      descripcion: 'Este mes',
    },
    {
      titulo: 'Llegadas Tarde',
      valor: '2',
      icon: <AccessTimeIcon fontSize="large" />,
      color: 'warning' as ColorType,
      descripcion: 'Mejorar puntualidad',
    },
    {
      titulo: 'Faltas Justificadas',
      valor: '1',
      icon: <AssignmentTurnedInIcon fontSize="large" />,
      color: 'info' as ColorType,
      descripcion: 'Médica - 13/03',
    },
  ]

  const calendario = [
    { dia: 25, estado: 'presente' },
    { dia: 26, estado: 'presente' },
    { dia: 27, estado: 'presente' },
    { dia: 28, estado: 'presente' },
    { dia: 1, estado: 'presente' },
    { dia: 2, estado: 'tarde' },
    { dia: 3, estado: 'tarde' },

    { dia: 4, estado: 'presente' },
    { dia: 5, estado: 'presente' },
    { dia: 6, estado: 'tarde' },
    { dia: 7, estado: 'presente' },
    { dia: 8, estado: 'presente' },
    { dia: 9, estado: 'falta' },
    { dia: 10, estado: 'falta' },

    { dia: 11, estado: 'presente' },
    { dia: 12, estado: 'presente' },
    { dia: 13, estado: 'falta' },
    { dia: 14, estado: 'presente' },
    { dia: 15, estado: 'presente' },
    { dia: 16, estado: 'falta' },
    { dia: 17, estado: 'presente' },

    { dia: 18, estado: 'presente' },
    { dia: 19, estado: 'presente' },
    { dia: 20, estado: 'falta' },
    { dia: 21, estado: 'tarde' },
    { dia: 22, estado: 'presente' },
    { dia: 23, estado: 'falta' },
    { dia: 24, estado: 'presente' },
    { dia: 25, estado: 'falta' },
    { dia: 26, estado: 'presente' },
    { dia: 27, estado: 'presente' },
    { dia: 28, estado: 'seleccionado' },
    { dia: 29, estado: 'none' },
    { dia: 30, estado: 'none' },
    { dia: 31, estado: 'none' },

  ]

  const [selectedMonth, setSelectedMonth] = useState('Marzo 2024')

  // Estilos para días calendario con bordes y colores para modo oscuro y claro
  const getDayStyles = (estado: string) => {
    const base = {
      width: 36,
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 2,
      fontWeight: 600,
      fontSize: '0.9rem',
      userSelect: 'none',
      cursor: estado === 'seleccionado' ? 'default' : 'pointer',
      border: `1.5px solid ${theme.palette.divider}`,
      transition: 'background-color 0.35s ease, color 0.35s ease, border-color 0.3s ease',
      position: 'relative' as 'relative',
    }

    switch (estado) {
      case 'presente':
        return {
          ...base,
          bgcolor: theme.palette.mode === 'dark' ? theme.palette.success.dark : theme.palette.success.light,
          color: theme.palette.mode === 'dark' ? theme.palette.success.contrastText : theme.palette.success.dark,
          borderColor: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.main,
          '&:hover': {
            bgcolor: theme.palette.mode === 'dark' ? theme.palette.success.main : theme.palette.success.light || theme.palette.success.light,
          },
        }
      case 'tarde':
        return {
          ...base,
          bgcolor: theme.palette.mode === 'dark' ? theme.palette.warning.dark : theme.palette.warning.light,
          color: theme.palette.mode === 'dark' ? theme.palette.warning.contrastText : theme.palette.warning.dark,
          borderColor: theme.palette.mode === 'dark' ? theme.palette.warning.light : theme.palette.warning.main,
          '&:hover': {
            bgcolor: theme.palette.mode === 'dark' ? theme.palette.warning.main : theme.palette.warning.light || theme.palette.warning.light,
          },
        }
      case 'falta':
        return {
          ...base,
          bgcolor: theme.palette.mode === 'dark' ? theme.palette.error.dark : theme.palette.error.light,
          color: theme.palette.mode === 'dark' ? theme.palette.error.contrastText : theme.palette.error.dark,
          borderColor: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.main,
          '&:hover': {
            bgcolor: theme.palette.mode === 'dark' ? theme.palette.error.main : theme.palette.error.light || theme.palette.error.light,
          },
        }
      case 'seleccionado':
        return {
          ...base,
          bgcolor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light,
          color: theme.palette.mode === 'dark' ? theme.palette.primary.contrastText : theme.palette.primary.main,
          border: `3px solid ${theme.palette.primary.main}`,
          boxShadow:
            theme.palette.mode === 'dark'
              ? `0 0 8px ${theme.palette.primary.light}`
              : `0 0 10px ${theme.palette.primary.main}`,
          animation: 'pulse 2.5s infinite',
          '@keyframes pulse': {
            '0%, 100%': {
              boxShadow:
                theme.palette.mode === 'dark'
                  ? `0 0 8px ${theme.palette.primary.light}`
                  : `0 0 10px ${theme.palette.primary.main}`,
            },
            '50%': {
              boxShadow:
                theme.palette.mode === 'dark'
                  ? `0 0 18px ${theme.palette.primary.light}`
                  : `0 0 22px ${theme.palette.primary.main}`,
            },
          },
        }
      default:
        return {
          ...base,
          color: theme.palette.text.disabled,
          bgcolor: 'transparent',
          borderColor: theme.palette.divider,
          '&:hover': {
            bgcolor: theme.palette.action.hover,
          },
        }
    }
  }

  return (
    <Box sx={{ p: 3, bgcolor: theme.palette.background.default }}>
      {/* Seleccionar Estudiante */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Seleccionar Estudiante
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {estudiantes.map((e, index) => {
              // Colores adaptativos para chips:
              const bgFilled = theme.palette.mode === 'dark' ? theme.palette[e.color].dark : theme.palette[e.color].light
              const colorFilled = theme.palette.mode === 'dark' ? theme.palette[e.color].contrastText : theme.palette[e.color].main
              return (
                <Chip
                  key={index}
                  avatar={
                    <Avatar
                      sx={{
                        color: bgFilled,
                        fontWeight: 700,
                        fontSize: 14,
                        userSelect: 'none',
                      }}
                    >
                      {e.iniciales}
                    </Avatar>
                  }
                  label={e.nombre}
                  variant={index === 0 ? 'filled' : 'outlined'}
                  sx={{
                    fontWeight: 600,
                    cursor: 'pointer',
                    bgcolor: index === 0 ? bgFilled : 'transparent',
                    color: index === 0 ? colorFilled : theme.palette.text.primary,
                    borderColor: index === 0 ? bgFilled : undefined,
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      bgcolor: bgFilled,
                      color: colorFilled,
                      borderColor: bgFilled,
                    },
                  }}
                />
              )
            })}
          </Box>
        </CardContent>
      </Card>

      {/* Título y subtítulo */}
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Asistencia de Juan Pérez <span style={{ fontSize: 22 }}>📋</span>
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        3er Grado A • Control y seguimiento de asistencia escolar
      </Typography>

      {/* Selector de mes y botones */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<CalendarTodayIcon />}
          sx={{
            minWidth: 140,
            textTransform: 'none',
            bgcolor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderColor: theme.palette.divider,
            transition: 'background-color 0.3s ease, color 0.3s ease',
            '&:hover': {
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              borderColor: theme.palette.primary.main,
            },
          }}
          onClick={() => alert('Función para seleccionar mes')}
        >
          {selectedMonth}
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={() => alert('Mes anterior')}>
            <ArrowBackIosNewIcon />
          </Button>
          <Button variant="outlined" onClick={() => alert('Mes siguiente')}>
            <ArrowForwardIosIcon />
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{
              textTransform: 'none',
              borderColor: theme.palette.divider,
              color: theme.palette.text.primary,
              '&:hover': {
                bgcolor: theme.palette.action.hover,
              },
            }}
            onClick={() => alert('Descargar reporte')}
          >
            Descargar Reporte
          </Button>
          <Button variant="contained" color="success" sx={{ textTransform: 'none' }}>
            Justificar Falta
          </Button>
        </Box>
      </Box>

      {/* Indicadores */}
      <Grid container spacing={2}>
        {indicadores.map(({ titulo, valor, icon, color, descripcion }, i) => (
          <Grid key={i} size={{ xs: 12, md: 3 }}>
            <Card
              sx={{
                bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#fff',
                transition: 'background-color 0.3s ease',
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {titulo}
                </Typography>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {valor}
                </Typography>
                <Box display="flex" alignItems="center" gap={1} color={theme.palette[color].main}>
                  {icon}
                  <Typography variant="caption">{descripcion}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Calendario de asistencia */}
      <Box
        sx={{
          mt: 5,
          maxWidth: 1024,
          mx: 'auto',
          p: 2,
          borderRadius: 3,
          boxShadow: theme.shadows[3],
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Typography variant="h6" fontWeight="bold" mb={2} textAlign="center">
          Calendario de Asistencia
        </Typography>
        <Grid container spacing={1} justifyContent="center">
          {calendario.map(({ dia, estado }, i) => (
            <Grid
              key={i}
              size={{ lg: 2 }}
              sx={{
                ...getDayStyles(estado),
                userSelect: 'none',
              }}
              title={`Día ${dia} - ${estado}`}
            >
              {dia}
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  )
}

function DownloadIcon() {
  return (
    <svg
      style={{ width: 20, height: 20 }}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}
