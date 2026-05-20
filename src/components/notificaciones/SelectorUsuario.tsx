'use client';
// components/notificaciones/SelectorUsuario.tsx
//
// Flujo en 2 pasos:
//   1. Elegís el rol (Docente / Padre / Estudiante / Admin)
//   2. Buscás dentro de ese rol por nombre/email
// Así los resultados son acotados y la secretaria sabe exactamente a quién envía.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Typography, alpha, useTheme, CircularProgress,
  TextField, Chip, Collapse,
} from '@mui/material';
import { keyframes } from '@mui/system';

import SearchRoundedIcon             from '@mui/icons-material/SearchRounded';
import CheckCircleRoundedIcon        from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon              from '@mui/icons-material/CloseRounded';
import PersonRoundedIcon             from '@mui/icons-material/PersonRounded';
import SchoolRoundedIcon             from '@mui/icons-material/SchoolRounded';
import FamilyRestroomRoundedIcon     from '@mui/icons-material/FamilyRestroomRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import ArrowBackRoundedIcon          from '@mui/icons-material/ArrowBackRounded';

import usuariosService, { Usuario } from '@/services/usuariosService';

// ─── Animaciones ──────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const scaleUp = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
`;

// ─── Config de roles ──────────────────────────────────────────────────────────
interface RolConfig {
  value: string;       // nombre del rol en la BD
  label: string;
  labelPlural: string;
  color: string;
  bgColor: string;
  Icon: React.ElementType;
  placeholder: string;
  desc: string;
}

const ROLES: RolConfig[] = [
  {
    value: 'docente',
    label: 'Docente',
    labelPlural: 'Docentes',
    color: '#2563eb',
    bgColor: '#dbeafe',
    Icon: SchoolRoundedIcon,
    placeholder: 'Nombre, username o email del docente…',
    desc: 'Profesores activos del sistema',
  },
  {
    value: 'padre_familia',
    label: 'Padre / Tutor',
    labelPlural: 'Padres y tutores',
    color: '#d97706',
    bgColor: '#fef3c7',
    Icon: FamilyRestroomRoundedIcon,
    placeholder: 'Nombre, username o email del padre…',
    desc: 'Tutores y padres de familia',
  },
  {
    value: 'estudiante',
    label: 'Estudiante',
    labelPlural: 'Estudiantes',
    color: '#7c3aed',
    bgColor: '#ede9fe',
    Icon: PersonRoundedIcon,
    placeholder: 'Nombre, username o email del estudiante…',
    desc: 'Alumnos con cuenta en la plataforma',
  },
  {
    value: 'super_admin',
    label: 'Admin',
    labelPlural: 'Administradores',
    color: '#dc2626',
    bgColor: '#fee2e2',
    Icon: AdminPanelSettingsRoundedIcon,
    placeholder: 'Nombre o username del admin…',
    desc: 'Administradores del sistema',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getRolConfig = (usuario: Usuario): RolConfig => {
  const nombre = (usuario.roles?.[0]?.nombre ?? '').toLowerCase();
  return ROLES.find(r => nombre.includes(r.value)) ?? ROLES[2];
};

// ─── Avatar iniciales ────────────────────────────────────────────────────────
const UserAvatar: React.FC<{ usuario: Usuario; size?: number; color: string }> = ({
  usuario, size = 38, color,
}) => (
  <Box sx={{
    width: size, height: size, borderRadius: `${size * 0.28}px`, flexShrink: 0,
    bgcolor: alpha(color, 0.15),
    border: `1.5px solid ${alpha(color, 0.3)}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: size * 0.34, fontWeight: 800, color, lineHeight: 1,
    userSelect: 'none',
  }}>
    {usuario.username.slice(0, 2).toUpperCase()}
  </Box>
);

// ─── Card de resultado del dropdown ──────────────────────────────────────────
const ResultCard: React.FC<{
  usuario: Usuario;
  rolConfig: RolConfig;
  isDark: boolean;
  accentColor: string;
  onClick: () => void;
  index: number;
}> = ({ usuario, rolConfig, isDark, accentColor, onClick, index }) => {
  const RolIcon = rolConfig.Icon;
  return (
    <Box onClick={onClick} sx={{
      display: 'flex', alignItems: 'center', gap: 1.5,
      px: 1.6, py: 1.1, borderRadius: '10px', cursor: 'pointer',
      bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
      border: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.06)}`,
      transition: 'all .12s',
      animation: `${fadeIn} 0.15s ease-out ${index * 0.04}s both`,
      '&:hover': {
        borderColor: accentColor,
        bgcolor: alpha(accentColor, isDark ? 0.1 : 0.05),
        transform: 'translateY(-1px)',
      },
    }}>
      <UserAvatar usuario={usuario} color={rolConfig.color} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" fontWeight={700}
          sx={{ fontSize: 13, display: 'block' }} noWrap>
          {usuario.username}
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }} noWrap>
          {usuario.email}
        </Typography>
      </Box>
      {!usuario.activo && (
        <Chip label="Inactivo" size="small" sx={{
          fontSize: 9, height: 15, flexShrink: 0,
          bgcolor: alpha('#6b7280', 0.12), color: '#6b7280', fontWeight: 700,
        }} />
      )}
    </Box>
  );
};

// ─── Card del usuario ya seleccionado ────────────────────────────────────────
const SelectedCard: React.FC<{
  usuario: Usuario;
  rolConfig: RolConfig;
  accentColor: string;
  isDark: boolean;
  onClear: () => void;
}> = ({ usuario, rolConfig, accentColor, isDark, onClear }) => {
  const RolIcon = rolConfig.Icon;
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1.5,
      px: 2, py: 1.5, borderRadius: '12px',
      border: `1.5px solid ${accentColor}`,
      bgcolor: alpha(accentColor, isDark ? 0.12 : 0.06),
      animation: `${scaleUp} 0.25s ease-out`,
    }}>
      <CheckCircleRoundedIcon sx={{ fontSize: 18, color: accentColor, flexShrink: 0 }} />
      <UserAvatar usuario={usuario} size={40} color={rolConfig.color} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" fontWeight={800}
          sx={{ fontSize: 13.5, color: accentColor, display: 'block' }}>
          {usuario.username}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.2, flexWrap: 'wrap' }}>
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 0.4,
            px: 0.7, py: 0.15, borderRadius: '5px',
            bgcolor: alpha(rolConfig.color, 0.1), color: rolConfig.color,
            fontSize: 10, fontWeight: 700,
          }}>
            <RolIcon sx={{ fontSize: 10 }} />
            {rolConfig.label}
          </Box>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: 11 }}>
            {usuario.email}
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
            · ID #{usuario.id}
          </Typography>
        </Box>
      </Box>
      <Box component="button" onClick={onClear} sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 28, height: 28, borderRadius: '8px',
        border: `1px solid ${alpha(accentColor, 0.3)}`,
        bgcolor: 'transparent', color: accentColor, cursor: 'pointer',
        transition: 'all .15s',
        '&:hover': { bgcolor: alpha(accentColor, 0.12) },
      }}>
        <CloseRoundedIcon sx={{ fontSize: 14 }} />
      </Box>
    </Box>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
export interface SelectorUsuarioProps {
  value: number | undefined;
  onChange: (id: number | undefined, usuario: Usuario | null) => void;
  accentColor: string;
}

export const SelectorUsuario: React.FC<SelectorUsuarioProps> = ({
  value, onChange, accentColor,
}) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [rolSel,     setRolSel]     = useState<RolConfig | null>(null);
  const [query,      setQuery]      = useState('');
  const [resultados, setResultados] = useState<Usuario[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [showDrop,   setShowDrop]   = useState(false);
  const [usuarioSel, setUsuarioSel] = useState<Usuario | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef    = useRef<HTMLInputElement>(null);

  // Si viene un value desde afuera, cargar el objeto
  useEffect(() => {
    if (value && !usuarioSel) {
      usuariosService.obtenerPorId(value)
        .then(u => {
          setUsuarioSel(u);
          setRolSel(getRolConfig(u));
        })
        .catch(() => {});
    }
    if (!value) {
      setUsuarioSel(null);
      setRolSel(null);
    }
  }, [value]);

  // Búsqueda con debounce 300ms, filtrada por rol
  const buscar = useCallback((texto: string, rol: RolConfig | null) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!texto.trim()) {
      setResultados([]);
      setShowDrop(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await usuariosService.listar({
          search: texto.trim(),
          limit: 8,
          page: 1,
          ...(rol ? { rol: rol.value } : {}),
        });
        setResultados(res.data.usuarios);
        setShowDrop(true);
      } catch {
        setResultados([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    buscar(v, rolSel);
  };

  const handleRolSelect = (rol: RolConfig) => {
    setRolSel(rol);
    setQuery('');
    setResultados([]);
    setShowDrop(false);
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const handleUsuarioSelect = (u: Usuario) => {
    setUsuarioSel(u);
    setShowDrop(false);
    setQuery('');
    setResultados([]);
    onChange(u.id, u);
  };

  const handleClear = () => {
    setUsuarioSel(null);
    setRolSel(null);
    setQuery('');
    setResultados([]);
    setShowDrop(false);
    onChange(undefined, null);
  };

  const handleCambiarRol = () => {
    setRolSel(null);
    setQuery('');
    setResultados([]);
    setShowDrop(false);
  };

  const rolColor = rolSel?.color ?? accentColor;

  // ── Vista: usuario ya seleccionado ───────────────────────────────────────
  if (usuarioSel && rolSel) {
    return (
      <SelectedCard
        usuario={usuarioSel}
        rolConfig={rolSel}
        accentColor={accentColor}
        isDark={isDark}
        onClear={handleClear}
      />
    );
  }

  // ── Paso 1: elegir tipo de persona ───────────────────────────────────────
  if (!rolSel) {
    return (
      <Box sx={{ animation: `${fadeIn} 0.2s ease-out` }}>
        <Typography variant="caption" fontWeight={600} color="text.secondary"
          sx={{ display: 'block', mb: 1.5, fontSize: 12 }}>
          ¿A qué tipo de persona querés enviar el mensaje?
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
          {ROLES.map(rol => {
            const RolIcon = rol.Icon;
            return (
              <Box key={rol.value} onClick={() => handleRolSelect(rol)} sx={{
                display: 'flex', alignItems: 'center', gap: 1.2,
                px: 1.5, py: 1.3, borderRadius: '12px', cursor: 'pointer',
                border: `1.5px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                bgcolor: isDark ? alpha('#fff', 0.02) : '#fafafa',
                transition: 'all .15s',
                animation: `${fadeIn} 0.2s ease-out`,
                '&:hover': {
                  borderColor: rol.color,
                  bgcolor: alpha(rol.color, isDark ? 0.1 : 0.05),
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${alpha(rol.color, 0.15)}`,
                },
              }}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                  bgcolor: alpha(rol.color, isDark ? 0.2 : 0.1),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <RolIcon sx={{ fontSize: 18, color: rol.color }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" fontWeight={700}
                    sx={{ display: 'block', fontSize: 13, lineHeight: 1.2 }}>
                    {rol.label}
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                    {rol.desc}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  }

  // ── Paso 2: buscar dentro del rol elegido ─────────────────────────────────
  const RolIcon = rolSel.Icon;
  return (
    <Box sx={{ animation: `${fadeIn} 0.2s ease-out` }}>

      {/* Breadcrumb del rol + botón para cambiar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 0.6,
          px: 1, py: 0.4, borderRadius: '8px',
          bgcolor: alpha(rolSel.color, isDark ? 0.18 : 0.1),
          border: `1px solid ${alpha(rolSel.color, 0.3)}`,
        }}>
          <RolIcon sx={{ fontSize: 12, color: rolSel.color }} />
          <Typography variant="caption" fontWeight={700}
            sx={{ color: rolSel.color, fontSize: 11 }}>
            {rolSel.labelPlural}
          </Typography>
        </Box>
        <Box component="button" onClick={handleCambiarRol} sx={{
          display: 'flex', alignItems: 'center', gap: 0.4,
          px: 0.8, py: 0.3, borderRadius: '7px', border: 'none',
          bgcolor: 'transparent', color: 'text.disabled',
          cursor: 'pointer', fontSize: 11, fontWeight: 600,
          transition: 'color .15s',
          '&:hover': { color: accentColor },
        }}>
          <ArrowBackRoundedIcon sx={{ fontSize: 12 }} />
          Cambiar tipo
        </Box>
      </Box>

      {/* Campo de búsqueda */}
      <Box sx={{ position: 'relative' }}>
        <TextField
          inputRef={inputRef}
          fullWidth size="small"
          label={`Buscar ${rolSel.labelPlural.toLowerCase()} *`}
          placeholder={rolSel.placeholder}
          value={query}
          onChange={handleQueryChange}
          onFocus={() => resultados.length > 0 && setShowDrop(true)}
          onBlur={() => setTimeout(() => setShowDrop(false), 180)}
          InputProps={{
            startAdornment: (
              <Box sx={{ mr: 0.5, color: 'text.disabled', display: 'flex' }}>
                <SearchRoundedIcon sx={{ fontSize: 18 }} />
              </Box>
            ),
            endAdornment: loading
              ? <CircularProgress size={14} sx={{ color: rolColor, mr: 0.5 }} />
              : null,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: rolColor },
            },
            '& .MuiInputLabel-root.Mui-focused': { color: rolColor },
          }}
        />

        {/* Dropdown de resultados */}
        <Collapse in={showDrop && resultados.length > 0}>
          <Box sx={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
            zIndex: 10, borderRadius: '14px',
            border: `1.5px solid ${alpha(rolColor, 0.25)}`,
            bgcolor: isDark ? '#1e1e2e' : '#fff',
            boxShadow: `0 8px 24px ${alpha(rolColor, 0.15)}`,
            overflow: 'hidden', maxHeight: 300, overflowY: 'auto',
            p: 0.75, display: 'flex', flexDirection: 'column', gap: 0.5,
          }}>
            <Typography variant="caption" color="text.disabled"
              sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, px: 1, pt: 0.5, pb: 0.3, display: 'block' }}>
              {resultados.length} {rolSel.labelPlural.toLowerCase()}
            </Typography>
            {resultados.map((u, i) => (
              <ResultCard
                key={u.id}
                usuario={u}
                rolConfig={rolSel}
                accentColor={accentColor}
                isDark={isDark}
                onClick={() => handleUsuarioSelect(u)}
                index={i}
              />
            ))}
          </Box>
        </Collapse>

        {/* Sin resultados */}
        <Collapse in={showDrop && resultados.length === 0 && !loading && query.trim().length > 1}>
          <Box sx={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
            zIndex: 10, borderRadius: '14px',
            border: `1.5px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
            bgcolor: isDark ? '#1e1e2e' : '#fff',
            p: 2.5, textAlign: 'center',
          }}>
            <Typography variant="body2" color="text.disabled" sx={{ fontSize: 13 }}>
              Sin {rolSel.labelPlural.toLowerCase()} con "{query}"
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
              Probá con nombre completo, username o email
            </Typography>
          </Box>
        </Collapse>
      </Box>

      {/* Hint */}
      {!query && (
        <Typography variant="caption" color="text.disabled"
          sx={{ display: 'block', mt: 1, fontSize: 11 }}>
          Escribí al menos 2 caracteres para buscar
        </Typography>
      )}
    </Box>
  );
};

export default SelectorUsuario;