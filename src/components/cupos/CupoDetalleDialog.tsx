// src/components/cupos/CupoDetalleDialog.tsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Stack,
  Typography,
  Button,
  Chip,
  IconButton,
  Divider,
  LinearProgress,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SchoolIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import api from '@/lib/api';

interface CupoDetalleDialogProps {
  open: boolean;
  cupo: any | null;
  onClose: () => void;
  onEdit: () => void;
}

export const CupoDetalleDialog: React.FC<CupoDetalleDialogProps> = ({
  open,
  cupo,
  onClose,
  onEdit,
}) => {
  const [loading, setLoading] = useState(false);
  const [preinscripciones, setPreinscripciones] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // =============================================
  // CARGAR PREINSCRIPCIONES VINCULADAS
  // =============================================
  useEffect(() => {
    const loadPreinscripciones = async () => {
      if (!cupo?.id) return;

      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/preinscripcion', {
          params: {
            cupo_preinscripcion_id: cupo.id,
            limit: 100,
          }
        });

        setPreinscripciones(response.data.data?.preinscripciones || []);
      } catch (err: any) {
        setError('Error al cargar preinscripciones vinculadas');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (open && cupo) {
      loadPreinscripciones();
    }
  }, [open, cupo]);

  if (!cupo) return null;

  const porcentajeOcupacion = (cupo.cupos_ocupados / cupo.cupos_totales) * 100;

  const getOcupacionColor = (porcentaje: number) => {
    if (porcentaje >= 90) return 'error';
    if (porcentaje >= 70) return 'warning';
    return 'success';
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 4 }
      }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box 
              sx={{ 
                bgcolor: 'primary.main', 
                borderRadius: 2, 
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SchoolIcon sx={{ color: '#fff', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Detalles del Cupo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {cupo.grado_nombre} - {cupo.turno_nombre}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* ESTADO */}
          <Box>
            <Stack direction="row" spacing={1.5} mb={2}>
              <Chip 
                label={cupo.activo ? 'Activo' : 'Inactivo'} 
                color={cupo.activo ? 'success' : 'default'}
                sx={{ fontWeight: 600 }}
              />
              <Chip 
                label={`${cupo.nivel_academico_nombre}`}
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Stack>
          </Box>

          {/* BARRA DE OCUPACIÓN */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" fontWeight={600}>
                Ocupación
              </Typography>
              <Typography variant="h6" fontWeight={700} color={getOcupacionColor(porcentajeOcupacion) + '.main'}>
                {cupo.cupos_ocupados}/{cupo.cupos_totales}
              </Typography>
            </Stack>
            <LinearProgress 
              variant="determinate" 
              value={porcentajeOcupacion}
              color={getOcupacionColor(porcentajeOcupacion)}
              sx={{ 
                height: 12, 
                borderRadius: 2,
                bgcolor: '#f0f0f0',
              }}
            />
            <Typography variant="caption" color="text.secondary" mt={1} display="block">
              {porcentajeOcupacion.toFixed(1)}% ocupado • {cupo.cupos_disponibles} cupos disponibles
            </Typography>
          </Box>

          <Divider />

          {/* INFORMACIÓN DETALLADA */}
          <Box>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Información
            </Typography>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ border: 0, py: 1.5 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <EventIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                      <Typography variant="body2" fontWeight={600}>
                        Periodo Académico
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ border: 0, py: 1.5 }}>
                    <Typography variant="body2">
                      {cupo.periodo_nombre}
                    </Typography>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell sx={{ border: 0, py: 1.5 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <SchoolIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                      <Typography variant="body2" fontWeight={600}>
                        Grado
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ border: 0, py: 1.5 }}>
                    <Typography variant="body2">
                      {cupo.grado_nombre}
                    </Typography>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell sx={{ border: 0, py: 1.5 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <AccessTimeIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                      <Typography variant="body2" fontWeight={600}>
                        Turno
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ border: 0, py: 1.5 }}>
                    <Typography variant="body2">
                      {cupo.turno_nombre}
                    </Typography>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell sx={{ border: 0, py: 1.5 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <PeopleIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                      <Typography variant="body2" fontWeight={600}>
                        Cupos Totales
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ border: 0, py: 1.5 }}>
                    <Typography variant="body2">
                      {cupo.cupos_totales}
                    </Typography>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell sx={{ border: 0, py: 1.5 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <AssignmentIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                      <Typography variant="body2" fontWeight={600}>
                        Fecha de Creación
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ border: 0, py: 1.5 }}>
                    <Typography variant="body2">
                      {new Date(cupo.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>

          {/* OBSERVACIONES */}
          {cupo.observaciones && (
            <>
              <Divider />
              <Box>
                <Typography variant="h6" fontWeight={600} mb={1}>
                  Observaciones
                </Typography>
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  {cupo.observaciones}
                </Alert>
              </Box>
            </>
          )}

          {/* PREINSCRIPCIONES VINCULADAS */}
          <Divider />
          <Box>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Preinscripciones Vinculadas ({preinscripciones.length})
            </Typography>
            
            {loading ? (
              <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress size={30} />
              </Box>
            ) : error ? (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            ) : preinscripciones.length > 0 ? (
              <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                <Stack spacing={1}>
                  {preinscripciones.map((p) => (
                    <Box 
                      key={p.id}
                      sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {p.estudiante_nombre}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {p.codigo_inscripcion}
                          </Typography>
                        </Box>
                        <Chip 
                          label={p.estado} 
                          size="small"
                          color={p.estado === 'aprobada' ? 'success' : 'default'}
                        />
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Box>
            ) : (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                No hay preinscripciones vinculadas a este cupo
              </Alert>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button 
          onClick={onClose}
          sx={{ borderRadius: 2 }}
        >
          Cerrar
        </Button>
        <Button
          variant="contained"
          onClick={onEdit}
          startIcon={<EditIcon />}
          sx={{ 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          Editar
        </Button>
      </DialogActions>
    </Dialog>
  );
};