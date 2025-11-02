// Card.tsx - Componente mejorado
'use client';
import * as React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  CardActionArea,
  useTheme,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CallMadeIcon from '@mui/icons-material/CallMade';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { keyframes } from '@mui/system';

interface MediaCardProps {
  title: string;
  paragraph: string;
  imageurl: string;
  init: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  link: string;
}

// Animaciones mejoradas
const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(15px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const shine = keyframes`
  0% { left: -100%; }
  100% { left: 200%; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;


export default function MediaCard({
  title,
  paragraph,
  imageurl,
  init,
  paragraph1,
  paragraph2,
  paragraph3,
  link,
}: MediaCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        width: "100%",
        borderRadius: 4,
        position: "relative",
        overflow: "hidden",
        boxShadow: isHovered
          ? "0 20px 60px rgba(1, 87, 155, 0.35)"
          : "0 10px 30px rgba(0, 0, 0, 0.12)",
        transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: isHovered ? "translateY(-5px)" : "translateY(0)",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: -2,
          borderRadius: 4,
          padding: 2,
          background: "linear-gradient(45deg, #01579b, #0288d1, #facc15, #01579b)",
          backgroundSize: "300% 300%",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          opacity: isHovered ? 1 : 0,
          animation: isHovered ? `${gradientShift} 3s ease infinite` : "none",
          transition: "opacity 0.5s ease",
          zIndex: -1,
        },
      }}
    >
      <CardActionArea href={link}>
        {/* Imagen con efectos mejorados */}
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            height: { xs: 180, sm: 200, md: 220, lg: 240 },
          }}
        >
          <CardMedia
            sx={{
              height: "100%",
              transition: "transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
              transform: isHovered ? "scale(1.15) rotate(2deg)" : "scale(1) rotate(0deg)",
            }}
            image={imageurl}
            title={title}
          />

          {/* Overlay gradiente mejorado */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)",
              opacity: isHovered ? 1 : 0.6,
              transition: "opacity 0.5s ease",
            }}
          />
          
          {/* Efecto de brillo al hover */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: "-100%",
              width: "100%",
              height: "100%",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              animation: isHovered ? `${shine} 1.5s ease` : "none",
              pointerEvents: "none",
            }}
          />
        </Box>

        <CardContent sx={{ p: 3 }}>
          {/* Header con título e icono */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={1.5}
            sx={{ animation: `${fadeIn} 0.6s ease forwards` }}
          >
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontSize: { xs: "1.2rem", md: "1.4rem" },
                fontWeight: "bold",
                color: isDark ? "#ffd54f" : "#01579b",
                flex: 1,
                lineHeight: 1.3,
              }}
            >
              {title}
            </Typography>
            <Box
            sx={{
              position: "absolute",
              bottom: -10,
              right: 5,
              width: 50,
              height: 50,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #facc15, #ffd54f)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(250, 204, 21, 0.5)",
              transform: isHovered ? "scale(1.2) rotate(45deg)" : "scale(1) rotate(0deg)",
              transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <TrendingUpIcon
              sx={{
                color: "#01579b",
                fontSize: "1.5rem",
                transform: isHovered ? "rotate(-45deg)" : "rotate(0deg)",
                transition: "transform 0.4s ease",
              }}
            />
          </Box>
          </Box>

          {/* Descripción */}
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontSize: "0.9rem",
              lineHeight: 1.6,
              mb: 2,
              animation: `${fadeIn} 0.8s ease forwards`,
            }}
          >
            {paragraph}
          </Typography>

          {/* Lista de características mejorada */}
          <Box sx={{ mt: 2 }}>
            {[paragraph1, paragraph2, paragraph3].map((text, index) => (
              <Box
                key={index}
                display="flex"
                alignItems="center"
                mb={1.2}
                sx={{
                  animation: `${fadeIn} ${0.8 + index * 0.15}s ease forwards`,
                  opacity: 0,
                  animationFillMode: "forwards",
                  "&:hover": {
                    transform: "translateX(5px)",
                  },
                  transition: "transform 0.3s ease",
                }}
              >
                <Box
                  sx={{
                    minWidth: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #01579b, #0288d1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 1.5,
                    boxShadow: "0 2px 8px rgba(1, 87, 155, 0.3)",
                    animation: isHovered ? `${pulse} 2s ease-in-out infinite ${index * 0.2}s` : "none",
                  }}
                >
                  <CheckCircleIcon
                    sx={{
                      fontSize: "0.9rem",
                      color: "#fff",
                    }}
                  />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "0.85rem",
                    color: "text.secondary",
                    fontWeight: 500,
                  }}
                >
                  {text}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Borde inferior decorativo */}
          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: "2px solid",
              borderImage: "linear-gradient(90deg, transparent, #01579b, #facc15, transparent) 1",
              opacity: isHovered ? 1 : 0,
              transition: "opacity 0.5s ease",
            }}
          />
        </CardContent>
      </CardActionArea>
    </Card>
  );
}