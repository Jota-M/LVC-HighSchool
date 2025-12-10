'use client';
import React, { useState } from 'react';
import {
  Box, Typography, Chip, IconButton, Tooltip, alpha, useTheme,
  Menu, MenuItem, ListItemIcon, ListItemText, Dialog,
  DialogTitle, DialogContent, DialogActions, Button, Alert
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SwapHoriz as SwapIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { AsignacionDocente } from '../../services/docentes';

interface AsignacionesListProps {
  asignaciones: AsignacionDocente[];
  loading?: boolean;
  onEliminar: (id: number) => void;
  onCambiarDocente?: (asignacionId: number) => void;
}

const AsignacionesListItem: React.FC<{
  asignacion: AsignacionDocente;
  onEliminar: (id: number) => void;
  onCambiarDocente?: (asignacionId: number) => void;
}> = ({ asignacion, onEliminar, onCambiarDocente }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    onEliminar(asignacion.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          p: 2,
          borderRadius: 2,
          bgcolor: alpha(asignacion.materia_color || theme.palette.grey[400], 0.08),
          border: `1px solid ${alpha(asignacion.materia_color || theme.palette.grey[400], 0.2)}`,
          transition: 'all 0.2s',
          '&:hover': {
            bgcolor: alpha(asignacion.materia_color || theme.palette.grey[400], 0.12),
            transform: 'translateX(4px)'
          }
        }}
      >
        {/* Barra de color lateral */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: 4,
            borderRadius: '8px 0 0 8px',
            bgcolor: asignacion.materia_color || theme.palette.grey[400]
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Título de la materia */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="subtitle1" fontWeight="700" noWrap>
                {asignacion.materia_nombre}
              </Typography>
              {asignacion.es_titular && (
                <Chip 
                  label="Titular" 
                  size="small" 
                  color="primary" 
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
              )}
              {!asignacion.activo && (
                <Chip 
                  label="Inactivo" 
                  size="small" 
                  color="default"
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
              )}
            </Box>

            {/* Código de materia */}
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
              {asignacion.materia_codigo}
            </Typography>

            {/* Información del paralelo y grado */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              <Chip
                label={`${asignacion.grado_nombre} "${asignacion.paralelo_nombre}"`}
                size="small"
                variant="outlined"
                sx={{ height: 22, fontSize: '0.7rem' }}
              />
              <Chip
                label={asignacion.turno_nombre}
                size="small"
                variant="outlined"
                sx={{ height: 22, fontSize: '0.7rem' }}
              />
              {asignacion.nivel_nombre && (
                <Chip
                  label={asignacion.nivel_nombre}
                  size="small"
                  variant="outlined"
                  sx={{ height: 22, fontSize: '0.7rem' }}
                />
              )}
            </Box>

            {/* Estadísticas rápidas */}
            <Box sx={{ display: 'flex', gap: 2, mt: 1.5 }}>
              {asignacion.horas_semanales && (
                <Tooltip title="Horas semanales">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" fontWeight="600">
                      {asignacion.horas_semanales}h/sem
                    </Typography>
                  </Box>
                </Tooltip>
              )}
              
              {asignacion.total_estudiantes !== undefined && (
                <Tooltip title="Estudiantes matriculados">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" fontWeight="600">
                      {asignacion.total_estudiantes} estudiantes
                    </Typography>
                  </Box>
                </Tooltip>
              )}
            </Box>

            {/* Fechas */}
            {(asignacion.fecha_inicio || asignacion.fecha_fin) && (
              <Box sx={{ mt: 1, pt: 1, borderTop: `1px dashed ${theme.palette.divider}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.secondary">
                    {asignacion.fecha_inicio && `Desde: ${new Date(asignacion.fecha_inicio).toLocaleDateString('es-BO')}`}
                    {asignacion.fecha_fin && ` • Hasta: ${new Date(asignacion.fecha_fin).toLocaleDateString('es-BO')}`}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          {/* Menú de acciones */}
          <IconButton
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ alignSelf: 'flex-start' }}
          >
            <MoreIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Menú contextual */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem disabled>
          <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Ver detalles</ListItemText>
        </MenuItem>
        
        {onCambiarDocente && (
          <MenuItem onClick={() => {
            setAnchorEl(null);
            onCambiarDocente(asignacion.id);
          }}>
            <ListItemIcon><SwapIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Cambiar docente</ListItemText>
          </MenuItem>
        )}

        <MenuItem 
          onClick={() => {
            setAnchorEl(null);
            setShowDeleteDialog(true);
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Eliminar asignación</ListItemText>
        </MenuItem>
      </Menu>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} maxWidth="xs">
        <DialogTitle>¿Eliminar asignación?</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esta acción no se puede deshacer
          </Alert>
          <Typography>
            Se eliminará la asignación de <strong>{asignacion.materia_nombre}</strong> en el paralelo{' '}
            <strong>{asignacion.grado_nombre} "{asignacion.paralelo_nombre}"</strong>.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const AsignacionesList: React.FC<AsignacionesListProps> = ({
  asignaciones,
  loading,
  onEliminar,
  onCambiarDocente
}) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">Cargando asignaciones...</Typography>
      </Box>
    );
  }

  if (asignaciones.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <InfoIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Sin asignaciones
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Este docente no tiene materias asignadas en el periodo actual
        </Typography>
      </Box>
    );
  }

  // Agrupar por estado
  const asignacionesActivas = asignaciones.filter(a => a.activo);
  const asignacionesInactivas = asignaciones.filter(a => !a.activo);

  return (
    <Box>
      {/* Asignaciones activas */}
      {asignacionesActivas.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight="700" color="text.secondary" sx={{ mb: 1.5 }}>
            Asignaciones Activas ({asignacionesActivas.length})
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {asignacionesActivas.map(asignacion => (
              <AsignacionesListItem
                key={asignacion.id}
                asignacion={asignacion}
                onEliminar={onEliminar}
                onCambiarDocente={onCambiarDocente}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Asignaciones inactivas */}
      {asignacionesInactivas.length > 0 && (
        <Box>
          <Typography variant="subtitle2" fontWeight="700" color="text.secondary" sx={{ mb: 1.5 }}>
            Asignaciones Inactivas ({asignacionesInactivas.length})
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {asignacionesInactivas.map(asignacion => (
              <AsignacionesListItem
                key={asignacion.id}
                asignacion={asignacion}
                onEliminar={onEliminar}
                onCambiarDocente={onCambiarDocente}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AsignacionesList;