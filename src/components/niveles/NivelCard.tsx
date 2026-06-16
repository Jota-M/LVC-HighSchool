import React, { useState } from 'react';
import {
  Card, Box, Typography, IconButton, Avatar, Chip, Badge,
  Collapse, Divider, Grid, Tooltip, Stack,
  alpha, useTheme, Paper, Button, CardContent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { NivelAcademico, Grado } from '../../services/niveles';

function usePalette() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primary       = isDark ? '#facc15' : '#0288d1';
  const secondary     = isDark ? '#f59e0b' : '#01579b';
  const gradient      = `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
  const textOnPrimary = isDark ? '#000' : '#fff';
  return { primary, secondary, gradient, textOnPrimary };
}

interface NivelCardProps {
  nivel: NivelAcademico;
  onEditNivel: (nivel: NivelAcademico) => void;
  onDeleteNivel: (id: number) => void;
  onAddGrado: (nivelId: number) => void;
  onEditGrado: (nivelId: number, grado: Grado) => void;
  onDeleteGrado: (gradoId: number) => void;
}

export const NivelCard: React.FC<NivelCardProps> = ({
  nivel, onEditNivel, onDeleteNivel, onAddGrado, onEditGrado, onDeleteGrado
}) => {
  const theme = useTheme();
  const { primary, gradient, textOnPrimary } = usePalette();
  const [isExpanded, setIsExpanded] = useState(false);

  const gradosCount = nivel.grados?.length || 0;
  const nivelColor  = nivel.color || primary;

  return (
    <Card sx={{
      borderRadius: 3, overflow: 'hidden',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: isExpanded
        ? `0 16px 48px ${alpha(nivelColor, 0.25)}`
        : `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
      border: isExpanded
        ? `2px solid ${nivelColor}`
        : `1px solid ${alpha(primary, 0.15)}`,
      '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 12px 32px ${alpha(nivelColor, 0.2)}` }
    }}>
      {/* Header */}
      <Box onClick={() => setIsExpanded(!isExpanded)} sx={{
        p: 3, cursor: 'pointer',
        background: isExpanded
          ? `linear-gradient(135deg, ${alpha(nivelColor, 0.12)}, ${alpha(nivelColor, 0.04)})`
          : 'transparent',
        transition: 'all 0.3s ease',
        '&:hover': { background: `linear-gradient(135deg, ${alpha(nivelColor, 0.08)}, ${alpha(nivelColor, 0.02)})` }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Avatar sx={{
              width: 64, height: 64, bgcolor: nivelColor, fontSize: '2rem',
              boxShadow: `0 8px 16px ${alpha(nivelColor, 0.4)}`,
              transition: 'all 0.3s ease',
              transform: isExpanded ? 'rotate(360deg) scale(1.1)' : 'none',
            }}>
              {nivel.icono || '📚'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="h5" fontWeight="700">{nivel.nombre}</Typography>
                <Badge badgeContent={gradosCount} color="primary"
                  sx={{ '& .MuiBadge-badge': { fontSize: '0.75rem', fontWeight: 'bold', minWidth: 24, height: 24 } }}>
                  <Chip label="Grados" size="small"
                    sx={{ bgcolor: alpha(nivelColor, 0.15), color: nivelColor, fontWeight: 700 }} />
                </Badge>
              </Box>
              {nivel.descripcion && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{nivel.descripcion}</Typography>
              )}
              {(nivel.edad_minima || nivel.edad_maxima) && (
                <Typography variant="caption" color="text.secondary">
                  📅 Edades: {nivel.edad_minima || '?'} - {nivel.edad_maxima || '?'} años
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Agregar grado">
              <IconButton onClick={(e) => { e.stopPropagation(); onAddGrado(nivel.id); }}
                sx={{
                  bgcolor: alpha(primary, 0.12), color: primary,
                  transition: 'all 0.3s ease',
                  '&:hover': { background: gradient, color: textOnPrimary, transform: 'rotate(90deg) scale(1.2)' },
                }}>
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar nivel">
              <IconButton onClick={(e) => { e.stopPropagation(); onEditNivel(nivel); }}
                sx={{
                  bgcolor: alpha(theme.palette.warning.main, 0.1), transition: 'all 0.3s ease',
                  '&:hover': { bgcolor: theme.palette.warning.main, color: 'white', transform: 'rotate(15deg) scale(1.2)' },
                }}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar nivel">
              <IconButton onClick={(e) => { e.stopPropagation(); onDeleteNivel(nivel.id); }}
                sx={{
                  bgcolor: alpha(theme.palette.error.main, 0.1), transition: 'all 0.3s ease',
                  '&:hover': { bgcolor: theme.palette.error.main, color: 'white', transform: 'scale(1.2)' },
                }}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            <IconButton sx={{ transition: 'all 0.3s ease', transform: isExpanded ? 'rotate(180deg)' : 'none', color: primary }}>
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Grados colapsables */}
      <Collapse in={isExpanded} timeout={500}>
        <Divider sx={{ borderColor: alpha(primary, 0.15) }} />
        <Box sx={{ p: 3, bgcolor: alpha(nivelColor, 0.02) }}>
          {!nivel.grados || nivel.grados.length === 0 ? (
            <Paper elevation={0} sx={{
              p: 4, textAlign: 'center',
              bgcolor: alpha(primary, 0.04),
              border: `2px dashed ${alpha(primary, 0.3)}`,
              borderRadius: 3,
            }}>
              <WarningAmberIcon sx={{ fontSize: 48, color: primary, mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>No hay grados registrados</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Comienza agregando grados a este nivel académico
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => onAddGrado(nivel.id)}
                sx={{ background: gradient, color: textOnPrimary, borderRadius: 2.5, fontWeight: 'bold',
                  '&:hover': { filter: 'brightness(1.1)' } }}>
                Agregar Primer Grado
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {nivel.grados.map((grado, gradoIndex) => (
                <Grid size={{xs:12, sm:6, lg:3}} key={grado.id}>
                  <Card sx={{
                    height: '100%', borderRadius: 2,
                    border: `2px solid ${alpha(nivelColor, 0.25)}`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-6px) scale(1.02)',
                      boxShadow: `0 12px 24px ${alpha(nivelColor, 0.25)}`,
                      borderColor: nivelColor,
                    }
                  }}>
                    <CardContent sx={{ p: 2.5 }}>
                      {/* Header del grado */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight="700" sx={{ mb: 0.5 }}>{grado.nombre}</Typography>
                          {grado.descripcion && (
                            <Typography variant="caption" color="text.secondary">{grado.descripcion}</Typography>
                          )}
                          {grado.codigo && (
                            <Chip label={grado.codigo} size="small" variant="outlined"
                              sx={{ mt: 0.5, borderColor: alpha(nivelColor, 0.4), color: nivelColor, fontWeight: 600, fontSize: '0.65rem', height: 20 }} />
                          )}
                        </Box>
                        <Avatar sx={{
                          width: 38, height: 38, borderRadius: 2,
                          background: `linear-gradient(135deg, ${nivelColor}, ${alpha(nivelColor, 0.7)})`,
                          color: '#fff', fontSize: '0.9rem', fontWeight: 'bold',
                          boxShadow: `0 3px 8px ${alpha(nivelColor, 0.4)}`,
                        }}>
                          {grado.orden || gradoIndex + 1}
                        </Avatar>
                      </Box>

                      <Divider sx={{ my: 1.5, borderColor: alpha(nivelColor, 0.15) }} />

                      {/* Solo dato real: total_paralelos */}
                      <Box sx={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        p: 1.5, borderRadius: 2, bgcolor: alpha(nivelColor, 0.07),
                      }}>
                        <Stack direction="row" alignItems="center" spacing={0.8}>
                          <ViewModuleIcon sx={{ fontSize: 18, color: nivelColor }} />
                          <Typography variant="body2" color="text.secondary" fontWeight={600}>
                            Paralelos
                          </Typography>
                        </Stack>
                        <Chip
                          label={grado.total_paralelos ?? 0}
                          size="small"
                          sx={{ bgcolor: alpha(nivelColor, 0.15), color: nivelColor, fontWeight: 'bold', minWidth: 36 }}
                        />
                      </Box>

                      <Divider sx={{ my: 1.5, borderColor: alpha(nivelColor, 0.1) }} />

                      {/* Acciones */}
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Editar grado">
                          <IconButton size="small" onClick={() => onEditGrado(nivel.id, grado)}
                            sx={{
                              bgcolor: alpha(primary, 0.1), color: primary, transition: 'all 0.3s ease',
                              '&:hover': { background: gradient, color: textOnPrimary, transform: 'rotate(15deg) scale(1.2)' },
                            }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar grado">
                          <IconButton size="small" onClick={() => onDeleteGrado(grado.id)}
                            sx={{
                              bgcolor: alpha(theme.palette.error.main, 0.1), transition: 'all 0.3s ease',
                              '&:hover': { bgcolor: theme.palette.error.main, color: 'white', transform: 'scale(1.2)' },
                            }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Collapse>
    </Card>
  );
};