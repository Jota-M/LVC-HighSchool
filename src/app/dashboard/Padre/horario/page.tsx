'use client'

import React from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  useTheme,
  Divider,
  Paper,
} from '@mui/material'
import ScheduleIcon from '@mui/icons-material/Schedule'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import TodayIcon from '@mui/icons-material/Today'

// --- Tipos ---
type ColorType =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'info'
  | 'warning'
  | 'default'

// Para clases y recordatorios
interface ClaseInfo {
  materia?: string
  hora: string
  aula?: string
  profesor?: string
  color: ColorType
}

interface RecordatorioInfo {
  titulo: string
  fecha: string
  hora: string
  lugar: string
  color: ColorType
}

// --- Datos ---
const estudiantes = [
  { nombre: 'Juan Pérez', iniciales: 'JP', color: 'success' as ColorType },
  { nombre: 'María Gómez', iniciales: 'MG', color: 'primary' as ColorType },
]

const claseActual: ClaseInfo = {
  materia: 'Matemáticas',
  hora: '13:30 - 14:15',
  aula: 'Aula 201',
  profesor: 'Prof. M. González',
  color: 'info',
}

const proximaClase: ClaseInfo = {
  materia: 'Lenguaje',
  hora: '14:15 - 15:00',
  aula: 'Aula 203',
  profesor: 'Prof. A. Rodríguez',
  color: 'warning',
}

const recordatorio: RecordatorioInfo = {
  titulo: 'Reunión de Padres',
  fecha: 'Viernes 10 de Octubre',
  hora: '17:00',
  lugar: 'Salón de Actos',
  color: 'error',
}

// Mapeo de materia → color del chip
const materiaColorMap: Record<string, ColorType> = {
  Matemáticas: 'info',
  Ciencias: 'success',
  Lenguaje: 'warning',
  Sociales: 'secondary',
  'Ed. Física': 'error',
  Arte: 'primary',
}

// Horario semanal (filas)
const horario: {
  hora: string
  lunes: string
  martes: string
  miercoles: string
  jueves: string
  viernes: string
}[] = [
  {
    hora: '07:00 - 07:45',
    lunes: 'Matemáticas',
    martes: 'Ciencias',
    miercoles: 'Lenguaje',
    jueves: 'Sociales',
    viernes: 'Arte',
  },
  {
    hora: '07:45 - 08:30',
    lunes: 'Ciencias',
    martes: 'Matemáticas',
    miercoles: 'Sociales',
    jueves: 'Lenguaje',
    viernes: 'Ed. Física',
  },
  {
    hora: '08:30 - 09:15',
    lunes: 'Lenguaje',
    martes: 'Arte',
    miercoles: 'Matemáticas',
    jueves: 'Ciencias',
    viernes: 'Matemáticas',
  },
  {
    hora: '09:15 - 10:00',
    lunes: 'Sociales',
    martes: 'Ed. Física',
    miercoles: 'Ciencias',
    jueves: 'Arte',
   viernes: 'Lenguaje', // cuidado con faltas de coma
  },
]

// --- Componente principal ---
export default function HorarioPage() {
  const theme = useTheme()

  // Función para obtener los colores del tema para una clave como "info", "success", etc.
  const getPaletteColor = (colorKey: ColorType) => {
    // theme.palette[colorKey] puede no existir explícitamente en todos los casos,
    // pero MUI garantiza que esas propiedades (info, success, warning, etc.) existan en palette.
    const paletteItem = (theme.palette as any)[colorKey]
    if (paletteItem && typeof paletteItem === 'object') {
      return paletteItem as {
        main: string
        light?: string
        dark?: string
        contrastText?: string
      }
    }
    // fallback
    return {
      main: theme.palette.grey[400],
      light: theme.palette.grey[200],
      dark: theme.palette.grey[700],
      contrastText: theme.palette.getContrastText(theme.palette.grey[400]),
    }
  }

  // Renderiza un chip para una materia con su color asociado
  const renderMateriaChip = (materia: string) => {
    const colorKey = materiaColorMap[materia] || 'default'
    const paletteColor = getPaletteColor(colorKey)
    return (
      <Chip
        key={materia}
        label={materia}
        size="small"
        sx={{
          bgcolor: paletteColor.main,
          color: paletteColor.contrastText ?? '#fff',
          fontWeight: 'bold',
          fontSize: '0.75rem',
          px: 1,
          borderRadius: 1,
        }}
      />
    )
  }

  return (
    <Box sx={{ p: 1, bgcolor: theme.palette.background.default }}>
      {/* Selección de estudiante */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Seleccionar Estudiante
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {estudiantes.map((e, i) => {
              const paletteColor = getPaletteColor(e.color)
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
              )
            })}
          </Box>
        </CardContent>
      </Card>

      {/* Tarjetas: clase actual, próxima, recordatorio */}
      <Grid container spacing={2} mb={3}>
        {( [claseActual, proximaClase] as ClaseInfo[] ).map((item, i) => (
          <Grid key={`clase-${i}`} size={{xs:12, md:4}} >
            <Card
              sx={{
                borderLeft: `6px solid ${getPaletteColor(item.color).main}`,
                boxShadow: 3,
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  {i === 0 && <ScheduleIcon sx={{ color: getPaletteColor(item.color).main }} />}
                  {i === 1 && <ArrowForwardIosIcon sx={{ color: getPaletteColor(item.color).main }} />}
                  <Typography variant="subtitle1" fontWeight="bold">
                    {i === 0 ? 'Clase Actual' : 'Próxima Clase'}
                  </Typography>
                </Box>
                <Typography variant="h6">{item.materia}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.hora} • {item.aula}
                </Typography>
                <Typography variant="body2">{item.profesor}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {/* Recordatorio separado porque tiene estructura diferente */}
        <Grid size={{xs:12, md:4}} >
          <Card
            sx={{
              borderLeft: `6px solid ${getPaletteColor(recordatorio.color).main}`,
              boxShadow: 3,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <NotificationsActiveIcon
                  sx={{ color: getPaletteColor(recordatorio.color).main }}
                />
                <Typography variant="subtitle1" fontWeight="bold">
                  Recordatorio
                </Typography>
              </Box>
              <Typography variant="h6">{recordatorio.titulo}</Typography>
              <Typography variant="body2" color="text.secondary">
                {recordatorio.fecha} • {recordatorio.hora}
              </Typography>
              <Typography variant="body2">{recordatorio.lugar}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Horario semanal */}
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <TodayIcon />
            <Typography variant="h6" fontWeight="bold">
              Horario Semanal
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box
            sx={{
              overflowX: 'auto',
              '&::-webkit-scrollbar': {
                height: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: theme.palette.grey[400],
                borderRadius: 3,
              },
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: 1,
                minWidth: 700,
              }}
            >
              {/* Encabezados */}
              {['Hora', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map((dia, i) => (
                <Paper
                  key={`header-${i}`}
                  sx={{
                    p: 1,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    bgcolor: theme.palette.grey[400],
                  }}
                >
                  {dia}
                </Paper>
              ))}

              {/* Filas del horario */}
              {horario.map((fila, rowIndex) => {
                return (
                  <React.Fragment key={`fila-${rowIndex}`}>
                    {/* Columna de hora */}
                    <Paper
                      sx={{ p: 1, textAlign: 'center', fontWeight: 500 }}
                    >
                      {fila.hora}
                    </Paper>
                    {(['lunes', 'martes', 'miercoles', 'jueves', 'viernes'] as const).map((dia, colIndex) => {
                      const materia = fila[dia]
                      return (
                        <Paper
                          key={`cell-${rowIndex}-${colIndex}`}
                          sx={{
                            p: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          {renderMateriaChip(materia)}
                        </Paper>
                      )
                    })}
                  </React.Fragment>
                )
              })}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
