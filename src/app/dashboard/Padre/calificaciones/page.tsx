'use client'

import { Box, Typography, Card, CardContent, Avatar, Grid, Chip, Divider, Button, LinearProgress, useTheme } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EventIcon from '@mui/icons-material/Event'
import SchoolIcon from '@mui/icons-material/School'
import GroupsIcon from '@mui/icons-material/Groups'
import AssignmentIcon from '@mui/icons-material/Assignment'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'

import { useState } from 'react'

export default function DashboardPage() {
  const theme = useTheme()
  const [estudianteActivo, setEstudianteActivo] = useState(0)

  const estudiantes = [
    { nombre: 'Juan Pérez', iniciales: 'JP', color: 'success' },
    { nombre: 'María Pérez', iniciales: 'MP', color: 'primary' },
  ]

  const calificaciones = [
    { materia: 'Matemáticas', nota: 92, estado: 'Sobresaliente', color: 'success' },
    { materia: 'Ciencias', nota: 88, estado: 'Muy bueno', color: 'info' },
    { materia: 'Lenguaje', nota: 75, estado: 'Bueno', color: 'warning' },
    { materia: 'Sociales', nota: 84, estado: 'Muy bueno', color: 'info' },
    { materia: 'Ed. Física', nota: 61, estado: 'Necesita mejorar', color: 'error' },
    { materia: 'Arte', nota: 80, estado: 'Bueno', color: 'warning' },
  ]
    // Función segura para acceder a colores del theme
  const getPaletteColor = (color: string) => {
    switch (color) {
      case 'success':
        return theme.palette.success.main
      case 'info':
        return theme.palette.info.main
      case 'primary':
        return theme.palette.primary.main
      case 'warning':
        return theme.palette.warning.main
      case 'error':
        return theme.palette.error.main
      default:
        return theme.palette.grey[500]
    }
  }

  return (
  <Box sx={{ p: 3, bgcolor: theme.palette.background.default }}>
    {/* Seleccionar Estudiante */}
    <Card
        sx={{
          mb: 3,
          backgroundColor: theme.palette.background.paper,
          boxShadow: 4,
          transition: 'all 0.3s ease-in-out',
          '&:hover': { boxShadow: 8 },
        }}
      >
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Seleccionar Estudiante
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {estudiantes.map((e, index) => {
              const isActive = index === estudianteActivo
              const colorMain = getPaletteColor(e.color)

              return (
                <Chip
                  key={index}
                  avatar={<Avatar>{e.iniciales}</Avatar>}
                  label={e.nombre}
                  onClick={() => setEstudianteActivo(index)}
                  sx={{
                    fontWeight: 500,
                    cursor: 'pointer',
                    bgcolor: isActive
                      ? colorMain
                      : theme.palette.mode === 'dark'
                        ? theme.palette.grey[800]
                        : theme.palette.grey[200],
                    color: isActive
                      ? theme.palette.getContrastText(colorMain)
                      : theme.palette.text.primary,
                    '&:hover': {
                      opacity: 0.9,
                    },
                  }}
                />
              )
            })}
          </Box>
        </CardContent>
      </Card>
    {/* Indicadores principales */}
    <Grid container spacing={2}>
      {[
        {
          title: 'Promedio General',
          value: '8.7',
          icon: <CheckCircleIcon color="success" />,
          label: 'Excelente rendimiento',
          labelColor: 'success.main',
        },
        {
          title: 'Mejor Materia',
          value: 'Matemáticas',
          icon: <SchoolIcon color="info" />,
          label: 'Sobresaliente',
          labelColor: 'info.main',
        },
        {
          title: 'Requiere Atención',
          value: 'Ed. Física',
          icon: <EventIcon color="warning" />,
          label: 'Necesita mejorar',
          labelColor: 'warning.main',
        },
        {
          title: 'Posición en Clase',
          value: '3ro',
          icon: <GroupsIcon color="info" />,
          label: 'De 25 estudiantes',
          labelColor: 'info.main',
        },
      ].map((item, idx) => (
        <Grid size={{ xs: 12, md: 3 }} key={idx}>
          <Card
            sx={{
              backgroundColor: theme.palette.background.paper,
              boxShadow: 3,
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 8 },
            }}
          >
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {item.title}
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {item.value}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                {item.icon}
                <Typography color={item.labelColor} variant="body2">
                  {item.label}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>

    {/* Rendimiento por Materia */}
    <Card
      sx={{
        mt: 3,
        backgroundColor: theme.palette.background.paper,
        boxShadow: 4,
        transition: 'box-shadow 0.3s ease-in-out',
        '&:hover': { boxShadow: 8 },
      }}
    >
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Rendimiento por Materia
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {calificaciones.map((c, index) => {
          const getBarColor = (color: string) => {
            switch (color) {
              case 'success':
                return theme.palette.success.main
              case 'info':
                return theme.palette.info.main
              case 'warning':
                return theme.palette.warning.main
              case 'error':
                return theme.palette.error.main
              default:
                return theme.palette.grey[400]
            }
          }

          return (
            <Box
              key={index}
              mb={2}
              sx={{
                opacity: 0,
                animation: `fadeIn 0.5s ease ${index * 0.1}s forwards`,
              }}
            >
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography fontWeight="medium">{c.materia}</Typography>
                <Typography fontWeight="bold" color={`${c.color}.main`}>
                  {c.nota}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={c.nota}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? theme.palette.grey[800]
                      : theme.palette.grey[200],
                  transition: 'all 0.5s ease',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getBarColor(c.color),
                  },
                }}
              />
            </Box>
          )
        })}
      </CardContent>
    </Card>

    {/* Animación CSS */}
    <style jsx global>{`
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `}</style>
  </Box>
)

}
