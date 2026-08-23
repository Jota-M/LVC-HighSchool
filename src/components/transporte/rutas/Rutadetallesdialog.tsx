// components/transporte/RutaDetallesDialog.tsx
'use client';
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  LinearProgress,
  alpha,
  useTheme,
  Grid,
  Stack,
  Chip,
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
  RouteRounded as RouteIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import type { RutaTransporte, ParadaRuta } from '@/types/transporte';
import transporteService from '@/services/transporte';

interface RutaDetallesDialogProps {
  open: boolean;
  ruta: RutaTransporte | null;
  onClose: () => void;
  onEdit?: () => void;
}

// ── pequeño helper visual: eyebrow de sección (ícono + etiqueta + regla) ─────
const SectionLabel: React.FC<{ icon: React.ReactNode; children: React.ReactNode; brand: string; borderField: string }> = ({
  icon, children, brand, borderField,
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
    <Box sx={{ display: 'flex', color: alpha(brand, 0.85), '& svg': { fontSize: 15 } }}>{icon}</Box>
    <Typography
      sx={{
        fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: 'text.secondary', whiteSpace: 'nowrap',
      }}
    >
      {children}
    </Typography>
    <Box sx={{ flex: 1, height: '1px', background: borderField }} />
  </Box>
);

export const RutaDetallesDialog: React.FC<RutaDetallesDialogProps> = ({ open, ruta, onClose, onEdit }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [paradas, setParadas] = useState<ParadaRuta[]>([]);
  const [cargandoParadas, setCargandoParadas] = useState(false);

  useEffect(() => {
    if (ruta?.id && open) {
      setCargandoParadas(true);
      transporteService
        .listarParadas(ruta.id)
        .then((res) => {
          setParadas(res.data.paradas || []);
        })
        .catch(() => setParadas([]))
        .finally(() => setCargandoParadas(false));
    }
  }, [ruta?.id, open]);

  // ── tokens (mismos que ProductoFormDialog / NuevoHorarioModal) ────────────
  const brand = isDark ? '#facc15' : '#f59e0b';
  const brandSoft = isDark ? '#eab308' : '#d97706';
  const brandDim = isDark ? 'rgba(250,204,21,0.12)' : 'rgba(245,158,11,0.10)';
  const brandBorder = isDark ? 'rgba(250,204,21,0.25)' : 'rgba(245,158,11,0.25)';
  const bgModal = isDark ? '#09101dff' : '#ffffff';
  const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const bgFieldAlt = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const R = '14px';

  if (!ruta) return null;

  const porcentajeOcupacion = ruta.porcentaje_ocupacion || 0;
  const getOcupacionColor = () => {
    if (porcentajeOcupacion >= 90) return '#ef4444';
    if (porcentajeOcupacion >= 70) return '#f59e0b';
    return '#10b981';
  };
  const ocupacionColor = getOcupacionColor();

  const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value: string | React.ReactNode; highlight?: boolean }> = ({
    icon,
    label,
    value,
    highlight = false,
  }) => (
    <Box
      sx={{
        p: 1.75,
        borderRadius: R,
        background: highlight ? alpha(brand, 0.08) : bgFieldAlt,
        border: `1px solid ${highlight ? alpha(brand, 0.3) : borderField}`,
        height: '100%',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
        <Box sx={{ color: highlight ? brand : 'text.secondary', display: 'flex', '& svg': { fontSize: 17 } }}>{icon}</Box>
        <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" letterSpacing={0.5} fontSize="0.65rem">
          {label}
        </Typography>
      </Box>
      <Typography variant="body2" fontWeight={highlight ? 800 : 700} color={highlight ? brand : 'text.primary'}>
        {value}
      </Typography>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px !important',
          overflow: 'hidden',
          background: bgModal,
          border: `1.5px solid ${brandBorder}`,
          boxShadow: isDark
            ? `0 0 0 1px rgba(250,204,21,0.06), 0 32px 64px rgba(0,0,0,0.8)`
            : `0 32px 64px rgba(0,0,0,0.18)`,
        },
      }}
    >
      {/* ── HEADER ── */}
      <Box
        sx={{
          px: 3, pt: 2.5, pb: 2, position: 'relative', overflow: 'hidden',
          borderBottom: `1px solid ${borderField}`,
          background: `linear-gradient(135deg, ${brandDim} 0%, transparent 65%)`,
        }}
      >
        {/* watermark decorativo sutil */}
        <BusIcon
          sx={{
            position: 'absolute', right: -14, top: -18, fontSize: 120,
            color: brand, opacity: isDark ? 0.05 : 0.06, transform: 'rotate(-12deg)',
            pointerEvents: 'none',
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
          <Box>
            <Typography
              sx={{
                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: alpha(brand, 0.85), mb: 0.4,
              }}
            >
              Ruta · {ruta.codigo}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box
                sx={{
                  width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
                  background: alpha(brand, 0.15),
                  border: `1px solid ${alpha(brand, 0.3)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <BusIcon sx={{ color: brand, fontSize: 18 }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', lineHeight: 1.1, color: 'text.primary' }}>
                {ruta.nombre}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {onEdit && (
              <Box
                onClick={onEdit}
                sx={{
                  width: 32, height: 32, borderRadius: '9px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${borderField}`,
                  color: 'text.secondary',
                  transition: 'all 0.15s',
                  '&:hover': { background: alpha(brand, 0.12), borderColor: alpha(brand, 0.4), color: brand },
                }}
              >
                <EditIcon sx={{ fontSize: 16 }} />
              </Box>
            )}
            <Box
              onClick={onClose}
              sx={{
                width: 32, height: 32, borderRadius: '9px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${borderField}`,
                color: 'text.secondary',
                transition: 'all 0.15s',
                '&:hover': { background: alpha(brand, 0.12), borderColor: alpha(brand, 0.4), color: brand },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
        </Box>

        {/* estado + eyebrow secundario */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, position: 'relative' }}>
          <Box
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.6, px: 1.1, py: 0.4, borderRadius: '999px',
              background: ruta.activo ? alpha('#10b981', 0.14) : alpha('#94a3b8', 0.14),
              border: `1px solid ${ruta.activo ? alpha('#10b981', 0.35) : alpha('#94a3b8', 0.3)}`,
            }}
          >
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: ruta.activo ? '#10b981' : '#94a3b8' }} />
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: ruta.activo ? '#10b981' : 'text.secondary' }}>
              {ruta.activo ? 'Activa' : 'Inactiva'}
            </Typography>
          </Box>
          {ruta.zona_cobertura && (
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {ruta.zona_cobertura}
            </Typography>
          )}
        </Box>
      </Box>

      {/* ── BODY ── */}
      <DialogContent sx={{ px: 3, py: 2.75 }}>
        <Stack spacing={2.5}>
          {ruta.descripcion && (
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              {ruta.descripcion}
            </Typography>
          )}

          {/* ── Sección: ocupación ── */}
          <Box>
            <SectionLabel icon={<SeatIcon />} brand={brand} borderField={borderField}>
              Ocupación
            </SectionLabel>
            <Box
              sx={{
                p: 2, borderRadius: R,
                background: alpha(ocupacionColor, 0.08),
                border: `1.5px solid ${alpha(ocupacionColor, 0.25)}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
                <Typography variant="body2" fontWeight={700} color="text.primary">
                  {ruta.cupos_ocupados} de {ruta.capacidad_maxima} cupos
                </Typography>
                <Typography variant="h6" fontWeight={800} sx={{ color: ocupacionColor, lineHeight: 1 }}>
                  {Number(porcentajeOcupacion).toFixed(0)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={porcentajeOcupacion}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: alpha(ocupacionColor, 0.12),
                  '& .MuiLinearProgress-bar': { backgroundColor: ocupacionColor, borderRadius: 4 },
                }}
              />
              {ruta.estudiantes_asignados !== undefined && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  {ruta.estudiantes_asignados} estudiante{ruta.estudiantes_asignados !== 1 ? 's' : ''} asignado{ruta.estudiantes_asignados !== 1 ? 's' : ''}
                </Typography>
              )}
            </Box>
          </Box>

          {/* ── Sección: cobertura y costo ── */}
          <Box>
            <SectionLabel icon={<PriceIcon />} brand={brand} borderField={borderField}>
              Cobertura y costo
            </SectionLabel>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoItem icon={<PlaceIcon />} label="Zona de cobertura" value={ruta.zona_cobertura || 'No especificada'} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoItem icon={<PriceIcon />} label="Costo mensual" value={transporteService.formatearMonto(ruta.costo_mensual)} highlight />
              </Grid>
            </Grid>
          </Box>

          {/* ── Sección: recorrido ── */}
          {(ruta.punto_inicio || ruta.punto_fin) && (
            <Box>
              <SectionLabel icon={<RouteIcon />} brand={brand} borderField={borderField}>
                Recorrido
              </SectionLabel>
              <Box sx={{ p: 2, borderRadius: R, background: bgFieldAlt, border: `1px solid ${borderField}` }}>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', flexShrink: 0 }} />
                    <Typography variant="body2">
                      <Typography component="span" fontWeight={700}>Inicio: </Typography>
                      {ruta.punto_inicio || 'No especificado'}
                    </Typography>
                  </Box>
                  <Box sx={{ ml: '3px', height: 22, width: 2, backgroundColor: alpha(brand, 0.3) }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444', flexShrink: 0 }} />
                    <Typography variant="body2">
                      <Typography component="span" fontWeight={700}>Final: </Typography>
                      {ruta.punto_fin || 'No especificado'}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
          )}

          {/* ── Sección: horarios ── */}
          {(ruta.horario_ida || ruta.horario_retorno) && (
            <Box>
              <SectionLabel icon={<ScheduleIcon />} brand={brand} borderField={borderField}>
                Horarios
              </SectionLabel>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 6 }}>
                  <InfoItem icon={<ScheduleIcon />} label="Ida" value={ruta.horario_ida || '-'} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <InfoItem icon={<ScheduleIcon />} label="Retorno" value={ruta.horario_retorno || '-'} />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* ── Sección: Paradas del recorrido ── */}
          <Box>
            <SectionLabel icon={<PlaceIcon />} brand={brand} borderField={borderField}>
              Paradas ({paradas.length})
            </SectionLabel>
            {cargandoParadas ? (
              <Typography variant="caption" color="text.secondary">
                Cargando paradas...
              </Typography>
            ) : paradas.length === 0 ? (
              <Box sx={{ p: 2, borderRadius: R, background: bgFieldAlt, border: `1px solid ${borderField}`, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Esta ruta aún no tiene paradas registradas. Puedes crearlas en la pestaña "Paradas".
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1}>
                {paradas.map((p) => (
                  <Box
                    key={p.id}
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      background: bgFieldAlt,
                      border: `1px solid ${borderField}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flex: 1 }}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '8px',
                          background: alpha(brand, 0.15),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: brand }}>
                          #{p.orden}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={700}>
                          {p.nombre}
                        </Typography>
                        {p.direccion && (
                          <Typography variant="caption" color="text.secondary">
                            {p.direccion}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {(p.hora_estimada_ida || p.hora_estimada_retorno) && (
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {p.hora_estimada_ida && (
                          <Chip
                            label={`Ida: ${p.hora_estimada_ida}`}
                            size="small"
                            sx={{ height: 22, fontSize: '0.65rem', fontWeight: 700, background: alpha('#10b981', 0.12), color: '#10b981' }}
                          />
                        )}
                        {p.hora_estimada_retorno && (
                          <Chip
                            label={`Ret: ${p.hora_estimada_retorno}`}
                            size="small"
                            sx={{ height: 22, fontSize: '0.65rem', fontWeight: 700, background: alpha('#ef4444', 0.12), color: '#ef4444' }}
                          />
                        )}
                      </Box>
                    )}
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          {/* ── Sección: conductor ── */}
          {ruta.conductor_responsable && (
            <Box>
              <SectionLabel icon={<PersonIcon />} brand={brand} borderField={borderField}>
                Conductor
              </SectionLabel>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: ruta.telefono_conductor ? 6 : 12 }}>
                  <InfoItem icon={<PersonIcon />} label="Nombre" value={ruta.conductor_responsable} />
                </Grid>
                {ruta.telefono_conductor && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoItem icon={<PhoneIcon />} label="Teléfono" value={ruta.telefono_conductor} />
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          {/* ── Sección: vehículo ── */}
          {ruta.placa_vehiculo && (
            <Box>
              <SectionLabel icon={<CarIcon />} brand={brand} borderField={borderField}>
                Vehículo
              </SectionLabel>
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

          {/* ── Sección: observaciones ── */}
          {ruta.observaciones && (
            <Box>
              <SectionLabel icon={<NotesIcon />} brand={brand} borderField={borderField}>
                Observaciones
              </SectionLabel>
              <Box sx={{ p: 1.75, borderRadius: R, background: bgFieldAlt, border: `1px solid ${borderField}` }}>
                <Box sx={{ display: 'flex', gap: 1.25 }}>
                  <NotesIcon sx={{ color: 'text.secondary', fontSize: 18, mt: 0.2, flexShrink: 0 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {ruta.observaciones}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Stack>
      </DialogContent>

      {/* ── FOOTER ── */}
      <Box sx={{ px: 3, pb: 3, pt: 2, display: 'flex', alignItems: 'center', gap: 1, borderTop: `1px solid ${borderField}` }}>
        <Box sx={{ flex: 1 }} />
        <Button
          onClick={onClose}
          sx={{ borderRadius: '10px', color: 'text.secondary', px: 2, textTransform: 'none', fontWeight: 600, '&:hover': { background: 'rgba(255,255,255,0.05)' } }}
        >
          Cerrar
        </Button>
        {onEdit && (
          <Button
            onClick={onEdit}
            variant="contained"
            startIcon={<EditIcon />}
            sx={{
              borderRadius: '10px', px: 3, fontWeight: 700, textTransform: 'none',
              background: brand, color: isDark ? '#000' : '#fff',
              boxShadow: `0 4px 16px ${alpha(brand, 0.4)}`,
              '&:hover': { background: brandSoft, boxShadow: `0 6px 20px ${alpha(brand, 0.5)}` },
            }}
          >
            Editar ruta
          </Button>
        )}
      </Box>
    </Dialog>
  );
};

export default RutaDetallesDialog;