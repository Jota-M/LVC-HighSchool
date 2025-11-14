'use client'

import React, { useState } from 'react'
import Header from '../Navbar'
import { Dayjs } from 'dayjs';
import {
  Grid,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  Chip,
  Stack,
  Alert,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Divider,
  Container,
  IconButton,
  Collapse,
  useTheme,
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import AccountCircleSharpIcon from '@mui/icons-material/AccountCircleSharp'
import SearchSharpIcon from '@mui/icons-material/SearchSharp'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PendingIcon from '@mui/icons-material/Pending'
import DescriptionIcon from '@mui/icons-material/Description'
import SchoolIcon from '@mui/icons-material/School'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import InfoIcon from '@mui/icons-material/Info'
import CloseIcon from '@mui/icons-material/Close'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import LocationOnIcon from '@mui/icons-material/LocationOn'

function Page() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  
  interface FormData {
  reference: string;
  carnet: string;
  birthDate: Dayjs | null;
}

const [formData, setFormData] = useState<FormData>({
  reference: '',
  carnet: '',
  birthDate: null,
});
  const [showResult, setShowResult] = useState(false)

  const steps = [
    {
      label: 'Inscripción Recibida',
      date: '15 Oct 2024',
      status: 'completed',
      description: 'Tu solicitud de inscripción ha sido registrada en el sistema.',
    },
    {
      label: 'Verificación de Documentos',
      date: '18 Oct 2024',
      status: 'completed',
      description: 'Certificado de nacimiento, libreta escolar y documentos personales verificados.',
    },
    {
      label: 'Evaluación de Cupo',
      date: '22 Oct 2024',
      status: 'active',
      description: 'El área administrativa está verificando la disponibilidad de cupo para el grado solicitado.',
    },
    {
      label: 'Confirmación de Inscripción',
      date: 'Pendiente',
      status: 'pending',
      description: 'Recibirás una notificación con la confirmación de tu inscripción y fechas importantes.',
    },
  ]

  const mockData = {
    student: 'Ana Sofía Mamani Quispe',
    reference: 'INS-2025-001234',
    carnet: '2025-5678',
    program: '1ro de Secundaria - Turno Mañana',
    status: 'En Proceso',
    progress: 65,
    submissionDate: '15 de Octubre, 2024',
    expectedDate: '15 de Diciembre, 2024',
  }

  const handleSearch = (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setShowResult(true)
    setTimeout(() => {
      window.scrollTo({ top: 700, behavior: 'smooth' })
    }, 100)
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: isDark ? '#0a0e27' : '#f8f9fa',
          pb: 8,
          pt: 10,
        }}
      >
        <Header />

        <Container maxWidth="lg">
          {/* Hero Section */}
          <Card
            sx={{
              mt: 4,
              p: { xs: 3, md: 5 },
              borderRadius: 3,
              bgcolor: isDark ? '#111936' : 'white',
              boxShadow: isDark ? 2 : 1,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                p: 2,
                borderRadius: '50%',
                bgcolor: isDark ? 'rgba(144,202,249,0.1)' : 'rgba(0,105,92,0.08)',
                mb: 2,
              }}
            >
              <SchoolIcon
                sx={{
                  fontSize: 60,
                  color: isDark ? '#90caf9' : '#00695c',
                }}
              />
            </Box>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.8rem', md: '2.5rem' },
                fontWeight: 'bold',
                mb: 2,
                color: isDark ? 'white' : 'text.primary',
              }}
            >
              Consulta tu Estado de Inscripción
            </Typography>
            <Typography
              variant="body1"
              sx={{
                maxWidth: 600,
                mx: 'auto',
                color: isDark ? 'grey.400' : 'text.secondary',
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                lineHeight: 1.7,
              }}
            >
              Verifica el progreso de tu inscripción en tiempo real. Ingresa tus
              datos y conoce el estado actual de tu solicitud.
            </Typography>

            {/* Info Cards */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ mt: 4, justifyContent: 'center' }}
            >
              {[
                { icon: <DescriptionIcon />, text: 'Proceso Transparente' },
                { icon: <CalendarMonthIcon />, text: 'Actualizaciones Constantes' },
                { icon: <CheckCircleIcon />, text: 'Seguimiento Detallado' },
              ].map((item, idx) => (
                <Chip
                  key={idx}
                  icon={item.icon}
                  label={item.text}
                  sx={{
                    py: 2.5,
                    px: 1,
                    fontSize: '0.9rem',
                    bgcolor: isDark ? 'rgba(144,202,249,0.08)' : 'rgba(0,105,92,0.08)',
                    color: isDark ? '#90caf9' : '#00695c',
                    border: `1px solid ${isDark ? 'rgba(144,202,249,0.2)' : 'rgba(0,105,92,0.2)'}`,
                    '& .MuiChip-icon': {
                      color: isDark ? '#90caf9' : '#00695c',
                    },
                  }}
                />
              ))}
            </Stack>
          </Card>

          {/* Formulario */}
          <Card
            sx={{
              mt: 4,
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              bgcolor: isDark ? '#111936' : 'white',
              boxShadow: isDark ? 2 : 1,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                mb: 1,
                color: isDark ? 'white' : 'text.primary',
              }}
            >
              Verificar Estado de Inscripción
            </Typography>
            <Typography
              variant="body2"
              sx={{ mb: 3, color: 'text.secondary', fontSize: '0.95rem' }}
            >
              Completa los siguientes campos para localizar tu registro
            </Typography>

            <Box component="form" onSubmit={handleSearch}>
              <Grid container spacing={3}>
                <Grid size={{xs:12}}>
                  <TextField
                    fullWidth
                    label="Número de Referencia"
                    placeholder="Ej: INS-2025-001234"
                    variant="outlined"
                    value={formData.reference}
                    onChange={(e) =>
                      setFormData({ ...formData, reference: e.target.value })
                    }
                    InputProps={{
                      startAdornment: (
                        <DescriptionIcon
                          sx={{ mr: 1, color: 'text.secondary' }}
                        />
                      ),
                    }}
                  />
                </Grid>
                <Grid size={{xs:12, md:6}} >
                  <TextField
                    fullWidth
                    label="Número de Carnet"
                    placeholder="Ej: 2025-5678"
                    variant="outlined"
                    value={formData.carnet}
                    onChange={(e) =>
                      setFormData({ ...formData, carnet: e.target.value })
                    }
                    InputProps={{
                      startAdornment: (
                        <AccountCircleSharpIcon
                          sx={{ mr: 1, color: 'text.secondary' }}
                        />
                      ),
                    }}
                  />
                </Grid>
                <Grid size={{xs:12, sm:6}}>
                  <DatePicker
                    label="Fecha de Nacimiento"
                    value={formData.birthDate}
                    onChange={(newValue) => 
                      setFormData((prev) => ({ ...prev, birthDate: newValue }))
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        InputProps: {
                          startAdornment: (
                            <CalendarMonthIcon
                              sx={{ mr: 1, color: 'text.secondary' }}
                            />
                          ),
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid size={{xs:12}}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<SearchSharpIcon />}
                    sx={{
                      py: 1.8,
                      fontSize: '1.05rem',
                      fontWeight: 'bold',
                      borderRadius: 2,
                      textTransform: 'none',
                      bgcolor: isDark ? '#90caf9' : '#00695c',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: isDark ? '#64b5f6' : '#004d40',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Consultar Estado
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Alert
              severity="info"
              icon={<InfoIcon />}
              sx={{
                mt: 3,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(144,202,249,0.08)' : 'rgba(33,150,243,0.08)',
              }}
            >
              Asegúrate de ingresar los datos exactamente como aparecen en tu comprobante de
              inscripción.
            </Alert>
          </Card>

          {/* Resultados */}
          <Collapse in={showResult}>
            <Card
              sx={{
                mt: 4,
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                bgcolor: isDark ? '#111936' : 'white',
                boxShadow: isDark ? 2 : 1,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Información de tu Inscripción
                </Typography>
                <IconButton onClick={() => setShowResult(false)} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>

              <Grid container spacing={3}>
                <Grid size={{xs:12, md:4}} >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(144,202,249,0.08)' : 'rgba(0,105,92,0.08)',
                      border: `1px solid ${isDark ? 'rgba(144,202,249,0.2)' : 'rgba(0,105,92,0.2)'}`,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Estudiante
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                      {mockData.student}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{xs:12, md:4}} >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(206,147,216,0.08)' : 'rgba(38,198,218,0.08)',
                      border: `1px solid ${isDark ? 'rgba(206,147,216,0.2)' : 'rgba(38,198,218,0.2)'}`,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Grado y Turno
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                      {mockData.program}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{xs:12, md:4}} >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(255,213,79,0.08)' : 'rgba(255,213,79,0.15)',
                      border: `1px solid ${isDark ? 'rgba(255,213,79,0.2)' : 'rgba(255,213,79,0.3)'}`,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Estado Actual
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <PendingIcon sx={{ mr: 1, color: '#ffd54f' }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {mockData.status}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Progreso */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    Progreso de Evaluación
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    {mockData.progress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={mockData.progress}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: isDark ? 'rgba(144,202,249,0.1)' : 'rgba(0,105,92,0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      bgcolor: isDark ? '#90caf9' : '#00695c',
                    },
                  }}
                />
              </Box>

              {/* Timeline */}
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Seguimiento del Proceso
              </Typography>
              <Stepper orientation="vertical" activeStep={2}>
                {steps.map((step, index) => (
                  <Step key={index} completed={step.status === 'completed'}>
                    <StepLabel
                      StepIconComponent={() =>
                        step.status === 'completed' ? (
                          <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 28 }} />
                        ) : step.status === 'active' ? (
                          <PendingIcon sx={{ color: '#ffd54f', fontSize: 28 }} />
                        ) : (
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              border: '2px solid',
                              borderColor: 'grey.400',
                            }}
                          />
                        )
                      }
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        {step.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {step.date}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {step.description}
                      </Typography>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>

              <Alert
                severity="success"
                icon={<CheckCircleIcon />}
                sx={{ mt: 3, borderRadius: 2 }}
              >
                <strong>Fecha estimada de confirmación:</strong> {mockData.expectedDate}
              </Alert>
            </Card>
          </Collapse>

          {/* Footer con Información de Contacto */}
          <Card
            sx={{
              mt: 4,
              p: 3,
              borderRadius: 3,
              bgcolor: isDark ? '#111936' : 'white',
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              ¿Necesitas Ayuda?
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
            >
              <Chip
                icon={<EmailIcon />}
                label="inscripciones@uesanfrancisco.edu.bo"
                variant="outlined"
                clickable
                sx={{ py: 2.5 }}
              />
              <Chip
                icon={<PhoneIcon />}
                label="+591 2 234-5678"
                variant="outlined"
                clickable
                sx={{ py: 2.5 }}
              />
              <Chip
                icon={<LocationOnIcon />}
                label="Secretaría - Edificio Principal"
                variant="outlined"
                clickable
                sx={{ py: 2.5 }}
              />
            </Stack>
          </Card>
        </Container>
      </Box>
    </LocalizationProvider>
  )
}

export default Page