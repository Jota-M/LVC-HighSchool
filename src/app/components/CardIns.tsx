'use client';
import '@fontsource/roboto';
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  useTheme,
  Box,
  Chip,
} from '@mui/material';
import { keyframes } from '@mui/system';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

interface CardInsProps {
  icon: React.JSX.Element;
  icon2: React.JSX.Element;
  title: string;
  paragraph: string;
  color: string;
  backgroundcolor: string;
}

// Animaciones personalizadas
const fadeInUp = keyframes`
  0% { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const scaleIn = keyframes`
  0% { opacity: 0; transform: scale(0.7); }
  100% { opacity: 1; transform: scale(1); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
`;

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px currentColor; }
  50% { box-shadow: 0 0 40px currentColor; }
`;

const slideDown = keyframes`
  0% { opacity: 0; transform: translateY(-20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

function CardIns({ icon, icon2, title, paragraph, color, backgroundcolor }: CardInsProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      elevation={0}
      sx={{
        maxWidth: { xs: 280, sm: 400, md: 280 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: isDarkMode 
          ? 'rgba(255,255,255,0.03)' 
          : theme.palette.background.paper,
        border: `2px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
        borderRadius: 4,
        backdropFilter: 'blur(10px)',
        opacity: isVisible ? 1 : 0,
        animation: `${fadeInUp} 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        '&:hover': {
          transform: 'translateY(-12px) scale(1.03)',
          borderColor: color,
          boxShadow: `0 20px 50px ${color}40`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 5,
          background: `linear-gradient(90deg, ${color}, ${backgroundcolor}, ${color})`,
          backgroundSize: '200% 100%',
          animation: isHovered ? `${shimmer} 2s linear infinite` : 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: `linear-gradient(90deg, transparent, ${color}10, transparent)`,
          transition: 'left 0.6s ease',
          pointerEvents: 'none',
        },
        '&:hover::after': {
          left: '100%',
        },
      }}
    >
      {/* Decoración de fondo */}
      <Box
        sx={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}15, transparent)`,
          opacity: isHovered ? 1 : 0.5,
          transition: 'all 0.5s ease',
          animation: isHovered ? `${pulse} 3s ease-in-out infinite` : 'none',
        }}
      />

      {/* Badge superior */}
      {isHovered && (
        <Chip
          icon={<AutoAwesomeIcon sx={{ fontSize: '0.9rem' }} />}
          label="Paso recomendado"
          size="small"
          sx={{
            position: 'absolute',
            top: 15,
            right: 15,
            background: `${color}20`,
            color: color,
            border: `1px solid ${color}40`,
            fontWeight: 'bold',
            fontSize: '0.7rem',
            animation: `${slideDown} 0.4s ease forwards`,
            zIndex: 2,
            '& .MuiChip-icon': {
              color: color,
            },
          }}
        />
      )}

      {/* Contenedor de iconos */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 4,
          mb: 2,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Icono principal grande */}
        <Box
          sx={{
            position: 'relative',
            mb: 2,
            animation: isHovered ? `${float} 3s ease-in-out infinite` : 'none',
          }}
        >
          {/* Anillo exterior pulsante */}
          <Box
            sx={{
              position: 'absolute',
              inset: -12,
              borderRadius: '50%',
              border: `3px solid ${color}`,
              opacity: isHovered ? 0.6 : 0,
              animation: isHovered ? `${pulse} 2s ease-in-out infinite` : 'none',
              transition: 'opacity 0.3s ease',
            }}
          />

          {/* Segundo anillo */}
          <Box
            sx={{
              position: 'absolute',
              inset: -18,
              borderRadius: '50%',
              border: `2px solid ${color}`,
              opacity: isHovered ? 0.3 : 0,
              animation: isHovered ? `${pulse} 2s ease-in-out infinite 0.5s` : 'none',
              transition: 'opacity 0.3s ease',
            }}
          />

          {React.cloneElement(icon, {
            sx: {
              fontSize: { xs: 70, md: 80 },
              color: color,
              filter: `drop-shadow(0 4px 12px ${color}60)`,
              transition: 'all 0.5s ease',
              animation: isVisible ? `${scaleIn} 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards 0.2s` : 'none',
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            },
          })}
        </Box>

        {/* Icono secundario en badge */}
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Círculo de fondo con gradiente */}
          <Box
            sx={{
              position: 'absolute',
              inset: -6,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${color}, ${backgroundcolor})`,
              opacity: 0.2,
              animation: isHovered ? `${pulse} 2s ease-in-out infinite` : 'none',
            }}
          />

          <Box
            sx={{
              background: isDarkMode 
                ? `linear-gradient(135deg, ${color}20, ${backgroundcolor}20)` 
                : `linear-gradient(135deg, ${backgroundcolor}, ${color}10)`,
              border: `2px solid ${color}`,
              borderRadius: 3,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 25px ${color}40`,
              position: 'relative',
              transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              animation: isVisible ? `${scaleIn} 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards 0.4s` : 'none',
              '&:hover': {
                transform: 'rotate(360deg) scale(1.15)',
                boxShadow: `0 12px 35px ${color}60`,
              },
            }}
          >
            {/* Brillo interno */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                borderRadius: 3,
                background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent)',
                opacity: isHovered ? 1 : 0.5,
                transition: 'opacity 0.3s ease',
              }}
            />

            {React.cloneElement(icon2, {
              sx: {
                fontSize: { xs: 35, md: 40 },
                color: color,
                position: 'relative',
                zIndex: 1,
                filter: `drop-shadow(0 2px 6px ${color}40)`,
              },
            })}
          </Box>

          {/* Punto brillante */}
          <Box
            sx={{
              position: 'absolute',
              top: -3,
              right: -3,
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: color,
              opacity: isHovered ? 1 : 0,
              animation: isHovered ? `${glow} 2s ease-in-out infinite` : 'none',
              boxShadow: `0 0 15px ${color}`,
            }}
          />
        </Box>
      </Box>

      {/* Contenido de texto */}
      <CardContent sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
        {/* Título */}
        <Typography
          variant="h5"
          component="div"
          sx={{
            fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.4rem' },
            fontWeight: 'bold',
            color: isDarkMode ? '#fff' : theme.palette.text.primary,
            mb: 2,
            lineHeight: 1.3,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: isHovered ? '80%' : '40%',
              height: 3,
              borderRadius: 2,
              background: `linear-gradient(90deg, ${color}, ${backgroundcolor})`,
              transition: 'width 0.4s ease',
            },
          }}
        >
          {title}
        </Typography>

        {/* Párrafo */}
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            fontFamily: 'Roboto',
            fontSize: { xs: '0.9rem', md: '0.95rem' },
            lineHeight: 1.7,
            mt: 2,
            px: 1,
          }}
        >
          {paragraph}
        </Typography>
      </CardContent>

      {/* Contador decorativo en la esquina */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 15,
          right: 15,
          width: 35,
          height: 35,
          borderRadius: '50%',
          border: `2px solid ${color}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `${color}10`,
          opacity: isHovered ? 1 : 0.5,
          transition: 'all 0.3s ease',
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: color,
            animation: isHovered ? `${pulse} 1.5s ease-in-out infinite` : 'none',
          }}
        />
      </Box>
    </Card>
  );
}

export default CardIns;