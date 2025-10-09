'use client'

import { Box, Typography, Card, CardContent, Avatar, Grid, Chip, IconButton, useTheme, Divider, Button } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EventIcon from '@mui/icons-material/Event'
import SchoolIcon from '@mui/icons-material/School'
import GroupsIcon from '@mui/icons-material/Groups'
import AssignmentIcon from '@mui/icons-material/Assignment'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'

export default function DashboardPage() {
  const theme = useTheme()

  const estudiantes = [
    { nombre: 'Juan Pérez', iniciales: 'JP', color: 'success' },
    { nombre: 'María Pérez', iniciales: 'MP', color: 'primary' },
    { nombre: 'Antonio Pérez', iniciales: 'AP', color: 'secondary' },
  ]

  const calificaciones = [
    { materia: 'Matemáticas', detalle: 'Examen Parcial - Álgebra', profesor: 'Prof. María González', nota: 92, estado: 'Excelente', color: 'success' },
    { materia: 'Ciencias Naturales', detalle: 'Proyecto - Sistema Solar', profesor: 'Prof. Carlos Mendoza', nota: 88, estado: 'Muy bueno', color: 'info' },
    { materia: 'Lenguaje y Literatura', detalle: 'Ensayo - Mi familia', profesor: 'Prof. Ana Rodríguez', nota: 75, estado: 'Bueno', color: 'warning' },
  ]

  return (
    <Box sx={{ p: 3, bgcolor: theme.palette.background.default }}>
      {/* Seleccionar Estudiante */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Seleccionar Estudiante
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {estudiantes.map((e, index) => (
              <Chip
                key={index}
                avatar={<Avatar>{e.iniciales}</Avatar>}
                label={e.nombre}
                color={e.color as any}
                variant={index === 0 ? 'filled' : 'outlined'}
                sx={{ fontWeight: 500 }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Indicadores principales */}
      <Grid container spacing={2}>
        <Grid size={{xs:12, md:3}}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Rendimiento Académico
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                87/100
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <CheckCircleIcon color="success" />
                <Typography color="success.main" variant="body2">
                  Excelente progreso
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{xs:12, md:3}}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Asistencia
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                96%
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <GroupsIcon color="info" />
                <Typography color="info.main" variant="body2">
                  Muy buena asistencia
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid 
        size={{xs:12, md:3}}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Estado de Pagos
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                Al día
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <CheckCircleIcon color="success" />
                <Typography color="success.main" variant="body2">
                  Sin pagos pendientes
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid 
        size={{xs:12, md:3}}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Próximo Pago
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                $125
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <EventIcon color="warning" />
                <Typography color="warning.main" variant="body2">
                  Vence en 15 días
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Calificaciones recientes */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle1" fontWeight="bold">
              Calificaciones Recientes
            </Typography>
            <Button variant="text" size="small">
              Ver todas →
            </Button>
          </Box>
          <Divider />
          {calificaciones.map((c, index) => (
            <Box
              key={index}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              py={1.5}
              sx={{ borderBottom: index !== calificaciones.length - 1 ? '1px solid #eee' : 'none' }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar>
                  <AssignmentIcon />
                </Avatar>
                <Box>
                  <Typography fontWeight="bold">{c.materia}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {c.detalle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {c.profesor}
                  </Typography>
                </Box>
              </Box>
              <Box textAlign="right">
                <Typography variant="h6" color={`${c.color}.main`}>
                  {c.nota}
                </Typography>
                <Typography variant="body2" color={`${c.color}.main`}>
                  {c.estado}
                </Typography>
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Resumen de Asistencia */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight="bold">
              Resumen de Asistencia
            </Typography>
            <Button variant="outlined" size="small" startIcon={<CalendarTodayIcon />}>
              Este mes
            </Button>
          </Box>

          <Grid container spacing={2} mt={1}>
            <Grid size={{xs:12, md:4}}>
              <Typography variant="h5" fontWeight="bold">
                20 días
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Días de clase
              </Typography>
            </Grid>
            <Grid size={{xs:12, md:4}} >
              <Typography variant="h5" fontWeight="bold">
                2 días
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Faltas
              </Typography>
            </Grid>
            <Grid size={{xs:12, md:4}}>
              <Typography variant="h5" fontWeight="bold">
                20 días
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Atrasos
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}
