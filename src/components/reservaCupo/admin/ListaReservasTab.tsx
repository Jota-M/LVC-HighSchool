// src/components/reservaCupo/admin/ListaReservasTab.tsx
'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Skeleton,
  Stack,
  Alert,
  Fade,
  Badge,
  alpha,
  useTheme,
} from '@mui/material';
import {
  BookmarkAdded as BookmarkAddedIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  PictureAsPdf as PdfIcon,
  Print as PrintIcon,
  WhatsApp as WhatsAppIcon,
  School as SchoolIcon,
  CancelOutlined as CancelIcon,
  WarningAmber as WarningAmberIcon,
  RestartAlt as RestartAltIcon,
  Close as CloseIcon,
  ChevronRight as ChevronRightIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { ReservaCupoData } from '@/types/reservaCupoTypes';
import { getNivelColor, getInitials, getEstadoBadgeConfig, usePalette } from './common';

interface ListaReservasTabProps {
  reservas: ReservaCupoData[];
  isLoading: boolean;
  viewMode: 'cards' | 'table';
  grados: any[];
  turnos: any[];
  nivelesAcademicos: { id: number; nombre: string }[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  gradoFilter: number | '';
  setGradoFilter: (grado: number | '') => void;
  nivelFilter: number | '';
  setNivelFilter: (nivel: number | '') => void;
  turnoFilter: number | '';
  setTurnoFilter: (turno: number | '') => void;
  estadoFilter: string;
  setEstadoFilter: (estado: string) => void;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  onDescargarPDF: (codigoReserva: string) => void;
  onImprimir: (codigoReserva: string) => void;
  onWhatsApp: (reserva: ReservaCupoData) => void;
  onAbrirAnular: (reserva: ReservaCupoData) => void;
  onAbrirReactivar: (reserva: ReservaCupoData) => void;
}

export const ListaReservasTab: React.FC<ListaReservasTabProps> = ({
  reservas,
  isLoading,
  viewMode,
  grados,
  turnos,
  nivelesAcademicos,
  searchTerm,
  setSearchTerm,
  gradoFilter,
  setGradoFilter,
  nivelFilter,
  setNivelFilter,
  turnoFilter,
  setTurnoFilter,
  estadoFilter,
  setEstadoFilter,
  page,
  setPage,
  totalPages,
  onDescargarPDF,
  onImprimir,
  onWhatsApp,
  onAbrirAnular,
  onAbrirReactivar,
}) => {
  const { theme, isDark, gold: accentColor, gradBg } = usePalette();

  return (
    <Box>
      {/* BARRA DE FILTROS Y BÚSQUEDA (Estilo Docente Calificaciones / Notas) */}
      <Box
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 3,
          borderRadius: '18px',
          bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
          border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
          boxShadow: isDark
            ? '0 4px 20px rgba(0,0,0,0.2)'
            : '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por estudiante, CI, código, tutor o teléfono..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: accentColor, fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                  bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                  '& fieldset': {
                    borderColor: alpha(isDark ? '#fff' : '#000', 0.1),
                  },
                  '&:hover fieldset': {
                    borderColor: alpha(accentColor, 0.4),
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: accentColor,
                  },
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 1.8 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Nivel Educativo</InputLabel>
              <Select
                value={nivelFilter}
                label="Nivel Educativo"
                onChange={(e) => {
                  setNivelFilter(e.target.value as number | '');
                  setPage(1);
                }}
                sx={{
                  borderRadius: '14px',
                  bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(isDark ? '#fff' : '#000', 0.1),
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(accentColor, 0.4),
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: accentColor,
                  },
                }}
              >
                <MenuItem value="">Todos los niveles</MenuItem>
                {nivelesAcademicos.map((n) => (
                  <MenuItem key={n.id} value={n.id}>
                    {n.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Grado Destino</InputLabel>
              <Select
                value={gradoFilter}
                label="Grado Destino"
                onChange={(e) => {
                  setGradoFilter(e.target.value as number | '');
                  setPage(1);
                }}
                sx={{
                  borderRadius: '14px',
                  bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(isDark ? '#fff' : '#000', 0.1),
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(accentColor, 0.4),
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: accentColor,
                  },
                }}
              >
                <MenuItem value="">Todos los grados</MenuItem>
                {grados.map((g) => (
                  <MenuItem key={g.id} value={g.id}>
                    {g.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 1.8 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Turno</InputLabel>
              <Select
                value={turnoFilter}
                label="Turno"
                onChange={(e) => {
                  setTurnoFilter(e.target.value as number | '');
                  setPage(1);
                }}
                sx={{
                  borderRadius: '14px',
                  bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(isDark ? '#fff' : '#000', 0.1),
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(accentColor, 0.4),
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: accentColor,
                  },
                }}
              >
                <MenuItem value="">Todos los turnos</MenuItem>
                {turnos.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.nombre.toLowerCase().includes('mañana') ? '☀️ ' : '🌅 '}
                    Turno {t.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado / Decisión</InputLabel>
              <Select
                value={estadoFilter}
                label="Estado / Decisión"
                onChange={(e) => {
                  setEstadoFilter(e.target.value);
                  setPage(1);
                }}
                sx={{
                  borderRadius: '14px',
                  bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(isDark ? '#fff' : '#000', 0.1),
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(accentColor, 0.4),
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: accentColor,
                  },
                }}
              >
                <MenuItem value="">Todos los estados</MenuItem>
                <MenuItem value="confirmada">Confirmada (Continuará)</MenuItem>
                <MenuItem value="no_continua">No Continuará (Liberado)</MenuItem>
                <MenuItem value="solicitud_anulacion">Solicitud de Anulación</MenuItem>
                <MenuItem value="anulada">Anulada / Cancelada</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 1.4 }}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              startIcon={<ClearIcon sx={{ fontSize: 16 }} />}
              onClick={() => {
                setSearchTerm('');
                setGradoFilter('');
                setNivelFilter('');
                setTurnoFilter('');
                setEstadoFilter('');
                setPage(1);
              }}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                py: 0.85,
                borderColor: alpha(accentColor, 0.35),
                color: accentColor,
                bgcolor: isDark ? alpha(accentColor, 0.08) : alpha(accentColor, 0.05),
                '&:hover': {
                  bgcolor: isDark ? alpha(accentColor, 0.16) : alpha(accentColor, 0.12),
                  borderColor: accentColor,
                },
              }}
            >
              Limpiar
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* CONTENIDO: CARDS (POR DEFECTO) O TABLA */}
      {isLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Skeleton height={280} sx={{ borderRadius: '20px' }} />
            </Grid>
          ))}
        </Grid>
      ) : reservas.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: '18px',
            bgcolor: isDark ? 'rgba(30, 41, 59, 0.4)' : '#ffffff',
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          }}
        >
          <BookmarkAddedIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 1 }} />
          <Typography variant="h6" fontWeight={700} color="text.secondary">
            No se encontraron reservas de cupo
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {searchTerm || gradoFilter || nivelFilter
              ? 'Intenta ajustar los criterios de búsqueda o limpiar los filtros.'
              : 'Aún no se han registrado reservas para la Gestión 2027.'}
          </Typography>
        </Paper>
      ) : viewMode === 'cards' ? (
        /* ─── VISTA CARDS (Estilo exacto Docente Notas / Calificaciones) ─── */
        <Grid container spacing={3}>
          {reservas.map((r) => {
            const nivelColor = getNivelColor(r.nivel_destino_nombre);
            const isNoContinua = r.estado === 'no_continua';
            const isSolicitudAnulacion = r.estado === 'solicitud_anulacion';
            const estadoCfg = getEstadoBadgeConfig(r.estado);

            const cardAccent = isNoContinua
              ? '#ef4444'
              : isSolicitudAnulacion
                ? '#f59e0b'
                : accentColor;

            return (
              <Grid key={r.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Fade in timeout={300}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: '18px',
                      border: `1px solid ${
                        isNoContinua
                          ? alpha('#ef4444', 0.4)
                          : isSolicitudAnulacion
                            ? alpha('#f59e0b', 0.5)
                            : alpha(isDark ? '#fff' : '#000', 0.08)
                      }`,
                      bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'visible',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: `0 10px 22px ${alpha(cardAccent, 0.18)}`,
                        borderColor: cardAccent,
                        '& .btn-gestionar': {
                          backgroundColor: alpha(cardAccent, 0.15),
                          borderColor: cardAccent,
                          transform: 'translateX(2px)',
                        },
                      },
                    }}
                    onClick={() => onImprimir(r.codigo_reserva)}
                  >
                    {/* Badge de Turno / Destino arriba a la izquierda */}
                    <Chip
                      label={
                        r.turno_destino_nombre
                          ? r.turno_destino_nombre.toLowerCase().includes('mañana')
                            ? '☀️ Turno Mañana'
                            : '🌅 Turno Tarde'
                          : (r.grado_destino_nombre || 'Destino')
                      }
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        zIndex: 1,
                        fontWeight: 700,
                        fontSize: '0.68rem',
                        height: 22,
                        backgroundColor: isDark ? 'rgba(250, 204, 21, 0.15)' : 'rgba(2, 136, 209, 0.12)',
                        color: accentColor,
                        border: `1px solid ${alpha(accentColor, 0.25)}`,
                      }}
                    />

                    {/* Chips de Estado y Gestión 2027 arriba a la derecha */}
                    <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1, display: 'flex', gap: 0.6 }}>
                      <Chip
                        icon={estadoCfg.icon}
                        label={estadoCfg.label}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.65rem',
                          height: 22,
                          backgroundColor: estadoCfg.bg,
                          color: estadoCfg.color,
                          border: `1px solid ${alpha(estadoCfg.color, 0.25)}`,
                          '& .MuiChip-icon': { ml: 0.4 },
                        }}
                      />
                      <Chip
                        label="2027"
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.65rem',
                          height: 22,
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
                          color: 'text.secondary',
                          border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                        }}
                      />
                    </Box>

                    <CardContent sx={{ p: 2.2, pt: 4.8, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Avatar mediano centrado con badge de nivel */}
                      <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center' }}>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            <Tooltip title={`Grado: ${r.grado_destino_nombre}`}>
                              <Chip
                                icon={<SchoolIcon sx={{ fontSize: 11, color: isDark ? '#000' : '#fff' }} />}
                                label={r.grado_destino_nombre?.split(' ')[0] || 'Destino'}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontWeight: 700,
                                  fontSize: '0.6rem',
                                  bgcolor: nivelColor,
                                  color: '#ffffff',
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                                  '& .MuiChip-icon': { ml: 0.4, color: '#ffffff' },
                                }}
                              />
                            </Tooltip>
                          }
                        >
                          <Avatar
                            src={r.estudiante_foto_url || undefined}
                            sx={{
                              width: 72,
                              height: 72,
                              margin: '0 auto',
                              bgcolor: cardAccent,
                              color: isNoContinua || isSolicitudAnulacion ? '#ffffff' : (isDark ? '#000' : '#fff'),
                              border: `3px solid ${alpha(cardAccent, 0.2)}`,
                              boxShadow: `0 6px 14px ${alpha(cardAccent, 0.25)}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '1.4rem',
                            }}
                          >
                            {!r.estudiante_foto_url && getInitials(r.estudiante_nombres, r.estudiante_apellido_paterno)}
                          </Avatar>
                        </Badge>
                      </Box>

                      {/* Nombre del Estudiante */}
                      <Typography variant="subtitle1" fontWeight={800} gutterBottom sx={{ fontSize: '1.02rem', lineHeight: 1.25, mb: 0.3 }}>
                        {r.estudiante_nombre_completo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" gutterBottom fontWeight={600} sx={{ fontSize: '0.78rem' }}>
                        {r.grado_destino_nombre} {r.grado_actual_nombre ? `· (Actual: ${r.grado_actual_nombre})` : ''}
                      </Typography>

                      {/* Chips de CI y Código de Reserva Monospace */}
                      <Box sx={{ my: 0.8, display: 'flex', justifyContent: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                        <Chip
                          label={`CI: ${r.estudiante_ci || 'S/N'}`}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.68rem',
                            height: 22,
                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                          }}
                        />
                        <Chip
                          label={r.codigo_reserva}
                          size="small"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: '0.68rem',
                            height: 22,
                            backgroundColor: isDark ? 'rgba(250, 204, 21, 0.1)' : 'rgba(2, 136, 209, 0.1)',
                            color: accentColor,
                          }}
                        />
                      </Box>

                      {/* Botón de acción directo .btn-gestionar */}
                      <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                        <Button
                          className="btn-gestionar"
                          size="small"
                          variant="outlined"
                          endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            onImprimir(r.codigo_reserva);
                          }}
                          sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.74rem',
                            px: 1.8,
                            py: 0.4,
                            borderColor: alpha(accentColor, 0.35),
                            color: accentColor,
                            transition: 'all 0.2s ease',
                          }}
                        >
                          Ver Recibo Digital
                        </Button>
                      </Box>

                      {/* Información adicional y pie de card */}
                      <Box
                        sx={{
                          mt: 'auto',
                          pt: 1.5,
                          borderTop: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.8,
                          textAlign: 'left',
                        }}
                      >
                        {/* Tutor / Persona a cargo */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <PersonIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                          <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                            {r.tutor_parentesco || 'Tutor'}:
                          </Typography>
                          <Typography variant="caption" fontWeight={700} noWrap sx={{ ml: 'auto', fontSize: '0.74rem', maxWidth: '60%' }}>
                            {r.tutor_nombre}
                          </Typography>
                        </Box>

                        {/* Contacto */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Typography variant="caption" sx={{ fontSize: 13, lineHeight: 1 }}>📱</Typography>
                          <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                            Contacto:
                          </Typography>
                          <Typography variant="caption" fontWeight={700} sx={{ ml: 'auto', fontSize: '0.74rem' }}>
                            {r.tutor_telefono || 'S/N'}
                          </Typography>
                        </Box>

                        {/* Alertas contextuales */}
                        {r.motivo_no_continua && (
                          <Alert
                            severity="error"
                            icon={<CancelIcon fontSize="inherit" />}
                            sx={{ py: 0.2, px: 1, fontSize: '0.7rem', borderRadius: '8px' }}
                          >
                            <strong>No continúa:</strong> {r.motivo_no_continua}
                          </Alert>
                        )}
                        {r.motivo_anulacion && (
                          <Alert
                            severity={r.estado === 'solicitud_anulacion' ? 'warning' : 'info'}
                            icon={r.estado === 'solicitud_anulacion' ? <WarningAmberIcon fontSize="inherit" /> : <CloseIcon fontSize="inherit" />}
                            sx={{ py: 0.2, px: 1, fontSize: '0.7rem', borderRadius: '8px' }}
                          >
                            <strong>{r.estado === 'solicitud_anulacion' ? 'Solicitud:' : 'Motivo anulación:'}</strong> {r.motivo_anulacion}
                          </Alert>
                        )}

                        {/* Barra de Acciones con IconButtons */}
                        <Stack
                          direction="row"
                          spacing={0.8}
                          justifyContent="center"
                          sx={{ pt: 0.8, borderTop: `1px dashed ${alpha(isDark ? '#fff' : '#000', 0.06)}` }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Tooltip title="Descargar PDF">
                            <IconButton
                              size="small"
                              onClick={() => onDescargarPDF(r.codigo_reserva)}
                              sx={{
                                bgcolor: alpha('#ef4444', 0.1),
                                color: '#ef4444',
                                borderRadius: '8px',
                                p: 0.7,
                                '&:hover': { bgcolor: alpha('#ef4444', 0.2) },
                              }}
                            >
                              <PdfIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Imprimir Recibo">
                            <IconButton
                              size="small"
                              onClick={() => onImprimir(r.codigo_reserva)}
                              sx={{
                                bgcolor: alpha(accentColor, 0.1),
                                color: accentColor,
                                borderRadius: '8px',
                                p: 0.7,
                                '&:hover': { bgcolor: alpha(accentColor, 0.2) },
                              }}
                            >
                              <PrintIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="WhatsApp">
                            <IconButton
                              size="small"
                              onClick={() => onWhatsApp(r)}
                              sx={{
                                bgcolor: alpha('#16a34a', 0.1),
                                color: '#16a34a',
                                borderRadius: '8px',
                                p: 0.7,
                                '&:hover': { bgcolor: alpha('#16a34a', 0.2) },
                              }}
                            >
                              <WhatsAppIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>

                          {r.estado === 'confirmada' && (
                            <Tooltip title="Anular Reserva">
                              <IconButton
                                size="small"
                                onClick={() => onAbrirAnular(r)}
                                sx={{
                                  bgcolor: alpha('#ef4444', 0.1),
                                  color: '#ef4444',
                                  borderRadius: '8px',
                                  p: 0.7,
                                  '&:hover': { bgcolor: alpha('#ef4444', 0.25) },
                                }}
                              >
                                <CancelIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          )}

                          {r.estado === 'solicitud_anulacion' && (
                            <Tooltip title="Revisar Solicitud de Anulación">
                              <IconButton
                                size="small"
                                onClick={() => onAbrirAnular(r)}
                                sx={{
                                  bgcolor: alpha('#f59e0b', 0.15),
                                  color: '#f59e0b',
                                  borderRadius: '8px',
                                  p: 0.7,
                                  '&:hover': { bgcolor: alpha('#f59e0b', 0.3) },
                                }}
                              >
                                <WarningAmberIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          )}

                          {(r.estado === 'anulada' || r.estado === 'cancelada' || r.estado === 'no_continua') && (
                            <Tooltip title="Reactivar Reserva">
                              <IconButton
                                size="small"
                                onClick={() => onAbrirReactivar(r)}
                                sx={{
                                  bgcolor: alpha('#10b981', 0.15),
                                  color: '#10b981',
                                  borderRadius: '8px',
                                  p: 0.7,
                                  '&:hover': { bgcolor: alpha('#10b981', 0.3) },
                                }}
                              >
                                <RestartAltIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        /* ─── VISTA TABLA (Data Grid clásico) ─── */
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: '18px',
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff',
          }}
        >
          <Table>
            <TableHead sx={{ bgcolor: isDark ? 'rgba(15, 23, 42, 0.7)' : '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Estudiante</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Código / CI</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Destino 2027</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Persona que Reservó</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Contacto</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservas.map((r) => {
                const nivelColor = getNivelColor(r.nivel_destino_nombre);
                const isNoContinua = r.estado === 'no_continua';
                const isSolicitudAnulacion = r.estado === 'solicitud_anulacion';

                return (
                  <TableRow
                    key={r.id}
                    hover
                    sx={{
                      bgcolor: isNoContinua
                        ? (isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)')
                        : isSolicitudAnulacion
                          ? (isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.06)')
                          : 'transparent',
                      borderLeft: isNoContinua
                        ? '4px solid #ef4444'
                        : isSolicitudAnulacion
                          ? '4px solid #f59e0b'
                          : '4px solid transparent',
                      '&:hover': {
                        bgcolor: isNoContinua
                          ? (isDark ? 'rgba(239, 68, 68, 0.18)' : 'rgba(239, 68, 68, 0.09)')
                          : isSolicitudAnulacion
                            ? (isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.11)')
                            : (isDark ? 'rgba(250, 204, 21, 0.05)' : 'rgba(2, 136, 209, 0.04)'),
                      },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={r.estudiante_foto_url || undefined}
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: isDark ? '#facc15' : '#0288d1',
                            color: isDark ? '#000' : '#fff',
                            fontWeight: 800,
                            fontSize: '0.9rem',
                          }}
                        >
                          {!r.estudiante_foto_url && getInitials(r.estudiante_nombres, r.estudiante_apellido_paterno)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={800}>
                            {r.estudiante_nombre_completo}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Reserva: <strong>{r.codigo_reserva}</strong>
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {r.estudiante_ci}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Cód: {r.estudiante_codigo}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
                        <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', flexWrap: 'wrap' }}>
                          <Chip
                            size="small"
                            label={r.grado_destino_nombre}
                            sx={{
                              bgcolor: nivelColor,
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              borderRadius: '8px',
                            }}
                          />
                          {r.turno_destino_nombre && (
                            <Chip
                              size="small"
                              label={r.turno_destino_nombre.toLowerCase().includes('mañana') ? '☀️ Mañana' : '🌅 Tarde'}
                              sx={{
                                height: 20,
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                bgcolor: r.turno_destino_nombre.toLowerCase().includes('mañana') ? alpha('#10b981', 0.15) : alpha('#f59e0b', 0.15),
                                color: r.turno_destino_nombre.toLowerCase().includes('mañana') ? '#10b981' : '#f59e0b',
                              }}
                            />
                          )}
                        </Box>
                        {r.grado_actual_nombre && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            De: {r.grado_actual_nombre}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {r.tutor_nombre}
                      </Typography>
                      <Chip
                        size="small"
                        label={r.tutor_parentesco}
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          bgcolor: isDark ? alpha('#facc15', 0.15) : alpha('#0288d1', 0.12),
                          color: isDark ? '#facc15' : '#0288d1',
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" fontWeight={700} display="block">
                        📱 {r.tutor_telefono}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        CI: {r.tutor_ci}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {(() => {
                        const estadoCfg = getEstadoBadgeConfig(r.estado);
                        return (
                          <Box>
                            <Chip
                              size="small"
                              icon={estadoCfg.icon}
                              label={estadoCfg.label}
                              sx={{
                                bgcolor: estadoCfg.bg,
                                color: estadoCfg.color,
                                fontWeight: 800,
                                fontSize: '0.72rem',
                                borderRadius: '6px',
                                border: `1px solid ${alpha(estadoCfg.color, 0.25)}`,
                                '& .MuiChip-icon': { ml: 0.5 },
                              }}
                            />
                            {r.motivo_no_continua && (
                              <Typography variant="caption" sx={{ display: 'block', color: 'error.main', fontSize: '0.68rem', mt: 0.5, maxWidth: 160 }}>
                                {r.motivo_no_continua}
                              </Typography>
                            )}
                            {r.motivo_anulacion && (
                              <Typography variant="caption" sx={{ display: 'block', color: 'warning.main', fontSize: '0.68rem', mt: 0.5, maxWidth: 160 }}>
                                {r.motivo_anulacion}
                              </Typography>
                            )}
                          </Box>
                        );
                      })()}
                    </TableCell>

                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="Descargar Recibo en PDF">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => onDescargarPDF(r.codigo_reserva)}
                          >
                            <PdfIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Ver / Imprimir Recibo">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => onImprimir(r.codigo_reserva)}
                          >
                            <PrintIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Contactar por WhatsApp">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => onWhatsApp(r)}
                          >
                            <WhatsAppIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {r.estado === 'confirmada' && (
                          <Tooltip title="Anular Reserva">
                            <IconButton
                              size="small"
                              sx={{ color: '#ef4444' }}
                              onClick={() => onAbrirAnular(r)}
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {r.estado === 'solicitud_anulacion' && (
                          <Tooltip title="Revisar y Anular Solicitud">
                            <IconButton
                              size="small"
                              sx={{ color: '#f59e0b', bgcolor: alpha('#f59e0b', 0.1) }}
                              onClick={() => onAbrirAnular(r)}
                            >
                              <WarningAmberIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {(r.estado === 'anulada' || r.estado === 'cancelada' || r.estado === 'no_continua') && (
                          <Tooltip title="Reactivar / Restablecer Reserva">
                            <IconButton
                              size="small"
                              sx={{ color: '#10b981', bgcolor: alpha('#10b981', 0.1) }}
                              onClick={() => onAbrirReactivar(r)}
                            >
                              <RestartAltIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => setPage(p)}
            color="primary"
            shape="rounded"
            size="large"
            sx={{
              '& .Mui-selected': {
                bgcolor: isDark ? '#facc15 !important' : '#0288d1 !important',
                color: isDark ? '#000 !important' : '#fff !important',
                fontWeight: 800,
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};
