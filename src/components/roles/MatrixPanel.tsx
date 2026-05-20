'use client';
// components/roles/MatrixPanel.tsx
import React, { useState } from 'react';
import {
  Box, Typography, Chip, IconButton, Button, Checkbox,
  LinearProgress, Tooltip, Divider, alpha, useTheme,
  Collapse, CircularProgress,
} from '@mui/material';
import CloseRoundedIcon           from '@mui/icons-material/CloseRounded';
import SaveRoundedIcon            from '@mui/icons-material/SaveRounded';
import LockRoundedIcon            from '@mui/icons-material/LockRounded';
import TuneRoundedIcon            from '@mui/icons-material/TuneRounded';
import CheckBoxRoundedIcon        from '@mui/icons-material/CheckBoxRounded';
import IndeterminateCheckBoxIcon  from '@mui/icons-material/IndeterminateCheckBox';
import CheckBoxOutlineBlankIcon   from '@mui/icons-material/CheckBoxOutlineBlank';
import ExpandMoreRoundedIcon      from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon      from '@mui/icons-material/ExpandLessRounded';
import SearchRoundedIcon          from '@mui/icons-material/SearchRounded';
import { TextField, InputAdornment } from '@mui/material';

import { useRolPermisos }    from '@/hooks/usePermisos';
import { Rol, getModuloConfig, getAccionConfig } from '@/types/permisosTypes';
import { RolAvatar } from './RolCard';

interface MatrixPanelProps {
  rol:     Rol;
  hook:    ReturnType<typeof useRolPermisos>;
  onClose: () => void;
}

export function MatrixPanel({ rol, hook, onClose }: MatrixPanelProps) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent    = isDark ? '#818cf8' : '#4f46e5';
  const accentEnd = isDark ? '#c084fc' : '#7c3aed';

  const {
    permisosRol, todosAgrupados, isLoading, isSubmitting,
    hayambios, togglePermiso, toggleModulo,
    moduloCompleto, moduloParcial, guardar,
  } = hook;

  const [search,          setSearch]          = useState('');
  const [modulosColapsados, setModulosColapsados] = useState<Set<string>>(new Set());

  const totalSeleccionados = permisosRol.length;
  const totalDisponibles   = Object.values(todosAgrupados).flat().length;
  const progreso           = totalDisponibles > 0 ? (totalSeleccionados / totalDisponibles) * 100 : 0;

  function toggleColapso(modulo: string) {
    setModulosColapsados(prev => {
      const n = new Set(prev);
      n.has(modulo) ? n.delete(modulo) : n.add(modulo);
      return n;
    });
  }

  // Filtrar por búsqueda
  const modulosFiltrados = Object.entries(todosAgrupados)
    .map(([modulo, perms]) => ({
      modulo,
      perms: search.trim()
        ? perms.filter(p =>
            p.nombre.toLowerCase().includes(search.toLowerCase()) ||
            p.accion.toLowerCase().includes(search.toLowerCase()) ||
            (p.descripcion ?? '').toLowerCase().includes(search.toLowerCase())
          )
        : perms,
    }))
    .filter(({ perms }) => perms.length > 0);

  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '20px',
      border: `1.5px solid ${alpha(accent, 0.25)}`,
      bgcolor: isDark ? alpha('#0d0d1a', 0.97) : '#fafafa',
      overflow: 'hidden',
      boxShadow: isDark
        ? `0 0 60px ${alpha(accent, 0.12)}, 0 0 0 1px ${alpha(accent, 0.1)}`
        : `0 12px 48px ${alpha(accent, 0.1)}, 0 0 0 1px ${alpha(accent, 0.08)}`,
    }}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <Box sx={{
        background: `linear-gradient(135deg, ${accent} 0%, ${accentEnd} 100%)`,
        px: 2.5, pt: 2.5, pb: 2,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
          <TuneRoundedIcon sx={{ color: alpha('#fff', 0.9), fontSize: 20, mt: 0.2 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontWeight={800} sx={{ color: '#fff', fontSize: 15, lineHeight: 1.2 }}>
              Permisos del rol
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <RolAvatar rol={rol} size={20} />
              <Typography variant="caption" sx={{ color: alpha('#fff', 0.85), fontWeight: 600 }}>
                {rol.nombre}
              </Typography>
              {rol.es_sistema && (
                <Tooltip title="Rol de sistema">
                  <LockRoundedIcon sx={{ fontSize: 12, color: alpha('#fff', 0.6) }} />
                </Tooltip>
              )}
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: alpha('#fff', 0.8), borderRadius: '10px',
              '&:hover': { bgcolor: alpha('#fff', 0.15), color: '#fff' },
            }}
          >
            <CloseRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Stats */}
        <Box sx={{
          display: 'flex', gap: 1.5,
          p: 1.5,
          borderRadius: '12px',
          bgcolor: alpha('#000', 0.2),
        }}>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 20, lineHeight: 1 }}>
              {totalSeleccionados}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.65), fontSize: 10 }}>
              seleccionados
            </Typography>
          </Box>
          <Box sx={{ width: '1px', bgcolor: alpha('#fff', 0.2) }} />
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 20, lineHeight: 1 }}>
              {totalDisponibles - totalSeleccionados}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.65), fontSize: 10 }}>
              sin asignar
            </Typography>
          </Box>
          <Box sx={{ width: '1px', bgcolor: alpha('#fff', 0.2) }} />
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 20, lineHeight: 1 }}>
              {Math.round(progreso)}%
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.65), fontSize: 10 }}>
              cobertura
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Barra de progreso */}
      <LinearProgress
        variant="determinate"
        value={progreso}
        sx={{
          height: 3, borderRadius: 0,
          bgcolor: isDark ? alpha(accent, 0.15) : alpha(accent, 0.1),
          '& .MuiLinearProgress-bar': {
            background: `linear-gradient(90deg, ${accent} 0%, ${accentEnd} 100%)`,
          },
        }}
      />

      {isLoading && (
        <LinearProgress sx={{ height: 2, bgcolor: 'transparent' }} />
      )}

      {/* ── Search ──────────────────────────────────────────────────── */}
      <Box sx={{ px: 2, py: 1.5 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Buscar permiso…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              fontSize: 13,
              height: 36,
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: accent,
              },
            },
          }}
        />
      </Box>

      <Divider sx={{ borderColor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06) }} />

      {/* ── Matrix scrolleable ──────────────────────────────────────── */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 1.5,
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: isDark ? alpha('#fff', 0.12) : alpha('#000', 0.1),
          borderRadius: 4,
        },
      }}>
        {modulosFiltrados.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6, color: 'text.disabled' }}>
            <SearchRoundedIcon sx={{ fontSize: 36, mb: 1, opacity: 0.4 }} />
            <Typography variant="body2" sx={{ fontSize: 13 }}>
              Sin resultados para "{search}"
            </Typography>
          </Box>
        )}

        {modulosFiltrados.map(({ modulo, perms }) => {
          const cfg       = getModuloConfig(modulo);
          const completo  = moduloCompleto(modulo);
          const parcial   = moduloParcial(modulo);
          const colapsado = modulosColapsados.has(modulo);
          const selCount  = perms.filter(p => permisosRol.includes(p.id)).length;

          return (
            <Box key={modulo} sx={{ mb: 1 }}>
              {/* Cabecera del módulo */}
              <Box
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  px: 1.5, py: 1,
                  borderRadius: '12px',
                  bgcolor: completo
                    ? alpha(cfg.color, isDark ? 0.2 : 0.08)
                    : isDark ? alpha('#fff', 0.04) : alpha('#000', 0.025),
                  border: `1px solid ${completo ? alpha(cfg.color, 0.25) : 'transparent'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  '&:hover': { bgcolor: alpha(cfg.color, isDark ? 0.15 : 0.05) },
                }}
              >
                {/* Checkbox módulo */}
                <Box
                  onClick={() => toggleModulo(modulo, !completo)}
                  sx={{ display: 'flex', color: completo ? cfg.color : parcial ? cfg.color : 'text.disabled' }}
                >
                  {completo
                    ? <CheckBoxRoundedIcon sx={{ fontSize: 18 }} />
                    : parcial
                    ? <IndeterminateCheckBoxIcon sx={{ fontSize: 18 }} />
                    : <CheckBoxOutlineBlankIcon sx={{ fontSize: 18 }} />
                  }
                </Box>

                {/* Icono + nombre */}
                <Box
                  onClick={() => toggleColapso(modulo)}
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flex: 1, minWidth: 0 }}
                >
                  <Typography sx={{ fontSize: 15, lineHeight: 1 }}>{cfg.icon}</Typography>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    noWrap
                    sx={{ fontSize: 12, color: cfg.color, flex: 1 }}
                  >
                    {cfg.label}
                  </Typography>
                </Box>

                {/* Contador + colapso */}
                <Chip
                  label={`${selCount}/${perms.length}`}
                  size="small"
                  sx={{
                    height: 20, fontSize: 10, fontWeight: 700,
                    bgcolor: alpha(cfg.color, 0.12), color: cfg.color,
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => toggleColapso(modulo)}
                  sx={{ p: 0.3, color: 'text.disabled' }}
                >
                  {colapsado
                    ? <ExpandMoreRoundedIcon sx={{ fontSize: 16 }} />
                    : <ExpandLessRoundedIcon sx={{ fontSize: 16 }} />
                  }
                </IconButton>
              </Box>

              {/* Permisos del módulo */}
              <Collapse in={!colapsado}>
                <Box sx={{ pl: 2.5, mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                  {perms.map(permiso => {
                    const checked     = permisosRol.includes(permiso.id);
                    const accionCfg   = getAccionConfig(permiso.accion);

                    return (
                      <Box
                        key={permiso.id}
                        onClick={() => togglePermiso(permiso.id)}
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 1,
                          px: 1.2, py: 0.7,
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.12s',
                          bgcolor: checked
                            ? alpha(accionCfg.color, isDark ? 0.1 : 0.05)
                            : 'transparent',
                          '&:hover': {
                            bgcolor: alpha(accionCfg.color, isDark ? 0.08 : 0.04),
                          },
                        }}
                      >
                        <Checkbox
                          checked={checked}
                          size="small"
                          disableRipple
                          sx={{
                            p: 0, flexShrink: 0,
                            color: isDark ? alpha('#fff', 0.2) : alpha('#000', 0.2),
                            '&.Mui-checked': { color: accionCfg.color },
                            '& .MuiSvgIcon-root': { fontSize: 16 },
                          }}
                        />
                        <Chip
                          label={accionCfg.label}
                          size="small"
                          sx={{
                            height: 18, fontSize: 9, fontWeight: 700,
                            flexShrink: 0, minWidth: 60, justifyContent: 'center',
                            bgcolor: checked
                              ? alpha(accionCfg.color, 0.15)
                              : isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05),
                            color: checked ? accionCfg.color : 'text.disabled',
                          }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="caption"
                            fontWeight={checked ? 700 : 400}
                            noWrap
                            sx={{ fontSize: 11, display: 'block', color: checked ? 'text.primary' : 'text.secondary' }}
                          >
                            {permiso.nombre}
                          </Typography>
                          {permiso.descripcion && (
                            <Typography
                              variant="caption"
                              color="text.disabled"
                              noWrap
                              sx={{ fontSize: 10, display: 'block', lineHeight: 1.2 }}
                            >
                              {permiso.descripcion}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </Box>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <Box sx={{
        px: 2.5, py: 2,
        borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
        display: 'flex', alignItems: 'center', gap: 1.5,
        bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.015),
      }}>
        {rol.es_sistema && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <LockRoundedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
              Rol de sistema
            </Typography>
          </Box>
        )}

        {hayambios && (
          <Chip
            label="Cambios sin guardar"
            size="small"
            sx={{
              height: 22, fontSize: 10, fontWeight: 700,
              bgcolor: alpha('#f59e0b', isDark ? 0.2 : 0.1),
              color: '#f59e0b',
            }}
          />
        )}

        <Box sx={{ flex: 1 }} />

        <Button
          variant="outlined"
          size="small"
          onClick={onClose}
          sx={{
            borderRadius: '10px', fontWeight: 600, fontSize: 12,
            borderColor: isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15),
            color: 'text.secondary',
            '&:hover': { borderColor: isDark ? alpha('#fff', 0.3) : alpha('#000', 0.3), bgcolor: 'transparent' },
          }}
        >
          Cerrar
        </Button>

        <Button
          variant="contained"
          size="small"
          onClick={guardar}
          disabled={isSubmitting || !hayambios}
          startIcon={isSubmitting
            ? <CircularProgress size={12} sx={{ color: 'inherit' }} />
            : <SaveRoundedIcon sx={{ fontSize: 14 }} />
          }
          sx={{
            borderRadius: '10px', fontWeight: 700, fontSize: 12,
            background: `linear-gradient(135deg, ${accent} 0%, ${accentEnd} 100%)`,
            boxShadow: 'none',
            '&:hover': { boxShadow: `0 4px 14px ${alpha(accent, 0.4)}` },
            '&.Mui-disabled': { opacity: 0.45 },
          }}
        >
          {isSubmitting ? 'Guardando…' : 'Guardar permisos'}
        </Button>
      </Box>
    </Box>
  );
}