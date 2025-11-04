"use client";
import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "@/app/dashboard/theme";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { keyframes } from "@mui/system";

interface CardProps {
  icon: React.ElementType;
  title: string;
  value: number;
  change?: number;
  goal?: number;
  description: string;
  colorScheme?: "blue" | "green" | "red" | "purple";
}

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

export default function Card({
  icon: Icon,
  title,
  value,
  change,
  goal,
  description,
  colorScheme = "blue",
}: CardProps) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const colorSchemes = {
    blue: {
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      glow: "rgba(102, 126, 234, 0.4)",
      light: colors.blueAccent[700],
      bg: "rgba(102, 126, 234, 0.1)",
    },
    green: {
      gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
      glow: "rgba(56, 239, 125, 0.4)",
      light: colors.greenAccent[700],
      bg: "rgba(56, 239, 125, 0.1)",
    },
    red: {
      gradient: "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)",
      glow: "rgba(238, 9, 121, 0.4)",
      light: colors.redAccent[700],
      bg: "rgba(238, 9, 121, 0.1)",
    },
    purple: {
      gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      glow: "rgba(168, 237, 234, 0.4)",
      light: "#a855f7",
      bg: "rgba(168, 237, 234, 0.1)",
    },
  };

  const scheme = colorSchemes[colorScheme];
  const progress = goal ? (value / goal) * 100 : 0;

  return (
    <Box
      sx={{
        position: "relative",
        backgroundColor: colors.primary[400],
        borderRadius: "24px",
        p: 3,
        overflow: "hidden",
        border: `2px solid ${colors.primary[300]}`,
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-8px) scale(1.02)",
          boxShadow: `0 20px 40px ${scheme.glow}`,
          border: `2px solid ${scheme.light}`,
          "& .icon-container": {
            transform: "rotate(10deg) scale(1.1)",
            background: scheme.gradient,
          },
          "& .floating-shape": {
            animation: `${float} 3s ease-in-out infinite`,
          },
          "& .shimmer-effect": {
            animation: `${shimmer} 2s infinite`,
          },
        },
      }}
    >
      {/* Formas decorativas de fondo */}
      <Box
        className="floating-shape"
        sx={{
          position: "absolute",
          top: -50,
          right: -50,
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: scheme.gradient,
          opacity: 0.1,
          filter: "blur(40px)",
        }}
      />
      <Box
        className="floating-shape"
        sx={{
          position: "absolute",
          bottom: -30,
          left: -30,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: scheme.gradient,
          opacity: 0.08,
          filter: "blur(30px)",
        }}
      />

      {/* Efecto shimmer */}
      <Box
        className="shimmer-effect"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(90deg, transparent, ${scheme.bg}, transparent)`,
          backgroundSize: "1000px 100%",
          pointerEvents: "none",
        }}
      />

      {/* Header con ícono animado y cambio */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box
          className="icon-container"
          sx={{
            background: scheme.gradient,
            p: 2,
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 8px 24px ${scheme.glow}`,
            transition: "all 0.4s ease",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: -2,
              borderRadius: "18px",
              padding: "2px",
              background: scheme.gradient,
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              opacity: 0.5,
              animation: `${pulse} 2s ease-in-out infinite`,
            },
          }}
        >
          <Icon sx={{ fontSize: 32, color: "#fff" }} />
        </Box>

        {change !== undefined && change !== 0 && (
          <Box
            display="flex"
            alignItems="center"
            gap={0.5}
            sx={{
              background: change > 0 
                ? "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" 
                : "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)",
              color: "#fff",
              px: 1.5,
              py: 0.8,
              borderRadius: "12px",
              fontWeight: 700,
              boxShadow: change > 0
                ? "0 4px 15px rgba(56, 239, 125, 0.4)"
                : "0 4px 15px rgba(238, 9, 121, 0.4)",
              animation: `${pulse} 2s ease-in-out infinite`,
            }}
          >
            {change > 0 ? (
              <TrendingUpIcon sx={{ fontSize: 18 }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: 18 }} />
            )}
            <Typography variant="body2" fontWeight={700}>
              {Math.abs(change)}%
            </Typography>
          </Box>
        )}
      </Box>

      {/* Contenido con animación */}
      <Box mb={3} sx={{ position: "relative", zIndex: 1 }}>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            mb: 1.5,
            fontSize: "0.75rem",
          }}
        >
          {title}
        </Typography>
        <Typography 
          variant="h2" 
          fontWeight={800} 
          mb={1}
          sx={{
            background: scheme.gradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {value}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: "text.secondary",
            display: "block",
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>
      </Box>

      {/* Barra de progreso mejorada */}
      {goal && (
        <Box>
          <Box display="flex" justifyContent="space-between" mb={1.5}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: "text.secondary",
                fontWeight: 600,
                textTransform: "uppercase",
                fontSize: "0.7rem",
                letterSpacing: 1,
              }}
            >
              Progreso del objetivo
            </Typography>
            <Typography 
              variant="caption" 
              fontWeight={700}
              sx={{
                background: scheme.gradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {progress.toFixed(0)}%
            </Typography>
          </Box>
          <Box
            sx={{
              position: "relative",
              height: 8,
              borderRadius: 10,
              backgroundColor: theme.palette.mode === "dark" 
                ? "rgba(255,255,255,0.1)" 
                : "rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                width: `${Math.min(progress, 100)}%`,
                background: scheme.gradient,
                borderRadius: 10,
                transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: `0 0 20px ${scheme.glow}`,
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                  animation: `${shimmer} 2s infinite`,
                },
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}