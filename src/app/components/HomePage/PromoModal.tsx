"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Button,
  useTheme,
  alpha,
  Fade,
  Backdrop,
} from "@mui/material";
import {
  Close,
  School,
  HowToReg,
  ArrowForward,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import { keyframes } from "@mui/system";
import { useRouter } from "next/navigation";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface PromoModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PromoModal({ open, onClose }: PromoModalProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const slides = [
    {
      id: 1,
      title: "Cursos Vacacionales 2026",
      subtitle: "Aprovecha tus vacaciones",
      description: "Cursos Vacacionales de nivelación en Matemáticas, Física, Inglés y más. Horarios flexibles con profesores expertos.",
      image: "https://img.freepik.com/fotos-premium/nino-feliz-nina-haciendo-deberes-escritorio_474601-8172.jpg?semt=ais_hybrid&w=740&q=80",
      icon: School,
      color: "#3b82f6",
      gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      path: "/cursos-vacacionales",
      features: ["Horarios flexibles", "Profesores expertos", "Cupos limitados"],
      badge: "POPULAR",
    },
    {
      id: 2,
      title: "Preinscripciones Abiertas",
      subtitle: "Gestión 2026",
      description: "Asegura tu cupo para la próxima gestión. Proceso 100% en línea, rápido y seguro. No pierdas esta oportunidad.",
      image: "/Nivels/Primary.jpg",
      icon: HowToReg,
      color: "#10b981",
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      path: "/PreInscripcion",
      features: ["100% en línea", "Proceso rápido", "Confirmación inmediata"],
      badge: "NUEVO",
    },
  ];

  const currentSlideData = slides[currentSlide];
  const Icon = currentSlideData.icon;

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleCTA = () => {
    router.push(currentSlideData.path);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(4px)",
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          overflow: "hidden",
          background: "transparent",
          boxShadow: "none",
          maxHeight: { xs: "100vh", sm: "90vh" },
          margin: { xs: 0, sm: 2 },
        },
      }}
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 400 } as any}
    >
      <Box
        sx={{
          position: "relative",
          background: isDark ? "#1a1a2e" : "#ffffff",
          maxHeight: { xs: "100vh", sm: "90vh" },
          height: { xs: "100vh", sm: "auto" },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          overflowY: { xs: "auto", md: "hidden" },
        }}
      >
        {/* Botón cerrar */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: { xs: 16, sm: 20 },
            right: { xs: 16, sm: 20 },
            zIndex: 10,
            width: 40,
            height: 40,
            background: alpha("#000", 0.4),
            backdropFilter: "blur(10px)",
            color: "#fff",
            transition: "all 0.3s ease",
            "&:hover": {
              background: alpha("#000", 0.6),
              transform: isMobile ? "none" : "rotate(90deg)",
            },
          }}
        >
          <Close />
        </IconButton>

        {/* Imagen - Lado izquierdo */}
        <Box
          sx={{
            position: "relative",
            width: { xs: "100%", md: "45%" },
            height: { xs: "40vh", md: "auto" },
            minHeight: { xs: "40vh", md: "600px" },
            maxHeight: { xs: "40vh", md: "none" },
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {/* Badge */}
          <Box
            sx={{
              position: "absolute",
              top: 20,
              left: 20,
              zIndex: 2,
              px: 2.5,
              py: 1,
              borderRadius: 2,
              background: currentSlideData.gradient,
              color: "#fff",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "1px",
              boxShadow: `0 4px 15px ${alpha(currentSlideData.color, 0.4)}`,
            }}
          >
            {currentSlideData.badge}
          </Box>

          {/* Imagen de fondo */}
          <Box
            component="img"
            src={currentSlideData.image}
            alt={currentSlideData.title}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.5s ease",
            }}
          />

          {/* Overlay gradiente */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "50%",
              background: `linear-gradient(to top, ${alpha("#000", 0.8)}, transparent)`,
            }}
          />

          {/* Indicadores de slides */}
          <Box
            sx={{
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 1,
              zIndex: 2,
            }}
          >
            {slides.map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentSlide(index)}
                sx={{
                  width: currentSlide === index ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: currentSlide === index ? "#fff" : alpha("#fff", 0.4),
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Contenido - Lado derecho */}
        <Box
          sx={{
            width: { xs: "100%", md: "55%" },
            p: { xs: 3, sm: 4, md: 5 },
            display: "flex",
            flexDirection: "column",
            justifyContent: { xs: "flex-start", md: "center" },
            position: "relative",
            overflowY: { xs: "visible", md: "auto" },
            flexGrow: 1,
            minHeight: { xs: "auto", md: 0 },
          }}
        >
          <Box
            key={currentSlide}
            sx={{
              animation: `${fadeIn} 0.5s ease-out`,
            }}
          >
            {/* Icon y Título juntos en mobile */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 2,
              }}
            >
              {/* Icon */}
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: { xs: 48, sm: 56, md: 64 },
                  height: { xs: 48, sm: 56, md: 64 },
                  borderRadius: 3,
                  background: currentSlideData.gradient,
                  flexShrink: 0,
                  boxShadow: `0 8px 24px ${alpha(currentSlideData.color, 0.3)}`,
                }}
              >
                <Icon sx={{ color: "#fff", fontSize: { xs: 24, sm: 28, md: 32 } }} />
              </Box>

              {/* Título */}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: isDark ? "#fff" : "#1a1a2e",
                  fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                {currentSlideData.title}
              </Typography>
            </Box>

            {/* Subtítulo */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: currentSlideData.color,
                fontSize: { xs: "1rem", sm: "1.1rem" },
              }}
            >
              {currentSlideData.subtitle}
            </Typography>

            {/* Descripción */}
            <Typography
              variant="body1"
              sx={{
                mb: 3,
                color: isDark ? alpha("#fff", 0.8) : alpha("#000", 0.7),
                lineHeight: 1.7,
                fontSize: { xs: "0.95rem", sm: "1rem" },
              }}
            >
              {currentSlideData.description}
            </Typography>

            {/* Features */}
            <Box sx={{ mb: 4 }}>
              {currentSlideData.features.map((feature, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: currentSlideData.gradient,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: isDark ? alpha("#fff", 0.9) : alpha("#000", 0.8),
                      fontSize: { xs: "0.9rem", sm: "0.95rem" },
                    }}
                  >
                    {feature}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* CTA Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={handleCTA}
              sx={{
                background: currentSlideData.gradient,
                color: "#fff",
                py: { xs: 1.5, sm: 2 },
                borderRadius: 2.5,
                fontSize: { xs: "1rem", sm: "1.1rem" },
                fontWeight: 700,
                textTransform: "none",
                boxShadow: `0 8px 24px ${alpha(currentSlideData.color, 0.3)}`,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: isMobile ? "none" : "translateY(-2px)",
                  boxShadow: `0 12px 32px ${alpha(currentSlideData.color, 0.4)}`,
                },
                "&:active": {
                  transform: "scale(0.98)",
                },
              }}
            >
              Más información
            </Button>

            {/* Navegación entre slides - Solo visible si hay más de 1 slide */}
            {slides.length > 1 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  mt: 3,
                }}
              >
                <IconButton
                  onClick={handlePrev}
                  sx={{
                    border: `2px solid ${isDark ? alpha("#fff", 0.2) : alpha("#000", 0.1)}`,
                    color: isDark ? "#fff" : "#000",
                    "&:hover": {
                      background: alpha(currentSlideData.color, 0.1),
                      borderColor: currentSlideData.color,
                    },
                  }}
                >
                  <ChevronLeft />
                </IconButton>
                <IconButton
                  onClick={handleNext}
                  sx={{
                    border: `2px solid ${isDark ? alpha("#fff", 0.2) : alpha("#000", 0.1)}`,
                    color: isDark ? "#fff" : "#000",
                    "&:hover": {
                      background: alpha(currentSlideData.color, 0.1),
                      borderColor: currentSlideData.color,
                    },
                  }}
                >
                  <ChevronRight />
                </IconButton>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}

// Hook para controlar el modal
export function usePromoModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasClosedModal = sessionStorage.getItem("promoModalClosed");

    if (!hasClosedModal) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem("promoModalClosed", "true");
  };

  return {
    open,
    handleClose,
    handleOpen: () => setOpen(true),
  };
}