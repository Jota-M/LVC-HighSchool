// src/components/preinscripciones/PreinscripcionCard.tsx

import React, { useState } from 'react';
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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Preinscripcion } from '../../types/preinscripcioonTypes';

interface PreinscripcionCardProps {
  preinscripcion: Preinscripcion;
  onRevisar: (id: number) => void;
  onEliminar: (id: number) => void;
}

// Configuración de estados
const getEstadoConfig = (estado: string) => {
  const configs: any = {
    iniciada: { 
      label: 'Iniciada', 
      color: '#757575', 
      bgcolor: '#75757520',
      icon: <CalendarTodayIcon />,
    },
    datos_completos: { 
      label: 'Datos Completos', 
      color: '#2196f3', 
      bgcolor: '#2196f320',
      icon: <CheckCircleIcon />,
    },
    documentos_pendientes: { 
      label: 'Docs Pendientes', 
      color: '#ff9800', 
      bgcolor: '#ff980020',
      icon: <EventBusyIcon />,
    },
    en_revision: { 
      label: 'En Revisión', 
      color: '#9c27b0', 
      bgcolor: '#9c27b020',
      icon: <VisibilityIcon />,
    },
    documentos_aprobados: { 
      label: 'Docs Aprobados', 
      color: '#00bcd4', 
      bgcolor: '#00bcd420',
      icon: <CheckCircleIcon />,
    },
    aprobada: { 
      label: 'Aprobada', 
      color: '#4caf50', 
      bgcolor: '#4caf5020',
      icon: <CheckCircleIcon />,
    },
    rechazada: { 
      label: 'Rechazada', 
      color: '#f44336', 
      bgcolor: '#f4433620',
      icon: <DeleteIcon />,
    },
    convertida: { 
      label: 'Convertida', 
      color: '#8bc34a', 
      bgcolor: '#8bc34a20',
      icon: <CheckCircleIcon />,
    },
  };
  return configs[estado?.toLowerCase()] || configs.iniciada;
};

const getIniciales = (nombre: string) => {
  if (!nombre) return '?';
  const partes = nombre.trim().split(' ');
  if (partes.length >= 2) {
    return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
  }
  return nombre.substring(0, 2).toUpperCase();
};

const formatearFecha = (fecha: string) => {
  if (!fecha) return 'Sin fecha';
  const date = new Date(fecha);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getGradoLabel = (grado: string) => {
  if (!grado) return 'Sin grado';
  return grado.replace(/_/g, ' ').replace(/PRIMARIA|SECUNDARIA/g, (match) => 
    match === 'PRIMARIA' ? 'Prim.' : 'Sec.'
  );
};

export const PreinscripcionCard: React.FC<PreinscripcionCardProps> = ({ 
  preinscripcion, 
  onRevisar, 
  onEliminar 
}) => {
  const theme = useTheme();
  const config = getEstadoConfig(preinscripcion.estado);
  const iniciales = getIniciales(preinscripcion.estudiante_nombre);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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
          position: 'relative',
          overflow: 'visible',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 20px 40px ${config.color}30`,
            border: `2px solid ${config.color}40`,
          }
        }}
      >
        {/* 🆕 INDICADOR DE CUPO */}
        {preinscripcion.tiene_cupo_asignado && (
          <Box
            sx={{
              position: 'absolute',
              top: -8,
              right: 12,
              zIndex: 1,
            }}
          >
            <Tooltip title="Cupo asignado" arrow>
              <Chip
                icon={<EventAvailableIcon sx={{ fontSize: 16 }} />}
                label="Cupo OK"
                size="small"
                sx={{
                  bgcolor: '#43a047',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  height: 24,
                  boxShadow: '0 4px 8px rgba(67, 160, 71, 0.3)',
                  '& .MuiChip-icon': {
                    color: '#fff',
                  }
                }}
              />
            </Tooltip>
          </Box>
        )}

        {!preinscripcion.tiene_cupo_asignado && preinscripcion.estado !== 'rechazada' && (
          <Box
            sx={{
              position: 'absolute',
              top: -8,
              right: 12,
              zIndex: 1,
            }}
          >
            <Tooltip title="Sin cupo asignado" arrow>
              <Chip
                icon={<EventBusyIcon sx={{ fontSize: 16 }} />}
                label="Sin cupo"
                size="small"
                sx={{
                  bgcolor: '#fb8c00',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  height: 24,
                  boxShadow: '0 4px 8px rgba(251, 140, 0, 0.3)',
                  '& .MuiChip-icon': {
                    color: '#fff',
                  }
                }}
              />
            </Tooltip>
          </Box>
        )}

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
            
            <IconButton 
              size="small" 
              onClick={handleMenuOpen}
            >
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
              <Typography variant="body2" color="text.secondary" noWrap>
                {preinscripcion.grado_nombre || getGradoLabel(preinscripcion.grado_solicitado)}
              </Typography>
            </Stack>

            {preinscripcion.turno_nombre && (
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <EventAvailableIcon sx={{ color: config.color, fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary" noWrap>
                  {preinscripcion.turno_nombre}
                </Typography>
              </Stack>
            )}
            
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

        {/* MENÚ */}
        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              minWidth: 180,
              mt: 1,
            },
          }}
        >
          <MenuItem onClick={() => { handleMenuClose(); onRevisar(preinscripcion.id); }}>
            <ListItemIcon>
              <VisibilityIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Ver detalles</ListItemText>
          </MenuItem>

          <Divider sx={{ my: 0.5 }} />

          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <PictureAsPdfIcon fontSize="small" sx={{ color: '#dc2626' }} />
            </ListItemIcon>
            <ListItemText>Descargar PDF</ListItemText>
          </MenuItem>

          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <TableChartIcon fontSize="small" sx={{ color: '#107C41' }} />
            </ListItemIcon>
            <ListItemText>Descargar Excel</ListItemText>
          </MenuItem>

          <Divider sx={{ my: 0.5 }} />

          <MenuItem onClick={() => { handleMenuClose(); onEliminar(preinscripcion.id); }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText sx={{ color: 'error.main' }}>Eliminar</ListItemText>
          </MenuItem>
        </Menu>
      </Card>
    </Zoom>
  );
};