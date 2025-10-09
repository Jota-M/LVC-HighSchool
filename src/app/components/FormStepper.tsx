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
  { label: 'Estudiante', icon: <PersonIcon />, color: '#2563eb', darkColor: '#60a5fa' },
  { label: 'Padres de familia', icon: <SchoolIcon />, color: '#16a34a', darkColor: '#4ade80' },
  { label: 'Documentos Requeridos', icon: <ContactPhoneIcon />, color: '#f59e0b', darkColor: '#facc15' },
  { label: 'Confirmación-Revisión', icon: <CheckCircleIcon />, color: '#ef4444', darkColor: '#f87171' },
];

const popAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
`;

export default function FormStepper({ activeStep = 0 }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Grid container justifyContent="center">
      <Grid size={{ xs: 12 }} sx={{ py: 4, px: 2 }}>
        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          fontWeight="bold"
          align="center"
          gutterBottom
          color="text.primary"
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
              '&.Mui-active': {
                color: theme.palette.text.primary,
                fontWeight: 'bold',
              },
            },
          }}
        >
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                StepIconComponent={() => {
                  const bgColor =
                    index === activeStep
                      ? `linear-gradient(135deg, ${step.darkColor}, ${step.color})`
                      : isDark
                      ? '#334155'
                      : '#e5e7eb';
                  const iconColor =
                    index === activeStep
                      ? '#fff'
                      : isDark
                      ? step.darkColor
                      : step.color;

                  return (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: bgColor,
                        color: iconColor,
                        borderRadius: '50%',
                        width: 40,
                        height: 40,
                        fontSize: 22,
                        boxShadow:
                          index === activeStep
                            ? '0px 4px 15px rgba(0,0,0,0.3)'
                            : '0px 2px 5px rgba(0,0,0,0.1)',
                        transform: index === activeStep ? 'scale(1.2)' : 'scale(1)',
                        animation: index === activeStep ? `${popAnimation} 0.6s ease` : 'none',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {step.icon}
                    </Box>
                  );
                }}
              >
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box
          sx={{
            mt: 2,
            display: 'flex',
            justifyContent: 'space-between',
            px: 6,
            '& div': {
              height: 4,
              flex: 1,
              bgcolor: theme.palette.grey[400],
              borderRadius: 2,
              mx: 1,
              transition: 'all 0.5s ease',
            },
            '& div.active': {
              bgcolor: theme.palette.primary.main,
            },
          }}
        >
          {steps.slice(0, -1).map((_, idx) => (
            <div key={idx} className={idx < activeStep ? 'active' : ''} />
          ))}
        </Box>
      </Grid>
    </Grid>
  );
}
