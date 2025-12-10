'use client';
import React, { useState } from 'react';
import {
  Box, Typography, alpha, useTheme, Collapse, Skeleton,
  InputBase, IconButton, Tooltip, Badge
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
  materiasCount?: Record<number, number>; // gradoId -> cantidad materias
}

const GradoSelector: React.FC<GradoSelectorProps> = ({
  niveles, grados, gradoSeleccionado, onSelectGrado, loading, materiasCount = {}
}) => {
  const theme = useTheme();
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
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.info.main
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        {[1, 2, 3].map(i => (
          <Box key={i} sx={{ mb: 2 }}>
            <Skeleton variant="rounded" height={50} sx={{ mb: 1 }} />
            <Skeleton variant="rounded" height={40} sx={{ ml: 2 }} />
            <Skeleton variant="rounded" height={40} sx={{ ml: 2, mt: 1 }} />
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.paper',
      borderRadius: 3,
      overflow: 'hidden',
      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`
    }}>
      {/* Header */}
      <Box sx={{
        p: 2.5,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <SchoolIcon sx={{ color: 'white', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="700">Grados</Typography>
            <Typography variant="caption" color="text.secondary">
              {grados.length} grados disponibles
            </Typography>
          </Box>
        </Box>

        {/* Buscador */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          bgcolor: alpha(theme.palette.common.black, 0.04),
          borderRadius: 2,
          px: 1.5,
          py: 0.5,
          transition: 'all 0.2s',
          '&:focus-within': {
            bgcolor: 'background.paper',
            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
          }
        }}>
          <SearchIcon sx={{ color: 'text.secondary', fontSize: 20, mr: 1 }} />
          <InputBase
            placeholder="Buscar grado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, fontSize: '0.875rem' }}
          />
        </Box>
      </Box>

      {/* Lista de niveles y grados */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
        {gradosPorNivel.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">No se encontraron grados</Typography>
          </Box>
        ) : (
          gradosPorNivel.map((nivel, nivelIndex) => {
            const nivelColor = getNivelColor(nivelIndex);
            const isExpanded = expandedNiveles.includes(nivel.id);

            return (
              <Box key={nivel.id} sx={{ mb: 1.5 }}>
                {/* Nivel Header */}
                <Box
                  onClick={() => toggleNivel(nivel.id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    bgcolor: alpha(nivelColor, 0.08),
                    '&:hover': {
                      bgcolor: alpha(nivelColor, 0.12)
                    }
                  }}
                >
                  <Box sx={{
                    width: 8,
                    height: 32,
                    borderRadius: 1,
                    bgcolor: nivelColor
                  }} />
                  
                  <Typography variant="subtitle2" fontWeight="700" sx={{ flex: 1 }}>
                    {nivel.nombre}
                  </Typography>
                  
                  <Badge
                    badgeContent={nivel.grados.length}
                    sx={{
                      '& .MuiBadge-badge': {
                        bgcolor: alpha(nivelColor, 0.2),
                        color: nivelColor,
                        fontWeight: 700
                      }
                    }}
                  />
                  
                  <ExpandIcon
                    sx={{
                      fontSize: 20,
                      color: 'text.secondary',
                      transform: isExpanded ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s'
                    }}
                  />
                </Box>

                {/* Grados del nivel */}
                <Collapse in={isExpanded}>
                  <Box sx={{ pt: 1, pl: 1 }}>
                    {nivel.grados.map(grado => {
                      const isSelected = gradoSeleccionado?.id === grado.id;
                      const cantMaterias = materiasCount[grado.id] || 0;

                      return (
                        <Box
                          key={grado.id}
                          onClick={() => onSelectGrado(grado)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            p: 1.5,
                            mb: 0.5,
                            borderRadius: 2,
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            bgcolor: isSelected ? alpha(nivelColor, 0.12) : 'transparent',
                            border: isSelected 
                              ? `2px solid ${alpha(nivelColor, 0.5)}` 
                              : '2px solid transparent',
                            transform: isSelected ? 'scale(1.02)' : 'none',
                            '&:hover': {
                              bgcolor: alpha(nivelColor, 0.08),
                              transform: 'translateX(4px)'
                            },
                            '&::before': isSelected ? {
                              content: '""',
                              position: 'absolute',
                              left: 0,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: 4,
                              height: '70%',
                              borderRadius: 2,
                              bgcolor: nivelColor
                            } : {}
                          }}
                        >
                          {/* Icono o indicador de selección */}
                          <Box sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            bgcolor: isSelected ? nivelColor : alpha(nivelColor, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                          }}>
                            {isSelected ? (
                              <CheckIcon sx={{ color: 'white', fontSize: 18 }} />
                            ) : (
                              <BookIcon sx={{ color: nivelColor, fontSize: 18 }} />
                            )}
                          </Box>

                          {/* Info del grado */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              fontWeight={isSelected ? 700 : 500}
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {grado.nombre}
                            </Typography>
                            {grado.codigo && (
                              <Typography variant="caption" color="text.secondary">
                                {grado.codigo}
                              </Typography>
                            )}
                          </Box>

                          {/* Contador de materias */}
                          {cantMaterias > 0 && (
                            <Tooltip title={`${cantMaterias} materias asignadas`}>
                              <Box sx={{
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                color: theme.palette.success.main,
                                fontSize: '0.7rem',
                                fontWeight: 700
                              }}>
                                {cantMaterias}
                              </Box>
                            </Tooltip>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Collapse>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
};

export default GradoSelector;