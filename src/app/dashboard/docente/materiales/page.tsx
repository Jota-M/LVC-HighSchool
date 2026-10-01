'use client';
// app/dashboard/docente/materiales/page.tsx
// Estilo unificado con Temario, Calificaciones, Notas y Asistencia

import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
  LinearProgress,
  Badge,
  useTheme,
  alpha,
  Fade,
  Tooltip,
  Alert,
} from '@mui/material';
import { keyframes } from '@mui/system';
import {
  Folder as FolderIcon,
  ChevronRight as ChevronRightIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  ViewModule as ViewModuleIcon,
  TableRows as TableRowsIcon,
  GroupsRounded as GroupsRoundedIcon,
  Verified as VerifiedIcon,
  AccessTime as AccessTimeIcon,
  AutoStories as AutoStoriesIcon,
  MenuBook as MenuBookIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { asistenciaService, AsignacionDocente } from '@/services/asistenciaService';
import { sortCursos, sortGrados } from '@/utils/cursoUtils';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

// ─── Animaciones ──────────────────────────────────────────────────────────────
const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
`;
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.6; }
`;

// ─── Card de Material (Estilo Temario / Calificaciones) ────────────────────────
interface MaterialCardProps {
  asignacion: AsignacionDocente;
  accentColor: string;
  gradBg: string;
  isDark: boolean;
  onView: (asig: AsignacionDocente) => void;
}

const MaterialCard: React.FC<MaterialCardProps> = ({
  asignacion,
  accentColor,
  gradBg,
  isDark,
  onView,
}) => {
  return (
    <Fade in timeout={300}>
      <Card
        sx={{
          height: '100%',
          borderRadius: '18px',
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
            transform: 'translateY(-6px)',
            boxShadow: `0 10px 22px ${alpha(accentColor, 0.18)}`,
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

        {/* Chip de Titular arriba a la derecha */}
        {asignacion.es_titular && (
          <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
            <Chip
              icon={<VerifiedIcon sx={{ fontSize: '13px !important', color: `${accentColor} !important` }} />}
              label="Titular"
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.65rem',
                height: 22,
                backgroundColor: isDark ? alpha(accentColor, 0.12) : alpha(accentColor, 0.08),
                color: accentColor,
                border: `1px solid ${alpha(accentColor, 0.25)}`,
              }}
            />
          </Box>
        )}

        <CardContent sx={{ p: 2.2, pt: 4.5, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Avatar mediano centrado con badge de nivel */}
          <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center' }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                asignacion.nivel_nombre ? (
                  <Tooltip title={`Nivel: ${asignacion.nivel_nombre}`}>
                    <Chip
                      icon={<SchoolIcon sx={{ fontSize: 11 }} />}
                      label={asignacion.nivel_nombre}
                      size="small"
                      sx={{
                        height: 20,
                        fontWeight: 700,
                        fontSize: '0.6rem',
                        bgcolor: accentColor,
                        color: isDark ? '#000' : '#fff',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        '& .MuiChip-icon': { ml: 0.4, color: isDark ? '#000' : '#fff' },
                      }}
                    />
                  </Tooltip>
                ) : null
              }
            >
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  margin: '0 auto',
                  bgcolor: accentColor,
                  color: isDark ? '#000' : '#fff',
                  border: `3px solid ${alpha(accentColor, 0.2)}`,
                  boxShadow: `0 6px 14px ${alpha(accentColor, 0.25)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FolderIcon sx={{ fontSize: 36, color: '#fff' }} />
              </Avatar>
            </Badge>
          </Box>

          {/* Nombre de la Materia */}
          <Typography variant="subtitle1" fontWeight={800} gutterBottom sx={{ fontSize: '1.02rem', lineHeight: 1.25, mb: 0.3 }}>
            {asignacion.materia_nombre}
          </Typography>
          <Typography variant="caption" color="text.secondary" gutterBottom fontWeight={600} sx={{ fontSize: '0.78rem' }}>
            {asignacion.grado_nombre}
          </Typography>

          {/* Chip de Código o Turno */}
          <Box sx={{ my: 0.8 }}>
            <Chip
              label={asignacion.materia_codigo ? `Código: ${asignacion.materia_codigo}` : (asignacion.turno_nombre || 'Regular')}
              size="small"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: '0.68rem',
                height: 22,
                backgroundColor: isDark ? alpha(accentColor, 0.1) : alpha(accentColor, 0.08),
                color: accentColor,
              }}
            />
          </Box>

          {/* Botón de acción directo */}
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
            <Button
              className="btn-gestionar"
              size="small"
              variant="outlined"
              endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
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
              Gestionar Recursos
            </Button>
          </Box>

          {/* Información adicional */}
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
            {/* Estudiantes */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <PersonIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                Estudiantes:
              </Typography>
              <Typography variant="caption" fontWeight={700} sx={{ ml: 'auto', fontSize: '0.74rem' }}>
                {asignacion.total_estudiantes ?? 0}
              </Typography>
            </Box>

            {/* Turno */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <AccessTimeIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                Turno:
              </Typography>
              <Typography variant="caption" fontWeight={700} sx={{ ml: 'auto', fontSize: '0.74rem' }}>
                {asignacion.turno_nombre || 'Regular'}
              </Typography>
            </Box>

            {/* Nivel */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <SchoolIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                Nivel:
              </Typography>
              <Typography variant="caption" fontWeight={700} sx={{ ml: 'auto', fontSize: '0.74rem' }}>
                {asignacion.nivel_nombre || 'Secundaria'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};

// ─── Fila de Material (Vista Lista/Tabla) ─────────────────────────────────────
interface MaterialRowProps {
  asignacion: AsignacionDocente;
  accentColor: string;
  gradBg: string;
  isDark: boolean;
  onView: (asig: AsignacionDocente) => void;
}

const MaterialRow: React.FC<MaterialRowProps> = ({
  asignacion,
  accentColor,
  gradBg,
  isDark,
  onView,
}) => {
  return (
    <Fade in timeout={250}>
      <Card
        onClick={() => onView(asignacion)}
        sx={{
          borderRadius: '14px',
          border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
          bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
          p: 1.6,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateX(4px)',
            borderColor: accentColor,
            boxShadow: `0 4px 16px ${alpha(accentColor, 0.12)}`,
          },
        }}
      >
        <Avatar
          sx={{
            width: 44,
            height: 44,
            bgcolor: accentColor,
            color: '#fff',
            boxShadow: `0 3px 8px ${alpha(accentColor, 0.3)}`,
            flexShrink: 0,
          }}
        >
          <FolderIcon sx={{ fontSize: 22 }} />
        </Avatar>

        <Box sx={{ minWidth: 160, flex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2" fontWeight={800} noWrap>
              {asignacion.materia_nombre}
            </Typography>
            <Chip
              label={`Par. ${asignacion.paralelo_nombre}`}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.62rem',
                height: 19,
                bgcolor: alpha(accentColor, 0.1),
                color: accentColor,
              }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {asignacion.grado_nombre} · {asignacion.turno_nombre}
          </Typography>
        </Box>

        {/* Info adicional */}
        <Box sx={{ display: { xs: 'none', md: 'block' }, minWidth: 120, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', display: 'block' }}>
            Nivel
          </Typography>
          <Typography variant="body2" fontWeight={700}>
            {asignacion.nivel_nombre || 'Regular'}
          </Typography>
        </Box>

        <Box sx={{ display: { xs: 'none', sm: 'block' }, minWidth: 100, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', display: 'block' }}>
            Estudiantes
          </Typography>
          <Typography variant="body2" fontWeight={800}>
            {asignacion.total_estudiantes ?? 0}
          </Typography>
        </Box>

        {/* Botón */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto', flexShrink: 0 }}>
          <Button
            size="small"
            variant="outlined"
            endIcon={<ChevronRightIcon sx={{ fontSize: 14 }} />}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.72rem',
              py: 0.3,
              px: 1.4,
              borderColor: alpha(accentColor, 0.3),
              color: accentColor,
            }}
          >
            Recursos
          </Button>
        </Box>
      </Card>
    </Fade>
  );
};

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function DocenteMaterialesPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();
  const { user, loading: loadingAuth } = useAuth();

  const accentColor = isDark ? '#facc15' : '#0288d1';
  const accentColorEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${accentColor} 0%, ${accentColorEnd} 100%)`;

  const [asignaciones, setAsignaciones] = useState<AsignacionDocente[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros y vista
  const [searchTerm, setSearchTerm] = useState('');
  const [gradoFilter, setGradoFilter] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const res = await asistenciaService.getMisAsignaciones();
        setAsignaciones(res.data.asignaciones);
      } catch (error: any) {
        if (error.response?.status !== 404) toast.error('Error al cargar tus materias');
        setAsignaciones([]);
      } finally {
        setLoading(false);
      }
    };
    if (!loadingAuth) cargar();
  }, [loadingAuth]);

  // Grados disponibles (ordenados naturalmente: 1ro, 2do, 3ro...)
  const gradosDisponibles = useMemo(() => {
    const setG = new Set<string>();
    asignaciones.forEach((a) => {
      if (a.grado_nombre) setG.add(a.grado_nombre);
    });
    return sortGrados(Array.from(setG));
  }, [asignaciones]);

  // Asignaciones filtradas (ordenadas por cursos 1ro, 2do, 3ro...)
  const asignacionesFiltradas = useMemo(() => {
    const filtradas = asignaciones.filter((a) => {
      const matchGrado = !gradoFilter || a.grado_nombre === gradoFilter;
      const matchSearch =
        !searchTerm ||
        a.materia_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.grado_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.paralelo_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.materia_codigo?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchGrado && matchSearch;
    });

    return sortCursos(filtradas);
  }, [asignaciones, gradoFilter, searchTerm]);

  const handleIr = (asig: AsignacionDocente) => {
    router.push(`/dashboard/docente/materiales/${asig.asignacion_id}`);
  };

  const totalMaterias = asignaciones.length;
  const totalEstudiantes = asignaciones.reduce((acc, cur) => acc + (Number(cur.total_estudiantes) || 0), 0);

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* ══ HEADER ══ */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '14px',
                  background: gradBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 14px ${alpha(accentColor, 0.35)}`,
                  animation: `${bounce} 2s ease-in-out infinite`,
                }}
              >
                <FolderIcon sx={{ color: isDark ? '#000' : '#fff', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '1.9rem', md: '2.2rem' },
                    fontWeight: 900,
                    background: gradBg,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.2,
                  }}
                >
                  Mis Materiales
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mt: 0.2 }}>
                  {user?.username && <>Hola, <strong>{user.username}</strong> — </>}
                  Gestioná y compartí recursos académicos, guías y documentos.
                </Typography>
              </Box>
            </Box>

            {/* ══ RESUMEN RÁPIDO ══ */}
            {!loading && totalMaterias > 0 && (
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 2, mb: 1 }}>
                <Chip
                  icon={<MenuBookIcon sx={{ fontSize: '14px !important', color: `${accentColor} !important` }} />}
                  label={`Materias asignadas: ${totalMaterias}`}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    bgcolor: alpha(accentColor, 0.1),
                    color: accentColor,
                    border: `1px solid ${alpha(accentColor, 0.25)}`,
                  }}
                />
                <Chip
                  icon={<GroupsRoundedIcon sx={{ fontSize: '14px !important', color: `${accentColor} !important` }} />}
                  label={`Total estudiantes: ${totalEstudiantes}`}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    bgcolor: alpha(accentColor, 0.08),
                    color: accentColor,
                    border: `1px solid ${alpha(accentColor, 0.2)}`,
                  }}
                />
              </Box>
            )}

            {/* ══ BARRA DE FILTROS & VISTA ══ */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                mt: 2,
                borderRadius: '16px',
                bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
              }}
            >
              {/* BUSCADOR */}
              <TextField
                placeholder="Buscar materia, grado, paralelo o turno..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  flex: { xs: '1 1 100%', sm: '1 1 280px' },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />

              {/* FILTRO POR GRADO */}
              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 180 } }}>
                <InputLabel>Filtrar por Grado</InputLabel>
                <Select
                  value={gradoFilter}
                  label="Filtrar por Grado"
                  onChange={(e) => setGradoFilter(e.target.value)}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="">Todos los grados</MenuItem>
                  {gradosDisponibles.map((g) => (
                    <MenuItem key={g} value={g}>
                      {g}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* TOGGLE VISTA: CARDS O TABLA */}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, val) => {
                  if (val) setViewMode(val);
                }}
                size="small"
                sx={{
                  borderRadius: '12px',
                  bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                  '& .MuiToggleButton-root': {
                    borderRadius: '10px !important',
                    border: 'none',
                    px: 1.5,
                    py: 0.8,
                    '&.Mui-selected': {
                      background: gradBg,
                      color: isDark ? '#000' : '#fff',
                    },
                  },
                }}
              >
                <ToggleButton value="cards" aria-label="vista de tarjetas">
                  <Tooltip title="Vista de tarjetas">
                    <ViewModuleIcon fontSize="small" />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="table" aria-label="vista de lista">
                  <Tooltip title="Vista de lista">
                    <TableRowsIcon fontSize="small" />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
        </Fade>

        {/* ══ LOADING ══ */}
        {loading && (
          <Box sx={{ width: '100%', py: 4 }}>
            <LinearProgress sx={{ borderRadius: 4, height: 6 }} />
          </Box>
        )}

        {/* ══ SIN ASIGNACIONES ══ */}
        {!loading && asignaciones.length === 0 && (
          <Fade in timeout={400}>
            <Box
              sx={{
                textAlign: 'center',
                py: 10,
                borderRadius: '24px',
                border: `2px dashed ${alpha(accentColor, 0.2)}`,
                bgcolor: isDark ? alpha(accentColor, 0.03) : alpha(accentColor, 0.02),
              }}
            >
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '22px',
                  background: `linear-gradient(135deg, ${alpha(accentColor, 0.15)}, ${alpha(accentColorEnd, 0.15)})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2.5,
                  animation: `${pulse} 2.5s ease-in-out infinite`,
                }}
              >
                <AutoStoriesIcon sx={{ fontSize: 38, color: alpha(accentColor, 0.7) }} />
              </Box>
              <Typography variant="h6" fontWeight={700} color="text.secondary" gutterBottom>
                Sin materias asignadas
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 340, mx: 'auto' }}>
                No tenés asignaciones activas para el período actual. Contactá a secretaría.
              </Typography>
            </Box>
          </Fade>
        )}

        {/* ══ SIN RESULTADOS POR FILTRO ══ */}
        {!loading && asignaciones.length > 0 && asignacionesFiltradas.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" fontWeight={700} color="text.secondary">
              No se encontraron materias con los filtros seleccionados.
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
              Prueba limpiando el buscador o el filtro de grado.
            </Typography>
          </Box>
        )}

        {/* ══ VISTA DE TARJETAS (Mismo grid minmax(260px, 1fr)) ══ */}
        {!loading && asignacionesFiltradas.length > 0 && viewMode === 'cards' && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(auto-fill, minmax(260px, 1fr))',
                md: 'repeat(auto-fill, minmax(270px, 1fr))',
                lg: 'repeat(auto-fill, minmax(280px, 1fr))',
                xl: 'repeat(4, 1fr)',
              },
              gap: 2.5,
            }}
          >
            {asignacionesFiltradas.map((asig) => (
              <MaterialCard
                key={asig.asignacion_id}
                asignacion={asig}
                accentColor={accentColor}
                gradBg={gradBg}
                isDark={isDark}
                onView={handleIr}
              />
            ))}
          </Box>
        )}

        {/* ══ VISTA DE TABLA / LISTA ══ */}
        {!loading && asignacionesFiltradas.length > 0 && viewMode === 'table' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {asignacionesFiltradas.map((asig) => (
              <MaterialRow
                key={asig.asignacion_id}
                asignacion={asig}
                accentColor={accentColor}
                gradBg={gradBg}
                isDark={isDark}
                onView={handleIr}
              />
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}