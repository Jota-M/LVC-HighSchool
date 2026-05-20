'use client';
// components/docente/asistencia/PaseListaInteractivo.tsx
// ✨ PREMIUM VERSION - Diseño premium con micro-interacciones

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  IconButton,
  TextField,
  Tooltip,
  Collapse,
  CircularProgress,
  Stack,
  useTheme,
  alpha,
  LinearProgress,
} from '@mui/material';
import { keyframes } from '@mui/system';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import CommentRoundedIcon from '@mui/icons-material/CommentRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BoltIcon from '@mui/icons-material/Bolt';

import {
  EstudianteDia,
  EstadoAsistencia,
  RegistroMasivoItem,
} from '@/types/asistenciaTypes';

// ──────────────────────────────────────────────
// CONSTANTES DE ESTADO CON MEJORAS
// ──────────────────────────────────────────────

interface OpcionEstado {
  value: EstadoAsistencia;
  label: string;
  labelCorto: string;
  color: string;
  colorDark: string;
  bgColor: string;
  bgColorDark: string;
  icon: React.ReactNode;
  gradient: string;
}

const OPCIONES: OpcionEstado[] = [
  {
    value: 'presente',
    label: 'Presente',
    labelCorto: 'P',
    color: '#10b981',
    colorDark: '#34d399',
    bgColor: '#d1fae5',
    bgColorDark: '#065f46',
    icon: <CheckCircleRoundedIcon />,
    gradient: 'linear-gradient(135deg, #10b981, #34d399)',
  },
  {
    value: 'ausente',
    label: 'Ausente',
    labelCorto: 'A',
    color: '#ef4444',
    colorDark: '#f87171',
    bgColor: '#fee2e2',
    bgColorDark: '#7f1d1d',
    icon: <CancelRoundedIcon />,
    gradient: 'linear-gradient(135deg, #ef4444, #f87171)',
  },
  {
    value: 'tardanza',
    label: 'Tardanza',
    labelCorto: 'T',
    color: '#f59e0b',
    colorDark: '#fbbf24',
    bgColor: '#fef3c7',
    bgColorDark: '#78350f',
    icon: <AccessTimeRoundedIcon />,
    gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
  },
  {
    value: 'justificado',
    label: 'Justificado',
    labelCorto: 'J',
    color: '#3b82f6',
    colorDark: '#60a5fa',
    bgColor: '#dbeafe',
    bgColorDark: '#1e3a8a',
    icon: <VerifiedRoundedIcon />,
    gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
  },
  {
    value: 'falta_parcial',
    label: 'F. Parcial',
    labelCorto: 'FP',
    color: '#8b5cf6',
    colorDark: '#a78bfa',
    bgColor: '#ede9fe',
    bgColorDark: '#4c1d95',
    icon: <RemoveCircleOutlineRoundedIcon />,
    gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
  },
];

const getOpcion = (estado?: EstadoAsistencia) =>
  OPCIONES.find(o => o.value === estado);

// ──────────────────────────────────────────────
// ANIMACIONES PREMIUM
// ──────────────────────────────────────────────

const slideIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateX(-20px);
  }
  to { 
    opacity: 1; 
    transform: translateX(0);
  }
`;

const bounceIn = keyframes`
  0% { 
    opacity: 0;
    transform: scale(0.3);
  }
  50% { 
    transform: scale(1.05);
  }
  70% { 
    transform: scale(0.9);
  }
  100% { 
    opacity: 1;
    transform: scale(1);
  }
`;

const glow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 5px currentColor, 0 0 10px currentColor;
  }
  50% { 
    box-shadow: 0 0 20px currentColor, 0 0 30px currentColor;
  }
`;

const progressShimmer = keyframes`
  0% { 
    background-position: -200% center;
  }
  100% { 
    background-position: 200% center;
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

// ──────────────────────────────────────────────
// BOTÓN DE ESTADO PREMIUM
// ──────────────────────────────────────────────

const BtnEstado: React.FC<{
  opcion: OpcionEstado;
  isSelected: boolean;
  onClick: () => void;
  compact?: boolean;
}> = ({ opcion, isSelected, onClick, compact = false }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const color = isDark ? opcion.colorDark : opcion.color;

  return (
    <Tooltip title={opcion.label} placement="top" arrow>
      <Box
        onClick={onClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: compact ? 0 : 0.5,
          px: compact ? 1.2 : 2,
          py: compact ? 0.8 : 1,
          borderRadius: 2.5,
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          border: `2px solid ${isSelected ? color : 'transparent'}`,
          background: isSelected
            ? opcion.gradient
            : isDark
              ? alpha('#fff', 0.03)
              : alpha('#000', 0.02),
          color: isSelected ? '#fff' : isDark ? alpha('#fff', 0.5) : alpha('#000', 0.5),
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          userSelect: 'none',
          
          ...(isSelected && {
            animation: `${bounceIn} 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)`,
            boxShadow: `0 4px 20px ${alpha(color, 0.4)}, 0 0 0 3px ${alpha(color, 0.2)}`,
          }),
          
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: `linear-gradient(90deg, transparent, ${alpha('#fff', 0.2)}, transparent)`,
            transition: 'left 0.5s ease',
          },
          
          '&:hover': {
            border: `2px solid ${color}`,
            background: isSelected 
              ? opcion.gradient
              : alpha(color, 0.1),
            color: isSelected ? '#fff' : color,
            transform: 'translateY(-3px) scale(1.05)',
            boxShadow: `0 6px 25px ${alpha(color, 0.3)}`,
            
            '&::before': {
              left: '100%',
            },
          },
          
          '&:active': { 
            transform: 'scale(0.95)',
          },
        }}
      >
        <Box sx={{ display: 'flex', fontSize: compact ? 16 : 20, '& svg': { fontSize: 'inherit' } }}>
          {opcion.icon}
        </Box>
        {!compact && (
          <Typography variant="caption" fontWeight={800} sx={{ lineHeight: 1, fontSize: 12 }}>
            {opcion.labelCorto}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
};

// ──────────────────────────────────────────────
// FILA DE ESTUDIANTE PREMIUM
// ──────────────────────────────────────────────

const FilaEstudiante: React.FC<{
  estudiante: EstudianteDia;
  numero: number;
  marcacion?: RegistroMasivoItem;
  onMarcar: (matricula_id: number, datos: Partial<RegistroMasivoItem>) => void;
  compact: boolean;
}> = ({ estudiante, numero, marcacion, onMarcar, compact }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [showObs, setShowObs] = useState(false);
  const [obs, setObs] = useState(marcacion?.observaciones ?? '');
  const [isHovered, setIsHovered] = useState(false);

  const estadoActual = marcacion?.estado;
  const opcionActual = getOpcion(estadoActual);
  const color = opcionActual ? (isDark ? opcionActual.colorDark : opcionActual.color) : undefined;

  const handleEstado = (valor: EstadoAsistencia) => {
    if (estadoActual === valor) {
      onMarcar(estudiante.matricula_id, { estado: undefined as any });
    } else {
      onMarcar(estudiante.matricula_id, {
        matricula_id: estudiante.matricula_id,
        estado: valor,
        observaciones: obs || undefined,
      });
    }
  };

  const handleObsBlur = () => {
    if (estadoActual) {
      onMarcar(estudiante.matricula_id, { observaciones: obs || undefined });
    }
  };

  const iniciales = `${estudiante.estudiante_nombres[0]}${estudiante.estudiante_apellidos[0]}`;
  const nombreCompleto = `${estudiante.estudiante_apellidos}, ${estudiante.estudiante_nombres}`;

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        borderRadius: 3,
        border: `2px solid`,
        borderColor: estadoActual
          ? color
          : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08),
        background: estadoActual
          ? isDark 
            ? `linear-gradient(135deg, ${alpha(color!, 0.1)} 0%, ${alpha(color!, 0.05)} 100%)`
            : `linear-gradient(135deg, ${alpha(color!, 0.1)} 0%, ${alpha(color!, 0.03)} 100%)`
          : isDark
            ? 'linear-gradient(145deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)'
            : 'linear-gradient(145deg, #ffffff 0%, #fafafa 100%)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        position: 'relative',
        animation: `${slideIn} 0.4s ease-out`,
        
        ...(isHovered && {
          transform: 'translateX(8px)',
          boxShadow: estadoActual
            ? `0 8px 32px ${alpha(color!, 0.3)}`
            : isDark
              ? '0 4px 20px rgba(0,0,0,0.4)'
              : '0 4px 20px rgba(0,0,0,0.1)',
        }),
        
        '&::before': estadoActual ? {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          background: opcionActual?.gradient,
        } : {},
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1.5, sm: 2 },
          px: { xs: 2, sm: 3 },
          py: 1.5,
        }}
      >
        {/* Número con estilo premium */}
        <Box
          sx={{
            minWidth: 32,
            height: 32,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: estadoActual
              ? opcionActual?.gradient
              : isDark
                ? alpha('#fff', 0.05)
                : alpha('#000', 0.05),
            color: estadoActual ? '#fff' : 'text.secondary',
            fontWeight: 800,
            fontSize: 13,
            transition: 'all 0.3s ease',
          }}
        >
          {numero}
        </Box>

        {/* Avatar mejorado */}
        <Avatar
          src={estudiante.estudiante_foto ?? undefined}
          sx={{
            width: 44,
            height: 44,
            fontSize: 14,
            fontWeight: 800,
            background: estadoActual ? opcionActual?.gradient : alpha('#9ca3af', 0.8),
            border: estadoActual ? `3px solid ${alpha(color!, 0.3)}` : 'none',
            boxShadow: estadoActual ? `0 4px 12px ${alpha(color!, 0.3)}` : 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            ...(isHovered && {
              transform: 'scale(1.1)',
            }),
          }}
        >
          {iniciales}
        </Avatar>

        {/* Nombre */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            fontWeight={700}
            noWrap
            sx={{
              color: estadoActual ? color : 'text.primary',
              transition: 'color 0.3s ease',
            }}
          >
            {nombreCompleto}
          </Typography>
          {!compact && (
            <Typography variant="caption" color="text.disabled" noWrap sx={{ fontWeight: 500 }}>
              {estudiante.estudiante_codigo}
            </Typography>
          )}
        </Box>

        {/* Botones de estado */}
        <Box sx={{ display: 'flex', gap: 0.75, flexShrink: 0 }}>
          {OPCIONES.map(op => (
            <BtnEstado
              key={op.value}
              opcion={op}
              isSelected={estadoActual === op.value}
              onClick={() => handleEstado(op.value)}
              compact={compact}
            />
          ))}
        </Box>

        {/* Botón observación mejorado */}
        <Tooltip title="Agregar observación" placement="top">
          <IconButton
            size="small"
            onClick={() => setShowObs(s => !s)}
            sx={{
              bgcolor: obs ? alpha('#f59e0b', 0.15) : 'transparent',
              color: obs ? '#f59e0b' : isDark ? alpha('#fff', 0.4) : alpha('#000', 0.4),
              border: obs ? `1.5px solid ${alpha('#f59e0b', 0.3)}` : 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: alpha('#f59e0b', 0.2),
                color: '#f59e0b',
                transform: 'rotate(180deg) scale(1.1)',
              },
            }}
          >
            {showObs ? <ExpandLessIcon fontSize="small" /> : <CommentRoundedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Observación expandible */}
      <Collapse in={showObs}>
        <Box sx={{ px: 3, pb: 2 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="💭 Agregá una observación opcional..."
            value={obs}
            onChange={e => setObs(e.target.value)}
            onBlur={handleObsBlur}
            variant="outlined"
            multiline
            rows={2}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: 13,
                borderRadius: 2,
                bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.01),
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#f59e0b',
                  borderWidth: 2,
                },
              },
            }}
          />
        </Box>
      </Collapse>
    </Box>
  );
};

// ──────────────────────────────────────────────
// BARRA DE PROGRESO PREMIUM
// ──────────────────────────────────────────────

const BarraProgreso: React.FC<{ valor: number; total: number; marcados: number }> = ({ valor, total, marcados }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isComplete = valor === 100;

  return (
    <Box
      sx={{
        borderRadius: 3,
        background: isDark
          ? 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
          : 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.05)}`,
        p: 3,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Efecto de brillo en fondo */}
      {isComplete && (
        <Box
          sx={{
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            background: 'linear-gradient(45deg, #10b981, #34d399)',
            opacity: 0.1,
            filter: 'blur(20px)',
            animation: `${glow} 2s ease-in-out infinite`,
          }}
        />
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BoltIcon sx={{ color: isComplete ? '#10b981' : '#f59e0b', fontSize: 20 }} />
          <Typography variant="body2" fontWeight={800}>
            Progreso del pase
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
            variant="h6" 
            fontWeight={900}
            sx={{
              background: isComplete
                ? 'linear-gradient(135deg, #10b981, #34d399)'
                : 'linear-gradient(135deg, #f59e0b, #fbbf24)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {marcados}
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            / {total}
          </Typography>
        </Box>
      </Box>

      {/* Barra con efecto shimmer */}
      <Box
        sx={{
          height: 14,
          borderRadius: 7,
          bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.05),
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${valor}%`,
            borderRadius: 7,
            background: isComplete
              ? 'linear-gradient(90deg, #10b981, #34d399)'
              : 'linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)',
            backgroundSize: '200% 100%',
            position: 'relative',
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            
            ...(valor < 100 && {
              animation: `${progressShimmer} 2s linear infinite`,
            }),
            
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              backgroundSize: '200% 100%',
              animation: `${progressShimmer} 1.5s linear infinite`,
            },
          }}
        />
      </Box>

      <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        {isComplete ? (
          <>
            <AutoAwesomeIcon sx={{ fontSize: 16, color: '#10b981' }} />
            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700 }}>
              ¡Lista completa! Lista para guardar
            </Typography>
          </>
        ) : (
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {total - marcados} estudiante{total - marcados !== 1 ? 's' : ''} sin marcar
          </Typography>
        )}
      </Box>
    </Box>
  );
};

// ──────────────────────────────────────────────
// CONTADOR DE ESTADOS PREMIUM
// ──────────────────────────────────────────────

const ContadorEstados: React.FC<{ marcaciones: Record<number, RegistroMasivoItem> }> = ({ marcaciones }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const conteos = OPCIONES.map(op => ({
    ...op,
    count: Object.values(marcaciones).filter(m => m.estado === op.value).length,
  }));

  return (
    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
      {conteos.map(c => c.count > 0 && (
        <Box
          key={c.value}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: 2.5,
            background: c.gradient,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha('#fff', 0.2)}`,
            boxShadow: `0 4px 12px ${alpha(c.color, 0.3)}`,
            animation: `${bounceIn} 0.5s ease-out`,
          }}
        >
          <Box sx={{ '& svg': { fontSize: 18, color: '#fff' } }}>
            {c.icon}
          </Box>
          <Typography variant="body2" fontWeight={800} sx={{ color: '#fff' }}>
            {c.count}
          </Typography>
          <Typography variant="caption" fontWeight={600} sx={{ color: alpha('#fff', 0.9) }}>
            {c.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// ──────────────────────────────────────────────
// PROPS PRINCIPALES
// ──────────────────────────────────────────────

interface Props {
  lista: EstudianteDia[];
  marcaciones: Record<number, RegistroMasivoItem>;
  isLoading: boolean;
  isSaving: boolean;
  porcentajeCompletado: number;
  materiaNombre?: string;
  gradoParalelo?: string;
  fecha: string;
  onMarcar: (matricula_id: number, datos: Partial<RegistroMasivoItem>) => void;
  onMarcarTodos: (estado: EstadoAsistencia) => void;
  onGuardar: () => void;
}

// ──────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ──────────────────────────────────────────────

const PaseListaInteractivo: React.FC<Props> = ({
  lista,
  marcaciones,
  isLoading,
  isSaving,
  porcentajeCompletado,
  materiaNombre,
  gradoParalelo,
  fecha,
  onMarcar,
  onMarcarTodos,
  onGuardar,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [busqueda, setBusqueda] = useState('');
  const [compact, setCompact] = useState(false);

  const listaFiltrada = busqueda.trim()
    ? lista.filter(e =>
        `${e.estudiante_nombres} ${e.estudiante_apellidos} ${e.estudiante_codigo}`
          .toLowerCase()
          .includes(busqueda.toLowerCase())
      )
    : lista;

  const marcados = Object.keys(marcaciones).length;

  if (isLoading) {
    return (
      <Card 
        sx={{ 
          borderRadius: 4,
          p: 6,
          textAlign: 'center',
          background: isDark
            ? 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'
            : 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.05)}`,
        }}
      >
        <CircularProgress 
          sx={{ 
            color: isDark ? '#fbbf24' : '#3b82f6',
            mb: 3,
          }} 
          size={60}
          thickness={4}
        />
        <Typography variant="h6" color="text.secondary" fontWeight={700}>
          Cargando lista de estudiantes...
        </Typography>
        <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
          Por favor esperá un momento
        </Typography>
      </Card>
    );
  }

  if (lista.length === 0) {
    return (
      <Card 
        sx={{ 
          borderRadius: 4,
          background: isDark
            ? 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'
            : 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.05)}`,
        }}
      >
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <PersonRoundedIcon 
            sx={{ 
              fontSize: 80,
              color: 'text.disabled',
              mb: 3,
              opacity: 0.5,
              animation: `${float} 3s ease-in-out infinite`,
            }} 
          />
          <Typography variant="h5" fontWeight={800} color="text.secondary" sx={{ mb: 1 }}>
            No hay estudiantes en esta lista
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Verificá que la materia tenga estudiantes matriculados
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        borderRadius: 4,
        background: isDark
          ? 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'
          : 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.05)}`,
        overflow: 'visible',
        boxShadow: isDark
          ? '0 8px 32px rgba(0,0,0,0.4)'
          : '0 8px 32px rgba(0,0,0,0.08)',
      }}
    >
      {/* ── HEADER PREMIUM ── */}
      <Box
        sx={{
          px: 4,
          pt: 4,
          pb: 3,
          borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)}`,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography 
              variant="h5" 
              fontWeight={900}
              sx={{
                background: isDark
                  ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                  : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: -0.5,
                mb: 0.5,
              }}
            >
              {materiaNombre ?? 'Pase de Lista'}
            </Typography>
            {gradoParalelo && (
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                {gradoParalelo} · {new Date(fecha + 'T12:00:00').toLocaleDateString('es-BO', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </Typography>
            )}
          </Box>

          <Tooltip title={compact ? 'Vista expandida' : 'Vista compacta'}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setCompact(c => !c)}
              sx={{
                borderRadius: 2.5,
                borderColor: isDark ? '#fbbf24' : '#3b82f6',
                color: isDark ? '#fbbf24' : '#3b82f6',
                textTransform: 'none',
                fontWeight: 700,
                px: 3,
                '&:hover': {
                  borderColor: isDark ? '#f59e0b' : '#2563eb',
                  bgcolor: isDark ? alpha('#fbbf24', 0.1) : alpha('#3b82f6', 0.1),
                },
              }}
            >
              {compact ? '⬜ Expandir' : '▪️ Compactar'}
            </Button>
          </Tooltip>
        </Box>

        <BarraProgreso valor={porcentajeCompletado} total={lista.length} marcados={marcados} />
      </Box>

      {/* ── CONTROLES ── */}
      <Box
        sx={{
          px: 4,
          py: 3,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', sm: 'center' },
          borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)}`,
          background: isDark
            ? alpha('#fff', 0.01)
            : alpha('#000', 0.005),
        }}
      >
        {/* Búsqueda mejorada */}
        <TextField
          size="small"
          placeholder="🔍 Buscar estudiante por nombre o código..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          InputProps={{
            startAdornment: (
              <SearchRoundedIcon sx={{ mr: 1.5, color: 'text.disabled', fontSize: 20 }} />
            ),
          }}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
              '&.Mui-focused': {
                bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? '#fbbf24' : '#3b82f6',
                  borderWidth: 2,
                },
              },
            },
          }}
        />

        {/* Acciones rápidas */}
        <Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0 }}>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ 
              alignSelf: 'center',
              mr: 0.5,
              display: { xs: 'none', md: 'block' },
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Todos:
          </Typography>
          {OPCIONES.slice(0, 3).map(op => (
            <Tooltip key={op.value} title={`Marcar todos: ${op.label}`}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => onMarcarTodos(op.value)}
                sx={{
                  minWidth: 44,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  borderColor: isDark ? op.colorDark : op.color,
                  color: isDark ? op.colorDark : op.color,
                  '&:hover': {
                    background: op.gradient,
                    borderColor: 'transparent',
                    color: '#fff',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <Box sx={{ '& svg': { fontSize: 18 } }}>{op.icon}</Box>
              </Button>
            </Tooltip>
          ))}
        </Box>
      </Box>

      {/* Contadores */}
      {marcados > 0 && (
        <Box 
          sx={{ 
            px: 4,
            py: 2.5,
            borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04)}`,
          }}
        >
          <ContadorEstados marcaciones={marcaciones} />
        </Box>
      )}

      {/* ── LISTA ── */}
      <Box sx={{ p: 3 }}>
        {listaFiltrada.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <SearchRoundedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
            <Typography variant="body1" color="text.secondary" fontWeight={600}>
              No se encontraron estudiantes
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Intentá con otro término de búsqueda
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {listaFiltrada.map((est, idx) => (
              <FilaEstudiante
                key={est.matricula_id}
                estudiante={est}
                numero={idx + 1}
                marcacion={marcaciones[est.matricula_id]}
                onMarcar={onMarcar}
                compact={compact}
              />
            ))}
          </Stack>
        )}
      </Box>

      {/* ── FOOTER / GUARDAR ── */}
      <Box
        sx={{
          px: 4,
          py: 3,
          borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          background: isDark
            ? alpha('#fff', 0.01)
            : alpha('#000', 0.005),
        }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {marcados} de {lista.length} estudiantes marcados
          </Typography>
          {marcados < lista.length && (
            <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 600 }}>
              ⚠️ {lista.length - marcados} sin marcar (se guardarán sin estado)
            </Typography>
          )}
        </Box>

        <Button
          variant="contained"
          size="large"
          onClick={onGuardar}
          disabled={isSaving || marcados === 0}
          startIcon={
            isSaving 
              ? <CircularProgress size={20} sx={{ color: '#fff' }} />
              : <SaveRoundedIcon />
          }
          sx={{
            background: marcados > 0
              ? isDark
                ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
              : undefined,
            color: '#fff',
            fontWeight: 900,
            px: 5,
            py: 1.5,
            borderRadius: 3,
            fontSize: '1rem',
            letterSpacing: 0.5,
            textTransform: 'none',
            boxShadow: marcados > 0
              ? isDark
                ? '0 8px 32px rgba(251, 191, 36, 0.4)'
                : '0 8px 32px rgba(59, 130, 246, 0.4)'
              : undefined,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: marcados > 0
                ? isDark
                  ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                : undefined,
              transform: 'translateY(-2px)',
              boxShadow: marcados > 0
                ? isDark
                  ? '0 12px 40px rgba(251, 191, 36, 0.5)'
                  : '0 12px 40px rgba(59, 130, 246, 0.5)'
                : undefined,
            },
            '&:active': {
              transform: 'scale(0.98)',
            },
            '&:disabled': {
              background: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
              color: 'text.disabled',
            },
          }}
        >
          {isSaving ? 'Guardando...' : `💾 Guardar Lista (${marcados})`}
        </Button>
      </Box>
    </Card>
  );
};

export default PaseListaInteractivo;