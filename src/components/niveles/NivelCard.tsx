import React, { useState } from 'react';
import {
  Card,
  Box,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Badge,
  Collapse,
  Divider,
  Grid,
  Tooltip,
  Stack,
  LinearProgress,
  alpha,
  useTheme,
  Paper,
  Button,
  CardContent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import GroupsIcon from '@mui/icons-material/Groups';
import GradeIcon from '@mui/icons-material/Grade';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { NivelAcademico, Grado } from '../../services/niveles';

interface NivelCardProps {
  nivel: NivelAcademico;
  onEditNivel: (nivel: NivelAcademico) => void;
  onDeleteNivel: (id: number) => void;
  onAddGrado: (nivelId: number) => void;
  onEditGrado: (nivelId: number, grado: Grado) => void;
  onDeleteGrado: (gradoId: number) => void;
}

export const NivelCard: React.FC<NivelCardProps> = ({
  nivel,
  onEditNivel,
  onDeleteNivel,
  onAddGrado,
  onEditGrado,
  onDeleteGrado
}) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const gradosCount = nivel.grados?.length || 0;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card sx={{
      borderRadius: 3,
      overflow: 'hidden',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: isExpanded
        ? `0 16px 48px ${alpha(nivel.color || theme.palette.primary.main, 0.25)}`
        : `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
      border: isExpanded
        ? `2px solid ${nivel.color}`
        : `1px solid ${theme.palette.divider}`,
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 12px 32px ${alpha(nivel.color || theme.palette.primary.main, 0.2)}`,
      }
    }}>
      {/* Header del Nivel */}
      <Box
        onClick={toggleExpand}
        sx={{
          p: 3,
          cursor: 'pointer',
          background: isExpanded
            ? `linear-gradient(135deg, ${alpha(nivel.color || theme.palette.primary.main, 0.15)} 0%, ${alpha(nivel.color || theme.palette.primary.main, 0.05)} 100%)`
            : 'transparent',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: `linear-gradient(135deg, ${alpha(nivel.color || theme.palette.primary.main, 0.1)} 0%, ${alpha(nivel.color || theme.palette.primary.main, 0.03)} 100%)`,
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Avatar sx={{
              width: 64,
              height: 64,
              bgcolor: nivel.color,
              fontSize: '2rem',
              boxShadow: `0 8px 16px ${alpha(nivel.color || theme.palette.primary.main, 0.4)}`,
              transition: 'all 0.3s ease',
              transform: isExpanded ? 'rotate(360deg) scale(1.1)' : 'none'
            }}>
              {nivel.icono || '📚'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="h5" fontWeight="700">
                  {nivel.nombre}
                </Typography>
                <Badge
                  badgeContent={gradosCount}
                  color="primary"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      minWidth: 24,
                      height: 24
                    }
                  }}
                >
                  <Chip
                    label="Grados"
                    size="small"
                    sx={{ bgcolor: alpha(nivel.color || theme.palette.primary.main, 0.2) }}
                  />
                </Badge>
              </Box>
              {nivel.descripcion && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {nivel.descripcion}
                </Typography>
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
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onAddGrado(nivel.id);
                }}
                sx={{
                  bgcolor: alpha(nivel.color || theme.palette.primary.main, 0.1),
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: nivel.color,
                    color: 'white',
                    transform: 'rotate(90deg) scale(1.2)',
                  }
                }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar nivel">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onEditNivel(nivel);
                }}
                sx={{
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: theme.palette.warning.main,
                    color: 'white',
                    transform: 'rotate(15deg) scale(1.2)',
                  }
                }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar nivel">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNivel(nivel.id);
                }}
                sx={{
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: theme.palette.error.main,
                    color: 'white',
                    transform: 'scale(1.2)',
                  }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            <IconButton
              sx={{
                transition: 'all 0.3s ease',
                transform: isExpanded ? 'rotate(180deg)' : 'none'
              }}
            >
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Grados Colapsables */}
      <Collapse in={isExpanded} timeout={500}>
        <Divider />
        <Box sx={{ p: 3, bgcolor: alpha(nivel.color || theme.palette.primary.main, 0.02) }}>
          {!nivel.grados || nivel.grados.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: 'center',
                bgcolor: alpha(theme.palette.warning.main, 0.05),
                border: `2px dashed ${alpha(theme.palette.warning.main, 0.3)}`,
                borderRadius: 2
              }}
            >
              <WarningAmberIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No hay grados registrados
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Comienza agregando grados a este nivel académico
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => onAddGrado(nivel.id)}
                sx={{
                  bgcolor: nivel.color,
                  '&:hover': { bgcolor: nivel.color, filter: 'brightness(0.9)' }
                }}
              >
                Agregar Primer Grado
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {nivel.grados.map((grado, gradoIndex) => (
                <Grid size={{xs:12, sm:6, lg:3}}  key={grado.id}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 2,
                      border: `2px solid ${alpha(nivel.color || theme.palette.primary.main, 0.3)}`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.03)',
                        boxShadow: `0 12px 24px ${alpha(nivel.color || theme.palette.primary.main, 0.3)}`,
                        borderColor: nivel.color,
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight="700" sx={{ mb: 0.5 }}>
                            {grado.nombre}
                          </Typography>
                          {grado.descripcion && (
                            <Typography variant="caption" color="text.secondary">
                              {grado.descripcion}
                            </Typography>
                          )}
                        </Box>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: alpha(nivel.color || theme.palette.primary.main, 0.2),
                            color: nivel.color,
                            fontSize: '1rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {grado.orden || gradoIndex + 1}
                        </Avatar>
                      </Box>

                      <Divider sx={{ my: 1.5 }} />

                      <Stack spacing={1.5}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <GroupsIcon sx={{ fontSize: 18 }} />
                            Estudiantes
                          </Typography>
                          <Chip
                            label={Math.floor(Math.random() * 40) + 20}
                            size="small"
                            sx={{
                              bgcolor: alpha(nivel.color || theme.palette.primary.main, 0.15),
                              color: nivel.color,
                              fontWeight: 'bold'
                            }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <GradeIcon sx={{ fontSize: 18 }} />
                            Materias
                          </Typography>
                          <Chip
                            label={Math.floor(Math.random() * 10) + 5}
                            size="small"
                            sx={{
                              bgcolor: alpha(nivel.color || theme.palette.primary.main, 0.15),
                              color: nivel.color,
                              fontWeight: 'bold'
                            }}
                          />
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                            Capacidad
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={Math.random() * 100}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: alpha(nivel.color || theme.palette.primary.main, 0.1),
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                bgcolor: nivel.color
                              }
                            }}
                          />
                        </Box>
                      </Stack>

                      <Divider sx={{ my: 1.5 }} />

                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Editar grado">
                          <IconButton
                            size="small"
                            onClick={() => onEditGrado(nivel.id, grado)}
                            sx={{
                              bgcolor: alpha(theme.palette.info.main, 0.1),
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                bgcolor: theme.palette.info.main,
                                color: 'white',
                                transform: 'rotate(15deg) scale(1.2)',
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar grado">
                          <IconButton
                            size="small"
                            onClick={() => onDeleteGrado(grado.id)}
                            sx={{
                              bgcolor: alpha(theme.palette.error.main, 0.1),
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                bgcolor: theme.palette.error.main,
                                color: 'white',
                                transform: 'scale(1.2)',
                              }
                            }}
                          >
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