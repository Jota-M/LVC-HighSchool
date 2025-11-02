'use client';

import { Box, Typography, useTheme, Paper, Chip } from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useEffect, useState } from 'react';
import { keyframes } from '@mui/system';

interface SubjectCardProps {
  Materia: string;
  Horas: string;
  temas: string[];
  color: string;
  Icono?: React.ElementType;
}

// Animaciones personalizadas
const fadeInUp = keyframes`
  0% { opacity: 0; transform: translateY(30px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const slideInLeft = keyframes`
  0% { opacity: 0; transform: translateX(-20px); }
  100% { opacity: 1; transform: translateX(0); }
`;

const scaleIn = keyframes`
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
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
  0%, 100% { box-shadow: 0 0 15px currentColor; }
  50% { box-shadow: 0 0 25px currentColor; }
`;

export default function SubjectCard({
  Materia,
  Horas,
  temas,
  color,
  Icono = CalculateIcon,
}: SubjectCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [visible, setVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const IconComponent = Icono;

  return (
    <Paper
      elevation={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: isDark 
          ? 'rgba(255,255,255,0.05)' 
          : theme.palette.background.paper,
        border: `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
        backdropFilter: 'blur(10px)',
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        opacity: visible ? 1 : 0,
        animation: `${fadeInUp} 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
        '&:hover': {
          borderColor: color,
          boxShadow: `0 15px 40px ${color}40`,
          transform: 'translateY(-10px) scale(1.02)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: `linear-gradient(90deg, transparent, ${color}15, transparent)`,
          transition: 'left 0.6s ease',
          pointerEvents: 'none',
        },
        '&:hover::before': {
          left: '100%',
        },
      }}
    >
      {/* Borde superior animado con gradiente */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${color}, ${color}80, ${color})`,
          backgroundSize: '200% 100%',
          animation: isHovered ? `${shimmer} 2s linear infinite` : 'none',
        }}
      />

      {/* Decoración de fondo */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}15, transparent)`,
          opacity: isHovered ? 1 : 0.5,
          transition: 'all 0.5s ease',
          animation: isHovered ? `${pulse} 3s ease-in-out infinite` : 'none',
        }}
      />

      {/* Header con icono mejorado */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3, position: 'relative', zIndex: 1 }}>
        {/* Contenedor del icono con efectos */}
        <Box
          sx={{
            position: 'relative',
            minWidth: 50,
            height: 50,
          }}
        >
          {/* Anillo exterior pulsante */}
          <Box
            sx={{
              position: 'absolute',
              inset: -5,
              borderRadius: '50%',
              border: `2px solid ${color}`,
              opacity: isHovered ? 0.6 : 0,
              animation: isHovered ? `${pulse} 2s ease-in-out infinite` : 'none',
              transition: 'opacity 0.3s ease',
            }}
          />
          
          {/* Icono principal */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, ${color}, ${color}dd)`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 20px ${color}50`,
              transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              '&:hover': {
                transform: 'rotate(360deg) scale(1.1)',
                boxShadow: `0 12px 30px ${color}70`,
              },
            }}
          >
            <IconComponent sx={{ fontSize: '2rem', color: '#fff' }} />
          </Box>

          {/* Badge de cantidad de temas */}
          {/* <Chip
            label={temas.length}
            size="small"
            sx={{
              position: 'absolute',
              bottom: -5,
              right: -5,
              minWidth: 28,
              height: 28,
              fontSize: '0.75rem',
              fontWeight: 'bold',
              background: isDark ? '#fff' : color,
              color: isDark ? color : '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              animation: isHovered ? `${scaleIn} 0.5s ease forwards` : 'none',
            }}
          /> */}
        </Box>

        {/* Información del header */}
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: '1.1rem', md: '1.2rem' },
              lineHeight: 1.3,
              mb: 0.5,
              color: isDark ? '#fff' : 'text.primary',
              transition: 'color 0.3s ease',
              '&:hover': {
                color: color,
              },
            }}
          >
            {Materia}
          </Typography>
          
          {/* Chip de horas mejorado */}
          <Chip
            icon={<AccessTimeIcon sx={{ fontSize: '1rem' }} />}
            label={Horas}
            size="small"
            variant="outlined"
            sx={{
              borderColor: `${color}60`,
              color: color,
              fontWeight: 600,
              fontSize: '0.8rem',
              '& .MuiChip-icon': {
                color: color,
              },
              transition: 'all 0.3s ease',
              '&:hover': {
                background: `${color}15`,
                borderColor: color,
              },
            }}
          />
        </Box>
      </Box>

      {/* Divisor decorativo */}
      <Box
        sx={{
          width: '100%',
          height: 2,
          background: `linear-gradient(90deg, ${color}, transparent)`,
          mb: 2,
          borderRadius: 1,
        }}
      />

      {/* Subtítulo con icono */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <CheckCircleOutlineIcon
          sx={{
            fontSize: '1.2rem',
            color: color,
            animation: isHovered ? `${rotate} 2s linear infinite` : 'none',
          }}
        />
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 'bold',
            fontSize: '0.95rem',
            color: isDark ? '#ddd' : 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          Temas principales
        </Typography>
      </Box>

      {/* Lista de temas mejorada */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {temas.map((tema, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              opacity: 0,
              animation: `${slideInLeft} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
              animationDelay: `${index * 0.1 + 0.2}s`,
              p: 1,
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                background: `${color}10`,
                transform: 'translateX(5px)',
              },
            }}
          >
            {/* Indicador de tema mejorado */}
            <Box
              sx={{
                position: 'relative',
                minWidth: 12,
                height: 12,
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: `2px solid ${color}`,
                  background: 'transparent',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: color,
                    transform: 'scale(1.2)',
                  },
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: `2px solid ${color}`,
                  opacity: 0,
                  animation: isHovered ? `${pulse} 2s ease-in-out infinite ${index * 0.2}s` : 'none',
                }}
              />
            </Box>

            <Typography
              variant="body2"
              sx={{
                fontSize: '0.9rem',
                lineHeight: 1.5,
                color: isDark ? '#ccc' : 'text.secondary',
                flex: 1,
              }}
            >
              {tema}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Footer decorativo con estadística */}
      <Box
        sx={{
          mt: 3,
          pt: 2,
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: isHovered ? 1 : 0.7,
          transition: 'opacity 0.3s ease',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontSize: '0.75rem',
            fontWeight: 500,
          }}
        >
          {temas.length} temas cubiertos
        </Typography>
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: color,
            animation: isHovered ? `${glow} 2s ease-in-out infinite` : 'none',
          }}
        />
      </Box>
    </Paper>
  );
}