// components/preinscripcion/revision/ProgresoStepper.tsx
'use client';

import React from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Paper,
  LinearProgress,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PendingIcon from '@mui/icons-material/Pending';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import VerifiedIcon from '@mui/icons-material/Verified';

interface ProgresoStepperProps {
  activeStep: number;
  onSelectStep?: (step: number) => void;
}

const pasos = [
  {
    label: 'Datos Personales y Tutores',
    descripcion: 'Confirmar información del postulante y tutores',
    icon: <PersonSearchIcon sx={{ fontSize: 18 }} />,
  },
  {
    label: 'Entrevista de Admisión',
    descripcion: 'Agendar o registrar entrevista con dirección',
    icon: <EventAvailableIcon sx={{ fontSize: 18 }} />,
  },
  {
    label: 'Decisión Final y Cupo',
    descripcion: 'Aprobación definitiva y asignación de vacante',
    icon: <VerifiedIcon sx={{ fontSize: 18 }} />,
  },
];

export default function ProgresoStepper({ activeStep, onSelectStep }: ProgresoStepperProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? '#facc15' : '#0288d1';
  const accentDark = isDark ? '#f59e0b' : '#01579b';

  const progresoPorcentaje = Math.min(100, Math.round(((activeStep) / (pasos.length - 1)) * 100));

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '24px',
        border: `1px solid ${alpha(accent, 0.3)}`,
        overflow: 'hidden',
        background: isDark
          ? 'linear-gradient(180deg, #0e1726 0%, #0b1320 100%)'
          : '#ffffff',
        boxShadow: isDark
          ? '0 12px 36px rgba(0, 0, 0, 0.45)'
          : '0 8px 24px rgba(0, 0, 0, 0.06)',
        position: { lg: 'sticky' },
        top: 24,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: accent,
          boxShadow: isDark
            ? `0 14px 40px ${alpha(accent, 0.25)}, 0 0 20px ${alpha(accent, 0.15)}`
            : `0 14px 30px ${alpha(accent, 0.2)}`,
          transform: 'translateY(-3px)',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Encabezado con barra vertical de acento */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box
            sx={{
              width: 5,
              height: 22,
              borderRadius: 1,
              background: isDark
                ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
            }}
          />
          <Typography variant="h6" fontWeight={700} color="text.primary">
            Etapas de Evaluación
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, pl: 2.5 }}>
          Flujo de admisión y validación de expediente
        </Typography>

        {/* Barra de progreso global */}
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: '16px',
            bgcolor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(0, 0, 0, 0.02)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" fontWeight={700} color={accent}>
              AVANCE DEL EXPEDIENTE
            </Typography>
            <Typography variant="caption" fontWeight={700} color="text.primary">
              {progresoPorcentaje}% ({activeStep + 1} de {pasos.length})
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progresoPorcentaje}
            sx={{
              height: 7,
              borderRadius: 4,
              bgcolor: isDark ? alpha('#fff', 0.1) : alpha(accent, 0.15),
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: isDark
                  ? 'linear-gradient(90deg, #facc15, #f59e0b)'
                  : 'linear-gradient(90deg, #0288d1, #01579b)',
              },
            }}
          />
        </Box>

        {/* Stepper Vertical */}
        <Stepper activeStep={activeStep} orientation="vertical">
          {pasos.map((paso, index) => {
            const isCompleted = index < activeStep;
            const isActive = index === activeStep;
            const isPending = index > activeStep;

            return (
              <Step key={paso.label} expanded>
                <StepLabel
                  onClick={() => onSelectStep?.(index)}
                  sx={{
                    cursor: onSelectStep ? 'pointer' : 'default',
                    py: 0.5,
                    '& .MuiStepLabel-labelContainer': { width: '100%' },
                  }}
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        transition: 'all 0.3s ease',
                        ...(isCompleted && {
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#fff',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                        }),
                        ...(isActive && {
                          background: isDark
                            ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                            : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                          color: isDark ? '#000' : '#fff',
                          boxShadow: `0 0 0 4px ${alpha(accent, 0.25)}`,
                          transform: 'scale(1.05)',
                        }),
                        ...(isPending && {
                          bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                          color: 'text.secondary',
                          border: `1.5px solid ${isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15)}`,
                        }),
                      }}
                    >
                      {isCompleted ? (
                        <CheckCircleIcon sx={{ fontSize: 20 }} />
                      ) : (
                        index + 1
                      )}
                    </Box>
                  )}
                >
                  <Box sx={{ pl: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isActive ? 800 : 600,
                          color: isActive
                            ? accent
                            : isCompleted
                            ? 'text.primary'
                            : 'text.secondary',
                          fontSize: '0.92rem',
                        }}
                      >
                        {paso.label}
                      </Typography>

                      <Chip
                        icon={
                          isCompleted ? (
                            <CheckCircleIcon sx={{ fontSize: 13, color: '#10b981 !important' }} />
                          ) : isActive ? (
                            <ScheduleIcon sx={{ fontSize: 13, color: `${accent} !important` }} />
                          ) : (
                            <PendingIcon sx={{ fontSize: 13 }} />
                          )
                        }
                        label={
                          isCompleted
                            ? 'Listo'
                            : isActive
                            ? 'En curso'
                            : 'Pendiente'
                        }
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          borderRadius: '8px',
                          bgcolor: isCompleted
                            ? alpha('#10b981', 0.15)
                            : isActive
                            ? alpha(accent, 0.15)
                            : isDark
                            ? alpha('#fff', 0.04)
                            : alpha('#000', 0.04),
                          color: isCompleted
                            ? '#10b981'
                            : isActive
                            ? accent
                            : 'text.secondary',
                          border: `1px solid ${
                            isCompleted
                              ? alpha('#10b981', 0.3)
                              : isActive
                              ? alpha(accent, 0.35)
                              : 'transparent'
                          }`,
                        }}
                      />
                    </Box>

                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        display: 'block',
                        mt: 0.25,
                        fontSize: '0.75rem',
                      }}
                    >
                      {paso.descripcion}
                    </Typography>
                  </Box>
                </StepLabel>

                <StepContent sx={{ borderLeft: `2px dashed ${alpha(accent, isCompleted ? 0.4 : 0.15)}`, ml: '19px', py: 0.5 }}>
                  {/* Espaciador sutil */}
                  <Box sx={{ height: 6 }} />
                </StepContent>
              </Step>
            );
          })}
        </Stepper>
      </Box>
    </Paper>
  );
}