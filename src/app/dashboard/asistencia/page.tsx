'use client';
// pages/Asistencia.tsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  useTheme,
  Fade,
  keyframes,
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  IconButton,
  Avatar,
  LinearProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  Divider,
  Stack,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import {
  EventAvailable as AsistenciaIcon,
  CheckCircle as PresenteIcon,
  Cancel as AusenteIcon,
  AccessTime as TardanzaIcon,
  VerifiedUser as JustificadoIcon,
  Dashboard as DashboardIcon,
  ListAlt as ListaIcon,
  Assignment as PermisoIcon,
  BarChart as ReporteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Visibility as VerIcon,
  PersonAdd as PersonIcon,
  Groups as GrupoIcon,
  Warning as WarningIcon,
  CalendarMonth as CalendarIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Send as EnviarIcon,
  History as HistoryIcon,
} from '@mui/icons-material';

import {
  useSolicitudesPermiso,
  useAsistencia,
  useListaDia,
  useReporteAsistencia,
} from '@/hooks/useAsistencia';
import {
  ESTADOS_ASISTENCIA,
  ESTADOS_PERMISO,
  MOTIVOS_PERMISO,
  EstadoAsistencia,
  SolicitudPermiso,
  EstudianteDia,
} from '@/types/asistenciaTypes';

// ──────────────────────────────────────────────
// ANIMACIONES
// ──────────────────────────────────────────────
const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
`;

const fadeSlideIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────
const getEstadoAsistencia = (estado?: EstadoAsistencia) =>
  ESTADOS_ASISTENCIA.find(e => e.value === estado);

const getEstadoPermiso = (estado: string) =>
  ESTADOS_PERMISO.find(e => e.value === estado);

const getMotivoPermiso = (motivo: string) =>
  MOTIVOS_PERMISO.find(m => m.value === motivo);

// ──────────────────────────────────────────────
// CHIP DE ESTADO
// ──────────────────────────────────────────────
const EstadoChip: React.FC<{ estado?: EstadoAsistencia }> = ({ estado }) => {
  const info = getEstadoAsistencia(estado);
  if (!info) return <Chip label="Sin marcar" size="small" sx={{ bgcolor: '#f3f4f6', color: '#6b7280' }} />;
  return (
    <Chip
      label={info.label}
      size="small"
      sx={{ bgcolor: info.bgColor, color: info.color, fontWeight: 700 }}
    />
  );
};

// ──────────────────────────────────────────────
// TAB PANEL
// ──────────────────────────────────────────────
interface TabPanelProps { children?: React.ReactNode; index: number; value: number; }
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 4 }}>{children}</Box>}
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// SECCIÓN 1: PASE DE LISTA (Lista del Día)
// ═══════════════════════════════════════════════════════════════════
const PaseDeLista: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [asignacionId, setAsignacionId] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [cargado, setCargado] = useState(false);

  const {
    lista, estadisticas, marcaciones, isLoading, isSaving,
    porcentajeCompletado, cargarLista, marcarEstudiante, marcarTodos, guardarMasivo,
  } = useListaDia();

  const handleCargar = async () => {
    if (!asignacionId || !fecha) return;
    await cargarLista(parseInt(asignacionId), fecha);
    setCargado(true);
  };

  const handleGuardar = () => guardarMasivo(parseInt(asignacionId), fecha);

  return (
    <Box sx={{ animation: `${fadeSlideIn} 0.4s ease-out` }}>
      {/* Controles de búsqueda */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <GrupoIcon sx={{ color: '#f59e0b' }} /> Configurar Pase de Lista
          </Typography>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid size={{xs:12,sm:4}}>
              <TextField
                label="ID Asignación Docente"
                value={asignacionId}
                onChange={e => setAsignacionId(e.target.value)}
                type="number"
                fullWidth
                size="small"
                helperText="Número de asignación docente"
              />
            </Grid>
            <Grid size={{xs:12,sm:4}}>
              <TextField
                label="Fecha"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{xs:12,sm:4}}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleCargar}
                disabled={!asignacionId || !fecha || isLoading}
                startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <ListaIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  borderRadius: 2,
                  '&:hover': { background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' },
                }}
              >
                Cargar Lista
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      {cargado && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: 'Total Estudiantes', value: estadisticas.total,       color: '#3b82f6', icon: <PersonIcon /> },
              { label: 'Ya Marcados',       value: estadisticas.ya_marcados, color: '#16a34a', icon: <CheckIcon /> },
              { label: 'Pendientes',        value: estadisticas.pendientes,  color: '#dc2626', icon: <WarningIcon /> },
            ].map((stat, i) => (
              <Grid size={{xs:12,sm:4}} key={i}>
                <Card sx={{ borderRadius: 3, textAlign: 'center', p: 1 }}>
                  <CardContent>
                    <Box sx={{ color: stat.color, mb: 0.5 }}>{stat.icon}</Box>
                    <Typography variant="h4" fontWeight={800} sx={{ color: stat.color }}>{stat.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Barra de progreso */}
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>Progreso de marcación</Typography>
                <Typography variant="body2" fontWeight={700} sx={{ color: '#f59e0b' }}>{porcentajeCompletado}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={porcentajeCompletado}
                sx={{
                  height: 10, borderRadius: 5,
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                    borderRadius: 5,
                  },
                }}
              />

              {/* Acciones rápidas */}
              <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center', mr: 1 }}>
                  Marcar todos:
                </Typography>
                {ESTADOS_ASISTENCIA.map(est => (
                  <Chip
                    key={est.value}
                    label={est.label}
                    clickable
                    size="small"
                    onClick={() => marcarTodos(est.value)}
                    sx={{ bgcolor: est.bgColor, color: est.color, fontWeight: 700, '&:hover': { opacity: 0.8 } }}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Tabla de estudiantes */}
          <Card sx={{ borderRadius: 3, mb: 3 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ background: isDark ? 'linear-gradient(135deg, #f59e0b22, #d97706)' : 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
                    <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Estudiante</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Código</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lista.map((est, idx) => (
                    <TableRow
                      key={est.matricula_id}
                      sx={{ '&:hover': { bgcolor: isDark ? '#1f293730' : '#fef9ec' } }}
                    >
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{idx + 1}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar src={est.estudiante_foto ?? undefined} sx={{ width: 32, height: 32, bgcolor: '#f59e0b', fontSize: 13 }}>
                            {est.estudiante_nombres[0]}{est.estudiante_apellidos[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {est.estudiante_apellidos}, {est.estudiante_nombres}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={est.estudiante_codigo} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {ESTADOS_ASISTENCIA.map(est_op => {
                            const actual = marcaciones[est.matricula_id]?.estado;
                            const selected = actual === est_op.value;
                            return (
                              <Chip
                                key={est_op.value}
                                label={est_op.label}
                                size="small"
                                clickable
                                onClick={() => marcarEstudiante(est.matricula_id, { matricula_id: est.matricula_id, estado: est_op.value })}
                                sx={{
                                  bgcolor:   selected ? est_op.bgColor  : 'transparent',
                                  color:     selected ? est_op.color    : 'text.secondary',
                                  border:    `1px solid ${selected ? est_op.color : '#d1d5db'}`,
                                  fontWeight: selected ? 700 : 400,
                                  fontSize: 11,
                                  transition: 'all 0.15s',
                                }}
                              />
                            );
                          })}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          {/* Botón guardar */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleGuardar}
              disabled={isSaving || Object.keys(marcaciones).length === 0}
              startIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : <EnviarIcon />}
              sx={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#fff',
                fontWeight: 700,
                px: 4,
                borderRadius: 2,
                '&:hover': { background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' },
              }}
            >
              {isSaving ? 'Guardando...' : `Guardar ${Object.keys(marcaciones).length} registros`}
            </Button>
          </Box>
        </>
      )}

      {!cargado && (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <ListaIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
          <Typography variant="h6" fontWeight={600}>Configura la asignación y fecha para cargar la lista</Typography>
        </Box>
      )}
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SECCIÓN 2: PERMISOS
// ═══════════════════════════════════════════════════════════════════

// Modal: ver detalle + historial
const PermisoDetalleModal: React.FC<{
  solicitud: SolicitudPermiso | null;
  open: boolean;
  onClose: () => void;
  onAprobar: (id: number) => void;
  onRechazar: (id: number) => void;
}> = ({ solicitud, open, onClose, onAprobar, onRechazar }) => {
  if (!solicitud) return null;
  const estado = getEstadoPermiso(solicitud.estado);
  const motivo = getMotivoPermiso(solicitud.motivo);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Solicitud {solicitud.codigo_solicitud}
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography fontWeight={600}>Estado</Typography>
            {estado && (
              <Chip label={estado.label} sx={{ bgcolor: estado.bgColor, color: estado.color, fontWeight: 700 }} />
            )}
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Estudiante</Typography>
            <Typography fontWeight={600}>{solicitud.estudiante_apellidos}, {solicitud.estudiante_nombres}</Typography>
            <Typography variant="caption" color="text.secondary">{solicitud.estudiante_codigo}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Tutor solicitante</Typography>
            <Typography>{solicitud.padre_nombres} {solicitud.padre_apellidos}</Typography>
            {solicitud.padre_telefono && <Typography variant="caption" color="text.secondary">{solicitud.padre_telefono}</Typography>}
          </Box>
          <Grid container spacing={2}>
            <Grid size={{sm:6}}>
              <Typography variant="caption" color="text.secondary">Fecha de ausencia</Typography>
              <Typography fontWeight={600}>{solicitud.fecha_ausencia}</Typography>
            </Grid>
            <Grid size={{sm:6}}>
              <Typography variant="caption" color="text.secondary">Tipo</Typography>
              <Typography>{solicitud.es_dia_completo ? 'Día completo' : `${solicitud.hora_inicio} - ${solicitud.hora_fin}`}</Typography>
            </Grid>
          </Grid>
          <Box>
            <Typography variant="caption" color="text.secondary">Motivo</Typography>
            <Typography>{motivo?.icon} {motivo?.label}</Typography>
            {solicitud.descripcion && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{solicitud.descripcion}</Typography>}
          </Box>
          {solicitud.materia_nombre && (
            <Box>
              <Typography variant="caption" color="text.secondary">Materia afectada</Typography>
              <Typography>{solicitud.materia_nombre}</Typography>
            </Box>
          )}
          {solicitud.motivo_rechazo && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              <Typography variant="caption" fontWeight={700}>Motivo de rechazo:</Typography>
              <Typography variant="body2">{solicitud.motivo_rechazo}</Typography>
            </Alert>
          )}
        </Stack>
      </DialogContent>
      {solicitud.estado === 'pendiente' && (
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<CloseIcon />}
            onClick={() => onRechazar(solicitud.id)}
          >
            Rechazar
          </Button>
          <Button
            variant="contained"
            startIcon={<CheckIcon />}
            onClick={() => onAprobar(solicitud.id)}
            sx={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff' }}
          >
            Aprobar
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

// Modal: rechazar con motivo
const RechazarModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: (motivo: string) => void;
  isLoading: boolean;
}> = ({ open, onClose, onConfirm, isLoading }) => {
  const [motivo, setMotivo] = useState('');
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle fontWeight={700}>Rechazar solicitud</DialogTitle>
      <DialogContent>
        <TextField
          label="Motivo de rechazo"
          multiline
          rows={3}
          fullWidth
          value={motivo}
          onChange={e => setMotivo(e.target.value)}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          color="error"
          disabled={!motivo.trim() || isLoading}
          onClick={() => { onConfirm(motivo); setMotivo(''); }}
        >
          Confirmar rechazo
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const GestionPermisos: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { solicitudes, paginacion, filters, isLoading, isSubmitting, actualizarFiltros, cambiarEstado } = useSolicitudesPermiso();

  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudPermiso | null>(null);
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [rechazarOpen, setRechazarOpen] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const handleAprobar = async (id: number) => {
    await cambiarEstado(id, { estado: 'aprobada' });
    setDetalleOpen(false);
  };

  const handleRechazarClick = (id: number) => {
    setPendingId(id);
    setDetalleOpen(false);
    setRechazarOpen(true);
  };

  const handleConfirmarRechazo = async (motivo: string) => {
    if (!pendingId) return;
    await cambiarEstado(pendingId, { estado: 'rechazada', motivo_rechazo: motivo });
    setRechazarOpen(false);
    setPendingId(null);
  };

  return (
    <Box sx={{ animation: `${fadeSlideIn} 0.4s ease-out` }}>
      {/* Filtros */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{xs:12,sm:4}}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filters.estado ?? ''}
                  label="Estado"
                  onChange={e => actualizarFiltros({ estado: e.target.value as any || undefined })}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {ESTADOS_PERMISO.map(e => (
                    <MenuItem key={e.value} value={e.value}>{e.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{xs:12,sm:3}}>
              <TextField
                label="Fecha desde"
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={filters.fecha_inicio ?? ''}
                onChange={e => actualizarFiltros({ fecha_inicio: e.target.value || undefined })}
              />
            </Grid>
            <Grid size={{xs:12,sm:3}}>
              <TextField
                label="Fecha hasta"
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={filters.fecha_fin ?? ''}
                onChange={e => actualizarFiltros({ fecha_fin: e.target.value || undefined })}
              />
            </Grid>
            <Grid size={{xs:12,sm:2}}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<FilterIcon />}
                onClick={() => actualizarFiltros({ estado: undefined, fecha_inicio: undefined, fecha_fin: undefined })}
                sx={{ borderColor: '#f59e0b', color: '#f59e0b' }}
              >
                Limpiar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabla */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: '#f59e0b' }} />
        </Box>
      ) : (
        <Card sx={{ borderRadius: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: isDark ? 'rgba(245,158,11,0.15)' : '#fef3c7' }}>
                  {['Código', 'Estudiante', 'Fecha Ausencia', 'Motivo', 'Tipo', 'Estado', 'Acciones'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {solicitudes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                      <PermisoIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1, display: 'block', mx: 'auto' }} />
                      No hay solicitudes para mostrar
                    </TableCell>
                  </TableRow>
                ) : solicitudes.map(sol => {
                  const estado = getEstadoPermiso(sol.estado);
                  const motivo = getMotivoPermiso(sol.motivo);
                  return (
                    <TableRow key={sol.id} sx={{ '&:hover': { bgcolor: isDark ? '#1f293730' : '#fef9ec' } }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700} sx={{ color: '#f59e0b' }}>
                          {sol.codigo_solicitud}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {sol.estudiante_apellidos}, {sol.estudiante_nombres}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{sol.estudiante_codigo}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2">{sol.fecha_ausencia}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{motivo?.icon} {motivo?.label}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={sol.es_dia_completo ? 'Día completo' : 'Parcial'}
                          size="small"
                          sx={{ fontSize: 11 }}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {estado && (
                          <Chip label={estado.label} size="small" sx={{ bgcolor: estado.bgColor, color: estado.color, fontWeight: 700 }} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Ver detalle">
                            <IconButton size="small" onClick={() => { setSelectedSolicitud(sol); setDetalleOpen(true); }}>
                              <VerIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {sol.estado === 'pendiente' && (
                            <>
                              <Tooltip title="Aprobar">
                                <IconButton size="small" sx={{ color: '#16a34a' }} onClick={() => handleAprobar(sol.id)}>
                                  <CheckIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Rechazar">
                                <IconButton size="small" sx={{ color: '#dc2626' }} onClick={() => handleRechazarClick(sol.id)}>
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Paginación */}
          {paginacion.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <Pagination
                count={paginacion.totalPages}
                page={paginacion.page}
                onChange={(_, p) => actualizarFiltros({ page: p })}
                sx={{ '& .MuiPaginationItem-root.Mui-selected': { bgcolor: '#f59e0b', color: '#fff' } }}
              />
            </Box>
          )}
        </Card>
      )}

      {/* Modales */}
      <PermisoDetalleModal
        solicitud={selectedSolicitud}
        open={detalleOpen}
        onClose={() => setDetalleOpen(false)}
        onAprobar={handleAprobar}
        onRechazar={handleRechazarClick}
      />
      <RechazarModal
        open={rechazarOpen}
        onClose={() => setRechazarOpen(false)}
        onConfirm={handleConfirmarRechazo}
        isLoading={isSubmitting}
      />
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SECCIÓN 3: HISTORIAL DE ASISTENCIA
// ═══════════════════════════════════════════════════════════════════
const HistorialAsistencia: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { asistencias, paginacion, filters, isLoading, actualizarFiltros } = useAsistencia();

  return (
    <Box sx={{ animation: `${fadeSlideIn} 0.4s ease-out` }}>
      {/* Filtros */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{xs:12,sm:3}}>
              <TextField
                label="Matrícula ID"
                type="number"
                size="small"
                fullWidth
                value={filters.matricula_id ?? ''}
                onChange={e => actualizarFiltros({ matricula_id: e.target.value ? parseInt(e.target.value) : undefined })}
              />
            </Grid>
            <Grid size={{xs:12,sm:3}}>
              <TextField
                label="Fecha"
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={filters.fecha ?? ''}
                onChange={e => actualizarFiltros({ fecha: e.target.value || undefined })}
              />
            </Grid>
            <Grid size={{xs:12,sm:3}}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filters.estado ?? ''}
                  label="Estado"
                  onChange={e => actualizarFiltros({ estado: e.target.value as EstadoAsistencia || undefined })}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {ESTADOS_ASISTENCIA.map(e => (
                    <MenuItem key={e.value} value={e.value}>{e.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{xs:12,sm:3}}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<FilterIcon />}
                onClick={() => actualizarFiltros({ matricula_id: undefined, fecha: undefined, estado: undefined })}
                sx={{ borderColor: '#f59e0b', color: '#f59e0b', height: '40px' }}
              >
                Limpiar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: '#f59e0b' }} />
        </Box>
      ) : (
        <Card sx={{ borderRadius: 3 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ background: isDark ? 'rgba(245,158,11,0.15)' : '#fef3c7' }}>
                  {['Estudiante', 'Materia', 'Fecha', 'Estado', 'Hora', 'Registrado por', 'Permiso'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {asistencias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                      <HistoryIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1, display: 'block', mx: 'auto' }} />
                      No hay registros para mostrar
                    </TableCell>
                  </TableRow>
                ) : asistencias.map(a => (
                  <TableRow key={a.id} sx={{ '&:hover': { bgcolor: isDark ? '#1f293730' : '#fef9ec' } }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {a.estudiante_apellidos}, {a.estudiante_nombres}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{a.estudiante_codigo}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{a.materia_nombre}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{a.fecha}</Typography>
                    </TableCell>
                    <TableCell>
                      <EstadoChip estado={a.estado} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{a.hora_marcacion}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">{a.marcado_por_username}</Typography>
                    </TableCell>
                    <TableCell>
                      {a.permiso_codigo && (
                        <Chip label={a.permiso_codigo} size="small" variant="outlined" sx={{ fontSize: 10, color: '#2563eb' }} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {paginacion.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <Pagination
                count={paginacion.totalPages}
                page={paginacion.page}
                onChange={(_, p) => actualizarFiltros({ page: p })}
                sx={{ '& .MuiPaginationItem-root.Mui-selected': { bgcolor: '#f59e0b', color: '#fff' } }}
              />
            </Box>
          )}
        </Card>
      )}
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SECCIÓN 4: REPORTE
// ═══════════════════════════════════════════════════════════════════
const ReporteAsistenciaView: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { reporte, isLoading, totalGeneral, promedioAsistencia, cargarReporte } = useReporteAsistencia();

  const [matriculaId, setMatriculaId] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin]       = useState('');

  const handleGenerar = () => {
    if (!matriculaId) return;
    cargarReporte(parseInt(matriculaId), {
      fecha_inicio: fechaInicio || undefined,
      fecha_fin:    fechaFin    || undefined,
    });
  };

  return (
    <Box sx={{ animation: `${fadeSlideIn} 0.4s ease-out` }}>
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReporteIcon sx={{ color: '#f59e0b' }} /> Generar Reporte
          </Typography>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid size={{xs:12,sm:3}}>
              <TextField label="Matrícula ID" type="number" size="small" fullWidth value={matriculaId} onChange={e => setMatriculaId(e.target.value)} />
            </Grid>
            <Grid size={{xs:12,sm:3}}>
              <TextField label="Fecha inicio" type="date" size="small" fullWidth InputLabelProps={{ shrink: true }} value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
            </Grid>
            <Grid size={{xs:12,sm:3}}>
              <TextField label="Fecha fin" type="date" size="small" fullWidth InputLabelProps={{ shrink: true }} value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
            </Grid>
            <Grid size={{xs:12,sm:3}}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleGenerar}
                disabled={!matriculaId || isLoading}
                startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <ReporteIcon />}
                sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', fontWeight: 700, borderRadius: 2 }}
              >
                Generar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {reporte.length > 0 && (
        <>
          {/* Resumen global */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{xs:12,sm:3}}>
              <Card sx={{ borderRadius: 3, textAlign: 'center', p: 1, borderTop: '4px solid #3b82f6' }}>
                <CardContent sx={{ py: 1.5 }}>
                  <Typography variant="h4" fontWeight={800} sx={{ color: '#3b82f6' }}>{totalGeneral.total_clases}</Typography>
                  <Typography variant="caption" color="text.secondary">Total Clases</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{xs:12,sm:3}}>
              <Card sx={{ borderRadius: 3, textAlign: 'center', p: 1, borderTop: '4px solid #16a34a' }}>
                <CardContent sx={{ py: 1.5 }}>
                  <Typography variant="h4" fontWeight={800} sx={{ color: '#16a34a' }}>{totalGeneral.presentes}</Typography>
                  <Typography variant="caption" color="text.secondary">Presentes</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{xs:12,sm:3}}>
              <Card sx={{ borderRadius: 3, textAlign: 'center', p: 1, borderTop: '4px solid #dc2626' }}>
                <CardContent sx={{ py: 1.5 }}>
                  <Typography variant="h4" fontWeight={800} sx={{ color: '#dc2626' }}>{totalGeneral.ausentes}</Typography>
                  <Typography variant="caption" color="text.secondary">Ausentes</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{xs:12,sm:3}}>
              <Card sx={{ borderRadius: 3, textAlign: 'center', p: 1, borderTop: '4px solid #f59e0b' }}>
                <CardContent sx={{ py: 1.5 }}>
                  <Typography variant="h4" fontWeight={800} sx={{ color: '#f59e0b' }}>{promedioAsistencia}%</Typography>
                  <Typography variant="caption" color="text.secondary">% Promedio</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabla por materia */}
          <Card sx={{ borderRadius: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: isDark ? 'rgba(245,158,11,0.15)' : '#fef3c7' }}>
                    {['Materia', 'Total', 'Presentes', 'Ausentes', 'Tardanzas', 'Justificados', '% Asistencia'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reporte.map((r, i) => (
                    <TableRow key={i} sx={{ '&:hover': { bgcolor: isDark ? '#1f293730' : '#fef9ec' } }}>
                      <TableCell><Typography fontWeight={600}>{r.materia_nombre}</Typography></TableCell>
                      <TableCell>{r.total_clases}</TableCell>
                      <TableCell><Typography sx={{ color: '#16a34a', fontWeight: 600 }}>{r.presentes}</Typography></TableCell>
                      <TableCell><Typography sx={{ color: '#dc2626', fontWeight: 600 }}>{r.ausentes}</Typography></TableCell>
                      <TableCell><Typography sx={{ color: '#d97706', fontWeight: 600 }}>{r.tardanzas}</Typography></TableCell>
                      <TableCell><Typography sx={{ color: '#2563eb', fontWeight: 600 }}>{r.justificados}</Typography></TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={Number(r.porcentaje_asistencia)}
                            sx={{
                              flex: 1, height: 8, borderRadius: 4,
                              bgcolor: '#f3f4f6',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: Number(r.porcentaje_asistencia) >= 70 ? '#16a34a' : '#dc2626',
                                borderRadius: 4,
                              },
                            }}
                          />
                          <Typography variant="body2" fontWeight={700} sx={{ minWidth: 40 }}>
                            {r.porcentaje_asistencia}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </>
      )}

      {reporte.length === 0 && !isLoading && (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <ReporteIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
          <Typography variant="h6" fontWeight={600}>Ingresa una matrícula y genera el reporte</Typography>
        </Box>
      )}
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════════════
export const Asistencia: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [activeTab, setActiveTab] = useState(0);

  // Conteo de permisos pendientes para el badge
  const { solicitudes } = useSolicitudesPermiso({ estado: 'pendiente', limit: 100 });
  const pendientes = solicitudes.length;

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, md: 0 }, mb: 3 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <AsistenciaIcon
                    sx={{
                      color: isDark ? '#facc15' : '#f59e0b',
                      fontSize: 36,
                      animation: `${bounce} 1.5s infinite`,
                    }}
                  />
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                      fontWeight: 800,
                      background: isDark
                        ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                        : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Gestión de Asistencia
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, letterSpacing: 0.3 }}>
                  Pase de lista, permisos y reportes de asistencia estudiantil.
                </Typography>
              </Box>
            </Box>

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                background: isDark
                  ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                  : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '16px',
                p: 1,
                '& .MuiTab-root': {
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 48,
                  color: isDark ? '#000' : '#fff',
                  fontSize: { xs: '0.75rem', md: '0.875rem' },
                },
                '& .Mui-selected': { color: isDark ? '#fff' : '#fff' },
                '& .MuiTabs-indicator': { backgroundColor: '#fff', height: 3, borderRadius: '3px 3px 0 0' },
              }}
            >
              <Tab icon={<ListaIcon />}     iconPosition="start" label="Pase de Lista" />
              <Tab
                icon={
                  <Badge badgeContent={pendientes} color="error" max={99}>
                    <PermisoIcon />
                  </Badge>
                }
                iconPosition="start"
                label="Permisos"
              />
              <Tab icon={<HistoryIcon />}   iconPosition="start" label="Historial" />
              <Tab icon={<ReporteIcon />}   iconPosition="start" label="Reportes" />
            </Tabs>
          </Box>
        </Fade>

        {/* Panels */}
        <TabPanel value={activeTab} index={0}><PaseDeLista /></TabPanel>
        <TabPanel value={activeTab} index={1}><GestionPermisos /></TabPanel>
        <TabPanel value={activeTab} index={2}><HistorialAsistencia /></TabPanel>
        <TabPanel value={activeTab} index={3}><ReporteAsistenciaView /></TabPanel>
      </Container>
    </Box>
  );
};

export default Asistencia;