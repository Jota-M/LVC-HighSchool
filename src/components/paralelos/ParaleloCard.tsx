import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
  Chip,
  Stack,
  LinearProgress,
  Divider,
  alpha,
  useTheme,
  Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupsIcon from '@mui/icons-material/Groups';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { Paralelo } from '../../services/paralelos';
import paralelosService from '../../services/paralelos';

interface ParaleloCardProps {
  paralelo: Paralelo;
  colorNivel: string;
  onEdit: (paralelo: Paralelo) => void;
  onDelete: (id: number) => void;
  index: number;
}

export const ParaleloCard: React.FC<ParaleloCardProps> = ({
  paralelo,
  colorNivel,
  onEdit,
  onDelete,
  index
}) => {
  const theme = useTheme();

  const ocupacion = paralelosService.calcularOcupacion(
    paralelo.total_estudiantes || 0,
    paralelo.capacidad_maxima
  );

  const estadoCapacidad = paralelosService.getEstadoCapacidad(
    paralelo.total_estudiantes || 0,
    paralelo.capacidad_minima,
    paralelo.capacidad_maxima
  );

  const lugaresDisponibles = paralelosService.getLugaresDisponibles(
    paralelo.total_estudiantes || 0,
    paralelo.capacidad_maxima
  );

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        border: `2px solid ${alpha(estadoCapacidad.color, 0.3)}`,
        background: `linear-gradient(135deg, ${alpha(colorNivel, 0.05)} 0%, ${alpha(colorNivel, 0.02)} 100%)`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: `fadeInScale 0.5s ease ${index * 0.08}s both`,
        '@keyframes fadeInScale': {
          from: { opacity: 0, transform: 'scale(0.9)' },
          to: { opacity: 1, transform: 'scale(1)' }
        },
        '&:hover': {
          transform: 'translateY(-12px) scale(1.03)',
          boxShadow: `0 16px 32px ${alpha(colorNivel, 0.3)}`,
          borderColor: colorNivel,
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: colorNivel,
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  boxShadow: `0 4px 12px ${alpha(colorNivel, 0.4)}`
                }}
              >
                {paralelo.nombre}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="800">
                  Paralelo {paralelo.nombre}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {paralelo.grado_nombre}
                </Typography>
              </Box>
            </Box>
          </Box>
          {estadoCapacidad.estado === 'lleno' && (
            <Chip
              icon={<WarningAmberIcon />}
              label="LLENO"
              size="small"
              sx={{
                bgcolor: alpha(estadoCapacidad.color, 0.2),
                color: estadoCapacidad.color,
                fontWeight: 'bold'
              }}
            />
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Estudiantes */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <GroupsIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 0.5 }} />
              Estudiantes
            </Typography>
            <Typography variant="h6" fontWeight="700" sx={{ color: estadoCapacidad.color }}>
              {paralelo.total_estudiantes || 0}/{paralelo.capacidad_maxima}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(ocupacion, 100)}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: alpha(estadoCapacidad.color, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                bgcolor: estadoCapacidad.color
              }
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {estadoCapacidad.mensaje}
            </Typography>
            <Typography variant="caption" sx={{ color: estadoCapacidad.color, fontWeight: 600 }}>
              {lugaresDisponibles} cupos libres
            </Typography>
          </Box>
        </Box>

        {/* Info */}
        <Grid container spacing={1}>
          <Grid size={{xs:6}} >
            <Box sx={{
              p: 1.5,
              bgcolor: alpha(colorNivel, 0.08),
              borderRadius: 2,
              textAlign: 'center'
            }}>
              <Typography variant="caption" color="text.secondary">Turno</Typography>
              <Typography variant="body2" fontWeight="700" sx={{ color: colorNivel }}>
                {paralelo.turno_nombre}
              </Typography>
            </Box>
          </Grid>
          {paralelo.aula && (
            <Grid size={{xs:6}} >
              <Box sx={{
                p: 1.5,
                bgcolor: alpha(colorNivel, 0.08),
                borderRadius: 2,
                textAlign: 'center'
              }}>
                <Typography variant="caption" color="text.secondary">Aula</Typography>
                <Typography variant="body2" fontWeight="700" sx={{ color: colorNivel }}>
                  {paralelo.aula}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Acciones */}
        <Stack direction="row" spacing={1} justifyContent="center">
          <Tooltip title="Ver detalles">
            <IconButton
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.info.main, 0.1),
                '&:hover': { bgcolor: theme.palette.info.main, color: 'white' }
              }}
            >
              <AssignmentIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              onClick={() => onEdit(paralelo)}
              sx={{
                bgcolor: alpha(theme.palette.warning.main, 0.1),
                '&:hover': { bgcolor: theme.palette.warning.main, color: 'white' }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              onClick={() => onDelete(paralelo.id)}
              sx={{
                bgcolor: alpha(theme.palette.error.main, 0.1),
                '&:hover': { bgcolor: theme.palette.error.main, color: 'white' }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </CardContent>
    </Card>
  );
};