'use client';
// app/dashboard/docente/temario/page.tsx

import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Fade,
  alpha,
  useTheme,
  Tooltip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  Badge,
  FormControl,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { keyframes } from '@mui/system';
import {
  AutoStories as AutoStoriesIcon,
  ChevronRight as ChevronRightIcon,
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  Person as PersonIcon,
  MeetingRoom as AulaIcon,
  AccessTime as AccessTimeIcon,
  Search as SearchIcon,
  ViewModule as ViewModuleIcon,
  TableRows as TableRowsIcon,
  Refresh as RefreshIcon,
  Verified as VerifiedIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { asistenciaService, AsignacionDocente } from '@/services/asistenciaService';
import { sortCursos, sortGrados } from '@/utils/cursoUtils';
import { toast } from 'react-hot-toast';

// ─── Animaciones (Mismo estilo que /dashboard/estudiantes) ────────────────────
const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
`;
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Card de Asignación (Literal al estilo de /dashboard/estudiantes) ─────────
interface TemarioCardProps {
  asignacion: AsignacionDocente;
  accentColor: string;
  isDark: boolean;
  onView: (asig: AsignacionDocente) => void;
}

const TemarioCard: React.FC<TemarioCardProps> = ({ asignacion, accentColor, isDark, onView }) => {
  return (
    <Fade in timeout={300}>
      <Card
        sx={{
          height: '100%',
          borderRadius: '20px',
          border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
          bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 12px 24px ${alpha(accentColor, 0.2)}`,
            borderColor: accentColor,
            '& .btn-gestionar': {
              backgroundColor: alpha(accentColor, 0.15),
              borderColor: accentColor,
              transform: 'translateX(2px)',
            },
          },
        }}
        onClick={() => onView(asignacion)}
      >
        {/* Badge de Paralelo arriba a la izquierda */}
        <Chip
          label={`Paralelo "${asignacion.paralelo_nombre}"`}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 1,
            fontWeight: 700,
            fontSize: '0.72rem',
            backgroundColor: isDark ? 'rgba(250, 204, 21, 0.15)' : 'rgba(2, 136, 209, 0.12)',
            color: accentColor,
            border: `1px solid ${alpha(accentColor, 0.25)}`,
          }}
        />

        {/* Chip de Titular arriba a la derecha */}
        {asignacion.es_titular && (
          <Chip
            icon={<VerifiedIcon sx={{ fontSize: '13px !important', color: `${accentColor} !important` }} />}
            label="Titular"
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 1,
              fontWeight: 700,
              fontSize: '0.68rem',
              backgroundColor: isDark ? 'rgba(250, 204, 21, 0.1)' : 'rgba(2, 136, 209, 0.1)',
              color: accentColor,
              border: `1px solid ${alpha(accentColor, 0.2)}`,
            }}
          />
        )}

        <CardContent sx={{ p: 3, pt: 5, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Avatar grande centrado con badge */}
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                asignacion.nivel_nombre ? (
                  <Tooltip title={`Nivel: ${asignacion.nivel_nombre}`}>
                    <Chip
                      icon={<SchoolIcon sx={{ fontSize: 13 }} />}
                      label={asignacion.nivel_nombre}
                      size="small"
                      sx={{
                        height: 24,
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        bgcolor: accentColor,
                        color: isDark ? '#000' : '#fff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        '& .MuiChip-icon': { ml: 0.5, color: isDark ? '#000' : '#fff' },
                      }}
                    />
                  </Tooltip>
                ) : null
              }
            >
              <Avatar
                sx={{
                  width: 90,
                  height: 90,
                  margin: '0 auto',
                  bgcolor: accentColor,
                  color: isDark ? '#000' : '#fff',
                  border: `4px solid ${alpha(accentColor, 0.2)}`,
                  boxShadow: `0 8px 16px ${alpha(accentColor, 0.3)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MenuBookIcon sx={{ fontSize: 42 }} />
              </Avatar>
            </Badge>
          </Box>

          {/* Nombre de la Materia */}
          <Typography variant="h6" fontWeight={800} gutterBottom sx={{ lineHeight: 1.25 }}>
            {asignacion.materia_nombre}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={600}>
            {asignacion.grado_nombre}
          </Typography>

          {/* Chip de Código o Turno */}
          <Box sx={{ my: 1 }}>
            <Chip
              label={asignacion.materia_codigo ? `Código: ${asignacion.materia_codigo}` : (asignacion.turno_nombre || 'Asignación Regular')}
              size="small"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: '0.72rem',
                backgroundColor: isDark ? 'rgba(250, 204, 21, 0.1)' : 'rgba(2, 136, 209, 0.1)',
                color: accentColor,
              }}
            />
          </Box>

          {/* Botón de acción directo */}
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 1.5 }}>
            <Button
              className="btn-gestionar"
              size="small"
              variant="outlined"
              endIcon={<ChevronRightIcon />}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.78rem',
                px: 2,
                borderColor: alpha(accentColor, 0.35),
                color: accentColor,
                transition: 'all 0.2s ease',
              }}
            >
              Gestionar Temario
            </Button>
          </Box>

          {/* Información adicional (idéntica a la sección inferior de las cards de estudiantes) */}
          <Box
            sx={{
              mt: 'auto',
              pt: 2,
              borderTop: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.3,
              textAlign: 'left',
            }}
          >
            {/* Estudiantes */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                Estudiantes:
              </Typography>
              <Typography variant="caption" fontWeight={700} sx={{ ml: 'auto' }}>
                {asignacion.total_estudiantes ?? 0}
              </Typography>
            </Box>

            {/* Aula */}
            {asignacion.aula && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AulaIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" fontWeight={600} color="text.secondary">
                  Aula:
                </Typography>
                <Typography variant="caption" fontWeight={700} sx={{ ml: 'auto' }}>
                  {asignacion.aula}
                </Typography>
              </Box>
            )}

            {/* Turno */}
            {asignacion.turno_nombre && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" fontWeight={600} color="text.secondary">
                  Turno:
                </Typography>
                <Typography variant="caption" fontWeight={700} sx={{ ml: 'auto' }}>
                  {asignacion.turno_nombre}
                </Typography>
              </Box>
            )}

            {/* Período / Gestión */}
            {asignacion.periodo_nombre && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" fontWeight={600} color="text.secondary">
                  Gestión:
                </Typography>
                <Typography variant="caption" fontWeight={600} sx={{ ml: 'auto' }} color="text.disabled">
                  {asignacion.periodo_nombre}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};

// ─── Fila / Vista de Tabla / Lista ────────────────────────────────────────────
interface TemarioRowProps {
  asignacion: AsignacionDocente;
  accentColor: string;
  isDark: boolean;
  onView: (asig: AsignacionDocente) => void;
}

const TemarioRow: React.FC<TemarioRowProps> = ({ asignacion, accentColor, isDark, onView }) => {
  return (
    <Card
      sx={{
        p: 2,
        borderRadius: '16px',
        border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
        bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateX(4px)',
          borderColor: accentColor,
          boxShadow: `0 4px 16px ${alpha(accentColor, 0.15)}`,
        },
      }}
      onClick={() => onView(asignacion)}
    >
      <Avatar
        sx={{
          width: 44,
          height: 44,
          bgcolor: alpha(accentColor, 0.15),
          color: accentColor,
          fontWeight: 800,
        }}
      >
        <MenuBookIcon fontSize="small" />
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="subtitle2" fontWeight={800} noWrap>
            {asignacion.materia_nombre}
          </Typography>
          <Chip
            size="small"
            label={`Paralelo ${asignacion.paralelo_nombre}`}
            sx={{
              height: 20,
              fontSize: '0.65rem',
              fontWeight: 700,
              bgcolor: isDark ? 'rgba(250, 204, 21, 0.1)' : 'rgba(2, 136, 209, 0.1)',
              color: accentColor,
            }}
          />
          {asignacion.es_titular && (
            <Chip
              size="small"
              label="Titular"
              sx={{
                height: 20,
                fontSize: '0.62rem',
                fontWeight: 700,
                bgcolor: alpha(accentColor, 0.12),
                color: accentColor,
              }}
            />
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.3, display: 'block' }}>
          {asignacion.grado_nombre} {asignacion.nivel_nombre ? `· ${asignacion.nivel_nombre}` : ''}
          {asignacion.aula ? ` · Aula ${asignacion.aula}` : ''}
          {asignacion.total_estudiantes ? ` · ${asignacion.total_estudiantes} estudiantes` : ''}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
        <Typography variant="caption" fontWeight={700} sx={{ color: accentColor }}>
          Gestionar temario
        </Typography>
        <ChevronRightIcon sx={{ fontSize: 18, color: accentColor }} />
      </Box>
    </Card>
  );
};

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function DocenteTemarioPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();

  const accentColor = isDark ? '#facc15' : '#0288d1';
  const gradBg = isDark
    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)';

  const [asignaciones, setAsignaciones] = useState<AsignacionDocente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradoFilter, setGradoFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const cargarAsignaciones = async () => {
    setLoading(true);
    try {
      const res = await asistenciaService.getMisAsignaciones();
      setAsignaciones(res.data.asignaciones || []);
    } catch (error: any) {
      if (error.response?.status !== 404) toast.error('Error al cargar tus materias');
      setAsignaciones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAsignaciones();
  }, []);

  // Lista única de grados para el filtro (ordenada naturalmente: 1ro, 2do, 3ro...)
  const gradosDisponibles = useMemo(() => {
    const set = new Set(asignaciones.map((a) => a.grado_nombre).filter(Boolean));
    return sortGrados(Array.from(set) as string[]);
  }, [asignaciones]);

  // Filtrado y ordenamiento por cursos (1ro, 2do, 3ro...)
  const asignacionesFiltradas = useMemo(() => {
    const filtradas = asignaciones.filter((a) => {
      const matchesSearch =
        !searchTerm.trim() ||
        a.materia_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.grado_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.paralelo_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.nivel_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.aula && a.aula.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesGrado = !gradoFilter || a.grado_nombre === gradoFilter;

      return matchesSearch && matchesGrado;
    });

    return sortCursos(filtradas);
  }, [asignaciones, searchTerm, gradoFilter]);

  const handleView = (asig: AsignacionDocente) => {
    router.push(`/dashboard/docente/temario/${asig.asignacion_id}`);
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* ══ HEADER (Literal estilo /dashboard/estudiantes) ══ */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, md: 0 },
                mb: 3,
              }}
            >
              {/* IZQUIERDA: TÍTULO + PÁRRAFO */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <AutoStoriesIcon
                    sx={{
                      color: accentColor,
                      fontSize: 36,
                      animation: `${bounce} 1.5s infinite`,
                    }}
                  />
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                      fontWeight: 800,
                      background: gradBg,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Temario
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
                  Gestioná las unidades temáticas, contenidos y temas de tus materias asignadas.
                </Typography>
              </Box>

              {/* DERECHA: Conmutador de vista y refrescar */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(_, newMode) => {
                    if (newMode) setViewMode(newMode);
                  }}
                  sx={{
                    borderRadius: '16px',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    '& .MuiToggleButton-root': {
                      borderRadius: '16px',
                      border: 'none',
                      px: 2,
                      py: 1,
                      '&.Mui-selected': {
                        backgroundColor: accentColor,
                        color: isDark ? '#000' : '#fff',
                        '&:hover': {
                          backgroundColor: accentColor,
                        },
                      },
                    },
                  }}
                >
                  <ToggleButton value="cards" aria-label="vista tarjetas">
                    <Tooltip title="Vista de tarjetas">
                      <ViewModuleIcon />
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton value="table" aria-label="vista lista">
                    <Tooltip title="Vista de lista">
                      <TableRowsIcon />
                    </Tooltip>
                  </ToggleButton>
                </ToggleButtonGroup>

                <Tooltip title="Actualizar materias">
                  <IconButton
                    onClick={cargarAsignaciones}
                    disabled={loading}
                    sx={{
                      borderRadius: '16px',
                      border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.1)}`,
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                      p: 1.2,
                      color: accentColor,
                      '&:hover': {
                        backgroundColor: alpha(accentColor, 0.1),
                        transform: 'rotate(180deg)',
                        transition: 'all 0.3s ease',
                      },
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* ══ BARRA DE BÚSQUEDA Y FILTROS (Mismo estilo que /dashboard/estudiantes) ══ */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                alignItems: 'center',
                mb: 4,
              }}
            >
              <TextField
                placeholder="Buscar por materia, grado o paralelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: accentColor }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: '16px',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.divider, 0.1),
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(accentColor, 0.4),
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: accentColor,
                    },
                  },
                }}
                sx={{ flex: { xs: '1 1 100%', md: '1 1 auto' } }}
              />

              <FormControl sx={{ minWidth: 200 }}>
                <Select
                  value={gradoFilter}
                  onChange={(e) => setGradoFilter(e.target.value)}
                  displayEmpty
                  size="medium"
                  sx={{
                    borderRadius: '16px',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.divider, 0.1),
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
                  {gradosDisponibles.map((grado) => (
                    <MenuItem key={grado} value={grado}>
                      {grado}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Fade>

        {/* ══ CONTENIDO: CARDS O TABLA (Estilo /dashboard/estudiantes) ══ */}
        {loading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
                <Box
                  sx={{
                    borderRadius: '20px',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    p: 3,
                    textAlign: 'center',
                  }}
                >
                  <Skeleton variant="circular" width={90} height={90} sx={{ margin: '0 auto 16px' }} />
                  <Skeleton variant="text" width="60%" sx={{ margin: '0 auto 8px' }} />
                  <Skeleton variant="text" width="40%" sx={{ margin: '0 auto 16px' }} />
                  <Skeleton variant="rounded" height={32} sx={{ borderRadius: '12px', mb: 2 }} />
                  <Skeleton variant="rectangular" height={80} sx={{ borderRadius: '10px' }} />
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : asignacionesFiltradas.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 380,
              flexDirection: 'column',
              gap: 2,
              textAlign: 'center',
            }}
          >
            <AutoStoriesIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
            <Typography variant="h6" color="text.secondary" fontWeight={700}>
              {searchTerm || gradoFilter ? 'No se encontraron materias con ese filtro' : 'No tienes materias asignadas'}
            </Typography>
            <Typography variant="body2" color="text.disabled">
              {searchTerm || gradoFilter
                ? 'Intenta borrar los filtros para ver todas tus materias.'
                : 'Contacta a administración para verificar tus asignaciones académicas.'}
            </Typography>
          </Box>
        ) : viewMode === 'cards' ? (
          <Grid container spacing={3}>
            {asignacionesFiltradas.map((asig) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={asig.asignacion_id}>
                <TemarioCard
                  asignacion={asig}
                  accentColor={accentColor}
                  isDark={isDark}
                  onView={handleView}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {asignacionesFiltradas.map((asig) => (
              <TemarioRow
                key={asig.asignacion_id}
                asignacion={asig}
                accentColor={accentColor}
                isDark={isDark}
                onView={handleView}
              />
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}