'use client';
import React, { useState } from 'react';
import {
  Box, Typography, alpha, useTheme, Collapse, Skeleton,
  InputBase, IconButton, Tooltip, Badge, Paper, Zoom
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandIcon,
  School as SchoolIcon,
  CheckCircle as CheckIcon,
  MenuBook as BookIcon
} from '@mui/icons-material';
import { NivelAcademico, Grado } from '../../services/niveles';

interface GradoSelectorProps {
  niveles: NivelAcademico[];
  grados: Grado[];
  gradoSeleccionado: Grado | null;
  onSelectGrado: (grado: Grado) => void;
  loading: boolean;
  materiasCount?: Record<number, number>;
}

const GradoSelector: React.FC<GradoSelectorProps> = ({
  niveles, grados, gradoSeleccionado, onSelectGrado, loading, materiasCount = {}
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [expandedNiveles, setExpandedNiveles] = useState<number[]>(niveles.map(n => n.id));
  const [search, setSearch] = useState('');

  const toggleNivel = (nivelId: number) => {
    setExpandedNiveles(prev =>
      prev.includes(nivelId) ? prev.filter(id => id !== nivelId) : [...prev, nivelId]
    );
  };

  // Agrupar grados por nivel
  const gradosPorNivel = niveles.map(nivel => ({
    ...nivel,
    grados: grados.filter(g => 
      g.nivel_academico_id === nivel.id &&
      (search === '' || g.nombre.toLowerCase().includes(search.toLowerCase()))
    )
  })).filter(n => n.grados.length > 0 || search === '');

  // Colores para niveles
  const getNivelColor = (index: number) => {
    const colors = [
      isDark ? '#facc15' : '#0288d1',
      '#10b981',
      '#f59e0b',
      '#8b5cf6',
      '#ec4899'
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        {[1, 2, 3].map(i => (
          <Box key={i} sx={{ mb: 2 }}>
            <Skeleton variant="rounded" height={56} sx={{ mb: 1, borderRadius: '12px' }} />
            <Skeleton variant="rounded" height={48} sx={{ ml: 2, borderRadius: '10px' }} />
            <Skeleton variant="rounded" height={48} sx={{ ml: 2, mt: 1, borderRadius: '10px' }} />
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '24px',
        overflow: 'hidden',
        background: isDark
          ? alpha('#1e293b', 0.8)
          : alpha('#ffffff', 0.9),
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`,
      }}
    >
      {/* Header */}
      <Box sx={{
        p: 3,
        background: isDark
          ? `linear-gradient(135deg, ${alpha('#facc15', 0.15)} 0%, ${alpha('#f59e0b', 0.05)} 100%)`
          : `linear-gradient(135deg, ${alpha('#0288d1', 0.15)} 0%, ${alpha('#01579b', 0.05)} 100%)`,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            background: isDark
              ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
              : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 12px ${alpha(isDark ? '#facc15' : '#0288d1', 0.3)}`,
          }}>
            <SchoolIcon sx={{ color: isDark ? '#000' : 'white', fontSize: 24 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Grados
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              {grados.length} grados disponibles
            </Typography>
          </Box>
        </Box>

        {/* Buscador */}
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: isDark 
              ? alpha('#000', 0.2)
              : alpha('#000', 0.03),
            borderRadius: '12px',
            px: 2,
            py: 1,
            transition: 'all 0.3s ease',
            border: `2px solid transparent`,
            '&:focus-within': {
              bgcolor: theme.palette.background.paper,
              borderColor: alpha(isDark ? '#facc15' : '#0288d1', 0.5),
              boxShadow: `0 0 0 3px ${alpha(isDark ? '#facc15' : '#0288d1', 0.1)}`,
            }
          }}
        >
          <SearchIcon sx={{ color: 'text.secondary', fontSize: 20, mr: 1 }} />
          <InputBase
            placeholder="Buscar grado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}
          />
        </Paper>
      </Box>

      {/* Lista de niveles y grados */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {gradosPorNivel.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <SchoolIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.3 }} />
            <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
              No se encontraron grados
            </Typography>
          </Box>
        ) : (
          gradosPorNivel.map((nivel, nivelIndex) => {
            const nivelColor = getNivelColor(nivelIndex);
            const isExpanded = expandedNiveles.includes(nivel.id);

            return (
              <Box key={nivel.id} sx={{ mb: 2 }}>
                {/* Nivel Header */}
                <Box
                  onClick={() => toggleNivel(nivel.id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: isDark
                      ? alpha(nivelColor, 0.12)
                      : alpha(nivelColor, 0.08),
                    border: `2px solid ${alpha(nivelColor, 0.2)}`,
                    '&:hover': {
                      background: alpha(nivelColor, 0.15),
                      borderColor: alpha(nivelColor, 0.4),
                      transform: 'translateX(4px)',
                    }
                  }}
                >
                  <Box sx={{
                    width: 6,
                    height: 40,
                    borderRadius: '3px',
                    bgcolor: nivelColor,
                    boxShadow: `0 0 12px ${alpha(nivelColor, 0.4)}`,
                  }} />
                  
                  <Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 700 }}>
                    {nivel.nombre}
                  </Typography>
                  
                  <Badge
                    badgeContent={nivel.grados.length}
                    sx={{
                      '& .MuiBadge-badge': {
                        bgcolor: nivelColor,
                        color: isDark ? '#000' : '#fff',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        minWidth: 22,
                        height: 22,
                        borderRadius: '11px',
                      }
                    }}
                  />
                  
                  <ExpandIcon
                    sx={{
                      fontSize: 24,
                      color: nivelColor,
                      transform: isExpanded ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.3s ease'
                    }}
                  />
                </Box>

                {/* Grados del nivel */}
                <Collapse in={isExpanded}>
                  <Box sx={{ pt: 1.5, pl: 1 }}>
                    {nivel.grados.map((grado, index) => {
                      const isSelected = gradoSeleccionado?.id === grado.id;
                      const cantMaterias = materiasCount[grado.id] || 0;

                      return (
                        <Zoom 
                          key={grado.id}
                          in={isExpanded}
                          style={{ transitionDelay: `${index * 50}ms` }}
                        >
                          <Box
                            onClick={() => onSelectGrado(grado)}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              p: 2,
                              mb: 1,
                              borderRadius: '12px',
                              cursor: 'pointer',
                              position: 'relative',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              background: isSelected 
                                ? alpha(nivelColor, 0.15)
                                : 'transparent',
                              border: isSelected 
                                ? `2px solid ${nivelColor}` 
                                : `2px solid transparent`,
                              transform: isSelected ? 'scale(1.02)' : 'none',
                              '&:hover': {
                                background: alpha(nivelColor, 0.1),
                                transform: 'translateX(8px) scale(1.01)',
                                borderColor: alpha(nivelColor, 0.3),
                              },
                              '&::before': isSelected ? {
                                content: '""',
                                position: 'absolute',
                                left: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: 4,
                                height: '60%',
                                borderRadius: '2px',
                                bgcolor: nivelColor,
                                boxShadow: `0 0 12px ${alpha(nivelColor, 0.6)}`,
                              } : {}
                            }}
                          >
                            {/* Icono o indicador de selección */}
                            <Box sx={{
                              width: 44,
                              height: 44,
                              borderRadius: '10px',
                              bgcolor: isSelected ? nivelColor : alpha(nivelColor, 0.15),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.3s ease',
                              boxShadow: isSelected 
                                ? `0 4px 12px ${alpha(nivelColor, 0.4)}`
                                : 'none',
                            }}>
                              {isSelected ? (
                                <CheckIcon sx={{ color: isDark ? '#000' : 'white', fontSize: 20 }} />
                              ) : (
                                <BookIcon sx={{ color: nivelColor, fontSize: 20 }} />
                              )}
                            </Box>

                            {/* Info del grado */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: isSelected ? 700 : 600,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  mb: 0.25,
                                }}
                              >
                                {grado.nombre}
                              </Typography>
                              {grado.codigo && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                  {grado.codigo}
                                </Typography>
                              )}
                            </Box>

                            {/* Contador de materias */}
                            {cantMaterias > 0 && (
                              <Tooltip title={`${cantMaterias} materias asignadas`}>
                                <Box sx={{
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: '8px',
                                  bgcolor: alpha('#10b981', 0.15),
                                  color: '#10b981',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  border: `1px solid ${alpha('#10b981', 0.3)}`,
                                }}>
                                  {cantMaterias}
                                </Box>
                              </Tooltip>
                            )}
                          </Box>
                        </Zoom>
                      );
                    })}
                  </Box>
                </Collapse>
              </Box>
            );
          })
        )}
      </Box>
    </Paper>
  );
};

export default GradoSelector;