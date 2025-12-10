// src/app/dashboard/preinscripciones/components/PreinscripcionCard.tsx

import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Box,
  Stack,
  Avatar,
  Badge,
  Typography,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Zoom,
  useTheme,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { Preinscripcion } from '../../types/preinscripcioonTypes';
import { getEstadoConfig, getGradoLabel, getIniciales, formatearFecha } from '../../utils/preinscripcionUtils';

interface PreinscripcionCardProps {
  preinscripcion: Preinscripcion;
  onRevisar: (id: number) => void;
  onEliminar: (id: number) => void;
}

export const PreinscripcionCard: React.FC<PreinscripcionCardProps> = ({ 
  preinscripcion, 
  onRevisar, 
  onEliminar 
}) => {
  const theme = useTheme();
  const config = getEstadoConfig(preinscripcion.estado);
  const iniciales = getIniciales(preinscripcion.estudiante_nombre);
  
  return (
    <Zoom in timeout={500}>
      <Card
        sx={{
          borderRadius: 4,
          p: 0,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '2px solid transparent',
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)'
            : '#fff',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 20px 40px ${config.color}30`,
            border: `2px solid ${config.color}40`,
          }
        }}
      >
        <Box sx={{ 
          height: 8, 
          background: `linear-gradient(90deg, ${config.color}, ${config.color}80)`,
        }} />
        
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Avatar sx={{ width: 20, height: 20, bgcolor: config.color }}>
                    {React.cloneElement(config.icon as React.ReactElement<any>, {
                        sx: { fontSize: 14 },
                    })}
                </Avatar>

              }
            >
              <Avatar 
                src={preinscripcion.estudiante_foto}
                sx={{ 
                  width: 45, 
                  height: 45,
                  border: `3px solid ${config.color}40`,
                  bgcolor: config.color,
                  fontSize: '1.5rem',
                  fontWeight: 700,
                }}
              >
                {iniciales}
              </Avatar>
            </Badge>
            
            <Box flex={1}>
              <Typography variant="h6" fontWeight={700} mb={0.5} noWrap>
                {preinscripcion.estudiante_nombre}
              </Typography>
              <Chip 
                label={config.label} 
                size="small" 
                sx={{ 
                  bgcolor: config.bgcolor, 
                  color: config.color, 
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }} 
              />
            </Box>
            
            <IconButton size="small">
              <MoreVertIcon />
            </IconButton>
          </Stack>

          <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <PersonIcon sx={{ color: config.color, fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                CI: <strong>{preinscripcion.estudiante_ci}</strong>
              </Typography>
            </Stack>
            
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <SchoolIcon sx={{ color: config.color, fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                {getGradoLabel(preinscripcion.grado_solicitado)}
              </Typography>
            </Stack>
            
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <PhoneIcon sx={{ color: config.color, fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary" noWrap>
                {preinscripcion.tutor_telefono || 'Sin teléfono'}
              </Typography>
            </Stack>
            
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <CalendarTodayIcon sx={{ color: config.color, fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                {formatearFecha(preinscripcion.created_at)}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>

        <CardActions sx={{ pt: 0, gap: 1, px: 2, pb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<VisibilityIcon />}
            onClick={() => onRevisar(preinscripcion.id)}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              background: `linear-gradient(135deg, ${config.color}, ${config.color}cc)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${config.color}dd, ${config.color}aa)`,
              }
            }}
          >
            Revisar
          </Button>
          <Tooltip title="Eliminar">
            <IconButton 
              color="error" 
              onClick={() => onEliminar(preinscripcion.id)}
              sx={{ 
                border: '2px solid',
                borderColor: 'error.main',
                '&:hover': { bgcolor: 'error.main', color: '#fff' }
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    </Zoom>
  );
};