'use client';
// components/estudiante/materiales/MateriasSelector.tsx
// Catálogo principal de Materiales Académicos del estudiante (Estilo idéntico a Docente Materiales)

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  alpha,
  useTheme,
  Skeleton,
  Fade,
  LinearProgress,
  keyframes,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Paper,
  Avatar,
  Badge,
  Button,
} from '@mui/material';
import {
  FolderSharedRounded as FolderSharedIcon,
  FolderRounded as FolderIcon,
  SearchRounded as SearchIcon,
  ClearRounded as ClearIcon,
  RefreshRounded as RefreshIcon,
  PersonRounded as PersonIcon,
  SchoolRounded as SchoolIcon,
  ChevronRightRounded as ChevronRightIcon,
  GridViewRounded as GridIcon,
  ViewListRounded as ListIcon,
  AutoAwesomeRounded as AIIcon,
  MenuBookRounded as MenuBookIcon,
  CheckCircleRounded as CheckIcon,
  DescriptionRounded as FileIcon,
} from '@mui/icons-material';

import { useMisMaterias } from '@/hooks/useEstudiante';
import { estudianteService } from '@/services/estudianteService';
import type { MateriaResumen } from '@/services/estudianteService';

// ── Animaciones ──────────────────────────────────────────────
const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-5px); }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ── Paleta Dinámica Dual ─────────────────────────────────────
const usePalette = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accentColor = isDark ? '#facc15' : '#0288d1';
  const accentColorEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${accentColor} 0%, ${accentColorEnd} 100%)`;
  const textOnAccent = isDark ? '#000000' : '#ffffff';
  return { isDark, accentColor, accentColorEnd, gradBg, textOnAccent };
};

interface MateriasSelectorProps {
  user: any;
}

export const MateriasSelector: React.FC<MateriasSelectorProps> = ({ user }) => {
  const router = useRouter();
  const { isDark, accentColor, gradBg } = usePalette();

  const [busqueda, setBusqueda] = useState('');
  const [gridMode, setGridMode] = useState(true);
  const [areaFiltro, setAreaFiltro] = useState<string | null>(null);

  const { materias, isLoading, refrescar } = useMisMaterias();
  const [pendientesAsignados, setPendientesAsignados] = useState(0);

  useEffect(() => {
    estudianteService
      .getMaterialesAsignadosPendientes()
      .then(res => setPendientesAsignados(res.data.total))
      .catch(() => {});
  }, []);

  // Filtrado de materias
  const materiasFiltradas = useMemo(() => {
    return materias.filter(m => {
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase();
        const coincide =
          m.materia_nombre.toLowerCase().includes(q) ||
          m.docente_nombres.toLowerCase().includes(q) ||
          m.docente_apellidos.toLowerCase().includes(q) ||
          (m.area_conocimiento && m.area_conocimiento.toLowerCase().includes(q)) ||
          (m.materia_codigo && m.materia_codigo.toLowerCase().includes(q));
        if (!coincide) return false;
      }

      if (areaFiltro && m.area_conocimiento !== areaFiltro) {
        return false;
      }

      return true;
    });
  }, [materias, busqueda, areaFiltro]);

  // Lista de áreas de conocimiento únicas
  const areasUnicas = useMemo(() => {
    const set = new Set<string>();
    materias.forEach(m => {
      if (m.area_conocimiento) set.add(m.area_conocimiento);
    });
    return Array.from(set);
  }, [materias]);

  // Métricas globales
  const stats = useMemo(() => {
    const total = materias.length;
    const totalMateriales = materias.reduce((acc, m) => acc + (m.total_materiales || 0), 0);
    return { total, totalMateriales };
  }, [materias]);

  const nombreUsuario = user?.username || user?.nombres || 'Estudiante';

  const handleVerMateriales = useCallback(
    (m: MateriaResumen) => {
      router.push(`/dashboard/estudiante/materiales/${m.asignacion_docente_id}`);
    },
    [router]
  );

  return (
    <Box sx={{ pb: 6 }}>
      {/* ══ 1. HEADER INSTITUCIONAL (ESTILO DOCENTE MATERIALES) ══ */}
      <Fade in timeout={450}>
        <Box sx={{ mb: 3.5 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 2.2, md: 0 },
              mb: 2.5,
            }}
          >
            {/* IZQUIERDA: ÍCONO BOUNCE + TÍTULO */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.6 }}>
                <Box
                  sx={{
                    width: { xs: 44, md: 52 },
                    height: { xs: 44, md: 52 },
                    borderRadius: '16px',
                    background: gradBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 16px ${alpha(accentColor, 0.35)}`,
                    animation: `${bounce} 2s infinite ease-in-out`,
                  }}
                >
                  <FolderSharedIcon sx={{ color: isDark ? '#000' : '#fff', fontSize: { xs: 24, md: 30 } }} />
                </Box>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '1.6rem', sm: '2rem', md: '2.4rem' },
                    fontWeight: 900,
                    background: gradBg,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: -0.6,
                    lineHeight: 1.15,
                  }}
                >
                  Materiales Académicos
                </Typography>
              </Box>

              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.8, fontWeight: 500 }}>
                Hola, <strong>{nombreUsuario}</strong> — accede al repositorio digital, guías de estudio y recursos compartidos por tus docentes.
              </Typography>
            </Box>

            {/* DERECHA: BADGES Y BOTÓN ACTUALIZAR */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Chip
                icon={<SchoolIcon sx={{ fontSize: '15px !important' }} />}
                label={`${stats.total} asignaturas`}
                size="small"
                sx={{
                  height: 34,
                  fontWeight: 800,
                  fontSize: 12.5,
                  bgcolor: isDark ? alpha(accentColor, 0.16) : alpha(accentColor, 0.1),
                  color: accentColor,
                  border: `1.5px solid ${alpha(accentColor, 0.35)}`,
                  borderRadius: '11px',
                  '& .MuiChip-icon': { color: accentColor },
                }}
              />

              <Chip
                icon={<FileIcon sx={{ fontSize: '15px !important' }} />}
                label={`${stats.totalMateriales} recursos disponibles`}
                size="small"
                sx={{
                  height: 34,
                  fontWeight: 800,
                  fontSize: 12.5,
                  bgcolor: isDark ? alpha('#10b981', 0.16) : alpha('#10b981', 0.1),
                  color: isDark ? '#34d399' : '#059669',
                  border: `1.5px solid ${alpha('#10b981', 0.35)}`,
                  borderRadius: '11px',
                  '& .MuiChip-icon': { color: isDark ? '#34d399' : '#059669' },
                }}
              />

              {pendientesAsignados > 0 && (
                <Chip
                  icon={<AIIcon sx={{ fontSize: '14px !important' }} />}
                  label={`${pendientesAsignados} nuevos`}
                  size="small"
                  sx={{
                    height: 34,
                    fontWeight: 800,
                    fontSize: 12.5,
                    bgcolor: isDark ? alpha('#f59e0b', 0.16) : alpha('#f59e0b', 0.12),
                    color: isDark ? '#fbbf24' : '#d97706',
                    border: `1.5px solid ${alpha('#f59e0b', 0.35)}`,
                    borderRadius: '11px',
                    '& .MuiChip-icon': { color: isDark ? '#fbbf24' : '#d97706' },
                  }}
                />
              )}

              <Tooltip title="Actualizar materiales">
                <IconButton
                  onClick={refrescar}
                  disabled={isLoading}
                  sx={{
                    borderRadius: '14px',
                    border: `1.5px solid ${alpha(accentColor, 0.3)}`,
                    bgcolor: isDark ? alpha(accentColor, 0.1) : alpha(accentColor, 0.06),
                    color: accentColor,
                    p: 1.1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: alpha(accentColor, 0.2),
                      transform: 'rotate(180deg)',
                    },
                  }}
                >
                  <RefreshIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* ══ BARRA DE BÚSQUEDA Y FILTROS POR ÁREA ══ */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.8, sm: 2.2 },
              borderRadius: '18px',
              border: `1.5px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.025)' : '#ffffff',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'stretch', md: 'center' },
              gap: 2,
              justifyContent: 'space-between',
            }}
          >
            <TextField
              size="small"
              placeholder="Buscar por materia, docente, código o área..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: busqueda ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setBusqueda('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              sx={{
                flex: 1,
                minWidth: { xs: '100%', md: 280 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: isDark ? alpha('#000', 0.2) : alpha('#000', 0.02),
                  '& fieldset': { borderColor: alpha(isDark ? '#fff' : '#000', 0.1) },
                  '&:hover fieldset': { borderColor: accentColor },
                },
              }}
            />

            {/* Chips de filtro por Área de conocimiento */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label="Todas las áreas"
                onClick={() => setAreaFiltro(null)}
                size="small"
                clickable
                sx={{
                  height: 32,
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  bgcolor: !areaFiltro ? accentColor : isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                  color: !areaFiltro ? (isDark ? '#000' : '#fff') : 'text.secondary',
                  border: `1.5px solid ${!areaFiltro ? accentColor : alpha(isDark ? '#fff' : '#000', 0.08)}`,
                }}
              />

              {areasUnicas.map(area => (
                <Chip
                  key={area}
                  label={area}
                  onClick={() => setAreaFiltro(areaFiltro === area ? null : area)}
                  size="small"
                  clickable
                  sx={{
                    height: 32,
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.76rem',
                    bgcolor: areaFiltro === area ? accentColor : isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                    color: areaFiltro === area ? (isDark ? '#000' : '#fff') : 'text.secondary',
                    border: `1.5px solid ${areaFiltro === area ? accentColor : alpha(isDark ? '#fff' : '#000', 0.08)}`,
                  }}
                />
              ))}

              {/* Botón switch vista cuadrícula / lista */}
              <Box
                sx={{
                  display: 'flex',
                  p: 0.4,
                  borderRadius: '12px',
                  bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                  border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                  ml: { md: 1 },
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => setGridMode(true)}
                  sx={{
                    p: 0.6,
                    borderRadius: '8px',
                    bgcolor: gridMode ? accentColor : 'transparent',
                    color: gridMode ? (isDark ? '#000' : '#fff') : 'text.secondary',
                    '&:hover': { bgcolor: gridMode ? accentColor : alpha(accentColor, 0.15) },
                  }}
                >
                  <GridIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setGridMode(false)}
                  sx={{
                    p: 0.6,
                    borderRadius: '8px',
                    bgcolor: !gridMode ? accentColor : 'transparent',
                    color: !gridMode ? (isDark ? '#000' : '#fff') : 'text.secondary',
                    '&:hover': { bgcolor: !gridMode ? accentColor : alpha(accentColor, 0.15) },
                  }}
                >
                  <ListIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Fade>

      {/* ══ 2. GRID / LISTA DE MATERIAS (ESTILO DOCENTE) ══ */}
      {isLoading ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(auto-fill, minmax(260px, 320px))',
              md: 'repeat(auto-fill, minmax(270px, 330px))',
            },
            gap: 2.5,
          }}
        >
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} variant="rounded" height={320} sx={{ borderRadius: '18px', maxWidth: 340 }} />
          ))}
        </Box>
      ) : materiasFiltradas.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: '20px',
            border: `1.5px dashed ${alpha(isDark ? '#fff' : '#000', 0.12)}`,
            bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.01),
          }}
        >
          <FolderIcon sx={{ fontSize: 52, color: 'text.disabled', mb: 1.5 }} />
          <Typography variant="h6" fontWeight={800} color="text.secondary">
            No se encontraron asignaturas con recursos
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 420, mx: 'auto', mt: 0.5 }}>
            No hay materias que coincidan con la búsqueda o tus docentes aún no han publicado materiales para esta sección.
          </Typography>
        </Paper>
      ) : gridMode ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(auto-fill, minmax(260px, 320px))',
              md: 'repeat(auto-fill, minmax(270px, 330px))',
            },
            gap: 2.5,
          }}
        >
          {materiasFiltradas.map((materia, idx) => (
            <MateriaCard
              key={materia.asignacion_docente_id}
              materia={materia}
              index={idx}
              isDark={isDark}
              accentDefault={accentColor}
              onOpen={() => handleVerMateriales(materia)}
            />
          ))}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {materiasFiltradas.map((materia, idx) => (
            <MateriaRow
              key={materia.asignacion_docente_id}
              materia={materia}
              index={idx}
              isDark={isDark}
              accentDefault={accentColor}
              onOpen={() => handleVerMateriales(materia)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────
// TARJETA DE MATERIA (ESTILO DOCENTE MATERIALES / CALIFICACIONES)
// ─────────────────────────────────────────────────────────────

interface MateriaCardProps {
  materia: MateriaResumen;
  index: number;
  isDark: boolean;
  accentDefault: string;
  onOpen: () => void;
}

const MateriaCard: React.FC<MateriaCardProps> = ({
  materia,
  index,
  isDark,
  accentDefault,
  onOpen,
}) => {
  const color = materia.materia_color || accentDefault;
  const totalRecursos = materia.total_materiales || 0;

  return (
    <Fade in timeout={300 + index * 40}>
      <Card
        sx={{
          height: '100%',
          width: '100%',
          maxWidth: { xs: '100%', sm: 340 },
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
            boxShadow: `0 10px 24px ${alpha(color, 0.22)}`,
            borderColor: color,
            '& .btn-gestionar': {
              backgroundColor: alpha(color, 0.15),
              borderColor: color,
              transform: 'translateX(2px)',
            },
          },
        }}
        onClick={onOpen}
      >
        {/* Badge superior izquierdo: Área de conocimiento */}
        {materia.area_conocimiento && (
          <Chip
            label={materia.area_conocimiento}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              zIndex: 1,
              fontWeight: 700,
              fontSize: '0.68rem',
              height: 22,
              backgroundColor: isDark ? alpha(color, 0.15) : alpha(color, 0.1),
              color: color,
              border: `1px solid ${alpha(color, 0.25)}`,
            }}
          />
        )}

        {/* Chip superior derecho: Total Recursos */}
        <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1, display: 'flex', gap: 0.6 }}>
          <Chip
            icon={<FileIcon sx={{ fontSize: '13px !important', color: `${color} !important` }} />}
            label={`${totalRecursos} recurso${totalRecursos === 1 ? '' : 's'}`}
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: '0.68rem',
              height: 22,
              backgroundColor: isDark ? alpha(color, 0.14) : alpha(color, 0.08),
              color: color,
              border: `1px solid ${alpha(color, 0.25)}`,
            }}
          />
        </Box>

        <CardContent sx={{ p: 2.2, pt: 4.8, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Avatar mediano centrado con badge de código */}
          <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center' }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                materia.materia_codigo ? (
                  <Chip
                    label={materia.materia_codigo}
                    size="small"
                    sx={{
                      height: 20,
                      fontWeight: 800,
                      fontSize: '0.6rem',
                      bgcolor: color,
                      color: isDark ? '#000' : '#fff',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                    }}
                  />
                ) : null
              }
            >
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  margin: '0 auto',
                  bgcolor: isDark ? alpha(color, 0.2) : alpha(color, 0.12),
                  color: color,
                  border: `3px solid ${alpha(color, 0.25)}`,
                  boxShadow: `0 6px 16px ${alpha(color, 0.25)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FolderSharedIcon sx={{ fontSize: 36 }} />
              </Avatar>
            </Badge>
          </Box>

          {/* Nombre de la Materia */}
          <Typography
            variant="subtitle1"
            fontWeight={800}
            gutterBottom
            sx={{ fontSize: '1.05rem', lineHeight: 1.25, mb: 0.3 }}
          >
            {materia.materia_nombre}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            gutterBottom
            fontWeight={600}
            sx={{ fontSize: '0.78rem' }}
          >
            Prof. {materia.docente_nombres} {materia.docente_apellidos}
          </Typography>

          {/* Chip de código o turno */}
          <Box sx={{ my: 0.8 }}>
            <Chip
              label={materia.materia_codigo ? `Código: ${materia.materia_codigo}` : 'Materiales Oficiales'}
              size="small"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: '0.68rem',
                height: 22,
                backgroundColor: isDark ? alpha(color, 0.1) : alpha(color, 0.08),
                color: color,
                border: `1px solid ${alpha(color, 0.2)}`,
              }}
            />
          </Box>

          {/* Botón de acción directo */}
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 1.2 }}>
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
                px: 2,
                py: 0.45,
                borderColor: alpha(color, 0.35),
                color: color,
                transition: 'all 0.2s ease',
              }}
            >
              Ver Recursos
            </Button>
          </Box>

          {/* Información estructurada inferior */}
          <Box
            sx={{
              mt: 'auto',
              pt: 1.6,
              borderTop: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.8,
              textAlign: 'left',
            }}
          >
            {/* Recursos disponibles */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <FolderIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                Archivos y guías:
              </Typography>
              <Typography variant="caption" fontWeight={800} sx={{ ml: 'auto', fontSize: '0.75rem', color }}>
                {totalRecursos} recursos
              </Typography>
            </Box>

            {/* Docente */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <PersonIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                Docente:
              </Typography>
              <Typography variant="caption" fontWeight={700} sx={{ ml: 'auto', fontSize: '0.74rem' }} noWrap>
                {materia.docente_nombres} {materia.docente_apellidos}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};

// ─────────────────────────────────────────────────────────────
// FILA DE MATERIA (VISTA LISTA - ESTILO DOCENTE MATERIALES)
// ─────────────────────────────────────────────────────────────

interface MateriaRowProps {
  materia: MateriaResumen;
  index: number;
  isDark: boolean;
  accentDefault: string;
  onOpen: () => void;
}

const MateriaRow: React.FC<MateriaRowProps> = ({
  materia,
  index,
  isDark,
  accentDefault,
  onOpen,
}) => {
  const color = materia.materia_color || accentDefault;
  const totalRecursos = materia.total_materiales || 0;

  return (
    <Card
      elevation={0}
      onClick={onOpen}
      sx={{
        p: 2,
        borderRadius: '16px',
        border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
        bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: `${fadeUp} 0.35s ease-out ${index * 0.04}s both`,
        '&:hover': {
          transform: 'translateX(4px)',
          borderColor: color,
          boxShadow: `0 6px 20px ${alpha(color, 0.16)}`,
          '& .btn-row-gestionar': {
            bgcolor: alpha(color, 0.15),
            borderColor: color,
            transform: 'translateX(2px)',
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: isDark ? alpha(color, 0.18) : alpha(color, 0.12),
            color,
            border: `2px solid ${alpha(color, 0.25)}`,
            boxShadow: `0 4px 12px ${alpha(color, 0.2)}`,
            flexShrink: 0,
          }}
        >
          <FolderSharedIcon sx={{ fontSize: 24 }} />
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="subtitle1" fontWeight={800} noWrap sx={{ fontSize: '1rem' }}>
              {materia.materia_nombre}
            </Typography>
            {materia.area_conocimiento && (
              <Chip
                label={materia.area_conocimiento}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.64rem',
                  fontWeight: 700,
                  bgcolor: alpha(color, 0.1),
                  color,
                  border: `1px solid ${alpha(color, 0.2)}`,
                  borderRadius: '6px',
                  display: { xs: 'none', sm: 'inline-flex' },
                }}
              />
            )}
          </Box>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Prof. {materia.docente_nombres} {materia.docente_apellidos}
          </Typography>
        </Box>
      </Box>

      {/* Total recursos badge */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.8, minWidth: 140 }}>
        <FileIcon sx={{ fontSize: 16, color }} />
        <Typography variant="caption" fontWeight={700} sx={{ color }}>
          {totalRecursos} recursos
        </Typography>
      </Box>

      {/* Botón Ver Recursos */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
        <Button
          className="btn-row-gestionar"
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
            borderColor: alpha(color, 0.35),
            color: color,
            transition: 'all 0.2s ease',
            display: { xs: 'none', sm: 'inline-flex' },
          }}
        >
          Ver Recursos
        </Button>
        <IconButton size="small" sx={{ color, bgcolor: alpha(color, 0.1), borderRadius: '8px', display: { xs: 'flex', sm: 'none' } }}>
          <ChevronRightIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Card>
  );
};

export default MateriasSelector;