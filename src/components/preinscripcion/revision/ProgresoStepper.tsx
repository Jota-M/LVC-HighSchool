// components/preinscripcion/revision/ProgresoStepper.tsx
'use client';
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface ProgresoStepperProps {
  activeStep: number;
}

const pasos = [
  {
    label: 'Verificación de Documentos',
    descripcion: 'Revisar y validar todos los documentos adjuntados',
    estimado: '1-2 días',
    color: '#3b82f6',
  },
  {
    label: 'Verificación de datos personales',
    descripcion: 'Confirmar la exactitud de la información proporcionada',
    estimado: '2-3 días',
    color: '#8b5cf6',
  },
  {
    label: 'Entrevista con Directora',
    descripcion: 'Agendar y realizar entrevista de admisión',
    estimado: '3-5 días',
    color: '#ec4899',
  },
  {
    label: 'Decisión Final',
    descripcion: 'Resolución final del proceso de admisión',
    estimado: '1 día',
    color: '#f59e0b',
  },
];

export default function ProgresoStepper({ activeStep }: ProgresoStepperProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const getStepColor = (index: number) => {
    if (isDark) {
      const colors = ['#60a5fa', '#a78bfa', '#f472b6', '#fbbf24'];
      return colors[index];
    }
    return pasos[index].color;
  };

  return (
    <Card
      sx={{
        borderRadius: 4,
        border: '1px solid',
        borderColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08),
        boxShadow: isDark
          ? '0 8px 32px rgba(0,0,0,0.4)'
          : '0 8px 24px rgba(0,0,0,0.08)',
        background: isDark
          ? 'linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)'
          : '#ffffff',
        position: 'sticky',
        top: 20,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: isDark
            ? '0 12px 40px rgba(0,0,0,0.5)'
            : '0 12px 32px rgba(0,0,0,0.12)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 3,
            color: isDark ? '#fff' : 'text.primary',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 24,
              borderRadius: 1,
              background: isDark
                ? 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
                : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            }}
          />
          Progreso de la Evaluación
        </Typography>

        <Stepper activeStep={activeStep} orientation="vertical">
          {pasos.map((paso, index) => {
            const isCompleted = index < activeStep;
            const isActive = index === activeStep;
            const isPending = index > activeStep;
            const stepColor = getStepColor(index);

            return (
              <Step key={paso.label} expanded>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isCompleted || isActive
                          ? `linear-gradient(135deg, ${stepColor} 0%, ${stepColor}dd 100%)`
                          : isDark
                          ? alpha('#fff', 0.1)
                          : '#e2e8f0',
                        color: isCompleted || isActive
                          ? '#fff'
                          : isDark
                          ? alpha('#fff', 0.4)
                          : '#64748b',
                        fontWeight: 700,
                        fontSize: '1rem',
                        border: isActive
                          ? `3px solid ${stepColor}`
                          : `2px solid ${isDark ? alpha('#fff', 0.2) : '#cbd5e1'}`,
                        boxShadow: isActive
                          ? `0 0 0 4px ${alpha(stepColor, 0.2)}`
                          : 'none',
                        transition: 'all 0.3s ease',
                        animation: isActive
                          ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                          : isCompleted
                          ? `fadeIn 0.5s ease ${index * 0.1}s both`
                          : 'none',
                        '@keyframes pulse': {
                          '0%, 100%': {
                            transform: 'scale(1)',
                            boxShadow: `0 0 0 4px ${alpha(stepColor, 0.2)}`,
                          },
                          '50%': {
                            transform: 'scale(1.05)',
                            boxShadow: `0 0 0 8px ${alpha(stepColor, 0.1)}`,
                          },
                        },
                        '@keyframes fadeIn': {
                          from: {
                            opacity: 0,
                            transform: 'scale(0.8)',
                          },
                          to: {
                            opacity: 1,
                            transform: 'scale(1)',
                          },
                        },
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
                  <Box>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: isActive ? 700 : 600,
                        color: isActive
                          ? stepColor
                          : isDark
                          ? isCompleted
                            ? '#fff'
                            : alpha('#fff', 0.7)
                          : isCompleted
                          ? 'text.primary'
                          : 'text.secondary',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {paso.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: isDark ? alpha('#fff', 0.6) : 'text.secondary',
                      }}
                    >
                      {paso.descripcion}
                    </Typography>
                  </Box>
                </StepLabel>
                <StepContent>
                  <Box sx={{ mt: 1, mb: 2 }}>
                    <Chip
                      icon={
                        isCompleted ? (
                          <CheckCircleIcon sx={{ fontSize: 16 }} />
                        ) : isActive ? (
                          <ScheduleIcon sx={{ fontSize: 16 }} />
                        ) : (
                          <PendingIcon sx={{ fontSize: 16 }} />
                        )
                      }
                      label={
                        isCompleted
                          ? 'Completado'
                          : isActive
                          ? 'En progreso'
                          : 'Pendiente'
                      }
                      size="small"
                      sx={{
                        mr: 1,
                        bgcolor: isCompleted
                          ? isDark
                            ? alpha('#10b981', 0.2)
                            : alpha('#10b981', 0.1)
                          : isActive
                          ? isDark
                            ? alpha(stepColor, 0.2)
                            : alpha(stepColor, 0.1)
                          : isDark
                          ? alpha('#fff', 0.05)
                          : alpha('#000', 0.05),
                        color: isCompleted
                          ? isDark
                            ? '#6ee7b7'
                            : '#059669'
                          : isActive
                          ? stepColor
                          : isDark
                          ? alpha('#fff', 0.5)
                          : 'text.secondary',
                        fontWeight: 600,
                        border: '1px solid',
                        borderColor: isCompleted
                          ? isDark
                            ? alpha('#10b981', 0.3)
                            : '#10b981'
                          : isActive
                          ? alpha(stepColor, 0.3)
                          : isDark
                          ? alpha('#fff', 0.1)
                          : alpha('#000', 0.1),
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        },
                      }}
                    />
                    <Chip
                      label={`Estimado: ${paso.estimado}`}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: isDark ? alpha('#fff', 0.2) : undefined,
                        color: isDark ? alpha('#fff', 0.7) : 'text.secondary',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: isDark ? alpha('#fff', 0.4) : undefined,
                          bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.02),
                        },
                      }}
                    />
                  </Box>
                </StepContent>
              </Step>
            );
          })}
        </Stepper>

        <Divider
          sx={{
            my: 3,
            borderColor: isDark ? alpha('#fff', 0.1) : undefined,
          }}
        />

        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.02),
            border: '1px solid',
            borderColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08),
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#3b82f6', 0.05),
              borderColor: isDark ? alpha('#60a5fa', 0.3) : alpha('#3b82f6', 0.2),
            },
          }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <InfoIcon
              sx={{
                fontSize: 20,
                color: isDark ? '#60a5fa' : '#3b82f6',
              }}
            />
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: isDark ? '#fff' : 'text.primary',
              }}
            >
              Información del Proceso
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[
              {
                text: 'Cada paso debe completarse antes de continuar',
                color: isDark ? '#60a5fa' : '#3b82f6',
              },
              {
                text: 'Puedes pausar el proceso en cualquier momento',
                color: isDark ? '#6ee7b7' : '#10b981',
              },
              {
                text: 'Los padres recibirán actualizaciones automáticas',
                color: isDark ? '#fbbf24' : '#f59e0b',
              },
            ].map((item, idx) => (
              <Box
                key={idx}
                display="flex"
                alignItems="center"
                gap={1}
                sx={{
                  animation: `slideIn 0.5s ease ${idx * 0.1}s both`,
                  '@keyframes slideIn': {
                    from: {
                      opacity: 0,
                      transform: 'translateX(-10px)',
                    },
                    to: {
                      opacity: 1,
                      transform: 'translateX(0)',
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: item.color,
                    boxShadow: `0 0 8px ${alpha(item.color, 0.4)}`,
                    transition: 'all 0.3s ease',
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: isDark ? alpha('#fff', 0.8) : 'text.secondary',
                  }}
                >
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Progreso general */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: 3,
            background: isDark
              ? `linear-gradient(135deg, ${alpha('#3b82f6', 0.1)} 0%, ${alpha('#8b5cf6', 0.1)} 100%)`
              : `linear-gradient(135deg, ${alpha('#3b82f6', 0.05)} 0%, ${alpha('#8b5cf6', 0.05)} 100%)`,
            border: '1px solid',
            borderColor: isDark ? alpha('#60a5fa', 0.2) : alpha('#3b82f6', 0.2),
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: isDark ? '#60a5fa' : '#3b82f6',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Progreso General
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: isDark ? '#fff' : 'text.primary',
              }}
            >
              {Math.round(((activeStep + 1) / pasos.length) * 100)}%
            </Typography>
          </Box>
          <Box
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08),
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${((activeStep + 1) / pasos.length) * 100}%`,
                background: isDark
                  ? 'linear-gradient(90deg, #60a5fa 0%, #8b5cf6 50%, #ec4899 75%, #fbbf24 100%)'
                  : 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 75%, #f59e0b 100%)',
                borderRadius: 4,
                transition: 'width 0.5s ease',
                boxShadow: isDark
                  ? '0 0 10px rgba(96, 165, 250, 0.5)'
                  : '0 0 10px rgba(59, 130, 246, 0.3)',
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}