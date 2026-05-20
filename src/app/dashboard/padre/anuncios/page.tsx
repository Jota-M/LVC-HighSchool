'use client';
import React from 'react'
import { Box, Card, CardContent, Grid, Typography, Chip, Button } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import EventIcon from '@mui/icons-material/Event'
import PriorityHighIcon from '@mui/icons-material/PriorityHigh'

export default function AnunciosPage() {
  const theme = useTheme()
  const stats = {
    anunciosTotales: 23,
    sinLeer: 5,
    importantes: 8,
    actividadReciente: 12,
  }

  const anuncios = [
    {
      id: 1,
      categoria: 'EMERGENCIA',
      titulo: 'URGENTE: Suspensión de clases por emergencia',
      descripcion:
        'Debido a las fuertes lluvias y condiciones climáticas adversas, se suspenden las clases presenciales del día de hoy. Se reanudarán mañana en horario normal. Manténganse seguros.',
      timestamp: 'Hace 2 horas',
      nuevo: true,
    },
    {
      id: 2,
      categoria: 'ACADÉMICO',
      titulo: 'Reunión de padres de familia - 3er Grado',
      descripcion:
        'Se convoca a todos los padres de familia del 3er Grado A a la reunión que se realizará el viernes 25 de marzo a las 6:00 PM en el aula 201. Se tratarán temas importantes sobre el progreso académico.',
      timestamp: 'Hace 1 día',
      nuevo: true,
    },
    {
      id: 3,
      categoria: 'RECREATIVO',
      titulo: 'Actividad deportiva este fin de semana',
      descripcion: 'No te pierdas el torneo de fútbol organizado por el comité de deportes este sábado a las 10 AM.',
      timestamp: 'Hace 3 días',
      nuevo: false,
    },
  ]

  return (
    <Box sx={{ p: 3 }}>
      {/* Estadísticas */}
      <Grid container spacing={2}>
        <Grid size={{xs:12, sm:6, md:3}}>
          <Card sx={{ boxShadow: 3, backgroundColor: theme.palette.info.main }}>
            <CardContent>
              <Typography variant="h6" color="white">
                Anuncios Totales
              </Typography>
              <Typography variant="h4" color="white">
                {stats.anunciosTotales}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{xs:12, sm:6, md:3}}>
          <Card sx={{ boxShadow: 3, backgroundColor: theme.palette.warning.main }}>
            <CardContent>
              <Typography variant="h6" color="white">
                Sin Leer
              </Typography>
              <Typography variant="h4" color="white">
                {stats.sinLeer}
              </Typography>
              <Chip label="Requieren atención" color="secondary" size="small" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{xs:12, sm:6, md:3}}>
          <Card sx={{ boxShadow: 3, backgroundColor: theme.palette.error.main }}>
            <CardContent>
              <Typography variant="h6" color="white">
                Importantes
              </Typography>
              <Typography variant="h4" color="white">
                {stats.importantes}
              </Typography>
              <Chip label="Alta prioridad" color="primary" size="small" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{xs:12, sm:6, md:3}} >
          <Card sx={{ boxShadow: 3, backgroundColor: theme.palette.success.main }}>
            <CardContent>
              <Typography variant="h6" color="white">
                Actividad Reciente
              </Typography>
              <Typography variant="h4" color="white">
                {stats.actividadReciente}
              </Typography>
              <Typography variant="body2" color="white">
                Últimos 7 días
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Anuncios */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Todos los Anuncios
        </Typography>

        {anuncios.map((anuncio) => (
          <Card key={anuncio.id} sx={{ mb: 2, boxShadow: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Chip label={anuncio.categoria} color="error" size="small" />
                <Typography variant="body2" color="text.secondary">
                  {anuncio.timestamp}
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight="bold">
                {anuncio.titulo}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                {anuncio.descripcion}
              </Typography>
              {anuncio.nuevo && (
                <Chip label="Nuevo" color="primary" size="small" sx={{ mt: 1 }} />
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  )
}
