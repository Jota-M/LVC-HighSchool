// components/horario/QuickPalette.tsx
'use client';
import React, { useMemo } from 'react';
import {
  Box, Typography, ButtonBase, Chip, Tooltip,
  Switch, FormControlLabel, alpha, useTheme,
  Paper, Divider,
} from '@mui/material';
import {
  AutoFixHigh as PaintIcon,
  CleaningServices as EraserIcon,
  Close as ClearIcon,
  Palette as PaletteIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { GradoMateria, AsignacionDocente, HorarioDetalle, COLORES_MATERIA } from '@/types/horariotypes';

interface Props {
  gradoMaterias: GradoMateria[];
  asignaciones: AsignacionDocente[];
  celdas: HorarioDetalle[];
  selectedMateria: GradoMateria | 'eraser' | null;
  onSelectMateria: (materia: GradoMateria | 'eraser' | null) => void;
  selectedColor: string | null;
  onSelectColor: (color: string) => void;
  isPaintMode: boolean;
  onTogglePaintMode: (active: boolean) => void;
  readonly?: boolean;
}

export const QuickPalette: React.FC<Props> = ({
  gradoMaterias,
  asignaciones,
  celdas,
  selectedMateria,
  onSelectMateria,
  selectedColor,
  onSelectColor,
  isPaintMode,
  onTogglePaintMode,
  readonly = false,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accentColor = isDark ? '#facc15' : '#0288d1';

  // Map of titular teacher per grado_materia_id
  const docentePorMateria = useMemo(() => {
    const map: Record<number, AsignacionDocente> = {};
    asignaciones.forEach((asig) => {
      if (asig.es_titular && asig.grado_materia_id) {
        map[asig.grado_materia_id] = asig;
      } else if (!map[asig.grado_materia_id] && asig.grado_materia_id) {
        map[asig.grado_materia_id] = asig;
      }
    });
    return map;
  }, [asignaciones]);

  // Conteo de celdas por grado_materia_id
  const horasPorMateria = useMemo(() => {
    const map: Record<number, number> = {};
    celdas.forEach((c) => {
      if (c.grado_materia_id) {
        map[c.grado_materia_id] = (map[c.grado_materia_id] || 0) + 1;
      }
    });
    return map;
  }, [celdas]);

  const activeGm = selectedMateria && selectedMateria !== 'eraser' ? (selectedMateria as GradoMateria) : null;
  const currentColor = selectedColor || activeGm?.materia_color || accentColor;

  if (readonly) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 2.5,
        p: { xs: 1.5, md: 2 },
        borderRadius: '16px',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        background: isDark
          ? 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.04) 100%)'
          : 'linear-gradient(135deg, rgba(2,136,209,0.02) 0%, rgba(2,136,209,0.04) 100%)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* ── Header de la barra ── */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1.5,
        mb: 1.5,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box sx={{
            width: 32, height: 32, borderRadius: '8px',
            bgcolor: alpha(accentColor, 0.15),
            color: accentColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <PaintIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              Paleta de Asignación Rápida
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isPaintMode && selectedMateria
                ? selectedMateria === 'eraser'
                  ? '🧹 Modo borrador activo: Haz clic en cualquier celda para limpiarla'
                  : `🎨 Pintando "${activeGm?.materia_nombre}" con color elegido. Toca cualquier celda para pintar.`
                : 'Selecciona una materia y escoge su color para pintar con 1 solo clic'}
            </Typography>
          </Box>
        </Box>

        {/* Switch Modo Pincel */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={isPaintMode}
                onChange={(e) => {
                  onTogglePaintMode(e.target.checked);
                  if (!e.target.checked) onSelectMateria(null);
                }}
                color="primary"
                size="small"
              />
            }
            label={
              <Typography variant="caption" fontWeight={700} sx={{ color: isPaintMode ? accentColor : 'text.secondary' }}>
                {isPaintMode ? 'Modo Pincel (1-Clic)' : 'Modo Detallado (Modal)'}
              </Typography>
            }
            sx={{ m: 0 }}
          />

          {selectedMateria && (
            <Tooltip title="Desactivar pincel activo">
              <ButtonBase
                onClick={() => onSelectMateria(null)}
                sx={{
                  px: 1, py: 0.5, borderRadius: '8px',
                  bgcolor: alpha('#ef4444', 0.1), color: '#ef4444',
                  fontSize: '0.72rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5,
                }}
              >
                <ClearIcon sx={{ fontSize: 14 }} /> Soltar
              </ButtonBase>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* ── Selector de Color Activo (aparece al elegir una materia) ── */}
      {activeGm && isPaintMode && (
        <Box sx={{
          mb: 1.5,
          p: 1.2,
          borderRadius: '12px',
          bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
          border: `1px solid ${alpha(currentColor, 0.3)}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1.2,
          flexWrap: 'wrap',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <PaletteIcon sx={{ fontSize: 16, color: currentColor }} />
            <Typography variant="caption" fontWeight={700} sx={{ color: 'text.primary' }}>
              Color para {activeGm.materia_nombre}:
            </Typography>
          </Box>

          {/* Muestras de colores rápidos */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
            {COLORES_MATERIA.map((col) => {
              const isColSelected = currentColor.toLowerCase() === col.toLowerCase();
              return (
                <Tooltip key={col} title={col}>
                  <Box
                    onClick={() => onSelectColor(col)}
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      bgcolor: col,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: isColSelected
                        ? `2.5px solid ${isDark ? '#fff' : '#000'}`
                        : '2px solid transparent',
                      boxShadow: isColSelected ? `0 0 8px ${col}` : 'none',
                      transform: isColSelected ? 'scale(1.2)' : 'none',
                      transition: 'all 0.12s ease',
                      '&:hover': { transform: 'scale(1.2)' },
                    }}
                  >
                    {isColSelected && <CheckIcon sx={{ fontSize: 12, color: '#fff' }} />}
                  </Box>
                </Tooltip>
              );
            })}

            {/* Selector de color personalizado libre */}
            <Tooltip title="Elegir color personalizado">
              <Box
                component="label"
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}`,
                  transition: 'transform 0.12s ease',
                  '&:hover': { transform: 'scale(1.2)' },
                }}
              >
                <input
                  type="color"
                  value={currentColor.startsWith('#') && currentColor.length === 7 ? currentColor : '#3b82f6'}
                  onChange={(e) => onSelectColor(e.target.value)}
                  style={{ opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                />
              </Box>
            </Tooltip>
          </Box>
        </Box>
      )}

      {/* ── Lista de materias y herramientas ── */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        overflowX: 'auto',
        pb: 0.5,
        '&::-webkit-scrollbar': { height: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: alpha(accentColor, 0.2), borderRadius: 2 },
      }}>
        {/* 🧹 Botón Borrador */}
        <ButtonBase
          onClick={() => {
            if (!isPaintMode) onTogglePaintMode(true);
            onSelectMateria(selectedMateria === 'eraser' ? null : 'eraser');
          }}
          sx={{
            flexShrink: 0,
            px: 1.5,
            py: 0.8,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: 0.8,
            border: `1.5px solid ${selectedMateria === 'eraser' ? '#ef4444' : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            bgcolor: selectedMateria === 'eraser'
              ? alpha('#ef4444', 0.18)
              : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            color: selectedMateria === 'eraser' ? '#ef4444' : 'text.primary',
            boxShadow: selectedMateria === 'eraser' ? `0 0 12px ${alpha('#ef4444', 0.3)}` : 'none',
            transition: 'all 0.15s ease',
            '&:hover': {
              bgcolor: alpha('#ef4444', 0.12),
              borderColor: '#ef4444',
            },
          }}
        >
          <EraserIcon sx={{ fontSize: 16 }} />
          <Typography variant="caption" fontWeight={700}>
            Borrador
          </Typography>
        </ButtonBase>

        {/* Chips de cada Materia */}
        {gradoMaterias.map((gm) => {
          const isSelected = selectedMateria !== 'eraser' && (selectedMateria as GradoMateria)?.id === gm.id;
          const color = isSelected ? currentColor : (gm.materia_color || accentColor);
          const horas = horasPorMateria[gm.id] || 0;
          const horasSemanalesReq = gm.horas_semanales;
          const docente = docentePorMateria[gm.id];

          return (
            <ButtonBase
              key={gm.id}
              onClick={() => {
                if (!isPaintMode) onTogglePaintMode(true);
                if (isSelected) {
                  onSelectMateria(null);
                } else {
                  onSelectMateria(gm);
                  onSelectColor(gm.materia_color || accentColor);
                }
              }}
              sx={{
                flexShrink: 0,
                px: 1.5,
                py: 0.8,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                border: `1.5px solid ${isSelected ? color : alpha(color, 0.35)}`,
                bgcolor: isSelected
                  ? alpha(color, 0.22)
                  : isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.7)',
                boxShadow: isSelected ? `0 0 14px ${alpha(color, 0.4)}` : 'none',
                transform: isSelected ? 'scale(1.03)' : 'none',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: alpha(color, 0.15),
                  borderColor: color,
                },
              }}
            >
              {/* Dot de color */}
              <Box sx={{
                width: 10, height: 10, borderRadius: '50%',
                bgcolor: color,
                flexShrink: 0,
                boxShadow: `0 0 6px ${color}`,
              }} />

              {/* Nombre y Docente */}
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="caption" fontWeight={700} sx={{ color: 'text.primary', display: 'block', lineHeight: 1.2 }}>
                  {gm.materia_nombre}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.62rem', color: 'text.secondary', display: 'block' }}>
                  {docente ? `${docente.docente_nombres} ${docente.docente_apellidos}` : 'Sin titular'}
                </Typography>
              </Box>

              {/* Conteo de Horas */}
              <Chip
                label={horasSemanalesReq ? `${horas}/${horasSemanalesReq}h` : `${horas}h`}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  bgcolor: horas > 0 ? alpha(color, 0.2) : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                  color: horas > 0 ? color : 'text.disabled',
                  border: `1px solid ${alpha(color, 0.3)}`,
                }}
              />
            </ButtonBase>
          );
        })}
      </Box>
    </Paper>
  );
};
