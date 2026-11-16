// client/src/components/agenda/AgendaSlotsSelector.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Paper,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Divider,
  Popover,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  BoltRounded as BoltIcon,
  EventRounded as EventIcon,
  AccessTimeRounded as TimeIcon,
  SettingsRounded as SettingsIcon,
  CheckCircleRounded as CheckIcon,
  PersonRounded as PersonIcon,
  WbSunnyRounded as SunIcon,
  NightsStayRounded as MoonIcon,
  ChevronLeftRounded as PrevIcon,
  ChevronRightRounded as NextIcon,
  CalendarMonthRounded as CalendarMonthIcon,
} from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';
import {
  ConfiguracionAgenda,
  CONFIG_AGENDA_DEFAULT,
  CitaOcupada,
  SlotHorario,
  UltimaCitaInfo,
  obtenerConfiguracionAgenda,
  guardarConfiguracionAgenda,
  generarSlotsDelDia,
  calcularSiguienteTurnoLibre,
  obtenerUltimaCitaAgendada,
  obtenerSiguienteDiaHabil,
} from '@/utils/agendaUtils';

dayjs.locale('es');

interface AgendaSlotsSelectorProps {
  valorActual: Dayjs | null;
  onSeleccionar: (fechaHora: Dayjs) => void;
  citasOcupadas?: CitaOcupada[];
  cargandoCitas?: boolean;
  estudianteActualNombre?: string;
  codigoActual?: string;
}

export const AgendaSlotsSelector: React.FC<AgendaSlotsSelectorProps> = ({
  valorActual,
  onSeleccionar,
  citasOcupadas = [],
  cargandoCitas = false,
  estudianteActualNombre,
  codigoActual,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? '#facc15' : '#0288d1';

  // Configuración de la agenda
  const [config, setConfig] = useState<ConfiguracionAgenda>(CONFIG_AGENDA_DEFAULT);
  const [anchorSettings, setAnchorSettings] = useState<HTMLElement | null>(null);

  // Día que se está inspeccionando visualmente en los slots
  const [diaSeleccionado, setDiaSeleccionado] = useState<Dayjs>(() => {
    return valorActual && valorActual.isValid() ? valorActual.startOf('day') : dayjs().add(1, 'day').startOf('day');
  });

  // Última cita agendada en memoria
  const [ultimaCita, setUltimaCita] = useState<UltimaCitaInfo | null>(null);

  useEffect(() => {
    setConfig(obtenerConfiguracionAgenda());
    setUltimaCita(obtenerUltimaCitaAgendada());
  }, []);

  // Si cambia el valor actual externamente, enfocar ese día
  useEffect(() => {
    if (valorActual && valorActual.isValid()) {
      setDiaSeleccionado(valorActual.startOf('day'));
    }
  }, [valorActual]);

  // Generar slots del día seleccionado
  const slotsDelDia = useMemo(() => {
    return generarSlotsDelDia(diaSeleccionado, config, citasOcupadas);
  }, [diaSeleccionado, config, citasOcupadas]);

  const slotsManana = useMemo(() => slotsDelDia.filter((s) => s.turno === 'manana'), [slotsDelDia]);
  const slotsTarde = useMemo(() => slotsDelDia.filter((s) => s.turno === 'tarde'), [slotsDelDia]);

  const totalDisponibles = useMemo(() => slotsDelDia.filter((s) => !s.ocupado).length, [slotsDelDia]);
  const totalOcupados = useMemo(() => slotsDelDia.filter((s) => s.ocupado).length, [slotsDelDia]);

  // Manejar click en "Sugerir Siguiente Turno Libre"
  const handleSiguienteTurnoLibre = () => {
    const siguiente = calcularSiguienteTurnoLibre(citasOcupadas, config, ultimaCita);
    setDiaSeleccionado(siguiente.startOf('day'));
    onSeleccionar(siguiente);
  };

  // Manejar selección de un slot individual
  const handleSeleccionarSlot = (slot: SlotHorario) => {
    if (slot.ocupado) return;
    const [h, m] = slot.hora.split(':').map(Number);
    const nuevaFecha = diaSeleccionado.hour(h).minute(m).second(0);
    onSeleccionar(nuevaFecha);
  };

  // Cambiar día con botones rápidos
  const handleIrHoy = () => setDiaSeleccionado(dayjs().startOf('day'));
  const handleIrManana = () => setDiaSeleccionado(dayjs().add(1, 'day').startOf('day'));
  const handleIrSiguienteHabil = () => setDiaSeleccionado(obtenerSiguienteDiaHabil(dayjs(), config).startOf('day'));

  const handleDiaAnterior = () => setDiaSeleccionado((prev) => prev.subtract(1, 'day'));
  const handleDiaSiguiente = () => setDiaSeleccionado((prev) => prev.add(1, 'day'));

  // Comprobar si un slot coincide con el valor seleccionado actualmente
  const esSlotSeleccionado = (slot: SlotHorario) => {
    if (!valorActual || !valorActual.isValid()) return false;
    return (
      valorActual.format('YYYY-MM-DD') === diaSeleccionado.format('YYYY-MM-DD') &&
      valorActual.format('HH:mm') === slot.hora
    );
  };

  // Actualizar config
  const handleCambiarDuracion = (dur: number) => {
    const nueva = guardarConfiguracionAgenda({ duracionMinutos: dur });
    setConfig(nueva);
  };

  const handleToggleTarde = (atencionTarde: boolean) => {
    const nueva = guardarConfiguracionAgenda({ atencionTarde });
    setConfig(nueva);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: '18px',
        bgcolor: isDark ? 'rgba(15, 23, 42, 0.65)' : '#f8fafc',
        border: `1px solid ${isDark ? 'rgba(51, 65, 85, 0.8)' : '#e2e8f0'}`,
        mb: 2.5,
      }}
    >
      {/* 1. BARRA SUPERIOR: CONTINUIDAD + BOTÓN DE 1 CLICK */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0, flex: 1 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              bgcolor: isDark ? 'rgba(250, 204, 21, 0.15)' : 'rgba(2, 136, 209, 0.12)',
              color: accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CalendarMonthIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={800} color="text.primary" noWrap>
              Planificador Rápido de Entrevistas
            </Typography>
            {ultimaCita ? (
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', fontSize: '0.72rem' }}>
                📌 Cita anterior: <strong>{ultimaCita.estudiante}</strong> el <strong>{ultimaCita.fecha} a las {ultimaCita.hora}</strong>
              </Typography>
            ) : (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.72rem' }}>
                Selecciona un horario libre del día o usa el botón automático
              </Typography>
            )}
          </Box>
        </Box>

        {/* Acciones de Cabecera: Botón Mágico + Ajustes */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<BoltIcon sx={{ color: '#000' }} />}
            onClick={handleSiguienteTurnoLibre}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.78rem',
              py: 0.8,
              px: 1.8,
              background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
              color: '#000',
              boxShadow: '0 4px 12px rgba(250, 204, 21, 0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #fde047 0%, #fbbf24 100%)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            Siguiente Turno Libre
          </Button>

          <Tooltip title="Configurar intervalo y horario de atención">
            <IconButton
              size="small"
              onClick={(e) => setAnchorSettings(e.currentTarget)}
              sx={{
                borderRadius: '10px',
                border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                color: 'text.secondary',
              }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* 2. SELECTOR Y NAVEGADOR DE DÍAS */}
      <Paper
        elevation={0}
        sx={{
          p: 1.2,
          px: 1.5,
          borderRadius: '12px',
          bgcolor: isDark ? 'rgba(30, 41, 59, 0.7)' : '#ffffff',
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.2,
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <IconButton size="small" onClick={handleDiaAnterior}>
            <PrevIcon fontSize="small" />
          </IconButton>
          <Box sx={{ textAlign: 'center', minWidth: 160 }}>
            <Typography variant="body2" fontWeight={800} color="text.primary" sx={{ textTransform: 'capitalize' }}>
              {diaSeleccionado.format('dddd, D [de] MMMM')}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {diaSeleccionado.isSame(dayjs(), 'day')
                ? 'Hoy'
                : diaSeleccionado.isSame(dayjs().add(1, 'day'), 'day')
                ? 'Mañana'
                : `Año ${diaSeleccionado.year()}`}
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleDiaSiguiente}>
            <NextIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Atajos Rápidos de Día */}
        <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={handleIrHoy}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: '0.72rem',
              py: 0.3,
              px: 1,
              borderColor: diaSeleccionado.isSame(dayjs(), 'day') ? accent : alpha(theme.palette.divider, 0.6),
              color: diaSeleccionado.isSame(dayjs(), 'day') ? accent : 'text.secondary',
            }}
          >
            Hoy
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={handleIrManana}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: '0.72rem',
              py: 0.3,
              px: 1,
              borderColor: diaSeleccionado.isSame(dayjs().add(1, 'day'), 'day') ? accent : alpha(theme.palette.divider, 0.6),
              color: diaSeleccionado.isSame(dayjs().add(1, 'day'), 'day') ? accent : 'text.secondary',
            }}
          >
            Mañana
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={handleIrSiguienteHabil}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: '0.72rem',
              py: 0.3,
              px: 1,
              borderColor: alpha(theme.palette.divider, 0.6),
              color: 'text.secondary',
            }}
          >
            Próx. Día Hábil
          </Button>
          <TextField
            type="date"
            size="small"
            value={diaSeleccionado.format('YYYY-MM-DD')}
            onChange={(e) => {
              if (e.target.value) {
                setDiaSeleccionado(dayjs(e.target.value).startOf('day'));
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: 28,
                fontSize: '0.72rem',
                borderRadius: '8px',
              },
            }}
          />
        </Box>

        {/* Resumen del día */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            size="small"
            label={`${totalDisponibles} Libres`}
            sx={{
              height: 22,
              fontSize: '0.68rem',
              fontWeight: 700,
              bgcolor: alpha('#10b981', 0.15),
              color: '#10b981',
            }}
          />
          {totalOcupados > 0 && (
            <Chip
              size="small"
              label={`${totalOcupados} Ocupados`}
              sx={{
                height: 22,
                fontSize: '0.68rem',
                fontWeight: 700,
                bgcolor: alpha('#ef4444', 0.15),
                color: '#ef4444',
              }}
            />
          )}
        </Box>
      </Paper>

      {/* 3. PARRILLA DE SLOTS / PASTILLAS DE HORA */}
      {cargandoCitas ? (
        <Box sx={{ py: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5 }}>
          <CircularProgress size={20} sx={{ color: accent }} />
          <Typography variant="caption" color="text.secondary">
            Cargando citas ocupadas del sistema...
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.8}>
          {/* SECCIÓN TURNO MAÑANA */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
              <SunIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
              <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                Turno Mañana ({config.horaInicioManana} - {config.horaFinManana})
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
              {slotsManana.map((slot) => {
                const seleccionado = esSlotSeleccionado(slot);
                return (
                  <Tooltip
                    key={slot.hora}
                    title={
                      slot.ocupado
                        ? `Ocupado: ${slot.ocupadoPor || 'Cita agendada'} ${slot.codigoOcupado ? `(${slot.codigoOcupado})` : ''}`
                        : `Disponible (${config.duracionMinutos} min) · Click para seleccionar`
                    }
                  >
                    <span>
                      <Button
                        size="small"
                        disabled={slot.ocupado}
                        onClick={() => handleSeleccionarSlot(slot)}
                        sx={{
                          minWidth: 70,
                          py: 0.6,
                          px: 1.2,
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontSize: '0.78rem',
                          fontWeight: seleccionado ? 900 : 700,
                          transition: 'all 0.15s ease',
                          ...(seleccionado
                            ? {
                                bgcolor: isDark ? '#10b981' : '#059669',
                                color: '#ffffff',
                                border: '2px solid #10b981',
                                boxShadow: '0 3px 10px rgba(16, 185, 129, 0.4)',
                                '&:hover': {
                                  bgcolor: '#047857',
                                },
                              }
                            : slot.ocupado
                            ? {
                                bgcolor: isDark ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.06)',
                                color: isDark ? '#f87171' : '#dc2626',
                                border: `1px dashed ${alpha('#ef4444', 0.4)}`,
                                textDecoration: 'line-through',
                                opacity: 0.7,
                              }
                            : {
                                bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff',
                                color: 'text.primary',
                                border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                                '&:hover': {
                                  bgcolor: alpha(accent, 0.12),
                                  borderColor: accent,
                                  transform: 'translateY(-1px)',
                                },
                              }),
                        }}
                      >
                        {seleccionado && <CheckIcon sx={{ fontSize: 14, mr: 0.4 }} />}
                        {slot.hora}
                      </Button>
                    </span>
                  </Tooltip>
                );
              })}
            </Box>
          </Box>

          {/* SECCIÓN TURNO TARDE (SI APLICA) */}
          {config.atencionTarde && slotsTarde.length > 0 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
                <MoonIcon sx={{ fontSize: 16, color: '#8b5cf6' }} />
                <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                  Turno Tarde ({config.horaInicioTarde} - {config.horaFinTarde})
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                {slotsTarde.map((slot) => {
                  const seleccionado = esSlotSeleccionado(slot);
                  return (
                    <Tooltip
                      key={slot.hora}
                      title={
                        slot.ocupado
                          ? `Ocupado: ${slot.ocupadoPor || 'Cita agendada'} ${slot.codigoOcupado ? `(${slot.codigoOcupado})` : ''}`
                          : `Disponible (${config.duracionMinutos} min) · Click para seleccionar`
                      }
                    >
                      <span>
                        <Button
                          size="small"
                          disabled={slot.ocupado}
                          onClick={() => handleSeleccionarSlot(slot)}
                          sx={{
                            minWidth: 70,
                            py: 0.6,
                            px: 1.2,
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontSize: '0.78rem',
                            fontWeight: seleccionado ? 900 : 700,
                            transition: 'all 0.15s ease',
                            ...(seleccionado
                              ? {
                                  bgcolor: isDark ? '#10b981' : '#059669',
                                  color: '#ffffff',
                                  border: '2px solid #10b981',
                                  boxShadow: '0 3px 10px rgba(16, 185, 129, 0.4)',
                                  '&:hover': {
                                    bgcolor: '#047857',
                                  },
                                }
                              : slot.ocupado
                              ? {
                                  bgcolor: isDark ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.06)',
                                  color: isDark ? '#f87171' : '#dc2626',
                                  border: `1px dashed ${alpha('#ef4444', 0.4)}`,
                                  textDecoration: 'line-through',
                                  opacity: 0.7,
                                }
                              : {
                                  bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff',
                                  color: 'text.primary',
                                  border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                                  '&:hover': {
                                    bgcolor: alpha(accent, 0.12),
                                    borderColor: accent,
                                    transform: 'translateY(-1px)',
                                  },
                                }),
                          }}
                        >
                          {seleccionado && <CheckIcon sx={{ fontSize: 14, mr: 0.4 }} />}
                          {slot.hora}
                        </Button>
                      </span>
                    </Tooltip>
                  );
                })}
              </Box>
            </Box>
          )}
        </Stack>
      )}

      {/* 4. CONFIRMACIÓN Y VISUALIZACIÓN DEL SLOT ELEGIDO */}
      {valorActual && valorActual.isValid() && (
        <Paper
          elevation={0}
          sx={{
            mt: 2,
            p: 1.5,
            borderRadius: '12px',
            bgcolor: isDark ? alpha('#10b981', 0.1) : alpha('#10b981', 0.08),
            border: `1px solid ${alpha('#10b981', 0.35)}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckIcon sx={{ color: '#10b981', fontSize: 20 }} />
            <Box>
              <Typography variant="body2" fontWeight={800} color="text.primary">
                Cita Seleccionada: {valorActual.format('dddd D [de] MMMM [de] YYYY')} a las {valorActual.format('HH:mm')} hrs
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Duración: {config.duracionMinutos} minutos (finaliza a las {valorActual.add(config.duracionMinutos, 'minute').format('HH:mm')})
              </Typography>
            </Box>
          </Box>

          <Chip
            size="small"
            label="✓ Horario Confirmado"
            sx={{
              height: 22,
              fontSize: '0.7rem',
              fontWeight: 800,
              bgcolor: '#10b981',
              color: '#ffffff',
            }}
          />
        </Paper>
      )}

      {/* 5. POPOVER DE CONFIGURACIÓN RÁPIDA DE AGENDA */}
      <Popover
        open={Boolean(anchorSettings)}
        anchorEl={anchorSettings}
        onClose={() => setAnchorSettings(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 2,
            width: 280,
            borderRadius: '16px',
            bgcolor: isDark ? '#1e293b' : '#ffffff',
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          },
        }}
      >
        <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5 }}>
          ⚙️ Ajustes del Turnero
        </Typography>

        <Stack spacing={2}>
          {/* Duración */}
          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              Duración por Cita:
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.8 }}>
              {[20, 30, 45].map((dur) => (
                <Button
                  key={dur}
                  size="small"
                  variant={config.duracionMinutos === dur ? 'contained' : 'outlined'}
                  onClick={() => handleCambiarDuracion(dur)}
                  sx={{
                    flex: 1,
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 700,
                    py: 0.4,
                    ...(config.duracionMinutos === dur
                      ? { bgcolor: accent, color: isDark ? '#000' : '#fff' }
                      : {}),
                  }}
                >
                  {dur}m
                </Button>
              ))}
            </Box>
          </Box>

          <Divider />

          {/* Turno Tarde */}
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={config.atencionTarde}
                onChange={(e) => handleToggleTarde(e.target.checked)}
              />
            }
            label={
              <Typography variant="caption" fontWeight={700}>
                Habilitar Turno Tarde (14:30 - 17:30)
              </Typography>
            }
          />
        </Stack>
      </Popover>
    </Paper>
  );
};
