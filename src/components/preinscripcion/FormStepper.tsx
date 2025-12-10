// components/preinscripcion/FormStepper.tsx
'use client';
import React from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Person as PersonIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

const steps = [
  { label: 'Estudiante', icon: PersonIcon, color: '#3b82f6' },
  { label: 'Padres', icon: PeopleIcon, color: '#10b981' },
  { label: 'Documentos', icon: DescriptionIcon, color: '#f59e0b' },
  { label: 'Confirmación', icon: CheckCircleIcon, color: '#ef4444' },
];

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); }
  50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6); }
`;

const popAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1.1); }
`;

interface FormStepperProps {
  activeStep: number;
}

export default function FormStepper({ activeStep }: FormStepperProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ mb: 4 }}>
      {/* Título */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          fontWeight={700}
          sx={{
            background: steps[activeStep].color,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          Paso {activeStep + 1} de {steps.length}
        </Typography>
        <Typography variant="body1" color="text.secondary" fontWeight={500}>
          {steps[activeStep].label}
        </Typography>
      </Box>

      {/* Stepper */}
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        sx={{
          '& .MuiStepConnector-line': {
            display: 'none',
          },
        }}
      >
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;
          const StepIcon = step.icon;

          return (
            <Step key={step.label}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    color: isCompleted
                      ? step.color
                      : isActive
                      ? theme.palette.text.primary
                      : theme.palette.text.secondary,
                    fontWeight: isActive || isCompleted ? 700 : 500,
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                  },
                }}
                StepIconComponent={() => (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: isMobile ? 50 : 56,
                      height: isMobile ? 50 : 56,
                      borderRadius: '50%',
                      background: isActive
                        ? `linear-gradient(135deg, ${step.color}, ${step.color}dd)`
                        : isCompleted
                        ? `${step.color}20`
                        : isDark
                        ? '#334155'
                        : '#e2e8f0',
                      color: isActive ? '#fff' : isCompleted ? step.color : theme.palette.text.disabled,
                      border: isActive
                        ? `3px solid ${step.color}`
                        : isCompleted
                        ? `2px solid ${step.color}40`
                        : `2px solid ${isDark ? '#475569' : '#cbd5e1'}`,
                      boxShadow: isActive
                        ? `0 8px 25px ${step.color}40`
                        : isCompleted
                        ? `0 4px 15px ${step.color}20`
                        : 'none',
                      transform: isActive ? 'scale(1.1)' : 'scale(1)',
                      animation: isActive ? `${popAnimation} 0.6s ease` : 'none',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: isActive ? 'scale(1.15)' : 'scale(1.05)',
                      },
                    }}
                  >
                    {isCompleted ? <CheckCircleIcon sx={{ fontSize: 28 }} /> : <StepIcon sx={{ fontSize: 28 }} />}
                  </Box>
                )}
              >
                {step.label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>

      {/* Barra de progreso */}
      <Box sx={{ mt: 3, px: { xs: 2, md: 6 } }}>
        <Box
          sx={{
            height: 8,
            borderRadius: 10,
            bgcolor: isDark ? '#1e293b' : '#e2e8f0',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${(activeStep / (steps.length - 1)) * 100}%`,
              background: `linear-gradient(90deg, ${steps[activeStep].color}, ${steps[activeStep].color}dd)`,
              borderRadius: 10,
              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </Box>
        <Typography
          variant="caption"
          align="center"
          sx={{
            display: 'block',
            mt: 1,
            color: theme.palette.text.secondary,
            fontWeight: 600,
          }}
        >
          {Math.round((activeStep / (steps.length - 1)) * 100)}% completado
        </Typography>
      </Box>
    </Box>
  );
}