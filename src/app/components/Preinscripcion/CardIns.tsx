'use client';

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Tooltip,
  useTheme,
} from "@mui/material";
import { keyframes } from "@mui/system";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupsIcon from '@mui/icons-material/Groups';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

type Props = {
  title: string;
  edad: string;
  total: number;
  disponibles: number;
  color?: string;
  icon?: React.ReactNode;
};

// Animaciones personalizadas
const fadeInScale = keyframes`
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const slideInRight = keyframes`
  0% { opacity: 0; transform: translateX(-20px); }
  100% { opacity: 1; transform: translateX(0); }
`;

const progressFill = keyframes`
  0% { width: 0%; }
  100% { width: var(--target-width); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 15px currentColor; }
  50% { box-shadow: 0 0 30px currentColor; }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const CardIns: React.FC<Props> = ({
  title,
  edad,
  total,
  disponibles,
  color = "#1976d2",
  icon,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [isHovered, setIsHovered] = useState(false);
  const [porcentajeAnimado, setPorcentajeAnimado] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const porcentajeFinal = ((total - disponibles) / total) * 100;
  const ocupados = total - disponibles;
  const cupoCritico = disponibles <= 5;
  const cupoMuyLleno = porcentajeFinal > 80;

  useEffect(() => {
    setIsVisible(true);
    const timeout = setTimeout(() => {
      setPorcentajeAnimado(porcentajeFinal);
    }, 500);
    return () => clearTimeout(timeout);
  }, [porcentajeFinal]);

  const getStatusColor = () => {
    if (porcentajeFinal > 80) return "#f44336"; // Rojo
    if (porcentajeFinal > 60) return "#ff9800"; // Naranja
    return "#4caf50"; // Verde
  };

  const getStatusText = () => {
    if (cupoCritico) return "¡Últimos cupos!";
    if (cupoMuyLleno) return "Casi lleno";
    if (porcentajeFinal > 50) return "Disponible";
    return "Alta disponibilidad";
  };

  const statusColor = getStatusColor();

  return (
    <Paper
      elevation={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        p: 3,
        width: "100%",
        borderRadius: 4,
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
        position: "relative",
        overflow: "hidden",
        border: `2px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
        backdropFilter: "blur(10px)",
        opacity: isVisible ? 1 : 0,
        animation: `${fadeInScale} 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
        transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "&:hover": {
          transform: "translateY(-10px) scale(1.02)",
          borderColor: color,
          boxShadow: `0 20px 50px ${color}40`,
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 5,
          background: `linear-gradient(90deg, ${color}, ${statusColor})`,
          backgroundSize: "200% 100%",
          animation: isHovered ? `${shimmer} 2s linear infinite` : "none",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "100%",
          height: "100%",
          background: `linear-gradient(90deg, transparent, ${color}10, transparent)`,
          transition: "left 0.6s ease",
          pointerEvents: "none",
        },
        "&:hover::after": {
          left: "100%",
        },
      }}
    >
      {/* Decoración de fondo */}
      <Box
        sx={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}15, transparent)`,
          opacity: isHovered ? 1 : 0.5,
          transition: "all 0.5s ease",
          animation: isHovered ? `${pulse} 3s ease-in-out infinite` : "none",
        }}
      />

      {/* Header con icono y título */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
          {/* Icono circular */}
          <Box
            sx={{
              position: "relative",
              minWidth: 55,
              height: 55,
            }}
          >
            {/* Anillo pulsante */}
            <Box
              sx={{
                position: "absolute",
                inset: -4,
                borderRadius: "50%",
                border: `2px solid ${color}`,
                opacity: isHovered ? 0.6 : 0,
                animation: isHovered ? `${pulse} 2s ease-in-out infinite` : "none",
                transition: "opacity 0.3s ease",
              }}
            />

            <Box
              sx={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${color}, ${statusColor})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 4px 20px ${color}50`,
                color: "#fff",
                fontSize: "1.5rem",
                transition: "all 0.4s ease",
                animation: isHovered ? `${float} 2s ease-in-out infinite` : "none",
              }}
            >
              {icon}
            </Box>
          </Box>

          {/* Título y edad */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                fontSize: "1rem",
                lineHeight: 1.2,
                mb: 0.5,
                color: isDark ? "#fff" : "text.primary",
              }}
            >
              {title}
            </Typography>
            <Chip
              label={edad}
              size="small"
              icon={<EventAvailableIcon sx={{ fontSize: "0.9rem" }} />}
              sx={{
                height: 22,
                fontSize: "0.75rem",
                fontWeight: 600,
                background: `${color}15`,
                color: color,
                border: `1px solid ${color}30`,
                "& .MuiChip-icon": {
                  color: color,
                },
              }}
            />
          </Box>
        </Box>

        {/* Badge de estado */}
        <Chip
          label={getStatusText()}
          size="small"
          icon={
            cupoCritico ? (
              <WarningAmberIcon sx={{ fontSize: "1rem" }} />
            ) : cupoMuyLleno ? (
              <TrendingUpIcon sx={{ fontSize: "1rem" }} />
            ) : (
              <CheckCircleIcon sx={{ fontSize: "1rem" }} />
            )
          }
          sx={{
            fontWeight: "bold",
            fontSize: "0.7rem",
            px: 1,
            background: `${statusColor}20`,
            color: statusColor,
            border: `1px solid ${statusColor}40`,
            animation: cupoCritico ? `${pulse} 2s ease-in-out infinite` : "none",
            "& .MuiChip-icon": {
              color: statusColor,
            },
          }}
        />
      </Box>

      {/* Divider decorativo */}
      <Box
        sx={{
          width: "100%",
          height: 2,
          background: `linear-gradient(90deg, ${color}, transparent)`,
          borderRadius: 1,
        }}
      />

      {/* Información de cupos */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Cupos totales */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.5,
            borderRadius: 2,
            background: isDark ? `${color}08` : `${color}05`,
            border: `1px solid ${color}20`,
            opacity: 0,
            animation: `${slideInRight} 0.5s ease forwards 0.3s`,
            transition: "all 0.3s ease",
            "&:hover": {
              background: isDark ? `${color}15` : `${color}10`,
              transform: "translateX(5px)",
            },
          }}
        >
          <Box
            sx={{
              minWidth: 36,
              height: 36,
              borderRadius: "50%",
              background: `${color}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: color,
            }}
          >
            <GroupsIcon sx={{ fontSize: "1.2rem" }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
              Cupos totales
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: color, lineHeight: 1 }}>
              {total} niños
            </Typography>
          </Box>
        </Box>

        {/* Disponibles y ocupados */}
        <Box sx={{ display: "flex", gap: 1.5 }}>
          {/* Disponibles */}
          <Box
            sx={{
              flex: 1,
              p: 1.5,
              borderRadius: 2,
              background: isDark ? `${statusColor}08` : `${statusColor}05`,
              border: `1px solid ${statusColor}20`,
              opacity: 0,
              animation: `${slideInRight} 0.5s ease forwards 0.4s`,
              transition: "all 0.3s ease",
              "&:hover": {
                background: isDark ? `${statusColor}15` : `${statusColor}10`,
              },
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
              Disponibles
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: statusColor,
                lineHeight: 1.2,
                animation: cupoCritico ? `${bounce} 1s ease-in-out infinite` : "none",
              }}
            >
              {disponibles}
            </Typography>
          </Box>

          {/* Ocupados */}
          <Box
            sx={{
              flex: 1,
              p: 1.5,
              borderRadius: 2,
              background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
              border: "1px solid rgba(0,0,0,0.1)",
              opacity: 0,
              animation: `${slideInRight} 0.5s ease forwards 0.5s`,
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
              Ocupados
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "text.secondary",
                lineHeight: 1.2,
              }}
            >
              {ocupados}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Barra de progreso mejorada */}
      <Tooltip
        title={`${porcentajeFinal.toFixed(0)}% de los cupos están ocupados`}
        arrow
        placement="top"
      >
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            opacity: 0,
            animation: `${slideInRight} 0.5s ease forwards 0.6s`,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              Nivel de ocupación
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: "bold",
                color: statusColor,
                fontSize: "0.8rem",
              }}
            >
              {porcentajeFinal.toFixed(0)}%
            </Typography>
          </Box>

          <Box
            sx={{
              position: "relative",
              height: 10,
              borderRadius: 5,
              overflow: "hidden",
              background: isDark ? "rgba(255,255,255,0.1)" : "#e0e0e0",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                width: `${porcentajeAnimado}%`,
                background: `linear-gradient(90deg, ${color}, ${statusColor})`,
                borderRadius: 5,
                transition: "width 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
                boxShadow: cupoCritico ? `0 0 15px ${statusColor}` : "none",
                animation: cupoCritico ? `${glow} 2s ease-in-out infinite` : "none",
              }}
            />
          </Box>
        </Box>
      </Tooltip>

      {/* Botón CTA mejorado */}
      <Button
        variant="contained"
        fullWidth
        endIcon={<ArrowForwardIcon />}
        href="/PreInscripcion/registro"
        sx={{
          fontWeight: "bold",
          textTransform: "none",
          fontSize: "1rem",
          py: 1.5,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${color}, ${statusColor})`,
          boxShadow: `0 4px 20px ${color}40`,
          position: "relative",
          overflow: "hidden",
          opacity: 0,
          animation: `${slideInRight} 0.5s ease forwards 0.7s`,
          transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: "-100%",
            width: "100%",
            height: "100%",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
            transition: "left 0.5s ease",
          },
          "&:hover": {
            transform: "translateY(-3px) scale(1.02)",
            boxShadow: `0 8px 30px ${color}60`,
            "&::before": {
              left: "100%",
            },
          },
        }}
      >
        {cupoCritico ? "¡Reserva ahora!" : "Aplicar ahora"}
      </Button>

      {/* Contador decorativo */}
      {cupoCritico && (
        <Box
          sx={{
            position: "absolute",
            bottom: 15,
            left: 15,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            background: `${statusColor}20`,
            border: `1px solid ${statusColor}40`,
            animation: `${pulse} 2s ease-in-out infinite`,
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: statusColor,
              animation: `${glow} 1.5s ease-in-out infinite`,
            }}
          />
          <Typography
            variant="caption"
            sx={{
              fontWeight: "bold",
              fontSize: "0.7rem",
              color: statusColor,
            }}
          >
            Urgente
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default CardIns;