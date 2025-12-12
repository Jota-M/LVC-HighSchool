import React from 'react';
import { Paper, Stepper, Step, StepLabel, useTheme } from '@mui/material';

interface StepperHeaderProps {
  activeStep: number;
  steps: string[];
}

export const StepperHeader: React.FC<StepperHeaderProps> = ({ activeStep, steps }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: '20px',
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Paper>
  );
};
