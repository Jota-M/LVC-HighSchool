'use client';
// components/estudiante/materiales/TemarioEstudiante.tsx

import React, { useState } from 'react';
import {
  Box, Card, Typography, Chip, Collapse, IconButton,
  Skeleton, alpha, Fade, LinearProgress, Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Bookmark as BookmarkIcon,
  Link as LinkIcon,
  CheckCircle as DoneIcon,
  RadioButtonUnchecked as PendingIcon,
  Autorenew as InProgressIcon,
} from '@mui/icons-material';
import { useTemarioEstudiante } from '@/hooks/useEstudiante';
import type { MateriaResumen, TemarioItem } from '@/services/estudianteService';

interface TemarioEstudianteProps {
  materia:    MateriaResumen;
  accent:     string;
  accentDark: string;
  isDark:     boolean;
}

// Icono por estado de progreso
const iconoPorEstado: Record<string, React.ReactNode> = {
  completado:  <DoneIcon       sx={{ fontSize: 16, color: '#16a34a' }} />,
  en_progreso: <InProgressIcon sx={{ fontSize: 16, color: '#2563eb' }} />,
  revisando:   <InProgressIcon sx={{ fontSize: 16, color: '#d97706' }} />,
  no_iniciado: <PendingIcon    sx={{ fontSize: 16, color: '#9ca3af' }} />,
};

// Constantes de estados (deberías moverlas a un archivo de constantes)
const ESTADOS_PROGRESO = [
  { value: 'no_iniciado', label: 'No iniciado', icon: '⚪', color: '#9ca3af', bgColor: '#f3f4f6' },
  { value: 'en_progreso', label: 'En progreso', icon: '🔵', color: '#2563eb', bgColor: '#dbeafe' },
  { value: 'completado',  label: 'Completado',  icon: '✅', color: '#16a34a', bgColor: '#dcfce7' },
  { value: 'revisando',   label: 'Revisando',   icon: '🔄', color: '#d97706', bgColor: '#fed7aa' },
];

export const TemarioEstudiante: React.FC<TemarioEstudianteProps> = ({
  materia, accent, accentDark, isDark,
}) => {
  const { 
    porUnidad, 
    isLoading, 
    totalTemas, 
    completados, 
    porcentajeGeneral,
    temario 
  } = useTemarioEstudiante(materia.grado_materia_id);

  const [expandidas, setExpandidas] = useState<Record<number, boolean>>({});
  const toggle = (id: number) => setExpandidas(p => ({ ...p, [id]: !p[id] }));

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: '14px' }} />
        ))}
      </Box>
    );
  }

  if (porUnidad.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8, color: 'text.disabled' }}>
        <Typography variant="body2">El docente aún no ha creado el temario.</Typography>
      </Box>
    );
  }

  // Calcular estados de progreso por conteo
  const progresoContadores = ESTADOS_PROGRESO.map(e => ({
    ...e,
    count: temario.filter(t => t.estado_progreso === e.value).length,
  }));

  return (
    <Box>
      {/* ── Resumen de progreso ── */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '16px',
          border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
          bgcolor: alpha(accent, 0.04),
          mb: 3, p: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>Mi avance en el temario</Typography>
            <Typography variant="caption" color="text.secondary">
              {completados} de {totalTemas} temas completados
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: accent }}>
            {porcentajeGeneral}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={porcentajeGeneral}
          sx={{
            height: 8, borderRadius: 4,
            bgcolor: alpha(accent, 0.15),
            '& .MuiLinearProgress-bar': { bgcolor: accent, borderRadius: 4 },
          }}
        />

        {/* Mini leyenda */}
        <Box sx={{ display: 'flex', gap: 2, mt: 1.5, flexWrap: 'wrap' }}>
          {progresoContadores.map(e => {
            if (e.count === 0) return null;
            return (
              <Box key={e.value} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <span style={{ fontSize: '0.85rem' }}>{e.icon}</span>
                <Typography variant="caption" sx={{ color: e.color, fontWeight: 600 }}>
                  {e.count} {e.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Card>

      {/* ── Árbol de unidades ── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {porUnidad.map(({ unidad, temas }) => {
          const isOpen        = expandidas[unidad.unidad_id] ?? false;
          const temasCount    = temas.length;
          const completadosUnidad = temas.filter((t: TemarioItem) => 
            t.estado_progreso === 'completado'
          ).length;
          const pctUnidad = temasCount > 0
            ? Math.round((completadosUnidad / temasCount) * 100)
            : 0;

          return (
            <Fade key={unidad.unidad_id} in timeout={300}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: '16px',
                  border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                  overflow: 'hidden',
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: `0 4px 18px ${alpha(accent, 0.1)}` },
                }}
              >
                {/* Header */}
                <Box
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 2, p: 2,
                    cursor: 'pointer', userSelect: 'none',
                    borderBottom: isOpen
                      ? `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`
                      : 'none',
                  }}
                  onClick={() => toggle(unidad.unidad_id)}
                >
                  {/* Número */}
                  <Box
                    sx={{
                      width: 42, height: 42, borderRadius: '12px', flexShrink: 0,
                      background: `linear-gradient(135deg, ${accent}, ${accentDark})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isDark ? '#000' : '#fff',
                      fontWeight: 800, fontSize: '1rem',
                    }}
                  >
                    {unidad.numero_unidad}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" fontWeight={700} noWrap>
                      {unidad.unidad_titulo}
                    </Typography>
                    {/* Barra de progreso de la unidad */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.4 }}>
                      <LinearProgress
                        variant="determinate"
                        value={pctUnidad}
                        sx={{
                          flex: 1, height: 4, borderRadius: 2,
                          bgcolor: alpha(accent, 0.15),
                          '& .MuiLinearProgress-bar': { bgcolor: accent, borderRadius: 2 },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                        {completadosUnidad}/{temasCount}
                      </Typography>
                    </Box>
                  </Box>

                  <IconButton size="small">
                    {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>

                {/* Temas */}
                <Collapse in={isOpen}>
                  <Box sx={{ px: 2, pb: 2 }}>
                    {temas.map((tema: TemarioItem, idx: number) => {
                      const estadoKey  = tema.estado_progreso ?? 'no_iniciado';
                      const estadoInfo = ESTADOS_PROGRESO.find(e => e.value === estadoKey);

                      return (
                        <Box
                          key={tema.tema_id}
                          sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5,
                            py: 1.5, px: 1,
                            borderBottom: idx < temas.length - 1
                              ? `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04)}`
                              : 'none',
                            borderRadius: '10px',
                            transition: 'background 0.15s',
                            '&:hover': { bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02) },
                          }}
                        >
                          {/* Estado */}
                          <Tooltip title={estadoInfo?.label ?? 'No iniciado'}>
                            <Box sx={{ flexShrink: 0 }}>
                              {iconoPorEstado[estadoKey] ?? iconoPorEstado.no_iniciado}
                            </Box>
                          </Tooltip>

                          <BookmarkIcon sx={{ color: alpha(accent, 0.45), fontSize: 15, flexShrink: 0 }} />

                          {/* Texto */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {tema.numero_tema}. {tema.tema_titulo}
                            </Typography>
                            {tema.tema_descripcion && (
                              <Typography 
                                variant="caption" 
                                color="text.secondary" 
                                sx={{ 
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  wordBreak: 'break-word',
                                  mb: 0.6 
                                }}
                              >
                                {tema.tema_descripcion}
                              </Typography>
                            )}
                          </Box>

                          {/* Chips */}
                          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                            {tema.nivel_dificultad && (
                              <Chip
                                label={tema.nivel_dificultad}
                                size="small"
                                sx={{
                                  height: 18, fontSize: '0.6rem', fontWeight: 600,
                                  bgcolor: alpha(accent, 0.1), color: accent,
                                }}
                              />
                            )}
                            <Tooltip title="Materiales disponibles">
                              <Chip
                                icon={<LinkIcon sx={{ fontSize: '11px !important' }} />}
                                label={`${tema.materiales_disponibles}`}
                                size="small"
                                sx={{
                                  height: 18, fontSize: '0.6rem', fontWeight: 600,
                                  bgcolor: alpha(accent, 0.08), color: accent,
                                }}
                              />
                            </Tooltip>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Collapse>
              </Card>
            </Fade>
          );
        })}
      </Box>
    </Box>
  );
};

export default TemarioEstudiante;