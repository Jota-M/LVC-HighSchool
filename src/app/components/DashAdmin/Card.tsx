import * as React from 'react';
import MuiCard from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { tokens } from '@/app/dashboard/theme';
import Box from '@mui/material/Box';
import { IconButton, LinearProgress, Badge } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp'; // Icono de tendencia
import TrendingDownIcon from '@mui/icons-material/TrendingDown'; // Icono de tendencia bajando
import AccessTimeIcon from '@mui/icons-material/AccessTime'; // Icono de tiempo

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: number;  // Cambio en porcentaje (opcional)
  goal?: number;    // Meta (opcional)
  description?: string;  // Descripción adicional
}

export default function Card({
  title,
  value,
  icon: Icon,
  change = 0,
  goal = 100,
  description = '',
}: CardProps) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const progress = (typeof value === 'number' && goal) ? (value / goal) * 100 : 0;

  return (
    <MuiCard
      sx={{
        background: colors.primary[400],
        borderRadius: '10px',
        boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.2)',
        },
      }}
    >
      <CardContent>
        <Box display="flex" flexDirection="column" justifyContent="space-between">
          <Box display="flex" alignItems="center" mb={2}>
            <Icon
              sx={{
                fontSize: 35,
                mr: 2,
                bgcolor: colors.greenAccent[400],
                borderRadius: '50%',
                p: 1,
                transition: 'transform 0.3s ease, background-color 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  bgcolor: colors.greenAccent[500],
                },
              }}
            />
            <Box>
              <Typography gutterBottom variant="h6" component="div" color={colors.grey[100]} fontWeight="bold">
                {title}
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold" color={colors.grey[100]}>
                {value}
              </Typography>
            </Box>
          </Box>

          {/* Indicador de cambio */}
          <Box display="flex" alignItems="center" mb={1}>
            <Badge
              badgeContent={change >= 0 ? `+${change}%` : `${change}%`}
              color={change >= 0 ? 'success' : 'error'}
              overlap="circular"
              sx={{ mr: 1 }}
            >
              {change >= 0 ? (
                <TrendingUpIcon sx={{ color: colors.greenAccent[400] }} />
              ) : (
                <TrendingDownIcon sx={{ color: colors.redAccent[400] }} />
              )}
            </Badge>
            <Typography variant="body2" color={colors.grey[400]}>
              {change >= 0 ? 'Incremento' : 'Decrecimiento'} en el último período
            </Typography>
          </Box>

          {/* Descripción adicional */}
          {description && (
            <Typography variant="body2" color={colors.grey[300]} mb={2}>
              {description}
            </Typography>
          )}

          {/* Barra de progreso */}
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6,
              borderRadius: 2,
              backgroundColor: colors.grey[700],
              '& .MuiLinearProgress-bar': {
                backgroundColor: colors.greenAccent[400],
              },
            }}
          />
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography variant="caption" color={colors.grey[300]}>
              {Math.round(progress)}% completado
            </Typography>
            <Typography variant="caption" color={colors.grey[300]}>
              Meta: {goal}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </MuiCard>
  );
}
