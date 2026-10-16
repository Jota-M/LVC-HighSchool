// src/components/reservaCupo/admin/CuposAseguradosTab.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Chip,
  Card,
  CardContent,
  Avatar,
  Badge,
  Fade,
  LinearProgress,
  Tooltip,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  HowToReg as HowToRegIcon,
  Refresh as RefreshIcon,
  Group as GroupIcon,
  Verified as VerifiedIcon,
  PendingActions as PendingActionsIcon,
  CancelOutlined as CancelIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  ListAlt as ListAltIcon,
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  ChevronRight as ChevronRightIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';
import { BalanceCuposAseguradosData, BalanceCupoGrado, EstadoCampanaWhatsApp } from '@/services/reservaCupoService';
import { getNivelColor, usePalette } from './common';

interface CuposAseguradosTabProps {
  balanceAsegurados: BalanceCuposAseguradosData | null;
  loadingBalance: boolean;
  estadoCampana?: EstadoCampanaWhatsApp | null;
  onRefresh: () => void;
  onAbrirDetalleGrado: (grado: BalanceCupoGrado) => void;
  onEmitirReporte: (gradoId: number) => void;
  onAbrirCampanaWhatsApp?: () => void;
  onDetenerCampana?: () => void;
}

export const CuposAseguradosTab: React.FC<CuposAseguradosTabProps> = ({
  balanceAsegurados,
  loadingBalance,
  estadoCampana = null,
  onRefresh,
  onAbrirDetalleGrado,
  onEmitirReporte,
  onAbrirCampanaWhatsApp,
  onDetenerCampana,
}) => {
  const { theme, isDark, gold: accentColor, gradBg } = usePalette();

  const [filtroNivel, setFiltroNivel] = useState<string>('todos');
  const [filtroTurno, setFiltroTurno] = useState<string>('todos');
  const [searchGrado, setSearchGrado] = useState<string>('');

  const gradosFiltrados = (balanceAsegurados?.grados || []).filter((grado) => {
    if (filtroNivel !== 'todos') {
      const nivelLower = (grado.nivel_nombre || '').toLowerCase();
      if (!nivelLower.includes(filtroNivel)) return false;
    }
    if (searchGrado.trim()) {
      const query = searchGrado.toLowerCase();
      const nombre = (grado.grado_nombre || '').toLowerCase();
      const nivel = (grado.nivel_nombre || '').toLowerCase();
      if (!nombre.includes(query) && !nivel.includes(query)) return false;
    }
    return true;
  });

  return (
    <Box>
      {/* ══ HEADER PRINCIPAL DEL TAB (Estilo Oficial Docente / Admin) ══ */}
      <Box
        sx={{
          p: { xs: 2.5, md: 3 },
          mb: 3,
          borderRadius: '18px',
          bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
          border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
          boxShadow: isDark
            ? '0 4px 20px rgba(0,0,0,0.2)'
            : '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: gradBg,
              color: isDark ? '#000' : '#fff',
              boxShadow: `0 6px 16px ${alpha(accentColor, 0.3)}`,
              flexShrink: 0,
            }}
          >
            <HowToRegIcon sx={{ fontSize: 26 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="h6" fontWeight={800}>
                Control y Balance de Cupos Asegurados (Gestión 2027)
              </Typography>
              <Chip
                size="small"
                label="Continuidad Regulares"
                sx={{
                  fontWeight: 800,
                  bgcolor: alpha(accentColor, 0.15),
                  color: accentColor,
                  border: `1px solid ${alpha(accentColor, 0.3)}`,
                  fontSize: '0.68rem',
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
              Seguimiento en tiempo real de continuidad de estudiantes regulares: cupos asegurados, confirmados con reserva y restantes pendientes.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Botón de Campaña Masiva Anti-Baneo WhatsApp */}
          {onAbrirCampanaWhatsApp && (
            <Button
              variant="contained"
              size="small"
              startIcon={<WhatsAppIcon sx={{ fontSize: 18 }} />}
              onClick={onAbrirCampanaWhatsApp}
              sx={{
                borderRadius: '12px',
                fontWeight: 800,
                textTransform: 'none',
                px: 2.2,
                py: 0.85,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
                flexShrink: 0,
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  boxShadow: '0 6px 18px rgba(16,185,129,0.4)',
                },
              }}
            >
              {estadoCampana?.activo ? 'Ver Progreso WhatsApp (Activo)' : 'Campaña WhatsApp Masiva (Anti-Baneo)'}
            </Button>
          )}

          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            disabled={loadingBalance}
            sx={{
              borderRadius: '12px',
              fontWeight: 700,
              textTransform: 'none',
              px: 2.2,
              py: 0.85,
              borderColor: alpha(accentColor, 0.4),
              color: accentColor,
              flexShrink: 0,
              '&:hover': {
                borderColor: accentColor,
                bgcolor: alpha(accentColor, 0.1),
              },
            }}
          >
            {loadingBalance ? 'Actualizando...' : 'Actualizar Balance'}
          </Button>
        </Box>
      </Box>

      {/* ══ BANNER FLOTANTE DE CAMPAÑA MASIVA EN CURSO (COLA ANTI-BANEO) ══ */}
      {estadoCampana?.activo && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2.8,
            borderRadius: '16px',
            bgcolor: isDark ? 'rgba(16,185,129,0.08)' : '#f0fdf4',
            border: '1.5px solid #10b981',
            boxShadow: '0 4px 20px rgba(16,185,129,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: { xs: 'wrap', md: 'nowrap' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8, flex: 1, minWidth: 260 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                bgcolor: alpha('#10b981', 0.15),
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CircularProgress size={22} sx={{ color: '#10b981' }} />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#10b981' }}>
                  Campaña WhatsApp en Curso: {estadoCampana.porcentaje}% completado
                </Typography>
                <Chip
                  size="small"
                  label={`Pausa segura: ${estadoCampana.delay_min_seg}s - ${estadoCampana.delay_max_seg}s`}
                  sx={{
                    bgcolor: alpha('#10b981', 0.15),
                    color: '#10b981',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    height: 20,
                  }}
                />
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
                Entregados: <strong>{estadoCampana.enviados}</strong> de <strong>{estadoCampana.total}</strong> · En cola segura: <strong>{estadoCampana.en_cola}</strong> · Enviando a: <em>{estadoCampana.estudiante_actual || 'Pausando entre envíos...'}</em>
              </Typography>

              <LinearProgress
                variant="determinate"
                value={estadoCampana.porcentaje}
                sx={{
                  mt: 0.8,
                  height: 6,
                  borderRadius: 3,
                  bgcolor: alpha('#10b981', 0.2),
                  '& .MuiLinearProgress-bar': { bgcolor: '#10b981', borderRadius: 3 },
                }}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            {onAbrirCampanaWhatsApp && (
              <Button
                size="small"
                variant="outlined"
                color="success"
                onClick={onAbrirCampanaWhatsApp}
                sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none', px: 1.8 }}
              >
                Ver Detalles
              </Button>
            )}
            {onDetenerCampana && (
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={onDetenerCampana}
                sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none', px: 1.8 }}
              >
                Detener
              </Button>
            )}
          </Box>
        </Paper>
      )}

      {/* ══ 4 KPIS CLAVE GLOBALES (Estilo StatCards Oficiales Compactos) ══ */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.6,
              borderRadius: '16px',
              bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
              border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
              boxShadow: isDark ? '0 2px 10px rgba(0,0,0,0.2)' : '0 2px 10px rgba(0,0,0,0.03)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-2px)', borderColor: '#3b82f6' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
              <GroupIcon sx={{ fontSize: 16, color: '#3b82f6' }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.64rem' }}>
                Cupos Asegurados
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#3b82f6', my: 0.2, fontSize: '1.5rem' }}>
              {loadingBalance ? '...' : (balanceAsegurados?.totales_globales?.total_asegurados || 0)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
              Estudiantes regulares proyectados
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.6,
              borderRadius: '16px',
              bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
              border: `1px solid ${alpha('#10b981', 0.35)}`,
              boxShadow: isDark ? '0 2px 10px rgba(16, 185, 129, 0.12)' : '0 2px 10px rgba(16, 185, 129, 0.05)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-2px)', borderColor: '#10b981' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
              <VerifiedIcon sx={{ fontSize: 16, color: '#10b981' }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#10b981', textTransform: 'uppercase', fontSize: '0.64rem' }}>
                Confirmados ({balanceAsegurados?.totales_globales?.porcentaje_confirmado || 0}%)
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#10b981', my: 0.2, fontSize: '1.5rem' }}>
              {loadingBalance ? '...' : (balanceAsegurados?.totales_globales?.total_confirmados || 0)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
              Reservas con recibo emitido
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.6,
              borderRadius: '16px',
              bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
              border: `1px solid ${alpha('#f59e0b', 0.35)}`,
              boxShadow: isDark ? '0 2px 10px rgba(245, 158, 11, 0.12)' : '0 2px 10px rgba(245, 158, 11, 0.05)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-2px)', borderColor: '#f59e0b' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
              <PendingActionsIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', fontSize: '0.64rem' }}>
                Restantes Pendientes
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#f59e0b', my: 0.2, fontSize: '1.5rem' }}>
              {loadingBalance ? '...' : (balanceAsegurados?.totales_globales?.total_restantes || 0)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
              Aún sin registrar su cupo
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.6,
              borderRadius: '16px',
              bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
              border: `1px solid ${alpha('#ef4444', 0.35)}`,
              boxShadow: isDark ? '0 2px 10px rgba(239, 68, 68, 0.12)' : '0 2px 10px rgba(239, 68, 68, 0.05)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-2px)', borderColor: '#ef4444' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
              <CancelIcon sx={{ fontSize: 16, color: '#ef4444' }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', fontSize: '0.64rem' }}>
                No Continuarán
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#ef4444', my: 0.2, fontSize: '1.5rem' }}>
              {loadingBalance ? '...' : (balanceAsegurados?.totales_globales?.total_no_continua || 0)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
              Vacantes que quedan libres
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* ══ BARRA DE FILTROS PARA LAS TARJETAS DE CURSOS (Estilo Docente) ══ */}
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
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar grado (ej. 1ro Primaria, Kínder, 6to)..."
              value={searchGrado}
              onChange={(e) => setSearchGrado(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: accentColor, fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: searchGrado ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchGrado('')}>
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

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Filtrar por Nivel</InputLabel>
              <Select
                value={filtroNivel}
                label="Filtrar por Nivel"
                onChange={(e) => setFiltroNivel(e.target.value)}
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
                <MenuItem value="todos">Todos los Niveles</MenuItem>
                <MenuItem value="inicial">Nivel Inicial</MenuItem>
                <MenuItem value="primaria">Nivel Primaria</MenuItem>
                <MenuItem value="secundaria">Nivel Secundaria</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Visualización de Turnos</InputLabel>
              <Select
                value={filtroTurno}
                label="Visualización de Turnos"
                onChange={(e) => setFiltroTurno(e.target.value)}
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
                <MenuItem value="todos">Ambos Turnos (Mañana y Tarde)</MenuItem>
                <MenuItem value="manana">☀️ Solo Turno Mañana</MenuItem>
                <MenuItem value="tarde">🌅 Solo Turno Tarde</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* ══ GRID DE GRADOS CON FORMATO: ASEGURADOS, CONFIRMADOS, RESTANTES (Compacto 4 Columnas) ══ */}
      <Grid container spacing={2.5}>
        {loadingBalance ? (
          [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Skeleton height={260} sx={{ borderRadius: '18px' }} />
            </Grid>
          ))
        ) : gradosFiltrados.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Paper
              elevation={0}
              sx={{
                p: 5,
                textAlign: 'center',
                borderRadius: '18px',
                bgcolor: isDark ? 'rgba(30, 41, 59, 0.4)' : '#ffffff',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              }}
            >
              <Typography variant="body1" fontWeight={700} color="text.secondary">
                No se encontraron registros de continuidad para los filtros seleccionados.
              </Typography>
            </Paper>
          </Grid>
        ) : (
          gradosFiltrados.map((item) => {
            const nivelColor = getNivelColor(item.nivel_nombre);
            const porcentaje = item.porcentaje_confirmado || 0;

            return (
              <Grid key={item.grado_destino_id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Fade in timeout={300}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: '18px',
                      border: `1px solid ${alpha(nivelColor, 0.3)}`,
                      bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'visible',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        borderColor: nivelColor,
                        boxShadow: `0 8px 20px ${alpha(nivelColor, 0.2)}`,
                        '& .btn-gestionar': {
                          backgroundColor: alpha(nivelColor, 0.16),
                          borderColor: nivelColor,
                        },
                      },
                    }}
                    onClick={() => onAbrirDetalleGrado(item)}
                  >
                    {/* Badge de Nivel arriba a la izquierda */}
                    <Chip
                      label={item.nivel_nombre || 'Nivel'}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 9,
                        left: 9,
                        zIndex: 1,
                        fontWeight: 700,
                        fontSize: '0.62rem',
                        height: 20,
                        backgroundColor: alpha(nivelColor, 0.12),
                        color: nivelColor,
                        border: `1px solid ${alpha(nivelColor, 0.25)}`,
                      }}
                    />

                    {/* Chips de % Confirmado y Gestión 2027 arriba a la derecha */}
                    <Box sx={{ position: 'absolute', top: 9, right: 9, zIndex: 1, display: 'flex', gap: 0.5 }}>
                      <Chip
                        label={`${porcentaje}%`}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.62rem',
                          height: 20,
                          backgroundColor:
                            porcentaje >= 70
                              ? alpha('#10b981', 0.15)
                              : porcentaje >= 40
                                ? alpha('#f59e0b', 0.15)
                                : alpha('#ef4444', 0.15),
                          color:
                            porcentaje >= 70
                              ? '#10b981'
                              : porcentaje >= 40
                                ? '#f59e0b'
                                : '#ef4444',
                          border: `1px solid ${alpha(
                            porcentaje >= 70
                              ? '#10b981'
                              : porcentaje >= 40
                                ? '#f59e0b'
                                : '#ef4444',
                            0.3
                          )}`,
                        }}
                      />
                      <Chip
                        label="2027"
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.62rem',
                          height: 20,
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
                          color: 'text.secondary',
                          border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                        }}
                      />
                    </Box>

                    <CardContent sx={{ p: 2, pt: 4.2, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Avatar compacto 54x54 */}
                      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                        <Avatar
                          sx={{
                            width: 54,
                            height: 54,
                            margin: '0 auto',
                            background: `linear-gradient(135deg, ${nivelColor}, ${alpha(nivelColor, 0.75)})`,
                            color: '#ffffff',
                            boxShadow: `0 4px 12px ${alpha(nivelColor, 0.25)}`,
                            border: `2px solid ${alpha(nivelColor, 0.2)}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <SchoolIcon sx={{ fontSize: 26 }} />
                        </Avatar>
                      </Box>

                      {/* Nombre del Grado / Curso */}
                      <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: '0.98rem', lineHeight: 1.2, mb: 0.2 }}>
                        {item.grado_nombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 1.2 }}>
                        Continuidad de Estudiantes Regulares
                      </Typography>

                      {/* ══ CARDS DESTACADAS DE TURNOS (MAÑANA / TARDE) ══ */}
                      {(() => {
                        const pctManana = item.turnos.manana.asegurados > 0
                          ? Math.round((item.turnos.manana.confirmados / item.turnos.manana.asegurados) * 100)
                          : 0;
                        const pctTarde = item.turnos.tarde.asegurados > 0
                          ? Math.round((item.turnos.tarde.confirmados / item.turnos.tarde.asegurados) * 100)
                          : 0;
                        const mostrarManana = filtroTurno === 'todos' || filtroTurno === 'manana';
                        const mostrarTarde = filtroTurno === 'todos' || filtroTurno === 'tarde';

                        return (
                          <>
                            {(mostrarManana || mostrarTarde) && (
                              <Grid container spacing={1} sx={{ mb: 1.2 }}>
                                {mostrarManana && (
                                  <Grid size={{ xs: filtroTurno === 'manana' ? 12 : 6 }}>
                                    <Box
                                      sx={{
                                        p: 1,
                                        borderRadius: '12px',
                                        bgcolor: isDark ? 'rgba(245, 158, 11, 0.08)' : '#fffbeb',
                                        border: `1px solid ${alpha('#f59e0b', isDark ? 0.25 : 0.35)}`,
                                        textAlign: 'center',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        minHeight: 82,
                                        '&:hover': {
                                          borderColor: '#f59e0b',
                                          boxShadow: `0 3px 10px ${alpha('#f59e0b', 0.15)}`,
                                        },
                                      }}
                                    >
                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                          <Typography sx={{ fontSize: '0.72rem', lineHeight: 1 }}>☀️</Typography>
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              fontWeight: 800,
                                              color: isDark ? '#fbbf24' : '#b45309',
                                              fontSize: '0.62rem',
                                              textTransform: 'uppercase',
                                              letterSpacing: '0.3px',
                                            }}
                                          >
                                            Mañana
                                          </Typography>
                                        </Box>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            fontWeight: 800,
                                            fontSize: '0.6rem',
                                            color: pctManana >= 70 ? '#10b981' : pctManana >= 40 ? '#f59e0b' : isDark ? '#fbbf24' : '#b45309',
                                          }}
                                        >
                                          {pctManana}%
                                        </Typography>
                                      </Box>

                                      <Box sx={{ my: 0.2 }}>
                                        <Typography
                                          variant="body2"
                                          fontWeight={900}
                                          sx={{
                                            color: isDark ? '#fff' : '#1e293b',
                                            fontSize: '0.92rem',
                                            lineHeight: 1.1,
                                          }}
                                        >
                                          <span style={{ color: '#10b981' }}>{item.turnos.manana.confirmados}</span>
                                          <span style={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.5, margin: '0 2px' }}>/</span>
                                          <span style={{ fontSize: '0.8rem' }}>{item.turnos.manana.asegurados}</span>
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            display: 'block',
                                            fontSize: '0.58rem',
                                            fontWeight: 700,
                                            color: item.turnos.manana.restantes > 0 ? '#f59e0b' : '#10b981',
                                            mt: 0.1,
                                          }}
                                        >
                                          {item.turnos.manana.restantes > 0 ? `${item.turnos.manana.restantes} pend.` : 'Completo'}
                                        </Typography>
                                      </Box>

                                      <LinearProgress
                                        variant="determinate"
                                        value={pctManana}
                                        sx={{
                                          height: 3,
                                          borderRadius: 2,
                                          bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                          '& .MuiLinearProgress-bar': {
                                            borderRadius: 2,
                                            bgcolor: pctManana >= 70 ? '#10b981' : pctManana >= 40 ? '#f59e0b' : '#3b82f6',
                                          },
                                        }}
                                      />
                                    </Box>
                                  </Grid>
                                )}

                                {mostrarTarde && (
                                  <Grid size={{ xs: filtroTurno === 'tarde' ? 12 : 6 }}>
                                    <Box
                                      sx={{
                                        p: 1,
                                        borderRadius: '12px',
                                        bgcolor: isDark ? 'rgba(99, 102, 241, 0.08)' : '#f5f3ff',
                                        border: `1px solid ${alpha('#6366f1', isDark ? 0.25 : 0.35)}`,
                                        textAlign: 'center',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        minHeight: 82,
                                        '&:hover': {
                                          borderColor: '#6366f1',
                                          boxShadow: `0 3px 10px ${alpha('#6366f1', 0.15)}`,
                                        },
                                      }}
                                    >
                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                          <Typography sx={{ fontSize: '0.72rem', lineHeight: 1 }}>🌅</Typography>
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              fontWeight: 800,
                                              color: isDark ? '#a5b4fc' : '#4338ca',
                                              fontSize: '0.62rem',
                                              textTransform: 'uppercase',
                                              letterSpacing: '0.3px',
                                            }}
                                          >
                                            Tarde
                                          </Typography>
                                        </Box>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            fontWeight: 800,
                                            fontSize: '0.6rem',
                                            color: pctTarde >= 70 ? '#10b981' : pctTarde >= 40 ? '#f59e0b' : isDark ? '#a5b4fc' : '#4338ca',
                                          }}
                                        >
                                          {pctTarde}%
                                        </Typography>
                                      </Box>

                                      <Box sx={{ my: 0.2 }}>
                                        <Typography
                                          variant="body2"
                                          fontWeight={900}
                                          sx={{
                                            color: isDark ? '#fff' : '#1e293b',
                                            fontSize: '0.92rem',
                                            lineHeight: 1.1,
                                          }}
                                        >
                                          <span style={{ color: '#10b981' }}>{item.turnos.tarde.confirmados}</span>
                                          <span style={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.5, margin: '0 2px' }}>/</span>
                                          <span style={{ fontSize: '0.8rem' }}>{item.turnos.tarde.asegurados}</span>
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            display: 'block',
                                            fontSize: '0.58rem',
                                            fontWeight: 700,
                                            color: item.turnos.tarde.restantes > 0 ? '#6366f1' : '#10b981',
                                            mt: 0.1,
                                          }}
                                        >
                                          {item.turnos.tarde.restantes > 0 ? `${item.turnos.tarde.restantes} pend.` : 'Completo'}
                                        </Typography>
                                      </Box>

                                      <LinearProgress
                                        variant="determinate"
                                        value={pctTarde}
                                        sx={{
                                          height: 3,
                                          borderRadius: 2,
                                          bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                          '& .MuiLinearProgress-bar': {
                                            borderRadius: 2,
                                            bgcolor: pctTarde >= 70 ? '#10b981' : pctTarde >= 40 ? '#f59e0b' : '#6366f1',
                                          },
                                        }}
                                      />
                                    </Box>
                                  </Grid>
                                )}
                              </Grid>
                            )}

                            {/* Barra de Progreso General del Grado */}
                            <Box sx={{ mb: 1.2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
                                <Typography variant="caption" sx={{ fontSize: '0.62rem', color: 'text.secondary', fontWeight: 600 }}>
                                  Progreso Total Curso
                                </Typography>
                                <Typography variant="caption" sx={{ fontSize: '0.62rem', fontWeight: 800, color: porcentaje >= 70 ? '#10b981' : porcentaje >= 40 ? '#f59e0b' : '#3b82f6' }}>
                                  {porcentaje}%
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={porcentaje}
                                sx={{
                                  height: 4.5,
                                  borderRadius: 3,
                                  bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 3,
                                    bgcolor: porcentaje >= 70 ? '#10b981' : porcentaje >= 40 ? '#f59e0b' : '#3b82f6',
                                  },
                                }}
                              />
                            </Box>

                            {/* ══ ASEGURADOS Y CONFIRMADOS EN FORMATO TEXTO NORMAL ══ */}
                            <Box
                              sx={{
                                px: 1.1,
                                py: 0.7,
                                borderRadius: '10px',
                                bgcolor: isDark ? alpha('#fff', 0.02) : '#f8fafc',
                                border: `1px solid ${isDark ? alpha('#fff', 0.06) : '#e2e8f0'}`,
                                mb: 1.2,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0.3,
                                fontSize: '0.66rem',
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.64rem', color: 'text.secondary' }}>
                                  Asegurados Proyectados
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.66rem', color: '#3b82f6' }}>
                                  {item.total_asegurados} cupos
                                </Typography>
                              </Box>

                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.64rem', color: 'text.secondary' }}>
                                  Confirmados con Reserva
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.66rem', color: 'text.primary' }}>
                                  <strong style={{ color: '#10b981' }}>{item.total_confirmados}</strong>
                                  <span style={{ opacity: 0.7, marginLeft: 3 }}>({porcentaje}%)</span>
                                </Typography>
                              </Box>

                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.64rem', color: 'text.secondary' }}>
                                  Restantes Pendientes
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.66rem', color: '#f59e0b' }}>
                                  {item.total_restantes} rest.
                                </Typography>
                              </Box>

                              {item.total_no_continua > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.64rem', color: 'text.secondary' }}>
                                    No Continuarán
                                  </Typography>
                                  <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.66rem', color: '#ef4444' }}>
                                    {item.total_no_continua} vacantes
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </>
                        );
                      })()}

                      {/* ══ ACCIONES AL PIE DE LA TARJETA ══ */}
                      <Box sx={{ display: 'flex', gap: 1, mt: 'auto', pt: 1, borderTop: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.06)}` }}>
                        <Button
                          fullWidth
                          className="btn-gestionar"
                          variant="outlined"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAbrirDetalleGrado(item);
                          }}
                          startIcon={<ListAltIcon sx={{ fontSize: 16 }} />}
                          sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 700,
                            py: 0.5,
                            fontSize: '0.72rem',
                            borderColor: alpha(nivelColor, 0.4),
                            color: nivelColor,
                            bgcolor: alpha(nivelColor, 0.08),
                            transition: 'all 0.2s ease',
                          }}
                        >
                          Nómina ({item.total_restantes} pend.)
                        </Button>

                        <Tooltip title="Ir al Centro de Reportes para este curso">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEmitirReporte(item.grado_destino_id);
                            }}
                            sx={{
                              borderRadius: '10px',
                              border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.1)}`,
                              p: 0.7,
                            }}
                          >
                            <AssessmentIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            );
          })
        )}
      </Grid>
    </Box>
  );
};
export default CuposAseguradosTab;
