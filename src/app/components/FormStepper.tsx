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
  { label: 'Estudiante', icon: <PersonIcon />, color: '#2563eb', darkColor: '#1e40af' },
  { label: 'Padres de familia', icon: <SchoolIcon />, color: '#16a34a', darkColor: '#166534' },
  { label: 'Documentos Requeridos', icon: <ContactPhoneIcon />, color: '#f59e0b', darkColor: '#b45309' },
  { label: 'Confirmación-Revisión', icon: <CheckCircleIcon />, color: '#ef4444', darkColor: '#b91c1c' },
];

const popAnimation = keyframes`
  0% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(0,0,0,0)); }
  50% { transform: scale(1.15); filter: drop-shadow(0 0 6px rgba(0,0,0,0.3)); }
  100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(0,0,0,0)); }
`;

export default function FormStepper({ activeStep = 0 }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Grid container justifyContent="center">
      <Grid size={{xs:12}}  sx={{ py: 4, px: 2 }}>
        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          fontWeight="bold"
          align="center"
          gutterBottom
          sx={{
            color: activeStep >= 0 ? steps[activeStep].color : theme.palette.text.primary,
            transition: 'color 0.4s ease',
          }}
        >
          Paso {activeStep + 1} de {steps.length}: {steps[activeStep].label}
        </Typography>

        <Stepper
          activeStep={activeStep}
          alternativeLabel
          connector={<Box sx={{ display: 'none' }} />}
          sx={{
            '& .MuiStepLabel-label': {
              color: theme.palette.text.secondary,
              fontWeight: 'normal',
              transition: 'color 0.4s ease, font-weight 0.4s ease',
              // quitamos estilos aquí para completado, se manejará por StepLabel individualmente
            },
          }}
        >
          {steps.map((step, index) => {
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;

            const bgColor = isActive
              ? step.color
              : isDark
              ? '#334155'
              : '#e5e7eb';

            const iconColor = isActive
              ? '#fff'
              : isCompleted
              ? step.color
              : isDark
              ? step.darkColor
              : step.color;

            return (
              <Step key={step.label}>
                <StepLabel
                  sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: 'normal',
                    transition: 'color 0.4s ease, font-weight 0.4s ease',
                    '&.Mui-active': {
                      color: theme.palette.text.primary,
                      fontWeight: 'bold',
                    },
                    '&.Mui-completed': {
                      color: step.color,
                      fontWeight: 'bold',
                    },
                  }}
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: bgColor,
                        color: iconColor,
                        borderRadius: '50%',
                        width: 44,
                        height: 44,
                        fontSize: 24,
                        boxShadow: isActive
                          ? `0 4px 10px ${step.darkColor}99`
                          : '0px 2px 5px rgba(0,0,0,0.1)',
                        transform: isActive ? 'scale(1.2)' : 'scale(1)',
                        animation: isActive ? `${popAnimation} 0.8s ease` : 'none',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        filter: isActive && !isDark ? 'drop-shadow(0 0 2px rgba(0,0,0,0.6))' : 'none',
                        '&:hover': {
                          boxShadow: isActive
                            ? `0 6px 14px ${step.darkColor}cc`
                            : `0 0 8px 2px ${step.color}55`,
                          transform: isActive ? 'scale(1.25)' : 'scale(1.1)',
                        },
                      }}
                    >
                      {step.icon}
                    </Box>
                  )}
                >
                  {step.label}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>

        {/* Barra de progreso visual entre pasos */}
        <Box
          sx={{
            mt: 3,
            display: 'flex',
            justifyContent: 'center',
            gap: 1,
            px: 4,
          }}
        >
          {steps.slice(0, -1).map((_, idx) => {
            const isActive = idx < activeStep;
            return (
              <Box
                key={idx}
                sx={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  bgcolor: isActive ? steps[activeStep].color : theme.palette.grey[400],
                  transition: 'background-color 0.5s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: isActive ? '100%' : 0,
                    bgcolor: steps[activeStep].darkColor,
                    borderRadius: 3,
                    transition: 'width 0.5s ease',
                  },
                }}
              />
            );
          })}
        </Box>
      </Grid>
    </Grid>
  );
}
