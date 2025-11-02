'use client';
import {
  Stepper,
  Step,
  StepLabel,
  Typography,
  Grid,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { keyframes } from '@mui/system';

const steps = [
  { label: 'Estudiante', icon: <PersonIcon />, color: '#3b82f6', darkColor: '#2563eb', gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' },
  { label: 'Padres de familia', icon: <SchoolIcon />, color: '#10b981', darkColor: '#059669', gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' },
  { label: 'Documentos Requeridos', icon: <ContactPhoneIcon />, color: '#f59e0b', darkColor: '#d97706', gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)' },
  { label: 'Confirmación-Revisión', icon: <CheckCircleIcon />, color: '#ef4444', darkColor: '#dc2626', gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' },
];

const popAnimation = keyframes`
  0% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.15) rotate(-5deg); }
  50% { transform: scale(1.2) rotate(5deg); }
  75% { transform: scale(1.15) rotate(-3deg); }
  100% { transform: scale(1.1) rotate(0deg); }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.4), 0 4px 15px rgba(0, 0, 0, 0.2); }
  50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6), 0 6px 20px rgba(0, 0, 0, 0.3); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const checkmarkDraw = keyframes`
  0% { stroke-dashoffset: 100; }
  100% { stroke-dashoffset: 0; }
`;

export default function FormStepper({ activeStep = 0 }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Grid container justifyContent="center">
      <Grid size={{xs:12}} sx={{ py: 5, px: 2 }}>
        {/* Título con efecto degradado */}
        <Box sx={{ position: 'relative', mb: 4 }}>
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            fontWeight="800"
            align="center"
            sx={{
              background: steps[activeStep].gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: isDark ? '0 0 30px rgba(59, 130, 246, 0.3)' : 'none',
              letterSpacing: '-0.02em',
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              mb: 1,
            }}
          >
            Paso {activeStep + 1} de {steps.length}
          </Typography>
          <Typography
            variant={isMobile ? 'body1' : 'h6'}
            align="center"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 500,
              opacity: 0.9,
            }}
          >
            {steps[activeStep].label}
          </Typography>
        </Box>

        {/* Stepper mejorado */}
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          connector={<Box sx={{ display: 'none' }} />}
          sx={{ mb: 4 }}
        >
          {steps.map((step, index) => {
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;

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
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      textShadow: isActive && !isDark ? `0 0 10px ${step.color}40` : 'none',
                    },
                  }}
                  StepIconComponent={() => (
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      {/* Anillo de fondo brillante para paso activo */}
                      {isActive && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 70,
                            height: 70,
                            borderRadius: '50%',
                            background: `radial-gradient(circle, ${step.color}20 0%, transparent 70%)`,
                            animation: `${pulseGlow} 2s ease-in-out infinite`,
                          }}
                        />
                      )}
                      
                      {/* Círculo principal del ícono */}
                      <Box
                        sx={{
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isActive 
                            ? step.gradient
                            : isCompleted
                            ? `linear-gradient(135deg, ${step.color}20 0%, ${step.darkColor}20 100%)`
                            : isDark 
                            ? 'linear-gradient(135deg, #334155 0%, #1e293b 100%)'
                            : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                          color: isActive 
                            ? '#fff'
                            : isCompleted 
                            ? step.color
                            : theme.palette.text.disabled,
                          borderRadius: '50%',
                          width: isMobile ? 50 : 56,
                          height: isMobile ? 50 : 56,
                          fontSize: isMobile ? 22 : 26,
                          border: isActive 
                            ? `3px solid ${step.color}` 
                            : isCompleted
                            ? `3px solid ${step.color}40`
                            : `2px solid ${isDark ? '#475569' : '#cbd5e1'}`,
                          boxShadow: isActive
                            ? `0 8px 25px ${step.color}40, 0 0 0 4px ${step.color}10`
                            : isCompleted
                            ? `0 4px 15px ${step.color}20`
                            : isDark
                            ? '0 2px 8px rgba(0,0,0,0.4)'
                            : '0 2px 8px rgba(0,0,0,0.1)',
                          transform: isActive ? 'scale(1.1)' : 'scale(1)',
                          animation: isActive ? `${popAnimation} 0.6s cubic-bezier(0.4, 0, 0.2, 1)` : 'none',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          cursor: 'pointer',
                          '&:hover': {
                            transform: isActive ? 'scale(1.15)' : 'scale(1.08)',
                            boxShadow: isActive
                              ? `0 12px 35px ${step.color}50, 0 0 0 6px ${step.color}15`
                              : `0 6px 20px ${step.color}30`,
                          },
                          '&::before': isCompleted ? {
                            content: '""',
                            position: 'absolute',
                            inset: -3,
                            borderRadius: '50%',
                            padding: 3,
                            background: `linear-gradient(135deg, ${step.color}, ${step.darkColor})`,
                            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                            WebkitMaskComposite: 'xor',
                            maskComposite: 'exclude',
                            opacity: 0.6,
                          } : {},
                        }}
                      >
                        {isCompleted ? <CheckCircleIcon sx={{ fontSize: 'inherit' }} /> : step.icon}
                      </Box>

                      {/* Indicador de número de paso */}
                      {!isCompleted && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: -8,
                            right: -8,
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: isActive ? step.gradient : isDark ? '#475569' : '#94a3b8',
                            color: '#fff',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `2px solid ${isDark ? '#1e293b' : '#fff'}`,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                          }}
                        >
                          {index + 1}
                        </Box>
                      )}
                    </Box>
                  )}
                >
                  {step.label}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>

        {/* Barra de progreso avanzada */}
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: isMobile ? 2 : 6,
            mt: 2,
          }}
        >
          {/* Línea de fondo */}
          <Box
            sx={{
              position: 'absolute',
              left: isMobile ? 16 : 48,
              right: isMobile ? 16 : 48,
              height: 8,
              borderRadius: 10,
              bgcolor: isDark ? '#1e293b' : '#e2e8f0',
              overflow: 'hidden',
            }}
          >
            {/* Barra de progreso animada */}
            <Box
              sx={{
                height: '100%',
                width: `${(activeStep / (steps.length - 1)) * 100}%`,
                background: steps[activeStep].gradient,
                borderRadius: 10,
                position: 'relative',
                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  backgroundSize: '200% 100%',
                  animation: `${shimmer} 2s infinite`,
                },
              }}
            />
          </Box>

          {/* Indicadores de progreso */}
          {steps.map((step, idx) => (
            <Box
              key={idx}
              sx={{
                flex: 1,
                height: 8,
                position: 'relative',
                zIndex: 1,
              }}
            />
          ))}
        </Box>

        {/* Texto de progreso */}
        <Typography
          variant="caption"
          align="center"
          sx={{
            display: 'block',
            mt: 2,
            color: theme.palette.text.secondary,
            fontWeight: 600,
            fontSize: '0.85rem',
          }}
        >
          Progreso: {Math.round((activeStep / (steps.length - 1)) * 100)}% completado
        </Typography>
      </Grid>
    </Grid>
  );
}