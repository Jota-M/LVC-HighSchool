'use client';
import React, { useState } from 'react';
import {
  Box, Typography, Button, Fade, Snackbar, Alert, alpha, useTheme,
  Grid, Card, CardContent, Avatar, Chip, Stack, Collapse, Divider,
  IconButton, Tooltip, Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { useParalelos } from '../../../hooks/useParalelos';
import { useNiveles } from '../../../hooks/useNiveles';
import { ParalelosStats } from '../../../components/paralelos/ParaleloStats';
import { ParaleloCard } from '../../../components/paralelos/ParaleloCard';
import { ParaleloFormDialog } from '../../../components/paralelos/ParaleloFormDialog';
import { Paralelo, ParaleloFormData } from '../../../services/paralelos';

// ─── Paleta dinámica ──────────────────────────────────────────────────────────
function usePalette() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primary       = isDark ? '#facc15' : '#0288d1';
  const secondary     = isDark ? '#f59e0b' : '#01579b';
  const gradient      = `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
  const textOnPrimary = isDark ? '#000' : '#fff';
  return { isDark, primary, secondary, gradient, textOnPrimary };
}

const Paralelos: React.FC = () => {
  const { primary, secondary, gradient, textOnPrimary } = usePalette();
  const anioActual = new Date().getFullYear();

  const [selectedNivel, setSelectedNivel] = useState<number | null>(null);
  const [expandedGrado, setExpandedGrado] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingParalelo, setEditingParalelo] = useState<Paralelo | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false, message: '', severity: 'success' as 'success' | 'error' | 'info'
  });

  const { niveles, grados } = useNiveles({ incluirGrados: true });
  const { paralelos, turnos, loading, error, crearParalelo, actualizarParalelo, eliminarParalelo, estadisticas } =
    useParalelos({ anio: anioActual });

  const handleOpenDialog = (paralelo: Paralelo | null = null) => {
    setEditingParalelo(paralelo);
    setOpenDialog(true);
  };

  const handleSave = async (data: ParaleloFormData) => {
    try {
      if (editingParalelo) { await actualizarParalelo(editingParalelo.id, data); showSnackbar('✨ Paralelo actualizado', 'success'); }
      else { await crearParalelo(data); showSnackbar('🎉 Paralelo creado', 'success'); }
    } catch (err: any) { showSnackbar(`❌ ${err.response?.data?.message || 'Error'}`, 'error'); throw err; }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este paralelo?')) return;
    try { await eliminarParalelo(id); showSnackbar('🗑️ Paralelo eliminado', 'info'); }
    catch (err: any) { showSnackbar(`❌ ${err.response?.data?.message || 'Error'}`, 'error'); }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') =>
    setSnackbar({ open: true, message, severity });

  const gradosConParalelos = grados.map(grado => ({
    ...grado,
    paralelos: paralelos.filter(p => p.grado_id === grado.id),
    nivel: niveles.find(n => n.id === grado.nivel_academico_id)
  })).filter(g => !selectedNivel || g.nivel_academico_id === selectedNivel);

  return (
    <Box sx={{ p: 3 }}>
      <Fade in timeout={600}>
        <Box sx={{ mb: 4 }}>
          {/* Header */}
          <Box sx={{
            display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' },
            flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, md: 0 }, mb: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <PeopleAltIcon sx={{
                color: primary, fontSize: { xs: 22, md: 38 },
                animation: 'lvBounce 1.5s infinite',
                '@keyframes lvBounce': {
                  '0%, 100%': { transform: 'translateY(0)' },
                  '50%': { transform: 'translateY(-5px)' }
                }
              }} />
              <Box>
                <Typography variant="h1" sx={{
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }, fontWeight: 800,
                  background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  Paralelos
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Organiza las secciones de cada grado
                </Typography>
              </Box>
            </Box>

            <Button variant="contained" size="large" startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                borderRadius: { xs: '8px', md: '12px' }, px: { xs: 2, md: 4 }, py: { xs: 0.8, md: 1.5 },
                fontSize: { xs: '0.75rem', md: '1rem' }, fontWeight: 700, textTransform: 'none',
                background: gradient, color: textOnPrimary,
                '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${alpha(primary, 0.4)}`, filter: 'brightness(1.08)' },
                transition: 'all .25s'
              }}>
              Crear Paralelo
            </Button>
          </Box>

          {/* Stats */}
          <ParalelosStats {...estadisticas} />

          {/* Filtros */}
          <Card sx={{
            mt: 3, borderRadius: 3,
            border: `1px solid ${alpha(primary, 0.2)}`,
            background: `linear-gradient(135deg, ${alpha(primary, 0.04)}, transparent)`,
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <FilterListIcon sx={{ color: primary }} />
                <Typography variant="body1" fontWeight="600">Filtrar por Nivel:</Typography>
                <Chip
                  label="Todos"
                  onClick={() => setSelectedNivel(null)}
                  sx={{
                    fontWeight: 'bold',
                    background: !selectedNivel ? gradient : undefined,
                    color: !selectedNivel ? textOnPrimary : undefined,
                    border: !selectedNivel ? 'none' : `1px solid ${alpha(primary, 0.3)}`,
                  }}
                />
                {niveles.map(nivel => (
                  <Chip
                    key={nivel.id}
                    label={`${nivel.icono || ''} ${nivel.nombre}`}
                    onClick={() => setSelectedNivel(nivel.id)}
                    sx={{
                      bgcolor: selectedNivel === nivel.id ? nivel.color : alpha(nivel.color || primary, 0.1),
                      color: selectedNivel === nivel.id ? 'white' : nivel.color,
                      fontWeight: 'bold', border: `2px solid ${nivel.color}`,
                      '&:hover': { bgcolor: nivel.color, color: 'white' }
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Fade>

      {/* Grados */}
      <Grid container spacing={3}>
        {gradosConParalelos.map((grado, idx) => {
          const isExpanded = expandedGrado === grado.id;
          const nivel = grado.nivel!;

          return (
            <Grid size={{xs:12}} key={grado.id}>
              <Card sx={{
                borderRadius: 3, transition: 'all .2s',
                border: isExpanded ? `2px solid ${primary}` : `1px solid ${alpha(primary, 0.15)}`,
                '&:hover': { boxShadow: `0 12px 32px ${alpha(primary, 0.18)}` }
              }}>
                <Box onClick={() => setExpandedGrado(isExpanded ? null : grado.id)} sx={{ p: { xs: 2, md: 3 }, cursor: 'pointer' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: { xs: 2, sm: 0 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2 }, flex: 1 }}>
                      <Avatar sx={{
                        width: { xs: 40, md: 52 }, height: { xs: 40, md: 52 },
                        bgcolor: nivel.color, fontSize: { xs: '1.1rem', md: '1.6rem' }, borderRadius: 3,
                      }}>
                        {nivel.icono}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 1 }} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                          <Typography variant="h5" fontWeight="700" sx={{ fontSize: { xs: '1.05rem', md: '1.35rem' } }}>
                            {grado.nombre}
                          </Typography>
                          <Chip label={nivel.nombre} size="small"
                            sx={{ bgcolor: alpha(nivel.color || primary, 0.15), color: nivel.color, fontWeight: 700, fontSize: '0.68rem', height: 21 }} />
                        </Stack>
                        <Chip label={`${grado.paralelos.length} paralelos`} size="small" variant="outlined"
                          sx={{ mt: 0.5, fontSize: '0.68rem', height: 21, borderColor: alpha(primary, 0.3), color: primary }} />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: { xs: 0.5, md: 1 }, flexShrink: 0 }}>
                      <Tooltip title="Agregar paralelo">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenDialog(); }}
                          sx={{ width: { xs: 34, md: 38 }, height: { xs: 34, md: 38 }, background: gradient, color: textOnPrimary, '&:hover': { filter: 'brightness(1.1)' } }}>
                          <AddIcon sx={{ fontSize: { xs: 17, md: 20 } }} />
                        </IconButton>
                      </Tooltip>
                      <IconButton size="small" sx={{ width: { xs: 34, md: 38 }, height: { xs: 34, md: 38 }, color: primary }}>
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                  </Box>
                </Box>

                <Collapse in={isExpanded}>
                  <Divider sx={{ borderColor: alpha(primary, 0.15) }} />
                  <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: alpha(primary, 0.02) }}>
                    {grado.paralelos.length === 0 ? (
                      <Paper sx={{ p: { xs: 3, md: 4 }, textAlign: 'center', bgcolor: alpha(primary, 0.04), border: `1px dashed ${alpha(primary, 0.35)}`, borderRadius: 3 }}>
                        <WarningAmberIcon sx={{ fontSize: { xs: 36, md: 44 }, color: primary, mb: 1.5 }} />
                        <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', md: '1.15rem' } }}>
                          No hay paralelos configurados
                        </Typography>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} size="small"
                          sx={{ borderRadius: 2.5, px: 3, fontWeight: 'bold', background: gradient, color: textOnPrimary, '&:hover': { filter: 'brightness(1.1)' } }}>
                          Agregar Primer Paralelo
                        </Button>
                      </Paper>
                    ) : (
                      <Grid container spacing={{ xs: 2, md: 3 }}>
                        {grado.paralelos.map((paralelo, pIdx) => (
                          <Grid size={{xs:12, sm:6, md:4}} key={paralelo.id}>
                            <ParaleloCard
                              paralelo={paralelo}
                              colorNivel={nivel.color || primary}
                              onEdit={handleOpenDialog}
                              onDelete={handleDelete}
                              index={pIdx}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                </Collapse>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <ParaleloFormDialog
        open={openDialog} onClose={() => setOpenDialog(false)}
        onSave={handleSave} editingParalelo={editingParalelo}
        loading={loading} grados={grados} turnos={turnos} anioActual={anioActual}
      />

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Paralelos;