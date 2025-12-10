'use client';
import React, { useState } from 'react';
import {
  Box, Typography, Button, Fade, Snackbar, Alert, alpha, useTheme,
  Grid, Card, CardContent, Avatar, Chip, Stack, Collapse, Divider,
  IconButton, Tooltip, Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
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

const Paralelos: React.FC = () => {
  const theme = useTheme();
  const anioActual = new Date().getFullYear();

  const [selectedNivel, setSelectedNivel] = useState<number | null>(null);
  const [expandedGrado, setExpandedGrado] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingParalelo, setEditingParalelo] = useState<Paralelo | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info'
  });

  const { niveles, grados } = useNiveles({ incluirGrados: true });
  
  const {
    paralelos,
    turnos,
    loading,
    error,
    crearParalelo,
    actualizarParalelo,
    eliminarParalelo,
    estadisticas
  } = useParalelos({ anio: anioActual });

  const handleOpenDialog = (paralelo: Paralelo | null = null) => {
    setEditingParalelo(paralelo);
    setOpenDialog(true);
  };

  const handleSave = async (data: ParaleloFormData) => {
    try {
      if (editingParalelo) {
        await actualizarParalelo(editingParalelo.id, data);
        showSnackbar('✨ Paralelo actualizado', 'success');
      } else {
        await crearParalelo(data);
        showSnackbar('🎉 Paralelo creado', 'success');
      }
    } catch (err: any) {
      showSnackbar(`❌ ${err.response?.data?.message || 'Error'}`, 'error');
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este paralelo?')) return;
    try {
      await eliminarParalelo(id);
      showSnackbar('🗑️ Paralelo eliminado', 'info');
    } catch (err: any) {
      showSnackbar(`❌ ${err.response?.data?.message || 'Error'}`, 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Organizar datos
  const gradosConParalelos = grados.map(grado => ({
    ...grado,
    paralelos: paralelos.filter(p => p.grado_id === grado.id),
    nivel: niveles.find(n => n.id === grado.nivel_academico_id)
  })).filter(g => !selectedNivel || g.nivel_academico_id === selectedNivel);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Fade in timeout={600}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{
                width: 64, height: 64, borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`
              }}>
                <PeopleAltIcon sx={{ fontSize: 36, color: 'white' }} />
              </Avatar>
              <Box>
                <Typography variant="h3" fontWeight="800" sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>
                  Paralelos
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  <AutoAwesomeIcon sx={{ fontSize: 18 }} /> Organiza las secciones de cada grado
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained" size="large" startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                borderRadius: 3, px: 4, py: 1.5, fontWeight: 'bold',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                '&:hover': { transform: 'translateY(-4px)' }
              }}
            >
              Crear Paralelo
            </Button>
          </Box>

          {/* Estadísticas */}
          <ParalelosStats {...estadisticas} />

          {/* Filtros */}
          <Card sx={{ mt: 3, borderRadius: 3, border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <FilterListIcon color="primary" />
                <Typography variant="body1" fontWeight="600">Filtrar por Nivel:</Typography>
                <Chip label="Todos" onClick={() => setSelectedNivel(null)} color={!selectedNivel ? 'primary' : 'default'} sx={{ fontWeight: 'bold' }} />
                {niveles.map(nivel => (
                  <Chip
                    key={nivel.id} label={`${nivel.icono || ''} ${nivel.nombre}`}
                    onClick={() => setSelectedNivel(nivel.id)}
                    sx={{
                      bgcolor: selectedNivel === nivel.id ? nivel.color : alpha(nivel.color || theme.palette.primary.main, 0.1),
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

      {/* Grados con Paralelos */}
      <Grid container spacing={3}>
      {gradosConParalelos.map((grado, idx) => {
        const isExpanded = expandedGrado === grado.id;
        const nivel = grado.nivel!;

        return (
          <Grid size={{xs:12}} key={grado.id}>
            <Card sx={{
              borderRadius: 3,
              border: isExpanded ? `2px solid ${nivel.color}` : `1px solid ${theme.palette.divider}`,
              '&:hover': { boxShadow: `0 12px 32px ${alpha(nivel.color || theme.palette.primary.main, 0.2)}` }
            }}>
              <Box 
                onClick={() => setExpandedGrado(isExpanded ? null : grado.id)} 
                sx={{ 
                  p: { xs: 2, md: 3 }, 
                  cursor: 'pointer' 
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  gap: { xs: 2, sm: 0 }
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: { xs: 1.5, md: 2 },
                    flex: 1
                  }}>
                    <Avatar sx={{ 
                      width: { xs: 40, md: 56 }, 
                      height: { xs: 40, md: 56 }, 
                      bgcolor: nivel.color, 
                      fontSize: { xs: '1.2rem', md: '1.8rem' }
                    }}>
                      {nivel.icono}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack 
                        direction={{ xs: 'column', sm: 'row' }} 
                        spacing={{ xs: 0.5, sm: 1 }} 
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                      >
                        <Typography 
                          variant="h5" 
                          fontWeight="700"
                          sx={{ 
                            fontSize: { xs: '1.1rem', md: '1.5rem' },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: { xs: 'normal', sm: 'nowrap' }
                          }}
                        >
                          {grado.nombre}
                        </Typography>
                        <Chip 
                          label={nivel.nombre} 
                          size="small" 
                          sx={{ 
                            bgcolor: alpha(nivel.color || theme.palette.primary.main, 0.2),
                            fontSize: { xs: '0.65rem', md: '0.75rem' },
                            height: { xs: 20, md: 24 }
                          }} 
                        />
                      </Stack>
                      <Chip 
                        label={`${grado.paralelos.length} paralelos`} 
                        size="small" 
                        variant="outlined" 
                        sx={{ 
                          mt: 1,
                          fontSize: { xs: '0.65rem', md: '0.75rem' },
                          height: { xs: 20, md: 24 }
                        }} 
                      />
                    </Box>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: { xs: 0.5, md: 1 },
                    flexShrink: 0
                  }}>
                    <Tooltip title="Agregar paralelo">
                      <IconButton 
                        onClick={(e) => { e.stopPropagation(); handleOpenDialog(); }}
                        size="small"
                        sx={{ 
                          width: { xs: 36, md: 40 },
                          height: { xs: 36, md: 40 }
                        }}
                      >
                        <AddIcon sx={{ fontSize: { xs: 18, md: 24 } }} />
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      size="small"
                      sx={{ 
                        width: { xs: 36, md: 40 },
                        height: { xs: 36, md: 40 }
                      }}
                    >
                      {isExpanded ? 
                        <ExpandLessIcon sx={{ fontSize: { xs: 18, md: 24 } }} /> : 
                        <ExpandMoreIcon sx={{ fontSize: { xs: 18, md: 24 } }} />
                      }
                    </IconButton>
                  </Box>
                </Box>
              </Box>

              <Collapse in={isExpanded}>
                <Divider />
                <Box sx={{ 
                  p: { xs: 2, md: 3 }, 
                  bgcolor: alpha(nivel.color || theme.palette.primary.main, 0.02) 
                }}>
                  {grado.paralelos.length === 0 ? (
                    <Paper sx={{ 
                      p: { xs: 3, md: 4 }, 
                      textAlign: 'center', 
                      bgcolor: alpha(theme.palette.warning.main, 0.05) 
                    }}>
                      <WarningAmberIcon sx={{ 
                        fontSize: { xs: 36, md: 48 }, 
                        color: 'warning.main', 
                        mb: 2 
                      }} />
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
                      >
                        No hay paralelos
                      </Typography>
                      <Button 
                        variant="contained" 
                        startIcon={<AddIcon />} 
                        onClick={() => handleOpenDialog()}
                        size="small"
                        sx={{
                          fontSize: { xs: '0.8rem', md: '0.875rem' },
                          px: { xs: 2, md: 3 },
                          py: { xs: 0.75, md: 1 }
                        }}
                      >
                        Agregar Primer Paralelo
                      </Button>
                    </Paper>
                  ) : (
                    <Grid container spacing={{ xs: 2, md: 3 }}>
                      {grado.paralelos.map((paralelo, pIdx) => (
                        <Grid size={{xs:12, sm:6, md:4}} key={paralelo.id}>
                          <ParaleloCard
                            paralelo={paralelo}
                            colorNivel={nivel.color || theme.palette.primary.main}
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

      {/* Dialogs */}
      <ParaleloFormDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleSave}
        editingParalelo={editingParalelo}
        loading={loading}
        grados={grados}
        turnos={turnos}
        anioActual={anioActual}
      />

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Paralelos;