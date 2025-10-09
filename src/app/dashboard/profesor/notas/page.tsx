'use client'

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'

export default function EvaluacionesPage() {
  const theme = useTheme()
  const colorMap: Record<string, string> = {
    success: theme.palette.success.main,
    primary: theme.palette.primary.main,
    warning: theme.palette.warning.main,
    secondary: theme.palette.secondary.main,
    info: theme.palette.info.main,
    error: theme.palette.error.main,
  }

  const estudiantes = [
    { nombre: 'Ana Pérez', id: '#001234', color: 'success', trimestre1: 85, trimestre2: 90, practica1: 78 },
    { nombre: 'Carlos Morales', id: '#001235', color: 'primary', trimestre1: 65, trimestre2: null, practica1: 58 },
    { nombre: 'Lucía Rodríguez', id: '#001236', color: 'warning', trimestre1: 95, trimestre2: 88, practica1: 92 },
    { nombre: 'Micaela Penaranda', id: '#001237', color: 'secondary', trimestre1: 60, trimestre2: 30, practica1: 37 },
    { nombre: 'Lucía Rodríguez', id: '#001238', color: 'warning', trimestre1: 95, trimestre2: 88, practica1: 92 },
    { nombre: 'Antonela Pérez', id: '#001239', color: 'success', trimestre1: 90, trimestre2: 80, practica1: null },
    { nombre: 'Lucas Reglon', id: '#001240', color: 'warning', trimestre1: 98, trimestre2: 89, practica1: 90 },
    { nombre: 'Cristian Machaca', id: '#001241', color: 'secondary', trimestre1: 80, trimestre2: 55, practica1: 70 },
    { nombre: 'Belén Grimaldez', id: '#001242', color: 'warning', trimestre1: 90, trimestre2: 88, practica1: 100 },
  ]

  const getPromedio = (a: number | null, b: number | null, c: number | null) => {
    const valores = [a, b, c].filter((v) => v !== null) as number[]
    if (valores.length === 0) return null
    return Math.round(valores.reduce((sum, v) => sum + v, 0) / valores.length)
  }

  const getEstado = (prom: number | null) => {
    if (prom === null) return { label: 'Sin Datos', color: 'default' }
    if (prom >= 90) return { label: 'Excelente', color: 'success' }
    if (prom >= 70) return { label: 'Aprobado', color: 'info' }
    if (prom >= 60) return { label: 'En Riesgo', color: 'warning' }
    return { label: 'Reprobado', color: 'error' }
  }

  return (
    <Box sx={{ p: 3, bgcolor: theme.palette.background.default }}>
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          {/* Filtros Superiores */}
          <Box sx={{ mb: 2, borderBottom: `1px solid ${theme.palette.divider}`, pb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{xs:12, md:3}}>
                <FormControl fullWidth size="small">
                  <InputLabel>Materia</InputLabel>
                  <Select value="matematicas" label="Materia">
                    <MenuItem value="matematicas">Matemáticas - 10mo A</MenuItem>
                    <MenuItem value="lenguaje">Lenguaje y Literatura - 10mo A</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{xs:12, md:3}}>
                <FormControl fullWidth size="small">
                  <InputLabel>Periodo</InputLabel>
                  <Select value="primer" label="Periodo">
                    <MenuItem value="primer">Primer Trimestre</MenuItem>
                    <MenuItem value="segundo">Segundo Trimestre</MenuItem>
                    <MenuItem value="tercero">Tercer Trimestre</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{xs:12, md:3}}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo de Evaluación</InputLabel>
                  <Select value="todas" label="Tipo de Evaluación">
                    <MenuItem value="todas">Todas</MenuItem>
                    <MenuItem value="parciales">Parciales</MenuItem>
                    <MenuItem value="practicas">Prácticas</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{xs:12, md:3}} display="flex" justifyContent="flex-end" gap={1}>
                <Button variant="contained" color="success" startIcon={<AddIcon />} sx={{ width: 180 }}>
                  Nueva Evaluación
                </Button>
                <Button variant="outlined" color="primary" startIcon={<EditIcon />} sx={{ width: 180 }}>
                  Calificar Lote
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Tabla */}
          <Box sx={{ mt: 2 }}>
            <Table sx={{ mt: 2, borderCollapse: 'separate', borderSpacing: '0 10px' }}>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Estudiante</strong></TableCell>
                  <TableCell><strong>Trimestre 1</strong></TableCell>
                  <TableCell><strong>Trimestre 2</strong></TableCell>
                  <TableCell><strong>Práctica 1</strong></TableCell>
                  <TableCell><strong>Promedio</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {estudiantes.map((e, i) => {
                  const promedio = getPromedio(e.trimestre1, e.trimestre2, e.practica1)
                  const estado = getEstado(promedio)
                  return (
                    <TableRow key={i} sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ bgcolor: colorMap[e.color] || theme.palette.grey[500] }}>
                            {e.nombre.split(' ').map((p) => p[0]).join('')}
                          </Avatar>
                          <Box>
                            <Typography fontWeight="bold">{e.nombre}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {e.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {[e.trimestre1, e.trimestre2, e.practica1].map((nota, j) => (
                        <TableCell key={j}>
                          {nota !== null ? (
                            <Box
                              sx={{
                                bgcolor: theme.palette.action.hover,
                                borderRadius: 2,
                                p: '4px 8px',
                                textAlign: 'center',
                                width: 60,
                              }}
                            >
                              {nota}
                            </Box>
                          ) : (
                            <Typography color="text.secondary">—</Typography>
                          )}
                        </TableCell>
                      ))}

                      <TableCell>
                        <Typography fontWeight="bold" color={estado.color !== 'default' ? `${estado.color}.main` : 'text.primary'}>
                          {promedio ?? '—'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip label={estado.label} color={estado.color as any} size="small" />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
