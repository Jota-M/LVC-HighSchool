'use client'

import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Avatar,
  Grid,
  Chip,
  MenuItem,
  IconButton,
  Divider,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import SearchIcon from '@mui/icons-material/Search'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import ScheduleIcon from '@mui/icons-material/Schedule'

interface Student {
  id: number
  name: string
  code: string
  attendance: number
  initials: string
  color: string
  status: 'presente' | 'ausente' | 'tardanza' | null
}

export default function AsistenciaPage() {
const [students, setStudents] = useState<Student[]>([
  {
    id: 1,
    name: 'Ana Pérez',
    code: '#001234',
    attendance: 95,
    initials: 'AP',
    color: '#3b82f6',
    status: 'presente',
  },
  {
    id: 2,
    name: 'Carlos Morales',
    code: '#001235',
    attendance: 78,
    initials: 'CM',
    color: '#9333ea',
    status: 'ausente',
  },
  {
    id: 3,
    name: 'Lucía Rodríguez',
    code: '#001236',
    attendance: 98,
    initials: 'LR',
    color: '#f59e0b',
    status: 'ausente',
  },
  {
    id: 4,
    name: 'Milenca Terrazas',
    code: '#001566',
    attendance: 66,
    initials: 'MT',
    color: 'red',
    status: 'presente',
  },
  {
    id: 5,
    name: 'Diego Fernández',
    code: '#001567',
    attendance: 88,
    initials: 'DF',
    color: '#10b981',
    status: 'presente',
  },
  {
    id: 6,
    name: 'Valeria Gómez',
    code: '#001568',
    attendance: 91,
    initials: 'VG',
    color: '#ef4444',
    status: 'presente',
  },
  {
    id: 7,
    name: 'Tomás Aguilar',
    code: '#001569',
    attendance: 74,
    initials: 'TA',
    color: '#8b5cf6',
    status: 'ausente',
  },
  {
    id: 8,
    name: 'Camila Soto',
    code: '#001570',
    attendance: 99,
    initials: 'CS',
    color: '#ec4899',
    status: 'presente',
  },
  {
    id: 9,
    name: 'Esteban Rojas',
    code: '#001571',
    attendance: 82,
    initials: 'ER',
    color: '#14b8a6',
    status: 'ausente',
  },
  {
    id: 10,
    name: 'Julieta Méndez',
    code: '#001572',
    attendance: 96,
    initials: 'JM',
    color: '#f43f5e',
    status: 'presente',
  }
]);

  const updateStatus = (id: number, newStatus: 'presente' | 'ausente' | 'tardanza') => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    )
  }

  const markAll = (status: 'presente' | 'ausente') => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })))
  }

  const countStatus = (status: 'presente' | 'ausente' | 'tardanza') =>
    students.filter((s) => s.status === status).length

  return (
    <Box p={3} bgcolor="background.default" minHeight="100vh">
      {/* HEADER */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{xs:12, md:4}} >
            <Typography variant="subtitle2">Clase Actual</Typography>
            <TextField
              fullWidth
              select
              size="small"
              defaultValue="Matemáticas - 10mo A"
            >
              <MenuItem value="Matemáticas - 10mo A">
                Matemáticas - 10mo A
              </MenuItem>
              <MenuItem value="Lenguaje - 9no B">Lenguaje - 9no B</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{xs:12, md:4}} >
            <Typography variant="subtitle2">Fecha</Typography>
            <TextField
              fullWidth
              size="small"
              InputProps={{
                startAdornment: <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              defaultValue="Lunes, 15 Enero 2024"
            />
          </Grid>
          <Grid size={{xs:12, md:4}} >
            <Typography variant="subtitle2">Hora Actual</Typography>
            <TextField
              fullWidth
              size="small"
              InputProps={{
                startAdornment: <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              defaultValue="08:15 AM"
            />
          </Grid>
        </Grid>
      </Card>

      {/* STATUS SUMMARY */}
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Chip
          icon={<CheckIcon />}
          label={`Presentes: ${countStatus('presente')}`}
          color="success"
          variant="outlined"
        />
        <Chip
          icon={<CloseIcon />}
          label={`Ausentes: ${countStatus('ausente')}`}
          color="error"
          variant="outlined"
        />
        <Chip
          icon={<AccessTimeIcon />}
          label={`Tardanzas: ${countStatus('tardanza')}`}
          color="warning"
          variant="outlined"
        />
      </Box>

      {/* SEARCH + BUTTONS */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1">
          Estudiantes ({students.length})
        </Typography>
        <TextField
          size="small"
          placeholder="Buscar estudiante..."
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckIcon />}
            onClick={() => markAll('presente')}
          >
            Todos Presentes
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<CloseIcon />}
            onClick={() => markAll('ausente')}
          >
            Todos Ausentes
          </Button>
        </Box>
      </Box>

      {/* STUDENT LIST */}
      <Card>
        {students.map((student) => (
          <React.Fragment key={student.id}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              px={2}
              py={1.5}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: student.color }}>{student.initials}</Avatar>
                <Box>
                  <Typography fontWeight="bold">{student.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {student.code} • Asistencia: {student.attendance}%
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <Button
                  variant={student.status === 'presente' ? 'contained' : 'outlined'}
                  color="success"
                  size="small"
                  startIcon={<CheckIcon />}
                  onClick={() => updateStatus(student.id, 'presente')}
                >
                  Presente
                </Button>
                <Button
                  variant={student.status === 'ausente' ? 'contained' : 'outlined'}
                  color="error"
                  size="small"
                  startIcon={<CloseIcon />}
                  onClick={() => updateStatus(student.id, 'ausente')}
                >
                  Ausente
                </Button>
                <Button
                  variant={student.status === 'tardanza' ? 'contained' : 'outlined'}
                  color="warning"
                  size="small"
                  startIcon={<AccessTimeIcon />}
                  onClick={() => updateStatus(student.id, 'tardanza')}
                >
                  Tardanza
                </Button>

                <TextField
                  size="small"
                  placeholder="Notas..."
                  sx={{ width: 150 }}
                />
                <IconButton color="default">
                  <EditIcon />
                </IconButton>
              </Box>
            </Box>
            <Divider />
          </React.Fragment>
        ))}
      </Card>
    </Box>
  )
}
