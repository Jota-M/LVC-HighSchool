// src/components/reservaCupo/admin/ModalNominaAsegurados.tsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Avatar,
  Chip,
  Tooltip,
  Button,
  Skeleton,
  Card,
  CardContent,
  Fade,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  HowToReg as HowToRegIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  CheckCircle as CheckCircleIcon,
  PendingActions as PendingActionsIcon,
  CancelOutlined as CancelIcon,
  WhatsApp as WhatsAppIcon,
  Phone as PhoneIcon,
  GridView as GridViewIcon,
  TableRows as TableRowsIcon,
  Person as PersonIcon,
  Send as SendIcon,
  EditNote as EditNoteIcon,
} from '@mui/icons-material';
import { BalanceCupoGrado, EstudianteCupoAsegurado } from '@/services/reservaCupoService';

interface ModalNominaAseguradosProps {
  open: boolean;
  grado: BalanceCupoGrado | null;
  estudiantes: EstudianteCupoAsegurado[];
  loading: boolean;
  total: number;
  filtroEstado: 'todos' | 'confirmados' | 'pendientes' | 'no_continua';
  filtroTurno: number | '';
  search: string;
  enviandoWhatsAppId?: number | null;
  enviandoWhatsAppMasivo?: boolean;
  onClose: () => void;
  onFiltroEstadoChange: (val: 'todos' | 'confirmados' | 'pendientes' | 'no_continua') => void;
  onFiltroTurnoChange: (val: number | '') => void;
  onSearchChange: (val: string) => void;
  onEnviarWhatsApp: (est: EstudianteCupoAsegurado, mensajePersonalizado?: string) => Promise<void> | void;
  onEnviarWhatsAppMasivo?: (estudiantes: EstudianteCupoAsegurado[]) => Promise<void> | void;
}

export const ModalNominaAsegurados: React.FC<ModalNominaAseguradosProps> = ({
  open,
  grado,
  estudiantes,
  loading,
  total,
  filtroEstado,
  filtroTurno,
  search,
  enviandoWhatsAppId = null,
  enviandoWhatsAppMasivo = false,
  onClose,
  onFiltroEstadoChange,
  onFiltroTurnoChange,
  onSearchChange,
  onEnviarWhatsApp,
  onEnviarWhatsAppMasivo,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Estados para diálogo de envío de WhatsApp
  const [estudianteParaWhatsApp, setEstudianteParaWhatsApp] = useState<EstudianteCupoAsegurado | null>(null);
  const [modalMasivoOpen, setModalMasivoOpen] = useState(false);
  const [mensajePersonalizado, setMensajePersonalizado] = useState('');
  const [modoEdicionMensaje, setModoEdicionMensaje] = useState(false);

  // Búsqueda interna para respuesta inmediata (0ms) y debounce hacia el backend
  const [internalSearch, setInternalSearch] = useState(search || '');

  useEffect(() => {
    setInternalSearch(search || '');
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (internalSearch !== search) {
        onSearchChange(internalSearch);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [internalSearch, search, onSearchChange]);

  // Filtrado instantáneo en memoria sobre los estudiantes cargados
  const estudiantesFiltrados = useMemo(() => {
    if (!internalSearch || !internalSearch.trim()) return estudiantes;
    const terms = internalSearch.toLowerCase().trim().split(/\s+/);
    return estudiantes.filter((est) => {
      const targetText = [
        est.nombre_completo,
        est.ci,
        est.codigo_estudiante,
        est.tutor_nombre,
        est.tutor_telefono,
        est.codigo_reserva,
        est.curso_actual_2026,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return terms.every((t) => targetText.includes(t));
    });
  }, [estudiantes, internalSearch]);

  // Lista de pendientes con número de contacto registrado
  const pendientesConTel = estudiantesFiltrados.filter(
    (e) => e.estado_confirmacion === 'PENDIENTE' && Boolean(e.tutor_telefono)
  );

  const handleAbrirModalWhatsAppIndividual = (est: EstudianteCupoAsegurado) => {
    setEstudianteParaWhatsApp(est);
    setModoEdicionMensaje(false);
    const textoMsg = `📢 *Recordatorio Oficial de Cupo Asegurado*\n🏫 *Unidad Educativa Particular La Voz de Cristo*\n\nEstimado(a) ${est.tutor_nombre || 'Tutor(a)'},\nLe recordamos cordialmente que su hijo(a) *${est.nombre_completo}* (CI: ${est.ci}) cuenta con su *CUPO ASEGURADO* para la Gestión 2027 en el curso *${est.grado_destino_nombre}* (${est.turno_destino_nombre}).\n\nActualmente su confirmación se encuentra *PENDIENTE*.\n\n⚠️ *Aviso Importante:*\nPara la correcta planificación escolar y asignación de vacantes, le solicitamos ingresar a la brevedad para:\n  ✅ *Validar y confirmar* su cupo definitivo para la Gestión 2027, o\n  ❌ *Anular / registrar constancia de no continuidad* en caso de no continuar en la institución, liberando la vacante.\n\n🔗 *Portal de Reserva de Cupo:*\nhttps://uepclavozdecristo.site/reserva-cupo\n\n📌 _Solo necesitará el número de carnet de identidad (CI) del estudiante._\n\nSaludos cordiales.`;
    setMensajePersonalizado(textoMsg);
  };

  const handleConfirmarEnvioIndividual = async () => {
    if (!estudianteParaWhatsApp) return;
    const est = estudianteParaWhatsApp;
    setEstudianteParaWhatsApp(null);
    await onEnviarWhatsApp(est, modoEdicionMensaje ? mensajePersonalizado : undefined);
  };

  const handleConfirmarEnvioMasivo = async () => {
    setModalMasivoOpen(false);
    if (onEnviarWhatsAppMasivo && pendientesConTel.length > 0) {
      await onEnviarWhatsAppMasivo(pendientesConTel);
    }
  };

  // ── tokens idénticos a NuevoHorarioModal ────────────────────────────────────
  const brand = isDark ? '#facc15' : '#0288d1';
  const brandDim = isDark ? 'rgba(250,204,21,0.12)' : 'rgba(2,136,209,0.10)';
  const brandBorder = isDark ? 'rgba(250,204,21,0.25)' : 'rgba(2,136,209,0.25)';
  const bgModal = isDark ? '#09101dff' : '#ffffff';
  const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const R = '14px'; // radio uniforme para inputs

  // sx inyectado en cada FormControl / TextField (igual a NuevoHorarioModal)
  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: R,
      background: bgField,
      '& fieldset': {
        borderColor: borderField,
        borderRadius: R,
      },
      '&:hover fieldset': { borderColor: alpha(brand, 0.5) },
      '&.Mui-focused fieldset': {
        borderColor: brand,
        borderWidth: '1.5px',
        borderRadius: R,
      },
      '&.Mui-focused': {
        boxShadow: `0 0 0 3px ${alpha(brand, 0.12)}`,
        borderRadius: R,
      },
    },
    '& .MuiInputLabel-root': { color: 'text.secondary' },
    '& .MuiInputLabel-root.Mui-focused': { color: brand },
    '& .MuiSelect-select': { borderRadius: `${R} !important` },
    '& .MuiOutlinedInput-notchedOutline': { borderRadius: `${R} !important` },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
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
      {/* ── HEADER (Idéntico estilo a NuevoHorarioModal: brandDim + borderField) ── */}
      <Box sx={{ px: { xs: 2.5, md: 3 }, pt: 2.5, pb: 2, borderBottom: `1px solid ${borderField}`, background: brandDim }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Box>
            <Typography
              sx={{
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: alpha(brand, 0.75),
                mb: 0.4,
              }}
            >
              Nómina de Continuidad · {grado?.nivel_nombre || 'Nivel Académico'}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '9px',
                  flexShrink: 0,
                  background: alpha(brand, 0.15),
                  border: `1px solid ${alpha(brand, 0.3)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <HowToRegIcon sx={{ color: brand, fontSize: 20 }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.15rem', sm: '1.35rem' }, lineHeight: 1.1, color: 'text.primary' }}>
                {grado?.grado_nombre} (Gestión 2027)
              </Typography>
            </Box>
          </Box>

          {/* Botón de Cierre estilizado idéntico a NuevoHorarioModal */}
          <Box
            onClick={onClose}
            sx={{
              width: 32,
              height: 32,
              borderRadius: '9px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${borderField}`,
              color: 'text.secondary',
              transition: 'all 0.15s',
              '&:hover': {
                background: alpha(brand, 0.12),
                borderColor: alpha(brand, 0.4),
                color: brand,
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </Box>
        </Box>

        {/* Chips de Resumen de Balance del Grado y Acción Masiva */}
        {grado && (
          <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', alignItems: 'center' }}>
              <Chip
                size="small"
                label={`Asegurados: ${grado.total_asegurados}`}
                sx={{
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  bgcolor: alpha('#3b82f6', 0.12),
                  color: '#3b82f6',
                  border: '1px solid rgba(59,130,246,0.25)',
                  borderRadius: '8px',
                }}
              />
              <Chip
                size="small"
                label={`Confirmados: ${grado.total_confirmados} (${grado.porcentaje_confirmado}%)`}
                sx={{
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  bgcolor: alpha('#10b981', 0.12),
                  color: '#10b981',
                  border: '1px solid rgba(16,185,129,0.25)',
                  borderRadius: '8px',
                }}
              />
              <Chip
                size="small"
                label={`Pendientes: ${grado.total_restantes}`}
                sx={{
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  bgcolor: alpha('#f59e0b', 0.12),
                  color: '#f59e0b',
                  border: '1px solid rgba(245,158,11,0.25)',
                  borderRadius: '8px',
                }}
              />
              <Chip
                size="small"
                label={`No Continuarán: ${grado.total_no_continua}`}
                sx={{
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  bgcolor: alpha('#ef4444', 0.12),
                  color: '#ef4444',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: '8px',
                }}
              />
              {internalSearch.trim() && (
                <Chip
                  size="small"
                  label={`Filtrados: ${estudiantesFiltrados.length}`}
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    bgcolor: alpha(brand, 0.15),
                    color: brand,
                    border: `1px solid ${alpha(brand, 0.3)}`,
                    borderRadius: '8px',
                  }}
                />
              )}
            </Box>

            {/* Acción Masiva WhatsApp si hay pendientes con teléfono */}
            {pendientesConTel.length > 0 && onEnviarWhatsAppMasivo && (
              <Button
                size="small"
                variant="contained"
                color="success"
                disabled={enviandoWhatsAppMasivo}
                startIcon={
                  enviandoWhatsAppMasivo ? (
                    <CircularProgress size={13} color="inherit" />
                  ) : (
                    <WhatsAppIcon sx={{ fontSize: 16 }} />
                  )
                }
                onClick={() => setModalMasivoOpen(true)}
                sx={{
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.73rem',
                  textTransform: 'none',
                  py: 0.35,
                  px: 1.4,
                  bgcolor: '#10b981',
                  color: '#fff',
                  boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
                  '&:hover': {
                    bgcolor: '#059669',
                    boxShadow: '0 4px 12px rgba(16,185,129,0.4)',
                  },
                }}
              >
                {enviandoWhatsAppMasivo
                  ? 'Encolando recordatorios...'
                  : `Recordar a pendientes (${pendientesConTel.length})`}
              </Button>
            )}
          </Box>
        )}
      </Box>

      {/* ── BODY ── */}
      <DialogContent sx={{ px: { xs: 2, md: 3 }, py: 2.5 }}>
        {/* BARRA DE FILTROS Y CONTROLES (bgField + borderField) */}
        <Box
          sx={{
            p: 1.8,
            mb: 2.5,
            borderRadius: R,
            background: bgField,
            border: `1px solid ${borderField}`,
          }}
        >
          <Grid container spacing={1.5} alignItems="center">
            {/* Buscador */}
            <Grid size={{ xs: 12, md: 4.5 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por estudiante, CI o tutor..."
                value={internalSearch}
                onChange={(e) => setInternalSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: brand }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {loading && estudiantes.length > 0 ? (
                        <CircularProgress size={15} sx={{ color: brand, mr: 0.5 }} />
                      ) : null}
                      {internalSearch ? (
                        <Box
                          onClick={() => {
                            setInternalSearch('');
                            onSearchChange('');
                          }}
                          sx={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            color: 'text.secondary',
                            '&:hover': { color: brand },
                          }}
                        >
                          <ClearIcon fontSize="small" />
                        </Box>
                      ) : null}
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx}
              />
            </Grid>

            {/* Toggle de Estados (Pills) */}
            <Grid size={{ xs: 12, sm: 7, md: 4 }}>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={filtroEstado}
                onChange={(_, val) => val && onFiltroEstadoChange(val)}
                sx={{
                  width: '100%',
                  bgcolor: bgField,
                  borderRadius: R,
                  p: 0.3,
                  border: `1px solid ${borderField}`,
                  '& .MuiToggleButton-root': {
                    flex: 1,
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    textTransform: 'none',
                    borderRadius: '10px',
                    border: 'none',
                    py: 0.5,
                    transition: 'all 0.2s ease',
                  },
                }}
              >
                <ToggleButton value="todos">Todos</ToggleButton>
                <ToggleButton
                  value="confirmados"
                  sx={{ '&.Mui-selected': { bgcolor: alpha('#10b981', 0.18), color: '#10b981 !important' } }}
                >
                  Confirmados
                </ToggleButton>
                <ToggleButton
                  value="pendientes"
                  sx={{ '&.Mui-selected': { bgcolor: alpha('#f59e0b', 0.18), color: '#f59e0b !important' } }}
                >
                  Pendientes
                </ToggleButton>
                <ToggleButton
                  value="no_continua"
                  sx={{ '&.Mui-selected': { bgcolor: alpha('#ef4444', 0.18), color: '#ef4444 !important' } }}
                >
                  No Sigue
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>

            {/* Selector de Turno */}
            <Grid size={{ xs: 8, sm: 3, md: 2.2 }}>
              <FormControl fullWidth size="small" sx={fieldSx}>
                <InputLabel>Turno</InputLabel>
                <Select
                  value={filtroTurno}
                  label="Turno"
                  onChange={(e) => onFiltroTurnoChange(e.target.value as number | '')}
                >
                  <MenuItem value="">Todos los turnos</MenuItem>
                  <MenuItem value={1}>☀️ Turno Mañana</MenuItem>
                  <MenuItem value={2}>🌅 Turno Tarde</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Alternador de Vista (Tarjetas vs Tabla) */}
            <Grid size={{ xs: 4, sm: 2, md: 1.3 }}>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={viewMode}
                onChange={(_, val) => val && setViewMode(val)}
                sx={{
                  bgcolor: bgField,
                  borderRadius: R,
                  p: 0.3,
                  border: `1px solid ${borderField}`,
                  '& .MuiToggleButton-root': {
                    p: 0.6,
                    borderRadius: '10px',
                    border: 'none',
                    '&.Mui-selected': {
                      bgcolor: alpha(brand, 0.2),
                      color: brand,
                    },
                  },
                }}
              >
                <Tooltip title="Vista en Tarjetas">
                  <ToggleButton value="cards">
                    <GridViewIcon fontSize="small" />
                  </ToggleButton>
                </Tooltip>
                <Tooltip title="Vista en Tabla">
                  <ToggleButton value="table">
                    <TableRowsIcon fontSize="small" />
                  </ToggleButton>
                </Tooltip>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
        </Box>

        {/* ── RENDERIZADO: CARDS O TABLA ── */}
        {loading && estudiantes.length === 0 ? (
          <Grid container spacing={2}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <Skeleton height={200} sx={{ borderRadius: '16px', background: bgField }} />
              </Grid>
            ))}
          </Grid>
        ) : estudiantesFiltrados.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 5,
              textAlign: 'center',
              borderRadius: '16px',
              bgcolor: bgField,
              border: `1px solid ${borderField}`,
            }}
          >
            <PersonIcon sx={{ fontSize: 44, color: 'text.secondary', opacity: 0.4, mb: 1 }} />
            <Typography variant="body1" fontWeight={700} color="text.secondary">
              {internalSearch.trim()
                ? `No se encontraron coincidencias para "${internalSearch}"`
                : 'No se encontraron estudiantes para los filtros seleccionados'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {internalSearch.trim()
                ? 'Verifica el término o intenta buscar por carnet de identidad (CI) o nombre del tutor.'
                : 'Prueba cambiando el turno o el estado de confirmación.'}
            </Typography>
            {internalSearch.trim() && (
              <Box sx={{ mt: 1.5 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setInternalSearch('');
                    onSearchChange('');
                  }}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                  }}
                >
                  Limpiar búsqueda
                </Button>
              </Box>
            )}
          </Paper>
        ) : viewMode === 'cards' ? (
          /* ─── VISTA CARDS (Estilo con fondo suave y acento semántico) ─── */
          <Grid container spacing={2}>
            {estudiantesFiltrados.map((est) => {
              const esConfirmado = est.estado_confirmacion === 'CONFIRMADO';
              const esPendiente = est.estado_confirmacion === 'PENDIENTE';
              const esNoContinua = est.estado_confirmacion === 'NO_CONTINUA';

              const statusColor = esConfirmado
                ? '#10b981'
                : esPendiente
                  ? '#f59e0b'
                  : '#ef4444';

              const statusLabel = esConfirmado
                ? 'Confirmado'
                : esPendiente
                  ? 'Pendiente'
                  : 'No Continúa';

              const statusIcon = esConfirmado ? (
                <CheckCircleIcon sx={{ fontSize: 13 }} />
              ) : esPendiente ? (
                <PendingActionsIcon sx={{ fontSize: 13 }} />
              ) : (
                <CancelIcon sx={{ fontSize: 13 }} />
              );

              return (
                <Grid key={est.estudiante_id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Fade in timeout={250}>
                    <Card
                      sx={{
                        height: '100%',
                        borderRadius: '16px',
                        border: `1.5px solid ${alpha(statusColor, 0.35)}`,
                        background: isDark ? 'rgba(255, 255, 255, 0.035)' : '#ffffff',
                        transition: 'all 0.25s ease',
                        position: 'relative',
                        overflow: 'visible',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: `0 8px 20px ${alpha(statusColor, 0.22)}`,
                          borderColor: statusColor,
                        },
                      }}
                    >
                      {/* Badge Turno arriba a la izquierda */}
                      <Chip
                        label={est.turno_destino_id === 1 ? '☀️ Turno Mañana' : '🌅 Turno Tarde'}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          zIndex: 1,
                          fontWeight: 700,
                          fontSize: '0.62rem',
                          height: 20,
                          backgroundColor: est.turno_destino_id === 1 ? alpha('#3b82f6', 0.12) : alpha('#f59e0b', 0.12),
                          color: est.turno_destino_id === 1 ? '#3b82f6' : '#f59e0b',
                          border: `1px solid ${alpha(est.turno_destino_id === 1 ? '#3b82f6' : '#f59e0b', 0.25)}`,
                        }}
                      />

                      {/* Badge Estado arriba a la derecha */}
                      <Chip
                        icon={statusIcon}
                        label={statusLabel}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 1,
                          fontWeight: 800,
                          fontSize: '0.62rem',
                          height: 20,
                          backgroundColor: alpha(statusColor, 0.15),
                          color: statusColor,
                          border: `1px solid ${alpha(statusColor, 0.35)}`,
                          '& .MuiChip-icon': { ml: 0.4, color: `${statusColor} !important` },
                        }}
                      />

                      <CardContent sx={{ p: 1.8, pt: 4, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Avatar 52x52 con tonalidad semántica */}
                        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                          <Avatar
                            sx={{
                              width: 52,
                              height: 52,
                              margin: '0 auto',
                              bgcolor: alpha(statusColor, 0.16),
                              color: statusColor,
                              border: `2px solid ${alpha(statusColor, 0.3)}`,
                              boxShadow: `0 4px 12px ${alpha(statusColor, 0.18)}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '1.05rem',
                            }}
                          >
                            {est.nombre_completo.charAt(0)}
                          </Avatar>
                        </Box>

                        {/* Nombre del Estudiante */}
                        <Typography
                          variant="subtitle2"
                          fontWeight={800}
                          sx={{
                            fontSize: '0.88rem',
                            lineHeight: 1.25,
                            mb: 0.3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {est.nombre_completo}
                        </Typography>

                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 0.8 }}>
                          CI: <strong>{est.ci}</strong> · Cód: {est.codigo_estudiante}
                        </Typography>

                        {/* Procedencia y Tutor (bgField + borderField) */}
                        <Box
                          sx={{
                            p: 0.7,
                            borderRadius: '9px',
                            background: bgField,
                            border: `1px solid ${borderField}`,
                            mb: 1,
                            textAlign: 'left',
                          }}
                        >
                          <Typography variant="caption" sx={{ fontSize: '0.66rem', color: 'text.secondary', display: 'block' }}>
                            Origen: <strong>{est.curso_actual_2026}</strong>
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.66rem', color: 'text.secondary', display: 'block' }}>
                            Tutor: <strong>{est.tutor_nombre || 'No registrado'}</strong>
                          </Typography>
                          {est.tutor_telefono && (
                            <Typography variant="caption" sx={{ fontSize: '0.66rem', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.3, mt: 0.2 }}>
                              <PhoneIcon sx={{ fontSize: 11 }} /> {est.tutor_telefono}
                            </Typography>
                          )}
                        </Box>

                        {/* Código de recibo si confirmado */}
                        {esConfirmado && est.codigo_reserva && (
                          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.68rem', color: '#10b981', mb: 1, display: 'block' }}>
                            Recibo: {est.codigo_reserva}
                          </Typography>
                        )}

                        {/* Botón de acción al pie de la card */}
                        <Box sx={{ mt: 'auto', pt: 0.8, borderTop: `1px solid ${borderField}` }}>
                          {esPendiente && est.tutor_telefono ? (
                            <Button
                              fullWidth
                              size="small"
                              variant="outlined"
                              color="success"
                              disabled={enviandoWhatsAppId === est.estudiante_id}
                              startIcon={
                                enviandoWhatsAppId === est.estudiante_id ? (
                                  <CircularProgress size={14} color="inherit" />
                                ) : (
                                  <WhatsAppIcon sx={{ fontSize: 15 }} />
                                )
                              }
                              onClick={() => handleAbrirModalWhatsAppIndividual(est)}
                              sx={{
                                borderRadius: '9px',
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                textTransform: 'none',
                                py: 0.4,
                                borderColor: alpha('#10b981', 0.5),
                                '&:hover': {
                                  bgcolor: alpha('#10b981', 0.1),
                                  borderColor: '#10b981',
                                },
                              }}
                            >
                              {enviandoWhatsAppId === est.estudiante_id
                                ? 'Enviando vía Evolution...'
                                : 'Recordar por WhatsApp'}
                            </Button>
                          ) : esPendiente && !est.tutor_telefono ? (
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.disabled', fontSize: '0.68rem', display: 'block', textAlign: 'center', py: 0.4 }}
                            >
                              Sin teléfono para WhatsApp
                            </Typography>
                          ) : esConfirmado ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, py: 0.3 }}>
                              <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981' }} />
                              <Typography variant="caption" fontWeight={700} sx={{ color: '#10b981', fontSize: '0.72rem' }}>
                                Cupo Formal Confirmado
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', py: 0.3, fontSize: '0.72rem' }}>
                              Vacante Liberada
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          /* ─── VISTA TABLA ELEGANTE ─── */
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              maxHeight: 460,
              borderRadius: R,
              border: `1px solid ${borderField}`,
              background: bgField,
            }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 800, fontSize: '0.72rem', bgcolor: isDark ? '#101624' : '#f1f5f9', textTransform: 'uppercase' } }}>
                  <TableCell width={45}>#</TableCell>
                  <TableCell>Estudiante Regular</TableCell>
                  <TableCell>Procedencia 2026</TableCell>
                  <TableCell>Turno</TableCell>
                  <TableCell>Estado de Cupo</TableCell>
                  <TableCell>Tutor / Contacto</TableCell>
                  <TableCell align="center">Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {estudiantesFiltrados.map((est, idx) => {
                  const esConfirmado = est.estado_confirmacion === 'CONFIRMADO';
                  const esPendiente = est.estado_confirmacion === 'PENDIENTE';
                  const statusColor = esConfirmado ? '#10b981' : esPendiente ? '#f59e0b' : '#ef4444';

                  return (
                    <TableRow key={est.estudiante_id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>
                        {idx + 1}
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              bgcolor: alpha(statusColor, 0.2),
                              color: statusColor,
                            }}
                          >
                            {est.nombre_completo.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={800} sx={{ lineHeight: 1.2, fontSize: '0.82rem' }}>
                              {est.nombre_completo}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                              CI: <strong>{est.ci}</strong> · Cód: {est.codigo_estudiante}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.72rem' }}>
                          {est.curso_actual_2026}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={est.turno_destino_id === 1 ? '☀️ Mañana' : '🌅 Tarde'}
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.68rem',
                            height: 20,
                            bgcolor: est.turno_destino_id === 1 ? alpha('#3b82f6', 0.12) : alpha('#f59e0b', 0.12),
                            color: est.turno_destino_id === 1 ? '#3b82f6' : '#f59e0b',
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          icon={
                            esConfirmado ? (
                              <CheckCircleIcon sx={{ fontSize: '13px !important', color: '#10b981 !important' }} />
                            ) : esPendiente ? (
                              <PendingActionsIcon sx={{ fontSize: '13px !important', color: '#f59e0b !important' }} />
                            ) : (
                              <CancelIcon sx={{ fontSize: '13px !important', color: '#ef4444 !important' }} />
                            )
                          }
                          label={esConfirmado ? 'Confirmado' : esPendiente ? 'Pendiente' : 'No Continúa'}
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.68rem',
                            height: 20,
                            bgcolor: alpha(statusColor, 0.14),
                            color: statusColor,
                          }}
                        />
                        {esConfirmado && est.codigo_reserva && (
                          <Typography variant="caption" sx={{ display: 'block', fontSize: '0.64rem', color: 'text.secondary', mt: 0.2 }}>
                            {est.codigo_reserva}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 700 }}>
                          {est.tutor_nombre || 'No registrado'}
                        </Typography>
                        {est.tutor_telefono ? (
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.4, fontSize: '0.68rem' }}>
                            <PhoneIcon sx={{ fontSize: 11 }} /> {est.tutor_telefono}
                          </Typography>
                        ) : (
                          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.68rem' }}>
                            Sin teléfono
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell align="center">
                        {esPendiente && est.tutor_telefono ? (
                          <Tooltip title="Enviar recordatorio directo por WhatsApp (Evolution API)">
                            <span>
                              <Button
                                size="small"
                                variant="outlined"
                                color="success"
                                disabled={enviandoWhatsAppId === est.estudiante_id}
                                startIcon={
                                  enviandoWhatsAppId === est.estudiante_id ? (
                                    <CircularProgress size={12} color="inherit" />
                                  ) : (
                                    <WhatsAppIcon sx={{ fontSize: 14 }} />
                                  )
                                }
                                onClick={() => handleAbrirModalWhatsAppIndividual(est)}
                                sx={{
                                  borderRadius: '8px',
                                  fontWeight: 700,
                                  fontSize: '0.7rem',
                                  textTransform: 'none',
                                  py: 0.25,
                                  px: 1,
                                  borderColor: alpha('#10b981', 0.5),
                                }}
                              >
                                {enviandoWhatsAppId === est.estudiante_id ? 'Enviando...' : 'Recordar'}
                              </Button>
                            </span>
                          </Tooltip>
                        ) : esPendiente && !est.tutor_telefono ? (
                          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.68rem' }}>
                            Sin teléfono
                          </Typography>
                        ) : esConfirmado ? (
                          <Tooltip title="Cupo regular confirmado">
                            <span>
                              <CheckCircleIcon sx={{ fontSize: 18, color: '#10b981', verticalAlign: 'middle' }} />
                            </span>
                          </Tooltip>
                        ) : (
                          <Typography variant="caption" color="text.disabled">
                            —
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      {/* ── FOOTER (Idéntico a NuevoHorarioModal: borderField + botón brand) ── */}
      <Box
        sx={{
          px: { xs: 2.5, md: 3 },
          pb: 2.5,
          pt: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: `1px solid ${borderField}`,
        }}
      >
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          Estudiantes en lista: <strong>{estudiantes.length}</strong> de <strong>{total}</strong>
        </Typography>

        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            borderRadius: '10px',
            px: 3,
            fontWeight: 700,
            textTransform: 'none',
            background: brand,
            color: isDark ? '#000' : '#fff',
            boxShadow: `0 4px 16px ${alpha(brand, 0.4)}`,
            '&:hover': {
              background: isDark ? '#eab308' : '#01579b',
              boxShadow: `0 6px 20px ${alpha(brand, 0.5)}`,
            },
          }}
        >
          Cerrar Nómina
        </Button>
      </Box>

      {/* ── DIÁLOGO INDIVIDUAL: RECORDATORIO POR WHATSAPP (EVOLUTION API) ── */}
      <Dialog
        open={Boolean(estudianteParaWhatsApp)}
        onClose={() => setEstudianteParaWhatsApp(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: bgModal,
            border: `1.5px solid ${brandBorder}`,
            boxShadow: isDark
              ? '0 20px 40px rgba(0,0,0,0.8)'
              : '0 20px 40px rgba(0,0,0,0.2)',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.2, pb: 1, borderBottom: `1px solid ${borderField}` }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '9px',
              bgcolor: alpha('#10b981', 0.15),
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <WhatsAppIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={800}>
              Recordar Cupo Asegurado por WhatsApp
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Envío directo mediante API de Evolution Go (Sin WhatsApp Web)
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2, pb: 1.5 }}>
          {estudianteParaWhatsApp && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 0.5 }}>
              {/* Resumen del destinatario */}
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  background: bgField,
                  border: `1px solid ${borderField}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    TUTOR DESTINATARIO:
                  </Typography>
                  <Chip
                    size="small"
                    icon={<WhatsAppIcon sx={{ fontSize: '13px !important' }} />}
                    label={estudianteParaWhatsApp.tutor_telefono}
                    sx={{
                      bgcolor: alpha('#10b981', 0.15),
                      color: '#10b981',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                    }}
                  />
                </Box>
                <Typography variant="body2" fontWeight={800}>
                  {estudianteParaWhatsApp.tutor_nombre || 'Tutor no registrado'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Estudiante: <strong>{estudianteParaWhatsApp.nombre_completo}</strong> (CI: {estudianteParaWhatsApp.ci})
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Curso Proyectado: <strong>{estudianteParaWhatsApp.grado_destino_nombre}</strong> ({estudianteParaWhatsApp.turno_destino_nombre})
                </Typography>
              </Box>

              {/* Botón para alternar edición de mensaje */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  MENSAJE OFICIAL (EVOLUTION API):
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<EditNoteIcon sx={{ fontSize: 16 }} />}
                  onClick={() => setModoEdicionMensaje(!modoEdicionMensaje)}
                  sx={{ textTransform: 'none', fontSize: '0.72rem', fontWeight: 700 }}
                >
                  {modoEdicionMensaje ? 'Usar texto automático' : 'Editar mensaje'}
                </Button>
              </Box>

              {modoEdicionMensaje ? (
                <TextField
                  fullWidth
                  multiline
                  minRows={6}
                  maxRows={10}
                  value={mensajePersonalizado}
                  onChange={(e) => setMensajePersonalizado(e.target.value)}
                  placeholder="Escriba el mensaje para WhatsApp..."
                  sx={fieldSx}
                />
              ) : (
                <Box
                  sx={{
                    p: 1.8,
                    borderRadius: '12px',
                    bgcolor: isDark ? 'rgba(16, 185, 129, 0.08)' : '#f0fdf4',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    fontFamily: 'monospace',
                    fontSize: '0.78rem',
                    whiteSpace: 'pre-wrap',
                    color: isDark ? '#e2e8f0' : '#1e293b',
                    maxHeight: '220px',
                    overflowY: 'auto',
                  }}
                >
                  {mensajePersonalizado}
                </Box>
              )}

              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, fontStyle: 'italic' }}>
                ℹ️ El mensaje será despachado de forma directa por el servicio institucional de WhatsApp con protección anti-baneo.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, pt: 1, borderTop: `1px solid ${borderField}` }}>
          <Button
            onClick={() => setEstudianteParaWhatsApp(null)}
            sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<SendIcon sx={{ fontSize: 16 }} />}
            onClick={handleConfirmarEnvioIndividual}
            sx={{
              borderRadius: '10px',
              fontWeight: 700,
              textTransform: 'none',
              px: 2.5,
              bgcolor: '#10b981',
              '&:hover': { bgcolor: '#059669' },
            }}
          >
            Enviar por WhatsApp Directo
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── DIÁLOGO MASIVO: RECORDATORIO A PENDIENTES (EVOLUTION API) ── */}
      <Dialog
        open={modalMasivoOpen}
        onClose={() => setModalMasivoOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: bgModal,
            border: `1.5px solid ${brandBorder}`,
            boxShadow: isDark
              ? '0 20px 40px rgba(0,0,0,0.8)'
              : '0 20px 40px rgba(0,0,0,0.2)',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.2, pb: 1, borderBottom: `1px solid ${borderField}` }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '9px',
              bgcolor: alpha('#10b981', 0.15),
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <WhatsAppIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={800}>
              Recordatorio Masivo
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Evolution API (Cola Segura)
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2, pb: 1 }}>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            ¿Estás seguro de enviar recordatorios directos por WhatsApp a los{' '}
            <strong>{pendientesConTel.length} estudiantes pendientes</strong> de este grado con número registrado?
          </Typography>

          <Box
            sx={{
              p: 1.5,
              borderRadius: '10px',
              bgcolor: alpha('#10b981', 0.08),
              border: '1px solid rgba(16, 185, 129, 0.25)',
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.4 }}>
              🛡️ <strong>Envío Seguro Anti-Baneo:</strong> Los mensajes se despacharán de forma secuencial en cola con simulación de tipeo humano y cadencia de espera de 3 a 6 segundos para proteger la línea institucional.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 2.5, pb: 2, pt: 1, borderTop: `1px solid ${borderField}` }}>
          <Button
            onClick={() => setModalMasivoOpen(false)}
            sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<SendIcon sx={{ fontSize: 16 }} />}
            onClick={handleConfirmarEnvioMasivo}
            sx={{
              borderRadius: '9px',
              fontWeight: 700,
              textTransform: 'none',
              bgcolor: '#10b981',
              '&:hover': { bgcolor: '#059669' },
            }}
          >
            Confirmar y Encolar ({pendientesConTel.length})
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default ModalNominaAsegurados;
