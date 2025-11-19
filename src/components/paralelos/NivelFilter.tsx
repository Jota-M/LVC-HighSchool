// components/NivelFilter.tsx
import React from 'react';
import { Card, CardContent, Box, Typography, Chip, alpha, useTheme } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Nivel } from '../../services/paraleloService';
import { getNivelColor, getNivelIcon } from '../../utils/paraleloHelpers';

interface NivelFilterProps {
  niveles: Nivel[];
  selectedNivel: number | null;
  onSelectNivel: (id: number | null) => void;
}

export const NivelFilter: React.FC<NivelFilterProps> = ({ niveles, selectedNivel, onSelectNivel }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        background: alpha(theme.palette.primary.main, 0.03)
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <FilterListIcon color="primary" />
          <Typography variant="body1" fontWeight="600">
            Filtrar por Nivel:
          </Typography>
          <Chip
            label="Todos"
            onClick={() => onSelectNivel(null)}
            color={selectedNivel === null ? 'primary' : 'default'}
            sx={{
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'scale(1.1)' }
            }}
          />
          {niveles.map((nivel) => {
            const color = getNivelColor(nivel.orden);
            const icon = getNivelIcon(nivel.orden);
            return (
              <Chip
                key={nivel.id}
                icon={<span>{icon}</span>}
                label={nivel.nombre}
                onClick={() => onSelectNivel(nivel.id)}
                sx={{
                  bgcolor: selectedNivel === nivel.id ? color : alpha(color, 0.1),
                  color: selectedNivel === nivel.id ? 'white' : color,
                  fontWeight: 'bold',
                  border: `2px solid ${color}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: color,
                    color: 'white',
                    transform: 'scale(1.1)'
                  }
                }}
              />
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};