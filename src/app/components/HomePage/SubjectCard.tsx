'use client';

import { Box, Typography, useTheme, Paper } from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import { useEffect, useState } from 'react';

interface SubjectCardProps {
  Materia: string;
  Horas: string;
  temas: string[];
  color: string; // 👈 Color único para borde, icono y puntos
  Icono?: React.ElementType; // 👈 Icono opcional como prop
}

export default function SubjectCard({
  Materia,
  Horas,
  temas,
  color,
  Icono = CalculateIcon, // 👈 Icono por defecto
}: SubjectCardProps) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const IconComponent = Icono;

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '1rem',
        p: 3,
        mb: 3,
        backgroundColor: theme.palette.background.paper,
        transition: 'all 0.4s ease',
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        opacity: visible ? 1 : 0,
        '&:hover': {
          boxShadow: `0 6px 20px ${color}55`,
          transform: 'translateY(-3px)',
        },
      }}
    >
      {/* Franja lateral izquierda sobresalida */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '10px',
          bgcolor: color,
          borderTopLeftRadius: '1rem',
          borderBottomLeftRadius: '1rem',
        }}
      />

      {/* Encabezado */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        {/* Ícono */}
        <Box
          sx={{
            backgroundColor: color,
            color: '#fff',
            width: 60,
            height: 60,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 10px ${color}60`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'rotate(10deg) scale(1.1)',
              boxShadow: `0 0 15px ${color}80`,
            },
          }}
        >
          <IconComponent sx={{ fontSize: '2rem' }} />
        </Box>

        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
            {Materia}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Horas}
          </Typography>
        </Box>
      </Box>

      {/* Subtítulo */}
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
        Temas principales
      </Typography>

      {/* Lista de temas dinámica */}
      <Box component="ul" sx={{ pl: 3, m: 0, listStyle: 'none' }}>
        {temas.map((tema, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 0.8,
              opacity: 0,
              animation: `fadeIn 0.5s ease forwards`,
              animationDelay: `${index * 0.15 + 0.2}s`,
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateX(-10px)' },
                to: { opacity: 1, transform: 'translateX(0)' },
              },
            }}
          >
            {/* Círculo vacío del mismo color que el icono */}
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                border: `2px solid ${color}`,
                mr: 1.5,
              }}
            />
            <Typography variant="body2">{tema}</Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
