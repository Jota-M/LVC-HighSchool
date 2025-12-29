"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  Box,
  Typography,
  Button,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardMedia,
  useTheme,
  alpha,
  Fade,
  Slide,
  Stack,
  Chip,
} from "@mui/material";
import {
  Close,
  School,
  HowToReg,
  ArrowForward,
  Star,
  LocalOffer,
  TrendingUp,
} from "@mui/icons-material";
import { keyframes } from "@mui/system";
import { useRouter } from "next/navigation";

// Animaciones
const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const gradientShift = keyframes`
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
`;

interface PromoModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PromoModal({ open, onClose }: PromoModalProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          background: "transparent",
          boxShadow: "none",
        },
      }}
      TransitionComponent={Slide}
      TransitionProps={{ direction: "up" } as any}
    >
      <Box
        sx={{
          position: "relative",
          background: isDark
            ? "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)"
            : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isDark
              ? "radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)"
              : "radial-gradient(circle at 30% 50%, rgba(250, 204, 21, 0.1) 0%, transparent 50%)",
            animation: `${gradientShift} 10s ease infinite`,
            backgroundSize: "200% 200%",
            pointerEvents: "none",
          },
        }}
      >
        {/* Botón de cerrar */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 2,
            background: alpha("#000", 0.5),
            color: "#fff",
            "&:hover": {
              background: alpha("#000", 0.7),
            },
          }}
        >
          <Close />
        </IconButton>

        {/* Header con badge */}
        <Box
          sx={{
            position: "relative",
            textAlign: "center",
            pt: 5,
            pb: 3,
            px: 3,
          }}
        >
          <Chip
            icon={<TrendingUp />}
            label="¡NUEVAS OPORTUNIDADES!"
            sx={{
              mb: 2,
              background: "linear-gradient(135deg, #facc15, #f59e0b)",
              color: "#000",
              fontWeight: 700,
              fontSize: "0.9rem",
              px: 2,
              animation: `${pulse} 2s infinite`,
            }}
          />

          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              mb: 1,
              background: isDark
                ? "linear-gradient(135deg, #fff, #e2e8f0)"
                : "linear-gradient(135deg, #0f172a, #334155)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: { xs: "1.8rem", md: "2.5rem" },
            }}
          >
            ¡No Te Quedes Fuera!
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)",
              mb: 2,
              fontWeight: 400,
            }}
          >
            Aprovecha estas increíbles oportunidades
          </Typography>
        </Box>

        {/* Cards de opciones */}
        <Box sx={{ px: 3, pb: 4 }}>
          <Grid container spacing={3}>
            {/* Card Cursos Vacacionales */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                onClick={() => handleNavigation("/cursos-vacacionales")}
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  overflow: "hidden",
                  cursor: "pointer",
                  border: `2px solid ${isDark ? alpha("#3b82f6", 0.3) : alpha("#0369a1", 0.3)}`,
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: isDark
                      ? "0 20px 40px rgba(59, 130, 246, 0.4)"
                      : "0 20px 40px rgba(3, 105, 161, 0.3)",
                    "& .promo-image": {
                      transform: "scale(1.1)",
                    },
                  },
                }}
              >
                {/* Badge de oferta */}
                <Chip
                  icon={<Star />}
                  label="HOT"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    zIndex: 1,
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    color: "#fff",
                    fontWeight: 700,
                    animation: `${pulse} 1.5s infinite`,
                  }}
                />

                <Box
                  sx={{
                    position: "relative",
                    height: 200,
                    overflow: "hidden",
                    background: "linear-gradient(135deg, #0369a1, #0284c7)",
                  }}
                >
                  <CardMedia
                    component="img"
                    image="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600"
                    alt="Cursos Vacacionales"
                    className="promo-image"
                    sx={{
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.4s",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                      p: 2,
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <School sx={{ color: "#facc15", fontSize: 28 }} />
                      <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700 }}>
                        Cursos Vacacionales
                      </Typography>
                    </Stack>
                  </Box>
                </Box>

                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 2,
                      lineHeight: 1.7,
                      color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.8)",
                    }}
                  >
                    Aprovecha tus vacaciones para aprender algo nuevo. Cursos de matemáticas, inglés,
                    programación y más.
                  </Typography>

                  <Stack spacing={1} sx={{ mb: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#10b981",
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Horarios flexibles
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#10b981",
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Profesores especializados
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#10b981",
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Cupos limitados
                      </Typography>
                    </Stack>
                  </Stack>

                  <Button
                    fullWidth
                    variant="contained"
                    endIcon={<ArrowForward />}
                    sx={{
                      background: "linear-gradient(135deg, #0369a1, #0284c7)",
                      color: "#fff",
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 700,
                      textTransform: "none",
                      fontSize: "1rem",
                      "&:hover": {
                        background: "linear-gradient(135deg, #0284c7, #0369a1)",
                      },
                    }}
                  >
                    Ver Cursos
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Card Preinscripciones */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                onClick={() => handleNavigation("/PreInscripcion")}
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  overflow: "hidden",
                  cursor: "pointer",
                  border: `2px solid ${isDark ? alpha("#10b981", 0.3) : alpha("#059669", 0.3)}`,
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: isDark
                      ? "0 20px 40px rgba(16, 185, 129, 0.4)"
                      : "0 20px 40px rgba(5, 150, 105, 0.3)",
                    "& .promo-image": {
                      transform: "scale(1.1)",
                    },
                  },
                }}
              >
                {/* Badge de oferta */}
                <Chip
                  icon={<LocalOffer />}
                  label="NUEVO"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    zIndex: 1,
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "#fff",
                    fontWeight: 700,
                    animation: `${pulse} 1.5s infinite`,
                  }}
                />

                <Box
                  sx={{
                    position: "relative",
                    height: 200,
                    overflow: "hidden",
                    background: "linear-gradient(135deg, #059669, #10b981)",
                  }}
                >
                  <CardMedia
                    component="img"
                    image="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600"
                    alt="Preinscripciones"
                    className="promo-image"
                    sx={{
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.4s",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                      p: 2,
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <HowToReg sx={{ color: "#facc15", fontSize: 28 }} />
                      <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700 }}>
                        Preinscripciones
                      </Typography>
                    </Stack>
                  </Box>
                </Box>

                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 2,
                      lineHeight: 1.7,
                      color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.8)",
                    }}
                  >
                    Asegura tu cupo para la próxima gestión. Proceso rápido y sencillo desde la comodidad de
                    tu hogar.
                  </Typography>

                  <Stack spacing={1} sx={{ mb: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#3b82f6",
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        100% en línea
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#3b82f6",
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Proceso simplificado
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#3b82f6",
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Confirmación inmediata
                      </Typography>
                    </Stack>
                  </Stack>

                  <Button
                    fullWidth
                    variant="contained"
                    endIcon={<ArrowForward />}
                    sx={{
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      color: "#fff",
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 700,
                      textTransform: "none",
                      fontSize: "1rem",
                      "&:hover": {
                        background: "linear-gradient(135deg, #059669, #047857)",
                      },
                    }}
                  >
                    Pre-inscribirme
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Footer del modal */}
        <Box
          sx={{
            textAlign: "center",
            pb: 3,
            px: 3,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            💡 Haz clic en cualquier opción para más información
          </Typography>
        </Box>
      </Box>
    </Dialog>
  );
}

// Hook personalizado para controlar el modal
export function usePromoModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Verificar si el usuario ya vio el modal hoy
    const lastShown = localStorage.getItem("promoModalLastShown");
    const today = new Date().toDateString();

    if (lastShown !== today) {
      // Mostrar el modal después de 2 segundos
      const timer = setTimeout(() => {
        setOpen(true);
        localStorage.setItem("promoModalLastShown", today);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  return {
    open,
    handleClose: () => setOpen(false),
    handleOpen: () => setOpen(true),
  };
}