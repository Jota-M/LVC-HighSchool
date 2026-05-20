// components/transporte/RutaDetallesDialog.tsx
'use client';
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
  LinearProgress,
  Divider,
  alpha,
  useTheme,
  Grid,
  Chip,
  Stack,
} from '@mui/material';
import {
  Close as CloseIcon,
  DirectionsBus as BusIcon,
  Place as PlaceIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  DriveEta as CarIcon,
  LocalOffer as PriceIcon,
  EventSeat as SeatIcon,
  Notes as NotesIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import type { RutaTransporte } from '@/types/transporte';
import transporteService from '@/services/transporte';

interface RutaDetallesDialogProps {
  open: boolean;
  ruta: RutaTransporte | null;
  onClose: () => void;
  onEdit?: () => void;
}

export const RutaDetallesDialog: React.FC<RutaDetallesDialogProps> = ({ open, ruta, onClose, onEdit }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const yellowColor = isDark ? '#facc15' : '#f59e0b';

  if (!ruta) return null;

  const porcentajeOcupacion = ruta.porcentaje_ocupacion || 0;
  const getOcupacionColor = () => {
    if (porcentajeOcupacion >= 90) return '#ef4444';
    if (porcentajeOcupacion >= 70) return '#f59e0b';
    return '#10b981';
  };

  const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value: string | React.ReactNode; highlight?: boolean }> = ({
    icon,
    label,
    value,
    highlight = false,
  }) => (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: highlight ? alpha(yellowColor, 0.08) : alpha(theme.palette.background.default, 0.5),
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Box sx={{ color: highlight ? yellowColor : 'text.secondary' }}>{icon}</Box>
        <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
          {label}
        </Typography>
      </Box>
      <Typography variant="body1" fontWeight={highlight ? 700 : 600} color={highlight ? yellowColor : 'text.primary'}>
        {value}
      </Typography>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: `0 20px 60px ${alpha('#000', 0.3)}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
          color: '#000',
          fontWeight: 700,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: 'rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BusIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Detalles de la Ruta
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {ruta.codigo}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {onEdit && (
            <IconButton
              onClick={onEdit}
              sx={{
                color: '#000',
                backgroundColor: 'rgba(0,0,0,0.1)',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.2)' },
              }}
            >
              <EditIcon />
            </IconButton>
          )}
          <IconButton
            onClick={onClose}
            sx={{
              color: '#000',
              backgroundColor: 'rgba(0,0,0,0.1)',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.2)' },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Estado y Nombre */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight={700}>
              {ruta.nombre}
            </Typography>
            <Chip
              label={ruta.activo ? 'Activa' : 'Inactiva'}
              color={ruta.activo ? 'success' : 'default'}
              sx={{ fontWeight: 700 }}
            />
          </Box>
          {ruta.descripcion && (
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              {ruta.descripcion}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Ocupación destacada */}
        <Box
          sx={{
            p: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(getOcupacionColor(), 0.1)} 0%, ${alpha(getOcupacionColor(), 0.05)} 100%)`,
            border: `2px solid ${alpha(getOcupacionColor(), 0.2)}`,
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SeatIcon sx={{ color: getOcupacionColor() }} />
              <Typography variant="h6" fontWeight={700}>
                Ocupación de la Ruta
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={800} color={getOcupacionColor()}>
              {Number(porcentajeOcupacion).toFixed(0)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={porcentajeOcupacion}
            sx={{
              height: 12,
              borderRadius: 6,
              backgroundColor: alpha(getOcupacionColor(), 0.1),
              mb: 1.5,
              '& .MuiLinearProgress-bar': {
                backgroundColor: getOcupacionColor(),
                borderRadius: 6,
              },
            }}
          />
          <Typography variant="body1" fontWeight={600}>
            {ruta.cupos_ocupados} de {ruta.capacidad_maxima} cupos ocupados
          </Typography>
          {ruta.estudiantes_asignados !== undefined && (
            <Typography variant="caption" color="text.secondary">
              {ruta.estudiantes_asignados} estudiante{ruta.estudiantes_asignados !== 1 ? 's' : ''} asignado{ruta.estudiantes_asignados !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        {/* Información en grid */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{xs:12, sm:6}}>
            <InfoItem
              icon={<PlaceIcon />}
              label="Zona de Cobertura"
              value={ruta.zona_cobertura || 'No especificada'}
            />
          </Grid>
          <Grid size={{xs:12, sm:6}}>
            <InfoItem
              icon={<PriceIcon />}
              label="Costo Mensual"
              value={transporteService.formatearMonto(ruta.costo_mensual)}
              highlight
            />
          </Grid>
        </Grid>

        {/* Recorrido */}
        {(ruta.punto_inicio || ruta.punto_fin) && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={{ mb: 1.5 }}>
              RECORRIDO
            </Typography>
            <Box
              sx={{
                p: 2.5,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.default, 0.5),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                    }}
                  />
                  <Typography variant="body2">
                    <strong>Inicio:</strong> {ruta.punto_inicio || 'No especificado'}
                  </Typography>
                </Box>
                <Box sx={{ ml: 0.5, height: 30, width: 2, backgroundColor: alpha(yellowColor, 0.3) }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#ef4444',
                    }}
                  />
                  <Typography variant="body2">
                    <strong>Final:</strong> {ruta.punto_fin || 'No especificado'}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
        )}

        {/* Horarios */}
        {(ruta.horario_ida || ruta.horario_retorno) && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={{ mb: 1.5 }}>
              HORARIOS
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{xs:6}}>
                <InfoItem
                  icon={<ScheduleIcon />}
                  label="Ida"
                  value={ruta.horario_ida || '-'}
                />
              </Grid>
              <Grid size={{xs:6}}>
                <InfoItem
                  icon={<ScheduleIcon />}
                  label="Retorno"
                  value={ruta.horario_retorno || '-'}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Conductor */}
        {ruta.conductor_responsable && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={{ mb: 1.5 }}>
              CONDUCTOR
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{xs:12, sm: ruta.telefono_conductor ? 6 : 12}}>
                <InfoItem
                  icon={<PersonIcon />}
                  label="Nombre"
                  value={ruta.conductor_responsable}
                />
              </Grid>
              {ruta.telefono_conductor && (
                <Grid size={{xs:12, sm:6}}>
                  <InfoItem
                    icon={<PhoneIcon />}
                    label="Teléfono"
                    value={ruta.telefono_conductor}
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* Vehículo */}
        {ruta.placa_vehiculo && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={{ mb: 1.5 }}>
              VEHÍCULO
            </Typography>
            <InfoItem
              icon={<CarIcon />}
              label="Información"
              value={
                <>
                  {ruta.placa_vehiculo}
                  {ruta.modelo_vehiculo && ` • ${ruta.modelo_vehiculo}`}
                  {ruta.anio_vehiculo && ` • ${ruta.anio_vehiculo}`}
                </>
              }
            />
          </Box>
        )}

        {/* Observaciones */}
        {ruta.observaciones && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={{ mb: 1.5 }}>
              OBSERVACIONES
            </Typography>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.default, 0.5),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <NotesIcon sx={{ color: 'text.secondary', fontSize: 20, mt: 0.2 }} />
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {ruta.observaciones}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} variant="outlined" size="large">
          Cerrar
        </Button>
        {onEdit && (
          <Button
            onClick={onEdit}
            variant="contained"
            size="large"
            startIcon={<EditIcon />}
            sx={{
              background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
              color: '#000',
              fontWeight: 700,
            }}
          >
            Editar Ruta
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default RutaDetallesDialog;