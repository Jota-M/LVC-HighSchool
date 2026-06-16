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
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Fade,
  alpha,
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
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Preinscripcion } from '../../types/preinscripcioonTypes';
import { useRouter } from 'next/navigation';

interface PreinscripcionCardProps {
  preinscripcion: Preinscripcion;
  onRevisar: (id: number) => void;
  onEliminar: (id: number) => void;
}

const getEstadoConfig = (estado: string) => {
  const configs: Record<string, { label: string; color: string }> = {
    iniciada: { label: 'Iniciada', color: '#757575' },
    datos_completos: { label: 'Datos Completos', color: '#2196f3' },
    documentos_pendientes: { label: 'Docs Pendientes', color: '#ff9800' },
    en_revision: { label: 'En Revisión', color: '#9c27b0' },
    documentos_aprobados: { label: 'Docs Aprobados', color: '#00bcd4' },
    aprobada: { label: 'Aprobada', color: '#4caf50' },
    rechazada: { label: 'Rechazada', color: '#f44336' },
    convertida: { label: 'Convertida', color: '#8bc34a' },
  };
  return configs[estado?.toLowerCase()] || configs.iniciada;
};

const getIniciales = (nombre: string) => {
  if (!nombre) return '?';
  const partes = nombre.trim().split(' ');
  if (partes.length >= 2) return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
  return nombre.substring(0, 2).toUpperCase();
};

const formatearFecha = (fecha: string) => {
  if (!fecha) return 'Sin fecha';
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getGradoLabel = (grado: string) => {
  if (!grado) return 'Sin grado';
  return grado.replace(/_/g, ' ').replace(/PRIMARIA|SECUNDARIA/g, (m) =>
    m === 'PRIMARIA' ? 'Prim.' : 'Sec.'
  );
};

export const PreinscripcionCard: React.FC<PreinscripcionCardProps> = ({
  preinscripcion,
  onRevisar,
  onEliminar,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();
  const config = getEstadoConfig(preinscripcion.estado);
  const iniciales = getIniciales(preinscripcion.estudiante_nombre);
  const puedeConvertir =
    preinscripcion.estado === 'aprobada' && preinscripcion.tiene_cupo_asignado;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);
  const handleConvertir = () =>
    router.push(`/dashboard/preinscripciones/convertir/${preinscripcion.id}`);

  return (
    <Fade in timeout={300}>
      <Card
        sx={{
          height: '100%',
          borderRadius: '20px',
          border: `1px solid ${alpha(config.color, 0.2)}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'visible',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 12px 24px ${alpha(config.color, 0.25)}`,
            borderColor: alpha(config.color, 0.5),
          },
        }}
      >
        {/* Indicador de cupo */}
        {preinscripcion.tiene_cupo_asignado && (
          <Chip
            icon={<EventAvailableIcon sx={{ fontSize: 14 }} />}
            label="Cupo OK"
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              zIndex: 1,
              bgcolor: '#10b981',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.7rem',
              height: 24,
              boxShadow: '0 4px 8px rgba(16,185,129,0.3)',
              '& .MuiChip-icon': { color: '#fff' },
            }}
          />
        )}

        {!preinscripcion.tiene_cupo_asignado &&
          preinscripcion.estado !== 'rechazada' && (
            <Chip
              icon={<EventBusyIcon sx={{ fontSize: 14 }} />}
              label="Sin cupo"
              size="small"
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                zIndex: 1,
                bgcolor: '#f59e0b',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 24,
                boxShadow: '0 4px 8px rgba(245,158,11,0.3)',
                '& .MuiChip-icon': { color: '#fff' },
              }}
            />
          )}

        {/* Menú de acciones */}
        <IconButton
          size="small"
          onClick={handleMenuOpen}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
            '&:hover': {
              backgroundColor: alpha(config.color, 0.15),
            },
          }}
        >
          <MoreVertIcon />
        </IconButton>

        <CardContent sx={{ p: 3, textAlign: 'center', pt: 5 }}>
          {/* Avatar */}
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Avatar
                sx={{
                  width: 22,
                  height: 22,
                  bgcolor: config.color,
                  border: '2px solid',
                  borderColor: 'background.paper',
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 13 }} />
              </Avatar>
            }
          >
            <Avatar
              src={preinscripcion.estudiante_foto}
              sx={{
                width: 80,
                height: 80,
                margin: '0 auto 12px',
                bgcolor: config.color,
                color: '#fff',
                fontSize: '1.8rem',
                fontWeight: 800,
                border: `4px solid ${alpha(config.color, 0.2)}`,
                boxShadow: `0 8px 16px ${alpha(config.color, 0.3)}`,
              }}
            >
              {iniciales}
            </Avatar>
          </Badge>

          {/* Nombre */}
          <Typography variant="h6" fontWeight={800} gutterBottom noWrap>
            {preinscripcion.estudiante_nombre}
          </Typography>

          {/* Estado */}
          <Chip
            label={config.label}
            size="small"
            sx={{
              mb: 2,
              bgcolor: alpha(config.color, 0.12),
              color: config.color,
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          />

          {/* Info */}
          <Box
            sx={{
              mt: 1,
              pt: 2,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              textAlign: 'left',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ fontSize: 16, color: config.color }} />
              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                CI: {preinscripcion.estudiante_ci}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolIcon sx={{ fontSize: 16, color: config.color }} />
              <Typography variant="caption" noWrap>
                {preinscripcion.grado_nombre || getGradoLabel(preinscripcion.grado_solicitado)}
              </Typography>
            </Box>

            {preinscripcion.turno_nombre && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventAvailableIcon sx={{ fontSize: 16, color: config.color }} />
                <Typography variant="caption" noWrap>
                  {preinscripcion.turno_nombre}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon sx={{ fontSize: 16, color: config.color }} />
              <Typography variant="caption" noWrap>
                {preinscripcion.tutor_telefono || 'Sin teléfono'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayIcon sx={{ fontSize: 16, color: config.color }} />
              <Typography variant="caption">
                {formatearFecha(preinscripcion.created_at)}
              </Typography>
            </Box>
          </Box>
        </CardContent>

        {/* Botones de acción */}
        <CardActions sx={{ px: 3, pb: 3, pt: 0, gap: 1 }}>
          {puedeConvertir ? (
            <>
              <Button
                fullWidth
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={handleConvertir}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669, #047857)',
                    transform: 'scale(1.02)',
                  },
                }}
              >
                Convertir
              </Button>
              <Tooltip title="Ver detalles">
                <IconButton
                  onClick={() => onRevisar(preinscripcion.id)}
                  sx={{
                    border: `2px solid ${alpha(config.color, 0.4)}`,
                    color: config.color,
                    '&:hover': { bgcolor: config.color, color: '#fff' },
                  }}
                >
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <>
              <Button
                fullWidth
                variant="contained"
                startIcon={<VisibilityIcon />}
                onClick={() => onRevisar(preinscripcion.id)}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  background: `linear-gradient(135deg, ${config.color}, ${alpha(config.color, 0.8)})`,
                  color: '#fff',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${alpha(config.color, 0.9)}, ${alpha(config.color, 0.7)})`,
                    transform: 'scale(1.02)',
                  },
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
                    borderColor: alpha('#ef4444', 0.4),
                    '&:hover': { bgcolor: '#ef4444', color: '#fff' },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </CardActions>

        {/* Menú contextual */}
        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: { borderRadius: '12px', minWidth: 200, mt: 1 },
          }}
        >
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onRevisar(preinscripcion.id);
            }}
          >
            <ListItemIcon>
              <VisibilityIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Ver detalles</ListItemText>
          </MenuItem>

          {puedeConvertir && [
            <MenuItem
              key="convertir"
              onClick={() => {
                handleMenuClose();
                handleConvertir();
              }}
            >
              <ListItemIcon>
                <PersonAddIcon fontSize="small" sx={{ color: '#10b981' }} />
              </ListItemIcon>
              <ListItemText sx={{ color: '#10b981' }}>Convertir a estudiante</ListItemText>
            </MenuItem>,
            <Divider key="div-convertir" sx={{ my: 0.5 }} />,
          ]}

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

          <MenuItem
            onClick={() => {
              handleMenuClose();
              onEliminar(preinscripcion.id);
            }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText sx={{ color: 'error.main' }}>Eliminar</ListItemText>
          </MenuItem>
        </Menu>
      </Card>
    </Fade>
  );
};