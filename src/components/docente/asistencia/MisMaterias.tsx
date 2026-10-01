'use client';
// components/docente/asistencia/MisMaterias.tsx
// Rediseñado con estilo unificado Temario / Calificaciones

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Skeleton,
  useTheme,
  alpha,
  Card,
  CardContent,
  Avatar,
  Badge,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Fade,
} from '@mui/material';
import { keyframes } from '@mui/system';
import {
  MenuBook as MenuBookIcon,
  Psychology as PsychologyIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  School as SchoolIcon,
  ChevronRight as ChevronRightIcon,
  Search as SearchIcon,
  ViewModule as ViewModuleIcon,
  TableRows as TableRowsIcon,
  CheckCircleRounded as CheckCircleRoundedIcon,
  TouchAppRounded as TouchAppRoundedIcon,
} from '@mui/icons-material';

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface MateriaDocente {
  asignacion_id: number;
  materia_nombre: string;
  materia_codigo: string;
  paralelo_nombre: string;
  grado_nombre: string;
  turno_nombre: string;
  turno_hora_inicio: string;
  turno_hora_fin: string;
  total_estudiantes: number;
  color?: string;
  lista_pasada_hoy?: boolean;
  hora_ultimo_registro?: string;
}

interface Props {
  materias: MateriaDocente[];
  isLoading?: boolean;
  seleccionada: number | null;
  onSeleccionar: (asignacion_id: number) => void;
  fecha: string;
}

// ─── Animaciones ──────────────────────────────────────────────────────────────
const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
`;

// ─── Card Individual (Temario / Calificaciones style) ─────────────────────────
interface MateriaCardProps {
  materia: MateriaDocente;
  isSelected: boolean;
  accentColor: string;
  gradBg: string;
  isDark: boolean;
  onSelect: () => void;
}

const MateriaCard: React.FC<MateriaCardProps> = ({
  materia,
  isSelected,
  accentColor,
  gradBg,
  isDark,
  onSelect,
}) => {
  return (
    <Fade in timeout={300}>
      <Card
        sx={{
          height: '100%',
          borderRadius: '18px',
          border: isSelected
            ? `2px solid ${accentColor}`
            : `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
          bgcolor: isSelected
            ? isDark
              ? alpha(accentColor, 0.06)
              : alpha(accentColor, 0.04)
            : isDark
            ? alpha('#fff', 0.02)
            : '#fff',
          boxShadow: isSelected
            ? `0 8px 24px ${alpha(accentColor, 0.28)}`
            : isDark
            ? 'none'
            : '0 2px 8px rgba(0,0,0,0.04)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: `0 10px 22px ${alpha(accentColor, 0.2)}`,
            borderColor: accentColor,
            '& .btn-gestionar': {
              backgroundColor: alpha(accentColor, 0.15),
              borderColor: accentColor,
              transform: 'translateX(2px)',
            },
          },
        }}
        onClick={onSelect}
      >
        {/* Badge de Paralelo arriba a la izquierda */}
        <Chip
          label={`Paralelo "${materia.paralelo_nombre}"`}
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

        {/* Chip de Selección arriba a la derecha */}
        <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
          {isSelected ? (
            <Chip
              icon={<CheckCircleRoundedIcon sx={{ fontSize: '13px !important', color: `${accentColor} !important` }} />}
              label="Activa"
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.65rem',
                height: 22,
                backgroundColor: isDark ? alpha(accentColor, 0.2) : alpha(accentColor, 0.12),
                color: accentColor,
                border: `1px solid ${accentColor}`,
              }}
            />
          ) : (
            <Chip
              label={materia.turno_nombre || 'Regular'}
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: '0.65rem',
                height: 22,
                backgroundColor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                color: 'text.secondary',
              }}
            />
          )}
        </Box>

        <CardContent sx={{ p: 2.2, pt: 4.5, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Avatar mediano centrado */}
          <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center' }}>
            <Avatar
              sx={{
                width: 72,
                height: 72,
                margin: '0 auto',
                bgcolor: accentColor,
                color: isDark ? '#000' : '#fff',
                border: `3px solid ${alpha(accentColor, 0.2)}`,
                boxShadow: isSelected
                  ? `0 6px 16px ${alpha(accentColor, 0.4)}`
                  : `0 6px 14px ${alpha(accentColor, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
              }}
            >
              <PsychologyIcon sx={{ fontSize: 36, color: '#fff' }} />
            </Avatar>
          </Box>

          {/* Nombre de la Materia */}
          <Typography variant="subtitle1" fontWeight={800} gutterBottom sx={{ fontSize: '1.02rem', lineHeight: 1.25, mb: 0.3 }}>
            {materia.materia_nombre}
          </Typography>
          <Typography variant="caption" color="text.secondary" gutterBottom fontWeight={600} sx={{ fontSize: '0.78rem' }}>
            {materia.grado_nombre}
          </Typography>

          {/* Chip de Código */}
          <Box sx={{ my: 0.8 }}>
            <Chip
              label={materia.materia_codigo ? `Código: ${materia.materia_codigo}` : 'Asignatura'}
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

          {/* Botón de acción */}
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
            <Button
              className="btn-gestionar"
              size="small"
              variant={isSelected ? 'contained' : 'outlined'}
              endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.74rem',
                px: 1.8,
                py: 0.4,
                borderColor: alpha(accentColor, 0.35),
                color: isSelected ? (isDark ? '#000' : '#fff') : accentColor,
                bgcolor: isSelected ? accentColor : 'transparent',
                '&:hover': {
                  bgcolor: isSelected ? accentColor : alpha(accentColor, 0.1),
                },
                transition: 'all 0.2s ease',
              }}
            >
              {isSelected ? 'Materia Seleccionada' : 'Ver Estudiantes'}
            </Button>
          </Box>

          {/* Footer stats */}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <PersonIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                Estudiantes:
              </Typography>
              <Typography variant="caption" fontWeight={700} sx={{ ml: 'auto', fontSize: '0.74rem' }}>
                {materia.total_estudiantes ?? 0}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <AccessTimeIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                Turno:
              </Typography>
              <Typography variant="caption" fontWeight={700} sx={{ ml: 'auto', fontSize: '0.74rem' }}>
                {materia.turno_nombre || 'Regular'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};

// ─── Fila Individual (Vista Lista/Tabla) ──────────────────────────────────────
interface MateriaRowProps {
  materia: MateriaDocente;
  isSelected: boolean;
  accentColor: string;
  gradBg: string;
  isDark: boolean;
  onSelect: () => void;
}

const MateriaRow: React.FC<MateriaRowProps> = ({
  materia,
  isSelected,
  accentColor,
  gradBg,
  isDark,
  onSelect,
}) => {
  return (
    <Fade in timeout={250}>
      <Card
        onClick={onSelect}
        sx={{
          borderRadius: '14px',
          border: isSelected
            ? `2px solid ${accentColor}`
            : `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
          bgcolor: isSelected
            ? isDark
              ? alpha(accentColor, 0.06)
              : alpha(accentColor, 0.04)
            : isDark
            ? alpha('#fff', 0.02)
            : '#fff',
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
          <PsychologyIcon sx={{ fontSize: 24 }} />
        </Avatar>

        <Box sx={{ minWidth: 160, flex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2" fontWeight={800} noWrap>
              {materia.materia_nombre}
            </Typography>
            <Chip
              label={`Par. ${materia.paralelo_nombre}`}
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
            {materia.grado_nombre} · {materia.turno_nombre}
          </Typography>
        </Box>

        <Box sx={{ display: { xs: 'none', sm: 'block' }, minWidth: 100, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', display: 'block' }}>
            Estudiantes
          </Typography>
          <Typography variant="body2" fontWeight={800}>
            {materia.total_estudiantes ?? 0}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto', flexShrink: 0 }}>
          {isSelected ? (
            <Chip
              icon={<CheckCircleRoundedIcon sx={{ fontSize: '13px !important', color: `${accentColor} !important` }} />}
              label="Seleccionada"
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.65rem',
                height: 22,
                bgcolor: alpha(accentColor, 0.15),
                color: accentColor,
              }}
            />
          ) : (
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
              Seleccionar
            </Button>
          )}
        </Box>
      </Card>
    </Fade>
  );
};

// ─── Componente Principal MisMaterias ─────────────────────────────────────────
const MisMaterias: React.FC<Props> = ({
  materias,
  isLoading = false,
  seleccionada,
  onSeleccionar,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const accentColor = isDark ? '#facc15' : '#0288d1';
  const accentColorEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${accentColor} 0%, ${accentColorEnd} 100%)`;

  // Estados locales de filtrado y visualización
  const [searchTerm, setSearchTerm] = useState('');
  const [gradoFilter, setGradoFilter] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Grados disponibles
  const gradosDisponibles = useMemo(() => {
    const setG = new Set<string>();
    materias.forEach((m) => {
      if (m.grado_nombre) setG.add(m.grado_nombre);
    });
    return Array.from(setG).sort();
  }, [materias]);

  // Materias filtradas
  const materiasFiltradas = useMemo(() => {
    return materias.filter((m) => {
      const matchGrado = !gradoFilter || m.grado_nombre === gradoFilter;
      const matchSearch =
        !searchTerm ||
        m.materia_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.grado_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.paralelo_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.materia_codigo?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchGrado && matchSearch;
    });
  }, [materias, gradoFilter, searchTerm]);

  return (
    <Box>
      {/* ══ BARRA DE FILTROS & VISTA ══ */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          mb: 3,
          borderRadius: '16px',
          bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
          border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
        }}
      >
        {/* BUSCADOR */}
        <TextField
          placeholder="Buscar por materia, grado o paralelo..."
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

      {/* ══ LOADING ══ */}
      {isLoading && (
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
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={260} sx={{ borderRadius: '18px' }} />
          ))}
        </Box>
      )}

      {/* ══ SIN MATERIAS ══ */}
      {!isLoading && materias.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            borderRadius: '16px',
            border: `2px dashed ${alpha(accentColor, 0.2)}`,
          }}
        >
          <MenuBookIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1, opacity: 0.6 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={700}>
            Sin materias asignadas
          </Typography>
          <Typography variant="body2" color="text.disabled">
            No tenés materias asignadas para este período académico
          </Typography>
        </Box>
      )}

      {/* ══ SIN RESULTADOS POR FILTRO ══ */}
      {!isLoading && materias.length > 0 && materiasFiltradas.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="body1" fontWeight={700} color="text.secondary">
            No se encontraron materias con ese filtro.
          </Typography>
        </Box>
      )}

      {/* ══ VISTA DE TARJETAS (minmax(260px, 1fr)) ══ */}
      {!isLoading && materiasFiltradas.length > 0 && viewMode === 'cards' && (
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
          {materiasFiltradas.map((m) => (
            <MateriaCard
              key={m.asignacion_id}
              materia={m}
              isSelected={seleccionada === m.asignacion_id}
              accentColor={accentColor}
              gradBg={gradBg}
              isDark={isDark}
              onSelect={() => onSeleccionar(m.asignacion_id)}
            />
          ))}
        </Box>
      )}

      {/* ══ VISTA DE LISTA / TABLA ══ */}
      {!isLoading && materiasFiltradas.length > 0 && viewMode === 'table' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {materiasFiltradas.map((m) => (
            <MateriaRow
              key={m.asignacion_id}
              materia={m}
              isSelected={seleccionada === m.asignacion_id}
              accentColor={accentColor}
              gradBg={gradBg}
              isDark={isDark}
              onSelect={() => onSeleccionar(m.asignacion_id)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default MisMaterias;