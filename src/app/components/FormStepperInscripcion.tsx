// app/cursos-vacacionales/components/FormStepperInscripcion.tsx
"use client";
import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import {
  Person,
  ContactPhone,
  Payment,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { keyframes } from "@mui/system";

const steps = [
  { label: "Estudiante", icon: Person, color: "#3b82f6" },
  { label: "Tutor", icon: ContactPhone, color: "#10b981" },
  { label: "Pago", icon: Payment, color: "#f59e0b" },
  { label: "Confirmación", icon: CheckCircleIcon, color: "#ef4444" },
];

const popAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1.1); }
`;

interface FormStepperInscripcionProps {
  activeStep: number;
}

export default function FormStepperInscripcion({ activeStep }: FormStepperInscripcionProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box>
      {/* Título */}
      <Box sx={{ mb: 2, textAlign: "center" }}>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{
            background: steps[activeStep].color,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Paso {activeStep + 1} de {steps.length}
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {steps[activeStep].label}
        </Typography>
      </Box>

      {/* Steps visuales */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;
          const StepIcon = step.icon;

          return (
            <Box
              key={step.label}
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
              }}
            >
              {/* Línea conectora */}
              {index < steps.length - 1 && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 22,
                    left: "50%",
                    right: "-50%",
                    height: 2,
                    background: isCompleted
                      ? step.color
                      : isDark
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.1)",
                    zIndex: 0,
                    transition: "all 0.5s",
                  }}
                />
              )}

              {/* Ícono del paso */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: isActive
                    ? `linear-gradient(135deg, ${step.color}, ${step.color}dd)`
                    : isCompleted
                    ? `${step.color}20`
                    : isDark
                    ? "#334155"
                    : "#e2e8f0",
                  color: isActive ? "#fff" : isCompleted ? step.color : theme.palette.text.disabled,
                  border: isActive
                    ? `3px solid ${step.color}`
                    : isCompleted
                    ? `2px solid ${step.color}40`
                    : `2px solid ${isDark ? "#475569" : "#cbd5e1"}`,
                  boxShadow: isActive ? `0 8px 25px ${step.color}40` : "none",
                  transform: isActive ? "scale(1.1)" : "scale(1)",
                  animation: isActive ? `${popAnimation} 0.6s ease` : "none",
                  transition: "all 0.3s ease",
                  zIndex: 1,
                }}
              >
                {isCompleted ? <CheckCircleIcon sx={{ fontSize: 24 }} /> : <StepIcon sx={{ fontSize: 24 }} />}
              </Box>

              {/* Label del paso */}
              <Typography
                variant="caption"
                sx={{
                  mt: 1,
                  fontSize: "0.7rem",
                  fontWeight: isActive || isCompleted ? 700 : 500,
                  color: isCompleted
                    ? step.color
                    : isActive
                    ? theme.palette.text.primary
                    : theme.palette.text.secondary,
                }}
              >
                {step.label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Barra de progreso */}
      <Box sx={{ mt: 2 }}>
        <Box
          sx={{
            height: 6,
            borderRadius: 10,
            bgcolor: isDark ? "#1e293b" : "#e2e8f0",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: "100%",
              width: `${(activeStep / (steps.length - 1)) * 100}%`,
              background: `linear-gradient(90deg, ${steps[activeStep].color}, ${steps[activeStep].color}dd)`,
              borderRadius: 10,
              transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </Box>
        <Typography
          variant="caption"
          align="center"
          sx={{
            display: "block",
            mt: 0.5,
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